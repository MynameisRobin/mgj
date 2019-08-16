<template>
	<div class="statement" v-loading="initLoading" :class="{show_mask: sideslipVm.showReportMain, is_sideslip_collapse: !sideslipVm.showSideslip}">
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
			</el-tabs>
			<div class="report_sideslip-custom">
				推荐报表不合适？您还可以 <el-button size="mini" @click="onCreateReport" :class="{'is_custom_unsave': isCustomReportUnsave }">自定报表<i></i></el-button>
			</div>
			<transition name="el-fade-in-linear">
				<div class="report_edit_main" v-show="sideslipVm.showReportMain">
					<div class="area_list">
						<area-selector
							ref="tree"
							:has-subsidiary="hasSubsidiary"
							:report-data="currentEditReportVm"
							:before-click="handleTreeBeforeClick"
							:disabled-select-all="disabledTreeSelectAll"
							v-model="currentEditReportVm.searchObj"
							:list-data="areaListData">
						</area-selector>
					</div>
					<div class="kpi_list">
						<div class="kpi_list-header">
							<h3 class="kpi_list-title">{{ currentEditReportVm.title || '创建新方案' }}</h3>
							<el-popover
								v-if="currentEditReportVm.remark"
								:offset="-50"
								placement="bottom"
								width="200"
								trigger="hover"
								:content="currentEditReportVm.remark">
								<am-signle-line-text slot="reference" class="kpi_list-remark">
									{{ currentEditReportVm.remark }}
								</am-signle-line-text>
							</el-popover>
							<p class="kpi_list-info">
								{{ currentEditReportVm.updEmpName || currentEditReportVm.empName }}
								<template v-if="currentEditReportVm.updEmpName">修改于 {{ currentEditReportVm.updTime | date }}</template>
								<template v-else-if="currentEditReportVm.empName">添加于{{ currentEditReportVm.createTime | date }}</template>
							</p>
							<el-popover
								placement="top"
								title="您编辑报表，请修改信息"
								width="350"
								trigger="click"
								v-model="editReportTextContentVm.showEditForm"
								@show="handleShowEditReportTextForm">
								<el-form ref="form" :model="editReportTextContentVm">
									<el-form-item prop="title" :rules="[{ required: true, message: '请输入方案标题'},{ max: 15, message: '方案标题最多15个字'}]">
										<el-input placeholder="输入名称" v-model="editReportTextContentVm.title"></el-input>
									</el-form-item>
									<el-form-item prop="remark" :rules="[{ max: 400, message: '方案备注最多200个文字'}]">
										<el-input type="textarea" placeholder="请输入备注，如果有的话~" v-model="editReportTextContentVm.remark"></el-input>
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
								<div class="kpi_list-edit" slot="reference" v-show="currentEditReportVm.id && currentEditReportVm.empId !== -1">
									<am-icon name="edit" size="18px"></am-icon>
								</div>
							</el-popover>
							
						</div>
						<div class="kpi_list-content">
							<kpi-selector
								@update-base-report="handleChangeBaseReport"
								:disabled-base-report="isCurrentReportForUser && !!currentEditReportVm.id"
								:parent-shop-id="currentParentShopId"
								:finance-configs-map="financeConfigsMap"
								:valid-subsidiary="validSubsidiary"
								:search-obj="currentEditReportVm.searchObj"
								v-model="currentEditReportVm.groups"
								:system-report="!isCurrentReportForUser"
								:reportNo="currentEditReportVm.reportNo">
							</kpi-selector>
						</div>
						<div class="kpi_list-footer">
							<el-popover
								placement="top"
								width="160"
								trigger="click"
								v-model="sideslipVm.removeReportConfirm"
								v-if="isCurrentReportForUser">
								<p>确定删除方案？</p>
								<div style="text-align: right; margin: 0">
									<el-button size="mini" type="text" @click="sideslipVm.removeReportConfirm = false">取消</el-button>
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
									v-model="currentEditReportVm.showForm"
									@show="handleShowEditReportTextForm">
									<el-form ref="form" :model="editReportTextContentVm">
										<el-form-item prop="title" :rules="[{ required: true, message: '请输入方案标题'},{ max: 15, message: '方案标题最多15个字'}]">
											<el-input placeholder="输入名称" v-model="editReportTextContentVm.title"></el-input>
										</el-form-item>
										<el-form-item prop="remark" :rules="[{ max: 400, message: '方案备注最多200个文字'}]">
											<el-input type="textarea" placeholder="请输入备注，如果有的话~" v-model="editReportTextContentVm.remark"></el-input>
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
									<el-button type="primary" slot="reference" v-show="!currentEditReportVm.id || isCurrentReportEdit || currentEditReportVm.unsaved" :disabled="!validCurrentReportMain">
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
		<div v-show="newReportNoList.indexOf(filterData.reportNo) === -1">
			<el-form class="list_filter_form" :inline="true">
				<el-row>
					<el-col :span="24" v-if="filterData.reportNo === 4">
						<el-form-item label="流水单号：">
							<el-input placeholder="流水单号" size="small" v-model="filterData.billNo"></el-input>
						</el-form-item>
						<el-form-item label="支付方式：">
							<el-select
								size="small"
								multiple
								collapse-tags
								filterable
								v-model="filterData.payTypes">
								<el-option
									v-for="item in currentFilterPayConfigs"
									:key="item.field"
									:label="item.fieldname"
									:value="item.field">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="支付金额：">
							<el-input-number placeholder="最小金额" :controls="false" size="small" v-model="filterData.priceStart"></el-input-number>
							-
							<el-input-number placeholder="最大金额" :controls="false" size="small" v-model="filterData.priceEnd"></el-input-number>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="对账门店：" v-if="currentPostData.reportNo === 10 && !isHeadquarters">
					<el-select 
						style="width: 280px"
						size="small"
						multiple
						collapse-tags
						v-model="filterData.referShopId">
						<el-option
							v-for="item in baseShops"
							:key="item.id"
							:value="item.id"
							:label="item.shopName">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="基准门店：" v-if="currentPostData.reportNo === 10 && isHeadquarters">
					<el-select 
						style="width: 280px"
						size="small"
						:multiple="!isHeadquarters"
						collapse-tags
						v-model="filterData.referShopId"
						@change="getCardtypeList">
						<el-option
							v-for="item in hasTenantShopList"
							:key="item.id"
							:value="item.id"
							:label="item.shopName">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="卡类型" v-show="currentPostData.reportNo === 10">
					<el-select v-model="filterData.cardTypeIds" 
						clearable filterable multiple collapse-tags>
						<el-option 
							v-for="item in cardTypeList"
							:key="item.cardtypeid" 
							:value="item.cardtypeid"
							:label="item.cardtypename">
						</el-option>
					</el-select>
				</el-form-item>
				<!-- <el-form-item label="支出类型：" v-show="filterData.reportNo === 6">
					<el-select
						size="small"
						multiple
						collapse-tags
						filterable
						v-model="filterData.expendTypes">
						<el-option
							v-for="item in currentExpandConfigs"
							:key="item.id"
							:value="item.id"
							:label="item.name">
						</el-option>
					</el-select>
				</el-form-item> -->
				<!-- <el-form-item label="其他收入类型：" v-show="filterData.reportNo === 12">
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
				</el-form-item> -->
				<el-form-item label="消费内容：" v-show="filterData.reportNo === 3">
					<el-select
						size="small"
						multiple
						collapse-tags
						filterable
						v-model="filterData.itemTypesVal">
						<el-option 
							v-for="item in itemTypeList"
							:key="item.id"
							:label="item.label"
							:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="选择员工：" v-show="filterData.reportNo === 3">
					<el-select
						size="small"
						filterable
						clearable
						v-model="filterData.empId">
							<el-option
								v-for="item in currentShopUserList"
								:key="item.id"
								:label="item.name"
								:value="item.id">
							</el-option>
						</el-select>
				</el-form-item>
				<el-form-item label="营收类型：" v-show="filterData.reportNo === 1">
					<el-select
						size="small"
						multiple
						collapse-tags
						filterable
						v-model="filterData.revenueType">
						<el-option 
							v-for="item in revenueTypeList"
							:key="item.id"
							:label="item.label"
							:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="筛选：" v-show="isBalanceReport">
					<el-select style="width: 220px" size="small" v-model="shortTimeValue">
						<el-option
							v-for="item in shortTimeSelectList"
							:key="item.value"
							:value="item.value"
							:label="item.label">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="显示内容：" v-show="!isSerialTable && !isBalanceReport">
					<el-radio :disabled="disabledSearchTypePk" v-model="filterData.searchType" :label="0">PK（数据比较）</el-radio>
					趋势：
					<el-radio :disabled="disabledSearchTypeTrend" v-model="filterData.searchType" :label="1">月</el-radio>
					<el-radio
						v-if="shopDayTrend"
						:disabled="disabledSearchTypeTrend"
						@change="handleChangeSearchType"
						v-model="filterData.searchType"
						:label="3">日</el-radio>
				</el-form-item>
				<el-form-item label="日期：" v-show="(filterData.searchType === 0  || filterData.searchType === 3 || isSerialTable) && !isBalanceReport">
					<el-date-picker
						v-if="filterData.reportNo === 11"
						v-model="filterData.endTime"
						type="month"
						placeholder="选择月">
					</el-date-picker>
					<el-date-picker
						v-else
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
				<el-form-item label="开始月：" v-show="filterData.searchType === 1 && !isSerialTable && !isBalanceReport">
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
				<el-form-item label="结束月：" v-show="filterData.searchType === 1 && !isSerialTable && !isBalanceReport">
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
					<template v-if="filterData.reportNo === 11">
						<!-- <el-select v-model="recountVm.actionName" style="width: 80px;">
							<el-option value="baseEmpGain" label="提成"></el-option>
							<el-option value="baseEmpFee" label="业绩"></el-option>
						</el-select> -->
						<el-button @click="onFilterOpenRecount" type="success">重算业绩/提成</el-button>
					</template>
				</el-form-item>
			</el-form>
			<p class="report10_tips" v-if="filterData.reportNo === 10" style="color: #A9A9A9;text-align: right; margin-bottom: 10px;">差额为正数表示本店（从他店）收入，负数表示（向他店）支出；A店（本店）<span style="color: #da3d4d">红色</span>表示本店应向他店跨店支出（出账）；<span style="color: #51a661">绿色</span>表示他店向本店跨店结算（入账）</p>
			<template v-if="isSerialTable">
				<serial-table
					@view-bill-detail="onViewBillDetail"
					v-loading="tableLoading"
					:data="tableData"
					:filter-data="filterData"
					height="calc(100vh - 165px)">
				</serial-table>
				<el-pagination
					v-if="tableData.total"
					background
					:page-sizes="pageSizes"
					@size-change="handleSizeChange"
					@current-change="handleCurrentPageChange"
					:page-size="filterData.pageSize"
					:current-page="filterData.pageNumber"
					layout="sizes, prev, pager, next"
					:total="tableData.total">
				</el-pagination>
			</template>
			<am-table
				v-else
				:expand="false"
				:fixed-column-width="fixedColumnWidth"
				:fixed="true"
				:fixedChildColumn="renderChildColumnFxied"
				:show-summary="showSummary"
				table-title="财务报表"
				v-loading="tableLoading"
				:element-loading-text="loadingText"
				request-uri="/superOperationReport!search.action"
				:request-data="tableChildPostData"
				:render-cell-action="tableCustomData.renderCell"
				:handle-cell-click-action="tableCustomData.cellClickAction"
				:data="tableData"
				:data-type="currentSearchType"
				height="calc(100vh - 165px)">
			</am-table>
			<AcrossShopDetail ref="acrossShopDetail"></AcrossShopDetail>
			<WageItemDetail @recount="showRecount" @name="getSimpleDetailData" ref="wageItemDetail"></WageItemDetail>
			<SimpleDetail @view="getBillDetail" ref="simpleDetail" @recount="showRecount"></SimpleDetail>
			<Recount ref="recount"></Recount>
		</div>
		<router-view
			@view-bill-detail="onViewBillDetail"
			ref="report"
			v-if="newReportNoList.indexOf(filterData.reportNo) !== -1"
			:finance-configs-map="financeConfigsMap"
			:search-obj="filterData.searchObj"
			:groups="filterData.groups">
		</router-view>
	</div>
</template>
<script>
const detaultFinanceConfig = {
	expendTypes: [],
	payConfigs: []
}
import Api from '@/api'
import Dayjs from 'dayjs'
import IsNumber from 'is-number'
import FindIndex from 'lodash.findindex'
import AmTable from '#/components/table'
import SerialTable from '#/components/serial-table'
import ReportList from '#/components/report-list'
import KpiSelector from '#/components/kpi-selector'
import AreaSelector from '#/components/area-selector'
import MetaDataMixin from '#/mixins/meta-data'
import AcrossShopDetail from './acrossShopDetail'
import WageItemDetail from './wageItemDetail'
import SimpleDetail from './simpleDetail'
import Recount from './recount'
// import "#/components/js-components/qrModal/css/index.css";
// import "#/components/js-components/util/util";
// import qrModal from '#/components/js-components/qrModal/js/index.js';
const defaultStartTime = Dayjs().startOf('day').add(-1, 'M').add(1, 'day').valueOf();
const defaultEndTime = Dayjs().endOf('day').valueOf();
const quarterTime = Dayjs(defaultEndTime).add(-3, 'M').valueOf();
const halfYearTime = Dayjs(defaultEndTime).add(-6, 'M').valueOf();
const threeQuarterTime = Dayjs(defaultEndTime).add(-9, 'M').valueOf();
const yearTime = Dayjs(defaultEndTime).add(-12, 'M').valueOf();
const revenueTypeList = [
		{label: '项目', id: 1},
		{label: '卖品', id: 2},
		{label: '开/充卡', id: 3},
		{label: '套餐销售', id: 4},
		{label: '年卡销售', id: 5},
		{label: '其他收入', id: 6},
		{label: '美一客销售收入', id: 7},
		{label: '开卡工本费', id: 8},
		{label: '套餐成本', id: 9}
]
const itemTypeList = [
	{label: '项目消费', id: "0,4,6" },
	{label: '卖品消费', id: "1" },
	{label: '开卡充值', id: "2,99" },
	{label: '套餐购买', id: "3,7" },
	{label: '年卡销售', id: "5"},
	{label: '其他收入', id: "999" }
]
const getSearchLabelInfo = function (label) {
	let sIndex = label.indexOf('(');
	let eIndex = label.indexOf(')');
	if (sIndex === -1 || eIndex === -1) {
		return [];
	}
	let infoStr = label.substr(sIndex + 1, eIndex - 1);
	let infoArr = infoStr.split('_');
	return infoArr;
}
const initReportData = {
	groups: [],
	searchObj: [],
	id: '',
	reportNo: 1
}
export default {
	mixins: [MetaDataMixin],
	components: {
		ReportList,
		AmTable,
		SerialTable,
		KpiSelector,
		AreaSelector,
		AcrossShopDetail,
		WageItemDetail,
		SimpleDetail,
		Recount
	},
	data() {
		return {
			newReportNoList: [6, 12, 13, 14],
			initLoading: true,
			areaListData: [],
			shopUserListMap: {},
			sideslipVm: {
				tabsActiveName: 'systemReport',
				showSideslip: true,
				showReportMain: false,
				saveReportLoading: false,
				deleteLoading: false,
				removeReportConfirm: false,
				currentReportId: ''
			},
			tableLoading: false,
			tableData: {},
			currentPostData: {},
			filterData: {
				searchType: 0,
				revenueType: revenueTypeList.map(item => item.id),
				groups: [],
				searchObj: [],
				startTime: defaultStartTime,
				endTime: defaultEndTime,
				reportType: 1,
				reportNo: '',
				pageNumber: 1,
				pageSize: 100,
				payTypes: [],
				itemTypesVal: [],
				referShopId: '',
				cardTypeIds: []
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
				showEditForm: false,
			},
			tableChildPostData: {},
			currentSearchType: 1,
			needConfigShopIdList: [],
			revenueTypeList: [
				...revenueTypeList
			],
			itemTypeList: [
				...itemTypeList
			],
			shortTimeSelectList: [
				{label: "全部结余", value: "1"},
				{label: "3个月内有消费的卡金结余", value: "2"},
				{label: "6个月内有消费的卡金结余", value: "3"},
				{label: "9个月内有消费的卡金结余", value: "4"},
				{label: "12个月内有消费的卡金结余", value: "5"},
				{label: "3个月内无消费的卡金结余", value: "6"},
				{label: "6个月内无消费的卡金结余", value: "7"},
				{label: "9个月内无消费的卡金结余", value: "8"},
				{label: "12个月内无消费的卡金结余", value: "9"},
			],
			shortcutTimeConfig: {
				1: [0, defaultEndTime],
				2: [quarterTime, defaultEndTime],
				3: [halfYearTime, defaultEndTime],
				4: [threeQuarterTime, defaultEndTime],
				5: [yearTime, defaultEndTime],
				6: [0, quarterTime],
				7: [0, halfYearTime],
				8: [0, threeQuarterTime],
				9: [0, yearTime],
			},
			shortTimeValue: "1",
			financeConfigsMap: {},
			currentShopUserList: [],
			tableCustomConfigs: {
				10: {
					renderCell: this.renderCellAction10,
					cellClickAction: this.handleCellClickAction10
				},
				11: {
					renderCell: this.renderCellAction11,
					cellClickAction: this.handleCellClickAction11
				}
			},
			wageRewardVm: {
				sanction: ''
			},
			recountVm: {
				actionName: 'baseEmpGain'
			},
			cardTypeList: [],
		}
	},
	computed: {
		shops() {
			return this.$eventBus.env.shops || [];
		},
		baseShops() {
			return this.shops.filter(item => item.id !== parseInt(this.shopId));
		},
		hasTenantShopList() {
			let result = [...this.shops];
			const {
				softgenre,
				shopName,
				shopId
			} = this.userInfo;
			if (softgenre === '0') {
				result.unshift({
					id: -1,
					shopName: shopName,
					softgenre,
					parentId: shopId,
					baseId: shopId
				})
			}
			return result;
		},
		fixedColumnWidth() {
			if (this.filterData.reportNo === 11) {
				return 296;
			}
			return 200;
		},
		showSummary() {
			const {
				reportNo
			} = this.filterData;
			let index = [11].indexOf(reportNo);
			return index === -1;
		},
		isOnlyShopReport() {
			const {
				reportNo,
			} = this.currentEditReportVm;
			return ([4, 8, 9, 10, 13].indexOf(reportNo) >= 0);
		},
		isBalanceReport() {
			const {
				reportNo
			} = this.filterData;
			return !!reportNo && [8, 9].indexOf(reportNo) >= 0;
		},
		// 当前编辑器选择的报表
		isSelectSerialTable() {
			const {
				reportNo
			} = this.currentEditReportVm;
			return !!reportNo && [3, 4, 6, 12, 14].indexOf(reportNo) >= 0;
		},
		// 当前搜索的报表
		isSerialTable() {
			const {
				reportNo
			} = this.filterData;
			return !!reportNo && [3, 4, 6, 12, 13, 14].indexOf(reportNo) >= 0;
		},
		shopDayTrend() {
			return [1, 2, 5, 7].indexOf(this.filterData.reportNo) >= 0;
		},
		disabledSearchTypeTrend() {
			const {
				reportNo
			} = this.filterData;
			return [10, 11].indexOf(reportNo) >= 0;
		},
		disabledSearchTypePk() {
			const { searchObj } = this.filterData;
			let nodeData = {
				...searchObj[0]
			}
			let currentLevelNode = null;
			if (this.$refs.tree) {
				currentLevelNode = this.getSearchObjNode(nodeData)
			}
			return (searchObj && searchObj.length === 1 && !searchObj[0].allChildren || (currentLevelNode && (nodeData.allChildren && currentLevelNode.childNodes.length === 1)));
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
		currentParentShopId() {
			const { searchObj } = this.currentEditReportVm;
			if (!searchObj || !searchObj.length) {
				return this.$eventBus.env.userInfo.shopId;
			}
			return searchObj[0].parentShopId;
		},
		currentSearchObjLevel() {
			const { searchObj } = this.currentEditReportVm;
			if (!searchObj || !searchObj.length) {
				return '';
			}
			let item = searchObj[0];
			if (searchObj.length === 1 && item.allChildren) {
				return item.level + 1;
			}
			return item ? item.level : '';
		},
		currentFilterShopFinanceConfig() {
			const { searchObj } = this.filterData;
			if (!searchObj || !searchObj.length) {
				return {};
			}
			return this.financeConfigsMap[searchObj[0].parentShopId] || {...detaultFinanceConfig};
		},
		currentFilterPayConfigs() {
			let defaultPay = [
				{field: 'cash', fieldname: '现金'},
				{field: 'unionpay', fieldname: '银联'},
				{field: 'pay', fieldname: '支付宝'},
				{field: 'weixin', fieldname: '微信'},
				{field: 'dianpin', fieldname: '大众点评'},
				{field: 'mall', fieldname: '商场卡'},
				{field: 'cooperation', fieldname: '合作券'},
				{field: 'cardfee', fieldname: '卡金'},
				{field: 'presentfee', fieldname: '赠送金'},
				{field: 'dividefee', fieldname: '分期赠送金'},
				{field: 'voucherfee', fieldname: '代金券'},
				{field: 'debtfee', fieldname: '欠款'},
				{field: 'mdfee', fieldname: '免单'},
				{field: 'luckymoney', fieldname: '红包'},
				{field: 'coupon', fieldname: '优惠券'},
				{field: 'onlinecreditpay', fieldname: '线上积分'},
				{field: 'offlinecreditpay', fieldname: '线下积分'},
				{field: 'mallorderfee', fieldname: '商城订单'},
				{field: 'treatfee', fieldname: '套餐卡金'},
				{field: 'treatpresentfee', fieldname: '套餐赠金'},
			]
			let result = [];
			this.currentFilterShopFinanceConfig.payConfigs.forEach(item => {
				if (item.field.indexOf('otherfee') >= 0) {
					result.push(item)
				}
			})
			return [
				...defaultPay,
				...result
			]
		},
		// currentExpandConfigs() {
		// 	let result = [];
		// 	const {
		// 		expendTypes
		// 	} = this.currentFilterShopFinanceConfig;
		// 	expendTypes && expendTypes.forEach(item => {
		// 		if ([5, -10087, -10086].indexOf(parseInt(item.dayexpendtypeid)) < 0) {
		// 			result.push(item)
		// 		}
		// 	})
		// 	return result;
		// },
		// currentOtherExpandConfigs() {
		// 	let result = [];
		// 	const {
		// 		expendTypes
		// 	} = this.currentFilterShopFinanceConfig;
		// 	expendTypes && expendTypes.forEach(item => {
		// 		if ([5, -10087, -10086].indexOf(parseInt(item.dayexpendtypeid)) > -1) {
		// 			result.push(item)
		// 		}
		// 	})
		// 	return result;
		// },
		hasSubsidiary() {
			const { searchObj } = this.currentEditReportVm;
			if (!searchObj || searchObj.length === 0) return false;
			let nodeData = {
				...searchObj[0]
			};
			let subIndex = -1;
			if (nodeData.allChildren && nodeData.level <= 1) {
				let node = this.getSearchObjNode(nodeData);
				subIndex = FindIndex(node.childNodes, item => item.data.id === item.data.parentShopId);
			} else {
				subIndex = FindIndex(searchObj, item => {
					let node = this.getSearchObjNode(item);
					return node.data.id === node.data.parentShopId;
				})
			}
			return subIndex >= 0;
		},
		validSubsidiary() {
			const { searchObj } = this.currentEditReportVm;
			let nodeData = searchObj[0] || {};
			return searchObj && ((searchObj.length > 1 || (nodeData.allChildren && nodeData.level <= 1)) && this.hasSubsidiary);
		},
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
		},
		pageSizes() {
			let result = Array.from({ length: 5 }, (item, index) => 100 * (index + 1));
			return result;
		},
		tableCustomData() {
			const {
				reportNo
			} = this.filterData;
			return this.tableCustomConfigs[reportNo] || {};
		}
	},
	// mounted() {
	// 	this.getBillDetail({
	// 		// parentShopId: 277770,
	// 		// id: 160051
	// 		parentShopId: 28101,
	// 		id: 160389
	// 	});
	// },
	methods: {
		getCardtypeList() {
			const {
				referShopId
			} = this.filterData;
			this.filterData.cardTypeIds = [];
			const shopId = this.isHeadquarters ? referShopId : this.shopId;
			Api.getCardtypeList({shopId}).then(res => {
				const resData = res.data;
				const {
					code,
					content
				} = resData;
				if (code === 0) {
					this.cardTypeList = content.filter(item => item.cardtype !== '2');
				}
			})
		},
		onFilterOpenRecount() {
			const { shops } = this.$eventBus.env;
			const { actionName } = this.recountVm;
			let data = {
				...this.userInfo,
				shops,
				actionName
			}
			this.showRecount(data);
		},
		onViewBillDetail({billId, parentShopId}) {
			this.getBillDetail({
				id: billId,
				parentShopId
			})
		},
		showRecount(data) {
			this.$refs.recount.open(data);
		},
		getBillDetail(data) {
			this.$http
				.post("/bill!detail.action", {
					parentShopId: data.parentShopId,
					id: data.id
				})
				.then(res => {
					if (!res) {
						return console.log("res:", res);
					}
					const { content, code } = res.data;
					if (code === 0) {
						window.qrModal.show(content);
					}
				});
		},
		showWageItemDetail() {
			this.$refs.wageItemDetail.open();
		},
		getSimpleDetailData(propData) {
			console.log(propData);
			this.$refs.simpleDetail.onSubmit(propData);
			this.$refs.simpleDetail.open();
		},
		renderChildColumnFxied(data) {
			let result = parseInt(data.index) === 0;
			return result;
		},
		handleCellClickAction11(e) {
			const el = e.target;
			let classNameList = el.className.split(' ');
			if (classNameList.indexOf('table_cell_action') >= 0) {
				// const [starttime, endtime] = this.daterange;
				const {
					startTime,
					endTime,
					searchObj
				} = this.currentPostData;
				let starttime = startTime;
				let endtime = endTime;
				const shopId = el.getAttribute('data-shopid') - 0;
				const parentShopId = el.getAttribute('data-parent-shop-id') - 0;
				const empId = el.getAttribute('data-empid') - 0;
				const type = el.getAttribute('data-type') - 0; // 0 项目，1 卖品，2 开卡， 充值，4 套餐
				let propData = {
					shopId,
					parentShopId,
					empId,
					type,
					starttime,
					endtime,
					searchObj
				};
				propData.simpleDetail = 0;
				propData.wageItemDetail = 0;
				if (type === 0) {
					propData.wageItemDetail = 1;
					this.$refs.wageItemDetail.open();
					this.$refs.wageItemDetail.onSubmit(propData);
				} else {
					propData.simpleDetail = 1;
					this.$refs.simpleDetail.open();
					this.$refs.simpleDetail.onSubmit(propData);
				}
			}
		},
		renderCellAction11(columnData, config) {
			let result = null;
			const {
				column,
				row,
				cellValue,
				index
			} = columnData;
			const info = getSearchLabelInfo(row[0]);
			const shopId = info[1];
			const empId = info[2];
			const parentShopId = info[0];
			const labelArr = ['项目总提成', '卖品总提成', '开卡总提成', '充值总提成', '套餐总提成'];
			const shopid = null;
			const labelIndex = FindIndex(labelArr, item => item === column.label);
			if (labelIndex !== -1 && cellValue > 0) {
				result = <a style="margin-left: 10px;" data-empno={row[1]} data-parent-shop-id={parentShopId} data-shopid={shopId} data-empid={empId} data-type={labelIndex} class="table_cell_action" href="javascript:;">明细</a>;
			}
			if (column.label === '工资奖罚项') {
				result = (
					<el-popover
							placement="bottom"
							width="200"
							trigger="click"
							content="修改">
							<el-form  size="small">
								<el-form-item>
									<el-input-number onChange={this.onChangeWageRewardValue} vModel={this.wageRewardVm.sanction} class="wage_reward_input_number" style="width: 100%" controls={false}></el-input-number>
								</el-form-item>
								<el-form-item>
									<el-button onClick={this.onCancleWageRewardSetting}>取消</el-button>
									<el-button type="primary" onClick={() => this.onSumitWageReward({empId, property: column.property, index, shopId})}>提交</el-button>
								</el-form-item>
							</el-form>
							<a style="margin-left: 10px" href="javascript:;" slot="reference">设置</a>
						</el-popover>
				)
			}
			return result;
		},
		onCancleWageRewardSetting() {
			document.body.click();
		},
		onChangeWageRewardValue(value) {
			this.wageRewardVm.sanction = value;
		},
		onSumitWageReward(params) {
			const {
				empId,
				property,
				index,
				shopId
			} = params;
			const {
				sanction
			} = this.wageRewardVm;
			if (!sanction && parseFloat(sanction) !== 0) return;
			const {
				startTime
			} = this.currentPostData;
			const startDate = Dayjs(startTime);
			const year = String(startDate.year());
			let month = String(startDate.month() + 1);
			if (month < 10) month = `0${month}`;
			const postData = {
				sanction,
				empId,
				year,
				month,
				shopId
			}
			this.wageRewardVm.loading = true;
			this.$http.post('/perfMana!setSanction.action', postData).then(res => {
				const {
					code,
					message
				} = res.data;
				if (code === 0) {
					this.$message.success('设置成功!');
					this.onCancleWageRewardSetting();
					let tableItem = this.tableData.data[index];
					tableItem[property] = sanction;
					this.tableData.data.splice(index, 1, tableItem);

				} else {
					this.$message.error(message);
				}
			})
		},
		handleCellClickAction10(e) {
			const el = e.target;
			let classNameList = el.className.split(' ');
			if (classNameList.indexOf('table_cell_action') >= 0) {
				const shopid = el.getAttribute('data-shopid');
				const columnLabel = el.getAttribute('data-column-label');
				const [starttime, endtime] = this.daterange;
				const {
					referShopId,
					startTime,
					endTime,
					cardTypeIds
				} = this.currentPostData;
				const propData = {
					...this.userInfo,
					shopid,
					columnLabel,
					referShopId: this.isHeadquarters ? referShopId : this.shopId,
					starttime: startTime,
					endtime: endTime,
					cardTypeIds
				}
				this.$refs.acrossShopDetail.getListData(propData);
				this.$refs.acrossShopDetail.dialogTableVisible = true;
			}
		},
		renderCellAction10(columnData, config) {
			let result = null;
			const {
				column,
				row,
				cellValue
			} = columnData;
			const labelArr = ['卡金总进', '卡金总出', '赠金总进', '赠金总出', '总差额', '差额'];
			const info = getSearchLabelInfo(row[0]);
			const shopid = info[1];
			if ((labelArr.indexOf(column.label) === -1 && column.label.indexOf('差额') === -1) && (cellValue > 0 || cellValue < 0)) {
				result = <a style="margin-left: 10px;" data-shopid={shopid} data-column-label={column.label} class="table_cell_action" href="javascript:;">明细</a>;
			}
			return result;
		},
		disabledTreeSelectAll(node) {
			// const { reportNo } = this.currentEditReportVm;
			// 流水表单选门店，禁止全选门店
			if (this.isSelectSerialTable && node.data.level < 2) return true;
			// 门店营收流水、门店储值余额、卡储值余额，仅支持门店选择
			if (this.isOnlyShopReport && node.data.level === 2) return true;
			return false;
		},
		getShopUserList(shopId) {
			return new Promise((resolve, reject) => {
				let userList = this.shopUserListMap[shopId];
				if (userList) {
					resolve(userList);
					return;
				};
				this.$http.post('/employee!queryEmployees.action', {shopId}).then(res => {
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						this.shopUserListMap[shopId] = content;
						resolve(content);
					}
				});
			})
		},
		handleTreeBeforeClick(node) {
			const {
				reportNo
			} = this.currentEditReportVm;
			const reportLabelMaps = {
				4: '门店营收流水',
				8: '门店储值余额表',
				9: '卡储值余额表',
				10: '跨店消费统计表',
				13: '跨店消费明细表'
			}
			const {
				level
			} = node.data;
			if (level <= 1) return false;
			if (this.isOnlyShopReport && (level > 2)) {
				this.$message.warning(`”${reportLabelMaps[reportNo]}“仅支持门店查询!`);
				return false;
			}
			return true;
		},
		handleChangeSearchType(value) {
			if (value === 3) {
				this.handleDateChange(this.daterange);
			}
		},
		handleDateChange(values) {
			const [minDate, maxDate] = values;
			let diffDays = Dayjs(maxDate).diff(Dayjs(minDate), 'day');
			const {
				searchType,
				reportNo
			} = this.filterData;
			let message = null;
			if (diffDays > 31) {
				if (this.isSerialTable) {
					message = '流水表';
				}
				if (searchType === 3) {
					message = '日趋势';
				} 
				if (reportNo === 10) {
					message = '跨店消费统计表';
				}
				if (message) {
					this.$message({
						type: 'warning',
						showClose: true,
						message: `${message}最多只能查31天`
					})
					this.daterange = [
						minDate,
						Dayjs(maxDate).add(31 - diffDays, 'day').valueOf()
					]
					return true;
				}
			}
		},
		handleChangeBaseReport(value) {
			this.currentEditReportVm.reportNo = value;
			if (this.isSerialTable) {
				this.filterData.searchType = 0;
				this.handleDateChange(this.daterange);

			}
		},
		getSearchObjNode(nodeData) {
			if (nodeData.level === 1) {
				nodeData.areaId = nodeData.id;
			}
			return this.$refs.tree.getTreeNode(nodeData);
		},
		handleStarTimeChange(value) {
			if (value >= this.filterData.endTime) {
				this.filterData.endTime = Dayjs(value).endOf('day').add('1', 'M').valueOf();
			}
		},
		handleEndTimeChange(value) {
			if (value <= this.filterData.startTime) {
				this.filterData.startTime = Dayjs(value).startOf('day').add('-1', 'M').valueOf();
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
			console.log(item);
			const scheme = JSON.parse(item.scheme);
			const { groups, searchObj, reportNo } = scheme;
			this.currentEditReportVm = {
				...item,
				groups,
				searchObj,
				reportNo
			}
			this.oldEditReportVm = {
				...item,
				groups,
				searchObj,
				reportNo
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
			const { title, remark } = this.currentEditReportVm;
			this.editReportTextContentVm.title = title;
			this.editReportTextContentVm.remark = remark;
		},

		handleSelectReport(item) {
			const { currentReportId, showReportMain } = this.sideslipVm;
			if (item.id === currentReportId && showReportMain) return;
			const scheme = JSON.parse(item.scheme);
			const { searchObj } = scheme;
			this.setReportDataSearch(item);
		},

		onUnsaveSearch() {
			const { id, title, remark, groups, searchObj, parentShopId, shopId, empId, reportNo } = this.currentEditReportVm;
			let scheme = JSON.stringify({groups, searchObj, reportNo});
			let reportData = {
				...this.currentEditReportVm,
				scheme,
				empId,
				shopId,
				parentShopId,
				title,
				remark,
				id
			}
			if (this.isCurrentReportEdit) {
				if (this.isCurrentReportForUser) {
					this.$refs.reportList.updateItem(reportData, true);
				} else {
					this.$refs.systemReportList.updateItem(reportData, true);
				}
			}
			this.setReportDataSearch(reportData, false);
		},

		saveReport(isEdit) {
			this.$refs.form.validate(msg => {
				if (!msg) return;
				const { id, groups, searchObj, parentShopId, reportNo } = this.currentEditReportVm;
				const {  title, remark } = this.editReportTextContentVm;
				let postData = {
					scheme: JSON.stringify({groups, searchObj, reportNo}),
					empId: this.userId,
					shopId: this.shopId,
					parentShopId: this.parentShopId,
					title,
					remark,
					id: parentShopId === -1 ? "" : id
				}
				postData.reportType = 1;
				this.sideslipVm.saveReportLoading = true;
				this.$http.post('/superOperationReport!saveScheme.action', postData).then(res => {
					this.sideslipVm.saveReportLoading = false;
					this.currentEditReportVm.showForm = false;
					this.editReportTextContentVm.showEditForm = false;
					let resData = res.data;
					const { code, message, content } = resData;
					if (code === 0) {
						let { id, title, remark } = content;
						this.currentEditReportVm.id = id;
						this.currentEditReportVm.title = title;
						this.currentEditReportVm.remark = remark;
						this.$refs.reportList.updateItem(content);
						postData.id = content.id;
						if (isEdit) {
							this.setCurrentReport(content);
						} else {
							this.sideslipVm.tabsActiveName = 'userReport';
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
					this.sideslipVm.removeReportConfirm = false;
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
			}
		},

		onTableSearch() {
			this.filterData.pageNumber = 1;
			this.onSearch()
		},

		setReportDataSearch(data, save = true) {
			const scheme = JSON.parse(data.scheme);
			const { groups, searchObj, reportNo } = scheme;
			this.sideslipVm.currentReportId = data.id;
			this.filterData.groups = groups;
			this.filterData.reportNo = reportNo;
			this.filterData.searchObj = searchObj;
			this.filterData.pageNumber = 1;
			if (this.disabledSearchTypePk) {
				this.filterData.searchType = 1;
			}
			if (this.disabledSearchTypeTrend) {
				this.filterData.searchType = 0;
			}
			this.hideReportMain();
			if (this.oldEditReportVm || save) {
				this.resetCurrentEditReport();
			}
			this.onSearch();
		},
		handleSizeChange(value) {
			this.filterData.pageSize = value;
			this.filterData.pageNumber = 1;
			this.onSearch();
		},
		handleCurrentPageChange(value) {
			this.filterData.pageNumber = value;
			this.onSearch();
		},
		onSearch() {
			let { daterange, filterData } = this;
			const {
				searchType,
				reportNo,
				revenueType,
				itemTypesVal
			} = filterData;
			if (reportNo === 1 && !revenueType.length) {
				this.$message({
					type: 'error',
					message: '请选择营收类型',
					showClose: true
				});
				return;
			}
			let { groups, searchObj, startTime, endTime } = filterData;
			if (groups.length === 0 || searchObj.length === 0) {
				this.$message({
					type: 'error',
					message: '请选择查询对象及kpi',
					showClose: true
				});
				return;
			}
			if (this.isSerialTable && this.handleDateChange(daterange)) {
				daterange = this.daterange;
			}
			this.tableData = {};
			if (this.isBalanceReport) {
				[startTime, endTime] = this.shortcutTimeConfig[this.shortTimeValue];
			} else {
				if (([0, 3].indexOf(searchType) >= 0 && reportNo !== 11) || this.isSerialTable) {
					startTime = daterange[0] || '';
					endTime = daterange[1] || '';
				} else if (reportNo === 11) {
					startTime = Dayjs(endTime).startOf('month').valueOf();
					endTime = Dayjs(endTime).endOf('month').valueOf();
				} else {
					startTime = Dayjs(startTime).startOf('month').valueOf();
					endTime = Dayjs(endTime).endOf('month').valueOf();
				}
			}
			let level = searchObj[0].level;
			let itemTypes = [];
			itemTypesVal.forEach(item => {
				itemTypes.push(...item.split(','));
			})
			if (reportNo === 9 && groups[0].kpis[0].id !== 350) {
				groups[0].kpis.unshift({
					"id": 350,
					"title": "卡名称",
					"pct": 0,
					"ryg": 0,
					"tplt": null,
					"sqlGroup": null,
					"ukey": "KMC",
					"depend": 0
				})
			}
			if (reportNo === 11 && groups[0].id !== 421) {
				groups.unshift({
					id: 421,
					title: '员工',
					kpis: [
						{id: 424, title: '姓名', pct: 0, 'ryg': 0, ukey: 'XM421', depend: 0, sqlgroup: null, tplt: null},
						{id: 423, title: '编号', pct: 0, 'ryg': 0, ukey: 'BH421', depend: 0, sqlgroup: null, tplt: null},
						{id: 425, title: '级别', pct: 0, 'ryg': 0, ukey: 'JB421', depend: 0, sqlgroup: null, tplt: null},
						{id: 422, title: '门店', pct: 0, 'ryg': 0, ukey: 'MD421', depend: 0, sqlgroup: null, tplt: null},
					]
				})
			}
			let postData = {
				parentShopId: this.parentShopId,
				...filterData,
				groups,
				searchObj,
				startTime,
				endTime,
				level,
				itemTypes
			}
			delete postData.itemTypesVal;
			postData.pageNumber -= 1;
			this.tableChildPostData = {
				...postData,
				searchType: 2
			}
			this.tableLoading = true;
			this.currentSearchType = postData.searchType;
			if (reportNo === 3) {
				this.getShopUserList(searchObj[0].id).then(data => {
					this.currentShopUserList = data;
				})
			}
			if (!this.isHeadquarters) {
				const {
					referShopId
				} = postData;
				postData.referShopId = referShopId.join(',');
			}
			if (this.isSerialTable) {
				postData.searchType = 1;
			}
			this.currentPostData = postData;
			if (this.newReportNoList.indexOf(reportNo) !== -1) {
				const routeName = `report${reportNo}`;
				if (routeName === this.$route.name) {
					this.$refs.report && this.$refs.report.refresh();
				} else {
					this.$router.push({
						name: routeName
					});
				}
				return;
			}
			if (!postData.cardTypeIds || postData.cardTypeIds.length === 0) {
				postData.cardTypeIds = undefined;
			}
			this.$http.post('/superOperationReport!search.action', postData).then(res => {
				this.tableLoading = false;
				let resData = res.data;
				const { code, content, messgae } = resData;
				if (code === 0) {
					content.total = parseInt(content.total);
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
	async created() {
		this.initLoading = true;
		let res = await Api.getMetaData();
		let configRes = await this.$http.post('/superOperationReport!getFinanceConfigs.action');
		let areaRes = await this.$http.post('/superOperationReport!getAreas.action', { allInfo: 1, reportType: 1 });
		this.initLoading = false;
		let resData = res.data;
		let configResData = configRes.data;
		let areaResData = areaRes.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}

		let currentShopId = content.shops[0].id;
		if (!this.isHeadquarters) {
			currentShopId = [];
			this.shops.forEach(shop => {
				const id = shop.id;
				if (id !== parseInt(this.shopId)) {
					currentShopId.push(id)
				}
			});
		}
		this.filterData.referShopId = currentShopId;
		this.getCardtypeList();

		if (configResData.code === 0) {
			const {
				expendTypes,
				payCofigs
			} = configResData.content;
			let shopConfig = {};
			let allExpendTypes = [];
			expendTypes.forEach(item => {
				const { shopid, dayexpendtypeid } = item;
				if (shopid) {
					if (!shopConfig[shopid]) {
						shopConfig[shopid] = {
							expendTypes: [],
							payConfigs: []
						};
					}
					shopConfig[shopid].expendTypes.push(item);
				} else {
					allExpendTypes.push(item)
				}
			})
			payCofigs.forEach(item => {
				const { shopid } = item;
				if (!shopConfig[shopid]) {
					shopConfig[shopid] = {
						expendTypes: [],
						payConfigs: []
					}
				}
				shopConfig[shopid].payConfigs.push(item);
			})
			for (let i in shopConfig) {
				shopConfig[i].expendTypes.push(...allExpendTypes);
			}
			this.financeConfigsMap = shopConfig;
		}
		if (areaResData.code === 0) {
			const {
				content
			} = areaResData;
			this.areaListData = [content];
		}
	}
	
}
</script>
<style lang="less">
.statement {
    transition: all 0.3s;
    margin-left: 230px;
    width: calc(100% - 230px);
    &.is_sideslip_collapse {
        margin-left: 0;
        width: 100%;
    }
    & .el-pagination {
        margin: 10px -10px 0;
    }
    & > .el-loading-mask {
        margin-left: -230px;
    }
    & .el-radio {
        & + .el-radio {
            margin-left: 10px;
        }
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
        transition: transform 0.3s;
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
        right: 20px;
        top: 10px;
        width: 20px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;
        & .iconfont {
            color: #dadada;
            transition: color 0.3s;
            &:hover {
                color: #0ae;
            }
        }
    }
    & .kpi_list-title {
        font-size: 16px;
    }
    & .kpi_list-info {
		margin: 4px 0;
        color: #c1c1c1;
        font-size: 12px;
    }
    & .kpi_list-remark {
		margin-top: 8px;
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
        box-shadow: -3px -2px 8px rgba(0, 0, 0, 0.1);
        background: #fff;
    }
    & .action_delete {
        cursor: pointer;
        color: #818181;
        transition: color 0.3s;
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
    & .el-tabs__nav {
        margin-left: 39px;
        &:before {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: 1px;
            height: 12px;
            background: #e5e5e5;
            transform: translateY(-50%);
        }
    }
    & .el-tabs__item {
        height: 30px;
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
    & .el-tabs__content {
        padding: 0 6px;
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
    box-shadow: -3px -2px 8px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    color: #666;
    & .el-button--mini {
        padding: 7px;
    }
    & .is_custom_unsave {
        position: relative;
        &:before {
            content: "";
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
        background: rgba(0, 0, 0, 0.3);
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
