<template>
    <div>
        <el-dialog
        title="套餐退款"
        :visible.sync="tvisible"
        @close="close"
        width="790"
		class="mealListtreat"
        >
		<div class="mealtoptreat">
			<p><span>{{Listdata.info.itemname}}</span><span class="total red_light" v-if="Listdata.info.leavetimes == '-99'">不限次</span><span class="total" v-if="Listdata.info.leavetimes != '-99'">余<b>{{Listdata.info.leavetimes}}</b>次 / 共{{Listdata.info.sumtimes}}次</span></p>
			<p><span>购买时间：{{Listdata.info.buyDate}}</span><span>总价：￥{{Listdata.info.summoney}}</span><span>单价: ￥{{Listdata.info.oncemoney}}</span><span v-if="Listdata.info.leavetimes != -99">剩余卡金余额: ￥{{Listdata.info.leavemoney}}</span></p>
		</div>
        <el-form :model="retreat" label-width="100px" class="demo-ruleForm">
            <el-form-item label="退款次数" prop="pass" v-if="Listdata.info.leavetimes != '-99'">
                <el-input type="number" class="distance" v-model="retreat.treatNum" min="1"></el-input> 次
            </el-form-item>
            <el-form-item label="退款金额" prop="checkPass">
                <el-input type="number"  class="distance"  v-model="retreat.treatMoney" min="0"></el-input> 元
            </el-form-item>

			<el-form-item label="退入会员卡" prop="type">
				<div class="win_input_card" @click="getcard">
					<b>{{cardinfo}}</b>
					<span class="icon_right"><i class="el-icon-arrow-down"></i></span>
				</div>
				<div class="showcardlist" v-if="cardslist && cardslist.length">
					<span class="arrbtn"></span>
					<ul>
						<li v-for="item in cardslist" @click="selectcard(item)">
							{{`${item.name} ${item.cardtypename}（${item.cardid}） 卡金：${item.cardfee}`}}
						</li>
					</ul>
				</div>
            </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="close">取 消</el-button>
            <el-button type="primary" @click="onOk()">确 定</el-button>
        </span>
        </el-dialog>
		<verifiy-modal v-if="verVisible" @reTreat="makesure" @closetv="close"></verifiy-modal>
    </div>
</template>
<script>
import VerifiyModal from "#/components/verifiy-modal";
export default {
	name: 'reTreat',
	data() {
		return {
			verVisible: false,
			retreat: {
				treatNum: 0,
				treatMoney: 0,
				inCardId: null,
			},
			cardinfo: '请选择一张卡',
			trcard: [],
			newcard: [],
			tvisible: false,
			cardVisible: false,
			cardslist: []
		}
	},
	props: ['Listdata', 'cards'],
	mounted() {
		this.init()
		this.newcard = this.cards && this.cards.filter((item, index) => {
			if (item.id === this.Listdata.info.memcardid) {
				return item
			}
		})
	},
	components: {
		VerifiyModal
	},
	methods: {
		init() {
			this.tvisible = true
		},
		getcard() {

			this.cardinfo = this.newcard && this.newcard[0] && `${this.newcard[0].name}${this.newcard[0].cardtypename}（${this.newcard[0].cardid}） 卡金：${this.newcard[0].cardfee}`
			if (this.cardinfo && this.cardinfo.length > 0) {
				this.retreat.inCardId = this.newcard && this.newcard[0].id
			} else {
				this.cardslist = this.cards && this.cards.filter((subitem, index) => {
					return subitem.timeflag !== 1 && subitem.cardtype !== 2
				})
			}
		},
		selectcard(data) {
			this.cardinfo = data && `${data.cardtypename}（${data.cardid}） 卡金：${data.cardfee}`
			this.retreat.inCardId = data.id
			this.cardVisible = false
			this.cardslist = []
		},
		onOk() {
			if (this.Listdata.info.cardtype === 2 || this.Listdata.info.timeflag === "1") { // 资格卡计次卡不能退
				this.$message.info('资格卡计次卡不能用来退套餐！');
				return false;
			} else if (!this.retreat.inCardId) {
				this.$message.info("请选择一张会员卡")
			} else if (this.retreat.treatNum <= 0 && this.Listdata.info.leavetimes !== -99) {
				this.$message.info("请输入退款次数")
			} else if (this.Listdata.info.leavetimes !== -99 && this.retreat.treatNum && Number(this.retreat.treatNum) > Number(this.Listdata.info.leavetimes)) {
				this.$message.info('您输入退套餐的次数大于剩余次数！');
				return false;
			} else if (!/^\d+$/.test(this.retreat.treatNum)) {
				this.$message.info('您输入退套餐的次数应该为正整数！');
				return false;
			} else if (this.Listdata.info.oncemoney && this.Listdata.info.leavetimes !== -99) { // 单次金额不为零 限制退款金额
				let treatNum = Number(this.retreat.treatNum) <= 0 ? 1 : Number(this.retreat.treatNum)
				if (Number(this.retreat.treatMoney) > (Number(this.Listdata.info.oncemoney) * treatNum)) {
					this.$message.info('限次的套餐，退款金额不能大于次数乘以单价！');
					return false;
				} else {
					this.verVisible = true
				}
			} else {
				let treatNum = Number(this.retreat.treatNum) <= 0 ? 1 : Number(this.retreat.treatNum)
				if (Number(this.retreat.treatMoney) > (Number(this.Listdata.info.oncemoney) * treatNum)) {
					this.$message.info('退款金额不能大于次数乘以单价！');
					return false;
				} else {
					this.verVisible = true
				}
			}
		},
		makesure(code) {
			this.$emit('returnTreatItems', this.retreat, code, this.Listdata.info.memcardid)
			this.verVisible = false
			this.close()
		},
		close() {
			this.tvisible = false
			this.$emit("close")
		}
	}
}
</script>
<style lang="less">
.mealListtreat {
    width: 1100px !important;
	.mealtoptreat {
        margin: 0px 20px 20px 20px;
        height: 64px;
		background:rgba(250,250,250,1);
		.el-input--suffix {
			width: 420px !important;
		}
		b {
			font-weight: normal;
			color: #EE3231;
		}
        p:nth-of-type(1) {
            font-size:14px;
            color:rgba(51,51,51,1);
            line-height:12px;
			padding: 14px;
			
            .total {
				float: right;
				padding-left: 10px;
			}
			.red_light {
				color: #EE3231;
			}
        }
        p:nth-of-type(2) {
            font-size:12px;
            color:rgba(144,144,144,1);
            line-height:12px;
            padding: 0px 14px 0px 14px;
            text-align: right;
            span {
                display: inline-block;
                padding-left: 10px;
			}
			span:nth-of-type(1) {
				float: left;
				padding-left: 0px !important;
			}
        }

	}
	.outcard {
		width: 420px;
		height: 32px;
		background: #fafafa;
		border-radius: 3px;
		text-align: center;
		margin: 0px 0px 0px 6px;
		i {
			float: right;
			margin-right: 10px;
			color: #909090;
			cursor: pointer;
		}
	}
	.win_input_card {
		width: 421px !important;
		height: 35px;
		border-radius: 3px;
		background: rgba(245,247,250,1);
		border-radius: 3px;
		line-height: 32px;
		margin-left: 9px;
		border: 1px solid rgba(220,223,230,1);
		b {
			font-weight: normal;
			text-align: left;
			display: inline-block;
			width: 360px;
			cursor: pointer;
			text-indent: 10px;
			color: #c0c4cc;
			font-size: 12px;
			text-overflow: ellipsis;
    		white-space: nowrap;
		}
		.icon_right {
			float: right;
			padding: 0px 10px 0px 0px;
			cursor: pointer;
			&:hover {
				color: #666 !important;
			}
		}
	}
	.showcardlist {
		border: 1px solid #f7f5f5;
		width: 418px;
		padding: 10px;
		border-radius: 5px;
		margin-top: 5px;
		position: absolute;
		left: 0px;
		background: #fff;
		box-shadow: 0 2px 5px 0 rgba(0,0,0,.15);
		.arrbtn {
			width: 0;
			height: 0;
			border-width: 0 10px 10px;
			border-style: solid;
			border-color: transparent transparent #fff;
			margin: 0px auto;
			position: absolute;
			top: -6px;
			left: 40px;
		}
		ul {
			max-height: 200px;
			overflow-y: auto;
			li {
				font-size: 12px !important;
			}
		}
		li:hover {
			background: #FAFAFA;
			cursor: pointer;
		}
	}
	.el-dialog__body {
		padding: 10px 0px;
    }
    .distance {
        width: 90px !important;
	}
	.gary {
		cursor: pointer;
	}
}
.cardchose {
	.el-dialog__body {
		margin: 0px 20px;
	}
	ul {
		li {
			height: 32px;
			line-height: 32px;
			border-bottom: 1px solid #f0f1f5;
			cursor: pointer;
			&:hover {
				background: #fafafa;
			}
		}
	}
}
</style>
