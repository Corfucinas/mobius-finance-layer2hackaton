// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './lib/Address.sol';
import './lib/PreciseMath.sol';
import './base/Importable.sol';
import './base/ExternalStorable.sol';
import './interfaces/IIssuer.sol';
import './interfaces/IStaker.sol';
import './interfaces/storages/IIssuerStorage.sol';
import './interfaces/IAssetPrice.sol';
import './interfaces/ISetting.sol';
import './interfaces/ISynth.sol';
import './interfaces/IERC20.sol';
import './interfaces/IRewardTrading.sol';
import './interfaces/IDynamicTradingFee.sol';
import './interfaces/IInsurancePool.sol';

contract Issuer is Importable, ExternalStorable, IIssuer {
    bytes32 private constant SYNTH = 'Synth';

    using Address for address;
    using PreciseMath for uint256;

    bytes32[] private ISSUEABLE_CONTRACTS = [CONTRACT_TRADER, CONTRACT_STAKER];

    constructor(IResolver _resolver) Importable(_resolver) {
        setContractName(CONTRACT_ISSUER);
        imports = [
            CONTRACT_MOBIUS,
            CONTRACT_ASSET_PRICE,
            CONTRACT_SETTING,
            CONTRACT_TRADER,
            CONTRACT_STAKER,
            CONTRACT_REWARD_TRADING,
            CONTRACT_DYNCMIC_TRADING_FEE,
            TRADING_FEE_ADDRESS,
            CONTRACT_INSURANCE_POOL
        ];
    }

    function Setting() private view returns (ISetting) {
        return ISetting(requireAddress(CONTRACT_SETTING));
    }

    function AssetPrice() private view returns (IAssetPrice) {
        return IAssetPrice(requireAddress(CONTRACT_ASSET_PRICE));
    }

    function Synth(bytes32 synth) private view returns (ISynth) {
        return ISynth(requireAsset('Synth', synth));
    }

    function Storage() internal view returns (IIssuerStorage) {
        return IIssuerStorage(getStorage());
    }

    function Staker() private view returns (IStaker) {
        return IStaker(requireAddress(CONTRACT_STAKER));
    }

    function RewardTrading() private view returns (IRewardTrading) {
        return IRewardTrading(requireAddress(CONTRACT_REWARD_TRADING));
    }

    function DynamicTradingFee() private view returns (IDynamicTradingFee) {
        return IDynamicTradingFee(requireAddress(CONTRACT_DYNCMIC_TRADING_FEE));
    }

    function InsurancePool() private view returns (IInsurancePool) {
        return IInsurancePool(requireAddress(CONTRACT_INSURANCE_POOL));
    }

    function issueDebt(
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amountInUSD,
        uint256 amountInSynth
    ) external override onlyAddress(CONTRACT_MOBIUS) {
        
        _issueDebt(stake, account, debtType, amountInUSD, amountInSynth);

        if (debtType != USD) {
            (uint256 long, uint256 short) = DynamicTradingFee().getPositionInfo(debtType);
            if (long > short) {
                RewardTrading().tradeMining(account, requireAsset('Synth',USD), requireAsset('Synth',debtType), amountInUSD * 5);
            } else {
                RewardTrading().tradeMining(account, requireAsset('Synth',USD), requireAsset('Synth',debtType), amountInUSD);
            }    
        }
    }

    function _issueDebt(bytes32 stake,address account, bytes32 debtType, uint256 amountInUSD, uint256 amountInSynth) internal {
        // This part of the code is not open source
    }

    function issueDebtWithPreviousStake(bytes32 stake, address account, bytes32 debtType, uint256 amountInSynth) external override onlyAddress(CONTRACT_MOBIUS) {
        require(amountInSynth <= getIssuable(stake, account, debtType),"issueDebtWithPreviousStake: can not issue that much");
        uint256 debtPrice = AssetPrice().getPrice(debtType);
        _issueDebt(stake, account, debtType, amountInSynth.decimalMultiply(debtPrice), amountInSynth);
    }

    function getIssuable(bytes32 stake, address account, bytes32 debtType) public override view returns (uint256) {
        uint256 staked = Staker().getStaked(stake, account, debtType);
        uint256 stakedPrice = AssetPrice().getPrice(stake);
        uint256 debtPrice = AssetPrice().getPrice(debtType);

        uint256 safeCollateralRate = Setting().getCollateralRate(stake, debtType);
        uint256 maxDebt = (staked * stakedPrice / safeCollateralRate).decimalDivide(debtPrice);

        (uint256 accountDebtWithDynamic, , , ) = _getDebt(stake, account, debtType);

        if (accountDebtWithDynamic >= maxDebt) {
            return 0;
        }
        return maxDebt - accountDebtWithDynamic;
    }

    function burnDebt(
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amount,
        address payer
    ) external override onlyAddress(CONTRACT_MOBIUS) returns (uint256) {
        (uint256 burnedAmount,uint256 burnedDebt,uint256 burnedOriginalDebt) = _burnDebtForUser(stake,account,debtType,amount);
        _burnDebtTotal(debtType,burnedDebt,burnedOriginalDebt);
        Synth(debtType).burn(payer, burnedAmount);

        // insurance pool pay dynamic debt cost back in moUSD
        return burnedDebt;
    }

    function _burnDebtForUser(        
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amount
        ) internal returns(uint256 burnedAmount,uint256 burnedDebt,uint256 burnedOriginalDebt) {
            // This part of the code is not open source
    }

    function _burnDebtTotal(bytes32 debtType, uint256 burnedAmount, uint256 burnedOriginalDebt) internal {
        (uint256 usersTotalDebt,uint256 usersTotalDebtOriginal,) = Storage().getTotal(debtType);
        Storage().setTotal(debtType, usersTotalDebt - burnedAmount, usersTotalDebtOriginal - burnedOriginalDebt, block.timestamp);
    }

    function issueSynth(
        bytes32 synth,
        address account,
        uint256 amount
    ) external override containAddress(ISSUEABLE_CONTRACTS) {
        Synth(synth).mint(account, amount);
    }

    function burnSynth(
        bytes32 synth,
        address account,
        uint256 amount
    ) external override containAddress(ISSUEABLE_CONTRACTS) {
        Synth(synth).burn(account, amount);
    }

    function getDebt(bytes32 stake, address account, bytes32 debtType) external override view returns (uint256) {
        (uint256 accountDebtWithDynamic, , , ) = _getDebt(stake, account, debtType);
        return accountDebtWithDynamic;
    }

    function getDebtOriginal(bytes32 stake, address account, bytes32 debtType) external override view returns (uint256 debt, uint256 originalDebt, uint256 time) {
        (debt, originalDebt, time) = Storage().getDebt(stake, account, debtType);
    }

    function _getDebt(
        bytes32 stake,
        address account,
        bytes32 debtType
    ) private view returns (uint256, uint256, uint256, uint256) {
        //we should calc dynamic debt here.
        // This part of the code is not open source
    }

    function _canBurn(uint256 time) private view returns (bool) {
        return block.timestamp >= time + (Setting().getMinStakeTime());
    }

    function getDynamicTotalDebt() public override view returns (uint256 platTotalDebt, uint256 usersTotalDebt, uint256 usersTotalDebtOriginal) {
        bytes32[] memory synths = assets(SYNTH);
        uint256[] memory prices = AssetPrice().getPrices(synths);

        for (uint256 i = 0; i < synths.length; i++) {
            (uint256 debt,uint256 debtOriginal ,) = Storage().getTotal(synths[i]);

            usersTotalDebtOriginal = usersTotalDebtOriginal + debtOriginal;
            usersTotalDebt = usersTotalDebt + debt.decimalMultiply(prices[i]);

            address synth = requireAsset(SYNTH, synths[i]);
            platTotalDebt = platTotalDebt + (IERC20(synth).totalSupply().decimalMultiply(prices[i]));
        }
    }

    function getUsersTotalDebtInSynth(bytes32 synth) external override view returns (uint256) {
        (uint256 debt, ,) = Storage().getTotal(synth);    
        return debt;
    }
}
