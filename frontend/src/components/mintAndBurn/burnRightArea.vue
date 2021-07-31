<template>
    <div class="components-burn-right">
        <div class="header">{{$t('mintAndBurn.burn')}} moUSD {{$t('mintAndBurn.to')}} {{$t('mintAndBurn.unstake')}} {{formModel.coinName}}</div>

        <div class="content">
            <div class="header">
                <span>{{$t('mintAndBurn.available')}} moUSD</span>
                <span><a-statistic :value="filterFormerAccuracy(formModel.moUSDBalance)" :precision="4" style="margin-right: 5px" />moUSD</span>
            </div>

            <div class="header">
                <span>{{$t('mintAndBurn.totalDebt')}}</span>
                <span><a-statistic :value="filterFormerAccuracy(formModel.totalDebt)" :precision="4" style="margin-right: 5px" />moUSD</span>
            </div>

            <div class="area">
                <div class="item">
                    <div class="bold">{{$t('mintAndBurn.stakedCollateral')}}</div>
                </div>

                <div class="item">
                    <div class="label title">{{formModel.coinName}} {{$t('mintAndBurn.staked')}}</div>
                    <div class="amount">
                        <a-statistic v-if="formModel.oldStakeAmount" :value="formModel.oldStakeAmount" :precision="4" /> 
                        <img v-if="formModel.oldStakeAmount" style="height: 15px;margin: 0 5px;" src="../../assets/img/right.png" />
                        <a-statistic :value="filterFormerAccuracy(formModel.stakeAmount)" :precision="4" style="margin-right: 5px" /> {{formModel.coinName}}
                    </div>
                </div>

                <div class="item">
                    <div class="label">{{$t('mintAndBurn.collateralRatio')}}</div>
                    <div class="amount"><a-statistic :value="filterFormerAccuracy(formModel.collateralRatio)" suffix="%" :precision="2" /></div>
                </div>

                <div class="item">
                    <div class="label">{{$t('mintAndBurn.debt')}}</div>
                    <div class="amount"><a-statistic :value="filterFormerAccuracy(formModel.debtAmount)" :precision="4" style="margin-right: 5px" /> moUSD</div>
                </div>
            </div>
        </div>

        <div class="stake-list">
            <div class="item-stake" v-for="(item, index) in source.stakeList" :key="index">
                <div class="label">{{item.coinName}} {{$t('mintAndBurn.staked')}}</div>
                <a-statistic :value="filterFormerAccuracy(item.stakeAmount)" :precision="4" :suffix="item.coinName" style="margin-right: 5px" :value-style="{'color': '#5A208B'}" />
            </div>
        </div>
    </div>
</template>

<script>
import { AssetsList } from '@/config/RewardCollateralDeal.js'
import { getStaked, getDebt } from '@/config/ContractMethods'

export default {
    name: 'BurnRight',

    data () {
        return {
            formModel: {
                coinName: '',
                totalDebt: '',
                stakeAmount: '',
                debtAmount: '',
                collateralRatio: '',
                moUSDBalance: 0,
                oldStakeAmount: 0
            },
            source: {
                stakeList: []
            }
        }
    },

    methods: {
        async updateInfo ({ coinName, debtAmount, stakeAmount, collateralRatio, moUSDBalance, oldStakeAmount }) {
            this.source.stakeList = []
            this.formModel.coinName = coinName
            this.formModel.totalDebt = this.formModel.debtAmount = debtAmount
            this.formModel.stakeAmount = stakeAmount
            this.formModel.collateralRatio = collateralRatio
            this.formModel.moUSDBalance = moUSDBalance
            this.formModel.oldStakeAmount = oldStakeAmount
            this.getData()
        },

        async getData () {
            AssetsList.forEach(async (item) => {
                if (item.coinName !== this.formModel.coinName) {
                    let assetsAmountPromise = getStaked(item.coinName, 'moUSD', this.$store.state.account)
                    let debtAmountPromise = getDebt(item.coinName, 'moUSD', this.$store.state.account)
                    this.source.stakeList.push({
                        coinName: item.coinName,
                        stakeAmount: await assetsAmountPromise
                    })
                    let debtAmount = await debtAmountPromise
                    this.formModel.totalDebt += debtAmount
                }
            })
        },

        filterFormerAccuracy (value) {
            if (!value) return 0
            let data = parseFloat(value)
            if (data < 0.000001 && data > 0) {
                data = 0
            }
            return parseFloat(data) 
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-statistic-content {
    font-weight: 400;
}

.components-burn-right {
    .header {
        height: 50px;
        line-height: 50px;
        font-size: 24px;
        font-family: DINPro-Bold, DINPro;
        font-weight: 500;
        color: #37373C;
    }

    .content {
        background: #F6F7FB;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
        .header {
            display: flex;
            justify-content: space-between;
            height: 46px;
            line-height: 46px;
            align-items: center;
            font-size: 18px;
            font-family: DINPro-Medium, DINPro;
            font-weight: 500;
            color: #37373C;
            /deep/ .ant-statistic-content {
                font-weight: bold;
            }
        }

        .area {
            background: #FFFFFF;
            border-radius: 8px;
            margin-top: 20px;
            .item {
                height: 50px;
                line-height: 50px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 30px 20px;
                .label {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #6A6972;
                }
                .amount {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    color: #37373C;

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
                }

                .title {
                    font-weight: 500;
                }
            }

            .bold {
                font-size: 18px;
                font-family: DINPro-Medium, DINPro;
                font-weight: 500;
                color: #37373C;
            }

            .line {
                border-bottom: 1px solid #D6D6D6;
            }
        }
    }

    .stake-list {
        display: grid;
        grid-template-columns: repeat(3, 31%);
        grid-column-gap: 20px;
        grid-row-gap: 20px;
        margin-top: 40px;
        .item-stake {
            text-align: center;
            background: #F6F7FB;
            border-radius: 8px;
            padding: 20px;
            .label {
                font-size: 18px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #37373C;
                margin-bottom: 20px;
            }
        }
    }
}
</style>