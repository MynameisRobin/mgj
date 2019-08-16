<template>
	<div class="report_14" v-loading="tableLoading">
		<el-form class="list_filter_form" :inline="true" size="small">
			<el-form-item label="会员门店">
				<el-select 
					style="width: 280px"
					collapse-tags
					multiple
					v-model="filterData.memshopids"
					@change="handleMemberShopChange">
					<el-option
						v-for="item in allShopList"
						:key="item.id"
						:value="item.id"
						:label="item.shopName">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="消费门店">
				<el-select 
					style="width: 280px"
					collapse-tags
					multiple
					v-model="filterData.shopids">
					<el-option
						v-for="item in allShopList"
						:key="item.id"
						:value="item.id"
						:label="item.shopName"
						:disabled="disabledConsumeShop(item)">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="消费类型：">
				<el-select
					collapse-tags
					multiple
					v-model="filterData.consumeids">
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
						:fixed="['会员门店', '消费门店'].indexOf(item) !== -1"
						show-overflow-tooltip
						:min-width="columnWidthMaps[item]">
						<template slot-scope="{row}">
							<span v-if="key === 0" :title="row[0] | viewFullLabel">{{ row[0] | viewFullLabel | cutString(22) }}</span>
							<a @click="onViewOrderDetail(row[row.length - 1])" href="javascript:;" v-else-if="item === '流水单号'">
								{{ row[key] }}
							</a>
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
import SerialTableMixin from '#/mixins/serial-table'
const consumeList = [
	{label: '项目', id: '1'},
	{label: '卖品', id: '2'},
	{label: '充值', id: '3'},
	{label: '套餐销售', id: '4'},
	{label: '转账', id: '5'},
	{label: '年卡销售', id: '6'},
	{label: '卡转移', id: '7'},
	{label: '套餐转移', id: '8'},
]
export default {
	name: 'report13',
	props: ['searchObj', 'groups'],
	mixins: [SerialTableMixin],
	data() {
		return {
			filterData: {
				pageSize: 100,
				pageNumber: 1,
				reportNo: 13,
				memshopids: [],
				shopids: [],
				consumeids: consumeList.map(item => item.id)
			},
			consumeList: consumeList,
			columnWidthMaps: {
				'会员门店': '200px',
				'消费门店': '200px',
				'会员卡号': '160px',
				'消费日期': '160px',
				'流水单号': '220px',
				'会员卡类型': '120px',
				'手机号': '100px'
			}
		}
	},
	computed: {
		userShopList() {
			const { shopIds } = this.userInfo;
			const shopIdList = shopIds.split(',');
			return this.allShopList.filter(item => shopIdList.indexOf(String(item.id)) !== -1);
		},
		consumeShopList() {
			const { shopId } = this.userInfo;
			return this.allShopList.filter(item => String(item.id) !== shopId);
		}
	},
	methods: {
		handleMemberShopChange(ids) {
			const shopId = Number(this.userInfo.shopId);
			if (this.userShopList.length === 1) {
				if (ids && ids.indexOf(shopId) !== -1) {
					const memshopids = ids.splice(-1, 1);
					this.filterData.memshopids = memshopids;
					const { shopids } = this.filterData;
					if (memshopids[0] !== shopId) {
						this.filterData.shopids = [shopId];
					} else {
						this.filterData.shopids = this.consumeShopList.map(item => item.id);
					}
				}
			}
		},
		disabledConsumeShop({ id }) {
			if (this.userShopList.length > 1) return false;
			const { memshopids } = this.filterData;
			const shopId = Number(this.userInfo.shopId);
			return (memshopids[0] === shopId && id === shopId) || (id !== shopId && memshopids[0] !== shopId);
		},
		init() {
			this.filterData.memshopids = this.searchObj[0].allChildren ? this.userShopList.map(item => item.id) : this.searchObj.map(item => item.id);
			this.filterData.shopids = this.consumeShopList.map(item => item.id);
			this.onTableSearch();
		},
		refresh() {
			this.$nextTick(() => {
				this.init();
			})
		},
		onTableSearch() {
			const {
				memshopids
			} = this.filterData;
			if (!memshopids || memshopids.length === 0) {
				this.$message.error('请至少选择一个会员门店');
				return;
			}
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