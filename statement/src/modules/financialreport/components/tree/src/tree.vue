<template>
	<div class="am_tree">
		<am-tree-node 
			v-for="item in root.childNodes"
			:key="item.label"
			:node="item"
			@node-expand="handleNodeExpand">
		</am-tree-node>
	</div>
</template>
<script>
import emitter from '@/js/emitter'
import AmTreeNode from './tree-node'
import Tree from './tree'
export default {
	name: 'AmTree',
	mixins: [emitter],
	props: {
		data: Array,
		props: {
			type: Object,
			default() {
				return {
					children: 'children',
					label: 'name',
					icon: 'icon',
					disabled: 'disabled'
				};
			}
		},
		nodeKey: String,
		indent: {
			type: Number,
			default: 18
		},
		lazy: {
			type: Boolean,
			default: false
		},
		load: Function,
		disabledSelectAll: Function,
		beforeClick: Function
	},
	components: {
		AmTreeNode
	},
	data() {
		return {
			tree: null,
			root: null, // 根节点
			isTree: null
		}
	},
	methods: {
		getAllNodes() {
			return this.tree.getAllNodes();
		},
		getNode(key) {
			return this.tree.getNode(key);
		},
		handleNodeExpand(nodeData, node, instance) {
			this.broadcast('AmTreeNode', 'tree-node-expand', node);
		},
		getCheckedNodes() {
			return this.tree.getCheckedNodes();
		},
		setCheckedNodes(nodes) {
			if (!this.nodeKey) throw new Error('[AmTree] nodeKey is required');
			this.store.setCheckedNodes(nodes);
		},
		getCheckedKeys() {
			return this.tree.getCheckedKeys();
		},
		setCheckedKeys(keys, shopId, areaId) {
			if (!this.nodeKey) throw new Error('[AmTree] nodeKey is required');
			this.tree.setCheckedKeys(keys, shopId, areaId);
		},
		resetChecked() {
			this.tree.resetChecked();
		}
	},
	created() {
		this.isTree = true;
		this.tree = new Tree({
			key: this.nodeKey,
			data: this.data,
			lazy: this.lazy,
			load: this.load,
			props: this.props,
			disabledSelectAll: this.disabledSelectAll,
			beforeClick: this.beforeClick
		});
		this.root = this.tree.root;
	}
}
</script>
