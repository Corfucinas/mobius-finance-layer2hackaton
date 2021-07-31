// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

// Inheritance
import "./base/Ownable.sol";
import "./interfaces/IRewardCollateral.sol";

// Libraires
import './lib/PreciseMath.sol';
import './lib/SafeERC20.sol';
import "./interfaces/IMobiusToken.sol";
import "./lib/ReentrancyGuard.sol";

contract RewardCollateral is Ownable, IRewardCollateral, ReentrancyGuard{
    using PreciseMath for uint256;
    using SafeERC20 for IERC20;

    address public motProxy;
    // router address
    address public router;
    // MOT tokens created per block.
    uint256 public motPerBlock;
    // The block number when MOT mining starts.
    uint256 public startBlock;
    // Info of each pool.
    PoolInfo[] public poolInfo;
    //map of name and pid
    mapping (bytes32=>uint256) public poolNameToId;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    constructor(
        address _motProxy,
        address _router,
        uint256 _motPerBlock,
        uint256 _startBlock
    ) {
        require(_motProxy != address(0), "motProxy is a zero address");
        motProxy    = _motProxy;
        require(_router != address(0), "router is a zero address");
        router      = _router;
        motPerBlock = _motPerBlock;
        startBlock  = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function setmotProxy(address _motProxy) external onlyOwner {
        require(_motProxy != address(0), "motProxy is a zero address");
        motProxy = _motProxy;
    }

    function setRouter(address _router) external onlyOwner {
        require(_router != address(0), "router is the zero address");
        router = _router;
    }

    function setMOTPerBlock(uint256 _newPerBlock) external onlyOwner {
        massUpdatePools();
        motPerBlock = _newPerBlock;
        emit SetMOTPerBlock(_newPerBlock);
    }

    // Add a new collateral to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(bytes32 poolName,uint256 _allocPoint, bool _withUpdate) external override onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(
            PoolInfo({
                poolName : poolName,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accMOTPerShare: 0,
                totalStakeAmount: 0
            })
        );
        poolNameToId[poolName] = poolInfo.length - 1;
    }

    // Update the given pool's MOT allocation point. Can only be called by the owner.
    function set(bytes32 poolName, uint256 _allocPoint, bool _withUpdate) external override onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 _pid = poolNameToId[poolName];
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        emit PoolInfoUpdated(poolName, _allocPoint);
    }

    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256)
    {
        return _to - _from;
    }

    // View function to see pending MOTs on frontend.
    function pendingMOT(bytes32 poolName, address _user) external view override returns (uint256)
    {
        uint256 _pid = poolNameToId[poolName];
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accMOTPerShare = pool.accMOTPerShare;
        uint256 totalStakeAmount = pool.totalStakeAmount;
        if (block.number > pool.lastRewardBlock && totalStakeAmount != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 motReward =
                multiplier * motPerBlock * pool.allocPoint / totalAllocPoint;
                accMOTPerShare = accMOTPerShare + (motReward * 1e12 / totalStakeAmount);
        }
        return user.pending + (user.amount * accMOTPerShare / 1e12) - user.rewardDebt;
    }

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.totalStakeAmount;
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 motReward = multiplier * motPerBlock * pool.allocPoint / totalAllocPoint;
        IMobiusToken(motProxy).mint(address(this), motReward);
        pool.accMOTPerShare = pool.accMOTPerShare + (motReward * 1e12 / lpSupply);
        pool.lastRewardBlock = block.number;
    }

    // Deposit collateral for MOT allocation.
    // this can only be called by the core contract
    function deposit(bytes32 poolName, address _userAddr, uint256 _amount) external override onlyRouter nonReentrant{
        uint256 _pid = poolNameToId[poolName];
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_userAddr];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accMOTPerShare / 1e12) - user.rewardDebt;
            user.pending = user.pending + pending;
        }
        user.amount = user.amount + _amount;
        pool.totalStakeAmount = pool.totalStakeAmount + _amount;
        user.rewardDebt = user.amount * pool.accMOTPerShare / 1e12;
        emit Deposit(_userAddr, poolName, _amount);
    }

    function unDeposit(bytes32 poolName, address _userAddr,uint256 _amount) external override onlyRouter nonReentrant{
        uint256 _pid = poolNameToId[poolName];
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_userAddr];
        _amount = _amount.min(user.amount);
        updatePool(_pid);
        uint256 pending = (user.amount * pool.accMOTPerShare / 1e12) - user.rewardDebt;
        user.pending = user.pending + pending;

        user.amount = user.amount - _amount;
        pool.totalStakeAmount = pool.totalStakeAmount - _amount;
        user.rewardDebt = user.amount * pool.accMOTPerShare / 1e12;
        emit UnDeposit(_userAddr, poolName, _amount);
    }

    // Withdraw Reward
    function withdraw(bytes32 poolName) external override nonReentrant{
        uint256 _pid = poolNameToId[poolName];
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 pending = user.pending + (user.amount * pool.accMOTPerShare / 1e12) - user.rewardDebt;
        user.pending = 0;
        user.rewardDebt = user.amount * pool.accMOTPerShare / 1e12;
        IERC20(motProxy).safeTransfer(msg.sender, pending);
        emit Withdraw(msg.sender, poolName,pending);
    }

    modifier onlyRouter() {
        require(msg.sender == router, "RewardCollateral: caller is not the router");
        _;
    }
}
