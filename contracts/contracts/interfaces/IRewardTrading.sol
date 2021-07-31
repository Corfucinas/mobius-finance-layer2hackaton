// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

interface IRewardTrading {
    struct UserInfo {
        uint256 quantity;       // How many Trade the user has provided
        uint256 blockNumber;    // Last transaction block
    }

    struct PoolInfo {
        address pair;           // Trading pairs that can be mined
        uint256 quantity;       // Current amount of LPs
        uint256 totalQuantity;  // All quantity
        uint256 allocPoint;     // How many allocation points assigned to this pool
        uint256 allocMOTAmount; // How many MOTs
        uint256 lastRewardBlock;// Last transaction block
    }

    function addPair(uint256 _allocPoint, address _pair, bool _withUpdate) external;
    function setPair(uint256 _pid, uint256 _allocPoint, bool _withUpdate) external;

    function tradeMining(address account, address input, address output, uint256 quantity) external returns (bool);
    function Wthdraw(uint256 _pid) external;
    function WithdrawAll() external;
    function getUserReward(uint256 _pid) external view returns (uint256, uint256);
    function getPoolInfo(uint256 _pid) external view returns (uint256, uint256, uint256, uint256);


    event Swap(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid,uint256 amount);
    event SetMOTPerBlock(uint256 indexed newPerBlock);
}
