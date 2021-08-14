const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const projectRoot = path.resolve(__dirname, '../');
const dirApp = path.join(projectRoot, 'app');
const dirAssets = path.join(projectRoot, 'assets');
const dirDist = path.join(projectRoot, 'dist');
const dirFinal = path.join(projectRoot, '../www/backend');

module.exports = (env, argv) => {
    // Is the current build a development build
    const isDev = (argv.mode === 'development');

    const imgPath = (isDev === true) ? '/src/' : '/./';
    const basePath = (isDev === true) ? '/' : '/backend/';
    const domainName = (isDev === true) ? 'loc.f3cms.com' : 'your.domain.name';

    let date = new Date();
    const tmplVersion = date.getFullYear() +'.'+ (date.getMonth()+1) +'.'+ date.getDate() +'.'+ date.getSeconds();

    let cfg = {
        entry: {
            bundle: path.join(dirApp, 'main')
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
                isDev: isDev,
                domainName: domainName,
                imgPath: imgPath
            }),

            new webpack.ProvidePlugin({
                // jQuery
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                localforage: 'localforage',
                _: 'lodash',
                moment: 'moment',
            }),

            new CopyWebpackPlugin({patterns: [
                {
                    from: path.join(dirAssets, 'images'),
                    to: path.join(dirDist, ((isDev === true) ? '' : '/assets') + '/images')
                },
                {
                    from: path.join(dirApp, 'tmpls'),
                    to: path.join(dirDist, '/app/tmpls')
                }
            ]}),

            new HtmlWebpackPlugin({
                template: path.join(projectRoot, 'src/index.ejs'),
                filename: 'index.html',
                title: 'Gene Panel v2',
                version: tmplVersion,
                domain: domainName,
                basePath: basePath
            }),

            new webpack.LoaderOptionsPlugin({
                test: /\.ejs$/,
                options: {
                    'ejs-compiled-loader': {
                        'htmlmin': true,
                    }
                }
            }),

            new webpack.IgnorePlugin({
              resourceRegExp: /^\.\/locale$/,
              contextRegExp: /moment$/,
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
                        compact: false
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
                                sourceMap: isDev
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
                                sourceMap: isDev
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDev,
                                implementation: require('sass'),
                                sassOptions: {
                                    includePaths: [dirAssets]
                                }
                            }
                        }
                    ]
                },

                {
                    test: /\.ejs$/,
                    loader: 'ejs-compiled-loader'
                },

                {
                    test: /\.html$/,
                    loader: 'mustache-loader'
                    // loader: 'mustache-loader?minify'
                    // loader: 'mustache-loader?{ minify: { removeComments: false } }'
                    // loader: 'mustache-loader?noShortcut'
                },

                // IMAGES
                {
                    test: /\.(jpe*g|png|gif)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: '[path][name].[ext]'
                   }
                }
            ]
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
        }
    };

    if (isDev === true) {
        cfg.devtool = 'eval';
        // cfg.devtool = 'inline-source-map';

        cfg.mode = 'development';

        cfg.devServer = {
            host: 'loc.f3cms.com',
            allowedHosts: ['.loc.f3cms.com'],
            open: true,
            https: {
                key: fs.readFileSync('./build/letsencrypt/loc.f3cms.com+1-key.pem'),
                cert: fs.readFileSync('./build/letsencrypt/loc.f3cms.com+1.pem')
            },
            port: 8008
        };

        cfg.output = {
            pathinfo: true,
            publicPath: '/',
            filename: '[name].js'
        };

    } else {

        cfg.devtool = 'cheap-module-source-map';
        // cfg.devtool = 'inline-source-map';

        cfg.mode = 'production';

        cfg.plugins.push(
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['dist']
            })
        );

        cfg.plugins.push(
            new BundleAnalyzerPlugin()
        );

        cfg.plugins.push(
            new FileManagerPlugin({
                events: {
                    onEnd: {
                        delete: [{
                            source: dirFinal,
                            options: {
                                force: true,
                            },
                        }],
                        move: [{
                            source: dirDist,
                            destination: dirFinal
                        }]
                    }
                }
            })
        );

        cfg.output = {
            path: dirDist,
            filename: 'js/[name].js?v=[fullhash]'
        };
    }
    return cfg;
};
