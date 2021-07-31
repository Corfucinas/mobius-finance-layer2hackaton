<template>
    <div class="components-global-minMining">
        <div class="top-content">
            <div class="item">
                <span class="label">Introduction: Stake: </span>
                <span class="content">Trade moAssets on Mobius Finance and earn MOT rewards.
                    Trading Rewards are calculated as follows: Available MOT <br>rewards = user transaction volume/24-hour 
                    total transaction Volume* total amount of MOT rewardas asigned for the trading pair.</span>
            </div>
            <img class="shortBg" src="../../assets/img/short-bg.png" />
        </div>

        <div class="grid-content">
            <div class="item" v-for="(item, index) in source.rewardCollateralDataList" :key="index">
                <a-skeleton :loading="item.loading" active :paragraph="{ rows: 9 }"></a-skeleton>

                <div class="item-content" v-if="!item.loading">
                    <div class="logo">
                        <img class="img" :src="require(`../../assets/img/logo_${item.assetsName}.png`)" />
                        <img src="../../assets/img/logo_moUSD.png" alt="" />
                    </div>
                    <div class="muti">{{item.multiplier}}X</div>
                    <div class="minming">{{item.assetsName}} - {{item.assets}}</div>
                    
                    <div class="commont">
                        <span class="tvl">24h</span>
                        <a-statistic :value="item.totalAmount | formerAccuracy" :precision="4" prefix="$" :value-style="{color: '#FFA004'}" />
                    </div>

                    <div class="but-list">
                        <a-button class="but" @click="itemClaimClick(item)">{{$t('stake.claimRewards')}}</a-button>
                    </div>

                    <span class="goToBut" @click="itemGoToMintClick(item)">{{$t('stake.goToTrade')}}</span>
                </div>
            </div>
        </div>

        <CsClaimModal ref="CsClaimModalRef" />
    </div>
</template>

<script>
import { moAssetsTradingRewards } from '@/config/RewardCollateralDeal'
import CsClaimModal from '@/components/plugins/CsClaimModal'
import { motPerBlock, getPrice, tradPoolInfo } from '@/config/ContractMethods'
import { toFixedVal } from '@/common/utils/filters'
import { getTransactionsData } from '@/service'

export default {
    components: { CsClaimModal },

    data () {
        return {
            fromModel: {
                blockTime: '',
                motPrice: 0
            },
            source: {
                rewardCollateralDataList: []
            }
        }
    },

    created () {
        this.initData()
    },

    methods: {
        async initData () {
            this.source.rewardCollateralDataList = []
            this.initSkeleton()
            this.source.rewardCollateralDataList.forEach(async (item) => {
                item.totalAmount = await this.countTotalAmount(item.pid)
                item.multiplier = await tradPoolInfo(item.pid),
                item.loading = false
            })
        },

        initSkeleton () {
            moAssetsTradingRewards.forEach(async (item) => {
                this.source.rewardCollateralDataList.push({
                    assetsName: item.coinName,
                    assets: item.assets,
                    pid: item.pid,
                    totalAmount: '',
                    multiplier: '',
                    loading: true
                })
            })
        },

        async countTotalAmount (pid) {
            let totalAmount = 0
            let currentTimestamp = Date.parse(new Date()) / 1000
            let dayTimestamp = 24 * 3600
            let timestamp = currentTimestamp - dayTimestamp
            let params = {
                "query":`{tradingAmountEntities(first: 1000,orderBy:time,orderDirection:desc,where:{time_gt: ${timestamp},pid: ${pid}}){id,amount}}`
            }
            let res = await getTransactionsData(params)
            if (res && res.data && res.data.tradingAmountEntities && res.data.tradingAmountEntities.length) {
                res.data.tradingAmountEntities.forEach((item) => {
                    totalAmount += toFixedVal(this.$ethers.utils.formatEther(item.amount))
                })
            }
            return totalAmount
        },

        async countApr (totalAmount, assetsName, allocPoint, totalAllocPointAmount) {
            let { motPerBlockNum, assetsPrice } = await this.getData(assetsName)
            let motTotalPrice = motPerBlockNum * (allocPoint / totalAllocPointAmount ) * this.fromModel.motPrice
            let assetsTotalPrice = toFixedVal(assetsPrice * totalAmount)
            let totalSec = 365 * 3600 * 24
            let apr = ((motTotalPrice * totalSec) / (assetsTotalPrice * this.fromModel.blockTime)) * 100
            return toFixedVal(apr)
        },

        async getData (assetsName) {
            let motPerblockPromise = motPerBlock()
            let assetsPricePromise = getPrice(assetsName)
            
            let motPerBlockNum = await motPerblockPromise
            let assetsPrice = await assetsPricePromise
            return { motPerBlockNum, assetsPrice }
        },

        itemGoToMintClick (item) {
            this.$router.push(`/home/trade?tokenName=${item.assetsName}`)
        },

        itemClaimClick (item) {
            this.$refs.CsClaimModalRef.show({
                coinName: item.assetsName,
                type: 'Trading',
                pid: item.pid
            })
        }
    }
}
</script>

<style lang="less" scoped>
.components-global-minMining {
    .top-content {
        position: relative;
        background: #FFF4E4;
        padding: 20px 40px;
        border-radius: 8px;
        .item {
            line-height: 40px;
            .label {
                font-size: 18px;
                font-family: DINPro-Medium, DINPro;
                color: #37373C;
            }
            .content {
                font-size: 18px;
                font-family: DINPro-Regular, DINPro;
                color: #37373C;
            }
        }
        .shortBg {
            position: absolute;
            bottom: 0;
            right: 60px;
            width: 200px;
        }
    }

    .grid-content {
        display: grid;
        grid-template-columns: repeat(4, 23%);
        margin: 20px 0;
        background: linear-gradient(308deg, #F3EEFF 0%, #F0F8FF 54%, #FDF7FF 100%);
        border-radius: 16px;
        padding: 40px;
        min-height: 300px;
        justify-content: space-between;
        .item {
            background: #FFFFFF;
            box-shadow: 0px 6px 12px 0px rgba(141, 115, 245, 0.16);
            border-radius: 16px;
            padding: 20px;
            margin: 10px;
            width: 100%;
            position: relative;
            .item-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                .logo {
                    display: flex;
                    .img {
                        z-index: 1;
                        margin-right: -10px;
                    }
                    img {
                        width: 60px;
                    }
                }

                .minming {
                    font-size: 24px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #37373C;
                    margin: 20px 0;
                }

                .apy {
                    font-size: 18px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: bold;
                    color: #00C487;
                }

                .commont {
                    min-width: 160px;
                    height: 32px;
                    line-height: 32px;
                    background: #FFF4E4;
                    border-radius: 16px;
                    margin-bottom: 10px;
                    text-align: center;
                    padding: 0 10px;
                    font-size: 18px;
                    font-family: DINPro-Bold, DINPro;
                    font-weight: bold;
                    color: #FFA004;
                    .tvl {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #6A6972;
                        margin-right: 10px;
                    }

                    /deep/ .ant-statistic-content {
                        font-size: 20px;
                    }

                    /deep/ .ant-statistic-content-value-int {
                        font-size: 20px;
                    }

                    /deep/ .ant-statistic-content-value-decimal {
                        font-size: 20px;
                    }

                    /deep/ .ant-statistic-content-suffix {
                        font-size: 20px;
                    }
                }

                .item-apy {
                    .label {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #6A6972;
                    }
                    .val {
                        font-size: 20px;
                        font-family: DINPro-Medium, DINPro;
                        font-weight: 500;
                        color: #17CAA9;
                        margin-left: 5px;
                    }
                }

                .but-list {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                .goToBut {
                    margin-top: 10px;
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #5A208B;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .goToBut:hover {
                    opacity: .7;
                }

                .muti {
                    position: absolute;
                    top: 20px;
                    right: 0;
                    background: rgba(206, 118, 255, 0.16);
                    border-radius: 100px 0px 0px 100px;
                    font-size: 32px;
                    font-family: DINPro-Bold, DINPro;
                    font-weight: bold;
                    color: #6641B9;
                    width: 80px;
                    text-align: center;
                }
            }
            
        }
    }
}
</style>