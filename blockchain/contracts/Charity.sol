// SPDX-License-Identifier: MIT 
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

import "./Account.sol";
import "./lib.sol";
import "./Project.sol";
import "./SourceDocument.sol";

contract Charity is Accounts, Projects, SourceDocuments {
    enum CharityTypes { CIO, COMP, UNC, TR, OTH }
    
    // Identifying information about charitys
    string public name;
    bytes32 public registrationNumber;
    CharityTypes public charityType;
    address[] private owners;

    constructor(
        string memory _name,
        bytes32 _regNumber,
        CharityTypes _charityType,
        address[] memory _owners,
        address transactionContractAddress
    ) SourceDocuments(transactionContractAddress) {
        name = _name;
        registrationNumber = _regNumber;
        charityType = _charityType;
        owners = _owners;
        // Add the caller to the list of charity 'owners'
        // so that they can automatically access the charity
        // contract's functions
        owners.push(msg.sender);
    }

    // Only execute function if caller's address
    // is in the 'owners' array
    modifier onlyOwners() {
        bool isOwner = false;
        for (uint i = 0; i < owners.length; i++) {
            if (msg.sender == owners[i]) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Must be owner to call function");
        _;
    }

    // function addOwner(address _newOwner) returns (bool) {
    //     owners.push(_newOwner);
    //     return true;
    // }

    // function removeOwner(address _oldOwner) returns (bool) {
    //     // Adapted from https://blog.solidityscan.com/improper-array-deletion-82672eed8e8d
    //     for (uint i = _index; i < owners.length; i++) {
    //         if (owners[i] == _oldOwner) {
    //             owners[i] = owners[owners.length - 1];
    //             break;
    //         }
    //     }
    //     owners.pop();
    // }

    // function updateOwner(address _owner, _newOwnerAddress) returns (bool) {
    // }

    // All other methods and attributes are inherited from parent
    // classes

    function setExpense(
        SourceDocumentLib.ExpenseInputs memory inputs
    ) public override onlyOwners returns (bool) {
        return super.setExpense(inputs);
    }

}