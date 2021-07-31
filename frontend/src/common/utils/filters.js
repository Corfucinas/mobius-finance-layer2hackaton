import Vue from 'vue'

Vue.filter('formerAccuracy', (value) => {
    if (!value) return 0
    let data = parseFloat(value)
    if (data < 0.000001 && data > 0) {
        data = 0
    }
    return data
})

export const toFixedVal = (value) => {
    if (!value) return ''
    let val = parseFloat(value)
    let data = Math.floor(val * 10000) / 10000
    if (data < 0.0001) {
        data = 0.0000
    }
    return parseFloat(data)
}