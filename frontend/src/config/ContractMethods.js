import { 
    MobiusContract, MotContract, DaiContract, EthContract,
    MousdContract, TslaContract, MobtcContract, MoethContract, MoxauContract,
    SettingContract,
    AssetPriceContract,
    TraderContract,
    StakerContract,
    IssuerContract,
    RewardCollateralContract, RewardTradingContract,
    StatsContract
} from './NewContract'
import { ethers } from 'ethers';
import { Provider } from './NewContract'
import Contract from './Contract'
import { toFixedVal } from '@/common/utils/filters'
import { notification } from 'ant-design-vue'
import { getGasPrice } from '@/common/utils/bigNumber'

/**
 * method: get balance
 * @param coinName 
 * @param account 
 */
export const getBalance = async (coinName, account, isNeedMaxBalance = false) => {
    try {
        let contract = ''
        let bigBalance = 0
        switch (coinName) {
            case 'MATIC':
                contract = Provider.providerInstance
                break
            case 'ETH':
                contract = EthContract
                break
            case 'DAI':
                contract = DaiContract
                break
            case 'MOT':
                contract = MotContract
                break
            case 'moUSD':
                contract = MousdContract
                break
            case 'moTSLA':
                contract = TslaContract
                break
            case 'moBTC':
                contract = MobtcContract
                break
            case 'moETH':
                contract = MoethContract
            break
            case 'moXAU':
                contract = MoxauContract
            break
            default:
                break
        }
        if (coinName === 'MATIC') {
            bigBalance = await contract.getBalance(account)
        } else {
            bigBalance = await contract.balanceOf(account)
        }
        if (isNeedMaxBalance) {
            let maxBalance = ethers.utils.formatEther(bigBalance)
            let balance =  parseFloat(maxBalance)
            return { balance, maxBalance }
        } else {
            let balance = ethers.utils.formatEther(bigBalance)
            return parseFloat(balance)
        }
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    } 
}

export const getAssetsBalance = async (coinName, account) => {
    try {
        let contract = ''
        let bigBalance = 0
        switch (coinName) {
            case 'MATIC':
                contract = Provider.providerInstance
                break
            case 'ETH':
                contract = EthContract
                break
            case 'DAI':
                contract = DaiContract
                break
            case 'MOT':
                contract = MotContract
                break
            case 'moUSD':
                contract = MousdContract
                break
            case 'moTSLA':
                contract = TslaContract
                break
            case 'moBTC':
                contract = MobtcContract
                break
            case 'moETH':
                contract = MoethContract
            break
            case 'moXAU':
                contract = MoxauContract
            break
            default:
                break
        }
        if (coinName === 'MATIC') {
            bigBalance = await contract.getBalance(account)
        } else {
            bigBalance = await contract.balanceOf(account)
        }
        let maxBalance = ethers.utils.formatEther(bigBalance)
        let balance = parseFloat(maxBalance)
        return { balance, maxBalance }
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    } 
}

/**
 * method: 
 * @param coinName 
 * @param account 
 */
export const totalSupply = async (coinName) => {
    try {
        let contract = ''
        let bigBalance = 0
        switch (coinName) {
            case 'moUSD':
                contract = MousdContract
                break
            case 'moTSLA':
                contract = TslaContract
                break
            case 'moBTC':
                contract = MobtcContract
                break
            case 'moETH':
                contract = MoethContract
            break
            case 'moXAU':
                contract = MoxauContract
            break 
            default:
                break
        }
        bigBalance = await contract.totalSupply()
        let balance = ethers.utils.formatEther(bigBalance)
        return toFixedVal(balance)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
    
}

/**
 * method:
 * @param asset 
 * @param debtType 
 */
export const getLiquidationRate = async (asset, debtType) => {
    try {
        let assetByte32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let lin = await SettingContract.getLiquidationRate(assetByte32, debtTypeByte32)
        let rate = ethers.utils.formatUnits(lin)
        return toFixedVal(rate)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method:
 * @param asset 
 * @param debtType 
 */
export const getCollateralRate = async (asset, debtType) => {
    try {
        let assetByte32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let lin = await SettingContract.getCollateralRate(assetByte32, debtTypeByte32)
        let rate = ethers.utils.formatUnits(lin)
        return toFixedVal(rate)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const getStakeCollateralRate = async (asset, account, debtType) => {
    try {
        let assetByte32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let lin = await StakerContract.getCollateralRate(assetByte32, account, debtTypeByte32)
        let rate = ethers.utils.formatUnits(lin)
        return toFixedVal(rate)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method:
 * @param asset 
 */
export const getPrice = async (asset) => {
    try {
        let assetByte32 = ethers.utils.formatBytes32String(asset)
        let orcalPrice = await AssetPriceContract.getPrice(assetByte32)
        let price = ethers.utils.formatEther(orcalPrice)
        return toFixedVal(price)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method:
 * @param asset 
 * @param debtType 
 * @param account 
 * @returns 
 */
export const getStaked = async (asset, debtType, account) => {
    try {
        let assetByte32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let balance = await StakerContract.getStaked(assetByte32, account, debtTypeByte32)
        return parseFloat(ethers.utils.formatEther(balance))
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method:
 * @param asset 
 * @param debtType 
 * @param account 
 * @returns 
 */
export const getDebt = async (asset, debtType, account) => {
    try {
        let assetByte32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let balance = await IssuerContract.getDebt(assetByte32, account, debtTypeByte32)
        return parseFloat(ethers.utils.formatEther(balance)) // toFixedVal()  
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method:
 * @param coinName 
 * @param amount 
 */
export const approve = async (coinName, amount) => {
    try {
        let contract = ''
        let address = Contract['mobiusContract'].address
        switch (coinName) {
            case 'ETH':
                contract = EthContract
                break
            case 'DAI':
                contract = DaiContract
                break
            case 'MOT':
                contract = MotContract
                break
            default:
                break
        }
        let amountTo = ethers.utils.parseEther(amount + '')
        let approveObj = await contract.approve(address, amountTo, { gasPrice: getGasPrice() })
        if (approveObj && approveObj.hash) {
            return approveObj.hash
        } else {
            return ''
        } 
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

/**
 * method:
 * @param rate 
 * @param amount 
 */
export const mintFromCoin = async (rate, amount) => {
    try {
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.mintFromCoin(rate, { value: counAmont, gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

/**
 * method:
 * @param rate 
 * @param amount 
 * @param asset 
 */
export const mintFromToken = async (rate, amount, asset) => {
    try {
        let counAmont = ethers.utils.parseEther(amount + '')
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let transactionResult = await MobiusContract.mintFromToken(assetBytes32, counAmont, rate, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        } 
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

/**
 * @param {*} collateral 
 * @param {*} moASSET 
 * @param {*} amount 
 */
export const getTradingAmountAndFee = async (collateral, moASSET, amount) => {
    try {
        let fromSynth = ethers.utils.formatBytes32String(collateral)
        let fromAmount = ethers.utils.parseEther(amount + '')
        let toSynth = ethers.utils.formatBytes32String(moASSET)
        let traderObj = await TraderContract.getTradingAmountAndFee(fromSynth, fromAmount, toSynth)
        let fromSynthPrice = toFixedVal(ethers.utils.formatEther(traderObj.fromSynthPrice))
        let toSynthPrice = toFixedVal(ethers.utils.formatEther(traderObj.toSynthPirce))
        let tradingAmount = parseFloat(ethers.utils.formatEther(traderObj.tradingAmount))
        let tradingFee = toFixedVal(ethers.utils.formatEther(traderObj.tradingFee))
        let price = toFixedVal(fromSynthPrice / toSynthPrice)
        return { price, fromSynthPrice, toSynthPrice, tradingAmount, tradingFee }  
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * 
 * @param asset 
 * @param account 
 * @param debtType 
 * @param rate 
 */
export const getClaimable = async (asset, account, debtType, collateralRate) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let rate = ethers.utils.parseEther(collateralRate + '')
        let info = await StakerContract.getClaimable(assetBytes32, account, debtTypeByte32, rate)
        let amount = ethers.utils.formatEther(info)
        return toFixedVal(amount)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method: satked MATIC
 * @param {*} debtType 
 * @param {*} amount 
 */
export const stakeFromCoin = async (debtType, amount) => {
    try {
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.stakeFromCoin(debtTypeByte32, {value: counAmont, gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method: satked
 * @param {} asset 
 * @param {*} debtType 
 * @param {*} amount 
*/
export const stakeFromToken = async (asset, debtType, amount) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.stakeFromToken(assetBytes32, debtTypeByte32, counAmont, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * method: unSatked
 * @param {} asset 
 * @param {*} debtType 
 * @param {*} amount 
*/
export const claim = async (asset, debtType, amount) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.claim(assetBytes32, debtTypeByte32, counAmont, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

/**
 * method: burn
 * @param {} asset 
 * @param {*} debtType 
 * @param {*} amount 
 * @param {*} isBack
*/
export const burn = async (asset, debtType, amount, isBack) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.burn(assetBytes32, debtTypeByte32, counAmont, isBack, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

/**
 * 
 * @param {*} asset 
 * @param {*} debtType 
 * @param {*} amount 
 */
export const trade = async (asset, debtType, amount) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.trade(assetBytes32, counAmont, debtTypeByte32, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

/**
 *
 * @param {*} asset 
 */
export const getTradingFeeRate = async (asset) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let fee = await SettingContract.getTradingFeeRate(assetBytes32)
        let price = ethers.utils.formatEther(fee)
        return toFixedVal(price)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const getDebtOriginal = async (asset, account, debtType) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let accountDebt = await IssuerContract.getDebtOriginal(assetBytes32, account, debtTypeByte32)
        let balance = ethers.utils.formatEther(accountDebt[0])
        return toFixedVal(balance)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const shortFromCoin = async (debtType, rate, amount) => {
    try {
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.shortFromCoin(debtTypeByte32, rate, {value: counAmont, gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        } 
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

export const shortFromToken = async (asset, amount, debtType, rate) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.shortFromToken(assetBytes32, counAmont, debtTypeByte32, rate, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

export const getIssuable = async (asset, account, debtType) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let price = await IssuerContract.getIssuable(assetBytes32, account, debtTypeByte32)
        let balance = ethers.utils.formatEther(price)
        return toFixedVal(balance)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const mintFromPreviousStake = async (asset, amount) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.mintFromPreviousStake(assetBytes32, counAmont, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

export const shortFromPreviousStake = async (asset, debtType, amount) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeBytes32 = ethers.utils.formatBytes32String(debtType)
        let counAmont = ethers.utils.parseEther(amount + '')
        let transactionResult = await MobiusContract.shortFromPreviousStake(assetBytes32, debtTypeBytes32, counAmont, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        notification['error']({
            message: 'Tip',
            description: error.message,
        })
        return ''
    }
}

export const getDebtOriginalToObj = async (asset, account, debtType) => {
    try {
        let assetBytes32 = ethers.utils.formatBytes32String(asset)
        let debtTypeByte32 = ethers.utils.formatBytes32String(debtType)
        let accountDebt = await IssuerContract.getDebtOriginal(assetBytes32, account, debtTypeByte32)
        let debtAmount = parseFloat(ethers.utils.formatEther(accountDebt[0]))
        let originalDebt = parseFloat(ethers.utils.formatEther(accountDebt[1]))
        return {debtAmount, originalDebt } 
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const getDynamicTotalDebt = async () => {
    try {
        let platTotalDebt = await IssuerContract.getDynamicTotalDebt()
        let balance = ethers.utils.formatEther(platTotalDebt[0])
        return toFixedVal(balance)
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

/**
 * 
 */
export const poolLength = async () => {
    try {
        let lengthBigNumber = await RewardCollateralContract.poolLength()
        let lenth = lengthBigNumber.toNumber()
        return lenth 
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const poolInfo = async (i) => {
    try {
        let listData = await RewardCollateralContract.poolInfo(i)
        let totalStakeAmount = listData.totalStakeAmount
        let poolName = listData.poolName
        let allocPoint = listData.allocPoint.toNumber()
        let totalAmount = toFixedVal(ethers.utils.formatEther(totalStakeAmount))
        let assetsName = ethers.utils.parseBytes32String(poolName)
        return { totalAmount, assetsName, allocPoint } 
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const tradPoolInfo = async (i) => {
    try {
        let listData = await RewardTradingContract.poolInfo(i)
        let allocPoint = listData.allocPoint.toNumber()
        return allocPoint 
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const motPerBlock = async () => {
    let motPerBlock = await RewardCollateralContract.motPerBlock()
    let totalAmount = toFixedVal(ethers.utils.formatEther(motPerBlock))
    return totalAmount
}

export const totalAllocPoint = async () => {
    let amount = await RewardCollateralContract.totalAllocPoint()
    let totalAllocPoint = amount.toNumber()
    return totalAllocPoint
}

/**
 * 
 * @param {*} poolName 
 * @param {*} account 
 * @returns
 */
export const pendingMOT = async (poolName, account) => {
    let poolNameByte32 = ethers.utils.formatBytes32String(poolName)
    let amount = await RewardCollateralContract.pendingMOT(poolNameByte32, account)
    let balance = toFixedVal(ethers.utils.formatEther(amount))
    return balance
}

/**
 * 
 * @param {*} poolName 
 * @returns
 */
export const withdraw = async (poolName) => {
    try {
        let poolNameByte32 = ethers.utils.formatBytes32String(poolName)
        let transactionResult = await RewardCollateralContract.withdraw(poolNameByte32, { gasPrice: getGasPrice() })
        if (transactionResult && transactionResult.hash) {
            return transactionResult.hash
        } else {
            return ''
        }
    } catch (error) {
        // notification['error']({
        //     message: 'Tip',
        //     description: error.message,
        // })
        return ''
    }
}

export const getUserReward = async (pid) => {
    let res = await RewardTradingContract.getUserReward(pid)
    let amount = ethers.utils.formatEther(res[0])
    return amount
}

export const tradingWithdraw = async (pid) => {
    let transactionResult = await RewardTradingContract.Wthdraw(pid, { gasPrice: getGasPrice() })
    if (transactionResult && transactionResult.hash) {
        return transactionResult.hash
    } else {
        return ''
    }
}

export const getTotalStakedValue = async (assetsArray = [], moAssetsArray = [], account) => {
    let assetsList = []
    if (assetsArray.length) {
        assetsArray.forEach((item) => {
            assetsList.push(ethers.utils.formatBytes32String(item))
        })
    }
    let moAssetsList = []
    if (moAssetsArray.length) {
        moAssetsArray.forEach((item) => {
            moAssetsList.push(ethers.utils.formatBytes32String(item))
        })
    }
    let totalStakedValue = await StatsContract.getTotalStakedValue(assetsList, moAssetsList, account)
    return ethers.utils.formatEther(totalStakedValue)
}