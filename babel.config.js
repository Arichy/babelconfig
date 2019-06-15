const presets = require('./presets')
const plugins = require('./plugins')

module.exports = api => {
    api.cache.never()

    return { presets, plugins }
}