from brownie import network, accounts
import brownie
import web3
from web3 import Web3, HTTPProvider
# import ipfshttpclient
from ipfsApi.client import Client
from web3.exceptions import NoABIEventsFound
from brownie.exceptions import ContractNotFound
from accounting import models
from accounting.constants import PAYMENT_METHODS
from django.conf import settings
import os
import django
import uuid
import json
import datetime
import secrets
from django.db.models import Sum
from collections import defaultdict
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
# django.setup()

from confluent_kafka import Producer
import socket

conf = {'bootstrap.servers': 'localhost:9092',
        'client.id': socket.gethostname()}

producer = Producer(conf)


class BrownieBlockchainProvider:
    contracts = None
    accounts = None
    # address_path = "/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/backend/accounting/blockchain_service/contract_addresses.txt"
    address_path = "./blockchain_service/contract_addresses.txt"
    # charity_address_path = "/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/backend/accounting/blockchain_service/charity_addresses.txt"
    charity_address_path = "./blockchain_service/charity_addresses.txt"
    # Tracks the block up to which we have received events (reword)
    block_counter = 0

    def __init__(self):
        # project_path = '/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/final-blockchain/Ethereum/brownie'
        # project_path = '../../blockchain/brownie'
        # project_path = '/workspaces/codespaces-blank/blockchain/brownie'
        project_path = '/home/ubuntu/codespaces-final/blockchain/brownie'
        self.contracts = brownie.project.load(
            project_path, raise_if_loaded=False)
        self.load_accounts('/home/ubuntu/codespaces-final/blockchain/quorum-test-network/config/besu/QBFTgenesis.json')
        # self.contracts = brownie.project.load(
        #     '/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/final-blockchain/Ethereum/brownie')
        self.contracts.load_config()

        # Instead of spinning up new network each time this runs,
        # # Connect to running network
        if network.show_active() != 'besulocal':
            network.connect('besulocal')

        # Start IPFS client
        self.ipfs_client = Client('127.0.0.1', 5001)
        # self._client = ipfshttpclient.connect(session=True)

        # network.add("ganache-local", "http://localhost:8545")
        # network.connect("development")

    # def close(self):
    #     # Cleanup code - close connection to IPFS
    #     self._client.close()


    def call_contract(self, contract_name, function_name, *args, **kwargs):
        """
            Method to abstract boilerplate code to access smart contracts

            TODO: relies on key in contract_addresses.txt file being exactly the
            smart contract class name - MAKE SURE THIS IS THE CASE
        """
        contract_address = self.get_address(contract_name) or kwargs['deployment_address']
        contract =  self.contracts[contract_name].at(contract_address)
        contract_function = getattr(contract, function_name)
        result = contract_function(*args, {'from': kwargs['account_address'] or brownie.accounts[0]})
        return result


    def load_accounts(self, genesis_file_path):
        """Load starter accounts from genesis file of Besu blockchain"""

        with open(genesis_file_path) as f:
            file = json.load(f)
            chain_accounts = file['alloc']
            account_addresses = []
            for account in chain_accounts:
                if 'privateKey' in chain_accounts[account]:
                    # acc = brownie.accounts.add(chain_accounts[account]["privateKey"])
                    
                    # account_addresses.append(acc.address)
                    account_addresses.append(chain_accounts[account]['privateKey'])
                    
                    # print('Found account: ', account)
                self.accounts = account_addresses
            print('Available accounts: ', account_addresses)
            # print(brownie.accounts[0], brownie.accounts[1], brownie.accounts[2])


    def create_account(self, keystore_path=None):
        """Create a new account on the blockchain and store its public and private keys securely."""

        new_account = brownie.accounts.add()
        print('Available brownie accounts: ')
        print([acc for acc in brownie.accounts])
        # Add some Ether from the pre-populated Besu accounts to enable transactions
        # brownie.accounts[random.randint(0, 9)].transfer(new_account, "10 ether")
        brownie.accounts.at(secrets.choice(self.accounts)).transfer(new_account, "10 ether")
        if keystore_path:
            new_account.save(keystore_path)
        return new_account.address


    def create_charity(self, instance):
        """Deploy new charity smart contract to the blockchain"""

        # If charity contract already exists on the blockchain, 
        # we don't need to create it again
        charity_address = self.get_address(str(instance.uuid), self.charity_address_path)
        if charity_address:
            return charity_address

        try:
            charity_owner = brownie.accounts.at(instance.blockchain_id)
        # 
        except (brownie.exceptions.UnknownAccount, ValueError):
            # charity_owner = brownie.accounts[0]
            instance.blockchain_id = self.create_account()
            instance.save()
            charity_owner = instance.blockchain_id

        # Fetch all dependencies of Charity, and store them in brownie's ContractContainer
        # objects so that Charity can deploy successfully
        contract_addresses = self.get_all_addresses()
        for contract in contract_addresses:
            # Retrieves contract name, uses to access the corresponding ContractContainer object,
            # calls at() on ContractContainer to assign to it the Contract object deployed at the address
            # stored in the contract_addresses dict
            self.contracts[contract].at(contract_addresses[contract])

        # Charity constructor arguments (name, regNumber, charityType, owners)
        charity = self.contracts.Charity.deploy(
            instance.name,
            Web3.keccak(text=str(instance.charity_commission_number)),
            0,
            [],
            self.contracts.Transactions.at(contract_addresses['Transactions']),
            {'from': charity_owner})

        with open(self.charity_address_path, "a") as f:
            f.write(f"{instance.uuid}: {charity}\n")

        return charity


    def get_or_create_charity_contract(self, charity):
        """
            Return a deployed charity contract object, or deploy one if
            it doesn't exist.
        """
        charity_address = self.get_address(str(charity.uuid), self.charity_address_path)
        try:
            # Check that there is actually a charity deployed at that address
            # on the blockchain
            charity_contract = self.contracts.Charity.at(charity_address)
            return charity_contract
        except (ValueError, TypeError, ContractNotFound):
            print('Charity contract being created')
            charity_address = self.create_charity(charity)
            return self.contracts.Charity.at(charity_address)


    def create_project(self, instance):
        project_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))

        project_name = instance.name
        # Convert project start date to an integer UNIX timestamp, discarding fractions of seconds
        project_start_date = datetime.datetime.combine(
            instance.start_date, datetime.time())
        project_start_date_timestamp = str(int(project_start_date.timestamp()))

        # project_address = self.get_address('PROJECT')
        project_address = self.get_address('Projects')

        success = self.contracts.Projects.at(project_address).setProject(
            project_uuid, project_name, project_start_date_timestamp, {'from': accounts[0]})
        return success


    def get_project(self, project_uuid):
        """Retrieve project details given UUID"""
        blockchain_uuid = Web3.keccak(text=str(project_uuid).replace('-', ''))
        contract_address = self.get_address('Projects')
        response = self.contracts.Projects.at(contract_address).projects(
            blockchain_uuid, {'from': brownie.accounts[0]})
        return response        


    def create_indicator(self, charity, indicator):
        """Create new indicator for project"""
        charity_uuid = str(charity.uuid)
        # Indicator data
        project_uuid = Web3.keccak(text=str(indicator.service.project.uuid).replace('-', ''))
        indicator_uuid = Web3.keccak(text=str(indicator.uuid).replace('-', ''))
        name = indicator.name
        # Convert the decimal values to 2 d.p. numberes by rounding
        # and multiplyinng by 100
        target_quantity = int(round(float(indicator.target_quantity or 0), 2) * 100)
        unit = str(indicator.unit.name)
        baseline = int(round(float(indicator.baseline or 0), 2) * 100)
        description = str(indicator.description)
        is_cumulative = indicator.is_cumulative

        # contract_address = self.get_address('Projects')
        charity_address = self.get_address(charity_uuid, self.charity_address_path)
        # result = self.contracts.Projects.at(
        #     contract_address).setIndicator(
        result = self.contracts.Charity.at(
            charity_address).setIndicator(
                project_uuid, 
                indicator_uuid, 
                name,
                target_quantity,
                unit, 
                baseline,
                description, 
                is_cumulative, 
                {'from': charity.blockchain_id or brownie.accounts[0]})
        return result


    # TODO: make these getters into a generic method
    def get_indicator(self, indicator_uuid):
        """Get indicator given its UUID"""
        blockchain_id = Web3.keccak(text=str(indicator_uuid).replace('-', ''))
        print('Generated indicator UUID:', blockchain_id)
        contract_address = self.get_address('Projects')
        result = self.contracts.Projects.at(
            contract_address).indicators(blockchain_id, {'from': brownie.accounts[0]})
        return result


    def indicator_exists(self, charity, indicator_uuid):
        """Returns whether indicator is stored in the blockchain"""
        blockchain_id = Web3.keccak(text=str(indicator_uuid).replace('-', ''))
        charity_address = self.get_address(str(charity.uuid), self.charity_address_path)
        # result = self.call_contract('Projects', 'indicatorExists', blockchain_id)
        result = self.call_contract('Charity', 'indicatorExists', blockchain_id, deployment_address=charity_address, account_address=charity.blockchain_id)
        return result


    def create_activity(self, charity, instance):
        """Create new activity for project"""
        charity_uuid = str(charity.uuid)
        charity_contract = self.get_or_create_charity_contract(charity)

        project_uuid = Web3.keccak(text=str(instance.indicator.service.project.uuid).replace('-', ''))
        activity_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))
        
        # Convert date and start time fields into an single integer timestamp
        time = instance.start_time or datetime.time.min
        date = int(datetime.datetime.combine(instance.date, time).timestamp())

        # title = BlockchainProvider.get_bytes32(instance.title)
        title = instance.title.encode('utf-8')
        # notes = BlockchainProvider.get_bytes32(instance.notes)
        notes = instance.notes.encode('utf-8') or b'\x00'
        indicator_uuid = Web3.keccak(text=str(instance.indicator.uuid).replace('-', ''))
        
        # Location data - cast to integers, as Solidity doesn't suppoort decimal values
        try:
            location = (
                # Name is optional, so we don't revert to an empty location
                # value if it is not present
                getattr(instance.location, 'name', '').encode('utf-8'),
                int(float(instance.location.latitude) * 1e6),
                int(float(instance.location.longitude) * 1e6),
                True
            )
        except (KeyError, AttributeError):
            # If lat or lon are not present, we do not have a valid location - 
            # so save an empty location instead (Solidity doesn't have optional values)
            location = ('', 0, 0, False)
        indicator_amount = instance.indicator_amount
        # TODO: dummy function that calculates hash of file name. Replace with function
        # that computes actual IPFS CID/retrieves it from Pinata/IPFS node
        # attachments = [Web3.keccak(text=str(file)) for file in instance.attachments.all()]

        # Convert IPFS CIDs into the 'bytes' Solidity type 
        attachments = [a.ipfs_hash.encode('utf-8') for a in instance.attachments.all()]

        # TODO URGENT: add 'charity' to indicator() methods as well
        # Before creating activity, create its related indicator if it doesn't already exist
        indicator_exists = self.indicator_exists(charity, instance.indicator.uuid)
        if not indicator_exists:
            self.create_indicator(charity, instance.indicator)

        # contract_address = self.get_address('Projects')
        # charity_address = self.get_address(charity_uuid, self.charity_address_path)
        # result = self.contracts.Projects.at(
            # contract_address).setActivity(
        
        # result = self.contracts.Charity.at(
        #     charity_address)
        
        
        result = charity_contract.setActivity(
                    project_uuid, 
                    activity_uuid, 
                    date, 
                    title, 
                    notes, 
                    indicator_uuid, 
                    location,
                    indicator_amount,
                    attachments,
                    {'from': charity.blockchain_id or brownie.accounts[0]})
        return result


    def get_activity(self, activity_uuid):
        blockchain_id = Web3.keccak(text=str(activity_uuid).replace('-', ''))
        result = self.call_contract('Projects', 'activities', blockchain_id)
        return result
    
    def get_project_activities(self, project_uuid):
        blockchain_id = blockchain_id = Web3.keccak(text=str(project_uuid).replace('-', ''))
        result = self.call_contract('Projects', 'getActivities', blockchain_id)
        return result

    def create_contact(self, instance, contact_address=None):
        charity_uuid = BlockchainProvider.convert_uuid(instance.parent_charity)
        contact_uuid = BlockchainProvider.convert_uuid(instance.uuid)
        # If new address for contact isn't supplied, generate a random one
        if contact_address is None:
            contact_address = BlockchainProvider.generate_eth_address()

        print('Contact address: ', contact_address)
        # contract_address = self.get_address('CONTACT')

        contract_address = self.get_address('Contacts')
        success = self.contracts.Contacts.at(contract_address).addContact(
            charity_uuid, contact_uuid, contact_address, {'from': brownie.accounts[0]})
        return success


    def get_contact(self, contact_uuid, charity_uuid):
        """
            Takes a UUID for a Contact record (generated by the backend) and retrieves
            the blockchain address for that contact, stored in the Contact smart
            contract.
        """
        charity_uuid = BlockchainProvider.convert_uuid(charity_uuid)
        blockchain_uuid = BlockchainProvider.convert_uuid(contact_uuid)
        print('Charity uuid: ', charity_uuid)
        print('Blockchain uuid: ', blockchain_uuid)
        # contract_address = self.get_address('CONTACT')
        contract_address = self.get_address('Contacts')
        supplier_address = self.contracts.Contacts.at(contract_address).getContact(
            charity_uuid, blockchain_uuid, {'from': brownie.accounts[0]})
        return supplier_address

        # self.contracts.Contacts.at(
        #     contact_address).addContact(instance.supplier, {'from': brownie.accounts[0]}))


    def create_expense(self, charity, instance):
        # # Cast charity ID to string, if it isn't already
        # if type(charity_uuid) == uuid.UUID:
        #     charity_uuid = str(charity_uuid)
        charity_uuid = str(charity.uuid)
        expense_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))
        try:
            supplier_uuid = Web3.keccak(
                text=str(instance.supplier.uuid).replace('-', ''))
        except AttributeError:
            supplier_uuid = b'\x00' * 32
        payment_type = instance.payment_type
        # TODO: replace with inference from HuggingFace model
        # expense_type = random.randint(0, 9)
        expense_type = secrets.choice(range(0, 9))
        expense_total = instance.transaction.filter(
            entries__direction=1).aggregate(total=Sum('entries__amount'))['total']
        # As Solidity cannot handle decimal types directly, we round to 2 digits
        # and multiply by 100 to store money as an integer
        expense_total_int = int(round(float(expense_total), 2) * 100)
        is_confirmed = False
        is_disputed = False
        is_expense = True

        # Transaction data
        transaction_uuid = BlockchainProvider.convert_uuid(
            instance.transaction.first().uuid)
        # Set to empty 32-byte array if no project UUID available
        if hasattr(instance.transaction.first().project, 'uuid'):
            tx_project_uuid = BlockchainProvider.convert_uuid(
                getattr(instance.transaction.first().project, 'uuid')
            )
        else:
            tx_project_uuid = b'\x00' * 32
        # tx_project_uuid = getattr(
        #     instance.transaction.first().project, 'uuid', None)
        tx_timestamp = BlockchainProvider.convert_timestamp(
            instance.transaction.first().timestamp)
        tx_is_confirmed = False
        tx_is_transaction = True
        transaction = [
            tx_project_uuid,
            tx_timestamp,
            tx_is_confirmed,
            tx_is_transaction
        ]

        # Transaction entries data - we have to re-arrange the data because the contract
        # takes 3 separate lists as arguments - 1 for accounts, 1 for amounts, and 1 for directions
        # to avoid having to deal with nested structs in the contract
        entries_accounts = []
        entries_amounts = []
        entries_narrations = []
        entries_directions = []
        entries = instance.transaction.first().entries.all()
        # TODO: this may not be robust (if loop skips a value for one array, all of them are
        # out of sync) - look up ways to guard against this
        for entry in entries:
            account = BlockchainProvider.convert_uuid(entry.account.uuid)
            amount = BlockchainProvider.convert_money(entry.amount.amount)
            narration = entry.narration
            # Convert the '-1' and '1' of backend to 'Debit' and 'Credit' enum values
            # in smart contract (0 and 1 respectively)
            direction = 0 if entry.direction == 1 else 1
            entries_accounts.append(account)
            entries_amounts.append(amount)
            entries_narrations.append(narration)
            entries_directions.append(direction)

        # contact_address = self.get_address('CONTACT')
        contact_address = self.get_address('Contacts')
        # if no supplier -> null address
        # if supplier but no address -> code below
        # if supplier and blockchain address -> set to 'supplier address'
        if instance.supplier:
            if instance.supplier.blockchain_id:
                supplier_address = instance.supplier.blockchain_id
            else:
                # TODO: dummy code to get an address - delete
                self.create_contact(instance.supplier)
                # self.contracts.Contacts.at(
                #     contact_address).addContact(instance.supplier, {'from': brownie.accounts[0]}))

                # Retrieve supplier address from the Contact smart contract
                supplier_address = self.get_contact(
                    instance.supplier.uuid, instance.supplier.parent_charity)
                # supplier_address = self.contracts.Contacts.at(contact_address).getContact(
                #     instance.supplier.uuid, instance.parent_charity)
        else:
            # If no supplier given, store the zero address ('0x0') instead
            supplier_address = BlockchainProvider.nulls['address']

        arg_dict = {
            '_expenseUUID': expense_uuid,
            # '_expense': [supplier_address, payment_type, expense_type, expense_total_int, is_confirmed, is_expense],
            '_expense': (supplier_address, payment_type, expense_type, expense_total_int, is_confirmed, is_disputed, is_expense),
            '_transactionUUID': transaction_uuid,
            # '_transactionData': transaction,
            '_transactionData': tuple(transaction),
            '_accounts': entries_accounts,
            '_amounts': entries_amounts,
            '_narrations': entries_narrations,
            '_directions': entries_directions
        }

        args = (
            expense_uuid,
            tuple(arg_dict['_expense']),
            arg_dict['_transactionUUID'],
            tuple(arg_dict['_transactionData']),
            arg_dict['_accounts'],
            arg_dict['_amounts'],
            arg_dict['_narrations'],
            arg_dict['_directions'],
        )
        print('Arguments to create_expense: ', args)

        # expense_address = self.get_address('SOURCE_DOCUMENT')
        try:
            # output = self.contracts.SourceDocuments.at(
            #     expense_address).setExpense(args, {'from': brownie.accounts[0]})
                # expense_address).setExpense2((args[0],), {'from': brownie.accounts[0]})

                # expense_address).setExpense2([expense_uuid], {'from': brownie.accounts[0]})

            # charity_address = self.get_address(str(instance.parent_charity), self.charity_address_path)
            charity_address = self.get_address(str(charity_uuid), self.charity_address_path)

            try:
                # Check that there is actually a charity deployed at that address
                # on the blockchain
                self.contracts.Charity.at(charity_address)
            except (ValueError, TypeError, ContractNotFound):
                charity_address = self.create_charity(charity)
            output = self.contracts.Charity.at(
                # charity_address).setExpense(args, {'from': brownie.accounts[0]})
                charity_address).setExpense(args, {'from': charity.blockchain_id})
            # events = [dict(i) for i in output.events]
            # for index, event in enumerate(events):
            #     events[index] = {key: str(value) for key, value in event}

            #  Cast event values to string and JSON serialise
            events = json.dumps(
                [{key: str(value) for key, value in dict(i).items()} for i in output.events]
            )

            # Publish any transaction events to Kafka event stream
            if output.events: # output.events is {} if no events emitted
                producer.produce(
                    'NewExpense', 
                    key=charity.blockchain_id, 
                    # value=json.dumps([dict(i) for i in output.events]), 
                    value=events,
                    callback=lambda err, msg: print('Event written to Kafka stream')
                )
                producer.poll(1)
            else:
                print('Events not emitted...')
            # # Old way: using non-Charity smart contracts
            # expense_address = self.get_address('SourceDocuments')
            # output = self.contracts.SourceDocuments.at(
            #     expense_address).setExpense(args, {'from': brownie.accounts[0]})
            
            return output
        except Exception as e:
            print('Exception has occurred')
            print(e)
            # trace = e.__traceback__
            # return trace
            return e


    def get_expense(self, expense_uuid):
        """
            Takes the blockchain ID of the expense transaction and returns expense data.
        """
        blockchain_id = Web3.keccak(text=str(expense_uuid).replace('-', ''))
        print('Generated expense UUID:', blockchain_id)
        contract_address = self.get_address('SourceDocuments')
        expense = self.contracts.SourceDocuments.at(
            contract_address).expenses(blockchain_id, {'from': brownie.accounts[0]})
        return expense

    def create_donation(self, charity, instance):
        """Testing whether we can pass a struct to a function"""
        # args = (123, (223, 'hello world'), [1,2, 3, 4, 5])

        charity_uuid = str(charity.uuid)

        charity_address = self.get_address(str(charity_uuid), self.charity_address_path)
        try:
            # Check that there is actually a charity deployed at that address
            # on the blockchain
            self.contracts.Charity.at(charity_address)
        except (ValueError, TypeError, ContractNotFound):
            charity_address = self.create_charity(charity)
            
        # if not charity_address or self.contracts.Charity:

        # Donation struct fields
        donation_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))
        donor_uuid = Web3.keccak(
            text=str(instance.donor.uuid).replace('-', ''))
        donation_ref = instance.reference
        # As Solidity cannot handle decimal types directly, we round to 2 digits
        # and multiply by 100 to store money as an integer
        total = int(round(float(instance.amount.amount), 2) * 100)
        payment_type = instance.payment_method

        is_confirmed = False
        is_donation = True


        # transaction = (
        #     BlockchainProvider.get_bytes32('proj123'),
        #     12345,
        #     False,
        #     True
        # )

        # donation = (
        #     # '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c',
        #     BlockchainProvider.generate_eth_address(),
        #     'X0134D',
        #     12345,
        #     'abc123',
        #     0,
        #     False
        # )

        # Transaction fields (TODO: abstract duplicated code)
        transaction_uuid = BlockchainProvider.convert_uuid(
            instance.transaction.first().uuid)
        # Set to empty 32-byte array if no project UUID available
        if hasattr(instance.transaction.first().project, 'uuid'):
            tx_project_uuid = BlockchainProvider.convert_uuid(getattr(
                instance.transaction.first().project, 'uuid'))
        else:
            tx_project_uuid = b'\x00' * 32
        # tx_project_uuid = getattr(
        #     instance.transaction.first().project, 'uuid', None)
        tx_timestamp = BlockchainProvider.convert_timestamp(
            instance.transaction.first().timestamp)
        tx_is_confirmed = False
        tx_is_transaction = True
        transaction = [
            tx_project_uuid,
            tx_timestamp,
            tx_is_confirmed,
            tx_is_transaction
        ]

        # Transaction entries data - we have to re-arrange the data because the contract
        # takes 3 separate lists as arguments - 1 for accounts, 1 for amounts, and 1 for directions
        # to avoid having to deal with nested structs in the contract
        entries_accounts = []
        entries_amounts = []
        entries_narrations = []
        entries_directions = []
        entries = instance.transaction.first().entries.all()
        # TODO: this may not be robust (if loop skips a value for one array, all of them are
        # out of sync) - look up ways to guard against this
        for entry in entries:
            account = BlockchainProvider.convert_uuid(entry.account.uuid)
            amount = BlockchainProvider.convert_money(entry.amount.amount)
            narration = entry.narration
            # Convert the '-1' and '1' of backend to 'Debit' and 'Credit' enum values
            # in smart contract (0 and 1 respectively)
            direction = 0 if entry.direction == 1 else 1
            entries_accounts.append(account)
            entries_amounts.append(amount)
            entries_narrations.append(narration)
            entries_directions.append(direction)
        
        # TODO: delete this line
        contact_address = self.get_address('Contacts')
        
        if not getattr(instance.donor, 'blockchain_id', None):
            if not instance.donor:
                donor_address = BlockchainProvider.nulls['address']
            else:
                self.create_contact(instance.donor)
                donor_address = self.get_contact(
                    instance.donor.uuid, instance.donor.parent_charity)
        else:
            donor_address = instance.donor.blockchain_id

        # arg_dict = {
        #     '_expenseUUID': donor_uuid,
        #     # '_expense': [supplier_address, payment_type, expense_type, expense_total_int, is_confirmed, is_expense],
        #     '_expense': (donor_address, payment_type, expense_type, expense_total_int, is_confirmed, is_expense),
        #     '_transactionUUID': transaction_uuid,
        #     # '_transactionData': transaction,
        #     '_transactionData': tuple(transaction),
        #     '_accounts': entries_accounts,
        #     '_amounts': entries_amounts,
        #     '_narrations': entries_narrations,
        #     '_directions': entries_directions
        # }

        args = (
            donation_uuid,
            (donor_address, donation_ref, total, payment_type, is_confirmed, is_donation),
            transaction_uuid,
            transaction,
            entries_accounts,
            entries_amounts,
            entries_narrations,
            entries_directions,
        )
        print('Arguments to create_donations: ', args)

        # donation_address = self.get_address('SourceDocuments')
        # charity_address = self.get_address(str(charity_uuid), self.charity_address_path)

        try:
            output = self.contracts.Charity.at(
                charity_address).setDonation(args, {'from': charity.blockchain_id})
            # output = self.contracts.SourceDocuments.at(
            #     donation_address).setDonation(args, {'from': brownie.accounts[0]})
            # output
            return output
        except Exception as e:
            print('Exception has occurred')
            print(e)
            trace = e.__traceback__
            return trace
        
        # donation_uuid = BlockchainProvider.get_bytes32('hello world')
        # donation_inputs = (
        #     donation_uuid,
        #     donation,
        #     BlockchainProvider.get_bytes32('Transact1'),
        #     transaction
        # )
        # contract_address = self.get_address('SourceDocuments')
        # try:
        #     response = self.contracts.SourceDocuments.at(
        #         contract_address).setDonation(donation_inputs, { 'from': brownie.accounts[0]})
            
        # # infos = self.contracts.SourceDocuments.at(
        # #         contract_address).infos(0)

        #     donation = self.contracts.SourceDocuments.at(
        #         contract_address).donations(donation_uuid, { 'from': brownie.accounts[0]})
            
        #     # return response
        #     return donation
        # except Exception as e:
        #     print(e)
        #     return e


    def get_donation(self, donation_uuid):
        blockchain_id = Web3.keccak(text=str(donation_uuid).replace('-', ''))
        print('Generated donation UUID:', blockchain_id)
        contract_address = self.get_address('SourceDocuments')
        donation = self.contracts.SourceDocuments.at(
            contract_address).donations(blockchain_id, {'from': brownie.accounts[0]})
        return donation


    def get_new_events(self):
        """Return all events from the current offset from all deployed smart contracts."""
        # # TODO: get all events from the block counter block to the latest block
        # # and return them
        # # TODO: code untested - test step by step
        latest_block = brownie.web3.eth.block_number
        # contract_names = self.contracts.keys()
        contract_addresses = self.get_all_addresses(self.charity_address_path)
        # event_dict = {name: [] for name in contracts.}
        event_dict = defaultdict(list)
        print('get_new_events is running')
        for name, address in contract_addresses.items():
            try:
                event_filter = brownie.event.filter(contract_address=address)
                event_dict[name] = event_filter

                # # TODO: re-enable this if event filters don't work
                # # events = self.contracts[contract][-1].events.all()
                # # Get events from the last offset, stored in self.block_counter
                # events = self.contracts['Charity'].at(address).events.get_sequence(
                #     from_block=self.block_counter)
                # # filtered_events = events.filter(from_block=self.block_counter)
                # event_dict[name] = events
                # # event_dict[contract] = filtered_events
            except (KeyError, AttributeError, NoABIEventsFound, ContractNotFound):
                continue

        # Update offset
        self.block_counter = latest_block
        # return event_dict
        return event_dict


    # def process_event(self, contract_name, event):
    def process_event(self, events):
        from accounting.models import Notification
        from django.contrib.auth.models import User

        events = json.loads(events.value())

        # TODO: untested code - test step by step
        # Create a Notification object using the event data
        # if contract_name == 'SourceDocuments':
            # print('hello world')

        # for expense in event['NewExpense']:
        for event in events:
            # TODO: test the sender/receiver lookup actually works
            try:
                # sender=models.Charity.objects.get(blockchain_id=expense['args']['sender'])
                # receiver=models.Charity.objects.get(blockchain_id=expense['args']['_to'])
                
                Notification.objects.create(
                    # sender=User.objects.order_by('?').first(),
                    # receiver=User.objects.order_by('?').first(),

                    # sender=sender,
                    # receiver=receiver,

                    sender=models.Charity.objects.get(blockchain_id=event['sender']),
                    receiver=models.Charity.objects.get(blockchain_id=event['_to']),

                    # sender=User.objects.get(
                    #     profile__blockchain_id=invoice['args']['sender']),
                    # receiver=User.objects.get(
                    #     profile__blockchain_id=invoice['args']['_to']),
                    notification_type=2,
                    message={
                        'type': 'newExpense',
                        # 'dueDate': expense['args']['dueDate'],
                        # 'amount': expense['args']['total'],
                        # 'timestamp': expense['args']['timestamp']
                        'paymentMethod': PAYMENT_METHODS[int(event['_paymentMethod'])],
                        # 'dueDate': event['dueDate'],
                        'amount': event['total'],
                        'timestamp': event['timestamp'],
                        'expenseUUID': event['expenseUUID'],
                        'from': event['sender'],
                        'to': event['_to']
                    }
                )
                print('Notification created')
            except models.Charity.DoesNotExist:
                pass


            # for expense in event['NewExpense']:
            #     # etc.
            #     pass

            # pass


    def get_address(self, contract_type, path=address_path):
        # Grep the last line containing the contract_type from the contract address file
        # addresses = open(self.address_path, "r")
        addresses = open(path, "r")
        lines = addresses.readlines()
        lastmatch = None
        for line in lines:
            if contract_type in line:
                lastmatch = line
        if lastmatch is not None:
            return lastmatch.split(": ")[1].strip()
            # for line in f.read():
            #     if contract_type in line:
            #         return line.split(": ")[1]


    def get_all_addresses(self, path=address_path):
        # addresses = open(self.address_path, "r")
        addresses = open(path, "r")
        lines = addresses.readlines()
        contracts = {}
        for line in lines:
            name, address = line.strip().split(": ")
            contracts[name] = address
        return contracts


class BlockchainProvider:
    def __init__(self):
        # self.blockchain = "ethereum"
        # self.network = "ropsten"
        # self.contract_address = "0x0"
        # self.contract_abi = "[]"

        self.contracts = {}

        self.w3 = Web3(HTTPProvider('http://localhost:8545'))

        # TODO: automatically read all contracts from ABI directory
        # and populate the self.contracts dictionary:
        # contracts: { 'name': { 'address': '0x0', 'abi': '[]' } }
        for contract_file in os.listdir(settings.CONTRACT_ABI_DIR):
            contract_file_path = os.path.join(
                settings.CONTRACT_ABI_DIR, contract_file)
            with open(contract_file_path, 'r') as file:
                contract_metadata = json.load(file)
                # contract_abi = contract_metadata['abi']

                contract_name = contract_metadata['contractName']
                # Get the address of the most recent deployment
                last_deployment = list(contract_metadata['networks'])[-1]
                contract_address = contract_metadata['networks'][last_deployment]['address']

                self.contracts[contract_name] = {
                    'address': contract_address,
                    'abi': contract_metadata['abi']
                }

        # TODO: instantiate a HuggingFace AutoModelForSequenceClassification object to classfiy
        # expense descriptions into categories here

    # # Credit: code from from perplexity.ai
    # def load_expense_classifier(self):
    #     from transformers import AutoModelForSequenceClassification, AutoTokenizer

    #     model_name = "bert-base-uncased"
    #     self.model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=10)
    #     self.tokenizer = AutoTokenizer.from_pretrained(model_name)

    # def predict_expense_class(self, description):
    #     input_ids = self.tokenizer(description, padding=True, truncation=True, return_tensors="pt").input_ids
    #     logits = self.model(input_ids).logits
    #     # or predicted_labels = model(input_ids).logits.argmax(dim=1)
    #     return logits

    def create_project(self, instance):
        contract = self.w3.eth.contract(
            address=self.contracts['SourceDocuments']['address'],
            abi=self.contracts['SourceDocuments']['abi'])

        project_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))

        project_name = instance.name
        # Convert project start date to an integer UNIX timestamp, discarding fractions of seconds
        project_start_date = datetime.datetime.combine(
            instance.start_date, datetime.time())
        project_start_date_timestamp = str(int(project_start_date.timestamp()))

        # TODO: replace 'from' (currently default account created by Ganache)
        # with address of blockchain user
        tx_hash = contract.functions.setProject(
            project_uuid, project_name, project_start_date_timestamp).transact({'from': self.w3.eth.accounts[0]})

        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt

    def create_expense(self, instance):
        expense_contract = self.w3.eth.contract(
            address=self.contracts['SourceDocuments']['address'],
            abi=self.contracts['SourceDocuments']['abi'])
        # contact_contract = self.w3.eth.contract(
        #     address=self.contracts['Contacts']['address'],
        #     abi=self.contracts['Contacts']['abi'])

        expense_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))
        try:
            supplier_uuid = Web3.keccak(
                text=str(instance.supplier.uuid).replace('-', ''))
        except AttributeError:
            supplier_uuid = b'\x00' * 32
        payment_type = instance.payment_type
        # TODO: replace with inference from HuggingFace model
        # expense_type = random.randint(0, 9)
        expense_type = secrets.choice(range(0, 9))
        expense_total = instance.transaction.filter(
            entries__direction=1).aggregate(total=Sum('entries__amount'))['total']
        # As Solidity cannot handle decimal types directly, we round to 2 digits
        # and multiply by 100 to store money as an integer
        expense_total_int = int(round(float(expense_total), 2) * 100)
        is_confirmed = False
        is_disputed = False
        is_expense = True

        # Transaction data
        transaction_uuid = BlockchainProvider.convert_uuid(
            instance.transaction.first().uuid)
        # Set to empty 32-byte array if no project UUID available
        if hasattr(instance.transaction.first().project, 'uuid'):
            tx_project_uuid = Web3.keccak(
                text=str(
                    getattr(instance.transaction.first().project, 'uuid')
                ).replace('-', '')
            )
        else:
            tx_project_uuid = b'\x00' * 32
        # tx_project_uuid = getattr(
        #     instance.transaction.first().project, 'uuid', None)
        tx_timestamp = BlockchainProvider.convert_timestamp(
            instance.transaction.first().timestamp)
        tx_is_confirmed = False
        tx_is_transaction = True
        transaction = [
            tx_project_uuid,
            tx_timestamp,
            tx_is_confirmed,
            tx_is_transaction
        ]

        # Transaction entries data - we have to re-arrange the data because the contract
        # takes 3 separate lists as arguments - 1 for accounts, 1 for amounts, and 1 for directions
        # to avoid having to deal with nested structs in the contract
        entries_accounts = []
        entries_amounts = []
        entries_narrations = []
        entries_directions = []
        entries = instance.transaction.first().entries.all()
        # TODO: this may not be robust (if loop skips a value for one array, all of them are
        # out of sync) - look up ways to guard against this
        for entry in entries:
            account = BlockchainProvider.convert_uuid(entry.account.uuid)
            amount = BlockchainProvider.convert_money(entry.amount.amount)
            narration = entry.narration
            # Convert the '-1' and '1' of backend to 'Debit' and 'Credit' enum values
            # in smart contract (0 and 1 respectively)
            direction = 0 if entry.direction == 1 else 1
            entries_accounts.append(account)
            entries_amounts.append(amount)
            entries_narrations.append(narration)
            entries_directions.append(direction)

        # TODO: dummy code to get an address - delete
        self.create_contact(instance.supplier)

        # Retrieve supplier address from the Contact smart contract
        supplier_address = self.get_contact(
            instance.supplier.uuid, instance.parent_charity)
        # supplier_address = expense_contract.functions.getContact(
        #     supplier_uuid).call({'from': self.w3.eth.accounts[0]})

        # Construct a dictionary containing the nested struct arguments
        arg_dict = {
            '_expenseUUID': expense_uuid,
            # '_expense': [supplier_address, payment_type, expense_type, expense_total_int, is_confirmed, is_expense],
            '_expense': (supplier_address, payment_type, expense_type, expense_total_int, is_confirmed, is_disputed, is_expense),
            '_transactionUUID': transaction_uuid,
            # '_transactionData': transaction,
            '_transactionData': tuple(transaction),
            '_accounts': entries_accounts,
            '_amounts': entries_amounts,
            '_narrations': entries_narrations,
            '_directions': entries_directions
        }

        # print('Testing: type of accounts list is: ',
        #       type(arg_dict['_accounts']))

        args = (
            expense_uuid,
            tuple(arg_dict['_expense']),
            arg_dict['_transactionUUID'],
            tuple(arg_dict['_transactionData']),
            arg_dict['_accounts'],
            arg_dict['_amounts'],
            arg_dict['_narrations'],
            arg_dict['_directions'],
        )

        # print('Testing: tuplized expense struct data is: ',
        #       tuple(arg_dict['_expense']))
        print('Is arg_dict called?')
        # tx_hash = contract.functions.setExpense(
        #     arg_dict).transact({'from': self.w3.eth.accounts[0]})

        # tx_hash = contract.functions.setExpense(
        #     expense_uuid, arg_dict['_expense'], arg_dict['_transactionUUID'], arg_dict['_transactionData'], arg_dict['_accounts'], arg_dict['_amounts'], arg_dict['_narrations'], arg_dict['_directions']).transact({'from': self.w3.eth.accounts[0]})
        tx_hash = expense_contract.functions.setExpense(
            # arg_dict).transact({'from': self.w3.eth.accounts[0]})
            arg_dict).transact({'from': self.w3.eth.accounts[0]})
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)

        # tx_hash = contract.functions.setExpense(
        #     expense_uuid, supplier, payment_type, instance.expense_type, expense_total, is_confirmed)

    def create_contact(self, instance, contact_address=None):
        contract = self.w3.eth.contract(
            address=self.contracts['Contacts']['address'],
            abi=self.contracts['Contacts']['abi'])

        charity_uuid = BlockchainProvider.convert_uuid(instance.parent_charity)
        contact_uuid = BlockchainProvider.convert_uuid(instance.uuid)
        # If new address for contact isn't supplied, generate a random one
        if contact_address is None:
            print('is this run? ')
            contact_address = BlockchainProvider.generate_eth_address()

        print('Contact address: ', contact_address)

        tx_hash = contract.functions.addContact(
            charity_uuid, contact_uuid, contact_address).transact({'from': self.w3.eth.accounts[0]})
        return self.w3.eth.wait_for_transaction_receipt(tx_hash)

    def create_donation(self, instance):
        contract = self.w3.eth.contract(
            address=self.contracts['Donations']['address'],
            abi=self.contracts['Donations']['abi'])

        donation_uuid = Web3.keccak(text=str(instance.uuid).replace('-', ''))
        donation_amount = instance.amount
        donation_date = datetime.datetime.combine(
            instance.date, datetime.time())
        donation_date_timestamp = str(int(donation_date.timestamp()))

        tx_hash = contract.functions.setDonation(
            donation_uuid, donation_amount, donation_date_timestamp).transact({'from': self.w3.eth.accounts[0]})

        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt

    def get_contact(self, contact_uuid, charity_uuid):
        """
            Takes a UUID for a Contact record (generated by the backend) and retrieves
            the blockchain address for that contact, stored in the Contact smart
            contract.
        """
        contract = self.w3.eth.contract(
            address=self.contracts['Contacts']['address'],
            abi=self.contracts['Contacts']['abi'])

        charity_uuid = BlockchainProvider.convert_uuid(
            charity_uuid)
        blockchain_uuid = BlockchainProvider.convert_uuid(contact_uuid)
        # blockchain_uuid = Web3.keccak(
        #     text=str(contact_uuid).replace('-', ''))

        supplier_address = contract.functions.getContact(
            charity_uuid, blockchain_uuid).call({'from': self.w3.eth.accounts[0]})
        return supplier_address

    @ staticmethod
    def convert_uuid(uuid):
        """
            Takes a UUID object, and returns a bytes32 hash of the UUID string,
            with dashes removed.
        """
        return Web3.keccak(text=str(uuid).replace('-', ''))

    @ staticmethod
    def convert_timestamp(datetime_obj):
        """Takes a Python datetime object, and returns an integer UNIX timestamp"""
        return int(datetime_obj.timestamp())

    @ staticmethod
    def convert_money(amount):
        """Takes a Python Decimal  object, and returns an integer amount in pence"""
        return int(round(float(amount), 2) * 100)

    @ staticmethod
    def generate_eth_address():
        """Creates a cryptographically secure random Ethereum address"""
        # Use the OS's random number generator to create 20-byte address
        address = '0x' + os.urandom(20).hex()
        # Add mix of lower and uppercase letters to make a checksum
        return Web3.to_checksum_address(address)

    @ staticmethod
    def get_bytes32(python_string):
        """
            Convert a Python string into the Solidity 'bytes32' type (i.e.
            into a 32-byte bytes object)
        """
        python_string = python_string or ''
        # CREDIT: adapted from GitHub Copilot suggestion
        return python_string.encode('utf-8').ljust(32, b'\0').hex()

    nulls = {
        'address': web3.constants.ADDRESS_ZERO,
        'bytes32': b'\x00' * 32,
        'int128': 0,
        'bytes[]': [b'\x00' * 32]
    }

    # def get_blockchain(self):
    #     return self.blockchain

    # def get_network(self):
    #     return self.network

    # def get_contract_address(self):
    #     return self.contract_address

    # def get_contract_abi(self):
    #     return self.contract_abi

    # def set_blockchain(self, blockchain):
    #     self.blockchain = blockchain

    # def set_network(self, network):
    #     self.network = network


# def run():
#     from accounting.models import Expense
#     e = Expense.objects.first()
#     BlockchainProvider().create_contact(e)


# run()



