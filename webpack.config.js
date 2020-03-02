const path = require('path'),
    webpack = require(`webpack`),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    { CleanWebpackPlugin } = require('clean-webpack-plugin'),
    imageminGifsicle = require('imagemin-gifsicle'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminSvgo = require('imagemin-svgo'),
    CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 100
    },
    entry: {
        App: './src/scripts/app.js'
    },
    output: {
        filename: './[name].bundle.js',
        path: path.resolve(__dirname, './docs'),
    },
    module: {
        rules: [
            // {
            //     test: /\.m?js$/,
            //     exclude: /(node_modules|bower_components)/,
            //     use: [
            //         {
            //             loader: 'babel-loader',
            //             options: {
            //                 presets: [
            //                     ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]
            //                 ]
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: './img',
                            publicPath: './img'
                        }
                    },
                    {
                        loader: 'img-loader',
                        options: {
                            plugins: [
                                imageminGifsicle(),
                                imageminMozjpeg(),
                                imageminPngquant(),
                                imageminSvgo()
                            ]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: './[name].bundle.css'
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: '*.svg', to: 'img', context: './src/img' },
            { from: 'favicon.*', to: 'img', context: './src/img' },
        ])
    ]
}; 