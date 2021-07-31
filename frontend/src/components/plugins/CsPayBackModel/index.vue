<template>
    <a-modal class="plugins-CsClaimModal" :visible="config.visible" width="500px"
        :title="config.title" footer='' @cancel="config.visible = false">
        <div class="modal-content">
            <div class="debt-content-item">
                <div class="content-item">
                    <div class="label">
                        {{$t('debtManagement.outstanding')}} {{formModel.debtCoinName}} {{$t('debtManagement.debt')}}: 
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="formModel.debtPrice | formerAccuracy" style="margin: 0 5px;" :suffix="formModel.debtCoinName" :value-style="{ color: '#5A208B' }" :precision="4" />
                    </div>

                    <div class="inp-blocl">
                        <div class="inp-coin">
                            <a-input-number class="inp" v-model="formModel.payBackAmount" :min="0" placeholder="0.0" :precision=4 />
                            <div class="coin-but" @click="maxClick('payBack')">{{$t('modal.max')}}</div>
                        </div>
                        <a-button :class="formModel.payBackAmount &&
                            formModel.payBackAmount <= formModel.mousdBalance && formModel.payBackAmount <= formModel.debtPrice ? 'butShort' : 'disableShortBut'" 
                            :disabled="!formModel.payBackAmount || formModel.payBackAmount > formModel.mousdBalance || formModel.payBackAmount > formModel.debtPrice"
                            @click="showModalClick('payback')">{{$t('debtManagement.payback')}}
                        </a-button>
                    </div>
                </div>

                <div class="content-item">
                    <div class="label">
                        {{$t('debtManagement.availableToMint')}}: 
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="formModel.mintPrice | formerAccuracy" style="margin: 0 5px;" :suffix="formModel.debtCoinName" :value-style="{ color: '#5A208B' }" :precision="4" />
                    </div>

                    <div class="inp-blocl">
                        <div class="inp-coin">
                            <a-input-number class="inp" v-model="formModel.mintAmount" :min="0" placeholder="0.0" :precision=4 />
                            <div class="coin-but" @click="maxClick('short')">{{$t('modal.max')}}</div>
                        </div>
                        <a-button :class="formModel.mintAmount && formModel.mintAmount <= formModel.mintPrice ? 'butShort' : 'disableShortBut'"
                            :disabled="!formModel.mintAmount || formModel.mintAmount > formModel.mintPrice"
                            @click="showModalClick('mint')">{{$t('debtManagement.short')}}
                        </a-button>
                    </div>
                </div>
            </div>

            <div class="tx-free">
                <div class="lable">{{$t('debtManagement.liquidationPrice')}}</div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.liquidationPrice | formerAccuracy" :precision="4" suffix="USD" style="margin-right: 5px" :value-style="{ color: '#373737' }" />
            </div>

            <div class="tx-free">
                <div class="lable">{{$t('debtManagement.currentPrice')}}</div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.currentPrice | formerAccuracy" :precision="4" suffix="USD" style="margin-right: 5px" :value-style="{ color: '#373737' }" />
            </div>

            <div class="tx-free">
                <div class="lable">{{$t('debtManagement.liquidationRate')}}</div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.liquidationRate * 100" :precision="2" suffix="%" :value-style="{ color: '#373737' }" />
            </div>

            <div class="tx-free">
                <div class="lable">{{$t('debtManagement.current')}}</div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.collateralizationRatio * 100" :precision="2" suffix="%" :value-style="{ color: '#373737' }" />
            </div>

            <div class="tx-free">
                <div class="lable">{{$t('debtManagement.minRate')}}</div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.minRate * 100" :precision="2" suffix="%" :value-style="{ color: '#373737' }" />
            </div>
        </div>

        <CsDebtConfirmModal ref="CsDebtConfirmModalRef" @confirmClick="confirmClick" />
        <CsWatingModal ref='CsWatingModalRef' @confirmClick="confirmClick" />
    </a-modal>
</template>

<script>
import { getStaked, getCollateralRate,
    getDebt, getIssuable, getLiquidationRate, getPrice, getBalance, burn, shortFromPreviousStake } from '@/config/ContractMethods'
    import CsDebtConfirmModal from '@/components/plugins/CsDebtConfirmModal'
    import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import { toFixedVal } from '@/common/utils/filters'

export default {
    components: {
        CsDebtConfirmModal,
        CsWatingModal
    },

    data () {
        return {
            formModel: {
                liquidationPrice: 0,
                currentPrice: 0,
                liquidationRate: 0,
                collateralizationRatio: 0,
                minRate: 0,
                debtCoinName: '',
                payBackAmount: '',
                mintAmount: '',
                clickType: '',
                stakeBalance: 0,
                currentCoinName: '',
                moTslaPrice: 0
            },
            config: {
                visible: false,
                title: ''
            },
            provider: this.$Provider.providerInstance,
            loadding: false,
            account: ''
        }
    },

    methods: {
        show (row) {
            this.formModel.debtCoinName = row.shortAsset
            this.formModel.currentCoinName = row.baseCoinName
            this.account = row.account
            this.config.title = this.$t('debtManagement.outstanding') + ` ${row.shortAsset} ` + this.$t('debtManagement.debt')
            this.initData()
            this.config.visible = true
        },

        initData () {
            this.loadding = true
            this.formModel.payBackAmount = ''
            this.formModel.mintAmount = ''
            this.getData().then(res => {
                this.updateInfo(res)
                this.loadding = false
            })
        },

        async getData () {
            let stakedBalancePromise = getStaked(this.formModel.currentCoinName, this.formModel.debtCoinName, this.account)
            let collateralRatePromise = getCollateralRate(this.formModel.currentCoinName, this.formModel.debtCoinName)
            let debtPricePromise = getDebt(this.formModel.currentCoinName, this.formModel.debtCoinName, this.account)
            let mintPricePromise = getIssuable(this.formModel.currentCoinName, this.account, this.formModel.debtCoinName)
            let linPromise = getLiquidationRate(this.formModel.currentCoinName, this.formModel.debtCoinName)
            let currentPricePromise = getPrice(this.formModel.currentCoinName)
            let moTslaPricePromise = getPrice(this.formModel.debtCoinName)
            let minRatePromise = getCollateralRate(this.formModel.currentCoinName, this.formModel.debtCoinName)
            let assetsBalancePromise = getBalance(this.formModel.currentCoinName, this.account)
            let mousdBalancePromise = getBalance(this.formModel.debtCoinName, this.account)

            let stakedBalance = this.formModel.stakeBalance = await stakedBalancePromise
            let collateralRate = await collateralRatePromise
            let debtAmount = this.formModel.debtPrice = await debtPricePromise
            let mintPrice = this.formModel.mintPrice = await mintPricePromise
            let lin = this.formModel.liquidationRate = await linPromise
            this.formModel.currentPrice = await currentPricePromise
            this.formModel.minRate = await minRatePromise
            this.formModel.assetsBalance = await assetsBalancePromise
            this.formModel.mousdBalance = await mousdBalancePromise
            this.formModel.moTslaPrice = await moTslaPricePromise
            
            return { stakedBalance, collateralRate, debtAmount, mintPrice, lin }
        },

        updateInfo (res) {
            let { lin, debtAmount, stakedBalance } = res
            this.formModel.liquidationPrice = debtAmount ? toFixedVal((lin * debtAmount * this.formModel.moTslaPrice) / stakedBalance) : 0
            this.formModel.collateralizationRatio = toFixedVal(stakedBalance * this.formModel.currentPrice / (debtAmount * this.formModel.moTslaPrice))
        },

        maxClick (type) {
            if (type === 'payBack') {
                if (toFixedVal(this.formModel.mousdBalance) > toFixedVal(this.formModel.debtPrice)) {
                    this.formModel.payBackAmount = toFixedVal(this.formModel.debtPrice)
                } else {
                    this.formModel.payBackAmount = toFixedVal(this.formModel.mousdBalance)
                }
            } else if (type === 'short') {
                this.formModel.mintAmount = toFixedVal(this.formModel.mintPrice)
            }
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('transaction ===', transaction);
                this.initData()
                this.$emit('initAllData')
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            });
        },

        showModalClick (type) {
            let balance = 0
            let amount = ''
            let coinName = this.formModel.debtCoinName
            let countBalance = ''
            let liquidationPrice = 0
            let collateralizationRatio = 0
            let amountAndBalance = 0
            if (type === 'payback') {
                countBalance = this.formModel.debtPrice
                amount = this.formModel.payBackAmount
                balance = this.formModel.mousdBalance
                amountAndBalance = countBalance - amount
                liquidationPrice = toFixedVal((this.formModel.liquidationRate * amountAndBalance) / this.formModel.stakeBalance)
                collateralizationRatio  = toFixedVal((this.formModel.stakeBalance * this.formModel.currentPrice) / (amountAndBalance * this.formModel.moTslaPrice))
            } else if (type === 'mint') {
                countBalance = this.formModel.debtPrice
                amount = this.formModel.mintAmount
                balance = this.formModel.mousdBalance
                amountAndBalance = this.formModel.debtPrice + amount
                liquidationPrice = toFixedVal((this.formModel.liquidationRate * amountAndBalance) / this.formModel.stakeBalance)
                collateralizationRatio  = toFixedVal((this.formModel.stakeBalance * this.formModel.currentPrice) / (amountAndBalance * this.formModel.moTslaPrice))
            }
            this.formModel.clickType = type
            
            this.$refs.CsDebtConfirmModalRef.show({
                title: 'Trade confirmations',
                type,
                amount: toFixedVal(amount),
                balance: balance,
                countBalance,
                amountAndBalance,
                coinName: coinName,
                debtCoinName: this.formModel.debtCoinName,
                liquidationPrice: liquidationPrice,
                collateralizationRatio: collateralizationRatio
            })
        },

        async confirmClick () {
            this.showWatingModal(this.formModel.clickType)
            try {
                let resultHash = ''
                if (this.formModel.clickType === 'payback') {
                    let coinCount = 0
                    if (this.formModel.payBackAmount === toFixedVal(this.formModel.debtPrice)) {
                        if (toFixedVal(this.formModel.mousdBalance) > toFixedVal(this.formModel.debtPrice)) {
                            coinCount = toFixedVal(this.formModel.debtPrice) * 2
                        } else {
                            coinCount = this.formModel.debtPrice
                        }
                    } else if (this.formModel.payBackAmount === toFixedVal(this.formModel.mousdBalance)) {
                        coinCount = this.formModel.mousdBalance
                    } else {
                        coinCount = this.formModel.payBackAmount
                    }
                    resultHash = await burn(this.formModel.currentCoinName, this.formModel.debtCoinName, coinCount, false)
                } else if (this.formModel.clickType === 'mint') {
                    resultHash = await shortFromPreviousStake(this.formModel.currentCoinName, this.formModel.debtCoinName, this.formModel.mintAmount)
                }
                if (resultHash) {
                    this.listenerAccountbalance(resultHash)
                }
            } catch (error) {
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal (type) {
            this.$refs.CsWatingModalRef.show({
                topAmount: this.formModel.collateralAmount,
                topCoinName: this.formModel.collateral,
                bottomAmount: this.formModel.assetAmount,
                bottomCoinName: this.formModel.moASSET,
                name: type,
                status: 'wating'
            })
        },

        claimClick () {}
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-input-number-input {
    font-size: 20px;
    border: 1px solid #d9d9d9;
    border-radius: 0;
    border-right: none;
    height: 100%;
}

.plugins-CsClaimModal {
    .ant-modal-body {
        padding-top: 0;
        .modal-content {
            .debt-content-item {
                .title {
                    height: 40px;
                    line-height: 40px;
                    font-size: 18px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: bold;
                    color: #37373C;
                }

                .content-item {
                    margin: 25px 0;
                    .label {
                        display: flex;
                        align-items: center;
                        font-size: 18px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                    }

                    /deep/ .ant-statistic-content {
                        font-family: DINPro-Medium, DINPro;
                        font-size: 16px;
                    }

                    /deep/ .ant-statistic-content-value-int {
                        font-family: DINPro-Medium, DINPro;
                        font-size: 16px;
                    }

                    /deep/ .ant-statistic-content-value-decimal {
                        font-family: DINPro-Medium, DINPro;
                        font-size: 16px;
                    }

                    /deep/ .ant-statistic-content-suffix {
                        font-family: DINPro-Medium, DINPro;
                        font-size: 16px;
                    }

                    .inp-blocl {
                        display: flex;
                        align-items: center;
                        margin-top: 5px;
                        height: 46px;
                        .inp-coin {
                            flex: 1;
                            position: relative;
                            height: 100%;
                            display: flex;
                            .inp {
                                flex: 1;
                                height: 100%;
                                font-size: 16px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: 400;
                            }

                            .coin-but {
                                cursor: pointer;
                                height: 100%;
                                line-height: 46px;
                                text-align: center;
                                padding: 0 20px;
                                background: #ECE2FF;
                                font-size: 16px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: bold;
                                color: #5A208B;
                                border: 1px solid #D6D6D6;
                            }
                        }

                        .butShort {
                            min-width: 120px;
                            text-align: center;
                            height: 100%;
                            background: #7D6EF4;
                            border: none;
                            border-radius: 2px;
                            margin-left: 20px;
                            color: #fff;
                            font-weight: bold;
                            font-size: 18px;
                        }

                        .disableShortBut {
                            min-width: 120px;
                            text-align: center;
                            height: 100%;
                            background: #D2CCFF;
                            border: none;
                            border-radius: 2px;
                            margin-left: 20px;
                            color: #fff;
                            font-weight: bold;
                            font-size: 18px;
                        }

                        .butShort:hover {
                            background: #968BF0;
                        }
                    }
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
                    height: 1px;
                    border: 1px dashed #f3f3f7;
                    margin: 0 10px;
                }
                .ust {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;
                }
                /deep/ .ant-statistic-content {
                    font-family: DINPro-Regular, DINPro;
                    font-size: 16px;
                    font-weight: 400;
                }

                /deep/ .ant-statistic-content-value-int {
                    font-family: DINPro-Regular, DINPro;
                    font-size: 16px;
                    font-weight: 400;
                }

                /deep/ .ant-statistic-content-value-decimal {
                    font-family: DINPro-Regular, DINPro;
                    font-size: 16px;
                    font-weight: 400;
                }

                /deep/ .ant-statistic-content-suffix {
                    font-family: DINPro-Regular, DINPro;
                    font-size: 16px;
                    font-weight: 400;
                }
            }
        }
    }
}
</style>