const webpack = require('webpack');
var path = require('path')
const fs = require('fs')
var rm = require('rimraf')

function resolve(dir) {
	return path.join(__dirname, '..', dir)
}
const readDir = dir => {
	const result = [];
	fs.readdirSync(dir).map(file => {
		if (file.match(/\.js$/)) result.push(`${dir.replace('./node_modules/', '')}/${file}`);
		else if (fs.lstatSync(dir + '/' + file).isDirectory()) result.push(...readDir(dir + '/' + file));
	});
	return result
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
const vendors = [
	'vue/dist/vue.esm.js', 'axios', 'vue-router', 
	'element-ui', 
	'dayjs',
	'vuedraggable', 
	'lodash.findindex',
	'lodash.some',
	'v-charts',
	'echarts',
	'js-cookie',
	'popper.js',
	'vue-cropperjs',
];
deleteFolderRecursive(resolve("dist/vue-assets/js"))

const webpackConfig = {
	mode: 'production',
	output: {
		path: resolve("dist/vue-assets/js"),
		filename: '[name].[chunkhash:8].js',
		library: '[name]_[chunkhash:8]',
	},
	entry: {
		vendor: vendors,
	},
	plugins: [
		// new webpack.optimize.UglifyJsPlugin({
		// 	compress: {
		// 		warnings: false
		// 	},
		// 	output: {
		// 		comments: false
		// 	},
		// 	sourceMap: false
		// }),
		new webpack.DllPlugin({
			path: resolve("dist/vue-assets/js/vendor_manifest.json"),
			name: '[name]_[chunkhash:8]',

		})
	],
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				loader: ['vue-style-loader', 'css-loader']
			},
		]
	}
};
if (process.argv[1].indexOf('vendor.js') > -1) {
	if (process.env.npm_config_report) {
		var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
		webpackConfig.plugins.push(new BundleAnalyzerPlugin({analyzerPort:8081}))
	}
	webpack(webpackConfig, function (err, stats) {

		if (err) throw err
		process.stdout.write(stats.toString({
			colors: true,
			modules: false,
			children: false,
			chunks: false,
			chunkModules: false
		}) + '\n\n')

		//   startServer();
	})
}

module.exports = webpackConfig