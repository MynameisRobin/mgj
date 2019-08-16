<template>
	<div class="customer_privilege" v-loading="initLoading">
		<div class="customer_privilege_wrapper" v-if="!initLoading">
			<div class="information_wrap">
				<h3>特权卡</h3>
				<div class="noCard" v-if="!mgjMallPrivilege">
					<am-icon class="icon_info" name="info"></am-icon>
					<div class="content">
						<p class="title">总部未开启特权卡功能</p>
						<p class="introduce">
							开通商城特权后，顾客可以以特权价购买商城的商品；也可以将特权二维码分享给好友使用，共享特权价。如配置了积分返利，好友使用特权卡产生消费后，顾客可获得积分返利；充分促进客带客。
						</p>
					</div>
				</div>
				<div class="noCard" v-if="!hasOpenCard && mgjMallPrivilege">
					<am-icon class="icon_info" name="info"></am-icon>
					<div class="content">
						<p class="title">此顾客还未开通商城特权卡</p>
						<p class="introduce">
							开通商城特权后，顾客可以以特权价购买商城的商品；也可以将特权二维码分享给好友使用，共享特权价。如配置了积分返利，好友使用特权卡产生消费后，顾客可获得积分返利；充分促进客带客。
						</p>
					</div>
				</div>
				<div class="openedCard" v-if="hasOpenCard && mgjMallPrivilege">
					<div class="tips">该顾客已开通商城特权卡</div>
					<div class="card">
						<div class="card_info">
							<span class="logo_wrapper">
								<img v-if="hasShopLogo" class="logo" :src="shopLogoSrc">
								<am-icon v-else style="color: #C4B294" name="Group2" size="16px"></am-icon>
							</span>
							<span class="shopName">{{userInfo.shopName}}</span>
						</div>
						<div class="card_intro">
							<p class="name">商城特权</p>
							<p class="expireDate" v-if="expireDate">{{expireDate}}到期</p>
							<p class="expireDate" v-else>永久有效</p>
						</div>
					</div>
				</div>
			</div>
			<div class="action_wrap" v-if="mgjMallPrivilege">
				<div class="tips" >
					<h4 class="tips" v-if="!hasOpenCard">为此顾客开通商城特权卡<span>商城特权开通的收入自动记录到【其他收入】</span></h4>
					<h4 class="tips" v-if="hasOpenCard && expireDate !== null">为此顾客延期商城特权卡<span>商城特权开通的收入自动记录到【其他收入】</span></h4>
				</div>
				<div class="option_wrap" v-if="!hasOpenCard || isTriggerCheckbox">
					<div class="option" v-for="(item, index) in privilegeSettings" :key="index" :class="{'checked': activeIndex === index}" @click="handleClick(item, index)">
						<div class="content">
							<span class="month">{{item.name}}</span>/<span class="price">{{item.privilegeOpenPrice}}元</span>
						</div>
						<am-icon class="icon_option unchecked" name="unchecked" size="16px" v-if="!item.status"></am-icon>
						<am-icon class="icon_option checked" name="checked" size="16px" v-else></am-icon>
					</div>
				</div>
				<div class="btn_wrap">
					<el-button type="primary" v-if="!hasOpenCard" @click="openCard">确认开通</el-button>
					<el-button type="primary" v-if="hasOpenCard && !isTriggerCheckbox && expireDate !== null" @click="triggerCheckbox">延期特权</el-button>
					<el-button type="primary" v-if="hasOpenCard && isTriggerCheckbox" @click="continueCard">确认延期</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Utils from '@/js/utils'
import MetaDataMixin from '#/mixins/meta-data'
import Dayjs from 'dayjs'
const DateFormat = 'YYYY-MM-DD'
export default {
	name: 'privilege',
	mixins: [
		MetaDataMixin,
	],
	data() {
		return {
			initLoading: true,
			mgjMallPrivilege: undefined,
			hasOpenCard: undefined,
			isTriggerCheckbox: false,
			activeIndex: 0,
			memberInfo: {},
			expireDate: '', // 特权卡到期时间
			privilegeId: undefined,
			privilegeSettings: [
				{"name": "一个月", "value": 1, "privilegeOpenPrice": 0, 'status': 1},
				{"name": "三个月", "value": 3, "privilegeOpenPrice": 0, 'status': 0},
				{"name": "半年", "value": 6, "privilegeOpenPrice": 0, 'status': 0},
				{"name": "一年", "value": 12, "privilegeOpenPrice": 0, 'status': 0},
				{"name": "不限期", "value": -1, "privilegeOpenPrice": 0, 'status': 0}
			],
			hasShopLogo: undefined,
			shopLogoSrc: ''
		}
	},
	created() {
		let configsList = this.$eventBus.env.configs
		for (let item of configsList) {
			// mgjMallPrivilege 判断租户是否开通了商城特权
			if (item.configKey === 'mgjMallPrivilege') {
				if (+item.configValue && +this.userInfo.mgjversion === 3) {
					this.mgjMallPrivilege = true
				} 
			}

			if (item.configKey === 'mgjPrivilegeSettings') {
				console.log('特权卡配置', item)
				if (item.configValue) {
					this.privilegeSettings = JSON.parse(item.configValue)
					this.privilegeSettings.forEach((item, index) => {
						if (!index) {
							item.status = 1
						} else {
							item.status = 0
						}
					})
				}
				// if (!item.configValue || !JSON.parse(item.configValue).length) {
				// 	this.privilegeSettings = [
				// 		{"name": "一个月", "value": 1, "privilegeOpenPrice": 0, 'status': 1},
				// 		{"name": "三个月", "value": 3, "privilegeOpenPrice": 0, 'status': 0},
				// 		{"name": "半年", "value": 6, "privilegeOpenPrice": 0, 'status': 0},
				// 		{"name": "一年", "value": 12, "privilegeOpenPrice": 0, 'status': 0},
				// 		{"name": "不限期", "value": -1, "privilegeOpenPrice": 0, 'status': 0}
				// 	]
				// } else {
				// 	this.privilegeSettings = JSON.parse(item.configValue)
				// 	this.privilegeSettings.forEach((item, index) => {
				// 		if (!index) {
				// 			item.status = 1
				// 		} else {
				// 			item.status = 0
				// 		}
				// 	})
				// }
			}
			if (item.configKey === 'v4_tenantLogo') {
				this.shopLogoSrc = `http://testresource.meiguanjia.net/tenant/${this.parentShopId}/${item.configValue}`
				this.hasShopLogo = this.isHasImg(this.shopLogoSrc)
				console.log('hasShopLogo', this.hasShopLogo)
			}
		}
		this.$parent.root.getMemberDetail().then(content => {
			this.memberInfo = content.memberInfo
			this.hasOpenCard = this.memberInfo.privilege ? true : false
			if (this.hasOpenCard) {
				this.expireDate = this.memberInfo.privilege.expireDate ? Dayjs(this.memberInfo.privilege.expireDate).format(DateFormat) : null
			}
			this.initLoading = false
			this.privilegeId = this.hasOpenCard ? this.memberInfo.privilege.id : null
		})
	},
	methods: {
		isHasImg(pathImg) {
			let ImgObj = new Image()
			ImgObj.src = pathImg
			if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
				return true
			} else {
				return false
			}
		},

		handleClick(item, index) {
			this.activeIndex = index;
			this.privilegeSettings.forEach(item => item.status = 0)
			item.status = 1
		},
		openCard() {
			const checkedOption = this.privilegeSettings.filter(item => item.status === 1)[0]
			let validDate = new Date()
			const month = +checkedOption.value
			switch (month) {
				case 1:
					validDate.setMonth(validDate.getMonth() + 1)
					break;
				case 3:
					validDate.setMonth(validDate.getMonth() + 3)
					break;
				case 6:
					validDate.setMonth(validDate.getMonth() + 6)
					break;
				case 12:
					validDate.setMonth(validDate.getMonth() + 12)
					break;
				case -1:
					validDate = null
					break;			
				default:
					break;
			}
			const {shopid, id, name, mobile} = this.memberInfo
			const postData = {
				createtime: new Date().getTime(),
				expireDate: validDate ? validDate.getTime() : null,
				id: this.privilegeId,
				mobile: mobile,
				openShopId: this.shopId,
				optId: this.userId,
				optName: this.userInfo.userName,
				ownerId: id,
				ownerName: name,
				parentShopId: this.parentShopId,
				privilegeId: null,
				privilegeOpenPrice: checkedOption.privilegeOpenPrice,
				shopId: shopid,
				targetDate: validDate ? validDate.getTime() : null
			}
			this.$http.post('/memberDetail!addPrivilege.action', postData).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					const msg = validDate ? Dayjs(validDate).format(DateFormat) : '无限期'
					
					Utils.refresh()
					this.$message.success(`开通成功，特权卡有效期至${msg}`)
				} else {
					this.$message.error(resData.message);
				}	
			})
		},
		triggerCheckbox() {
			this.isTriggerCheckbox = true;
		},
		continueCard() {
			const checkedOption = this.privilegeSettings.filter(item => item.status === 1)[0]
			let validDate = new Date(this.memberInfo.privilege.expireDate)
			const month = +checkedOption.value
			switch (month) {
				case 1:
					validDate.setMonth(validDate.getMonth() + 1)
					break;
				case 3:
					validDate.setMonth(validDate.getMonth() + 3)
					break;
				case 6:
					validDate.setMonth(validDate.getMonth() + 6)
					break;
				case 12:
					validDate.setMonth(validDate.getMonth() + 12)
					break;
				case -1:
					validDate = null
					break;			
				default:
					break;
			}
			const {shopid, id, name, mobile} = this.memberInfo
			const postData = {
				expireDate: this.memberInfo.privilege.expireDate,
				id: this.privilegeId,
				mobile: mobile,
				openShopId: this.shopId,
				optId: this.userId,
				optName: this.userInfo.userName,
				ownerId: id,
				ownerName: name,
				parentShopId: this.parentShopId,
				privilegeId: null,
				privilegeOpenPrice: checkedOption.privilegeOpenPrice,
				shopId: shopid,
				targetDate: validDate ? validDate.getTime() : null
			}
			this.$http.post('/memberDetail!addPrivilege.action', postData).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					const msg = validDate ? Dayjs(validDate).format(DateFormat) : '无限期'
					
					Utils.refresh()
					this.$message.success(`延期成功，特权卡有效期至${msg}`)
				} else {
					this.$message.error(resData.message);
				}	
			})
		}
	} 
}
</script>

<style lang="less">
	.customer_privilege {
		padding: 26px 40px 0;
		height: 100vh;
		.information_wrap {
			margin-bottom: 40px;
			h3 {
				font-size: 13px;
				color: #222;
				margin-bottom: 20px;
			}
			.noCard {
				display: flex;
				padding: 16px 40px 0 16px;
				width:657px;
				height:91px;
				border-radius:2px;
				border:1px solid rgba(240,241,245,1);
				.icon_info {
					margin-right: 8px;
					font-size: 16px;
					color: #FC9252;
				}
				.content {
					font-size: 12px;
					.title {
						line-height: 1;
						margin-bottom: 10px;
						color: #FC9252;
					}
					.introduce {
						color: #999;
						line-height: 1.5;
					}
				}
			}
			.openedCard {
				.card {
					margin-top: 12px;
					width:225px;
					height:121px;
					padding: 12px 12px 0 12px;
					background: rgba(74,74,74,1) url('../../assets/img/diamond_card.png') no-repeat right bottom / 62px 95px;
					border-radius: 4px;
					box-shadow:0px 3px 5px 0px rgba(71,71,71,0.23);
					font-size: 12px;
					.card_info {
						margin-bottom: 10px;
						.logo_wrapper {
							display: inline-block;
							width: 29px;
							height: 29px;
							margin-right: 6px;
							border-radius: 50%;
							vertical-align: middle;
							background:rgba(93,90,84,1);
							overflow: hidden;
							text-align: center;
							line-height: 28px;
							.logo {
								width: 100%;
								height: 100%;
							}
						}
						.shopName {
							color:rgba(140,127,105,1);
						}
					}
					.card_intro {
						color: #D6C09D;
						text-align: center;
						.name {
							font-size: 14px;
							margin-bottom: 6px;
						}
					}
				}
			}
		}
		.action_wrap {
			.tips {
				span {
					margin-left: 12px;
					color: #999;
					font-weight: normal;
				}
			}
			.option_wrap {
				display: flex;
				margin: 30px 0;
				.option {
					position: relative;
					width:156px;
					padding: 14px;
					border-radius:2px;
					background: #fff url('../../assets/img/diamond_option.png') no-repeat right bottom / 53px 48px;
					border:1px solid rgba(240,241,245,1);
					cursor: pointer;
					&:hover {
						color: #1890FF;
						background-color: rgba(250,252,255,1);
					}
					&.checked {
						color: #1890FF;
						background-color: rgba(250,252,255,1);
					}
					& + .option {
						margin-left: 30px;
					}
					.content {
						line-height: 28px;
						.month {
							font-size: 16px;
						}
					}
					.icon_option {
						position: absolute;
						bottom: 4px;
						right: 4px; 
					}
					.checked {
						color: #409EFF;
					}
				}
			}
			.btn_wrap {
				margin-top: 20px;
			}
		}
	}
</style>
