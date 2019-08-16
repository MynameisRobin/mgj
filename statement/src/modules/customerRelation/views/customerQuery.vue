<template>
	<div class="customer_query" v-loading="initLoading">
		<!-- 顾客高级查询 -->
		<el-dialog
			title="顾客高级查询"
			:visible.sync="dialogVisible"
			width="819px">
			<el-form size="mini" label-position="left" label-width="72px">
				<form-title>基础信息</form-title>
				<el-row>
					<el-col :span="12">
						<el-form-item label="门店">
							<template v-if="hasTenantShopList.length > 1">
								<el-select
									class="shop_multiple_select"
									v-model="filterData.shopIds"
									@change="handleChangeShop"
									@focus="hidePopover"
									multiple
									filterable
									collapse-tags>
									<el-option 
										v-for="shopItem in hasTenantShopList"
										:key="shopItem.id"
										:label="shopItem.osName"
										:value="shopItem.id">
									</el-option>
								</el-select>
								<el-popover placement="right" content="选择查询门店，附属店只能单选" trigger="hover">
									<am-icon class="icon_info" slot="reference" name="info"></am-icon>
								</el-popover>
							</template>
							<span v-else-if="hasTenantShopList.length">{{ hasTenantShopList[0].osName }}</span>
						</el-form-item>
						<el-form-item label="性别">
							 <el-radio-group v-model="filterData.sex">
								<el-radio label="M">男</el-radio>
								<el-radio label="F">女</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item label="会员分类">
							<el-select v-model="filterData.classId" @focus="hidePopover" clearable filterable>
								<el-option
									v-for="item in memberClass"
									:key="item.classid"
									:label="item.classname"
									:value="item.classid">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="会员阶段">
							<el-select v-model="filterData.stage" @focus="hidePopover" clearable filterable>
								<el-option
									v-for="item in memberStage"
									:key="item.stage"
									:label="item.label"
									:value="item.stage">
								</el-option>
							</el-select>
							<!-- 话术 -->
							<el-popover placement="right" width="340" trigger="hover">
								<div>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">会员：</span>开办过门店储值卡，资格卡，特权卡或者购买过套餐的顾客，被认定为会员；一个顾客一旦确立为会员，就永远都是会员角色；</p>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">临界会员：</span>卡金总余额低于设定值 ，并且套餐总次数低于设定值；</p>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">潜在会员：</span>在门店有消费记录（至少一次消费）或者有商城购买记录，并且不是会员的顾客，称之为潜在会员；</p>
									<p><span style="font-weight: 600;">新客：</span>有顾客资料，但在门店没有消费记录，在商城也没有购买记录的顾客，新客消费一次或者购买一次，就成为了潜在会员。</p>
								</div>
								<am-icon class="icon_info" slot="reference" name="info"></am-icon>
							</el-popover>
						</el-form-item>
						<el-form-item label="会员状态">
							<el-select v-model="filterData.status" @focus="hidePopover" clearable filterable>
								<el-option
									v-for="item in memberStatus"
									:key="item.status"
									:label="item.label"
									:value="item.status">
								</el-option>
							</el-select>
							<!-- 话术 -->
							<el-popover placement="right" width="340" trigger="hover">
								<div>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">静止客：</span>超过设定天数没有来店的，视为已经流失(静止客户)的客户；</p>
									<p style="margin-bottom: 4px;"><span style="font-weight: 600;">流失风险客：</span>超过预设天数没有消费记录被视为有流失风险；</p>
									<p><span style="font-weight: 600;">有效顾客：</span>未超过预设天数就产生了消费记录的顾客。</p>
								</div>
								<am-icon class="icon_info" slot="reference" name="info"></am-icon>
							</el-popover>
						</el-form-item>
						<el-form-item label="顾客标签">
							<popover-select 
								size="mini"
								:popover-width="425"
								v-model="filterData.tagIds"
								:options="tags"
								:props="{label: 'TAGNAME', id: 'TAGID'}"
								collapse-tags
								placeholder="请选择"
								emptyText="未添加标签">
								<template slot="label" slot-scope="{option}">
									<span :title="option.TAGNAME">{{ option.TAGNAME | cutString(16) }}</span>
								</template>
							</popover-select>
							<!-- 话术 -->
							<el-popover
								placement="right"
								trigger="hover"
								content="员工在生意宝APP为顾客添加的标签">
								<am-icon class="icon_info" slot="reference" name="info"></am-icon>
							</el-popover>
							<!-- <el-select v-model="filterData.tagIds" multiple collapse-tags>
								<el-option 
									v-for="item in tags"
									:key="item.TAGID"
									:label="item.TAGNAME"
									:value="item.TAGID">
								</el-option>
							</el-select> -->
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="消费次数">
							<mgj-input-number-range v-model="filterData.consumeTimes" width="101px"></mgj-input-number-range>
						</el-form-item>
						<el-form-item label="消费金额">
							<mgj-input-number-range v-model="filterData.consumeFees" width="101px"></mgj-input-number-range>
						</el-form-item>
						<el-form-item label="门店积分">
							<mgj-input-number-range v-model="filterData.point" width="101px"></mgj-input-number-range>
						</el-form-item>
						<el-form-item label="线上积分">
							<mgj-input-number-range v-model="filterData.onlinePoint" width="101px"></mgj-input-number-range>
						</el-form-item>
						<el-form-item label="注册日期">
							<el-date-picker
								v-model="filterData.registerDate"
								type="daterange"
								value-format="yyyy-MM-dd"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期">
							</el-date-picker>
						</el-form-item>
						<el-form-item label="生日">
							<el-date-picker
								@change="handleChangeBirthday"
								v-model="filterData.birthday"
								type="daterange"
								format="MM-dd"
								value-format="MM-dd"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期">
							</el-date-picker>
							<div>
								<el-radio-group v-model="filterData.birthType">
									<el-radio :label="0">阴历</el-radio>
									<el-radio :label="1">阳历</el-radio>
								</el-radio-group>
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<form-title>归属信息</form-title>
				<el-row>
					<el-col :span="12">
						<el-form-item label="管理员工">
							<popover-select 
								size="mini"
								:popover-width="425"
								v-model="filterData.empIds"
								:options="viewEmps"
								:props="{label: 'name', id: 'id'}"
								:disabled="disabled"
								collapse-tags
								placeholder="请选择">
								<template slot="label" slot-scope="{option}">
									<span style="color: #b6b6b6; display: inline-block;width: 51px;" :title="option.no">{{ option.no | cutString(5) }}</span>
									<span :title="option.name">{{ option.name | cutString(8) }}</span>
								</template>
							</popover-select>
							<!-- 话术 -->
							<el-popover
								placement="right"
								trigger="hover"
								content="会员上次服务员工或手动分配的员工">
								<am-icon class="icon_info" slot="reference" name="info"></am-icon>
							</el-popover>
							<!-- <el-select v-model="filterData.empIds" multiple collapse-tags>
								<el-option 
									v-for="(item, index) in emps"
									:key="index"
									:label="item.name"
									:value="item.id">
								</el-option>
							</el-select> -->
						</el-form-item>
						<el-form-item label="获客渠道">
							<el-select v-model="filterData.memSourceId" @focus="hidePopover" clearable filterable
							>
								<el-option
									v-for="item in customerSource"
									:key="item.id"
									:label="item.sourceName"
									:value="item.id">
								</el-option>
							</el-select>
							<!-- 话术 -->
							<el-popover
								placement="right"
								trigger="hover"
								content="顾客来源及自定义来源">
								<am-icon class="icon_info" slot="reference" name="info"></am-icon>
							</el-popover>
						</el-form-item>
						<el-form-item label="项目覆盖">
							<item-cover-select
								size="mini"
								:popover-width="425"
								v-model="filterData.itemCovers"
								:options="itemClass"
								collapse-tags
								:props="{label: 'name', id: 'classid'}"
								placeholder="请选择">
							</item-cover-select>
							<!-- <el-select 
								class="shop_multiple_select"
								v-model="filterData.itemClassIds" 
								multiple collapse-tags>
								<el-option 
									v-for="item in itemClass"
									:key="item.classid"
									:label="item.name"
									:value="item.classid">
								</el-option>
							</el-select> -->
							<!-- 话术 -->
							<el-popover
								placement="right"
								trigger="hover"
								content="会员消费过的项目大类，作为项目覆盖标签">
								<am-icon class="icon_info" slot="reference" name="info"></am-icon>
							</el-popover>
						</el-form-item>
						
					</el-col>
					<el-col :span="12" class="checkbox_wrapper">
						<el-form-item>
							<div>
								<el-checkbox v-model="filterData.recommend" :true-label="1">为门店推荐过顾客</el-checkbox>
								<!-- 话术 -->
								<el-popover
									placement="right"
									trigger="hover"
									content="顾客来源为“客带客”时填写的推荐人">
									<am-icon class="icon_info" slot="reference" name="info"></am-icon>
								</el-popover>
							</div>
							<div>
								<el-checkbox v-model="filterData.onlineMem" :true-label="1">已经引流到线上</el-checkbox>
								<!-- 话术 -->
								<el-popover
									placement="right"
									width="340"
									trigger="hover"
									content="通过微信公众号登录并绑定手机号，或授权登录小程序的顾客均视为已引流到线上">
									<am-icon class="icon_info" slot="reference" name="info"></am-icon>
								</el-popover>
							</div>
							<div>
								<el-checkbox v-model="filterData.highquality" :true-label="1">优质客</el-checkbox>
								<!-- 话术 -->
								<el-popover
									placement="right"
									width="340"
									trigger="hover"
									content="在预设天数内消费额 + 门店剩余权益(剩余卡金与套餐价值)在门店排名预设值范围内的会员">
									<am-icon class="icon_info" slot="reference" name="info"></am-icon>
								</el-popover>
							</div>
							<div>
								<el-checkbox v-model="filterData.starMem" :true-label="1">星标客</el-checkbox>
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<div style="text-align: right"><el-button type="primary" size="medium" @click="onAdvancedQuery">搜索</el-button></div>
			</el-form>
		</el-dialog>

		<div class="customer_query-filter">
			<el-form :inline="true" @submit.native.prevent>
				<el-form-item label="顾客查询：">
					<el-input @keyup.enter.native="onQuery" v-model.trim="filterData.keyword" style="width: 315px;" clearable placeholder="请输入顾客姓名或手机号进行搜索">
						<template slot="append">
							<el-button @click="onQuery">查询</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<advanced-bar 
						style="width: 745px"
						:tag-list="advancedSearchTagList"
						@edit="showAdvancedQuery"
						@close-tag="handleSearchTagClose"
						@search="onAdvancedQuery">
					</advanced-bar>
				</el-form-item>
			</el-form>
		</div>
		<div class="customer_query-content">
			<mgj-table
				v-loading="tableLoading"
				:element-loading-text="searchLoadingText"
				tooltip-effect="dark"
				border
				size="mini"
				height="calc(100vh - 175px)"
				:columns="columnList"
				:export-table="false"
				:print-columns="printColumns"
				@selection-change="handleSelectionChange"
				@sort-change="handleSortChange"
				:data="contentData.list"
				table-name="member!memberSearch.action">
				<a 
					slot="action"
					href="javascript:;"
					class="mgj_table-action_item"
					@click="onPrintOrExcel">
					<am-icon name="export_icon"></am-icon>
					导出
				</a>
				<div class="table_tips" slot="header">
					<span class="table_tips_label">结果概要：</span>
					<dl class="table_tips_item">
						<dt class="table_tips_item-label">顾客总数</dt>
						<dd class="table_tips_item-value">{{contentData.CNT}}</dd>
					</dl>
					<!-- <dl class="table_tips_item" v-if="contentData.SUMPOINT > 0">
						<dt class="table_tips_item-label">门店积分总额</dt>
						<dd class="table_tips_item-value">{{contentData.SUMPOINT}}</dd>
					</dl> -->
				</div>
				<el-table-column label="会员姓名" fixed="left" width="90" show-overflow-tooltip>
					<template slot-scope="{ row }">
						<img title="优质客" alt="优质客" style="width: 14px; cursor: pointer;" v-if="row.mgjIsHighQualityCust" :src="highQualityIcon" @click.stop="showHighQualityCustDialog" />
						<detail-button :id="row.id">
							{{ row.name }}
						</detail-button>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" width="110">
					<template slot-scope="{ row }">
						<detail-button :id="row.id"></detail-button>
						<!-- <template v-if="hasLockPower">
							<el-popover
								v-if="row.isLocking"
								placement="top"
								width="160">
								<p>确定解锁会员？</p>
								<div style="text-align: right; margin: 0">
									<el-button size="mini" type="text" @click="hidePopover">取消</el-button>
									<el-button type="primary" size="mini" @click="onUnLock(row, $index)" :loading="popoverLoading">确定</el-button>
								</div>
								<el-button type="text" slot="reference">解锁</el-button>
							</el-popover>
							<el-popover
								v-if="!row.isLocking"
								placement="top"
								width="160">
								<p>确定锁定会员？</p>
								<div style="text-align: right; margin: 0">
									<el-button size="mini" type="text" @click="hidePopover">取消</el-button>
									<el-button type="primary" size="mini" @click="onLock(row, $index)" :loading="popoverLoading">确定</el-button>
								</div>
								<el-button type="text" slot="reference">锁定</el-button>
							</el-popover>
						</template> -->
						<el-popover
							v-if="hasDeletePower"
							placement="top"
							width="160">
							<p>确定删除会员？</p>
							<div style="text-align: right; margin: 0">
								<el-button size="mini" type="text" @click="hidePopover">取消</el-button>
								<el-button type="primary" size="mini" @click="onDeleteMember(row)" :loading="popoverLoading">确定</el-button>
							</div>
							<a href="javascript:;" style="color: #EF5C5C" slot="reference">删除</a>
						</el-popover>
					</template>
				</el-table-column>
			</mgj-table>
			<el-pagination
				v-if="contentData.CNT"
				background
				:pager-count="15"
				@current-change="handleCurrentPageChange"
				:page-size="filterData.pageSize"
				@size-change="handleChangePageSize"
				:current-page="pageNumber"
				:page-sizes="[15, 30, 50]"
				layout="prev, pager, next, sizes"
				:total="contentData.CNT">
			</el-pagination>
		</div>

		<!-- 优质客弹窗 -->
		<el-dialog class="high_quality_customer_dialog" :visible.sync="highQualityCustDialogVisible" width="418px">
			<div class="title">
				<img class="crown" :src="highQualityIcon" alt="优质客">戴有皇冠的优质客
			</div>
			<div class="intro_wrapper">
				<div class="intro">优质客是美管加根据顾客过去6个月或者12个月（依赖配置）的消费总额与顾客在门店剩余权益总额（包含储值卡余额和套餐剩余次数折算的金额）相加而计算出来的门店排名前20%（最多不超过200名）的顾客。</div>
				<div class="imgAndText">
					<div class="left">
						<div class="one"></div>
						<div class="two"></div>
						<div class="three"></div>
					</div>
					<div class="right">
						<p class="row1">消费总额 + 门店剩余权益总额</p>
						<p class="row2">=</p>
						<p class="row3">优质客</p>
						<p class="row4">（门店排名前20%的顾客，最多不超过200名）</p>
					</div>
				</div>
				<div class="summary">简单的说，能成为优质客，要么过去半年或一年消费总额较多，要么顾客剩余卡金或套餐金额多，或者二者都多，越多的排名越靠前。</div>
			</div>
			<div class="suggest">
				<am-icon class="icon_bulb" name="bulb" size="22px"></am-icon>
				美管加建议对戴有皇冠的优质客提供差异化的服务。
			</div>
		</el-dialog>
	</div>
</template>
<script>
import Api from '@/api'
import MgjInputNumberRange from '@/components/input-number-range'
import MgjTable from '#/components/table'
import FormTitle from '#/components/advanced-form-title'
import DetailButton from '#/components/detail-button'
import MetaDataMixin from '#/mixins/meta-data'
import AdvancedSearchMixin from '#/mixins/advanced-search'
import TableRenderMixin from '#/mixins/table-render'
import Dayjs from 'dayjs'
import FindIndex from 'lodash.findindex'
import LodashSome from 'lodash.some'
import IsNumber from 'is-number'
import DeleteConfirm from '#/components/delete-confirm'
import PopoverSelect from '#/components/popover-select'
import ItemCoverSelect from '#/components/item-cover-select'
const DateFormat = 'YYYY-MM-DD'
import { SexMap, StatusMap, StageMap } from '#/config/constant'
const realLength = (str) => {
	return str.replace(/[^\x00-\xff]/g, "**").length; 
}
export default {
	name: 'customerQuery',
	components: {
		MgjInputNumberRange,
		MgjTable,
		FormTitle,
		PopoverSelect,
		ItemCoverSelect,
		DetailButton,
	},
	mixins: [
		MetaDataMixin,
		AdvancedSearchMixin,
		TableRenderMixin,
	],
	data() {
		const memberStage = Object.keys(StageMap).map(stage => {
			return {
				stage: parseInt(stage),
				label: StageMap[stage]
			}
		})
		const memberStatus = Object.keys(StatusMap).map(status => {
			return {
				status: parseInt(status),
				label: StatusMap[status]
			}
		})
		return {
			popoverLoading: false,
			dialogVisible: false,
			highQualityCustDialogVisible: false, // 优质客弹窗
			initLoading: false,
			tableLoading: false,
			filterData: {
				searchType: 1,
				keyword: '',
				pageNumber: 0,
				pageSize: 15,
				registerDate: undefined,
				birthday: '',
				birthType: undefined,
				classId: undefined,
				memSourceId: undefined,
				empIds: undefined,
				itemCovers: undefined,
				tagIds: undefined,
				sortField: undefined,
				sortType: undefined
			},
			contentData: {},
			// 会员阶段
			memberStage,
			// 顾客状态
			memberStatus,
			emps: [], // 管理员工
			customerSource: [], // 获客渠道
			itemClass: [], // 项目覆盖
			memberClass: [], // 分类
			tags: [], // 顾客标签
			printColumns: [
				{label: '会员姓名', prop: 'name'},
			],
			columnList: [
				{label: '昵称', prop: 'nickName', attrs: {width: '100', 'show-overflow-tooltip': true}}, 
				{label: '性别', prop: 'sex', attrs: {width: '50'}},
				{label: '手机号', prop: 'mobile', attrs: {width: '110'}},
				{label: '门店', prop: 'shopName', attrs: {'min-width': '136', 'show-overflow-tooltip': true}},
				{label: '客单价', prop: 'avgfee', attrs: {'sortable': 'custom', 'min-width': "85"}},
				{label: '消费金额', prop: 'mgjlast12mtotal', attrs: {'sortable': 'custom', 'min-width': "100"}}, 
				{label: '消费次数', prop: 'mgjlast12mfreq', attrs: {'sortable': 'custom', 'min-width': "100"}},
				{label: '上次消费', prop: 'lastconsumetime', attrs: {width: '110', 'sortable': 'custom'}},
				{label: '上次服务员工', prop: 'mgjlastserver', attrs: {width: '120', 'show-overflow-tooltip': true}},
				{label: '门店积分', prop: 'currpoint', attrs: {'sortable': 'custom', 'min-width': "100"}}, 
				{label: '线上积分', prop: 'onlinecredit', attrs: {'sortable': 'custom', 'min-width': "100"}}, 
				{label: '注册日期', prop: 'registdate', attrs: {width: '100', 'sortable': 'custom'}},
				{label: '顾客分类', prop: 'memClass', attrs: {width: '140', 'show-overflow-tooltip': true}},
				{label: '会员阶段', prop: 'memberStage'},
				{label: '顾客状态', prop: 'memberstatusName', attrs: {formatter: this.formatterMemberStatusName, width: '87'}},
				{label: '标签', prop: 'tags', attrs: {'min-width': '200', formatter: this.formatterMemberTag}},
				{label: '项目覆盖', prop: 'itemCover', attrs: {'min-width': '200', formatter: this.formatterMemberTag}},
				{label: '获客渠道', prop: 'sourceName', attrs: {width: '120'}},
				{label: '备注', prop: 'page', attrs: {width: '200', 'show-overflow-tooltip': true}}
			],
			searchKeyConfig: {
				'sex': {type: 'map', mapData: SexMap},
				'shopIds': {type: 'multipleSelect', listDataKey: 'hasTenantShopList', matchKey: 'id', labelKey: 'osName'},
				'stage': {type: 'select', listDataKey: 'memberStage', matchKey: 'stage', labelKey: 'label'},
				'consumeTimes': {type: 'range', label: '消费次数'},
				'point': {type: 'range', label: '门店积分'},
				'registerDate': {type: 'range', label: '注册日期'},
				'classId': {type: 'select', listDataKey: 'memberClass', matchKey: 'classid', labelKey: 'classname'},
				'status': {type: 'select', listDataKey: 'memberStatus', matchKey: 'status', labelKey: 'label'},
				'tagIds': {type: 'multipleSelect', listDataKey: 'tags', matchKey: 'TAGID', labelKey: 'TAGNAME'},
				'consumeFees': {type: 'range', label: '消费金额'},
				'onlinePoint': {type: 'range', label: '线上积分'},
				'birthday': {type: 'range', label: '生日'},
				'empIds': {type: 'multipleSelect', listDataKey: 'emps', matchKey: 'id', labelKey: 'name'},
				'itemCovers': {type: 'cover', listDataKey: 'itemClass', matchKey: 'classid', labelKey: 'name'},
				'memSourceId': {type: 'select', listDataKey: 'customerSource', matchKey: 'id', labelKey: 'sourceName'},
				'recommend': {type: 'checkbox', label: '为门店推荐过顾客'},
				'onlineMem': {type: 'checkbox', label: '已经引流到线上'},
				'highquality': {type: 'checkbox', label: '优质客'},
				'starMem': {type: 'checkbox', label: '星标客'},
			},
		}
	},
	async mounted() {
		this.initLoading = true;
		const res = await Api.getMetaData();
		this.initLoading = false;
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		const shopIds = this.isSingleShop ? [parseInt(this.shopId)] : [];
		this.handleChangeShop(shopIds);
		if (this.isSingleShop) {
			this.filterData.shopIds = shopIds;
		}
		
	},
	computed: {
		pageNumber() {
			return this.filterData.pageNumber + 1;
		},
		postData() {
			const {
				searchType,
				keyword,
				shopIds,
				empIds, // 管理员工
				itemCovers, // 项目覆盖
				tagIds, // 顾客标签
				memSourceId, // 获客渠道
				point, // 门店积分 range
				onlinePoint, // 线上积分 range
				registerDate, // 注册时间 range
				birthday, // 生日 range
				birthType, // 生日类型
				consumeTimes, // 消费次数 range
				consumeFees, // 消费金额 range
				recommend, // 为门店对接过顾客
				highquality, // 优质客
				onlineMem, // 已引流到线上
				status, // 状态
				stage, // 阶段
				pageNumber,
				pageSize,
				classId,
				starMem,
				sex,
				sortField,
				sortType,
			} = this.filterData;
			let postData = {
				tenantId: this.parentShopId,
				searchType,
				keyword,
				shopIds,
				empIds,
				itemCovers,
				tagIds,
				memSourceId,
				recommend,
				highquality,
				onlineMem,
				status,
				stage,
				pageNumber,
				pageSize,
				classId,
				birthType,
				starMem,
				sex,
				sortField,
				sortType,
			}
			if (point) {
				const [pointBegin, pointEnd] = point;
				postData = Object.assign(postData, {pointBegin, pointEnd});
			}
			if (onlinePoint) {
				const [onlinePointBegin, onlinePointEnd] = onlinePoint;
				postData = Object.assign(postData, {onlinePointBegin, onlinePointEnd});
			}
			if (registerDate) {
				const [registerDateBegin, registerDateEnd] = registerDate;
				postData = Object.assign(postData, {registerDateBegin, registerDateEnd});
			}
			if (birthday) {
				const [birthdayBegin, birthdayEnd] = birthday;
				postData = Object.assign(postData, {birthdayBegin, birthdayEnd});
			}
			if (consumeTimes) {
				const [consumeTimesBegin, consumeTimesEnd] = consumeTimes;
				postData = Object.assign(postData, {consumeTimesBegin, consumeTimesEnd});
			}
			if (consumeFees) {
				const [consumeFeesBegin, consumeFeesEnd] = consumeFees;
				postData = Object.assign(postData, {consumeFeesBegin, consumeFeesEnd});
			}
			return postData;
		},
		viewEmps() {
			const { shopIds } = this.filterData;
			if (!shopIds || shopIds.length === 0) return this.emps;
			return this.emps.filter(emp => {
				const { shopId } = emp;
				return shopIds.indexOf(parseInt(shopId)) !== -1;
			})
		},
		disabled() {
			return this.filterData.shopIds && this.filterData.shopIds.length > 1 ? true : false;
		}
	},
	methods: {
		formatterMemberTag(row, column, cellValue, index) {
			const tagList = cellValue ? cellValue.split(' ').filter(item => item !== '') : undefined;
			if (tagList) {
				let newtagList = cellValue ? cellValue.split(' ').filter(item => item !== '') : undefined;
				let viewList = [...newtagList].splice(0, 2);
				const ViewStringLength = viewList.reduce((pre, item) => {
					return pre + realLength(item);
				}, 0)
				if (ViewStringLength >= 16) {
					const viewItem = newtagList.find(item => realLength(item) <= 20);
					viewList = viewItem ? [viewItem] : [`${newtagList[0].substring(0, 6)}...`];
				}
				const viewDomList = viewList.map(item => {
					return <el-tag type="info" effect="light">{ item }</el-tag>
				})
				if (tagList.length <= 2 && tagList.length === viewList.length) {
					return <div>{ viewDomList }</div>
				} else {
					const viewString = tagList.join('、');
					return <el-tooltip effect="dark" content={viewString} placement="top-start">
								<div>{ viewDomList }<el-tag effect="plain" type="info"><am-icon style="color: #333" name="more"></am-icon></el-tag></div>
							</el-tooltip>
					// return <el-popover
					// 		placement="top-start"
					// 		width="300"
					// 		trigger="hover"
					// 		content={viewString}>
					// 		<div slot="reference">{ viewDomList }<el-tag effect="plain" type="info">...</el-tag></div>
					// 	</el-popover>
				}
			}
			return "";
		},
		generatePostData() {
			const postData = {};
			const { searchType } = this.postData;
			if (searchType === 2) {
				for (let key in this.postData) {
					const value = this.postData[key];
					if ((!value && !IsNumber(value)) || value.length === 0 || key === 'keyword') continue;
					postData[key] = value;
				}
			} else {
				const {
					keyword,
					pageSize,
					pageNumber,
					sortField,
					sortType,
				} = this.postData;
				postData.keyword = !keyword && !IsNumber(keyword) ? undefined : keyword;
				postData.pageSize = pageSize;
				postData.pageNumber = pageNumber;
				postData.sortField = sortField;
				postData.sortType = sortType;
			}
			if (this.hasTenantShopList.length === 1) {
				postData.shopIds = [this.hasTenantShopList[0].id]
			}
			postData.searchType = searchType;
			return postData;
		},
		onPrintOrExcel() {
			const postData = this.generatePostData();
			const Max = 65000;
			if (this.contentData.CNT > Max) {
				this.$message.warning(`一次最多可导出 ${Max} 条数据，请筛选后导出`);
				return;
			}
			const loading = this.$loading({
				lock: true,
				text: '正在加载中...',
			});
			this.$http.post('/member!memberSearch.action', {
				...postData,
				pageSize: 99999,
				pageNumber: 0,
				tenantId: this.parentShopId,
			}, {
				responseType: 'blob'
			}).then(res => {
				const resData = res.data;
				if (resData.type.indexOf('html') !== -1) return;
				let a = document.createElement('a');
				a.download = '顾客查询.xls';
				a.href = URL.createObjectURL(resData);
				document.body.append(a);
				a.click();
				loading.close();
				a.remove();
			})
		},
		isLockFn(item) {
			const {
				locking,
				lastconsumetime,
				shopid
			} = item;
			if (locking === 2) return true;
			const shopData = this.findShopById(shopid) || {};
			const {
				lockmembermonths
			} = shopData;
			if (!lastconsumetime || !lockmembermonths || lastconsumetime < 0) return false;
			const currentDate = Dayjs();
			const lasttimeDate = Dayjs(lastconsumetime);
			const diffMonth = currentDate.diff(lasttimeDate, 'month', true);
			return locking === 0 && diffMonth > lockmembermonths;

		},
		onLock({ id }, index) {
			this.updateLock({memberid: id, locking: 2, isLocking: true}, index);
		},
		onUnLock({ id }, index) {
			this.updateLock({memberid: id, locking: 1, isLocking: false}, index);
		},
		updateLock(postData, index) {
			const {
				memberid,
				locking,
				isLocking
			} = postData;
			this.popoverLoading = true;
			this.$http.post('/member!memberLocking.action', {
				memberid,
				locking
			}).then(res => {
				this.popoverLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.hidePopover();
					this.contentData.list[index].locking = locking;
					this.contentData.list[index].isLocking = isLocking;
				}
			}).catch(() => {
				this.popoverLoading = false;
			});
		},
		hidePopover() {
			document.body.click();
		},
		onDeleteMember({id: memberid}) {
			this.hidePopover();
			const postData = {
				memberid,
				parentShopId: this.parentShopId
			};
			DeleteConfirm.open({postData, requestUri: '/member!memberDel.action'}).then(() => {
				this.getData();
			});
		},
		showAdvancedQuery() {
			this.dialogVisible = true;
		},
		onQuery() {
			const { keyword } = this.filterData;
			const errorMsg = this.validKeywordError(keyword)
			if (errorMsg) {
				this.$message.warning(errorMsg);
				return;
			}
			this.filterData.searchType = 1;
			this.onSearch();
		},
		onAdvancedQuery() {
			this.updateViewSearchContent(this.filterData);
			if (this.advancedSearchTagList.length === 0 && !this.isSingleShop) {
				if (this.dialogVisible === false) {
					this.dialogVisible = true;
				} else {
					this.$message.warning('请至少选择一个筛选条件！')
				}
				return;
			}
			this.dialogVisible = false;
			this.filterData.searchType = 2;
			this.onSearch();
		},
		onSearch() {
			this.filterData.pageNumber = 0;
			this.getData();
		},
		getData() {
			this.tableLoading = true;
			this.startSearchTipsTimeout();
			const postData = this.generatePostData();
			this.$http.post('/member!memberSearch.action', {
				...postData,
				tenantId: this.parentShopId
			}).then(res => {
				this.clearSearchTipsTimeout();
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content.list.forEach(item => {
						const {
							sex,
							lastconsumetime,
							registdate,
							memberStage,
							memberStatus, 
							mgjlast12mfreq, 
							mgjlast12mtotal,
							mobile,
							tags,
							itemCovers,
							locking,
							shopid,
						} = item;
						item.isLocking = this.isLockFn({locking, lastconsumetime, shopid});
						item.sex = this.getSexName(sex);
						item.registdate = registdate ? Dayjs(registdate).format(DateFormat) : '';
						item.memberStage = this.getStageName(memberStage);
						item.memberstatusName = this.getStatusName(memberStatus);
						item.avgfee = mgjlast12mfreq > 0 ? parseFloat((mgjlast12mtotal / mgjlast12mfreq).toFixed(2)) : 0;
						item.mobile = this.mobileDecorator(mobile);
						item.lastconsumetime = this.lastconsumetimeDecorator(lastconsumetime);
						item.tags = item.tags && item.tags.split(',').join(' ');
						item.itemCover = itemCovers && this.convertItemClasses(itemCovers, shopid).join(' ')
					})
					this.contentData = resData.content;
				}
			}).catch(() => {
				this.tableLoading = false;
				this.clearSearchTipsTimeout();
			})
		},
		handleChangeBirthday(value) {
			if (value && !this.filterData.birthType) {
				this.filterData.birthType = 1;
			}
			if (!value) {
				this.filterData.birthType = undefined;
			}
		},
		handleChangeShop(shopIdList) {
			const ShopLength = shopIdList.length;
			let shops = []
			if (ShopLength === 0) {
				this.hasTenantShopList.forEach(shop => {
					if (shop.softgenre !== '3') {
						shops.push({
							shopId: shop.id,
							parentId: shop.parentId
						})
					}
				})
			} else {
				const hasAuxiliary = LodashSome(shopIdList, shopId => {
					const shopData = this.findShopById(shopId);
					return shopData && parseInt(shopData.softgenre) === 3;
				})
				if (hasAuxiliary) {
					const lastShopId = shopIdList[shopIdList.length - 1];
					const lastShopData = this.findShopById(lastShopId);

					shops.push({
						shopId: lastShopId,
						parentId: lastShopData.softgenre === '3' ? lastShopId : this.parentShopId
					})
					this.filterData.shopIds = [lastShopId];
					this.filterData.itemCovers = [];
					this.filterData.tagIds = [];
					this.filterData.empIds = [];
				} else {
					shopIdList.forEach(shopId => {
						shops.push({
							shopId,
							parentId: this.parentShopId
						})
					});
				}
				const { tagIds, empIds } = this.filterData;
				if (tagIds && tagIds.length > 0) {
					tagIds.filter(id => {
						const tagIndex = FindIndex(this.tags, tagItem => tagItem.TAGID === id);
						const currentTagData = this.tags[tagIndex];
						return currentTagData && shopIdList.indexOf(currentTagData.SHOPID) !== -1;
					})
					this.filterData.tagIds = tagIds;
				}
				if (empIds && empIds.length > 0) {
					empIds.filter(id => {
						const empIndex = FindIndex(this.emps, empItem => empItem.id === id);
						const currentEmpData = this.emps[empIndex];
						return currentEmpData && shopIdList.indexOf(parseInt(currentEmpData.shopId) !== -1);
					})
					this.filterData.empIds = empIds;
					
				}
			}
			Api.searchCondition({shops}).then().then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					const {
						customerSource,
						emps,
						itemClass,
						memberClass,
						tags,
						tagsByShop
					} = resData.content;
					this.customerSource = customerSource;
					this.emps = emps;
					if (shops.length > 1) this.emps = []
					this.itemClass = itemClass;
					this.memberClass = memberClass;
					this.tags = tagsByShop;
					if (ShopLength === 0) this.tags = []
					this.updateFilterSelectData();
				}
			})
		},
		updateFilterSelectData() {
			const list = [
				{key: 'memSourceId', listDataKey: 'customerSource', validKey: 'id' },
				{key: 'classId', listDataKey: 'memberClass', validKey: 'id' },
			]
			list.forEach(validItem => {
				const {
					key,
					listDataKey,
					validKey
				} = validItem;
				const CurrentIndex = FindIndex(this[listDataKey], item => item[validKey] === this.filterData[key]);
				if (CurrentIndex === -1) {
					this.filterData[key] = '';
				}
			})
		},
		handleChangePageSize(size) {
			this.filterData.pageSize = size;
			this.onSearch();
		},
		handleCurrentPageChange(size) {
			this.filterData.pageNumber = size - 1;
			this.getData();
		},
		handleSelectionChange() {
		},
		handleSortChange({column, prop, order}) {
			this.filterData.sortField = prop || undefined;
			this.filterData.sortType = order ? (order === 'descending' ? 1 : 0) : undefined;
			this.onSearch();
		},
		showHighQualityCustDialog() {
			this.highQualityCustDialogVisible = true;
		}
	}
}
</script>

<style>
	.customer_query {
		padding: 20px;
		& .el-dialog .el-form-item__label {
			color: #909090;
		}
		& .el-dialog .el-checkbox {
			margin-right: 0;
		}
		& .item_cover_select_container,
		& .popover_select_container {
			width: 235px;
		}
	}
	.customer_query .el-pagination {
		margin: 10px -10px 0;
	}
	.customer_query-filter .el-input-group__append {
		background-color: #0ae;
		border-color: #0ae;
		color: #fff;
	}
	.customer_query-filter .advanced_bar .el-input-group__append {
		background-color: #67c23a;
		border-color: #67c23a;
		color: #fff;
	}
	.customer_query .el-input--small,
	.customer_query .el-form-item__label,
	.customer_query .el-radio__label,
	.customer_query .el-checkbox__label {
		font-size: 12px;
	}
	.customer_query .el-radio + .el-radio {
		margin-left: 10px;
	}
	.customer_query .el-input__inner {
		color: #222;
	}
	.customer_query .el-range-editor--mini.el-input__inner {
		width: 235px;
	}
	.customer_query .el-date-editor .el-range-input {
		padding-left: 6px;
		text-align: left;
	}
	.customer_query .el-date-editor .el-range-separator {
		min-width: 20px;
		color: #999;
	}

	.customer_query .el-dialog .el-select {
		width: 235px;
	}

	.customer_query .el-dialog__title {
		font-size: 18px;
		color: #222;
	}
	.customer_query .el-dialog__header {
		padding: 14px 18px 0;
	}
	.customer_query .el-dialog__body,
	.card_search .el-dialog__body {
		padding-top: 15px;
	}
	.customer_query .el-form .el-form-item {
		margin-bottom: 15px;
	}


	.customer_query .el-form-item .icon_info,
	.card_search .el-form-item .icon_info {
		margin-left: 5px;
		color: #c1c1c1;
		cursor: pointer;
		transition: color .3s;
	}
	.customer_query .el-form-item .icon_info:hover,
	.card_search .el-form-item .icon_info:hover {
		color: #0ae;
	}

	.customer_query .el-radio,
	.customer_query .el-checkbox,
	.card_search .el-radio,
	.card_search .el-checkbox {
		color: #333;
	}

	.customer_query .mgj_table .el-tag.el-tag--small {
		height: 22px;
		line-height: 20px;
	}
	.customer_query .mgj_table .el-tag--light {
		color: #333;
		background-color: #F0F2F5;
		border: 2px solid transparent;
	}
	.customer_query .mgj_table .el-tag--plain {
		padding: 0 6px;
		border: 1px solid #eeeeee;
	}

	.table_tips {
		float: left;
		overflow: hidden;
	}
	.linkdetail {
		color:#00A7D7;
		cursor: pointer;
	}
	.table_tips_label,
	.table_tips_item,
	.table_tips_item-label,
	.table_tips_item-value {
		float: left;
		line-height: 14px;
	}
	.table_tips_label {
		margin-right: 7px;
	}
	.table_tips_item ~ .table_tips_item {
		margin-left: 12px;
	}
	.table_tips_item-value {
		margin-left: 5px;
		color:#00A7D7;
		font-size: 14px;
	}
	.shop_multiple_select .el-tag  {
		position: relative;
	}
	.shop_multiple_select.el-select .el-select__tags-text {
		display: inline-block;
		max-width: 128px;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.shop_multiple_select.el-select .el-tag:not(:last-child) .el-select__tags-text,
	.shop_multiple_select.el-select .el-tag:first-child .el-select__tags-text {
		padding-right: 10px;
	}
	.shop_multiple_select.el-select .el-select__tags-text {
		color: #222;
	}
	.shop_multiple_select.el-select .el-tag:only-child .el-select__tags-text {
		max-width: 170px;
	}
	.shop_multiple_select.el-select .el-tag__close.el-icon-close {
		position: absolute;
		top: 50%;
		right: 0;
		transform: scale(.7) translateY(-50%);
	}

	/* 优质客弹窗样式 */
	.high_quality_customer_dialog .el-dialog__header {
		padding-bottom: 12px;
	}
	.high_quality_customer_dialog .el-dialog__header .el-dialog__headerbtn {
		top: 10px;
	}
	.high_quality_customer_dialog .el-dialog__body {
		padding-top: 4px;
	}
	.high_quality_customer_dialog .title {
		position: relative;
		padding-left: 40px;
		color: #222;
		font-size: 17px;
	}
	.high_quality_customer_dialog .title .crown {
		position: absolute;
		top: -5px;
		left: 0;
		width: 26px;
	}
	.high_quality_customer_dialog .intro_wrapper {
		margin: 20px 0;
		font-size: 12px;
		color: #888;
		line-height: 18px;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText {
		display: flex;
		justify-content: space-around;
		margin: 30px 0;
		padding-left: 46px;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .left {
		width: 32px;
		height: 116px;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .left .one {
		height: 20%;
		background: #F3F3F3; 
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .left .two {
		position: relative;
		height: 40%;
		background: #EC7BAC;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .left .two::before {
		position: absolute;
		top: -4px;
		left: -40px;
		content: '12个月';
		font-size: 10px;
		color: #222;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .left .three {
		position: relative;
		height: 40%;
		background: #F19EC2;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .left .three::before {
		position: absolute;
		top: -4px;
		left: -40px;
		content: '6个月';
		font-size: 10px;
		color: #222;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .right {
		padding-top: 14px;
		text-align: center;
	}

	.high_quality_customer_dialog .intro_wrapper .imgAndText .right .row1 {
		font-size: 13px;
		color: #222;
	}
	.high_quality_customer_dialog .intro_wrapper .imgAndText .right .row2 {
		margin: 10px 0;
		font-size: 18px;
		color: #222;
	}

	.high_quality_customer_dialog .suggest {
		position: relative;
		padding-left: 44px;
		height: 44px;
		line-height: 44px;
		background: #FFFAF2;
		font-size: 12px;
		color: #E1AF61;
	}
	.high_quality_customer_dialog .suggest .icon_bulb {
		position: absolute;
		top: 0;
		left: 14px;
		color: #E1AF61;
	}
</style>
