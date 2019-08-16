<template>
	<div class="customer_lucky_money" v-loading="initLoading">
		<el-dialog title="发送红包" :visible.sync="dialogVisible" width="614px">
			<div class="lucky_money-box">
				<div
					class="lucky_money"
					v-for="(item, index) in templateList"
					:key="index"
					@click="handleClick(item)"
				>
					<am-icon class="icon_option unchecked" size="18px" name="unchecked" v-if="item.flag === 0"></am-icon>
					<am-icon
						class="icon_option checked"
						size="18px"
						style="color: #1890FF;"
						name="checked"
						v-show="item.flag === 1"
					></am-icon>
					<div class="content">
						<div class="firstLine">
							<div class="left">{{item.title}}</div>
							<div class="right">
								<span class="red">{{getMoneyShow(item)}}</span>
								<span>{{getValidTime(item)}}</span>
							</div>
						</div>
						<div class="lineContent">{{getCashContent(item)}}</div>
						<div class="lineContent">{{getMallContent(item)}}</div>
						<div class="lineContent shopsLineContent">{{getItemShops(item)}}</div>
					</div>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="onSubmit">确 定</el-button>
			</span>
		</el-dialog>
		<div class="lucky_money_header">
			<div class="title">红包</div>
			<el-form :inline="true">
				<el-form-item>
					<el-checkbox v-model="queryValidLuckyMoney" @change="onChange">仅查看有效红包</el-checkbox>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="sendLuckyMoney" v-if="hasSendLuckyMoneyPower">发送红包</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="lucky_money_content">			
			<mgj-table
				v-loading="tableLoading"
				tooltip-effect="dark"
				stripe
				border
				size="mini"
				height="calc(100vh - 132px)"
				:showHeader="false"
				:data="contentData.content">
				<el-table-column label="红包名称" min-width="190" show-overflow-tooltip>
					<template slot-scope="scope">
						<span style="float:left; width:88%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-right:4px;">{{scope.row.templateName}}</span>
						<el-popover placement="right" trigger="hover">
							<div style="color: #333; font-size: 12px; line-height: 1.4;" v-html="getLuckyMoneyConfig(scope.row)"></div>
							<am-icon style="float: right" class="icon_info" slot="reference" name="info"></am-icon>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column prop="money" label="红包金额" width=""></el-table-column>
				<el-table-column prop="billmoney" label="消费额" width=""></el-table-column>
				<el-table-column label="红包状态" min-width="150" show-overflow-tooltip>
					<template slot-scope="scope">
						<span :class="scope.row.status.className">{{scope.row.status.str}}</span>
						<!-- <el-button v-if="scope.row.status.str === '未使用'" class="verification" :disabled="scope.row.disabled" @click="handleVerification(scope.row)">核销</el-button> -->
						<el-popover
							v-if="userInfo.softgenre !== '0' && scope.row.status.str === '未使用'"
							placement="top"
							width="160">
							<p>确认核销？</p>
							<div style="text-align: right; margin: 0">
								<el-button size="mini" type="text" @click="hidePopover">取消</el-button>
								<el-button type="primary" size="mini" @click="handleVerification(scope.row)">确定</el-button>
							</div>
							<el-button class="verification" :disabled="scope.row.disabled" slot="reference">核销</el-button>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column prop="expiretime" label="有效期" min-width="185" :formatter="formatterExpiretime"></el-table-column>
				<el-table-column prop="createtime" label="发送时间" width="96"></el-table-column>
				<el-table-column prop="" label="来源" :formatter="formatterSenderName" min-width="150" show-overflow-tooltip></el-table-column>
				<div slot="empty">暂无数据</div>
			</mgj-table>
			<!-- 分页 -->
			<el-pagination
				v-if="contentData.count"
				background
				:pager-count="9"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryData.pageNumber + 1"
				:page-size="queryData.pageSize"
				:page-sizes="[10, 15, 20, 25, 30]"
				layout="sizes, prev, pager, next"
				:total="contentData.count"
			></el-pagination>
		</div>
	</div>
</template>

<script>
import Api from '@/api'
import Dayjs from "dayjs";
import MgjTable from "#/components/table";
import MetaDataMixin from "#/mixins/meta-data";
const DateFormat = "YYYY-MM-DD";
const DateFormat2 = "YYYY/MM/DD";
const DateFormat3 = 'YYYY-MM-DD HH:mm'
const StatusMap = {
	'-1': {
		str: "已过期",
		className: "expired"
	},
	1: {
		str: "未拆开",
		className: "unopened"
	},
	2: {
		str: "未使用",
		className: "unused"
	},
	3: {
		str: "已使用",
		className: "used"
	},
	4: {
		str: "已支付",
		className: "used"
	}
}
export default {
	name: "luckyMoney",
	components: {
		MgjTable
	},
	mixins: [MetaDataMixin],
	data() {
		return {
			memberInfo: {},
			hasSendLuckyMoneyPower: false,
			cashierAndAdmin: null,
			initLoading: false,
			tableLoading: false,
			dialogVisible: false,
			queryValidLuckyMoney: false,
			allTemplateList: [],
			templateList: [],
			appShopsMap: {}, // 红包模板配置的可使用门店
			queryData: {
				memId: this.$route.params.id,
				pageNumber: 0,
				pageSize: 15
			},
			contentData: {}
		};
	},
	async mounted() {
		const res = await Api.getMetaData();
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		this.getData();
		// 判断是否有发红包的权限，控制发送红包按钮的显示与隐藏
		let configsList = this.$eventBus.env.configs;
		for (let item of configsList) {
			if (item.configKey === "privateSendRed") {
				const { cashierAndAdmin, enableCashierAndAdmin } = JSON.parse(item.configValue)
				this.cashierAndAdmin = cashierAndAdmin;
				if (enableCashierAndAdmin && this.userInfo.mgjversion === "3") {
					this.hasSendLuckyMoneyPower = true;
				}
				break;
			}
		}
		this.$parent.root.getMemberDetail().then(content => {
			this.memberInfo = content.memberInfo;
		})
	},
	methods: {
		getData() {
			const postData = this.queryData;
			this.tableLoading = true;
			this.$http.post("/memberDetail!luckyMoney.action", {
				...postData,
				parentShopId: this.parentShopId
			}).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content.forEach(item => {
						const {
							templateName,
							money,
							billmoney,
							expiretime,
							createtime,
							activityId,
							activityTitle,
							senderName
						} = item;
						this.canVerification(item)
						item.templateName = templateName ? templateName : "--";
						item.money = money ? "￥" + money : "-";
						item.billmoney = billmoney ? billmoney : "无";
						item.status = this.getStatus(item)
						item.createtime = this.createtimeDecorator(createtime)
						item.activityTitle = activityId ? activityTitle : senderName;
					});
					this.contentData = resData;
				}
			})
			.catch(() => {
				this.tableLoading = false;
			});
		},
		onChange(val) {
			if (val) {
				this.queryData.status = "1,2";
			} else {
				delete this.queryData.status;
			}
			this.queryData.pageNumber = 0
			this.getData();
		},
		sendLuckyMoney() {
			this.templateList = [];
			this.formatAppShops(this.cashierAndAdmin.appShops);

			// 获取租户配置的红包模板（不包含过期的红包模板）
			this.$http.post("/redPackageTemplate!list.action", {
				pageNumber: 1,
				pageSize: 100,
				parentShopId: this.parentShopId
			}).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.allTemplateList = resData.content.list;
					if (!this.allTemplateList.length) {
						this.$message.error('未配置红包模板')
						return
					}
					const { appShops, templateIds } = this.cashierAndAdmin;
					const TemplateArr = this.allTemplateList.filter(item => templateIds.indexOf(item.id) !== -1)
					if (!TemplateArr.length) {
						this.$message.error('门店未配置红包模板')
						return
					}
					TemplateArr.forEach(item => {
						const { rule } = item;
						this.$set(item, "flag", 0);
						// 过滤掉已经过期的红包模板
						const { validitymode, endTime } = JSON.parse(item.rule);
						if (+validitymode === 1) {
							if (new Date(endTime).getTime() > new Date().getTime()) {
								this.templateList.push(item);
							}
						} else {
							this.templateList.push(item);
						}
					});
					if (!this.templateList.length) {
						this.$message.error('配置的红包模板已过期')
						return
					}
					this.dialogVisible = true;
				} else {
					this.$message.error(resData.message);
				}
			})
		},

		// 红包模板规则相关转换方法
		getMoneyShow(data) {
			const extraRule = JSON.parse(data.rule).extraRule
			let result = "";
			if (+extraRule.type === 0) {
				result = extraRule.money + "元定额";
			} else if (+extraRule.type === 1) {
				result = extraRule.minMoney + "-" + extraRule.maxMoney + "元随机";
			} else {
				result = extraRule.discount + "折";
			}
			return result;
		},
		getValidTime(data) {
			const rule = JSON.parse(data.rule)
			let result = "";
			if (+rule.validitymode === 0) {
				result = "/ 领取" + rule.days + "天后" + rule.afterDays + "天有效";
			} else {
				result = "/ " + rule.startTime + "-" + rule.endTime;
			}
			return result;
		},
		// 发送红包模板获取项目消费规则
		getCashContent(data) {
			const CashObj = JSON.parse(data.rule).luckyMoneyRule
			let result = "";
			if (CashObj) {
				if (CashObj.enableCashierPay) {
					// 启用项目消费
					let allowCashierPay = CashObj.allowCashierPay;
					const {consumptionAmountFlag, consumptionAmount, memCard, otherRedPackage, enableItems, items} = allowCashierPay
					if (consumptionAmountFlag || memCard || otherRedPackage) {
						result += '店内抵扣：'
					} else {
						result += '店内消费可使用，'
					}
					if (consumptionAmountFlag) {
						result += "满" + allowCashierPay.consumptionAmount + "元可以抵扣现金，";
					}
					if (memCard) {
						result += "仅允许散客使用（仅允许只有一张散客卡的会员使用），";
					}
					if (otherRedPackage) {
						result += "禁止同时使用其它红包，";
					}
					if (enableItems) {
						// 指定项目
						result += "指定可使用项目（";
						for (let index = 0; index < items.length; index++) {
							const item = items[index];
							if (index === items.length - 1) {
								result += item.name;
							} else {
								result += item.name + ",";
							}
						}
						result += "）,";
					}
				}
			}
			if (result.length > 0) {
				result = result.substr(0, result.length - 1);
			}
			return result;
		},
		// 发送红包模板获取商城购物规则
		getMallContent(data) {
			const mallObj = JSON.parse(data.rule).luckyMoneyRule
			let result = "";
			if (mallObj) {
				if (mallObj.enableMallPay) {
					// 启用商城购物
					let allowMallPay = mallObj.allowMallPay;
					const {orderAmountFlag, orderAmount, onlineScore, offlineScore, memCard, enableItems, items} = allowMallPay
					if (orderAmountFlag || onlineScore || offlineScore || memCard) {
						result += '商城抵扣：'
					} else {
						result += '商城可使用，'
					}
					if (orderAmountFlag) {
						result += "订单金额满" + allowMallPay.orderAmount + "元可使用，";
					}
					if (onlineScore) {
						result += "禁止与线上积分同时使用，";
					}
					if (offlineScore) {
						result += "禁止与线下积分同时使用，";
					}
					if (memCard) {
						result += "禁止同时使用会员卡支付，";
					}
					if (enableItems) {
						// 指定商品
						result += "指定可使用商品（";
						for (let index = 0; index < items.length; index++) {
							const item = items[index];
							if (index === items.length - 1) {
								result += item.name;
							} else {
								result += item.name + "，";
							}
						}
						result += "），";
					}
				}
			}
			if (result.length > 0) {
				result = result.substr(0, result.length - 1);
			}
			return result;
		},
		formatAppShops(appShops) {
			let res = {};
			appShops && appShops.forEach(item => (res[item.id] = item));
			this.appShopsMap = res;
		},
		// 获取红包记录列表红包使用规则
		getLuckyMoneyConfig(data) {
			let text = ''
			if (data.rule) {
				let rule = JSON.parse(data.rule)
				let _rule = rule.content && rule.content.rule ? rule.content.rule : "";
				if (_rule) {
					rule = _rule
					if (typeof rule === 'string') {
						rule = JSON.parse(rule)
					}
				} else {
					// 另一种content为string的情况(后台红包规则不统一)
					if (typeof rule.content === "string") {
						_rule = JSON.parse(rule.content);
						rule = _rule.rule;
					} else {
						return '该红包无规则';
					}
				}

				let mallTip = ''; // 商城抵扣
				if (rule && rule.luckyMoneyRule && rule.luckyMoneyRule.enableMallPay) { // 启用商城抵扣
					let allowMallPay = rule.luckyMoneyRule.allowMallPay;
					if (allowMallPay.orderAmountFlag) {
						mallTip += '订单金额满' + allowMallPay.orderAmount + '可用，';
					}
					if (allowMallPay.enableItems) {
						mallTip += "指定商品"
						let items = allowMallPay.items;
						for (let i = 0; i < items.length; i++) {
							let item = items[i];
							if (i === items.length - 1) {
								mallTip += '<span class="red">' + item.name + "</span>";
							} else {
								mallTip += '<span class="red">' + item.name + "、</span>";
							}
						}
						mallTip += '可用，';
					}
					if (!mallTip.length) {
						mallTip = '商城可用';
					} else {
						mallTip = '商城抵扣：' + mallTip.substr(0, mallTip.length - 1)
					}
				}

				let itemTip = ''; // 项目抵扣
				if (rule && rule.luckyMoneyRule && rule.luckyMoneyRule.enableCashierPay) { // 启用项目抵扣
					let allowCashierPay = rule.luckyMoneyRule.allowCashierPay;
					if (allowCashierPay.consumptionAmountFlag) {
						itemTip += '消费金额满' + allowCashierPay.consumptionAmount + '可用，';
					}

					if (allowCashierPay.enableItems) {
						itemTip += "指定项目"
						let items = allowCashierPay.items;
						for (let i = 0; i < items.length; i++) {
							let item = items[i];
							if (i === items.length - 1) {
								itemTip += '<span class="red">' + item.name + "</span>";
							} else {
								itemTip += '<span class="red">' + item.name + "、</span>";
							}

						}
						itemTip += '可用，';
					}
					if (!itemTip.length) {
						itemTip = '店内消费可用';
					} else {
						itemTip = '店内抵扣：' + itemTip.substr(0, itemTip.length - 1)
					}
				}
				if (mallTip && itemTip) {
					text = mallTip + '</br>' + itemTip;
				} else {
					text = mallTip || itemTip
				}
				if (itemTip && itemTip.length > 0) {
					text += this.getAppShops(data);
				}
			}
			return text ? text : '该红包无规则';
		},
		// 红包记录列表获取红包可使用的门店
		getAppShops(item) {
			let shopText = "";
			if (+this.userInfo.softgenre === 1) {
				// 单店
				return shopText;
			} else if (item && item.appShopInfo) {
				let appShopInfo = JSON.parse(item.appShopInfo);
				if (appShopInfo) {
					const {
						chosenShop,
						checkedDirectShops,
						checkedIndirectShops
					} = appShopInfo;
					if (+chosenShop === 2) {
						// 指定门店可用
						checkedDirectShops && checkedDirectShops.forEach(
							item => (shopText += this.shopMaps[item].osName + ",")
						);
						checkedIndirectShops && checkedIndirectShops.forEach(
							item => (shopText += this.shopMaps[item].osName + ",")
						);
						shopText = '指定门店可使用：' + shopText.substring(0, shopText.length - 1); // 去掉最后的,
					} else if (+chosenShop === 1) {
						shopText = "仅在发送门店可使用";
					} else {
						shopText = "全部门店可使用";
					}
					return '</br>' + '<span>' + shopText + '</span>';
				}
			} else {
				return shopText;
			}
		},
		// 发送红包模板获取可使用的门店
		getItemShops(item) {
			let result = "";
			const luckyMoneyRule = JSON.parse(item.rule).luckyMoneyRule;
			if (luckyMoneyRule.enableMallPay && !luckyMoneyRule.enableCashierPay) {
				// 仅商城可用 不显示门店
				return result;
			}
			if (+this.userInfo.softgenre === 1) {
				// 单店不显示
				return result;
			}
			const appShopInfo = this.appShopsMap[item.id];
			const {
				chosenShop,
				checkedDirectShops,
				checkedIndirectShops
			} = appShopInfo;
			if (+chosenShop === 0) {
				result = "全部门店可使用";
			} else if (+chosenShop === 1) {
				result = "仅在发送门店可使用";
			} else {
				result = "指定门店可使用：";
				checkedDirectShops && checkedDirectShops.forEach(
					item => (result += this.shopMaps[item].osName + "、")
				);
				checkedIndirectShops && checkedIndirectShops.forEach(
					item => (result += this.shopMaps[item].osName + "、")
				);
				result = result.substring(0, result.length - 1);
			}
			return result;
		},

		handleClick(item) {
			const { flag } = item;
			if (!flag) {
				this.$set(item, "flag", 1);
			} else {
				this.$set(item, "flag", 0);
			}
		},

		onSubmit() {
			const {id, name} = this.memberInfo
			const { shopId, parentShopId, userId, userName } = this.userInfo;
			let params = {
				memId: +id, // 会员id
				memName: name, // 会员名称
				shopId: +shopId, // 门店id
				parentShopId: +parentShopId, // 总部id
				senderId: +userId, // 发送人id
				senderName: userName, // 发送人名称
				luckyMoneys: []
			};
			// 获取选中的红包模板
			let checkedTemplateList = this.templateList.filter(item => item.flag === 1)
			checkedTemplateList.forEach(template => {
				const {id, rule, title} = template
				const {startTime, endTime, days, afterDays, validitymode, luckyMoneyRule, extraRule, requiredShare} = JSON.parse(rule)
				const tempContent = {
					content: template,
					useTemplate: true
				}
				let StartTime = ''
				if (+validitymode === 0) {
					StartTime = Dayjs(new Date().getTime() + (parseInt(days) * 24 * 60 * 60 * 1000)).format(DateFormat2) + ' 00:00:00'
				} else if (+validitymode === 1) {
					StartTime = startTime + ' 00:00:00';
				}
				let obj = {
					allowmallpay: luckyMoneyRule.enableMallPay === true ? '1' : '0',
					allowcashierpay: luckyMoneyRule.enableCashierPay === true ? '1' : '0',
					money: (+extraRule.type === 1 ? this.randomNum(parseInt(extraRule.minMoney), parseInt(extraRule.maxMoney)) : (extraRule.money ? extraRule.money : '')), // 0:固定1：随机 2.折扣
					discount: (+extraRule.type === 2 && extraRule.discount ? extraRule.discount : ''), // 折扣红包
					type: extraRule.type ? extraRule.type : '', // 红包类型
					templateId: id,
					activityTitle: title,
					shareRequire: requiredShare,
					startTime: StartTime,
					expiretime: endTime ? endTime + ' 23:59:59' : Dayjs(new Date().getTime() + ((parseInt(days) + parseInt(afterDays)) * 24 * 60 * 60 * 1000)).format(DateFormat2) + ' 23:59:59',
					rule: JSON.stringify(tempContent)
				}
				
				const appShopInfo = this.appShopsMap[id]
				if (appShopInfo) {
					if (+appShopInfo.chosenShop === 1) {
						appShopInfo.currentShop = {
							id: this.shopId,
							osName: this.userInfo.osName,
						}
					}
				}
				obj.appShopInfo = JSON.stringify(appShopInfo) // 门店配置信息
				params.luckyMoneys.push(obj);
			})
			if (!params.luckyMoneys.length) {
				this.$message.error('请至少选择一种红包')
				return;
			} else {
				this.$http.post("/memberDetail!sendRedPacket.action", params).then(res => {
					const resData = res.data;
					if (resData.code === 0) {
						this.$message.success('发送成功')
						this.getData()
					} else {
						this.$message.error(resData.message);
					}
				});
			}
			this.dialogVisible = false;
		},
		randomNum(minNum, maxNum) {
			switch (arguments.length) {
				case 1:
					return parseInt(Math.random() * minNum + 1, 10)
				case 2:
					return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
				default:
					return 0;
			}
		},
		handleCurrentChange(pageNumber) {
			this.queryData.pageNumber = pageNumber - 1;
			this.getData();
		},
		handleSizeChange(pageSize) {
			this.queryData.pageNumber = 0;
			this.queryData.pageSize = pageSize;
			this.getData();
		},
		getStatus(data) {
			const { status, expiretime } = data;
			if (new Date(expiretime).getTime() < new Date().getTime()) {
				return StatusMap['-1']
			} else {
				return StatusMap[status]
			}
		},
		formatterExpiretime(row) {
			let str = ''
			const {expiretime, rule} = row
			if (rule) {
				const outerRule = JSON.parse(rule)
				if (outerRule.content && outerRule.content.rule) {
					let innerRule = outerRule.content.rule
					if (typeof innerRule === 'string') {
						innerRule = JSON.parse(innerRule)
					}

					// const innerRule = JSON.parse(outerRule.content.rule)
					const {validitymode, startTime, endTime} = innerRule
					if (+validitymode === 1) {
						str = `${Dayjs(startTime).format(DateFormat)} 至 ${Dayjs(endTime).format(DateFormat)}`
					} else {
						str = expiretime ? Dayjs(expiretime).format(DateFormat3) : '无'
					}
				} else {
					str = expiretime ? Dayjs(expiretime).format(DateFormat3) : '无'
				}
			} else {
				str = expiretime ? Dayjs(expiretime).format(DateFormat3) : '无'
			}
			return str
		},
		formatterSenderName(row) {
			let str = '';
			const {activityid, activitytitle, senderName} = row
			if (activityid) {
				str = activitytitle ? activitytitle : '--'
			} else {
				str = senderName ? senderName : '--'
			}
			return str
		},
		// 校验红包是否可以核销
		canVerification(data) {
			const {appShopInfo, opentime, rule} = data
			if (rule) {
				const outerRule = JSON.parse(rule)
				if (outerRule.content && outerRule.content.rule) {
					let innerRule = outerRule.content.rule
					if (typeof innerRule === 'string') {
						innerRule = JSON.parse(innerRule)
					}
					// const innerRule = JSON.parse(outerRule.content.rule)
					const {validitymode, days, startTime, luckyMoneyRule} = innerRule
					const {enableMallPay, enableCashierPay} = luckyMoneyRule
					if (!+validitymode) { // 相对有效期红包
						if ((new Date().getTime() - new Date(opentime).getTime()) < days * 86400000) {
							data.disabled = true
							return 
						}
					} else { // 固定有效期红包
						if (new Date().getTime() < new Date(startTime).getTime()) {
							data.disabled = true
							return 
						}
					}
					
					if (enableMallPay && !enableCashierPay) { // 红包只能在商城消费使用
						data.disabled = true
						return 
					}

					if (appShopInfo) {
						const {chosenShop, currentShop, checkedDirectShops, checkedIndirectShops} = appShopInfo
						const shopId = this.userInfo.shopId
						if (+chosenShop === 1) { // 仅在发送门店可使用
							if (+currentShop.id !== +shopId) {
								data.disabled = true
								return 
							}
						} else if (+chosenShop === 2) { // 指定部分门店可使用
							const shopsArray = checkedDirectShops.concat(checkedIndirectShops)
							if (shopsArray.indexOf(+shopId) === -1) {
								data.disabled = true
								return 
							}
						}	 
					}
				}
			}
		},
		hidePopover() {
			document.body.click();
		},
		// 红包核销
		handleVerification(data) {
			this.hidePopover()
			const outerRule = data.rule && JSON.parse(data.rule)
			if (outerRule && outerRule.content && outerRule.content.rule) {
				let innerRule = outerRule.content.rule
				if (typeof innerRule === 'string') {
					innerRule = JSON.parse(innerRule)
				}
				// const innerRule = JSON.parse(outerRule.content.rule)
				const {validitymode, days, startTime} = innerRule
				if (!+validitymode) { // 相对有效期红包
					if ((new Date().getTime() - new Date(data.opentime).getTime()) < days * 86400000) {
						this.$message.error('未到可核销时间')
						return 
					}
				} else { // 固定有效期红包
					if (new Date().getTime() < new Date(startTime).getTime()) {
						this.$message.error('未到可核销时间')
						return 
					}
				}
			}
			const {id, name} = this.memberInfo
			const postData = {
				parentShopId: this.parentShopId,
				shopId: this.userInfo.shopId,
				luckyMoneyId: data.id,
				status: 3,
				memId: id,
				memName: name
			}
			this.initLoading = true;
			this.$http.post('/memberDetail!checkluckyMoney.action', postData).then(res => {
				this.initLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					data.status = StatusMap[3]
					this.$message.success('红包核销成功')
				}
			}).catch(() => {
				this.initLoading = false;
			});
		},
		createtimeDecorator(time, dateFormat = 'YYYY-MM-DD') {
			if (!time) return '--';
			const lasttimeDate = Dayjs(time);
			const currentDate = Dayjs();
			const currentMonth = currentDate.month();
			const currentDay = currentDate.date();
			if (lasttimeDate.year() === 1970) {
				return '--';
			}

			const lastTimeMonth = lasttimeDate.month();
			const lastTimeDay = lasttimeDate.date();
			const diffHours = currentDate.diff(lasttimeDate, 'hours');
			const diffMinute = currentDate.diff(lasttimeDate, 'minute');
			const diffDay = lastTimeMonth === currentMonth ? currentDay - lastTimeDay : (currentDay + lasttimeDate.daysInMonth()) - lastTimeDay;
			let diffContent = '刚刚';
			if (diffDay >= 3) {
				diffContent = lasttimeDate.format(dateFormat);
			} else if (diffDay >= 1) {
				if (diffHours < 24) {
					diffContent = `${diffHours}小时前`
				} else if (diffHours < diffDay * 24) {
					diffContent = `${diffDay - 1}天前`
				} else {
					diffContent = `${diffDay}天前`
				}
			} else if (diffHours >= 1) {
				diffContent = `${diffHours}小时前`;
			} else if (diffMinute > 0) {
				diffContent = `${diffMinute}分钟前`;
			}
			return diffContent;
		},
	}
}	
</script>

<style lang="less">
.customer_lucky_money {
	padding: 20px 40px 0;
	height: 100vh;
	.lucky_money_header {
		display: flex;
		justify-content: space-between;
		.title {
			font-size: 13px;
			color: #222;
			line-height: 2.4;
			font-weight: bold;
		}
		.el-checkbox__label {
			font-size: 12px;
		}
	}
	.lucky_money_content {
		.el-pagination {
			margin: 10px -10px 0;
		}
		.el-table {
			color: #333;
			th {
				background-color: #FAFCFF;
				display: table-cell!important;
			}
		} 
		.mgj_table-content .el-table thead {
			color: #909399;
		}
		.verification {
			float: right;
			padding: 4px;
			color: #409EFF;
			&.is-disabled {
				color: #C0C4CC;
			}
		}
		

		.expired {
			color: #333;
		}
		.unopened {
			color: #e82742;
		}
		.unused {
			color: #4db27a;
		}
		.used {
			color: #222;
		}
		.icon_info {
			color: #c1c1c1;
			cursor: pointer;
			transition: color .3s;
			&:hover {
				color: #0ae;
			}
		}
	}
}

// 发送红包弹窗样式
.lucky_money-box {
	width: 100%;
	height: 400px;
	overflow-y: auto;
	.lucky_money {
		position: relative;
		padding: 10px 0 0 30px;
		border-bottom: 1px solid #f0f1f5;
		cursor: pointer;
		.icon_option {
			position: absolute;
			top: 12px;
			left: 4px;
		}

		.content {
			width: 100%;
			padding: 0 20px 20px 4px;
			line-height: 1.6;
			font-size: 12px;
			color: #999;
			.firstLine {
				margin-bottom: 4px;
				color: #333333;
				overflow: hidden;
				.left {
					float: left;
				}
				.right {
					float: right;
					.red {
						color: #da3d4d;
					}
				}
			}
		}
	}
}

.el-popover {
	min-width: 0;
	max-width: 430px;
}
</style>