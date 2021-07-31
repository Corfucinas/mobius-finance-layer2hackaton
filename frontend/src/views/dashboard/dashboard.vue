<template>
    <div class="dashboard-content">
        <div class="chart-table">
            <div class="left-chart">
                <LineChart />
            </div>

            <div class="right-chart">
                <Histogram />
            </div>
        </div>

        <div class="list-table">
            <div class="list-search-header">
                <div class="title">{{$t('dashboard.moASSET')}}</div>
                <!-- <a-input-search :placeholder="$t('dashboard.searchAsset')" style="width: 200px" v-model="keyword" @search="onSearch" /> -->
            </div>

            <div class="list-content">
                <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="tableChange" :loading="loading" rowKey="key">
                    <span slot="name" slot-scope="row, record">
                        <img class="img" :src="require(`../../assets/img/logo_${row}.png`)" />
                        <span>{{row}}</span>
                        <a-tooltip placement="topLeft">
                            <template slot="title">
                                <span>{{record.tip}}</span>
                            </template>
                            <a-icon style="margin-left:5px;" type="question-circle" />
                        </a-tooltip>
                    </span>

                    <span slot="oraclePrice" slot-scope="row"> 
                        <a-statistic :value="row | formerAccuracy" :precision="4" style="margin-right: 5px" />
                    </span>

                    <span slot="volume" slot-scope="row"> 
                        <a-statistic :value="row | formerAccuracy" :precision="4" style="margin-right: 5px" />
                    </span>

                    <span slot="totalValue" slot-scope="row"> 
                        <a-statistic :value="row | formerAccuracy" :precision="4" style="margin-right: 5px" />
                    </span>

                    <span slot="txFee" slot-scope="row"> 
                        <a-statistic :value="row | formerAccuracy" :precision="4" style="margin-right: 5px" />
                    </span>
                </a-table>
            </div>
        </div>

        <div class="phone-content">
            <PhoneHomePage />
        </div>
    </div>
</template>

<script>
import LineChart from '@/components/dashboard/LineChart.vue'
import Histogram from '@/components/dashboard/Histogram.vue'
import PhoneHomePage from '@/components/global/phoneHomePage.vue'
import { moAssets } from '@/config/RewardCollateralDeal'
import { getPrice, totalSupply } from '@/config/ContractMethods'
import { getVolumeData } from '@/service'

export default {
    name: 'dashboard',

    components: {
        LineChart,
        Histogram,
        PhoneHomePage
    },

    data () {
        return {
            keyword: '',
            dataList: [],
            columns: [
                {
                    title: this.$i18n.tc('dashboard.assetRank'),
                    customRender: (text, record, index) => {
                        if (index === 0 && this.pagination.current === 1) {
                            return <span style="color: #FF8004; font-size: 20px;">1</span>
                        } else if (index === 1 && this.pagination.current === 1) {
                            return <span style="color: #7D6EF4; font-size: 20px;">2</span>
                        } else if (index === 2 && this.pagination.current === 1) {
                            return <span style="color: #00A9B6; font-size: 20px;">3</span>
                        } else {
                            return <span style="color: #6A6972; font-size: 20px;">{(this.pagination.current - 1) * this.pagination.pageSize + index + 1}</span>
                        }
                    }
                },
                {
                    title: this.$i18n.tc('dashboard.assetSymbol'),
                    dataIndex: 'name',
                    key: 'name',
                    scopedSlots: { customRender: 'name' },
                },
                {
                    title: this.$i18n.tc('dashboard.assetOraclePrice'),
                    dataIndex: 'oraclePrice',
                    key: 'oraclePrice',
                    scopedSlots: { customRender: 'oraclePrice' },
                },
                {
                    title: this.$i18n.tc('dashboard.assetVolume'),
                    dataIndex: 'volume',
                    key: 'volume',
                    scopedSlots: { customRender: 'volume' },
                },
                {
                    title: this.$i18n.tc('dashboard.assetMarketCap'),
                    dataIndex: 'totalValue',
                    key: 'totalValue',
                    scopedSlots: { customRender: 'totalValue' },
                },
                {
                    title: this.$i18n.tc('dashboard.assetFees'),
                    dataIndex: 'txFee',
                    key: 'txFee',
                    scopedSlots: { customRender: 'txFee' },
                },
                {
                    title: this.$i18n.tc('dashboard.assetCreator'),
                    dataIndex: 'creator',
                    key: 'creator'
                }
            ],
            loading: false,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0,
                showTotal: total => `${total} Information`
            },
            leftChart: null,
            rightChart: null,
            account: this.$store.state.account
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
            this.loading = true
            this.initMoAssetsSort()
            this.getTableList()
        },

        onSearch () {},

        tableChange (pagination) {
            this.pagination.current = pagination.current;
            this.pagination.pageSize = pagination.pageSize;
            this.getTableList();
        },

        initMoAssetsSort () {
            moAssets.forEach((item, index) => {
                this.dataList.push({
                    key: index,
                    name: item.coinName,
                    oraclePrice: 0,
                    volume: 0,
                    totalValue: 0,
                    txFee: 0,
                    creator: 'Mobius Foundation',
                    tip: item.tip
                })
            })
        },

        getTableList () {
            this.dataList.forEach((item) => {
                this.getData(item.name).then(res => {
                    let { price, fee, totalSupplyAmount, volume } = res
                    item.oraclePrice = price
                    item.volume = volume
                    item.totalValue = price * totalSupplyAmount
                    item.txFee = fee
                })
            })
            this.loading = false
        },

        async getData (coinName) {
            let pricePromise = getPrice(coinName)
            let totalSupplyPromise = totalSupply(coinName)
            let volumePromise = this.getVolumeOfSynthEntities(coinName)
            let feePromise = this.getFee(coinName)

            let price = await pricePromise
            let totalSupplyAmount = await totalSupplyPromise
            let volume = await volumePromise
            let fee = await feePromise

            return { price, fee, totalSupplyAmount, volume }
        },

        async getVolumeOfSynthEntities (coinName) {
            let currentTimestamp = Date.parse(new Date()) / 1000
            let dayTimestamp = 24 * 3600
            let timestamp = currentTimestamp - dayTimestamp
            let params = {
                "query": `{volumeOfSynthEntities(where:{synth:"${coinName}",time_gt:${timestamp}}) {id,synth,time,amount}}`
            }
            let result = await getVolumeData(params)
            let volume = 0
            result.data.volumeOfSynthEntities.forEach((item) => {
                volume += parseFloat(this.$ethers.utils.formatEther(item.amount))
            })
            return volume
        },

        async getFee (coinName) {
            let params = {
                "query": `{feeEntities(where:{id: "${coinName}"}) {tradeFee}}`
            }
            let result = await getVolumeData(params)
            let fee = 0
            if (result && result.data && result.data.feeEntities ) {
                result.data.feeEntities.forEach((item) => {
                    fee += parseFloat(this.$ethers.utils.formatEther(item.tradeFee))
                })
            }
            return fee
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-statistic-content {
    font-size: 20px;
    color: #6A6972;
    font-family: DINPro-Regular, DINPro;
}

/deep/ .ant-statistic-content-value-int {
    font-family: DINPro-Regular, DINPro;
}

/deep/ .ant-statistic-content-suffix {
    font-family: DINPro-Regular, DINPro;
    font-size: 20px;
}

/deep/ .ant-statistic-content-value-decimal {
    font-family: DINPro-Regular, DINPro;
    font-size: 20px;
}

/deep/ .ant-table-thead > tr > th {
    background: #fff;
    font-size: 20px;
    font-family: DINPro-Regular, DINPro;
    font-weight: bold;
    color: #37373C;
}

/deep/ .ant-table-tbody > tr > td {
    background: #fff;
    font-size: 20px;
    font-family: DINPro-Regular, DINPro;
    font-weight: bold;
    color: #6A6972;
}

/deep/ .ant-pagination-item-active {
    background: #7D6EF4;
    border: none;
}

/deep/ .ant-pagination-item-active a {
    color: #fff;
}

.dashboard-content {
    .chart-table {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;;
        .left-chart {
            width: 49%;
            border-radius: 8px;
            border: 1px solid #D6D6D6;
            padding: 20px;
        }

        .right-chart {
            width: 49%;
            border-radius: 8px;
            border: 1px solid #D6D6D6;
            padding: 20px;
        }
    }

    .list-table {
        background: #F6F7FB;
        border-radius: 16px;
        padding: 20px;
        .list-search-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title {
                font-size: 24px;
                font-family: DINPro-Bold, DINPro;
                font-weight: bold;
                color: #37373C;
            }
        }

        .list-content {
            margin-top: 20px;
            .img {
                width: 36px;
                margin-right: 10px;
            }
        }
    }

    .phone-content {
        display: none;
    }
}

@media screen and (max-width: 750px) {
    /deep/ .ant-table-thead > tr > th {
        background: #fff;
        box-shadow: 0px -1px 0px 0px #D6D6D6;
        font-size: 14px;
        font-family: DINPro-Medium, DINPro;
        font-weight: bold;
        color: #37373C;
        padding: 10px;
        text-align: center;
    }

    /deep/ .ant-table-tbody > tr > td {
        background: #fff;
        font-size: 14px;
        font-family: DINPro-Medium, DINPro;
        font-weight: bold;
        color: #6A6972;
        text-align: center;
    }

    /deep/ .ant-spin-container {
        width: 800px;
    }

    .dashboard-content {
        height: 100%;
        .chart-table {
             display: none;
             flex-direction: column;
            .left-chart {
                flex: 1;
                border-radius: 8px;
                border: 1px solid #D6D6D6;
                padding: 20px;
                width: 100%;
                .chart-header {
                    height: 40px;
                    line-height: 40px;
                    display: flex;
                    justify-content: space-between;
                    .title {
                        font-size: 14px;
                        font-family: DINPro-Bold, DINPro;
                        font-weight: bold;
                        color: #37373C;
                    }
                    .usd-count {
                        font-size: 14px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: bold;
                        color: #37373C;
                    }
                    .arrow {
                        font-size: 14px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #FF8004;

                        /deep/ .ant-statistic-content {
                            font-size: 14px;
                        }
                    }
                }

                .chart-content {
                    height: 300px;
                    position: relative;
                }
            }

            .right-chart {
                flex: 1;
                height: 340px;
                border-radius: 8px;
                border: 1px solid #D6D6D6;
                padding: 20px;
                margin-left: 0;
                margin-top: 20px;
                width: 100%;
            }
        }

        .list-table {
            display: none;
            background: #F6F7FB;
            border-radius: 8px;
            padding: 10px;
            .list-search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                .title {
                    font-size: 16px;
                    font-family: DINPro-Bold, DINPro;
                    font-weight: bold;
                    color: #37373C;
                }
            }

            .list-content {
                width: 100%;
                margin-top: 20px;
                overflow: auto;
            }
        }

        .phone-content {
            display: block;
            text-align: center;
        }
    }
}
</style>