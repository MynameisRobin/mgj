const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Index from '../views/index'
import Test from '../views/test'
import acrossShopDetail from '../views/acrossShopDetail'
import wageItemDetail from '../views/wageItemDetail'
import simpleDetail from '../views/simpleDetail'
import recount from '../views/recount'
import Report14 from '../views/report/report-14'
import Report13 from '../views/report/report-13'
import Report12 from '../views/report/report-12'
import Report6 from '../views/report/report-6'
let routes = [
	{
		path: '/',
		component: Index,
		children: [
			{
				path: 'report-14',
				component: Report14,
				name: 'report14'
			},
			{
				path: 'report-13',
				component: Report13,
				name: 'report13'
			},
			{
				path: 'report-12',
				component: Report12,
				name: 'report12'
			},
			{
				path: 'report-6',
				component: Report6,
				name: 'report6'
			}
		]
	},
	{
		path: '/test',
		component: Test
	},
	{
		path: '/acrossShopDetail',
		component: acrossShopDetail
	},
	{
		path: '/wageItemDetail',
		component: wageItemDetail
	},
	{
		path: '/simpleDetail',
		component: simpleDetail
	},
	{
		path: '/recount',
		component: recount
	}
];
routes = merge(routes)
export default routes

