// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

library StorageLib {
    struct Info {
        uint myNum;
        string myName;
    }

    struct NestedInfo {
        uint id;
        Info info;
        uint[] addresses;
    }

}

contract Storage {

    uint256 number;
    StorageLib.NestedInfo[] public infos;

    function addInfo(StorageLib.NestedInfo memory _info) public returns (bool) {
        StorageLib.Info memory innerInfo = StorageLib.Info({
            myNum: _info.info.myNum,
            myName: _info.info.myName
        });
        
        StorageLib.NestedInfo memory newInfo = StorageLib.NestedInfo({
            id: _info.id,
            info: innerInfo,
            addresses: _info.addresses
        });
        
        infos.push(newInfo);

        return true;
    }

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
        number = num;
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return number;
    }
}