const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const _ = require('lodash')

/**
 * 
 * @param {Array} modules 要构建的模块数组
 * @desc    生成webpack.entry配置 
 */
function getEntry(modules) {
    return modules.reduce((result, module) => {
        return {
            ...result,
            [module.name]: module.entry
        }
    }, {})
}

function getExposeLoader(exposes) {
    return exposes.map((expose) => {
        return {
            test: require.resolve(expose.module),
            use: _.map(_.toArray(_.get(expose, 'name', [])), (name) => {
                return {
                    loader: 'expose-loader',
                    options: name
                }
            })
        }
    })
}
/**
 * 
 * @param {Array} exposes 要暴露的全局变量数组，格式为{name:'lodash',module:'_'}
 * @desc    生成webpack.ProvidePlugin的选项，暴露全局变量
 */
function getProvidePlugin(exposes) {
    return _.reduce(exposes, (result, expose) => {

        return {
            ...result,
            ..._.reduce(_.toArray(expose.name), (result, name) => {
                return {
                    ...result,
                    [name]: expose.module
                }
            }, {})
        }
    }, {})
}

/**
 * 
 * @param {Array} modules htmlwebpackplugin处理的数组
 * @desc    module需要title、filename、chunks、template
 */
function getHtmlWebpackPlugin(modules) {
    return modules.reduce((result, module) => {
        return [
            ...result,
            new HtmlWebpackPlugin({
                title: module.title,
                filename: module.filename,
                chunks: module.chunks,
                template: module.template,
                inject: true
            })
        ]
    }, [])
}

/**
 * 
 * @desc    生成公共配置
 */
function createCommon({ modules, exposes }) {
    return {
        entry: getEntry(modules),
        output: {
            path: resolve(process.cwd(), 'build'),
            filename: 'web/release/[name]/index.[chunkhash].js',
            chunkFilename: 'web/release/[name]/[name].[chunkhash].js',
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/i,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.(png|jpe?g|svg)$/i,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 1024 * 4,
                            outputPath: 'web/imgs',
                            publicPath: '/web/imgs'
                            // name:''
                        }
                    }]
                },
                {
                    test: /\.(ttf|eot|svg|woff|woff2)$/i,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 4 * 1024,
                            outputPath: 'web/fonts',
                            publicPath: '/web/fonts'
                        }
                    }

                }
                // ...getExposeLoader(exposes)
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx', '.scss', '.sass', '.css']
        },

        plugins: [
            ...getHtmlWebpackPlugin(modules),

            new webpack.ProvidePlugin({
                _: 'lodash',
                ...getProvidePlugin(exposes),
            })
        ],

        optimization: {
            splitChunks: {
                chunks: 'initial',
                cacheGroups: {
                    vendors: {
                        test: /node_modules/,
                        name: 'vendors',
                        priority: 10
                    },
                    // common: {
                    //     name: (module, chunks, key) => key
                    // }
                }
            }
        }
    }
}

/**
 * 
 * @desc 生成开发环境配置
 */
function createDev({ modules, exposes, contentBase }) {
    return merge(createCommon({ modules, exposes }), {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            port: 3000,
            contentBase
        },
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css'
            })
        ]
    })
}

/**
 * 
 * @desc 生成生产环境配置
 */
function createProd({ modules, exposes, publicPath }) {
    return merge(createCommon({ modules, exposes }), {
        mode: 'production',

        plugins: [
            new CleanWebpackPlugin,
            new MiniCssExtractPlugin({
                filename: 'web/release/[name]/index.[contenthash].css'
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        },
    })
}

module.exports = {
    createCommon,
    createDev,
    createProd
}