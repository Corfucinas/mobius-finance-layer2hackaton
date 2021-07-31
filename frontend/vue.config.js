const webpack = require('./webpack.config')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const px2rem = require('postcss-px2rem')

const postcss = px2rem({
    remUnit: 16
})

module.exports = {
    productionSourceMap: false,

    publicPath: './',

    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            config.plugins.push(
                new UglifyJsPlugin({
                    uglifyOptions: {
                        compress: {
                            drop_console: true,
                            pure_funcs: ['console.log']
                        },
                        parallel: true
                    },
                }),
            )
        }
    },

    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true,
            },
            postcss: {
                plugins: [
                    postcss
                ]
            }
        },
    },

    devServer: {
        proxy: {
            '/api': {
                target: 'localhost',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}