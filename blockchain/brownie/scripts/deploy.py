# isort: skip_file

from utils import helpers
from brownie import accounts, config, network, Accounts, Charity, Common, Contacts, ProjectLib, Projects, SourceDocuments, SourceDocumentLib, Transactions, Storage, TransactionLib
from django import setup
import os
import sys
import django
import uuid

sys.path.append(
    '/home/ubuntu/codespaces-final/backend')
print('Testing: python path is: ', os.environ.get('PYTHONPATH'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()
print('Current network is: ', network.show_active())


def deploy_contact():

    # Ganache spins up 10 default accounts - access here
    account = accounts[0]
    print(account)

    # # Created and encrypted by CLI - need to enter password in
    # # Terminal to see the address now
    # account = accounts.load('my-account')
    # print(account)

    # # Created with env variable loaded in YAML config file
    # account = accounts.add(config['wallets']['from_key'])
    # print(account)

    contact_ct = Contacts.deploy({'from': account})

    print('Contract deployed!')

    transaction = contact_ct.addContact(
        '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
        '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
        '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
        {'from': account})
    transaction.wait(1)

    # Note the read-only function doesn't need a 'from' IF it is
    # a view function
    new_address = contact_ct.getContact(
        '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
        '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2')
# Entry point - run deploy functions here


def deploy_contracts():
    # Use one of Ganache test networks' pre-funded accounts
    account = accounts[0]
    common = Common.deploy({'from': account})
    accounts_contract = Accounts.deploy({'from': account})
    transaction_lib = TransactionLib.deploy({'from': account})
    transaction = Transactions.deploy({'from': account})
    source_document_lib = SourceDocumentLib.deploy({'from': account})
    source_document = SourceDocuments.deploy(transaction.address, {'from': account})
    project_lib = ProjectLib.deploy({'from': account})
    projects = Projects.deploy({'from': account})

    storage = Storage.deploy({'from': account})

    # Charity constructor arguments (name, regNumber, charityType, owners)
    charity = Charity.deploy(
        'First charity',
        helpers.get_bytes32('123TESTREG'),
        0,
        [helpers.generate_eth_address() for _ in range(3)],
        transaction.address,
        {'from': account})

    contact = Contacts.deploy({'from': account})
    common = Common.deploy({'from': account})

    # Write contract addresses to a file, to be used
    # by the Django app
    # TODO: temporary - delete this
    # address_path = os.path.join(
    #     os.path.dirname(__file__), 'contract_addresses.txt')
    address_path = "/home/ubuntu/codespaces-final/backend/accounting/blockchain_service/contract_addresses.txt"
    print("project info: ", projects)
    with open(address_path, "w") as f:
        # f.write(f"PROJECT: {projects}\n")
        # f.write(f"CONTACT: {contact}\n")
        # f.write(f"SOURCE_DOCUMENT: {source_document}\n")
        f.write(f"ProjectLib: {project_lib}\n")
        f.write(f"SourceDocumentLib: {source_document_lib}\n")
        f.write(f"TransactionLib: {transaction_lib}\n")
        f.write(f"Transactions: {transaction}\n")
        f.write(f"Accounts: {accounts_contract}\n")
        f.write(f"Common: {common}\n")

        f.write(f"Projects: {projects}\n")
        f.write(f"Contacts: {contact}\n")
        f.write(f"SourceDocuments: {source_document}\n")
        f.write(f"Storage: {storage}\n")


    # with open('contract_addresses.txt', 'w') as f:
    #     f.write('ACCOUNTS_CONTRACT_ADDRESS=' +
    #             accounts_contract.address + '\n')
    #     f.write('CHARITY_CONTRACT_ADDRESS=' + charity.address + '\n')
    #     f.write('COMMON_CONTRACT_ADDRESS=' + common.address + '\n')
    #     f.write('CONTACTS_CONTRACT_ADDRESS=' + contact.address + '\n')
    #     f.write('PROJECTS_CONTRACT_ADDRESS=' + projects.address + '\n')
    #     f.write('SOURCE_DOCUMENTS_CONTRACT_ADDRESS=' +
    #             source_document.address + '\n')
    #     f.write('TRANSACTIONS_CONTRACT_ADDRESS=' + transaction.address + '\n')
    #     f.write('TRANSACTION_LIB_CONTRACT_ADDRESS=' +
    #             transaction_lib.address + '\n')
    #     f.write('SOURCE_DOCUMENT_LIB_CONTRACT_ADDRESS=' +
    #             source_document_lib.address + '\n')
    #     f.write('PROJECT_LIB_CONTRACT_ADDRESS=' + project_lib.address + '\n')

    print('Contracts deployed!')


# Accounts, Charity, Common, Contacts, ProjectLib, SourceDocument, SourceDocumentLib, Transaction, TransactionLib


def main():
    # deploy_contact()
    deploy_contracts()
