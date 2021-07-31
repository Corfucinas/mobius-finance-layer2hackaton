<template>
    <a-modal :visible="config.visible" width="400px" class="plugins-CsConfirmModal" :title="$t('modal.closePosition')" footer='' @cancel="config.visible = false">
       <div class="modal-content">
            <div class="item-blok">
                <div class="blok-header">
                    <div class="blok-title">{{$t('modal.position')}}</div>
                </div>
                <div class="blok-content">
                    <div class="amount">{{formModel.topAmount | formerAccuracy}}</div>
                    <div class="coin-name">{{formModel.topCoinName}}</div>
                </div>
            </div>
        
            <div class="select-data">
                <div class="item" :class="{'active': index == currentIndex}" 
                    @click="itemClick(item, index)"  v-for="(item, index) in source.dataList" :key="index">{{item}}%
                </div>
            </div>

            <div class="item-blok">
                <div class="blok-header">
                    <div class="blok-title">{{$t('modal.payback')}}</div>
                </div>
                <div class="blok-content">
                    <div class="amount">{{formModel.bottomAmount | formerAccuracy}}</div>
                    <div class="coin-name">{{formModel.bottomCoinName}}</div>
                </div>
            </div>

            <div class="available-balance">
                <div class="label">{{$t('modal.available')}} {{formModel.bottomCoinName}}: </div>
                <a-statistic :value="balance | formerAccuracy" :precision="4" style="margin-left: 5px"/>
            </div>

            <a-button :class="formModel.bottomAmount && formModel.bottomAmount <= balance ? 'but' : 'disableBut'" 
                type="primary" @click="confirmClick" :disabled="!formModel.bottomAmount || formModel.bottomAmount > balance">
                {{$t('modal.close')}} {{formModel.topCoinName}}
            </a-button>
       </div>
    </a-modal>
</template>

<script>
import { getBalance } from '@/config/ContractMethods'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'CsClosePositionModal',

    data () {
        return {
            formModel: {
                topBalance: '',
                topAmount: '',
                topCoinName: '',
                bottomBalance: '',
                bottomAmount: '',
                bottomCoinName: '',
            },
            currentIndex: 3,
            source: {
                dataList: [25, 50, 75, 100]
            },
            config: { 
                visible: false
            },
            balance: ''
        }
    },

    methods: {
        async show (data) {
            this.currentIndex = 3
            this.config.visible = true
            this.formModel = data
            this.formModel.bottomAmount = data.topAmount
            this.balance = await getBalance(this.formModel.bottomCoinName, this.$store.state.account)
        },

        itemClick (item, index) {
            this.currentIndex = index
            this.formModel.bottomAmount = this.formModel.topAmount * item / 100
        },

        confirmClick () {
            if (this.formModel.bottomAmount && this.formModel.bottomAmount <= this.formModel.topAmount) {
                this.config.visible = false
                let isMax = false
                if (this.balance && this.balance > this.formModel.bottomAmount && this.currentIndex === 3) {
                    isMax = true
                }
                this.$emit('ConfirmCloseClick', { amount: this.formModel.bottomAmount,  topBalance: this.formModel.topAmount, isMax})
            }
        },
    },

    filters: {
        tiFixedBalance (value) {
            if (value) {
                return toFixedVal(value)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.plugins-CsConfirmModal {
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
            .modal-content {
                .item-blok {
                    border-radius: 20px;
                    background: #F6F7FB;
                    padding: 20px;
                    margin-bottom: 20px;
                    .blok-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        .blok-title {
                            font-size: 16px;
                            font-family: DINPro-Medium, DINPro;
                            font-weight: 500;
                            color: #6A6972;
                        }
                        .price {
                            color: #4E4A92;
                            font-size: 16px;
                            font-weight: bold;
                            font-family: DINPro-Regular, DINPro;
                        }
                    }

                    .blok-content {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 10px;
                        .coin-name {
                            font-size: 14px;
                            font-family: DINPro-Regular, DINPro;
                            font-weight: 400;
                            color: #37373C;
                        }
                        .amount {
                            font-size: 24px;
                            font-weight: bold;
                            font-family: DINPro-Medium, DINPro;
                            color: #37373C;
                            
                        }
                    }
                }

                .select-data {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    .item {
                        cursor: pointer;
                        width: 110px;
                        text-align: center;
                        height: 40px;
                        line-height: 40px;
                        background: #F5EFFD;
                        border-radius: 4px;
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                    }
                    .item:hover {
                        opacity: .7;
                    }

                    .active {
                        border: 1px solid #A564F1;
                        color: #A564F1;
                    }
                }

                .available-balance {
                    display: flex;
                    align-items: center;
                    font-family: DINPro-Regular, DINPro;
                    color: #6A6972;
                    font-weight: bold;
                    font-size: 18px;
                }
            }
        }
    }
}
</style>