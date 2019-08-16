process.env.NODE_ENV = 'production';
const webpack = require('webpack');
var path = require('path')
const fs = require('fs')
var utils = require('./utils')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
var MiniCssExtractPlugin = require('mini-css-extract-plugin')

function resolve(dir) {
	return path.join(__dirname, '..', dir)
}
const deleteFolderRecursive = function (path) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function (file, index) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};


let modulePath = resolve(`dist/${utils.moduleName}`);
let assetsPath = resolve(`dist/${utils.moduleName}/vue-assets/js`);
let commonPath = resolve(`dist/${utils.moduleName}/common`);


var webpackConfig = {
	mode: 'production',
	entry: {
		common: ['./src/common/main.js']
	},
	output: {
		path: commonPath,
		filename: '[name].[chunkhash:8].js',
		library: '[name]_[chunkhash:8]',
	},
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
			'@': resolve('src/common'),
		}
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: 'vue-loader'
		},
		{
			test: /\.js$/,
			loader: 'babel-loader',
			include: [resolve('src')]
		},
		{
			test: /\.css$/,
			loader: ['vue-style-loader', MiniCssExtractPlugin.loader,  'css-loader', 'postcss-loader',]
		},
		{
			test: /\.less$/,
			loader: ['vue-style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader']
		},
		{
			
			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
			loader: 'file-loader',
			options: {
				limit: 100000,
				name: '../vue-assets/img/[name].[hash:7].[ext]'
			}
		},
		{
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			loader: 'file-loader',
			options: {
				limit: 10,
				name: `../vue-assets/fonts/[name].[hash:7].[ext]`
			}
		}
		]
	},
	plugins: [
		new VueLoaderPlugin(),
		new webpack.DefinePlugin({
			'process.moduleConfig': JSON.stringify(Object.assign({}, utils.moduleConfig, {
				NODE_ENV: process.env.NODE_ENV
			}))
		}),
		new webpack.DllReferencePlugin({
			sourceType: 'var',
			manifest: require("../dist/vue-assets/js/vendor_manifest.json"),
		}),

		new webpack.DllPlugin({
			path: path.join(modulePath, 'common_manifest.json'),
			name: '[name]_[chunkhash:8]',

		}),
		new MiniCssExtractPlugin({
			filename: `[name].[contenthash:8].css`
		}),
		// new OptimizeCSSPlugin({
		// 	cssProcessorOptions: {
		// 		safe: true
		// 	}
		// }),
		// new webpack.optimize.UglifyJsPlugin({
		// 	compress: {
		// 		warnings: false
		// 	},
		// 	sourceMap: false
		// }),
	],
};

function build(cb) {
	deleteFolderRecursive(modulePath);
	deleteFolderRecursive(assetsPath);
	if (process.env.npm_config_report && process.argv[1].indexOf('common.js') > -1) {
		var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
		webpackConfig.plugins.push(new BundleAnalyzerPlugin({
			analyzerPort: 8082
		}))
	}

	webpack(webpackConfig, function (err, stats) {
		if (err) throw err;
		process.stdout.write(stats.toString({
			colors: true,
			modules: false,
			children: false,
			chunks: false,
			chunkModules: false
		}) + '\n\n')
		if (!fs.existsSync(assetsPath)) {
			fs.mkdirSync(assetsPath);
		}
		let commonJsName = utils.getFileName(commonPath, /^common\..*\.js$/);
		fs.renameSync(path.join(commonPath, commonJsName), path.join(assetsPath, commonJsName))
		// let commonCssName = utils.getFileName(commonPath, /^common\..*\.css$/);
		// fs.renameSync(path.join(commonPath, commonCssName), path.join(modulePath, commonCssName));
		cb && cb()
	})
}
if (process.argv[1].indexOf('common.js') > -1) {
	build();
}
module.exports = {
	build
}