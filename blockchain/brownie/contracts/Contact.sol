// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
// pragma solidity >=0.4.16 <0.8.5;
pragma experimental ABIEncoderV2;

contract Contacts {
    mapping(bytes32 => mapping(bytes32 => address)) public charityContacts;

    function getContact(bytes32 _charityUUID, bytes32 _contactUUID) public view returns (address) {
        return charityContacts[_charityUUID][_contactUUID];
    }

    // function addCharity(bytes32 _charityUUID) public returns (bool) {
    //     charityContacts[_charityUUID] = true;
    //     return true;
    // }

    function addContact(bytes32 _charityUUID, bytes32 _contactUUID, address _contactAddress) public returns (bool) {
        charityContacts[_charityUUID][_contactUUID] = _contactAddress;
        return true;
    }
}