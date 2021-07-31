<template>
    <div class="components-mintForm">
        <a-form-model ref="ruleForm" :model="formModel" :rules="rules">
            <a-form-model-item prop="coinCount">
                <div class="inp-item">
                    <div class="title-area">
                        <div class="collateral">{{$t('mintAndBurn.collateral')}}</div>
                        <div class="balance">
                            {{$t('mintAndBurn.balance')}}: 
                            <a-spin v-if="loadding" :spinning="loadding"/>
                            <a-statistic v-else :value="formModel.cointBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                        </div>
                    </div>

                    <div class="form-wrapper">
                        <a-input-number class="inp" :disabled="loadding" v-model="formModel.coinCount" :min="0" placeholder="0.0" autoFocus />
                        <div class="right-max">
                            <div class="select" @click="selectCoinClick">
                                <img class="img" v-if="formModel.baseCoinName" :src="require(`../../assets/img/logo_${formModel.baseCoinName}.png`)" />
                                <span>{{formModel.baseCoinName}}</span> <a-icon type="down" />
                            </div>
                            <div class="max-but"  @click="maxCoinClick()">MAX</div>
                        </div>
                    </div>
                </div>
            </a-form-model-item>

            <div class="position-block">
                <img class="position-img" src="../../assets/img/swap.png" />
            </div>

            <a-form-model-item>
                <div class="inp-item">
                    <div class="title-area">
                        <div class="collateral">moUSD</div>
                        <div class="balance">
                            {{$t('mintAndBurn.balance')}}: 
                            <a-spin v-if="loadding" :spinning="loadding"/>
                            <a-statistic v-else :value="formModel.moUSDBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                        </div>
                    </div>

                    <div class="form-wrapper">
                        <a-input-number class="inp" disabled v-model="formModel.mousdCount" :min="0" placeholder="0.0" :precision="6" autoFocus />
                        <div class="right-max">
                            <div class="">
                                <img class="img" v-if="formModel.tokenName" :src="require(`../../assets/img/logo_${formModel.tokenName}.png`)" />
                                {{formModel.tokenName}}
                            </div>
                        </div>
                    </div>
                </div>
            </a-form-model-item>

            <div class="chart-content">
                <div class="chart-bottom">
                    <span>
                        <span class="lable">{{$t('mintAndBurn.liqRatio')}}:</span>
                        <a-spin style="margin: 0 10px;" v-if="loadding" :spinning="loadding"/>
                        <a-statistic class="lable-price" v-else :value="mintValue" :precision="2" suffix="%" style="margin-right: 5px" />
                        <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{$t('mintAndBurn.liqRatioTip')}}</span>
                            </template>
                            <a-icon class="icon" type="question-circle" />
                        </a-tooltip>
                    </span>

                    <span style="margin-left: 10px;">
                        <span class="lable">{{$t('mintAndBurn.minRatio')}}:</span>
                        <a-spin style="margin: 0 10px;" v-if="loadding" :spinning="loadding"/>
                        <a-statistic class="lable-price" v-else :value="formModel.safe * 100" :precision="2" suffix="%" style="margin-right: 5px" />
                        <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{$t('mintAndBurn.minRatioTip')}}</span>
                            </template>
                            <a-icon class="icon" type="question-circle" />
                        </a-tooltip>
                    </span>

                    <span style="margin-left: 10px;">
                        <span class="lable">{{$t('mintAndBurn.recommended')}}:</span>
                        <a-statistic class="lable-price" :value="defaultRateValue" :precision="2" suffix="%" style="margin-right: 5px" />
                        <!-- <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{$t('mintAndBurn.recommendedTip')}}</span>
                            </template>
                            <a-icon class="icon" type="question-circle" />
                        </a-tooltip> -->
                    </span>
                </div>

                <CsSlider ref="CsSlirderRef" @sliderChange="sliderChange" :minValue="mintValue"
                    :maxValue="formModel.maxSafe" :defaultValue="defaultRateValue" :safeValue="formModel.safe * 100" />

                <div class="tx-free">
                    <div class="lable">
                        {{$t('mintAndBurn.price')}} 
                        <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{$t('mintAndBurn.priceTip')}}</span>
                            </template>
                            <a-icon class="icon" type="question-circle" />
                        </a-tooltip></div>
                    <div class="cut-line"></div>
                    <div class="ust">{{formModel.priceScale}}</div>
                </div>
            </div>

            <a-form-model-item>
                <a-button v-if="account" :disabled="!Number(formModel.coinCount) || formModel.isOverflowBalance"
                    :class="Number(formModel.coinCount) && !formModel.isOverflowBalance ? 'but' : 'disableBut'"
                    :loading="mintButtonLoading" @click="mintClick">
                    {{formModel.isOverflowBalance ? $t('modal.insufficientBalance') : $t('mintAndBurn.mintBut')}}
                </a-button>
                <a-button v-else class="but connect-but" @click="connectMetaMaskClick">CONNECT</a-button>
            </a-form-model-item>
        </a-form-model>

        <CsConfirmModal ref='CsConfirmModalRef' @ConfirmMintClick="ConfirmMintClick"></CsConfirmModal>
        <CsWatingModal ref='CsWatingModalRef' @ConfirmMintClick="ConfirmMintClick" @cancelClick="cancelClick"></CsWatingModal>
        <CsSelectCoinModal ref="CsSelectCoinModalRef" @selectCoinCallback="selectCoinCallback" />
    </div>
</template>

<script>
import { AssetsList, AssetsHotList } from '@/config/RewardCollateralDeal.js'
import { getBalance, getLiquidationRate, getCollateralRate, getStaked, getDebt, getPrice, approve, mintFromCoin, mintFromToken } from '@/config/ContractMethods'
import CsConfirmModal from '@/components/plugins/CsConfirmModal/index.vue'
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import CsSelectCoinModal from '@/components/plugins/CsSelectCoinModal'
import CsSlider from '@/components/plugins/CsSlider'
import { toFixedVal } from '@/common/utils/filters'

export default {
    components: {
        CsConfirmModal,
        CsWatingModal,
        CsSelectCoinModal,
        CsSlider
    },

    data () {
        return {
            formModel: {
                baseCoinName: '',
                cointBalance: 0,
                coinMaxBalance: 0,
                tokenName: '',
                coinCount: '',
                mousdCount: '',
                moUSDBalance: 0,
                lin: '',
                safe: 0,
                collateralRate: '',
                _userAddr: '',
                unitPrice: '',
                priceScale: '',
                txFree: '',
                maxSafe: 0,
                safeValue: 0,
                isOverflowBalance: false
            },
            rules: {
                coinCount: [
                    { 
                        required: true,
                        validator: (rule, value, callback) => {
                            if (!value || Number(value) > Number(this.formModel.cointBalance)) {
                                callback(new Error(" "))
                            }
                            callback()
                        }
                    }
                ]
            },
            mintButtonLoading: false,
            loadding: false,
            provider: this.$Provider.providerInstance,
            dateType: 'd',
            showToolTip: true,
            totalAssetsAmount: '',
            totalDebtAmount: '',
            oldRate: '',
            newRate: '',
            account: this.$store.state.account,
            mintValue: 0,
            defaultRateValue: 0
        }
    },

    watch: {
        'formModel.coinCount': {
            handler (newVal, oldVal) {
                if (Number(newVal) > Number(this.formModel.cointBalance)) {
                    this.formModel.isOverflowBalance = true
                } else if (newVal != oldVal && newVal && typeof newVal === 'number' && !isNaN(newVal)) {
                    this.formModel.isOverflowBalance = false
                } else {
                    this.formModel.isOverflowBalance = false
                    this.formModel.mousdCount = ''
                }
                this.dsyncCountMousdMount(Number(newVal))
            }
        },

        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        },
    },

    created () {
        if (this.account) {
            this.initData()
        }
    },

    methods: {
        initData () {
            let { baseCoinName, tokenName } = this.$route.query
            this.formModel.baseCoinName = baseCoinName || 'MATIC'
            this.formModel.tokenName = tokenName || 'moUSD'
            this.formModel.coinCount = ''
            this.formModel.mousdCount = ''
            if (this.account) {
                this.initBalance(this.formModel.baseCoinName)
            }
        },

        async initBalance (coinName, account = this.account) {
            this.loadding = true
            this.getData(coinName, account).then((res) => {
                this.loadding = false
                this.totalAssetsAmount = res.totalStaked
                this.totalDebtAmount = res.totalDebt
                this.oldRate = res.totalStaked / res.totalDebt
                this.dsyncCountMousdMount()
            })
        },

        async getData (coinName, account) {
            let assetBalancePromise = getBalance(coinName, account, true)
            let mousdBalancePromise = getBalance('moUSD', account)
            let linRatePromise = getLiquidationRate(coinName, 'moUSD')
            let safeRatePromise = getCollateralRate(coinName, 'moUSD')
            let totalStakedPromise = getStaked(coinName, 'moUSD', account)
            let totalDebtPromise = getDebt(coinName, 'moUSD', account)
            let orcalPricePromise = getPrice(coinName)
            
            let { balance, maxBalance } = await assetBalancePromise
            this.formModel.cointBalance = balance
            this.formModel.coinMaxBalance = maxBalance
            if (coinName === 'MOT') {
                this.$store.commit("setMotBalance", { balance })
            }
            let linRate = this.formModel.lin = await linRatePromise
            this.formModel.safe = await safeRatePromise
            let totalStaked = await totalStakedPromise
            let totalDebt = await totalDebtPromise
            this.formModel.unitPrice = await orcalPricePromise
            this.formModel.moUSDBalance = await mousdBalancePromise

            // this.formModel.safeValue = this.formModel.safe * 100
            this.formModel.maxSafe = this.formModel.safe * 1000
            if (coinName === 'MOT') {
                this.defaultRateValue = 800
            } else if (coinName === 'MATIC') {
                this.defaultRateValue = 500
            } else if (coinName === 'ETH') {
                this.defaultRateValue = 200
            } else if (coinName === 'DAI') {
                this.defaultRateValue = 150
            }
            this.formModel.safeValue = this.defaultRateValue
            this.formModel.priceScale = `1${coinName}≈${this.formModel.unitPrice} USD`
            let resMinValue = (linRate * 100).toFixed(2)
            this.mintValue = parseFloat(resMinValue)
            return { totalStaked, totalDebt }
        },

        maxCoinClick () {
            this.formModel.coinCount = toFixedVal(this.formModel.cointBalance)
            this.$refs.ruleForm.validateField('coinCount')
        },

        dsyncCountMousdMount (coinAmount) {
            let liquidationRate = 0
            let liquidationPrice = 0
            let rateStatus = 0
            let availableAmount = parseFloat(this.formModel.cointBalance)
            let mousdBalance = parseFloat(this.formModel.moUSDBalance)
            let totalMousdDebt = this.totalDebtAmount || 0
            let totalAssetsAmount = parseFloat(this.totalAssetsAmount) || 0
            let oldRate = this.totalDebtAmount ? (this.totalAssetsAmount * this.formModel.unitPrice / this.totalDebtAmount) * 100 : 0
            if (coinAmount) {
                this.formModel.mousdCount = (coinAmount * this.formModel.unitPrice * 100) / this.formModel.safeValue
                totalMousdDebt += parseFloat(this.formModel.mousdCount)
                totalAssetsAmount += coinAmount
                mousdBalance += parseFloat(this.formModel.mousdCount)
                availableAmount -= parseFloat(coinAmount)
            } else {
                this.formModel.mousdCount = ''
            }
            if (totalAssetsAmount && totalMousdDebt) {
                liquidationPrice = toFixedVal((this.formModel.lin * totalMousdDebt) / totalAssetsAmount)
                liquidationRate = (totalAssetsAmount * this.formModel.unitPrice / totalMousdDebt) * 100
                if (this.formModel.coinCount) {
                    if (liquidationRate >= oldRate) {
                        rateStatus = 1
                    } else {
                        rateStatus = 2
                    }
                }
            }
            this.$emit('updateInfo', { 
                coinNmae: this.formModel.baseCoinName,
                liquidationPrice,
                liquidationRate,
                rateStatus,
                lin: this.formModel.lin,
                safeRate: this.formModel.safe,
                mousdBalance,
                availableAmount,
                stakeAmount: totalAssetsAmount,
                coinBalance: this.formModel.cointBalance
            })
        },

        initPriceScale (coinName) {
            this.formModel.priceScale = `1${coinName}≈${this.formModel.unitPrice} USD`
        },

        changeDay (type) {
            this.dateType = type
        },

        sliderChange ({ sliderVal }) {
            if (this.formModel.coinCount) {
                this.formModel.safeValue = sliderVal
                this.dsyncCountMousdMount(this.formModel.coinCount)
            }
        },

        selectCoinClick () {
            this.$refs.CsSelectCoinModalRef.show({
                currentCoinName: this.formModel.baseCoinName,
                assetsList: AssetsList,
                hotAssetsList: AssetsHotList
            })
        },

        selectCoinCallback ({ coinName }) {
            this.formModel.baseCoinName = coinName
            this.handleChange(coinName)
        },

        async handleChange (val) {
            this.formModel.coinCount = ''
            this.formModel.cointBalance = ''
            this.formModel.mousdCount = ''
            this.initBalance(val)
        },

        ressetFormData () {
            this.formModel.coinCount = ''
            this.formModel.mousdCount = ''
            this.initBalance(this.formModel.baseCoinName)
            this.mintButtonLoading = false
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('transaction: ===', transaction)
                this.ressetFormData()
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            })
        },

        mintClick () {
            let that = this
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.$refs.CsConfirmModalRef.show({
                        title: 'Mint',
                        topName: 'Collateral',
                        topBalance: that.formModel.cointBalance,
                        topAmount: that.formModel.coinCount,
                        topCoinName: that.formModel.baseCoinName,
                        bottomName: 'moUSD',
                        bottomBalance: that.formModel.moUSDBalance,
                        bottomAmount: that.formModel.mousdCount,
                        bottomCoinName: 'moUSD',
                        lin: that.formModel.lin,
                        safe: that.formModel.safe,
                        price: that.formModel.priceScale,
                        txFree: that.formModel.txFree
                    })
                }
            });
        },

        async ConfirmMintClick () {
            this.showWatingModal()
            let { formModel } = this
            this.mintButtonLoading = true
            let collateralRate = this.$ethers.utils.parseEther(this.formModel.safeValue / 100 + '')
            try {
                let transactionHash = ''
                let coinCount = 0
                if (formModel.coinCount === toFixedVal(formModel.cointBalance)) {
                    coinCount = formModel.coinMaxBalance // formModel.cointBalance
                } else {
                    coinCount = formModel.coinCount
                }
                if (formModel.baseCoinName === 'matic' || formModel.baseCoinName === 'MATIC') {
                    transactionHash = await mintFromCoin(collateralRate, coinCount)
                    if (transactionHash) {
                        this.listenerAccountbalance(transactionHash)
                        // let res = await this.$Provider.listenTradeStatus(transactionHash, [formModel.baseCoinName, 'moUSD'])
                        // console.log('res123===', res)
                    }
                }  else {
                    let hash = await approve(formModel.baseCoinName, coinCount)
                    if (hash) {
                        this.provider.once(hash, async (transaction) => {
                            console.log('transaction===', transaction)
                            transactionHash = await mintFromToken(collateralRate, coinCount, formModel.baseCoinName)
                            if (transactionHash) {
                                this.listenerAccountbalance(transactionHash)
                            }
                        })
                    }
                }
            } catch (error) {
                this.mintButtonLoading = false
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal () {
            this.$refs.CsWatingModalRef.show({
                topAmount: this.formModel.coinCount,
                topCoinName: this.formModel.baseCoinName,
                bottomAmount: this.formModel.mousdCount,
                bottomCoinName: 'moUSD',
                name: 'mint',
                status: 'wating'
            })
        },

        connectMetaMaskClick () {
            this.$Provider.checkLocalMetaMask()
        },

        cancelClick () {
            this.mintButtonLoading = false
        }
    }
}
</script>

<style lang="less" scoped>
/deep/.has-error .ant-form-explain, .has-error .ant-form-split {
    display: none;
}

/deep/.ant-form-item {
    margin: 0;
}

/deep/ .ant-calendar-picker:focus .ant-calendar-picker-input:not(.ant-input-disabled) {
    border: none;
    box-shadow: none;
}

/deep/.ant-input-affix-wrapper .ant-input:focus {
    border: none;
    border-bottom: 1px solid white !important;
    box-shadow: none;
}

/deep/ .ant-select-selection {
    background: #F6F7FB;
    border: none;
}

.components-mintForm {
    position: relative;
    .spin-content {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 100;
    }

    .inp-item {
        background: #F6F7FB;
        border-radius: 6px;
        padding: 10px 20px;
        .title-area {
            display: flex;
            width: 100%;
            justify-content: space-between;
            padding: 10px 0;
            .collateral {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #6A6972;
            }
            .balance {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #6A6972;
            }
        }

        .form-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .inp {
                flex: 1;
            }
            .right-max {
                display: flex;
                align-items: center;
                .max-but {
                    cursor: pointer;
                    margin-left: 15px;
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #5A208B;
                    width: 56px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    background: rgba(90, 32, 139, 0.1);
                    border-radius: 12px;
                }
                .max-but:hover {
                    opacity: .7;
                }
                .dal {
                    font-size: 14px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;
                    margin-right: 5px;
                }

                .select {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    .img {
                        width: 25px;
                        margin-right: 6px;
                    }
                }
                .img {
                    width: 25px;
                    margin-right: 6px;
                }
            }
        }
    }

    .chart-content {
        .chart-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 20px;
            .chart-header-left {
                .mir {
                    font-size: 24px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #6A6972;
                }
                .chart-price {
                    font-size: 24px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #37373C;
                    margin-left: 15px;
                }
            }

            .chart-header-right {
                display: flex;
                align-items: center;
                div {
                    background: #F0F0F0;
                    border: 1px solid #A6A6B3;
                    border-radius: 50%;
                    margin: 0 5px;
                    font-size: 16px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #A6A6B3;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    
                }
                .active {
                    color: #5A208B;
                    border: 1px solid #5A208B;
                }
            }
        }

        .chart-area {
            width: 100%;
            height: 150px;
        }

        .chart-bottom {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            .lable {
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
            .lable-price {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #37373C;
                margin: 0 10px;
            }

            /deep/ .ant-statistic-content {
                font-size: 16px;
                font-weight: 500;
                color: #37373C;
            }
            .icon {
                cursor: pointer;
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
        }

        .tx-free {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 30px;
            margin-bottom: 20px;
            .lable {
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
            .cut-line {
                flex: 1;
                height: 1px;
                border: 1px dashed #f3f3f7;
                margin: 0 10px;
            }
            .ust {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #37373C;
            }
        }
    }

    .position-block {
        position: relative;
        margin: auto;
        text-align: center;
        height: 15px;
        .position-img {
            cursor: pointer;
            position: absolute;
            width: 30px;
            z-index: 9;
            top: -8px;
        }
    }
}

@media screen and (max-width: 750px) {
    .components-mintForm {
        .inp-item {
            background: #F6F7FB;
            border-radius: 6px;
            padding: 10px 20px;
            .title-area {
                display: flex;
                width: 100%;
                justify-content: space-between;
                padding: 10px 0;
                .collateral {
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #6A6972;
                }
                .balance {
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #4E4A92;
                }
            }

            .form-wrapper {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #D6D6D6;
                .inp {
                    flex: 1;
                }
                .right-max {
                    display: flex;
                    align-items: center;
                    .max-but {
                        cursor: pointer;
                        margin-left: 15px;
                        font-size: 14px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #5A208B;
                        width: 56px;
                        height: 24px;
                        line-height: 24px;
                        text-align: center;
                        background: rgba(90, 32, 139, 0.1);
                        border-radius: 12px;
                    }
                    .dal {
                        font-size: 14px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                        margin-right: 5px;
                    }

                    .select {
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        .img {
                            width: 25px;
                            margin-right: 6px;
                        }
                    }
                }
            }
        }

        .chart-content {
            .chart-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 20px;
                .chart-header-left {
                    .mir {
                        font-size: 14px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #6A6972;
                    }
                    .chart-price {
                        font-size: 14px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #37373C;
                        margin-left: 15px;
                    }
                    .icp {
                        color: #FF8004;
                        font-size: 14px;
                    }
                }

                .chart-header-right {
                    display: flex;
                    align-items: center;
                    div {
                        background: #F0F0F0;
                        border: 1px solid #A6A6B3;
                        border-radius: 50%;
                        margin: 0 3px;
                        font-size: 12px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #A6A6B3;
                        cursor: pointer;
                        width: 16px;
                        height: 16px;
                        line-height: 16px;
                        text-align: center;
                        
                    }
                    .active {
                        color: #5A208B;
                        border: 1px solid #5A208B;
                    }
                }
            }

            .chart-bottom {
                display: flex;
                margin-top: 15px;
                .lable {
                    font-size: 14px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #6A6972;
                }
                .lable-price {
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #37373C;
                    margin: 0 10px;
                }
                .icon {
                    cursor: pointer;
                    font-size: 14px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #6A6972;
                }
            }

            .tx-free {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                .lable {
                    font-size: 14px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #6A6972;
                }
                .cut-line {
                    flex: 1;
                    height: 1px;
                    border: 1px dashed #f3f3f7;
                    margin: 0 10px;
                }
                .ust {
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #37373C;
                }
            }
        }
        .connect-but {
            background: #e5e5e5;
            border: none;
            color: #7D6EF4;
        }
    }
}
</style>