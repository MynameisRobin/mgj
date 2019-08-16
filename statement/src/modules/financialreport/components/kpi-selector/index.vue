<template>
	<div class="kpi_selector" v-if="kpisData.length > 0">
		<div ref="kpiSelectorMain" class="kpi_selector-main" :class="`reportno_${currentReportNo}`" v-loading="loading">
			<el-form label-position="top" class="base_report_form">
				<el-form-item label="基准报表">
					<el-select :disabled="disabledBaseReport" size="small" v-model="currentReportNo" @change="onChangeBaseReport">
						<el-option 
							v-for="item in baseReportList" 
							:disabled="item.disabled"
							:key="item.reportNo"
							:label="item.label"
							:value="item.reportNo"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div class="kpi_selector-group" v-for="(item, index) in filterKpisData" :key="index">
				<el-checkbox :indeterminate="item.isIndeterminate" v-model="item.checkAll" @change="handleCheckGroupAll(index)">{{ item.title }}</el-checkbox>
				<el-checkbox-group v-model="item.checkModel" @change="e => handleCheckGruop(e, index)">
					<div class="kpi_selector-item" v-for="(cItem, cIndex) in item.kpis" :key="cIndex">
						<el-checkbox :label="cItem.id" :disabled="isCheckboxDisabled(cItem)">
							<span :title="cItem.title" v-if="currentReportNo === 10">
								{{cItem.title | cutString(30)}}
							</span>
							<span :title="cItem.title" v-else>
								{{cItem.title | cutString(18)}}
							</span>
						</el-checkbox>
						<el-popover
							placement="right"
							width="200"
							trigger="hover"
							:content="cItem.description">
							<am-icon class="icon_info" slot="reference" name="info"></am-icon>
						</el-popover>
					</div>
				</el-checkbox-group>
			</div>
		</div>
	</div>
</template>
<script>
const detaultFinanceConfig = {
	expendTypes: [],
	payConfigs: []
}
import FindIndex from 'lodash.findindex'
export default {
	name: 'kpi-selector',
	props: {
		value: Array,
		searchObj: Array,
		validSubsidiary: Boolean,
		reportNo: [String, Number],
		parentShopId: [String, Number],
		disabledBaseReport: Boolean,
		financeConfigsMap: Object,
		systemReport: Boolean,
	},
	data() {
		return {
			currentReportNo: 1,
			kpisData: [],
			filterKpisData: [],
			selectData: [],
			loading: false,
			isAsync: false,
			kpiDataMap: {},
		}
	},
	computed: {
		userInfo() {
			return this.$eventBus.env.userInfo || {};
		},
		softgenre() {
			const { softgenre } = this.userInfo;
			return softgenre;
		},
		singleShop() {
			return this.softgenre === '1';
		},
		level() {
			let nodeData = this.searchObj[0] || {};
			return nodeData.level;
		},
		isMultipleShop() {
			let nodeData = this.searchObj[0] || {};
			return (this.level === 2 && this.searchObj.length > 1) || (nodeData.allChildren && nodeData.level < 2);
		},
		isExpendAndIncomeReport() {
			return [5, 7].indexOf(this.currentReportNo) >= 0;
		},
		isBalanceReport() {
			const reportNo = this.currentReportNo;
			return !!reportNo && [8, 9].indexOf(reportNo) >= 0;
		},
		isTenantRoleReport() {
			return this.isisBalanceReport || this.currentReportNo === 4;
		},
		isSelectDepartment() {
			let nodeData = this.searchObj[0];
			return (nodeData && nodeData.allChildren && nodeData.level === 2) || this.level > 2;
		},
		baseReportList() {
			let list = [
				{ label: '营收报表', reportNo: 1, },
				{ label: '营收分类报表', reportNo: 2 },
				{ label: '门店业绩流水', reportNo: 3, disabled: this.isMultipleShop},
				{ label: '门店营收流水', reportNo: 4, disabled: this.isMultipleShop || this.isSelectDepartment },
				{ label: '支出汇总报表', reportNo: 5, disabled: this.validSubsidiary },
				{ label: '支出流水表', reportNo: 6, disabled: this.validSubsidiary || this.isMultipleShop },
				{ label: '其他收入汇总表', reportNo: 7, disabled: this.validSubsidiary },
				{ label: '其他收入流水表', reportNo: 12, disabled: this.isMultipleShop },
				{ label: '门店储值余额表', reportNo: 8, disabled: this.validSubsidiary || this.isSelectDepartment },
				{ label: '卡储值余额表', reportNo: 9, disabled: this.validSubsidiary  || this.isMultipleShop || this.isSelectDepartment },
				{ label: '工资提成表', reportNo: 11 },
				{ label: '员工项目业绩流水表', reportNo: 14, disabled: this.isMultipleShop },
			]
			if (!this.singleShop) {
				list.splice(
					list.length - 2,
					0,
					{ label: '跨店消费统计表', reportNo: 10, disabled: this.isSelectDepartment },
					{ label: '跨店消费明细表', reportNo: 13, disabled: this.isSelectDepartment},
				);
			}
			return list;
		},
		currentRole() {
			let levelObj = {
				0: 'tenant',
				1: 'area',
				2: 'shop',
				3: 'detp',
				4: 'job',
				5: 'emp'
			}
			return levelObj[this.level];
		}
	},
	watch: {
		value(newVal, oldVal) {
			this.selectData = newVal;
			if (this.isAsync) {
				this.isAsync = false;
			} else {
				if (newVal) {
					this.invertSelect();
				}
			}
		},
		parentShopId(newVal, oldVal) {
			if (newVal && oldVal && newVal !== parseInt(oldVal)) {
				this.loading = true;
				this.getKpisData().then(async (data) => {
					this.loading = false;
					this.kpisData = data;
					if (this.isExpendAndIncomeReport) {
						await this.refreshFinanceConfig();
					}
					this.filterKpis();
					this.invertSelect();
					this.asyncValue();
				});
			}
		},
		reportNo(newVal) {
			this.currentReportNo = newVal;
			this.onChangeBaseReport(newVal);
		},
		validSubsidiary() {
			if (this.currentReportNo !== 11) {
				this.filterKpis();
				this.invertSelect();
				this.asyncValue();
			}			
		}
	},
	methods: {
		async onChangeBaseReport(value) {
			if (this.isExpendAndIncomeReport) {
				await this.refreshFinanceConfig();
			}
			this.$emit('update-base-report', value);
			this.filterKpis();
			this.invertSelect();
			this.asyncValue();
		},
		async refreshFinanceConfig() {
			this.loading = true;
			let expendKpis = [];
			let otherIncomeKpis = [];
			let currentFinanceConfig = this.financeConfigsMap[this.parentShopId] || {...detaultFinanceConfig};
			currentFinanceConfig.expendTypes.forEach(item => {
				const { name, id, dayexpendtypeid } = item;
				let kpiItem = {
					id,
					title: name,
					ukey: `dayexpendtype${id}`,
					description: name,
					pct: 0
				}
				if ([5, -10086, -10087].indexOf(parseInt(dayexpendtypeid)) >= 0) {
					otherIncomeKpis.push(kpiItem)
				} else {
					expendKpis.push(kpiItem)
				}
			})
			const expanedGroupTtile = "支出类型";
			let expanedGroupIndex = FindIndex(this.kpisData, item => item.title === expanedGroupTtile);
			if (expanedGroupIndex < 0) {
				this.kpisData.push({
					reportNo: 5,
					title: expanedGroupTtile,
					checkAll: false,
					checkModel: [],
					id: 99999,
					kpis: expendKpis
				})
			} else {
				this.kpisData[expanedGroupIndex].kpis = expendKpis;
			}
			const incomeGroupTitle = '其他收入类型';
			let incomeGroupIndex = FindIndex(this.kpisData, item => item.title === incomeGroupTitle);
			if (incomeGroupIndex < 0) {
				this.kpisData.push({
					reportNo: 7,
					title: incomeGroupTitle,
					checkAll: false,
					checkModel: [],
					id: 99998,
					kpis: otherIncomeKpis
				})
			}
			this.loading = false;
		},
		isCheckboxDisabled(item) {
			const { role } = item;
			let roleObj = role ? JSON.parse(role) : null;
			let result = (this.currentRole && roleObj && roleObj[this.currentRole] < 1);
			return result;
		},
		handleCheckGruop(value, index) {
			const checkedCount = value.length;
			const currentGroup = this.filterKpisData[index];
			let activeCheckboxList = currentGroup.kpis.filter(item => !this.isCheckboxDisabled(item));
			currentGroup.checkAll = checkedCount === activeCheckboxList.length;
			currentGroup.isIndeterminate = checkedCount > 0 && checkedCount < activeCheckboxList.length;
			this.asyncValue();
		},
		handleCheckGroupAll(index, value) {
			const currentGroup = this.filterKpisData[index];
			const checkVal = currentGroup.checkAll;
			currentGroup.isIndeterminate = false;
			if (checkVal) {
				let checkModel = [];
				currentGroup.kpis.forEach(item => {
					if (!this.isCheckboxDisabled(item)) {
						checkModel.push(item.id);
					}
				})
				currentGroup.checkModel = checkModel;
			} else {
				currentGroup.checkModel = [];
			}
			this.asyncValue();
		},
		asyncValue() {
			let result = this.selectData = this.getSelectKpiGroups();
			this.isAsync = true;
			this.$emit('input', result);
			this.$emit('change', result);
			this.$emit('update-base-report', this.currentReportNo)
		},
		getSelectKpiGroups() {
			let result = []
			this.filterKpisData.forEach(item => {
				const { id, title, checkModel } = item;
				let kpis = [];
				if (checkModel.length) {
					item.kpis.forEach(kItem => {
						const { id, title, pct, ryg, tplt, sqlGroup, ukey, depend } = kItem;
						if (checkModel.includes(id)) {
							kpis.push({
								id,
								title,
								pct,
								ryg,
								tplt,
								sqlGroup,
								ukey,
								depend
							})
						}
					})
					let currentGroup = {
						id,
						title,
						kpis
					}
					result.push(currentGroup);
				}
			})
			return result;
		},
		invertSelect() {
			if (this.systemReport && [5, 7].indexOf(this.reportNo) >= 0) {
				this.filterKpisData.forEach(kItem => {
					kItem.checkAll = true;
					kItem.isIndeterminate = false;
					kItem.checkModel = kItem.kpis.map(item => item.id);
				})
				return;
			}
			this.filterKpisData.forEach(kItem => {
				kItem.checkAll = false;
				kItem.isIndeterminate = false;
				kItem.checkModel = [];
				this.selectData.forEach(sItem => {
					if (sItem.id === kItem.id) {
						const { kpis } = sItem;
						let activeCheckboxList = kItem.kpis.filter(item => !this.isCheckboxDisabled(item));
						let kpisCount = activeCheckboxList.length;
						kItem.checkAll = kpis.length === kpisCount;
						kItem.isIndeterminate = kpis.length > 0 && kpis.length < kpisCount;
						kItem.checkModel = kpis.map(item => item.id);
					}
				})
			});
			this.$nextTick(() => {
				let mainEl = this.$refs.kpiSelectorMain;
				let checkedEl = mainEl.querySelector('.el-checkbox.is-checked');
				if (checkedEl) {
					let mainPosObj = mainEl.getBoundingClientRect();
					let posObj = checkedEl.getBoundingClientRect();
					if ((posObj.y - mainPosObj.y) > mainPosObj.height / 3) {
						mainEl.scrollTop = (posObj.y - mainPosObj.y);
					} else {
						mainEl.scrollTop = 0;
					}
				}
			})
		},
		getKpisData() {
			return new Promise((resolve, reject) => {
				let currentShopKpiData = this.kpiDataMap[this.parentShopId];
				if (currentShopKpiData) {
					resolve(currentShopKpiData);
					return;
				}; 
				this.$http.post('/superOperationReport!getKpis.action', {reportType: 1, parentShopId: this.parentShopId}).then(res => {
					let resData = res.data;
					let { code, content, message } = resData;
					if (code === 0) {
						content.forEach(item => {
							item.isIndeterminate = false;
							item.checkAll = false;
							item.checkModel = [];
						})
						this.kpiDataMap[this.parentShopId] = content;
						resolve(content);
					} else {
						reject(message)
					}
				});
			})
		},
		filterKpis() {
			let result = [];
			this.kpisData.forEach(item => {
				if (item.reportNo === this.currentReportNo) {
					let currentItem = {
						...item
					}
					if (this.validSubsidiary) {
						let kpis = [];
						item.kpis.forEach(kItem => {
							if (kItem.ukey.indexOf('otherfee') < 0) {
								kpis.push(kItem);
							}
						})
						currentItem.kpis = kpis;
					}
					result.push(currentItem);
				}
				if (!item.reportNo) {
					let otherItem = {
						...item
					}
					let kpis = [];
					otherItem.kpis.forEach(kItem => {
						if (kItem.reportNo === this.currentReportNo) {
							kpis.push(kItem)
						}
					})
					otherItem.kpis = kpis;
					if (kpis.length > 0) {
						result.push(otherItem)
					}
				}
			})
			this.filterKpisData = result;
		}
	},
	mounted() {
		this.loading = true;
		this.selectData = this.value;
		this.currentReportNo = this.reportNo;
		this.getKpisData().then(async (data) => {
			this.loading = false;
			this.kpisData = data;
			this.filterKpis();
			if (this.selectData) {
				this.invertSelect();
			}
		});
	}
}
</script>
<style lang="less">
	.kpi_selector-main {
		width: 100%;
		height: calc(100vh - 120px);
		min-height: 100px;
		overflow-y: auto;
		& .el-form-item--small.el-form-item {
			margin-bottom: 5px;
		}
		&.reportno_10 {
			.kpi_selector-item {
				display: block;
				width: 100%;
			}
		}
	}
	.kpi_selector-item {
		display: inline-block;
		width: 50%;
	}
	.kpi_selector-group {
		&~ .kpi_selector-group {
			margin-top: 10px;
		}
		& > .el-checkbox {
			margin-top: 15px;
			margin-bottom: 5px;
			& .el-checkbox__label {
				font-weight: 700;
				color: #000;
			}
		}
		& .el-checkbox-group .el-checkbox {
			margin: 5px 5px 0 0;
		}
		& .el-checkbox__label {
			font-size: 12px;
			color: #222;
		}
		& .icon_info {
			color: #c1c1c1;
			cursor: pointer;
			transition: color .3s;
			&:hover {
				color: #0ae;
			}
		}
	}
	.base_report_form {
		& .el-form-item--small .el-form-item__label {
			line-height: 1;
			padding: 0;
			margin: 8px 0;
		}
		& .el-select {
			width: 90%;
		}
	}
</style>
