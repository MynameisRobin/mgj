<template>
	<div class="signle_line_text">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: 'am-signle-line-text'
}
</script>

<style>
	.signle_line_text {
		overflow: hidden;
		text-overflow:ellipsis;
		white-space: nowrap;
	}
</style>
