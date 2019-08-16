<template>
	<div class="treeBox">
		<el-tree
			:data="treeData"
			:expand-on-click-node="true"
			node-key="id"
			:props="defaultProps">
			<span class="custom-tree-node" slot-scope="{ node, data }">
				<span class="tree-label" :title="node.label || ''">{{ node.label || '' }}</span>
				<el-input class="mini-input" size="mini" v-model="data.rule" @click.native="onClick" @keyup.native="proving(data)"></el-input>
				<el-switch
					v-model="data.ruleType"
					active-color="#65B755"
					inactive-color="#409EFF"
					active-text=""
					@click.native="onClick"
					:inactive-text="!data.ruleType ? '折' : '元'">
				</el-switch>
			</span>
		</el-tree>
	</div>
</template>

<script>
export default {
	data() {
		return {
			treeData: [],
			defaultProps: {
				children: 'sub',
				label: 'name'
			}
		};
	},
	props: {
		data: Array
	},
	watch: {
		treeData(val) {
			this.init();
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {
			this.treeData = this.data;
		},
		getData(val) {
			this.treeData.forEach(item1 => {
				val.forEach(item => {
					if (item1.sub.length > 0) {
						item1.sub.forEach(v => {
							if (item.id === v.id) {
								v.rule = item.rule;
								v.ruleType = item.ruleType ? true : false;
							}
						});
					}
				});
			})
		},
		onClick(e) {
			e.stopPropagation();
		},
		proving(data) {
			if (!data || !data.rule) return false; 
			data.rule = data.rule + '';
			data.rule = data.rule.replace(/[^\.\d]/g, '');
			if (!data.ruleType) {
				if (data.rule > 10) {
					data.rule = 10;
				} else if (data.rule < 0) {
					data.rule = '';
				} else if (data.rule >= 0 && data.rule <= 10) {
					if (data.rule.indexOf('.') !== data.rule.length - 1) {
						data.rule = Math.floor(data.rule * 100) / 100;
					}
				} else {
					data.rule = '';
				}
			}
		}
	}
};
</script>

<style lang="less">
.treeBox{
	margin-top:10px;
	margin-left:30px;
	.tree-label{
		display: inline-block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.el-tree-node__content{
		.tree-label{
			width:268px;
		}
	}
	.el-tree-node .tree-label {
		font-weight: bold;
		color: #333;
	}
	.el-tree-node__children{
		.tree-label{
			width:250px;
			font-weight: normal;
			color: #606266;
		}
	}
	
	.custom-tree-node {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		padding-right: 8px;
	}

	.el-switch__core {
		width: 50px !important;
	}
	.el-switch__label.el-switch__label--left {
		position: absolute;
		right: 15px;
		z-index: 9;
		color: #fff;
		&.is-active {
			right: 5px;
		}
	}
}
</style>