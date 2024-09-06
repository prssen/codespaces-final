// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

import "./TransactionLib.sol";

contract Transactions {
    using TransactionLib for *;

    // Mapping from uuid of transaction to transaction data
    mapping(bytes32 => TransactionLib.Transaction) public transactions;

    TransactionLib.TransactionDetail[] public transactionDetails;

    // Mapping connecting uuids of Transactions to their TransctionDetail entries
    mapping(bytes32 => uint[]) public transactionToDetails;

    function transactionExists(bytes32 _uuid) public view returns (bool) {
        return transactions[_uuid].isTransaction;
    }

     function getTransaction(bytes32 _uuid) public view returns (TransactionLib.Transaction memory, TransactionLib.TransactionDetail[] memory) {
        return TransactionLib.getTransaction(_uuid, transactions, transactionDetails, transactionToDetails);
     }

     function setTransaction(
        bytes32 _project,
        uint _timestamp,
        bytes32 _transactionUUID,
        // TODO: finish
        bytes32[] memory _accounts,
        int128[] memory _amounts,
        string[] memory _narrations,
        TransactionLib.Directions[] memory _directions
    ) public returns(bool) {
        return TransactionLib.setTransaction(_project, _timestamp, _transactionUUID, _accounts, _amounts, _narrations, _directions, transactions, transactionDetails, transactionToDetails);
    }

}