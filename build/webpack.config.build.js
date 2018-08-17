var path = require('path');
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var webpackConfig = require('./webpack.config');
var FileManagerPlugin = require('filemanager-webpack-plugin');

var targetProject = 'f3cms';

webpackConfig.devtool = 'cheap-module-source-map';
// webpackConfig.devtool = 'inline-source-map';

webpackConfig.mode = 'production';

webpackConfig.plugins.push(
    // new webpack.optimize.CommonsChunkPlugin({
    //     names: ['vendor', 'manifest']
    // })
    new webpack.optimize.SplitChunksPlugin({
        cacheGroups: {
            default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true
            },
            vendor: {
                chunks: 'initial',
                minChunks: 2,
                maxInitialRequests: 5,
                minSize: 0,
                name: 'vendor'
            },
            bundle: {
                name: 'bundle',
                chunks: 'initial',
                minChunks: Infinity
            }
        }
    }),

    new webpack.optimize.RuntimeChunkPlugin({
        name: 'bundle'
    }),

    new webpack.optimize.RuntimeChunkPlugin({
        name: 'vendor'
    }),

    new webpack.optimize.RuntimeChunkPlugin({
        name: 'manifest'
    })
);

webpackConfig.plugins.push(
    new FileManagerPlugin({
        onEnd: {
            delete: [
                path.join(__dirname, '../../www/'+ targetProject +'/backend')
            ],
            move: [
                {
                    source: path.join(__dirname, '../dist'),
                    destination: path.join(__dirname, '../../www/'+ targetProject +'/backend')
                }
            ]
        }
    })
);

webpackConfig.plugins.push(
    new CleanWebpackPlugin(['dist'])
);

webpackConfig.output = {
    path: path.join(__dirname, '../dist'),
    filename: 'js/[name].js'
};

module.exports = webpackConfig;
