const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Index from '../views/index'
// import NewIndex from '../views/newIndex'
import StoreConfig from '../views/storeConfig'
// import Test1 from '../views/test1'

let routes = [
	{
		name: 'Index',
		path: '/',
		component: Index
	},
	// {
	// 	path: '/new',
	// 	component: NewIndex
	// },
	{
		path: '/shop',
		component: Index
	},
	{
		path: '/StoreConfig',
		name: 'StoreConfig',
		component: StoreConfig
	},
	// {
	// 	path: '/test1',
	// 	component: Test1
	// },
];
routes = merge(routes)
export default routes

