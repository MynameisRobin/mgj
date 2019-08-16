const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Scheme from '../views/scheme'
import Rule from '../views/rule'
import ruleDetail from '../views/ruleDetail'
import schemeDetail from '../views/schemeDetail'
import cardScheme from '../views/cardScheme'

let routes = [{
	name: 'scheme',
	path: '/scheme',
	component: Scheme
}, {
	name: 'schemeDetail',
	path: '/schemeDetail',
	component: schemeDetail
}, {
	name: 'rule',
	path: '/rule',
	component: Rule
}, {
	name: 'ruleDetail',
	path: '/ruleDetail',
	component: ruleDetail
}, {
	name: 'cardScheme',
	path: '/cardScheme',
	component: cardScheme
}];
routes = merge(routes)
export default routes