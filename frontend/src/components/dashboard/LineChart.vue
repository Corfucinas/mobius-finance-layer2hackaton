<template>
    <div class="line-chart-content">
        <div class="chart-header">
            <div class="title">{{$t('dashboard.volume')}}</div>
            <div class="">
                <span class="usd-count">
                    <a-statistic :value="totalAmount" :precision="4" style="margin-right: 5px" />
                    <span class="unit">USD</span>
                </span>
                <!-- <span class="arrow">
                    <a-statistic title="" :value="liq" suffix="%" :precision="2" :value-style="{ color: liq < 100 ? '#FF8004' : '#00c480 ', 'font-size': '16px' }" style="margin-left: 20px">
                        <template #prefix>
                            <a-icon v-if="liq < 100" type="arrow-down" />
                            <a-icon v-else type="arrow-up" />
                        </template>
                    </a-statistic>
                </span> -->
            </div>
        </div>

        <div class="chart-content" id="lineChart">
            <a-spin class="loadding-spin" v-if="loadding" :spinning="loadding"/>
        </div>
    </div>
</template>

<script>
import { getVolumeData } from '@/service'
import { toFixedVal } from '@/common/utils/filters'

export default {
    data () {
        return {
            lineChart: null,
            loadding: false,
            totalAmount: 0,
            twoDayAmount: 0,
            source: {
                dataList: []
            },
            twoDataList: [],
            liq: 0
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
                "query": `{volumeEntities(where:{id_gt: ${timestamp}}){id,amount}}`
            }
            let res = await getVolumeData(params)
            let twoDayTimestamp = 48 * 3600
            let twoTimestamp = currentTimestamp - twoDayTimestamp
            let twoParams = {
                "query": `{volumeEntities(where:{id_gt: ${twoTimestamp}}){id,amount}}`
            }
            let twoDayRes = await getVolumeData(twoParams)
            this.loadding = false
            if (res && res.data && res.data.volumeEntities) {
                this.source.dataList = res.data.volumeEntities
            }
            if (twoDayRes && twoDayRes.data && twoDayRes.data.volumeEntities) {
                this.twoDataList = twoDayRes.data.volumeEntities
            }
            this.initCharts()
        },

        initCharts () {
            this.$nextTick(() => {
                let lineChart = document.getElementById('lineChart');
                this.lineChart = this.$echarts.init(lineChart);
                this.initChartsOptions()
            })
        },

        initChartsOptions () {
            let data = []
            this.totalAmount = 0
            this.twoDayAmount = 0
            this.source.dataList.forEach((item) => {
                let dayTimer = new Date(item.id * 1000)
                let date = [dayTimer.getFullYear(), dayTimer.getMonth() + 1, dayTimer.getDate()].join('/')
                let hh = dayTimer.getHours()
                let mf = dayTimer.getMinutes() < 10 ? '0' + dayTimer.getMinutes() : dayTimer.getMinutes()
                let timer = `${hh}:${mf}:00`
                data.push({ value:[`${date} ${timer}`, toFixedVal(this.$ethers.utils.formatEther(item.amount))] })
                this.totalAmount += parseFloat(this.$ethers.utils.formatEther(item.amount))
            })

            this.twoDataList.forEach((item) => {
                this.twoDayAmount += parseFloat(this.$ethers.utils.formatEther(item.amount))
            })
            let amount = this.twoDayAmount - this.totalAmount
            this.liq = (amount / this.totalAmount) * 100

            this.lineChart.setOption({
                tooltip: {
                    trigger: 'axis',
                    show: true,
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'left',
                    text: '24H Volume',
                    show: false
                },
                toolbox: {
                    show: false,
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                grid:{
                    top:"50px",
                    left:"50px",
                    right:"30px",
                    bottom:"20px",
                    backgroundColor: '#fff',
                    width:"100%",
                    height:"auto",
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                    splitLine: {
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
                    name: 'Volume',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    areaStyle: {},
                    itemStyle: {
                        barBorderRadius:  [5, 5, 0, 0],
                        color: {
                            x: 0,
                            y: 1,
                            x2: 0,
                            y2: 0,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(137,65,232, .3)'
                            }, {
                                offset: 1,
                                color: 'rgba(190, 117, 245, 1)'
                            }],
                            global: false
                        }
                    },
                    data: data
                }]
            })
        }
    }
}
</script>

<style lang="less" scoped>
.line-chart-content {
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
            .unit {
                font-size: 16px;
                color: #37373C;
            }
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
        height: 300px;
        position: relative;
    }

    .loadding-spin {
        position: absolute;
        top: 40%;
        left: 50%;
    }
}
</style>