import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { formatBytes32String,bigNumberify } from 'ethers/utils'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { expandTo18Decimals } from './shared/utilities'

import MOTJson from '../build/MobiusToken.json'
import MOTStorageJson from '../build/TokenStorage.json';
import resolverJson from '../build/Resolver.json';

chai.use(solidity)


describe('Token.spec.ts', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'Escrow Test',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  let MOT : Contract
  let resolver : Contract;
  let MOTStorage : Contract;

  beforeEach(async () => {
    resolver = await deployContract(wallet, resolverJson); 
    MOT = await deployContract(wallet, MOTJson, [resolver.address]);
    MOTStorage = await deployContract(wallet,MOTStorageJson,[MOT.address]);

    await MOT.setStorage(MOTStorage.address);
    await resolver.importAddress(
          [formatBytes32String("RewardCollateral"),formatBytes32String("RewardStaking"),formatBytes32String("RewardTradings")],
          [wallet.address,wallet.address,wallet.address]
      );
    await MOT.refreshCache();
  })

  it('should work as plan',async () => {
    await MOT.airdrop(wallet.address,expandTo18Decimals(55000000));
    expect((await MOT.AIRDROP_LIMIT()).toString()).to.equal('0');
    await expect(MOT.airdrop(wallet.address,expandTo18Decimals(1))).to.be.revertedWith('can not airdrop more');
 
    expect(await MOT.balanceOf(wallet.address)).to.equal(expandTo18Decimals(55000000));

    await MOT.mint(wallet.address,expandTo18Decimals(45000000));
    await expect(MOT.mint(wallet.address,expandTo18Decimals(1))).to.be.revertedWith('can not mint more');
    expect(await MOT.balanceOf(wallet.address)).to.equal(expandTo18Decimals(100000000));
  })
})

