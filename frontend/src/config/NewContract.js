import Contract from '@/config/Contract.js'
import Providers from "@/common/utils/Providers.js"
import baseContract from "@/common/utils/BaseContract.js"
export const Provider = new Providers()
const BaseContract = new baseContract(Provider.providerInstance)

export const MobiusContract = BaseContract.createContract(Contract['mobiusContract'].address, Contract['mobiusContract'].abi)

export const MotContract = BaseContract.createContract(Contract['motContract'].address, Contract['motContract'].abi)
export const DaiContract = BaseContract.createContract(Contract['daiContract'].address, Contract['daiContract'].abi)
export const MaticContract = BaseContract.createContract(Contract['maticContract'].address, Contract['maticContract'].abi)
export const EthContract = BaseContract.createContract(Contract['ethContract'].address, Contract['ethContract'].abi)

export const MousdContract = BaseContract.createContract(Contract['synthContract'].mousdAddress, Contract['synthContract'].abi)
export const TslaContract = BaseContract.createContract(Contract['synthContract'].moTSLAAddress, Contract['synthContract'].abi)
export const MobtcContract = BaseContract.createContract(Contract['synthContract'].moBTCAddress, Contract['synthContract'].abi)
export const MoethContract = BaseContract.createContract(Contract['synthContract'].moETHAddress, Contract['synthContract'].abi)
export const MoxauContract = BaseContract.createContract(Contract['synthContract'].moXAUAddress, Contract['synthContract'].abi)

export const SettingContract = BaseContract.createContract(Contract['settingContract'].address, Contract['settingContract'].abi)

export const AssetPriceContract = BaseContract.createContract(Contract['assetPriceContract'].address, Contract['assetPriceContract'].abi)

export const TraderContract = BaseContract.createContract(Contract['traderContract'].address, Contract['traderContract'].abi)

export const StakerContract = BaseContract.createContract(Contract['stakerContract'].address, Contract['stakerContract'].abi)

export const IssuerContract = BaseContract.createContract(Contract['issuerContract'].address, Contract['issuerContract'].abi)

export const DynamicTradingFeeContract = BaseContract.createContract(Contract['dynamicTradingFeeContract'].address, Contract['dynamicTradingFeeContract'].abi)

export const RewardCollateralContract = BaseContract.createContract(Contract['rewardCollateralContract'].address, Contract['rewardCollateralContract'].abi)
export const RewardStakingContract = BaseContract.createContract(Contract['rewardStakingContract'].address, Contract['rewardStakingContract'].abi)
export const RewardTradingContract = BaseContract.createContract(Contract['rewardTradingContract'].address, Contract['rewardTradingContract'].abi)

export const StatsContract = BaseContract.createContract(Contract['statsContract'].address, Contract['statsContract'].abi)
