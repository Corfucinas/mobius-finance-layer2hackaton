<template>
    <div class="plugins-slider">
        <div class="slider-rail" id="sliderRailId" ref="sliderRailRef"></div>

        <div class="slider-disable" :style="{'width': formModel.sliderDisableWidth + 1 + 'px'}"></div>

        <div class="slider-track" id="sliderTrackId" :style="{'left': formModel.sliderDisableWidth + 'px'}"></div>

        <!-- 拖动按钮 -->
        <a-tooltip placement="top">
            <template slot="title">
            <span>{{formModel.tipValue}}%</span>
            </template>
            <div class="slider-docs" id="sliderDocsId" :style="{'left': formModel.sliderDocsDisableWidth + 'px'}"></div>
        </a-tooltip>
        
        <div class="slider-step">
            <span class="slider-dot" @click="dotClick(item.val)" v-for="(item, index) in marks" :key="index"></span>
        </div>

        <div class="slider-mark">
            <div class="mark-list">
                <span class="slider-mark-text" v-for="(i, index) in marks" :key="index">{{i.val}}%</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CsSlider',

    props: {
        minValue: {
            type: Number,
            default: 0
        },

        maxValue: {
            type: Number,
            default: 0
        },

        defaultValue: {
            type: Number,
            default: 0
        },

        safeValue: {
            type: Number,
            default: 0
        }
    },

    data () {
        return {
            formModel: {
                safeValue: 0,
                percent: '',
                parentClientWidth: 0,
                unitWidth: 0,
                sliderDisableWidth: 0,
                sliderTrackWidth: 0,
                tipValue: 0,
                unitLeftWidth: 0,
                sliderDocsDisableWidth: 0
            },
            marks: [
                {val: 0, txt: '0%'},
                {val: 0, txt: '20%'},
                {val: 0, txt: '40%'},
                {val: 0, txt: '60%'},
                {val: 0, txt: '80%'},
                {val: 0, txt: '100%'}
            ],
            isMouseDown: false
        }
    },

    watch: {
        maxValue: function () {
            this.initData()
        }
    },

    methods: {
        initData () {
            this.$nextTick(() => {
                if (this.$refs.sliderRailRef) {
                    let sliderTrackBox = document.getElementById('sliderTrackId')
                    let sliderDocsBox = document.getElementById('sliderDocsId')
                    this.parentClientWidth = this.$refs.sliderRailRef.clientWidth
                    this.formModel.unitLeftWidth = (this.parentClientWidth  - sliderDocsBox.offsetWidth) / 100
                    this.initEvent()
                    this.formModel.tipValue = this.defaultValue
                    this.formModel.sliderDisableWidth = (this.safeValue / this.minValue) * 10 * this.formModel.unitLeftWidth
                    this.formModel.sliderDocsDisableWidth = (this.defaultValue / this.minValue) * 10 * this.formModel.unitLeftWidth
                    sliderTrackBox.style.width = this.formModel.sliderDocsDisableWidth - this.formModel.sliderDisableWidth + 'px'
                    this.marks.forEach((item, index) => {
                        if (index === 0) {
                            item.val = this.minValue
                        } else {
                            item.val = this.minValue * index * 2
                        }
                    })
                }
            })
        },

        initEvent () {
            let that = this
            let sliderDocsBox = document.getElementById('sliderDocsId')
            let sliderTrackBox = document.getElementById('sliderTrackId')
            let sliderRailBox = document.getElementById('sliderRailId')
            let cha = this.parentClientWidth - sliderDocsBox.offsetWidth
            this.formModel.tipValue = this.safeValue
            sliderTrackBox.style.width = 0
            sliderDocsBox.onmousedown = function (ev) {
                let sliderDocsLeft = sliderDocsBox.offsetLeft
                let e = ev || window.event
                let mouseX = e.clientX
                that.isMouseDown = true
                window.onmousemove = function (ev) {
                    if (!that.isMouseDown) return false
                    let e = ev || window.event
                    let moveL = e.clientX - mouseX
                    let newL = sliderDocsLeft + moveL
                    if ( newL < that.formModel.sliderDisableWidth) {
                        newL = that.formModel.sliderDisableWidth
                    } else if ( newL >= cha) {
                        newL = cha
                    }
                    sliderDocsBox.style.left = newL + 'px'
                    sliderTrackBox.style.width = newL - that.formModel.sliderDisableWidth + 1 + 'px'
                    that.countTipVal(newL)
                }

                window.onmouseup = function () {
                    that.isMouseDown = false;
                    window.onmousemove = false
                    return false
                }
            }

            sliderRailBox.onclick = function (ev) {
                let left = ev.offsetX - sliderDocsBox.offsetWidth / 2
                if ( left < 0) {
                    left = 0
                }
                if ( left >= cha) {
                    left = cha
                }
                sliderDocsBox.style.left = left + 'px'
                sliderTrackBox.style.width = left - that.formModel.sliderDisableWidth + 1 + 'px'
                that.countTipVal(left)
            }

            sliderTrackBox.onclick = function (ev) {
                let left = ev.offsetX - sliderDocsBox.offsetWidth / 2
                if ( left < 0) {
                    left = 0
                }
                if ( left >= cha) {
                    left = cha
                }
                sliderDocsBox.style.left = left + that.formModel.sliderDisableWidth + 'px'
                sliderTrackBox.style.width = left + 1 + 'px'
                that.countTipVal(left + that.formModel.sliderDisableWidth)
            }
        },

        dotClick (val) {
            if (val >= this.safeValue) {
                let sliderTrackBox = document.getElementById('sliderTrackId')
                let sliderDocsBox = document.getElementById('sliderDocsId')
                this.formModel.tipValue = val
                let left = val / this.minValue * this.formModel.unitLeftWidth * 10
                sliderTrackBox.style.width = left - this.formModel.sliderDisableWidth + 1 + 'px'
                sliderDocsBox.style.left = left + 'px'
                this.$emit('sliderChange', { sliderVal: this.formModel.tipValue})
            }
        },

        countTipVal (left) {
            let beishu = left / this.formModel.unitLeftWidth
            let leftValue = parseInt(beishu * this.minValue / 10)
            if (leftValue >= this.safeValue) {
                this.formModel.tipValue = leftValue
            } else {
                this.formModel.tipValue = this.safeValue
            }
            this.$emit('sliderChange', { sliderVal: this.formModel.tipValue})
        },
    }
}
</script>

<style lang="less" scoped>
.plugins-slider {
    position: relative;
    width: 100%;
    padding: 30px 0;
    .slider-rail {
        position: absolute;
        width: 100%;
        height: 12px;
        border-radius: 7px;
        background-color: #f5f5f5;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        cursor: pointer;
    }

    .slider-disable {
        cursor: no-drop;
        position: absolute;
        background: #7F4BE0;
        opacity: .5;
        height: 12px;
        top: 0;
        bottom: 0;
        margin: auto 0;
        border-radius: 5px 0 0 5px;
    }

    .slider-track {
        position: absolute;
        cursor: pointer;
        background: #7F4BE0;
        height: 12px;
        top: 0;
        bottom: 0;
        left: 0;
        margin: auto 0;
    }

    .slider-docs {
        width: 30px;
        height: 30px;
        background: #fff;
        position: absolute;
        border: 7px solid #7F4BE0;
        bottom: 0;
        top: 0;
        left: 0;
        margin: auto 0;
        border-radius: 50%;
        cursor: pointer;
        z-index: 2;
        box-sizing: border-box;
    }

    .slider-docs:hover {
        opacity: .8;
        box-shadow: 0 0 0 4px rgb(252, 166,250);
    }

    .slider-step {
        display: flex;
        justify-content: space-between;
        width: 100%;
        background: transparent;
        .slider-dot {
            width: 20px;
            height: 20px;
            margin-left: 0;
            background-color: #fff;
            border: 4px solid #f5f5f5;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1;
        }
        .slider-dot:first-child {
            cursor: no-drop;
            border: 4px solid #bca8e0;
            background-color: #fff;
        }
    }

    .slider-mark {
        position: absolute;
        top: 70px;
        left: 0;
        width: 100%;
        font-size: 15px;
        .mark-list {
            display: flex;
            justify-content: space-between;
            .slider-mark-text {
                color: rgba(0, 0, 0, 0.45);
                text-align: center;
                word-break: keep-all;
                cursor: pointer;
            }
        }
    }
}
</style>
