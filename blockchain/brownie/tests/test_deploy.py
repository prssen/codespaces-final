from brownie import Contacts, accounts
from utils.helpers import convert_uuid, generate_eth_address
import os
import sys
import django
from django import setup

sys.path.append(
    '/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()


def test_deploy():
    from accounting.models import Expense
    e = Expense.objects.first()

    # Arrange
    account = accounts[0]
    new_charity = convert_uuid(e.parent_charity)
    new_contact = convert_uuid(e.supplier.uuid)

    # Act
    contact = Contacts.deploy({'from': account})

    # TODO: import helper functions to generate bytes32 UUIDs here
    # new_charity = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
    # new_contact = '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'
    starting_address = contact.getContact(new_charity, new_contact)
    # Exoecting the default value for address, indicating no address
    # has been stored yet
    expected = "0x0000000000000000000000000000000000000000"

    # Assert
    assert starting_address == expected

# TODO: uncomment


def test_add_contact():
    """
        Test that a contact record can be created and retrieved
        successfully from the blockchain.
    """
    # Arrange - get a Supplier (Contact subclass) record from DB,
    # and get or create fields required by createContact()
    from accounting.models import Expense
    e = Expense.objects.first()

    account = accounts[0]
    contact = Contacts.deploy({'from': account})
    new_charity = convert_uuid(e.parent_charity)
    new_contact = convert_uuid(e.supplier.uuid)
    new_contact_address = generate_eth_address()

    # Act
    expected = new_contact_address
    # expected = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'

    # new_charity = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
    # new_contact = '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'
    # new_contact_address = '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db'
    contact.addContact(new_charity, new_contact,
                       new_contact_address, {'from': account})

    # Assert
    assert expected == contact.getContact(new_charity, new_contact)


def test_add_contact():
    """
        Test that a contact record can be created and retrieved
        successfully bfrom the blockchain.
    """
    # Arrange - get a Supplier (Contact subclass) record from DB,
    # and get or create fields required by createContact()
    from accounting.models import Expense
    e = Expense.objects.first()

    account = accounts[0]
    contact = Contacts.deploy({'from': account})
    new_charity = convert_uuid(e.parent_charity)
    new_contact = convert_uuid(e.supplier.uuid)
    new_contact_address = generate_eth_address()

    # Act
    expected = new_contact_address
    contact.addContact(new_charity, new_contact,
                       new_contact_address, {'from': account})

    # Assert
    assert expected == contact.getContact(new_charity, new_contact)
