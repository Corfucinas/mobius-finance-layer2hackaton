// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './ExternalStorage.sol';
import '../interfaces/storages/IStakerStorage.sol';

contract StakerStorage is ExternalStorage, IStakerStorage {
    mapping(bytes32 => mapping(address => Collateral)) private _storage;

    constructor(address _manager) ExternalStorage(_manager) {}

    function incrementStaked(
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amount
    ) external override onlyManager(managerName) returns (uint256) {
        _storage[stake][account].Collateral[debtType] = _storage[stake][account].Collateral[debtType] + amount;
        return _storage[stake][account].Collateral[debtType];
    }

    function decrementStaked(
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amount
    ) external override onlyManager(managerName) returns (uint256) {
        _storage[stake][account].Collateral[debtType] = _storage[stake][account].Collateral[debtType] - amount;
        return _storage[stake][account].Collateral[debtType];
    }

    function getStaked(bytes32 stake, address account, bytes32 debtType) external override view returns (uint256) {
        return _storage[stake][account].Collateral[debtType];
    }
}
