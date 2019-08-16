var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
var vueLoaderConfig = require('./vue-loader.conf')
function resolve(dir) {
	return path.join(__dirname, '..', dir)
}
let webpackConfig = {
	entry: {
		app: [`./src/modules/${utils.moduleName}/main.js`]
	},
	output: {
		path: config.build.assetsRoot,
		filename: '[name].js',
		publicPath: process.env.NODE_ENV === 'production' ?
			`./` :
			config.dev.assetsPublicPath
	},
	plugins: [
		new VueLoaderPlugin(),
		new webpack.DefinePlugin({
			'process.moduleConfig': JSON.stringify(Object.assign({}, utils.moduleConfig, {
				NODE_ENV: process.env.NODE_ENV
			}))
		})

	],
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
			'@': resolve('src/common'),
			'#': resolve(`src/modules/${utils.moduleName}`)
		}
	},
	module: {
		rules: [

			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.js$/,
				loader: utils.getLoader('babel'),
				include: [resolve('src')]
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: './img/[name].[ext]'
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'file-loader',
				options: {
					limit: 1000,
					name: './fonts/[name].[hash:7].[ext]'
				}
			}
		]
	}
};

module.exports = webpackConfig;