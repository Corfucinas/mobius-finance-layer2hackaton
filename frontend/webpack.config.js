module.exports = {
    init () {},

    rules: [{
        test: /\.less$/,
        use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'less-loader',
            }
        ]
    }],

    devtool: 'inline-source-map'
}
