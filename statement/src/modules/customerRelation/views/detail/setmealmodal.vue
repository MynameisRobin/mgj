<template>
    <div>
        <el-dialog
        title="套餐消费记录"
        :visible.sync="visible"
		@close="close"
		class="mealList"
		width="65%"
        >
		<div class="mealtop">
			<span>{{Listdata.info.itemname}}</span>
			<span v-if="Listdata.info.sumtimes >= 0">余<b>{{Listdata.info.leavetimes}}</b>次 / 共{{Listdata.info.sumtimes}}次</span>
			<span v-if="Listdata.info.sumtimes < 0"><b>不限次</b></span>
		</div>
		<el-table
			:data="Listdata.list"
			border
			ref="singleTable"
			style="width: 100%"
			max-height="500"
			stripe>
			<el-table-column
			prop="BILLNO"
			width="180"
			label="单号">
			</el-table-column>
			<el-table-column
			prop="CONSUMETIME"
			label="消费日期">
			</el-table-column>
			<el-table-column
			prop="CONSUMETIMES"
			label="扣减次数">
			</el-table-column>
			<el-table-column
			prop="LOSTCONSUMETIMES"
			label="扣减后剩余">
				<template slot-scope="scope">
					<span type="text" size="small">{{scope.row.LOSTCONSUMETIMES >= 0 ? scope.row.LOSTCONSUMETIMES : '不限次'}}</span>
				</template>
			</el-table-column>
			<el-table-column
			prop="OPERATORNAME"
			label="操作者">
			</el-table-column>
			<el-table-column
			label="签名">
			    <template slot-scope="scope">
					<a href="javascript:;" @click="handleClick($event, scope.row)" ref="look">{{scope.row.BILLID ? '查看' : '--'}}</a>
				</template>
			</el-table-column>
		</el-table>
        </el-dialog>

    </div>
</template>
<script>
import Api from '@/api'
import {getPicture, imgClass} from '@/utils/imgConfig';
export default {
	name: 'setmealmodal',
	props: ['mealVisible', 'Listdata', 'memberData'],
	data() {
		return {
			look: true,
			visible: false
		}
	},
	mounted() {
		this.init()
	},
	methods: {
		init() {
			this.visible = true
		},
		close() {
			this.visible = false
			this.$emit("close")
		},
		async handleClick(e, row) {
			// 判断是否有签名
			const res = await Api.getMetaData();
			this.initLoading = false;
			const resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.$eventBus.env = {
					...content
				}
			}
			const updateTs = new Date().getTime();
			const avatar = getPicture("signaturebill", {
				itemData: {
					parentShopId: this.$eventBus.env.userInfo.parentShopId,
					shopId: this.Listdata.info && this.Listdata.info.shopid,
				},
				filename: `${row.BILLID}.jpg`,
			})
			let oImg = new Image();
			oImg.src = avatar;
			let that = this
			oImg.onload = function () {
				that.$alert(`<img src="${avatar}"></img>`, '查看签名', {
					dangerouslyUseHTMLString: true,
					customClass: "showimg"
				});
			}
			
			oImg.onerror = function () {
				e.target.innerHTML = "--"
				that.$message.info("该顾客没有留下签名")
			};
		},
	}
}
</script>
<style lang="less">
.mealList {
	.mealtop {
		margin: 0px 0px 20px 0px;
		color: #222;
		b {
			font-weight: normal;
			color: #EE3231;
		}
		span:nth-of-type(1) {
			display: inline-block;
			padding-right: 20px;
		}
	}
	.el-dialog__body {
		padding: 10px 20px 30px;
		tr > th {
			display: table-cell!important;
		}
	}
	table > th {
		display: table-cell!important;
		background: #FAFCFF;
    	color: #909090;
	}
	.current-row {
		opacity: 0;
	}
	table thead tr:nth-of-type(1) th {
		background-color: #fafcff;
	}

	.el-table--small td, .el-table--small th {
		padding: 6px 0;
	}

}
.showimg {
	width: 80% !important;
	img {
		width: 100%;
	}
}

</style>
