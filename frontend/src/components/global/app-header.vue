<template>
    <div class="app-header">
        <div class="title">
            {{$t(`menu.${titleName}`)}}
            <div class="debt-but" v-if="titleName === 'mintBurn'" @click="debtClick('/home/debt')">
                {{$t('menu.debtManagment')}}<a-icon class="arrow-right" type="arrow-right" />
            </div>
            <div class="debt-but" v-if="titleName === 'debtManagement'" @click="debtClick('/home/mint')">
                <a-icon class="arrow-left" type="arrow-left" />
                {{$t('menu.mintBurn')}}
            </div>
        </div>

        <div class="user-info">
            <div class="account" v-if="walletAccount">
                <div class="user-price"><a-statistic :value="balance | formerAccuracy" suffix="MOT" :precision="4" /></div>
                <div class="user-name">{{walletAccount}}</div>
            </div>

            <div class="account-connect" v-else>
                <div class="user-price" @click="connectMetaMaskClick">
                    <a-icon style="margin-right: 10px;" type="login" />CONNECT
                </div>
            </div>
            
            <!-- <div class="setting">
                <a-dropdown :trigger="['click']">
                    <img style="width: 32px;" src="../../assets/img/setting.png" />
                    <a-menu slot="overlay" @click="handleMenuClick">
                        <a-menu-item key="1">
                            <a-icon type="user" />
                            <span>EN</span>
                        </a-menu-item>
                        <a-menu-item key="2">
                            <a-icon type="user" />
                            <span>CH</span>
                        </a-menu-item>
                    </a-menu>
                </a-dropdown>
            </div> -->
        </div>
    </div>
</template>

<script>
import { getBalance } from '@/config/ContractMethods'

export default {
    name: 'appHeader',

    props: {
        titleName: {
            type: String,
            default () {
                return ''
            }
        }
    },

    data () {
        return {
            balance: '',
            walletAccount: '',
            account: this.$store.state.account
        }
    },

    watch: {
        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        },

        '$store.state.motBalance': function (val) {
            this.balance = val
        }
    },

    created () {
        if (this.account) {
            this.initData()
        }
    },

    methods: {
        async initData () {
            this.getData()
            this.walletAccount = this.account.substring(0, 6) + '....' + this.account.substring(this.account.length -4)
        },

        async getData () {
            this.balance = await getBalance('MOT', this.account)
        },

        handleMenuClick (e) {
            let key = e.key
            if (key === '1') {
                this.$i18n.locale = 'en-us'
            } else if (key === '2') {
                this.$i18n.locale = 'zh-cn'
            }
        },

        async connectMetaMaskClick () {
            this.$Provider.checkLocalMetaMask()
        },

        debtClick (key) {
            this.$emit('debtClick', { key })
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-modal-body {
    min-height: 200px;
    .wallet-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        line-height: 60px;
        border-radius: 8px;
        background: #F6F7FB;
        padding: 0 20px;
        font-size: 24px;
        color: #999;
        cursor: pointer;
    }
    .wallet-item:hover {
        opacity: .7;
     }
}

/deep/ .ant-modal-title {
    text-align: center;
    font-size: 32px;
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    .title {
        display: flex;
        align-items: center;
        font-size: 56px;
        font-family: DINPro-Bold, DINPro;
        font-weight: bold;
        color: #37373C;
        .debt-but {
            display: flex;
            align-items: center;
            height: 50px;
            padding: 0 20px;
            background: rgba(206, 118, 255, .16);
            border-radius: 8px;
            color: #5a208b;
            font-size: 20px;
            cursor: pointer;
            margin-left: 40px;
            font-family: DINPro-Bold, DINPro;
            font-weight: 500;
            .arrow-right {
                font-size: 20px;
                margin-left: 20px;
                font-family: DINPro-Bold, DINPro;
                font-weight: 500;
            }
            .arrow-left {
                font-size: 20px;
                margin-right: 20px;
                font-family: DINPro-Bold, DINPro;
                font-weight: 500;
            }
        }
        .debt-but:hover {
            opacity: .7;
            -webkit-transform: scale(1.1);
            -moz-transform: scale(1.1);
            -o-transform: scale(1.1);
            -webkit-transition-duration: 0.5s;
            -moz-transition-duration: 0.5s;
            -o-transition-duration: 0.5s;
        }
    }

    .user-info {
        display: flex;
        align-items: center;
        .account {
            display: flex;
            align-items: center;
            height: 38px;
            line-height: 38px;
            .user-price {
                border: 1px solid #37373C;
                border-right: none;
                background: #fff;
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #37373C;
                padding: 0 15px;
                border-radius: 4px 0 0 4px;
                /deep/ .ant-statistic-content {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                }

                /deep/ .ant-statistic-content-value-int {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                }

                /deep/ .ant-statistic-content-value-decimal {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                }

                /deep/ .ant-statistic-content-suffix {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                }
            }

            .user-name {
                border: 1px solid #37373C;
                background: #E7E6EE;
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #37373C;
                padding: 0 15px;
                border-radius: 0 4px 4px 0;
            }
        }

        .setting {
            margin-left: 15px;
            .en {
                width: 40px;
                padding: 5px;
                text-align: center;
                border: 1px solid #37373C;
                color: crimson;
            }

            .ch {
                padding: 5px;
                text-align: center;
                border: 1px solid #37373C;
            }
        }

        .account-connect {
            border: 1px solid #37373C;
            height: 40px;
            line-height: 40px;
            padding: 0 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }

        .account-connect:hover {
            opacity: .7;
        }
    }
}

@media screen and (max-width: 750px) {
    .app-header {
        display: none;
        justify-content: space-between;
        align-items: center;
        .title {
            font-size: 24px;
            font-family: DINPro-Bold, DINPro;
            font-weight: bold;
            color: #37373C;    
        }

        .user-info {
            display: none;
            align-items: center;
            .account {
                display: flex;
                align-items: center;
                height: 38px;
                line-height: 38px;
                .user-price {
                    border: 1px solid #37373C;
                    border-right: none;
                    background: #fff;
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;
                    padding: 0 15px;
                    border-radius: 4px 0 0 4px;
                }

                .user-name {
                    border: 1px solid #37373C;
                    background: #E7E6EE;
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;
                    padding: 0 15px;
                    border-radius: 0 4px 4px 0;
                }
            }

            .setting {
                margin-left: 15px;
                margin-top: 15px;
                .en {
                    width: 40px;
                    padding: 5px;
                    text-align: center;
                    border: 1px solid #37373C;
                    color: crimson;
                }

                .ch {
                    padding: 5px;
                    text-align: center;
                    border: 1px solid #37373C;
                }
            }

            .account-connect {
                border: 1px solid #37373C;
                height: 40px;
                line-height: 40px;
                padding: 0 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            }

            .account-connect:hover {
                opacity: .7;
            }
        }
    }
}
</style>
