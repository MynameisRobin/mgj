<template>
	<div ref="wrap" class="mgj_table" :style="wrapStyle">
		<div class="mgj_table-header" ref="header" v-show="showHeader">
			<slot name="header"></slot>
			<div class="mgj_table-action">
				<slot name="action"></slot>
				<el-popover
					v-if="customColumn && columns && columns.length > 0"
					class="mgj_table-action_item"
					placement="bottom"
					width="200"
					trigger="click"
					@show="handleShowCustomColumn">
					<div class="mgj_table_column_custom">
						<div class="mgj_table_column_custom-title">
							选择要显示或隐藏的列
						</div>
						<div class="mgj_table_column_custom-content">
							<el-checkbox 
								:indeterminate="isIndeterminate"
								v-model="checkAll"
								@change="handleCheckAllChange">
							全选</el-checkbox>
							<el-checkbox-group
								v-model="editShowColumnsList"
								@change="handleShowColumnPropChange">
								<el-checkbox
									size="mini"
									v-for="column in columns"
									:label="column.prop"
									:key="column.prop">
									{{column.label}}
								</el-checkbox>
							</el-checkbox-group>
						</div>
						<div class="mgj_table_column_custom-action">
							<el-button size="mini" type="primary" @click="saveCustomColumn" :loading="saveCustomColumnLoading">确认</el-button>
							<el-button size="mini" @click="hideCustomColumn">取消</el-button>
						</div>
					</div>
					<a href="javascript:;" slot="reference">
						<am-icon name="eye"></am-icon>自定义列
					</a>
				</el-popover>
				<a 
					v-if="printTable"
					href="javascript:;"
					class="mgj_table-action_item"
					@click="onPrintOrExcel">
					<am-icon name="print_icon"></am-icon>
					打印
				</a>
				<a 
					v-if="exportTable"
					href="javascript:;"
					class="mgj_table-action_item"
					@click="onPrintOrExcel">
					<am-icon name="export_icon"></am-icon>
					导出
				</a>
			</div>
		</div>
		<div class="mgj_table-content">
			<el-table
				v-if="init"
				ref="table"
				:data="data"
				v-bind="$attrs"
				v-on="$listeners"
				:height="tableHeight">
				<el-table-column
					fixed="left"
					v-if="$listeners['selection-change']"
					type="selection"
					width="40">
				</el-table-column>
				<slot name="prepend"></slot>
				<el-table-column
					v-for="item in columnList"
					:key="item.prop"
					:label="item.label"
					:prop="item.prop"
					v-bind="item.attrs">
				</el-table-column>
				<slot></slot>
				<div class="mgj_table_empty" slot="empty">
					<slot name="empty">
						<am-icon class="mgj_table_empty-icon" size="76px" name="sousuo"></am-icon>
						<p class="mgj_table_empty-text">点击上方的查询按钮进行查看</p>
					</slot>	
				</div>
			</el-table>
		</div>
	</div>
</template>

<script>
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from '@/js/storageKeys'
export default {
	name: 'MgjTable',
	props: {
		data: Array,
		columns: Array,
		customColumn: {
			type: Boolean,
			default: true
		},
		printTable: {
			type: Boolean,
			default: false
		},
		exportTable: {
			type: Boolean,
			default: true
		},
		showHeader: {
			type: Boolean,
			default: true
		},
		printTitle: String,
		printColumns: Array,
		tableName: String,
		height: String
	},
	data() {
		return {
			showColumnPropList: [],
			checkAll: false,
			editShowColumnsList: [],
			saveCustomColumnLoading: false,
			init: false,
			tableHeight: ''
		}
	},
	watch: {
		'columns': function (newVal) {
			this.initColumn(newVal);
		}
	},
	computed: {
		wrapStyle() {
			return {
				height: this.height || 'auto'
			}
		},
		userInfo() {
			return this.$eventBus.env.userInfo || {};
		},
		parentShopId() {
			const { baseId, parentShopId } = this.userInfo;
			return baseId || parentShopId;
		},
		columnList() {
			if (!this.columns) return [];
			return this.columns.filter(item => (this.showColumnPropList.indexOf(item.prop) !== -1 || !this.showColumnPropList.length));
		},
		isIndeterminate() {
			const showLength = this.editShowColumnsList.length;
			return showLength !== 0 && showLength !== this.columns.length;
		}
	},
	methods: {
		onPrintOrExcel() {
			let topTrContent = '';
			let tbodyContent = '';
			if (!this.data) return;
			let columnList = [];
			if (this.printColumns) {
				columnList = [
					...columnList,
					...this.printColumns,
				]
			}
			if (this.columnList) {
				columnList = [
					...columnList,
					...this.columnList,
				]
			}
			columnList.forEach((column, cIndex) => {
				topTrContent += `<th>${column.label}</th>`;
			})
			this.data.forEach(item => {
				let trContent = '';
				columnList.forEach((column, cIndex) => {
					const value = item[column.prop];
					trContent += `<td>${value || '-'}</td>`;
				})
				tbodyContent += `<tr>${trContent}</tr>`
			})
			const tableHead = `<thead><tr>${topTrContent}</tr></thead>`;
			const tableBody = `<tbody>${tbodyContent}</tbody>`;
			let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0"><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>`;
			const { origin } = window.location;
			window.localStorage.setItem(PRINT_TABLE_TITLE, this.printTitle || '');
			window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
			window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, '', 'height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no');
		},
		async initColumn(columns) {
			if (!columns) {
				this.showColumnPropList = [];
				return;
			};
			if (this.tableName && this.customColumn) {
				const {
					userId,
					shopId
				} = this.userInfo;
				const res = await this.$http.post('/userdefined!queryData.action', {
					shopId,
					empId: userId,
					empType: 0,
					tableName: this.tableName
				});
				const resData = res.data;
				const { code, content } = resData;
				if (code === 0 && content) {
					this.showColumnPropList = JSON.parse(content.data);
					return;
				}
			}
			this.showColumnPropList = columns.filter(item => {
				const {
					hidden,
					prop
				} = item;
				return hidden !== false || this.showColumnPropList.indexOf(prop) !== -1;
			}).map(item => item.prop);
			this.checkAll = this.showColumnPropList.length === columns.length;
		},
		handleShowColumnPropChange(value) {
			this.checkAll = value.length === this.columns.length;
		},
		handleCheckAllChange(value) {
			this.editShowColumnsList = value ? this.columns.map(item => item.prop) : [];
		},
		handleShowCustomColumn() {
			this.editShowColumnsList = JSON.parse(JSON.stringify(this.showColumnPropList));
		},
		hideCustomColumn() {
			document.body.click();
		},
		saveCustomColumn() {
			if (!this.tableName && this.customColumn) {
				this.showColumnPropList = this.editShowColumnsList;
				this.hideCustomColumn();
				return;
			}
			const {
				userId,
				shopId
			} = this.userInfo;
			this.saveCustomColumnLoading = true;
			this.$http.post('/userdefined!add.action', {
				shopId,
				empId: userId,
				parentShopId: this.parentShopId,
				empType: 0,
				tableName: this.tableName,
				data: JSON.stringify(this.editShowColumnsList),
			}).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.hideCustomColumn();
					this.saveCustomColumnLoading = false;
					this.init = false;
					this.showColumnPropList = this.editShowColumnsList;
					this.init = true;
				}
			}).catch(() => {
				this.saveCustomColumnLoading = false;
			})
		}
	},
	created() {
		this.$nextTick(() => {
			const positionConfig = this.$refs.wrap.getBoundingClientRect();
			const headerPositionConfig = this.$refs.header.getBoundingClientRect();
			this.tableHeight = positionConfig.height - headerPositionConfig.height;
			this.init = true;
		})
	},
	mounted() {
		this.initColumn(this.columns);
	}
}
</script>
<style>
	.mgj_table-header {
		height: 40px;
		padding: 10px;
		background: #FAFCFF;
		border: 1px solid #ebeef5;
		border-bottom: none;
	}
	.mgj_table-action {
		float: right;
	}
	.mgj_table-action_item:hover,
	.mgj_table-action_item:hover a {
		color: #0580ff;
		transition: color .3s;
	}
	.mgj_table-action_item ~ .mgj_table-action_item {
		margin-left: 10px;
	}
	.mgj_table_column_custom-content {
		margin: 10px 0 0 5px;
		max-height: 280px;
		overflow-y: auto;
	}
	.mgj_table_column_custom-content .el-checkbox {
		width: 100%;
		margin: 0 !important;
	}
	.mgj_table_column_custom-content .el-checkbox__label {
		font-size: 12px;
	}
	.mgj_table_column_custom-action {
		margin-top: 10px;
		text-align: right;
	}
	.mgj_table-content .el-table thead {
		color: #363636
	}
	.mgj_table-content .el-table thead th {
		background: #FAFCFF;
	}
	.mgj_table-content .el-table--mini th.is-sortable {
		padding: 0;
	}
	.mgj_table_empty-icon {
		color: #ddd;
	}
	.mgj_table_empty-text {
		margin-top: 15px;
		color: #a3a3a3;
		line-height: 20px;
	}
</style>


