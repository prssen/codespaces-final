import brownie
from brownie import SourceDocuments, Transactions, TransactionLib, SourceDocumentLib, accounts
import pytest
from utils.helpers import convert_uuid, generate_eth_address
from utils.test_data import *
import os
import sys
import django
from django import setup
import pytest

sys.path.append(
    '/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Apply 'module' scope to fixture so that it runs only once
# for all tests in file (to avoid redeploying contract for each test)
# autouse=True to reset blockchain state after each test
@pytest.fixture(scope="module", autouse=True)
def contract():
    accounts[0].deploy(TransactionLib)
    transactions = accounts[0].deploy(Transactions)
    accounts[0].deploy(SourceDocumentLib)
    return accounts[0].deploy(SourceDocuments, transactions.address)


# def test_contract_runs(contract):
#     # Arrange 
#     contract.

def test_create_expense(contract):
    """
        Tests the set_expense() method by creating an expense, getting it, and 
        checking that the return value equals the UUID of the expense created
    """
    contract.setExpense(expense_data)
    # Fetch the created expense using the expense UUID
    expense = contract.expenses(expense_data[0])
    
    # Created expense should match the originale expense data
    assert expense_data[1] == expense

# TODO: refactor SourceDocumentLib from 'new Transactions()' -> 'Transactons(existingAddress)'
# + pass address from Charity/wherever
def test_related_data(contract, Transactions):
    """s
        Test that related transaction data is stored in the Transaction contract when a new
        expense is created.
    """
    contract.setExpense(expense_data)
    transaction = Transactions[-1].getTransaction(expense_data[2])
    # transaction = Transactions[-1].transactions(expense_data[3][0])
    # transaction_detail_index = [Transactions[-1].transactionToDetails(expense_data[2], 0)
    # transaction_details = [Transactions[-1].transactionDetails[i] for i in transaction_detail_indexes]
    assert len(transaction) == 2
    # Assert transaction data is correct
    assert transaction[0] == [
        expense_data[3][0],
        expense_data[3][1],
        expense_data[3][2],
        expense_data[3][3]
    ]
    # Assert that the transaction has the same number of 
    # entries as in the original data
    assert len(transaction[1]) == len(expense_data[5])

# TODO: parametrise by writing func to remove # of fields,
# repeat test for sample of 5, removing 1 to expense.length fields,
# check for 'expected8 but got {8 - fields removed}" in exception
def test_invalid_expense(contract):
    """
        Test that expense creation fails when invalid data is supplied to the
        smart contract.
    """
    with pytest.raises(ValueError) as exc:
        contract.setExpense(invalid_expense_data)
        # Check that contract identifies the 2 missing fields
        assert 'expected 8 but got 6' in str(exc.value)
        

def test_expense_event_emitted(contract):
    """
        Test that the newExpense event is emitted when an expense is created.
    """
    tx = contract.setExpense(expense_data)
    print('Transaction events: tx.events')
    # Assert that the event is created, and that it has the correct details
    assert 'NewExpense' in tx.events
    assert tx.events['NewExpense'] == {
        '_to': expense_data[1][0],
        'sender': accounts[0],
        '_paymentMethod': expense_data[1][1],
        'total': expense_data[1][3],
        'timestamp': expense_data[3][1],
        'expenseUUID': expense_data[0],
    }

# def test_get_expense_works():
#     """Test it runs without crashing"""
#     # Arrange
#     # account = accounts[0]
#     # source_docs = SourceDocuments.deploy({'from': account})
    

# def test_invoice_event_emitted():
#     # Arrange
#     account = accounts[0]
#     source_docs = SourceDocuments.deploy({'from': account})
#     # This should be empty
#     starting_events = source_docs.events.get_sequence(from_block=1)

#     # Act
#     # TODO: replace with an actual event-emitting function
#     receiver = generate_eth_address()
#     source_docs.triggerEvent(receiver)
#     ending_events = source_docs.events.get_sequence(from_block=1)

#     # Assert
#     assert len(ending_events['NewInvoice']) == 1 and \
#         len(starting_events['NewInvoice']) == 0
