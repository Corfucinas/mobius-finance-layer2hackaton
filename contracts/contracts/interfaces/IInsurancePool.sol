// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

interface IInsurancePool {
    enum Phase {Bidding, Trading, Maturity, Expiry}
    struct Times {
        uint biddingEnd;
        uint maturity;
        uint expiry;
    }

    function phase() external view returns (Phase);
    function bid(uint256 amount) external returns (uint256 liquidity);
    function refund(uint256 liquidity) external returns (uint256 refundAmount);
}