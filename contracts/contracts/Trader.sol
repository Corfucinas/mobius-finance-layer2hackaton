// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './base/Importable.sol';
import './base/ExternalStorable.sol';

import './lib/SafeERC20.sol';
import './lib/PreciseMath.sol';
import './interfaces/ITrader.sol';
import './interfaces/storages/ITraderStorage.sol';
import './interfaces/IIssuer.sol';
import './interfaces/ISetting.sol';
import './interfaces/IAssetPrice.sol';
import './interfaces/IERC20.sol';
import './interfaces/IRewardTrading.sol';
import './interfaces/IDynamicTradingFee.sol';

contract Trader is Importable, ExternalStorable, ITrader {
    using SafeERC20 for IERC20;
    using PreciseMath for uint256;

    constructor(IResolver _resolver) Importable(_resolver) {
        setContractName(CONTRACT_TRADER);
        imports = [
            CONTRACT_MOBIUS,
            CONTRACT_ISSUER,
            CONTRACT_SETTING,
            CONTRACT_ASSET_PRICE,
            CONTRACT_MOBIUS_TOKEN,
            CONTRACT_REWARD_TRADING,
            CONTRACT_DYNCMIC_TRADING_FEE,
            TRADING_FEE_ADDRESS
        ];
    }

    function Storage() private view returns (ITraderStorage) {
        return ITraderStorage(getStorage());
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

    function RewardTrading() private view returns (IRewardTrading) {
        return IRewardTrading(requireAddress(CONTRACT_REWARD_TRADING));
    }

    function DynamicTradingFee() private view returns (IDynamicTradingFee) {
        return IDynamicTradingFee(requireAddress(CONTRACT_DYNCMIC_TRADING_FEE));
    }

    function trade(
        address account,
        bytes32 fromSynth,
        uint256 fromAmount,
        bytes32 toSynth
    )
        external
        override
        onlyAddress(CONTRACT_MOBIUS)
        returns (
            uint256 tradingAmount,
            uint256 tradingFee,
            uint256 fromSynthPrice,
            uint256 toSynthPirce
        )
    {
        uint256 fromStatus;
        uint256 toStatus;
        (tradingAmount, tradingFee, fromSynthPrice, toSynthPirce, fromStatus, toStatus) = getTradingAmountAndFee(
            fromSynth,
            fromAmount,
            toSynth
        );

        require(fromStatus == 0, 'Trader: fromSynth is offline');
        require(toStatus == 0, 'Trader: toSynth is offline');

        Issuer().burnSynth(fromSynth, account, fromAmount);
        Issuer().issueSynth(toSynth, account, tradingAmount);
        Issuer().issueSynth(USD, requireAddress(TRADING_FEE_ADDRESS), tradingFee);

        Storage().incrementTradingFee(account, tradingFee);

        uint256 amount = fromAmount.decimalMultiply(fromSynthPrice);
        if (toSynth == USD){
            (uint256 long, uint256 short) = DynamicTradingFee().getPositionInfo(fromSynth);
            if (long > short) {
                amount = amount * 5;
            }
        } else if (fromSynth == USD) {
            (uint256 long, uint256 short) = DynamicTradingFee().getPositionInfo(toSynth);
            if (long < short) {
                amount = amount * 5;
            }
        } 
        RewardTrading().tradeMining(account, requireAsset('Synth',fromSynth), requireAsset('Synth',toSynth), amount);      
    }

    function getTradingAmountAndFee(
        bytes32 fromSynth,
        uint256 fromAmount,
        bytes32 toSynth
    )
        public
        override
        view
        returns (
            uint256 tradingAmount,
            uint256 tradingFee,
            uint256 fromSynthPrice,
            uint256 toSynthPirce,
            uint256 fromStatus,
            uint256 toStatus
        )
    {
        (fromSynthPrice, fromStatus) = AssetPrice().getPriceAndStatus(fromSynth);
        (toSynthPirce, toStatus) = AssetPrice().getPriceAndStatus(toSynth);

        uint256 fromSynthValue = fromAmount.decimalMultiply(fromSynthPrice);

        uint256 tradingFeeRate; 
        if (toSynth == USD) {
            tradingFeeRate = DynamicTradingFee().getDynamicTradingFeeRate(toSynth, fromSynthValue, true);
        } else {
            tradingFeeRate = DynamicTradingFee().getDynamicTradingFeeRate(toSynth, fromSynthValue, false);
        }

        tradingFee = fromSynthValue.decimalMultiply(tradingFeeRate);
        tradingAmount = (fromSynthValue - tradingFee).decimalDivide(toSynthPirce);
    }

    function getTradingFee(address account) external override view returns (uint256) {
        return Storage().getTradingFee(account);
    }
}
