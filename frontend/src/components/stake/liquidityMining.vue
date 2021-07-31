<template>
    <div class="components-global-minMining">
        <div class="top-content">
            <div class="item">
                <span class="content">Stake your LP Tokens to earn $MOT rewards.</span>
            </div>
            <img class="shortBg" src="../../assets/img/short-bg.png" />
        </div>

        <div class="grid-content">
            <div class="item" @click="itemClick(item)" v-for="(item, index) in source.assetsList" :key="index">
                <div class="logo">
                    <img class="img" :src="require(`../../assets/img/logo_${item.coinName}.png`)" />
                    <img src="../../assets/img/logo_moUSD.png" alt="" />
                </div>
                <div class="minming">{{item.coinName}} - USD LP<a-icon class="more" style="color: #6A6972" type="right" /></div>
                <div class="but-list">
                    <div class="but-item">
                        <div class="label">
                            <a-tooltip placement="top">
                                <template slot="title">
                                    <span>{{$t('stake.apyTip')}}</span>
                                </template>
                                {{$t('stake.apy')}} 
                                <a-icon style="margin-left:5px;" type="question-circle" />
                            </a-tooltip>
                        </div>
                        <a-statistic :value="item.apr" :precision="2" suffix="%" :value-style="{'color': '#6641B9', 'font-weight': 500}" />
                    </div>

                    <div class="but-item active">
                        <div class="label">{{$t('stake.totalStaked')}}</div>
                        <a-statistic :value="123" :precision="2" suffix="% moUSD" :value-style="{'color': '#6641B9', 'font-weight': 500}" />
                    </div>
                </div>
            </div>
        </div>
        <CsLiquidityMining ref="CsLiquidityMiningRef" />
    </div>
</template>

<script>
import { syntheticAssets } from '@/config/RewardCollateralDeal.js'
import CsLiquidityMining from '@/components/plugins/CsLiquidityMining'

export default {
    components: { CsLiquidityMining },

    data () {
        return {
            source: {
                assetsList: syntheticAssets
            }
        }
    },

    methods: {
        itemClick (item) {
            this.$refs.CsLiquidityMiningRef.show({
                coinName: item.coinName
            })
        },
    }
}
</script>

<style lang="less" scoped>
.components-global-minMining {
    .top-content {
        position: relative;
        background: #FFF4E4;
        padding: 20px 40px;
        border-radius: 8px;
        .item {
            line-height: 40px;
            .label {
                font-size: 18px;
                font-family: DINPro-Medium, DINPro;
                color: #37373C;
            }
            .content {
                font-size: 18px;
                font-family: DINPro-Regular, DINPro;
                color: #37373C;
            }
        }
        .shortBg {
            position: absolute;
            bottom: 0;
            right: 60px;
            width: 200px;
        }
    }

    .grid-content {
        display: grid;
        grid-template-columns: repeat(4, 23%);
        margin: 20px 0;
        background: linear-gradient(308deg, #F3EEFF 0%, #F0F8FF 54%, #FDF7FF 100%);
        border-radius: 16px;
        padding: 40px;
        justify-content: space-between;
        min-height: 300px;
        .item {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #FFFFFF;
            box-shadow: 0px 6px 12px 0px rgba(141, 115, 245, 0.16);
            border-radius: 16px;
            padding: 20px;
            margin: 10px;
            -webkit-transform: scale(1);
            -moz-transform: scale(1);
            -o-transform: scale(1);
            -webkit-transition-duration: 0.5s;
            -moz-transition-duration: 0.5s;
            -o-transition-duration: 0.5s;
            .logo {
                display: flex;
                .img {
                    z-index: 1;
                    margin-right: -10px;
                }
                img {
                    width: 60px;
                }
            }

            .minming {
                display: flex;
                align-items: center;
                font-size: 24px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #37373C;
                margin: 20px 0;
            }

            .apy {
                font-size: 18px;
                font-family: DINPro-Medium, DINPro;
                font-weight: bold;
                color: #00C487;
            }

            .commont {
                width: 123px;
                height: 32px;
                background: #FFF4E4;
                border-radius: 16px;
                margin: 20px 0;
            }

            .but-list {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-top: 90px;
                .but {
                    width: 120px;
                    background: #7D6EF4;
                    border-radius: 8px;
                    font-size: 16px;
                    font-family: DINPro-Bold, DINPro;
                    font-weight: bold;
                    color: #FFFFFF;
                    margin: 0 10px;
                    border: none;
                }
                .but:hover {
                    opacity: .7;
                }

                .but-item {
                    .label {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #6A6972;
                    }
                    .price {
                        font-size: 18px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: bold;
                        color: #5A208B;
                    }
                }

                .active {
                    text-align: right;
                }

                /deep/ .ant-statistic-content {
                    font-size: 20px;
                }

                /deep/ .ant-statistic-content-value-int {
                    font-size: 20px;
                }

                /deep/ .ant-statistic-content-value-decimal {
                    font-size: 20px;
                }

                /deep/ .ant-statistic-content-suffix {
                    font-size: 20px;
                }
            }
        }

        .item:hover {
            -webkit-transform: scale(1.1);
            -webkit-box-shadow: 0px 0px 30px #ccc;
            -moz-transform: scale(1.1);
            -moz-box-shadow: 0px 0px 30px #ccc;	
            -o-transform: scale(1.1);
            -o-box-shadow: 0px 0px 30px #ccc;
        }
    }
}
</style>