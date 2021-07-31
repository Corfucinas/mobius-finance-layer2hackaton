<template>
    <div class="views-shorting">
       <gridTop ref="gridTopRef" />
       
        <div class="title">{{$t('shorting.swapCollateral')}}</div>

        <div class="tip-content">
            <div class="left">By opening a short, you are staking your collateral to 
                mint the target moAsset and short selling it. You will receive moUSD equivalent to your short position.
            </div>
            <img class="shortBg" src="../../assets/img/short-bg.png" />
        </div>
         
        <div class="swapCollateral-content">
            <div class="content">
                <div class="body">
                    <div class="block">
                        <a-form-model ref="ruleForm" :model="formModel" :rules="rules">
                            <a-form-model-item prop="amount">
                                <div class="item">
                                    <div class="top">
                                        <div class="label">{{$t('shorting.collateral')}}</div>
                                        <div class="balance">{{$t('shorting.balance')}}: 
                                            <a-statistic :value="formModel.assetsBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" style="margin-right: 5px" />
                                        </div>
                                    </div>

                                    <div class="bottom">
                                        <a-input-number class="inp" :disabled="loadding" v-model="formModel.amount" :min="0" placeholder="0.0" :precision=4 autoFocus />
                                        <div class="lp select" @click="selectCoinClick('assets')">
                                            <img class="img" :src="require(`../../assets/img/logo_${formModel.baseCoinName}.png`)" />
                                            <span>{{formModel.baseCoinName}}</span> <a-icon type="down" />
                                        </div>
                                    </div>
                                </div>
                            </a-form-model-item>

                            <div class="position-block">
                                <img class="position-img" src="../../assets/img/swap.png" />
                            </div>

                            <div class="item">
                                <div class="top">
                                    <div class="label">{{$t('shorting.shortPosition')}}</div>
                                    <div class="balance">{{formModel.assetsCoinName}} {{$t('shorting.debt')}}: 
                                        <a-statistic :value="formModel.assetsDebtBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" style="margin-right: 5px" />
                                    </div>
                                </div>

                                <div class="bottom">
                                    <a-input-number class="inp" v-model="formModel.coinAmount" :min="0" placeholder="0.0" :precision=6 disabled />
                                    <div class="lp select" @click="selectCoinClick('moAssets')">
                                        <img class="img" :src="require(`../../assets/img/logo_${formModel.assetsCoinName}.png`)" />
                                        <span>{{formModel.assetsCoinName}}</span> <a-icon type="down" />
                                    </div>
                                </div>
                            </div>

                            <div class="chart-content">
                                <div class="chart-bottom">
                                    <span>
                                        <span class="lable">{{$t('mintAndBurn.liqRatio')}}:</span>
                                        <a-spin style="margin: 0 15px;" v-if="loadding" :spinning="loadding"/>
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
                                        <a-spin style="margin: 0 15px;" v-if="loadding" :spinning="loadding"/>
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
                                                <span>{{$t('mintAndBurn.minRatioTip')}}</span>
                                            </template>
                                            <a-icon class="icon" type="question-circle" />
                                        </a-tooltip> -->
                                    </span>
                                </div>

                                <CsSlider ref="CsSlirderRef" @sliderChange="sliderChange" :minValue="mintValue"
                                    :maxValue="formModel.maxSafe" :defaultValue="defaultRateValue" :safeValue="formModel.safe * 100"  />

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

                                <div class="tx-free">
                                    <div class="lable">
                                        {{$t('mintAndBurn.txFee')}}
                                        <a-tooltip placement="topLeft">
                                            <template slot="title">
                                                <span>{{$t('mintAndBurn.txFeeTip')}}({{formModel.syntheticAssetsFee * 100}}%)</span>
                                            </template>
                                            <a-icon class="icon" type="question-circle" />
                                        </a-tooltip></div>
                                    <div class="cut-line"></div>
                                    <div class="ust">{{formModel.txFree}} moUSD</div>
                                </div>
                            </div>
                        </a-form-model>
                    </div>

                    <div class="cut"></div>

                    <div class="block">
                        <shortRightArea ref="mintRightAreaRef" :hidedenTitle="false" />
                    </div>
                </div>

                <div class="bottom-but">
                    <a-button :disabled="!Number(formModel.amount) || formModel.isOverflowBalance"
                        :class="Number(formModel.amount) && !formModel.isOverflowBalance ? 'butGroup' : 'disableButGrup'" 
                        :loading="buttonLoading"  @click="shortingClick">{{formModel.isOverflowBalance ? $t('modal.insufficientBalance') : $t('shorting.shortAsset')}}
                    </a-button>
                </div>
            </div>
        </div>

        <div class="swapCollateral-content" style="margin-top: 50px;">
            <a-tabs type="card"> 
                <a-tab-pane key="mint" :tab="$t('shorting.openPosition')">
                    <openPosition ref="openPositionRef" @updateGridTopInfo="updateGridTopInfo" @initData="initData" />
                </a-tab-pane>

                <!-- <a-tab-pane key="burn" :tab="$t('shorting.history')">
                    <history />
                </a-tab-pane> -->
            </a-tabs>
        </div>

        <CsSelectCoinModal ref="CsSelectCoinModalRef" @selectCoinCallback="selectCoinCallback" />
        <CsConfirmModal ref='CsConfirmModalRef' @ConfirmMintClick="ConfirmMintClick" />
        <CsWatingModal ref='CsWatingModalRef' @ConfirmMintClick="ConfirmMintClick" @cancelClick="cancelClick" />
    </div>
</template>

<script>
import { moAssetsTradingRewards, moHotAssets } from '@/config/RewardCollateralDeal.js'
import { getTradingFeeRate, getBalance, getLiquidationRate, getCollateralRate, getPrice, getStaked, approve, shortFromCoin, shortFromToken, getDebtOriginal } from '@/config/ContractMethods'
import shortRightArea from '@/components/shorting/shortRightArea.vue'
import openPosition from '@/components/shorting/openPosition.vue'
import CsSelectCoinModal from '@/components/plugins/CsSelectCoinModal'
import CsConfirmModal from '@/components/plugins/CsConfirmModal/index.vue'
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import CsSlider from '@/components/plugins/CsSlider'
import gridTop from '@/components/shorting/gridTop.vue'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'Shorting',

    components: { shortRightArea, openPosition, CsSelectCoinModal, CsConfirmModal, CsWatingModal, CsSlider, gridTop },

    data () {
        return {
            formModel: {
                amount: '',
                coinAmount: '',
                lin: '',
                safe: '',
                safeText: 0,
                priceScale: '',
                baseCoinName: 'DAI',
                assetsCoinName: 'moTSLA',
                assetsDebtBalance: '',
                mousdDebtBalance: '',
                txFree: 0,
                maxSafe: 0,
                percent: '',
                liquidationPrice: 0,
                assetsBalance: '',
                syntheticAssetsOrcalPrice: 0,
                collateralAmount: 0,
                syntheticAssetsFee: 0,
                moUSDBalance: 0,
                safeValue: 0,
                isOverflowBalance: false
            },
            rules: {
                amount: [
                    { 
                        required: true,
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback(new Error(" "))
                            } else if (Number(value) > Number(this.formModel.assetsBalance)) {
                                callback(new Error(" "))
                            }
                            callback()
                        }
                    }
                ]
            },
            account: this.$store.state.account,
            provider: this.$Provider.providerInstance,
            showToolTip: false,
            buttonLoading: false,
            loadding: false,
            mintValue: 0,
            selectType: '',
            defaultRateValue: 0
        }
    },

    watch: {
        'formModel.amount': {
            handler (newVal, oldVal) {
                if (Number(newVal) > Number(this.formModel.assetsBalance)) {
                    this.formModel.isOverflowBalance = true
                } else if (newVal && newVal !== oldVal && typeof newVal === 'number' && !isNaN(newVal)) {
                    this.formModel.isOverflowBalance = false
                    this.dynamicSyntheticAssetsCount(newVal)
                } else {
                    this.formModel.isOverflowBalance = false
                    this.formModel.txFree = 0
                    this.formModel.coinAmount = ''
                    this.updateInfo()
                }
            }
        },

        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        }
    },

    created () {
        if (this.account) {
            let { baseCoinName } = this.$route.query
            this.formModel.baseCoinName = baseCoinName || 'DAI'
            this.initData()
        }
        window.parent.scrollTo(0, 0)
    },

    methods: {
        initData () {
            this.formModel.amount = ''
            this.formModel.coinAmount = ''
            this.formModel.mousdDebtBalance = ''
            this.formModel.assetsDebtBalance = ''
            this.loadding = true
            this.getData().then(res => {
                console.log('res===', JSON.stringify(res))
                this.loadding = false
                this.updateInfo()
            })
        },

        async getData () {
            let feePromise = getTradingFeeRate(this.formModel.assetsCoinName)
            let mousdBalancePromise = getBalance('moUSD', this.account)
            let assetsBalancePromise = getBalance(this.formModel.baseCoinName, this.account)
            let linRatePromise = getLiquidationRate(this.formModel.baseCoinName, this.formModel.assetsCoinName)
            let safeRatePromise = getCollateralRate(this.formModel.baseCoinName, this.formModel.assetsCoinName)
            let orcalPricePromise = getPrice(this.formModel.baseCoinName)
            let syntheticAssetsOrcalPricePromise = getPrice(this.formModel.assetsCoinName)
            let assetsDebtBalancePromise = getDebtOriginal(this.formModel.baseCoinName, this.account, this.formModel.assetsCoinName)
            let totalStakedPromise = getStaked(this.formModel.baseCoinName, this.formModel.assetsCoinName, this.account)

            let fee = this.formModel.syntheticAssetsFee = await feePromise
            let mousdBalance = this.formModel.moUSDBalance = await mousdBalancePromise
            let assetsBalance = this.formModel.assetsBalance = await assetsBalancePromise
            let linRate = this.formModel.lin = await linRatePromise
            let safeRate = this.formModel.safeText = this.formModel.safe = await safeRatePromise
            let orcalPrice = this.formModel.unitPrice = await orcalPricePromise
            let syntheticAssetsOrcalPrice = this.formModel.syntheticAssetsOrcalPrice = await syntheticAssetsOrcalPricePromise
            let assetsDebtBalance = this.formModel.assetsDebtBalance = await assetsDebtBalancePromise
            let totalStaked = this.formModel.collateralAmount = await totalStakedPromise

            this.initPriceScale()
            // this.formModel.safeValue = this.formModel.safe * 100
            this.formModel.maxSafe = this.formModel.safe * 1000
            let resMinValue = (linRate * 100).toFixed(2)
            this.mintValue = parseFloat(resMinValue)
            if (this.formModel.assetsCoinName === 'moTSLA') {
                this.defaultRateValue = 500
            } else if (this.formModel.assetsCoinName === 'moETH') {
                this.defaultRateValue = 200
            } else if (this.formModel.assetsCoinName === 'moBTC') {
                this.defaultRateValue = 200
            } else if (this.formModel.assetsCoinName === 'moXAU') {
                this.defaultRateValue = 500
            }
            this.formModel.safeValue = this.defaultRateValue
            return { fee, assetsBalance, linRate, safeRate, orcalPrice, assetsDebtBalance, totalStaked, syntheticAssetsOrcalPrice, mousdBalance }
        },
        
        sliderChange ({ sliderVal }) {
            if (this.formModel.amount) {
                this.formModel.safeValue = sliderVal
                this.dynamicSyntheticAssetsCount(this.formModel.amount)
            }
        },

        initPriceScale () {
            this.formModel.priceScale = `1${this.formModel.baseCoinName}≈${toFixedVal(this.formModel.unitPrice / this.formModel.syntheticAssetsOrcalPrice)} ${this.formModel.assetsCoinName}`
        },

        async dynamicSyntheticAssetsCount (val) {
            this.formModel.coinAmount = toFixedVal((val * this.formModel.unitPrice * 100) / (this.formModel.safeValue * this.formModel.syntheticAssetsOrcalPrice))
            this.formModel.txFree = toFixedVal(this.formModel.coinAmount * this.formModel.syntheticAssetsFee * this.formModel.syntheticAssetsOrcalPrice)
            this.updateInfo()
        },

        updateInfo () {
            let rateStatus = 0
            let liquidationPrice = 0
            let liquidationRate = 0
            let stakeAmount = parseFloat(this.formModel.collateralAmount)
            let availableAmount = parseFloat(this.formModel.assetsDebtBalance)
            let mousdBalance = parseFloat(this.formModel.moUSDBalance)
            let oldRate = 0
            if (stakeAmount && availableAmount) {
                oldRate = ((stakeAmount * this.formModel.unitPrice) / (availableAmount * this.formModel.syntheticAssetsOrcalPrice)) * 100
            }
            if (this.formModel.coinAmount && this.formModel.amount) {
                stakeAmount += parseFloat(this.formModel.amount)
                availableAmount += parseFloat(this.formModel.coinAmount)
                mousdBalance += (parseFloat(this.formModel.coinAmount) * this.formModel.syntheticAssetsOrcalPrice) * (1 - this.formModel.syntheticAssetsFee)
            }
            if (stakeAmount && availableAmount) {
                liquidationPrice = toFixedVal((this.mintValue * availableAmount * this.formModel.syntheticAssetsOrcalPrice) / stakeAmount)
                liquidationRate = ((stakeAmount * this.formModel.unitPrice) / (availableAmount * this.formModel.syntheticAssetsOrcalPrice)) * 100
                if (this.formModel.amount) {
                    if (liquidationRate >= oldRate) {
                        rateStatus = 1
                    } else {
                        rateStatus = 2
                    }
                }
            }
            this.$nextTick(() => {
                this.$refs.mintRightAreaRef.updateInfo({ 
                    coinNmae: this.formModel.baseCoinName,
                    syntheticAssetsCoinName: this.formModel.assetsCoinName,
                    liquidationPrice,
                    liquidationRate,
                    rateStatus,
                    lin: this.mintValue,
                    mousdBalance,
                    availableAmount,
                    stakeAmount,
                    safeRate: this.formModel.safeText,
                    oldStakeAmount: this.formModel.collateralAmount,
                    oldAvailableAmount: this.formModel.assetsDebtBalance,
                    syntheticAssetsOrcalPrice: this.formModel.syntheticAssetsOrcalPrice
                })
            })
        },

        selectCoinClick (type) {
            this.selectType = type
            if (type === 'assets') {
                this.$refs.CsSelectCoinModalRef.show({
                    currentCoinName: this.formModel.baseCoinName,
                    assetsList: [{ coinName: 'DAI', shortName: 'Dai' }],
                    hotAssetsList: [{ coinName: 'DAI', shortName: 'Dai' }],

                })
            } else if (type === 'moAssets') {
                this.$refs.CsSelectCoinModalRef.show({
                    currentCoinName: this.formModel.assetsCoinName,
                    assetsList: moAssetsTradingRewards,
                    hotAssetsList: moHotAssets
                })
            }
            
        },

        selectCoinCallback ({ coinName }) {
            if (this.selectType === 'assets') {
                this.formModel.baseCoinName = coinName
            } else if (this.selectType === 'moAssets') {
                this.formModel.assetsCoinName = coinName
            }
            this.initData()
        },

        ressetFormData () {
            this.$refs.openPositionRef.initData()
            this.initData()
            this.buttonLoading = false
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('transaction ===', transaction);
                this.ressetFormData()
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            });
        },

        async shortingClick () {
            let that = this
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.$refs.CsConfirmModalRef.show({
                        title: that.$t('shorting.shortAsset'),
                        topName: that.formModel.baseCoinName,
                        topBalance: that.formModel.assetsBalance,
                        topAmount: that.formModel.amount,
                        topCoinName: that.formModel.baseCoinName,
                        bottomName: that.$t('shorting.collateral'),
                        bottomBalance: that.formModel.assetsDebtBalance,
                        bottomAmount: that.formModel.coinAmount,
                        bottomCoinName: that.formModel.assetsCoinName,
                        lin: that.formModel.lin,
                        safe: that.formModel.safe,
                        price: that.formModel.priceScale,
                        txFree: that.formModel.txFree
                    })
                }
            })
        },

        async ConfirmMintClick () {
            this.showWatingModal()
            this.buttonLoading = true
            try {
                let transactionHash = ''
                let collateralRate = this.$ethers.utils.parseEther(this.formModel.safeValue / 100 + '')
                if (this.formModel.baseCoinName === 'matic' || this.formModel.baseCoinName === 'MATIC') {
                    transactionHash = await shortFromCoin(this.formModel.assetsCoinName, collateralRate, this.formModel.amount)
                    if (transactionHash) {
                        this.listenerAccountbalance(transactionHash)
                    }
                } else {
                    let hash = await approve(this.formModel.baseCoinName, this.formModel.amount)
                    if (hash) {
                        this.provider.once(hash, async (transaction) => {
                            console.log('transaction===', transaction)
                            transactionHash = await shortFromToken(this.formModel.baseCoinName, this.formModel.amount, this.formModel.assetsCoinName, collateralRate)
                            if (transactionHash) {
                                this.listenerAccountbalance(transactionHash)
                            }
                        })
                    }
                }
            } catch (error) {
                this.buttonLoading = false
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal () {
            this.$refs.CsWatingModalRef.show({
                topAmount: this.formModel.amount,
                topCoinName: this.formModel.baseCoinName,
                bottomAmount: this.formModel.coinAmount,
                bottomCoinName: this.formModel.assetsCoinName,
                name: this.$t('shorting.shortAsset'),
                status: 'wating'
            })
        },

        cancelClick () {
            this.buttonLoading = false
        },

        updateGridTopInfo (params) {
            this.$refs.gridTopRef.updateInfo(params)
        }
    }
}
</script>

<style lang="less" scoped>
/deep/.has-error .ant-form-explain, .has-error .ant-form-split {
    display: none;
}

/deep/ .ant-form-item {
    margin: 0;
}

/deep/ .ant-input-number-input {
    padding: 0;
    margin: 0;
}

/deep/ .ant-slider-handle {
    height: 20px;
    width: 20px;
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

/deep/ .ant-tabs-bar {
    border: none;
}

/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    border: none;
    background: #F6F7FB;
    font-size: 24px;
    font-family: DINPro-Regular, DINPro;
    font-weight: 400;
    color: #6A6972;
    padding-left: 0;
    padding-right: 50px;
}

/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab-active {
    font-size: 24px;
    font-family: DINPro-Bold, DINPro;
    font-weight: bold;
    color: #37373C;
}

.views-shorting {
    .title {
        height: 50px;
        line-height: 50px;
        font-size: 24px;
        font-family: DINPro-Bold, DINPro;
        font-weight: bold;
        color: #37373C;
        border-radius: 10px;
    }
    .tip-content {
        position: relative;
        display: flex;
        justify-content: space-between;
        background: #FFF4E4;
        padding: 20px 60px;
        border-radius: 8px;
        min-height: 115px;
        .left {
            flex: .7;
            font-size: 18px;
            font-family: DINPro-Regular, DINPro;
            font-weight: 400;
            color: #37373C;
            line-height: 26px;
        }
        .shortBg {
            position: absolute;
            bottom: 0;
            right: 60px;
            width: 200px;
        }

    }
    .swapCollateral-content {
        border-radius: 16px;
        padding: 30px 80px;
        margin-top: 20px;
        background: linear-gradient(308deg, #F3EEFF 0%, #F0F8FF 54%, #FDF7FF 100%);
        .content {
            background: #FFFFFF;
            box-shadow: 0px 4px 12px 0px rgba(0, 104, 255, 0.2);
            border-radius: 8px;
            border: 1px solid #F3F3F7;
            padding: 20px;
            margin-top: 20px;
            .body {
                display: flex;
                justify-content: space-between;
                .block {
                    flex: 1;
                    .item {
                        background: #F6F7FB;
                        border-radius: 8px;
                        padding: 20px;
                        .top {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            height: 60px;
                            line-height: 60px;
                            .label {
                                font-size: 18px;
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

                        .bottom {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .lp {
                                cursor: pointer;
                                font-size: 14px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: 400;
                                color: #37373C;
                                display: flex;
                                align-items: center;
                                cursor: pointer;
                                .img {
                                    width: 25px;
                                    margin-right: 6px;
                                }
                            }
                            .inp {
                                flex: 1;
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
                            .icon {
                                cursor: pointer;
                                font-size: 16px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: 400;
                                color: #6A6972;
                            }

                            /deep/ .ant-statistic-content {
                                font-size: 16px;
                                font-weight: 500;
                                color: #37373C;
                            }
                        }

                        .tx-free {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 30px;
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
                }
                .cut {
                    width: 1px;
                    height: 540px;
                    background: #f3f3f7;
                    margin: 0 20px;
                }
            }

            .bottom-but {
                text-align: center;
                margin-top: 30px;
                .butGroup {
                    width: 274px;
                    height: 48px;
                    background: #7D6EF4;
                    box-shadow: 0px 4px 8px 0px rgba(85, 57, 209, 0.57);
                    border-radius: 24px;
                    border: none;
                    font-size: 24px;
                    color: #fff;
                    font-family: DINPro-Bold, DINPro;
                }
                .butGroup:hover {
                    opacity: .7;
                }

                .disableButGrup {
                    width: 274px;
                    height: 48px;
                    background: #D2CCFF;
                    color: #fff;
                    border-radius: 24px;
                    border: none;
                    font-size: 24px;
                    font-family: DINPro-Bold, DINPro;
                }
            }
        }
    }
}
</style>