<template>
	<div class="advanced_bar el-input el-input--small el-input-group el-input-group--append">
		<div class="el-input__inner" @click="onEdit">
			<div class="advanced_bar-content">
				<el-tag
					type="info"
					closable
					v-for="(item, index) in tagList"
					:key="item.key"
					@close="handleSearchTagClose(item, index)">
					{{ item.label }}
				</el-tag>
			</div>
			<span class="advanced_bar-edit" @click.stop="onEdit">
				<am-icon size="18px" name="edit-outline" is-element></am-icon>
			</span>
		</div>
		<div class="el-input-group__append">
			<el-button type="success" @click="onSearch">高级查询</el-button>
		</div>
	</div>
</template>
<script>
export default {
	name: 'AdvancedBar',
	props: {
		tagList: Array
	},
	methods: {
		onSearch() {
			this.$emit('search');
		},
		handleSearchTagClose(data, index) {
			this.$emit('close-tag', {data, index});
		},
		onEdit() {
			this.$emit('edit');
		}
	}
}
</script>
<style>
	.advanced_bar-edit {
		cursor: pointer;
	}
	.advanced_bar-edit i {
		vertical-align: middle;
	}
	.advanced_bar-content {
		float: left;
		max-width: calc(100% - 20px);
	}
	.advanced_bar .el-input__inner {
		padding: 0 10px;
	}
	.el-tag {
		margin-right: 5px;
	}
</style>
