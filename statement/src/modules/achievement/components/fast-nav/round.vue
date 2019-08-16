<template>
	<div class="roundWrap">
		<span class="num">{{fastSearchMap.length}}</span>
		<div class="roundDiv" @mouseenter="mouseenterFun"></div>
	</div>
</template>
<script>
export default {
	name: 'fastNavRound',
	props: {
		fastSearchMap: Array
	},
	methods: {
		mouseenterFun() {
			this.$emit('showModelChange', 'ItemsWrap');
			// this.$emit('showModelChange', 'Step');
		}
	}
}
</script>
<style lang="less" scoped>
	.roundWrap {
		position: relative;
		width: 55px;
		height: 55px;
		.roundDiv {
			width: 55px;
			height: 55px;
			border-radius: 50%;
			background: #fff;
			box-shadow:0px 12px 25px 0px rgba(0,0,0,0.1);
			border:1px solid rgba(238,238,238,1);
		}
		.num {
			position: absolute;
			top: -6px;
			right: 0;
			min-width: 20px;
			min-height: 20px;
			padding: 2px 5px;
			font-size: 10px;
			text-align: center;
			color: #fff;
			background: #fc9252;
			border-radius: 50%;
		}
	}
</style>
