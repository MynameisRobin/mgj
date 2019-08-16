<template>
	<div>
		<el-popover
			placement="bottom-start"
			width="300"
			trigger="click">
			<div class="daysBox">
				<ul>
					<li v-for="(item, index) in dayList" :key="item.index" :class="item.act ? 'act' : ''" @click="onSelect(item)">
						<div class="daysRadio">{{ item.index }}</div>
					</li>
				</ul>
			</div>
			<el-input size="small" :clearable="true" v-model="dayStr" slot="reference" prefix-icon="el-icon-date"></el-input>
		</el-popover>
	</div>
</template>

<script>
import FindIndex from "lodash.findindex";
export default {
	data() {
		return {
			dayStr: '',
			days: [],
			dayList: []
		}
	},
	props: {
		monthlyData: []
	},
	mounted() {
		this.getDayList();
		this.init();
	},
	watch: {
		dayStr(val) {
			// 如果清空了,重置
			if (!val) {
				this.days = [];
				this.getDayList();
			}
			this.asyncDays();
		}
	},
	methods: {
		init() {
			this.days = this.monthlyData;
			this.render();
		},
		asyncDays() {
			this.$emit('asyncDays', {
				days: this.days
			});
		},
		onSelect(item) {
			if ( this.days.indexOf(item.index) > -1 ) {
				item.act = false;
				let daysIndex = FindIndex(this.days, v =>  v === item.index );
				if (daysIndex === -1) return false;
				this.days.splice(daysIndex, 1);
			} else {
				item.act = true;
				this.days.push(item.index);
			}
			this.days.sort( (a, b) => {
				return a - b; 
			});
			this.dayStr = this.days.join('日，') + '日';
		},
		getDayList() {
			this.dayList = [];
			for (let index = 1; index <= 31; index++) {
				this.dayList.push({ 'index': index, 'act': false });
			}
		},
		render() {
			if (this.days.length > 0) {
				this.days.forEach(item => {
					this.dayList[item - 1]['act'] = true;
				});
				this.dayStr = this.days.join('日，') + '日';
			}
		}
	}
}
</script>

<style lang="less">
	.daysBox{
		ul{
			li{
				width: 20%;
				height: 35px;
				cursor: pointer;
				line-height: 35px;
				text-align: center;
				display: inline-block;
				user-select: none;
				-webkit-user-select: none;
				position: relative; 
				.daysRadio{
					width:24px;
					height:24px;
					line-height: 24px;
					position: absolute;
					top:50%;
					left: 50%;
					border-radius: 50%;
					transform: translate(-50%,-50%);
				}
				&:hover{
					color:#409EFF;
				}
				&.act{
					.daysRadio{
						color: #fff;
						background-color: #409eff;
					}
				}
			}
		}
	}
</style>

