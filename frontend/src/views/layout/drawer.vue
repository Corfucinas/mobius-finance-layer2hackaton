<template>
    <div class="">
        <div class="app-headre-content">
            <a-icon style="font-size: 24px;" type="menu-fold" @click="visible = true" />
            <a target="_blank" class="logo-menu" href="https://mobius.finance/">
                <img class="logo" src="../../assets/img/mo-lo.png" />
            </a>
            <div></div>
            <!-- <a-icon style="font-size: 24px;" type="setting" /> -->
        </div>

        <a-drawer class="drawer-content" title="Mobius" placement="left" :closable="false" :visible="visible" @close="visible = !visible">
            <a-menu theme="dark" mode="inline" :default-selected-keys="['/home/dashboard']" @click="handleClick">
                <a-menu-item class="menu-item" style="display: flex; align-items: center;" key="/home/dashboard">
                    <div class="row-item" style="display: flex; align-items: center;" :class="{'active': key === '/home/dashboard'}">
                        <img class="menu-icon" :src="key === '/home/dashboard' ? require('../../assets/img/dashboard-sel.png') : require('../../assets/img/dashboard.png')" />
                        <span class="nav-text" :class="{'active-text': key === '/home/dashboard'}">{{$t('menu.dashboard')}}</span>
                    </div>
                </a-menu-item>

                <a-menu-item class="menu-item" key="/home/mint">
                    <div class="row-item" :class="{'active': key === '/home/mint'}">
                        <img class="menu-icon" :src="key === '/home/mint' || key === '/home/debt' ? require('../../assets/img/mint-burn-sel.png') : require('../../assets/img/mint-burn.png')" />
                        <span class="nav-text" :class="{'active-text': key === '/home/mint' || key === '/home/debt'}">{{$t('menu.mintBurn')}}</span>
                    </div>
                </a-menu-item>

                <a-menu-item class="menu-item" key="/home/trade">
                    <div class="row-item" :class="{'active': key === '/home/trade'}">
                        <img class="menu-icon" :src="key === '/home/trade' ? require('../../assets/img/trade-sel.png') : require('../../assets/img/trade.png')" />
                        <span class="nav-text" :class="{'active-text': key === '/home/trade'}">{{$t('menu.trade')}}</span>
                    </div>
                </a-menu-item>

                <a-menu-item class="menu-item" key="/home/shorting">
                    <div class="row-item" :class="{'active': key === '/home/shorting'}">
                        <img class="menu-icon" :src="key === '/home/shorting' ? require('../../assets/img/shor-selt.png') : require('../../assets/img/shortting.png')" />
                        <span class="nav-text" :class="{'active-text': key === '/home/shorting'}">{{$t('menu.shorting')}}</span>
                    </div>
                </a-menu-item>

                <a-menu-item class="menu-item" key="/home/stake">
                    <div class="row-item" :class="{'active': key === '/home/stake'}">
                        <img class="menu-icon" :src="key === '/home/stake' ? require('../../assets/img/stake-sel.png') : require('../../assets/img/stake.png')" />
                        <span class="nav-text" :class="{'active-text': key === '/home/stake'}">{{$t('menu.earn')}}</span>
                    </div>
                </a-menu-item>

                <a-menu-item class="menu-item" key="/home/wallet">
                    <div class="row-item" :class="{'active': key === '/home/wallet'}">
                        <img class="menu-icon" :src="key === '/home/wallet' ? require('../../assets/img/wallet-sel.png') : require('../../assets/img/wallet.png')" />
                        <span class="nav-text" :class="{'active-text': key === '/home/wallet'}">{{$t('menu.wallet')}}</span>
                    </div>
                </a-menu-item>

                <!-- <a-sub-menu class="sub-menu" style="padding-left: 20px;">
                    <span slot="title">
                        <img class="menu-icon" :src="key === '/home/wallet' || key === '/home/debt' ? require('../../assets/img/wallet-sel.png') : require('../../assets/img/wallet.png')" />    
                        <span class="child-menu" :class="key === '/home/wallet' || key === '/home/debt' ? 'active' : ''">{{$t('menu.wallet')}}</span>
                    </span>
                    <a-menu-item class="menu-item" key="/home/wallet">
                        <div class="row-item row-item-sub" :class="{'active': key === '/home/wallet'}">
                            <span class="nav-text" :class="{'active-text': key === '/home/wallet'}">{{$t('menu.balances')}}</span>
                        </div>
                    </a-menu-item>
                    <a-menu-item class="menu-item" key="/home/debt">
                        <div class="row-item row-item-sub" :class="{'active': key === '/home/debt'}">
                            <span class="nav-text" :class="{'active-text': key === '/home/debt'}">{{$t('menu.debtManagment')}}</span>
                        </div>
                    </a-menu-item>
                </a-sub-menu> -->
            </a-menu>

            <div class="bottom-content">
                <div class="bottom-menu">
                    <div class="item twitter-logo">
                        <a target="_blank" href="https://twitter.com/mobius_finance">
                            <img class="" src="../../assets/img/icon_wittter.png">
                            <span style="margin-left: 15px;">{{$t('menu.twitter')}}</span>
                        </a>
                    </div>

                    <div class="item tele-logo">
                        <a target="_blank" href="https://t.me/mobius_finance">
                            <img class="" src="../../assets/img/icon_faocebook.png" />
                            <span style="margin-left: 15px;">{{$t('menu.telegram')}}</span>
                        </a>
                    </div>

                    <div class="item in-logo">
                        <a target="_blank" href="https://www.linkedin.com/company/mobiusfinance">
                            <img class="" src="../../assets/img/icon_ins.png" />
                            <span style="margin-left: 15px;">{{$t('menu.linkedin')}}</span>
                        </a>
                    </div>
                    <div class="item medium">
                        <a target="_blank" href="https://medium.com/@mobiusfinance">
                            <img class="" src="../../assets/img/medium_gray.png" />
                            <span style="margin-left: 15px;">{{$t('menu.medium')}}</span>
                        </a>
                    </div>
                    <div class="item document">
                        <a target="_blank" href="https://docs.test.mobius.finance">
                            <a-icon class="icon" theme="filled" type="diff" />
                            <span style="margin-left: 15px;">{{$t('menu.documentation')}}</span>
                        </a>
                    </div>
                </div>
            </div>
        </a-drawer>
    </div>
</template>

<script>
export default {
    name: 'Drawer',

    data () {
        return {
            key: '/home/dashboard',
            titleName: 'dashboard',
            visible: false
        }
    },

    created () {
        this.key = this.$route.path
    },

    methods: {
        handleClick (e) {
            this.visible = false
            this.key = e.key
            this.$router.push({path: this.key}).catch(() => {})
        },
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-layout {
    background: #fff;
    padding: 0 40px;
}

/deep/ .ant-layout.ant-layout-has-sider {
    background: #fff;
}

/deep/ .ant-layout-sider {
    background: #F6F7FB;
    text-align: center;
}

/deep/ .ant-menu-dark, .ant-menu-dark .ant-menu-sub {
    background: #F6F7FB;
}

/deep/ .ant-menu-inline > .ant-menu-item {
    height: 60px;
    line-height: 60px;
}

/deep/ .ant-menu-submenu-title {
    height: 60px;
    line-height: 60px;
    color: #37373C;
    font-size: 16px;
    text-align: left;
    // padding-left: 50px !important;
}


/deep/ .ant-menu-submenu-title:hover {
    color: #3C367C !important;
    font-weight: bold;
}

/deep/ .ant-menu-dark .ant-menu-item {
    color: #37373C;
}

/deep/ .ant-menu-item:hover {
    font-weight: bold;
}

/deep/ .ant-menu.ant-menu-dark .ant-menu-item-selected {
    background-color: transparent; 
}

/deep/ .ant-menu-dark .ant-menu-item-selected .anticon + span {
    font-size: 16px;
    font-family: DINPro-Medium, DINPro;
    font-weight: 500;
    color: #3C367C;
}

/deep/.ant-menu-dark .ant-menu-inline.ant-menu-sub {
    background: #F6F7FB;
    color: #37373C;
    box-shadow:none;
}

/deep/ .ant-menu-submenu-active {
    color: #3C367C;
    font-weight: bold;
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

/deep/ .ant-layout-content {
    padding-top: 90px;
    background: #fff;
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

    .app-headre-content {
        position: fixed;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 44px;
        line-height: 44px;
        background: #fff;
        padding: 0 10px;
        box-shadow: 0px -1px 0px 0px #D9D8E7;
        border-bottom: 1px solid #D9D8E7;
        z-index: 9;
        .logo-menu {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .logo {
                height: 17px;
            }
            .logo-text {
                margin-left: 10px;
            }
        }
    }

    .drawer-content {
        .menu-item {
            display: flex;
            align-items: center;
            text-align: left;
            .row-item {
                display: flex;
                align-items: center;
                width: 200px;
                height: 48px;
                line-height: 48px;
                text-align: left;
                padding-left: 20px;
                border-radius: 4px;
                .menu-icon {
                    width: 20px;
                    margin-right: 15px;
                }

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

                .active-text {
                    color: #3C367C;
                    font-weight: bold;
                }
            }
            .active {
                background: rgba(206, 118, 255, .16);
            }
        }

        .row-item:hover {
            .nav-text {
                color: #3C367C;
                font-weight: bold;
            }
        }

        .row-item-sub {
            padding-left: 30px;
        }

        .sub-menu {
            .menu-icon {
                width: 20px;
                margin-right: 15px;
            }
            .child-menu {
                padding-left: 15px;
            }

            .child-menu:hover {
                font-weight: bold;
                color: #3C367C;
            }
            .active {
                font-weight: bold;
                color: #3C367C;
            }
        }

        .bottom-content {
            position: absolute;
            width: 230px;
            bottom: 20px;
            margin: 0 auto;
            left: 50%;
            transform: translateX(-50%);
            background-image: url(../../assets/img/left-bg.png);
            background-size:100% 100%;
            background-repeat:no-repeat;
            background-position:center center;
            height: 300px;
            padding-top: 120px;
            .bottom-menu {
                width: 220px;
                text-align: left;
                padding-left: 20px;
                .item {
                    height: 30px;
                    line-height: 30px;
                    margin-bottom: 6px;
                    span {
                        font-size: 16px;
                        font-family: DINPro-Regular, DINPro;
                        font-weight: 400;
                        color: #37373C;
                    }
                    img {
                        width: 20px;
                    }
                    .icon {
                        font-size: 20px;
                        color: #6A6972;
                    }
                }
                .medium:hover {
                    span {
                        color: #5a208b;
                        font-weight: bold;
                    }
                    img {
                        content: url('../../assets/img/medium-circle_selected.png');
                    }
                }
                .twitter-logo:hover {
                    span {
                        color: #5a208b;
                        font-weight: bold;
                    }
                    img {
                        content: url('../../assets/img/twitter-sel.png');
                    }
                }

                .in-logo:hover {
                    span {
                        color: #5a208b;
                        font-weight: bold;
                    }
                    img {
                        content: url('../../assets/img/in-sel.png');
                    }
                }

                .tele-logo:hover {
                    span {
                        color: #5a208b;
                        font-weight: bold;
                    }
                    img {
                        content: url('../../assets/img/tele-sel.png');
                    }
                }

                .document:hover {
                    span {
                        color: #5a208b;
                        font-weight: bold;
                    }
                    .icon {
                        color: #5a208b;
                    }
                }
            }
        }
    }
}
</style>