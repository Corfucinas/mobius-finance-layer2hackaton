<template>
    <div class="components-charts">
        <div class="chart-header">
            <div class="chart-header-left">
                <span class="mir">{{currentCoinName}}</span>
                <span class="chart-price">
                    <a-statistic :value="currentPrice | formerAccuracy" :precision="4" :value-style="{ color: '#5A208B' }" suffix="USD" />
                </span>
                <!-- <span class="icp">
                    <a-icon style="margin: 0 10px;color:#FF8004;" type="arrow-down" />
                    <span style="color:#FF8004;">10.73%</span>
                </span> -->
            </div>

            <div class="chart-header-right">
                <div :class="{'active': dateType === 'd'}" @click="changeDay('d')">D</div>
                <div :class="{'active': dateType === 'w'}" @click="changeDay('w')">W</div>
                <div :class="{'active': dateType === 'm'}" @click="changeDay('m')">M</div>
            </div>
        </div>

        <div class="chart-area" id="chartAreaId"></div>
        <div class="loadding-spin" v-if="loadding"><a-spin /></div>
    </div>
</template>

<script>
import { getKChartData } from '@/service'
import { kChartDataList } from '@/config/RewardCollateralDeal'
import { getPrice } from '@/config/ContractMethods'
import { toFixedVal } from '@/common/utils/filters'

export default {
    name: 'kChart',

    data () {
        return {
            chartArea: null,
            dateType: 'd',
            currentCoinName: '',
            skipCount: 0,
            source: {
                dataList: []
            },
            charDataArrar: [],
            loadding: false,
            currentPrice: 0,
            currentMoAssets: ''
        }
    },

    methods: {
        show (moAssets, toAssets) {
            if (moAssets === 'moUSD') {
                this.currentMoAssets = toAssets
                this.currentCoinName = kChartDataList[toAssets]
            } else {
                this.currentMoAssets = moAssets
                this.currentCoinName = kChartDataList[moAssets]
            }
            this.initData()
        },

        async initData () {
            let endTimestamp = Date.parse(new Date()) / 1000
            let startTimestamp = 0
            let timestampArea = 0
            this.loadding = true
            this.skipCount = 0
            this.source.dataList = []
            this.charDataArrar = []
            switch (this.dateType) {
                case 'd':
                    timestampArea = 24 * 3600
                    break;

                case 'w':
                    timestampArea = 24 * 3600 * 7
                    break;
                    
                case 'm':
                    timestampArea = 24 * 3600 * 30
                    break;
                    
                case 'y':
                    timestampArea = 24 * 3600 * 365
                    break;   

                default:
                    break;
            }
            startTimestamp = endTimestamp - timestampArea
            this.getData(startTimestamp, endTimestamp)
            this.currentPrice = await getPrice(this.currentMoAssets)
        },

        async getData (startTimestamp, endTimestamp) {
            let params = {
                "query": `{prices(where: {timestamp_gte: ${startTimestamp}, timestamp_lte: ${endTimestamp}, assetPair: "${this.currentCoinName}/USD"}, orderBy: timestamp, 
                first: 1000, skip:${this.skipCount}, orderDirection: desc) {price,timestamp}}`
            }
            let result = await getKChartData(params)
            if (result.data && result.data.prices && result.data.prices.length) {
                let dataList = result.data.prices
                this.source.dataList = [...this.source.dataList, ...dataList]
                if (dataList.length < 1000) {
                    this.initChartDataList()
                    this.initCharts()
                } else {
                    let endTimestamp = dataList[dataList.length - 1].timestamp
                    this.getData(startTimestamp, endTimestamp)
                }
            }
        },

        initChartDataList () {
            let arr = []
            this.source.dataList.forEach((item) => {
                let now = new Date(item.timestamp * 1000)
                let hh = now.getHours()
                let mf = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
                let dateStr = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/') + ` ${hh}:${mf}`
                arr.push([
                    dateStr,
                    toFixedVal(item.price / (100000000))
                ]);
            })
            this.charDataArrar = [...new Set(arr)]
        },

        initCharts () {
            this.$nextTick(() => {
                if (!this.chartArea) {
                    let chartAreaDom = document.getElementById('chartAreaId');
                    this.chartArea = this.$echarts.init(chartAreaDom);
                }
                this.initChartsOptions()
            })
        },

        initChartsOptions () {
            this.chartArea.setOption({
                tooltip: {
                    trigger: 'axis',
                    show: true,
                    position: function (pt) {
                        return [pt[0], '10%'];
                    }
                },
                title: {
                    left: 'left',
                    text: '',
                    show: false
                },
                toolbox: {
                    show: false,
                    feature: {
                        dataZoom: {},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                grid:{
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: '#fff'
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                    splitLine: {
                        show: false
                    },
                    show: false
                },
                yAxis: {
                    type: 'value',
                    show: false,
                    scale: true,
                    boundaryGap: [0, '100%'],
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    } 
                },
                series: [{
                    name: 'Price:',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    areaStyle: {
                        color : '#ffffff'
                    },
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
                    data: this.charDataArrar
                }]
            })
            this.loadding = false
        },

        changeDay (type) {
            this.dateType = type
            this.initData()
        },
    }
}
</script>

<style lang="less" scoped>
.components-charts {
    position: relative;
    border: 1px solid #f3f3f7;
    border-radius: 8px;
    padding: 10px 20px;
    margin-bottom: 20px;
    .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        .chart-header-left {
            .mir {
                font-size: 16px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #6A6972;
            }
            .chart-price {
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #37373C;
                margin-left: 15px;
            }
        }

        .chart-header-right {
            display: flex;
            align-items: center;
            div {
                background: #F0F0F0;
                border: 1px solid #A6A6B3;
                border-radius: 50%;
                margin: 0 5px;
                font-size: 16px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #A6A6B3;
                cursor: pointer;
                width: 30px;
                height: 30px;
                line-height: 30px;
                text-align: center;
                
            }
            .active {
                color: #5A208B;
                border: 1px solid #5A208B;
            }
        }
    }

    .chart-area {
        width: 100%;
        height: 100px;
    }

    .loadding-spin {
        position: absolute;
        width: 100%;
        height: 120px;
        text-align: center;
        line-height: 150px;
        top: 50px;
        left: 0;
    }

    .chart-bottom {
        display: flex;
        margin-top: 15px;
        .lable {
            font-size: 24px;
            font-family: DINPro-Regular, DINPro;
            font-weight: 400;
            color: #6A6972;
        }
        .lable-price {
            font-size: 24px;
            font-family: DINPro-Medium, DINPro;
            font-weight: 500;
            color: #37373C;
            margin: 0 10px;
        }
        .icon {
            cursor: pointer;
            font-size: 24px;
            font-family: DINPro-Regular, DINPro;
            font-weight: 400;
            color: #6A6972;
        }
    }
}
</style>