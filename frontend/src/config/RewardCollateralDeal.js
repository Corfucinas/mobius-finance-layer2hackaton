export const allAssetsList = [
    'DAI',
    'ETH',
    'MATIC',
    'MOT',
    'moBTC',
    'moETH',
    'moTSLA',
    'moUSD',
    'moXAU'
]

export const stateList = [
    { pid: 0, fromCoinName: 'ETH', toCoinName: 'moUSD', apr: '20%' },
    { pid: 1, fromCoinName: 'DAI', toCoinName: 'moUSD', apr: '10%' },
    { pid: 2, fromCoinName: 'MOT', toCoinName: 'moUSD', apr: '30%' },
    { pid: 3, fromCoinName: 'MATIC', toCoinName: 'moUSD', apr: '30%' },
]

export const AssetsList = [
    { coinName: 'DAI', shortName: 'Dai' },
    { coinName: 'ETH', shortName: 'Ether' },
    { coinName: 'MATIC', shortName: 'Polygon' },
    { coinName: 'MOT', shortName: 'Mobius Token' }
]

export const syntheticAssets = [
    { coinName: 'moBTC', shortName: '', id: 1 },
    { coinName: 'moETH', shortName: '', id: 2 },
    { coinName: 'moTSLA', shortName: '', id: 4 },
    { coinName: 'moXAU', shortName: '', id: 5 },
]

export const kChartDataList = {
    moTSLA: 'TSLA',
    moBTC: 'BTC',
    moETH: 'ETH',
    moXAU: 'XAU'
}

export const moAssetsTradingRewards = [
    { coinName: 'moBTC', assets: 'moUSD', pid: 1, multiplier: '', shortName: 'Bitcoin' },
    { coinName: 'moETH', assets: 'moUSD', pid: 2, multiplier: '', shortName: 'moETH' },
    { coinName: 'moTSLA', assets: 'moUSD', pid: 0, multiplier: '', shortName: 'Tesla, Inc.' },
    { coinName: 'moXAU', assets: 'moUSD', pid: 3, multiplier: '', shortName: 'Gold Ounce' },
]

export const moAssets = [
    { coinName: 'moBTC', shortName: 'Bitcoin', id: 1, tip: 'Tracks the price of Bitcoin (BTC)' },
    { coinName: 'moETH', shortName: 'moETH', id: 2, tip: 'Tracks the price of Ethereum (ETH)' },
    { coinName: 'moUSD', shortName: 'Mobius Dollar', id: 3, tip: 'The settlement currency of Mobius finance' },
    { coinName: 'moTSLA', shortName: 'Tesla, Inc.', id: 4, tip: 'Tracks the price of Tesla, Inc. (TSLA) stock ' },
    { coinName: 'moXAU', shortName: 'Gold Ounce', id: 5, tip: 'Tracks the price of Gold Ounce.' },
]

export const AssetsHotList = [
    { coinName: 'DAI', shortName: 'Dai' },
    { coinName: 'ETH', shortName: 'Ether' },
    { coinName: 'MOT', shortName: 'Mobius.finance' }
]

export const moHotAssets = [
    { coinName: 'moBTC', shortName: '' },
    { coinName: 'moETH', shortName: '' },
    { coinName: 'moTSLA', shortName: '' }
]