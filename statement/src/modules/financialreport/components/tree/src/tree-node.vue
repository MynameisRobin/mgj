<template>
	<div 
		class="am_tree_node"
		@click.stop="handleClick">
		<div class="am_tree_node-content"
			:class="{is_selected: node.selected || node.checked}"
			:style="{ 'padding-left': (node.level - 1) * tree.indent + 'px' }">
			<span @click.stop="handleExpandIconClick" :class="{'is-leaf': node.isLeaf, 'expanded': expanded}" class="am_tree_node-expand_icon el-icon-caret-right"></span>
			<span
				v-if="node.loading"
				class="am_tree_node-loading_icon el-icon-loading">
			</span>
			<span class="am_tree_node-label" :title="node.data[tree.props.label]">{{ node.data[tree.props.label] | cutString(16) }}</span>
			<transition name="el-fade-in-linear">
				<el-checkbox
					v-if="node.checked"
					v-model="node.checked"
					:disabled="!!node.disabled"
					@click.native.stop
					@change="handleCheckChange"
				>
				</el-checkbox>
			</transition>
			<div class="am_tree_node-check_all">
				<el-checkbox
					:disabled="disabledCheckAll"
					v-if="node.childNodes && node.childNodes.length > 0"
					v-model="node.checkAll"
					:indeterminate="node.indeterminate"
					@click.native.stop
					@change="handleCheckAllChange"
				>全选{{ levelLabelObj[node.data.level + 1] }}</el-checkbox>
			</div>
		</div>
		<el-collapse-transition>
			<div class="am_tree_node-children" v-show="expanded">
				<am-tree-node 
					v-for="node in node.childNodes"
					:key="node.id"
					:node="node"
					@node-expand="handleChildNodeExpand">
				</am-tree-node>
			</div>
		</el-collapse-transition>
	</div>
</template>
<script>
import ElCollapseTransition from 'element-ui/lib/transitions/collapse-transition'
import emitter from '@/js/emitter'
const levelLabelObj = {
	0: '总部',
	1: '区域',
	2: '门店',
	3: '部门',
	4: '级别',
	5: '员工'
}
export default {
	name: 'AmTreeNode',
	componentName: 'AmTreeNode',
	components: {
		ElCollapseTransition
	},
	mixins: [emitter],
	props: {
		node: Object,
	},
	data() {
		return {
			tree: null,
			expanded: false,
			levelLabelObj
		}
	},
	watch: {
		'node.expanded'(val) {
			this.$nextTick(() => this.expanded = val);
		}
	},
	computed: {
		disabledCheckAll() {
			return this.tree.disabledSelectAll ? this.tree.disabledSelectAll(this.node) : true;
		}
	},
	methods: {
		handleClick() {
			const {
				beforeClick
			} = this.tree;
			if (beforeClick && !beforeClick(this.node)) return;
			if (this.node.data.level === 0) {
				this.handleCheckAllChange(!this.node.checkAll);
				return;
			};
			this.handleCheckChange(!this.node.checked);
		},
		handleExpandIconClick() {
			if (this.node.isLeaf) return;
			if (this.expanded) {
				this.node.collapse();
			} else {
				this.node.expand();
				this.$emit('node-expand', this.node.data, this.node, this);
			}
		},
		handleCheckAllChange(value) {
			let checked = value;
			this.node.expand();
			this.node.childNodes.forEach(node => {
				node.setChecked(checked);
			})
			this.tree.$emit('check-change', this.node.data, checked, value);
		},
		handleCheckChange(value) {
			this.node.setChecked(value);
			this.tree.$emit('check-change', this.node.data, value);
		},
		handleChildNodeExpand(nodeData, node, instance) {
			this.broadcast('AmTreeNode', 'tree-node-expand', node);
		},
	},
	created() {
		const parent = this.$parent;
		if (parent.isTree) {
			this.tree = parent;
		} else {
			this.tree = parent.tree;
		}
		if (this.node.level === 1) {
			this.node.expanded = true;
		}
		this.$on('tree-node-expand', node => {
			if (this.node !== node) {
				this.node.collapse();
			}
		});
	}
}
</script>
<style>
	.am_tree_node-content {
		position: relative;
		display: flex;
		align-items: center;
		cursor: pointer;
		&:hover {
			& .am_tree_node-check_all {
				display: block;
				opacity: 1;
			}
		}
		&.is_selected {
			& .am_tree_node-label {
				color: #0ae;
			}
		}
	}
	.am_tree_node-expand_icon {
		padding: 6px;
		font-size: 14px;
		transition: transform .3s ease-in-out;
		cursor: pointer;
		&.is-leaf {
			color: transparent;
    		cursor: default;
		}
		&.expanded {
			transform: rotate(90deg);
		}
	}
	.am_tree_node-label {
		margin-right: 8px;
	}
	.am_tree_node-check_all {
		opacity: 0;
		display: none;
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		transition: opacity .3s;
		& .el-checkbox__label {
			font-size: 12px;
			padding-left: 3px;
		}
	}
</style>

