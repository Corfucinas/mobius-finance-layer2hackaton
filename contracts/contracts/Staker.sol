// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './base/Importable.sol';
import './base/ExternalStorable.sol';
import './interfaces/IStaker.sol';
import './interfaces/storages/IStakerStorage.sol';
import './interfaces/IIssuer.sol';
import './interfaces/ISetting.sol';
import './interfaces/IAssetPrice.sol';
import './interfaces/ITrader.sol';
import './interfaces/IRewardCollateral.sol';

import './lib/PreciseMath.sol';

contract Staker is Importable, ExternalStorable, IStaker {
    using PreciseMath for uint256;
    
    constructor(IResolver _resolver) Importable(_resolver) {
        setContractName(CONTRACT_STAKER);
        imports = [
            CONTRACT_MOBIUS,
            CONTRACT_ISSUER,
            CONTRACT_SETTING,
            CONTRACT_ASSET_PRICE,
            CONTRACT_TRADER,
            CONTRACT_REWARD_COLLATERAL
        ];
    }

    function Storage() private view returns (IStakerStorage) {
        return IStakerStorage(getStorage());
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

    function Trader() private view returns (ITrader) {
        return ITrader(requireAddress(CONTRACT_TRADER));
    }

    function RewardCollateral() private view returns (IRewardCollateral) {
        return IRewardCollateral(requireAddress(CONTRACT_REWARD_COLLATERAL));
    }

    function stake(
        bytes32 token,
        address account,
        bytes32 debtType,
        uint256 amount
    ) external override onlyAddress(CONTRACT_MOBIUS) {
        Storage().incrementStaked(token, account, debtType, amount);
        RewardCollateral().deposit(token, account, amount);
    }

    function unstake(
        bytes32 token,
        address account,
        bytes32 debtType,
        uint256 amount
    ) external override onlyAddress(CONTRACT_MOBIUS) {
        Storage().decrementStaked(token, account, debtType, amount);
        RewardCollateral().unDeposit(token, account, amount);
    }

    function getStaked(bytes32 token, address account, bytes32 debtType) public override view returns (uint256) {
        uint256 staked = Storage().getStaked(token, account, debtType);
        return staked;
    }

    // how much can i withdraw if i want my collateral rate to be `collateralRate`
    function getClaimable(bytes32 token, address account, bytes32 debtType, uint256 collateralRate) external override view returns (uint256) {
        // This part of the code is not open source
    }

    function getCollateralRate(bytes32 token, address account, bytes32 debtType) external override view returns (uint256) {
        uint256 debt = Issuer().getDebt(token, account, debtType);
        uint256 staked = getStaked(token, account, debtType);

        uint256 price = AssetPrice().getPrice(token);
        uint256 debtPrice = AssetPrice().getPrice(debtType);
        
        return staked.decimalMultiply(price).decimalDivide(debt).decimalDivide(debtPrice);
    }
}
