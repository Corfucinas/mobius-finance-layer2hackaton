import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from 'ethers/constants'
import { bigNumberify, hexlify, keccak256, defaultAbiCoder, toUtf8Bytes } from 'ethers/utils'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'
import { expandTo18Decimals, getApprovalDigest } from './shared/utilities'

import MOCKMOTJson from '../build/MOCKMOT.json'
import RewardStakingJson from '../build/RewardStaking.json'

chai.use(solidity)

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)
const MOT_PER_BLOCK = expandTo18Decimals(11)

describe('RewardStaking.spec.ts', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'RewardStaking Test',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  let token: Contract
  let lpToken1 : Contract
  let RewardStaking : Contract

  beforeEach(async () => {
    token = await deployContract(wallet, MOCKMOTJson, ["MOT","mot"]);
    lpToken1 = await deployContract(wallet,MOCKMOTJson,["LP1","lp1"]);
    RewardStaking = await deployContract(wallet,RewardStakingJson,[
        token.address,
        MOT_PER_BLOCK,
        0]);
  
    await RewardStaking.add(10,lpToken1.address,true);
  })

  it('motProxy',async () => {
    expect(await RewardStaking.motProxy()).to.eq(token.address)
  })

  it('motPerBlock',async () => {
    expect(await RewardStaking.motPerBlock()).to.eq(MOT_PER_BLOCK)
  })

  it('deposit and claim',async () => {
    await lpToken1.mint(wallet.address,expandTo18Decimals(100))
    await lpToken1.approve(RewardStaking.address,expandTo18Decimals(100))

    await RewardStaking.deposit(0,expandTo18Decimals(100));
    await RewardStaking.setmotProxy(token.address)
 
    expect(await RewardStaking.pendingMOT(0,wallet.address)).to.eq(MOT_PER_BLOCK)
    
    await RewardStaking.claim(0);
    expect(await token.balanceOf(wallet.address)).to.eq(MOT_PER_BLOCK.mul(2));
    expect((await RewardStaking.poolInfo(0))[3].toString()).to.eq(MOT_PER_BLOCK.mul(2).div(bigNumberify(10).pow(8)));
    expect((await RewardStaking.userInfo(0,wallet.address))[0].toString()).to.eq(expandTo18Decimals(100));
    expect((await RewardStaking.userInfo(0,wallet.address))[1].toString()).to.eq(MOT_PER_BLOCK.mul(2));

    expect((await token.totalSupply()).toString()).to.eq(MOT_PER_BLOCK.mul(2));
})

  it('deposit and withdraw',async () => {
    await lpToken1.mint(wallet.address,expandTo18Decimals(100))
    await lpToken1.approve(RewardStaking.address,expandTo18Decimals(100))

    await RewardStaking.deposit(0,expandTo18Decimals(100));
    await RewardStaking.setmotProxy(token.address)
 
    expect(await RewardStaking.pendingMOT(0,wallet.address)).to.eq(MOT_PER_BLOCK)
    
    await RewardStaking.withdraw(0,expandTo18Decimals(50));
    expect(await token.balanceOf(wallet.address)).to.eq(MOT_PER_BLOCK.mul(2));
    expect((await RewardStaking.poolInfo(0))[3].toString()).to.eq(MOT_PER_BLOCK.mul(2).div(bigNumberify(10).pow(8)));
    expect((await RewardStaking.userInfo(0,wallet.address))[1].toString()).to.eq(MOT_PER_BLOCK);

    expect((await token.totalSupply()).toString()).to.eq(MOT_PER_BLOCK.mul(2));
})
})
