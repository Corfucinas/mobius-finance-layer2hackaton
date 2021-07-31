// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './ExternalStorage.sol';
import '../interfaces/storages/IIssuerStorage.sol';

contract IssuerStorage is ExternalStorage, IIssuerStorage {  
    mapping(bytes32 => mapping(address => Debt)) private _storage;
    Debt private _total;

    constructor(address _manager) ExternalStorage(_manager) {}

    function setDebt(
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amount,
        uint256 originalAmount,
        uint256 time
    ) external override onlyManager(managerName) {
        _storage[stake][account].Debt[debtType] = amount;
        _storage[stake][account].OriginalDebt[debtType] = originalAmount;
        _storage[stake][account].Time = time;
    }

    function getDebt(
        bytes32 stake,
        address account,
        bytes32 debtType
    ) external override view returns (uint256 amount, uint256 originalAmount, uint256 time)
    {
        Debt storage debtInfo = _storage[stake][account];
        return (debtInfo.Debt[debtType], debtInfo.OriginalDebt[debtType], debtInfo.Time);
    }

    function setTotal(bytes32 debtType, uint256 debt, uint256 originalDebt, uint256 time) external override onlyManager(managerName) {
        _total.Debt[debtType] = debt;
        _total.OriginalDebt[debtType] = originalDebt;
        _total.Time = time;
    }

    function getTotal(bytes32 debtType) external override view returns (uint256, uint256, uint256) {
        return (_total.Debt[debtType], _total.OriginalDebt[debtType], _total.Time);
    }
}
