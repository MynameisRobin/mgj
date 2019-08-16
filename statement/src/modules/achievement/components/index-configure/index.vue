<template>
	<Tree v-if="treeList && columnsConfig && allMap && formulaSplice" ref="tree"
		:data="treeList"
		:columns-config="columnsConfig"
		:column-map="allMap"
		:typeKey="typeKey"
		:formula-splice="formulaSplice"
		:payList="originalPayList"
		:tabPaneType="tabPaneType"
		@treeShow="onTreeShow">
	</Tree>
</template>
<script>
import FindIndex from 'lodash.findindex'
import Tree from '../tree/tree.vue'
import MapData from '../../mapData.js'
// console.log(MapData);
export default {
	name: 'indexConfigure',
	props: {
		// allPlanList: Array,
		tabPaneType: [String, Number],
		// searchFormulaSplice: Array,
		treeList: Array,
		columnsConfig: Array,
		allMap: Object,
		typeKey: Object,
		formulaSplice: Array,
		originalPayList: Array,
	},
	components: {
		// SearchPlanHeader,
		Tree
	},
	data() {
		return {}
	},
	mounted() {},
	methods: {
		onTreeShow() {
			this.$emit('treeShow');
		}
	}
}
</script>

<style lang="less" scoped>

</style>

