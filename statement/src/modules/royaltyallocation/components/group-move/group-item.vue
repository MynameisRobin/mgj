<template>
	<div class="group_move_item">
		<div class="group_move_item-header">
			<h5 class="group_move_item-title">
				{{ title }}{{ index }}
			</h5>
			<div class="group_move_item-action">
				<slot name="action"></slot>
			</div>
		</div>
		<div class="group_move_item-body">
			<p class="group_move_item-li"
				v-for="item in list"
				:key="item.id">
				{{ item.cardtypename || item.fieldName || item.packName || item.name | cutString(24) }}
			</p>
		</div>
		<div class="group_move_item-footer">
			共 {{ data.length }} 项
		</div>
	</div>
</template>
<script>
export default {
	name: 'groupMoveItem',
	props: {
		data: Array,
		title: String,
		index: Number,
	},
	computed: {
		list() {
			return this.data.filter((item, index) => index < 4);
		}
	}
}
</script>
<style lang="less" scoped>
	.group_move_item {
		border: 1px solid #E8E8E8;
		border-radius: 2px;
		font-size: 12px;
	}
	.group_move_item-header {
		display: flex;
		justify-content: space-between;
		padding: 10px 10px 0;
		color: #C7C7C7;
		& .group_move_item-title {
			font-weight: normal;
			font-size: 12px;
		}
	}
	.group_move_item-body {
		color: #333;
		padding: 0 15px;
		& .group_move_item-li {
			margin-top: 7px;
		}
	}
	.group_move_item-footer {
		padding: 0 8px 8px;
		color: #909090;
		text-align: right;
	}
	.group_move_item-action {
		position: relative;
		color: #0ae;
		cursor: pointer;
	}
</style>
