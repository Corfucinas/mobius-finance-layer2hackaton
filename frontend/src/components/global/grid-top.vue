<template>
    <div class="top">
        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.motPrice')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="motPrice" :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                    <!-- #FF8004 #00c480 -->
                    <a-statistic :value="upVal" suffix="%" :value-style="{ color: '#00c480', 'font-size': '18px' }" style="margin-left: 20px">
                        <template #prefix>
                            <!-- <a-icon type="arrow-down" /> -->
                            <a-icon type="arrow-up" />
                        </template>
                    </a-statistic>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/mot-p.png" alt="">
            </div>
        </div>

        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.totalMotLocked')}}</div>
                <div class="usd-price">
                    <a-spin v-if="loadding" :spinning="loadding"/>
                    <a-statistic v-else :value="totalMotAmount | formerAccuracy" :precision="4" />
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/lock.png" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import Contract from '@/config/Contract.js'
import { getPrice, getBalance } from '@/config/ContractMethods'

export default {
    name: 'gridTop',

    data () {
        return {
            motPrice: 0,
            totalMotAmount: 0,
            loadding: false,
            account: this.$store.state.account,
            upVal: 0
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
        initData () {
            this.loadding = true
            this.getData().then(res => {
                let { motPrice, totalMotAmount } = res
                this.motPrice = motPrice
                this.totalMotAmount = totalMotAmount
                this.loadding = false
            })
        },

        async getData () {
            let motPricePromise = getPrice('MOT')
            let totalMotBalancePromise = getBalance('MOT', Contract['mobiusContract'].address)

            let motPrice = await motPricePromise
            let totalMotAmount = await totalMotBalancePromise

            return { motPrice, totalMotAmount }
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

/deep/ .ant-statistic-content-suffix {
    font-size: 20px;
}

.top {
    display: flex;
    justify-content: space-between;
    padding: 30px 0;
    .item {
        display: flex;
        align-items: center;
        height: 180px;
        border-radius: 20px;
        background: #F5F0FF;
        padding: 0 30px;
        width: 48%;

        .left {
            flex: .6;
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
                    font-family: DINPro-Bold, DINPro;
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
            flex: .4;
            img {
                width: 100%;
                margin-top: -50px;
            }
        }
    }
}
</style>