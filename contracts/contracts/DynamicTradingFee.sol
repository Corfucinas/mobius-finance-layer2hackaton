// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './lib/Address.sol';
import './lib/PreciseMath.sol';
import './base/Importable.sol';
import './interfaces/ISetting.sol';
import './interfaces/IAssetPrice.sol';
import './interfaces/IERC20.sol';
import './interfaces/IIssuer.sol';
import './interfaces/IDynamicTradingFee.sol';

contract DynamicTradingFee is Importable,IDynamicTradingFee {
    bytes32 private constant SYNTH = 'Synth';
    using Address for address;
    using PreciseMath for uint256;

    constructor(IResolver _resolver) Importable(_resolver) {
        setContractName(CONTRACT_DYNCMIC_TRADING_FEE);
        imports = [
            CONTRACT_SETTING,
            CONTRACT_ASSET_PRICE,
            CONTRACT_ISSUER
        ];
    }

    function AssetPrice() private view returns (IAssetPrice) {
        return IAssetPrice(requireAddress(CONTRACT_ASSET_PRICE));
    }

    function Setting() private view returns (ISetting) {
        return ISetting(requireAddress(CONTRACT_SETTING));
    }

    function Issuer() private view returns (IIssuer) {
        return IIssuer(requireAddress(CONTRACT_ISSUER));
    }

    bool dynamicFee = false;

    function switchDynamicFee() external onlyOwner{
        dynamicFee = !dynamicFee;
    }

    // assume that long position is a, short position is b, moUSD position is c, 
    // then net long position percentage K is |a-b|/（a+b+c）, fee rate  x = N + M * K (N is basic fee rate,M is max fee rate offset)
    // considering that newDebt position(h) affects fee rate  then k1 = (|a-b|+h）/（a+b+c）, x=（N + M * K）*（1+K1-K）
    // we split the function to prevent deep stack.
    function getDynamicTradingFeeRate(bytes32 synth, uint256 amountInUSD, bool isShort) external override view returns (uint256) {
        uint256 N = Setting().getTradingFeeRate(synth); 
        if (!dynamicFee) {
            return N;
        }

        uint256 M = Setting().getMaxTradingFeeOffsetRate(); 
        (uint256 K,uint256 K1) = _getV(synth, amountInUSD, isShort);

        return N + ((M.decimalMultiply(K)).decimalMultiply(PreciseMath.DECIMAL_ONE() + K1 - K)).min(M);
    }

    function getPositionInfo(bytes32 synth) external override view returns(uint256 long, uint256 short) {
        return _getPositionInfo(synth);
    }

    function _getV(bytes32 synth, uint256 amountInUSD ,bool isShort) internal view returns (uint256 k, uint256 k1) {
        (uint256 a, uint256 b) = _getPositionInfo(synth);
        if ((isShort && b <= a) || (!isShort && a <= b)) {
            return (0, 0);
        }

        uint256 c = IERC20(requireAsset(SYNTH, USD)).totalSupply();
        uint256 h = amountInUSD;
        
        uint256 t = a + b + c;
        k = (a.max(b) - a.min(b)).decimalDivide(t);
        k1 = (a.max(b) - a.min(b) + h).decimalDivide(t);
    }

    function _getPositionInfo(bytes32 synth) internal view returns (uint256 a, uint256 b) {
        uint256 price = AssetPrice().getPrice(synth);
        a = IERC20(requireAsset(SYNTH, synth)).totalSupply().decimalMultiply(price);
        uint256 short = Issuer().getUsersTotalDebtInSynth(synth);
        b = short.decimalMultiply(price);

        return (a,b);
    }
}