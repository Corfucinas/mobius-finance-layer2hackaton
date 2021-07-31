// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './base/Importable.sol';
import './interfaces/IStaker.sol';
import './interfaces/IAssetPrice.sol';
import './lib/PreciseMath.sol';

contract Stats is Importable { 
    using PreciseMath for uint256;

    constructor(IResolver resolver) Importable(resolver) {
        setContractName('Stats');
        imports = [
            CONTRACT_STAKER,
            CONTRACT_ASSET_PRICE
        ];
    }

    function Staker() private view returns (IStaker) {
        return IStaker(requireAddress(CONTRACT_STAKER));
    }

    function AssetPrice() private view returns (IAssetPrice) {
        return IAssetPrice(requireAddress(CONTRACT_ASSET_PRICE));
    }

    function getTotalStakedValue(bytes32[] memory stakes, bytes32[] memory debtTypes, address account) external view returns (uint256){
        if (stakes.length == 0) {
            stakes = resolver.getAssets('Stake');
        }

        if (debtTypes.length == 0) {
            debtTypes = resolver.getAssets('Synth');
        }

        uint256 staked;

        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 price = AssetPrice().getPrice(stakes[i]);
            for (uint256 j = 0; j < debtTypes.length; j++) {
                uint256 tmp = Staker().getStaked(stakes[i], account, debtTypes[j]);
                staked += tmp.decimalMultiply(price);
            }
        }
        return staked;
    }
}