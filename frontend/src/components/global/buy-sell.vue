<template>
    <div class="mint-burn">
        <a-form-model ref="ruleForm" :model="formModel" :rules="rules">
            <a-form-model-item>
                <div class="mint-header">
                    <div class="trade active">{{$t('mintAndBurn.trade')}}</div>
                </div>
            </a-form-model-item>

            <a-form-model-item prop="collateralAmount">
                <div class="inp-item">
                    <div class="title-area">
                        <div class="collateral">{{$t('mintAndBurn.moASSET')}}</div>
                        <div class="balance">{{$t('mintAndBurn.balance')}}: 
                            <a-spin v-if="loadding" :spinning="loadding"/>
                            <a-statistic v-else :value="formModel.collateralBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                        </div>
                    </div>

                    <div class="form-wrapper">
                        <a-input-number class="inp" :disabled="loadding" :min="0" placeholder="0.0" v-model="formModel.collateralAmount" autoFocus />
                        <div class="right-max">
                            <div class="lp select" @click="selectMoCoinClick('collateral', formModel.collateral)">
                                <img v-if="formModel.collateral" class="img" :src="require(`../../assets/img/logo_${formModel.collateral}.png`)" />
                                <span>{{formModel.collateral}}</span> <a-icon type="down" />
                            </div>
                            <div class="max-but" @click="maxCoinClick()">MAX</div>
                        </div>
                    </div>
                </div>
            </a-form-model-item>

            <div class="position-block">
                <img class="position-img" @click="trasformCoin" style="" src="../../assets/img/swa-up.png" />
            </div>

            <a-form-model-item>
                <div class="inp-item">
                    <div class="title-area">
                        <div class="collateral">{{$t('mintAndBurn.moASSET')}}</div>
                        <div class="balance">
                            {{$t('mintAndBurn.balance')}}: 
                            <a-spin v-if="loadding" :spinning="loadding"/>
                            <a-statistic v-else :value="formModel.assetBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                        </div>
                    </div>

                    <div class="form-wrapper">
                        <a-input-number class="inp" :min="0" v-model="formModel.assetAmount" disabled placeholder="0.0" :precision="6" autoFocus />
                        <div class="right-max">
                            <div class="lp select" @click="selectMoCoinClick('moASSET', formModel.moASSET)">
                                <img v-if="formModel.moASSET" class="img" :src="require(`../../assets/img/logo_${formModel.moASSET}.png`)" />
                                <span>{{formModel.moASSET}}</span> <a-icon type="down" />
                            </div>
                        </div>
                    </div>
                </div>
            </a-form-model-item>

            <div class="chart-content" style="margin-top: 20px;">
                <k-chart ref="kChartRef" />
                
                <div class="tx-free">
                    <div class="lable">{{$t('mintAndBurn.price')}}  
                        <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{$t('mintAndBurn.priceTip')}}</span>
                            </template>
                            <a-icon class="icon" type="question-circle" />
                        </a-tooltip>
                    </div>
                    <div class="cut-line"></div>
                    <div class="ust">{{formModel.synthPrice}}</div>
                </div>

                <div class="tx-free">
                    <div class="lable">
                        {{$t('mintAndBurn.txFee')}}
                        <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{$t('mintAndBurn.txFeeTip')}}({{formModel.moFee * 100}}%)</span>
                            </template>
                            <a-icon class="icon" type="question-circle" />
                        </a-tooltip></div>
                    <div class="cut-line"></div>
                    <div class="ust">{{formModel.txFree}} moUSD</div>
                </div>
            </div>

            <a-form-model-item>
                <a-button v-if="account" :disabled="!Number(formModel.collateralAmount) || formModel.isOverflowBalance"
                    :class="Number(formModel.collateralAmount) && !formModel.isOverflowBalance ? 'but' : 'disableBut'"
                    :loading="buyButtonLoading" @click="buyClick">
                    {{formModel.isOverflowBalance ? $t('modal.insufficientBalance') : $t('mintAndBurn.tradeBut')}}
                </a-button>
                <a-button v-else class="but connect-but" @click="connectMetaMaskClick">CONNECT</a-button>
            </a-form-model-item>
        </a-form-model>

        <CsSelectCoinModal ref="CsSelectCoinModalRef" @selectCoinCallback="selectCoinCallback" />
        <CsConfirmModal ref='CsConfirmModalRef' @ConfirmMintClick="ConfirmMintClick" />
        <CsWatingModal ref='CsWatingModalRef' @ConfirmMintClick="ConfirmMintClick" @cancelClick="cancelClick" />
    </div>
</template>

<script>
import { moAssets, moHotAssets } from '@/config/RewardCollateralDeal.js'
import { getBalance, getTradingAmountAndFee, trade, getTradingFeeRate } from '@/config/ContractMethods'
import kChart from '../trade/kChart.vue'
import CsSelectCoinModal from '@/components/plugins/CsSelectCoinModal'
import CsConfirmModal from '@/components/plugins/CsConfirmModal/index.vue'
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'buySell',

    components: { kChart, CsConfirmModal, CsWatingModal, CsSelectCoinModal },

    data () {
        return {
            formModel: {
                collateral: '',
                collateralBalance: 0,
                collateralMaxBalance: 0,
                collateralAmount: '',
                moASSET: '',
                assetBalance: 0,
                assetMaxBalance: 0,
                assetAmount: '',
                synthPrice: '',
                txFree: 0,
                isOverflowBalance: false,
                moFee: 0,
                
            },
            rules: {
                collateralAmount: [
                    { 
                        required: true,
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback(new Error(" "))
                            } else if (Number(value) > Number(this.formModel.collateralBalance)) {
                                callback(new Error(" "));
                            }
                            callback()
                        }
                    }
                ]
            },
            buyButtonLoading: false,
            loadding: false,
            source: {},
            mintType: 'buy',
            dateType: 'd',
            showToolTip: false,
            provider: this.$Provider.providerInstance,
            assetsList: ['moTSLA', 'moUSD'],
            account: this.$store.state.account,
            selectType: '',
            currentOptionToken: '',
            currentPrice: 0,
            oldCollateral: ''
        }
    },

    watch: {
        'formModel.collateralAmount': {
            handler (newVal, oldVal) {
                if (Number(newVal) > Number(this.formModel.collateralBalance)) {
                    this.formModel.isOverflowBalance = true
                } else if (newVal && newVal != oldVal && typeof newVal === 'number' && !isNaN(newVal)) {
                    if (this.account) {
                        this.formModel.isOverflowBalance = false
                    }
                } else {
                    this.formModel.isOverflowBalance = false
                    this.formModel.assetAmount = ''
                    this.formModel.txFree
                }
                this.dsyncCountAssetAmount()
            }
        },

        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        }
    },

    created () {
        if (this.account) {
            this.initData()
        }
    },

    methods: {
        initData () {
            let { baseCoinName, tokenName } = this.$route.query
            this.formModel.collateral = baseCoinName || 'moUSD'
            this.formModel.moASSET = tokenName || 'moTSLA'
            this.initBalance(this.account)
        },

        initChartData () {
            this.$nextTick(() => {
                this.$refs.kChartRef.show(this.formModel.moASSET, this.formModel.collateral)
            })
        },

        initBalance (account) {
            if (account) {
                this.loadding = true
                this.initChartData()
                this.getData(account).then(res => {
                    console.log('res==', res)
                    this.loadding = false
                })
            }
        },

        async getData (account) {
            let collateralBalancePromise = getBalance(this.formModel.collateral, account, true)
            let assetBalancePromise = getBalance(this.formModel.moASSET, account, true)
            let assetsName = ''
            let moAssetsName = ''
            if (this.formModel.collateral === 'moUSD') {
                assetsName = this.formModel.moASSET
                moAssetsName = 'moUSD'
            } else {
                assetsName = this.formModel.collateral
                moAssetsName = this.formModel.moASSET
            }
            let feePromise = getTradingAmountAndFee(assetsName, moAssetsName, this.formModel.collateralAmount || 1)
            let moFeePromise = getTradingFeeRate(this.formModel.moASSET)

            let { balance, maxBalance } = await collateralBalancePromise
            this.formModel.collateralBalance = balance
            this.formModel.collateralMaxBalance = maxBalance

            let assetsRes = await assetBalancePromise
            this.formModel.assetBalance = assetsRes.balance
            this.formModel.assetMaxBalance = assetsRes.maxBalance

            // this.formModel.assetBalance = await assetBalancePromise

            let { price } = await feePromise
            this.currentPrice = price
            if (price) {
                this.oldCollateral = this.formModel.collateral
                this.formModel.synthPrice = `1${assetsName}≈${price} ${moAssetsName}`
            }
            this.formModel.moFee = await moFeePromise
            return { price }
        },

        async dsyncCountAssetAmount () {
            if (this.formModel.collateralAmount) {
                let { tradingAmount, tradingFee } = await getTradingAmountAndFee(this.formModel.collateral, this.formModel.moASSET, this.formModel.collateralAmount)
                this.formModel.assetAmount = tradingAmount
                this.formModel.txFree = tradingFee
            } else {
                this.formModel.assetAmount = ''
                this.formModel.txFree = 0
            }
        },

        maxCoinClick () {
            this.formModel.collateralAmount = toFixedVal(this.formModel.collateralBalance)
            this.$refs.ruleForm.validateField('collateralAmount')
        },

        ressetFormData () {
            this.formModel.collateralAmount = ''
            this.formModel.assetAmount = ''
            this.initBalance(this.account)
            this.buyButtonLoading = false
        },

        selectMoCoinClick (type, coinName) {
            this.selectType = type
            this.currentOptionToken = coinName
            this.$refs.CsSelectCoinModalRef.show({
                currentCoinName: coinName,
                assetsList: moAssets,
                hotAssetsList: moHotAssets
            })
        },

        selectCoinCallback ({ coinName }) {
            this.formModel.collateralBalance = 0
            this.formModel.assetBalance = 0
            this.formModel.assetAmount = ''
            this.formModel.collateralAmount = ''
            if (this.selectType === 'collateral') {
                this.formModel.collateral = coinName
                if (this.formModel.moASSET === coinName) {
                    this.formModel.moASSET = this.currentOptionToken
                }
            } else if (this.selectType === 'moASSET') {
                this.formModel.moASSET = coinName
                if (this.formModel.collateral === coinName) {
                    this.formModel.collateral = this.currentOptionToken
                }
            }
            this.initBalance(this.account)
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('transaction ===', transaction);
                this.ressetFormData()
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            });
        },

        async buyClick () {
            let that = this
            this.$refs.ruleForm.validate(async (valid) => {
                if (valid) {
                    this.$refs.CsConfirmModalRef.show({
                        title: that.$t('mintAndBurn.tradeBut'),
                        topName: 'moAsset',
                        topBalance: that.formModel.collateralBalance,
                        topAmount: that.formModel.collateralAmount,
                        topCoinName: that.formModel.collateral,
                        bottomName: 'moAsset',
                        bottomBalance: that.formModel.assetBalance,
                        bottomAmount: that.formModel.assetAmount,
                        bottomCoinName: that.formModel.moASSET,
                        lin: that.formModel.lin,
                        safe: that.formModel.safe,
                        price: that.formModel.synthPrice,
                        txFree: that.formModel.txFree
                    })
                }
            })
        },

        async trasformCoin () {
            let copyCoin = this.formModel.collateral
            let balance = this.formModel.collateralBalance
            this.formModel.collateralBalance = this.formModel.assetBalance
            this.formModel.collateralMaxBalance = this.formModel.assetMaxBalance
            this.formModel.assetBalance = balance
            this.formModel.collateral = this.formModel.moASSET
            this.formModel.moASSET = copyCoin
            this.formModel.collateralAmount = ''
            this.formModel.assetAmount = ''
            if (this.formModel.collateral !== 'moUSD' && this.formModel.moASSET !== 'moUSD') {
                let { price } = await getTradingAmountAndFee(this.formModel.collateral, this.formModel.moASSET, 1)
                this.formModel.synthPrice = `1${this.formModel.collateral}≈${price} ${this.formModel.moASSET}`
            }
            this.$refs.kChartRef.show(this.formModel.moASSET, this.formModel.collateral)
        },

        async ConfirmMintClick () {
            this.showWatingModal()
            this.buyButtonLoading = true
            try {
                let coinCount = 0
                if (this.formModel.collateralAmount === toFixedVal(this.formModel.collateralBalance)) {
                    coinCount = this.formModel.collateralMaxBalance // this.formModel.collateralBalance
                } else {
                    coinCount = this.formModel.collateralAmount
                }
                let hash = await trade(this.formModel.collateral, this.formModel.moASSET, coinCount)
                if (hash) {
                    this.listenerAccountbalance(hash)
                }
            } catch (error) {
                this.buyButtonLoading = false
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal () {
            this.$refs.CsWatingModalRef.show({
                topAmount: this.formModel.collateralAmount,
                topCoinName: this.formModel.collateral,
                bottomAmount: this.formModel.assetAmount,
                bottomCoinName: this.formModel.moASSET,
                name: this.$t('mintAndBurn.tradeBut'),
                status: 'wating'
            })
        },

        connectMetaMaskClick () {
            this.$Provider.checkLocalMetaMask()
        },

        cancelClick () {
            this.buyButtonLoading = false
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

.mint-burn {
    margin: auto;
    max-width: 600px;
    background: #fff;
    box-shadow: 0px 8px 16px 0px rgba(0, 104, 255, 0.2);
    border-radius: 12px;
    border: 1px solid #D6D6D6;
    margin-top: 30px;
    padding: 0 20px 20px 20px;
    .mint-header {
        display: flex;
        align-items: center;
        width: 100%;
        height: 60px;
        line-height: 60px;
        .mint {
            flex: 0.5;
            text-align: center;
            font-size: 24px;
            font-family: DINPro-Bold, DINPro;
            font-weight: 500;
            cursor: pointer;
        }
        .active {
            color: #37373C;
            font-weight: 500;
        }
        .trade {
            flex: 1;
            text-align: center;
            font-size: 24px;
            font-family: DINPro-Bold, DINPro;
            font-weight: 500;
            cursor: pointer;
        }
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

        .chart-area {}

        .chart-bottom {
            display: flex;
            margin-top: 15px;
            .lable {
                font-size: 24px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
            .lable-price {
                font-size: 24px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #37373C;
                margin: 0 10px;
            }
            .icon {
                cursor: pointer;
                font-size: 24px;
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
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
            .cut-line {
                flex: 1;
                border: 1px dashed #f3f3f7;
                margin: 0 10px;
            }
            .ust {
                font-size: 16px;
                font-weight: 500;
                color: #37373C;
                font-family: DINPro-Regular, DINPro;
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
    .mint-burn {
        margin: auto;
        max-width: 668px;
        background: #fff;
        box-shadow: 0px 8px 16px 0px rgba(0, 104, 255, 0.2);
        border-radius: 12px;
        border: 1px solid #D6D6D6;
        margin-top: 30px;
        padding: 0 20px 20px 20px;
        .mint-header {
            display: flex;
            align-items: center;
            width: 100%;
            height: 50px;
            line-height: 50px;
            .mint {
                flex: 0.5;
                text-align: center;
                font-size: 14px;
                font-family: DINPro-Bold, DINPro;
                font-weight: 500;
                cursor: pointer;
            }
            .active {
                color: #37373C;
                font-weight: 500;
            }
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
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #6A6972;
                }
                .balance {
                    font-size: 14px;
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
                    .dal {
                        font-size: 14px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                        margin-right: 5px;
                    }
                    .select {
                        min-width: 100px;
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

            .chart-area {}

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

                    /deep/ .ant-statistic-content {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                    }

                    /deep/ .ant-statistic-content-value-int {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                    }

                    /deep/ .ant-statistic-content-value-decimal {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                    }
                }
            }
        }
    }
}
</style>