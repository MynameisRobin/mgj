<template>
	<div class="statement index" v-loading="initLoading" ref="royaltyIndex">

		<!-- <am-sideslip v-if="!initLoading" class="report_sideslip"></am-sideslip> -->

		<div class="index_tabs">
			<Tabs 
				:tabPaneList="tabPaneList"
				:qType="tabPaneType"
				:isHeadquarters="isHeadquarters"
				@tabsChange="onTabsChange"
				@tabsPopModelShow="onTabsPopModel"></Tabs>

			<SearchPlanHeader v-if="allPlanList.length > 0" ref="refSearch"
				:allPlanList="allPlanList"
				:tabPaneType="tabPaneType"
				:searchFormulaSplice="searchFormulaSplice"
				@stepInit="onStepInit"
				@stepChange="onStepChange"
				@selectPlan="onSelectPlan"
				@savePlan="onSavePlan"/>
		</div>
		
		<div v-if="tabPaneType != null && !nothingPlan">
			<router-view ref="indexConfigure"
				:nothingPlan="nothingPlan"
				:tabPaneType="tabPaneType"
				:treeList="treeList"
				:columnsConfig="columnsConfig"
				:allMap="allMap"
				:typeKey="typeKey"
				:formulaSplice="formulaSplice"
				:originalPayList="originalPayList"
				@treeShow="onTreeShow"></router-view>
		</div>
		<div v-if="nothingPlan"></div>

		<PopModel
			v-if="popModelData.dialogVisible"
			:plan-id="currentPlanId"
			:propsObj="popModelData"
			:planList="popModelData.planList"
			:tabPaneType="tabPaneType"
			@childEditPlanAter="childEditPlanAter"
			@childClose="close"
			@distributionSave="onDistributionSave">
		</PopModel>

		<am-icon style="display: none;" class="top" name="top" size="25px" title="返回顶部" @click.native="topFun"></am-icon>

		<FastNav class="fastNav" 
			:fast-search-map="fastSearchMap"
			:fast-length="fastLength"
			:enableStep="proposalsList.enableStep" />
	</div>
</template>
<script>
/* eslint-disable */
import Api from '@/api'
import Dayjs from 'dayjs'
import Com from '../com'
import FindIndex from 'lodash.findindex'

import MetaDataMixin from '#/mixins/meta-data'
import formulaJson from '../formulaData.json'
import MapData from '../mapData.js'

import Tabs from '#/components/tabs'
import SearchPlanHeader from '#/components/searchPlanHeader'
import PopModel from '#/components/pop-model'
// import FastNav from '#/components/fast-nav'
import mapData from '../mapData.js';

export default {
	mixins: [MetaDataMixin],
	name: 'Index',
	components: {
		Tabs,
		SearchPlanHeader,
		PopModel,
	},
	data() {
		return {
			initLoading: true,
			singleLoding: false,
			isSelectSingleSearchObj: false,
			tabPaneLabel: ['项目', '卖品', '开卡', '充值', '套餐', '虚业绩', '项目'],
			activeName: null,
			tabPaneType: null,
			popModelData : {
				dialogVisible:false
			},
			tabPlanData: {},
			allPlanList: [],  //所有方案
			proposalsList: {},
			employeeLevels: [],
			serviceList: [],

			treeList: null,
			columnsConfig: [],
			allMap: null,
			typeKey: {},
			formulaSplice: [],
			searchFormulaSplice: [],  //
			originalPayList : [],
			currentPlanId: '', //当前选择的方案id
			nothingPlan: false,

			fastSearchMap: [],
			fastLength: null
		}
	},
	computed: {
		routeParams() {
			return this.$route.params;
		},
		tabPaneList() {
			// 获取头部tab数据
			return [...MapData.tabPaneListFun({modelType: 'achievement', softgenre: this.userInfo.softgenre})];
		},
	},
	watch: {
		'$route'(to, from) {
			if (this.routeParams.planId !== '-1') {
				this.initFun();
			}
		},
		tabPaneType(newV, oldV) {
			this.typeKey = MapData.typeKeyFun(newV);
		}
	},
	created() {
		window.addEventListener('keyup', this.handleEscKeyUp);
		// this.initLoading = true;
		// this.$http.post('shair/metedata!reservationMetadata.action', {})
		// .then( resData => {
		// 	this.initLoading = false;
		// 	const { code, content } = resData;
		// 	if (code === 0) {
		// 		this.$eventBus.env = {
		// 			...content
		// 		}

		// 		this.aa = content.userInfo.shopId;
		// 		console.log(this.aa);
		// 	}
		// 	console.log(resData);
		// })
		// .catch( error => {
		// 	console.log(error)
		// });
	},
	async mounted() {
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

		// 获取路由type
		this.tabPaneType = this.routeParams.type ? parseInt(this.routeParams.type) : this.tabPaneList[0].type;
		
		this.initFun();

		this.$eventBus.$on('allPlanListChange', (data) => {
			this.allPlanList = data;
		});
		this.$eventBus.$on('addStep', (data) => {
			this.onAddStep();
		});
	},
	methods: {
		initFun() {
			let params = {
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
		topFun() {
			let t = document.documentElement.scrollTop || document.body.scrollTop;
			if (t === 0) {
				return;
			} else {
				window.scrollTo(0,0);  
			}
		},
		handleEscKeyUp(e) {
			if (e.keyCode === 27) {
				this.$eventBus.$emit('cancel-copy');
				window.removeEventListener('keyup', this.handleEscKeyUp);
			}
		},
		splicData(params) {
			const dataPromise = new Promise((resolve, reject) => {
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
								break;

								default:
									break;
							}
						}
					});
					resolve(obj)
				}).catch(error => {
					reject(error)
				});
			})
			return dataPromise;
		},
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
				specifiedData = MapData.specifiedMap;
			if(this.tabPaneType == 0 || this.tabPaneType == 6) {
				itemData = dataPromise.serviceList;
			}else if(this.tabPaneType == 1) {
				itemData = dataPromise.marque;
			}else if(this.tabPaneType == 2 || this.tabPaneType == 3) {
				itemData = dataPromise.cardTypes;					
			}else if(this.tabPaneType == 4) {
				specifiedData = MapData.limitMap;
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
				'consumeTypesMap' : MapData.consumeTypesMap, //消费类型
				'payTypesMap' : dataPromise.getNewPayConfig, //支付方式
				'specifiedMap' : specifiedData,
				'evaluateMap': MapData.evaluateMap, //评价
			};
			
			let payList = [];
			dataPromise.getNewPayConfig.map(k=> {
				if ([0, 1].includes(this.tabPaneType) || k.name !== 'debtfee') {
					payList.push(`${this.tabPaneLabel[this.tabPaneType]}${k.fieldName}业绩`);
				}
			});

			// 过滤业绩 业绩的公式中不需要28种支付方式
			if(this.tabPaneType < 5) {
				this.formulaSplice = [
					...formulaJson[this.tabPaneType],
					...payList,
					'支付方式业绩'
				];
				this.originalPayList = dataPromise.getNewPayConfig;
			} else {
				this.formulaSplice = formulaJson[this.tabPaneType];
			}
			

			this.searchFormulaSplice = [
				...formulaJson[formulaJson.length - 1],
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
		onStepInit(stepBoolean) {
			let list = [];
			list = MapData.columnsConfigFun({type: this.tabPaneType});

			if (stepBoolean) {
				let index = FindIndex(list, item => item.type === 'step')
				if (index >= 0) {
					// 预留
				} else {
					list.unshift({type: 'step', name: '添加算法'});
				}
			} else {
				let index = FindIndex(list, item => item.type === 'step')
				if (index >= 0) {
					list.shift();
				}
			}
			this.columnsConfig = list;
		},
		onStepChange(stepBoolean) {
			
			//方案达标状态改变时 columnsConfig 也需要跟着改变
			this.onStepInit(stepBoolean);

			let indexConfigureTree = this.$refs.indexConfigure.$refs;
			console.log(indexConfigureTree);
			if (Object.keys(indexConfigureTree).indexOf('tree') !== -1) {
				let treeData = indexConfigureTree.tree.getData(),
					treeDataBool = stepBoolean ? treeData : [treeData[0]],
					lastData = this.onTreeData(treeDataBool).lastData;
				// console.log(31, treeData, lastData, treeDataBool);

				if (lastData[0].step === undefined || lastData[0].step === null) {
					lastData.forEach( (k, v, arr) => {
						k.step = `,0,1000,`;
						if (k.itemids.indexOf('T') !== -1) {
							delete k.specified;
						}
					})
				} else {
					if (this.tabPaneType === 4) {
						lastData.forEach( (k, v, arr) => {
							if (k.itemids.indexOf('T') !== -1) {
								delete k.specified;
							}
						})
					}
				}
				this.treeList = lastData;
			} else {
				// 预留
			}
		},
		onTreeShow(data) {
			let indexConfigureTree = this.$refs.indexConfigure.$refs,
				treeData = indexConfigureTree.tree.getData();
			this.fastSearchMap = this.fastSearchMapFun(treeData);
			this.fastLength = treeData.length;
		},
		fastSearchMapFun(data) {
			let list = [];
			if (this.proposalsList.enableStep === 1) {
				console.log(data);
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
		idsToArr(str) {
			if (str === undefined) {
				return;
			}
			str = str.substr(0, str.length - 1);
			str = str.substr(1, str.length - 1);
			str = str.split(',');
			return str;
		},
		onSelectPlan(data) {

			const { id, isBonus, enableStep } = data;
			let params = {
				parentShopId: this.shopId,
				proposalId: id,
			}
			this.currentPlanId = id;
		
			if (!this.routeParams.planId) {
				this.$router.replace({
					path: `/indexConfigure/${this.tabPaneType}/${id}`
				});
				return;
			}

			//	获取单个方案里面数据
			this.initLoading = true;
			this.proposalWithFormulasApi(params).then((data) => {
				this.initLoading = false;	
				if (data.proposalFormulas === null || data.proposalFormulas.length === 0) {
					
					this.treeList = [{
						"itemids": "-1", // 项目集体ID  卖品 卡类 套餐
						"levelids": "-1", // 员工级别ID
						"consumeTypes": "-1", // 消费类型集合
						"payTypes": "-1", // 支付方式ID
						"specified": "-1", // 1指定 0非指定    //限次
						"evaluate": "-1", // 点评
						"equation": "", // 算式
					}];
					if (this.tabPaneType === 4 && JSON.parse(sessionStorage.dataPromise).treatmentPackages.length > 0 ) {
						this.treeList.push({
							"itemids": "T-1", // 项目集体ID  卖品 卡类 套餐
							"levelids": "-1", // 员工级别ID
							"consumeTypes": "-1", // 消费类型集合
							"payTypes": "-1", // 支付方式ID
							// "specified": "-1", // 1指定 0非指定    //限次
							"evaluate": "-1", // 点评
							"equation": "", // 算式
						});
					}

				} else {
					let dataList = { // 存储接口返回的已有数据
						itemids: [],
						treatmentPs: [],
						levelids: [],
						payTypes: []
					};
					data.proposalFormulas.forEach( (k, v) => {
						// 过滤已删除数据
						if (k.itemids !== null && k.itemids.indexOf('T') !== -1 && k.itemids !== 'T-1') {
							dataList.treatmentPs.push(...this.idsToArr(k.itemids));
						}
						if (k['step'] || k['equation']) {
							// 预留
						}

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
									// 将删除的数据置为","
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
								} else {
									// 预留
								}
							})
						}
						dataListFun('itemids');
						dataListFun('treatmentPs');						
						dataListFun('levelids');
						dataListFun('payTypes');

						return hasData;
					}).then( (hasData) => {
						// 删除
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

						// 新增
						let _this = this;
						function dataListFun(type) {
							let list = [],
								copyTypeData = []; // 储存已添加新增数据的 itemids key 标识
							
							hasData[`${type}Map`].forEach( k => {
								if ( dataList[type].length > 0 && dataList[type].indexOf(k) === -1) {
									list.push(k);
								} else {
									// 预留
								}
							})
							// console.log('对比', type, list, hasData, dataList);

							if ( list.length > 0 && (type === 'itemids' || type === 'treatmentPs') ) {
								let obj = {
									"itemids": `,${list.join(',')},`, // 项目集体ID  卖品 卡类 套餐
									"levelids": "-1", // 员工级别ID
									"consumeTypes": "-1", // 消费类型集合
									"payTypes": "-1", // 支付方式ID
									"specified": "-1", // 1指定 0非指定    //限次
									"evaluate": "-1", // 点评
									"equation": "", // 算式
								}
								if (type === 'treatmentPs') {
									delete obj.specified;
								}

								let stepArr = [], // 存储达标标识
									newObjArr = [];
								data.proposalFormulas.forEach( k => {
									if ( k.itemids !== '-1' && k.itemids !== 'T-1' && k.step !== null) {
										if (stepArr.indexOf(k.step) === -1) {
											stepArr.push(k.step);
										}
									}
								})

								if (stepArr.length > 0) {
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
							if ( list.length > 0 && type === 'levelids') {
								data.proposalFormulas.forEach( k => {
									if (type === 'levelids' && k.levelids !== '-1' && k.levelids !== ',' ) {
										let str = `${k.step}${k.itemids}`;
										if ( copyTypeData.indexOf(str) === -1 ) {
											copyTypeData.push(str);
											// k.levelids = `${k.levelids}${list.join(',')},`;
											// console.log(k);

											data.proposalFormulas.push(
												{
													...k,
													levelids: `,${list.join(',')},`
												}
											)
										} else {
											// 预留
										}
									}
								})
							}

							if (list.length > 0 && type === 'payTypes') {
								let diffData = '';
								switch (_this.tabPaneType) {
									case 0:
									case 5:
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
											// k.payTypes = `${k.payTypes}${list.join(',')},`;

											data.proposalFormulas.push(
												{
													...k,
													payTypes: `,${list.join(',')},`
												}
											)
										} else {
											// 预留
										}
									};
								})
							}
						}
						dataListFun('itemids');
						dataListFun('treatmentPs');
						dataListFun('levelids');
						dataListFun('payTypes');

						data.proposalFormulas.forEach( (k, v, arr) => {
							// 过滤掉套餐包的specified
							if (k.itemids !== null && k.itemids.indexOf('T') !== -1) {
								delete k.specified;

								// 套餐包有可能为空
								if (JSON.parse(sessionStorage.dataPromise).treatmentPackages.length === 0) {
									delete arr[v];
								}
							}
						})

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
						// 	});
						// }
					})
					
				}
				// console.log('treeList', this.treeList, data.proposalFormulas);

			});
		},
		onSavePlan(data) {

			let treeData = this.$refs.indexConfigure.$refs.tree.getData();

			const {lastData, equationData} = this.onTreeData(treeData);
			let params = {
				id: data.data.proposalId,
				enableStep: data.data.enableStep ? 1 : 0,
				stepEquation: encodeURIComponent(data.data.stepEquation),
				proposalFormulas: lastData
			};

			if (params.enableStep === 1) {
				if (params.stepEquation === '') {
					this.$message.error('达标公式不能为空！');
					return;
				}
			}

			if (!data.data.stepValid) {
				this.$message.error('达标公式验证未通过，请修改');
				return;
			}

			let index = FindIndex(equationData, item => item.valid === false);
			
			// console.log(11111111, treeData, equationData, lastData, index);
			
			if (index !== -1) {
				this.$message.error('有公式验证未通过，请修改');
				return;
			}

			let stepIndex = FindIndex(this.columnsConfig, item => item.type === 'step');
			if (stepIndex >= 0) {
				let list = [],
					errList = [];
				treeData.forEach( k => {
					list.push(this.idsToArr(k.valueKey));
				});
				list.forEach( (k, v, arr) => {
					if ( k[0] === 'undefined' || k[1] === 'undefined') {
						errList.push(v + 1);
					}  else if ( v > 0 && parseInt(arr[v - 1][1]) > parseInt(arr[v][0])) {
						errList.push(v + 1);
					}	
				})

				if (errList.length > 0) {
					this.$message.error(`第${errList}个梯度算法的起始值或截止值不合法`);
					return;
				}
			} else {
				// 预留
			}

			// 转义特殊字符 增加方案 Id
			params.proposalFormulas.forEach((k) => {
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
						// parentShopId: this.$parent.shopId,
						parentShopId: this.shopId,
						type: this.tabPaneType,
						proposalId: -1,
					};

					// 保存后重新获取 所有方案
					this.proposalsApi(params, 'save', data.data.proposalId);
				}
			})
		},
		onTreeData(data) {

			let _data = data;
			if (_data === null) {
				return
			}

			let equationData = []; 
			function filter(arr, type) {
				for (var i = 0; i < arr.length; i++) {
					var el = arr[i];
					if (el.type === type) {
						equationData.push(el);
					} else {
						if (el.children && el.children.length) {
							filter(el.children, type)
						}
					}
				}
			}
			filter(_data, 'equation');

			// console.log(JSON.stringify(this.columnsConfig), equationData);

			let dataPromise = JSON.parse(sessionStorage.dataPromise),
				mapLengthObj = {
					'itemids': 0,
					'levelids': dataPromise.employeeLevels.length,
					'consumeTypes': MapData.consumeTypesMap.length,
					'payTypes': dataPromise.getNewPayConfig.length,
					'specified': MapData.specifiedMap.length,
					'evaluate': MapData.evaluateMap.length,
					'equation': 0,
				};
				
			switch (this.tabPaneType)	{
				case 0:
				case 5:
				case 6:
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
			};

			let lastData = [];
			
			equationData.forEach(k => {
				let obj = {
					'levelids': '-1',
					'consumeTypes': '-1',
					'payTypes': '-1',
					'specified': '-1',
					'evaluate': '-1',
				};
				let strArr = k.parentKey.split('_');
				strArr.splice(0, 1);
				this.columnsConfig.forEach((k1, v1, arr1) => {
					if ( k1.type === 'step' || strArr[v1] === '-1' || strArr[v1] === 'T-1' ) {
						obj[k1.type] = strArr[v1];
					} else if (k1.type === 'equation') {
						obj[k1.type] = k.value;
						obj.enabledPerfPct = k.enabledPerfPct === true ? 1 : 0;  // 多人提成配置
					} else {
						if (this.tabPaneType === 4 && k1.type === 'itemids') {
							// 对套餐销售做的特殊处理
							if (k.parentKey.indexOf('T') !== -1) {
								obj[k1.type] = this.idsToArr(strArr[v1]).length === dataPromise.treatmentPackages.length ? 'T-1' : strArr[v1];
							} else {
								obj[k1.type] = this.idsToArr(strArr[v1]).length === dataPromise.treatServiceList.length ? '-1' : strArr[v1];
							}
						} else {
							if (this.idsToArr(strArr[v1]).length === mapLengthObj[k1.type]) {
								obj[k1.type] = '-1';
							} else {
								obj[k1.type] = strArr[v1];
							}
						}
					}

					// 特殊处理 套餐包specified
					if (this.tabPaneType === 4 && k1.type === 'specified' && strArr[v1] === ',,' || strArr[v1] === 'undefined') {
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
			let treeData = this.$refs.indexConfigure.$refs.tree.getData();
			const {lastData, equationData} = this.onTreeData(treeData);

			console.log('this.treeList', JSON.parse(JSON.stringify(this.treeList)), lastData);
			let step = lastData[lastData.length - 1].step.split(',');
			
			lastData.push({
				"itemids": "-1", // 项目集体ID  卖品 卡类 套餐
				"levelids": "-1", // 员工级别ID
				"consumeTypes": "-1", // 消费类型集合
				"payTypes": "-1", // 支付方式ID
				"specified": "-1", // 1指定 0非指定 限次
				"evaluate": "-1", // 点评
				"equation": "", // 算式
				'step': `,${step[2]},${parseInt(step[2]) + 100},`,
				onAddStep: true  // 标记临时添加
			});
			if (this.tabPaneType === 4 && JSON.parse(sessionStorage.dataPromise).treatmentPackages.length > 0) {
				lastData.push({
					"itemids": "T-1", // 项目集体ID  卖品 卡类 套餐
					"levelids": "-1", // 员工级别ID
					"consumeTypes": "-1", // 消费类型集合
					"payTypes": "-1", // 支付方式ID
					// "specified": "-1", // 1指定 0非指定  限次
					"evaluate": "-1", // 点评
					"equation": "", // 算式
					'step': `,${step[2]},${parseInt(step[2]) + 100},`
				});
			}	
			this.treeList = lastData;
		},
		async proposalWithFormulasApi(params) {
			//获取单个方案配置
			let res = await this.$http.get(`/shop/proposal!proposalWithFormulas.action`, {'params' : params});
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.proposalsList = resData.content;
				return resData.content;
			}
		},
		async proposalsWithShopsApi(params) {
			//获取管理方案配置
			this.initLoading = true;
			let res = await this.$http.get(`/shop/proposal!proposalsWithShops.action`, {'params' : params});
			this.initLoading = false;
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				let list = content;
				list.forEach( (k, v) => {
					if (k.type === 5) {
						list.splice(v, 1);
					}
				})
				this.proposalsWithShops = list;
				return content;
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
			return new Promise ( (resolve, reject) => {
				let typeKey = {
					...this.typeKey
				};

				let hasData = {
					treatmentPsMap: []
				};
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
				resolve(hasData);
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
				this.$router.replace({
					path: `/indexConfigure/${this.tabPaneType}/${itemData.id}`,
				});
			}
			this.popModelData.dialogVisible = show;
		},
		onDistributionSave() {
			this.onTabsPopModel();		
		},
		async childEditPlanAter() {
			this.onTabsPopModel();
		},
		async onTabsPopModel() {
			let params = {
				parentShopId : this.shopId,
				type: this.tabPaneType,
				proposalId: -1,
			};
			let data = await this.proposalsWithShopsApi(params);

			if(data == undefined) {
				return
			}
			this.popModelData = {
				dialogVisible : true,
				planList: this.proposalsWithShops
			};
		},
		onTabsChange(data) {
			this.tabPaneType = data.type;

			let params = {
				parentShopId : this.shopId,
				type: this.tabPaneType,
				proposalId: -1,
			};
		
			this.allPlanList = [];
			if (this.isHeadquarters === '2') {
				params.shopId = this.shopId;
				params.parentShopId = this.parentShopId;
			}

			let promiseData = (params) => new Promise( (resolve, reject) => {
				let dataList = this.proposalsApi(params, 'change');
				resolve(dataList);
			})
			.catch( (err) => {
				reject(err);
			});
			promiseData(params)
			.then( (data) => {
				let id = -1;
				if (data.length > 0) {
					id = data[0].id;
				}
				this.$router.replace({
					path: `/indexConfigure/${this.tabPaneType}/${id}`,
				})
			});
		}	
	},
	destroyed () {
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
		// -webkit-border-radius: 2em;
		// -moz-border-radius: 2em;
		// border-radius:2em;
	}
	::-webkit-scrollbar-thumb {
		background-color:rgba(144, 147, 153, .5);;
		// -webkit-border-radius: 2em;
		// -moz-border-radius: 2em;
		// border-radius:2em;
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
		.index_tabs {
			position: fixed;
			top: 0;
			left: 0;
			padding-top: 12px;
			background: #fff;
			z-index: 4;
		}
		.top {
			cursor: pointer;
			position: fixed;
			right: 30px;
			bottom: 30px;
			z-index: 4;
		}
		.fastNav {
			cursor: pointer;
			position: fixed;
			left: 10px;
			bottom: 30px;
		}
	}
</style>
