<template>
	<div class="customer_consume_record" v-loading="loading">
		<div class="consume_record_header">
			<div class="title">消费记录</div>
			<el-form :inline="true">
				<el-form-item class="card">
					<el-select v-model="memberCardId" @change="handleChangeCard">
						<el-option v-for="item in cardList" :key="item.id" :label="item.cardtypename" :value="item.id">
							<span style="float: left; margin-right: 10px">{{ item.cardtypename }}</span>
      						<span style="float: right; color: #B6B6B6; font-size: 12px">{{ item.cardid }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="billtype">
					<el-select v-model="queryData.billtype">
						<el-option v-for="item in billtypeList" :key="item.type" :label="item.name" :value="item.type"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="billstatus"> 
					<el-select v-model="queryData.billstatus">
						<el-option v-for="item in billstatusList" :key="item.status" :label="item.name" :value="item.status"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="button_group" label="选择时间：">
					<!-- <el-button icon="el-icon-arrow-left" @click="goForward" :disabled="disabledForward">往前半年</el-button> -->
					<el-tooltip effect="dark" content="从开卡开始" placement="top">
						<el-button class="first" :class="{'is-grey': disabledFromOpenCard}" @click="goFromOpenCard">
							<am-icon name="Group-z1"></am-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip effect="dark" content="往前半年" placement="top">
						<el-button class="center" :class="{'is-grey': disabledForward}" @click="goForward">
							<am-icon name="Group-z"></am-icon>
						</el-button>
					</el-tooltip>	
					<span class="wrapper">
						<!-- <am-icon style="color: #B4BCCC" size="14px" isElement name="date"></am-icon> -->
						<span>{{startDate}}</span>
						<span>-</span>
						<span>{{endDate}}</span>
					</span>
					<!-- <el-button @click="goBack" :disabled="disabledBack">往后半年<i class="el-icon-arrow-right el-icon--right"></i></el-button> -->
					<el-tooltip effect="dark" content="往后半年" placement="top">
						<el-button class="center" :class="{'is-grey': disabledBack}" @click="goBack">
							<am-icon name="Group-y"></am-icon>
						</el-button>
					</el-tooltip>		
					<el-tooltip effect="dark" content="最近半年" placement="top">
						<el-button :class="{'is-grey': disabledLately}" class="last" @click="goLatelyHalfYear">
							<am-icon name="Group-y1"></am-icon>
						</el-button>
					</el-tooltip>		
				</el-form-item>
				<el-form-item>
					<el-button class="btn" type="primary" @click="onQuery">开始查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="consume_record_content">
			<div class="consume_record_content-empty" v-if="!contentData">
				<am-icon class="content_empty-icon" size="76px" name="sousuo"></am-icon>
				<p class="content_empty-text">点击开始查询按钮进行查询~</p>
			</div>
			<mgj-table
				v-if="contentData"
				print-title="消费记录"
				tooltip-effect="dark"
				stripe
				border
				size="mini"
				height="calc(100vh - 132px)"
				:columns="columnList"
				:printColumns="printColumnList"
				:custom-column="false"
				:print-table="true"
				:data="contentData">
				<el-table-column fixed="left" label="单号" width="148" show-overflow-tooltip>
					<template slot-scope="scope">
						<span style="color: #409EFF; cursor: pointer;" @click="openBillDetail(scope.row)">{{scope.row.billno}}</span>
					</template>
				</el-table-column>
				<div slot="empty">暂无数据</div>
			</mgj-table>
		</div>
	</div>
</template>

<script>
const BilltypeMap = {
	0: '项目消费',
	1: '卖品消费',
	2: '开卡充值',
	3: '套餐销售',
	4: '套餐消费',
	5: '年卡销售',
	6: '年卡消费',
	7: '套餐赠送'
}
const BillStatusMap = {
	0: '正常',
	1: '已销单'
}
const DateFormat = 'YYYY-MM-DD'
import Api from '@/api'
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from '@/js/storageKeys'
import MetaDataMixin from '#/mixins/meta-data'
import Dayjs from 'dayjs'
import MgjTable from "#/components/table";
export default {
	name: "consumeRecord",
	components: {
		MgjTable
	},
	mixins: [
		MetaDataMixin,
	],
	data() {
		let billtypeList = Object.keys(BilltypeMap).filter(type => ['0', '1', '2', '3', '5'].includes(type)).map(type => {
			return {
				type: parseInt(type),
				name: BilltypeMap[type]
			}
		})
		billtypeList.unshift({type: -1, name: '全部类型'})
		let billstatusList = Object.keys(BillStatusMap).map(status => {
			return {
				status: parseInt(status),
				name: BillStatusMap[status]
			}
		})
		billstatusList.unshift({status: -1, name: '全部状态'})
		return {
			loading: true,
			dialogVisible: false,
			recordData: [],
			consumeDateType: 0, // 消费时间类型 (0: 最近半年  1: 从开卡开始)
			startDate: '', // 开始日期
			endDate: '', // 结束日期
			memberCardId: undefined, // 选中的会员卡id
			openCardTime: 0, // 开卡时间 (毫秒数)
			disabledFromOpenCard: false, // 从开卡开始 disabled
			disabledForward: false, // 往前半年 disabled
			disabledBack: true, // 往后半年 disabled
			disabledLately: true, // 最近半年 disabled
			queryData: {
				pageNum: 1,
				pageSize: 99999,
				memberid: this.$route.params.id,
				shopid: undefined,
				billstatus: -1, // 单据状态
				billtype: -1, // 消费类型
				timeUnLimit: 1,
			},
			cardList: [], // 所有的会员卡
			billstatusList,
			billtypeList,
			printColumnList: [
				{label: '单号', prop: 'billno'},
			],
			columnList: [
				{ label: "类型", prop: 'billtype', attrs: {'width': '90'}},
				{ label: "消费金额", prop: "expense", attrs: {'width': '90'}},
				{ label: "消费门店", prop: "consumeshopname", attrs: {'width': '160', 'show-overflow-tooltip': true}},
				{ label: "消费时间", prop: "createDate", attrs: {'width': '96'}},
				{ label: "状态", prop: "billstatus", attrs: {'width': '90', formatter: this.formatterBillstatus}},
				{ label: "备注", prop: "comment", attrs: {'min-width': '160', 'show-overflow-tooltip': true}}
			],
			contentData: null
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
		this.startDate = Dayjs(new Date().setMonth(new Date().getMonth() - 6)).format(DateFormat)
		this.endDate = Dayjs(new Date()).format(DateFormat)
		this.$parent.root.getMemberDetail().then(content => {
			this.queryData.shopid = content.memberInfo.shopid
			this.cardList = content.cards
			if (this.cardList.length) {
				const {id, opendate} = this.cardList[0]
				this.memberCardId = id
				this.openCardTime = opendate
			}
			if (new Date(this.openCardTime).getTime() >= new Date(this.startDate).getTime() && new Date(this.openCardTime).getTime() <= new Date(this.endDate).getTime()) {
				this.disabledForward = true
			}
			this.loading = false
		})
	},
	computed: {
		cardMap() {
			let result = {}
			if (this.cardList.length) {
				this.cardList.forEach(card => {
					const {id} = card
					result[parseInt(id)] = card
				})
			}
			return result
		}
	},
	methods: {
		handleChangeCard(memberCardId) {
			this.openCardTime = this.cardMap[memberCardId].opendate
			this.startDate = Dayjs(new Date().setMonth(new Date().getMonth() - 6)).format(DateFormat)
			this.endDate = Dayjs(new Date()).format(DateFormat)
		},
		formatterBillstatus(row) {
			const {billstatus} = row
			if (billstatus === '已销单') {
				return <span class="xiaodan">{billstatus}</span>
			} else {
				return billstatus
			}
		},
		// 从开卡开始
		goFromOpenCard() {
			this.disabledFromOpenCard = true
			this.disabledForward = true
			this.disabledBack = false
			this.disabledLately = false
			this.startDate = Dayjs(this.openCardTime).format(DateFormat)
			const endDate = new Date(this.openCardTime).setMonth(new Date(this.openCardTime).getMonth() + 6)
			this.endDate = Dayjs(endDate).format(DateFormat)
		},
		// 往前半年
		goForward() {
			if (this.disabledForward || new Date(this.startDate).getTime() < new Date(this.openCardTime).getTime()) {
				this.disabledForward = true
				this.$message.warning('查询时间不得小于开卡时间')
				return
			}
			this.disabledFromOpenCard = false
			this.disabledBack = false
			this.disabledLately = false
			this.endDate = this.startDate
			this.startDate = Dayjs(new Date(this.startDate).setMonth(new Date(this.startDate).getMonth() - 6)).format(DateFormat)
		},
		// 往后半年
		goBack() {
			if (this.disabledBack || new Date(this.endDate).getTime() > new Date().getTime()) {
				this.disabledBack = true
				this.$message.warning('查询时间不得大于当前时间')
				return
			}
			this.disabledFromOpenCard = false
			this.disabledForward = false
			this.disabledLately = false
			this.startDate = this.endDate
			this.endDate = Dayjs(new Date(this.endDate).setMonth(new Date(this.endDate).getMonth() + 6)).format(DateFormat)
		},
		// 最近半年
		goLatelyHalfYear() {
			this.disabledFromOpenCard = false
			this.disabledForward = false
			this.disabledBack = true
			this.disabledLately = true
			this.startDate = Dayjs(new Date().setMonth(new Date().getMonth() - 6)).format(DateFormat)
			this.endDate = Dayjs(new Date()).format(DateFormat)
		},
		onQuery() {
			this.getData();
		},
		getData() {
			const postData = {
				...this.queryData,
				memberCardId: this.memberCardId,
				startDate: this.startDate,
				endDate: this.endDate
			}
			this.loading = true;
			this.$http.post('/member!queryMemberBillListnew.action', postData).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content && resData.content.forEach(item => {
						const {billtype, expense, consumeshopname, createDate, billstatus, comment} = item
						item.billtype = this.getBilltype(item)
						item.expense = Number(expense).toFixed(2)
						item.consumeshopname = consumeshopname ? consumeshopname : '--'
						item.createDate = this.lastconsumetimeDecorator(createDate)
						item.billstatus = BillStatusMap[billstatus]
						item.comment = comment ? comment : '--'
					})
					this.contentData = resData.content
				}	
			}).catch(() => {
				this.loading = false;
			})
		},
		// 格式化消费类型
		getBilltype(data) {
			const {billtype, consumeType} = data
			const newBilltypeMap = JSON.parse(JSON.stringify(BilltypeMap))
			newBilltypeMap[3] = '套餐购买'
			newBilltypeMap[5] = '年卡充值'
			if (billtype === 2) {
				if (!consumeType) {
					return '开卡充值'
				} else {
					return '续卡充值'
				}
			} else if (billtype === 6) {
				if (consumeType === 6) {
					return '年卡销售'
				} else {
					return '年卡消费'
				}
			} else {
				return newBilltypeMap[billtype]
			}
		},
		openBillDetail(data) {
			this.$http.post("/bill!detail.action", {
				parentShopId: Number(this.parentShopId),
				id: data.id
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
};
</script>

<style lang="less">
	.customer_consume_record {
		position: relative;
		padding: 20px 40px 0;
		height: 100vh;
		.consume_record_header {
			display: flex;
			justify-content: space-between;
			.title {
				font-size: 13px;
				color: #222;
				line-height: 2.4;
				font-weight: bold;
			}
			.card {
				.el-select {
					width: 154px;
				}
			}
			.billstatus,
			.billtype {
				.el-select {
					width: 98px;
				}
			}
			.button_group {
				.el-form-item__content {
					.el-button {
						float: left;
						margin-left: 0;
						padding-left: 10px;
						padding-right: 10px;
						border-radius: 0;
						&.first {
							border-radius: 3px 0 0 3px;
						}
						&.center {
							border-left: none;
							border-right: none;
						}
						&.last {
							border-radius: 0 3px 3px 0;
						}
						.iconfont {
							color: #B4BCCC;
						}
						&.is-grey {
							background: #f2f2f2;
							border-color: #DCDFE6;
							cursor: auto;
						}
					}
					.wrapper {
						float: left;
						padding: 0 2px;
						height: 33.6px;
						background:rgba(242,242,242,1);
						border: 1px solid #dcdfe6;
						font-size: 12px;
						color: #333;
					}
				}
			}
		}
		.consume_record_content {
			.consume_record_content-empty {
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
			.xiaodan {
				color: #DA3D4D;
			}
		}
	}
	.el-tooltip__popper {
		max-width: 400px;
	}
</style>