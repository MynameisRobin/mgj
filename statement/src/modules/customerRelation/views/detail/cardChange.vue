<template>
	<div class="customer_card_change" v-loading="initLoading">
		<div class="card_change_header">
			<div class="title">卡金变动</div>
			<el-form :inline="true">
				<el-form-item>
					<el-select v-model="queryData.memberCardId" placeholder="">
						<el-option v-for="item in cardList" :key="item.id" :label="item.cardtypename" :value="item.id">
							<span style="float: left; margin-right: 10px">{{ item.cardtypename }}</span>
      						<span style="float: right; color: #B6B6B6; font-size: 12px">{{ item.cardid }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="开始日期：">
					<el-date-picker
						v-model="queryData.startDate"
						type="date"
						placeholder="选择日期"
						value-format="yyyy-MM-dd">
					</el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onQuery">开始查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="card_change_content">
			<div class="card_change_content-empty" v-if="!tableData">
				<am-icon class="content_empty-icon" size="76px" name="sousuo"></am-icon>
				<p class="content_empty-text">点击开始查询按钮进行查询~</p>
			</div>
			<mgj-table
				v-if="tableData"
				v-loading="tableLoading"
				print-title="卡金变动"
				tooltip-effect="dark"
				stripe
				border
				size="mini"
				height="calc(100vh - 132px)"
				:printColumns="printColumnList"
				:custom-column="false"
				:print-table="true"
				:data="tableData">
				<el-table-column label="单号" width="148" show-overflow-tooltip>
					<template slot-scope="scope">
						<span style="color: #409EFF; cursor: pointer;" @click="openBillDetail(scope.row)" v-if="scope.row.billId">{{scope.row.billNo}}</span>
						<span v-else>--</span>
					</template>
				</el-table-column>
				<el-table-column prop="genre" label="类型" min-width="100" show-overflow-tooltip></el-table-column>
				<el-table-column prop="cardFee" label="卡金变动" width="84" :formatter="formatterCardFeeOrPresentFee"></el-table-column>
				<el-table-column prop="currCardFee" label="卡金余额" width="94"></el-table-column>
				<el-table-column prop="presentFee" label="赠金变动" width="84" :formatter="formatterCardFeeOrPresentFee"></el-table-column>
				<el-table-column prop="currPresentFee" label="赠金余额" width="94"></el-table-column>
				<el-table-column prop="consumeTime" label="变动时间" min-width="100" show-overflow-tooltip></el-table-column>
				<el-table-column prop="shopName" label="消费门店" min-width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="operator" label="操作人" width="80" show-overflow-tooltip></el-table-column>
				<div slot="empty">暂无数据</div>
			</mgj-table>
		</div>
	</div>
</template>

<script>
import Api from '@/api'
import Dayjs from 'dayjs'
import MgjTable from "#/components/table";
import MetaDataMixin from '#/mixins/meta-data'
const DateFormat = 'YYYY-MM-DD'
const TypeMap = {
	0: '项目消费',
	1: '购买卖品',
	2: '开卡',
	3: '购买套餐',
	4: '套餐充值',
	5: '项目消费',
	6: '年卡充值',
	7: '年卡销售',
	8: '转账转入',
	9: '转账转出',
	10: '卡调账',
	11: '导入',
	12: '删除',
	13: '恢复',
	14: '扣除信息费',
	15: '失效套餐转利润',
	16: '购买套餐-成本',
	17: '卡转账转入年卡',
	18: '退套餐转入',
	19: '年卡卡金消费',
	20: '欠款买套餐',
	31: '卡调账',
	32: '调整会员所属门店',
	33: '自助充值',
	88: '特权卡开通续期',
	99: '商城卡金支付'
}
const ExpenseList = [0, 1, 3, 5, 7, 9, 12, 14, 15, 16, 19, 20, 32, 88, 99]
export default {
	name: 'cardChange',
	components: {
		MgjTable
	},
	mixins: [
		MetaDataMixin,
	],
	data() {
		return {
			initLoading: true,
			tableLoading: false,
			tableData: null,
			queryData: {
				memberCardId: undefined,
				startDate: ''
			},
			cardList: [],
			printColumnList: [
				{label: '单号', prop: 'billNo'},
				{label: '类型', prop: 'genre'},
				{label: '卡金变动', prop: 'cardFee'},
				{label: '卡金余额', prop: 'currCardFee'},
				{label: '赠金变动', prop: 'presentFee'},
				{label: '赠金余额', prop: 'currPresentFee'},
				{label: '变动时间', prop: 'consumeTime'},
				{label: '消费门店', prop: 'shopName'},
				{label: '操作人', prop: 'operator'},
			],
		}
	},
	created() {
		const nowDate = new Date()
		const startDate = nowDate.getTime() - (365 / 2 * 24 * 3600 * 1000)
		this.queryData.startDate = Dayjs(new Date(startDate)).format(DateFormat)
		this.$parent.root.getMemberDetail().then(content => {
			this.queryData.shopid = content.memberInfo.shopid
			this.cardList = content.cards.filter(item => Number(item.cardtype) !== 2)
			this.queryData.memberCardId = this.cardList[0].id
			this.initLoading = false
		})
	},
	methods: {
		onQuery() {
			this.tableData = [];
			this.getData();
		},
		getData() {
			const postData = this.queryData
			this.tableLoading = true;
			this.$http.post('/memberDetail!memberCardChange.action', postData).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					let currCardFee = resData.currCardFee
					let currPresentFee = resData.currPresentFee
					resData.records.forEach(item => {
						const {cardFee, presentFee} = item;
						if (cardFee !== 0 || presentFee !== 0) {
							this.tableData.push(item)
						}
					})
					if (this.tableData.length) {
						this.tableData.forEach(item => {
							const {billNo, cancel, cardFee, consumeTime, consumetype, operator, presentFee, type} = item;
							const reference = ExpenseList.indexOf(type) !== -1
							item.genre = this.getType(item)
							item.cardFee = this.getCardFeeOrPresentFee('cardFee', item)
							item.presentFee = this.getCardFeeOrPresentFee('presentFee', item)
							item.consumeTime = consumeTime ? Dayjs(consumeTime).format(DateFormat) : '';
							item.currCardFee = currCardFee.toFixed(2);
							item.currPresentFee = currPresentFee.toFixed(2);
							item.operator = operator ? operator : '--';
							currCardFee = reference ? currCardFee + cardFee : currCardFee - cardFee;
							currPresentFee = reference ? currPresentFee + presentFee : currPresentFee - presentFee;
						})
					}
				}	
			}).catch(() => {
				this.tableLoading = false;
			})
		},
		getType(row) {
			let typeMsg = ''
			const {type, cardFee, cancel, consumetype} = row;
			if (type === 99) {
				if (cardFee > 0) {
					typeMsg = '商城卡金支付'
				} else {
					typeMsg = '商城卡金支付-团购退款'
				}
			} else {
				if (cancel === 1) {
					if (type === 2) {
						if (consumetype === 1) {
							typeMsg = '充值撤单'
						} else {
							typeMsg = '开卡撤单'
						}
					} else {
						typeMsg = `${TypeMap[type]}撤单`
					}
				} else {
					if (type === 2) {
						if (consumetype === 1) {
							typeMsg = '充值'
						} else {
							typeMsg = '开卡'
						}
					} else {
						typeMsg = TypeMap[type]
					}
				}
			}
			
			return typeMsg
		},
		getCardFeeOrPresentFee(key, row) {
			let res = ''
			const fee = row[key]
			const type = row.type
			const positiveNum = ExpenseList.indexOf(type) !== -1
			const value = positiveNum ? (0 - fee).toFixed(2) : fee.toFixed(2)
			if (fee) {
				if (value.indexOf('-') !== -1) {
					res = value
				} else {
					res = `+${value}`
				}
			} else {
				res = '--'
			}
			return res
		},
		formatterCardFeeOrPresentFee(row, column) {
			let res = ''
			let key = column.property
			const fee = row[key]
			if (fee === '--') {
				res = '--'
			} else if (fee.indexOf('+') !== -1) {
				res = <span class="increase">{fee}</span>
			} else if (fee.indexOf('-') !== -1) {
				res = <span class="decrease">{fee}</span>
			}
			return res	
		},
		openBillDetail(data) {
			console.log('data', data)
			this.$http.post("/bill!detail.action", {
				parentShopId: Number(this.parentShopId),
				id: data.billId
			}).then(res => {
				if (!res) {
					return console.log("res:", res);
				}
				const { content, code } = res.data;
				if (code === 0) {
					window.qrModal.show(content);
				}
			});
		}
	}
}
</script>

<style lang="less">
	.customer_card_change {
		position: relative;
		padding: 20px 40px 0;
		height: 100vh;
		.card_change_header {
			display: flex;
			justify-content: space-between;
			.title {
				font-size: 13px;
				color: #222;
				line-height: 2.4;
				font-weight: bold;
			}
		}

		.card_change_content {
			.card_change_content-empty {
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
			.increase {
				color: #51A661;
			}
			.decrease {
				color: #DA3D4D;
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
		}
	}
</style>
