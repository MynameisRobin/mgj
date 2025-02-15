var path = require('path')
var config = require('../config')
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var webpack = require('webpack')
const fs = require('fs')
let moduleName = process.argv[2];
let moduleConfig = require('../config/module-configs')[moduleName];
if (moduleConfig) {
	exports.moduleConfig = moduleConfig
	exports.moduleName = moduleName
}
function getFileName(dir, re) {
	dir = path.resolve(__dirname, '..', dir)
	let files = fs.readdirSync(dir);
	for (let file of files) {
		if (file.match(re)) {
			return file;
		}
	}
	throw dir
}
exports.getLoader = function (loader) { 
	return loader + '-loader' 
	// return process.env.NODE_ENV == 'production'? loader+'-loader' :'happypack/loader?id='+(loader==='vue'?'1':loader)
}
exports.getFileName = getFileName

exports.getVendorJs = function () { 
	let file = getFileName(('dist/vue-assets/js'), /^vendor\..*\.js$/);
	return `../vue-assets/js/${file}`
}

exports.getCommonJs = function () { 
	let file = getFileName(path.resolve(`dist/${moduleName}/vue-assets/js`), /^common\..*\.js$/);
	return `../vue-assets/js/${file}`
}
exports.getCommonCss = function () { 
	let file = getFileName(path.resolve(`dist/${moduleName}/common`), /^common\..*\.css$/);
	return `../vue-assets/${file}`
}


exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}
exports.buildVendor = function (cb) { 
	let vendorManfestPath = path.join(__dirname, '..', 'dist/vue-assets/js/vendor_manifest.json')
	if (fs.existsSync(vendorManfestPath)) { 
		return cb();
	}
	let vendorWebpack = require('./vendor');
	webpack(vendorWebpack, function (err, stats) {
		if (err) throw err
		process.stdout.write(stats.toString({
			colors: true,
			modules: false,
			children: false,
			chunks: false,
			chunkModules: false
		}) + '\n\n')
		cb();

		//   startServer();
	})
}
exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
		return ['vue-style-loader', MiniCssExtractPlugin.loader]
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders('postcss'),
    // postcss: generateLoaders(),
    less: generateLoaders('less'),
    // sass: generateLoaders('sass', { indentedSyntax: true }),
    // scss: generateLoaders('sass'),
    // stylus: generateLoaders('stylus'),
    // styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
