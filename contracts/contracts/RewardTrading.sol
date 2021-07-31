// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

import "./base/Ownable.sol";
import "./interfaces/IRewardTrading.sol";
import "./interfaces/IMobiusToken.sol";

import './lib/PreciseMath.sol';
import './lib/SafeERC20.sol';
import "./lib/ReentrancyGuard.sol";

contract RewardTrading is Ownable, IRewardTrading, ReentrancyGuard{
    using PreciseMath for uint256;
    using SafeERC20 for IERC20;

    // mot tokens created per block
    uint256 public motPerBlock;
    // The block number when MOT mining starts.
    uint256 public startBlock;
    // Total allocation points
    uint256 public totalAllocPoint = 0;
    // mot token address
    address public motProxy;
    // routers address
    address[] public routers;
    // pair corresponding pid
    mapping(address => uint256) public pidOfPair;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    constructor(
        address _motProxy,
        address[] memory _routers,
        uint256 _motPerBlock,
        uint256 _startBlock
    ) {
        require(_motProxy != address(0), "motProxy is a zero address");
        motProxy = _motProxy;
        
        routers = _routers;
        motPerBlock = _motPerBlock;
        startBlock = _startBlock;
    }

    function poolLength() public view returns (uint256) {
        return poolInfo.length;
    }

    function setmotProxy(address _motProxy) external onlyOwner {
        require(_motProxy != address(0), "motProxy is a zero address");
        motProxy = _motProxy;
    }


    function setRouters(address[] memory _routers) external onlyOwner {
        require(_routers.length > 0, "router is empty");
        routers = _routers;
    }

    // Set the number of mot produced by each block
    function setMOTPerBlock(uint256 _newPerBlock) external onlyOwner {
        massMintPools();
        motPerBlock = _newPerBlock;
        emit SetMOTPerBlock(_newPerBlock);
    }

    function addPair(uint256 _allocPoint, address _pair, bool _withUpdate) external override onlyOwner {
        require(_pair != address(0), "_pair is the zero address");
        if (_withUpdate) {
            massMintPools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(PoolInfo({
            pair : _pair,
            quantity : 0,
            totalQuantity : 0,
            allocPoint : _allocPoint,
            allocMOTAmount : 0,
            lastRewardBlock : lastRewardBlock
        }));
        pidOfPair[_pair] = poolLength() - 1;
    }

    // Update the allocPoint of the pool
    function setPair(uint256 _pid, uint256 _allocPoint, bool _withUpdate) external override onlyOwner {
        if (_withUpdate) {
            massMintPools();
        }
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    function reward() public view returns (uint256) {
        return motPerBlock;
    }

    // Rewards for the current block
    function getMOTReward(uint256 _lastRewardBlock) public view returns (uint256) {
        require(_lastRewardBlock <= block.number, "tradeMining: must little than the current block number");
        uint256 blockReward = (block.number - _lastRewardBlock) * reward();
        return blockReward;
    }

    // Update all pools Called when updating allocPoint and setting new blocks
    function massMintPools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            mint(pid);
        }
    }

    function mint(uint256 _pid) public returns (bool) {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return false;
        }
        uint256 blockReward = getMOTReward(pool.lastRewardBlock);
        if (blockReward <= 0) {
            return false;
        }
        // Calculate the rewards obtained by the pool based on the allocPoint
        uint256 motReward = blockReward * pool.allocPoint / totalAllocPoint;
        IMobiusToken(motProxy).mint(address(this), motReward);
        // Increase the number of tokens in the current pool
        pool.allocMOTAmount = pool.allocMOTAmount + motReward;
        pool.lastRewardBlock = block.number;
        return true;
    }

    // tradeMining only router
    function tradeMining(address account, address input, address output, uint256 quantity) external override onlyRouter nonReentrant returns (bool) {
        require(account != address(0), "tradeMining: taker account is the zero address");
        require(input != address(0), "tradeMining: taker input is the zero address");
        require(output != address(0), "tradeMining: taker output is the zero address");

        if (poolLength() <= 0) {
            return false;
        }

        address pair = pairFor(input, output);

        PoolInfo storage pool = poolInfo[pidOfPair[pair]];
        // If it does not exist or the allocPoint is 0 then return
        if (pool.pair != pair || pool.allocPoint <= 0) {
            return false;
        }

        mint(pidOfPair[pair]);

        pool.quantity = pool.quantity + quantity;
        pool.totalQuantity = pool.totalQuantity + quantity;
        UserInfo storage user = userInfo[pidOfPair[pair]][account];
        user.quantity = user.quantity + quantity;
        user.blockNumber = block.number;

        emit Swap(account, pidOfPair[pair], quantity);
        return true;
    }

    function Wthdraw(uint256 _pid) external override nonReentrant{
        _withdraw(_pid);
    }

    // The user withdraws all the transaction rewards of the pool
    function WithdrawAll() external override nonReentrant{
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            _withdraw(pid);
        }
    }

    function _withdraw(uint256 _pid) internal {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        if (user.quantity <= 0) {
            return;
        }
        mint(_pid);
        // The reward held by the user in this pool
        uint256 userReward = pool.allocMOTAmount * user.quantity / pool.quantity;
        pool.quantity = pool.quantity - user.quantity;
        pool.allocMOTAmount = pool.allocMOTAmount - userReward;
        user.quantity = 0;
        user.blockNumber = block.number;

        IERC20(motProxy).safeTransfer(msg.sender, userReward);
        emit Withdraw(msg.sender, _pid, userReward);
    }

    // Get rewards from users in the current pool
    function getUserReward(uint256 _pid) external override view returns (uint256, uint256){
        require(_pid <= poolInfo.length - 1, "tradeMining: Not find this pool");
        uint256 userSub;
        PoolInfo memory pool = poolInfo[_pid];
        UserInfo memory user = userInfo[_pid][msg.sender];
        if (user.quantity > 0) {
            uint256 blockReward = getMOTReward(pool.lastRewardBlock);
            uint256 motReward = blockReward * pool.allocPoint / totalAllocPoint;
            userSub = userSub + (pool.allocMOTAmount + motReward) * user.quantity / pool.quantity;
        }
        //MOT available to users, User transaction amount
        return (userSub, user.quantity);
    }

    // Get details of the pool
    function getPoolInfo(uint256 _pid) external override view returns (uint256, uint256, uint256, uint256){
        require(_pid <= poolInfo.length - 1, "tradeMining: Not find this pool");
        PoolInfo memory pool = poolInfo[_pid];
        uint256 motAmount = pool.allocMOTAmount;
        uint256 blockReward = getMOTReward(pool.lastRewardBlock);
        uint256 motReward = blockReward * pool.allocPoint / totalAllocPoint;
        motAmount = motAmount + motReward;
        //Pool remaining reward,Total /Current transaction volume of the pool
        return (motAmount, pool.totalQuantity, pool.quantity, pool.allocPoint);
    }

    modifier onlyRouter() {
        bool contain = false;
        for (uint256 i = 0; i < routers.length; i++) {
            if (msg.sender == routers[i]) {
                contain = true;
                break;
            }
        }
        require(contain, 'RewardTrading: caller is not in contains');
        _;
    }

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(address tokenA, address tokenB) public view returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(uint160(uint256(keccak256(abi.encodePacked(
                hex'ff',
                address(this),
                keccak256(abi.encodePacked(token0, token1))
            )))));
    }

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) public pure returns (address token0, address token1) {
        require(tokenA != tokenB, 'IDENTICAL_ADDRESSES');
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'ZERO_ADDRESS');
    }

}