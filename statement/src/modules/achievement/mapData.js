/*
	type参数说明: 0项目 1卖品 2开卡 3充值 4套餐销售 5虚业绩 6项目业绩
*/
import FindIndex from 'lodash.findindex'


const consumeTypesMap = [  // 映射的消费类型
	{
		id: 0,
		name: '套餐不限次'
	},
	{
		id: 1,
		name: '套餐赠送'
	},
	{
		id: 2,
		name: '会员'
	},
	{
		id: 3,
		name: '散客'
	},
	{
		id: 4,
		name: '套餐'
	},
];
const limitMap = [
	{
		id: 0,
		name: '不限次'
	},
	{
		id: 1,
		name: '限次'
	}
];
const specifiedMap = [ // 指定映射
	{
		id: 0,
		name: '非指定'
	},
	{
		id: 1,
		name: '指定'
	}
];
const evaluateMap = [ // 评价映射
	{
		id: 0,
		name: '未评'
	},
	{
		id: 1,
		name: '好'
	},
	{
		id: 2,
		name: '中'
	},
	{
		id: 3,
		name: '差'
	}
];

const titleList = [   // 头部映射
	{
		type: 'step',
		name: '添加算法' // 指标梯度
	},
	{
		type: 'itemids',
		name: '项目',
	},
	{
		type: 'limit',
		name: '限次/不限次'
	},
	{
		type: 'levelids',
		name: '级别',
	},
	{
		type: 'consumeTypes',
		name: '消费类型'
	},
	{
		type: 'payTypes',
		name: '支付方式'
	},
	{
		type: 'specified',
		name: '指定/非指定'
	},
	{
		type: 'evaluate',
		name: '评价'
	},
	{
		type: 'equation',
		name: '计算'
	}
];
const showTypeData = [
	[	
		'itemids',
		'levelids',
		'consumeTypes',
		'payTypes',
		'specified',
		'evaluate',
		'equation'
	],
	[
		'itemids',
		'levelids',
		'payTypes',
		'equation'
	],
	[
		'itemids',
		'levelids',
		'payTypes',
		'equation'
	],
	[
		'itemids',
		'levelids',
		'payTypes',
		'equation'
	],
	[
		'itemids',
		'specified',
		'levelids',
		'payTypes',
		'equation'
	],
	[
		'itemids',
		'consumeTypes',
		'equation'
	],
	[	
		'itemids',
		'levelids',
		'consumeTypes',
		'payTypes',
		'specified',
		'equation'
	],
];

const mapData = {
	consumeTypesMap: [...consumeTypesMap],
	titleList: [...titleList],
	showTypeData: [...showTypeData],
	limitMap: [...limitMap],
	specifiedMap: [...specifiedMap],
	evaluateMap: [...evaluateMap],
	tabPaneListFun: (obj) => {
		let list = [
			{ label: '项目', type: 0 },
			{ label: '卖品', type: 1 },
			{ label: '开卡', type: 2 },
			{ label: '充值', type: 3 },
			{ label: '套餐销售', type: 4 }
		];
		if (obj.modelType === 'royalty') {
			return list;
		} else if (obj.modelType === 'achievement') {
			list = [{ label: '项目', type: 6 }]
			if (obj.softgenre && obj.softgenre !== '2') { // 总部 与 附属出现虚业绩
				list.push({ label: '虚业绩', type: 5 }); // 版本迭代原因 虚业绩从royalty移至 achievement
			}
		}
		return list;
	},
	popModelIndexData: (obj) => {
		let data = {};
		if (obj.modelType === 'royalty') {
			data.head = ['方案名称', '类别', '使用门店', '创建时间', '额外奖励', '操作'];
			data.JInfo = [
				{
					title: '主方案和额外奖励方案的说明：',
					content: '门店仅可启用1种主方案，所有营收类型的提成均按照主方案的配置来计算；门店还可以同时启用最多3种额外奖励方案；员工的提成=主方案计算的提成+额外奖励方案的提成；'
				},
				{
					title: '需要注意的是：',
					content: '门店可单独为员工配置1种主方案及最多3种额外奖励方案；一旦员工有独立启用的方案，以员工的主方案为准+员工额外奖励方案+门店额外奖励方案的模式来计算提成；没有独立启用方案的员工按门店启用的方案来计算提成。 '
				}
			];
	
		} else if (obj.modelType === 'achievement') {
			data.head = ['方案名称', '类别', '使用门店', '创建时间', '操作'];		
		}
		return data;
	},
	columnsConfigFun: (obj) => {
		let list = [];
		mapData.showTypeData[obj.type].forEach((k) => {
			let index = FindIndex(mapData.titleList, item => item.type === k)
			if (index >= 0) {
				list.push(mapData.titleList[index]);
			} else {
				// 预留
			}
		});

		list.forEach(k => {
			switch (obj.type) {
				case 0:
				case 5:
				case 6:
					if (k.type === 'itemids') {
						k.name = '项目';
					} else if (k.type === 'specified') {
						k.name = '指定/非指定'
					}
					break;
				case 1:
					if (k.type === 'itemids') {
						k.name = '卖品';
					}
					break;
				case 2:
				case 3:
					if (k.type === 'itemids') {
						k.name = '卡类';
					}
					break;
				case 4:
					if (k.type === 'itemids') {
						k.name = '套餐';
					} else if (k.type === 'specified') {
						k.name = '限次/不限次'
					}
					break;
				default:
					break;
			}
		});
		return list;
	},
	typeKeyFun: (type) => {
		let typeKey = {
			'levelids': 'dutyId',
			'consumeTypes': 'id',
			'payTypes': 'name',
			'specified': 'id',
			'evaluate': 'id',
		};
		switch (type) {
			case 0:
			case 5:
			case 6:
				typeKey.itemids = 'itemid';
				break;
			case 1:
				typeKey.itemids = 'no';
				break;
			case 2:
			case 3:
				typeKey.itemids = 'cardtypeid';
				break;
			case 4:
				typeKey.itemids = 'id';
				break;
			default:
				break;
		};
		return typeKey;
	}
};


export default mapData;