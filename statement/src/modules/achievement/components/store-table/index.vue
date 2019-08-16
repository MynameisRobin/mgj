<template>
	<div class="storetable">
		<p class="textP">
			<am-icon name="info"></am-icon>
			门店业绩数据基于此页面设置，请选择对应方案进行分配
		</p>

		<div class="tabDiv" v-if="storeDataCopy.length > 0 && allPlanList.length > 0">
			<el-table :data="storeDataCopy" border style="width: 100%" stripe>
				<el-table-column
					prop="name"
					label="门店名称">
				</el-table-column>
				<el-table-column class="storePlanList"
					prop="showPlanList"
					label="门店业绩方案">

					<template slot-scope="scope">
						<div v-if="!scope.row.edit">
							<div v-if="scope.row.showPlanList.length > 0">
								<p v-for="(item, key) in scope.row.showPlanList" :key="key">
									<!-- <PlanType :type="item.isBonus"></PlanType> -->
									{{item.name}}
								</p>
							</div>
							<p v-else>-</p>
						</div>

						<div v-else>
							<!-- :multiple-limit="4" -->
							<el-select popper-class="storeConfigPlanSelect" v-model="checkObj.checkId" placeholder="请选择">
								<el-option 
									v-for="item in allPlanList"
									:key="item.id"
									:label="item.name"
									:value="item.id"
									:title="item.name">
									<!-- <PlanType :type="item.isBonus"></PlanType> -->
									{{item.name | cutString(20)}}
									<span v-if="item.showNow == scope.row.id" class="now">当前</span>
									<span class="bianji" @click="goto({e : $event, id: item.id})">
										<am-icon name="bianji" title="跳转配置"></am-icon>
									</span>
								</el-option>
							</el-select>
							<el-popover
								width="200"
								trigger="hover">
								<!-- <p>门店可配置1种主方案和最多3种额外奖励方案；</p> -->
								<p>门店可配置1种主方案；</p>										
								<am-icon slot="reference" name="info"></am-icon>
							</el-popover>
						</div>
					</template>
				</el-table-column>

				<!-- <el-table-column
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
				</el-table-column> -->
				
				<el-table-column class-name="oper" label="操作">
					<template slot-scope="scope" v-loading="postLoading" >
						<div v-if="!scope.row.edit">
							<el-button class="assign" size="mini"
								@click="handleEdit({index: scope.$index, row : scope.row})">分配方案</el-button>
								<el-checkbox class="openNew"
									v-model="scope.row.enabledNewPerfModel" @change="newExtractFun({index: scope.$index, row : scope.row})">
									开启新业绩
								</el-checkbox>
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
			<p>您还没有配置 业绩 方案</p>
		</div>
	</div>
</template>

<script>
import FindIndex from 'lodash.findindex'
import Com from '../../com'
// import PlanType from '#/components/label-content/planType'
import MetaDataMixin from '#/mixins/meta-data'
export default {
	name: 'storeTable',
	mixins: [MetaDataMixin],
	props: {
		storeDataCopy: Array,
		allPlanList: Array,
		userChecks: Array
	},
	components: {
		// PlanType	
	},
	computed: {
		gotoShow() {
			return window.location.pathname.indexOf(`gainPlan!newPerfStoreConfig.action`) === -1 ? true : false;
		},
		routeParams() {
			return this.$route.params;
		}	
	},
	watch: {
		'$route'() {
			this.postData = {};
			this.index = null;
			this.editIng = false;
			// Object.assign(this.$data, this.$options.data());
		}
	},
	data() {
		return {
			postData: {},
			index: null,
			clickData: {},
			checkObj: null,
			editIng: false,  // 编辑中
		}
	},
	mounted() {
		
	},
	methods: {
		handleEdit(data) {
			const { index, row } = data;
			console.log(row);

			if (!this.editIng) {				
				this.editIng = true;
				this.index = index;
				this.clickData = row;

				this.allPlanList.forEach( k => {
					delete k.showNow;
				}) 

				// 门店受用方案
				// row.storePlanList.forEach(k => {
				// 	if (k.employees === null) {
				// 		this.allPlanList.forEach( k1 => {
				// 			if (k.id === k1.id) {
				// 				k1.showNow = row.id;
				// 			}
				// 		}) 
				// 		this.checkId.push(k.id);
				// 	}
				// });
	
				this.checkObj = {
					checkId: row.storePlanList.length > 0 ? row.storePlanList[0].id : null,
					isBonus: row.storePlanList.length > 0 ? row.storePlanList[0].isBonus : null
				}

				this.$set(row, 'edit', true);

				this.$emit('editItem', this.index);
			} else {
				this.$confirm('您有数据正在编辑中, 点击确定执行保存, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.saveFun({index: this.index, row: this.clickData});
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

			let _index = FindIndex(this.allPlanList, item => item.id === this.checkObj.checkId),
				plan = [];
			if (_index !== -1) {
				let data = this.allPlanList[_index];
				plan.push({
					id: data.id,
					isBonus: data.isBonus
				});
			}
			
			this.postData = [];
			this.postData.push({
				type: this.routeParams.type,
				id: this.clickData.id,  // 门店ID
				proposals: [...plan]
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
					this.editIng = false;
					this.$set(row, 'edit', false);

					this.$emit('storetableSave');
				}
			});
		},
		newExtractFun(data) {
			// 门店新提成 新业绩 启用开关
			const { index, row } = data;
			let params = {
				"parentShopId": this.parentShopId,
				"shopid": row.id,
				"moduleid": 1
			}
			params.configs = [{
				"configKey": "enabledNewPerfModel",
				"configValue": row.enabledNewPerfModel ? 1 : 0     // 0关闭 1开启
			}]		
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
		goto(data) {
			const { e, id } = data;
			e.stopPropagation();

			if (window.parent.frames.location.href.indexOf(`gainPlan!newPerfConfig.action`) !== -1 || window.origin.indexOf('localhost') !== -1 ) {
				this.$router.replace({
					path: `/indexConfigure/${this.routeParams.type}/${id}`,
				});
			} else {
				window.parent.frames.location.href = `${window.origin}/shair/gainPlan!newPerfConfig.action`;
			}
		},
		popShowFun() {
			let parmas = {
				parentshopid: this.$parent.shopId,
				shopid: this.clickData.id
			};
			this.shopUserListApi(parmas);
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
					content.forEach(k => {
						let obj = {
							id: k.no,
							name: k.name,
							planList: [],
							zhu: [],
							j: [],
							dutyname: k.barberLevelName ? k.barberLevelName : null,
						}
						this.clickData.employeesPlanList.forEach(k1 => {
							if ( k1.employeeNos.indexOf(`,${k.no},`) !== -1) {
								obj.planList.push(k1.name);  	
								if (k1.isBonus === 0) {
									obj.zhu.push({id: k1.id, name: k1.name, isBonus: k1.isBonus});
								} else {
									obj.j.push({id: k1.id, name: k1.name, isBonus: k1.isBonus});
								}
							}
						})
						objArr.push(obj);
					})
					// this.shopUserList = objArr;
					// this.dialogVisible = true;
					let obj = {
						clickData: {...this.clickData},
						shopUserList: [...objArr]
					}
					this.$emit('popShowFun', obj);

				}
			})
		},
	}
}
</script>

<style lang="less" scoped>
	.storetable {
		.textP {
			padding: 15px 13px;
		}
		.tabDiv {
			padding: 0 13px;
		}
		.assign {
			color: #fff;
			background-color: #9c30a0;
			border: 0px solid #fff;
		}
		.bianji {
			position: absolute;
			right: 20px;
			color: #b8b8b8;
		}	

		.el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
			right: 40px;
		}
	}
</style>


