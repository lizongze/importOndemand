/* eslint-disable */
const path = require('path');
const webpack = require('webpack');

const isPrd = process.env.NODE_ENV === 'production';

const plugins = [];

if (isPrd) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true,
            output: {
                comments: false
            }
        })
    );
}

plugins.push(
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    })
);

 module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: isPrd ? 'index.min.js' : 'index.js',
        library: 'babel-plugin-import-demand',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    externals: {
        assert: {
            root: 'assert',
            commonjs2: 'assert',
            commonjs: 'assert',
            amd: 'assert'
        },
    },
    devtool: 'cheap-source-map',
    plugins: plugins
 };
