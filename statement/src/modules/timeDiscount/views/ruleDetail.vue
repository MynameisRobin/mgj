<template>
	<div id="ruleDetail" v-loading="loading">
		<h2 class="title">{{ ruleDetailTitle || '' }}</h2>
		<div class="applicationBox" v-show="discountRuleId && names.length">
			<h3 class="info-title">正在使用此规则的折扣方案</h3>
			<div class="schemeListBox">
				<el-row :gutter="20" class="scheme-row">
					<el-col :span="8" v-for="(item, index) in names" :key="index">
						<div class="schemeList">
							<am-icon class="icon" name="fanganbianji" @click.native="editScheme(item.schemeId)" v-if="!isEdit"></am-icon>
							<div class="info-title">{{ item.schemeName }}</div>
							<div class="info-card">{{ item.cardTypeName }}</div>
							<!-- <am-icon class="discount_plan" name="fanganbianji"></am-icon> -->
							<div class="discount_plan"></div>
						</div>
					</el-col>
				</el-row>
			</div>
		</div>
		<div class="formBox">
			<div class="form-item">
				<div class="form-title">名称</div>
				<el-input v-model="discountRuleName" class="name-text"></el-input>
			</div>
			<div class="form-item time-content">
				<div class="form-title">时段</div>
				<div class="underline"></div>
				<div class="form-content">
					<div class="form-line">
						<div class="content-line">
							<label class="label">时段</label>
							<el-switch
								v-model="dateJson.highChecked"
								active-text="高级"
								inactive-text="不限">
							</el-switch>
						</div>
						<el-collapse-transition>
							<div v-show="dateJson.highChecked">
								<div class="content-line">
									<el-checkbox v-model="dateJson.everyday" class="label">每天</el-checkbox>
									<el-time-picker
										class="everyDayInput"
										v-show="dateJson.everyday"
										v-model="startTime"
										size="small"
										value-format="HH:mm"
										format="HH:mm"
										placeholder="开始时间">
									</el-time-picker>
									<span class="font12" v-show="dateJson.everyday">至</span>
									<el-time-picker
										class="everyDayInput"
										v-show="dateJson.everyday"
										v-model="endTime"
										size="small"
										value-format="HH:mm"
										format="HH:mm"
										placeholder="结束时间">
									</el-time-picker>
								</div>
								<div class="content-line">
									<el-checkbox v-model="dateJson.weekly" class="label">每周</el-checkbox>
									<el-checkbox-group v-model="dateJson.weeklyData" class="weeklyData" v-if="dateJson.weekly">
										<el-checkbox label="一"></el-checkbox>
										<el-checkbox label="二"></el-checkbox>
										<el-checkbox label="三"></el-checkbox>
										<el-checkbox label="四"></el-checkbox>
										<el-checkbox label="五"></el-checkbox>
										<el-checkbox label="六"></el-checkbox>
										<el-checkbox label="日"></el-checkbox>
									</el-checkbox-group>
								</div>
								<div class="content-line">
									<el-checkbox v-model="dateJson.monthly" class="label">每月</el-checkbox>
									<amDays class="daysInput monthInput" :monthlyData="dateJson.monthlyData" v-if="dateJson.monthly" @asyncDays="asyncDays"></amDays>
								</div>
								<div class="content-line">
									<el-checkbox v-model="dateJson.assignDays">指定日期</el-checkbox>
									<el-date-picker
									 	class="daysInput assignInput"
										type="dates"
										value-format="yyyy-MM-dd"
										v-model="dateJson.assignDaysData"
										v-if="dateJson.assignDays"
										placeholder="选择一个或多个日期">
									</el-date-picker>
								</div>
							</div>
						</el-collapse-transition>
					</div>
				</div>
			</div>
			<!-- 内容 -->
			<div class="form-item">
				<div class="tabs">
					<el-tabs v-model="activeName" @tab-click="tabClick">
						<el-tab-pane label="内容" disabled></el-tab-pane>
						<el-tab-pane label="项目" name="service">
							<div class="form-content">
								<div class="content-line">
									<div class="line-left">
										<el-checkbox v-model="serviceItemJson.discountChecked" class="label">项目通用折扣</el-checkbox>
										<el-input size="mini" class="mini-input" @keyup.native="proving(serviceItemJson)" v-model="serviceItemJson.discount" :disabled="!serviceItemJson.discountChecked"></el-input>
										<span class="font12">折</span>
									</div>
									<div class="line-right">
										<a class="cursor" @click="openCardImport" v-if="!isEdit">从「项目卡级折扣/会员价设定」导入规则</a>
									</div>
								</div>
								<div class="content-line">
									<el-checkbox v-model="serviceItemJson.highChecked" class="label">高级</el-checkbox>
									<amTree ref="myTree" :data="serviceItemJson.highData" v-if="serviceItemJson.highChecked && serviceItemJson.highData.length > 0"></amTree>
								</div>
							</div>
						</el-tab-pane>
						<el-tab-pane label="卖品" name="depot">
							<div class="form-content">
								<div class="content-line">
									<div class="line-left">
										<el-checkbox v-model="depotJson.discountChecked" class="label">卖品通用折扣</el-checkbox>
										<el-input size="mini" class="mini-input" @keyup.native="proving(depotJson)" v-model="depotJson.discount" :disabled="!depotJson.discountChecked"></el-input>
										<span class="font12">折</span>
									</div>
									<div class="line-right">
										<a class="cursor" @click="openCardImport" v-if="!isEdit">从「项目卡级折扣/会员价设定」导入规则</a>
									</div>
								</div>
								<div class="content-line">
									<el-checkbox v-model="depotJson.highChecked" class="label">高级</el-checkbox>
									<amTree :data="depotJson.highData" v-if="depotJson.highChecked && depotJson.highData.length > 0"></amTree>
								</div>
							</div>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</div>
		<div class="footer">
			<el-button type="primary" @click="submit" v-if="!isEdit">保存配置</el-button>
		</div>
		<amDialog v-model="cardImportFlag" width="460px" title="选择要导入的会员卡" ref="amDialog">
			<el-form ref="cardImportForm" class="cardImportForm" :inline="false" :model="form" size="small" :label-position="'right'" v-loading="cardImportLoading">
				<!-- <el-form-item label="选择门店">
					<el-select v-model="importShopId" placeholder="请选择门店">
						<el-option v-for="(item, index) in shopList" :key="index" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item> -->
				<el-form-item label="关联会员卡">
					<el-select v-model="importCardTypeId" placeholder="请选择会员卡">
						<el-option v-for="(item, index) in cardList" :key="index" :label="item.cardTypeName" :value="item.cardTypeId"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="text-align:left;margin-left:72px;">
					<el-button type="primary" @click="importDiscountByCardTypeId">确定</el-button>
				</el-form-item>
			</el-form>
		</amDialog>
	</div>
</template>

<script>
import Api from "@/api";
import MetaDataMixin from "../mixins/meta-data";
import amDialog from "../components/dialog/index";
import amTree from "../components/tree/index";
import amDays from "../components/days/index";
import FindIndex from "lodash.findindex";
import { createHash } from 'crypto';
export default {
	name: "ruleDetail",
	mixins: [MetaDataMixin],
	components: {
		amDialog,
		amTree,
		amDays
	},
	data() {
		return {
			apiUrl: {
				addDiscountRule: '/discountRule!addDiscountRule.action',
				getDiscountRuleDetail: '/discountRule!getDiscountRuleDetail.action',
				getCardTypeAndOriDiscount: '/discountRule!getCardTypeAndOriDiscount.action',
				importDiscountByCardTypeId: '/discountRule!importDiscountByCardTypeId.action'
			},
			loading: false,
			schemes: '', // 查询已分配的方案
			cardImportFlag: false,	// 卡导入开关
			cardImportLoading: false,	// 卡导入loading
			ruleDetailTitle: '',
			activeName: 'service',
			discountRuleId: '',
			discountRuleName: '',	// 编辑的规则名称
			importCardTypeId: '',	// 导入的卡ID
			cardTypeId: '', // 从卡页面去设置进来
			schemeId: '', // 从方案页面去设置进来
			source: '', // 从方案新增进来时候会有schemeDetail标识
			// importShopId: '',	// 导入的门店ID
			cardList: [],	// 会员卡列表
			names: [], // 方案列表
			startTime: '',
			endTime: '',
			dateJson: {
				highChecked: false, // 0不限 1高级
				everyday: false, // 每天
				daysData: ["08:00", "10:00"],	// 每天几点到几点
				weekly: false,	// 每周
				weeklyData: [], // weeklyData: ['一', '二', '三', '四', '五', '六', '日'],
				monthly: false,	// 每月
				monthlyData: [],	// 每月几号数据
				assignDays: false,	// 指定日期
				assignDaysData: [],	// 指定日期数据
			},
			depotJson: {
				discountChecked: false,
				discount: '',
				highChecked: false,
				highData: []
			},
			serviceItemJson: {
				discountChecked: false,
				discount: '',
				highChecked: false,
				highData: []
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
			this.discountRuleId = this.$route.params && this.$route.params.discountRuleId || this.$route.query && this.$route.query.discountRuleId;
			this.cardTypeId = this.$route.params && this.$route.params.cardTypeId || '';
			this.schemeId = this.$route.params && this.$route.params.schemeId || '';
			this.source = this.$route.params && this.$route.params.source || '';
			this.serviceHighData = this.getServiceItem();
			this.depotHighData = this.getDepotItem();
			if (this.discountRuleId) {
				this.ruleDetailTitle = "修改折扣规则";
				await this.getDiscountRuleDetail();
			} else {
				this.ruleDetailTitle = "新增折扣规则";
				// 获取项目卖品
				this.serviceItemJson.highData = this.serviceHighData;
				this.depotJson.highData = this.depotHighData;
			}
		} catch (e) {
			console.log(e);
		}
	},
	watch: {
		'dateJson.daysData'(val) {
			console.log(val);
			if (val && val.length === 2) {
				this.startTime = val[0];
				this.endTime = val[1];
			}
		}
	},
	methods: {
		// 同步每月数据
		asyncDays(data) {
			this.dateJson.monthlyData = data.days || [];
		},
		// 渲染数据
		getDiscountRuleDetail() {
			this.loading = true;
			this.$http.post(this.apiUrl.getDiscountRuleDetail, {
				discountRuleId: this.discountRuleId,
				parentShopId: this.parentShopId
			})
			.then(res => {
				this.loading = false;
				if (!res) return console.log("数据异常"); 
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					if (!content) return false;
					this.render(content);
				}
			});
		},
		render(data) {
			let discountRule = data.discountRule;
			this.discountRuleName = discountRule.name;
			if (data.names && data.names.length) {
				this.names = data.names;
			}
			this.dateJson = JSON.parse(discountRule.dateJson);
			this.dateJson.weeklyData = this.dateJson.weeklyData.map(item => {
				return item = this.getDayToWeek(item);
			});
			let depotJson = JSON.parse(discountRule.depotJson);
			this.depotJson = this.getDepotHighData(depotJson);
			let serviceItemJson = JSON.parse(discountRule.serviceItemJson);
			this.serviceItemJson = this.getServiceHighData(serviceItemJson);
		},
		proving(data) {
			if (!data || !data.discount) return false; 
			data.discount = data.discount + '';
			data.discount = data.discount.replace(/[^\.\d]/g, '');
			if (data.discount > 10) {
				data.discount = 10;
			} else if (data.discount < 0) {
				data.discount = '';
			} else if (data.discount >= 0 && data.discount <= 10) {
				if (data.discount.indexOf('.') !== data.discount.length - 1) {
					data.discount = Math.floor(data.discount * 100) / 100;
				}
			} else {
				data.discount = '';
			}
		},
		// 导入卡的方法
		onCardImport(data) {
			// 打开项目折扣高级配置
			this.serviceItemJson.highChecked = true;
			this.$nextTick(() => {
				this.$refs.myTree.getData(data);
			});
			
		},
		// 修改方案
		editScheme(id) {
			this.$router.push({ name: "schemeDetail", params: { schemeId: id, source: 'ruleDetail', discountRuleId: this.discountRuleId } });
		},
		openCardImport() {
			this.cardImportFlag = true;
			if (!this.cardList.length) {
				this.getCardTypeAndOriDiscount();
			}
		},
		// 查询卡的列表
		getCardTypeAndOriDiscount() {
			this.loading = true;
			this.$http.post(this.apiUrl.getCardTypeAndOriDiscount, {
				parentShopId: this.parentShopId,
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
					this.cardList = content || [];
				}
			});
		},
		importDiscountByCardTypeId() {
			this.cardImportLoading = true;
			this.$http.post(this.apiUrl.importDiscountByCardTypeId, {
				cardTypeId: this.importCardTypeId,
				parentShopId: this.parentShopId
			})
			.then(res => {
				this.cardImportLoading = false;
				if (!res) return console.log("数据异常"); 
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					if (!content.length) {
						this.$message({
							type: 'error',
							message: '该卡没有可以导入的规则'
						});
						return false;
					}
					this.onCardImport(content);
					this.cardImportFlag = false;
					this.$message({
						type: 'success',
						message: '导入成功'
					});
				}
			});
		},
		// 处理数据
		changeData() {
			let dateJson = JSON.parse(JSON.stringify(this.dateJson)) || {},
				depotJson = JSON.parse(JSON.stringify(this.depotJson)) || {},
				serviceItemJson = JSON.parse(JSON.stringify(this.serviceItemJson)) || {};

			if ( dateJson.weeklyData.length > 0 ) {
				let weeklyData = [];
				dateJson.weeklyData.forEach(item => {
					weeklyData.push(this.getWeekToDay(item));
				});
				dateJson.weeklyData = weeklyData.sort();
			}
			let serviceHighData = [], 
				depotHighData = [];
			if (serviceItemJson.highData.length > 0) {
				serviceItemJson.highData.forEach(item => {
					let serviceSub = [];
					if (item.sub.length > 0) {
						item.sub.forEach(v => {
							if (v.rule > 0) {
								serviceSub.push({
									id: v.id,
									rule: v.rule,
									ruleType: v.ruleType
								});
							}
						});
					}
					serviceHighData.push({
						id: item.id,
						rule: item.rule,
						ruleType: item.ruleType,
						sub: serviceSub
					})
				});
				serviceItemJson.highData = serviceHighData;
			}
			if (depotJson.highData.length > 0) {
				depotJson.highData.forEach(item => {
					let depotSub = [];
					if (item.sub.length > 0) {
						item.sub.forEach(v => {
							if (v.rule > 0) {
								depotSub.push({
									id: v.id,
									rule: v.rule,
									ruleType: v.ruleType
								});
							}
						});
					}
					depotHighData.push({
						id: item.id,
						rule: item.rule,
						ruleType: item.ruleType,
						sub: depotSub
					})
				});
				depotJson.highData = depotHighData;
			}
			let params = {
				id: this.discountRuleId,
				name: this.discountRuleName,
				parentShopId: this.parentShopId,
				dateJson: JSON.stringify(dateJson),
				depotJson: JSON.stringify(depotJson),
				serviceItemJson: JSON.stringify(serviceItemJson)
			};
			return params;
		},
		dateCheck() {
			let message = '',
				dateJson = this.dateJson;
			if (!this.discountRuleName) {
				message = '请输入名称';
				this.$message({
					type: 'error',
					message: message
				})
				return false;
			} else if (dateJson.highChecked) {
				// 如果选择高级的时间
				if (!dateJson.everyday && !dateJson.weekly && !dateJson.monthly && !dateJson.monthly && !dateJson.assignDays) {
					message = '请选择一个时间规则';
					this.$message({
						type: 'error',
						message: message
					})
					return false;
				} else {
					if (dateJson.everyday) {
						if (dateJson.daysData && dateJson.daysData.length === 2) {
							if (!dateJson.daysData[0]) {
								message = "请选择开始时间";
								this.$message({
									type: 'error',
									message: message
								})
								return false;
							} else if (!dateJson.daysData[1]) {
								message = "请选择结束时间";
								this.$message({
									type: 'error',
									message: message
								})
								return false;
							}
						}
						if (dateJson.daysData && dateJson.daysData.length !== 2 || !dateJson.daysData) {
							message = "请选择每天时间";
							this.$message({
								type: 'error',
								message: message
							})
							return false;
						}
					}
					if (dateJson.weekly) {
						if (dateJson.weeklyData.length === 0) {
							message = "请选择每周时间";
							this.$message({
								type: 'error',
								message: message
							})
							return false;
						}
					} 
					if (dateJson.monthly) {
						if (dateJson.monthlyData.length === 0) {
							message = "请选择每月日期";
							this.$message({
								type: 'error',
								message: message
							})
							return false;
						}
					}
					if (dateJson.assignDays) {
						if (dateJson.assignDaysData.length === 0) {
							message = "请选择指定日期";
							this.$message({
								type: 'error',
								message: message
							})
							return false;
						}
					}
				}
			}
			return true;
		},
		submit() {
			let self = this;
			this.dateJson.daysData = [this.startTime, this.endTime];
			// 时间校验
			if (!this.dateCheck()) {
				return false;
			}
			let params = this.changeData();
			console.log(params);
			this.loading = true;
			this.$http.post(this.apiUrl.addDiscountRule, params)
			.then(res => {
				this.loading = false;
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					self.$message({
						type: "success",
						message: "操作成功"
					});
					if (self.source === 'cardScheme') {
						self.$router.push({ name: 'cardScheme', params: {cardTypeId: self.cardTypeId}});
						return false;
					} 
					if (self.source === 'schemeDetail') {
						self.$router.push({ name: 'schemeDetail', params: {schemeId: self.schemeId}});
						return false;
					}
					if (self.modalFlag) {
						self.$router.push({ name: 'rule', params: {}});
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
	#ruleDetail{
		padding:30px 30px;
		.font12{
			font-size:12px;
		}
		.cursor{
			cursor: pointer;
			font-size:12px;
		}
		.el-input__inner{
			padding: 0 10px;
		}
		.el-range-editor--small .el-range-input,
		.el-range-editor--small .el-range-separator{
			font-size: 12px;
		}
		.el-date-editor .el-range-input{
			color: #333;
		}
		.el-tabs__item,.el-switch__label *{
			font-size: 12px;
		}
		.el-range-editor--small .el-range-separator {
			line-height: 30px;
		}
		.el-tabs__item.is-disabled{
			color:#333;
			font-size:14px;
			font-weight: bold;
		}
		.el-tree-node__content{
			height:36px;
		}
		.title{
			color:#909090;
			font-size:14px;
			margin-bottom: 22px;
		}
		.el-tree-node__expand-icon {
			font-size: 15px;
		}
		.treeBox .custom-tree-node {
			font-size: 12px;
		}
		.applicationBox{
			.info-title{
				margin-bottom: 8px;
				font-size:12px;
			}
			.schemeListBox{
				.scheme-row{
					margin-bottom: 10px;
					.schemeList{
						height:80px;
						padding:20px;
						margin-bottom: 20px;
						border: 1px solid #F0F1F5;
						background: #FAFCFF;
						position:relative;
						font-size:12px;
						.iconfont{
							position: absolute;
							cursor: pointer;
							color:#409EFF;
							right:20px;
							top:20px;
							z-index: 2;
							&:hover{
								color:#409eff;
							}
						}
						.discount_plan{
							position: absolute;
							width: 50px;
							height: 50px;
							right: 0;
							bottom: 0;
							z-index: 1;
							background: url(../assets/img/discount_plan.png) no-repeat;
							background-size: cover;
						}
						.info-title{
							font-weight: bold;
							font-size: 12px;
						}
						.info-card{
							color: #666;
						}
					}
				}
			}
		}
		.formBox{
			margin-top:30px;
			.form-item{
				&.time-content{
					width: 562px;
					overflow: hidden;
				}
				.name-text{
					width: 563px;
				}
				margin-bottom: 30px;
				.form-title{
					color:#333;
					font-size:14px;
					font-weight: bold;
					margin-bottom: 12px;
				}
				.el-input__inner{
					color: #333;
					font-size: 12px;
				}
				// 标题下划线
				.underline{
					height:1px;
					background: #DCDFE6;
				}
				.form-content{
					margin-top: 10px;
					.content-line{
						line-height: 34px;
						font-size:14px;
						margin-top: 10px;
						overflow: hidden;
						.day-picker{
							width: 455px;
						}
						.el-input__inner{
							color: #333;
						}
						.el-checkbox__label{
							height: 30px;
							line-height: 30px;
						}
						.line-left{
							line-height: 28px;
							float: left;
						}
						.line-right{
							line-height: 28px;
							float: right;
						}
						.mini-input{
							width:60px;
							display: inline-block;
							margin-right:5px;
						}
						.label{
							width: 82px;
							color:#666;
							font-size: 12px;
							margin-right:20px;
						}
						.weeklyData{
							min-width: 455px;
							height: 32px;
							line-height: 32px;
							border: 1px solid #dcdfe6;
							padding: 0 10px;
							display: inline-block;
							border-radius: 4px;
							.el-checkbox{
								.el-checkbox__label{
									color: #333;
								}
							}
						}
						.everyDayInput {
							width: 217px;
							.el-input__inner{
								padding-left: 30px;
							}
						}
						.daysInput{
							width: 455px;
							height: 32px;
							display: inline-block;
							color: #333;
							font-size: 12px;
							.el-input--small{
								font-size: 12px;
							}
						}
						.monthInput{
							.el-input__inner{
								padding-left: 30px;
							}
						}
						.assignInput{
							.el-input__inner{
								padding-left: 30px;
							}
						}
					}
				}
			}
		}
		.el-tabs__nav-wrap:after{
			height: 1px;
		}
		.cardImportForm {
			.el-input__inner {
				width: 280px;
			}
		}
	}
</style>
