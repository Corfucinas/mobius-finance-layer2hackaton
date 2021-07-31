import { ethers } from 'ethers';

export const bignumberFormart = (value, wei) => {
    let res = ethers.BigNumber.from(value).mul(ethers.BigNumber.from(10).pow(wei))
    return res
}

export const getGasPrice = () => {
    let fastPrice = localStorage.getItem('fastPrice')
    let res = bignumberFormart(fastPrice, 9)
    return res
}

export const bigNumberToNumber = (bigNumberValue) => {
    let val = ethers.utils.formatEther(bigNumberValue)
    return parseFloat(val)
}