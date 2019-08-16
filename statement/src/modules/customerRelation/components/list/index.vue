<template>
	<ul class="mgj_list">
		<li 
			class="mgj_list-item"
			v-for="(item, index) in data"
			:key="index"
			@click="item.callback">
			<am-icon class="mgj_list-icon" v-if="item.icon" :name="item.icon"></am-icon>
			{{ item.label }}
		</li>
	</ul>
</template>
<script>
export default {
	name: 'MgjList',
	props: {
		data: Array
	}
}
</script>
<style>
	.mgj_list-item {
		padding: 0 14px;
		line-height: 29px;
		height: 29px;
		overflow: hidden;
		text-overflow:ellipsis;
		white-space: nowrap;
		color: #5A5E66;
		transition: all .3s;
		cursor: pointer;
		font-size: 12px;
	}
	.mgj_list-item .mgj_list-icon {
		color: #BCC1CA;
		transition: all .3s;
	}
	.mgj_list-item:hover,
	.mgj_list-item:hover .mgj_list-icon {
		background: #F5F7FA;
		color: #409EFF;
	}
	
</style>


