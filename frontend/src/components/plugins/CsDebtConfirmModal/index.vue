<template>
    <a-modal :visible="config.visible" width="440px" class="plugins-CsDebtConfirmModal" :title="formModel.title" footer='' @cancel="config.visible = false">
       <div class="modal-content">
            <div class="item active">
                <div class="label label-active"><a-statistic :value="formModel.amount | formerAccuracy" :precision="4" /></div>
                <div class="count">{{formModel.coinName}}</div>
            </div>

            <div class="item">
                <div class="label">Your {{formModel.coinName}} {{$t('modal.balance')}}</div>
                <div class="cut-line"></div>
                <div class="count"><a-statistic :value="formModel.balance | formerAccuracy" style="margin: 0 5px" :precision="4" /> {{formModel.coinName}}</div>
            </div>

            <div v-if="['payback', 'mint'].includes(formModel.type)" class="item">
                <div class="label">{{formModel.coinName}} {{$t('modal.debt')}}</div>
                <div class="cut-line"></div>
                <div class="count">
                    <a-statistic :value="formModel.countBalance | formerAccuracy" style="margin: 0 5px" :precision="4" />
                    <img style="height: 15px;" src="../../../assets/img/right.png" />
                    <a-statistic :value="formModel.amountAndBalance | formerAccuracy" style="margin: 0 5px" :precision="4" /></div>
            </div>
            <div v-else class="item">
                <div class="label">{{formModel.type}} {{formModel.coinName}} {{$t('modal.amount')}}</div>
                <div class="cut-line"></div>
                <div class="count">
                    <a-statistic :value="formModel.countBalance | formerAccuracy" style="margin: 0 5px" :precision="4" />
                    <img style="height: 15px;" src="../../../assets/img/right.png" />
                    <a-statistic :value="formModel.amountAndBalance | formerAccuracy" style="margin: 0 5px" :precision="4" />
                </div>
            </div>

            <div class="item">
                <div class="label">{{$t('modal.newLiquidationPrice')}}</div>
                <div class="cut-line"></div>
                <div class="count"><a-statistic :value="formModel.liquidationPrice | formerAccuracy" style="margin: 0 5px" :precision="4" /> </div>
            </div>

            <div class="item">
                <div class="label">{{$t('modal.newCollateralizationRatio')}}</div>
                <div class="cut-line"></div>
                <div class="count"><a-statistic :value="formModel.collateralizationRatio * 100" style="margin: 0 5px" suffix="%" :precision="2" /></div>
            </div>

            <a-button class="but" type="primary" @click="confirmClick">{{$t('modal.confirm')}}</a-button>
       </div>
    </a-modal>
</template>

<script>
export default {
    name: 'CsDebtConfirmModal',

    data () {
        return {
            formModel: {
                title: ''
            },
            config: { 
                visible: false
            }
        }
    },

    methods: {
        show (data) {
            this.formModel = data
            this.config.visible = true
        },

        confirmClick () {
            this.config.visible = false
            this.$emit('confirmClick')
        }
    }
}
</script>

<style lang="less" scoped>
.plugins-CsDebtConfirmModal {
    .modal-content {
        .item {
            display: flex;
            justify-content: space-between;
            align-content: center;
            height: 50px;
            line-height: 50px;
            
            border-radius: 2px;
            margin-bottom: 20px;
            padding: 0 15px;
            align-items: center;
            .lable {
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
            .label-active {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: bold;
                color: #37373C;
            }
            .count {
                display: flex;
                align-items: center;
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #37373C;

                /deep/ .ant-statistic-content {
                    font-weight: 400;
                    font-family: DINPro-Regular, DINPro;
                }

                /deep/ .ant-statistic-content-value-int {
                    font-weight: 400;
                    font-family: DINPro-Regular, DINPro;
                }

                /deep/ .ant-statistic-content-value-decimal {
                    font-weight: 400;
                    font-family: DINPro-Regular, DINPro;
                }

                /deep/ .ant-statistic-content-suffix {
                    font-weight: 400;
                    font-family: DINPro-Regular, DINPro;
                }
            }

            .cut-line {
                flex: 1;
                height: 1px;
                border: 1px dashed #f3f3f7;
                margin: 0 10px;
            }
        }

        .active {
            background: #FBFBFF;
        }
    }
}
</style>