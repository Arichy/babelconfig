/**
 * 公共配置
 */

import { resolve } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

// modules = [{name:'index',entry:'./src/index/index.jsx'}]

export function getEntry(modules) {
    modules.reduce((result, module) => {
        return {
            ...result,
            [module.name]: module.entry
        }
    }, {})
}

export default {
    entry: {}
}