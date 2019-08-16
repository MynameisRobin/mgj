const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Index from '../views/index'
import StoreConfig from '../views/storeConfig'
import IndexConfigure from '../components/index-configure'
import StoreTable from '../components/store-table'
// import Test1 from '../views/test1'

let routes = [
	{
		name: 'Index',
		path: '/',
		component: Index,
		children: [
			{ path: '/indexConfigure/:type/:planId', component: IndexConfigure}
		]
	},
	{
		path: '/shop',
		component: Index,
	},
	{
		path: '/StoreConfig',
		name: 'StoreConfig',
		component: StoreConfig,
		// redirect: '/StoreConfig/storeTable',
		children: [
			{ path: '/StoreConfig/storeTable/:type', component: StoreTable}
		]
	},
	// {
	// 	path: '/test1',
	// 	component: Test1
	// },
];
routes = merge(routes)
export default routes

