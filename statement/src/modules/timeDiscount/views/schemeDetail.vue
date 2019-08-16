<template>
	<div id="schemeDetail" v-loading="loading">
		<h2 class="title">{{ schemeDetailTitle || '' }}</h2>
		<div class="formBox">
			<div class="form-item">
				<div class="form-title">名称</div>
				<el-input v-model="schemeName" class="nameInput"></el-input>
			</div>
			<div class="form-item">
				<div class="form-title">设置</div>
				<div class="btnBox">
					<el-button type="default" @click="addCardList" class="bind-card">绑定会员卡</el-button>
					<span class="bind-tip"><am-icon class="icon" name="info"></am-icon>请选择需要配置折扣的会员卡</span>
				</div>
				<amCollapse v-show="cardList.length" :listData="cardList" :schemeId="schemeId" :isEdit="isEdit"></amCollapse>
			</div>
		</div>
		<div class="shopBox" v-show="softgenre === '0' && cardList.length">
			<amShop :shopList="shopList" :shops="shops" :shopNames="shopNames" @getShopData="getShopData" :shopId="shopId" :parentShopId="parentShopId" :schemeId="schemeId"></amShop>
		</div>
		<div class="footer" v-show="cardList.length" v-if="!isEdit">
			<el-button type="primary" @click="addScheme">保存配置</el-button>
		</div>
		<amDialog v-model="bindCardFlag" title="绑定会员卡" class="cardModal">
			<el-table
				class="cardTable"
				ref="multipleTable"
				v-loading="bindCardLoading"
				:data="bindCardTableData"
				tooltip-effect="dark"
				border
				size="mini"
				height="350"
				@selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column v-for="(item, index) in bindCardColumnData" :key="index" :width="item.width" :label="item.label">
					<template slot-scope="props">
						<span v-if="item.index === 'cardType'" class="cardType">
							{{ getCardName(props.row) }}
						</span>
						<span v-else-if="item.index === 'discount' || item.index === 'buyDiscount'">
							{{ props.row[item.index] === "0" ? '- -' : props.row[item.index] }}
						</span>
						<span v-else>{{ props.row[item.index] }}</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="footer">
				<el-button class="button" @click="()=>{ this.bindCardFlag = false; }">取消</el-button>
				<el-button class="button" type="primary" @click="onBindCardClick">确定</el-button>
			</div>
		</amDialog>
	</div>
</template>

<script>
import Api from "@/api";
import MetaDataMixin from "../mixins/meta-data";
import amDialog from "../components/dialog/index";
import amTree from "../components/tree/index";
import amCollapse from "../components/collapse/card";
import amShop from "../components/shop/index";
import amDays from "../components/days/index";
import FindIndex from "lodash.findindex";

export default {
	name: "schemeDetail",
	mixins: [MetaDataMixin],
	components: {
		amShop,
		amDialog,
		amTree,
		amDays,
		amCollapse
	},
	data() {
		return {
			loading: false,
			discountRuleFlag: false, // 折扣规则开关
			discountRuleLoading: false,
			discountRuleData: [],
			discountColumnData: [
				{
					index: 'name',
					width: '',
					label: '折扣规则名称'
				},
				{
					index: 'dateJson',
					width: '',
					label: '折扣时段',
				},
				{
					index: 'content',
					width: '',
					label: '折扣内容',
				},
				{
					index: 'priority',
					width: '100',
					label: '优先级',
				},
				{
					index: 'opeartion',
					width: '100',
					label: '操作',
				},
			],
			editTextList: [
				{
					name: "fanganshanchu",
					title: "删除",
					function: this.onDelete
				},
				{
					name: "fanganfuzhi",
					title: "复制",
					function: this.onCopy
				}
			],
			sortList: [
				{
					name: "top",
					title: "升序",
					function: this.onUp
				},
				{
					name: "bottom",
					title: "降序",
					function: this.onDown
				}
			],
			bindCardFlag: false,
			bindCardLoading: false,
			bindCardTableData: [],
			bindCardColumnData: [
				{
					index: 'cardTypeName',
					label: '卡名称',
					width: '',
				},
				{
					index: 'cardType',
					label: '卡类型',
					width: '',
				},
				{
					index: 'discount',
					label: '项目折扣',
					width: '',
				},
				{
					index: 'buyDiscount',
					label: '卖品折扣',
					width: '',
				},
			],
			apiUrl: {
				getSchemeDetail: '/discountRule!getSchemeDetail.action', // 查看单个方案
				getCardTypeAndOriDiscount: '/discountRule!getCardTypeAndOriDiscount.action', // 查看会员卡列表
				getDiscountRuleList: '/discountRule!getDiscountRuleList.action',
				editDiscountRulePriority: '/discountRule!editDiscountRulePriority.action',
				getCardTypeNewDiscount: '/discountRule!getCardTypeNewDiscount.action', // 根据卡来查规则
				addScheme: '/discountRule!addScheme.action', // 提交方案
			},
			activeName: '',
			schemeDetailTitle: '',
			discountRuleId: '',
			source: '',
			cardTypeId: '',
			schemeId: '',
			schemeName: '',
			shopNames: '',
			shopIds: '',
			shops: '',
			message: '',
			cardSelectVal: [],
			cardList: []
		};
	},
	async mounted() {
		try {
			let res = await Api.getMetaData();
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.$eventBus.env = {
					...content
				}
			}
			this.schemeId = this.$route.params && this.$route.params.schemeId || this.$route.query && this.$route.query.schemeId;
			this.source = this.$route.params && this.$route.params.source || '';
			this.cardTypeId = this.$route.params && this.$route.params.cardTypeId || '';
			this.discountRuleId = this.$route.params && this.$route.params.discountRuleId || '';
			if (this.schemeId) {
				this.schemeDetailTitle = "修改折扣方案";
				await this.getSchemeDetail();
			} else {
				this.schemeDetailTitle = "新增折扣方案";
			}
		} catch (e) {
			console.log(e);
		}
	},
	methods: {
		getShopData(data) {
			this.shops = data.shops;
			this.shopNames = data.shopNames;
		},
		getCardName(data) {
			// timeflag cardtype
			// 储值卡 0  1
			// 计次卡 1  1
			// 套餐卡 2  1
			// 年卡   3  1
			// 资格卡 0  2
			let timeflag = data.timeflag + '',
				cardtype = data.cardtype + '';
			let str = '';
			if (timeflag === '0' && cardtype === "1") {
				str = '储值卡';
			} else if (timeflag === '1' && cardtype === "1") {
				str = '计次卡';
			} else if (timeflag === '2' && cardtype === "1") {
				str = '套餐卡';
			} else if (timeflag === '3' && cardtype === "1") {
				str = '年卡';
			} else if (timeflag === '0' && cardtype === "2") {
				str = '资格卡';
			}
			return str;
		},
		getShopNameById(schemeShop) {
			let shops = [];
			if (schemeShop.length > 0) {
				let shops = [];
				let shopNames = [];
				this.shopList.forEach(item => {
					schemeShop.forEach(v => {
						if (item.id === v.shopId - 0) {
							shopNames.push(item.shopName);
							shops.push(item.id);
						}
					});
				});
				this.shopNames = shopNames.join('，');
				this.shops = shops.join(',');
			}
		},
		getSchemeDetail() {
			this.loading = true;
			this.$http.post(this.apiUrl.getSchemeDetail, {
				parentShopId: this.parentShopId,
				id: this.schemeId
			})
			.then(res => {
				this.loading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					this.render(content);					
				}
			});
		},
		async addCardList() {
			this.bindCardFlag = true;
			if (this.bindCardTableData.length === 0) {
				await this.getCardTypeAndOriDiscount();
			}
			this.selectCardList();
		},
		selectCardList() {
			let rows = [];
			if (this.cardList.length > 0 && this.bindCardTableData.length > 0) {
				this.bindCardTableData.forEach(item1 => {
					this.cardList.forEach(item => {
						if (item.cardTypeId === item1.cardTypeId) {
							rows.push(item1);
						}
					});
				});
			}
			if (rows.length > 0) {
				this.$nextTick(() => {
					rows.forEach(row => {
						this.$refs.multipleTable.toggleRowSelection(row, true);
					});
				});
			}
		},
		getCardTypeAndOriDiscount() {
			this.bindCardLoading = true;
			this.$http.post(this.apiUrl.getCardTypeAndOriDiscount, {
				parentShopId: this.parentShopId,
				shopId: this.shopId
			})
			.then(res => {
				this.bindCardLoading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					this.bindCardTableData = content || [];
				}
			});
		},
		getCardTypeNewDiscount(cardTypeIds) {
			let arr = [];
			this.loading = true;
			this.$http.post(this.apiUrl.getCardTypeNewDiscount, {
				cardTypeIds: cardTypeIds,
				schemeId: this.schemeId,
				parentShopId: this.parentShopId
			})
			.then(res => {
				this.loading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					let sortContent = content.sort((a, b) => {
						return b.priority - a.priority;
					}) || [];
					
					this.cardSelectVal.forEach(v => {
						let obj = {
							cardTypeId: v.cardTypeId,
							cardTypeName: v.cardTypeName,
							remark: v.remark,
							tableShow: false,
							discountRules: []
						};
						sortContent.forEach(item => {
							if (item.cardTypeId === v.cardTypeId) {
								obj.discountRules.push({
									id: item.id,
									dateJson: item.dateJson,
									name: item.name,
									priority: item.priority,
									serviceItemJson: item.serviceItemJson,
									depotJson: item.depotJson
								})
							}
						});
						arr.push(obj);
					});
					this.cardList = arr;
				}
			});
		},
		handleSelectionChange(val) {
			this.cardSelectVal = val;
		},
		// 确认绑定卡
		onBindCardClick() {
			this.bindCardFlag = false;
			if (this.cardSelectVal.length === 0) {
				this.cardList = [];
				return false;
			}; 
			let arr = [];
			this.cardSelectVal.forEach(v => {
				let obj = {
					cardTypeId: v.cardTypeId,
					cardTypeName: v.cardTypeName,
					remark: v.remark,
					tableShow: false,
					discountRules: []
				};
				if (this.cardList.length > 0) {
					this.cardList.forEach(item => {
						if (v.cardTypeId === item.cardTypeId) {
							obj.discountRules = item.discountRules;
							obj.tableShow = item.tableShow;
							obj.remark = item.remark;
						}
					})
				}
				arr.push(obj);
			});
			this.cardList = arr;
		},
		render(content) {
			let schemeDetail = content.schemeDetail,
				schemeShop = content.schemeShop;
			if (schemeDetail.length === 0 && schemeShop.length === 0) return;
			this.schemeName = schemeShop[0].schemeName;
			if (schemeShop && schemeShop.length > 0) {
				// 获取shopIds
				this.getShopNameById(schemeShop);
			}

			let obj = {},
				cardTypeIds = [];
			schemeDetail.forEach((item, key) => {
				if (!item) return false;
				if (!obj[item.cardTypeId]) {
					item.discountRuleIds = [item.discountRuleId];
					obj[item.cardTypeId] = item;
				} else {
					if (obj[item.cardTypeId]['discountRuleIds'].indexOf(item.discountRuleId) === -1) {
						obj[item.cardTypeId]['discountRuleIds'].push(item.discountRuleId);
					}
				}
			});
			for (let key in obj) {
				cardTypeIds.push(key);
				this.cardSelectVal.push(obj[key]);
			}
			this.getCardTypeAndOriDiscount();
			this.getCardTypeNewDiscount(cardTypeIds);
		},
		// 方案校验
		schemeCheck() {
			let msg = '';
			if (!this.schemeName) {
				this.$message({
					type: 'error',
					message: '请输入方案名称'
				})
				return false;
			} else {
				if (this.message) {
					this.$message({
						type: 'error',
						message: this.message
					})
					return false;
				}
			}
			return true;
		},
		// 处理数据
		changeData() {
			this.message = '';
			let cardTypes = [];
			this.cardList.forEach(item => {
				let obj = {
					cardTypeId: item.cardTypeId,
					remark: item.remark,
					discountRuleIds: '',
				};
				if (!item.remark) {
					this.message = '请填写备注';
					return false;
				}
				if (item.discountRules.length) {
					item.discountRules.forEach(v => {
						obj.discountRuleIds += v.id + ',';
					});
					obj.discountRuleIds = obj.discountRuleIds.substr(0, obj.discountRuleIds.length - 1);
				} else {
					this.message = '请设置折扣规则';
					return false;
				}
				cardTypes.push(obj);
			});
			this.cardTypes = cardTypes;
		},
		// 提交方案
		addScheme() {
			this.changeData();
			if (!this.schemeCheck()) {
				return false;
			}
			let shopIds = this.shopId + '';
			if (this.softgenre === "0") {
				shopIds = this.shops;
			}
			let params = {
				schemeId: this.schemeId,
				schemeName: this.schemeName,
				cardTypes: this.cardTypes,
				shopIds: shopIds, // '28101,28103',
				parentShopId: this.parentShopId
			};
			this.loading = true;
			this.$http.post(this.apiUrl.addScheme, params)
			.then(res => {
				this.loading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					this.$message({
						type: 'success',
						message: '保存成功'
					});
					if (this.source === "cardScheme") {
						this.$router.push({ name: 'cardScheme', params: {cardTypeId: this.cardTypeId}});
						return false;
					}
					if (this.source === "ruleDetail" || this.discountRuleId) {
						this.$router.push({ name: 'ruleDetail', params: {discountRuleId: this.discountRuleId}});
						return false;
					}
					if (this.modalFlag) {
						this.$router.push({ path: 'scheme', params: {}});
						return false;
					}
					try {
						// 关闭弹窗
						const parentDocument = window.parent.document;
						const iframeBoxEl = parentDocument.querySelector('#customer_detail_box');
						const curClassName = iframeBoxEl.className;
						iframeBoxEl.className = ``;
						setTimeout(() => {
							parentDocument.location.reload();
						}, 500);
					}
					catch (e) {
						console.log(e);
					}
				}
			});
		}
	}
}
</script>

<style lang="less">
	#schemeDetail{
		h2.title{
			font-size:14px;
		}
		.nameInput{
			width: 563px;
			.el-input__inner{
				color: #333;
				font-size: 12px;
			}
		}
		.bind-card{
			border: 1px solid #409EFF;
			color: #409EFF;
			&:hover{
				background: #409EFF;
				color: #fff;
			}
		}
		.bind-tip{
			color: #999999;
			display: inline-block;
			margin-left: 20px;
		}
		padding:40px 30px;
		.font12{
			font-size:12px;
		}
		.el-tabs__item.is-disabled{
			color:#333;
			font-size:14px;
			font-weight: bold;
		}
		.el-tree-node__content{
			height:36px;
		}
		.el-checkbox__label{
			padding-left:20px;
		}
		.el-dialog__body{
			padding-top: 10px;
		}
		.title{
			color:#909090;
			font-size:16px;
			margin-bottom: 22px;
		}
		.form-item{
			margin-top: 20px;
			.form-title{
				color:#333;
				font-size:14px;
				font-weight: bold;
				margin-bottom: 12px;
			}
		}
		.shopBox{
			margin-top: 20px;
		}
		.footer{
			margin-top: 20px;
		}
		.isEdit{
			color: #d6d6d6;
			cursor: no-drop;
		}
		.cardModal{
			.footer{
				text-align: right;
			}
		}
	}
</style>
