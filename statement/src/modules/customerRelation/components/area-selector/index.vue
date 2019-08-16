<template>
	<div class="area_selector">
		<div class="area_selector-search">
			<el-form @submit.native.prevent>
				<el-form-item label="检索">
					<el-autocomplete
						v-model="searchKey"
						class="filter_box"
						style="width: 220px"
						size="small"
						placeholder="名称或拼音的首字母搜索门店"
						:fetch-suggestions="querySearch"
						@select="handleSelect">
						<template slot-scope="{ item }">
							<div class="name" :title="item.data.name">{{ item.data.name | cutString(26) }}</div>
						</template>
					</el-autocomplete>
				</el-form-item>
			</el-form>
		</div>
		<div class="area_selector-content">
			<am-tree
				:before-click="beforeClick"
				:disabled-select-all="disabledSelectAll"
				ref="tree"
				v-if="listData.length > 0"
				:data="listData"
				node-key="id"
			></am-tree>
		</div>
	</div>
</template>
<script>
require('@/lib/pinyin.js');
import AmTree from '#/components/tree'
import FindIndex from 'lodash.findindex'
export default {
	name: 'AreaSelector',
	components: {
		AmTree
	},
	props: {
		listData: Array,
		disabledSelectAll: Function,
		beforeClick: Function,
	},
	data() {
		return {
			searchKey: ''
		}
	},
	computed: {
		allNodes() {
			return this.$refs.tree ? this.$refs.tree.getAllNodes() : [];
		},
		currentShopId() {
			return (this.value && this.value.length > 0) ? this.value[0].shopId : null;
		},
		currentAreaId() {
			return (this.value && this.value.length > 0) ? this.value[0].areaId : null;
		}
	},
	methods: {
		getTreeNode(nodeData) {
			const { areaId, shopId, id } = nodeData;
			let node = this.$refs.tree.getNode(`${areaId}-${shopId}-${id}`);
			return node;
		},
		querySearch(queryString, cb) {
			let allNodes = this.allNodes;
			var results = queryString ? allNodes.filter(this.filterNode(queryString)) : [];
			cb(results);
		},
		filterNode(queryString) {
			var regExp = /[^A-Za-z]/;
			let isEng = !regExp.test(queryString);
			let queryStr = queryString.toLowerCase();
			return (node) => {
				const { name } = node.data;
				if (isEng) {
					let pinyinList = window.pinyin(name, {
						style: window.pinyin.STYLE_NORMAL
					});
					const fullPinyin = pinyinList.reduce((accumulator, currentValue) => {
						return accumulator + currentValue[0];
					}, "")
					const firstPinyin = pinyinList.reduce((accumulator, currentValue) => {
						let currentPinyin = (typeof currentValue[0] === 'string') ? currentValue[0].substring(0, 1) : "";
						return accumulator + currentPinyin;
					}, "")
					
					return fullPinyin.indexOf(queryStr) > -1 || firstPinyin.indexOf(queryStr) > -1;
				} else {
					return name.indexOf(queryString) > -1;
				}
			};
		},
		handleSelect(node) {
			if ([2, 5].indexOf(node.data.level) < 0) return;
			if (!node.checked) {
				node.setChecked(true);
			}
		},
		getCheckedNodes() {
			return this.$refs.tree.getCheckedNodes();
		}
	},
}
</script>
<style lang="less">
	.area_selector-content {
		margin: 0 -10px;
		height: calc(100vh - 125px);
		overflow-y: auto;
		& .am_tree_node-content:hover {
			background: #fff;
		}
		& .am_tree_node-check_all {
			right: 10px;
		}
		& .am_tree_node-expand_icon {
			margin-left: 10px;
		}
	}
	.area_selector-search {
		& .el-form-item__label,
		& .el-input__inner {
			font-size: 12px;
		}
	}
</style>
