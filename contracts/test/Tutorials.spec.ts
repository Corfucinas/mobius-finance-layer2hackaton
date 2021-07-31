import chai, { expect } from 'chai';
import { Contract } from 'ethers';
import { bigNumberify,formatBytes32String } from 'ethers/utils';
import { solidity, MockProvider, deployContract } from 'ethereum-waffle';
import { expandTo18Decimals, expandTo16Decimals } from './shared/utilities';

import resolverJson from '../build/Resolver.json';
import MobiusOracleJson from '../build/MobiusOracle.json';
import AssetPriceJson from '../build/AssetPrice.json';
import IssuerJson from '../build/Issuer.json';
import LiquidatorJson from '../build/Liquidator.json';
import MobiusJson from '../build/Mobius.json';
import MobiusTokenJson from '../build/MobiusToken.json';
import SettingJson from '../build/Setting.json';
import StakerJson from '../build/Staker.json';
import SynthJson from '../build/Synth.json';
import TraderJson from '../build/Trader.json';
import EscrowJson from '../build/Escrow.json';

import EscrowStorageJson from '../build/EscrowStorage.json';
import IssuerStorageJson from '../build/IssuerStorage.json';
import LiquidatorStorageJson from '../build/LiquidatorStorage.json';
import OracleStorageJson from '../build/OracleStorage.json';
import SettingStorageJson from '../build/SettingStorage.json';
import StakerStorageJson from '../build/StakerStorage.json';
import TokenStorageJson from '../build/TokenStorage.json';
import TraderStorageJson from '../build/TraderStorage.json';
import RewardCollateralJson from '../build/RewardCollateral.json';
import RewardTradingJson from '../build/RewardTrading.json';
import DynamicTradingFeeJson from '../build/DynamicTradingFee.json';

import StatsJson from '../build/Stats.json';

chai.use(solidity)
function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

describe('Tutorials.spec.ts', () => {
    const provider = new MockProvider({
        hardfork: 'istanbul',
        mnemonic: 'mobius mobius mobius mobius mobius mobius mobius mobius mobius mobius mobius mobius',
        gasLimit: 9999999
    })
    const [alice, bob, carol] = provider.getWallets()
    const MOT_PER_BLOCK = expandTo18Decimals(44)

    let resolver: Contract
    let MobiusOracle : Contract
    let AssetPrice : Contract
    let Issuer : Contract
    let Liquidator : Contract
    let Mobius : Contract
    let MobiusToken : Contract
    let Setting : Contract
    let Staker : Contract
    let moUSD : Contract
    let Trader : Contract
    let Escrow : Contract

    let EscrowStorage : Contract
    let HolderStorage : Contract
    let IssuerStorage : Contract
    let LiquidatorStorage : Contract
    let OracleStorage : Contract
    let SettingStorage : Contract
    let StakerStorage : Contract
    let TokenStorage : Contract
    let TraderStorage : Contract
    let moUSDStorage : Contract

    let moTsla : Contract
    let moTslaStorage : Contract

    let RewardCollateral : Contract
    let RewardTrading : Contract

    let DynamicTradingFee : Contract

    beforeEach(async () => {
        // Deploy contracts
        resolver = await deployContract(alice, resolverJson); 
        MobiusOracle = await deployContract(alice,MobiusOracleJson); 
        AssetPrice = await deployContract(alice,AssetPriceJson);
        Issuer = await deployContract(alice,IssuerJson,[resolver.address]);
        Liquidator = await deployContract(alice,LiquidatorJson,[resolver.address]);
        Mobius = await deployContract(alice,MobiusJson,[resolver.address,formatBytes32String("ETH")]);
        MobiusToken = await deployContract(alice,MobiusTokenJson,[resolver.address]);
        Setting = await deployContract(alice,SettingJson);
        Staker = await deployContract(alice,StakerJson,[resolver.address]);

        Trader = await deployContract(alice,TraderJson,[resolver.address]);
        Escrow = await deployContract(alice,EscrowJson,[resolver.address]);

        EscrowStorage = await deployContract(alice,EscrowStorageJson,[Escrow.address]);
        IssuerStorage = await deployContract(alice,IssuerStorageJson,[Issuer.address]);
        LiquidatorStorage = await deployContract(alice,LiquidatorStorageJson,[Liquidator.address]);
        OracleStorage = await deployContract(alice,OracleStorageJson,[MobiusOracle.address]);
        SettingStorage = await deployContract(alice,SettingStorageJson,[Setting.address]);
        StakerStorage = await deployContract(alice,StakerStorageJson,[Staker.address]);
        TokenStorage = await deployContract(alice,TokenStorageJson,[MobiusToken.address]);
        TraderStorage = await deployContract(alice,TraderStorageJson,[Trader.address]);

        moUSD = await deployContract(alice,SynthJson,[Issuer.address,"moUSD","moUSD",
        formatBytes32String("moUSD"),formatBytes32String("moUSD")]);
        moUSDStorage = await deployContract(alice,TokenStorageJson,[moUSD.address]);

        //Rewards
        RewardCollateral = await deployContract(alice,RewardCollateralJson,[
            MobiusToken.address,
            Staker.address,
            MOT_PER_BLOCK,
            0]);

        DynamicTradingFee = await deployContract(alice,DynamicTradingFeeJson,[resolver.address]);
      
        await RewardCollateral.add(formatBytes32String("ETH"),50,true);
        await RewardCollateral.add(formatBytes32String("DAI"),25,true);
        await RewardCollateral.add(formatBytes32String("MOT"),25,true);

        RewardTrading = await deployContract(alice,RewardTradingJson,[
            MobiusToken.address,
            [Trader.address,Issuer.address],
            MOT_PER_BLOCK,
        0]);

        // init resolver
        // remember to add reward contracts
        await resolver.importAddress(
            [formatBytes32String("AssetPrice"),
            formatBytes32String("Setting"),
            formatBytes32String("Mobius"),
            formatBytes32String("Escrow"),
            formatBytes32String("Issuer"),
            formatBytes32String("Staker"),
            formatBytes32String("Trader"),
            formatBytes32String("MobiusToken"),
            formatBytes32String("Liquidator"),
            formatBytes32String("RewardCollateral"),
            formatBytes32String("RewardTradings"),
            formatBytes32String("TradingFeeAddress"),
            formatBytes32String("LiquidationFeeAddress"),
            formatBytes32String("DynamicTradingFee")
        ],
            [AssetPrice.address,
                Setting.address,
                Mobius.address,
                Escrow.address,
                Issuer.address,
                Staker.address,
                Trader.address,
                MobiusToken.address,
                Liquidator.address,
                RewardCollateral.address,
                RewardTrading.address,
                "0x0FeefeefeEFeeFeefeEFEEFEEfEeFEeFeeFeEfEe",
                "0x0FeefeefeEFeeFeefeEFEEFEEfEeFEeFeeFeEfEe",
                DynamicTradingFee.address]
        );
        await resolver.addAsset(formatBytes32String("Synth"),formatBytes32String("moUSD"),moUSD.address)

        // init Oracle
        await MobiusOracle.setStorage(OracleStorage.address)
        await MobiusOracle.setPrice(formatBytes32String("ETH"),expandTo18Decimals(2500))
        
        // init AssetPrice
        await AssetPrice.setOracle(formatBytes32String("ETH"), MobiusOracle.address)

        // init issuer
        await Issuer.refreshCache();
        await Issuer.setStorage(IssuerStorage.address);

        //init Liquidator
        await Liquidator.refreshCache();
        await Liquidator.setStorage(LiquidatorStorage.address);

        // init Mobius
        await Mobius.refreshCache();

        // init MobiusToken
        await MobiusToken.refreshCache();
        await MobiusToken.setStorage(TokenStorage.address);

        // init Setting
        await resolver.addAsset(formatBytes32String("Stake"),formatBytes32String("ETH"),'0x0000000000000000000000000000000000000000')
        await Setting.setStorage(SettingStorage.address);
        await Setting.setCollateralRate(formatBytes32String("ETH"),formatBytes32String("moUSD"),expandTo16Decimals(200));
        await Setting.setCollateralRate(formatBytes32String("ETH"),formatBytes32String("moTSLA"),expandTo16Decimals(200));

        await Setting.setLiquidationRate(formatBytes32String("ETH"),formatBytes32String("moUSD"),expandTo16Decimals(150));
        await Setting.setLiquidationRate(formatBytes32String("ETH"),formatBytes32String("moTSLA"),expandTo16Decimals(150));

        await Setting.setLiquidationFeeRate(formatBytes32String("ETH"),expandTo16Decimals(3));
        await Setting.setLiquidationDelay(1);
        await Setting.setMinStakeTime(1);
        await Setting.setMintPeriodDuration(expandTo16Decimals(3));

        // init Staker
        await Staker.refreshCache();
        await Staker.setStorage(StakerStorage.address);

        // init moUSD
        await moUSD.setStorage(moUSDStorage.address)
        await Setting.setTradingFeeRate(formatBytes32String("moUSD"),bigNumberify(3).mul(bigNumberify(10).pow(15)));

        // init Trader
        await Trader.refreshCache();
        await Trader.setStorage(TraderStorage.address);

        // init Escrow
        await Escrow.refreshCache();
        await Escrow.setStorage(EscrowStorage.address);

        //init Dynamic Trading Fee
        await DynamicTradingFee.refreshCache();

        // add Synth moTSLA
        moTsla = await deployContract(alice,SynthJson,[Issuer.address,"moTSLA","moTSLA",
        formatBytes32String("moTSLA"),formatBytes32String("SYNTH")]);
        moTslaStorage = await deployContract(alice,TokenStorageJson,[moTsla.address]);

        await moTsla.setStorage(moTslaStorage.address)  
        
        await resolver.addAsset(formatBytes32String("Synth"),formatBytes32String("moTSLA"),moTsla.address)
        await MobiusOracle.setPrice(formatBytes32String("moTSLA"),expandTo18Decimals(700))
        await AssetPrice.setOracle(formatBytes32String("moTSLA"), MobiusOracle.address)
        await Setting.setTradingFeeRate(formatBytes32String("moTSLA"),bigNumberify(3).mul(bigNumberify(10).pow(15)));

        let pair = await RewardTrading.pairFor(moTsla.address,moUSD.address);
        await RewardTrading.addPair(10,pair,true);
    
        // support mot for stake
        await resolver.addAsset(formatBytes32String("Stake"),formatBytes32String("MOT"),MobiusToken.address)
        await MobiusOracle.setPrice(formatBytes32String("MOT"),expandTo18Decimals(5))
        await AssetPrice.setOracle(formatBytes32String("MOT"), MobiusOracle.address)

        await Setting.setCollateralRate(formatBytes32String("MOT"),formatBytes32String("moUSD"),expandTo16Decimals(600));
        await Setting.setCollateralRate(formatBytes32String("MOT"),formatBytes32String("moTSLA"),expandTo16Decimals(600));

        await Setting.setLiquidationRate(formatBytes32String("MOT"),formatBytes32String("moUSD"),expandTo16Decimals(250));
        await Setting.setLiquidationRate(formatBytes32String("MOT"),formatBytes32String("moTSLA"),expandTo16Decimals(250));

        await Setting.setLiquidationFeeRate(formatBytes32String("MOT"),expandTo16Decimals(3));
      
        // support DAI and MATIC for stake

        //set max fee rate

        //setMaxDelayTime set this on test net,but don’t too big or it will crash
    })

    it('tutorial',async () => {
        // stake 4 ETH to get 5000 moUSD
        await Mobius.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(4)});
        expect((await moUSD.balanceOf(alice.address)).toString()).to.eq("5000000000000000000000")
        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("5000000000000000000000")

        // trade 700 moUSD to get 1 moTSLA
        await Mobius.trade(formatBytes32String("moUSD"),expandTo18Decimals(700),formatBytes32String("moTSLA"))
        expect((await moUSD.balanceOf(alice.address)).toString()).to.eq("4300000000000000000000");
        expect((await moTsla.balanceOf(alice.address)).toString()).to.eq("997000000000000000");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("5000000000000000000000");

        // trade 0.5 moTSLA to get 350 moUSD
        await Mobius.trade(formatBytes32String("moTSLA"),expandTo16Decimals(50),formatBytes32String("moUSD"))
        expect((await moUSD.balanceOf(alice.address)).toString()).to.eq("4648950000000000000000");
        expect((await moTsla.balanceOf(alice.address)).toString()).to.eq("497000000000000000");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("5000000000000000000000");

        // burn 1250 moUSD to get 1 ETH back
        let ethBalanceBefore = await alice.getBalance();
        await Mobius.burn(formatBytes32String("ETH"),formatBytes32String("moUSD"), expandTo18Decimals(1250),true)
        let ethBalanceAfter = await alice.getBalance();
        
        //should be about 1ETH
        expect((ethBalanceAfter.sub(ethBalanceBefore)).div(bigNumberify(10).pow(16)).toString()).to.eq("99");
        expect((await moUSD.balanceOf(alice.address)).toString()).to.eq("3398950000000000000000");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("3750000000000000000000");
        
        // airdrop 1000 MOT for user and stake it for moUSD
        // now we should have about 4232.2833 moUSD、833.3333 MOT Debt、3750 ETH Debt
        await MobiusToken.airdrop(alice.address,expandTo18Decimals(1000));
        await delay(1000);
        await MobiusToken.approve(Mobius.address,expandTo18Decimals(1000));
        await delay(1000);
        await Mobius.mintFromToken(formatBytes32String("MOT"),expandTo18Decimals(1000),expandTo16Decimals(600));
        expect((await moUSD.balanceOf(alice.address)).toString()).to.eq("4232283333333333333333");
        expect((await Issuer.getDebt(formatBytes32String("MOT"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("833333333333333333333");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("3750000000000000000000");;
    })

    it('collateral short',async () => {
        let MobiusA = Mobius.connect(provider.getSigner(alice.address));
        let MobiusB = Mobius.connect(provider.getSigner(bob.address));
        let MobiusC = Mobius.connect(provider.getSigner(carol.address));

        // stake 14 ETH to get 17500 moUSD
        await MobiusA.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(14)});
        expect((await moUSD.balanceOf(alice.address)).toString()).to.eq("17500000000000000000000")
        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("17500000000000000000000")
        
        await delay(1000);

        await MobiusB.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(8)});
        await delay(1000);

        await MobiusC.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(8)});
        await delay(1000);
        
        // user1 long moTSLA for 17500 moUSD 
        await MobiusA.trade(formatBytes32String("moUSD"),expandTo18Decimals(17500),formatBytes32String("moTSLA"));
        await delay(1000);

        //user2 short moTSLA for 8 ETH as collateral
        await MobiusB.shortFromCoin(formatBytes32String("moTSLA"),expandTo16Decimals(200),{value:expandTo18Decimals(14)});
        await delay(1000);

        await MobiusOracle.setPrice(formatBytes32String("moTSLA"),expandTo18Decimals(1400));
        await delay(1000);

        expect((await Issuer.getDebt(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("17483295454545454545455");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),bob.address,formatBytes32String("moUSD"))).toString()).to.eq("9990454545454545454546");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),bob.address,formatBytes32String("moTSLA"))).toString()).to.eq("24988068181818181819");
        expect((await Issuer.getDebt(formatBytes32String("ETH"),carol.address,formatBytes32String("moUSD"))).toString()).to.eq("9990454545454545454546");
    })

    it('liquidator',async () => {
        await Mobius.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(16)});
        let ethBalanceBefore = await alice.getBalance();
        await MobiusOracle.setPrice(formatBytes32String("ETH"),expandTo18Decimals(1500))

        let liquidable = await Liquidator.getLiquidable(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"));
        expect(liquidable.toString()).to.eq("16494845360824742268041");
        await delay(2000);
        await Liquidator.setDeadline(formatBytes32String("ETH"),Math.floor(Date.now()/ 1000) + 60);
        await Liquidator.setDeadline(formatBytes32String("MOT"),Math.floor(Date.now()/ 1000) + 60);
        await expect(Mobius.liquidate(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"),bigNumberify("16494845360824742268041"))).to.be.revertedWith('can not liquidate until deadline');
        await Liquidator.setDeadline(formatBytes32String("ETH"),0);
        await Mobius.liquidate(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"),bigNumberify("16494845360824742268041"));
        let ethBalanceAfter = await alice.getBalance();
        expect(ethBalanceAfter.sub(ethBalanceBefore).div(bigNumberify(1e14)).toString()).to.equal('111917');
        expect((await provider.getBalance("0x0FeefeefeEFeeFeefeEFEEFEEfEeFEeFeeFeEfEe")).toString()).to.equal('131958762886597938');
        expect((await Staker.getCollateralRate(formatBytes32String("ETH"),alice.address,formatBytes32String("moUSD"))).toString()).to.eq("2000000000000000000");;
    })

    it('Stats',async () => {
        let Stats = await deployContract(alice,StatsJson,[resolver.address]);
        await Stats.refreshCache();

        await Mobius.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(16)});
        await MobiusToken.airdrop(alice.address,expandTo18Decimals(1000));
        await delay(1000);
        await MobiusToken.approve(Mobius.address,expandTo18Decimals(1000));
        await delay(1000);
        await Mobius.mintFromToken(formatBytes32String("MOT"),expandTo18Decimals(1000),expandTo16Decimals(600));

        let staked = await Stats.getTotalStakedValue([],[],alice.address);
        expect(staked.toString()).to.eq("45000000000000000000000");
    })

    it('gas used',async () => {
        const tx = await Mobius.mintFromCoin(expandTo16Decimals(200),{value:expandTo18Decimals(16)});
        const receipt = await tx.wait()
        console.log("gasUsed for mint: " + receipt.gasUsed.toString());

        await delay(1000);
        const tx2 = await Mobius.burn(formatBytes32String("ETH"),formatBytes32String("moUSD"), expandTo18Decimals(1250),false)
        const receipt2 = await tx2.wait()
        console.log("gasUsed for burn: " + receipt2.gasUsed.toString());

        await delay(1000);
        const tx3 = await Mobius.trade(formatBytes32String("moUSD"),expandTo18Decimals(10000),formatBytes32String("moTSLA"));
        const receipt3 = await tx3.wait()
        console.log("gasUsed for trade: " + receipt3.gasUsed.toString());

        await delay(1000);
        const tx4 = await Mobius.shortFromCoin(formatBytes32String("moTSLA"),expandTo16Decimals(200),{value:expandTo18Decimals(8)});
        const receipt4 = await tx4.wait()
        console.log("gasUsed for short: " + receipt4.gasUsed.toString());
    })
})
