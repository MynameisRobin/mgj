<template>
	<div class="area_selector">
		<div class="area_selector-search">
			<el-form>
				<el-form-item label="检索">
					<el-autocomplete
						class="filter_box"
						style="width: 220px"
						size="small"
						placeholder="名称或拼音的首字母搜索门店员工"
						:fetch-suggestions="querySearch"
						@select="handleSelect">
						<template slot-scope="{ item }">
							<div class="name" :title="item.data.name">{{ item.data.name | cutString(26) }}</div>
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
		<div class="area_selector-content" v-loading="loading">
			<am-tree
				ref="tree"
				v-if="listData.length > 0"
				:data="listData"
				node-key="id"
				@check-change="handleCheckChange"
			></am-tree>
		</div>
	</div>
</template>
<script>
require('@/lib/pinyin.js');
import AmTree from '../tree'
import FindIndex from 'lodash.findindex'
export default {
	name: 'AreaSelector',
	components: {
		AmTree
	},
	props: {
		value: Array
	},
	data() {
		return {
			loading: false,
			listData: [],
			isSelfUpdate: false,
			allNodes: []
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
		}
	},
	computed: {
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
			if (!node.checked) {
				node.setChecked(true);
				this.handleCheckChange();
			}
		},
		invertSelect() {
			if (!this.$refs.tree) return;
			let nodeData = this.value[0];
			if (nodeData && nodeData.allChildren) {
				let node = this.getTreeNode(nodeData);
				if (node.data.subsidiary) {
					this.$emit('change', {value: this.value, hasAffiliateShop: true});
				}
				node.childNodes.forEach(cNode => {
					if (cNode.data.stringify) {
						this.$emit('change', {value: this.value, hasAffiliateShop: true});
					}
					cNode.setChecked(true);
				})
			} else {
				let keys = this.value ? this.value.map(item => item.id) : [];
				this.$refs.tree.setCheckedKeys(keys, this.currentShopId, this.currentAreaId);
			}
		},
		handleCheckChange(data, checkVal, checkAll) {
			let result = [];
			let hasAffiliateShop = false;
			this.isSelfUpdate = true;
			if (checkAll) {
				let item = { ...data, allChildren: true };
				if (item.level <= 1) {
					item.children.forEach(cItem => {
						if (!hasAffiliateShop && item.level === 1) {
							hasAffiliateShop = cItem.id === cItem.parentShopId;
						} else {
							cItem.children.forEach(shopItem => {
								if (!hasAffiliateShop) {
									hasAffiliateShop = shopItem.id === shopItem.parentShopId;
								}
							})
						}
					})
				}
				if (item.level === 1) {
					item.areaId = item.id;
				}
				delete item.children;
				result.push(item)
			} else {
				let nodes = this.$refs.tree.getCheckedNodes();
				nodes.forEach(item => {
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
					} = item;
					let subIds = null;
					if ([1, 4].includes(level)) {
						subIds = [];
						children.forEach(cItem => {
							if (!hasAffiliateShop && level === 1) {
								hasAffiliateShop = cItem.id === cItem.parentShopId;
							}
							subIds.push(cItem.id);
						})
					}
					let itemResult = {
						...item,
						name: `(${level === 1 ? id : areaId}_${level === 2 ? id : shopId}_${id}_${no || dutytypecode || deptcode})${name}`,
						subIds
					}
					if (!hasAffiliateShop) {
						hasAffiliateShop = id === parentShopId;
					}
					delete itemResult.children;
					result.push(itemResult);
				})
			}
			this.$emit('input', result);
			this.$emit('change', {value: result, hasAffiliateShop});
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
		}
	},
	mounted() {
		this.getListData();
	}
}
</script>
<style lang="less">
	.area_selector-content {
		margin: 0 -20px;
		height: calc(100vh - 100px);
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
