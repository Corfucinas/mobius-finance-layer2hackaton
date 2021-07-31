// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './ExternalStorage.sol';
import '../interfaces/storages/ISettingStorage.sol';

contract SettingStorage is ExternalStorage, ISettingStorage {
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => uint256))) private _storage;

    constructor(address _manager) ExternalStorage(_manager) {}

    function setUint(
        bytes32 key,
        bytes32 field1,
        bytes32 field2,
        uint256 value
    ) external override onlyManager(managerName) {
        _storage[key][field1][field2] = value;
    }

    function getUint(bytes32 key, bytes32 field1, bytes32 field2) external override view returns (uint256) {
        return _storage[key][field1][field2];
    }
}