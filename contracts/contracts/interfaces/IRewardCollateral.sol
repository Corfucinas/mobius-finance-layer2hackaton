// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

interface IRewardCollateral {
    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many collateral the user has staked.
        uint256 pending; //unclaimed reward.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of MOTs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accMotPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws collateral to a pool. Here's what happens:
        //   1. The pool's `accMotPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }
    // Info of each pool.
    struct PoolInfo {
        bytes32 poolName;
        uint256 allocPoint; // How many allocation points assigned to this pool. MOTs to distribute per block.
        uint256 lastRewardBlock; // Last block number that MOTs distribution occurs.
        uint256 accMOTPerShare; // Accumulated MOTs per share, times 1e12. See below.
        uint256 totalStakeAmount;// all user's staking amount for this pool 
    }

    function add(bytes32 poolName,uint256 _allocPoint, bool _withUpdate) external;
    function set(bytes32 poolName, uint256 _allocPoint, bool _withUpdate) external;

    function deposit(bytes32 poolName, address _userAddr, uint256 _amount) external ;
    function unDeposit(bytes32 poolName, address _userAddr,uint256 _amount) external;

    function pendingMOT(bytes32 poolName, address _user) external view returns (uint256);
    function withdraw(bytes32 poolName) external;

    event Deposit(address indexed user, bytes32 indexed poolName, uint256 amount);
    event UnDeposit(address indexed user, bytes32 indexed poolName, uint256 amount);
    event Withdraw(address indexed user, bytes32 indexed poolName, uint256 amount);
    event SetMOTPerBlock(uint256 indexed newPerBlock);
    event PoolInfoUpdated(bytes32 indexed poolName, uint256 allocPoint);
}
