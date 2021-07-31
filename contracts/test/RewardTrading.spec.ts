import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from 'ethers/constants'
import { bigNumberify, hexlify, keccak256, defaultAbiCoder, toUtf8Bytes } from 'ethers/utils'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'
import { expandTo18Decimals, getApprovalDigest } from './shared/utilities'

import MOCKMOTJson from '../build/MOCKMOT.json'
import RewardTradingJson from '../build/RewardTrading.json'

chai.use(solidity)

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)
const MOT_PER_BLOCK = expandTo18Decimals(44)

describe('RewardTrading.spec.ts', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'RewardTrading Test',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  let token: Contract
  let moTsla: Contract
  let moUSD: Contract
  let RewardTrading : Contract

  beforeEach(async () => {
    token = await deployContract(wallet, MOCKMOTJson, ["MOT","mot"]);
    RewardTrading = await deployContract(wallet,RewardTradingJson,[
        token.address,
        [wallet.address],
        MOT_PER_BLOCK,
        0]);
  })

  it('motProxy',async () => {
    expect(await RewardTrading.motProxy()).to.eq(token.address)
  })

  it('motPerBlock',async () => {
    expect(await RewardTrading.motPerBlock()).to.eq(MOT_PER_BLOCK)
  })

  it('deposit and withdraw',async () => {
    moTsla = await deployContract(wallet, MOCKMOTJson, ["TSLA","TSLA"]);
    moUSD = await deployContract(wallet, MOCKMOTJson, ["MOUSD","moUSD"]);

    let pair = await RewardTrading.pairFor(moTsla.address,moUSD.address);

    await RewardTrading.addPair(10,pair,true);

    await RewardTrading.tradeMining(wallet.address,moTsla.address,moUSD.address,expandTo18Decimals(100));
    await RewardTrading.tradeMining(other.address,moTsla.address,moUSD.address,expandTo18Decimals(100));

    let pid = await RewardTrading.pidOfPair(pair)
    let [a,] = await RewardTrading.getUserReward(pid)
    expect(a).to.eq(MOT_PER_BLOCK)

    await RewardTrading.WithdrawAll()
    expect(await token.balanceOf(wallet.address)).to.eq(MOT_PER_BLOCK.mul(3).div(2))
    let [b,] = await RewardTrading.getUserReward(pid)
    expect(b).to.eq(0)

    expect((await token.totalSupply()).toString()).to.eq(MOT_PER_BLOCK.mul(3));
})

})
