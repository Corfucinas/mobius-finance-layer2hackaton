<template>
    <div class="components-global-minMining">
        <div class="top-content">
            <div class="item">
                <span class="label">Introduction: Stake: </span>
                <span class="content">Stake collateral to mint moUSD or to Short an moAsset and get $MOT rewards.</span>
            </div>
            <div class="item">
                <span class="label">Rule: </span>
                <span class="content">Receivable MOT rewards are calculated as follows: the proportion of user collateral * the total amount of released MOT each block</span>
            </div>
            <img class="shortBg" src="../../assets/img/short-bg.png" />
        </div>

        <div class="grid-content">
            <div class="item" v-for="(item, index) in source.rewardCollateralDataList" :key="index">
                <div class="item-content" v-if="!item.loading">
                    <div class="logo"><img class="img" :src="require(`../../assets/img/logo_${item.assetsName}.png`)" /></div>
                    <div class="minming">{{item.assetsName}} - Staking</div>
                    <div class="muti">{{item.allocPoint}}X</div>
                    <div class="commont">
                        <span class="tvl">{{$t('stake.tvl')}}</span>
                        <a-statistic :value="item.totalAmount | formerAccuracy" :precision="4" prefix="$" :value-style="{color: '#FFA004'}" />
                    </div>

                    <div class="apy-content">
                        <div class="item-apy">
                            <span style="margin-right:6px">{{$t('stake.apy')}}</span>
                            <a-statistic :value="item.apr" :precision="2" suffix="%" :value-style="{'font-weight': 500, 'color': '#6641B9'}" />
                            <a-tooltip placement="top">
                                <template slot="title">
                                    <div class="label">{{$t('stake.apyTip')}}</div>
                                </template>
                                 <a-icon style="margin-left:5px;" type="question-circle" />
                            </a-tooltip>
                        </div>
                    </div>

                    <div class="but-list">
                        <a-button class="but" @click="itemClaimClick(item)">{{$t('stake.claimRewards')}}</a-button>
                    </div>

                    <div class="go-to">
                        <span class="goToBut" @click="itemGoToMintClick(item)">{{$t('stake.goToMINT')}}</span>
                        <span class="or">or</span>
                        <span class="goToBut" @click="itemGoToShortClick(item)">{{$t('stake.goShort')}}</span>
                    </div>
                </div>

                <a-skeleton :loading="item.loading" active :paragraph="{ rows: 9 }"></a-skeleton>
            </div>
        </div>

        <CsClaimModal ref="CsClaimModalRef" />
    </div>
</template>

<script>
import CsClaimModal from '@/components/plugins/CsClaimModal'
import { poolLength, poolInfo, motPerBlock, getPrice, totalAllocPoint } from '@/config/ContractMethods'
import { getGasPriceAndBlock } from '@/service'
import { toFixedVal } from '@/common/utils/filters'

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
            let lenth = await poolLength()
            this.initSkeleton(lenth)
            let blockInfo = await getGasPriceAndBlock()
            let totalAllocPointAmount = await totalAllocPoint()
            this.fromModel.blockTime = blockInfo.blockTime
            this.fromModel.motPrice = await getPrice('MOT')
            if (lenth) {
                this.source.rewardCollateralDataList.forEach(async (item, index) => {
                    let { totalAmount, assetsName, allocPoint } = await poolInfo(index)
                    let { apr, totalBalance } = await this.countApr(totalAmount, assetsName, allocPoint, totalAllocPointAmount)
                    item.totalAmount = totalBalance
                    item.assetsName = assetsName
                    item.allocPoint = allocPoint
                    item.apr = apr
                    item.loading = false
                })
            }
        },

        initSkeleton (lenth) {
            for (let i = 0; i < lenth; i++) {
                this.source.rewardCollateralDataList.push({
                    totalAmount: 0,
                    assetsName: 0,
                    apr: 0,
                    loading: true
                })
            }
        },

        async countApr (totalAmount, assetsName, allocPoint, totalAllocPointAmount) {
            let apr = 0
            let totalBalance = 0
            if (totalAmount) {
                let { motPerBlockNum, assetsPrice } = await this.getData(assetsName)
                let motTotalPrice = motPerBlockNum * (allocPoint / totalAllocPointAmount ) * this.fromModel.motPrice
                let assetsTotalPrice = toFixedVal(assetsPrice * totalAmount)
                let totalSec = 365 * 3600 * 24
                let aprPrice = ((motTotalPrice * totalSec) / (assetsTotalPrice * this.fromModel.blockTime)) * 100
                totalBalance = assetsTotalPrice
                apr = toFixedVal(aprPrice)
            }
            return { apr, totalBalance } 
        },

        async getData (assetsName) {
            let motPerblockPromise = motPerBlock()
            let assetsPricePromise = getPrice(assetsName)
            
            let motPerBlockNum = await motPerblockPromise
            let assetsPrice = await assetsPricePromise
            return { motPerBlockNum, assetsPrice }
        },

        itemGoToMintClick (item) {
            this.$router.push(`/home/mint?baseCoinName=${item.assetsName}`)
        },

        itemClaimClick (item) {
            this.$refs.CsClaimModalRef.show({
                coinName: item.assetsName,
                type: 'Staking'
            })
        },

        itemGoToShortClick (item) {
            this.$router.push(`/home/shorting?baseCoinName=${item.assetsName}`)
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
            padding: 20px 30px;
            position: relative;
            .item-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
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

                .minming {
                    font-size: 24px;
                    font-family: DINPro-Medium, DINPro;
                    font-weight: 500;
                    color: #37373C;
                    margin: 15px 0;
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

                .apy-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    margin-top: 20px;
                    .item-apy {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex: 1;
                        .label {
                            font-size: 16px;
                            font-family: DINPro-Regular, DINPro;
                            font-weight: 400;
                            color: #6A6972;
                        }
                        .val {
                            font-family: DINPro-Medium, DINPro;
                            font-weight: 500;
                            margin-left: 5px;
                            font-size: 18px;
                            color: #6641B9;
                        }

                        /deep/ .ant-statistic-content {
                            font-size: 18px;
                        }

                        /deep/ .ant-statistic-content-value-int {
                            font-size: 18px;
                        }

                        /deep/ .ant-statistic-content-value-decimal {
                            font-size: 18px;
                        }

                        /deep/ .ant-statistic-content-suffix {
                            font-size: 18px;
                        }
                    }

                    .align {
                        text-align: right;
                    }
                }

                .but-list {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    .but {
                        margin-top: 20px;
                    }
                }

                .go-to {
                    display: flex;
                    align-items: center;
                    margin-top: 15px;
                    .goToBut {
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
                    .or {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                        margin: 0 10px;
                    }  
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