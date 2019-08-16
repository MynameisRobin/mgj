<template>
	<div class="customer_detail_wrap" v-loading="loading">
		<!-- 菜单 -->
		<div class="customer_detail_menu">
			<el-menu :default-active="$route.name" theme="dark" router>
				<el-menu-item
					v-for="(item, index) in menuList" 
					:key="index"
					:index="item.route.name || item.label"
					:route="item.route"
					@click="routeChange(item)"
					>
					<am-icon size="14px" :name="item.icon" class="icon" v-if="index != 1 && index != 2 && index != 3"></am-icon>
					{{item.label}}
				</el-menu-item>
			</el-menu>
		</div>

		<!-- 内容 -->
		<div class="customer_detail_main">
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import Api from '@/api'
export default {
	name: 'customerDetail',
	data() {
		return {
			isactive: false,
			menuList: [
				{
					label: '基本资料',
					icon: 'mbinfo_jbzl_icon',
					route: {name: 'customerBasics'},
				},
				{
					route: {name: 'customerBasicsCard'},
					label: '会员卡',
				},
				{
					route: {name: 'customerMeal'},
					label: '套餐',
				},
				{
					route: {name: 'customerBasicsArrears'},
					label: '欠款',
				},
				{
					route: {name: 'customerArchives'},
					icon: 'mbinfo_gkda_icon',
					label: '顾客档案'
				},
				{
					route: {name: 'customerWorks'},
					icon: 'mbinfo_zp_icon',
					label: '作品'
				},
				{
					route: {name: 'cunstomerConsumeRecord'},
					icon: 'mbinfo_xfjl_icon',
					label: '消费记录'
				},
				{
					route: {name: 'customerCardChange'},
					icon: 'mbinfo_jfbd_icon',
					label: '卡金变动'
				},
				{
					route: {name: 'customerLuckyMoney'},
					icon: 'mbinfo_hb_icon',
					label: '红包'
				},
				{
					route: {name: 'customerAppointmentHistory'},
					icon: 'mbinfo_yyls_icon',
					label: '预约历史'
				},
				{
					route: {name: 'customerPointChange'},
					icon: 'mbinfo_jfbd_icon',
					label: '积分变动'
				},
				{
					route: {name: 'customerMallOrder'},
					icon: 'mbinfo_scdd_icon',
					label: '商城订单'
				},
				{
					route: {name: 'customerPrivilege'},
					icon: 'mbinfo_tqk_icon',
					label: '特权卡'
				},
				{
					route: {name: 'customerOperationRecord'},
					icon: 'mbinfo_czjl_icon',
					label: '操作记录'
				}
			],
			memberDetail: null,
			loading: false,
			root: null,
			getQueueList: [],
			scroll: ''
		}

	},
	async created() {
		this.root = this;
	},
	mounted: function () {
		window.addEventListener('scroll', this.handleScroll, true)
	},
	methods: {
		rejectQueue(data) {
			this.getQueueList.forEach(item => {
				item.reject(data);
			})
			this.getQueueList = [];
		},
		resolveQueue(data) {
			this.getQueueList.forEach(item => {
				item.resolve(data);
			})
			this.getQueueList = [];
		},
		updateMemberInfoByKey(key, value) {
			this.memberDetail.memberInfo[key] = value;
		},
		updateMemberDetailByKey(key, value) {
			this.memberDetail[key] = value;
		},
		updateMemberDetail(data) {
			this.memberDetail = data;
		},
		getMemberDetail() {
			return new Promise(async (resolve, reject) => {
				if (this.memberDetail) {
					resolve(this.memberDetail)
					return;
				}
				if (this.loading) {
					this.getQueueList.push({
						resolve,
						reject
					});
					return;
				}
				this.loading = true;
				Api.getMetaData().then(res => {
					const resData = res.data;
					const { code, content } = resData;
					if (code === 0) {
						this.$eventBus.env = {
							...content
						}
						const {
							userId,
							parentShopId,
							shopId
						} = content.userInfo;
						return this.$http.post('/memberDetail!detail.action', {
							memberid: this.$route.params.id,
							empId: userId,
							parentShopId,
							shopId
						});
					} else {
						this.loading = false;
						this.rejectQueue(resData);
						reject(resData);
					}
				}).then(res => {
					this.loading = false;
					const resData = res.data;
					const { code, content } = resData;
					if (code === 0) {
						this.memberDetail = content;
						resolve(content);
						this.resolveQueue(content);
					} else {
						this.rejectQueue(resData);
						reject(resData);
					}
				}).catch((error) => {
					this.rejectQueue(error);
					reject(error);
				})
			})
		},
		// 滚动实现左边tab对应显示
		handleScroll: function () {
			const ele = document.querySelector(".customer_profile_basics")
			const basicdata = document.querySelector(".basicdata")
			const customerobj = document.querySelector(".membercard")
			const newmeal = document.querySelector(".newmeal")
			let scrollconetnt = ele && ele.scrollTop;
			let basicdatabox = basicdata && basicdata.scrollHeight;
			let customerobjbox = customerobj && customerobj.scrollHeight;
			let newmealbox = newmeal && newmeal.scrollHeight;
			let documentClientHeight = document.documentElement.clientHeight ||  window.innerHeight;
			let customerobjcon = customerobj && customerobj.getBoundingClientRect().top;
			let newmealcon = newmeal && newmeal.getBoundingClientRect().top;
			let that = this
			if (ele || basicdata || customerobj || newmeal) {
				if (scrollconetnt) {
					if (scrollconetnt < 20) {
						this.$router.push({
							name: 'customerBasics',
							params: {
								id: that.$route.params.id
							}
						})
					} else if (customerobjcon < 50 &&  customerobjcon > -30) {
						this.$router.push({
							name: 'customerBasicsCard',
							params: {
								id: that.$route.params.id
							}
						})
					} else if (newmealcon < 50 && newmealcon > -30) {
						this.$router.push({
							name: 'customerMeal',
							params: {
								id: that.$route.params.id
							}
						})
					}  else if ((customerobjbox + basicdatabox + newmealbox) - scrollconetnt > 200 && scrollconetnt - (customerobjbox + basicdatabox) > 0) {
						this.$router.push({
							name: 'customerBasicsArrears',
							params: {
								id: that.$route.params.id
							}
						})
					}
				}
			}
		},
		routeChange(data) {
			const basicdata = document.querySelector(".basicdata")
			const customerobj = document.querySelector(".membercard")
			const newmeal = document.querySelector(".newmeal")
			const ele = document.querySelector(".customer_profile_basics")
			if (basicdata || customerobj || newmeal || ele) {
				if (data.route.name === 'customerBasicsArrears') {
					ele.scrollTop = ele.scrollHeight;
				} else if (data.route.name === 'customerMeal') {
					ele.scrollTop = customerobj.scrollHeight + basicdata.scrollHeight;
				} else if (data.route.name === 'customerBasics') {
					ele.scrollTop = 0;
				} else if (data.route.name === 'customerBasicsCard') {
					ele.scrollTop =  basicdata.scrollHeight;
				}
			}
		}
	},
	destroyed: function () {
		window.removeEventListener('scroll', this.handleScroll);   //离开页面清除（移除）滚轮滚动事件
	}
}
</script>
<style lang="less">
.customer_detail_wrap {
	width: 1189px;
	min-height: 100vh;
	overflow: hidden;
}
.customer_detail_menu {
	width:156px;
	height: 100vh;
	background:rgba(248,248,248,1);
	float: left;
    .el-menu {
		border-right: none;
		background: #f8f8f8;
		height: 100vh;
		overflow-y: auto;
		&::-webkit-scrollbar {
			width: 1px; /*对垂直流动条有效*/
			height: 1px; /*对水平流动条有效*/
		}
		&::-webkit-scrollbar-track{
			-webkit-box-shadow: inset 0 0 6px #fcfbfb;
			background-color: #fcfbfb;
			border-radius: 1px;
		}
		.el-menu-item {
			line-height: 42px;
			height: 42px;
			font-size:12px;
			&:hover {
				background: #f4f4f4 !important;
			}
			&:nth-of-type(1) {
				margin-top: 11px;
			}
			&:nth-of-type(2),&:nth-of-type(3),&:nth-of-type(4) {
				text-indent: 28px;
			}
			&:hover {
				color: #90208C;
				font-weight: bold;
				background: #f4f4f4 !important;
			}
			&:hover i {
				color: #90208C !important;
			}
		}
	    .is-active {
			color: #90208C;
			font-weight: bold;
		}
		.icon {
			display: inline-block;
			vertical-align: initial;
			margin-right: 9px;
		}
	}
}
.customer_detail_main {
	float: left;
	width: calc(100% - 156px);
	box-shadow: 8px 0px 18px 0px rgba(0,0,0,0.11);
}
.customer_detail_menu .el-menu .el-menu-item {
	background: #f8f8f8;
}
</style>



