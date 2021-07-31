import {
    MotAbi, MoUSDAbi, SettingAbi, MobiusOracleAbi,
    MobiusAbi, AssetPriceAbi, IssuerAbi, TraderAbi,
    StakerAbi, DaiAbi, dynamicTradingFeeAbi,
    RewardCollateralAbi, RewardStakingAbi, RewardTradingAbi,
    StatsAbi
} from './abi.js'

export default {
    motContract: {
        address: '0xf27c8Adc6C8dC734e61526AAe79339F060Ee72F1',
        abi: MotAbi
    },

    synthContract: {
        mousdAddress: '0xA99Ab1f1BD1Aa3431Ea7F482c46Dac7759A3aE31',
        moTSLAAddress: '0x9c37EB06C91bD4A53eCD78D66fF249F9d9C1894c',
        moBTCAddress: '0xB993EaC3A9A3f0ae8e1E3910861596f8391954f8',
        moETHAddress: '0x75513c1c59807d7666a19bd657505aEC9F0BC299',
        moXAUAddress: '0xD8B5Ee872429b6B50c17c8621374D1948f632f47',
        abi: MoUSDAbi
    },
 
    settingContract: {
        address: '0x61f45eeb85eC18C648313D127AEb82F602f7EE4B',
        abi: SettingAbi
    },

    mobiusOracleContract: {
        address: '0xc2b2742e8A67a2D32760e0Af1dfF42a2E672c582',
        abi: MobiusOracleAbi
    },

    mobiusContract: {
        address: '0x5828a3E17b2A516364B2dE28D8c58f83B6473dBa',
        abi: MobiusAbi
    },

    assetPriceContract: {
        address: '0x0Bd4BA49858F2Ff96448933E57F5525838b971e2',
        abi: AssetPriceAbi
    },

    issuerContract: {
        address: '0x554683B9a80B10D83f83070F557471F1984bc819',
        abi: IssuerAbi
    },

    traderContract: {
        address: '0xfc02E052D2979B65A88BdcedcA86e25a0aAa2997',
        abi: TraderAbi
    },

    stakerContract: {
        address: '0x7094337534732Ea3DEe73a73E5D9F95C0D003231',
        abi: StakerAbi
    },

    daiContract: {
        address: '0x4A1B31B1bD1C691622bB27a55155C01137bD532c',
        abi: DaiAbi
    },

    maticContract: {
        address: '0x22aA1C675A6C14CD90f871c6f26b3E1391230e03',
        abi: DaiAbi
    },

    ethContract: {
        address: '0x73345D8eD29af08132281c5d617d14C66dE73429',
        abi: DaiAbi
    },

    dynamicTradingFeeContract: {
        address: '0xd309544b02473e4caA52Fb57C0Da39Eca768A689',
        abi: dynamicTradingFeeAbi
    },

    rewardCollateralContract: {
        address: '0x000F20997f87aBf01FEB45AB6d013Dd0251650cf',
        abi: RewardCollateralAbi
    },

    rewardStakingContract: {
        address: '0x95AdDa57c2631652cbE024A9008A242d8E41e9e0',
        abi: RewardStakingAbi
    },

    rewardTradingContract: {
        address: '0xdA820bB3Feb8c2DB59D8B028D5cA8934d75b1082',
        abi: RewardTradingAbi
    },

    statsContract: {
        address: '0x91FC2587675359D40a168eB0c4eC5655e5134c44',
        abi: StatsAbi
    }
}