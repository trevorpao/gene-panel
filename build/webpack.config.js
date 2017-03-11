const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const projectRoot = path.resolve(__dirname, '../');

const dirApp = path.join(projectRoot, 'app');
const dirAssets = path.join(projectRoot, 'assets');

// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'dev');

module.exports = {
    entry: {
        vendor: [
            'jquery',
            // 'lodash'
        ],
        bundle: path.join(dirApp, 'index')
    },
    resolve: {
        modules: [
            'node_modules',
            dirAssets,
            dirApp
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV
        }),

        new webpack.ProvidePlugin({
            // jQuery
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'root.jQuery': 'jquery',

            // lodash
            // '_': 'lodash'
        }),

        new HtmlWebpackPlugin({
            template: path.join(projectRoot, 'src/index.ejs'),
            title: 'GeneJs Panel'
        })
    ],
    module: {
        rules: [
            // BABEL
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules)/,
                options: {
                    compact: true
                }
            },

            // STYLES
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: IS_DEV
                        }
                    },
                ]
            },

            // CSS / SASS
            {
                test: /\.scss/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: IS_DEV
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: IS_DEV,
                            includePaths: [dirAssets]
                        }
                    }
                ]
            },

            // EJS
            {
                test: /\.ejs$/,
                loader: 'ejs-loader'
            },

            // IMAGES
            {
                test: /\.(jpe*g|png|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            }
        ]
    }
};
