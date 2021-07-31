<template>
    <a-modal :visible="config.visible" width="380px" class="plugins-CsSelectCoinModal" :title="$t('modal.selectToken')" footer='' @cancel="config.visible = false">
       <div class="modal-content">
            <a-input class="inp" :placeholder="$t('modal.searchNameOrPasteAddress')" v-model="formModel.keyword" />

            <div class="common-token">
                <div class="title">{{$t('modal.selectToken')}}</div>

                <div class="grid-content">
                    <div class="item" @click="itemClick(item)" :class="item.coinName === formModel.currentCoinName ? 'active' : ''" v-for="(item, index) in source.dataList" :key="index">
                        <div class="icon"><img class="img" :src="require(`../../../assets/img/logo_${item.coinName}.png`)" /></div>
                        <div class="coin-name">{{item.coinName}}</div>
                    </div>
                </div>
            </div>

            <div class="list">
                <div class="item" @click="itemClick(item)" :class="item.coinName === formModel.currentCoinName || !item.balance ? 'active' : ''" v-for="(item, index) in source.assetsList" :key="index">
                    <div class="left">
                        <div class="icon"><img class="img" :src="require(`../../../assets/img/logo_${item.coinName}.png`)" /></div>
                        <div class="">
                            <div class="name">{{item.coinName}}</div>
                            <div class="sort-name">{{item.shortName}}</div>
                        </div>
                    </div>
                    <div class="balance">
                        <a-spin v-if="item.loadding" :spinning="item.loadding"></a-spin>
                        <a-statistic v-else :value="item.balance | formerAccuracy" :precision="4" />
                    </div>
                </div>
            </div>
       </div>
    </a-modal>
</template>

<script>
import { getStaked } from '@/config/ContractMethods'
import { AssetsList, AssetsHotList } from '@/config/RewardCollateralDeal.js'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'CsSelectDebtTokenModal',

    data () {
        return {
            formModel: {
                currentCoinName: '',
                keyword: ''
            },
            source: {
                assetsList: [],
                dataList: AssetsHotList
            },
            config: { 
                visible: false
            },
            provider: this.$Provider.providerInstance,
            account: ''
        }
    },

    watch: {
        'formModel.keyword': {
            handler (newVal, oldVal) {
                console.log('oldVal==', oldVal)
                this.source.assetsList = AssetsList.filter((item) => {
                    if (item.coinName.indexOf(newVal.toUpperCase()) != -1) {
                        return item
                    }
                })
            }
        }
    },

    methods: {
        show ({ currentCoinName, moAssetsName }) {
            this.account = this.$store.state.account
            this.formModel.currentCoinName = currentCoinName
            this.initData(moAssetsName)
            this.config.visible = true
        },

        async initData (moAssetsName) {
            if (this.account) {
                this.source.assetsList = []
                AssetsList.forEach((item) => {
                    this.source.assetsList.push({
                        coinName: item.coinName,
                        shortName: item.shortName,
                        balance: 0,
                        loadding: true
                    })
                })
                this.getDataBalance(moAssetsName)
            }
        },

        getDataBalance (moAssetsName) {
            this.source.assetsList.forEach((item, index) => {
                this.getData(item.coinName, this.account, moAssetsName).then(res => {
                    let { balance } = res
                    AssetsList[index].balance = item.balance = balance
                    item.loadding = false
                })
            })
        },

        async getData (coinName, account, moAssetsName) {
            let balancePromise = getStaked(coinName, moAssetsName, account)
            let balanceRes = await balancePromise
            let balance = toFixedVal(balanceRes)
            return { balance }
        },

        toUpperCaseFilter (name) {
            if (name) {
                let str = name.substring(0, 1)
                return str.toUpperCase()
            }
        },

        itemClick (item) {
            if (item.coinName !== this.formModel.currentCoinName) {
                this.source.assetsList.forEach((assetItem) => {
                    if (assetItem.coinName === item.coinName && assetItem.balance) {
                        this.config.visible = false
                        this.$emit('selectCoinCallback', { coinName: item.coinName })
                    }
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>
.plugins-CsSelectCoinModal {
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
                    color: #999;
                }
            }
        }

        .ant-modal-body {
            padding-top: 0;
            .modal-content {
                .inp {
                    height: 48px;
                    background: #FBFBFF;
                    border-radius: 15px;
                    border: 1px solid #D6D6D6;
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #A6A6B3;
                }

                .common-token {
                    margin-top: 20px;
                    .title {
                        font-size: 18px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: bold;
                        color: #37373C;
                    }

                    .grid-content {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        grid-gap: 20px;
                        margin: 20px 0;
                        text-align: center;
                        .item {
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            padding: 0 10px;
                            height: 40px;
                            line-height: 40px;
                            background: #D9D8E7;
                            border-radius: 16px;
                            border: 1px solid #D6D6D6;
                            .icon {
                                .img {
                                    width: 32px;
                                }
                            }
                            .coin-name {
                                font-size: 18px;
                                font-family: DINPro-Medium, DINPro;
                                font-weight: bold;
                                color: #37373C;
                                margin-left: 10px;
                            }
                        }
                        .item:hover {
                            opacity: .5;
                        }

                        .active {
                            opacity: .5;
                            cursor:not-allowed;
                        }
                    }
                }

                .list {
                    margin-top: 20px;
                    border-top: 1px solid #D6D6D6;
                    max-height: 300px;
                    min-height: 300px;
                    overflow: auto;
                    .item {
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 20px;
                        padding-right: 5px;
                        .left {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .icon {
                                .img {
                                    width: 32px;
                                    margin-right: 10px;
                                }
                            }

                            .name {
                                font-size: 18px;
                                font-family: DINPro-Medium, DINPro;
                                font-weight: bold;
                                color: #37373C;
                            }
                            .sort-name {
                                font-size: 14px;
                                font-family: DINPro-Regular, DINPro;
                                font-weight: 400;
                                color: #6A6972;
                            }
                        }

                        .balance {
                            font-size: 16px;
                            font-family: DINPro-Medium, DINPro;
                            font-weight: 500;
                            color: #37373C;
                        }
                    }
                    .active {
                        opacity: .7;
                        cursor:not-allowed;
                    }
                    .nodata {
                        font-size: 18px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #37373C;
                        text-align: center;
                        margin-top: 90px;
                    }

                    .item:hover {
                        opacity: .7;
                        background: #f8f8f8;
                    }
                }
            }
        }
    }
}
</style>