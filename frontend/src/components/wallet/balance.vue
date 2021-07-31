<template>
    <div class="list-content">
        <div class="list-assets">
            <div class="assets-item" v-for="(item, index) in dataList" :key="index">
                <div class="item-colium colium">
                    <img class="img" :src="require(`../../assets/img/logo_${item.asset}.png`)" />
                    <div class="">
                        <div class="name">{{item.asset}}</div>
                        <div class="short-name">{{item.shortName}}</div>
                    </div>
                </div>

                <div class="colium">
                    <a-statistic :value="item.balance | formerAccuracy" :precision="4" :suffix="item.asset" :value-style="{ color: '#4C63B8' }" style="margin-right: 5px" />
                    <div class="short-name">{{$t('wallet.assetsBalance')}}</div>
                </div>

                <div class="colium">
                    <a-statistic :value="item.price | formerAccuracy" :precision="4" suffix="USD" :value-style="{ color: '#4C63B8' }" style="margin-right: 5px" />
                    <div class="short-name">{{$t('wallet.assetsPrice')}}</div>
                </div>

                <div class="colium">
                    <a-button v-if="item.type === 'assets'" class="tableBut" @click="itemRowClick(item)">Go Stake</a-button>
                    <a-button v-if="item.type === 'moAssets'" class="tableBut" @click="itemRowTradClick(item)">Go Trade</a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getBalance, getPrice } from '@/config/ContractMethods'
import Assets from '@/config/Assets.js'

export default {
    name: 'Balaner',

    data () {
        return {
            loading: false,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0,
                showTotal: total => `${total} Information`
            },
            account: this.$store.state.account,
            dataList: []
        }
    },

    watch: {
        '$store.state.account': function (val) {
            this.account = val
            this.initData()
        }
    },

    created () {
        if (this.account) {
            this.initData()
        }
    },

    methods: {
        async initData () {
            this.dataList = []
            this.loading = true
            this.initDataList()
            this.getDataList()
        },

        initDataList () {
            Assets.forEach((item, index) => {
                this.dataList.push({
                    key: index,
                    asset: item.name,
                    type: item.type,
                    balance: 0,
                    price: 0,
                    proportion: 'low',
                    shortName: item.shortName
                })
            })
        },

        getDataList () {
            this.dataList.forEach((item) => {
                this.getData(item.asset).then(res => {
                    let { balance, price } = res
                    item.balance = balance
                    item.price = price
                })
                this.loading = false
            })
        },

        async getData (coinName) {
            try {
                let balancePromise = getBalance(coinName, this.account)
                let pricePromise = getPrice(coinName)

                let balance = await balancePromise
                let price = await pricePromise

                return { balance, price }
            } catch (error) {
                console.log('error===', error)
            }
        },

        tableChange (type) {
            this.tableType = type
        },

        itemRowClick (item) {
            this.$router.push(`/home/mint?baseCoinName=${item.asset}`)
        },

        itemRowTradClick (item) {
            if (item.asset === 'moUSD') {
                this.$router.push(`/home/trade`)
            } else {
                this.$router.push(`/home/trade?tokenName=${item.asset}`)
            }
        },
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-statistic-content {
    font-size: 20px;
    color: #6A6972;
}

/deep/ .ant-statistic-content-value-int {
    font-family: DINPro-Regular, DINPro;
}

/deep/ .ant-statistic-content-value-decimal {
    font-family: DINPro-Regular, DINPro;
    font-size: 20px;
}

/deep/ .ant-statistic-content-suffix {
    font-family: DINPro-Regular, DINPro;
    font-size: 20px;
}

/deep/ .ant-table {
    background: #fff;
}

/deep/ .ant-table-thead > tr > th {
    background: #fff;
    box-shadow: 0px -1px 0px 0px #D6D6D6;
    font-size: 20px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: #37373C;
}

/deep/ .ant-table-tbody > tr > td {
    background: #fff;
    font-size: 20px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: #6A6972;
}

/deep/ .ant-pagination-item-active {
    background: #7D6EF4;
    border: none;
}

/deep/ .ant-pagination-item-active a {
    color: #fff;
}

.list-content {
    margin-top: 20px;
    .list-assets {
        .assets-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 90px;
            background: #FFFFFF;
            border-radius: 16px;
            margin-bottom: 20px;
            .item-colium {
                display: flex;
                align-items: center;
                padding-left: 60px;
                .img {
                    width: 45px;
                    margin-right: 15px;
                }
            }
            .colium {
                flex: 1;
                .name {
                    font-size: 24px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #4C63B8;
                }
                .short-name {
                    font-size: 18px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;
                }
            }
        }
        .assets-item::before {
            content: '';
            width: 10px;
            height: 100%;
            display: inline-block;
            background: #B2B9DF;
            border-radius: 16px 0 0 16px;
        }
    }
}

@media screen and (max-width: 750px) {
    /deep/ .ant-table-thead > tr > th {
        background: #fff;
        box-shadow: 0px -1px 0px 0px #D6D6D6;
        font-size: 14px;
        font-family: DINPro-Medium, DINPro;
        font-weight: 500;
        color: #37373C;
        padding: 10px;
        text-align: center;
    }

    /deep/ .ant-table-tbody > tr > td {
        background: #fff;
        font-size: 14px;
        font-family: DINPro-Medium, DINPro;
        font-weight: 500;
        color: #6A6972;
        text-align: center;
    }

    /deep/ .ant-spin-container {
        width: 400px;
    }

    .list-content {
        margin-top: 20px;
        overflow: auto;
    }
}
</style>