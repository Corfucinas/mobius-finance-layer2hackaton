<template>
    <a-modal width="920px" class="components-plugins-stakerModal" :visible="config.visible" :title="$t('modal.selectStakedCollateral')" footer='' @cancel="config.visible = false">
        <div class="modal-content">
            <div class="debt-content-top">
                <div class="content">
                    <div class="item border">
                        <div class="line-item">
                            <div class="label">{{$t('debtManagement.liquidationPrice')}}</div>
                            <div class="val">
                                <span class="amount"><a-statistic :value="formModel.liquidationPrice | formerAccuracy" style="margin-right: 5px" /> USD</span>
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
                                <span class="coin">30% USD</span>
                            </div>
                        </div>
                    </div>

                    <div class="item">
                        <div class="line-item">
                            <div class="label">{{$t('debtManagement.collateralizationRatio')}}</div>
                            <div class="val">
                                <span class="amount"><a-statistic :value="formModel.collateralizationRatio | formerAccuracy" style="margin-right: 5px" /> USD</span>
                            </div>
                        </div>

                        <div class="line-item">
                            <div class="label">{{$t('debtManagement.current')}}</div>
                            <div class="val">
                                <span class="coin">300%</span>
                            </div>
                        </div>

                        <div class="line-item">
                            <div class="label">{{$t('debtManagement.minRate')}}</div>
                            <div class="val">
                                <span class="coin">150%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="debt-content">
                <div class="debt-content-item">
                    <div class="title">{{$t('debtManagement.manageCollateral')}}</div>

                    <div class="content-item">
                        <div class="label">{{$t('debtManagement.staked')}}: <a-statistic :value="formModel.stakeBalance | formerAccuracy" style="margin: 0 5px" /> {{formModel.currentCoinName}}</div>

                        <div class="inp-blocl">
                            <div class="inp-coin">
                                <a-input-number class="inp" v-model="formModel.stakeAmount" :min="0" :maxLength=5 :placeholder="$t('debtManagement.enterStakingAmount')" :precision=4 autoFocus />
                                <div class="coin-but">{{formModel.currentCoinName}}</div>
                            </div>
                            <a-button class="but" type="primary" :loading="formModel.stakeButtonLoading"  @click="showModalClick('Staked')">{{$t('debtManagement.staked')}}</a-button>
                        </div>
                    </div>

                    <div class="content-item">
                        <div class="label">{{$t('debtManagement.availableToUnstake')}}: <a-statistic :value="formModel.unStakeBalance | formerAccuracy" style="margin: 0 5px" /> {{formModel.currentCoinName}}</div>

                        <div class="inp-blocl">
                            <div class="inp-coin">
                                <a-input-number class="inp" v-model="formModel.unStakeAmount" :min="0" :placeholder="$t('debtManagement.enterUnstakeAmount')" :precision=4 autoFocus />
                                <div class="coin-but">{{formModel.currentCoinName}}</div>
                            </div>
                            <a-button class="but" type="primary" :loading="formModel.unStakeButtonLoading"  @click="showModalClick('Unstaked')">{{$t('debtManagement.unstake')}}</a-button>
                        </div>
                    </div>
                </div>

                <div class="debt-content-item">
                    <div class="title">{{$t('debtManagement.managePosition')}}</div>

                    <div class="content-item">
                        <div class="label">{{$t('debtManagement.outstanding')}} {{formModel.debtCoinName}} {{$t('debtManagement.debt')}}</div>

                        <div class="inp-blocl">
                            <div class="inp-coin">
                                <a-input-number class="inp" v-model="formModel.payBackAmount" :min="0" :maxLength=5 :placeholder="$t('debtManagement.enterPaybackAmount')" :precision=4 autoFocus />
                                <div class="coin-but">{{formModel.debtCoinName}}</div>
                            </div>
                            <a-button class="but" type="primary" :loading="formModel.stakeButtonLoading"  @click="showModalClick('payback')">{{$t('debtManagement.payback')}}</a-button>
                        </div>
                    </div>

                    <div class="content-item">
                        <div class="label">{{$t('debtManagement.availableToMint')}}</div>

                        <div class="inp-blocl">
                            <div class="inp-coin">
                                <a-input-number class="inp" v-model="formModel.mintAmount" :min="0" :placeholder="$t('debtManagement.enterMintAmount')" :precision=4 autoFocus />
                                <div class="coin-but">{{formModel.debtCoinName}}</div>
                            </div>
                            <a-button class="but" type="primary" :loading="formModel.unStakeButtonLoading"  @click="showModalClick('mint')">{{$t('debtManagement.short')}}</a-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<script>
export default {
    name: 'StakerNodal',

    data () {
        return {
            formModel: {
                liquidationPrice: '123456789',
                currentPrice: '46513211',
                collateralizationRatio: '23%',
                stakeBalance: '4464651',
                stakeAmount: '',
                unStakeBalance: '464646564',
                unStakeAmount: '',
                payBackAmount: '',
                mintAmount: '',
                debtCoinName: 'moTSLA',
                currentCoinName: 'ETH',
                stakeButtonLoading: false,
                unStakeButtonLoading: false,
                clickType: '',
                mobiusContract: null
            },

            config: {
               visible: false 
            }
        }
    },

    methods: {
        show () {
            this.config.visible = true
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-calendar-picker:focus .ant-calendar-picker-input:not(.ant-input-disabled) {
    border: none;
    box-shadow: none;
}

/deep/.ant-input-affix-wrapper .ant-input:focus {
    border: none;
    border-bottom: 1px solid white !important;
    box-shadow: none;
}

.components-plugins-stakerModal {
    /deep/ .ant-modal-content {
        border-radius: 20px;
        .ant-modal-header {
            border-bottom: none;
            border-radius: 20px 20px 0 0;
            .ant-modal-title {
                font-size: 22px;
            }
        }

        .ant-modal-close {
            .ant-modal-close-x {
                .anticon {
                    font-size: 22px;
                    font-weight: bold;
                    color: #000;
                }
            }
        }

        .ant-modal-body {
            .debt-content-top {
                background: #FFFFFF;
                box-shadow: 0px 4px 12px 0px rgba(0, 104, 255, 0.2);
                border-radius: 8px;
                border: 1px solid #F3F3F7;
                margin-bottom: 30px;
                padding: 20px 0;
                .content {
                    display: flex;
                    align-items: center;
                    .item {
                        flex: 1;
                        padding: 0 20px;
                        .line-item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            height: 40px;
                            line-height: 40px;
                            .label {
                                font-size: 16px;
                                font-family: DINPro-Medium, DINPro;
                                font-weight: bold;
                                color: #37373C;
                            }

                            .title {
                                font-size: 14px;
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
                                    font-size: 14px;
                                    font-family: DINPro-Medium, DINPro;
                                    font-weight: bold;
                                    color: #37373C;
                                    /deep/ .ant-statistic {
                                        line-height: inherit;
                                        font-size: 14px;
                                    }

                                    /deep/ .ant-statistic-content {
                                        font-size: 14px;
                                    }
                                }
                                .coin {
                                    display: flex;
                                    align-content: center;
                                    font-size: 14px;
                                    font-family: DINPro-Regular, DINPro;
                                    font-weight: 400;
                                    color: #37373C;
                                    margin-left: 5px;
                                    /deep/ .ant-statistic {
                                        line-height: inherit;
                                        font-size: 12px;
                                    }

                                    /deep/ .ant-statistic-content {
                                        font-size: 12px;
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
                    padding: 20px 20px 0 20px;
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
                        margin: 20px 0;
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
                            height: 36px;
                            .inp-coin {
                                position: relative;
                                height: 100%;
                                display: flex;
                                .inp {
                                    width: 300px;
                                    height: 100%;
                                    font-size: 16px;
                                    font-family: DINPro-Regular, DINPro;
                                    font-weight: 400;
                                }

                                .coin-but {
                                    height: 100%;
                                    text-align: center;
                                    padding: 6px 20px;
                                    background: rgba(125, 110, 244, 0.1);
                                    font-size: 16px;
                                    font-family: DINPro-Medium, DINPro;
                                    font-weight: bold;
                                    color: #37373C;
                                    border: 1px solid #D6D6D6;
                                }
                            }
                            
                            .but {
                                min-width: 90px;
                                text-align: center;
                                height: 100%;
                                background: #7D6EF4;
                                border: none;
                                border-radius: 2px;
                                margin-left: 20px;
                                opacity: .8;
                            }

                            .but:hover {
                                opacity: 1;
                            }
                        }
                    }
                }
                .debt-content-item:first-child {
                    margin-right: 15px;
                }
                .debt-content-item:last-child {
                    margin-left: 15px;
                }
            }
        }
    }
}
</style>