const merge = function () {
	return Array.prototype.concat.apply([], arguments)
};
import Main from '../views/main'
import Index from '../views/index'
import Distribution from '../views/distribution'
import CardSearch from '../views/cardSearch'
import CustomerQuery from '../views/customerQuery'
import DetailMain from '../views/detail/main'
import ProfileMain from '../views/detail/profileMain'
import DetailBasics from '../views/detail/basics'
import Archives from '../views/detail/archives'
import Works from '../views/detail/works'
import ConsumeRecord from '../views/detail/consumeRecord'
import OperationRecord from '../views/detail/operationRecord'
import CardChange from '../views/detail/cardChange'
import LuckyMoney from '../views/detail/luckyMoney'
import AppointmentHistory from '../views/detail/appointmentHistory'
import PointChange from '../views/detail/pointChange'
import MallOrder from '../views/detail/mallOrder'
import Privilege from '../views/detail/privilege'
let routes = [
	{
		path: '/',
		component: Main,
		name: 'main',
		children: [
			{
				path: 'index',
				name: 'index',
				component: Index
			},
			{
				path: 'distribution',
				name: 'distribution',
				component: Distribution
			},
			{
				path: 'card-search',
				name: 'cardSearch',
				component: CardSearch
			},
			{
				path: 'customer-query',
				name: 'customerQuery',
				component: CustomerQuery
			},
		]
	},
	{
		path: '/detail/:id',
		// path: '/detail',
		name: 'customerDetail',
		component: DetailMain,
		children: [
			{
				path: 'profile',
				name: 'customerProfile',
				component: ProfileMain,
				children: [
					// 基础资料
					{
						path: 'basics',
						name: 'customerBasics',
						component: DetailBasics
					},
					// 会员卡
					{
						path: 'basicscard',
						name: 'customerBasicsCard',
						component: DetailBasics
					},
					// 套餐
					{
						path: 'basicsmeal',
						name: 'customerMeal',
						component: DetailBasics
					},
					// 欠款
					{
						path: 'basicsarrears',
						name: 'customerBasicsArrears',
						component: DetailBasics
					},
					// 档案
					{
						path: 'archives',
						name: 'customerArchives',
						component: Archives
					},
					// 作品
					{
						path: 'works',
						name: 'customerWorks',
						component: Works
					},
					// 预约历史
					{
						path: 'appointment-history',
						name: 'customerAppointmentHistory',
						component: AppointmentHistory
					},
				]
			},
			// 消费记录
			{
				path: 'consume-record',
				name: 'cunstomerConsumeRecord',
				component: ConsumeRecord
			},
			// 操作记录
			{
				path: 'operation-record',
				name: 'customerOperationRecord',
				component: OperationRecord,
			},
			// 卡金变动
			{
				path: 'card-change',
				name: 'customerCardChange',
				component: CardChange
			},
			// 红包
			{
				path: 'lucky-money',
				name: 'customerLuckyMoney',
				component: LuckyMoney
			},
			// 积分变动
			{
				path: 'point-change',
				name: 'customerPointChange',
				component: PointChange
			},
			// 商城订单
			{
				path: 'mall-order',
				name: 'customerMallOrder',
				component: MallOrder
			},
			// 特权卡
			{
				path: 'privilege',
				name: 'customerPrivilege',
				component: Privilege
			}
		]
	}
];
routes = merge(routes)
export default routes

