// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;
pragma experimental ABIEncoderV2;

import './lib/PreciseMath.sol';
import './base/Importable.sol';
import './base/ExternalStorable.sol';
import './interfaces/ILiquidator.sol';
import './interfaces/storages/ILiquidatorStorage.sol';
import './interfaces/IIssuer.sol';
import './interfaces/ISetting.sol';
import './interfaces/IAssetPrice.sol';
import './interfaces/IStaker.sol';

contract Liquidator is Importable, ExternalStorable, ILiquidator {
    using PreciseMath for uint256;

    constructor(IResolver _resolver) Importable(_resolver) {
        setContractName(CONTRACT_LIQUIDATOR);
        imports = [
            CONTRACT_MOBIUS,
            CONTRACT_ISSUER,
            CONTRACT_SETTING,
            CONTRACT_ASSET_PRICE,
            CONTRACT_STAKER
        ];
    }

    function Storage() internal view returns (ILiquidatorStorage) {
        return ILiquidatorStorage(getStorage());
    }

    function Issuer() private view returns (IIssuer) {
        return IIssuer(requireAddress(CONTRACT_ISSUER));
    }

    function Setting() private view returns (ISetting) {
        return ISetting(requireAddress(CONTRACT_SETTING));
    }

    function AssetPrice() private view returns (IAssetPrice) {
        return IAssetPrice(requireAddress(CONTRACT_ASSET_PRICE));
    }

    function Staker() private view returns (IStaker) {
        return IStaker(requireAddress(CONTRACT_STAKER));
    }

    function canLiquidate(bytes32 stake, address account, bytes32 debtType) public override view returns (bool) {
        require(block.timestamp >= Storage().getDeadline(stake), 'can not liquidate until deadline');
        uint256 currentCollateralRate = Staker().getCollateralRate(stake, account, debtType);
        uint256 liquidationCollateralRate = Setting().getLiquidationRate(stake, debtType);
        return (currentCollateralRate <= liquidationCollateralRate);
    }

    function setDeadline(bytes32 stake, uint256 time) external onlyOwner {
        Storage().setDeadline(stake, time);
    }

    // max debt in synth one can liquidate
    function getLiquidable(bytes32 stake, address account, bytes32 debtType) external override view returns (uint256) {
        if (!canLiquidate(stake, account, debtType)) return 0;

        uint256 debt = Issuer().getDebt(stake, account, debtType);
        uint256 collateralRate = Setting().getCollateralRate(stake, debtType);

        uint256 stakePrice = AssetPrice().getPrice(stake);
        uint256 debtPrice = AssetPrice().getPrice(debtType);

        uint256 currentStakeValue = Staker().getStaked(stake, account, debtType).decimalMultiply(stakePrice).decimalDivide(debtPrice);
        uint256 minStakeValue = debt.decimalMultiply(collateralRate);
        if (currentStakeValue >= minStakeValue) return 0;

        uint256 liquidationFeeRate = Setting().getLiquidationFeeRate(stake);
        uint256 liquidable = (minStakeValue - currentStakeValue).decimalDivide(collateralRate - liquidationFeeRate - PreciseMath.DECIMAL_ONE());
        if (liquidable > debt)
            liquidable = currentStakeValue.decimalDivide(PreciseMath.DECIMAL_ONE() + liquidationFeeRate);

        return liquidable;
    }

    function getUnstakable(bytes32 stake, bytes32 debtType, uint256 amount) external override view returns (uint256,uint256) {
        uint256 stakePrice = AssetPrice().getPrice(stake);
        uint256 debtPrice = AssetPrice().getPrice(debtType);
        uint256 liquidationFeeRate = Setting().getLiquidationFeeRate(stake);

        uint256 amountInStake = amount.decimalMultiply(debtPrice).decimalDivide(stakePrice);
        return (amountInStake.decimalMultiply(PreciseMath.DECIMAL_ONE() + liquidationFeeRate.decimalDivide(5).decimalMultiply(3))
        , amountInStake.decimalMultiply(liquidationFeeRate.decimalDivide(5).decimalMultiply(2)));
    }
}
