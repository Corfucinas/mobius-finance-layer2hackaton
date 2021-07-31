// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

interface IMobius {
    function nativeCoin() external view returns (bytes32);

    function stakeFromCoin(bytes32 debtType) external payable returns (bool);
    function stakeFromToken(bytes32 stake, bytes32 debtType, uint256 amount) external returns (bool);

    function mintFromCoin(uint256 collateralRate) external payable returns (bool);
    function mintFromToken(bytes32 stake, uint256 amount, uint256 collateralRate) external returns (bool);
    function mintFromPreviousStake(bytes32 stake, uint256 amount) external returns (bool);

    function shortFromCoin(bytes32 debtType, uint256 collateralRate) external payable returns (bool);
    function shortFromToken(bytes32 stake, uint256 amount, bytes32 debtType, uint256 collateralRate) external returns (bool);
    function shortFromPreviousStake(bytes32 stake, bytes32 debtType, uint256 amount) external returns (bool);

    function burn(bytes32 stake, bytes32 debtType, uint256 amount, bool withdraw) external returns (bool);

    function claim(
        bytes32 stake,
        bytes32 debtType,
        uint256 amount
    ) external returns (bool);

    function trade(
        bytes32 fromSynth,
        uint256 fromAmount,
        bytes32 toSynth
    ) external returns (bool);

    function liquidate(
        bytes32 stake,
        address account,
        bytes32 debtType,
        uint256 amount
    ) external returns (bool);

    event Staked(address indexed account, bytes32 indexed stake, bytes32 indexed debtType, uint256 stakeAmount);
    event Minted(
        address indexed account,
        bytes32 indexed stake,
        uint256 stakeAmount,
        uint256 issuerAmount
    );
    event Shorted(address indexed, bytes32 indexed stake, bytes32 indexed synth, uint256 stakeAmount, uint256 debtAmount);
    event Burned(address indexed account, bytes32 indexed stake, bytes32 indexed debtType, uint256 amount);
    event Claimed(address indexed account, bytes32 indexed stake, address indexed recipient, bytes32 debtType, uint256 amount);
    event Traded(
        address indexed account,
        bytes32 indexed fromSynth,
        bytes32 indexed toSynth,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 tradingFee,
        uint256 fromSynthPrice,
        uint256 toSynthPirce
    );
    event Liquidated(
        address indexed liquidator,
        bytes32 indexed stake,
        address indexed account,
        bytes32 debtType,
        uint256 stakeAmount,
        uint256 burnAmount
    );
}
