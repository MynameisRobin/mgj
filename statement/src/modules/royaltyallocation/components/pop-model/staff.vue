<template>
	<el-dialog custom-class="staffDialog"
		title="选择门店员工"
		:visible.sync="show"
		width="670px"
		:before-close="handleClose">
			<div class="staff" v-if="copyShopData">
				<el-table
					ref="multipleTable"
					:data="copyShopUserList"
					:row-class-name="checkClass"
					style="width: 100%"
					height="250"
					@select-all="selectAll"
					@select="selectFun"
					@selection-change="handleSelectionChange">

					<el-table-column
						type="selection"
						width="30">
					</el-table-column>

					<el-table-column
						fixed
						class-name="no"
						prop="id"
						label="编号"
						width="80">
					</el-table-column>

					<el-table-column
						fixed
						class-name="name"
						prop="name"
						label="姓名"
						width="100">
						<template slot-scope="scope">
							<span :title="scope.row.name">{{ scope.row.name | cutString(10) }}</span>
						</template>
					</el-table-column>

					<el-table-column
						width="100"
						class-name="title"
						prop="dutyname"
						label="级别"
						show-overflow-tooltip>
						<template slot-scope="{ row }">
							<span v-if="row.dutyname" :title="row.dutyname">{{ row.dutyname | cutString(12) }}</span>
							<span v-else>-</span>
						</template>
					</el-table-column>

					<el-table-column
						class-name="plan"
						prop="planList"
						label="当前方案">
						<template slot-scope="scope">
							<p v-if="scope.row.planList && scope.row.planList.length > 0" 
								v-for="(item, key) in scope.row.planList" :key="key">
								{{item}}
							</p>
							<p v-if="scope.row.planList && scope.row.planList.length == 0">-</p>
						</template>
					</el-table-column>

				</el-table>

				<div class="selectDiv">
					<p class="title">选择方案</p>
					<div>
						<PlanType :type="isBonus"></PlanType>
						<el-select v-model="planId" placeholder="请选择"
							@change="planChangeFun">
							<el-option
								v-for="(item) in allPlanListCopy"
									:key="item.id"
									:label="item.name"
									:value="item.id">
							</el-option>
						</el-select>

						<span>方案分配给选择员工</span>
					</div>
				</div>
			</div>
		<span slot="footer" class="dialog-footer">
			<el-button type="primary" @click="sureFun">确 定</el-button>
		</span>
	</el-dialog>

</template>

<script>
/* eslint-disable */
import FindIndex from 'lodash.findindex'
import Com from '../../com'
import PlanType from '../label-content/planType'

export default {
	name: "popModelStaff",
	components: {
		PlanType
	},
	props: {
		shopData: Object,
		allPlanList: Array,
		shopUserList: Array
	},
	data() {
		return {
			show: true,
			firstPlan: null, //当前方案
			isBonus : null,
			planId : null,
			copyShopData: {},
			copyShopUserList: [],
			multipleSelection: [],
			allPlanListCopy: [],
			planObj: {
				zhu: '',
				j: ''
			},
			planObjStr : {}
		}
	},
	computed: {
		// copyShopData() {
		// 	return JSON.parse( JSON.stringify(this.shopData));
		// },
		// copyShopUserList() {
		// 	return JSON.parse( JSON.stringify(this.shopUserList));
		// }
	},
	created() {	
	},
	mounted() {

		// var arr = [123, 55, 2, 123, 55, 1, 55];
		// var map = {};

		// arr.forEach((k,v,a)=> {
		// 	var s = a[v];
		// 	var r = map[s];

		// 	if(r){
		// 	map[s] +=1;
		// 	}else{
		// 	map[s] = 1;
		// 	}
		// })
		// console.log(JSON.stringify(map));

		this.copyShopData = JSON.parse( JSON.stringify(this.shopData));
		this.copyShopUserList = JSON.parse( JSON.stringify(this.shopUserList));
		this.allPlanListCopy = JSON.parse( JSON.stringify(this.allPlanList));

		let idArr = [];
		this.copyShopData.employeesPlanList.forEach(k=>{
			idArr.push(k.id);
		})

		this.allPlanListCopy.forEach(k=> {
			if(idArr.indexOf(k.id) == -1) {
				k.employeeNos = ','
				this.copyShopData.employeesPlanList.push(k);
			}
		})
		
		this.employeesPlanLength();

		this.initFun();
	},
	methods: {
		initFun() {
			console.log('staff init');
			this.firstPlan = this.allPlanList[0];
			this.isBonus = this.allPlanList[0].isBonus;
			this.planId = this.allPlanList[0].id;

			if(this.copyShopData.employees.length > 0 ) {
				this.toggleSelection(this.autoCheck());
			}else {}
		},
		employeesPlanLength() {
			this.planObj = {
				zhu: '',
				j: ''
			};

			//循环已选择员工方案
			this.copyShopData.employeesPlanList.forEach(k=> {
			
				let str = k.employeeNos.substr(1, k.employeeNos.length-1);
				if(k.isBonus == 0) {
					this.planObj.zhu += str;
				}else {
					this.planObj.j += str;
				}
			})

			this.planObj.zhu = this.planObj.zhu.length > 0 ? this.planObj.zhu.substr(0, this.planObj.zhu.length-1).split(',') : '';
			this.planObj.j = this.planObj.j.length > 0 ? this.planObj.j.substr(0, this.planObj.j.length-1).split(',') : '';

			let zhuMap = {},
				jMap = {};
			let _that = this;

			function forFun(data) {
				const { obj, map } = data;
				_that.planObj[obj].forEach((k,v,a)=> {
					var s = a[v];
					var r = map[s];
					if(r){
						map[s] +=1;
					}else{
						map[s] = 1;
					}
				});
			}
			if(this.planObj.zhu.length > 0) {
				forFun({obj: 'zhu', map: zhuMap});
			}
			if(this.planObj.j.length > 0) {
				forFun({obj: 'j', map: jMap});
			}

			this.planObjStr = {
				zhu: zhuMap,
				j: jMap
			};
			console.log(JSON.stringify(zhuMap), JSON.stringify(jMap));
			for(let i in zhuMap) {
				if(zhuMap[i] > 1) {
					return {type : 'zhu', no : i};
				}
			}
			for(let a in jMap) {
				if(jMap[a] > 3) {
					return {type : 'j', no : a};
				}
			}
		},
		selectAll(selection) {
			const { employeesPlanList } = this.copyShopData;
			const currentIndex = FindIndex(employeesPlanList, item => item.id === this.firstPlan.id);
			if(selection.length == 0) {
				this.copyShopData.employees.forEach(k => {
					k.check = 0;
				});
				this.firstPlan.employeeNos = '';
			}else {
				selection.forEach(k => {
					k.check = 1;
				});
				this.firstPlan.employeeNos = `,${selection.map(item => item.id).join(',')},`
			}
			employeesPlanList[currentIndex].employeeNos = this.firstPlan.employeeNos;
		},
		selectFun(selection, row){
			console.log(selection, row);
			// if(planL) {
			// 	this.toggleSelection([row]);
			// 	this.planObj[planL.type].pop();

			// 	let str = planL.type == 'zhu' ? '主' : '奖励';
			// 	this.$message({
			// 		message: `方案超出限制:编号${planL.no}的员工的${str}方案超出限制，主方案最多一个，奖励方案最多三个！`,
			// 		type: 'warning'
			// 	});
			// 	return
			// }

			if(row.check) {
				this.copyShopData.employeesPlanList.forEach((k,v,arr)=> {
					if(k.id == this.firstPlan.id) {
						if(k.employeeNos.length > 0) {		
							arr[v].employeeNos = k.employeeNos.replace(`,${row.id},`, `,`);
						}else {
							arr[v].employeeNos = ``;
						}
					}
					// if(arr[v].employeeNos == ',') {
					// 	arr.splice(v,1);
					// }
				})

				// if(this.isBonus == 0) {
				// 	row.zhu.pop();
				// }else{
				// 	row.j.pop();
				// }
				row.check = 0;

			}else {
				let planType = this.firstPlan.isBonus ? 'j' : 'zhu';
				let str = planType == 'zhu' ? '主' : '奖励';

				if(planType == 'j') {
					if(this.planObjStr[planType][row.id] == 3) {
						this.toggleSelection([row], true);
						this.planObj[planType].pop();
						this.$message({
							message: `方案超出限制:编号 ${row.id} 的员工的${str}方案超出限制，主方案最多一个，奖励方案最多三个！`,
							type: 'warning'
						});
						return false;
					}
				}else {
					if(this.planObjStr[planType][row.id] == 1) {
						this.toggleSelection([row], true);
						this.planObj[planType].pop();
							this.$message({
							message: `方案超出限制:编号${row.id}的员工的${str}方案超出限制，主方案最多一个，奖励方案最多三个！`,
							type: 'warning'
						}); 
						return false;
					}
				}
				
				let arr = this.copyShopData.employeesPlanList;
				for(let i = 0; arr.length > i; i++) {
					if(arr[i].id == this.firstPlan.id) {
						if(arr[i].employeeNos.length > 0) {
							arr[i].employeeNos += `${row.id},`;
						}else {
							arr[i].employeeNos = `,${row.id},`;
						}
					}
				}

				// if(this.isBonus == 0) {
				// 	row.zhu.pop();
				// 	row.zhu.push({isBonus: this.isBonus, id: this.planId});
				// }else{
				// 	row.j.pop();
				// 	row.j.push({isBonus: this.isBonus, id: this.planId});
				// }

				row.check = 1;
			}

			let planL = this.employeesPlanLength();

		},
		checkClass(row) {
			if (row.row.check == 1) {
				return 'checkClass'
			} else {
				return ''
			}
		},
		autoCheck() {
			//循环plan里面的员工
			let list = [];
			this.copyShopData.employeesPlanList.forEach(k=> {
				if(k.id == this.firstPlan.id) {  //对比方案id
					let arr = Com.idStringToArr(k.employeeNos);
					if(arr.length) {
						arr.forEach(k1=> {
							this.copyShopUserList.forEach((k2, v2, arr2)=> {
								if(k1 == k2.id) {
									list.push(k2);
								}
							})
						})
					}
				}
			})
			return list;
		},
		toggleSelection(rows, noCheck) {
			this.copyShopUserList.forEach((k)=> {
				//清除样式
				k.check = 0;
			});

			this.$nextTick(function () {
				if (rows) {
					console.log();
					rows.forEach(row => {
						if(!noCheck) {
							row.check = 1;  //添加样式
						}else {}
						this.$refs.multipleTable.toggleRowSelection(row);
					});
				} else {
					this.$refs.multipleTable.clearSelection();
				}
			})
		},
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		planChangeFun(val) {
			this.firstPlan = this.forAllPlanFun(val);

			this.toggleSelection();  //先清空
			this.toggleSelection(this.autoCheck());
		},
		sureFun(e) {
			let userChecks = [];
			this.copyShopData.employeesPlanList.forEach(k=> {
				// if (this.firstPlan.id === k.id) {
				// 	k.employeeNos = this.firstPlan.employeeNos;
				// }
				if(k.employeeNos != null) {
					let obj = {
						id : k.id,
						employeeNos : k.employeeNos,
						planName: k.name,
						isBonus: k.isBonus
					};
					userChecks.push(obj)
				}
			})

			this.$emit('sureAfter', {userChecks: userChecks} );  //保存数据
		},
		forAllPlanFun(val){
			let obj = null;
			this.allPlanList.forEach((k)=> {
				if(k.id == val) {
					this.isBonus = k.isBonus;
					this.planId = val;
					obj = k;
				}
			});
			return obj;
		},
		btnClick() {
			console.log(this.obj);
		},
		handleClose(done){
			this.$confirm('确认关闭？')
			.then(_ => {
				this.$emit('sureAfter'); 
				done();
			})
			.catch(_ => {});
		}
	}
}
</script>

<style lang="less" scope>
	.staff {

		.staffDialog {
			.el-dialog__footer {
				text-align: left;
			}
		}

		.has-gutter {
			div.cell {
				color: #B6B6B6;
			}
			th:nth-of-type(1) {
				.cell {
					display: none;
				}
			}
		}

		.no, .name {
			.cell {
				color: #606266;
			}
		}
		.title, .plan {
			.cell {
				color: #B6B6B6;
			}
		}

		.checkClass {
			.cell {
				color: #00AAEE;
			}
		}

		.selectDiv {
			.title {
				margin-bottom: 10px;
				font-size:13px;
				color: #909090;
			}

		}

	}
</style>
