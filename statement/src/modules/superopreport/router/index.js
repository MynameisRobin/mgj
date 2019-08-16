const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Index from '../views/index'
import Test from '../views/test'
let routes = [
	{
		path: '/',
		component: Index
	},
	{
		path: '/test',
		component: Test
	}
];
routes = merge(routes)
export default routes

