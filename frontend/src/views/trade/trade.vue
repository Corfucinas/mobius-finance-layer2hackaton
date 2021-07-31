<template>
    <div class="mint-burn-content">
        <buy-sell />
    </div>
</template>

<script>
import buySell from '@/components/global/buy-sell.vue'

export default {
    name: 'trade',

    components: {
        'buy-sell': buySell
    },

    data () {
        return {}
    },

    created () {},

    methods: {}
}
</script>

<style lang="less" scoped>
.mint-burn-content {
    background: #F6F7FB;
    width: 100%;
    padding: 20px 0;
    border-radius: 16px;
    min-height: calc(100vh - 340px);
}

@media screen and (max-width: 750px) {
    .mint-burn-content {
        width: 100%;
        background-image: url(../../assets/img/bg.png);
        background-repeat:no-repeat;
        background-position:center center;
        padding: 20px 0;
    }
    
}
</style>