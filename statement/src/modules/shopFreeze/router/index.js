const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Index from '../views/index'

let routes = [{
	name: 'Index',
	path: '/',
	component: Index
}];
routes = merge(routes)
export default routes