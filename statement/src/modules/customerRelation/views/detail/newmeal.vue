<template>
    <div class="newmeal">
		<div class="basetitle">
			<span>套餐</span>
			<el-select v-model="activetab" placeholder="请选择" class="shai" @change="changeTab">
				<el-option
					v-for="item in tabList"
					:key="item"
					:label="item"
					:value="item">
				</el-option>
			</el-select>
		</div>
        <div class="mlist list" v-for="(item, index) in (keys == 0 ? mealListdata : keys == 1 ? ysetMeal : keys == 2 ? gsetMeal : mealListdata)" :key="index">
			<div class="dian nowarp shoptip">
				<span class="shoptipred">
					<am-icon size="14px" name="Group2" class="gary"></am-icon>
				</span>{{item[0].data[0].treatShopName}}
			</div>
			<div v-for="sub in item" class="list">
				<p class="mname">{{sub.treatPackageId == -1 ? '自由組合套餐' : sub.treatPackageName}}</p>
				<div class="mtclist" v-for="subItem in sub.data">
					<span class="listtip">
						
						<div class="mealIcon"><b v-if="subItem.treattype == 1"><am-icon size="16px" name="zengsong" class="icon"></am-icon></b>{{subItem.itemname}}</div>
						<div :class="keys == 1 ? 'usedyou' : 'listyou'" v-if="keys == 1">已用完
							<span class="used" @click="mealoperation(subItem, 0)">
								<am-icon size="16px" name="xiaofeijilu"></am-icon>  消耗记录
							</span>
						</div>
						
						<div class="mealtotal" v-if="keys == 0 || keys == 2">套餐余量：<b v-if="subItem.sumtimes > 0">余<b class="red">{{subItem.leavetimes}}</b>次 / 共<b class="totalnum">{{subItem.sumtimes}}</b>次</b><b v-if="subItem.sumtimes < 0">不限次</b></div>
					</span>
					<span class="listnum">
						<div class="dian colorbg" v-if="keys == 0">
							<span class="youxiao">有效期至：</span>
							<b v-if="hasEditExpireDate" @click="showUpdatePopper({key: 'validdate', data: subItem, type: 'datepicker'}, $event)" class="youxiaotip is_edit">{{subItem.validdate ? subItem.validdate : '不限期'}}</b>
							<b v-else class="youxiaotip">{{subItem.validdate ? subItem.validdate : '不限期'}}</b>
						</div>
						<div class="dian getbuy" v-if="keys == 0">购买于{{subItem.buyDate}}，</div>
						<div class="dian red" v-if="keys == 2" @click="tcremarks(subItem)">已于
							<b v-if="hasEditExpireDate" class="youxiaotip is_edit" @click="showUpdatePopper({key: 'validdate', data: subItem, type: 'datepicker'}, $event)">{{subItem.validdate ? subItem.validdate : '不限期'}}</b>
							<b v-else class="youxiaotip">{{subItem.validdate ? subItem.validdate : '不限期'}}</b>
							过期，
						</div>
						<div class="mealye" v-if="keys != 1">单次消耗业绩：￥{{subItem.oncemoney}}</div>
						
					</span>
					<span class="moreperate" v-if="keys == 2">
						<el-dropdown placement="bottom">
							<span class="el-dropdown-link" v-if="keys == 2 && subItem.leavetimes > 0">
								<am-icon size="16px" name="bianji2" class="gary more pointer"></am-icon>
							</span>
							<span class="el-dropdown-link disabled" v-else>
								已用完
							</span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item @click.native="mealoperation(subItem, 0)"><am-icon size="16px" name="xiaofeijilu"></am-icon>  消耗记录</el-dropdown-item>
								<el-dropdown-item @click.native="mealoperation(subItem, 1)" v-if="tuikuan"><am-icon size="16px" name="tuikuan"></am-icon>  套餐退款</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</span>
					<span class="moreperate" v-if="keys != 1 && keys != 2">
						<el-dropdown placement="bottom">
							<span class="el-dropdown-link">
								<am-icon size="16px" name="bianji2" class="gary more pointer"></am-icon>
							</span>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item @click.native="mealoperation(subItem, 0)"><am-icon size="16px" name="xiaofeijilu"></am-icon>  消耗记录</el-dropdown-item>
								<el-dropdown-item @click.native="mealoperation(subItem, 1)" v-if="tuikuan"><am-icon size="16px" name="tuikuan"></am-icon>  套餐退款</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</span>
					<p class="beizhuline">
						<span>备注：
							<b @click="showUpdatePopper({key: 'itemRemark', data: subItem, type: 'textarea'}, $event)" class="bold">
								<span class="renowarp">{{subItem.itemRemark}}</span>
								<am-icon size="12px" name="fanganbianji" class="gary"></am-icon>
							</b>
						</span>
					</p>
				</div>
			</div>
		</div>
		<div class="mealIcondata" v-if="ysetMeal.length == 0 && keys == 1">
			<div class="am_empty_tips-icon">
				<am-icon size="40px" name="wushuju"></am-icon>
			</div>
			<p class="tips-text">
				<slot name="text">还没有任何已使用套餐~</slot>
			</p>
		</div>
		<div class="mealIcondata" v-if="gsetMeal.length == 0 && keys == 2">
			<div class="am_empty_tips-icon">
				<am-icon size="40px" name="wushuju"></am-icon>
			</div>
			<p class="tips-text">
				<slot name="text">还没有已过期套餐~</slot>
			</p>
		</div>
		<div class="mealIcondata" v-if="mealListdata.length == 0 && keys == 0">
			<div class="am_empty_tips-icon">
				<am-icon size="40px" name="wushuju"></am-icon>
			</div>
			<p class="tips-text">
				<slot name="text">还没有购买过任何套餐~</slot>
			</p>
		</div>
		<verifiy-modal v-if="verVisible" @editbei="editbei"></verifiy-modal>
    </div>
</template>
<script>
import Api from '@/api'
import VerifiyModal from "#/components/verifiy-modal";
export default {
	name: 'newmeal',
	props: ['mealListdata', 'ysetMeal', 'gsetMeal', 'hasEditExpireDate', 'locking'],
	components: {
		VerifiyModal
	},
	data() {
		return {
			verVisible: false,
			keys: 0,
			modfiycard: {
				you: '',
				bei: ''
			},
			visibleabledate: false,
			visiblemarks: false,
			you: '', // 有效期
			activetab: '套餐余量',
			tabList: [
				'套餐余量',
				'已使用',
				'已过期'
			],
			mealinfo: {}, // 存储修改信息
			menuItems: [], // 套餐
			tuikuan: false,
		}
	},
	async mounted() {
		const res = await Api.getMetaData();
		this.initLoading = false;
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		this.tuikuan = this.$eventBus.env.userInfo.operateStr.indexOf('a7') > -1 ? false : true
	},
	methods: {
		showUpdatePopper(params, $event) {
			this.$emit('update-combo', params, $event);
		},
		// 转化汉字为两个字符
		changeCharacter(val) {
			var len = 0;
			for (var i = 0; i < val.length; i++) {
				var a = val.charAt(i);
				if (a.match(/[^\x00-\xff]/ig) !== null) {
					len += 2;
				} else {
					len += 1;
				}
			}
			return len;
		},
		close() {
			this.visiblemarks = false;
		},
		// 显示套餐
		tcremarks(data) {
			this.modfiycard.you = data.validdate
			this.modfiycard.bei = data.itemRemark
		},
		changeTab(value) {
			if (value === '套餐余量') {
				this.keys = 0
			} else if (value === '已使用') {
				this.keys = 1
			} else {
				this.keys = 2
			}
			return this.keys
			
		},
		mealoperation(item, index) {
			if (index === 1) {
				if (this.locking === 2 && this.$eventBus.env.userInfo.operateStr.indexOf('U,') === -1) {
					this.$message.warning('会员被锁定,请在会员详情解锁。')
				} else {
					this.$emit("mealoperation", item, index)
				}
			} else {
				this.$emit("mealoperation", item, index)
			}
		},
		udpTreatComment(sub, bei) {
			if (this.modfiycard.bei.length > 100) {
				this.$message.info("请输入0-100个字符备注内容！")
			} else {
				this.menuItems = []
				this.menuItems.push("修改套餐备注");
				this.verVisible = true
				this.mealinfo = sub
				sub.visiblemarks = false;
			}
		},
		// 修改备注, 修改套餐有效期
		editbei(code) {
			if (this.menuItems[0] === "修改套餐有效期") {
				this.$emit("udpTreatValidDate", this.mealinfo, this.modfiycard.you, code)
				
			} else if (this.menuItems[0] === "修改套餐备注") {
				this.$emit("udpTreatComment", this.mealinfo, this.modfiycard.bei, code)
			}
			this.verVisible = false
		},

		// 修改套餐有效期
		udpTreat(sub, you) {
			if (this.$eventBus.env.userInfo.operateStr.indexOf('Z,') > -1) {
				if (!this.modfiycard.you) {
					this.$message.info("有效期不能为空")
				} else {
					this.menuItems = []
					this.menuItems.push("修改套餐有效期");
				}
				this.verVisible = true
				this.mealinfo = sub
				sub.visibleabledate = false;
			} else {
				this.$message.warning("无权限修改套餐有效期")
				sub.visibleabledate = false;
			}
		}
	}
}
</script>
<style lang="less">
.newmeal {
	margin: 23px 40px;
	.basetitle {
		width:100%;
		height:17px;
		font-size:13px;
		font-weight:bold;
		color:rgba(34,34,34,1);
		line-height:17px;
		margin-bottom: 10px;
		.shai {
			cursor: pointer;
			float: right;
			outline: none;
			color: #409EFF;
			width: 100px;
			margin: 0px 0px 10px 0px;
			input {
				border: none !important;
				margin-top: -5px;
				color: #409EFF;
				text-align: right;
			}
			span i{
				color: #409EFF !important;
			}
		}
	}
	.mlist {
		.shoptip {
			padding: 10px 0px;
			color: #909090;
			.shoptipred {
				height: 18px;
				width: 18px;
				background: #C5C5C5;
				border-radius: 50%;
				display: inline-block;
				line-height: 18px;
				text-align: center;
				margin-right: 8px;
			}
			i {
				text-align: center;
				color: #fff !important;
			}
		}
        .list {
			background:rgba(255,255,255,1);
			border-radius:3px;
			border:1px solid rgba(240,241,245,1);
			margin-bottom: 10px;
			&:hover {
				box-shadow:0px 1px 10px 0px rgba(0,0,0,0.08);
			}
			&:hover .youxiaotip.is_edit {
				border-bottom: 2px dotted #E1E1E1;
			}
			.youxiaotip.is_edit {
				cursor: pointer;
			}
		}
		.beizhuline {
			border-bottom: 1px solid #f0f1f5;
			&:hover .gary {
				color: #409EFF;
			}
		}
		.renowarp {
			max-width: 506px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			display: inline-block;
			vertical-align: middle;
			margin-right: 5px;
		}
		.mname {
			margin: 14px 0px 4px 0px;
			border-left: 3px solid rgba(144,31,139,1);
			color: #901F8B;
			text-indent: 16px;
			height: 16px;
		}
		.mtclist {
			margin: 10px 10px 0px 18px;
			position: relative;
			&:last-child p {
				border: none;
			}
			p {
				color: #909090;
			}
			.dian {
				color: #909090;
				text-align: left;
				.gary {
					margin-right: 5px;
				}
			}
			.listtip {
				width: 100%;
				float: left;
				.mealIcon {
					color: #222222;
					font-size: 13px;
					padding: 0px 0px 10px;
					font-weight: bold;
					width: 50%;
    				float: left;
					b {
						width: 16px;
						height: 16px;
						line-height: 16px;
						font-size: 12px;
						display: inline-block;
						font-weight: normal;
						border-radius: 50%;
						color: #F0F1F5;
						text-align: center;
						margin-right: 5px;
						color: #222222;
						i {
							color: #EE3231;
						}
					}		
				}
				.mealtotal {
					text-align: right;
					padding-right: 30px;
					.red {
						color: #DA3D4D;
					}
					.totalnum {
						color: #333;
					}
				}
			}
			.listnum:nth-of-type(2) {
				width: 100%;
				float: left;
				.mealye {
					color: #909090;
					font-size: 12px;
					padding: 0px 0px 10px 0px;
					float: left;
				}
				.getbuy {
					padding-left: 25px;
				}
				.colorbg {
					color: #333 !important;
				}
				.dian {
					float: left;
					// cursor: pointer;
					// .youxiao {
					// 	cursor: pointer;

					// }
					.youxiaotip {
						font-weight: normal;
					}
				}
				.red {
					color: #DA3D4D;
				}
			}
			.moreperate {
				cursor: pointer;
				position: absolute;
				top: 0;
				right: 0;
				&:hover .pointer {
					color: #409EFF;
				}
			}
			.usedyou {
			    width: 45%;
				display: inline-block;
				text-align: right;
				margin: 0px 0px 0px 10px;
				color: #909090;
				.used {
					margin-left: 30px;
					cursor: pointer;
					&:hover {
						color: #409EFF;
					}
				}
			}
			.listyou:nth-of-type(3) {
				width: 30%;
				float: left;
				margin-left: 2%;
				.mealtotal {
					color: #222222;
					font-size: 13px;
					padding: 0px 0px 10px;
					text-align: right;
					b {
						color: #222222;
					}
				}
				.gary {
					color: #909090;
				}
				.red {
					color: #DA3D4D;
				}
				b {
					font-weight: normal;
					cursor: pointer;
					color: #222222;
				}
			}
			span:nth-of-type(4) {
				width: 3%;
				text-align: right;
				padding-left: 2%;
				.pointer {
					cursor: pointer;
				}
			}
			p {
				padding: 10px 0px;
				clear: both;
				b {
					font-size: 12px;
					color: #909090;
					font-weight: normal;
					cursor: pointer;
				}
			}
		}
		.ku {
			padding: 10px 18px 5px;
			width: 100%;
			.kulist {
				padding: 0px;
				overflow: hidden;
				span:nth-of-type(1) {
					width: 60%;
					float: left;
					font-size: 13px;
					color: #333;
					padding: 0px;
				}
				span:nth-of-type(2) {
					width: 40%;
					float: left;
					font-size: 13px;
					color: #333;
					padding: 0px;
					b {
						font-size: 12px;
						font-weight: normal;
						color: #909090;
						margin-left: 18px;
					}
				}
			}
		}
	}
	.mealIcondata {
		width: 100%;
		border-radius: 3px;
		border: 1px solid #F0F1F5;
		text-align: center;
		margin-top: 10px;
		.am_empty_tips-icon {
			padding: 20px 0px 5px;
			color: #A3A8AB;
		}
		.tips-text {
			color: #A9A9A9;
			padding: 0px 0px 20px;
		}
	}
}
.disabled {
    pointer-events: none;
    cursor: default;
}
// 修改popover样式
.remarksbg {
	width: 400px !important;
	.el-form {
		width: 372px !important;
		.el-form-item {
			margin-bottom: 5px !important;
		}
	}
	b {
		font-weight: normal;
	}
}

</style>
