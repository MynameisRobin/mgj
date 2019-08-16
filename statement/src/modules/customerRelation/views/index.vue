<template>
	<div class="statistics">
		<div class="statistics_selector">
			<area-selector
				ref="tree"
				:before-click="handleTreeBeforeClick"
				:disabled-select-all="disabledTreeSelectAll"
				:list-data="areaListData">
			</area-selector>
		</div>
		<div class="statistics_main">
			<el-form
				class="statistics_filter_form" 
				:inline="true"
				@submit.native.prevent
				size="small">
				<el-form-item label="展示类型：">
					<el-radio-group v-model="filterData.type">
						<el-radio :label="1">
							顾客状态
							<el-popover placement="bottom" width="340" trigger="hover">
								<div>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">静止客：</span>超过设定天数没有来店的，视为已经流失(静止客户)的客户；</p>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">流失风险客：</span>超过预设天数没有消费记录被视为有流失风险；</p>
									<p><span style="font-weight: 600;">有效顾客：</span>未超过预设天数就产生了消费记录的顾客。</p>
								</div>
								<am-icon class="icon_info" size="14px" isElement slot="reference" name="question"></am-icon>
							</el-popover>
						</el-radio>
						<el-radio :label="0">
							会员阶段
							<el-popover placement="bottom" width="340" trigger="hover">
								<div>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">会员：</span>开办过门店储值卡，资格卡，特权卡或者购买过套餐的顾客，被认定为会员；一个顾客一旦确立为会员，就永远都是会员角色；</p>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">临界会员：</span>卡金总余额低于设定值 ，并且套餐总次数低于设定值；</p>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">潜在会员：</span>在门店有消费记录（至少一次消费）或者有商城购买记录，并且不是会员的顾客，称之为潜在会员；</p>
									<p><span style="font-weight: 600;">新客：</span>有顾客资料，但在门店没有消费记录，在商城也没有购买记录的顾客，新客消费一次或者购买一次，就成为了潜在会员。</p>
								</div>
								<am-icon class="icon_info" size="14px" isElement slot="reference" name="question"></am-icon>
							</el-popover>
						</el-radio>
						<el-radio :label="2">自定义类别</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onSearch">查询</el-button>
				</el-form-item>
			</el-form>
			<div class="statistics_content" :class="searchClassName">
				<div class="statistics_content-empty" v-if="!listData || listData.length === 0">
					<am-icon class="content_empty-icon" size="76px" name="sousuo"></am-icon>
					<p class="content_empty-text">选择左侧常用搜索器快速查看</p>
				</div>
				<div 
					class="statistics_item" 
					v-for="(item, index) in listData"
					:key="item.targetId"
					v-loading="item.loading">
					<div class="statistics_item-header">
						<h4 class="statistics_item-title">{{ item.targetId | title }}</h4>
						<div class="statistics_item-action">
							<span class="statistics_item-time">统计时间：{{ item.createTime | diffDay }}</span>
							<a class="statistics_item-refresh" :class="{'animation': item.loading}" href="javascript:;" @click="refresh(item, index)"><am-icon name="refresh" is-element></am-icon></a>
						</div>
					</div>
					<div class="statistics_item-main">
						<div class="statistics_item-content">
							<dl 
								class="statistics_item-number"
								v-for="(nItem, nIndex) in item.data" 
								:key="nIndex"
								:class="generatorNumberClass(nIndex, nItem)"
								@mouseenter="onHighlight(item.targetId, nIndex)"
								@mouseleave="onDownplay(item.targetId, nIndex)">
								<dt><span class="statistics_item-dot" v-if="currentSearchType === 2" :style="generatorDotStyle(nIndex)"></span>{{ nItem.key }}</dt>
								<dd><strong>{{ nItem.value }}</strong></dd>
							</dl>
						</div>
						<div class="statistics_item-pie">
							<ve-ring
								:theme-name="item.targetId"
								ref="ringChart"
								height="100px"
								:data="item.chartData"
								:colors="pieColors"
								:legend-visible="false"
								:settings="chartSettings">
							</ve-ring>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import Dayjs from 'dayjs'
import VeRing from 'v-charts/lib/ring.common'
import FindIndex from 'lodash.findindex'
import LodashSome from 'lodash.some'
import AreaSelector from '#/components/area-selector'
import Api from '@/api'
let currentSearchObjList = [];
const SearchTypeConfig = {
	1: {
		colors: ['#10951C', '#D40000', '#E69A1E'],
		className: 'search_type_status'
	},
	0: {
		colors: ['#10951C', '#66A2ED', '#7869E1', '#E69A1E'],
		className: 'search_type_stage'
	},
	2: {
		colors: [
			'#00BFA5', '#7986CB', '#EF9A9A', '#7B1FA2', '#4A148C', '#26A69A', '#C5CAE9', '#C8E6C9', '#A5D6A7',
			'#009688', '#9FA8DA', '#FFCDD2', '#1B5E20', '#FFECB3', '#FFD54F', '#FFEE58', '#3F51B5', '#FDD835',
			'#8C9EFF', '#FBC02D', '#F9A825', '#F57F17', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548',
			'#3E2723', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#880E4F', '#BBDEFB', '#90CAF9',
			'#64B5F6', '#42A5F5', '#2196F3', '#1976D2', '#0D47A1', '#4DB6AC', '#FF8A80', '#81C784', '#66BB6A',
			'#4CAF50', '#43A047', '#388E3C', '#FFCA28', '#FFC107', '#FFB300', '#B2DFDB', '#FFF59D', '#5C6BC0',
			'#FFA000', '#FF6F00', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#8E24AA', '#80CBC4', '#E57373',
		],
		className: 'search_type_custom'
	}
}
export default {
	name: 'statistics',
	components: {
		AreaSelector,
		VeRing
	},
	data() {
		return {
			areaListData: [],
			filterData: {
				type: 1
			},
			currentSearchType: 1,
			listData: null,
			currentPostData: null,
			chartSettings: {
				labelLine: {show: false},
				label: {show: false},
				radius: [20, 40],
				offsetY: 50,
			},
		}
	},
	computed: {
		pieColors() {
			return SearchTypeConfig[this.currentSearchType].colors;
		},
		searchClassName() {
			return SearchTypeConfig[this.currentSearchType].className;
		}
	},
	filters: {
		title(value) {
			const index = FindIndex(currentSearchObjList, item => item.id === parseInt(value));
			return index >= 0 ? currentSearchObjList[index].name : value;
		},
		diffDay(value) {
			const currentDay = Dayjs();
			const targetDate = Dayjs(value);
			const diffDay = currentDay.diff(targetDate, 'day');
			const diffHour = currentDay.diff(targetDate, 'hour');
			const diffMin = currentDay.diff(targetDate, 'minute');
			if (diffDay >= 1) {
				return `${diffDay}天前`;
			}
			if (diffHour >= 1) {
				return `${diffHour}小时前`
			}
			if (diffMin >= 1) {
				return `${diffMin}分钟前`
			}
			return '刚刚'
		}
	},
	methods: {
		generatorDotStyle(index) {
			const color = index === 0 ? '#10951C' : this.pieColors[index - 1];
			return {
				background: color,
			}
		},
		generatorNumberClass(index, item) {
			const ClassPrefix = 'statistics_item';
			const RowCellLength = 5;
			if (index > 0 && index % 5 === 0) {
				const rowIndex = index / 5;
				return [`row_line_${rowIndex}`, `${ClassPrefix}-row_line`]
			}
			const classMaps = {
				'有效顾客': [`${ClassPrefix}-efficacious`],
				'具有流失风险': [`${ClassPrefix}-risk`],
				'静止客': [`${ClassPrefix}-static`],
				'会员': [`${ClassPrefix}-efficacious`],
				'临界会员': [`${ClassPrefix}-static`],
				'潜在会员': [`${ClassPrefix}-potential`],
				'新客': [`${ClassPrefix}-new`],
			}
			if (item) {
				return classMaps[item.key] || null;
			}
			return null
		},
		getTargetEchartsIns(targetId) {
			const ringChartList = this.$refs.ringChart
			const echartIndex = FindIndex(ringChartList, item => parseInt(item.themeName) === parseInt(targetId));
			return echartIndex === -1 ? null : ringChartList[echartIndex].echarts;
		},
		onHighlight(targetId, dataIndex) {
			const echarts = this.getTargetEchartsIns(targetId);
			if (!echarts) return;
			echarts.dispatchAction({
				type: 'highlight',
				dataIndex: dataIndex - 1,
			})
			echarts.dispatchAction({
				type: 'showTip',
				dataIndex: dataIndex - 1,
			})
		},
		onDownplay(targetId, dataIndex) {
			const echarts = this.getTargetEchartsIns(targetId);
			if (!echarts) return;
			echarts.dispatchAction({
				type: 'downplay',
				dataIndex: dataIndex - 1,
			})
			echarts.dispatchAction({
				type: 'hideTip',
			})
		},
		disabledTreeSelectAll(node) {
			const {
				level,
				children
			} = node.data;
			if (level === 1) {
				const hasAuxiliary = LodashSome(children, node => node.softgenre === 3);
				return hasAuxiliary && children.length > 1 && this.filterData.type === 2;
			}
			return [1, 4].indexOf(node.data.level) < 0;
		},
		handleTreeBeforeClick(node) {
			const nodes = this.$refs.tree.getCheckedNodes();
			const hasAuxiliary = LodashSome(nodes, node => node.data.softgenre === 3);
			const {
				level,
				softgenre,
				id,
			} = node.data;
			if (this.filterData.type === 2 && level === 2 && !node.checked) {
				if (hasAuxiliary || (!hasAuxiliary && nodes !== 0 && softgenre === 3)) {
					nodes.forEach(node => {
						if (node.data.id !== id) {
							node.checked = false;
							node.selected = false;
						}
					});
				}
				return true;
			}
			if ([2, 5].indexOf(node.data.level) >= 0) {
				return nodes.length < 10 || node.checked;
			} else {
				node.expanded = !node.expanded;
				return false;
			}
		},
		onSearch() {
			const nodes = this.$refs.tree.getCheckedNodes().map(item => item.data);
			const hasAuxiliary = LodashSome(nodes, node => node.softgenre === 3);
			if (hasAuxiliary && this.filterData.type === 2 && nodes.length > 1) {
				this.$message.warning('自定义类别，附属店只能单选');
				return;
			}
			if (nodes.length === 0) {
				this.$message.warning('请选择查询对象');
				return;
			}
			if (nodes.length > 10) {
				this.$message.warning('最多查询十个对象的数据，请调整对象的选择');
				return;
			}
			currentSearchObjList = nodes;
			const parentShopId = nodes[0].parentShopId;
			const level = nodes[0].level;
			const targetIds = nodes.map(node => node.id);
			this.currentPostData = {
				...this.filterData,
				targetIds,
				parentShopId,
				level
			}
			this.currentSearchType = this.currentPostData.type;
			this.$http.post('/member!crsStatistics.action', this.currentPostData).then(res => {
				const {
					code,
					content
				} = res.data;
				if (code === 0) {
					const currentDay = Dayjs();
					let needRefreshList = [];
					targetIds.forEach((targetId, targetIndex) => {
						const findIndex = FindIndex(content, item => parseInt(item.targetId) === parseInt(targetId));
						if (findIndex === -1) {
							content.splice(targetIndex, 0, {
								data: [],
								targetId: String(targetId),
							})
						}
					})
					content.forEach((item, index) => {
						const { createTime } = item;
						if (!createTime || currentDay.diff(Dayjs(createTime), 'hour', true) > 72) {
							item.loading = true;
							needRefreshList.push({
								data: { targetId: item.targetId},
								index
							})
						} else {
							item.loading = false;
						}
						if (item.data.length > 0) {
							const {
								data,
								chartData
							} = this.convertNumberData(item.data);
							item.data = data;
							item.chartData = chartData;
						}
					})
					this.listData = content;
					needRefreshList.forEach(item => {
						this.refresh(item.data, item.index);
					})
				}
			})
		},
		convertNumberData(data) {
			const { type } = this.currentPostData;
			const totalIndex = FindIndex(data, item => ['totalmb', '全部'].indexOf(item.key.toLocaleLowerCase()) !== -1);
			const totalData = data[totalIndex];
			data.splice(totalIndex, 1);
			if (totalData) {
				const totalKeyMaps = {
					0: '总顾客',
					1: '总数',
					2: '全部',
				}
				totalData.key = totalKeyMaps[type];
			}
			if ([0, 1].indexOf(type) !== -1) {
				const keyMaps = {
					// 会员阶段
					MEMBER: {
						label: '会员',
						index: 1
					},
					POTENTIALMB: {
						label: '潜在会员',
						index: 2
					},
					NEWMB: {
						label: '新客',
						index: 3,
					},
					CRITIMB: {
						label: '临界会员',
						index: 4
					},
					// 顾客状态排序
					EFFECTIVEMB: {
						label: '有效顾客',
						index: 1,
					},
					RISKMB: {
						label: '具有流失风险',
						index: 2,
					},
					STATICMB: {
						label: '静止客',
						index: 3
					}
				}
				let newData = data.map(item => undefined);
				data.forEach(item => {
					const {index, label} = keyMaps[item.key];
					item.key = label;
					newData[index - 1] = item;
				})
				data = newData;
			}
			if (type === 2 && data.length > 0) {
				let sum = 0;
				data.forEach(item => {
					sum += parseFloat(item.value);
				})
				data.push({
					key: '其他',
					value: totalData.value - sum
				})
			}
			const chartData = {
				columns: ['key', 'value'],
				rows: [...data]
			}
			data.unshift(totalData);
			return {
				data,
				chartData
			}
		},
		refresh(data, index) {
			const { targetId } = data;
			const {
				level,
				parentShopId,
				type
			} = this.currentPostData;
			this.listData[index].loading = true;
			this.$http.post('/member!crsStatistics.action', {
				refresh: 1,
				targetId,
				level,
				parentShopId,
				type
			}).then(res => {
				this.listData[index].loading = false;
				const {
					code,
					content
				} = res.data;
				if (code === 0) {
					if (content.data.length > 0) {
						const {
							data,
							chartData
						} = this.convertNumberData(content.data);
						content.data = data;
						content.chartData = chartData;
					}
					content.targetId = String(targetId);
					this.listData.splice(index, 1, content);
				}
			})
		}
	},
	async mounted() {
		let areaRes = await Api.superOperationReportGetAreas({ allInfo: 1, mgjversion: ['3'], shortName: 1 });
		const areaResData = areaRes.data;
		if (areaResData.code === 0) {
			const {
				content
			} = areaResData;
			this.areaListData = [content];
		}
	}
}
</script>
<style>

	@keyframes rotating {
		100% {
			transform:rotate(180deg)
		}
	}
	.statistics_selector {
		position: fixed;
		z-index: 1;
		top: 38px;
		left: 0;
		bottom: 0;
		width: 286px;
		padding: 20px 10px 0;
		background: #f8f8f8;
	}
	.statistics_main {
		margin-left: 306px;
		padding: 20px 0;
	}
	.statistics_filter_form .el-radio__label,
	.statistics_filter_form .el-form-item__label {
		font-size: 12px;
	}
	.statistics_filter_form .icon_info {
		color: #c1c1c1;
	}
	.statistics_item {
		width: 1000px;
	}
	.statistics_item ~ .statistics_item {
		margin-top: 40px;
	}
	.statistics_item-main {
		display: inline-block;
		width: 100%;
		position: relative;
		min-height: 102px;
		border: 1px solid #DCDFE6;
		border-radius: 4px;
		background: #FFFFFF;
	}
	.statistics_content {
		position: relative;
		height: calc(100vh - 130px);
		width: calc(100% - 20px);
		overflow: auto;
	}
	.search_type_status.statistics_content,
	.search_type_stage.statistics_content {
		& .statistics_item-number {
			position: relative;
			&:not(:last-child) {
				&:before {
					content: "+";
					position: absolute;
					top: 50%;
					right: 20px;
					transform: translateY(-50%);
					color: #D8D8D8;
					font-size: 20px;
				}
				&:first-child {
					&:before {
						content: '=';
						color: #909090;
					}
				}
			}
			
			&:hover {
				&:before {
					display: none;
				}
			}
		}
	}
	.statistics_content-empty {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}
	.content_empty-icon {
		color: #ddd;
	}
	.content_empty-text {
		margin-top: 15px;
		color: #a3a3a3;
		line-height: 20px;
	}
	.statistics_item-header {
		overflow: hidden;
		margin-bottom: 8px;
		padding: 0 15px 0 0;
	}
	.statistics_item-title {
		float: left;
		font-size: 13px;
		color: #909090;
		font-weight: normal;
	}
	.statistics_item-time {
		color: #909090;
	}
	.statistics_item-action {
		position: relative;
		float: right;
		padding-right: 20px;
	}
	.statistics_item-content {
		position: relative;
		float: left;
		width: 850px;
		padding: 18px 0;
		overflow: hidden;
	}
	.statistics_item-pie {
		position: absolute;
		top: 50%;
		right: 0;
		width: 150px;
		transform: translateY(-50%);
	}
	.statistics_item-row_line:before {
		position: absolute;
		content: '';
		left: 20px;
		right: 65px;
		height: 1px;
		background: rgb(245, 245, 245);
	}
	.row_line_1::before {
		top: 97px;
	}
	.row_line_2::before {
		top: 191px;
	}
	.row_line_3::before {
		top: 285px;
	}
	.row_line_4::before {
		top: 379px;
	}
	.row_line_5::before {
		top: 473px;
	}
	.statistics_item-number {
		float: left;
		width: 132px;
		margin-left: 30px;
		padding: 12px;
		display: flex;
		flex-direction: column-reverse;
	}
	.statistics_item-number:nth-child(5n) ~ .statistics_item-number {
		margin-top: 30px;
	}
	.statistics_item-number:hover {
		box-shadow: 0 5px 27px 0 rgba(0, 0, 0, .05);
	}
	.statistics_item-number dt {
		display: flex;
		align-items: center;
		line-height: 1.3;
		font-size: 12px;
		color: #A4ABB1;
		transition: color .3s;
	}
	.statistics_item-number dd {
		font-size: 18px;
		color: #222;
		line-height: 1.4;
	}
	.statistics_item-dot {
		width: 7px;
		height: 7px;
		margin-right: 3px;
		border-radius: 100%;
	}
	.statistics_item-efficacious.statistics_item-number:hover dt,
	.statistics_item-efficacious.statistics_item-number dd {
		color: #10951C;
	}
	.statistics_item-risk.statistics_item-number:hover dt,
	.statistics_item-risk.statistics_item-number dd {
		color: #D40000;
	}
	.statistics_item-static.statistics_item-number:hover dt,
	.statistics_item-static.statistics_item-number dd {
		color: #E69A1E
	}
	.statistics_item-potential.statistics_item-number:hover dt,
	.statistics_item-potential.statistics_item-number dd {
		color: #66A2ED;
	}
	.statistics_item-new.statistics_item-number:hover dt,
	.statistics_item-new.statistics_item-number dd {
		color: #7869E1;
	}
	.statistics_item-refresh {
		position: absolute;
		right: 0;
		top: 0;
	}
	.statistics_item-refresh.animation {
		animation: rotating 1s linear infinite;
	}
</style>
