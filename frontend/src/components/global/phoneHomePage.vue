<template>
    <div class="phone-home-page">
        <img class="logo" src="../../assets/img/mobius-logo.png" />
        <p class="title">Möbius coming soon!</p>
        <p class="tip">Mobius Finance mobile compatibility is coming soon!
        Please use a desktop browser to test Mobius Finance platform.
        </p>
        <p class="link">https://webapptest.mobius.finance/</p>
    </div>
</template>

<script>
export default {
    name: 'PhoneHomePage'
}
</script>


<style lang="less" scoped>
.phone-home-page {
    height: 100vh;
    margin: auto;
    padding: 30px;
    .logo {
        height: 120px;
    }
    .title {
        font-size: 22px;
        color: #37373C;
        font-family: DINPro-Medium, DINPro;
    }
    .tip {
        color: #999;
        font-size: 15px;
    }
    .link {
        color: #45458d;
        font-size: 15px;
    }
}
</style>