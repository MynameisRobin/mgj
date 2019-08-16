<template>
	<div class="report_14" v-loading="tableLoading">
		<el-form class="list_filter_form" :inline="true">
			<el-form-item label="员工级别：">
				<el-select 
					v-model="filterData.dutyId"
					@change="handleDutyChange"
					clearable
					filterable>
					<el-option
						v-for="item in empLevels"
						:key="item.dutyid"
						:value="item.dutyid"
						:label="item.name">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="员工：">
				<el-select 
					v-model="filterData.empId"
					clearable
					filterable>
					<el-option
						v-for="item in selectEmps"
						:key="item.id"
						:value="item.id"
						:label="item.name">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="项目类别：">
				<el-select 
					v-model="filterData.serviceitemclassId"
					clearable
					filterable>
					<el-option
						v-for="item in sics"
						:key="item.classid"
						:value="item.classid"
						:label="item.name">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="消费类型：">
				<el-select 
					v-model="filterData.consumetype"
					clearable>
					<el-option
						v-for="item in consumeList"
						:key="item.id"
						:value="item.id"
						:label="item.label">
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
			<div class="serial_table_wrap" ref="tableWrap">
				<el-table
					v-if="loaded"
					size="mini"
					:data="tableData"
					stripe
					highlight-current-row
					border
					tooltip-effect="light"
					:height="tableHeight">
					<el-table-column
						v-for="(item, key) in columnData"
						:key="key"
						:label="item"
						:fixed="['员工姓名', '员工编号', '员工级别'].indexOf(item) !== -1"
						show-overflow-tooltip
						:min-width="columnMinWidthMaps[item]"
						:width="columnWidthMaps[item]">
						<template slot-scope="{row}">
							<span v-if="key === 0" :title="row[0] | viewFullLabel">{{ row[0] | viewFullLabel | cutString(22) }}</span>
							<a @click="onViewOrderDetail(row[row.length - 1])" href="javascript:;" v-else-if="item === '流水单号'">
								{{ row[key] }}
							</a>
							<span v-else-if="row[key] === 'null'">--</span>
							<span v-else-if="item === '顾客'">
								<detail-button v-if="row[row.length - 2] && row[row.length - 2] !== '0'" :id="row[row.length - 2]">{{ row[key] }}</detail-button>
								<template v-else>散客</template>
							</span>
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
import SerialTableMixin from '#/mixins/serial-table'
const consumeList = [
	{label: '散客', id: '1'},
	{label: '会员', id: '2'},
	{label: '套餐', id: '3'},
	{label: '套餐不限次', id: '4'},
	{label: '套餐赠送', id: '5'},
]
import Api from '@/api'
import FindIndex from "lodash.findindex";
import DetailButton from '@/components/member-detail-button'
export default {
	name: 'report14',
	props: ['searchObj', 'groups'],
	mixins: [SerialTableMixin],
	components: {
		DetailButton,
	},
	data() {
		return {
			filterData: {
				pageSize: 100,
				pageNumber: 0,
				reportNo: 14,
				consumetype: undefined,
				empId: undefined,
				dutyId: undefined,
				serviceitemclassId: undefined
			},
			consumeList,
			sics: [],
			emps: [],
			empLevels: [],
			columnMinWidthMaps: {
				"流水单号": '170px',
				"会员卡": "140px",
				"员工级别": "120px",
				"项目": '120px'
			},
			columnWidthMaps: {
				"消费时间": '160px',
				"现金类业绩": '100px',
				"计客次数": '70px',
				"次数": '60px',
				"指定": '60px'
			}
		}
	},
	computed: {
		searchObjItem() {
			const searchData = this.searchObj[0];
			return searchData;
		},
		selectEmps() {
			const {
				dutyId
			} = this.filterData;
			return dutyId ? this.emps.filter(item => item.dutyid === dutyId) : this.emps;
		}
	},
	methods: {
		decoratorTableData({ head, data }) {
			const consumeIndex = head.indexOf('消费类型');
			let consumeMaps = {};
			consumeList.forEach(item => {
				const { id, label } = item;
				consumeMaps[id] = label;
			})
			if (consumeIndex !== -1) {
				data.forEach(item => {
					item[consumeIndex] = consumeMaps[item[consumeIndex]];
				})
			}
			return data;
		},
		handleDutyChange(dutyId) {
			const { empId } = this.filterData;
			if (dutyId && empId) {
				const index = FindIndex(this.selectEmps, empItem => empItem.id === empId);
				if (index === -1) {
					this.filterData.empId = undefined;
				}
			}
		},
		refresh() {
			this.filterData.consumetype = undefined;
			this.filterData.empId = undefined;
			this.filterData.dutyId = undefined;
			this.filterData.serviceitemclassId = undefined;
			this.$nextTick(() => {
				this.getFilterData();
				this.onTableSearch();
			})
		},
		getFilterData() {
			const {
				id,
				shopId,
				parentShopId,
				level
			} = this.searchObjItem;
			Api.getShopEmpDataById({
				shopId: level === 2 ? id : shopId,
				parentShopId
			}).then(res => {
				const resData = res.data;
				const {
					code,
					content
				} = resData;
				if (code === 0) {
					const {
						empLevels,
						emps,
						sics
					} = content;
					this.empLevels = empLevels;
					this.emps = emps;
					this.sics = sics;
				}
			})
		}
	},
	mounted() {
		this.getFilterData();
		this.onTableSearch();
	}
}
</script>

<style>
	.serial_table_wrap {
		height: calc(100vh - 165px);
	}
</style>
