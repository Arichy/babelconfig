const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const _ = require('lodash')

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
                    test: /\.jsx?$/,
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
                            publicPath:'/web/imgs'
                            // name:''
                        }
                    }]
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
                    commone: {
                        name: (module, chunks, key) => key
                    }
                }
            }
        }
    }
}

/**
 * 
 * @desc 开发环境配置
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
 * @desc 生产环境配置
 */
function createProd({ modules, exposes, publicPath }) {
    return merge(createCommon({ modules, exposes }), {
        mode: 'production',
        // output: {
            // publicPath:'./'
        // },
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