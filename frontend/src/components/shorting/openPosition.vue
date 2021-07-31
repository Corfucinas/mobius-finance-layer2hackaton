<template>
    <div class="components-shorting-openPosition">
        <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="tableChange" :loading="loading" rowKey="key">
            <span slot="shortAsset" slot-scope="row"> 
                <img class="img" :src="require(`../../assets/img/logo_${row}.png`)" />
                <span>{{row}}</span>
            </span>
            
            <span slot="position" slot-scope="row, record"> 
                <a-statistic :value="row | formerAccuracy" :precision="4" style="margin-right: 5px" />
                <a-icon v-if="row > 0" @click="payBackClick(record)" type="form" />
            </span>

            <span slot="liqPrice" slot-scope="row"> 
                <a-statistic :value="row | formerAccuracy" :precision="4" />
            </span>

            <span slot="openPrice" slot-scope="row"> 
                <a-statistic :value="row | formerAccuracy" :precision="4" style="margin-right: 5px" />
            </span>

            <span slot="collateral" slot-scope="row, record"> 
                <a-statistic :value="row | formerAccuracy" :precision="4" :suffix="record.assetsName" style="margin-right: 5px" />
                <a-icon v-if="row > 0" @click="stakeClick(record)" type="form" />
            </span>

            <span slot="collateralRatio" slot-scope="row"> 
                <a-statistic :value="row * 100" :precision="2" style="margin-right: 5px" suffix="%" />
            </span>

            <span slot="profitLoss" slot-scope="row"> 
                <a-statistic :value="row| formerAccuracy" :precision="4" :value-style="{ color: row > 0 ? '#00C487' : '#FF8004' }" />
            </span>

            <span slot="action" slot-scope="row, record">
               <a-button v-if="record.position" class="tableBut" :loading="burnButtonLoading" @click="itemRowClick(row)">{{$t('shorting.closePosition')}}
            </a-button>
            </span>
        </a-table>

        <ShortStake ref="shortStakeModalRef" @initAllData="initAllData" />
        <CsPayBackModel ref="CsPayBackModelRef" @initAllData="initAllData" />
        <CsClosePositionModal ref="CsClosePositionModalRef" @ConfirmCloseClick="ConfirmCloseClick" />
        <CsConfirmModal ref='CsConfirmModalRef' @ConfirmClick="ConfirmClick"></CsConfirmModal>
        <CsWatingModal ref='CsWatingModalRef' @ConfirmClick="ConfirmClick" @cancelClick="cancelClick" />
    </div>
</template>

<script>
import { getStaked, getDebtOriginalToObj, getPrice, getLiquidationRate, burn, getStakeCollateralRate, getDebt } from '@/config/ContractMethods'
import { AssetsList, syntheticAssets } from '@/config/RewardCollateralDeal'
import CsClosePositionModal from '@/components/plugins/CsClosePositionModal'
import CsConfirmModal from '@/components/plugins/CsConfirmModal/index.vue'
import CsWatingModal from '@/components/plugins/CsWatingModal/index.vue'
import CsPayBackModel from '@/components/plugins/CsPayBackModel/index.vue'
import ShortStake from '@/components/plugins/CsPayBackModel/shortStake.vue'
import { toFixedVal } from '@/common/utils/filters'

export default {
    components: {
        CsClosePositionModal,
        CsConfirmModal,
        CsWatingModal,
        CsPayBackModel,
        ShortStake
    },

    data () {
        return {
            formModel: {
                shortAssets: '',
                baseCoinName: ''
            },
            dataList: [],
            columns: [
                {
                    title: this.$i18n.tc('shorting.id'),
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
                    title: this.$i18n.tc('shorting.shortAsset'),
                    dataIndex: 'shortAsset',
                    key: 'shortAsset',
                    scopedSlots: { customRender: 'shortAsset' },
                },
                {
                    title: this.$i18n.tc('shorting.position'),
                    dataIndex: 'position',
                    key: 'position',
                    scopedSlots: { customRender: 'position' },
                },
                {
                    title: this.$i18n.tc('shorting.openPrice'),
                    dataIndex: 'openPrice',
                    key: 'openPrice',
                    scopedSlots: { customRender: 'openPrice' },
                },
                {
                    title: this.$i18n.tc('shorting.collateral'),
                    dataIndex: 'collateral',
                    key: 'collateral',
                    scopedSlots: { customRender: 'collateral' }
                },
                {
                    title: this.$i18n.tc('shorting.liqPrice'),
                    dataIndex: 'liqPrice',
                    key: 'liqPrice',
                    scopedSlots: { customRender: 'liqPrice' },
                },
                {
                    title: this.$i18n.tc('shorting.collateralRatio'),
                    dataIndex: 'collateralRatio',
                    key: 'collateralRatio',
                    scopedSlots: { customRender: 'collateralRatio' },
                },
                {
                    title: this.$i18n.tc('shorting.profitLoss'),
                    dataIndex: 'profitLoss',
                    key: 'profitLoss',
                    scopedSlots: { customRender: 'profitLoss' }
                },
                {
                    title: 'action',
                    key: 'action',
                    scopedSlots: { customRender: 'action' },
                },
            ],
            loading: false,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0,
                showTotal: total => `${total} Information`
            },
            provider: this.$Provider.providerInstance,
            burnButtonLoading: false,
            account: this.$store.state.account,
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
        initData () {
            this.loading = true
            this.dataList = []
            this.initDataList()
        },

        initAllData () {
            this.initData()
            this.$emit('initData')
        },

         async initDataList () {
            let that = this
            let totalStakePrice = 0
            let totalDebtPrice = 0
            let totalProfitsPrice = 0
            for (let item of AssetsList) {
                for (let childItem of syntheticAssets) {
                    let assetsName = item.coinName
                    let moAssetsName = childItem.coinName
                    let { debtAmount, originalDebt } = await getDebtOriginalToObj(assetsName, that.account, moAssetsName)
                    if (debtAmount) {
                        let openPrice = originalDebt && debtAmount ? toFixedVal((originalDebt / debtAmount)) : 0
                        let res = await that.getData(assetsName, moAssetsName)
                        let { stakeAmount, assetsOrcalPrice, syntheticAssetsOrcal, linPrice, collateralRatio, allDebt } = res
                        let profitLoss = that.countProfitLoss(allDebt, originalDebt, syntheticAssetsOrcal)
                        that.dataList.push({
                            baseCoinName: item.coinName,
                            key: `${item.coinName}${childItem.coinName}`,
                            shortAsset: childItem.coinName,
                            position: allDebt,
                            assetsName: item.coinName,
                            openPrice: openPrice,
                            collateral: stakeAmount,
                            liqPrice: that.countLiquidationPrice(stakeAmount, debtAmount, syntheticAssetsOrcal, linPrice),
                            collateralRatio: collateralRatio,
                            profitLoss: profitLoss,
                            account: that.account
                        })
                        totalStakePrice += stakeAmount * assetsOrcalPrice
                        totalDebtPrice += allDebt * syntheticAssetsOrcal
                        totalProfitsPrice += profitLoss
                    }
                    if (item.coinName === AssetsList[AssetsList.length - 1].coinName && childItem.coinName === syntheticAssets[syntheticAssets.length - 1].coinName) {
                        that.dataList.sort((a, b) => {
                            return b.collateral - a.collateral
                        })
                        that.$emit('updateGridTopInfo', { totalStakePrice, totalDebtPrice, totalProfitsPrice })
                        that.loading = false
                    }
                }
            }
        },

        countRate (stakeAmount, debtAmount, assetsOrcalPrice, syntheticAssetsOrcal) {
            let res = 0
            if (stakeAmount && debtAmount) {
                res = ((stakeAmount * assetsOrcalPrice) / (debtAmount * syntheticAssetsOrcal)) * 100
            }
            return toFixedVal(res)
        },

        countLiquidationPrice (stakeAmount, debtAmount, syntheticAssetsOrcal, linPrice) {
            let res = 0
            if (debtAmount && stakeAmount) {
                res = toFixedVal((linPrice * debtAmount * syntheticAssetsOrcal) / stakeAmount)
            }
            return res
        },

        countProfitLoss (allDebt, originalDebt, syntheticAssetsOrcal) {
            let res = originalDebt - allDebt * syntheticAssetsOrcal
            return res
        },

        async getData (asset, syntheticName) {
            let stakePromise = getStaked(asset, syntheticName, this.account )
            let assetsOrcalPricePromise = getPrice(asset)
            let syntheticAssetsOrcalPricePromise = getPrice(syntheticName)
            let linPricePromise = getLiquidationRate(asset, syntheticName)
            let collateralRatioPromise = getStakeCollateralRate(asset, this.account, syntheticName)
            let allDebtPromise = getDebt(asset, syntheticName, this.account)

            let stakeAmount = await stakePromise
            let assetsOrcalPrice = await assetsOrcalPricePromise
            let syntheticAssetsOrcal = await syntheticAssetsOrcalPricePromise
            let linPrice = await linPricePromise
            let collateralRatio = await collateralRatioPromise
            let allDebt = await allDebtPromise
            return {  stakeAmount, assetsOrcalPrice, syntheticAssetsOrcal, linPrice, collateralRatio, allDebt }
        },

        tableChange (pagination) {
            this.pagination.current = pagination.current;
            this.pagination.pageSize = pagination.pageSize;
            this.getTableList();
        },

        itemRowClick (row) {
            this.formModel.shortAssets = row.shortAsset
            this.formModel.baseCoinName = row.baseCoinName
            this.$refs.CsClosePositionModalRef.show({
                topAmount: row.position,
                topCoinName: row.shortAsset,
                bottomCoinName: row.shortAsset,
            })
        },

        payBackClick (row) {
            this.$refs.CsPayBackModelRef.show(row)
        },

        stakeClick (row) {
            this.$refs.shortStakeModalRef.show(row)
        },

        ConfirmClick () {
            this.initData()
        },

        listenerAccountbalance (txHash) {
            this.provider.once(txHash, (transaction) => {
                console.log('listener: ===', transaction);
                this.$refs.CsWatingModalRef.updateStatus({ status: 'success', txHash })
                this.initAllData()
            });
        },

        async ConfirmCloseClick ({ topBalance, amount, isMax }) {
            this.showWatingModal(topBalance, amount)
            let { formModel } = this
            try {
                if (isMax) {
                    amount = amount * 2
                } 
                let resultHash = await burn(formModel.baseCoinName, formModel.shortAssets, amount, true)
                if (resultHash) {
                    this.listenerAccountbalance(resultHash)
                }   
            } catch (error) {
                this.$refs.CsWatingModalRef.updateStatus({ status: 'cancel' })
                this.$notification['error']({
                    message: 'Tip',
                    description: error.message,
                })
            }
        },

        showWatingModal (topBalance, amount) {
            this.$refs.CsWatingModalRef.show({
                topAmount: topBalance,
                topCoinName: this.formModel.shortAssets,
                bottomAmount: amount,
                bottomCoinName: this.formModel.shortAssets,
                name: 'close position',
                status: 'wating'
            })
        },

        cancelClick () {}
    }
}
</script>

<style lang="less" scoped>
/deep/ .anticon {
    color: #A564F1;
}

/deep/ .anticon:hover {
    opacity: .7;
}

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

/deep/ .ant-table-thead > tr > th {
    background: #fff;
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
.components-shorting-openPosition {
    .tableBut {
        cursor: pointer;
        width: 134px;
        height: 32px;
        background: #7D6EF4;
        box-shadow: 0px 2px 6px 0px rgba(90, 79, 181, 0.69);
        border-radius: 16px;
        border: none;
        color: #fff;
    }
    .tableBut:hover {
        opacity: .7;
    }

    .img {
        width: 36px;
        margin-right: 10px;
    }
}
</style>