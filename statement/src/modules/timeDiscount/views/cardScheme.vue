<template>
	<div id="schemeDetail">
		<h2 class="title" v-html="cardDetailTitle"></h2>
		<div class="formBox">
			<div class="form-item">
				<div class="form-title">设置</div>
				<amCollapse v-show="schemeList.length" :listData="schemeList" :cardTypeId="cardTypeId" @onReset="getCardTypeAdvanceConfig"></amCollapse>
			</div>
		</div>
		<div class="footer" v-show="schemeList.length" v-if="!isEdit">
			<el-button type="primary" @click="editCardTypeAdvanceConfig">保存配置</el-button>
		</div>
		<amDialog v-model="bindCardFlag" title="绑定会员卡">
			<el-table
				v-loading="bindCardLoading"
				:data="bindCardTableData"
				tooltip-effect="dark"
				border
				size="mini"
				height="350"
				@selection-change="handleSelectionChange">
				<el-table-column
				type="selection"
				width="55">
				</el-table-column>
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
				<el-button @click="()=>{ this.bindCardFlag = false; }">取消</el-button>
				<el-button type="primary" @click="onBindCardClick">确定</el-button>
			</div>
		</amDialog>
	</div>
</template>

<script>
import Api from "@/api";
import MetaDataMixin from "../mixins/meta-data";
import amDialog from "../components/dialog/index";
import amTree from "../components/tree/index";
import amCollapse from "../components/collapse/scheme";
import amShop from "../components/shop/index";
import amDays from "../components/days/index";
import FindIndex from "lodash.findindex";

export default {
	name: "cardScheme",
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
			shopFlag: false, // 门店弹窗开关
			shopLoading: false, // 门店loading
			discountRuleFlag: false, // 折扣规则开关
			discountRuleLoading: false,
			discountRuleData: [],
			activeName: '',
			cardDetailTitle: '',
			schemeSelectVal: [],
			cardTypeId: '',
			cardTypeName: '',
			schemeList: [],
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
			apiUrl: {
				getCardTypeAdvanceConfig: '/discountRule!getCardTypeAdvanceConfig.action', // 查看单个方案
				getDiscountRuleList: '/discountRule!getDiscountRuleList.action',
				editDiscountRulePriority: '/discountRule!editDiscountRulePriority.action',
				getDiscountBySchemeId: '/discountRule!getDiscountBySchemeId.action', // 根据方案来查规则
				editCardTypeAdvanceConfig: '/discountRule!editCardTypeAdvanceConfig.action', // 提交方案
			}
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
			this.cardTypeId = this.$route.query && this.$route.query.cardTypeId || this.$route.params && this.$route.params.cardTypeId;
			this.cardTypeName = this.$route.query && this.$route.query.cardTypeName || this.$route.params && this.$route.params.cardTypeName;
			if (this.cardTypeId) {
				await this.getCardTypeAdvanceConfig();
			}
		} catch (e) {
			console.log(e);
		}
	},
	methods: {
		// 查看详情
		getCardTypeAdvanceConfig() {
			this.loading = true;
			this.$http.post(this.apiUrl.getCardTypeAdvanceConfig, {
				parentShopId: this.parentShopId,
				cardTypeId: this.cardTypeId,
				shopId: this.shopId
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
		getDiscountBySchemeId(schemeId) {
			let arr = []
			this.loading = true;
			this.$http.post(this.apiUrl.getDiscountBySchemeId, {
				schemeId: schemeId,
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
					this.$message({
						type: 'success',
						message: '操作成功'
					})	
				}
			});
		},
		render(content) {
			let schemeDetail = content.schemes,
				schemeShop = content.schemeShop;
			if (!schemeDetail.length && !schemeShop.length) return;
			this.cardDetailTitle = '修改 <span style="color:#333;">' + this.cardTypeName + '</span> 高级折扣方案';
			let schemeObj = {},
				schemeList = [];
			schemeDetail.forEach((item, key) => {
				let obj = {};
				if (!schemeObj[item.schemeId]) {
					obj = {
						tableShow: false,
						schemeId: item.schemeId,
						schemeName: item.schemeName,
						remark: item.remark,
						discountRules: [{
							discountRuleId: item.discountRuleId,
							name: item.discountRuleName,
							serviceItemJson: item.serviceItemJson,
							depotJson: item.depotJson,
							dateJson: item.dateJson,
							priority: item.priority
						}]
					}
					schemeList.push(obj);
					schemeObj[item.schemeId] = true;
				} else {
					if (schemeList.length) {
						schemeList.forEach(v => {
							if (v.schemeId === item.schemeId) {
								v.discountRules.push({
									discountRuleId: item.discountRuleId,
									name: item.discountRuleName,
									serviceItemJson: item.serviceItemJson,
									depotJson: item.depotJson,
									dateJson: item.dateJson,
									priority: item.priority
								});
							}
						});
					}
				}
			});

			schemeList.forEach(item => {
				item.discountRules = item.discountRules.sort((a, b) => {
					return b.priority - a.priority;
				}) || [];	
			});
			this.schemeList = schemeList;
			console.log(schemeList);
		},
		// 方案校验
		schemeCheck() {
			if (this.schemes.length === 0) {
				this.$message({
					type: 'error',
					message: '请设置折扣'
				})
				return false;
			}
			return true;
		},
		// 处理数据
		changeData() {
			let schemes = [];
			this.schemeList.forEach(item => {
				let obj = {
					schemeId: item.schemeId,
					remark: item.remark,
					discountRuleIds: '',
				};
				if (item.discountRules.length) {
					item.discountRules.forEach(v => {
						if (!(v.discountRuleId || v.id)) return;
						obj.discountRuleIds += (v.discountRuleId || v.id) + ',';
					});
					obj.discountRuleIds = obj.discountRuleIds.substr(0, obj.discountRuleIds.length - 1);
					if (obj.discountRuleIds) {
						schemes.push(obj);
					}
				}
			});
			this.schemes = schemes;
		},
		// 提交方案
		editCardTypeAdvanceConfig() {
			this.changeData();
			if (!this.schemeCheck()) {
				return false;
			}
			let params = {
				cardTypeId: this.cardTypeId,
				schemes: this.schemes,
				parentShopId: this.parentShopId
			};
			this.loading = true;
			this.$http.post(this.apiUrl.editCardTypeAdvanceConfig, params)
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
