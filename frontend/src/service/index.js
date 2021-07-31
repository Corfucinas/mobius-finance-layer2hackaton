import { post, get } from './api'

export const getVolumeData = async (params) => {
    let res = await post('https://api.thegraph.com/subgraphs/name/mobiusfinance/mobiusmumbai', params)
    return res
}

export const getTransactionsData = async (params) => {
    let res = await post('https://api.thegraph.com/subgraphs/name/mobiusfinance/mobiusmumbai', params)
    return res
}

export const getHistoryData = async (params) => {
    let res = await post('https://api.thegraph.com/subgraphs/name/mobiusfinance/mobiusmumbai', params)
    return res
}

export const getKChartData = async (params) => {
    let res = await post('https://api.thegraph.com/subgraphs/name/openpredict/chainlink-prices-subgraph', params)
    return res
}

export const getGasPriceAndBlock = async (params) => {
    let res = await get('https://gasstation-mumbai.matic.today', params)
    return res
}