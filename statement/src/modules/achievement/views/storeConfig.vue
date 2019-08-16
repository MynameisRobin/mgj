<template>
	<div class="statement storeConfig" v-loading="initLoading">

		<!-- <am-sideslip v-if="!initLoading" class="report_sideslip"></am-sideslip> -->

		<Tabs 
			:tabPaneList="tabPaneList"
			:qType="tabPaneType"
			@tabsChange="onTabsChange"
			@tabsBack="onTabsBack"></Tabs>

		<router-view 
			:storeDataCopy="storeDataCopy"
			:allPlanList="allPlanList" 
			:userChecks="userChecks"
			@editItem="onEditItem"
			@storetableSave="onStoretableSave"
			@popShowFun="onPopShowFun"></router-view>

		<PopModelStaff v-if="dialogVisible"  
			:shopData="clickData"
			:allPlanList="allPlanList"
			:shopUserList="shopUserList"
			@sureAfter="sureAfter"/>

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
import Dayjs from 'dayjs'
import FindIndex from 'lodash.findindex'
import Com from '../com'
import MetaDataMixin from '#/mixins/meta-data'
import MapData from '../mapData.js'

import Tabs from '#/components/tabs'
import PopModelStaff from '#/components/pop-model/staff'

export default {
	name: "storeConfig",
	mixins: [MetaDataMixin],
	components: {
		Tabs,
		PopModelStaff,
	},
	watch: {
		'$route'(to, from) {
			this.initFun();
		}
	},
	data() {
		return {
			initLoading: true,
			postLoading: false,
			dialogVisible: false,
			tabPaneType: null,
			storeData: [],
			storeDataCopy: [],
			shopUserList: [], // 门店员工
			allPlanList: [],
			userChecks: [],
			newExtract: true,
			index: null,
			clickData: null, // 存储点击分配方案时对像
			postData: [],
			fromChildData: null,
		}
	},
	computed: {
		routeParams() {
			return this.$route.params;
		},
		tabPaneList() {
			// 获取头部tab数据
			// return [...MapData.tabPaneListFun({modelType: 'achievement', softgenre: this.userInfo.softgenre})];

			let list = [...MapData.tabPaneListFun({modelType: 'achievement', softgenre: this.userInfo.softgenre})];

			// 方案分配中目前不需要显示虚业绩
			if (list.length > 1) {
				list.pop();
			}
			return list;
		},
	},
	created() {
		
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
		// 获取路由type
		this.tabPaneType = this.routeParams.type ? parseInt(this.routeParams.type) : this.tabPaneList[0].type;

		if (!this.routeParams.type) {
			this.$router.replace({
				path: `/StoreConfig/storeTable/${this.tabPaneList[0].type}`
			});
			return;
		}

		this.initFun();
	},
	methods: {
		initFun() {
			let params = {
				parentShopId: this.shopId,
				type: this.tabPaneType,
				proposalId: -1,
			}

			// 重置 数据
			this.index = null;
			this.allPlanList = [];

			this.getData(params);
		},
		onStoretableSave() {

			this.userChecks = [];

			let params_1 = {
				parentShopId: this.shopId,
				type: this.tabPaneType,
				proposalId: -1,
			}
			this.shopsWithProposalsApi(params_1);
		},
		onPopShowFun(data) {
			this.clickData = data.clickData;
			this.shopUserList = data.shopUserList;
			this.dialogVisible = true;
		},
		onEditItem(data) {
			this.index = data;
			this.userChecks = [];
		},
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
					this.$http.get(`/shop/proposal!proposals.action`, {'params': params}),
					this.$http.get(`/shop/proposal!shopsWithProposals.action`, {'params': params}),
				]).then((result) => {
					result.forEach((k, v, arr) => {
						let { code, content } = k.data;
						if (code === 0) {
							switch (v) {
								case 0:
									obj.allPlanList = content;  // 所有方案
									break;
								case 1:
									// 门店过滤
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
		getData(params) {
			this.splicData(params).then(data => {
				const { shopList, allPlanList } = data;
				this.allPlanList = data.allPlanList;

				if (shopList) {
					this.shopDataFun({'shopList': shopList});
				}
			})
		},
		shopDataFun(data) {
			this.storeDataCopy = [];
			let obj = null,
				objArr = [];
			// 门店
			data.shopList.forEach(k => {
				obj = {
					id: k.id,
					name: k.osname || k.name,
					enabledNewBonusModel: k.enabledNewBonusModel,
					enabledNewPerfModel: k.enabledNewPerfModel,
					storePlanList: k.proposals
				};

				objArr.push(obj);
			});
			this.storeData = objArr;

			this.storeData.forEach((k) => {
				let showPlanList = [],
					employees = [],
					employeesPlanList = [];

				if (k.storePlanList.length > 0) {
					k.storePlanList.forEach((k1) => {
						if (k1.employees && k1.employees !== null) {
							k1.employees.forEach((k2) => {
								let obj = {
									...k1,
									planName: k1.name,
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
						} else {
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
					'showPlanList': showPlanList,
					'employeesPlanList': employeesPlanList,
					'employees': employees,
					editBeforeUserList: editUserlist,
					editafterUserList: editUserlist
				});
			})
			// console.log(data.shopList, this.storeDataCopy.employeesPlanList);
		},
		shopSplit(data) {
			let shopIds = this.userInfo.shopIds.split(','),
				list = [];
			for (const i of shopIds) {
				for (const a of data) {
					if (parseInt(i) === a.id) {
						list.push(a);
						break;
					}
				}
			}
			return list;
		},
		onTabsChange(data) {
			this.tabPaneType = data.type;

			this.$router.replace({
				path: `/StoreConfig/storeTable/${this.tabPaneType}`,
			})
		},
		sureAfter(data) {
			if (data) {
				this.userChecks = data.userChecks;
				
				let list = [];
				data.userChecks.forEach( k => {
					if (k.employeeNos !== ',') {
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
			} else {
				// 预留
			}
			this.dialogVisible = false;
		},
		
		onTabsBack() {
			if (window.origin.indexOf('localhost') !== -1) {
				this.$router.replace({path: `/`});
			} else {
				window.parent.frames.location.href = `${window.origin}/shair/gainPlan!newPerfConfig.action`;
			}
		}

	},
	
}
</script>

<style lang="less" scoped>
	li {
		list-style:none;
	}
	.storeConfig {
		padding-top: 16px;
		background: #fff;
	}
</style>
