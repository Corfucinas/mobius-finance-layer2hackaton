<template>
    <div class="components-mint-right">
        <div class="header" v-if="hidedenTitle">{{$t('mintAndBurn.min')}} {{formModel.coinNmae}} {{$t('mintAndBurn.by')}} {{$t('mintAndBurn.staking')}} moUSD</div>

        <div class="price-ratio">
            <div class="item">
                <div class="label">{{$t('mintAndBurn.liquidationPrice')}}</div>
                <div class="bottom"><a-statistic :value="filterFormerAccuracy(formModel.liquidationPrice)" prefix="$" :value-style="{ color: '#4E4A92' }" style="margin-right: 5px" /></div>
                <img class="bg" src="../../assets/img/liquidation-price.png" />
            </div>

            <div class="item">
                <div class="label">{{$t('mintAndBurn.collateralizationRatio')}}</div>
                <div class="bottom">
                    <a-statistic v-if="formModel.rateStatus === 0" title="" :value="formModel.liquidationRate" :precision="2" suffix="%" :value-style="{ color: '#4E4A92' }" style="margin-right: 50px" />
                    <a-statistic v-if="formModel.rateStatus === 1" title="" :value="formModel.liquidationRate" :precision="2" suffix="%" :value-style="{ color: '#00C487' }" style="margin-right: 50px">
                        <template #prefix>
                            <a-icon type="arrow-up" />
                        </template>
                    </a-statistic>
                    <a-statistic v-if="formModel.rateStatus === 2" title="" :value="formModel.liquidationRate" :precision="2" suffix="%" :value-style="{ color: '#FF8004' }" style="margin-right: 50px">
                        <template #prefix>
                            <a-icon type="arrow-down" />
                        </template>
                    </a-statistic>
                </div>
                <img class="bg" src="../../assets/img/collateralization.png" />
            </div>
        </div>

        <div class="content">
            <div class="header">
                <span>{{$t('mintAndBurn.total')}}</span>
                <span><a-statistic :value="filterFormerAccuracy(formModel.total)" :precision="4" style="margin-right: 5px; font-weight: bold;" />{{formModel.coinNmae}}</span>
            </div>

            <div class="area">
                <div class="item">
                    <div class="label">{{$t('mintAndBurn.staked')}}</div>
                    <div class="amount"><a-statistic :value="filterFormerAccuracy(formModel.stakeAmount)" :precision="4" style="margin-right: 5px" /> {{formModel.coinNmae}}</div>
                </div>

                <div class="item">
                    <div class="label">{{$t('mintAndBurn.available')}}</div>
                    <div class="amount">
                        <a-statistic v-if="filterFormerAccuracy(formModel.coinBalance)" :value="formModel.coinBalance" :precision="4" /> 
                        <img v-if="formModel.coinBalance" style="height: 15px;margin: 0 5px;" src="../../assets/img/right.png" />
                        <a-statistic :value="filterFormerAccuracy(formModel.availableAmount)" :precision="4" style="margin-right: 5px" /> {{formModel.coinNmae}}</div>
                </div>

                <div class="item">
                    <div class="label">{{$t('mintAndBurn.minCollateralRatio')}}</div>
                    <div class="amount"><a-statistic :value="formModel.collateralRatio * 100" :precision="2" suffix="%" style="margin-right: 5px" /> </div>
                </div>

                <div class="item">
                    <div class="label">{{$t('mintAndBurn.liquidationRate')}}</div>
                    <div class="amount"><a-statistic :value="formModel.liquidationLinRate * 100" :precision="2" suffix="%" style="margin-right: 5px" /> </div>
                </div>

                <div class="item">
                    <div class="label">moUSD {{$t('mintAndBurn.balance')}}</div>
                    <div class="amount"><a-statistic :value="filterFormerAccuracy(formModel.mousdBalance)" :precision="4" style="margin-right: 5px" /> moUSD</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MintRight',

    props: {
        hidedenTitle: {
            type: Boolean,
            default: true
        }
    },

    data () {
        return {
            formModel: {
                total: '',
                mousdBalance: '',
                availableAmount: '',
                stakeAmount: '',
                liquidationRate: '',
                collateralRatio: '',
                liquidationPrice: '',
                liquidationLinRate: '',
                coinBalance: 0,
                rateStatus: 0,
            }
        }
    },

    methods: {
        updateInfo ({ coinNmae, liquidationPrice, liquidationRate, rateStatus, lin, mousdBalance, availableAmount, stakeAmount, safeRate, coinBalance }) {
            this.formModel.liquidationPrice = liquidationPrice
            this.formModel.liquidationRate = liquidationRate
            this.formModel.rateStatus = rateStatus
            this.formModel.liquidationLinRate = lin
            this.formModel.collateralRatio = safeRate
            this.formModel.mousdBalance = mousdBalance
            this.formModel.availableAmount = availableAmount
            this.formModel.coinNmae = coinNmae
            this.formModel.stakeAmount = stakeAmount
            this.formModel.total = this.formModel.stakeAmount + this.formModel.availableAmount
            this.formModel.coinBalance = coinBalance
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

.components-mint-right {
    .header {
        height: 50px;
        line-height: 50px;
        font-size: 24px;
        font-family: DINPro-Bold, DINPro;
        font-weight: bold;
        color: #37373C;
    }

    .price-ratio {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .item {
            position: relative;
            background: #F6F7FB;
            border-radius: 8px;
            padding: 20px;
            flex: 1;
            margin-right: 20px;
            margin-top: 20px;
            .label {
                font-size: 18px;
                font-family: DINPro-Regular, DINPro;
                font-weight: 400;
                color: #37373C;
            }
            .bottom {
                font-size: 24px;
                font-family: DINPro-Bold, DINPro;
                font-weight: bold;
                color: #4E4A92;
                margin-top: 30px;

                /deep/ .ant-statistic-content {
                    font-size: 24px;
                    font-weight: bold;
                }

                /deep/ .ant-statistic-content-value-int {
                    font-size: 24px;
                    font-weight: bold;
                }

                /deep/ .ant-statistic-content-value-decimal {
                    font-size: 24px;
                    font-weight: bold;
                }
            }
            .bg {
                position: absolute;
                bottom: 10px;
                right: 20px;
                width: 56px;
            }
        }

        .item:last-child {
            margin-right: 0;
        }
    }

    .content {
        background: #F6F7FB;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
        .header {
            display: flex;
            justify-content: space-between;
            height: 50px;
            line-height: 50px;
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
            .item {
                height: 50px;
                line-height: 50px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
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
            }
        }
    }
}
</style>