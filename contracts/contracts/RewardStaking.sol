// SPDX-License-Identifier: MIT

pragma solidity =0.8.0;

// Inheritance
import "./base/Ownable.sol";
import "./interfaces/IRewardStaking.sol";
import "./interfaces/IMobiusToken.sol";
import './interfaces/IERC20.sol';

// Libraires
import './lib/PreciseMath.sol';
import './lib/SafeERC20.sol';
import "./lib/ReentrancyGuard.sol";

contract RewardStaking is Ownable, IRewardStaking, ReentrancyGuard{
    using PreciseMath for uint256;
    using SafeERC20 for IERC20;

    address public motProxy;
    
    uint256 public motPerBlock;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    mapping(IERC20 => bool) public exists;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when MOT mining starts.
    uint256 public startBlock;

    constructor(
        address _motProxy,
        uint256 _motPerBlock,
        uint256 _startBlock
    ) {
        require(_motProxy != address(0), "motProxy is a zero address");
        motProxy    = _motProxy;
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

    function setMOTPerBlock(uint256 _newPerBlock) external onlyOwner {
        massUpdatePools();
        motPerBlock = _newPerBlock;
        emit SetMOTPerBlock(_newPerBlock);
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) external override onlyOwner {
        require(!exists[_lpToken],"lpToken already exists");
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock =
            block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accMOTPerShare: 0
            })
        );
        exists[_lpToken] = true;
    }

    // Update the given pool's MOT allocation point. Can only be called by the owner.
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) external override onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256)
    {
        return _to - _from;
    }

    // View function to see pending MOTs on frontend.
    function pendingMOT(uint256 _pid, address _user) external override view returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accMOTPerShare = pool.accMOTPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 motReward = multiplier * motPerBlock * pool.allocPoint / totalAllocPoint;
            accMOTPerShare = accMOTPerShare + (motReward * 1e12 / lpSupply);
        }
        return (user.amount * accMOTPerShare / 1e12) - user.rewardDebt;
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
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
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

    // Deposit LP tokens to this for MOT allocation.
    function deposit(uint256 _pid, uint256 _amount) external override nonReentrant{
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accMOTPerShare / 1e12) - user.rewardDebt;
            IERC20(motProxy).safeTransfer(msg.sender, pending);
        }
        pool.lpToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        user.amount = user.amount + _amount;
        user.rewardDebt = user.amount * pool.accMOTPerShare / 1e12;
        emit Deposit(msg.sender, _pid, _amount);
    }

    function claim(uint256 _pid) external override nonReentrant{
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);
        
        uint256 pending = (user.amount * pool.accMOTPerShare / 1e12) - user.rewardDebt;
        user.rewardDebt = user.amount * pool.accMOTPerShare / 1e12;
        IERC20(motProxy).safeTransfer(msg.sender, pending);
    }

    // Withdraw LP tokens.
    function withdraw(uint256 _pid, uint256 _amount) external override nonReentrant{
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);

        uint256 pending = (user.amount * pool.accMOTPerShare / 1e12) - user.rewardDebt;
        user.amount = user.amount - _amount;
        user.rewardDebt = user.amount * pool.accMOTPerShare / 1e12;
        IERC20(motProxy).safeTransfer(msg.sender, pending);

        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external nonReentrant{
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }
}
