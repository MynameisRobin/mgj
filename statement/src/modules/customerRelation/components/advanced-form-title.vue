<template>
	<div class="advanced_form_title">
		<am-icon size="16px" v-if="iconName" :name="iconName"></am-icon>
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: 'AdvancedFormTitle',
	props: {
		iconName: String
	}
}
</script>
<style>
	.advanced_form_title {
		margin-bottom: 15px;
		font-size: 13px;
		color: #222;
		font-weight: 500;
	}
</style>
