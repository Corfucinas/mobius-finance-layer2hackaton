// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './base/Token.sol';
import './base/Importable.sol';
import './interfaces/IMobiusToken.sol';
import './interfaces/IIssuer.sol';
import './interfaces/IResolver.sol';

contract MobiusToken is Importable, Token, IMobiusToken {
    bytes32[] private MINTABLE_CONTRACTS = [CONTRACT_REWARD_COLLATERAL, CONTRACT_REWARD_STAKING,CONTRACT_REWARD_TRADING];
    uint256 public MAX_SUPPLY = 1e8;
    uint256 public AIRDROP_LIMIT = 55000000 * (10 ** uint256(decimals()));
    modifier onlyResolver() {
        require(msg.sender == address(resolver), 'MobiusToken: caller is not the Resolver');
        _;
    }

    constructor(IResolver _resolver) Importable(_resolver) Token('Mobius Token','MOT',CONTRACT_MOBIUS_TOKEN) {
        imports = [
            CONTRACT_REWARD_COLLATERAL,
            CONTRACT_REWARD_STAKING,
            CONTRACT_REWARD_TRADING
        ];
    }

    function mint(address account, uint256 amount) external override containAddress(MINTABLE_CONTRACTS) returns (bool) {
        require(totalSupply() + amount <= MAX_SUPPLY * (10 ** uint256(decimals())),'can not mint more');
        _mint(account, amount);
        return true;
    }

    function migrate(address from, address to) external override onlyResolver returns (bool) {
        uint256 amount = balanceOf(from);
        if (amount == 0) return true;
        _transfer(from, to, amount);
        return true;
    }
    
    function airdrop(address to,uint256 amount) external onlyOwner returns (bool) {
        require(AIRDROP_LIMIT  >= amount, 'can not airdrop more');
        AIRDROP_LIMIT = AIRDROP_LIMIT - amount;
        _mint(to, amount);
        return true;
    }
}
