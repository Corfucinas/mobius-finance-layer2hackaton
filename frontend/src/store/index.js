import Vue from 'vue'
import Vuex from 'vuex'
import { allAssetsList } from '@/config/RewardCollateralDeal'
import { getAssetsBalance } from '@/config/ContractMethods'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        account: '',
        motBalance: 0,
        assetsBalance: {
            'ETH': {
                balance: 0,
                maxBalance: 0
            },
            'DAI': {
                balance: 0,
                maxBalance: 0
            },
            'MATIC': {
                balance: 0,
                maxBalance: 0
            },
            'MOT': {
                balance: 0,
                maxBalance: 0
            },
            'moUSD': {
                balance: 0,
                maxBalance: 0
            },
            'moTSLA': {
                balance: 0,
                maxBalance: 0
            },
            'moBTC': {
                balance: 0,
                maxBalance: 0
            },
            'moETH': {
                balance: 0,
                maxBalance: 0
            },
            'moXAU': {
                balance: 0,
                maxBalance: 0
            }
        }
    },

    // this.$store.commit("xxx")
    mutations: {
        setAccount (state, params) {
            state.account = params
        },

        setMotBalance (state, params) {
            state.motBalance = params.balance
        },

        setAssetsBalanceMutation (state, params) {
            let keys = Object.keys(params)
            if (keys && keys.length) {
                keys.forEach((key) => {
                    let { balance, maxBalance } = params[key]
                    state.assetsBalance[key].balance = balance
                    state.assetsBalance[key].maxBalance = maxBalance
                })
            }
            console.log('assets Balance===', JSON.stringify(state.assetsBalance))
        }
    },

    // this.$store.dispatch("xxx") 
    actions: {
        async setAssetsBalance ({ commit, state }, assetsList = allAssetsList ) {
            let obj = {}
            if (assetsList && assetsList.length) {
                for (let i = 0; i < assetsList.length; i++) {
                    let name = assetsList[i]
                    let { balance, maxBalance } = await getAssetsBalance(name, state.account)
                    obj[name] = {}
                    obj[name].balance = balance
                    obj[name].maxBalance = maxBalance
                }
            }
            commit('setAssetsBalanceMutation', obj)
            return obj
        }
    },

    getters: {
        getAccount (state) {
            return state.account
        },

        getMotBalance (state) {
            return state.motBalance
        },

        messArray_get: state => state.assetsBalance
    },

    modules: {
    }
})

export default store