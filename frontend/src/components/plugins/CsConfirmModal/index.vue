<template>
    <a-modal :visible="config.visible" width="500px" class="plugins-CsConfirmModal" :title="formModel.title" footer='' @cancel="config.visible = false">
       <div class="modal-content">
            <div class="item-blok">
                <div class="blok-header">
                    <div class="blok-title">{{formModel.topName}}</div>
                    <div class="price">{{$t('modal.balance')}}: 
                        <a-statistic :value="formModel.topBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                    </div>
                </div>
                <div class="blok-content">
                    <div class="amount">{{formModel.topAmount}}</div>
                    <div class="coin-name">{{formModel.topCoinName}}</div>
                </div>
            </div>
            
            <div style="margin: auto; text-align: center; z-index: 9;">
                <img style="width: 26px; margin-top: -15px;" src="../../../assets/img/swap.png" />
            </div>

            <div class="item-blok" style=" margin-top: -15px; margin-bottom: 15px;">
                <div class="blok-header">
                    <div class="blok-title">{{formModel.bottomName}}</div>
                    <div class="price">{{formModel.title === 'Burn' ? 'Debt': 'Balance'}}: 
                        <a-statistic :value="formModel.bottomBalance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                    </div>
                </div>
                <div class="blok-content">
                    <div class="amount">{{formModel.bottomAmount | toFixedVal}}</div>
                    <div class="coin-name">{{formModel.bottomCoinName}}</div>
                </div>
            </div>

            <div class="tx-free" v-if="formModel.lin">
                <div class="lable">
                    {{$t('modal.liqRatio')}}
                    <a-tooltip placement="topLeft" :getPopupContainer="triggerNode => {return triggerNode.parentNode}">
                        <template slot="title">
                            <span>{{$t('mintAndBurn.liqRatioTip')}}</span>
                        </template>
                        <a-icon class="icon" type="question-circle" />
                    </a-tooltip>
                </div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.lin * 100" :precision="2" suffix="%" :value-style="{ 'font-weight': 500, 'font-family': 'DINPro-Regular, DINPro' }" />
            </div>

             <div class="tx-free" v-if="formModel.safe">
                <div class="lable">{{$t('modal.recommended')}}</div>
                <div class="cut-line"></div>
                <a-statistic :value="formModel.safe * 100" :precision="2" suffix="%" :value-style="{ 'font-weight': 500, 'font-family': 'DINPro-Regular, DINPro' }" />
            </div>

             <div class="tx-free">
                <div class="lable">{{$t('modal.price')}}</div>
                <div class="cut-line"></div>
                <div class="ust">{{formModel.price}}</div>
            </div>

             <div class="tx-free" v-if="formModel.txFree">
                <div class="lable">{{$t('modal.txFee')}}</div>
                <div class="cut-line"></div>
                <div class="ust">{{formModel.txFree}} moUSD</div>
            </div>

            <a-button class="but" type="primary" @click="ConfirmMintClick">{{$t('modal.confirm')}}</a-button>
       </div>
    </a-modal>
</template>

<script>
export default {
    name: 'CsConfirmModal',

    data () {
        return {
            formModel: {
                topName: 'Collateral',
                topBalance: '',
                topAmount: '',
                topCoinName: '',
                bottomName: '',
                bottomBalance: '',
                bottomAmount: '',
                bottomCoinName: '',
                lin: '',
                safe: '',
                price: '',
                txFree: '',
                title: '',
            },
            config: { 
                visible: false
            }  
        }
    },

    methods: {
        show (data) {
            this.config.visible = true
            this.formModel = data
        },

        ConfirmMintClick () {
            this.config.visible = false
            this.$emit('ConfirmMintClick')
        },
    },

    filters: {
        toFixedVal(value) {
            if (!value) return ''
            let val = parseFloat(value)
            let data = Math.floor(val * 1000000) / 1000000
            if (data < 0.000001) {
                data = 0
            }
            return parseFloat(data)
        }
    }
}
</script>

<style lang="less" scoped>
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
                color: #6A6972;
            }
        }
    }
}
.plugins-CsConfirmModal {
    .item-blok {
        border-radius: 20px;
        background: #F6F7FB;
        padding: 20px;
        .blok-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .blok-title {
                font-size: 14px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #6A6972;
            }
            .price {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #6A6972;
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
                font-family: DINPro-Medium, DINPro;
                font-weight: bold;
                color: #37373C;
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
        }

        /deep/ .ant-statistic-content-value-int {
            font-family: DINPro-Regular, DINPro;
        }

        /deep/ .ant-statistic-content-value-decimal {
            font-family: DINPro-Regular, DINPro;
        }
        
    }
}
</style>