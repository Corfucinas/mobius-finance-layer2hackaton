<template>
    <div class="grid-total">
        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.staked')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="totalStakePrice" :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/stakeBalance.png" alt="">
            </div>
        </div>

        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.profits')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="totalProfitsPrice | formerAccuracy"  :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/Profits.png" alt="">
            </div>
        </div>

        <div class="item">
            <div class="left">
                <div class="mot-price">{{$t('top.debt')}}</div>
                <div class="usd-price">
                    <div class="usd">
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="totalDebtPrice | formerAccuracy" :precision="4" style="margin-right: 5px" />
                        <span class="unit">USD</span>
                    </div>
                </div>
            </div>

            <div class="right">
                <img src="../../assets/img/Debt.png" alt="">
            </div>
        </div>
    </div>
</template>

<script>
import { getTotalStakedValue } from '@/config/ContractMethods'
import { syntheticAssets } from '@/config/RewardCollateralDeal'

export default {
    name: 'shortGridTop',

    data () {
        return {
            loadding: false,
            totalStakePrice: 0,
            totalDebtPrice: 0,
            totalProfitsPrice: 0,
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
        initData () {
            this.loadding = true
            this.getTotalStaked()
        },

        updateInfo (res) {
            this.loadding = false
            this.totalDebtPrice = res.totalDebtPrice
            this.totalProfitsPrice = res.totalProfitsPrice
            this.totalStakePrice = res.totalStakePrice
        },

        async getTotalStaked () {
            let moAssetsList = []
            syntheticAssets.forEach((item) => {
                moAssetsList.push(item.coinName)
            })
            this.totalStakePrice = await getTotalStakedValue([], moAssetsList, this.account)
            this.loadding = false
        },
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
        padding: 0 50px;
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