/**
 * 开发环境配置
 */

import { resolve } from 'path'
import merge from 'webpack-merge'
import common from './common'

export default merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        port: 3000,
    }
})