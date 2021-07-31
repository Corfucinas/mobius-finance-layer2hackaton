// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './ExternalStorage.sol';
import '../interfaces/storages/ITokenStorage.sol';

contract TokenStorage is ExternalStorage, ITokenStorage {
    mapping(bytes32 => mapping(address => uint256)) private _storage;
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor(address _manager) ExternalStorage(_manager) {}

    function setAllowance(
        address key,
        address field,
        uint256 value
    ) external override onlyManager(managerName) {
        _allowances[key][field] = value;
    }

    function getAllowance(address key, address field) external override view returns (uint256) {
        return _allowances[key][field];
    }

    function incrementUint(
        bytes32 key,
        address field,
        uint256 value
    ) external override onlyManager(managerName) returns (uint256) {
        _storage[key][field] = _storage[key][field] + value;
        return _storage[key][field];
    }

    function decrementUint(
        bytes32 key,
        address field,
        uint256 value
    ) external override onlyManager(managerName) returns (uint256) {
        _storage[key][field] = _storage[key][field] - value;
        return _storage[key][field];
    }

    function setUint(
        bytes32 key,
        address field,
        uint256 value
    ) external override onlyManager(managerName) {
        _storage[key][field] = value;
    }

    function getUint(bytes32 key, address field) external override view returns (uint256) {
        return _storage[key][field];
    }
}
