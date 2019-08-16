<template>
	<div class="customer_appointment_history" v-loading="loading">
		<div class="history_top">
			<b>预约历史</b>
			<span class="limits" v-if="reservationReject == '1'">
				该顾客由于爽约次数太多被关闭了预约权限
				<el-button type="primary" @click="offReservationReject">开启预约权限</el-button>
			</span>
		</div>
		<empty-tips class="customer_works-emptylist" v-if="!historyList || historyList.length === 0"></empty-tips>
		<ul class="history_box" v-if="historyList && historyList.length > 0">
			<li v-for="(item, index) in historyList" :key="index">
				<img :src="item.empAvatar" alt="">
				<div class="box_info">
					<div class="info_left">
						<p><em class="info_left_distance">时间：</em><span>{{item.reservationTime}}</span></p>
						<p><em class="info_left_shouyi">手艺人：</em><span>{{item.empName}}</span></p>
						<p><em class="info_left_distance">项目：</em><span v-for="(itemsub, index) in item.name" :key="index">{{itemsub.name}}<b>、</b></span></p>
						<p><em class="info_left_distance">人数：</em>{{item.number}}人</p>
					</div>
					<div class="info_status">
						<p :class="status[item.status]">{{reservation[item.status]}}</p>
						<p v-if="item.status === 4 || item.status === 5">爽约</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
<script>
import Api from '@/api'
import EmptyTips from '#/components/empty-tips'
import Axios from '@/js/http'
import Dayjs from 'dayjs'
const DateFormat = 'YYYY-MM-DD HH:mm'
import MetaDataMixin from '#/mixins/meta-data'
import {getPicture, imgClass} from '@/utils/imgConfig';

export default {
	name: 'customerAppointmentHistory',
	mixins: [
		MetaDataMixin,
	],
	components: {
		EmptyTips
	},
	data() {
		return {
			loading: true,
			historyList: [],
			reservationReject: '',
			reservation: {
				0: '已预约',
				1: '已到店',
				2: '已取消',
				3: '已结算',
				4: '已逾期',
				5: '已逾期'
			},
			status: {
				0: 'block',
				1: 'green',
				2: 'gay',
				3: 'green',
				4: 'err',
				5: 'err'
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
		this.loading = true
		this.$parent.root.getMemberDetail().then(content => {
			this.loading = false
			this.memberData = content.memberInfo;
			this.reservationList(this.memberData.shopid)
		})
	},
	methods: {

		// 获取预约历史记录
		reservationList(shopId) {
			this.loading = true
			const uri = `/memberDetail!queryMemberReservation.action`;
			const data = {
				custId: Number(this.$route.params.id),
				shopId
			}
			Axios.post(uri, data).then(res => {
				this.loading = false
				const resData = res.data;
				if (resData.code === 0) {
					var myDate = new Date();
					const mycurrtime = myDate.getTime();
					resData.content && resData.content.forEach(item => {
						const {
							reservationTime,
							empName,
							categoryName,
							status,
							itemProp,
							name,
							number,
							empAvatar
						} = item;

						var arr = []
						for (let i in itemProp && JSON.parse(itemProp).items) {
							arr.push(itemProp && JSON.parse(itemProp).items[i]); // 属性
						}
						item.name = arr
						item.number = item.number > 3 ? "多" : item.number
						
						item.status = (mycurrtime - item.reservationTime) > 0 && item.status === 0 ? 4 : item.status;
						item.reservationTime = reservationTime ? Dayjs(reservationTime).format(DateFormat) : '';
						const avatar = getPicture(this.$eventBus.env.userInfo.userType !== 1 ? 'artisan' : 'manager', {
							itemData: {
								employeeId: item.empId,
								parentShopId: this.$eventBus.env.userInfo.parentShopId
							},
							filename: `${item.empId}.jpg`,
							suffix: 's'
						})
						item.empAvatar = avatar;
						return item
					})
					this.historyList = resData.content
					this.detail()
				} else {
					this.$message.warning(resData.message);
					this.loading = false
				}
			})
		},

		offReservationReject() {
			const uri = `/memberDetail!offReservationReject.action`;
			const data = {
				memId: Number(this.$route.params.id),
				shopId: this.memberData.shopid
			}
			Axios.post(uri, data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.reservationReject = "0";
					this.$message.success("开启预约权限成功");
				} else {
					this.$message.warning(resData.message);
				}
			})
		},

		detail() {
			// 调用会员详情接口获取 shopid
			this.$http.post('/memberDetail!detail.action', {
				memberid: this.$route.params.id,
				empId: this.$eventBus.env.userInfo.userId,
				parentShopId: this.parentShopId
			}).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.reservationReject = resData.content.memberInfo.reservationReject
				} else {
					this.$message.warning(resData.message);
				}	
			})
		}

		
	}
}
</script>
<style lang="less">
.customer_appointment_history {
	padding: 16px 42px;
	height: 100vh;

	.customer_works-emptylist {
		margin: 30% 0 0 50%;
		-webkit-transform: translateX(-50%);
		-ms-transform: translateX(-50%);
		transform: translateX(-50%);
	}
	.history_top {
		overflow: hidden;
    	padding-bottom: 17px;
		b {
			display: inline-block;
			line-height: 30px;
			font-size: 13px;
		}
		.limits {
			float: right;
			color: #909090;
			button {
				margin-left: 13px;
			}
		}
	}
	.history_box {
		overflow-y: auto;
		height: calc(100vh - 80px);
		// &::-webkit-scrollbar {
		// 	width: 1px; /*对垂直流动条有效*/
		// 	height: 1px; /*对水平流动条有效*/
		// }
		// &::-webkit-scrollbar-track{
		// 	-webkit-box-shadow: inset 0 0 6px #fcfbfb;
		// 	background-color: #fcfbfb;
		// 	border-radius: 1px;
		// }
		li {
			overflow: hidden;
			margin-bottom: 18px;
			img {
				width: 34px;
				height: 34px;
				background: url(../../assets/img/openbill-customer.png) no-repeat center center;
				display: inline-block;
				margin-right: 15px;
				border-radius: 50%;
				background-size: cover;
				background-color: #e4e7ed;
			}
			.box_info {
				position: relative;
				border:1px solid rgba(240,241,245,1);
				border-radius: 5px;
				float: right;
				width: calc(100% - 50px);
				&:before{
					position: absolute;
					content: "";
					width: 0;
					height: 0;
					left: -8px;
					top: 10px;
					border-right: 8px solid #eff1f5;
					border-top: 8px solid transparent;
					border-bottom: 8px solid transparent;
				}
				&:after{
					position: absolute;
					content: "";
					width: 0;
					height: 0;
					left: -6px;
					top: 10px;
					border-right: 8px solid #fff;
					border-top: 8px solid transparent;
					border-bottom: 8px solid transparent;
				}
				.info_left {
					width: 80%;
					float: left;
					padding: 11px 22px;
					.info_left_distance {
						font-style: normal;
						letter-spacing: 10px;
						width: 66px;
    					display: inline-block;
					}
					.info_left_shouyi {
						font-style: normal;
						letter-spacing: 3px;
						width: 66px;
    					display: inline-block;
					}
					p {
						line-height:20px;
						font-weight:500;
						color:rgba(34,34,34,1);
						font-size:12px;
						&:nth-of-type(3) {
							span:last-child {
								b {
									display: none;
								}
							}
						}
					}
					
				}
				.info_status {
					width: 20%;
					float: left;
					text-align: right;
					padding: 18px 18px 0px 0px;
					p {
						&:nth-of-type(1) {
							margin: 0px;
						}
						&:nth-of-type(2) {
							width:33px;
							height:17px;
							margin: 2px 2px 0px 0px;
						    color:rgba(144,144,144,1);
							background:rgba(241,241,241,1);
							border-radius:2px;
							float: right;
							text-align: center;
						}
					}
					.block {
						color: #222222;
					}
					.green {
						color: #51A661;
					}
					.gay {
						color: #909090;
					}
					.err {
						color: #DA3D4D;
					}
				}
			}
		}
	}
}
</style>
