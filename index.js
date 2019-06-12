var path = require('path')

module.exports = function (api) {
    api.cache.never()

    var presets = ['@babel/preset-env']
    var plugins = [
        // ['module-resolver', {
        //     'alias': {
        //         '@src': path.resolve(__dirname, './src')
        //     }
        // }],
        ['@babel/plugin-proposal-decorators', {
            // decoratorsBeforeExport: true
            legacy: true
        }],
        ['@babel/plugin-proposal-class-properties', {
            loose: true
        }],
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-function-bind'
    ]

    return {
        presets: presets,
        plugins: plugins
    }
}