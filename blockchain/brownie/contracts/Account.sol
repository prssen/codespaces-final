// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;

import "./lib.sol";

contract Accounts {
    using Common for *;

    struct Account {
        string accountName;
        // Indicate whether this is a debit (expense/asset)
        // or credit (income/liability) account
        Common.Directions normal;
        uint32 balance;
        // UUID
        bytes32 parentAccount;
        Common.AccountTypes accountType;
        // Persons responsible for an account
        address[] owners;
        bool isActive;
    }

    // Maps UUID of account to the struct containing
    // account details
    mapping(bytes32 => Account) public AccountList;

    // Mapping of accounts (bytes32 UIUDs) to the
    // owners that are responsible for themm (addresses)
    mapping(bytes32 => mapping(address => bool)) public AccountOwners;

    constructor() {

    }

    function getAccount(bytes32 _uuid) public view returns(Account memory account) {
        return AccountList[_uuid];
    }

    function setAccount(
        bytes32 uuid,
        string memory _accountName,
        Common.Directions _normal,
        uint32 _balance,
        bytes32 _parentAccount,
        Common.AccountTypes _accountType,
        address[] memory _owners,
        bool _isActive
    ) public returns(bool isSuccess) {
        AccountList[uuid].accountName = _accountName;
        AccountList[uuid].normal = _normal;
        AccountList[uuid].balance = _balance;
        AccountList[uuid].parentAccount = _parentAccount;
        AccountList[uuid].accountType = _accountType;
        AccountList[uuid].parentAccount = _parentAccount;
        AccountList[uuid].accountType = _accountType;
        AccountList[uuid].isActive = _isActive;
        // Append the owners to the list of owners (using a mapping of
        // address => bool lets us update the list without overwriting everything
        // later)
        for (uint i = 0; i < _owners.length; i++) {
            address newOwner = _owners[i];
            AccountOwners[uuid][newOwner] = true;
        }
        // TODO: test this works
        return true;
    }

    // // TODO: updateAccount, inactivateAccount
    // // TODO: on front end, function has to pass IGNORE for any fields that aren't updated
    // function updateAccount(
    //     bytes32 uuid,
    //     string memory _accountName,
    //     Common.Directions _normal,
    //     uint32 _balance,
    //     bytes32 _parentAccount,
    //     Common.AccountTypes _accountType,
    //     bool _isActive
    // ) public returns (bool isSuccess) {
    //     AccountList[uuid].accountNamem = _accountName == IGNORE ? : e
    // }

    function inactivateAccount(
        bytes32 uuid
    ) public returns (bool isSuccess) {
        AccountList[uuid].isActive = false;
        return true;
    }
    
}