import { ethers } from 'ethers';

export default class BaseContract {
    constructor (provider) {
        if (provider) {
            this.initWallet(provider)
        }
    }

    initWallet (provider) {
        this.active_WalletOrSigner = provider.getSigner()
    }

    createContract (contract_address, abi_data) {
        return new ethers.Contract( contract_address, abi_data, this.active_WalletOrSigner )
    }
}