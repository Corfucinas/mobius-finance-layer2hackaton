<template>
    <div class="histogram-content">
        <div class="chart-header">
            <div class="title">{{$t('dashboard.transactions')}}</div>
            <div class="">
                <span class="usd-count"><a-statistic :value="totalAmount" style="margin-right: 5px" /></span>
                <!-- <span class="arrow">
                    <a-statistic title="" :value="11.28" suffix="%" :value-style="{ color: '#00C487', 'font-size': '16px' }" style="margin-left: 20px">
                        <template #prefix>
                            <a-icon type="arrow-up" />
                        </template>
                    </a-statistic>
                </span> -->
            </div>
        </div>

        <div class="chart-content" id="histogram">
            <a-spin class="loadding-spin" v-if="loadding" :spinning="loadding"/>
        </div>
    </div>
</template>

<script>
import { getTransactionsData } from '@/service'

export default {
    data () {
        return {
            histogram: null,
            loadding: false,
            totalAmount: 0,
            source: {
                dataList: []
            }
        }
    },

    mounted () {
        this.getData()
    },

    methods: {
        async getData () {
            this.loadding = true
            let currentTimestamp = Date.parse(new Date()) / 1000
            let dayTimestamp = 24 * 3600
            let timestamp = currentTimestamp - dayTimestamp
            let params = {
                "query": `{transactionCountsEntities(where:{id_gt: ${timestamp}}){id,count}}`
            }
            let res = await getTransactionsData(params)
            this.loadding = false
            if (res && res.data && res.data.transactionCountsEntities) {
                this.source.dataList = res.data.transactionCountsEntities
            }
            this.initCharts()
        },

        initCharts () {
            this.$nextTick(() => {
                let histogram = document.getElementById('histogram');
                this.histogram = this.$echarts.init(histogram);
                this.initChartsOptions()
            })
        },

        initChartsOptions () {
            let data = {
                categoryData: [],
                valueData: []
            }
            this.source.dataList.forEach((item) => {
                let dayTimer = new Date(item.id * 1000)
                let hh = dayTimer.getHours()
                let mf = dayTimer.getMinutes() < 10 ? '0' + dayTimer.getMinutes() : dayTimer.getMinutes()
                let ss = dayTimer.getSeconds() < 10 ? '0' + dayTimer.getSeconds() : dayTimer.getSeconds()
                let timer = `${hh}:${mf}:${ss}`
                data.categoryData.push(timer)
                data.valueData.push(item.count)
                this.totalAmount += parseFloat(item.count)
            })

            this.histogram.setOption({
                title: {
                    left: 'left',
                    text: this.$t('dashboard.transactions'),
                    show: false
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    top:"50px",
                    left:"50px",
                    right:"30px",
                    bottom:"20px",
                    backgroundColor: '#fff',
                    width:"100%",
                    height:"auto",
                },
                xAxis: {
                    data: data.categoryData,
                    silent: false,
                    splitLine: {
                        show: false
                    },
                    splitArea: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    show: true,
                    scale: true,
                    boundaryGap: [0, '100%'],
                    axisTick: {
                        show: true
                    },
                    axisLine: {
                        show: true
                    },
                    splitLine: {
                        show: false
                    }
                },
                series: [{
                    type: 'bar',
                    data: data.valueData,
                    large: true
                }]
            })
        }
    }
}
</script>

<style lang="less" scoped>
.histogram-content {
    .chart-header {
        height: 40px;
        line-height: 40px;
        display: flex;
        justify-content: space-between;
        .title {
            font-size: 24px;
            font-family: DINPro-Bold, DINPro;
            font-weight: bold;
            color: #37373C;
        }
        .usd-count {
            font-size: 24px;
            font-family: DINPro-Medium, DINPro;
            font-weight: bold;
            color: #37373C;
            /deep/ .ant-statistic-content {
                font-size: 24px;
                color: #37373C;
            }

            /deep/ .ant-statistic-content-value-decimal {
                font-size: 24px;
            }

            /deep/ .ant-statistic-content-suffix {
                font-size: 24px;
            }

            /deep/ .ant-statistic-content-value-decimal {
                font-size: 24px;
            }
        }
        .arrow {
            font-family: DINPro-Regular, DINPro;
            font-weight: 400;

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

    .chart-content {
        height: 300px;;
        position: relative;
    }

    .loadding-spin {
        position: absolute;
        top: 40%;
        left: 50%;
    }
}
</style>