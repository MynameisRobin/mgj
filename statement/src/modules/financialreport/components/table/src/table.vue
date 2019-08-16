<template>
	<div class="am_table" :class="tableClass">
		<div class="am_table-header" v-if="tableHeader && tableData && tableData.length">
			<div class="am_table-action" v-if="actionBar">
				<a href="javascript:;" class="am_table-action_item" @click="onPrintOrExcel"><am-icon name="print_icon"></am-icon>打印</a>
				<a href="javascript:;" class="am_table-action_item" @click="onPrintOrExcel"><am-icon name="export_icon"></am-icon>导出</a>
			</div>
		</div>
		<el-table
			v-if="!loading"
			ref="table"
			:data="tableData"
			@expand-change="handleExpandChange"
			:show-summary="showSummary"
			stripe
			:summary-method="renderSummary"
			highlight-current-row
			:header-cell-style="renderCellStyle"
			:cell-style="renderCellStyle"
			:height="wrapHeight">
			<el-table-column :width="fixedColumnWidth" :fixed="index === 0 && fixed" v-for="(item, index) in columnData" :key="index" :label="item.label" :prop="item.index">
				<template slot-scope="scope">
					<span style="cursor: pointer;" :title="scope.row[0] | viewFullLabel">{{ scope.row[0] | searchObj | cutString(22)}}</span>
					<am-icon 
						title="点击查看同比"
						class="expand_icon" 
						size="16px"
						name="fenxi"
						v-if="expand"
						@click.native="toggleRowExpansion(scope)">
					</am-icon>
				</template>
				<template v-if="item.children">
					<el-table-column
						:min-width="computedItemWidth(cItem.index)"
						:sortable="cItem.label !== '占比' && sortable"
						:sort-method="(a, b) => sortTable(a, b, cItem.index)"
						:render-header="renderHeader"
						header-align="center"
						v-for="(cItem, cIndex) in item.children"
						:key="cIndex"
						:label="cItem.label"
						:formatter="renderCell"
						:prop="cItem.index">
					</el-table-column>
				</template>
			</el-table-column>
			<el-table-column v-if="expand && columnData.length > 0" label="展开同比" type="expand" width="20">
				<template slot-scope="scope">
					<el-table class="child_table" 
							:show-header="false"
							v-loading="!expandData[scope.row[0]]"
							element-loading-text="数据正在努力加载中，稍等片刻"
							:data="expandData[scope.row[0]]">
						<el-table-column
							v-for="(item, index) in columnData"
							:key="index"
							:label="item.label"
							width="200"
							:prop="item.index">
							<template v-if="item.children">
								<el-table-column 
									:min-width="computedItemWidth(cItem.index)"
									header-align="center"
									:formatter="(...params) => renderExpandCell(params, scope.row)"
									v-for="(cItem, cIndex) in item.children"
									:key="cIndex"
									:label="cItem.label" 
									:prop="cItem.index">
								</el-table-column>
							</template>
						</el-table-column>
					</el-table>
				</template>
			</el-table-column>
			<div class="table_empty" slot="empty">
				<am-icon class="table_empty-icon" size="76px" name="sousuo"></am-icon>
				<p class="table_empty-text">选择左侧常用搜索器快速查看</p>
			</div>
		</el-table>
	</div>
</template>

<script>
const hexToRgb = function (hex) {
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

const getSearchObjLabel = function (value) {
	if (!value) return value;
	let index = value.indexOf(')');
	if (index !== -1) {
		return value.substr(index + 1)
	}
	return value;
}
const getSearchLabelInfo = function (label) {
	if (!label) return [];
	let sIndex = label.indexOf('(');
	let eIndex = label.indexOf(')');
	if (sIndex === -1 || eIndex === -1) {
		return [];
	}
	let infoStr = label.substr(sIndex + 1, eIndex - 1);
	let infoArr = infoStr.split('_');
	return infoArr;
}
let currentColspan = 0;
import FindIndex from 'lodash.findindex'
import CellStyleConfig from './cell-style-config'
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from '@/js/storageKeys'
import Dayjs from 'dayjs'
import IsNumber from 'is-number'
export default {
	name: 'AmTable',
	props: {
		data: Object,
		height: String,
		columnWdith: Number,
		fixedChildColumn: {
			type: Function,
			default: () => {
				return false;
			}
		},
		fixedColumnWidth: {
			type: Number,
			default: 200
		},
		showSummary: {
			type: Boolean,
			default: true
		},
		tableTitle: {
			type: String,
			default: '运营报表'
		},
		actionBar: {
			type: Boolean,
			default: true,
		},
		tableHeader: {
			type: Boolean,
			default: true,
		},
		fixed: {
			type: Boolean,
			default: true,
		},
		columnPercent: {
			type: Boolean,
			default: true,
		},
		expand: {
			type: Boolean,
			default: true,
		},
		sortable: {
			type: Boolean,
			default: true,
		},
		requestUri: String,
		requestData: Object,
		dataType: Number,
		renderCellAction: Function,
		handleCellClickAction: Function
	},
	data() {
		return {
			columns: [],
			columnData: [],
			tableData: [],
			showSelectColumn: false,
			expandData: {},
			expandShowConfig: {},
			percentConfig: {},
			sums: {},
			wrapHeight: '',
			loading: true
		}
	},
	created() {
		this.$nextTick(() => {
			const amTableDom = document.querySelector('.am_table');
			const positionConfig = amTableDom.getBoundingClientRect();
			this.wrapHeight = `${positionConfig.height}px`;
			this.loading = false;
			this.$nextTick(() => {
				this.$refs.table.$el.addEventListener('click', e => {
					this.handleCellClickAction && this.handleCellClickAction(e);
				})
			})
		})
	},
	computed: {
		tableClass() {
			const {
				reportNo
			} = this.requestData;
			return `report_no_${reportNo}`;
		}
	},
	filters: {
		searchObj(value) {
			return getSearchObjLabel(value);
		},
		viewFullLabel(value) {
			let infoArr = getSearchLabelInfo(value);
			let label = getSearchObjLabel(value)
			if (infoArr[3] && infoArr[3] !== 'undefined') {
				label = `(${infoArr[3]})${label}`;
			}
			return label;
		}
	},
	methods: {
		getSearchNode(label) {
			let infoArr = getSearchLabelInfo(label);
			const [areaId, shopId, selfId] = infoArr;
			let node = this.$parent.getSearchObjNode({
				id: selfId ? selfId : shopId,
				shopId: (shopId && selfId && shopId !== selfId) ? shopId : undefined,
				areaId
			});
			return node;
		},
		computedItemWidth(index) {
			let currentColumnConfig = this.columns[index];
			return currentColumnConfig ? currentColumnConfig.width : 110;
		},
		sortTable(a, b, index) {
			let preVal = a[index];
			let nextVal = b[index];
			let result = -9999999;
			if (IsNumber(preVal)) {
				if (IsNumber(nextVal)) {
					result = preVal - nextVal;
				} else {
					result = preVal;
				}
			} else if (IsNumber(nextVal)) {
				result = 0 - nextVal;
			}
			return result;
		},
		renderExpandCell([row, column, cellValue, index], parentRow) {
			const currentTableData = this.expandData[parentRow[0]];
			let tipsIconName = '';
			const { property } = column;
			let valueNumber = parseFloat(cellValue);
			if (isNaN(valueNumber)) {
				valueNumber = 0;
			}
			let preCellVal = currentTableData ? parseFloat(currentTableData[1][property]) : null;
			if (isNaN(preCellVal)) {
				preCellVal = 0;
			}
			if (preCellVal && index === 0) {
				let diffVal = valueNumber - preCellVal;
				if (diffVal > 0) {
					tipsIconName = 'shang';
				} else if (diffVal < 0) {
					tipsIconName = 'xia'
				}
			}
			let value = valueNumber;
			if (cellValue && cellValue.indexOf('%') > -1) {
				value = `${value}%`
			}
			return <p class="cell_content">{tipsIconName ? <am-icon size="12px" name={tipsIconName}></am-icon> : ''}{(valueNumber > 0 || valueNumber < 0) ? value : '--'}</p>;
		},
		renderCellStyle({row, column, rowIndex, columnIndex}) {
			const { property, level, label } = column;
			let currentVal = row[property];
			let currentColumnConfig = this.columns[property] || {};
			let currentPercentConfig = this.percentConfig[property];

			if (IsNumber(currentVal) && currentVal > 0) {
				if (['他店会员在本店卡金充值', '他店会员在本店赠金充值'].indexOf(label) !== -1) {
					return {
						color: '#da3d4d'
					}
				}
				if (['本店会员在他店卡金充值', '本店会员在他店赠金充值'].indexOf(label) !== -1) {
					return {
						color: '#51a661'
					}
				}
				if ((label.indexOf('会员在他店') > 0 || label.indexOf('转到他店') > 0 || label.indexOf('转移到他店') > 0 || label.indexOf('总出') !== -1)) {
					return {
						color: '#da3d4d'
					}
				}
				if ((label.indexOf('会员在本店') > 0 || label.indexOf('转到本店') > 0 || label.indexOf('转移到本店') > 0 || label.indexOf('总进') !== -1)) {
					return {
						color: '#51a661'
					}
				}
			}
			if (currentColumnConfig.showPercent) {
				return {
					backgroundColor: '#dce8fc'
				}
			}
			if (currentPercentConfig) {
				return {
					backgroundColor: '#f1f6ff'
				}
			}
		},
		renderCell(row, column, cellValue, index) {
			const { property } = column;
			let currentColumnConfig = this.columns[property] || {};
			// 占比颜色区分
			let className = 'cell_content';
			let styleObj = {};
			
			let NumberVal = column.label === '编号' ? cellValue : parseFloat(cellValue);
			let value = NumberVal;
			if (!IsNumber(cellValue)) {
				if (cellValue !== 'null' && NumberVal !== 0) {
					value = cellValue;
				} else {
					value = '--';
				}
			} else if (cellValue && (typeof cellValue === 'string') && cellValue.indexOf('%') > -1) {
				value = `${value}%`
			}

			let currentPercentConfig = this.percentConfig[property];
			if (currentPercentConfig || currentColumnConfig.kpiryg > 0) {
				let summary = this.sums[property];
				let currentVal = parseFloat(cellValue);
				let percent = currentVal;
				if (currentPercentConfig && !isNaN(percent)) {
					className += ' is_percent'
					const { originIndex } = currentPercentConfig;
					summary = this.sums[originIndex];
					currentVal = summary * percent;
					value = percent > 0 ? `${parseFloat((percent * 100).toFixed(2))}%` : '--';
				}
				summary = parseFloat(summary);
				const average = parseFloat(summary / this.tableData.length);
				if (summary !== 0 && average !== 0 && (currentPercentConfig || this.dataType === 0)) {
					CellStyleConfig.forEach((item, index) => {
						const { range, style } = item;
						if (range.length > 1) {
							let min = average * range[0];
							let max = average * range[1];
							if ((currentVal >= min && currentVal < max ) || (range[0] === 0 && currentVal < max)) {
								styleObj = {...style};
							}
						} else if (range.length === 1) {
							let max = average * range[0];
							if (currentVal > max) {
								styleObj = {...style};
							}
						}
					})
				}
			}
			// 同比显示
			let tipsIconName = "";
			if (this.expandShowConfig[row[0]]) {
				let currentExpandData = this.expandData[row[0]];
				let preCellVal = currentExpandData ? parseFloat(currentExpandData[0][property]) : null;
				if (isNaN(preCellVal)) {
					preCellVal = 0;
				}
				if (!currentPercentConfig) {
					let diffVal = parseFloat(value) - preCellVal;
					if (diffVal > 0) {
						tipsIconName = 'shang';
					} else if (diffVal < 0) {
						tipsIconName = 'xia'
					}
				}
			}
			if (currentPercentConfig && column.label === '占比' && NumberVal > 0 && styleObj.color) {
				let {r, g, b} = hexToRgb(styleObj.color);
				let rgbStr = `${r},${g},${b}`;
				let bgColor =  `rgba(${rgbStr},.2)`;
				let bgImage = `linear-gradient(to right, ${bgColor} 0%, ${bgColor} ${value}, transparent ${value}, transparent 100%)`;
				styleObj.background = bgImage;
			}
			if (parseInt(property) === 0) {
				value = getSearchObjLabel(value);
			}
			return <p style={styleObj} title={value} class={className}>{tipsIconName ? <am-icon size="12px" name={tipsIconName}></am-icon> : ''}{value ? value : '--'}{(this.renderCellAction && column.label !== '占比') && this.renderCellAction({row, column, cellValue, index}, currentColumnConfig)}</p>;
		},
		renderSummary({columns, data}) {
			let sums = [];
			let summaryConfig = {};
			columns.forEach((column, index) => {
				if (index === 0) {
					sums[index] = '合计';
					return;
				}
				const { property, label } = column;
				if (label === '展开占比') {
					sums[index] = '--';
					return;
				};
				const currentSum = this.sums[property];
				sums[index] = (typeof currentSum === 'number' && currentSum !== 0) ? parseFloat(currentSum.toFixed(2)) : '--';
			})
			return sums;
		},
		handleExpandChange(row, expandedRows) {
			let rowsIndex = FindIndex(expandedRows, item => item[0] === row[0]);
			if (rowsIndex !== -1) {
				this.$refs.table.setCurrentRow(row);
				if (this.expandData[row[0]] === undefined) {
					let index = FindIndex(this.tableData, item => item[0] === row[0]);
					const { searchObj } = this.requestData;
					let postData = {
						...this.requestData
					}
					if (this.dataType === 1) {
						postData.searchObj = searchObj;
						postData.startTime = Dayjs(row[0]).startOf('month').toDate().getTime();
						postData.endTime = Dayjs(row[0]).endOf('month').toDate().getTime();
					} else if (this.dataType === 3) {
						postData.searchObj = searchObj;
						postData.startTime = Dayjs(row[0]).startOf('day').toDate().getTime();
						postData.endTime = Dayjs(row[0]).endOf('day').toDate().getTime();
					} else {
						if (searchObj.length === 1 && searchObj[0].allChildren) {
							let node = this.getSearchNode(row[0]);
							let { 
								level,
								children
							} = node.data;
							let subIds = null;
							if ([1, 4].includes(level)) {
								subIds = [];
								children.forEach(cItem => {
									subIds.push(cItem.id);
								})
							}
							let nodeItem = {
								...node.data,
								subIds
							}
							delete nodeItem.children;
							postData.searchObj = [nodeItem]
							postData.level = level;
						} else {
							postData.searchObj = [searchObj[index]];
						}
					}
					this.$http.post(this.requestUri, postData).then(res => {
						let resData = res.data;
						const { code, content } = resData;
						if (code === 0) {
							this.expandShowConfig[row[0]] = true;
							this.$set(this.expandData, row[0], content.data)
						}
					})
				} else {
					this.expandShowConfig[row[0]] = true;
				}
			} else {
				this.expandShowConfig[row[0]] = false;
			}
		},
		onPrintOrExcel() {
			let topTrContent = '';
			let childTrContent = '';
			let showColumnIndexList = [];
			this.columnData.forEach(item => {
				const { label, colspan, rowspan, children } = item;
				if (children) {
					children.forEach(cItem => {
						if (!cItem.isPercent && cItem.checked) {
							childTrContent += `<th>${cItem.label}</th>`;
						}
					})
				}
				topTrContent += `<th colspan="${colspan}" rowspan="${rowspan}">${label}</th>`;
			})
			let tbodyContent = '';
			this.tableData.forEach(item => {
				let trContent = '';
				item.forEach((cItem, cIndex) => {
					if (!this.percentConfig[cIndex]) {
						let value = cItem;
						if (cIndex === 0) {
							let valueArr = value.split('-');
							value = (Dayjs(value).isValid() && valueArr.length === 2) ? Dayjs(value).format('YYYY年-MM月') : getSearchObjLabel(cItem);
						}
						let numberValue = parseFloat(value);
						if (cIndex !== 0 && !isNaN(numberValue)) {
							value = numberValue;
						}
						trContent += `<td>${value || '-'}</td>`;
					}
				})
				tbodyContent += `<tr>${trContent}</tr>`
			})
			let sumTrContent = '<td>合计</td>';
			for (let i in this.sums) {
				const value = this.sums[i];
				const tdValue = value && i > 0 ? Number(value.toFixed(2)) : value;
				sumTrContent += `<td>${tdValue || '-'}</td>`;
			}
			tbodyContent += sumTrContent;
			const tableHead = `<tr>${topTrContent}</tr><tr>${childTrContent}</tr>`;
			const tableBody = `<tbody>${tbodyContent}</tbody>`;
			let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0"><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>`;
			const { origin } = window.location;
			window.localStorage.setItem(PRINT_TABLE_TITLE, this.tableTitle)
			window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
			window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, '', 'height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no');
		},
		getCurrentColumnSummary(index) {
			let summary = 0;
			let isPercent = false;
			for (let item of this.tableData) {
				let currentVal = item[index] || 0;
				let valType = typeof currentVal;
				if (valType === 'string' && currentVal.indexOf('%') > -1) {
					isPercent = true;
				}
				if (valType === 'number' || (valType === 'string')) {
					summary += parseFloat(currentVal);
				} else {
					summary = '--';
					break;
				}
			}
			if (isPercent) {
				summary = `${summary}%`;
			}
			return summary;
		},
		getParentColumn(index) {
			return this.columnData.find(item => index < item.endColspan && index >= item.startColspan);
		},
		showPercentage({ column, $index }, e) {
			e.stopPropagation();
			const { property, level } = column;
			let columnConfig = this.columns[property];
			const { showPercent } = columnConfig;
			let currentLevelGroup;
			let currentParent;
			if (level === 2) {
				currentParent = this.getParentColumn(property);
				currentLevelGroup = currentParent.children;
			} else {
				currentLevelGroup = this.columnData;
			}
			let currentColumnIndex = FindIndex(currentLevelGroup, item => item.label === column.label);
			if (showPercent !== undefined) {
				currentParent.children[currentColumnIndex + 1].checked = !showPercent;
				if (!showPercent) {
					this.tableData.forEach(item => {
						this.$refs.table.toggleRowExpansion(item, false);
					})
				}
				columnConfig.showPercent = !showPercent;
				return;
			}
			let summary = this.sums[property];
			currentLevelGroup.splice(currentColumnIndex + 1, 0, {label: '占比', isPercent: true, index: String(currentColspan), checked: true});
			this.tableData.forEach(item => {
				this.$refs.table.toggleRowExpansion(item, false);
				let currentVal = item[property] || 0;
				// let percentNumber = ((parseFloat(currentVal) / summary) * 100);
				// if (percentNumber > 100) percentNumber = 100;
				// let percent = summary ? `${percentNumber.toFixed(2)}%` : '-';
				let percent = Math.min(parseFloat(currentVal) / summary, 1);
				item.splice(currentColspan, 0, percent);
			});
			this.percentConfig[currentColspan] = {
				originIndex: property
			}
			currentColspan += 1;
			columnConfig.showPercent = true;
		},
		renderHeader(h, { column, $index }) {
			let tipList = CellStyleConfig.map(item => {
				return (
					<div class="percent_tips-item">
						<i class="percent_tips-icon" style={{borderColor: item.style.color}}></i>
						{item.remark}
					</div>
				)
			})
			let percent = (
				<el-popover
					placement="right"
					width="140"
					trigger="hover">
					<div class="percent_tips">
						{tipList}
					</div>
					<i style="color: #A5A8AC; margin-left: 5px;" class="el-icon-question" slot="reference"></i>
				</el-popover>
			)
			const { property, label } = column;
			let columnConfig = this.columns[property] || {};
			let className = 'child_header_cell';
			if (label === '占比') {
				className += ' is_percent'
			}
			let defaultIcon = (this.columnPercent && columnConfig.kpipct === '1') ? (<am-icon title="点击查看占比" style={{ marginLeft: '15px' }} name="pie" class={['percent_icon', {'is_active': columnConfig.showPercent }]}  nativeOnClick={e => this.showPercentage({column, $index}, e)}></am-icon>) : '';
			let icon = label === '占比' ? percent : defaultIcon;
			return (
				<span class={className}>{ label }{icon}</span>
			)
		},
		handleGroupChange(item) {
			item.isIndeterminate = false;
			item.children.forEach(cItem => {
				cItem.checked = item.checked;
			})
		},
		handleChildChange(cItem, item) {
			let checkcount = item.children.reduce((accumulator, current) => {
				return accumulator + (current.checked ? 1 : 0);
			}, 0)
			item.isIndeterminate = checkcount > 0 && checkcount < item.children.length;
			item.checked = checkcount === item.children.length;
		},
		toggleRowExpansion(scope) {
			const { row } = scope;
			this.$refs.table.toggleRowExpansion(row);
			this.$refs.table.toggleRowSelection(row);
		},
		getTableColumnData(data) {
			let result = [];
			const {headTop, head} = data;
			if (!headTop || !head) return [];
			let selectData = this.selectData;
			headTop.forEach((item, index) => {
				let { colspan, rowspan, text } = item;
				let columnData = {
					label: text,
					startColspan: currentColspan,
					colspan,
					rowspan,
					checked: true
				}
				if (colspan) {
					columnData.children = [];
					let maxCol = parseInt(currentColspan) + parseInt(colspan);
					for (let i = currentColspan; i < maxCol; i++) {
						columnData.children.push({
							label: head[i],
							index: String(i),
							checked: true
						})
						this.sums[i] = this.getCurrentColumnSummary(i);
					}
				} else {
					colspan = 1;
					columnData.index = String(currentColspan);
				}
				currentColspan += parseInt(colspan);
				columnData.endColspan = currentColspan;
				result.push(columnData);
			});
			return result;
		},
		init() {
			currentColspan = 0;
			let tableData = this.data || {};
			const { data, columns, headTop, head } = tableData;
			this.tableData = data || [];
			this.columns = columns;
			this.percentConfig = {};
			this.expandShowConfig = {};
			this.expandData = {};
			this.sums = {};
			this.columnData = this.getTableColumnData({headTop, head});
		},
	},
	watch: {
		data: 'init'
	},
	mounted() {
		this.init();
	}
}
</script>
<style lang="less">
	.am_table {
		height: calc(100vh - 165px);
		& .el-table__expand-column {
			visibility: hidden;
		}
		& .el-table--striped .el-table__body .el-table__row--striped.expanded > td,
		& .el-table__body .expanded > td {
			background-color: #cfe1ff;
		}
		& .el-table__body tr.hover-row > td,
		& .el-table__body tr.hover-row.current-row > td,
		& .el-table__body tr.hover-row.el-table__row--striped > td,
		& .el-table__body tr.hover-row.el-table__row--striped.current-row > td {
			background: #f1f6ff;
		}
		& .el-table .caret-wrapper {
			margin-right: -7px;
		}
		& .el-table--striped tr.el-table__row--striped td {
			background: #fbfcfd;
		}
		& .el-table thead {
			color: #363636;
		}
		& .el-table th > .cell {
			display: flex;
			align-items: center;
		}
		& .el-table .cell {
			height: 23px;
			line-height: 23px;
			& .cell_content:empty::before {
				content: '--';
			}
			& .cell_content {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		& .el-table .iconfont {
			color: #A5A8AC;
		}
		& .child_header_cell {
			flex: 1;
			display: flex;
			justify-content: space-between;
			&.is_percent {
				justify-content: flex-start;
			}
		}
		& .el-table thead.is-group th {
			background: #FAFCFF;
		}
		& .el-table__expanded-cell[class*=cell] {
			padding: 0 19px 0 0 !important;
			border-bottom: none !important;
		}
		& .el-table__expanded-cell {
			& td {
				border-bottom: none !important;
			}
			& .el-loading-mask {
				background-color: #e7f0ff;
			}
			& .el-loading-spinner {
				padding-left: 210px;
				text-align: left;
			}
			& .el-loading-spinner .circular {
				float: left;
				margin-right: 20px;
			}
			& .el-loading-text {
				line-height: 42px;
			}
		}
		& .el-table .is_active,
		& .el-table .expanded .expand_icon,
		& .el-table .expand_icon:hover,
		& .el-table .percent_icon:hover {
			color: #409EFF;
		}
		& .expand_icon {
			margin-right: -7px;
			padding: 0 7px;
			float: right;
			cursor: pointer;
		}
		& td:not(:first-child) {
			& .cell,
			& .cell_content {
				text-align: right;
				& .mgj-info {
					margin-left: 7px;
					transition: color .3s;
					&:hover {
						color: #409EFF;
					}
				}
				& .mgj-shang {
					float: left;
					color: #409EFF;
				}
				& .mgj-xia {
					float: left;
					color: #da3d4d;
				}
			}
			& .is_success {
				color: #51a661;
			}
			& .is_warning {
				color: #da3d4d
			}
		}
		& .child_table {
			& tr:first-child {
				& td {
					background: #dce8fc;
				}
			}
			& tr:nth-child(2) {
				& td {
					background: #ecf3ff;
				}
			}
			& td {
				&:first-child {
					text-align: right;
					color: #0ae;
				}
			}
		}

		&.report_no_11 {
			& .el-table__row {
				& td:nth-child(2),
				& td:nth-child(3),
				& td:nth-child(4) {
					& .cell_content {
						text-align: left;
					}
				}
			}
		}
	}
	.am_table-header {
		height: 40px;
		padding: 10px;
		background: #FAFCFF;
		border: 1px solid #ebeef5;
		border-bottom: none;
	}
	.am_table-action {
		float: right;
	}
	.am_table-action_item {
		& ~ .am_table-action_item {
			margin-left: 10px;
		}
	}
	.checkbox_group-children {
		margin-left: 20px;
		& .el-checkbox {
			display: block;
		}
		& .el-checkbox + .el-checkbox {
			margin-left: 0;
		}
	}
	.am_table-column_select-content {
		height: 250px;
	}
	.am_table_column_select-button {
		padding-top: 12px;
	}
	.am_table_column_select-title {
		padding-bottom: 12px;
	}
	.percent_tips-item {
		line-height: 1.4;
		& .percent_tips-icon {
			display: inline-block;
			margin-right: 10px;
			width: 10px;
			height: 10px;
			border: 2px solid #222;
			border-radius: 100%;
		}
	}
	.table_empty-icon {
		color: #ddd;
	}
	.table_empty-text {
		margin-top: 15px;
		color: #a3a3a3;
		line-height: 20px;
	}
</style>
