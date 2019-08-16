<template>
	<div class="customer_distribution" v-loading="initLoading">
		<div class="customer_distribution-selector">
			<el-select
				style="width: 100%"
				filterable
				placeholder="请选择需要操作的门店"
				v-model="postData.shopId"
				@change="handleChangeShop">
				<el-option 
					v-for="shopItem in shopList"
					:key="shopItem.id"
					:label="shopItem.osName"
					:value="shopItem.id">
				</el-option>
			</el-select>
			<div class="customer_distribution-hide_emp">
				<el-checkbox @change="handleChangeHideEmp" v-model="postData.hideEmp" :true-label="1" :false-label="0">隐藏第2/3工位的员工</el-checkbox>
			</div>
			<ul class="customer_distribution-emp_list" v-loading="empLoading">
				<li class="emp_item"
					v-for="empItem in showEmpList"
					:key="empItem.empid"
					:class="{'emp_item--select': empItem.empid === currentEmpId}"
					@click="onClickEmp(empItem)">
					<span class="emp_item-name" :title="generatorEmpTitle(empItem)">{{ empItem.name |cutString(20) }}</span>
					<span class="emp_item-num">{{ empItem.count }}位</span>
				</li>
			</ul>
		</div>
		<div class="customer_distribution-content">
			<div class="customer_distribution-filter">
				<el-form :inline="true" @submit.native.prevent>
					<el-form-item label="顾客搜索：">
						<el-input 
							@keyup.enter.native="getEmpMember"
							v-model="postData.memNameOrPhone"
							clearable
							style="width: 315px;" placeholder="请输入顾客姓名或手机号进行搜索">
							<template slot="append">
								<el-button @click="getEmpMember">查询</el-button>
							</template>
						</el-input>
					</el-form-item>
				</el-form>
			</div>
			<mgj-table
				v-loading="tableLoading"
				tooltip-effect="dark"
				border
				size="mini"
				height="calc(100vh - 152px)"
				:export-table="false"
				:print-columns="printColumns"
				@selection-change="handleSelectionChange"
				:data="tableData.content">
				<a 
					slot="action"
					href="javascript:;"
					class="mgj_table-action_item"
					@click="onPrintOrExcel">
					<am-icon name="export_icon"></am-icon>
					导出
				</a>
				<el-popover
					slot="action"
					v-if="!disabledDistribution"
					class="mgj_table-action_item"
					placement="bottom"
					width=""
					trigger="click">
					<mgj-list class="distribution_list" :data="menuList">
					</mgj-list>
					<a href="javascript:;" slot="reference">
						<am-icon size="12px" name="gengduocaozuo"></am-icon> 批量对选择的顾客操作
					</a>
				</el-popover>
				<el-table-column label="顾客姓名" fixed="left" width="120" show-overflow-tooltip>
					<template slot-scope="{ row }">
						<img title="优质客" alt="优质客" width="14px" v-if="row.mgjIsHighQualityCust" :src="highQualityIcon" />
						<detail-button :id="row.memid">
							{{ row.memname }}
						</detail-button>
					</template>
				</el-table-column>
				<el-table-column label="性别" prop="memsexName" width="60"></el-table-column>
				<el-table-column label="手机号" prop="memmobile" width="110"></el-table-column>
				<el-table-column label="门店" prop="shopname" width="250" show-overflow-tooltip></el-table-column>
				<el-table-column label="顾客分类" prop="memclassname"></el-table-column>
				<el-table-column label="会员阶段" prop="memberstageName"></el-table-column>
				<el-table-column label="顾客状态" width="87" prop="memberstatusName" :formatter="formatterMemberStatusName"></el-table-column>
				<el-table-column label="上次来店" prop="lastconsumetime" width="150"></el-table-column>
				<el-table-column label="客单价" prop="mPerPrice"></el-table-column>
				<el-table-column label="消费金额" prop="mtotal"></el-table-column>
				<el-table-column label="消费次数" prop="mfreq" width="87"></el-table-column>
			</mgj-table>
			<el-pagination
				v-if="tableData.totalCount"
				background
				:pager-count="15"
				@current-change="handleCurrentPageChange"
				@size-change="handleChangePageSize"
				:page-size="postData.pageSize"
				:current-page="postData.pageNumber"
				:page-sizes="[15, 30, 50]"
				layout="prev, pager, next, sizes"
				:total="tableData.totalCount">
			</el-pagination>
		</div>
	</div>
</template>
<script>
import Api from '@/api'
import FindIndex from 'lodash.findindex'
import LodashSome from 'lodash.some'
import MgjTable from '#/components/table'
import MgjList from '#/components/list'
import DistributionDialog from '#/components/distribution'
import Dayjs from 'dayjs'
import MetaDataMixin from '#/mixins/meta-data'
import TableRenderMixin from '#/mixins/table-render'
const DateFormat = 'YYYY-MM-DD HH:mm:ss'
import DetailButton from '#/components/detail-button'
export default {
	name: 'CustomerDistribution',
	components: {
		MgjTable,
		MgjList,
		DetailButton
	},
	mixins: [
		MetaDataMixin,
		TableRenderMixin,
	],
	data() {
		return {
			initLoading: false,
			empLoading: false,
			tableLoading: false,
			postData: {
				shopId: '',
				pageSize: 15,
				pageNumber: 1,
				memNameOrPhone: undefined
			},
			currentEmpId: '',
			empList: [],
			tableData: [],
			multipleSelectionMember: [],
			tableActionList: [
				{ label: '分配给其他员工并从当前分配移除', callback: this.cutDistribution, icon: 'bo_cut_icon'},
				{ label: '分配给其他员工（保留当前分配）', callback: this.copyDistribution, icon: 'bo_copy_icon'},
				{ label: '从当前分配移除', callback: this.revertDistribution, icon: 'bo_del_icon'},
			],
			printColumns: [
				{label: '顾客姓名', prop: 'memname'},
				{label: '性别', prop: 'memsexName'},
				{label: '门店', prop: 'shopname'},
				{label: '顾客分类', prop: 'memclassname'},
				{label: '会员阶段', prop: 'memberstageName'},
				{label: '顾客状态', prop: 'memberstatusName'},
				{label: '上次来店', prop: 'lastconsumetime'},
				{label: '客单价', prop: 'mPerPrice'},
				{label: '消费金额', prop: 'mtotal'},
				{label: '消费次数', prop: 'mfreq'},
			]
		}
	},
	async mounted() {
		this.initLoading = true;
		const res = await Api.getMetaData();
		this.initLoading = false;
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		if (this.shopList.length === 1) {
			this.postData.shopId = this.shopList[0].id;
			this.getEmpListData();
		}
	},
	computed: {
		menuList() {
			let list = [...this.tableActionList];
			if (this.currentEmpId === 0) {
				return list.splice(0, 1);
			}
			return list;
		},
		showEmpList() {
			if (this.postData.hideEmp) {
				return this.empList.filter(emp => emp.workNum === 1 || emp.empid === 0);
			}
			return this.empList;
		},
		configs() {
			return this.$eventBus.env.configs;
		},
		disabledDistribution() {
			const index = FindIndex(this.configs, config => config.configKey === 'handEmployees');
			if (index === -1) return false;
			const currentConfig = this.configs[index];
			return currentConfig && currentConfig.configValue === 'false';
		}
	},
	methods: {
		onPrintOrExcel() {
			const loading = this.$loading({
				lock: true,
				text: '正在加载中...',
			});
			this.$http.post('/member!listMemAllocationDetail.action', {
				...this.postData,
				pageSize: 99999
			}, {
				responseType: 'blob'
			}).then(res => {
				let a = document.createElement('a');
				a.download = '顾客分配详情.xls';
				a.href = URL.createObjectURL(res.data);
				document.body.append(a);
				a.click();
				loading.close();
				a.remove();
			})
		},
		handleChangePageSize(size) {
			this.postData.pageNumber = 1;
			this.postData.pageSize = size;
			this.getEmpMember();
		},
		handleCurrentPageChange(value) {
			this.postData.pageNumber = value;
			this.getEmpMember();
		},
		generatorEmpTitle({empid, empno, name}) {
			let result = name;
			if (empid) {
				result = `(${empno})${name}`;
			}
			return result;
		},
		copyDistribution() {
			this.distribution(1);
		},
		cutDistribution() {
			this.distribution(0);
		},
		handleChangeHideEmp(value) {
			if (value === 1 && this.currentEmpId) {
				const empIndex = FindIndex(this.showEmpList, emp => emp.empid === this.currentEmpId);
				if (empIndex === -1) {
					this.currentEmpId = '';
					this.tableData = {};
				}
			}
		},
		revertDistribution() {
			const customerids = this.multipleSelectionMember.map(item => item.memid);
			if (!customerids.length) {
				this.$message.warning('请先选择顾客');
				return;
			}
			const { shopId } = this.postData;
			const params = {
				shopId,
				type: 2,
				employeeIds: this.currentEmpId,
				parentShopId: this.parentShopId,
				customerids: customerids.join(',')
			}
			this.initLoading = true;
			this.$http.post('/member!updEmpCusts.action', params).then(res => {
				document.body.click();
				this.initLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.updateEmpMemberCount({empid: this.currentEmpId, count: customerids.length, type: 'decrease'})
					this.updateEmpMemberCount({empid: 0, count: resData.content.length, type: 'increase'});
					this.getEmpMember();
				}
			}).catch(() => {
				this.initLoading = false;
			});
		},
		distribution(type) {
			const customerids = this.multipleSelectionMember.map(item => item.memid);
			if (!customerids.length) {
				this.$message.warning('请先选择顾客');
				return;
			}
			const CurrentEmpIndex = FindIndex(this.empList, emp => emp.empid === this.currentEmpId);
			const CurrentEmpData = this.empList[CurrentEmpIndex];
			const { shopId } = this.postData;
			const shopData = this.findShopById(shopId);
			const params = {
				type,
				shopId,
				customerids,
				parentShopId: this.parentShopId,
				parentId: shopData.parentId,
			}
			DistributionDialog.open(params, CurrentEmpData).then(data => {
				document.body.click();
				const {
					customerids,
					type,
					result,
					employeeIds
				} = data;
				const hasNewEmp = LodashSome(employeeIds, empId => {
					const empIndex = FindIndex(this.empList, emp => parseInt(emp.empid) === parseInt(empId));
					return empIndex === -1;
				})
				if (hasNewEmp) {
					this.getEmpListData();
					this.getEmpMember();
					return;
				}
				result.forEach(item => {
					const {
						employeeId,
						count
					} = item;
					this.updateEmpMemberCount({empid: parseInt(employeeId), count, type: 'increase'});
				});
				if (type === 0) {
					this.updateEmpMemberCount({empid: this.currentEmpId, count: customerids.length, type: 'decrease'});
					this.getEmpMember();
				}
			});
		},
		updateEmpMemberCount({empid, count, type}) {
			const empIndex = FindIndex(this.empList, item => item.empid === empid);
			if (empIndex === -1) return;
			const empData = this.empList[empIndex];
			if (type === 'decrease') {
				empData.count -= count;
			}
			if (type === 'increase') {
				empData.count += count;
			}
		},
		getEmpListData() {
			const { shopId: shopid, hideEmp } = this.postData;
			this.empLoading = true;
			this.$http.post('/member!queryAllocationOfMem.action', { shopid, hideEmp, parentshopid: this.parentShopId } ).then(res => {
				this.empLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.empList = resData.content;
				}
			}).catch(() => {
				this.empLoading = false;
			})
		},
		handleChangeShop() {
			this.tableData = {};
			this.currentEmpId = '';
			this.getEmpListData();
			this.postData.memNameOrPhone = undefined;
			this.postData.empid = undefined;
			this.postData.shopid = undefined;
		},
		getEmpMember() {
			const {
				empid,
				shopid,
				shopId
			} = this.postData;
			if (!shopId && shopId !== 0) {
				this.$message.warning('请先选择门店！');
				return;
			}
			if (!empid && !shopid && shopid !== 0) {
				this.$message.warning('请先选择员工！');
				return;
			}
			this.tableLoading = true;
			this.tableData = {};
			this.$http.post('/member!listMemAllocationDetail.action', this.postData).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content.forEach(item => {
						const {
							memsex,
							memberstage,
							memberstatus,
							lastconsumetime,
							memmobile,
						} = item;
						item.memsexName = this.getSexName(memsex);
						item.memberstageName = this.getStageName(memberstage);
						item.memberstatusName =  this.getStatusName(memberstatus);
						item.memmobile = this.mobileDecorator(memmobile);
						item.lastconsumetime = this.lastconsumetimeDecorator(lastconsumetime);
					})
					this.tableData = resData;
				}
			}).catch(() => {
				this.tableLoading = false;
			})
		},
		onClickEmp({empid}) {
			const {
				shopId,
			} = this.postData;
			if (empid) {
				this.postData.empid = empid;
				this.postData.shopid = undefined;
			} else {
				this.postData.shopid = shopId;
				this.postData.empid = undefined;
			}
			this.currentEmpId = empid;
			this.postData.memNameOrPhone = undefined;
			this.postData.pageNumber = 1;
			this.getEmpMember();
			
		},
		handleSelectionChange(val) {
			this.multipleSelectionMember = val;
		}
	}
}
</script>

<style>
	.customer_distribution {
		overflow: hidden;
	}
	.customer_distribution-selector {
		position: fixed;
		z-index: 1;
		top: 38px;
		left: 0;
		width: 245px;
		height: calc(100vh - 40px);
		padding: 20px 15px 0;
		background: #f8f8f8;
	}
	.customer_distribution-emp_list {
		margin-top: 15px;
		padding-bottom: 8px;
		height: calc(100% - 95px);
		overflow-y: auto;
	}
	.customer_distribution-emp_list .emp_item {
		line-height: 34px;
		width: 196px;
		padding-left: 20px;
		border-radius: 4px;
		box-shadow: 0 0 6px #dcdcdc;
		background: #fff;
		font-size: 12px;
		color: #222;
		overflow: hidden;
		cursor: pointer;
		transition: color .3s;
		&:hover {
			color: #409EFF;
			transition: color .3s;
		}
		&.emp_item--select {
			color: #fff;
		}
	}
	.customer_distribution-emp_list .emp_item--select {
		color: #fff;
		background: #409EFF;
	}
	.customer_distribution-emp_list .emp_item:not(:first-child) {
		margin-top: 7px;
	}
	.customer_distribution-emp_list .emp_item:nth-child(9n+1),
	.customer_distribution-emp_list .emp_item:nth-child(9n+2) {
		border-left: 2px solid #f7aca3;
	}
	.customer_distribution-emp_list .emp_item:nth-child(9n+3) {
		border-left: 2px solid #fad99e;
	}
	.customer_distribution-emp_list .emp_item:nth-child(9n+4),
	.customer_distribution-emp_list .emp_item:nth-child(9n+5) {
		border-left: 2px solid #c3f2b9;
	}
	.customer_distribution-emp_list .emp_item:nth-child(9n+6) {
		border-left: 2px solid #a5c6f7;
	}
	.customer_distribution-emp_list .emp_item:nth-child(9n+7),
	.customer_distribution-emp_list .emp_item:nth-child(9n+8) {
		border-left: 2px solid #c0c0fa;
	}
	.customer_distribution-emp_list .emp_item:nth-child(9n+9) {
		border-left: 2px solid #aad2e6;
	}
	.emp_item-num {
		position: relative;
		float: right;
		margin-right: 15px;
		color: #409EFF;
	}
	.emp_item--select .emp_item-num {
		color: #fff;
	}
	.emp_item-num:after {
		content: "";
		position: absolute;
		top: 50%;
		right: -7px;
		width: 5px;
		height: 5px;
		border: 1px solid #C7C7C7;
		border-left-color: transparent;
		border-bottom-color: transparent;
		transform: translateY(-50%) rotate(45deg);
	}
	.customer_distribution-hide_emp {
		margin: 15px 0 5px 0;
	}
	.customer_distribution-hide_emp .el-checkbox__label {
		font-size: 12px;
	}
	.customer_distribution-content {
		padding: 10px 0;
		margin-left: 265px;
		margin-right: 20px;
	}
	.distribution_list {
		margin: 0 -12px;
	}
	.customer_distribution .el-input--small,
	.customer_distribution .el-form-item__label {
		font-size: 12px;
	}
	.customer_distribution-filter .el-input-group__append {
		background-color: #0ae;
		border-color: #0ae;
		color: #fff;
	}
</style>
