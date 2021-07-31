<template>
    <div class="view-debt">
        <div class="debt-content">
            <div class="header">
                <span class="label">{{$t('debtManagement.selectStakedCollateral')}}</span>
                <div class="sel-assetx" @click="selectCoinClick">
                    <img class="img" :src="require(`../../assets/img/logo_${formModel.currentCoinName}.png`)" />
                    {{formModel.currentCoinName}}
                    <a-icon type="caret-down" />
                </div>
            </div>

            <div class="debt-body">
                <div class="debt-content-top">
                    <div class="content">
                        <div class="item border">
                            <div class="line-item">
                                <div class="label">{{$t('debtManagement.liquidationPrice')}}</div>
                                <div class="val">
                                    <span class="amount"><a-statistic :value="formModel.liquidationPrice | formerAccuracy" style="margin-right: 5px" :precision=4 /> USD</span>
                                    <span class="coin">{{`(${formModel.currentCoinName}/USD)`}}</span>
                                </div>
                            </div>

                            <div class="line-item">
                                <div class="label title">{{$t('debtManagement.currentPrice')}}</div>
                                <div class="val">
                                    <span class="coin"><a-statistic :value="formModel.currentPrice | formerAccuracy" style="margin-right: 5px" /> USD</span>
                                    <span class="coin">{{`(${formModel.currentCoinName}/USD)`}}</span>
                                </div>
                            </div>

                            <div class="line-item">
                                <div class="label title">{{$t('debtManagement.liquidationRate')}}</div>
                                <div class="val">
                                    <span class="coin"> <a-statistic :value="formModel.liquidationRate * 100" suffix="%" style="margin-right: 5px" :precision="2" /></span>
                                </div>
                            </div>
                        </div>

                        <div class="item">
                            <div class="line-item">
                                <div class="label title">{{$t('debtManagement.staked')}}</div>
                                <div class="val">
                                    <span class="coin"><a-statistic :value="formModel.stakeBalance | formerAccuracy" style="margin-right: 5px" :precision="4" /></span>
                                </div>
                            </div>

                            <div class="line-item">
                                <div class="label title">{{$t('debtManagement.current')}}</div>
                                <div class="val">
                                    <span class="coin"><a-statistic :value="formModel.collateralizationRatio * 100" suffix="%" style="margin-right: 5px" :precision="2" /></span>
                                </div>
                            </div>

                            <div class="line-item">
                                <div class="label title">{{$t('debtManagement.minRate')}}</div>
                                <div class="val">
                                    <span class="coin"><a-statistic :value="formModel.minRate * 100" suffix="%" style="margin-right: 5px" :precision="2" /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="debt-content">
                    <div class="debt-content-item">
                        <div class="title">{{formModel.currentCoinName}} {{$t('debtManagement.staked')}}</div>

                        <div class="content-item">
                            <div class="label">
                                {{$t('debtManagement.staked')}}: 
                                <a-spin v-if="loadding" :spinning="loadding"/>
                                <a-statistic v-else :value="formModel.stakeBalance | formerAccuracy" style="margin: 0 5px;" :precision="4" :suffix="formModel.currentCoinName" :value-style="{ color: '#5A208B' }" />
                            </div>

                            <div class="inp-blocl">
                                <div class="inp-coin">
                                    <a-input-number class="inp" v-model="formModel.stakeAmount" :min="0" placeholder="0.0"
                                        :disabled="!formModel.stakeBalance" :precision=4 autoFocus />
                                    <div class="coin-but" @click="maxClick('staked')">{{$t('modal.max')}}</div>
                                </div>
                                <a-button :class="formModel.stakeAmount && 
                                    formModel.stakeAmount <= formModel.stakeBalance &&
                                    formModel.stakeAmount <= formModel.assetsBalance  ? 
                                    'butShort' : 'disableShortBut'"
                                    :loading="formModel.stakeButtonLoading"
                                    :disabled="!formModel.stakeAmount || formModel.stakeAmount > formModel.stakeBalance || formModel.stakeAmount > formModel.assetsBalance"
                                    @click="showModalClick('Staked')">
                                    {{$t('debtManagement.stake')}}
                                </a-button>
                            </div>
                        </div>

                        <div class="content-item">
                            <div class="label">
                                {{$t('debtManagement.availableToUnstake')}}: 
                                <a-spin v-if="loadding" :spinning="loadding"/>
                                <a-statistic v-else :value="formModel.unStakeBalance | formerAccuracy" style="margin: 0 5px" :precision="4" :suffix="formModel.currentCoinName" :value-style="{ color: '#5A208B' }" />
                            </div>

                            <div class="inp-blocl">
                                <div class="inp-coin">
                                    <a-input-number class="inp" v-model="formModel.unStakeAmount" :min="0" placeholder="0.0"
                                        :disabled="!formModel.stakeBalance" :precision=4 />
                                    <div class="coin-but" @click="maxClick('unStake')">{{$t('modal.max')}}</div>
                                </div>
                                <a-button :class="formModel.unStakeAmount && formModel.unStakeAmount <= formModel.unStakeBalance ? 'butShort' : 'disableShortBut'"
                                    :disabled="!formModel.unStakeAmount || formModel.unStakeAmount > formModel.unStakeBalance"
                                    :loading="formModel.unStakeButtonLoading"
                                    @click="showModalClick('Unstaked')">
                                    {{$t('debtManagement.unstake')}}
                                </a-button>
                            </div>
                        </div>
                    </div>

                    <div class="debt-content-item">
                        <div class="title">{{$t('debtManagement.outstanding')}} {{formModel.debtCoinName}} {{$t('debtManagement.debt')}}</div>

                        <div class="content-item">
                            <div class="label">
                                {{$t('debtManagement.outstanding')}} {{formModel.debtCoinName}} {{$t('debtManagement.debt')}}: 
                                <a-spin v-if="loadding" :spinning="loadding"/>
                                <a-statistic v-else :value="formModel.debtPrice" style="margin: 0 5px;" :precision="4" :suffix="formModel.debtCoinName" :value-style="{ color: '#5A208B' }" />
                            </div>

                            <div class="inp-blocl">
                                <div class="inp-coin">
                                    <a-input-number class="inp" v-model="formModel.payBackAmount" :min="0" placeholder="0.0"
                                        :disabled="!formModel.stakeBalance" :precision=4 />
                                    <div class="coin-but" @click="maxClick('payBack')">{{$t('modal.max')}}</div>
                                </div>
                                <a-button :class="formModel.payBackAmount &&
                                    formModel.payBackAmount <= formModel.mousdBalance && formModel.payBackAmount <= formModel.debtPrice ?
                                    'butShort' : 'disableShortBut'"
                                    :disabled="!formModel.payBackAmount || formModel.payBackAmount > formModel.mousdBalance || formModel.payBackAmount > formModel.debtPrice"
                                    :loading="formModel.stakeButtonLoading" 
                                    @click="showModalClick('payback')">
                                    {{$t('debtManagement.payback')}}
                                </a-button>
                            </div>
                        </div>

                        <div class="content-item">
                            <div class="label">
                                {{$t('debtManagement.availableToMinting')}}: 
                                <a-spin v-if="loadding" :spinning="loadding"/>
                                <a-statistic v-else :value="formModel.mintPrice | formerAccuracy" style="margin: 0 5px;" :precision="4" :suffix="formModel.debtCoinName" :value-style="{ color: '#5A208B' }" />
                            </div>

                            <div class="inp-blocl">
                                <div class="inp-coin">
                                    <a-input-number class="inp" v-model="formModel.mintAmount" :min="0" placeholder="0.0"
                                        :disabled="!formModel.stakeBalance" :precision=4 />
                                    <div class="coin-but" @click="maxClick('mint')">{{$t('modal.max')}}</div>
                                </div>
                                <a-button :class="formModel.mintAmount && formModel.mintAmount <= formModel.mintPrice ? 'butShort' : 'disableShortBut'"
                                    :disabled="!formModel.mintAmount || formModel.mintAmount > formModel.mintPrice"
                                    :loading="formModel.unStakeButtonLoading"
                                    @click="showModalClick('mint')">
                                    {{$t('debtManagement.mint')}}
                                </a-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <CsDebtConfirmModal ref="CsDebtConfirmModalRef" @confirmClick="confirmClick"/>
        <CsSelectDebtTokenModal ref="CsSelectCoinModalRef" @selectCoinCallback="selectCoinCallback" />
        <CsWatingModal ref='CsWatingModalRef' @confirmClick="confirmClick" @cancelClick="cancelClick"></CsWatingModal>
    </div>
</template>

<script>
import { getStaked, getCollateralRate, getClaimable, approve, stakeFromCoin, stakeFromToken, claim, burn, 
    getDebt, getIssuable, mintFromPreviousStake, getLiquidationRate, getPrice, getBalance } from '@/config/ContractMethods'
import CsDebtConfirmModal from '@/components/plugins/CsDebtConfirmModal'
import CsSelectDebtTokenModal from '@/components/plugins/CsSelectDebtTokenModal'
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'debt',

    components: {
        CsDebtConfirmModal,
        CsSelectDebtTokenModal,
        CsWatingModal
    },

    data () {
        return {
            formModel: {
                liquidationPrice: 0,
                currentPrice: 0,
                collateralizationRatio: 0,
                stakeBalance: '',
                stakeAmount: '',
                unStakeBalance: '',
                unStakeAmount: '',
                payBackAmount: '',
                mintAmount: '',
                debtCoinName: 'moUSD',
                currentCoinName: 'MOT',
                stakeButtonLoading: false,
                unStakeButtonLoading: false,
                clickType: '',
                debtPrice: '',
                mintPrice: '',
                liquidationRate: 0,
                minRate: 0,
                assetsBalance: 0,
                mousdBalance: 0
            },
            account: this.$store.state.account,
            loadding: false,
            provider: this.$Provider.providerInstance
        }
    },

    watch: {
        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        }
    },

    created () {
        if (this.account) {
            this.initData()
        }
        window.parent.scrollTo(0, 0)
    },

    methods: {
        async initData () {
            this.formModel.stakeAmount = ''
            this.formModel.unStakeAmount = ''
            this.formModel.payBackAmount = ''
            this.formModel.mintAmount = ''
            if (this.account) {
                this.loadding = true
                this.getData().then(res => {
                    this.updateInfo(res)
                    this.loadding = false
                })
            }
        },

        async getData () {
            let stakedBalancePromise = getStaked(this.formModel.currentCoinName, 'moUSD', this.account)
            let collateralRatePromise = getCollateralRate(this.formModel.currentCoinName, 'moUSD')
            let debtPricePromise = getDebt(this.formModel.currentCoinName, 'moUSD', this.account,)
            let mintPricePromise = getIssuable(this.formModel.currentCoinName, this.account, 'moUSD')
            let linPromise = getLiquidationRate(this.formModel.currentCoinName, 'moUSD')
            let currentPricePromise = getPrice(this.formModel.currentCoinName)
            let assetsBalancePromise = getBalance(this.formModel.currentCoinName, this.account)
            let mousdBalancePromise = getBalance('moUSD', this.account)

            let stakedBalance = this.formModel.stakeBalance = await stakedBalancePromise
            let collateralRate = this.formModel.minRate = await collateralRatePromise
            let claimable = this.formModel.unStakeBalance = await getClaimable(this.formModel.currentCoinName, this.account, 'moUSD', collateralRate)
            let debtPrice = this.formModel.debtPrice = await debtPricePromise
            let mintPrice = this.formModel.mintPrice = await mintPricePromise
            let lin = this.formModel.liquidationRate = await linPromise
            this.formModel.currentPrice = await currentPricePromise
            this.formModel.assetsBalance = await assetsBalancePromise
            this.formModel.mousdBalance = await mousdBalancePromise
            
            return { stakedBalance, collateralRate, claimable, debtPrice, mintPrice, lin }
        },

        updateInfo (res) {
            let { lin, debtPrice, stakedBalance } = res
            this.formModel.liquidationPrice = debtPrice ? toFixedVal((lin * debtPrice) / stakedBalance) : 0
            this.formModel.collateralizationRatio = debtPrice ? toFixedVal(stakedBalance * this.formModel.currentPrice / debtPrice) : 0
        },

        selectCoinClick () {
            this.$refs.CsSelectCoinModalRef.show({
                currentCoinName: this.formModel.currentCoinName,
                moAssetsName: 'moUSD'
            })
        },

        selectCoinCallback ({ coinName }) {
            this.formModel.currentCoinName = coinName
            this.initData()
        },

        maxClick (type) {
            switch (type) {
                case 'staked':
                    if (toFixedVal(this.formModel.assetsBalance) > toFixedVal(this.formModel.stakeBalance)) {
                        this.formModel.stakeAmount = toFixedVal(this.formModel.stakeBalance)
                    } else {
                        this.formModel.stakeAmount = toFixedVal(this.formModel.assetsBalance)
                    }
                    break

                case 'unStake':
                    this.formModel.unStakeAmount = toFixedVal(this.formModel.unStakeBalance)
                    break

                case 'payBack':
                    if (toFixedVal(this.formModel.mousdBalance) > toFixedVal(this.formModel.debtPrice)) {
                        this.formModel.payBackAmount = toFixedVal(this.formModel.debtPrice)
                    } else {
                        this.formModel.payBackAmount = toFixedVal(this.formModel.mousdBalance)
                    }
                    break

                case 'mint':
                    this.formModel.mintAmount = toFixedVal(this.formModel.mintPrice)
                    break
            }
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('transaction ===', transaction);
                this.ressetFormData()
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            });
        },

        ressetFormData () {
            this.initData()
        },

        showModalClick (type) {
            let balance = 0
            let amount = ''
            let coinName = ''
            let countBalance = ''
            let liquidationPrice = 0
            let collateralizationRatio = 0
            let amountAndBalance = 0
            if (type === 'Staked') {
                coinName = this.formModel.currentCoinName
                countBalance = this.formModel.stakeBalance
                amount = this.formModel.stakeAmount
                amountAndBalance = countBalance + amount
                balance = this.formModel.assetsBalance
                liquidationPrice = toFixedVal((this.formModel.liquidationRate * this.formModel.debtPrice) / amountAndBalance)
                collateralizationRatio  = this.formModel.debtPrice ? toFixedVal(amountAndBalance * this.formModel.currentPrice / this.formModel.debtPrice) : 0
            } else if (type === 'Unstaked') {
                coinName = this.formModel.currentCoinName
                countBalance = this.formModel.stakeBalance // this.formModel.unStakeBalance
                amount = this.formModel.unStakeAmount
                amountAndBalance = countBalance - amount
                balance = this.formModel.assetsBalance
                liquidationPrice = toFixedVal((this.formModel.liquidationRate * this.formModel.debtPrice) / amountAndBalance)
                collateralizationRatio  = this.formModel.debtPrice ? toFixedVal(amountAndBalance * this.formModel.currentPrice / this.formModel.debtPrice) : 0
            } else if (type === 'payback') {
                coinName = 'moUSD'
                countBalance = this.formModel.debtPrice
                amount = this.formModel.payBackAmount
                balance = this.formModel.mousdBalance
                amountAndBalance = countBalance - amount
                liquidationPrice = toFixedVal((this.formModel.liquidationRate * amountAndBalance) / this.formModel.stakeBalance)
                collateralizationRatio  = toFixedVal(this.formModel.stakeBalance * this.formModel.currentPrice / amountAndBalance)
            } else if (type === 'mint') {
                coinName = 'moUSD'
                countBalance = this.formModel.debtPrice // this.formModel.mintPrice
                amount = this.formModel.mintAmount
                balance = this.formModel.mousdBalance
                amountAndBalance = this.formModel.debtPrice + amount
                liquidationPrice = toFixedVal((this.formModel.liquidationRate * amountAndBalance) / this.formModel.stakeBalance)
                collateralizationRatio  = toFixedVal(this.formModel.stakeBalance * this.formModel.currentPrice / amountAndBalance)
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
                if (this.formModel.clickType === 'Staked') {
                    if (this.formModel.currentCoinName === 'MATIC') {
                        resultHash = await stakeFromCoin('moUSD', this.formModel.stakeAmount)
                        this.listenerAccountbalance(resultHash)
                    } else {
                        let hash = await approve(this.formModel.currentCoinName, this.formModel.stakeAmount)
                        if (hash) {
                            this.provider.once(hash, async (transaction) => {
                                console.log('transaction===', transaction)
                                resultHash = await stakeFromToken(this.formModel.currentCoinName, 'moUSD', this.formModel.stakeAmount)
                                if (resultHash) {
                                    this.listenerAccountbalance(resultHash)
                                }
                            })
                        }
                    }
                } else if (this.formModel.clickType === 'Unstaked') { 
                    resultHash = await claim(this.formModel.currentCoinName, 'moUSD', this.formModel.unStakeAmount)
                } else if (this.formModel.clickType === 'payback') {
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
                    resultHash = await burn(this.formModel.currentCoinName, 'moUSD', coinCount, false)
                } else if (this.formModel.clickType === 'mint') {
                    resultHash = await mintFromPreviousStake(this.formModel.currentCoinName, this.formModel.mintAmount)
                }
                if (resultHash && this.formModel.clickType !== 'Staked') {
                    this.listenerAccountbalance(resultHash)
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

        cancelClick () {
            this.buyButtonLoading = false
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-input-number-input {
    border-radius: 0;
    border: 1px solid #d9d9d9;
    border-right: none;
    height: 46px;

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

/deep/ .ant-input-number-input {
    &::placeholder {
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 18px;
        font-family: DINPro-Regular, DINPro;
        margin-top: -10px;
    }
}

.view-debt {
    margin-top: 10px;
    padding: 20px 160px;
    height: calc(100vh - 340px);
    min-height: 600px;
    background: #F6F7FB;
    border-radius: 16px;
    .debt-content {
        .header {
            display: flex;
            height: 40px;
            line-height: 40px;
            align-items: center;
            .label {
                display: flex;
                align-items: center;
                font-size: 24px;
                font-family: DINPro-Bold, DINPro;
                font-weight: bold;
                color: #37373C;
                line-height: 31px;
                opacity: 1;
            }

            .sel-assetx {
                display: flex;
                align-items: center;
                min-width: 140px;
                background: rgba(165, 100, 241, 0.1);
                border-radius: 12px;
                border: 1px solid #A564F1;
                margin-left: 20px;
                justify-content: space-between;
                padding: 0 10px;
                .img {
                    width: 30px;
                }
            }
        }

        .debt-body {
            .debt-content-top {
                height: 177px;
                background: #FFFFFF;
                box-shadow: 0px 4px 12px 0px rgba(0, 104, 255, 0.2);
                border-radius: 8px;
                border: 1px solid #F3F3F7;
                margin: 30px 0;
                padding: 30px 0;
                .content {
                    display: flex;
                    align-items: center;
                    .item {
                        flex: 1;
                        padding: 0 70px;
                        .line-item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            height: 40px;
                            line-height: 40px;
                            .label {
                                display: flex;
                                align-items: center;
                                font-size: 18px;
                                font-family: DINPro-Medium, DINPro;
                                font-weight: bold;
                                color: #37373C;
                            }

                            .title {
                                font-size: 16px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: 400;
                                color: #6A6972;
                            }

                            .val {
                                display: flex;
                                align-content: center;
                                .amount {
                                    display: flex;
                                    align-content: center;
                                    font-size: 16px;
                                    font-family: DINPro-Medium, DINPro;
                                    font-weight: bold;
                                    color: #37373C;
                                }
                                .coin {
                                    display: flex;
                                    align-content: center;
                                    font-size: 16px;
                                    font-family: DINPro-Regular, DINPro;
                                    font-weight: 400;
                                    color: #37373C;
                                    margin-left: 5px;
                                    /deep/ .ant-statistic-content {
                                        font-family: DINPro-Regular, DINPro;
                                        font-weight: 400;
                                    }

                                    /deep/ .ant-statistic-content-value-int {
                                        font-family: DINPro-Regular, DINPro;
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
                    .border {
                        border-right: 1px dashed #f3f3f7;
                    }
                }
            }

            .debt-content {
                display: flex;
                justify-content: space-between;
                margin-top: 30px;
                .debt-content-item {
                    flex: 1;
                    padding: 20px 50px 0 50px;
                    min-height: 250px;
                    background: #FFFFFF;
                    box-shadow: 0px 4px 12px 0px rgba(0, 104, 255, 0.2);
                    border-radius: 8px;
                    border: 1px solid #F3F3F7;

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

                        .inp-blocl {
                            display: flex;
                            align-items: center;
                            margin-top: 5px;
                            height: 46px;
                            .inp-coin {
                                position: relative;
                                height: 100%;
                                display: flex;
                                .inp {
                                    width: 250px;
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
                                min-width: 100px;
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
                                min-width: 100px;
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
                .debt-content-item:first-child {
                    margin-right: 30px;
                }
                .debt-content-item:last-child {
                    margin-left: 30px;
                }
            }
        }
    }
}
</style>