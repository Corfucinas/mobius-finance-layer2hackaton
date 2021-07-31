import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from 'ethers/constants'
import { formatBytes32String,bigNumberify } from 'ethers/utils'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'
import { expandTo18Decimals } from './shared/utilities'

import MOCKMOTJson from '../build/MOCKMOT.json'
import RewardCollateralJson from '../build/RewardCollateral.json'

chai.use(solidity)

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)
const MOT_PER_BLOCK = expandTo18Decimals(44)

describe('RewardCollateral.spec.ts', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'RewardCollateral Test',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  let token: Contract
  let RewardCollateral : Contract

  beforeEach(async () => {
    token = await deployContract(wallet, MOCKMOTJson, ["MOT","mot"]);
    RewardCollateral = await deployContract(wallet,RewardCollateralJson,[
        token.address,
        wallet.address,
        MOT_PER_BLOCK,
        0]);
  
    await RewardCollateral.add(formatBytes32String("ETH"),50,true);
    await RewardCollateral.add(formatBytes32String("DAI"),25,true);
    await RewardCollateral.add(formatBytes32String("MOT"),25,true);
  })

  it('motProxy',async () => {
    expect(await RewardCollateral.motProxy()).to.eq(token.address)
  })

  it('router',async () => {
    expect(await RewardCollateral.router()).to.eq(wallet.address)
  })

  it('motPerBlock',async () => {
    expect(await RewardCollateral.motPerBlock()).to.eq(MOT_PER_BLOCK)
  })

  it('startBlock',async () => {
    expect(await RewardCollateral.startBlock()).to.eq(0)
  })

  it('total point',async () => {
    expect(await RewardCollateral.totalAllocPoint()).to.eq(100)
  })

  it('deposit and withdraw',async () => {
    await RewardCollateral.deposit(formatBytes32String("ETH"),wallet.address,expandTo18Decimals(100));
    await RewardCollateral.deposit(formatBytes32String("ETH"),other.address,expandTo18Decimals(100));
    await RewardCollateral.setmotProxy(token.address)
 
    expect(await RewardCollateral.pendingMOT(formatBytes32String("ETH"),wallet.address)).to.eq(MOT_PER_BLOCK.mul(3).div(4))
    expect(await RewardCollateral.pendingMOT(formatBytes32String("ETH"),other.address)).to.eq(MOT_PER_BLOCK.mul(1).div(4))
    
    await RewardCollateral.withdraw(formatBytes32String("ETH"));
    expect((await token.balanceOf(wallet.address))).to.eq(MOT_PER_BLOCK);
    expect((await RewardCollateral.poolInfo(0))[3].toString()).to.eq(MOT_PER_BLOCK.div(bigNumberify(10).pow(8)));
    expect((await RewardCollateral.userInfo(0,wallet.address))[2].toString()).to.eq(MOT_PER_BLOCK);

    expect((await token.totalSupply()).toString()).to.eq(MOT_PER_BLOCK.mul(3).div(2))
})


})
