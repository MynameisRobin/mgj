require('./check-versions')()
process.env.NODE_ENV = 'production'
var opn = require('opn')
var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var spinner = ora('building for production...')
var utils = require('./utils')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var env = require('./env')

function resolve(dir) {
	return path.join(__dirname, '..', dir)
}
spinner.start()
let modulePath = path.join(config.build.assetsRoot, utils.moduleName)
// new HtmlWebpackPlugin(
let webpackConfig = require('./webpack.prod.conf');
let htmlWebpackOption = {
	filename: path.resolve(__dirname, '../dist/' + utils.moduleName + '/index.html'),
	template: 'index.html',
	inject: true,
	minify: {
		removeComments: true,
		collapseWhitespace: true,
		removeAttributeQuotes: true
	},
	chunksSortMode: 'dependency'
}

function build() {
	spinner.text = 'building common ';
	let common = require('./common');
	common.build(() => {
		webpackConfig.plugins.push(new webpack.DllReferencePlugin({
			sourceType: 'var',
			manifest: require(`../dist/${utils.moduleName}/common_manifest.json`),
		}))
		webpackConfig.plugins.push(new webpack.DllReferencePlugin({		
			sourceType: 'var',
			manifest: require("../dist/vue-assets/js/vendor_manifest.json"),
		}));
		htmlWebpackOption.commonJs = utils.getCommonJs();
		htmlWebpackOption.commonCss = utils.getCommonCss();
		htmlWebpackOption.vendorJs = utils.getVendorJs();
		
		let commonJsName = utils.getFileName(`dist/${utils.moduleName}/vue-assets/js`, /^common\..*\.js$/);
		let commonJsHash = commonJsName.split('.')[1];
		webpackConfig.output.filename = `[name].${commonJsHash}.[hash:8].js`,
		buildModule();
	})


}

function buildModule() {
	spinner.text = 'building module ';
	
	let plugins = [
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '../dist/vue-assets/js'),
				to: './assets/js',
				ignore: ['.*', '*.json']
			},
			{
				from: path.resolve(__dirname, `../dist/${utils.moduleName}/vue-assets`),
				to: '../vue-assets',
				ignore: ['.*', '*.json']
			},
			{
				from: path.resolve(__dirname, `../dist/${utils.moduleName}/common`),
				to: '../vue-assets'
			}
		], {
			copyUnmodified: true
		}),
		new HtmlWebpackPlugin(htmlWebpackOption)
		

	]

	webpackConfig = require('webpack-merge')(webpackConfig, {
		plugins
	})

	// console.log('webpackConfig', webpackConfig)
	webpack(webpackConfig, function (err, stats) {
		spinner.stop()
		if (err) throw err
		process.stdout.write(stats.toString({
			colors: true,
			modules: false,
			children: false,
			chunks: false,
			chunkModules: false
		}) + '\n\n')

		console.log(chalk.cyan('Build complete.\n'))

	})
}
rm(modulePath, (err, stats) => {
	if (err) throw err
	env.build();
	utils.buildVendor(build)	
	// buildModule();
});