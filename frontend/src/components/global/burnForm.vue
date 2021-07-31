<template>
    <div class="components-burnForm">
        <a-form-model ref="ruleBurnForm" :model="formModel" :rules="rules">
            <a-form-model-item prop="mousdCount">
                <div class="inp-item">
                    <div class="title-area">
                        <div class="collateral">moUSD</div>
                        <div class="balance">
                            moUSD {{$t('mintAndBurn.balance')}}: 
                            <a-spin v-if="loadding" :spinning="loadding"/>
                            <a-statistic v-else :value="formModel.moUSDBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                        </div>
                    </div>

                    <div class="form-wrapper">
                        <a-input-number :disabled="loadding" class="inp" v-model="formModel.mousdCount" :min="0" placeholder="0.0" autoFocus />
                        <div class="right-max">
                            <div class="">
                                <img class="img" v-if="formModel.tokenName" :src="require(`../../assets/img/logo_${formModel.tokenName}.png`)" />
                                {{formModel.tokenName}}
                            </div>
                            <div class="max-but" @click="maxMoUsdClick()">MAX</div>
                        </div>
                    </div>
                </div>
            </a-form-model-item>
            
            <div class="position-block">
                <img class="position-img" src="../../assets/img/swap.png" />
            </div>

            <a-form-model-item prop="coinCount">
                <div class="inp-item">
                    <div class="title-area">
                        <div class="collateral">{{$t('mintAndBurn.collateral')}}</div>
                        <div class="balance">
                            moUSD {{$t('mintAndBurn.debt')}}: 
                            <a-spin v-if="loadding" :spinning="loadding" />
                            <a-statistic v-else :value="formModel.maxCointBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                        </div>
                    </div>

                    <div class="form-wrapper">
                        <a-input-number class="inp" disabled v-model="formModel.debtAmount" :min="0" placeholder="0.0" :precision="6" autoFocus />
                        <div class="right-max">
                            <div class="select" @click="selectCoinClick">
                                <img class="img" v-if="formModel.baseCoinName" :src="require(`../../assets/img/logo_${formModel.baseCoinName}.png`)" />
                                <span>{{formModel.baseCoinName}}</span> <a-icon type="down" />
                            </div>
                        </div>
                    </div>
                </div>
            </a-form-model-item>

            <div class="chart-content">
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

            <div class="tip-content">
                Burn refers to paying back your moUSD debt to redeem your collateral. After burning moUSD, you will not receive additional staking rewards.
            </div>

            <a-form-model-item>
                <a-button v-if="account" :disabled="!Number(formModel.mousdCount) || formModel.isOverflowBalance"
                    :class="Number(formModel.mousdCount) && !formModel.isOverflowBalance ? 'but' : 'disableBut'" class="marTopBut"
                    :loading="burnButtonLoading"  @click="burnClick">
                    {{formModel.isOverflowBalance ? $t('modal.insufficientBalance') : $t('mintAndBurn.burnBut')}}
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
import { getBalance, getPrice, getStaked, getDebt, burn } from '@/config/ContractMethods'
import CsConfirmModal from '@/components/plugins/CsConfirmModal/index.vue'
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import CsSelectCoinModal from '@/components/plugins/CsSelectCoinModal'
import { toFixedVal } from '@/common/utils/filters'

export default {
    components: {
        CsConfirmModal,
        CsWatingModal,
        CsSelectCoinModal
    },

    data () {
        return {
            formModel: {
                baseCoinName: '',
                cointBalance: 0,
                tokenName: '',
                coinCount: '',
                mousdCount: '',
                moUSDBalance: 0 ,
                lin: '',
                safe: '',
                _userAddr: '',
                unitPrice: '',
                priceScale: '',
                maxCointBalance: '',
                debtAmount: '',
                txFree: '',
                stakerMintAssetsAmount: '',
                isOverflowBalance: false
            },
            rules: {
                mousdCount: [
                    { 
                        required: true,
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback(new Error(" "))
                            } else if (Number(value) > Number(this.formModel.maxCointBalance)) {
                                callback(new Error(" "));
                            } else if (Number(value) > Number(this.formModel.moUSDBalance)) {
                                callback(new Error(" "));
                            }
                            callback()
                        }
                    }
                ],
            },
            cointBalanceSpinning: false,
            moUSDBalanceSpinning: false,
            burnButtonLoading: false,
            provider: this.$Provider.providerInstance,
            loadding: false,
            dateType: 'd',
            showToolTip: false,
            stakerContract: null,
            account: this.$store.state.account,
            maxBalance: 0,
        }
    },

    watch: {
        'formModel.mousdCount': {
            handler (newVal, oldVal) {
                if (Number(newVal) > Number(this.formModel.maxCointBalance) || Number(newVal) > Number(this.formModel.moUSDBalance)) {
                    this.formModel.isOverflowBalance = true
                } else if  (newVal && newVal != oldVal && this.formModel.stakerMintAssetsAmount && typeof newVal === 'number' && !isNaN(newVal)) {
                    this.formModel.isOverflowBalance = false
                } else {
                    this.formModel.isOverflowBalance = false
                    this.formModel.debtAmount = ''
                }
                this.dsyncCountDebt(newVal)
            }
        },

        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        }
    },

    methods: {
        initData () {
            let { baseCoinName, tokenName } = this.$route.query
            this.formModel.baseCoinName = baseCoinName || 'MATIC'
            this.formModel.tokenName = tokenName || 'moUSD'
            this.formModel.debtAmount = ''
            this.formModel.mousdCount = ''
            if (this.account) {
                this.initBalance(this.formModel.baseCoinName)
            }
        },

        initBalance (coinName) {
            this.loadding = true
            this.getData(coinName).then(res => {
                this.loadding = false
                this.updateBurnInfo(res)
            })
        },

        updateBurnInfo (res) {
            let { stakeAmount, debtAmount, orcalPrice } = res
            let totalDebtAmount = 0
            let collateralRatio = 0
            if (this.formModel.mousdCount && this.formModel.debtAmount) {
                debtAmount -= parseFloat(this.formModel.mousdCount)
                stakeAmount -= parseFloat(this.formModel.debtAmount)
            }
            if (debtAmount && stakeAmount ) {
                collateralRatio = (stakeAmount * orcalPrice / debtAmount) * 100
            }
            this.$emit('updateBurnFormInfo', {
                coinName: this.formModel.baseCoinName,
                debtAmount,
                totalDebtAmount,
                stakeAmount,
                collateralRatio,
                moUSDBalance: this.formModel.moUSDBalance,
                oldStakeAmount: this.formModel.stakerMintAssetsAmount
            })
        },

        async getData (coinName) {
            let mousdBalancePromise = getBalance('moUSD', this.account, true)
            let orcalPricePromise = getPrice(coinName)
            let assetsAmountPromise = getStaked(coinName, 'moUSD', this.account)
            let debtAmountPromise = getDebt(coinName, 'moUSD', this.account)

            let { balance, maxBalance } = await mousdBalancePromise
            this.formModel.moUSDBalance = balance
            this.maxBalance = maxBalance
            if (coinName === 'MOT') {
                let motBalance = await getBalance(coinName, this.account)
                this.$store.commit("setMotBalance", { balance: motBalance })
            }
            let orcalPrice = this.formModel.unitPrice = await orcalPricePromise
            let stakeAmount = this.formModel.stakerMintAssetsAmount = await assetsAmountPromise
            let debtAmount = this.formModel.maxCointBalance = await debtAmountPromise

            this.initPriceScale(coinName)
            return { orcalPrice, stakeAmount, debtAmount }
        },

        dsyncCountDebt (val) {
            this.formModel.debtAmount = parseFloat((val / this.formModel.maxCointBalance * this.formModel.stakerMintAssetsAmount)) || ''
            this.updateBurnInfo({
                stakeAmount: this.formModel.stakerMintAssetsAmount,
                debtAmount: this.formModel.maxCointBalance,
                orcalPrice: this.formModel.unitPrice,
            })
        },

        maxMoUsdClick () {
            if (this.formModel.maxCointBalance && this.formModel.moUSDBalance) {
                if (this.formModel.maxCointBalance > this.formModel.moUSDBalance) {
                    this.formModel.mousdCount = toFixedVal(this.formModel.moUSDBalance)
                } else {
                    this.formModel.mousdCount = toFixedVal(this.formModel.maxCointBalance)
                }
                this.$refs.ruleBurnForm.validateField('mousdCount')
            }
        },

        initPriceScale (coinName) {
            this.formModel.priceScale = `1${coinName}≈${this.formModel.unitPrice} USD`
            this.cointBalanceSpinning = false
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

        handleChange (val) {
            this.cointBalanceSpinning = true
            this.formModel.maxCointBalance = ''
            this.formModel.mousdCount = ''
            this.formModel.debtAmount = ''
            this.initBalance(val)
        },
        
        ressetFormData () {
            this.formModel.debtAmount = ''
            this.formModel.mousdCount = ''
            this.initBalance(this.formModel.baseCoinName)
            this.burnButtonLoading = false
        },
        
        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('transaction ===', transaction);
                this.ressetFormData()
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            });
        },
        
        burnClick () {
            let that = this
            this.$refs.ruleBurnForm.validate(async (valid) => {
                if (valid) {
                    this.$refs.CsConfirmModalRef.show({
                        title: 'Burn',
                        topName: 'moUSD',
                        topBalance: that.formModel.moUSDBalance,
                        topAmount: that.formModel.mousdCount,
                        topCoinName: 'moUSD',
                        bottomName: 'Collateral',
                        bottomBalance: that.formModel.maxCointBalance,
                        bottomAmount: that.formModel.debtAmount,
                        bottomCoinName: that.formModel.baseCoinName,
                        price: that.formModel.priceScale,
                        txFree: that.formModel.txFree
                    })
                }
            });
        },

        async ConfirmMintClick () {
            this.showWatingModal()
            let { formModel } = this
            this.burnButtonLoading = true
            try {
                let coinCount = 0
                if (formModel.mousdCount === toFixedVal(formModel.maxCointBalance)) {
                    if (toFixedVal(formModel.maxCointBalance) < toFixedVal(formModel.moUSDBalance)) {
                        coinCount = formModel.maxCointBalance * 2
                    } else {
                        coinCount = formModel.maxCointBalance
                    }
                } else if (formModel.mousdCount === toFixedVal(formModel.moUSDBalance)) {
                    coinCount = this.maxBalance
                } else {
                    coinCount = formModel.mousdCount
                }
                let hash = await burn(formModel.baseCoinName, 'moUSD', coinCount, true)
                if (hash) {
                    this.listenerAccountbalance(hash)
                }   
            } catch (error) {
                this.burnButtonLoading = false
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal () {
            this.$refs.CsWatingModalRef.show({
                topAmount: this.formModel.mousdCount,
                topCoinName: 'moUSD',
                bottomAmount: this.formModel.debtAmount,
                bottomCoinName: this.formModel.baseCoinName,
                name: 'burn',
                status: 'wating'
            })
        },

        connectMetaMaskClick () {
            this.$Provider.checkLocalMetaMask()
        },

        cancelClick () {
            this.burnButtonLoading = false
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

.components-burnForm {
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
        margin-top: 30px;
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
            margin-top: 15px;
            .lable {
                font-size: 24px;
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
        }

        .tx-free {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
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

    .tip-content {
        background: #FFF4E4;
        border-radius: 8px;
        font-size: 18px;
        padding: 15px;
        font-family: DINPro-Regular, DINPro;
        font-weight: 400;
        color: #6A6972;
        margin-top: 100px;
    }

    .disableBut {
        margin-top: 20px;
    }

    .but {
        margin-top: 20px;
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
    .components-burnForm {
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
    }
}
</style>