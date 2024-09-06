// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

// import "../lib/HitchensUnorderedKeySet.sol";
import "./Transaction.sol";
import "./SourceDocumentLib.sol";

// TODO: client side code needs to convert decimals to integers
// TODO: add immutable keyword where needed - e.g. 'public address immutable myVariable'
/*
    TODO FIXME: finish donation getters and setters (if time)

*/
contract SourceDocuments {


    // event NewExpense(address indexed _to, address indexed sender, PaymentTypes _paymentMethod, int128 total, uint timestamp);
    // event NewInvoice(address indexed _to, address indexed sender, uint dueDate, int128 total, uint timestamp);

    // // These large structs are needed to avoid the 
    // // 'Stack too deep' error caused by passing too many variables to
    // // function arguments (the EVM only has 16 'slots' to store 
    // // variables - https://soliditydeveloper.com/stacktoodeep)
    // struct InvoiceInputs {
    //     bytes32 _invoiceUUID;
    //     Invoice _invoice;
    //     bytes32 _transactionUUID;
    //     Transactions.Transaction _transactionData;
    //     bytes32[] _accounts;
    //     int128[] _amounts;
    //     string[] _narrations;
    //     Transactions.Directions[] _directions;
    // }

    // struct Invoice {
    //     // Timestamp
    //     uint dueDate;
    //     // UUID of customer
    //     address customer;
    //     int128 total;
    //     bool isConfirmed;
    //     bool isInvoice;
    // }

    // struct Donation {
    //     address donor;
    //     string donationRef;
    //     int128 total;
    //     string memo;
    //     PaymentTypes paymentMethods;
    //     bool isConfirmed;
    
    // }
    
    // enum PaymentTypes { CreditCard, DebitCard, Cheque, BankTransfer, Mobile, Crypto }
    // enum ExpenseTypes {
    //     Salaries,
    //     Rent,
    //     Office,
    //     Donations,
    //     Program,
    //     Fundraising,
    //     Technology,
    //     Services,
    //     Insurance,
    //     Training
    // }

    // struct Expense {
    //     address payee;
    //     PaymentTypes paymentMethod;
    //     ExpenseTypes expenseType;
    //     int128 total;
    //     bool isConfirmed;
    //     bool isExpense;
    // }

    // struct ExpenseInputs {
    //     bytes32 _expenseUUID;
    //     Expense _expense;
    //     bytes32 _transactionUUID;
    //     Transactions.Transaction _transactionData;
    //     bytes32[] _accounts;
    //     int128[] _amounts;
    //     string[] _narrations;
    //     Transactions.Directions[] _directions;
    // }

    event NewExpense(address indexed _to, address indexed sender, SourceDocumentLib.PaymentTypes _paymentMethod, int128 total, uint timestamp, bytes32 expenseUUID);
    event ExpenseConfirmed(bytes32 expenseUUID, address indexed _by);

    struct ExpenseInputs2 {
        bytes32 _expenseUUID;
    }

    function triggerEvent(address receiver) public returns (bool) {
        emit SourceDocumentLib.NewInvoice(address(this), receiver, 777, 555, 777);
        return true;
    }

    address internal transactionContractAddress;

    constructor(address _transactionAddress) {
        transactionContractAddress = _transactionAddress;
    }

    // Storing each source document, keyed by its UUID
    mapping(bytes32 => SourceDocumentLib.Invoice) public invoices;
    mapping(bytes32 => SourceDocumentLib.Expense) public expenses;
    mapping(bytes32 => SourceDocumentLib.Donation) public donations;

    // Transactions internal transactions;

    // Mapping which connects each source document to its related transactions
    mapping(bytes32 => bytes32[]) public invoiceTransactions;
    mapping(bytes32 => bytes32[]) public expenseTransactions;
    mapping(bytes32 => bytes32[]) public donationTransactions;

    // Mapping from the project UUID to transactions by transaction type
    mapping(bytes32 => bytes32[]) public projectExpenses;
    mapping(bytes32 => bytes32[]) public projectDonations;

    uint256 nonce;


    function invoiceExists(
        bytes32 _invoiceUUID
    ) public view returns (bool) {
        return invoices[_invoiceUUID].isInvoice;
    }

    function expenseExists(
        bytes32 _expenseUUID
    ) public view returns (bool) {
        return expenses[_expenseUUID].isExpense;
    }

    function setInvoice(
        SourceDocumentLib.InvoiceInputs memory inputs
    ) public returns (bool) {
        return SourceDocumentLib.setInvoice(inputs, invoices, invoiceTransactions);
    }

    function setDonation(
        SourceDocumentLib.DonationInputs memory _donation
    ) public returns (bool) {
        // donations[_donation._sourceDocUUID] = _donation._donation;
        
        return SourceDocumentLib.setDonation(_donation, donations, donationTransactions, projectDonations);
        // return true;
    }

    function setExpense2(
        ExpenseInputs2 memory inputs
    ) public returns (bool) {
        return true;
    }

    event ExpenseSet(SourceDocumentLib.ExpenseInputs inputs);
    error TestingError(uint errorNumber, string message);


   function setExpense(
        SourceDocumentLib.ExpenseInputs memory inputs
    ) public virtual returns (bool) {
        // revert TestingError(1, 'Testing error message');
        // emit ExpenseSet(inputs);
        SourceDocumentLib.ExpenseEvent memory eventData = 
            SourceDocumentLib.setExpense(
                inputs, 
                expenses, 
                expenseTransactions, 
                projectExpenses,
                transactionContractAddress);
        emit NewExpense(
            eventData._to, 
            eventData.sender, 
            eventData._paymentMethod, 
            eventData.total, 
            eventData.timestamp,
            eventData.expenseUUID);
        return true;

        // return SourceDocumentLib.setExpense(inputs, expenses, expenseTransactions, projectExpenses);
        // return true;
    }

    /// @notice Perform counterparty verification of transaction
    /// @param _expenseUUID UUID of the expense to be confirmed
    /// @return bool if confirmation is successful; false otherwise
    function confirmExpense(bytes32 _expenseUUID) public returns (bool) {
        bool status = SourceDocumentLib.confirmExpense(_expenseUUID, expenses);
        if (status == true) {
            emit ExpenseConfirmed(_expenseUUID, msg.sender);
        }
        return status;
    }

    function confirmInvoice(bytes32 _invoiceUUID) public returns (bool) {
        return SourceDocumentLib.confirmInvoice(_invoiceUUID, invoices);
    }

    function getProjectExpenses(bytes32 _projectUUID) public view returns (SourceDocumentLib.Expense[] memory _expenses) {
        return SourceDocumentLib.getProjectExpenses(_projectUUID, expenses, projectExpenses);
    }

    function getProjectDonations(bytes32 _projectUUID) public view returns (SourceDocumentLib.Donation[] memory _donations) {
        return SourceDocumentLib.getProjectDonations(_projectUUID, donations, projectDonations);
    }

    function getProjectExpenseTransactions(
            bytes32 _projectUUID
        ) public returns (SourceDocumentLib.ExpenseData[] memory _expenseTransactions) {
        return SourceDocumentLib.getProjectExpenseTransactions(_projectUUID, transactionContractAddress, expenses, expenseTransactions, projectExpenses);
    }

}