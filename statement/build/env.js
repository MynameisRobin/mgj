const merge = require('webpack-merge')
const fs = require('fs');
const path = require('path');
const Package = require('../package.json')

var baseConfig = require('../env/app.base.js');

let config = Object.assign({}, baseConfig);
let env = process.argv[3];
let moduleName = process.argv[2];
if (!env || !isNaN(parseInt(env))) {
	env = "test";
}
let envConfig = require(`../env/app.${env}.js`);
config = merge(baseConfig, envConfig);
if (process.env.NODE_ENV !== 'production' && fs.existsSync(path.join(__dirname, '..', 'env', 'app.local.js'))) {
	let localConfig = require('../env/app.local.js');
	config = merge(config, localConfig);
}
config.release = Package.version;
let appConfig = JSON.stringify(config, null, 2);
const folderPath = path.join(__dirname,'..','src', 'common', 'config');
const filePath = path.join(__dirname,'..','src', 'common', 'config', 'app.js');
var build = function() {
	let configMain = [`var appConfig=${appConfig};`, 
		'export default Object.freeze(appConfig);'];
	try {
		fs.accessSync(folderPath);
		fs.writeFileSync(filePath, configMain.join('\n'), 'utf8');
	} catch (error) {
		fs.mkdirSync(folderPath)
		fs.writeFileSync(filePath, configMain.join('\n'), 'utf8');
	}
}

if (process.argv[1].indexOf('app-config.js') > -1) {
	build();
}

module.exports = {
	build,
	config
}