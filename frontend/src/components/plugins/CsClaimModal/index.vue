<template>
    <a-modal :visible="config.visible" width="360px" class="plugins-CsClaimModal" :title="formModel.title" footer='' @cancel="config.visible = false">
        <div class="modal-content">
            <div class="logo-area">
                <div class="logo"><img v-if="formModel.coinName" class="img" :src="require(`../../../assets/img/logo_${formModel.coinName}.png`)"/></div>
                <div class="coin-name">{{formModel.coinName}} - {{this.formModel.type}}</div>
            </div>

            <div class="inp-area">
                <div class="top-area">
                    <span class="balance">receive reward</span>
                </div>
                    <div class="inp-coin">
                        <a-input-number class="inp" disabled v-model="formModel.balance" :min="0" placeholder="0.0" :precision=4 autoFocus />
                        <div class="coin-but">MOT</div>
                    </div>
                </div>

            <a-button :class="Number(formModel.balance) ? 'but' : 'disableBut'" type="primary" 
            @click="claimClick" :disabled="!formModel.balance">{{$t('stake.claim')}}</a-button>
        </div>

        <CsWatingModal ref='CsWatingModalRef' />
    </a-modal>
</template>

<script>
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import { pendingMOT, withdraw, getUserReward, tradingWithdraw } from '@/config/ContractMethods'

export default {
    components: {
        CsWatingModal
    },

    data () {
        return {
            formModel: {
                title: '',
                coinName: '',
                balance: '',
                amount: '',
                type: ''
            },
            config: {
                visible: false
            },
            provider: this.$Provider.providerInstance
        }
    },

    methods: {
        async show ({ coinName, type, pid }) {
            this.config.visible = true
            this.formModel.balance = ''
            this.formModel.coinName = coinName
            this.formModel.type = type
            this.formModel.pid = pid
            if (type === 'Trading') {
                this.formModel.balance = await getUserReward(pid)
            } else {
                this.formModel.balance = await pendingMOT(coinName, this.$store.state.account)
            }
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('withdraw success: ===', transaction);
                this.config.visible = false
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
            })
        },

        async claimClick () {
            this.showWatingModal()
            try {
                let transactionHash = ''
                if (this.formModel.type === 'Trading') {
                    transactionHash = await tradingWithdraw(this.formModel.pid)
                } else {
                    transactionHash = await withdraw(this.formModel.coinName)
                }
                if (transactionHash) {
                    this.listenerAccountbalance(transactionHash)
                }
            } catch (error) {
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal () {
            this.$refs.CsWatingModalRef.show({
                topAmount: this.formModel.balance,
                topCoinName: 'MOT',
                bottomAmount: '',
                bottomCoinName: '',
                name: 'Claiming',
                status: 'wating'
            })
        },
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-input-number-input {
    font-size: 20px;
    border-radius: 0;
    border-right: none;
    height: 100%;
}

.plugins-CsClaimModal {
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
            padding-top: 20px;
            .modal-content {
                margin-top:20px;
                .logo-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    .logo {
                        border-radius: 50%;
                        width: 56px;
                        height: 56px;
                        text-align: center;
                        line-height: 56px;
                        background: #F3F3F7;
                        border: 1px solid #D6D6D6;
                        .img {
                            width: 38px;
                        }
                    }

                    .coin-name {
                        font-size: 24px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #37373C;
                        margin-top: 20px;
                    }
                }

                .inp-area {
                    margin-top: 40px;
                    .top-area {
                        display: flex;
                        align-items: baseline;
                        .label {
                            display: flex;
                            align-items: center;
                            color: #D6D6D6;
                        }
                    }

                    .inp-coin {
                        display: flex;
                        position: relative;
                        height: 45px;
                        line-height: 45px;
                        display: flex;
                        margin-top: 5px;
                        .inp {
                            flex: 1;
                            height: 100%;
                            font-size: 16px;
                            font-family: DINPro-Regular, DINPro;
                            font-weight: 400;
                        }

                        .coin-but {
                            height: 100%;
                            text-align: center;
                            padding: 0 20px;
                            background: rgba(125, 110, 244, 0.1);
                            font-size: 16px;
                            font-family: DINPro-Medium, DINPro;
                            font-weight: bold;
                            color: #5A208B;
                        }
                    }
                }
            }
        }
    }
}
</style>