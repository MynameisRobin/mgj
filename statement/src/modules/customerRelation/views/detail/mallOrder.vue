<template>
	<div class="customer_mall_order" v-loading="loading">
		<div class="mall_order_header">
			<div class="title">商城订单</div>
			<el-form :inline="true">
				<!-- 大类 -->
				<el-form-item class="category"> 
					<el-select v-model="queryData.category" @change="handleChangeCategory">
						<el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<!-- 子类 -->
				<el-form-item class="category"> 
					<el-select v-model="subCategory">
						<el-option v-for="item in subCategoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="status">
					<el-select v-model="status">
						<el-option v-for="item in statusList" :key="item.status" :label="item.name" :value="item.status"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onQuery">开始查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="mall_order_content">
			<div class="mall_order_content-empty" v-if="!contentData">
				<am-icon class="content_empty-icon" size="76px" name="sousuo"></am-icon>
				<p class="content_empty-text">点击开始查询按钮进行查询~</p>
			</div>
			<mgj-table
				v-if="contentData"
				tooltip-effect="dark"
				stripe
				border
				size="mini"
				height="calc(100vh - 132px)"
				:showHeader="false"
				:data="contentData.content">
				<el-table-column prop="mallItemName" label="商品名称" min-width="140" show-overflow-tooltip></el-table-column>
				<el-table-column prop="category" label="商品类别" width=""></el-table-column>
				<el-table-column prop="mallitemnum" label="购买数量" width="90"></el-table-column>
				<el-table-column label="购买价格" width="90">
					<template slot-scope="scope">
						<span>{{scope.row.realPrice}}</span>
						<am-icon v-if="scope.row.privilegeId" class="privilege_icon" name="crown"></am-icon>
					</template>
				</el-table-column>
				<el-table-column prop="cashPay" label="实付金额" width="90" :formatter="formatterCashPay"></el-table-column>
				<el-table-column prop="createTime" label="购买日期" min-width="100" show-overflow-tooltip></el-table-column>
				<el-table-column prop="" label="订单状态" :formatter="formatterStatus" min-width="110" show-overflow-tooltip></el-table-column>
				<el-table-column fixed="right" label="操作" width="90">
					<template slot-scope="scope">
						<el-button @click="handleClick(scope.row)" type="text" size="small">详情</el-button>
					</template>
				</el-table-column>
				<div slot="empty">暂无数据</div>
			</mgj-table>
			<!-- 分页 -->
			<el-pagination
				v-if="contentData && contentData.totalCount"
				background
				:pager-count="9"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryData.pageNumber + 1"
				:page-size="queryData.pageSize"
				:page-sizes="[10, 15, 20, 25, 30]"
				layout="sizes, prev, pager, next"
				:total="contentData.totalCount">
			</el-pagination>
		</div>
		<!-- 订单详情 -->
		<el-dialog class="mall_order_detail" title="订单详情" :visible.sync="dialogVisible" width="600px">
			<!-- 预留 退款相关操作 -->
			<div class="refund_box" v-if="false">
				<div class="warning_wrapper" v-if="orderData.refundTimes > 10 && orderData.groupbuyingstatus !== 4">
					<div class="left"><am-icon class="icon_warning" size="54px" name="warning"></am-icon></div>
					<div class="right">
						<div class="intro">此订单为团购订单，到期未成团</div>
						<div class="remind">由于支付渠道原因，系统无法自动原路退款，请联系顾客由其他途径退款</div>
						<div class="action">
							<el-button v-if="orderData.status === 2" @click="refundAgain">再次退款</el-button>
							<el-popover placement="bottom" width="330">
								<p>一旦手动将状态改为已退款，系统将无法再自动原路退款了。是否确认已经由其他途径给顾客退款成功？</p>
								<div style="text-align: right; margin: 0">
									<el-button size="mini" type="text" @click="hidePopover">取消</el-button>
									<el-button type="primary" size="mini" @click="refund">确定</el-button>
								</div>
								<el-button icon="el-icon-success" slot="reference">我已联系客户并退款，将状态变更为已退款。</el-button>
							</el-popover>
						</div>
					</div>
				</div>
				<div class="reason" v-if="orderData.error && orderData.refundTimes > 10">
					<am-icon name="info" size="12px"></am-icon> <span>退款失败原因：{{orderData.error}}</span>
				</div>
			</div>

			<el-form size="mini" label-position="left" label-width="104px">
				<!-- 1 -->
				<el-row>
					<el-col :span="24">
						<el-form-item label="订单核销码：">
							<p>{{orderData.code}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 2 -->
				<el-row>
					<el-col :span="12">
						<el-form-item label="顾客姓名：">
							<p>{{orderData.memName}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="支付方式：">
							<p>{{getPayType(orderData.payType)}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 3 -->
				<el-row>
					<el-col :span="12">
						<el-form-item label="手机号：">
							<p>{{orderData.memMobile}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="收款渠道：">
							<p>{{getChannel(orderData.channel)}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 4 -->
				<el-row>
					<el-col :span="12" v-if="orderData.distrtype===2">
						<el-form-item label="收货人姓名：">
							<p>{{orderData.distrContact}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="使用红包：">
							<p>{{orderData.luckyMoneyPay ? +orderData.luckyMoneyPay.toFixed(1) : 0}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 5 -->
				<el-row>
					<el-col :span="12" v-if="orderData.distrtype===2">
						<el-form-item label="收货人手机号：">
							<p>{{orderData.distrContactMobile}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="使用门店：">
							<p>{{orderData.consumeStoreName || '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 6 -->
				<el-row>
					<el-col :span="12">
						<el-form-item label="取货方式：">
							<p>{{orderData.distrtype === 1 ? "自取" : "物流"}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="返还积分：">
							<p>{{orderData.bonusOnlineCredit || '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 7 -->
				<el-row>
					<el-col :span="12">
						<el-form-item label="地址/取货门店：">
							<p>{{orderData.distraddress}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="积分接收人：">
							<p>{{orderData.bonusMemName || '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 8 -->
				<el-row>
					<el-col :span="12">
						<el-form-item label="订单状态：">
							<p v-html="getOrderStatus(orderData)"></p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="门店积分抵扣：">
							<p>{{(orderData.offlineCredit && orderData.offlineCreditPay) ? (orderData.offlineCredit + '分抵扣' + Number(orderData.offlineCreditPay).toFixed(2) + '元') : '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 9 -->
				<el-row>
					<el-col :span="12">
						<el-form-item label="使用时间：">
							<p>{{getConsumeTime(orderData.consumeTime)}}</p>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="线上积分抵扣：">
							<p>{{(orderData.onlineCredit && orderData.onlineCreditPay) ? (orderData.onlineCredit + '分抵扣' + Number(orderData.onlineCreditPay).toFixed(2) + '元') : '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 10 -->
				<el-row v-if="orderData.distrtype===2">
					<el-col :span="24">
						<el-form-item label="发货状态：">
							<p>{{(orderData.logisticsCompany && orderData.waybillNumber) ? '已发货' : '未发货'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 11 -->
				<el-row v-if="orderData.distrtype===2">
					<el-col :span="24">
						<el-form-item label="发货时间：">
							<p>{{orderData.deliveryTime || '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 12 -->
				<el-row v-if="orderData.distrtype===2">
					<el-col :span="24">
						<el-form-item label="物流公司：">
							<p>{{orderData.logisticsCompany || '--'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 13 -->
				<el-row v-if="orderData.distrtype===2">
					<el-col :span="24">
						<el-form-item label="物流单号：">
							<p>{{orderData.waybillNumber || '-'}}</p>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
import MgjTable from "#/components/table";
import MetaDataMixin from "#/mixins/meta-data";
import Dayjs from "dayjs";
const DateFormat = 'YYYY-MM-DD HH:mm'
const payTypeArr = {
	"-1": "未支付",
	"1": "支付中",
	"2": "未使用",
	"3": "已使用",
	"4": "已使用"
}
const tuanStatus = {
	"1": "团购中",
	"2": "已成团,可使用",
	"3": "等待退款",
	"4": "已退款"
}
const tuanStatus2 = {
	"1": "退款失败,到期未成团",
	"2": "退款失败,到期未成团",
	"3": "退款失败,到期未成团",
	"4": "已退款"
}
const StatusClassMap = {
	1: ['ytk'], // #d72021
	2: ['ksy'], // #69bb6b
	3: ['ysy'], // #222
	4: ['tgz'], // #e88822
	5: ['dqwct'], // #E12B2B
}
export default {
	name: 'mallOrder',
	components: {
		MgjTable
	},
	mixins: [MetaDataMixin],
	data() {
		return {
			dialogVisible: false,
			orderData: {},
			loading: false,
			queryData: {
				memberid: this.$route.params.id,
				pageNumber: 0,
				pageSize: 15,
				category: 1,
			},
			subCategory: 0,
			status: 0,
			categoryList: [
				{id: 1, name: '服务类'},
				{id: 2, name: '卖品类'},
			],
			subCategoryList: [{id: 0, name: '全部分类'}],
			subCategoryList_service: [],
			subCategoryList_goods: [],
			statusList: [
				{status: 0, name: '全部状态'},
				{status: 2, name: '未使用'},
				{status: 3, name: '已使用'},
				{status: -1, name: '未支付'},
			],
			contentData: null,
		}
	},
	created() {
		this.getSubCategoryList()
	},
	methods: {
		// 获取订单子分类
		getSubCategoryList() {
			const postData = {
				parentShopId: this.parentShopId,
				categoryId: -1
			}
			this.loading = true
			this.$http.post('/mall!getSubCategoryList.action', postData).then(res => {
				this.loading = false
				const resData = res.data;
				if (resData.code === 0) {
					this.subCategoryList_service = [{id: 0, name: '全部分类'}].concat(resData.content.filter(item => item.categoryId === 1))
					this.subCategoryList_goods = [{id: 0, name: '全部分类'}].concat(resData.content.filter(item => item.categoryId === 2))
					this.subCategoryList = this.subCategoryList_service
				} else {
					this.$message.error(resData.message);
				}
			})
		},
		onQuery() {
			this.queryData.pageNumber = 0;
			this.getData();
		},
		getData() {
			if (this.subCategory) {
				this.queryData.subCategory = this.subCategory
			} else {
				delete this.queryData.subCategory
			}
			if (this.status) {
				this.queryData.status = this.status
			} else {
				delete this.queryData.status
			}
			console.log('queryData', this.queryData)
			this.loading = true;
			const postData = this.queryData
			this.$http.post('/mall!getOrderList.action', postData).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content.forEach(item => {
						const {createTime, realPrice, cashPay, category} = item
						item.createTime = Dayjs(createTime).format(DateFormat)
						item.realPrice = realPrice.toFixed(2)
						item.cashPay = cashPay.toFixed(2)
						item.category = category === 1 ? '服务类' : '卖品类'
					})
					this.contentData = resData
				}	
			}).catch(() => {
				this.loading = false;
			})
		}, 
		formatterCashPay(row) {
			const {cashPay} = row
			return <span class="red">{cashPay}</span>
		},
		formatterStatus(row) {
			const {isgroupbuying, status, refundTimes, groupbuyingstatus} = row
			let res = ''
			let tuan = ''
			if (+isgroupbuying === 1 && +status === 2) {
				if (+refundTimes > 10 && +groupbuyingstatus !== 4) {
					tuan = '退款失败,到期未成团'
				} else {
					tuan = tuanStatus[groupbuyingstatus]
				}
			}
			let str = tuan ? tuan : payTypeArr[status]
			
			switch (str) {
				case '未支付':
					res = str
					break;
				case '已退款':
					res = <span class={StatusClassMap[1]}>{str}</span>
					break;
				case '已成团,可使用':
				case '未使用':
					res = <span class={StatusClassMap[2]}>{str}</span>
					break;
				case '已使用':
					res = <span class={StatusClassMap[3]}>{str}</span>	
					break;
				case '团购中':
					res = <span class={StatusClassMap[4]}>{str}</span>	
					break;
				case '退款失败,到期未成团':
					res = <span class={StatusClassMap[5]}>{str}</span>	
					break;	
				default:
					break;
			}
			return res;
		},
		// 详情 支付方式转换
		getPayType(payType) {
			const userTypeArr = ["微信", "支付宝", "免费领取", "会员卡支付"]
			return userTypeArr[payType]
		},
		// 详情 收款渠道转换
		getChannel(channel) {
			const channelArr =  ["美管加代收", "自收", "收钱吧", "京东支付"];
			return channelArr[channel]
		},
		// 详情 订单状态转换
		getOrderStatus(orderData) {
			let res = ''
			let str = ''
			const {refundTimes, groupbuyingstatus, status, isgroupbuying} = orderData
			if (+refundTimes > 10) {
				str = tuanStatus2[groupbuyingstatus]
			} else {
				if (+status === 2 && +isgroupbuying) {
					str = tuanStatus[groupbuyingstatus]
				} else {
					str = payTypeArr[status]
				}
			}
			switch (str) {
				case '未支付':
					res = str
					break;
				case '已退款':
					res = `<span class=${StatusClassMap[1]}>${str}</span>`
					break;
				case '已成团,可使用':
				case '未使用':
					res =  `<span class=${StatusClassMap[2]}>${str}</span>`
					break;
				case '已使用':
					res =  `<span class=${StatusClassMap[3]}>${str}</span>`
					break;
				case '团购中':
					res =  `<span class=${StatusClassMap[4]}>${str}</span>`
					break;
				case '退款失败,到期未成团':
					res =  `<span class=${StatusClassMap[5]}>${str}</span>`
					break;	
				default:
					break;
			}
			return res;
		},
		// 详情 使用时间转换
		getConsumeTime(consumeTime) {
			return consumeTime ? Dayjs(consumeTime).format(DateFormat) : '--'
		},
		handleChangeCategory(category) {
			this.subCategory = 0
			this.status = 0
			if (category === 1) {
				this.subCategoryList = this.subCategoryList_service
			} else {
				this.subCategoryList = this.subCategoryList_goods
			}
		},
		handleClick(row) {
			console.log('row', row)
			this.orderData = row
			this.dialogVisible = true
		},
		handleCurrentChange(pageNumber) {
			this.queryData.pageNumber = pageNumber - 1
			this.getData()
		},
		handleSizeChange(pageSize) {
			this.queryData.pageNumber = 0;
			this.queryData.pageSize = pageSize
			this.getData()
		},
		refundAgain() {
			console.log('orderData', this.orderData)
		},
		refund() {
			console.log('orderData', this.orderData)
		},
		hidePopover() {
			document.body.click();
		},
	}
}
</script>

<style lang="less">
	.customer_mall_order {
		position: relative;
		padding: 20px 40px 0;
		height: 100vh;
		.mall_order_header {
			display: flex;
			justify-content: space-between;
			.title {
				font-size: 13px;
				color: #222;
				line-height: 2.4;
				font-weight: bold;
			}
			.category,
			.status {
				.el-select {
					width: 131px;
				}
			}
		}
		.mall_order_content {
			.mall_order_content-empty {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				text-align: center;
				.content_empty-icon {
					color: #ddd;
				}
				.content_empty-text {
					margin-top: 15px;
					color: #a3a3a3;
					line-height: 20px;
				}
			}
			.el-pagination {
				margin: 10px -10px 0;
			}
			.el-table {
				color: #333;
				th {
					background-color: #FAFCFF;
					display: table-cell!important;
				}
				td {
					.el-button {
						padding: 0;
					}
				}
			} 
			.mgj_table-content .el-table thead {
				color: #909399;
			}
			// 列表实付金额添加颜色
			.red {
				color: #DA3D4D;
			}
			.privilege_icon {
				color: rgb(216, 190, 149);
			}
		}
		// 订单详情样式
		.mall_order_detail {
			.el-dialog__body {
				padding-top: 10px;
				.warning_wrapper {
					margin-bottom: 4px;
					overflow: hidden;
					.left {
						float: left;
						margin-right: 20px;
						.icon_warning {
							color: rgb(255, 171, 171);
						}
					}
					.right {
						float: left;
						font-size: 12px;
						color: #333;
						.intro {
							color: #E12B2B;
						}
						.remind {
							margin: 5px 0 10px 0;
						}
						.action {
							display: flex;
							justify-content: space-between;
							margin-bottom: 10px;
						}
					}
				}
				.reason {
					margin-bottom: 4px;
					padding-left: 74px;
					font-size: 12px;
					color: #E12B2B;
				}
			}
			.el-form {
				.el-form-item {
					margin-bottom: 2px;
					.el-form-item__label {
						line-height: 33px;
						color: #909090;
					}
					.el-form-item__content {
						font-size: 12px;
						color: #333;
					}
				}
			}	
		}

		// 订单状态颜色特殊处理
		.ytk {
			color: #d72021;
		}
		.ksy {
			color: #69bb6b;
		}
		.ysy {
			color: #222;
		}
		.tgz {
			color: #e88822;
		}
		.dqwct {
			color: #E12B2B;
		}
	}

	
</style>
