<template>
	<li :title="item.name.split('|')[0]" @click="handleClick(item)">
		<span class="label">{{item.label}}</span>
		{{item.name.split('|')[0] | cutString(12)}}
		<span class="iconSpan">
			<i class="icon iconfont mgj-xiangzuo-copy"></i>
		</span>
	</li>
</template>

<script>
import Mixins from './mixins'
export default {
	name: 'fastNavItem',
	mixins: [Mixins],
	props: {
		item: Object
	},
	methods: {
		
	}
	
}
</script>

<style lang="less" scoped>
	li {
		position: relative;
		height:32px;
		padding: 0 10px;
		margin-bottom: 10px;
		background:rgba(255,255,255,1);
		box-shadow:0px 2px 15px 0px rgba(0,0,0,0.1);
		border-radius:2px;
		border:1px solid rgba(242,242,242,1);
		color: #333;
		.label {
			margin-right: 13px; 
			font-size:12px;
			color:rgba(144,144,144,1);
			line-height:32px;
		}
		.iconSpan {
			position: absolute;
			top: 5px;
			right: 10px;
			color: #00aaee;
		}
	}
	
</style>
