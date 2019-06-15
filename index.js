module.exports = {
    babel: {
        presets: require('./presets'),
        plugins: require('./plugins')
    },
    webpack: require('./createWebpackConfig').createCommon({})
}