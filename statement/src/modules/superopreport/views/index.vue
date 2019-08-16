<template>
	<div class="statement" v-loading="initLoading" :class="{show_mask: sideslipVm.showReportMain}">
		<am-sideslip v-if="!initLoading" class="report_sideslip" v-model="sideslipVm.showSideslip">
			<el-tabs class="report_sideslip-tabs" v-model="sideslipVm.tabsActiveName">
				<el-tab-pane label="推荐报表" name="systemReport">
					<report-list 
						is-system
						ref="systemReportList"
						@item-close-edit="handleCloseEditReport"
						@item-click="handleEditReport"
						@item-edit="handleEditReport"
						:active-id="sideslipVm.currentReportId"
						:edit-id="currentEditReportVm.id">
					</report-list>
				</el-tab-pane>
				<el-tab-pane label="我的报表" name="userReport">
					<report-list 
						sortable
						ref="reportList"
						@item-close-edit="handleCloseEditReport"
						@item-edit="handleEditReport"
						:edit-id="currentEditReportVm.id"
						:active-id="sideslipVm.currentReportId"
						@item-click="handleSelectReport">
					</report-list>
				</el-tab-pane>
				<el-tab-pane label="手机报表" name="mobileReport">
					<report-list 
						sortable
						ref="mobileReportList"
						:type="1"
						@item-close-edit="handleCloseEditReport"
						@item-edit="handleEditReport"
						:edit-id="currentEditReportVm.id"
						:active-id="sideslipVm.currentReportId"
						@item-click="handleSelectReport">
					</report-list>
				</el-tab-pane>
			</el-tabs>
			<div class="report_sideslip-custom">
				推荐报表不合适？您还可以 <el-button size="mini" @click="onCreateReport" :class="{'is_custom_unsave': isCustomReportUnsave }">自定报表<i></i></el-button>
			</div>
			<transition name="el-fade-in-linear">
				<div class="report_edit_main" v-show="sideslipVm.showReportMain">
					<div class="area_list">
						<area-selector :node-level.sync="currentSearchObjLevel" ref="tree" @change="handleSearchObjChange" v-model="currentEditReportVm.searchObj"></area-selector>
					</div>
					<div class="kpi_list">
						<div class="kpi_list-header">
							<h3 class="kpi_list-title">{{ currentEditReportVm.title || '创建新方案' }}</h3>
							<p class="kpi_list-info">
								{{ currentEditReportVm.updEmpName || currentEditReportVm.empName }}
								<template v-if="currentEditReportVm.updEmpName">修改于 {{ currentEditReportVm.updTime | date }}</template>
								<template v-else-if="currentEditReportVm.createTime">添加于{{ currentEditReportVm.createTime | date }}</template>
							</p>
							<el-popover
								:offset="-50"
								placement="bottom"
								width="200"
								trigger="hover"
								:content="currentEditReportVm.remark">
								<am-signle-line-text slot="reference" class="kpi_list-remark">
									{{ currentEditReportVm.remark }}
								</am-signle-line-text>
							</el-popover>
							<el-popover
								placement="top"
								title="您编辑报表，请修改信息"
								width="350"
								trigger="click"
								@show="handleShowEditReportTextForm"
								v-if="currentEditReportVm.id && currentEditReportVm.empId !== -1">
								<el-form ref="form" :model="editReportTextContentVm">
									<el-form-item prop="title" :rules="[{ required: true, message: '请输入方案标题'},{ max: 15, message: '方案标题最多15个字'}]">
										<el-input placeholder="输入名称" v-model="editReportTextContentVm.title"></el-input>
									</el-form-item>
									<el-form-item prop="remark">
										<el-input type="textarea" maxlength="200" placeholder="请输入备注，如果有的话~" v-model="editReportTextContentVm.remark"></el-input>
									</el-form-item>
									<el-form-item>
										<div class="action_button_wrap">
											<el-button
												size="small"
												type="primary"
												@click="saveReport(true)"
												:loading="sideslipVm.saveReportLoading"
											>保存编辑</el-button>
										</div>
									</el-form-item>
								</el-form>
								<div class="kpi_list-edit" slot="reference">
									<am-icon name="edit" size="18px"></am-icon>
								</div>
							</el-popover>
							
						</div>
						<div class="kpi_list-content">
							<kpi-selector ref="kpiSelector" :valid-subsidiary="validSubsidiary" :level="currentSearchObjLevel" v-model="currentEditReportVm.groups"></kpi-selector>
						</div>
						<div class="kpi_list-footer">
							<el-popover
								placement="top"
								width="160"
								trigger="click"
								v-if="isCurrentReportForUser">
								<p>确定删除方案？</p>
								<div style="text-align: right; margin: 0">
									<el-button size="mini" type="text" @click="hidePopoverForm">取消</el-button>
									<el-button type="primary" size="mini" @click="onRemoveCurrentReport" :loading="sideslipVm.deleteLoading">确定</el-button>
								</div>
								<div class="action_delete" slot="reference">
									<am-icon size="20px" name="remove"></am-icon>
								</div>
							</el-popover>
							<i v-else></i>
							
							<div class="action_group">
								<el-button type="primary" :disabled="!validCurrentReportMain" @click="onUnsaveSearch">
									<template v-if="isCurrentReportEdit || !oldEditReportVm || currentEditReportVm.unsaved">
										仅查询
									</template>
									<template v-else>
										选择此报表查询
									</template>
								</el-button>
								<el-popover
									placement="top"
									title="您选择了保存筛选报表，请为它命名"
									width="350"
									trigger="click"
									v-if="!currentEditReportVm.id || isCurrentReportEdit || currentEditReportVm.unsaved"
									@show="handleShowEditReportTextForm">
									<el-form ref="form" :model="editReportTextContentVm" size="mini">
										<el-form-item prop="title" :rules="[{ required: true, message: '请输入方案标题'},{ max: 15, message: '方案标题最多15个字'}]">
											<el-input placeholder="输入名称" v-model="editReportTextContentVm.title"></el-input>
										</el-form-item>
										<el-form-item prop="remark">
											<el-input type="textarea" maxlength="200" placeholder="请输入备注，如果有的话~" v-model="editReportTextContentVm.remark"></el-input>
										</el-form-item>
										<el-form-item>
											<el-checkbox
												:disabled="!!currentEditReportVm.id && currentEditReportVm.empId !== -1"
												:true-label="1" :false-label="undefined"
												v-model="editReportTextContentVm.type">
												保存为手机报表
												<el-popover
													placement="right"
													width="300"
													trigger="hover"
													content="勾选保存后可到美管加APP-超级报表中查看">
													<am-icon class="icon_info" slot="reference" name="info"></am-icon>
												</el-popover>
											</el-checkbox>
										</el-form-item>
										<el-form-item>
											<div class="action_button_wrap">
												<el-button
													size="small"
													type="primary"
													@click="saveReport(false)"
													:loading="sideslipVm.saveReportLoading"
												>保存并确认筛选</el-button>
											</div>
										</el-form-item>
									</el-form>
									<el-button type="primary" slot="reference" :disabled="!validCurrentReportMain">
										<template v-if="currentEditReportVm.id">保存修改及查询报表</template>
										<template v-else>保存筛选及查询</template>
									</el-button>
								</el-popover>
							</div>
						</div>
					</div>
					<div class="report_edit_main-close" @click="handleCloseEditReport">
						<am-icon size="35px" name="close" is-element></am-icon>
					</div>
				</div>
			</transition>
			
		</am-sideslip>
		<el-form class="list_filter_form" :inline="true">
			<el-form-item label="同级切换：" v-if="cascaderData.length > 1">
				<el-cascader
					@change="onTableSearch"
					v-model="cascaderVm"
					:options="cascaderData"
					:props="{label: 'name', value: 'id', children: 'children'}">
				</el-cascader>
			</el-form-item>
			<el-form-item label="显示内容：">
				<el-radio :disabled="disabledSearchTypePk" v-model="filterData.searchType" :label="0">PK（数据比较）</el-radio>
  				<el-radio v-model="filterData.searchType" :label="1">趋势（按月）</el-radio>
			</el-form-item>
			<el-form-item label="日期：" v-show="filterData.searchType === 0">
				<el-date-picker
					:editable="false"
					v-model="daterange"
					:clearable="false"
					type="daterange"
					:default-time="['00:00:00', '23:59:59']"
					value-format="timestamp"
					range-separator="至"
					start-placeholder="开始日期"
					end-placeholder="结束日期">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="开始月：" v-show="filterData.searchType === 1">
				<el-date-picker
					style="width: 120px"
					:editable="false"
					:clearable="false"
					v-model="filterData.startTime"
					type="month"
					value-format="timestamp"
					default-time="00:00:00"
					@change="handleStarTimeChange"
					placeholder="选择开始月">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="结束月：" v-show="filterData.searchType === 1">
				<el-date-picker
					style="width: 120px"
					:editable="false"
					:clearable="false"
					v-model="filterData.endTime"
					type="month"
					value-format="timestamp"
					default-time="23:59:59"
					@change="handleEndTimeChange"
					placeholder="选择结束月">
				</el-date-picker>
			</el-form-item>
			<el-form-item style="margin-top: -2px;">
				<el-button type="primary" @click="onTableSearch">开始查询</el-button>
			</el-form-item>
		</el-form>
		<am-table 
			:class="{is_sideslip_collapse: !sideslipVm.showSideslip}"
			:table-title="currentEditReportVm.title"
			v-loading="tableLoading"
			:element-loading-text="loadingText"
			request-uri="/superOperationReport!search.action"
			:request-data="tableChildPostData"
			:data="tableData"
			:data-type="currentSearchType">
		</am-table>
	</div>
</template>
<script>
import Api from '@/api'
import Dayjs from 'dayjs'
import AmTable from '#/components/table'
import ReportList from '#/components/report-list'
import KpiSelector from '#/components/kpi-selector'
import AreaSelector from '#/components/area-selector'
import MetaDataMixin from '#/mixins/meta-data'
const defaultStartTime = Dayjs().startOf('day').add(-1, 'M').toDate().getTime();
const defaultEndTime = Dayjs().endOf('day').toDate().getTime();
const initReportData = {
	groups: [],
	searchObj: [],
	id: '',
	showForm: false,
}
export default {
	mixins: [MetaDataMixin],
	components: {
		ReportList,
		AmTable,
		KpiSelector,
		AreaSelector
	},
	data() {
		return {
			initLoading: true,
			isSelectSingleSearchObj: false,
			shopConfigList: [],
			cascaderData: [],
			cascaderVm: [],
			sideslipVm: {
				tabsActiveName: 'systemReport',
				showSideslip: true,
				showReportMain: false,
				saveReportLoading: false,
				deleteLoading: false,
				currentReportId: ''
			},
			tableLoading: false,
			tableData: {},
			filterData: {
				searchType: 0,
				groups: [],
				searchObj: [],
				startTime: defaultStartTime,
				endTime: defaultEndTime

			},
			daterange: [defaultStartTime, defaultEndTime],
			kpiData: [],
			oldEditReportVm: null,
			currentEditReportVm: {
				...initReportData
			},
			editReportTextContentVm: {
				title: '',
				remark: '',
				type: undefined
			},
			tableChildPostData: {},
			currentSearchType: 1,
			validSubsidiary: false,
			needConfigShopIdList: [],
			currentSearchObjLevel: 2,
			oldSearchObjLevel: 2
		}
	},
	computed: {
		shops() {
			return this.$eventBus.env.shops || [];
		},
		// 搜索请求参数需要
		shopsName() {
			let result = {};
			this.shops && this.shops.forEach(shop => {
				const {
					shopName,
					id
				} = shop;
				result[id] = shopName;
			})
			return result;
		},
		disabledSearchTypePk() {
			const { searchObj, searchObjs, headSelected } = this.filterData;
			return (searchObj && searchObj.length === 1 && !searchObj[0].allChildren && searchObj[0].level === headSelected);
		},
		loadingText() {
			let result = '根据您所选择的内容，查询所需的时间可能较长，请耐心等候；如果超过2分钟仍未看到结果，请点击右上角客服和QQ头像联系客服处理。';
			let defaultText = '数据正在努力加载中，稍等片刻';
			const { searchObj } = this.filterData;
			if (!searchObj || searchObj.length === 0) {
				return defaultText;
			}
			const level = searchObj[0].level;
			const timeDiff = this.daterange[1] - this.daterange[0];
			const monthTimestamp = 3600 * 24 * 30 * 1000;
			if (level >= 2 && searchObj.length < 2 && (timeDiff < (3 * monthTimestamp))) {
				result = defaultText;
			}
			return result;
		},
		// currentSearchObjLevel() {
		// 	const { searchObj } = this.currentEditReportVm;
		// 	if (!searchObj || !searchObj.length) {
		// 		return '';
		// 	}
		// 	let item = searchObj[0];
		// 	if (searchObj.length === 1 && item.allChildren) {
		// 		return item.level + 1;
		// 	}
		// 	return item ? item.level : '';
		// },
		isCustomReportUnsave() {
			const { searchObj, groups } = this.filterData;
			return !this.sideslipVm.currentReportId && (searchObj && searchObj.length > 0) && (groups && groups.length > 0);
		},
		isCurrentReportForUser() {
			const { parentShopId } = this.currentEditReportVm;
			return parentShopId && parentShopId !== -1;
		},
		isCurrentReportEdit() {
			const { oldEditReportVm, currentEditReportVm } = this;
			return oldEditReportVm && JSON.stringify(oldEditReportVm) !== JSON.stringify(currentEditReportVm);
		},
		validCurrentReportMain() {
			const { groups, searchObj } = this.currentEditReportVm;
			return (groups && groups.length > 0) && (searchObj && searchObj.length > 0);
		}
	},
	methods: {
		hidePopoverForm() {
			document.body.click();
		},
		getSearchObjNode(nodeData) {
			return this.$refs.tree.getTreeNode(nodeData);
		},
		handleSearchObjChange({value, hasAffiliateShop}) {
			const { searchObj } = this.currentEditReportVm;
			this.validSubsidiary = (searchObj.length >= 1 && (searchObj.length > 1 || searchObj[0].allChildren || searchObj[0].level === 1)) && hasAffiliateShop;
			// 当选择门店，单独选附属店时更新 kpi
			const parentShopId = (hasAffiliateShop && searchObj.length === 1 && searchObj[0].level === 2) ? searchObj[0].parentShopId : null;
			this.$refs.kpiSelector.updateKpis(parentShopId);
		},
		handleStarTimeChange(value) {
			if (value >= this.filterData.endTime) {
				this.filterData.endTime = Dayjs(value).endOf('day').add('1', 'M').toDate().getTime();
			}
		},
		handleEndTimeChange(value) {
			if (value <= this.filterData.startTime) {
				this.filterData.startTime = Dayjs(value).startOf('day').add('-1', 'M').toDate().getTime();
			}
		},
		showReportMain() {
			this.sideslipVm.showReportMain = true;
		},
		hideReportMain() {
			this.sideslipVm.showReportMain = false;
		},

		collapseSideslip() {
			this.hideReportMain();
			this.sideslipVm.showSideslip = false;
		},

		setCurrentReport(item) {
			const scheme = JSON.parse(item.scheme);
			const { groups, searchObj, headSelected } = scheme;
			this.currentSearchObjLevel = headSelected || (searchObj ? Number(searchObj[0].level) : 2);
			this.oldSearchObjLevel = this.currentSearchObjLevel;
			this.currentEditReportVm = {
				groups,
				searchObj,
				...item
			}
			this.oldEditReportVm = {
				groups,
				searchObj,
				...item
			}
		},

		handleCloseEditReport() {
			this.resetCurrentEditReport();
			this.hideReportMain();
		},

		handleEditReport(item) {
			this.setCurrentReport(item);
			this.showReportMain();
		},

		handleShowEditReportTextForm() {
			const { form } = this.$refs;
			const { title, remark, type } = this.currentEditReportVm;
			this.editReportTextContentVm.title = title;
			this.editReportTextContentVm.remark = remark;
			this.editReportTextContentVm.type = type;
			this.$nextTick(() => {
				form && form.clearValidate();
			})
		},

		handleSelectReport(item) {
			const { currentReportId, showReportMain } = this.sideslipVm;
			if (item.id === currentReportId && showReportMain) return;
			this.setReportDataSearch(item)
		},

		onUnsaveSearch() {
			const { id, title, remark, groups, searchObj, parentShopId, shopId, empId, type } = this.currentEditReportVm;
			const headSelected = this.currentSearchObjLevel;
			let scheme = JSON.stringify({groups, searchObj, headSelected});
			let reportData = {
				scheme,
				empId,
				shopId,
				parentShopId,
				title,
				remark,
				id,
				type
			}
			if (this.isCurrentReportEdit || this.oldSearchObjLevel !== headSelected) {
				if (this.isCurrentReportForUser) {
					const reportRef = type === 1 ? 'mobileReportList' : 'reportList';
					this.$refs[reportRef].updateItem(reportData, true);
				} else {
					this.$refs.systemReportList.updateItem(reportData, true);
				}
			}
			this.setReportDataSearch(reportData);
		},

		saveReport(isEdit) {
			this.$refs.form.validate(msg => {
				if (!msg) return;
				const { id, groups, searchObj, parentShopId } = this.currentEditReportVm;
				const {  title, remark, type } = this.editReportTextContentVm;
				const headSelected = this.currentSearchObjLevel;
				let postData = {
					scheme: JSON.stringify({groups, searchObj, headSelected}),
					empId: this.userId,
					shopId: this.shopId,
					parentShopId: this.parentShopId,
					title,
					remark,
					id: parentShopId === -1 ? "" : id,
					type
				}
				this.sideslipVm.saveReportLoading = true;
				this.$http.post('/superOperationReport!saveScheme.action', postData).then(res => {
					this.sideslipVm.saveReportLoading = false;
					this.hidePopoverForm();
					let resData = res.data;
					const { code, message, content } = resData;
					if (code === 0) {
						let { id, title, remark } = content;
						this.currentEditReportVm.id = id;
						this.currentEditReportVm.title = title;
						this.currentEditReportVm.remark = remark;
						const reportRef = type === 1 ? 'mobileReportList' : 'reportList';
						this.$refs[reportRef].updateItem(content);
						postData.id = content.id;
						if (isEdit) {
							this.setCurrentReport(content);
						} else {
							this.sideslipVm.tabsActiveName = type === 1 ? 'mobileReport' : 'userReport';
							this.setReportDataSearch(content);
						}
					}
				});
			})
		},

		onRemoveCurrentReport() {
			this.sideslipVm.deleteLoading = true;
			const { id } = this.currentEditReportVm;
			this.$http.post('/superOperationReport!delScheme.action', {id}).then(res => {
				this.sideslipVm.deleteLoading = false;
				let resData = res.data;
				const { code } = resData;
				if (code === 0) {
					this.hidePopoverForm();
					this.$message.success('删除成功!');
					this.$refs.reportList.removeItem(id);
					this.hideReportMain();
					this.resetCurrentReport();
				}
			})
		},

		resetCurrentEditReport() {
			this.currentEditReportVm = {
				...initReportData
			}
			this.oldEditReportVm = null;
		},

		resetCurrentReport() {
			this.sideslipVm.currentReportId = '';
			this.filterData.groups = [];
			this.filterData.searchObj = [];
		},

		onCreateReport() {
			this.showReportMain();
			if (this.currentEditReportVm.id) {
				this.resetCurrentEditReport();
				this.currentSearchObjLevel = 2;
			}
		},

		onTableSearch() {
			this.onSearch()
		},

		setReportDataSearch(data) {
			const scheme = JSON.parse(data.scheme);
			const { groups, searchObj } = scheme;
			if (groups.length > 4) {
				this.$message.warning('查询 kpi 最多选择 4 组，请重新选择！');
				return;
			}
			if (groups.length > 2) {
				const kpiLength = groups.reduce((pre, item) => {
					return pre += item.kpis.length;
				}, 0)
				if (kpiLength > 40) {
					this.$message.warning('查询 kpi 选择超过 2 组，kpi最多选择 40 个！');
					return;
				}
			}
			let { headSelected } = scheme;
			if (headSelected === undefined) {
				const searchNode = searchObj[0];
				const {
					allChildren,
					level
				} = searchNode;
				headSelected = allChildren ? level + 1 : level;
			}
			// let searchItem = searchObj[0];
			this.cascaderData = [];
			let nodeData = {
				...searchObj[0]
			}
			if (nodeData.level === 1) {
				nodeData.areaId = nodeData.id;
			}
			const {
				level,
				allChildren
			} = nodeData;
			if (headSelected === 5 && level <= 2) {
				let shopLength = searchObj.length;
				if (level === 1) {
					shopLength = searchObj.reduce((pre, item) => {
						return pre += item.subIds ? item.subIds.length || 0 : 0;
					}, 0)
				}
				if (shopLength > 3 || level === 0) {
					this.$message.warning('查询员工时，最多选择三个门店，且不能全选区域！');
					return;
				}
			}
			const currentLevelNode = this.getSearchObjNode(nodeData);
			if (level >= 1 && (allChildren || searchObj.length === 1)) {
				let rootNode = currentLevelNode;
				let rootLevel = currentLevelNode.level;
				while (rootLevel > 0) {
					rootNode = rootNode.parent;
					rootLevel = rootNode.level;
				}
				let cascaderData = null;
				if (Array.isArray(rootNode.data)) {
					cascaderData = rootNode.data[0];
				} else {
					cascaderData = rootNode.data;
				}
				cascaderData = JSON.parse(JSON.stringify(cascaderData));
				const recursionRemoveLastLevelChild = node => {
					let currentLevel = currentLevelNode.data.level;
					let nodeLevel = node.level;
					if (nodeLevel === currentLevel) {
						if ([1, 4].includes(nodeLevel)) {
							let subIds = node.children.map(item => item.id);
							node.subIds = subIds;
						}
						delete node.children;
					}
					if (nodeLevel < currentLevel) {
						node.children && node.children.forEach((cNode, index) => {
							recursionRemoveLastLevelChild(cNode);
						})
					}
				}
				if (cascaderData.level < currentLevelNode.data.level) {
					cascaderData = cascaderData.children;
					cascaderData.forEach(item => {
						recursionRemoveLastLevelChild(item);
					})
					while (cascaderData.length === 1 && cascaderData[0].children) {
						cascaderData = cascaderData[0].children;
					}
					this.cascaderData = cascaderData;
				}
			}
			this.cascaderVm = [];
			this.sideslipVm.currentReportId = data.id;
			// if ((searchObj.length === 1 && !searchObj[0].allChildren) || (searchObj[0].allChildren && currentLevelNode.childNodes.length === 1)) {
			// 	this.filterData.searchType = 1;
			// 	this.isSelectSingleSearchObj = true;
			// }
			this.filterData.searchObjs = undefined;
			this.filterData.headSelected = headSelected;
			this.filterData.groups = groups;
			this.filterData.searchObj = searchObj;
			this.hideReportMain();
			if (this.oldEditReportVm) {
				this.resetCurrentEditReport();
			}
			this.onSearch();
		},

		onSearch() {
			const { daterange, filterData } = this;
			let { groups, searchObj, startTime, endTime, headSelected } = filterData;
			if (groups.length === 0 || searchObj.length === 0) {
				this.$message.error('请选择查询对象及kpi');
				return;
			}
			if (this.filterData.searchType === 0 && !this.disabledSearchTypePk) {
				startTime = daterange[0] || '';
				endTime = daterange[1] || '';
			} else {
				startTime = Dayjs(startTime).startOf('month').toDate().getTime();
				endTime = Dayjs(endTime).endOf('month').toDate().getTime();
			}
			const level = searchObj[0].level;
			this.tableData = {};
			let postData = {
				parentShopId: this.parentShopId,
				...filterData,
				groups,
				searchObj,
				startTime,
				endTime
			}
			console.log('startTime', Dayjs(startTime).format(), 'endTime', Dayjs(endTime).format());
			if (this.cascaderVm.length > 0) {
				let currentNodeData = this.cascaderData;
				let maxLevel = this.cascaderVm.length;
				for (let i = 0; i < maxLevel; i++) {
					currentNodeData.forEach(item => {
						if (item.id === this.cascaderVm[i]) {
							currentNodeData = (i + 1) === maxLevel ? item : item.children;
						}
					})
				}
				const currentNode = this.getSearchObjNode(currentNodeData);
				postData.searchObj = [{
					...currentNodeData,
					allChildren: searchObj[0].allChildren
				}]
				postData.level = currentNodeData.level;
			}
			if (this.disabledSearchTypePk) {
				this.filterData.searchType = 1;
				postData.searchType = 1;
			}
			postData.level = headSelected || postData.searchObj[0].level;
			if (headSelected >= 1) {
				const searchObjs = this.$refs.tree.getSearchObjs(headSelected, postData.searchObj);
				postData.searchObjs = searchObjs;
			}

			let childrenSearchObj = [];
			if (headSelected <= 2) {
				childrenSearchObj = postData.searchObjs[0];
			} else if (searchObj[0].level === headSelected) {
				childrenSearchObj = postData.searchObj;
			} else if (headSelected > 2) {
				postData.searchObjs.forEach(item => {
					childrenSearchObj.push(...item);
				})
			} else {
				childrenSearchObj = postData.searchObjs;
			}
			this.tableChildPostData = {
				...postData,
				searchType: 2,
				searchObj: childrenSearchObj,
				search2before: postData.searchType
			}

			this.tableLoading = true;
			this.currentSearchType = postData.searchType;
			postData.shopsName = this.shopsName;
			// this.$http.post('/superOperationReport!search.action', postData)
			this.$http({
				method: "POST",
				url: '/superOperationReport!search.action',
				data: postData,
				timeout: 60 * 5 * 1000,
			}).then(res => {
				this.tableLoading = false;
				let resData = res.data;
				const { code, content, messgae } = resData;
				if (code === 0) {
					this.tableData = content;
				}
			}).catch(err => {
				this.tableLoading = false;
			});
		},

		validNodeNeedConfig(node) {
			let result = false;
			if (node.data.level === 1) {
				let { shopIds } = node.data;
				shopIds && shopIds.forEach(item => {
					if (this.needConfigShopIdList.indexOf(item) >= 0) {
						result = true;
					}
				})
			} else {
				let shopId = node.data.shopId || node.data.id;
				if (this.needConfigShopIdList.indexOf(shopId) >= 0) {
					result = true;
				}
			}
			return result;
		}
	},
	mounted() {
		const localKey = 'HideKpiDependTips';
		const currentDate = Dayjs().format('YYYY-MM-DD');
		let HideKpiDependTips = localStorage.getItem(localKey);
		this.$http.post('/superOperationReport!shopSPConfig.action').then(res => {
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				let needConfigShopIdList = [];
				content.forEach(item => {
					const {
						acreage,
						costPerMonth,
						empsCostPerMonth,
						id
					} = item;
					if (!acreage && !costPerMonth && !empsCostPerMonth) {
						needConfigShopIdList.push(id);
					}
				})
				this.needConfigShopIdList = needConfigShopIdList;
				if (HideKpiDependTips === currentDate || this.userInfo.role <= 1) return;
				if (needConfigShopIdList.length > 0) {
					this.$confirm('有部分KPI需配置门店经营数据方能查看，请到系统设置进行配置！', '提示', {
						confirmButtonText: '现在配置',
						cancelButtonText: '先不配置',
						type: 'warning'
					}).then(() => {
						window.parent.location.href = `${location.origin}/shair/superOperationReport!config.action`;
					}).catch(() => {
						localStorage.setItem(localKey, currentDate);
					});
				}
			}
		})
	},
	async created() {
		this.initLoading = true;
		let res = await Api.getMetaData();
		this.initLoading = false;
		let resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
	}
	
}
</script>
<style lang="less">
	.am_table {
		transition: all .3s;
		margin-left: 230px;
		width: calc(100% - 230px);
		&.is_sideslip_collapse{
			margin-left: 0;
			width: 100%;
		}
	}
	.report_sideslip {
		padding: 6px;
		font-size: 12px;
		& .report_edit_main {
			position: absolute;
			z-index: 99;
			left: 100%;
			top: 0;
			height: 100%;
			width: 680px;
			border-left: 1px solid #fff;
		}
		& .report_edit_main-close {
			position: absolute;
			left: 100%;
			top: 0;
			text-align: center;
			margin: 10px;
			color: #fff;
			cursor: pointer;
			transition: transform .3s;
			&:hover {
				transform: rotate(180deg);
			}
		}
		& .area_list {
			position: relative;
			float: left;
			padding: 20px;
			width: 300px;
			height: 100%;
			background: rgb(238, 238, 238);
		}
		& .kpi_list {
			float: left;
			position: relative;
			width: 378px;
			height: 100%;
			padding: 20px 10px 0 20px;
			background: #fff;
		}
		& .kpi_list-header {
			position: relative;
		}
		& .kpi_list-edit {
			position: absolute;
			right:20px;
			top: 10px;
			width: 20px;
			line-height: 20px;
			text-align: center;
			cursor: pointer;
			& .iconfont {
				color: #dadada;
				transition: color .3s;
				&:hover {
					color: #0ae;
				}
			}
		}
		& .kpi_list-title {
			font-size: 16px;
		}
		& .kpi_list-info {
			color: #c1c1c1;
			font-size: 12px;
		}
		& .kpi_list-remark {
			margin-bottom: 5px;
			color: #838383;
		}
		& .kpi_list-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: absolute;
			z-index: 99;
			left: 0;
			bottom: 0;
			width: 100%;
			line-height: 44px;
			padding: 0 20px;
			text-align: right;
			box-shadow: -3px -2px 8px rgba(0, 0, 0, .1);
			background: #fff;
		}
		& .action_delete {
			cursor: pointer;
			color: #818181;
			transition: color .3s;
			&:hover {
				color: #dc151e;
			}
		}
	}
	.report_sideslip-tabs {
		& .el-tabs__header {
			background: #fff;
			border-radius: 4px;
		}
		& .el-tabs__nav-wrap {
			padding: 0 15px;
		}
		& .el-tabs__nav-prev,
		& .el-tabs__nav-next {
			display: none;
		}
		& .el-tabs__item {
			height: 30px;
			padding: 0 10px;
			line-height: 30px;
			text-align: center;
			color: #666;
			font-size: 12px;
			&.is-active {
				color: #802185;
			}
		}
		& .el-tabs__active-bar {
			background-color: #802185;
		}
	}
	.report_sideslip-custom {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0 9px;
		width: 230px;
		line-height: 42px;
		background: #eee;
		box-shadow: -3px -2px 8px rgba(0, 0, 0, .1);
		font-size: 12px;
		color: #666;
		& .el-button--mini {
			padding: 7px;
		}
		& .is_custom_unsave {
			position: relative;
			&:before {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				width: 8px;
				height: 8px;
				border-radius: 100%;
				background-color: #dc151e;
				transform: translate(40%, -40%);
			}
		}
	}
	.statement {
		padding: 6px 20px;
		&.show_mask:before {
			content: "";
			position: fixed;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			z-index: 11;
			background: rgba(0, 0, 0, .3);
		}
	}
	.list_filter_form {
		margin-top: 8px;
		text-align: right;
		& .el-form-item {
			margin-bottom: 6px;
			&:last-child {
				margin-right: 0;
			}
		}
	}
</style>
