import { ethers } from 'ethers';
import { notification } from 'ant-design-vue'
import $store from '@/store'
import CsInstallTipModal from '@/components/plugins/CsInstallTipModal/index'
const CsInstallTipModalInstance = CsInstallTipModal.install
const ethereum = window.ethereum

export default class providers {
    constructor () {
        if (this.isMetaMaskProvider()) {
            this.providerInstance = new ethers.providers.Web3Provider(ethereum)
            this.initEvent()
        }
    }

    initEvent () {
        // this.providerInstance.on('error', (error) => {
        //     console.log('error===', error.message)
        //     if (error) {
        //         notification['error']({
        //             message: 'Tip',
        //             description: error.message
        //         })
        //     }
        // })

        ethereum.on('accountsChanged', function (accounts) {
            console.log('accounts==', accounts)
            window.location.reload()
        });

        ethereum.on('chainChanged', () => {
            window.location.reload()
        })
    }

    initListenAccount (account) {
        this.providerInstance.on(account, function (balance) {
            console.log('change balance==', balance)
        });
    }

    isMetaMaskProvider () {
        if (typeof ethereum !== 'undefined') {
            console.log('MetaMask is installed!')
            return true
        } else {
            console.log('MetaMask not installed!')
            return false
        }
    }

    async checkLocalMetaMask () {
        if (this.isMetaMaskProvider()) {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts && accounts.length > 0) {
                    const account = accounts[0]
                    this.addEthereumChain(account)
                    // $store.state.account = account
                } else {
                    return ''
                }
            } catch (error) {
                notification['error']({
                    message: 'Tip',
                    description: error.message,
                });
                return ''
            }
        } else {
            CsInstallTipModalInstance({ 
                isShow: true,
                cancel: () => {
                    return ''
                },
                confirm: () => {
                }
            })
        }
    }

    async addEthereumChain (account) {
        try {
            let res = await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13881' }], // 80001
            })
            if (res === null) { // successful
                $store.state.account = account
            }
        } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (error.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            { 
                                chainId: '0x13881',
                                chainName: 'Mumbai Testnet',
                                blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com/'],
                                rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
                                nativeCurrency: {
                                    name: 'MATIC',
                                    symbol: 'MATIC',
                                    decimals: 18
                                }
                            }
                        ]
                    })
                } catch (addError) {
                    // handle "add" error
                    notification['error']({
                        message: 'Tip',
                        description: addError.message,
                    })
                }
            }
        }
    }

    async listenTradeStatus (hash, assetsList = []) {
        return new Promise((resolve, reject) => {
            try {
                this.providerInstance.once(hash, async (transaction) => {
                    let assetsBalanceList = await $store.dispatch("setAssetsBalance", assetsList)
                    console.log('assetsBalanceList==', assetsBalanceList)
                    resolve(transaction)
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}