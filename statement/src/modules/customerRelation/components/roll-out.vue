<template>
    <el-dialog title="卡金转出" :visible.sync="rollvisible" width="30%" class="rollbox" @close="close">
        <div class="cardrollinfo">
			<li><span class="rolltit">转出卡号：</span><span>{{guanbi.cardid}} ({{guanbi.cardtypename}})</span></li>
			<li><span class="rolltit">卡金余额：</span><span>￥{{guanbi.cardfee}}</span></li>
			<li><span class="rolltit">开卡门店：</span><span>{{guanbi.shopname}}</span></li>
			<li><span class="rolltit">赠金余额：</span><span>￥{{guanbi.presentfee}}</span></li>
		</div>
		<ul class="cardform">
			<li>
				<span>转入卡号</span>
				<span>
					<el-input placeholder="输入会员手机号或姓名或卡号搜索" v-model="keyword">
					</el-input>
					<el-dropdown trigger="click" class="searchList" placement="bottom-start">
						<span><el-button slot="append" icon="el-icon-search" @click="searchcard"></el-button></span>
						<el-dropdown-menu slot="dropdown" class="searchshow">
							<el-dropdown-item :command="item" v-for="(item, index) in searchCardList" :key="index">{{item.value}}</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</span>
			</li>
			<li>
				<span>转入卡金</span>
				<span>
					<el-input
						class="distancecard"
						placeholder="请输入卡金">
					</el-input>
					元
				</span>
			</li>
			<li>
				<span>转入赠金</span>
				<span>
					<el-input
						class="distancecard"
						placeholder="请输入赠金">
					</el-input>
					元
				</span>
			</li>
		</ul>
		<div slot="footer" class="dialog-footer">
			<el-button @click="close">取 消</el-button>
			<el-button type="primary" @click="close">确 定</el-button>
		</div>
    </el-dialog>
</template>
<script>
import Api from '@/api'
export default {
	name: 'Rollout',
	props: ['guanbi', "searchCardList"],
	data() {
		return {
			rollvisible: true,
			keyword: '',
		}
	},
	mounted() {
		setTimeout(function () {
			console.log(this.searchCardList, "卡金转出")
		}, 500)
	},
	methods: {
		close() {
			this.visible = false
			this.$emit("close")
		},
		searchcard() {
			this.$emit("searchcard", this.keyword)
		},
	}
}
</script>

<style lang="less">
.rollbox {
	.el-dialog__body {
		padding: 0 !important;
	}
	.cardrollinfo {
		margin: 0px 20px;
		background: #FAFAFA;
		overflow: hidden;
		padding: 10px 20px;
		li {
			float: left;
			padding: 5px 0px 5px 0px;
			&:nth-child(odd) {
				width: 60%;
			}
			&:nth-child(even) {
				width: 40%;
			}
			.rolltit {
				color: #999999;
			}
		}
	}
	.cardform {
		margin: 0px 20px;
		overflow: hidden;
		padding: 10px 20px;
		li {
			padding: 10px 0px 10px 0px;
			.distancecard {
				width: 100px;
			}
		}
	}
}
</style>
