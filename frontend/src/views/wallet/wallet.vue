<template>
    <div class="">
        <stakeAndMoAssetsTop />

        <div class="list-table">
           <a-tabs type="card"> 
                <a-tab-pane key="mint" :tab="$t('wallet.balances')">
                    <balance />
                </a-tab-pane>

                <a-tab-pane key="burn" :tab="$t('shorting.history')">
                    <history />
                </a-tab-pane>
            </a-tabs>          
        </div>
    </div>
</template>

<script>
import stakeAndMoAssetsTop from '@/components/wallet/stakeAndMoAssetsTop.vue'
import balance from '@/components/wallet/balance.vue'
import history from '@/components/shorting/history.vue'

export default {
    name: 'wallte',

    components: { balance, history, stakeAndMoAssetsTop }
}
</script>

<style lang="less" scoped>
/deep/ .ant-tabs-bar {
    border: none;
}

/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    border: none;
    background: #F6F7FB;
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

.list-table {
    background: #F6F7FB;
    border-radius: 16px;
    padding: 20px;
    width: 100%;
}
</style>