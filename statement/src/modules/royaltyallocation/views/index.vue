<template>
	<div class="statement index" v-loading="initLoading" ref="royaltyIndex">

		<!-- <am-sideslip v-if="!initLoading" class="report_sideslip"></am-sideslip> -->

		<el-tabs class="indexTabs" v-loading="singleLoding" v-if="activeName" v-model="activeName" @tab-click="handleClick">
			<el-tab-pane v-for="(item, key) in tabPaneList" 
				:key="key" :label="item.label" :name="item.name">

				<span slot="label">
					<i v-if="key == 5 " class="tab6Icon icon iconfont mgj-xuyeji"></i>
					{{item.label}}
				</span>

				<div v-if="item.name == activeName && tabPaneType != null && !nothingPlan">
					<SearchPlanHeader v-if="allPlanList.length > 0 && searchFormulaSplice.length > 0" 
						ref="refSearch"
						:allPlanList="allPlanList"
						:tabPaneType="tabPaneType"
						:searchFormulaSplice="searchFormulaSplice"
						@stepChange="onStepChange"
						@selectPlan="onSelectPlan"
						@savePlan="onSavePlan"/>

					<Tree ref="tree"
						v-if="treeList && columnsConfig && allMap && formulaSplice"
						:data="treeList"
						:columns-config="columnsConfig"
						:column-map="allMap"
						:formula-splice="formulaSplice"
						:payList="originalPayList"
						:tabPaneType="tabPaneType"
						@addStep="onAddStep"
						@treeShow="onTreeShow">
					</Tree>
				</div>
				<div v-if="nothingPlan"></div>
			</el-tab-pane>
		</el-tabs>

		<div class="headExplain" v-if="isHeadquarters !== '2' ">
			<span class="fangdaBtn" @click="fangdaFun">
				<am-icon :name=" fangda ? 'offFullScreen' : 'FullScreen' " size="20"></am-icon>
				{{ fangda ? '收起' : '放大' }}配置窗口
			</span>
			<div class="rightDiv">
				<span class="spanText" @click="popModelShow(-1)">
					<am-icon name="guanli" size="20"></am-icon>
					方案管理
				</span>
			</div>
		</div>

		<PopModel
			v-if="popModelData.dialogVisible"
			:plan-id="currentPlanId"
			:propsObj="popModelData"
			:planList="popModelData.planList"
			:tabPaneType="tabPaneType"
			@childEditPlanAter="childEditPlanAter"
			@childClose="close"
			@distributionSave="onDistributionSave"
			@popModelTypeChange="onPopModelTypeChange">
		</PopModel>

		<FastNav class="fastNav" 
			:fast-search-map="fastSearchMap"
			:fast-length="fastLength"
			:enableStep="proposalsList.enableStep" />
	</div>
</template>
<script>
/* eslint-disable */
import Dayjs from 'dayjs'
import Api from '@/api'

import SearchPlanHeader from '#/components/searchPlanHeader'
import PopModel from '#/components/pop-model'
import Com from '../com'
import Tree from '#/components/tree/tree.vue'
import FindIndex from 'lodash.findindex'

import MetaDataMixin from '#/mixins/meta-data'
import formulaJson from '../formulaData.json'

const defaultStartTime = Dayjs().startOf('day').add(-1, 'M').toDate().getTime();
const defaultEndTime = Dayjs().endOf('day').toDate().getTime();

const 	consumeTypesMap= [  //映射的消费类型
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

const  	specifiedMap = [ //指定映射
			{
				id: 0,
				name: '非指定'
			},
			{
				id: 1,
				name: '指定'
			}
		];
const  	evaluateMap= [ //评价映射
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
const 	titleList = [   //头部映射
	{
		type: 'step',
		name: '添加算法' //指标梯度
	},
	{
		type: 'itemids',
		name: '项目',
	},
	{
		type: 'sellgoods',
		name: '卖品'
	},
	{
		type: 'card',
		name: '卡类'
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

const  showTypeData = [
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
]

export default {
	mixins: [MetaDataMixin],
	name: 'Index',
	components: {
		SearchPlanHeader,
		PopModel,
		Tree
	},
	data() {
		return {
			initLoading: true,
			singleLoding: false,
			isSelectSingleSearchObj: false,
			tabPaneLabel: ['项目', '卖品', '开卡', '充值', '套餐', '虚业绩'],
			activeName: null,
			tabPaneType: null,
			popModelData : {
				dialogVisible:false
			},
			tabPlanData: {},
			allPlanList: [],  //所有方案
			proposalsList: [],
			employeeLevels: [],
			serviceList: [],

			treeList : null,
			columnsConfig : [],
			allMap: null,
			formulaSplice: [],
			searchFormulaSplice: [],  //
			originalPayList : [],
			currentPlanId: '', //当前选择的方案id
			nothingPlan: false,
			fangda: false,

			fastSearchMap: [],
			fastLength: null
		}
	},
	computed: {
		tabPaneList() {
			let result = [
				{ label : '项目', name: 't0', type: 0 },
				{ label : '卖品', name: 't1', type: 1 },
				{ label : '开卡', name: 't2', type: 2 },
				{ label : '充值', name: 't3', type: 3 },
				{ label : '套餐销售', name: 't4', type: 4 }
			]
			return result;
		}
		// formulaData() {
		// 	return this.formulaJson[this.tabPaneType];
		// }
	},
	watch: {
		activeName(newV , oldV) {
			console.log(newV , oldV);
			let params = {
				// parentShopId : this.parentShopId,
				parentShopId : this.shopId,
				type: this.tabPaneType,
				proposalId: -1,
			}
			this.allPlanList = [];

			if (this.isHeadquarters === '2') {
				params.shopId = this.shopId;
				params.parentShopId = this.parentShopId;
			}
			this.getData(params);

			if (this.tabPaneType === 0) {
				this.$refs.royaltyIndex.style.minWidth = '1750px';
			} else {
				this.$refs.royaltyIndex.style.minWidth = '1550px';
			}
		},
		'$route' (to, from) {
			// this.$router.go(0);
			// console.log(111, to, from);
		} 
	},
	created() {
		window.addEventListener('keyup', this.handleEscKeyUp);
	},
	async mounted() {
		// console.log('清除dataPromise')
		sessionStorage.removeItem('dataPromise');

		this.initLoading = true;
		let res = await Api.getMetaData();
		this.initLoading = false;
		let resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}

		let rParamsStr = JSON.stringify(this.$route.params),
			rParams = JSON.parse(rParamsStr);
			// console.log('路由数据', rParams);
		if( rParamsStr !== '{}' ) {
			this.activeName = `t${rParams.type}`;
			this.tabPaneType = rParams.type;
			let params = {
				parentShopId : rParams.parentshopId,
				type: this.tabPaneType,
				proposalId: -1,
			}
			this.proposalsApi(params, 'change').then(data => {
				this.$refs.refSearch[0].selectPlan(rParams.planId);
			});

		} else {
			this.activeName = 't0';
			this.tabPaneType = 0;
		}
	},
	methods: {
		fangdaFun () {
			let royaltyDom = window.parent.document.querySelector('#royaltyallocation');
			try {
				if (!this.fangda) {
					royaltyDom.style.top = '0';
					royaltyDom.style.zIndex = '999';
					royaltyDom.style.transition = 'all .1s';
				} else {
					royaltyDom.style.top = '146px';
					royaltyDom.style.zIndex = '0';
				}
				this.fangda = !this.fangda;
			} catch (err) {
				// console.log(err);
			}
		},
		handleEscKeyUp(e) {
			if (e.keyCode === 27) {
				this.$eventBus.$emit('cancel-copy');
				window.removeEventListener('keyup', this.handleEscKeyUp);
			}
		},
		splicData(params) {
			const dataPromise = new Promise((reslove, reject) => {
				let obj = {};
				Promise.all([
					this.$http.get(`/shop/proposal!serviceClassWithItems.action`, {'params' : params}),
					this.$http.get(`/shop/proposal!employeeLevels.action`, {'params' : params}),
					this.$http.get(`/shop/proposal!payConfig.action`, {'params' : params}),
					this.$http.get(`/shop/proposal!marqueWithDepot.action`, {'params' : params}),
					this.$http.get(`/shop/proposal!cardTypes.action`, {'params' : params}),
					this.$http.get(`/shop/proposal!treatmentPackages.action`, {'params' : params}),
				]).then((result) => {
					result.forEach((k,v,arr)=> {
						let { code, content } = k.data;
						if(code === 0) {

							switch(v) {
								case 0:
									//项目名
									obj.serviceList = this.serviceListFun(content);
									obj.treatServiceList = this.treatServiceFun(content);
									// obj.treatmentPackages = this.serviceListFun(content).treatmentPackages;
								break;

								case 1:
									//级别
									obj.employeeLevels = content;
								break;

								case 2:
									//支付方式
									obj.getNewPayConfig = this.forGetNewPayConfig(content);
								break;

								case 3:
									//卖品
									obj.marque = this.marqueListFun(content);
								break;

								case 4:
									//套餐
									obj.cardTypes = content;
								break;

								case 5:
									//套餐
									obj.treatmentPackages = this.treatmentPFun(content);

									// content.forEach(k => {
									// 	k.treatFlag = true;
									// })
									// obj.treatmentPackages = {
									// 	...obj.treatmentPackages,
									// 	...content
									// }
								break;

								default:
									break;
							}
						}
					});
					reslove(obj)
				}).catch(error => {
					reject(error)
				});
			})
			return dataPromise;
		},
		// getProApiAndPayType(params) {
		// 	const proAndPayData = new Promise()
		// },
		getData(params) {
			let dataPromise = {};
			if(sessionStorage.dataPromise == undefined || sessionStorage.dataPromise == '{}') {
				this.splicData(params).then(data=> {
					sessionStorage.dataPromise = JSON.stringify(data);
					dataPromise = JSON.parse(sessionStorage.dataPromise);
				}).then( () => {
					this.dataFun(dataPromise);
					this.proposalsApi(params, 'change');			
				});
			}else {
				dataPromise = JSON.parse(sessionStorage.dataPromise);
				this.payConfig(params).then(data => {
					dataPromise.getNewPayConfig = data;
					sessionStorage.dataPromise = JSON.stringify(dataPromise);
				}).then( () => {
					this.dataFun(dataPromise);
					this.proposalsApi(params, 'change');			
				});
			}
		},
		dataFun(dataPromise) {
			let itemData = null,
				specifiedData = specifiedMap;
			if(this.tabPaneType == 0) {
				itemData = dataPromise.serviceList;
			}else if(this.tabPaneType == 1) {
				itemData = dataPromise.marque;
			}else if(this.tabPaneType == 2 || this.tabPaneType == 3) {
				itemData = dataPromise.cardTypes;					
			}else if(this.tabPaneType == 4) {
				specifiedData = limitMap;
				// itemData = dataPromise.treatmentPackages;
				itemData = [
					...dataPromise.treatServiceList,
					...dataPromise.treatmentPackages
				];
			}else if(this.tabPaneType == 5) {
				itemData = dataPromise.serviceList;					
			}

			this.allMap = {
				'itemidsMap': itemData,
				'levelidsMap' : dataPromise.employeeLevels,
				'consumeTypesMap' : consumeTypesMap, //消费类型
				'payTypesMap' : dataPromise.getNewPayConfig, //支付方式
				'specifiedMap' : specifiedData,
				'evaluateMap': evaluateMap, //评价
			};
			
			let payObj = {
					'groupName': '支付方式',
					value: ['支付方式业绩']
				},
				payList = [];
			dataPromise.getNewPayConfig.map(k=> {
				if ([0, 1].includes(this.tabPaneType) || k.name !== 'debtfee') {
					// payList.push(`${this.tabPaneLabel[this.tabPaneType]}${k.fieldName}业绩`);
					payList.push(`${this.tabPaneLabel[this.tabPaneType]}${k.fieldName}业绩`);
				}
			});
			payObj.value = [
				...payObj.value,
				...payList
			];

			if(this.tabPaneType != 5) {
				this.formulaSplice = [
					...formulaJson[this.tabPaneType],
					payObj
				];
				this.originalPayList = dataPromise.getNewPayConfig;
			} else {
				this.formulaSplice = formulaJson[this.tabPaneType];
			}
			

			this.searchFormulaSplice = [
				...formulaJson[6],
				// ...payList				
			];

			// let rParamsStr = JSON.stringify(this.$route.params),
			// 	rParams = JSON.parse(rParamsStr);
			// if(rParamsStr !== '{}') {
			// 	this.$nextTick( () => {
			// 		console.log(this.$refs);

			// 		this.$refs.refSearch[0].selectPlan(rParams.planId);
			// 	})
			// } else {}

		},
		onSelectPlan(data) {
			const { id, isBonus, enableStep } = data;

			let params = {
				parentShopId : this.shopId,
				proposalId: id,
			}
			this.currentPlanId = id;

			// if (enableStep == 1) {
			// 	this.columnsConfig.unshift({type: 'step',name: '添加算法'});
			// }else {
			// 	let index = FindIndex(this.columnsConfig, item => item.type === 'step');
			// 	if (index !== -1) {
			// 		this.columnsConfig.shift();
			// 	}
			// }

			//获取单个方案里面数据
			this.initLoading = true;
			this.proposalWithFormulasApi(params).then((data)=> {
				this.initLoading = false;	
				if(data.proposalFormulas == null || data.proposalFormulas.length === 0) {
					
					this.treeList = [
							{
								"itemids" : "-1", //项目集体ID  //卖品 //卡类 //套餐
								"levelids" : "-1", //员工级别ID
								"consumeTypes" : "-1", //消费类型集合
								"payTypes" : "-1", //支付方式ID
								"specified" : "-1", //1指定 0非指定    //限次
								"evaluate" : "-1" , //点评
								"equation" : "", //算式
								'step': `,0,1000,`
							}
						];
					if(this.tabPaneType === 4 && JSON.parse(sessionStorage.dataPromise).treatmentPackages.length > 0 ) {
						this.treeList.push({
							"itemids" : "T-1", //项目集体ID  //卖品 //卡类 //套餐
							"levelids" : "-1", //员工级别ID
							"consumeTypes" : "-1", //消费类型集合
							"payTypes" : "-1", //支付方式ID
							//"specified" : "-1", //1指定 0非指定    //限次
							"evaluate" : "-1" , //点评
							"equation" : "", //算式
							'step': `,0,1000,`
						});
					}

				}else {

					let dataList = { //存储接口返回的已有数据
						itemids: [],
						treatmentPs: [],
						levelids: [],
						payTypes: []
					};
					data.proposalFormulas.forEach( (k, v) => {
						//过滤已删除数据
						if (k.itemids !== null && k.itemids.indexOf('T') !== -1 && k.itemids !== 'T-1') {
							dataList.treatmentPs.push(...this.idsToArr(k.itemids));
						}
						if (k['step'] || k['equation']) {} 

						if (k.itemids !== null && k.itemids.indexOf('T') === -1 && k.itemids !== '-1') {
							dataList.itemids.push(...this.idsToArr(k.itemids));
						}		
						if (k.levelids !== null && k.levelids !== '-1') {
							dataList.levelids.push(...this.idsToArr(k.levelids));
						}
						if (k.payTypes !== null && k.payTypes !== '-1') {
							dataList.payTypes.push(...this.idsToArr(k.payTypes));
						}
					});
					
					const removeDuplicateItems = arr => [...new Set(arr)].filter( (s) => { return s && s.trim() });
					dataList.itemids = removeDuplicateItems( dataList.itemids );
					dataList.treatmentPs = removeDuplicateItems( dataList.treatmentPs );
					dataList.levelids = removeDuplicateItems( dataList.levelids );
					dataList.payTypes = removeDuplicateItems( dataList.payTypes );

					this.mapHasData().then( hasData => {
						function dataListFun(type) {
							dataList[type].forEach( k => {
								if ( hasData[`${type}Map`].indexOf(k) === -1) {
									//将删除的数据置为","
									data.proposalFormulas.forEach( k1 => {
										if (type === 'treatmentPs') {
											if (k[type] !== 'T-1') {
												k1['itemids'] = k1['itemids'].replace(`,${k},`, ",");
											}	
										} else {
											if (k[type] !== '-1') {
												k1[type] = k1[type].replace(`,${k},`, ",");
											}	
										}
									}) 
								} else {}
							})
						}
						dataListFun('itemids');
						dataListFun('treatmentPs');						
						dataListFun('levelids');
						dataListFun('payTypes');

						return hasData;
					}).then( (hasData) => {

						//删除
						data.proposalFormulas.forEach( (k, v, arr) => {
							if (k.itemids === ",") {
								delete arr[v];
							}
							if (k.itemids !== "," && k.levelids === ",") {
								delete arr[v];
							} 
							if (k.itemids !== "," && k.payTypes === ",") {
								delete arr[v];	
							} 
						});

						//新增
						let _this = this;
						function dataListFun(type) {
							let list = [],
								copyTypeData = []; //储存已添加新增数据的 itemids key 标识
							
							hasData[`${type}Map`].forEach( k => {
								if ( dataList[type].length > 0 && dataList[type].indexOf(k) === -1) {
									list.push(k);
								} else {}
							})
							// console.log('对比', type, list, hasData, dataList);

							if( list.length > 0 && (type === 'itemids' || type === 'treatmentPs') ) {
								let obj = {
									"itemids" : `,${list.join(',')},`, //项目集体ID  //卖品 //卡类 //套餐
									"levelids" : "-1", //员工级别ID
									"consumeTypes" : "-1", //消费类型集合
									"payTypes" : "-1", //支付方式ID
									"specified" : "-1", //1指定 0非指定    //限次
									"evaluate" : "-1" , //点评
									"equation" : "", //算式
								}
								if (type === 'treatmentPs') {
									delete obj.specified;
								}

								let stepArr = [], //存储达标标识
									newObjArr = [];
								data.proposalFormulas.forEach( k => {
									if( k.itemids !== '-1' && k.itemids !== 'T-1' && k.step != null) {
										if(stepArr.indexOf(k.step) === -1) {
											stepArr.push(k.step);
										}
									}
								})

								if(stepArr.length > 0) {
									stepArr.forEach( (k, v, arr) => {
										newObjArr.push({
											...obj,
											step: k
										})
									})
									data.proposalFormulas = [
										...newObjArr,
										...data.proposalFormulas
									];
								} else {
									data.proposalFormulas.push(obj);
								}
								
								// console.log('新增', stepArr, newObjArr, data.proposalFormulas);
							}
							if( list.length > 0 && type === 'levelids') {
								data.proposalFormulas.forEach( k => {
									if (type === 'levelids' && k.levelids !== '-1' && k.levelids !== ',' ) {
										if ( copyTypeData.indexOf(k.itemids) === -1 ) {
											copyTypeData.push(k.itemids);
											k.levelids = `${k.levelids}${list.join(',')},`;
										} else {}
									}
								})
							}
							if (list.length > 0 && type === 'payTypes') {
								let diffData = '';
								switch (_this.tabPaneType) {
									case 0:
										diffData = `consumeTypes`;
										break;
									case 4:
										diffData = `specified`;
										break;
									default:
										break;
								}

								data.proposalFormulas.forEach( k => {
									if (type === 'payTypes' && k.payTypes !== '-1' && k.payTypes !== ',') {	
										let str = `${k.step}${k.itemids}${k.levelids}${k[diffData]}`;
										if ( copyTypeData.indexOf(str) === -1 ) {
											copyTypeData.push(str);
											k.payTypes = `${k.payTypes}${list.join(',')},`;
										} else {}
									};
								})
							}
						}
						dataListFun('itemids');
						dataListFun('treatmentPs');
						dataListFun('levelids');
						dataListFun('payTypes');

						data.proposalFormulas.forEach( (k, v, arr) => {
							//过滤掉套餐包的specified
							if (k.itemids !== null && k.itemids.indexOf('T') !== -1) {
								delete k.specified;

								//套餐包有可能为空
								if (JSON.parse(sessionStorage.dataPromise).treatmentPackages.length == 0) {
									delete arr[v];
								}
							}
						})
						// console.log(22256, data.proposalFormulas);

						this.treeList = data.proposalFormulas;

						// this.treeList = [
						// 	{
						// 		"itemids" : "-1", //项目集体ID  //卖品 //卡类 //套餐
						// 		"levelids" : "-1", //员工级别ID
						// 		"consumeTypes" : "-1", //消费类型集合
						// 		"payTypes" : "-1", //支付方式ID
						// 		"specified" : "-1", //1指定 0非指定    //限次
						// 		"evaluate" : "-1" , //点评
						// 		"equation" : "", //算式
						// 		'step': `,0,1000,`
						// 	}
						// ];
						// if(this.tabPaneType === 4 && JSON.parse(sessionStorage.dataPromise).treatmentPackages.length > 0) {
						// 	this.treeList.push({
						// 		"itemids" : "T-1", //项目集体ID  //卖品 //卡类 //套餐
						// 		"levelids" : "-1", //员工级别ID
						// 		"consumeTypes" : "-1", //消费类型集合
						// 		"payTypes" : "-1", //支付方式ID
						// 		//"specified" : "-1", //1指定 0非指定    //限次
						// 		"evaluate" : "-1" , //点评
						// 		"equation" : "", //算式
						// 		'step': `,0,1000,`
						// 	});
						// }
					})
					
				}
				// console.log('treeList', this.treeList, data.proposalFormulas);
			})
			// console.log('父容器', id);
		},
		async proposalWithFormulasApi(params) {
			let res = await this.$http.get(`/shop/proposal!proposalWithFormulas.action`, {'params' : params});
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.proposalsList = resData.content;
				return resData.content;
			}
		},
		async proposalsWithShopsApi(params) {
			//获取方案配置
			this.initLoading = true;
			let res = await this.$http.get(`/shop/proposal!proposalsWithShops.action`, {'params' : params});
			this.initLoading = false;
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				let list = content;

				list = list.filter(item => item.type !== 5 && item.type !== 6);
				this.proposalsWithShops = list;
				return list;
			}
		},
		async proposalsApi(params, type, id) {
			//获取所有方案配置
			this.initLoading = true;
			let res = await this.$http.get(`/shop/proposal!proposals.action`, {'params' : params});
			this.initLoading = false;
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.allPlanList = content;
				if (type === 'change') {
					if (content.length > 0) {
						this.currentPlanId = content[0].id;
						this.nothingPlan = false;
					} else {
						this.currentPlanId = '';
						this.nothingPlan = true;
						this.$message.warning('当前类别下未分配方案！');
					}
				} else if(type === 'save') {
					this.currentPlanId = id;
				}
				return content;
			}
		},
		async payConfig(params) {
			//支付方式
			this.initLoading = true;
			let res = await this.$http.get(`/shop/proposal!payConfig.action`, {'params' : params});
			this.initLoading = false;
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				let payList = this.forGetNewPayConfig(content);
				return payList;
			}
		},
		serviceListFun(data) {
			// let serviceObj = {
			// 	serviceList: [],
			// 	treatmentPackages: []
			// };
			// data.forEach((k,v,arr) => {
			// 	k.serviceItems.forEach( (k1, v1, arr1)=> {
			// 		let obj = {
			// 			outer_classid : k['classid'],
			// 			outer_id : k['id'],
			// 			outer_name : k['name'],
			// 			...k1,
			// 			id: `${k1.itemid}`
			// 		};
			// 		if(k1.treatFlag === true) {
			// 			let objT = {
			// 				...obj,
			// 				id: `T${k1.itemid}`
			// 			}
			// 			serviceObj.treatmentPackages.push(objT);
			// 		}else {
			// 			serviceObj.serviceList.push(obj);
			// 		}
					
			// 	})
			// });
			// return serviceObj;

			let list = [];
			data.forEach((k,v,arr) => {
				k.serviceItems.forEach( (k1, v1, arr1)=> {
					let obj = {
						outer_classid : k['classid'],
						outer_id : k['id'],
						outer_name : k['name'],
						...k1,
						id: `${k1.itemid}`
					};	
					list.push(obj);				
				})
			});
			return list;
		},
		treatServiceFun (data) {
			let list = [];
			data.forEach((k,v,arr) => {
				k.serviceItems.forEach( (k1, v1, arr1)=> {
					if( k1.treatFlag !== true ) {
						let obj = {
							outer_classid : k['classid'],
							outer_id : k['id'],
							outer_name : k['name'],
							...k1,
							id: `${k1.itemid}`
						};	
						list.push(obj);				
					}
				})
			});
			return list;
		},
		treatmentPFun(data) {
			let list = [];
			data.forEach((k,v,arr) => {
				let obj = {
					// outer_classid : k['classid'],
					// outer_id : k['id'],
					// outer_name : k['packName'],
					...k,
					id: `T${k.id}`,
					_isPackages : true  //自定义套餐包标识
				};
				list.push(obj);
			});
			return list;
		},
		marqueListFun(data) {
			let list = [];
			//将大类里面的小类取出来
			data.forEach((k,v,arr) => {
				k.depots.forEach( (k1, v1, arr1)=> {
					let obj = {
						outer_classid : k['marqueid'],
						outer_id : k['id'],
						outer_name : k['type'],
						...k1
					}
					list.push(obj);
				})
			});
			return list;
		},
		idsToArr(str) {
			if(str === undefined) {
				return;
			}
			str = str.substr(0, str.length-1);
			str = str.substr(1, str.length-1);
			str = str.split(',');
			return str;
		},
		forItemids(val) {	
			//项目名
			let substrVal = this.substrStarAndEnd(val),
				strJoin = substrVal.split(',').join(','),
				str = `,${strJoin},`;
			// console.log(strJoin, str);
			return {
				strJoin,
				str,
			};
		},
		forMapping(obj) {
			//消费类型
			//参数说明 forType 类型 mapping 映射数据 val 需映射数据
			let list = [];
			if(obj.val != -1) {
				obj.val = obj.val.substr(0, obj.val.length-1);
				obj.val = obj.val.substr(1, obj.val.length-1);
				obj.val = obj.val.split(',');
			}else {
				//-1 表示全部

			}
			obj.val.forEach((k,v,arr)=> {
				obj.mapping.forEach((k1,v1,arr1)=> {
					if(obj.forType == 'employeeLevels') {
						// 预留字段变动
						if(k == k1.id) {
							list.push(k1);
						}
					}else {
						if(k == k1.id) {
							list.push(k1);
						}
					}
				})
			})
			return list;
		},
		forGetNewPayConfig(val) {
			let list = [];
			if(val && val.length > 0) {
				val.forEach((k,v,arr)=> {
					list.push({
						name: k.field.toLowerCase(),
						fieldName: k.fieldName
					});
				})
			}else {}
			
			return list;
		},
		mapHasData() {
			return new Promise ( (reslove, reject) => {
				let typeKey = {
					'levelids': 'dutyId',
					'consumeTypes': 'id',
					'payTypes': 'name',
					'specified': 'id',
					'evaluate': 'id',
				};
				switch (this.tabPaneType) {
					case 0:
					case 5:
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

				let hasData = {
					treatmentPsMap: []
				};
				// console.log('Object', this.allMap, JSON.parse(sessionStorage.dataPromise));
				Object.keys(this.allMap).map( (k) => {
					hasData[k] = [];
					this.allMap[k].map( k1 => {
						let mapChild = k1[typeKey[k.split('Map')[0]]];
						if (k.split('Map')[0] === 'itemids' && mapChild.indexOf('T') !== -1) {
							hasData.treatmentPsMap.push(mapChild);
						} else {
							hasData[k].push(mapChild);
						}
					})
				}); 
				reslove(hasData);
			})
		},
		close(data) {
			const {
				show,
				doWhat,
				itemData
			} = data;

			let params = {
				parentShopId : this.shopId,
				type: this.tabPaneType,
				proposalId: -1,
			};

			if (doWhat == 'upData') {
				this.proposalsApi(params, 'change');
			} else if (doWhat == 'goto') {
				this.activeName = `t${itemData.type}`;
				this.tabPaneType = itemData.type;
				params.type = this.tabPaneType;
				this.proposalsApi(params, 'change').then(data => {
					this.$refs.refSearch[0].selectPlan(itemData.id);
				});
			}
			this.popModelData.dialogVisible = show;
		},
		async childEditPlanAter(type) {
			this.popModelShow(type);
		},
		async popModelShow(type) {

			let params = {
				parentShopId : this.shopId,
				type: type !== undefined ? type : -1,
				proposalId: -1,
			};
			let data = await this.proposalsWithShopsApi(params);

			if(data == undefined) {
				return
			}
			console.log(type);
			this.popModelData = {
				dialogVisible : true,
				selectType: (type !== undefined) ? type : -1,
				planList: this.proposalsWithShops
			};
		},
		onDistributionSave(type) {
			// this.popModelData.dialogVisible = false;
			this.popModelShow(type);			
		},
		onSavePlan(data) {
			let treeData = this.$refs.tree[0].getData();
			const {lastData, equationData} = this.onTreeData(treeData);
			let params = {
				id: data.data.proposalId,
				enableStep: data.data.enableStep ? 1 : 0,
				stepEquation: encodeURIComponent(data.data.stepEquation),
				proposalFormulas: lastData
			};

			if(params.enableStep == 1) {
				if(params.stepEquation == '') {
					this.$message.error('达标公式不能为空！');
					return;
				}
			}

			if(!data.data.stepValid) {
				this.$message.error('达标公式验证未通过，请修改');
				return;
			}

			let index = FindIndex(equationData, item => item.valid === false);
			
			// console.log(11111111, treeData, equationData, lastData, index);
			
			if (index !== -1) {
				this.$message.error('有公式验证未通过，请修改');
				return;
			}

			let stepIndex = FindIndex(this.columnsConfig, item => item.type == 'step');
			if(stepIndex >= 0) {
				let list = [],
					errList = [];
				treeData.forEach( k => {
					list.push(this.idsToArr(k.valueKey));
				});
				list.forEach( (k,v,arr) => {
					if( k[0] === 'undefined' || k[1] === 'undefined') {
						errList.push(v+1);
					}  else if( v > 0 && parseInt(arr[v-1][1]) > parseInt(arr[v][0])) {
						errList.push(v+1);
					}	
				})

				if(errList.length > 0) {
					this.$message.error(`第${errList}个梯度算法的起始值或截止值不合法`);
					return;
				}
			}else{}

			//转义特殊字符 增加方案 Id
			params.proposalFormulas.forEach((k)=> {
				k.proposalId = data.data.proposalId;
				k.equation = encodeURIComponent(k.equation);
			});

			// alert(1);
			// return console.log(params);
			// console.log(params);

			 
			this.singleLoding = true;
			this.$http.post(`/shop/proposal!saveProposalFormulas.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					const shopList = content;
					this.$message.success('保存成功！');

					let params = {
						parentShopId : this.shopId,
						type: this.tabPaneType,
						proposalId: -1,
					};

					//保存后重新获取 所有方案
					this.proposalsApi(params, 'save', data.data.proposalId);
				}
			})
			
		},
		onStepChange(stepBoolean) {
			let list = [];
			showTypeData[this.tabPaneType].forEach((k)=> {
				let index = FindIndex(titleList, item => item.type == k)
				if(index >= 0) {
					list.push(titleList[index]);
				}else{}
			});

			if(this.tabPaneType == 0) {
				list.forEach(k=> {
					if(k.type == 'itemids') {
						k.name = '项目';
					}else if(k.type == 'specified') {
						k.name = '指定/非指定'
					}
 				})
			}else if(this.tabPaneType == 1) {
				let index = FindIndex(list, item => item.type == 'itemids')
				if(index >= 0) {
					list[index].name = '卖品';
				}else{}
			}else if(this.tabPaneType == 2 || this.tabPaneType == 3) {
				let index = FindIndex(list, item => item.type == 'itemids')
				if(index >= 0) {
					list[index].name = '卡类';
				}else{}				
			}else if(this.tabPaneType == 4) {
				list.forEach(k=> {
					if(k.type == 'itemids') {
						k.name = '套餐';
					}else if(k.type == 'specified') {
						k.name = '限次/不限次'
					}
 				})										
			}

			if(stepBoolean) {
				let index = FindIndex(list, item => item.type == 'step')
				if(index >= 0) {
				}else{
					list.unshift({type: 'step',name: '添加算法'});
				}
			}else {
				let index = FindIndex(list, item => item.type == 'step')
				if(index >= 0) {
					list.shift();
				}else{}
			}

			if(this.$refs.tree && this.$refs.tree[0].getData()) {
				let treeData = this.$refs.tree[0].getData(),
					treeDataBool = stepBoolean ? treeData : [treeData[0]],
					lastData = this.onTreeData(treeDataBool).lastData;
				// console.log(31, this.$refs, treeData, lastData, treeDataBool);

				if (lastData[0].step === undefined || lastData[0].step === null) {
					lastData.forEach( (k, v, arr) => {
						k.step = `,0,1000,`;
						if(k.itemids.indexOf('T') !== -1) {
							delete k.specified;
						}
					})
				} else {
					if (this.tabPaneType === 4) {
						lastData.forEach( (k, v, arr) => {
							if(k.itemids.indexOf('T') !== -1) {
								delete k.specified;
							}
						})
					}
				}
				this.treeList = lastData;

			} else {}

			this.columnsConfig = list;
			// this.$eventBus.$emit('stepChange');
		},
		handleClick(tab, event) {
			this.$eventBus.$emit('change-tab');
			this.tabPaneType = Com.tabType({list : this.tabPaneList, val : this.activeName});
		},
		onTreeData(data) {
			// console.log(data);
			
			let _data = data;
			if (_data == null) {
				return
			}

			let equationData = []; 
			function filter(arr, type) {
				for (var i = 0; i < arr.length; i++) {
					var el = arr[i];
					if (el.type === type) {
						const index = FindIndex(equationData, item => item.parentKey === el.parentKey);
						if (index === -1) {
							equationData.push(el);
						}
					} else {
						if (el.children && el.children.length) {
							filter(el.children, type)
						}
					}
				}
			}
			filter(_data, 'equation');

			let dataPromise = JSON.parse(sessionStorage.dataPromise),
				mapLengthObj = {
					'itemids': 0,
					'levelids': dataPromise.employeeLevels.length,
					'consumeTypes': consumeTypesMap.length,
					'payTypes': dataPromise.getNewPayConfig.length,
					'specified': specifiedMap.length,
					'evaluate': evaluateMap.length,
					'equation': 0,
				};
				
				switch (this.tabPaneType) {
					case 0:
					case 5:
						mapLengthObj.itemids = dataPromise.serviceList.length;
						break;
					case 1:
						mapLengthObj.itemids = dataPromise.marque.length;
						break;
					case 2:
					case 3:
						mapLengthObj.itemids = dataPromise.cardTypes.length;
						break;
					case 4:
						// mapLengthObj.itemids = dataPromise.treatmentPackages.length;
						break;
					default:
						break;
				}

			let lastData = [];
			equationData.forEach(k=> {
				let obj = {
					'levelids': '-1',
					'consumeTypes': '-1',
					'payTypes': '-1',
					'specified': '-1',
					'evaluate': '-1',
				};
				let strArr = k.parentKey.split('_');
					strArr.splice(0,1);
				this.columnsConfig.forEach((k1,v1,arr1)=> {

					if( k1.type == 'step' || strArr[v1] == '-1' || strArr[v1] == 'T-1' ) {
						obj[k1.type] = strArr[v1];
					} else if(k1.type == 'equation') {
						obj[k1.type] = k.value;
						obj.enabledPerfPct = k.enabledPerfPct === true ? 1 : 0;  //多人提成配置
					}else {
						if(this.tabPaneType === 4 && k1.type === 'itemids') {
							//对套餐销售做的特殊处理
							if (k.parentKey.indexOf('T') !== -1) {
								obj[k1.type] = this.idsToArr(strArr[v1]).length == dataPromise.treatmentPackages.length ? 'T-1' : strArr[v1];
							} else {
								obj[k1.type] = this.idsToArr(strArr[v1]).length == dataPromise.treatServiceList.length ? '-1' : strArr[v1];
							}
						} else {
							if(this.idsToArr(strArr[v1]).length == mapLengthObj[k1.type]) {
								obj[k1.type] = '-1';
							}else {
								obj[k1.type] = strArr[v1];
							}
						}
					}

					//特殊处理 套餐包specified
					if(this.tabPaneType === 4 && k1.type === 'specified' && strArr[v1] === ',,' || strArr[v1] === 'undefined') {
						obj[k1.type] = '-1';
					} 

				});
				// obj.equation = k.value;
				lastData.push(obj);
			});

			// console.log('tree 更新后的数据', equationData, JSON.parse(JSON.stringify(lastData)));
			return {lastData, equationData}; 
		},	
		onAddStep(data) {

			let treeData = this.$refs.tree[0].getData();
			const {lastData} = this.onTreeData(treeData);

			let treeList = [...lastData];

			//去除套餐包里面的限次数据
			treeList.forEach(item => {
				if(item.itemids.indexOf('T') !== -1 && item.specified) {
					delete item.specified
				}
			});

			console.log('this.treeList', treeList);
			let step = treeList[treeList.length-1].step.split(',');
			
			let obj = {
				"itemids" : "-1", //项目集体ID  //卖品 //卡类 //套餐
				"levelids" : "-1", //员工级别ID
				"consumeTypes" : "-1", //消费类型集合
				"payTypes" : "-1", //支付方式ID
				"specified" : "-1", //1指定 0非指定    //限次
				"evaluate" : "-1" , //点评
				"equation" : "", //算式
				'step': `,${step[2]},${parseInt(step[2]) + 100},`
			};

			treeList.push(obj);
			if(this.tabPaneType === 4 && JSON.parse(sessionStorage.dataPromise).treatmentPackages.length > 0) {
				let treatObj = {
					...obj,
					itemids: 'T-1'
				};
				delete treatObj.specified;
				treeList.push(treatObj);
			}	
			this.treeList = treeList;
		},
		onTreeShow(data) {
			let treeData = this.$refs.tree[0].getData();

			this.fastSearchMap = this.fastSearchMapFun(treeData);
			this.fastLength = treeData.length;
		},
		fastSearchMapFun(data) {
			let list = [];
			if (this.proposalsList.enableStep === 1) {
				// console.log(data);
				list = data.map( (item, index, arr) =>{
					let strArr = item.valueKey.split(',');
					return {
						no: index,
						label: `${strArr[1]}-${strArr[2]}`,
						name: `step${index}`
					} 
				});
			} else {
				data.forEach( (item, index, arr) => {
					item.value.forEach( (itemA, indexA, arrA) => {
						list.push({
							no: index,
							label: `提成算法${index+1}`,
							name: (itemA.name || itemA.cardtypename || itemA.packName) + `|${itemA.id}`
						})
					});
				});
			}
			return list;
		},
		async onPopModelTypeChange(val) {
			let params = {
				parentShopId : this.shopId,
				type: val === -1 ? null : val,
				proposalId: -1,
			};
			this.popModelData.planList = await this.proposalsWithShopsApi(params);
		}
	},
	destroyed () {
		// console.log('清除 sessionStorage.dataPromise');
		sessionStorage.removeItem('dataPromise');
	}
	
}
</script>

<style lang="less">

	::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}
	::-webkit-scrollbar-track {
		background-color:#eee;
	}
	::-webkit-scrollbar-thumb {
		background-color:rgba(144, 147, 153, .5);;
	}

	html, body, #app {
		height: 100%;
	}
	.default-scrollbar {
		width: 100%;
		height: 100%;
	}
	.flex-scrollbar {
		width: auto;
		height: auto;
		-webkit-box-flex: 1;
		-ms-flex: 1;
		flex: 1;
	}
	.el-scrollbar__wrap.default-scrollbar__wrap {
		overflow-x: auto;
	}
	.el-scrollbar__view.p20-scrollbar__view {
		padding: 20px;
		box-sizing: border-box;
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		-o-box-sizing: border-box;
		-ms-box-sizing: border-box;
	}
	li {
		list-style:none;
	}
	.index {
		.indexTabs {
			.el-tabs__header {
				padding-left: 13px;
				margin-bottom: 0;
			}
			// .el-scrollbar__wrap{
			// 	overflow-x: hidden;
			// }
			.el-tabs__nav-scroll {
				padding-bottom: 1px;
			}
			.el-tabs__active-bar {
				display: none;
			}
			.el-tabs__nav-wrap::after {
				height: 1px;
				background-color: #FC9252;
			}
			.el-tabs__item {
				height: 30px;
				margin-right: 5px;
				padding: 8px 21px;
				font-size: 12px;
				line-height: 15px;
				background: #EEEEEE;
				border-radius:2px 2px 0px 0px;
			}
			.el-tabs__item:hover,
			.el-tabs__item.is-active {
				color: #fff;
				background: #FC9252;
			}
			.el-tabs__item.is-top:nth-child(2) {
				padding-left: 20px; 
			}
			#tab-t4 {
				padding-right: 20px;
			}
		}
		span.hasBg,
		.el-button.noDis {
			cursor: pointer;
			display: inline-block;
			padding: 4px;
			background: #fff;
			border-radius:2px;
			border: none;
			&:focus {
				outline: none;
			}
		}
		.el-button.noDis,
		.dis {
			padding: 5px;
		}
		.dis {
			display: inline-block;
			background: #fff;
			border-radius:2px;
			border: none;
		}

	}
	i.zhu,
	i.user {
		color: #00AAEE;
	}
	i.j {
		color: #FC9252;
	}
	.note {
		.el-checkbox__label {
			font-size: 12px;
		}
	}
	
</style>

<style lang="less" scoped>

	// .scrollWrap {
	// 	overflow-y: scroll;
	// 	height: 800px;
	// 	// margin-right: 5px;
	// }
	.index {
		height: 100%;
		width: 100%;
		padding-top: 16px;
		background: #fff;
		.indexTabs {
			
		}
		.headExplain {
			position: absolute;
			z-index: 1;
			top: 26px;
			right: 13px;
			.fangdaBtn {
				cursor: pointer;
				display: inline-block;
				margin-right: 20px;
				color: #FC9252;
			}
			.rightDiv {
				display: inline-block;
				.spanText {
					color: #FC9252;
					cursor: pointer;
				}
			}
		}

		.iconHeader {

		}
		.fastNav {
			cursor: pointer;
			position: fixed;
			left: 10px;
			bottom: 30px;
		}
	}
</style>
