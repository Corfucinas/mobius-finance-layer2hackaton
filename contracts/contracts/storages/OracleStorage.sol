// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './ExternalStorage.sol';
import '../interfaces/storages/IOracleStorage.sol';

contract OracleStorage is ExternalStorage, IOracleStorage {
    mapping(bytes32 => uint256) private _round;
    mapping(bytes32 => mapping(uint256 => Price)) private _storage;

    constructor(address _manager) ExternalStorage(_manager) {}

    function setRound(bytes32 asset, uint256 round) external override onlyManager(managerName) {
        _round[asset] = round;
    }

    function getRound(bytes32 asset) external override view returns (uint256) {
        return _round[asset];
    }

    function setPrice(bytes32 asset, uint256 price) external override onlyManager(managerName) {
        _round[asset] = _round[asset] + 1;
        _storage[asset][_round[asset]] = Price(price, block.timestamp);
    }

    function getPrice(bytes32 asset, uint256 round) external override view returns (uint256 price, uint256 time) {
        Price memory p = _storage[asset][round];
        return (p.price, p.time);
    }
}
