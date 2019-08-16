<template>
	<div class="statement storeConfig" v-loading="initLoading">

		<!-- <am-sideslip v-if="!initLoading" class="report_sideslip"></am-sideslip> -->

		<el-tabs class="indexTabs" v-model="activeName" @tab-click="handleClick">
			<p></p>
			<el-tab-pane v-for="(item, key) in tabPaneList"
				:key="key" :label="item.label" :name="item.name">
				<!-- <span v-if="key == 5 " slot="label"><i class="tab6Icon el-icon-date"></i>配置虚业绩</span> -->
				<p class="textP">
					<am-icon name="info"></am-icon>
					门店提成数据基于此页面设置，请选择对应方案进行分配
				</p>

				<div class="tabDiv" v-if="storeDataCopy.length > 0 && tabPaneType == key && allPlanList.length > 0">
					<el-table :data="storeDataCopy" border style="width: 100%" stripe>
						<el-table-column
							prop="name"
							label="门店名称">
						</el-table-column>
						<el-table-column class="storePlanList"
							prop="showPlanList"
							label="门店提成方案">

							<template slot-scope="scope">
								<div v-if="!scope.row.edit">
									<div v-if="scope.row.showPlanList.length > 0">
										<p v-for="(item, key) in scope.row.showPlanList" :key="key">
											<PlanType :type="item.isBonus"></PlanType>
											{{item.name}}
										</p>
									</div>
									<p v-else>-</p>
								</div>

								<div v-else>
									<!-- :multiple-limit="4" -->
									<el-select popper-class="storeConfigPlanSelect" v-model="checkId" 
										multiple collapse-tags placeholder="请选择"
										@change="storeConfigPlanSelectFun">
										<el-option 
											v-for="item in allPlanList"
											:key="item.id"
											:label="item.name"
											:value="item.id">
											<PlanType :type="item.isBonus"></PlanType>
											{{item.name}}
											<span v-if="item.showNow == scope.row.id" class="now">当前</span>
											<span class="bianji" @click="goto({e : $event, id: item.id})">
												<am-icon name="bianji"></am-icon>
											</span>
										</el-option>
									</el-select>
									<el-popover
										width="300"
										trigger="hover">
										<p>门店可配置1种主方案和最多3种额外奖励方案；</p>
										<am-icon slot="reference" name="info"></am-icon>
									</el-popover>
								</div>
							</template>
						</el-table-column>

						<el-table-column
							prop="employees"
							label="门店员工提成方案">
							<template slot-scope="scope">
								<div v-if="!scope.row.edit">
									<div v-if="scope.row.employees.length > 0" 
										v-for="(item, key) in scope.row.employees" :key="key">
										<PlanType :type="item.isBonus"></PlanType>
										{{item.name}} - {{item.planName}}
									</div>
									<p v-if="scope.row.employees.length == 0">-</p>
								</div>
								
								<div v-else>
									<el-button size="small"
										@click="popShowFun({index: scope.$index, row : scope.row})">员工</el-button>
									<el-popover
										width="300"
										trigger="hover">
										<p>员工可单独配置1种主方案和最多3种额外奖励方案；</p>
										<p>一旦员工有独立启用的方案，以员工的主方案为准+员工额外奖励方案+门店额外奖励方案的模式来计算提成；</p>
										<p>没有独立启用方案的员工按门店启用的方案来计算提成。 </p>
										<am-icon slot="reference" name="info"></am-icon>
									</el-popover>

									<div v-if="scope.row.editafterUserList.length > 0" 
										v-for="(item, key) in scope.row.editafterUserList" :key="key">
										<PlanType :type="item.isBonus"></PlanType>
										{{item.name}} - {{item.planName}}
									</div>

								</div>

							</template>
						</el-table-column>
						
						<el-table-column class-name="oper" label="操作">
							<template slot-scope="scope" v-loading="postLoading" >
								<div v-if="!scope.row.edit">
									<el-button class="assign" size="mini"
										@click="handleEdit({index: scope.$index, row : scope.row})">分配方案</el-button>
										<el-checkbox class="openNew"
											v-model="scope.row.enabledNewBonusModel" @change="newExtractFun({index: scope.$index, row : scope.row})">开启新提成</el-checkbox>
								</div>
							
								<div v-else>
									<el-button size="small" plain type="info"
										@click="cancelFun({index: scope.$index, row : scope.row})">取消</el-button>
									<el-button size="small" type="primary"
										@click="saveFun({index: scope.$index, row : scope.row})">保存</el-button>
								</div>

							</template>
						</el-table-column>
					</el-table>
				</div>
				
				<div v-if="allPlanList.length == 0">
					<p>您还没有配置 {{item.label}} 提成方案</p>
				</div>

			</el-tab-pane>
		</el-tabs>

		<div class="back_button">
			<el-button @click="back" size="small">返回提成配置</el-button>
		</div>

		<PopModelStaff v-if="dialogVisible" @sureAfter="sureAfter" 
			:shopData="clickData"
			:allPlanList="allPlanList"
			:shopUserList="shopUserList"/>

		<!-- <el-dialog custom-class="staffDialog"
			title="选择门店员工"
			:visible.sync="dialogVisible"
			width="40%"
			:before-close="handleClose">
			<PopModelStaff @sureAfter="sureAfter" v-if="dialogVisible" ref="mychild" 
				:shopData="clickData"
				:allPlanList="allPlanList"
				:shopUserList="shopUserList"/>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="sureFun">确 定</el-button>
			</span>
		</el-dialog> -->

	</div>
</template>
<script>
/* eslint-disable */
import Dayjs from 'dayjs'
import FindIndex from 'lodash.findindex'
import PopModelStaff from '#/components/pop-model/staff'
import PlanType from '#/components/label-content/planType'
import Com from '../com'

import MetaDataMixin from '#/mixins/meta-data'

export default {
	name: "storeConfig",
	mixins: [MetaDataMixin],
	components: {
		PopModelStaff,
		PlanType,
	},
	data() {
		return {
			initLoading: true,
			postLoading: false,
			dialogVisible: false,
			editIng: false,  //编辑中
			tabPaneList: [
				{ label : '项目', name: 't0', type: 0 },
				{ label : '卖品', name: 't1', type: 1 },
				{ label : '开卡', name: 't2', type: 2 },
				{ label : '充值', name: 't3', type: 3 },
				{ label : '套餐销售', name: 't4', type: 4 },
				// { label : '配置虚业绩', name: 't5', type: 5 },
			],
			activeName: null,
			tabPaneType: null,
			storeData:[],
			storeDataCopy : [],
			shopUserList: [], //门店员工
			allPlanList : [],
			userChecks: [],
			newExtract: true,
			checkId:[],
			checkIdObj : {},
			index: null,
			clickData : null, //存储点击分配方案时对像
			postData : [],
			fromChildData: null,
		}
	},
	computed: {
		
	},
	created() {
		let list = [1,2,3,4,5];
		list = list.filter( (k, v, arr) => {
			return k > 3;
		})
		console.log(list);
	},
	watch: {
		activeName(newV , oldV) {
			console.log(newV, oldV);
			if(oldV != null && newV != oldV) {
				let params = {
					parentShopId : this.shopId,
					type: this.tabPaneType, //0.项目 1.卖品 2.开卡 3.充值 4.套餐销售
					proposalId: -1,
				}
				this.getData(params);
			} 
		}
	},
	async mounted() {
		this.initLoading = true;
		let res = await this.$http.post('/metedata!reservationMetadata.action', {});
		this.initLoading = false;
		let resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		//获取路由type
		let routerType = this.$route.params.type;
		if(routerType) {
			this.activeName = `t${routerType}`;
			this.tabPaneType = routerType;
		}else {
			this.activeName = 't0';
			this.tabPaneType = 0;
		}
	},
	methods: {
		nowPlan(index) {
			let list = [];

			this.allPlanList.forEach( k => {
				list.push(k.id);
			});

		},

		splicData(params) {
			const dataPromise = new Promise((reslove, reject) => {
				let obj = {};
				Promise.all([
					this.$http.get(`/shop/proposal!proposals.action`, {'params' : params}),
					this.$http.get(`/shop/proposal!shopsWithProposals.action`, {'params' : params}),
				]).then((result) => {
					result.forEach((k,v,arr)=> {
						let { code, content } = k.data;
						if(code === 0) {
							switch(v) {
								case 0:
									obj.allPlanList = content;  //所有方案
								break;
								case 1:
									//门店过滤
									obj.shopList = this.shopSplit(content);
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
		shopsWithProposalsApi(parmas) {
			this.singleLoding = true;
			this.$http.get(`/shop/proposal!shopsWithProposals.action`, {'params': parmas }).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.shopDataFun({'shopList': this.shopSplit(content)});
				}
			})
		},
		shopUserListApi(params) {
			console.log(params);
			this.singleLoding = true;
			this.$http.post(`/employee!list.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					let objArr = [];
					content.forEach(k=> {
						let obj = {
							id: k.no,
							name: k.name,
							planList : [],
							zhu: [],
							j:[],
							dutyname: k.barberLevelName ? k.barberLevelName : null,
						}
						this.clickData.employeesPlanList.forEach(k1=> {
							if(k1.employeeNos.indexOf(`,${k.no},`) != -1){
								obj.planList.push(k1.name);  	
								if(k1.isBonus == 0) {
									obj.zhu.push({id:k1.id, name: k1.name, isBonus : k1.isBonus});
								}else {
									obj.j.push({id:k1.id, name: k1.name, isBonus : k1.isBonus});
								}
							}
						})
						objArr.push(obj);
					})
					this.shopUserList = objArr;
					this.dialogVisible = true;
				}
			})
		},

		getData(params) {
			this.splicData(params).then(data=> {
				const { shopList, allPlanList } = data;
				this.allPlanList = [];
				this.allPlanList = data.allPlanList;

				if(shopList) {
					this.shopDataFun({'shopList': shopList});
				}
			});
		},
		
		shopDataFun(data) {
			this.storeDataCopy = [];
			let obj = null,
				objArr = [];
			//门店
			data.shopList.forEach(k=> {
				obj = {
					id: k.id,
					name: k.osname || k.name,
					enabledNewBonusModel: k.enabledNewBonusModel,
					storePlanList : k.proposals
				};

				objArr.push(obj);
			});
			this.storeData = objArr;

			this.storeData.forEach((k)=> {
				let showPlanList = [],
					employees = [],
					employeesPlanList = [];

				if(k.storePlanList.length > 0) {
					k.storePlanList.forEach((k1)=> {
						if(k1.employees && k1.employees != null) {
							k1.employees.forEach((k2)=> {
								let obj = {
									...k1,
									planName : k1.name,
									...k2
								}
								delete obj.employees;
								employees.push(obj);
							})
							employeesPlanList.push({
								isBonus: k1.isBonus,
								name: k1.name,
								id: k1.id,
								employeeNos: k1.employeeNos
							})
						}else {
							showPlanList.push(k1);
						}
					});
				}

				let editUserlist = [];
				employees.forEach( k => {
					editUserlist.push(
						{
							id: k.id,
							name: k.name,
							isBonus: k.isBonus,
							planName: k.planName
						}
					)
				});

				this.storeDataCopy.push({
					...k,
					'showPlanList' : showPlanList,
					'employeesPlanList' : employeesPlanList,
					'employees' : employees,
					editBeforeUserList: editUserlist,
					editafterUserList: editUserlist
				});
			})
			console.log(data.shopList, this.storeDataCopy.employeesPlanList);
		},
		shopSplit(data) {
			let shopIds = this.userInfo.shopIds.split(','),
			list = [];
			shopIds.forEach( k => {
				data.forEach( k1 => {
					if(k == k1.id) {
						list.push(k1);
					}
				})
			})
			return list;
		},
		handleClick(tab, event) {
			this.editIng = false;
			this.tabPaneType = Com.tabType({list : this.tabPaneList, val : this.activeName});
		},
		handleEdit(data) {
			const { index, row } = data;
			console.log(row);

			if(!this.editIng) {				
				this.editIng = true;
				this.checkId = [];
				this.index = index;
				this.clickData = row;
				this.userChecks = [];

				this.allPlanList.forEach( k => {
					delete k.showNow;
				}) 

				//门店受用方案
				row.storePlanList.forEach(k => {
					if(k.employees == null) {
						this.allPlanList.forEach( k1 => {
							if(k.id === k1.id) {
								k1.showNow = row.id;
							}
						}) 
						this.checkId.push(k.id);
					}
				});
				this.$set(row, 'edit', true);
			}else {
				this.$confirm('您有数据正在编辑中, 点击确定执行保存, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.saveFun({index : this.index, row: this.clickData});
				}).catch(() => {});
			}
		},
		cancelFun(data) {
			const { index, row } = data;
			this.editIng = false;
			this.fromChildData = null;
			console.log(row, 'edit');
			this.$set(row, 'edit', false);

			this.storeDataCopy[this.index].editafterUserList = JSON.parse(JSON.stringify(this.storeDataCopy[this.index].editBeforeUserList));
		},
		saveFun(data) {
			const { index, row } = data;

			let planLength = this.planLength();
			//主方案1 奖励3
			if(planLength) {

				this.$message({
					type: 'warning',
					message: '门店提成方案超出限制:主方案最多选择一个，奖励方案最多选择三个!'
				});
				return
			}else {}

			let checkIdArr = [];
			if(this.checkId.length>0) {
				this.checkId.forEach(id => {
					let planDataIndex = FindIndex(this.allPlanList, item => item.id === id);
					let planData = this.allPlanList[planDataIndex];
					const {
						isBonus
					} = planData;
					checkIdArr.push({id, isBonus});
				})
			}

			// if(JSON.stringify(this.userChecks) != '[]') {
			// 	if(employeesPlanList.length > 0) {  
			// 		employeesPlanList.forEach((k, v, arr)=> {
			// 			if(this.userChecks.id == k.id) {
			// 				if(this.userChecks.employeeNos.length > 0) {  //this.userChecks.employeeNos的长度不为空时才赋值
			// 					employeesPlanList[v] = this.userChecks;
			// 				}else {
			// 					employeesPlanList.splice(v, 1);
			// 				}
			// 			}else {
			// 				if(this.userChecks.employeeNos.length > 0) {  //this.userChecks.employeeNos的长度不为空时才赋值
			// 					employeesPlanList.push(this.userChecks);
			// 				}
			// 			}
			// 		})
			// 	}else {
			// 		//一个员工也未设置的情况
			// 		employeesPlanList.push(this.userChecks);
			// 	}				
			// }
			
			let employeesPlanList = this.storeDataCopy[index].employeesPlanList;
			let userList = JSON.stringify(this.userChecks) != '[]' ? this.userChecks : employeesPlanList,
				userListAfter = [];

			userList.forEach(k=> {
				if(k.employeeNos != null && k.employeeNos.length > 1) {
					let planDataIndex = FindIndex(this.allPlanList, item => item.id === k.id);
					let planData = this.allPlanList[planDataIndex];
					const {
						isBonus
					} = planData;
					let obj = {
						id : k.id,
						isBonus,
						employeeNos : k.employeeNos
					};
					userListAfter.push(obj)
				}
			})

			this.postData = [];
			this.postData.push({
				type: this.tabPaneType,
				id: this.clickData.id,  //门店ID
				proposals: [
					...checkIdArr,
					...userListAfter
				]
			});
			let params = this.postData;

			this.$http.post(`/proposal!saveShopWithProposal.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.$message({
						type: 'success',
						message: '保存成功!'
					});
					this.userChecks = [];
					this.editIng = false;
					this.$set(row, 'edit', false);

					let params_1 = {
						parentShopId : this.shopId,
						type: this.tabPaneType, //0.项目 1.卖品 2.开卡 3.充值 4.套餐销售
						proposalId: -1,
					}
					this.shopsWithProposalsApi(params_1);
				}
			});
		},
		newExtractFun(data) {
			//门店新提成启用开关
			const { index, row } = data;
			let params = {
				"parentShopId": this.userInfo.parentShopId,
				"shopid": row.id,
				"moduleid": 1,
				"configs":[{
					"configKey":"enabledNewBonusModel",
					"configValue": row.enabledNewBonusModel ? 1 : 0     //0关闭 1开启
				}]
			}
		
			this.$http.post(`/meiyike/config!addnormalconfig.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.$message({
						type: 'success',
						message: '设置成功!'
					});
					
				}
			});
		},
		planLength() {
			let planArr = [],
				planObj = {};
			this.checkId.forEach(k=> {
				this.allPlanList.forEach(k1=> {
					if(k == k1.id) {
						planArr.push(k1);
					}
				});
			})
			planArr.forEach((k,v,a)=> {
				var s = k.isBonus ? 'j' : 'zhu';
				var r = planObj[s];
				if(r){
					planObj[s] +=1;
				}else{
					planObj[s] = 1;
				}
			})
			if(planObj.j > 3 || planObj.zhu > 1) {
				return true;
			}else {
				return false;
			}
		},
		popShowFun() {
			let parmas = {
				parentshopid: this.shopId,
				shopid: this.clickData.id
			};
			this.shopUserList = this.shopUserListApi(parmas);
		},
		sureAfter(data) {
			if(data) {
				this.userChecks = data.userChecks;
				
				let list = [];
				data.userChecks.forEach( k => {
					if (k.employeeNos != ',') {
						let userList = Com.idStringToArr(k.employeeNos);
						userList.forEach( k1 => {
							let index = FindIndex(this.shopUserList, item => item.id === k1);
							if (index >= 0) {
								list.push({
									id: this.shopUserList[index].id,
									name: this.shopUserList[index].name,
									isBonus: k.isBonus,
									planName: k.planName
								})
							}
						})
					}
				});

				this.storeDataCopy[this.index].editafterUserList = list;
			}else {}
			this.dialogVisible = false;
		},
		goto(data) {
			const { e, id } = data;
			e.stopPropagation();

			// this.$router.replace({
			// 	name: 'Index',
			// 	params: {
			// 		parentshopId: this.shopId,
			// 		type: this.tabPaneType,
			// 		planId: id
			// 	}
			// })

			if (window.origin.indexOf('localhost') !== -1) {
				this.$router.replace({
					name: 'Index',
					params: {
						parentshopId: this.shopId,
						type: this.tabPaneType,
						planId: id
					}
				})
			} else {
				window.parent.frames.location.href = `${window.origin}/shair/gainPlan!newGainConfig.action`;
			}

			// if (window.origin.indexOf('localhost') !== -1) {
			// 	this.$router.replace({
			// 		name: 'Index',
			// 		params: {
			// 			parentshopId: this.shopId,
			// 			type: this.tabPaneType,
			// 			planId: id
			// 		}
			// 	})
			// } else {
			// 	window.parent.frames.location.href = `${window.origin}/shair/gainPlan!newGainConfig.action`;
			// 	setTimeout( () => {
			// 		this.$router.replace({
			// 		name: 'Index',
			// 			params: {
			// 				parentshopId: this.shopId,
			// 				type: this.tabPaneType,
			// 				planId: id
			// 			}
			// 		})
			// 	}, 200)
			// }
		},
		storeConfigPlanSelectFun(val){
			let zhuList = [],
				jList = [];

			val.forEach( item => {
				this.allPlanList.forEach( itemB => {
					if(item === itemB.id && itemB.isBonus === 0) {
						zhuList.push(item);
					}else if (item === itemB.id && itemB.isBonus === 1) {
						jList.push(item);
					}
				});
			});
			// console.log(zhuList, jList);
			if (jList.length > 3) {
				jList = jList.slice(jList.length - 3, jList.length);
			}
			this.checkId = [zhuList[zhuList.length - 1], ...jList];
		}, 
		back() {
			if (window.origin.indexOf('localhost') !== -1) {
				this.$router.replace({path: '/'});
			} else {
				window.parent.frames.location.href = `${window.origin}/shair/gainPlan!newGainConfig.action`;
			}
		}

	},
	
}
</script>

<style lang="less">
	.el-main {
		width: 100%;
		height: 100%;
		padding: 0;
	}
	.el-main.default {
		height: auto;
		padding: 20px;
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
	.el-scrollbar__view.default-scrollbar__view {}
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
		.is-top {
			.el-tabs__item.is-top:nth-child(2) {
				padding-left: 21px; 
			}
			.el-tabs__item.is-top:last-child {
				padding-right: 21px;
			}
		}
		 
		.openNew {
			margin-left: 10px;
			color: #a9a9a9;
			.el-checkbox__label {
				padding-left: 5px;
				font-size: 12px;
			}
		}
	}

	.storeConfigPlanSelect {
		.el-scrollbar {
			.el-select-dropdown__list {
				li.el-select-dropdown__item {
					padding-right: 30px;
					.now {
						position: absolute;
						right: 45px;
						color: #B8B8B8;
					}
					.bianji {
						position: absolute;
						right: 10px;
						color: #B8B8B8;
					}

					&:after {
						right: 30px;
					}
				}

			}
		}	
	}

	.storeConfig {
		.oper {
			.cell {
				text-align: center;
			}
		}
		
		.staffDialog {
			.el-dialog__footer {
				text-align: left;
			}
		}
	}

	.back_button {
		position: absolute;
		right: 10px;
		top: 12px;
	}
	
	
</style>

<style lang="less" scoped>
	.storeConfig {
		padding-top: 16px;
		background: #fff;
		.indexTabs {
			.textP {
				padding: 15px 13px;
				// color: #EEE;
			}
			.tabDiv {
				padding: 0 13px;
			}
			.assign {
				color: #fff;
				background-color: #9c30a0;
				border: 0px solid #fff;
			}
			
		}
	}
</style>
