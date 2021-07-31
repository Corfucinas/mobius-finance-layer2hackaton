// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import '../base/Ownable.sol';
import '../interfaces/IERC20.sol';

contract Airdrop is Ownable{
    constructor() {
    }

    function AirTransfer(address[] memory _recipients, uint _values, address _tokenAddress) onlyOwner public returns (bool) {
        require(_recipients.length > 0);

        IERC20 token = IERC20(_tokenAddress);

        for(uint j = 0; j < _recipients.length; j++){
            token.transfer(_recipients[j], _values);
        }

        return true;
    }
}
