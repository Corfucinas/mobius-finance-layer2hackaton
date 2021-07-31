// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './ExternalStorage.sol';
import '../interfaces/storages/ITraderStorage.sol';

contract TraderStorage is ExternalStorage, ITraderStorage {
    mapping(address =>  uint256) private _storage;

    constructor(address _manager) ExternalStorage(_manager) {}

    function incrementTradingFee(
        address account,
        uint256 amount
    ) external override onlyManager(managerName) returns (uint256) {
        _storage[account] = _storage[account] + amount;
        _storage[address(0)] = _storage[address(0)] + amount;
        return _storage[account];
    }

    function getTradingFee(address account) external override view returns (uint256) {
        return _storage[account];
    }
}
