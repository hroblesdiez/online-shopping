
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';
const stylesHandler = MiniCssExtractPlugin.loader;
const DIST = path.resolve( __dirname, 'dist' );
const entry = {
  index: './assets/js/main.js',
};

const config  = {
  entry: entry,
  output: {
    path: DIST,
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   title: 'Online SHOPPING',
    //   template: path.resolve(__dirname, './index.html'),
    //   filename: 'index.html',
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.(scss|css)$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};