<template>
    <a-modal class="componants-installTipModal" width="400px" :visible="isShow" title="Connect to a wallet" @cancel="handleCancel" footer='' >
        <div class="modal-content">
            <a class="" target="_blank" href="https://metamask.io/">
                <div class="wallet-item">
                    <span>Please install MetaMask!</span>
                    <img src="../../../assets/img/metamask-fox.svg" />
                </div>
            </a>
        </div>
    </a-modal>
</template>

<script>
export default {
    name: 'CSInstallTipModel',

    data () {
        return {
            isShow: false,
            cancel: function () {},
            confirm: function () {}
        }
    },

    methods: {
        handleCancel () {
            this.isShow = false
            this.cancel()
        },
    }
}
</script>

<style lang="less" scoped>
/deep/ .ant-modal-body {
    min-height: 150px;
    .wallet-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        line-height: 60px;
        border-radius: 8px;
        background: #F6F7FB;
        padding: 0 20px;
        font-size: 24px;
        color: #999;
        cursor: pointer;
    }
    .wallet-item:hover {
        opacity: .7;
     }
}

/deep/ .ant-modal-title {
    text-align: center;
    font-size: 32px;
}
.componants-installTipModal {
    .modal-content {
        margin-top:50px;
    }
}
</style>