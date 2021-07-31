<template>
    <a-modal :visible="config.visible" class="plugins-CsClaimModal" :title="formModel.title" footer='' @cancel="config.visible = false">
        <div class="modal-content">
            <div class="inp-item">
                <div class="title-area">
                    <div class="collateral">{{formModel.coinName}} - USD LP</div>
                    <div class="balance">
                        {{$t('menu.stake')}}: 
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="formModel.balance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                    </div>
                </div>

                <div class="form-wrapper">
                    <a-input-number class="inp" :disabled="loadding" v-model="formModel.coinCount" :min="0" placeholder="0.0" :precision=4 autoFocus />
                    <div class="right-max">
                        <span>LP</span>
                        <div class="max-but"  @click="maxCoinClick()">MAX</div>
                    </div>
                </div>
            </div>

            <a-button class="but" style="margin: 15px 0 30px 0" type="primary" @click="claimClick">{{$t('mintAndBurn.approve')}} {{formModel.coinName}} - USD LP</a-button>
            
            <div class="label">Claim $MOT Rewards</div>
            <div class="inp-item">
                <div class="title-area">
                    <div class="collateral">$MOT Rewards</div>
                    <div class="balance">
                        Available Rewards:  
                        <a-spin v-if="loadding" :spinning="loadding"/>
                        <a-statistic v-else :value="formModel.balance | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" />
                    </div>
                </div>

                <div class="form-wrapper">
                    <a-input-number class="inp" disabled v-model="formModel.coinCount" :min="0" placeholder="0.0" :precision=4 />
                    <div class="right-max">
                        <span>MOT</span>
                    </div>
                </div>
            </div>

            <a-button class="but" style="margin-top: 10px;" type="primary" @click="claimClick">{{$t('stake.claim')}}</a-button>
        </div>

        <CsWatingModal ref='CsWatingModalRef' />
    </a-modal>
</template>

<script>
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import { withdraw } from '@/config/ContractMethods'

export default {
    components: {
        CsWatingModal
    },

    data () {
        return {
            formModel: {
                title: '',
                coinName: '',
                balance: '234235235.234',
                amount: '',
                coinCount: '',
                bonusBalance: '',

            },
            loadding: false,
            config: {
                visible: false
            }
        }
    },

    methods: {
        show ({ coinName }) {
            this.config.visible = true
            this.formModel.coinName = coinName
            this.formModel.title = `Stake ${this.formModel.coinName} - USD LP`
        },

        extractClick () {},

        
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
                let transactionHash = await withdraw(this.formModel.coinName)
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
    .inp-item {
        background: #F6F7FB;
        border-radius: 6px;
        padding: 20px;
        margin: 10px 0 20px 0;
        .title-area {
            display: flex;
            width: 100%;
            justify-content: space-between;
            padding: 10px 0;
            .collateral {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #6A6972;
            }
            .balance {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #6A6972;
            }
        }

        .form-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .inp {
                flex: 1;
            }
            .right-max {
                display: flex;
                align-items: center;
                .max-but {
                    cursor: pointer;
                    margin-left: 15px;
                    font-size: 14px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #5A208B;
                    width: 56px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    background: rgba(90, 32, 139, 0.1);
                    border-radius: 12px;
                }
                .max-but:hover {
                    opacity: .7;
                }
                .dal {
                    font-size: 14px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;
                    margin-right: 5px;
                }

                .select {
                    cursor: pointer;
                }
            }
        }
    }

    .label {
        font-size: 24px;
        font-family: DINPro-Bold, DINPro;
        color: #37373C;
    }
}
</style>