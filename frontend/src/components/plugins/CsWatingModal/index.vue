<template>
    <a-modal :visible="config.visible" width="360px" class="plugins-CsWatingModal" title="" footer='' @cancel="cancelClick">
       <div class="modal-content">
            <div class="loading">
                <a-spin :spinning="formModel.status === 'wating'" size="large"></a-spin>
                <img v-if="formModel.status === 'success'" style="width: 50px;" src="../../../assets/img/sucessful.png" />
                <img v-if="formModel.status === 'error'" style="width: 50px;" src="../../../assets/img/error.png" />
            </div>

            <div class="title" v-if="formModel.status === 'success'">{{$t('modal.successful')}}</div>
            <div class="title" v-if="formModel.status === 'wating'">{{$t('modal.wating')}}</div>
            <div class="title" v-if="formModel.status === 'error'">{{$t('modal.failure')}}</div>

            <div class="info" v-if="formModel.status === 'wating' && formModel.topAmount">{{`${tiFixedBalance(formModel.topAmount)} ${formModel.topCoinName} ${formModel.name} ${tiFixedBalance(formModel.bottomAmount)} ${formModel.bottomCoinName}`}} </div>
            <div class="tip" v-if="formModel.status === 'wating'">Confirm this transaction in your wallet</div>

            <div class="info"  v-if="['success', 'error'].includes(formModel.status)" ><a target="_blank" style="text-decoration:underline;" :href='linkHref'> {{$t('modal.viewOnEtherscan')}}</a></div>
            <a-button class="but" v-if="['success', 'error'].includes(formModel.status)" type="primary" @click="config.visible = false">{{$t('modal.close')}}</a-button>
       </div>
    </a-modal>
</template>

<script>
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'CsWatingModal',

    data () {
        return {
            formModel: {
                topAmount: '',
                topCoinName: '',
                bottomAmount: '',
                bottomCoinName: '',
                name: '',
                status: '',
            },
            config: {
                visible: false
            },
            linkHref: ''
        }
    },

    methods: {
        show (data) {
            this.config.visible = true
            this.formModel = data
            
        },

        updateStatus ({ status, txHash }) {
            if (status === 'cancel') {
                this.config.visible = false
            }
            let prefixes = 'https://mumbai.polygonscan.com/'
            this.linkHref = `${prefixes}/tx/${txHash}`
            this.formModel.status = status
        },

        tiFixedBalance (value) {
            if (value) {
                return toFixedVal(value)
            } {
                return ''
            }
        },

        cancelClick () {
            this.config.visible = false
            this.$emit('cancelClick')
        },
    }
}
</script>

<style lang="less" scoped>
.plugins-CsWatingModal {
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
                padding-top: 50px;
                text-align: center;
                .loading {
                    padding: 20px 0 50px 0;
                }

                .title {
                    font-size: 24px;
                        font-family: DINPro-Bold, DINPro;
                        font-weight: bold;
                        color: #37373C;
                        line-height: 40px;
                }

                .info {
                        font-size: 20px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #5A208B;
                        line-height: 60px;
                }

                .tip {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                }
            }
        }
    }
}
</style>