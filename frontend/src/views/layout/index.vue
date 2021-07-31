<template>
    <a-layout class="body-content">
        <!-- <drawer v-if="isPhone" /> -->
        <siderMenu v-if="!isPhone" ref="sliderRef" />
       
        <a-layout-content ref="mainContent" class="main-content">
            <a-layout-header><app-header :titleName="titleName" @debtClick="debtClick" /></a-layout-header>

            <a-layout-content class="right-content">
                <grid-top v-if="!isPhone && ['dashboard', 'earn'].includes(titleName)" />
                <!-- <phone-top v-if="isPhone && ['dashboard', 'earn', 'wallet'].includes(titleName)" /> -->
                <grid-total v-if="!isPhone && ['dashboard', 'mintBurn', 'trade', 'debtManagement'].includes(titleName)" />

                <keep-alive include="Shorting">
                    <router-view />
                </keep-alive>
            </a-layout-content>
        </a-layout-content>

        <div class="accept-bottom" v-if="!isAccept">
            <a class="link" target="_blank" href="https://docs.google.com/document/d/1K1hTpxTIgcJp8Qcv-wojvGVmltkG7BH3nayEY4AtDQs/edit?usp=sharing">
                Acceptance of Rules: By using this website, You have affirmatively reviewed, accepted, and agreed to all of the Terms and Conditions.
            </a>
            <a-button class="but" @click="acceptClick">Accept</a-button>
        </div>
    </a-layout>
</template>

<script>
import siderMenu from './siderMenu'
// import drawer from './drawer'
import appHeader from '@/components/global/app-header.vue'
import gridTop from '@/components/global/grid-top.vue'
import gridTotal from '@/components/global/grid-total.vue'
// import phoneTop from '@/components/global/phone-top.vue'
import { getGasPriceAndBlock } from '@/service'

export default {
    components: {
        'app-header': appHeader,
        'grid-top': gridTop,
        'grid-total': gridTotal,
        // 'phone-top': phoneTop,
        siderMenu,
        // drawer
    },

    data() {
        return {
            titleName: 'dashboard',
            isPhone: false,
            isAccept: localStorage.getItem('accept')
        }
    },

    created () {
        let key = this.$route.path
        this.$Provider.checkLocalMetaMask()
        this.getGasPriceAndBlockData()
        this.getDeviceType()
        this.initTitle(key)
    },

    watch: {
        '$route.path': {
            handler (newVal, oldVal) {
                if (newVal != oldVal) {
                    this.$Provider.checkLocalMetaMask()
                    this.initTitle(newVal)
                }
            }
        },

        // '$store.state.account' (val) {
        //     if (val) {
        //         this.$store.dispatch("setAssetsBalance")
        //     }
        // }
    },

    methods: {
        initTitle (key) {
            switch (key) {
                case '/home/dashboard':
                    this.titleName = 'dashboard' // dashboard
                break;

                case '/home/mint':
                    this.titleName = 'mintBurn' // Mint & Burn
                break;

                case '/home/trade':
                    this.titleName = 'trade' // Trade
                break;

                case '/home/stake':
                    this.titleName = 'earn' // Stake
                break;

                case '/home/wallet':
                    this.titleName = 'wallet' // Wallet network
                break;

                case '/home/debt':
                    this.titleName = 'debtManagement' // Wallet
                break;

                 case '/home/shorting':
                    this.titleName = 'shorting' // Wallet
                break;
            }
            window.scrollTo(0, 0)
        },

        getDeviceType () {
            if ((navigator.userAgent.match(/(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i))) {
                this.isPhone = true
            } else {
                this.isPhone =  false
            }
        },

        async getGasPriceAndBlockData () {
            let blockInfo = await getGasPriceAndBlock()
            localStorage.setItem('fastPrice', blockInfo.fast)
        },

        debtClick (key) {
            this.$refs.sliderRef.handleClick(key)
        },

        acceptClick () {
            this.isAccept = true
            localStorage.setItem('accept', true)
        }
    }
};
</script>

<style lang="less" scoped>
/deep/ .ant-layout {
    background: #fff;
    padding: 0 40px;
}

/deep/ .ant-layout-sider {
    background: #F6F7FB;
    text-align: center;
}

/deep/ .ant-menu-dark, .ant-menu-dark .ant-menu-sub {
    background: #F6F7FB;
}

/deep/ .ant-layout-content {
    padding-top: 90px;
    background: #fff;
}

/deep/ .ant-layout-header {
    background: #fff;
    position: fixed;
    height: 80px;
    line-height: 80px;
    margin: 0;
    padding-left: 340px;
    padding-right: 40px;
    z-index: 999;
    width: 100%;
    left: 0;
    top: 0;
    right: 0;
}

.body-content {
    background: #fff;
    
    .left-menu {
        position: relative;
        overflow: auto;
        height: 100vh;
        position: fixed;
        left: 0;
        z-index: 9999;
        width: 300px !important;
        max-width: 300px !important;
        min-width: 300px !important;
        .logo-menu {
            display: flex;
            align-items: center;
            text-align: center;
            justify-content: center;
            height: 60px;
            line-height: 60px;
            .logo {
                height: 60px;
            }
            .logo-text {
                color: #37373C;
                font-size: 24px;
                font-family: Copperplate-Bold, Copperplate;
                font-weight: bold;
                margin-left: 15px;
            }
        }

        .menu-item {
            display: flex;
            align-items: center;
            text-align: left;
            .row-item {
                display: flex;
                align-items: center;
                width: 248px;
                height: 48px;
                line-height: 48px;
                text-align: left;
                padding-left: 60px;
                border-radius: 4px;
                .nav-text {
                    font-size: 16px;
                    font-family: DINPro-Regular, DINPro;
                    font-weight: 400;
                    margin-left: 10px;
                }

                .icon {
                    font-size: 24px;
                    color: #37373C;
                }

                img {
                    width: 24px;
                }

                .active {
                    color: #3C367C;
                    font-weight: bold;
                }
                .active-text {
                    color: #3C367C;
                    font-weight: bold;
                }
            }
            .active {
                background: rgba(206, 118, 255, .16);
            }
        }

        .bottom-content {
            position: absolute;
            width: 270px;
            bottom: 20px;
            margin: 0 auto;
            left: 50%;
            transform: translateX(-50%);
            background-image: url(../../assets/img/left-bg.png);
            background-repeat:no-repeat;
            background-position:center center;
            height: 380px;
            padding-top: 200px;
            .bottom-menu {
                width: 248px;
                text-align: left;
                padding-left: 60px;
                .item {
                    height: 40px;
                    line-height: 40px;
                    span {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                    }
                }
            }
        }
    }

    .main-content {
        margin-left: 300px;
        padding: 0 40px;
        height: 100vh;
        .right-content {
            padding-top: 100px;
            height: 100vh;
        } 
    }

    .accept-bottom {
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 0;
        height: 70px;
        line-height: 70px;
        background: #f8f8f8;
        width: 100%;
        z-index: 999999;
        padding: 0 80px;
        .link {
            flex: 1;
            text-align: center;
            color: #37373C;
            font-size: 20px;
            font-family: DINPro-Regular, DINPro;
            text-decoration: underline;
        }
        .but {
            width: 110px;
            text-align: center;
            margin: 0;
        }
    }
}

@media screen and (max-width: 750px) {
    /deep/ .ant-layout-header {
        background: #fff;
        position: relative;
        height: 80px;
        line-height: 80px;
        margin: 0;
        padding: 0;
        z-index: 0;
    }

    /deep/ .ant-layout-content {
        background: #fff;
    }

    /deep/ .ant-drawer-body {
        padding: 0;
        height: calc(100vh - 60px);
        background: #F6F7FB;
    }

    .ant-menu-inline > .ant-menu-item {
        height: 40px;
        line-height: 40px;
    }

    .body-content {
        background: #fff;
        .left-menu {
            position: relative;
            overflow: auto;
            height: 100vh;
            position: fixed;
            left: 0;
            z-index: 9999;
            width: 300px !important;
            max-width: 300px !important;
            min-width: 300px !important;
            .logo-menu {
                display: flex;
                align-items: center;
                text-align: center;
                justify-content: center;
                height: 60px;
                line-height: 60px;
                .logo {
                    height: 30px;
                }
                .logo-text {
                    color: #37373C;
                    font-size: 24px;
                    font-family: Copperplate-Bold, Copperplate;
                    font-weight: bold;
                    margin-left: 15px;
                }
            }

            .menu-item {
                display: flex;
                align-items: center;
                text-align: left;
                .row-item {
                    width: 248px;
                    height: 48px;
                    line-height: 48px;
                    text-align: left;
                    padding-left: 60px;
                    border-radius: 4px;
                    .nav-text {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        margin-left: 10px;
                    }

                    .icon {
                        font-size: 24px;
                        color: #37373C;
                    }

                    .active {
                        color: #3C367C;
                    }
                    .active-text {
                        color: #3C367C;
                        font-weight: bold;
                    }
                }
                .active {
                    background: rgba(206, 118, 255, .16);
                }
            }

            .bottom-content {
                position: absolute;
                width: 270px;
                bottom: 20px;
                margin: 0 auto;
                left: 50%;
                transform: translateX(-50%);
                background-image: url(../../assets/img/left-bg.png);
                background-repeat:no-repeat;
                background-position:center center;
                height: 380px;
                padding-top: 200px;
                .bottom-menu {
                    width: 248px;
                    text-align: left;
                    padding-left: 60px;
                    .item {
                        height: 40px;
                        line-height: 40px;
                        span {
                            font-size: 16px;
                            font-family: DINPro-Regular, DINPro;
                            font-weight: 400;
                            color: #37373C;
                        }
                    }
                }
            }
        }

        .main-content {
            margin: 0;
            padding: 0 10px;
            margin-top: 44px;
            background: #fff;
            height: 100%;
            overflow-y: scroll;
            .right-content {
                padding: 0;
            }
        }

        .accept-bottom {
            display: none;
        }
    }
}
</style>