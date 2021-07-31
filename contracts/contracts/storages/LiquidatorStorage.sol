// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;
pragma experimental ABIEncoderV2;

import './ExternalStorage.sol';
import '../interfaces/storages/ILiquidatorStorage.sol';

contract LiquidatorStorage is ExternalStorage, ILiquidatorStorage {
    mapping(bytes32 => uint256) deadline;

    constructor(address _manager) ExternalStorage(_manager) {}

    function setDeadline(bytes32 stake, uint256 time) external override onlyManager(managerName) {
        deadline[stake] = time;
    }

    function getDeadline(bytes32 stake) external override view returns (uint256) {
        return deadline[stake];
    }
}
