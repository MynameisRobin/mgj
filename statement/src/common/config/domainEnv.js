import Config from './app'
const config = {
	'testvip': {
		'CALC_SERVER_URI': 'http://testcalc.meiguanjia.net'
	},
	'vipstag': {
		'CALC_SERVER_URI': 'https://calcstg.meiguanjia.net'
	}
}
const defaultProd = {
	'CALC_SERVER_URI': 'https://calc.meiguanjia.net'
}
let result = {
	...Config,
	...defaultProd,
};
const testDomainList = [
	'testvip',
	'vipstg'
]
if (process.env.NODE_ENV === 'development') {
	result = Config;
} else {
	const domainEnv = window.location.hostname.split('.')[0];
	console.log('domainEnv', domainEnv);
	if (testDomainList.indexOf(domainEnv) >= 0) {
		result = Config;
	}
}

export default result;