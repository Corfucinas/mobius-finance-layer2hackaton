<template>
    <div class="grid-total">
        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.moASSETSMarketCap')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="totalCap | formerAccuracy" :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/moASSETS.png" alt="">
            </div>
        </div>

        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.totalValueLocked')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="totalPrice"  :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/mm.png" alt="">
            </div>
        </div>

        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.moAssetsHoldings')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="totalMoPrice" :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/tm.png" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import Contract from '@/config/Contract'
import { getDynamicTotalDebt, getPrice, getBalance } from '@/config/ContractMethods'
import assetsList from '@/config/Assets'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'gridTotal',

    data () {
        return {
            totalCap: 0,
            loadding: false,
            totalPrice: 0,
            totalMoPrice: 0,
            account: this.$store.state.account
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
    },

    methods: {
        async initData () {
            this.loadding = true
            this.getDynamicTotalDebt()
            this.featch()
        },

        async getDynamicTotalDebt () {
            let totalCap = await getDynamicTotalDebt()
            this.totalCap = totalCap
            this.loadding = false
        },

        async featch () {
            let mobiusAccount = Contract['mobiusContract'].address
            assetsList.forEach((item) => {
                this.getData(item, mobiusAccount)
            })
        },

        async getData (item, mobiusAccount) {
            try {
                let assetsPromise = null
                let pricePromise = null
                if (item.type === 'assets') {
                    assetsPromise = getBalance(item.name, mobiusAccount)
                } else if (item.type === 'moAssets') {
                    assetsPromise = getBalance(item.name, this.account)
                }
                pricePromise = getPrice(item.name)
                let balance = await assetsPromise
                let price = await pricePromise
                if (item.type === 'assets') {
                    this.totalPrice += price * toFixedVal(balance)
                } else if (item.type === 'moAssets') {
                    this.totalMoPrice += price * toFixedVal(balance)
                }
            } catch (error) {
                console.log('error===', error)
            }
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-statistic-content {
    font-size: 32px;
}

/deep/ .ant-statistic-content-value-decimal {
    font-size: 32px;
}

.grid-total {
    display: flex;
    justify-content: space-between;
    padding-bottom: 30px;
    .item {
        display: flex;
        align-items: center;
        height: 180px;
        border-radius: 20px;
        background: #F6F7FB;
        padding: 0 30px;
        width: 32%;

        .left {
            flex: .7;
            .mot-price {
                font-size: 20px;
                font-family: DINPro-Medium, DINPro;
                font-weight: bold;
                color: #4E4A92;
            }
            .usd-price {
                display: flex;
                align-items: center;
                margin-top: 10px;
                .usd {
                    font-size: 32px;
                    font-weight: bold;
                    color: #37373C;

                    .unit {
                        font-size: 20px;
                    }
                }

                .price {
                    font-size: 24px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #00C487;
                }
            }
        }

        .right {
            flex: .3;
            img {
                width: 100%;
            }
        }
    }
}

@media screen and (max-width: 750px) {
    .grid-total {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-bottom: 30px;
        .item {
            display: flex;
            align-items: center;
            height: 110px;
            border-radius: 8px;
            background: #F6F7FB;
            padding: 10px;
            width: 100%;
            margin-top: 10px;

            .left {
                flex: .7;
                .mot-price {
                    font-size: 18px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: bold;
                    color: #4E4A92;
                }
                .usd-price {
                    display: flex;
                    align-items: center;
                    margin-top: 10px;
                    .usd {
                        font-size: 16px;
                        font-weight: bold;
                        color: #37373C;
                    }

                    .price {
                        font-size: 24px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #00C487;
                    }
                }
            }

            .right {
                flex: .3;
                img {
                    width: 100%;
                }
            }
        }
    }
}
</style>