<template>
    <div class="stake-content">
        <div class="switch-table-content">
            <div class="switch-table">
                <a-tabs default-active-key="1">
                    <a-tab-pane key="1" :tab="$t('stake.mintMining')">
                        <MinMining />
                    </a-tab-pane>
                    <!-- <a-tab-pane key="2" :tab="$t('stake.liquidityMining')">
                        <LiquidityMining />
                    </a-tab-pane> -->
                    <a-tab-pane key="3" :tab="$t('stake.tradeMining')">
                        <TradMining />
                    </a-tab-pane>
                </a-tabs>
            </div>
        </div>
    </div>
</template>

<script>
// import LiquidityMining from '@/components/stake/liquidityMining'
import MinMining from '@/components/stake/minMining'
import TradMining from '@/components/stake/tradeMining'

export default {
    name: 'stake',

    components: { MinMining, TradMining }, // LiquidityMining

    data () {
        return {
            source: {
                activeStatue: 'mining',
            },
            provider: this.$Provider.providerInstance
        }
    },

    created () {
        // this.initContract()
    },

    methods: {
        itemMintClick (item) {
            this.$router.push(`/home/mint?baseCoinName=${item.fromCoinName}&tokenName=${item.toCoinName}`)
        },

        itemTradingClick (item) {
            this.$router.push(`/home/trade?baseCoinName=${item.fromCoinName}&tokenName=${item.toCoinName}`)
        },
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-tabs-nav .ant-tabs-tab {
    font-size: 24px;
    font-family: DINPro-Regular, DINPro;
    font-weight: 400;
    color: #6A6972;
}
/deep/ .ant-tabs-nav .ant-tabs-tab-active {
    font-size: 32px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: #37373C;
}
/deep/ .ant-tabs-ink-bar {
    background-color: #37373C;
}

.stake-content {
    .switch-table-content {
        .switch-table {
            .switch-item {
                cursor: pointer;
                font-size: 32px;
                font-family: DINPro-Bold, DINPro;
                font-weight: bold;
                color: #6A6972;
                margin-right: 50px;
                padding-bottom: 10px;
            }
            .active {
                border-bottom: 1px solid #37373C;
                color: #37373C;
            }
        }

        .grid-content {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 50px;
            margin: 20px 0;
            
            .item {
                cursor: pointer;
                background: #F6F7FB;
                border-radius: 17px;
                height: 200px;
                padding: 20px;
                .item-top {
                    display: flex;
                    align-content: center;
                    justify-content: space-between;
                    height: 50px;
                    line-height: 50px;

                    .left {
                        display: flex;
                        flex: 0.3;
                        img {
                            height: 48px;
                        }
                    }

                    .right {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex: 0.7;
                        font-size: 32px;
                        font-family: DINPro-Bold, DINPro;
                        font-weight: bold;
                        color: #37373C;
                        .more {
                            font-size: 20px;
                            padding-left: 20px;
                        }
                    }
                    .bottom {
                        display: flex;
                        flex: 0.7;
                        justify-content: space-between;
                        .cel {
                            .title {
                                font-size: 20px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: 400;
                                color: #4E4A92; 
                            }
                            .price {
                                font-size: 20px;
                                font-family: DINPro-Medium, DINPro;
                                font-weight: 500;
                                color: #37373C;
                            }
                        }
                    }
                }
            }

            .item:hover {
                border-left: 10px solid #B691FF;
                box-shadow:0px 0px 10px #000;
                opacity: .7;
            }
            .active {
                border-left: 10px solid #B691FF;
            }
        }
    }
}

@media screen and (max-width: 750px) {
    .stake-content {
        .switch-table-content {
            .switch-table {
                .switch-item {
                    cursor: pointer;
                    font-size: 16px;
                    font-family: DINPro-Bold, DINPro;
                    font-weight: bold;
                    color: #6A6972;
                    margin-right: 20px;
                    padding-bottom: 10px;
                    white-space: nowrap;
                }
                .active {
                    border-bottom: 1px solid #37373C;
                    color: #37373C;
                }
            }

            .grid-content {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                grid-gap: 20px;
                margin-top: 20px;
                box-sizing: border-box;
                .item {
                    cursor: pointer;
                    background: #F6F7FB;
                    border-radius: 8px;
                    height: 140px;
                    padding: 20px;
                    .item-top {
                        display: flex;
                        align-content: center;
                        align-items: center;
                        justify-content: space-between;
                        height: 40px;
                        line-height: 40px;

                        .left {
                            display: flex;
                            flex: .4;
                            img {
                                height: 30px;
                            }
                        }

                        .right {
                            flex: .6;
                            font-size: 14px;
                            font-family: DINPro-Bold, DINPro;
                            font-weight: bold;
                            color: #37373C;
                            text-align: right;
                            i {
                                margin-left: 10px;
                            }
                        }
                        .bottom {
                            flex: .6;
                            display: flex;
                            justify-content: space-between;
                            .cel {
                                line-height: 20px;
                                margin-top: 15px;
                                .title {
                                    font-size: 14px;
                                    font-family: DINPro-Regular, DINPro;
                                    font-weight: 400;
                                    color: #4E4A92; 
                                }
                                .price {
                                    font-size: 14px;
                                    font-family: DINPro-Medium, DINPro;
                                    font-weight: 500;
                                    color: #37373C;
                                    margin-top: 15px;
                                }
                            }
                        }
                    }
                }

                .item:hover {
                    border-left: none;
                }
                .active {
                    border-left: none;
                }
            }
        }
    }
}
</style>