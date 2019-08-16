<template>
	<div class="serial_table">
		<div class="am_table-header" v-if="tableData && tableData.length">
			<div class="am_table-action">
				<a href="javascript:;" class="am_table-action_item" @click="onPrintOrExcel"><am-icon name="print_icon"></am-icon>打印</a>
				<a href="javascript:;" class="am_table-action_item" @click="onPrintOrExcel"><am-icon name="export_icon"></am-icon>导出</a>
			</div>
		</div>
		<el-table
			size="mini"
			:data="tableData"
			stripe
			highlight-current-row
			border
			tooltip-effect="light"
			:height="height">
			<el-table-column
				v-for="(item, key) in columnData"
				:key="key"
				:label="item"
				:fixed="key === 0"
				show-overflow-tooltip
				min-width="auto">
				<template slot-scope="{row}">
					<span v-if="key === 0" :title="row[0] | viewFullLabel">{{ row[0] | viewFullLabel | cutString(22) }}</span>
					<span v-else-if="item === '凭证'">
						<el-button v-if="row[key]" type="text" @click="onViewImg(row[key])">查看</el-button>
						<span v-else>--</span>
					</span>
					<a @click="onViewOrderDetail(row[row.length - 1])" href="javascript:;" v-else-if="item === '流水单号' && ([3, 4].indexOf(filterData.reportNo) > -1)">
						{{ row[key] }}
					</a>
					<span v-else-if="row[key] === 'null'">--</span>
					<span v-else>{{ row[key] || '--' }}</span>
				</template>
			</el-table-column>
		</el-table>
		<el-dialog
			:append-to-body="true"
			@closed="currentImgSrc = ''"
			title="查看凭证"
			:visible.sync="showImgViewDialog"
			width="80%">
			<div style="text-align: center">
				<img :src="currentImgSrc" style="max-width: 100%">
			</div>
		</el-dialog>
	</div>
</template>
<script>
const getSearchObjLabel = function (value) {
	if (!value) return '';
	let index = value.indexOf(')');
	if (index !== -1) {
		return value.substr(index + 1)
	}
	return value;
}
import AppConfig from '@/config/app'
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from '@/js/storageKeys'
export default {
	name: 'serialTable',
	props: {
		data: Object,
		height: String,
		filterData: Object
	},
	data() {
		return {
			tableData: [],
			columns: [],
			columnData: null,
			showImgViewDialog: false,
			currentImgSrc: ''
		}
	},
	computed: {
		tenantId() {
			return this.filterData.searchObj[0].tenantId;
		}
	},
	watch: {
		data: 'init'
	},
	filters: {
		viewFullLabel(value) {
			if (!value) return '--';
			let label = getSearchObjLabel(value);
			return label;
		}
	},
	methods: {
		onViewOrderDetail(billId) {
			const parentShopId  = this.filterData.searchObj[0].tenantId;
			this.$emit('view-bill-detail', {billId, parentShopId});
		},
		init() {
			let tableData = this.data || {};
			const { data, columns, headTop, head } = tableData;
			this.tableData = data || [];
			this.columns = columns;
			this.columnData = head;
		},
		onViewImg(img) {
			this.currentImgSrc = `${AppConfig.IMAGE_URL}/voucher/${this.tenantId}/${img}`;
			this.showImgViewDialog = true;
		},
		onPrintOrExcel() {
			let topTrContent = '';
			let childTrContent = '';
			let showColumnIndexList = [];
			this.columnData.forEach(item => {
				topTrContent += `<th>${item}</th>`;
			})
			let tbodyContent = '';
			this.tableData.forEach(item => {
				let trContent = '';
				item.forEach((cItem, cIndex) => {
					let value = cIndex === 0 ? getSearchObjLabel(cItem) : cItem;
					let numberValue = parseFloat(value);
					if (!isNaN(numberValue) && numberValue === 0) {
						value = 0;
					}
					trContent += `<td>${value || '-'}</td>`;
				})
				tbodyContent += `<tr>${trContent}</tr>`
			})
			let tableHead = `<tr>${topTrContent}</tr>`;
			if (childTrContent) {
				tableHead += `<tr>${childTrContent}</tr>`;
			}
			const tableBody = `<tbody>${tbodyContent}</tbody>`;
			let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0"><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>`;
			const { origin } = window.location;
			window.localStorage.setItem(PRINT_TABLE_TITLE, '财务报表');
			window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
			window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, '', 'height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no');
		},
	},
	mounted() {
		this.init();
	}
}
</script>
