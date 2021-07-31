<template>
    <div class="mint-burn-content">
        <div class="mint-burn">
            <a-tabs type="card" @change="change" :animated="true"> 
                <a-tab-pane key="mint" :tab="$t('mintAndBurn.min')">
                    <mintForm ref="updateMintForm" @updateInfo="updateInfo"></mintForm>
                </a-tab-pane>

                <a-tab-pane key="burn" :tab="$t('mintAndBurn.burn')">
                    <burnForm ref="updateBurnForm" @updateBurnFormInfo="updateBurnFormInfo"></burnForm>
                </a-tab-pane>
            </a-tabs>
        </div>

        <img class="bouble-right" src="../../assets/img/right.png" />

        <div class="mint-burn">
            <mintRightArea ref="mintRightAreaRef" v-if="activeKey === 'mint'" />
            <burnRightArea ref="burnRightAreaRef" v-if="activeKey === 'burn'" />
        </div>
    </div>
</template>

<script>
import mintForm from '@/components/global/mintForm.vue'
import burnForm from '@/components/global/burnForm.vue'
import mintRightArea from '@/components/mintAndBurn/mintRightArea.vue'
import burnRightArea from '@/components/mintAndBurn/burnRightArea.vue'

export default {
    name: 'mintBurn',

    components: { mintForm, burnForm, mintRightArea, burnRightArea },

    data () {
        return {
            activeKey: 'mint',
            spinning: false,
            account: this.$store.state.account,
        }
    },

    created () {
        window.parent.scrollTo(0, 0)
    },

    methods: {
        updateInfo ({ coinNmae, liquidationPrice, liquidationRate, rateStatus, lin, mousdBalance, availableAmount, stakeAmount, safeRate, coinBalance }) {
            this.$refs.mintRightAreaRef.updateInfo({ coinNmae, liquidationPrice, liquidationRate, rateStatus, lin, mousdBalance, availableAmount, stakeAmount, safeRate, coinBalance })
        },

        updateBurnFormInfo ({ coinName, debtAmount, totalDebtAmount, stakeAmount, collateralRatio, moUSDBalance, oldStakeAmount }) {
            this.$refs.burnRightAreaRef.updateInfo({
                coinName,
                debtAmount,
                totalDebtAmount,
                stakeAmount,
                collateralRatio,
                moUSDBalance,
                oldStakeAmount
            })
        },

        change (activeKey) {
            this.activeKey = activeKey
            if (activeKey === 'mint') {
                this.$nextTick(() => {
                    this.$refs.updateMintForm.initData()
                })
                
            } else if (activeKey === 'burn') {
                this.$nextTick(() => {
                    this.$refs.updateBurnForm.initData()
                })
                
            }
        }
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-spin-dot-spin {
    top: 50%;
}

/deep/ .ant-tabs-bar {
    border: none;
}

/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    border: none;
    background: #fff;
    font-size: 24px;
    font-family: DINPro-Regular, DINPro;
    font-weight: 400;
    color: #6A6972;
    padding-left: 0;
    padding-right: 50px;
}

/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab-active {
    font-size: 24px;
    font-family: DINPro-Bold, DINPro;
    font-weight: bold;
    color: #37373C;
}

.mint-burn-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F6F7FB;
    padding: 20px 0;
    min-height: calc(100vh - 320px);
    border-radius: 16px;
    .mint-burn {
        margin: auto;
        width: 650px;
        background: #fff;
        box-shadow: 0px 8px 16px 0px rgba(0, 104, 255, 0.2);
        border-radius: 12px;
        border: 1px solid #D6D6D6;
        padding: 20px;
        height: 660px;
    }

    .bouble-right {
        width: 48px;
    }
}

@media screen and (max-width: 750px) {
    .mint-burn-content {
        width: 100%;
        background: #F6F7FB;
        padding: 20px 0;
        .mint-burn {
            margin: auto;
            max-width: 668px;
            background: #fff;
            box-shadow: 0px 8px 16px 0px rgba(0, 104, 255, 0.2);
            border-radius: 12px;
            border: 1px solid #D6D6D6;
            margin-top: 30px;
            padding: 0 20px;
            .mint-header {
                display: flex;
                align-items: center;
                width: 100%;
                height: 50px;
                line-height: 50px;
                .mint {
                    flex: 0.5;
                    text-align: center;
                    font-size: 16px;
                    font-family: DINPro-Bold, DINPro;
                    font-weight: 500;
                    cursor: pointer;
                }
                .active {
                    color: #37373C;
                    font-weight: bold;
                }
            }

        }
    }
}
</style>