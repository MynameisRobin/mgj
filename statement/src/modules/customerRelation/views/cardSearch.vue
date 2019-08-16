<template>
	<div class="card_search" v-loading="initLoading">
		<el-dialog
			title="会员卡高级查询"
			:visible.sync="dialogVisible"
			width="803px">
			<el-form size="mini" label-position="left" label-width="72px">
				<form-title>基础信息</form-title>
				<el-row>
					<el-col :span="12">
						<el-form-item label="门店">
							<template v-if="shopList.length > 1">
								<el-select
									class="shop_multiple_select"
									v-model="filterData.shopids"
									@change="handleChangeShop"
									multiple
									filterable
									collapse-tags>
									<el-option 
										v-for="shopItem in shopList"
										:key="shopItem.id"
										:label="shopItem.osName"
										:value="shopItem.id">
									</el-option>
								</el-select>
								<el-popover placement="right" content="选择查询门店，附属店只能单选" trigger="hover">
									<am-icon class="icon_info" slot="reference" name="info"></am-icon>
								</el-popover>
							</template>
							<span v-else-if="shopList.length">{{ shopList[0].osName }}</span>
						</el-form-item>
						<el-form-item label="性别">
							 <el-radio-group v-model="filterData.sex">
								<el-radio label="M">男</el-radio>
								<el-radio label="F">女</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item label="卡金余额">
							<mgj-input-number-range v-model="filterData.cardBalance" width="101px"></mgj-input-number-range>
						</el-form-item>
						<el-form-item label="开卡日期">
							<el-date-picker
								v-model="filterData.createCardTime"
								type="daterange"
								:default-time="['00:00:00', '23:59:59']"
								value-format="yyyy/MM/dd HH:mm:ss"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期">
							</el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="卡类型">
							<el-select 
								v-model="filterData.cardTypeId"
								@change="handleChangeCardType"
								clearable
								filterable
								placeholder="请选择">
								<el-option 
									v-for="item in cardClassList" 
									:key="item.id"
									:label="item.label"
									:value="item.id">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="卡名称">
							<el-select 
								v-model="filterData.cardType"
								clearable
								filterable>
								<el-option
									v-for="item in cardTypeList"
									:key="item.cardtypeid"
									:label="item.cardtypename"
									:value="item.cardtypeid">
								</el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="赠送金余额">
							<mgj-input-number-range v-model="filterData.presentFee" width="101px"></mgj-input-number-range>
						</el-form-item>
						<el-form-item label="最后消费日">
							<el-date-picker
								v-model="filterData.lastConsumeTime"
								type="daterange"
								:default-time="['00:00:00', '23:59:59']"
								value-format="yyyy/MM/dd HH:mm:ss"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期">
							</el-date-picker>
						</el-form-item>
					</el-col>
				</el-row>
				<form-title>卡金情况</form-title>
				<el-row>
					<el-col :span="12">
						<el-form-item label="总充值金额">
							<mgj-input-number-range v-model="filterData.cumulative" width="101px"></mgj-input-number-range>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="总卡扣金额">
							<mgj-input-number-range v-model="filterData.customeTotal" width="101px"></mgj-input-number-range>
						</el-form-item>
					</el-col>
				</el-row>
				<form-title>有效期</form-title>
				<el-row>
					<el-col :span="24">
						<el-form-item label="有效">
							<el-radio-group v-model="filterData.type">
								<el-radio 
									v-for="item in invalidDateTypeList"
									:key="item.id" :label="item.id">
									{{ item.label }}
								</el-radio>
								<div class="invalid_daterange_form_item" v-if="filterData.type === 3">
									<el-date-picker
										v-model="filterData.invalidDate"
										type="daterange"
										value-format="yyyy/MM/dd"
										range-separator="至"
										start-placeholder="开始日期"
										end-placeholder="结束日期">
									</el-date-picker>
								</div>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
				<div style="text-align: right"><el-button type="primary" size="medium" @click="onAdvancedFilter">搜索</el-button></div>
			</el-form>
		</el-dialog>
		<div class="card_search-filter">
			<el-form :inline="true" @submit.native.prevent>
				<el-form-item label="会员卡查询：">
					<el-input
						@keyup.enter.native="onNomalSearch"
						v-model.trim="filterData.keywordSearch"
						clearable
						style="width: 315px;" placeholder="请输入顾客姓名或手机号或卡号进行搜索">
						<template slot="append">
							<el-button @click="onNomalSearch">查询</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<advanced-bar 
						style="width: 745px"
						:tag-list="advancedSearchTagList"
						@edit="showAdvancedFilter"
						@close-tag="handleSearchTagClose"
						@search="onAdvancedFilter">
					</advanced-bar>
				</el-form-item>
			</el-form>
		</div>
		<div class="card_search-content">
			<mgj-table
				print-title="会员卡查询"
				v-loading="tableLoading"
				:element-loading-text="searchLoadingText"
				tooltip-effect="dark"
				border
				size="mini"
				height="calc(100vh - 175px)"
				:export-table="false"
				:columns="columnList"
				:data="contentData.content"
				@sort-change="handleSortChange"
				table-name="member!memberAdvancedSearch.action">
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
						<dt class="table_tips_item-label">总卡数</dt>
						<dd class="table_tips_item-value">{{ contentData.count }}</dd>
					</dl>
					<!-- <dl class="table_tips_item">
						<dt class="table_tips_item-label">总余额</dt>
						<dd class="table_tips_item-value table_tips_item-value--important">￥{{ contentData.sumCardFee }}</dd>
					</dl>
					<dl class="table_tips_item">
						<dt class="table_tips_item-label">总赠送金余额</dt>
						<dd class="table_tips_item-value table_tips_item-value--important">￥{{ contentData.sumPresentFee }}</dd>
					</dl> -->
				</div>
				<el-table-column label="会员姓名" fixed="left" width="90" show-overflow-tooltip>
					<template slot-scope="{ row }">
						<img title="优质客" alt="优质客" style="width: 14px; cursor: pointer;" v-if="row.mgjIsHighQualityCust" :src="highQualityIcon" @click.stop="showHighQualityCustDialog" />
						<detail-button :id="row.memberid">
							{{ row.name }}
						</detail-button>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right">
					<template slot-scope="{ row }">
						<el-popover
							v-if="hasDeletePower"
							placement="top"
							width="160">
							<p>确定删除会员卡？</p>
							<div style="text-align: right; margin: 0">
								<el-button size="mini" type="text" @click="cancelDeleteCard">取消</el-button>
								<el-button type="primary" size="mini" @click="onDeleteCard(row)" :loading="removeCardLoading">确定</el-button>
							</div>
							<a href="javascript:;" style="color: #EF5C5C" slot="reference">删除</a>
						</el-popover>
					</template>
				</el-table-column>
			</mgj-table>
			<el-pagination
				v-if="contentData.count"
				background
				:pager-count="15"
				@current-change="handleCurrentPageChange"
				@size-change="handleChangePageSize"
				:page-size="filterData.pageSize"
				:current-page="pageNumber"
				:page-sizes="[15, 30, 50]"
				layout="prev, pager, next, sizes"
				:total="contentData.count">
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
import LodashSome from 'lodash.some'
import FindIndex from 'lodash.findindex'
import Dayjs from 'dayjs'
import IsNumber from 'is-number'
import MetaDataMixin from '#/mixins/meta-data'
import AdvancedSearchMixin from '#/mixins/advanced-search'
import TableRenderMixin from '#/mixins/table-render'
import DeleteConfirm from '#/components/delete-confirm'
import DetailButton from '#/components/detail-button'
import { SexMap } from '#/config/constant'
const InvalidDateTypeMap = {
	0: '全部',
	1: '已过期',
	2: '在有效期',
	3: '自定义'
}
const DateFormat = 'YYYY-MM-DD'
export default {
	name: 'cardSearch',
	components: {
		MgjInputNumberRange,
		MgjTable,
		FormTitle,
		DetailButton
	},
	mixins: [
		MetaDataMixin,
		AdvancedSearchMixin,
		TableRenderMixin
	],
	data() {
		const invalidDateTypeList = Object.keys(InvalidDateTypeMap).map(index => {
			return {
				id: Number(index),
				label: InvalidDateTypeMap[index]
			}
		})
		return {
			hasAuxiliary: false,
			initLoading: false,
			tableLoading: false,
			dialogVisible: false,
			highQualityCustDialogVisible: false, // 优质客弹窗
			removeCardLoading: false,
			searchKeyConfig: {
				'sex': {type: 'map', mapData: SexMap},
				'shopids': {type: 'multipleSelect', listDataKey: 'shopList', matchKey: 'id', labelKey: 'osName'},
				'cardBalance': {type: 'range', label: '卡金余额'},
				'createCardTime': {type: 'range', label: '开卡日期'},
				'cardTypeId': {type: 'select', listDataKey: 'cardClassList', matchKey: 'id', labelKey: 'label'},
				'cardType': {type: 'select', listDataKey: 'cardTypeList', matchKey: 'cardtypeid', labelKey: 'cardtypename'},
				'presentFee': {type: 'range', label: '赠送金余额'},
				'lastConsumeTime': {type: 'range', label: '最后消费日'},
				'cumulative': {type: 'range', label: '总充值金额'},
				'customeTotal': {type: 'range', label: '总卡扣金额'},
				'type': {type: 'map', mapData: InvalidDateTypeMap, label: '有效期'}
			},
			filterData: {
				type: undefined,
				pageNumber: 0,
				pageSize: 15,
				cardType: undefined
			},
			tableData: [],
			contentData: {},
			currentFilterData: {},
			printColumns: [
				{label: '会员姓名', prop: 'name'},
			],
			columnList: [
				{label: '性别', prop: 'sex', attrs: {width: '50'}},
				{label: '手机号', prop: 'mobile', attrs: {width: '110'}},
				{label: '门店', prop: 'shopname', attrs: {'min-width': '136', 'show-overflow-tooltip': true}},
				{label: '卡号', prop: 'cardid', attrs: {'min-width': '130', 'show-overflow-tooltip': true}},
				{label: '卡名称', prop: 'cardtypename', attrs: {'min-width': '100', 'show-overflow-tooltip': true}},
				{label: '卡类型', prop: 'cardClassName', attrs: {'min-width': '100', 'show-overflow-tooltip': true}},
				{label: '卡内余额', prop: 'cardfee', attrs: {'sortable': 'custom', 'min-width': "100"}},
				{label: '赠送金余额', prop: 'presentfee', attrs: {'min-width': '110', 'sortable': 'custom'}},
				{label: '总卡扣金额', prop: 'consumefee', attrs: {'min-width': '110', 'sortable': 'custom'}},
				{label: '总充值金额', prop: 'sumcardfee', attrs: {'min-width': '110', 'sortable': 'custom'}},
				{label: '开卡日期', prop: 'opendate', attrs: {width: '100', 'sortable': 'custom'}},
				{label: '到期日期', prop: 'invaliddate', attrs: {width: '100', 'sortable': 'custom'}},
				{label: '最后消费日期', prop: 'lastconsumetime', attrs: {width: '120', 'sortable': 'custom'}},
				{label: '备注', prop: 'cardRemark', attrs: {width: '200', 'show-overflow-tooltip': true}},
			],
			cardClassList: [
				{label: '储值消费卡', id: '5'},
				{label: '计次消费卡', id: '1'},
				{label: '套餐消费卡', id: '2'},
				{label: '年卡消费卡', id: '3'},
				{label: '现金消费卡', id: '4'}
			],
			invalidDateTypeList,
			auxiliaryCardTypes: []
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
		// this.onNomalSearch();
		// if (this.isAuxiliaryShop) {
		// 	this.getAuxiliaryData(parseInt(this.shopId));
		// }
		if (this.isSingleShop) {
			const shopIds = [parseInt(this.shopId)];
			this.filterData.shopids = shopIds;
			this.handleChangeShop(shopIds)
		}
	},
	computed: {
		cardTypeList() {
			let cardTypes = this.$eventBus.env.cardTypes;
			let {
				shopids,
				cardTypeId
			} = this.filterData;
			if (!cardTypes) return [];
			const TypeId = parseInt(cardTypeId);
			const isAuxiliary = (this.hasAuxiliary && shopids.length === 1) || this.isAuxiliaryShop;
			if (isAuxiliary) {
				cardTypes = this.auxiliaryCardTypes;
			}
			return cardTypes.filter(item => {
				const CurrentCardType = parseInt(item.cardtype);
				const CurrentTimeFlag = parseInt(item.timeflag);
				const MatchCardType = !TypeId || (TypeId === 5 && CurrentCardType === 1 && [1, 2, 3].indexOf(CurrentTimeFlag) === -1) || (CurrentCardType === 1 && CurrentTimeFlag === TypeId) || (TypeId === 4 && CurrentCardType !== 1);
				if (isAuxiliary) return MatchCardType;
				const shopIdList = item.shopids.split(',').filter(item => !!item);
				const MatchShop = LodashSome(shopIdList, item => {
					return !shopids || !shopids.length || shopids.indexOf(parseInt(item)) !== -1;
				});
				return MatchShop && MatchCardType;
			})
		},
		pageNumber() {
			return this.filterData.pageNumber + 1;
		},
		postData() {
			const {
				pageSize,
				pageNumber,
				shopids,
				sex,
				cardBalance, // 卡余额
				createCardTime, // 开卡日期
				cardTypeId, // 卡类型
				cardType, // 卡名称
				presentFee, // 赠金余额
				lastConsumeTime, // 最后消费日期
				customeTotal, // 总卡扣
				cumulative, // 累计充值
				type, // 有效类型
				invalidDate, // 有效时间,
				searchType,
				keywordSearch,
				sortField,
				sortType,
			} = this.currentFilterData;
			let postData = {
				pageNumber,
				pageSize,
				shopids: (shopids && shopids.length) ? shopids : undefined,
				sex,
				cardTypeId,
				cardType,
				searchType,
				keywordSearch,
				type,
				sortField,
				sortType,
			};
			if (cardBalance) {
				const [cardFeeBegin, cardFeeEnd] = cardBalance;
				postData = Object.assign(postData, {cardFeeBegin, cardFeeEnd});
			}
			if (presentFee) {
				const [presentfeeBegin, presentfeeEnd] = presentFee;
				postData = Object.assign(postData, {presentfeeBegin, presentfeeEnd});
			}
			if (createCardTime) {
				const [openDateBegin, openDateEnd] = createCardTime;
				postData = Object.assign(postData, {openDateBegin, openDateEnd});
			}
			if (lastConsumeTime) {
				const [lastConsumeDateBegin, lastConsumeDateEnd] = lastConsumeTime;
				postData = Object.assign(postData, {lastConsumeDateBegin, lastConsumeDateEnd});
			}
			if (cumulative) {
				const [sumCardFeeBegin, sumCardFeeEnd] = cumulative;
				postData = Object.assign(postData, {sumCardFeeBegin, sumCardFeeEnd});
			}
			if (customeTotal) {
				const [consumeFeesBegin, consumeFeesEnd] = customeTotal;
				postData = Object.assign(postData, {consumeFeesBegin, consumeFeesEnd});
			}
			if (type === 3 && invalidDate) {
				const [userdefinedDateBegin, userdefinedDateEnd] = invalidDate;
				postData = Object.assign(postData, {userdefinedDateBegin, userdefinedDateEnd});
			}
			return postData;
		},
	},
	methods: {
		generatePostData() {
			const postData = {};
			const { searchType } = this.postData;
			if (searchType === 1) {
				for (let key in this.postData) {
					const value = this.postData[key];
					if ((!value && !IsNumber(value)) || value.length === 0 || key === 'keywordSearch') continue;
					postData[key] = value;
				}
			} else {
				const {
					keywordSearch,
					pageNumber,
					pageSize,
					sortField,
					sortType,
				} = this.postData;
				postData.keywordSearch = keywordSearch;
				postData.pageSize = pageSize;
				postData.pageNumber = pageNumber;
				postData.sortField = sortField;
				postData.sortType = sortType;
			}
			if (this.shopList.length === 1) {
				postData.shopids = [this.shopList[0].id]
			}
			postData.searchType = searchType;
			return postData;
		},
		onPrintOrExcel() {
			const postData = this.generatePostData();
			const Max = 65000;
			if (this.contentData.count > Max) {
				this.$message.warning(`一次最多可导出 ${Max} 条数据，请筛选后导出`);
				return;
			}
			const loading = this.$loading({
				lock: true,
				text: '正在加载中...',
			});
			
			this.$http.post('/member!memberAdvancedSearch.action', {
				...postData,
				pageSize: 99999,
				pageNumber: 0,
				parentShopId: this.parentShopId,
			}, {
				responseType: 'blob'
			}).then(res => {
				const resData = res.data;
				if (resData.type.indexOf('html') !== -1) return;
				let a = document.createElement('a');
				a.download = '会员卡查询.xls';
				a.href = URL.createObjectURL(res.data);
				document.body.append(a);
				a.click();
				loading.close();
				a.remove();
			})
		},
		showAdvancedFilter() {
			this.dialogVisible = true;
		},
		onNomalSearch() {
			const { keywordSearch } = this.filterData;
			const errorMsg = this.validKeywordError(keywordSearch)
			if (errorMsg) {
				this.$message.warning(errorMsg);
				return;
			}
			this.filterData.searchType = 0;
			this.onSearch();
		},
		onAdvancedFilter() {
			this.updateViewSearchContent(this.filterData);
			if (this.advancedSearchTagList.length === 0 && !this.isSingleShop) {
				if (this.dialogVisible === false) {
					this.dialogVisible = true;
				} else {
					this.$message.warning('请至少选择一个筛选条件！')
				}
				return;
			}
			const { invalidDate, type } = this.filterData;
			if (type === 3 && !invalidDate) {
				this.$message.warning('请选择有效期自定义时间');
				return;
			}
			this.dialogVisible = false;
			this.filterData.searchType = 1;
			this.onSearch();
		},
		handleSortChange({column, prop, order}) {
			this.filterData.sortField = prop || undefined;
			this.filterData.sortType = order ? (order === 'descending' ? 1 : 0) : undefined;
			this.onSearch();
		},
		onSearch() {
			this.filterData.pageNumber = 0;
			this.currentFilterData = JSON.parse(JSON.stringify(this.filterData));
			this.getData();
		},
		getData() {
			this.tableLoading = true;
			this.startSearchTipsTimeout();
			const postData = this.generatePostData();
			this.$http.post('/member!memberAdvancedSearch.action', {
				...postData,
				parentShopId: this.parentShopId,
			}).then(res => {
				this.clearSearchTipsTimeout();
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content.forEach(item => {
						const {
							opendate,
							invaliddate,
							sex,
							cardtype,
							timeflag,
							lastconsumetime,
							mobile,
							cardtypename,
							cardtypeid,
							shopid,
						} = item;
						const shopData = this.findShopById(shopid) || {};
						item.shopname = shopData.osName;
						item.opendate = opendate ? Dayjs(opendate).format(DateFormat) : '';
						item.invaliddate = invaliddate ? Dayjs(invaliddate).format(DateFormat) : '';
						item.lastconsumetime = this.lastconsumetimeDecorator(lastconsumetime);
						item.sex = this.getSexName(sex);
						if (cardtypeid && !cardtypename) {
							item.cardtypename = '卡已删除'
						}
						let cardClassName = cardtype ? '现金消费卡' : '';
						const CardMap = {
							1: '计次消费卡',
							2: '套餐消费卡',
							3: '年卡消费卡'
						}
						if (cardtype  === '1') {
							cardClassName = CardMap[timeflag] || '储值消费卡';
						}
						item.cardClassName = cardClassName;
						item.mobile = this.mobileDecorator(mobile);
					})
					this.contentData = resData;
				}
			}).catch(() => {
				this.tableLoading = false;
				this.clearSearchTipsTimeout();
			})
		},
		handleChangePageSize(size) {
			this.filterData.pageSize = size;
			this.onSearch();
		},
		handleCurrentPageChange(size) {
			this.filterData.pageNumber = size - 1;
			this.currentFilterData = JSON.parse(JSON.stringify(this.filterData));
			this.getData();
		},
		getCurrentSelectCardData() {
			if (!this.filterData.cardType) return;
			const cardTypes = this.$eventBus.env.cardTypes;
			const cardTypeIndex = FindIndex(cardTypes, item => item.cardtypeid === this.filterData.cardType);
			if (cardTypeIndex === -1) return;
			const cardTypeData = cardTypes[cardTypeIndex];
			return cardTypeData;
		},
		handleChangeCardType(cardTypeId) {
			const cardTypeData = this.getCurrentSelectCardData();
			if (!cardTypeData || !cardTypeId) return;
			const {
				cardtype,
				timeflag
			} = cardTypeData;
			const CurrentCardType = parseInt(cardtype);
			const CurrentTimeFalg = parseInt(timeflag);
			const TypeId = parseInt(cardTypeId);
			switch (TypeId) {
				case 4:
					//  现金消费卡
					if (CurrentCardType === 1) {
						this.filterData.cardType = undefined;
					}
					break;
				case 5:
					// 储值消费卡
					if ([1, 2, 3].indexOf(CurrentTimeFalg) !== -1) {
						this.filterData.cardType = undefined;
					}
					break;
				default:
					if (CurrentTimeFalg !== cardTypeId) {
						this.filterData.cardType = undefined;
					}
					break;
			}
		},
		handleChangeShop(ids) {
			let hasAuxiliary = LodashSome(ids, shopId => {
				const shopData = this.findShopById(shopId);
				return shopData && parseInt(shopData.softgenre) === 3;
			})
			if (hasAuxiliary) {
				const lastShopId = ids[ids.length - 1];
				ids = [lastShopId];
				const shopData = this.findShopById(lastShopId) || {};
				this.filterData.shopids = ids;
				if (shopData.softgenre === '3') {
					this.getAuxiliaryData(lastShopId);
				} else {
					hasAuxiliary = false;
				}
			}
			this.hasAuxiliary = hasAuxiliary;
			const cardTypeData = this.getCurrentSelectCardData();
			if (!cardTypeData || !ids || !ids.length) {
				this.filterData.cardType = undefined;
				return;
			};
			const cardShopids = cardTypeData.shopids.split(',').filter(item => !!item)
			const match = LodashSome(cardShopids, item => ids.indexOf(parseInt(item)) !== -1);
			if (!match) {
				this.filterData.cardType = undefined;
			}
		},
		cancelDeleteCard() {
			document.body.click();
		},
		onDeleteCard({id, shopid: shopId}) {
			const postData = {
				id,
				shopId,
				parentShopId: this.parentShopId
			};
			DeleteConfirm.open({postData, requestUri: '/member!memberCardDel.action'}).then(() => {
				this.getData();
			});
		},
		sortByCardfee(a, b) {
			return a.cardfee - b.cardfee;
		},
		sortByPresentfee(a, b) {
			return a.presentfee - b.presentfee;
		},
		sortByConsumefee(a, b) {
			return a.consumefee - b.consumefee;
		},
		sortBySumcardfee(a, b) {
			return a.sumcardfee - b.sumcardfee;
		},
		showHighQualityCustDialog() {
			this.highQualityCustDialogVisible = true;
		}
	}
}
</script>

<style>
	.card_search {
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
		& .el-form-item--mini.el-form-item,
		& .el-form-item--small.el-form-item {
			margin-bottom: 15px;
		}
	}
	.card_search .el-dialog__title {
		font-size: 18px
	}
	.card_search .el-dialog__header {
		padding: 14px 18px 0;
	}
	.card_search .el-dialog .el-select {
		width: 235px;
	}
	.card_search .el-pagination {
		margin: 10px -10px 0;
	}
	.card_search-filter .el-input-group__append {
		background-color: #0ae;
		border-color: #0ae;
		color: #fff;
	}
	.card_search-filter .advanced_bar .el-input-group__append {
		background-color: #67c23a;
		border-color: #67c23a;
	}
	.card_search .el-input--small,
	.card_search .el-form-item__label,
	.card_search .el-radio__label {
		font-size: 12px;
	}
	.card_search .el-radio + .el-radio {
		margin-left: 10px;
	}
	.card_search .el-input__inner {
		color: #222;
	}
	.card_search .el-range-editor--mini.el-input__inner {
		width: 235px;
	}
	.card_search .el-date-editor .el-range-input {
		padding-left: 6px;
		text-align: left;
	}
	.card_search .el-date-editor .el-range-separator {
		min-width: 20px;
		color: #999;
	}
	.card_search .el-row {
		margin-bottom: 15px;
	}
	.card_search .el-radio-group .el-radio:last-of-type {
		margin-right: 15px;
	}
	.table_tips {
		float: left;
		overflow: hidden;
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
	.table_tips_item-value.table_tips_item-value--important {
		color: #EF5C5C;
	}
	.card_search .invalid_daterange_form_item {
		display: inline-block;
		margin: 0 5px;
	}
	.invalid_daterange_form_item > span {
		font-size: 12px;
	}
	.invalid_daterange_form_item > span:first-child {
		margin-right: 5px;
	}
	.invalid_daterange_form_item > span:last-child {
		margin-left: 5px;
	}
</style>
