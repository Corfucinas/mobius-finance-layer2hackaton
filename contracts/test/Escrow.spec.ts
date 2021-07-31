import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { formatBytes32String,bigNumberify } from 'ethers/utils'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { expandTo18Decimals } from './shared/utilities'

import MOCKMOTJson from '../build/MOCKMOT.json'
import EscrowJson from '../build/Escrow.json'
import EscrowStorageJson from '../build/EscrowStorage.json';
import resolverJson from '../build/Resolver.json';

chai.use(solidity)


describe('Escrow.spec.ts', () => {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'Escrow Test',
    gasLimit: 9999999
  })
  const [wallet, other] = provider.getWallets()
  let token: Contract
  let Escrow : Contract
  let resolver : Contract;
  let EscrowStorage : Contract;

  beforeEach(async () => {
    resolver = await deployContract(wallet, resolverJson); 
    token = await deployContract(wallet, MOCKMOTJson, ["MOT","mot"]);
    Escrow = await deployContract(wallet,EscrowJson,[resolver.address]);
    EscrowStorage = await deployContract(wallet,EscrowStorageJson,[Escrow.address]);

    await Escrow.setStorage(EscrowStorage.address);
    await resolver.importAddress(
          [formatBytes32String("MobiusToken")],
          [token.address]
      );
  })

  it('should withdraw as plan',async () => {
    await token.mint(Escrow.address,expandTo18Decimals(1000));

    let now = Date.parse((new Date()).toString()) / 1000;

    await Escrow.deposit(wallet.address,expandTo18Decimals(500),now + 5);
    await Escrow.deposit(wallet.address,expandTo18Decimals(500),now + 500);
    await Escrow.deposit(wallet.address,expandTo18Decimals(500),now + 500);
    expect(await Escrow.getWithdrawable(wallet.address)).to.eq(0);
    await delay(6000);
    await Escrow.refreshCache();
    expect(await Escrow.getWithdrawable(wallet.address)).to.eq(expandTo18Decimals(500));
    await Escrow.withdraw(wallet.address,expandTo18Decimals(500));
    expect(await token.balanceOf(wallet.address)).to.eq(expandTo18Decimals(500));
    
    expect(await Escrow.getWithdrawable(wallet.address)).to.eq(0);
    await expect(Escrow.withdraw(wallet.address,expandTo18Decimals(500))).to.be.revertedWith('Escrow: withdraw amount exceeds withdrawable');
    expect(await Escrow.getBalance(wallet.address)).to.eq(expandTo18Decimals(1000));
    await Escrow.deposit(wallet.address,expandTo18Decimals(600),now + 500);
    expect(await Escrow.getBalance(wallet.address)).to.eq(expandTo18Decimals(1100));
  })
})

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
