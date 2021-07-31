// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import './base/Token.sol';
import './base/Importable.sol';
import './lib/PreciseMath.sol';
import './lib/SafeERC20.sol';
import './interfaces/IResolver.sol';
import './interfaces/IERC20.sol';
import './interfaces/IInsurancePool.sol';

contract InsurancePool is Token, Importable, IInsurancePool {
    using SafeERC20 for IERC20;
    using PreciseMath for uint256;

    /* ========== STATE VARIABLES ========== */
    Times public times;
    address public moUSD;
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    
    /* ========== CONSTRUCTOR ========== */
    constructor(
        IResolver _resolver,
        uint[3] memory _times // [biddingEnd, maturity, expiry]
    ) Importable(_resolver) Token('InsurancePool','LP','InsurancePool') {
        imports = [
            CONTRACT_ISSUER
        ];
        times = Times(_times[0], _times[1], _times[2]);
    }

    /* ========== VIEWS ========== */



    /* ---------- External Contracts ---------- */


    /* ---------- Phases ---------- */

    function _biddingEnded() internal view returns (bool) {
        return times.biddingEnd < block.timestamp;
    }

    function _matured() internal view returns (bool) {
        return times.maturity < block.timestamp;
    }

    function _expired() internal view returns (bool) {
        return times.expiry < block.timestamp && IERC20(moUSD).balanceOf(address(this)) == 0;
    }

    function phase() external override view returns (Phase) {
        if (!_biddingEnded()) {
            return Phase.Bidding;
        }
        if (!_matured()) {
            return Phase.Trading;
        }
        if (!_expired()) {
            return Phase.Maturity;
        }
        return Phase.Expiry;
    }


    /* ========== MUTATIVE FUNCTIONS ========== */

    /* ---------- Bidding and Refunding ---------- */

    function bid(uint256 amount) external override duringBidding returns (uint256 liquidity) {
        if (amount == 0) {
            return 0;
        }
        IERC20 token = IERC20(moUSD);
        uint256 reserve = token.balanceOf(address(this));
        token.safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = amount - MINIMUM_LIQUIDITY;
           _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = amount * _totalSupply / reserve;
        }
        require(liquidity > 0, 'MobiusV2: INSUFFICIENT_LIQUIDITY_MINTED');

        _mint(msg.sender, liquidity);
        emit Bid(msg.sender,amount,liquidity);
    }

    function refund(uint256 liquidity) external override returns (uint256 refundAmount) {
        require(liquidity <= balanceOf(msg.sender) && liquidity != 0, "liquidity not enough");
        IERC20 token = IERC20(moUSD);
        uint256 reserve = token.balanceOf(address(this));
        uint256 _totalSupply = totalSupply();
        refundAmount = liquidity * reserve / _totalSupply; 
        _burn(msg.sender, liquidity);
        token.safeTransfer(msg.sender, refundAmount);
        emit Refund(msg.sender,refundAmount,liquidity);
    }

    /* ---------- Market Expiry ---------- */

    function _selfDestruct(address payable beneficiary) internal {
        IERC20 token = IERC20(moUSD);
        uint balance = token.balanceOf(address(this));
        if (balance != 0) {
            token.safeTransfer(beneficiary, balance);
        }
        selfdestruct(beneficiary);
    }

    function expire(address payable beneficiary) external onlyOwner {
        require(_expired(), "Unexpired options remaining");
        _selfDestruct(beneficiary);
    }

    /* ========== MODIFIERS ========== */

    modifier duringBidding() {
        require(!_biddingEnded(), "Bidding inactive");
        _;
    }

    modifier afterBidding() {
        require(_biddingEnded(), "Bidding incomplete");
        _;
    }

    modifier afterMaturity() {
        require(_matured(), "Not yet mature");
        _;
    }


    /* ========== EVENTS ========== */
    event Bid(address indexed account, uint256 amount, uint256 liquidity);
    event Refund(address indexed account, uint256 amount, uint256 liquidity);
}