<template>
	<div class="report_6" v-loading="tableLoading">
		<el-form class="list_filter_form" :inline="true" size="small">
			<el-form-item label="其他收入类型：">
				<el-select
					size="small"
					multiple
					collapse-tags
					filterable
					v-model="filterData.otherExpendTypes">
					<el-option
						v-for="item in currentOtherExpandConfigs"
						:key="item.id"
						:value="item.id"
						:label="item.name">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="日期：">
				<el-date-picker
					:editable="false"
					v-model="daterange"
					:clearable="false"
					@change="handleDateChange"
					type="daterange"
					:default-time="['00:00:00', '23:59:59']"
					value-format="timestamp"
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期">
				</el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onTableSearch">开始查询</el-button>
			</el-form-item>
		</el-form>
		<div class="serial_table">
			<div class="am_table-header" v-if="tableData && tableData.length">
				<div class="am_table-action">
					<a href="javascript:;" class="am_table-action_item" @click="onPrintOrExcel"><am-icon name="print_icon"></am-icon>打印</a>
					<a href="javascript:;" class="am_table-action_item" @click="onPrintOrExcel"><am-icon name="export_icon"></am-icon>导出</a>
				</div>
			</div>
			<div class="table_wrap" ref="tableWrap">
				<el-table
					v-if="loaded"
					size="mini"
					:data="tableData"
					stripe
					highlight-current-row
					border
					:height="tableHeight"
					tooltip-effect="light">
					<el-table-column
						v-for="(item, key) in columnData"
						:key="key"
						:label="item"
						:fixed="key === 0"
						show-overflow-tooltip
						:min-width="columnMinWidthMaps[item]"
						:width="columnWidthMaps[item]">
						<template slot-scope="{row}">
							<span v-if="key === 0" :title="row[0] | viewFullLabel">{{ row[0] | viewFullLabel | cutString(22) }}</span>
							<span v-else-if="row[key] === 'null'">--</span>
							<span v-else>{{ row[key] || '--' }}</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<el-pagination
			v-if="total"
			background
			:page-sizes="pageSizes"
			@size-change="handleSizeChange"
			@current-change="handleCurrentPageChange"
			:page-size="filterData.pageSize"
			:current-page="filterData.pageNumber"
			layout="sizes, prev, pager, next"
			:total="total">
		</el-pagination>
	</div>
</template>
<script>
const detaultFinanceConfig = {
	expendTypes: [],
	payConfigs: []
}
import SerialTableMixin from '#/mixins/serial-table'
export default {
	name: 'report6',
	props: ['searchObj', 'groups', 'financeConfigsMap'],
	mixins: [SerialTableMixin],
	data() {
		return {
			filterData: {
				pageSize: 100,
				pageNumber: 1,
				reportNo: 12,
				expendTypes: [],
			},
			columnMinWidthMaps: {
				"门店": '200px',
				'备注': '300px'
			},
			columnWidthMaps: {
				'其他收入金额': '100px',
				'其他收入类型': '100px',
				'日期': '170px',
				'收款方式': '100px',
				'部门': '100px',
			}

		}
	},
	computed: {
		currentFilterShopFinanceConfig() {
			const searchObj = this.searchObj;
			if (!searchObj || !searchObj.length) {
				return {};
			}
			return this.financeConfigsMap[searchObj[0].parentShopId] || {...detaultFinanceConfig};
		},
		currentOtherExpandConfigs() {
			let result = [];
			const {
				expendTypes
			} = this.currentFilterShopFinanceConfig;
			expendTypes && expendTypes.forEach(item => {
				if ([5, -10087, -10086].indexOf(parseInt(item.dayexpendtypeid)) > -1) {
					result.push(item)
				}
			})
			return result;
		},
	},
	methods: {
		init() {
			this.onTableSearch();
		},
		refresh() {
			this.$nextTick(() => {
				this.init();
			})
		},
		onTableSearch() {
			this.filterData.pageNumber = 1;
			this.onSearch();
		}
	},
	mounted() {
		this.init();
	}
}
</script>
<style>
	.table_wrap {
		height: calc(100vh - 165px);
	}
</style>