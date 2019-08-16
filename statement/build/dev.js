var utils = require('./utils')
var env = require('./env')
utils.buildVendor(() => { 
	env.build();
	require('./dev-server')
})