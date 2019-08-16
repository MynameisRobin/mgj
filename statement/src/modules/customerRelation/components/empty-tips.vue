<template>
	<div class="am_empty_tips">
		<div class="am_empty_tips-icon" v-if="iconName">
			<am-icon :size="iconSize" :name="iconName"></am-icon>
		</div>
		<p class="am_empty_tips-text">
			<slot name="text">暂时没有数据~</slot>
		</p>
	</div>
</template>
<script>
export default {
	name: 'AmEmptyTips',
	props: {
		iconName: {
			type: String,
			default: 'wushuju'
		},
		iconSize: {
			type: String,
			default: '64px'
		}
	}
}
</script>

<style>
	.am_empty_tips {
		display: inline-flex;
		flex-wrap: wrap;
		flex-direction: column;
		justify-items: center;
		color: #a9a9a9;
		font-size: 12px;
	}
	.am_empty_tips-icon {
		text-align: center;
	}
	.am_empty_tips-text {
		text-align: center;
		max-width: 200px;
	}
	.am_empty_tips-text:not(:first-child) {
		margin-top: 13px;
	}
</style>
