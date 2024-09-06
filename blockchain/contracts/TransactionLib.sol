// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

// import "../lib/HitchensUnorderedKeySet.sol";

// TODO: client side code needs to convert decimals to integers

library TransactionLib {

    // using HitchensUnorderedKeySetLib for HitchensUnorderedKeySetLib.Set;
    // HitchensUnorderedKeySetLib.Set transactionSet;

    // This should be an enum { Debit, Credit }, but arrays of enums
    // as function argumemtns seem to not work 
    enum Directions { Debit, Credit }
    // Data attributes

    // Note: the 'uuid' attribute is required, but is
    // used as a key in the mapping storing all Transactions
    struct Transaction {
        bytes32 project;
        uint timestamp;
        bool isConfirmed;
        bool isTransaction;
    }

    struct TransactionDetail {
        // UUIDs to the linked transaction and account
        bytes32 transaction;
        bytes32 account;
        int128 amount;
        string narration;
        Directions direction;
    }

    // // Mapping from uuid of transaction to transaction data
    // mapping(bytes32 => Transaction) public transactions;
    
    // TransactionDetail[] public transactionDetails;

    // // Mapping connecting uuids of Transactions to their TransctionDetail entries
    // mapping(bytes32 => uint[]) transactionToDetails;
    
    // TODO: pass basic info, not transaction details here
    // constructor() public {}

    // function transactionExists(bytes32 _uuid) public view returns (bool) {
    //     return transactions[_uuid].isTransaction;
    // }

    function getTransaction(
        bytes32 _uuid,
        mapping(bytes32 => Transaction) storage transactions,
        TransactionDetail[] storage transactionDetails,
        mapping(bytes32 => uint[]) storage transactionToDetails
    ) public view returns (Transaction memory, TransactionDetail[] memory) {
        // Get the transaction
        Transaction memory transaction = transactions[_uuid];

        // Get the related entries from TransactionDetail
        uint[] memory indexes = transactionToDetails[_uuid];
        TransactionDetail[] memory entries = new TransactionDetail[](indexes.length);
        for (uint i = 0; i < indexes.length; i++) {
            entries[i] = transactionDetails[indexes[i]];
            // TransactionDetail memory entries = transactionDetails[_uuid];
        }

        return (transaction, entries);
    }

    function setTransaction(
        bytes32 _project,
        uint _timestamp,
        bytes32 _transactionUUID,
        // TODO: finish
        bytes32[] memory _accounts,
        int128[] memory _amounts,
        string[] memory _narrations,
        Directions[] memory _directions,
        mapping(bytes32 => Transaction) storage transactions,
        TransactionDetail[] storage transactionDetails,
        mapping(bytes32 => uint[]) storage transactionToDetails
    ) public returns(bool) {
        // Start by creating the Transaction
        transactions[_transactionUUID].project = _project;
        transactions[_transactionUUID].timestamp = _timestamp;
        transactions[_transactionUUID].isTransaction = true;

        // Then create the individual entries and link them
        // to the parent Transaction        
        require(
            (_amounts.length == _accounts.length)
            && (_amounts.length == _directions.length)
            && (_amounts.length == _narrations.length),
            "Missing information in entries"
        );

        for (uint i = 0; i < _amounts.length; i++) {
            TransactionDetail memory entry;
            entry.transaction = _transactionUUID;
            entry.account = _accounts[i];
            entry.amount = _amounts[i];
            entry.narration = _narrations[i];
            entry.direction = _directions[i];
            transactionDetails.push(entry);
            // Add the TransactionDetail to the mapping linking Transaction to
            // TransactionDetail
            transactionToDetails[_transactionUUID].push(transactionDetails.length - 1);
        }

        return true;
    }
}