<template>
	<div class="area_selector">
		<div class="area_selector-search">
			<el-form>
				<el-form-item label="检索">
					<el-autocomplete
						class="filter_box"
						style="width: 220px"
						size="small"
						v-model="searchKey"
						placeholder="名称或拼音的首字母搜索门店员工"
						:fetch-suggestions="querySearch"
						@select="handleSelect">
						<template slot-scope="{ item }">
							<div class="name" :title="buildSearchEmpTitle(item.data)">{{ item.data.name | cutString(26) }}</div>
						</template>
					</el-autocomplete>
				</el-form-item>
			</el-form>
		</div>
		<el-alert
			v-if="!value || !value.length"
			style="margin-top: -10px"
			title="请先选择查询对象"
			type="warning"
			close-text="知道了">
		</el-alert>
		<el-radio-group size="mini" v-model="nodeLevelId" @change="handleNodeTypeChange" class="node_type_list">
			<el-radio-button 
				 v-for="nodeType in nodeLevelList" 
				 :label="nodeType.id" :key="nodeType.id">{{ nodeType.label }}</el-radio-button>
		</el-radio-group>
		<div class="area_selector-content" v-loading="loading">
			<am-tree
				ref="tree"
				v-if="listData.length > 0"
				:data="listData"
				node-key="id"
				:before-click="handleClickBefore"
				:disabled-select-all="renderDisabledSelectAll"
				:show-expand-icon="renderShowExpandIcon"
				@check-change="handleCheckChange"
			></am-tree>
		</div>
	</div>
</template>
<script>
require('@/lib/pinyin.js');
import AmTree from '#/components/tree'
import FindIndex from 'lodash.findindex'
import Some from 'lodash.some'
export default {
	name: 'AreaSelector',
	components: {
		AmTree
	},
	props: {
		value: Array,
		nodeLevel: Number,
	},
	data() {
		return {
			loading: false,
			listData: [],
			isSelfUpdate: false,
			allNodes: [],
			allNodeLevelList: [
				{label: '区域', id: 1},
				{label: '门店', id: 2},
				{label: '部门', id: 3},
				{label: '级别', id: 4},
				{label: '员工', id: 5},
			],
			nodeLevelId: 2,
			searchKey: ''
		}
	},
	watch: {
		value(newVal, oldVal) {
			if (!newVal) {
				if (this.$refs.tree) {
					this.$refs.tree.resetChecked();
				}
				return;
			}
			let newValStr = JSON.stringify(newVal);
			let oldValStr = JSON.stringify(oldVal);
			if (newValStr === oldValStr || this.isSelfUpdate) {
				this.isSelfUpdate = false;
				return;
			};
			this.isSelfUpdate = false;
			this.invertSelect();
		},
		nodeLevel(newVal, oldVal) {
			if (newVal === oldVal) return;
			this.nodeLevelId = newVal;
		}
	},
	computed: {
		currentShopId() {
			return (this.value && this.value.length > 0) ? this.value[0].shopId : null;
		},
		currentAreaId() {
			return (this.value && this.value.length > 0) ? this.value[0].areaId : null;
		},
		nodeLevelList() {
			const item = this.listData[0];
			return item ? this.allNodeLevelList.filter(node => node.id >= item.level) : this.allNodeLevelList;
		}
	},
	methods: {
		buildSearchEmpTitle(data) {
			const { name, no, level } = data;
			return level === 5 ? `${no}-${name}` : name;
		},
		renderDisabledSelectAll(node) {
			const result = node.data.level >= this.nodeLevelId;
			return result;
		},
		renderShowExpandIcon(node) {
			let result = node.data.level < this.nodeLevelId;
			if (!this.nodeLevelId) result = true;
			return result;
		},
		getTreeNode(nodeData) {
			const { areaId, shopId, id, level } = nodeData;
			let node = this.$refs.tree.getNode(`${level === 1 ? id : areaId}-${shopId}-${id}`);
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
				const { name, level } = node.data;
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
					
					return (fullPinyin.indexOf(queryStr) > -1 || firstPinyin.indexOf(queryStr) > -1) && level <= this.nodeLevelId;
				} else {
					return name.indexOf(queryString) > -1 && level <= this.nodeLevelId;
				}
			};
		},
		handleSelect(node) {
			if (!node.checked && node.data.level <= this.nodeLevelId) {
				node.setChecked(true);
				this.handleCheckChange();
			}
		},
		invertSelect() {
			if (!this.$refs.tree) return;
			let nodeData = this.value ? this.value[0] : undefined;
			if (nodeData && nodeData.allChildren) {
				this.value.forEach(item => {
					let node = this.getTreeNode(item);
					if (node.data.subsidiary) {
						this.$emit('change', {value: this.value, hasAffiliateShop: true});
					}
					node.childNodes.forEach(cNode => {
						if (cNode.data.stringify) {
							this.$emit('change', {value: this.value, hasAffiliateShop: true});
						}
						cNode.setChecked(true);
					})
				})
			} else {
				const keys = this.value ? this.value.map(item => item.id) : [];
				const matchKeyList = this.value ? this.value.map( item => {
					const {
						id,
						shopId,
						areaId
					} = item;
					return `${areaId}-${shopId}-${id}`;
				}) : [];
				this.$refs.tree.setCheckedKeys(keys, matchKeyList);
			}
		},
		handleClickBefore(node) {
			return node.data.level <= this.nodeLevelId;
		},
		handleCheckChange(data, checkVal, checkAll) {
			let nodes = this.$refs.tree.getCheckedNodes();
			let result = [];
			let hasAffiliateShop = false;
			this.isSelfUpdate = true;
			if (checkAll) {
				let item = { ...data, allChildren: true };
				if (item.level === 1) {
					item.areaId = item.id;
				}
				delete item.children;
				if (this.value && this.value.length > 0 && this.value[0].allChildren && item.id !== this.value[0].id && this.value[0].level === item.level) {
					result = JSON.parse(JSON.stringify(this.value));
				}
				result.push(item);
				for (let i = 0; i < result.length; i++) {
					const currentNode = result[i];
					if (item.level < 2) {
						hasAffiliateShop = currentNode.subsidiary;
					} else if (item.level === 2) {
						hasAffiliateShop = currentNode.id === currentNode.parentShopId && result.length > 1;
					} else {
						hasAffiliateShop = currentNode.shopId === currentNode.parentShopId && result.length > 1;
					}
					if (hasAffiliateShop) break;
				}
			} else {
				let shopIdList = [];
				nodes.forEach(item => {
					let { 
						id,
						level,
						children,
						parentShopId,
					} = item;
					let subIds = null;
					if (level === 1) {
						subIds = item.shopIds || children.map(item => item.id);
						if (!hasAffiliateShop) {
							// const isNotAllAffiliateShop = Some(children, shop => shop.id !== shop.parentShopId);
							// hasAffiliateShop = item.subsidiary && isNotAllAffiliateShop;
							const HasAffiliateShop = Some(children, shop => shop.id === shop.parentShopId);
							hasAffiliateShop = HasAffiliateShop && (nodes.length > 1 || children.length > 1);
						}
					}
					if (level === 4) {
						subIds = children.map(cItem => cItem.id);
					}
					let itemResult = {
						...item,
						name: this.getSearchObjName(item),
						subIds
					}
					if (level > 1) {
						const shopId = level === 2 ? id : item.shopId;
						if (!hasAffiliateShop) {
							hasAffiliateShop = shopId === parentShopId;
						}
						if (shopIdList.indexOf(shopId) === -1) {
							shopIdList.push(shopId);
						}
					}
					delete itemResult.children;
					result.push(itemResult);
				});
				if (shopIdList.length === 1 && nodes[0].level > 2) {
					hasAffiliateShop = false;
				}
				// if (nodes.length > 1 && !hasAffiliateShop && nodes[0].level === 1) {
				// 	// 防止区域是全部直属店与全部的附属店
				// 	const IsHasAffiliateShop = Some(nodes, node => node.subsidiary);
				// 	const IsNotHasAffiliateShop = Some(nodes, node => !node.subsidiary);
				// 	if (IsHasAffiliateShop && IsNotHasAffiliateShop) {
				// 		hasAffiliateShop = true;
				// 	}
				// }
			}
			this.$emit('input', result);
			this.$emit('change', {value: result, hasAffiliateShop});
		},
		getSearchObjItem(node) {
			let { 
				level,
				children,
			} = node;
			let subIds = null;
			if ([1, 4].includes(level)) {
				subIds = [];
				children.forEach(cItem => {
					subIds.push(cItem.id);
				})
			}
			let itemResult = {
				...node,
				name: this.getSearchObjName(node),
				subIds
			}
			delete itemResult.children;
			return itemResult;
		},
		getSearchObjName(node) {
			let { 
				id,
				name,
				level,
				children,
				parentShopId,
				deptcode,
				dutytypecode,
				no,
				shopId,
				areaId
			} = node;
			return `(${level === 1 ? id : areaId}_${level === 2 ? id : shopId}_${id}_${no || dutytypecode || deptcode})${name}`;
		},
		handleNodeTypeChange(level) {
			this.$emit('update:nodeLevel', level);
			this.$refs.tree.expandNodeByLevel(level);
			let nodeLevel;
			if (this.value) {
				const selectNode = this.value[0];
				if (selectNode) {
					const {
						level,
						allChildren
					} = selectNode;
					nodeLevel = allChildren ? level + 1 : level;
				}
			}
			if (nodeLevel !== undefined && nodeLevel > level) {
				this.$refs.tree.setCheckedKeys([]);
				this.$emit('input', []);
				this.$emit('change', {value: [], hasAffiliateShop: false});
			}
		},
		getListData() {
			this.loading = true;
			this.$http.post('/superOperationReport!getAreas.action', { allInfo: 1 }).then(res => {
				this.loading = false;
				let resData = res.data;
				let { code, content } = resData;
				if (code === 0) {
					if (content.level === 0) {
						let areaList = content.children;
						let allIndex = FindIndex(areaList, item => item.id === -1);
						// let allIndex = areaList.findIndex(item => item.id === -1);
						// 如果总部下存在“全部”区域则做处理
						if (allIndex > -1) {
							if (areaList.length > 1) {
								content.children[allIndex].name = '其他'
							}
							// if (areaList.length === 1) {
							// 	content.children = areaList[0].children;
							// }	else {
							// 	content.children[allIndex].name = '其他'
							// }
						}
					}
					this.listData = [content];
					this.$nextTick(() => {
						this.allNodes = this.$refs.tree.getAllNodes();
						this.invertSelect();
					})
				}
			});
		},
		getSearchObjs(nodeLevel, searchObj) {
			let result = [];
			const nodes = searchObj.map(item => {
				const node = this.getTreeNode(item);
				return node.data;
			})
			const getLevelNodeList = ({ node, targetLevel, listData }) => {
				const { level, children } = node;
				if (level === targetLevel) {
					listData.push(this.getSearchObjItem(node))
				} else {
					children.forEach(item => {
						getLevelNodeList({node: item, targetLevel, listData});
					})
				}
			}
			if (nodes[0].level <= 2 && nodeLevel > 2) {
				let shopNodeList = [];
				const getShopList = function (nodeList) {
					nodeList.forEach(node => {
						const { level, children } = node;
						if (level === 2) {
							shopNodeList.push(node);
						} else {
							getShopList(children);
						}
					})
				}
				getShopList(nodes);
				shopNodeList.forEach(shopNode => {
					let listData = [];
					getLevelNodeList({node: shopNode, targetLevel: nodeLevel, listData});
					listData.length > 0 && result.push(listData);
				})
			} else if (nodeLevel > 2) {
				let shopMapNodeList = {};
				nodes.forEach(node => {
					const { shopId } = node;
					if (!shopMapNodeList[shopId]) shopMapNodeList[shopId] = [];
					getLevelNodeList({node, targetLevel: nodeLevel, listData: shopMapNodeList[shopId]});
				})
				result = Object.values(shopMapNodeList);
			} else {
				let listData = [];
				nodes.forEach(node => {
					getLevelNodeList({node, targetLevel: nodeLevel, listData});
				});
				result = [listData];
			}
			return result.filter(item => item.length > 0);
		}
	},
	mounted() {
		this.nodeLevelId = this.nodeLevel;
		this.getListData();
	}
}
</script>
<style lang="less">
	.area_selector-content {
		margin: 0 -20px;
		height: calc(100vh - 130px);
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
	.node_type_list {
		margin: 10px 0;
		& .el-radio-button--mini .el-radio-button__inner {
			padding: 7px 12px;
		}
	}
</style>
