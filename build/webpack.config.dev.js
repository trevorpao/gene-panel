var fs = require('fs');
var webpackConfig = require('./webpack.config');

// webpackConfig.devtool = 'eval';
webpackConfig.devtool = 'inline-source-map';

webpackConfig.mode = 'development';

webpackConfig.devServer = {
    host: 'f3cms.lo',
    allowedHosts: [
        '.f3cms.lo'
    ],
    https: {
        key: fs.readFileSync('./../conf/nginx/letsencrypt/loc.shopartner.co+9-key.pem'),
        cert: fs.readFileSync('./../conf/nginx/letsencrypt/loc.shopartner.co+9.pem')
    },
    port: 8008
};

webpackConfig.output = {
    pathinfo: true,
    publicPath: '/',
    filename: '[name].js'
};

module.exports = webpackConfig;
