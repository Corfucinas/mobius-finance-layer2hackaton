// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './base/Token.sol';
import './interfaces/ISynth.sol';

contract Synth is Token, ISynth {
    bytes32 private _category;

    constructor(
        address __issuer,
        string memory __name,
        string memory __symbol,
        bytes32 __contractName,
        bytes32 __category
    ) Token(__name,__symbol,__contractName){
        setManager(__issuer);
        _category = __category;
    }

    function category() external override view returns (bytes32) {
        return _category;
    }

    function mint(address account, uint256 amount)
        external
        override
        onlyManager(CONTRACT_ISSUER)
        returns (bool)
    {
        _mint(account, amount);
        return true;
    }

    function burn(address account, uint256 amount)
        external
        override
        onlyManager(CONTRACT_ISSUER)
        returns (bool)
    {
        _burn(account, amount);
        return true;
    }
}
