<template>
	<div class="wrap" @mouseleave="mouseleaveFun">
		<div v-if="enableStep === 0" class="searchDiv">
			<h2>算法搜索</h2>
			<el-input
				placeholder="请输入内容"
				v-model="searchVal" @input="searchValFun">
				<i style="color: #00a7d7; font-size: 20px;" slot="suffix" class="el-input__icon el-icon-search"></i>
			</el-input>

			<div v-show="searchVal !== '' " class="findEnd">
				<h3>找到了<span>{{showList.length}}条</span>记录</h3>
				<ul>
					<Item v-for="(item, key) in showList" :key="key" :item="item"></Item>
				</ul>
			</div>
		</div>

		<div v-if="enableStep === 1" class="stepDiv">
			<h2>达标梯度</h2>
			<ul>
				<li v-for="(item, key) in stepList" :key="key"
					@click="handleClick(item.name)">
					{{item.label}}
					<span class="iconSpan">
						<i class="icon iconfont mgj-xiangzuo"></i>
					</span>
				</li>
			</ul>
		</div>

	</div>
</template>

<script>
import Item from './item'
import Mixins from './mixins.js'
export default {
	name: 'fastNavItemsWrap',
	mixins: [Mixins],
	components: {
		Item
	},
	props: {
		fastSearchMap: Array,
		enableStep: Number
	},
	data() {
		return {
			showList: [],
			stepList: [],
			searchVal: ''
		}
	},
	mounted() {
		this.stepList = [...this.fastSearchMap];
	},
	methods: {
		mouseleaveFun() {
			this.$emit('showModelChange', 'Round');
		},
		searchValFun(val) {
			this.showList = [...this.fastSearchMap];
			this.showList = this.showList.filter(item => item.name.indexOf(val) !== -1);
		}
	}
}
</script>

<style lang="less" scoped>
	.wrap {
		padding: 15px 12px;
		background:rgba(255,255,255,1);
		box-shadow:0px 2px 15px 0px rgba(0,0,0,0.1);
		border-radius:4px;
	}
	.searchDiv {
		.findEnd {
			h3 {
				margin: 13px 0 15px;
				font-size: 12px;
				color: #909090;
				span {
					color: #333;
				}
			}
			ul {
				padding: 5px;
				max-height: 300px;
				overflow-y: scroll;
				&::-webkit-scrollbar {
					width: 5px;
				}
			}
		}
	} 
	h2 {
		font-size: 12px;
		margin-bottom: 12px;
	}
	.stepDiv {
		li {
			position: relative;
			width:120px;
			height:32px;
			line-height: 32px;
			margin-bottom: 10px;
			padding: 0 10px;
			background:rgba(255,255,255,1);
			box-shadow:0px 2px 15px 0px rgba(0,0,0,0.1);
			border-radius:2px;
			border:1px solid rgba(242,242,242,1);
			.iconSpan {
				position: absolute;
				top: 0;
				right: 10px;
			}
		}
	}
</style>
