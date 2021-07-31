<template>
    <div class="components-shorting-openPosition">
        <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="tableChange" :loading="loading" rowKey="key">
            <span slot="value" slot-scope="row"> 
                <a-statistic :value="row | formerAccuracy" :precision="4" />
            </span>
        </a-table>
    </div>
</template>

<script>
import { getHistoryData } from '@/service'

export default {
    data () {
        return {
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
                    title: 'type',
                    dataIndex: 'type',
                    key: 'type'
                },
                {
                    title: 'value',
                    dataIndex: 'value',
                    key: 'value',
                    scopedSlots: { customRender: 'value' },
                },
                {
                    title: 'DateTime',
                    dataIndex: 'time',
                    key: 'time'
                },
                {
                    title: 'option',
                    dataIndex: 'option',
                    key: 'option'
                }
            ],
            loading: false,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0,
                showTotal: total => `${total} Information`
            },
            account: this.$store.state.account,
        }
    },

    created () {
        this.initData()
    },

    methods: {
        async initData () {
            this.loading = true
            this.dataList = []
            let params = {
                "query": `{operationEntities(first: 1000,where:{addr: "${this.account}"},orderBy:time,orderDirection:desc) {op,type,value,time}}`
            }
            let res = await getHistoryData(params)
            if (res && res.data && res.data.operationEntities) {
                if (res.data.operationEntities.length) {
                    res.data.operationEntities.forEach((item, index) => {
                        this.dataList.push({
                            key: index,
                            type: item.type,
                            option: item.op,
                            time: this.timestampToTime(item.time),
                            value: this.$ethers.utils.formatEther(item.value)
                        })
                    })
                }
            }
            this.loading = false
        },

        timestampToTime(timestamp) {
            var date = new Date(timestamp * 1000);
            var Y = date.getFullYear() + '-';
            var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
            var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
            var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
            var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
            var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
            return Y+M+D+h+m+s;
        },

        tableChange (pagination) {
            this.pagination.current = pagination.current;
            this.pagination.pageSize = pagination.pageSize;
            this.getTableList();
        }
    }
}
</script>

<style lang="less" scoped>
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
}
</style>