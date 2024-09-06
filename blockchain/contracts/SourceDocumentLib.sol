// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

// import "../lib/HitchensUnorderedKeySet.sol";
import "./Transaction.sol";

// TODO: client side code needs to convert decimals to integers
/*
    TODO FIXME: finish donation getters and setters (if time)

*/
library SourceDocumentLib {

    // CHANGED _to FROM BYTES32 TO ADDRESS
    // event NewExpense(address indexed _to, address indexed sender, PaymentTypes _paymentMethod, int128 total, uint timestamp);
    // event NewExpense(bytes32 indexed _to, address indexed sender, PaymentTypes _paymentMethod, int128 total, uint timestamp);

    event NewInvoice(address indexed _to, address indexed sender, uint dueDate, int128 total, uint timestamp);
    event NewDonation( address indexed _to, address indexed sender, int128 total, uint paymentMethods, uint timestamp);

    struct ExpenseEvent {
        address _to;
        address sender;
        PaymentTypes _paymentMethod;
        int128 total; 
        uint timestamp;
        bytes32 expenseUUID;
    }

    // These large structs are needed to avoid the 
    // 'Stack too deep' error caused by passing too many variables to
    // function arguments (the EVM only has 16 'slots' to store 
    // variables - https://soliditydeveloper.com/stacktoodeep)
    struct InvoiceInputs {
        bytes32 _invoiceUUID;
        Invoice _invoice;
        bytes32 _transactionUUID;
        TransactionLib.Transaction _transactionData;
        bytes32[] _accounts;
        int128[] _amounts;
        string[] _narrations;
        TransactionLib.Directions[] _directions;
    }

    // Putting everything except the struct itself (e.g. Invoice struct, Expense struct)
    // in one struct, so we can re-use this for all SourceDoc types (no need for InvoiceInputs,
    // ExpenseInputs etc)
    // struct SourceDocTransaction {
    //     TransactionLib.Transaction _transactionData;
    //     TransactionLib.TransactionDetail[] _transactionDetails;
    // }
    struct SourceDocTransaction {
        uint timestamp;
        // bool isConfirmed;
        string narration;
    }
    struct ExpenseData {
        // bytes32 _sourceDocUUID;
        Expense _expense;
        bytes32 _transactionUUID;
        SourceDocTransaction[] _transaction;
        // TransactionLib.Transaction[] _transactionData;
    //    bytes32[] _accounts;
    //    int128[] _amounts;
    //    string[] _narrations;
    //    TransactionLib.Directions[] _directions;
    }

    struct Invoice {
        // Timestamp
        uint dueDate;
        // UUID of customer
        address customer;
        int128 total;
        bool isConfirmed;
        bool isInvoice;
    }

    struct Donation {
        address donor;
        string donationRef;
        int128 total;
        // string memo;
        PaymentTypes paymentMethods;
        bool isConfirmed;
        bool isDonation;
    }

    enum PaymentTypes { CreditCard, DebitCard, Cheque, BankTransfer, Mobile, Crypto }
    enum ExpenseTypes {
        Salaries,
        Rent,
        Office,
        Donations,
        Program,
        Fundraising,
        Technology,
        Services,
        Insurance,
        Training
    }

    struct Expense {
        address payee;
        // bytes32 payee;
        PaymentTypes paymentMethod;
        ExpenseTypes expenseType;
        int128 total;
        bool isConfirmed;
        bool isDisputed;
        bool isExpense;
    }

    struct ExpenseInputs {
        bytes32 _expenseUUID;
        Expense _expense;
        bytes32 _transactionUUID;
        TransactionLib.Transaction _transactionData;
        bytes32[] _accounts;
        int128[] _amounts;
        string[] _narrations;
        TransactionLib.Directions[] _directions;
    }

    struct DonationInputs {
        bytes32 _sourceDocUUID;
        Donation _donation;
        bytes32 _transactionUUID;
        TransactionLib.Transaction _transactionData;
        bytes32[] _accounts;
        int128[] _amounts;
        string[] _narrations;
        TransactionLib.Directions[] _directions;
    }

    struct ExpenseInputs2 {
        bytes32 _expenseUUID;
        // Expense _expense;
        // bytes32 _transactionUUID;
        // TransactionLib.Transaction _transactionData;
        // bytes32[] _accounts;
        // int128[] _amounts;
        // string[] _narrations;
        // TransactionLib.Directions[] _directions;
    }

    // // Storing each source document, keyed by its UUID
    // mapping(bytes32 => Invoice) public invoices;
    // mapping(bytes32 => Expense) public expenses;

    // // Transactions internal transactions;

    // // Mapping which connects each source document to its related transactions
    // mapping(bytes32 => bytes32[]) public invoiceTransactions;
    // mapping(bytes32 => bytes32[]) public expenseTransactions;

    // // Mapping from the project UUID to the project's expenses
    // mapping(bytes32 => bytes32[]) public projectExpenses;

    // uint256 nonce;


    function invoiceExists(
        bytes32 _invoiceUUID,
        mapping(bytes32 => Invoice) storage invoices
    ) public view returns (bool) {
        return invoices[_invoiceUUID].isInvoice;
    }

    function expenseExists(
        bytes32 _expenseUUID,
        mapping(bytes32 => Expense) storage expenses
    ) public view returns (bool) {
        return expenses[_expenseUUID].isExpense;
    }

    // UNKNOWN PURPOSE - DELETE
        // uint _dueDate,
        // bytes32 _customer,

        // Invoice memory newInvoice = Invoice({
        //     dueDate: invoiceData.dueDate,
        //     customer: invoiceData.customer,
        //     isConfirmed: false,
        //     isInvoice: true
        // });

        // TODO: old func args, delete
        // bytes32 _invoiceUUID,
        // Invoice memory invoiceData,
        // bytes32 _transactionUUID,
        // Transactions.Transaction memory transactionData,
        // bytes32[] memory _accounts,
        // int128[] memory _amounts,
        // string[] memory _narrations,
        // Transactions.Directions[] memory _directions 

    function setInvoice(
        InvoiceInputs memory inputs,
        mapping(bytes32 => Invoice) storage invoices,
        mapping(bytes32 => bytes32[]) storage invoiceTransactions
    ) public returns (bool) {
{
        // Create the invoice struct and add to storage
        invoices[inputs._invoiceUUID] = inputs._invoice;
}
{
        // Create the related transaction
        Transactions transactions = new Transactions();

        transactions.setTransaction(
            inputs._transactionData.project,
            inputs._transactionData.timestamp,
            inputs._transactionUUID,
            inputs._accounts,
            inputs._amounts,
            inputs._narrations,
            inputs._directions
        );
}
        // Link transaction to invoice
        invoiceTransactions[inputs._invoiceUUID].push(inputs._transactionUUID);

        // Emit invoice to customers for verification
        emit NewInvoice(
            inputs._invoice.customer,
            msg.sender,
            inputs._invoice.dueDate,
            inputs._invoice.total,
            inputs._transactionData.timestamp
        );

        return true;

        /*
        bytes32 _project,
        uint _timestamp,
        bytes32 _transactionUUID,
        // TODO: finish
        bytes32[] memory _accounts,
        int128[] memory _amounts,
        string[] memory _narrations,
        Directions[] memory _directions
        */
    }

   function setExpense(
        ExpenseInputs memory inputs,
        mapping(bytes32 => Expense) storage expenses,
        mapping(bytes32 => bytes32[]) storage expenseTransactions,
        mapping(bytes32 => bytes32[]) storage projectExpenses,
        address _transactionContractAddress

    // ) public returns (bool) {
    ) public returns (ExpenseEvent memory) {
{
        // Create the expense struct and add to storage
        expenses[inputs._expenseUUID] = inputs._expense;
}
{
        // Create the related transaction
        // Transactions transactions = new Transactions();
        Transactions transactions = Transactions(_transactionContractAddress);


        transactions.setTransaction(
            inputs._transactionData.project,
            inputs._transactionData.timestamp,
            inputs._transactionUUID,
            inputs._accounts,
            inputs._amounts,
            inputs._narrations,
            inputs._directions
        );
}
        // Link transaction to expense
        expenseTransactions[inputs._expenseUUID].push(inputs._transactionUUID);

        // Link expense to project
        projectExpenses[inputs._transactionData.project].push(inputs._expenseUUID);

        // Emit transaction to counterparties for verification
        // emit NewExpense(
        //     inputs._expense.payee,
        //     msg.sender,
        //     inputs._expense.paymentMethod,
        //     inputs._expense.total,
        //     inputs._transactionData.timestamp
        // );

        ExpenseEvent memory eventData = ExpenseEvent(
            inputs._expense.payee,
            msg.sender,
            inputs._expense.paymentMethod,
            inputs._expense.total,
            inputs._transactionData.timestamp,
            inputs._expenseUUID
        );

        // return true;
        return eventData;
    }

    function setDonation(
        DonationInputs memory inputs,
        mapping(bytes32 => Donation) storage donations,
        mapping(bytes32 => bytes32[]) storage donationTransactions,
        mapping(bytes32 => bytes32[]) storage projectDonations
    ) public returns (bool) {

{
        // Create the donation struct and add to storage
        donations[inputs._sourceDocUUID] = inputs._donation;
}
{
        // Create the related transaction
        Transactions transactions = new Transactions();


        transactions.setTransaction(
            inputs._transactionData.project,
            inputs._transactionData.timestamp,
            inputs._transactionUUID,
            inputs._accounts,
            inputs._amounts,
            inputs._narrations,
            inputs._directions
        );
}
        // Link transaction to donation
        donationTransactions[inputs._sourceDocUUID].push(inputs._transactionUUID);

        // Link donation to project
        projectDonations[inputs._transactionData.project].push(inputs._sourceDocUUID);

        // Emit transaction to counterparties for verification
        emit NewDonation(
            inputs._donation.donor,
            msg.sender,
            inputs._donation.total,
            uint256(inputs._donation.paymentMethods),
            inputs._transactionData.timestamp
        );

        return true;
    }

    /// @notice Perform counterparty verification of transaction
    /// @param _expenseUUID UUID of the expense to be confirmed
    /// @return bool if confirmation is successful; false otherwise
    function confirmExpense(
        bytes32 _expenseUUID, 
        mapping(bytes32 => Expense) storage expenses) public returns (bool) {
        // The caller can only confirm the expense if they are
        // the payee
        if (msg.sender == expenses[_expenseUUID].payee) {
            expenses[_expenseUUID].isConfirmed = true;
            expenses[_expenseUUID].isDisputed = false;
            return true;
        }
        return false;
    }

    /// @notice Register counterparty disagreement with transaction details
    function disputeExpense(bytes32 _expenseUUID, mapping(bytes32 => Expense) storage expenses) public returns (bool) {
        if (msg.sender == expenses[_expenseUUID].payee) {
            expenses[_expenseUUID].isDisputed = true;
            expenses[_expenseUUID].isConfirmed = false;
            return true;
        }
        return false;
    }

    function confirmInvoice(
        bytes32 _invoiceUUID, 
        mapping(bytes32 => Invoice) storage invoices) public returns (bool) {
        
        // The caller can only confirm the expense if they are
        // the payee
        if (msg.sender == invoices[_invoiceUUID].customer) {
            invoices[_invoiceUUID].isConfirmed = true;
            return true;
        }
        return false;
    }


    function getProjectExpenses(
            bytes32 _projectUUID, 
            mapping(bytes32 => Expense) storage expenses,
            mapping(bytes32 => bytes32[]) storage projectExpenses
        ) public view returns (Expense[] memory _expenses) {
        bytes32[] memory expenseIDs = projectExpenses[_projectUUID];
        Expense[] memory _projectExpenses = new Expense[](expenseIDs.length);
        for (uint i = 0; i < expenseIDs.length; i++) {
            _projectExpenses[i] = expenses[expenseIDs[i]];
        }
        return _projectExpenses;
    }

    event LogThis(string msg);
    // /// Get expenses and their associated transactions for project
    /// @param _projectUUID UUID of project 
    /// @param expenseTransactions storage mapping of expense UUIDs to transaction UUIDs
    /// @param projectExpenses storage mapping of projects to expenses
    function getProjectExpenseTransactions(
            bytes32 _projectUUID,
            address _transactionContractAddress,
            mapping(bytes32 => SourceDocumentLib.Expense) storage expenses,
            mapping(bytes32 => bytes32[]) storage expenseTransactions,
            mapping(bytes32 => bytes32[]) storage projectExpenses
            // mapping(bytes32 => TransactionLib.Transaction) storage transactions
        // ) public view returns (Expense[] memory _expenses, TransactionLib.Transaction[] memory _transactions) {
        ) public returns (ExpenseData[] memory _projectExp) {
        emit LogThis('Library function reached!');
        Transactions _transactionContract = Transactions(_transactionContractAddress);
        
        bytes32[] memory expenseIDs = projectExpenses[_projectUUID];

        // uint counter = 0;

        // mapping(bytes32 => TransactionLib.Transaction) memory _tempTransactions;
        // Expense[] memory _projectExpenses = new Expense[](expenseIDs.length);
        ExpenseData[] memory _projectTransactions = new ExpenseData[](expenseIDs.length);

        // For each expense, get its transactions
        for (uint i = 0; i < expenseIDs.length; i++) {
            bytes32[] memory _transactionUUIDs = expenseTransactions[expenseIDs[i]];
            // _projectExpenses[i] = expenses[expenseIDs[i]];
            ExpenseData memory _expenseTransaction;
            // _expenseTransaction._sourceDocUUID = expenseIDs[i];
            _expenseTransaction._expense = expenses[expenseIDs[i]];
            _expenseTransaction._transaction = new SourceDocTransaction[](_transactionUUIDs.length);

            for (uint j = 0; j < _transactionUUIDs.length; j++) {
                _expenseTransaction._transactionUUID = _transactionUUIDs[j];
                // (_expenseTransaction._transaction[j]._transactionData, _expenseTransaction._transaction[j]._transactionDetails) = _transactionContract.getTransaction(_transactionUUIDs[j]);
                (TransactionLib.Transaction memory _tr, TransactionLib.TransactionDetail[] memory _trDetail) = _transactionContract.getTransaction(_transactionUUIDs[j]);
                
                _expenseTransaction._transaction[j].timestamp = _tr.timestamp;
                // _expenseTransaction._transaction[j].isConfirmed = _tr.isConfirmed;
                _expenseTransaction._transaction[j].narration = _trDetail[0].narration;

                // counter++;
                // Store transactions in a temporary mapping (have to do this as Solidity
                // doesn't permit using dynamic-sized arrays in memory)
                // _tempTransactions[keccak256(abi.encodePacked(counter))] = _transactionContract.getTransaction(_transactionUUIDs[j]);
            }

            _projectTransactions[i] = _expenseTransaction;
            // for (uint j = 0; j < _transactionUUIDs.length; j++) {
            //     _transactions[j] = _transactionContract.getTransaction(_transactionUUIDs[j]);
            // }
        }

        return _projectTransactions;

        // Create final array to return the transaction data in
        // TransactionLib.Transaction[] memory _projectTransactions = new TransactionLib.Transaction[](counter);
        // for (uint i = 0; i < counter; i++) {
        //     _projectTransactions[i] = _tempTransactions[keccak256(abi.encodePacked(i))];
        // }
        // Expense[] memory _projectExpenses = new Expense[](expenseIDs.length);
        // TransactionLib.Transaction[] memory _projectTransactions = new TransactionLib.Transaction[](expenseIDs.length);
        // for (uint i = 0; i < expenseIDs.length; i++) {
        //     _projectExpenses[i] = expenses[expenseIDs[i]];
        //     _projectTransactions[i] = _transactionContract.getTransaction(expenseIDs[i]);
        // }
        // return (_projectExpenses, _projectTransactions);

        
        // bytes32[] memory transactionIDs = expenseTransactions[_expenseUUID];
        // TransactionLib.Transaction[] memory _expenseTransactions = new TransactionLib.Transaction[](transactionIDs.length);
        // for (uint i = 0; i < transactionIDs.length; i++) {
        //     _expenseTransactions[i] = transactions[transactionIDs[i]];
        // }
        // return (_projectExpenses, _projectTransactions);
    }

    function getProjectDonations(
            bytes32 _projectUUID, 
            mapping(bytes32 => Donation) storage donations,
            mapping(bytes32 => bytes32[]) storage projectDonations
        ) public view returns (Donation[] memory _donations) {
        bytes32[] memory donationIDs = projectDonations[_projectUUID];
        Donation[] memory _projectDonations = new Donation[](donationIDs.length);
        for (uint i = 0; i < donationIDs.length; i++) {
            _projectDonations[i] = donations[donationIDs[i]];
        }
        return _projectDonations;
    }

}