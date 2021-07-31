// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './IERC20.sol';

interface IMobiusToken is IERC20 {
    function mint(address account, uint256 amount) external returns (bool);
    function migrate(address from, address to) external returns (bool);
}
