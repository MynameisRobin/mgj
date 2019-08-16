<template>
	<div>
		<!-- <p>test1: {{a.a1}}</p>
		<test1 :obj="a"></test1> -->
		<p style="margin-bottom: 100px;">
			{{
				newObj
			}}
		</p>
		<div class="tree">
			<!-- <tree-column
				v-for="(item, key) in newObj"
				:key="key"
				:column-data="item">
			</tree-column> -->
		</div>

		<tree
			:data="list"
			:columns="columns">
		</tree>
	</div>
</template>

<script>
/* eslint-disable */

import test1 from '#/components/pop-model/test1'
import Tree from '#/components/tree/tree.vue'
import FindIndex from 'lodash.findindex'

export default {
	data () {
		return {
			a: {
				a1: 123
			},
			newObj: null,
			list: null,
			columns: null,
		}
	},
	components: {
		test1,
		Tree
		// TreeColumn
	},
	created() {
		let list = [
			{
				"schemeid" : 2, //方案ID
				proposalId: 123,
				"itemids" : ",18476,23154,12241,", //项目集体ID
				"levelids" : ",-1,", //员工级别ID
				"consumeTypes" : ",-1,", //消费类型集合
				"payTypes" : ",-1,", //支付方式ID
				"specified" : ",-1,", //1指定 0非指定
				"evaluate" : ",2,4," , //点评
				"equation" : "项目现金类业绩*0.6", //算式
			},
			{
				"schemeid" : 2, //方案ID
				proposalId: 123,
				"itemids" : ",18476,23154,12241,", //项目集体ID
				"levelids" : ",-1,", //员工级别ID
				"consumeTypes" : ",-1,", //消费类型集合
				"payTypes" : ",-1,", //支付方式ID
				"specified" : ",-1,", //1指定 0非指定
				"evaluate" : ",1,3," , //点评
				"equation" : "项目现金类业绩*0.8", //算式
			}
		]

		this.list = [
			...list
		];

		const configs = [
			'itemids',
			'levelids',
			'consumeTypes',
			'payTypes',
			'specified',
			'evaluate',
			'equation'
		]

		this.columns = [
			...configs
		]

		// const coventChildren = function(childrens, parentKey, level) {
		// 	let result = [];
		// 	const key = configs[level];
		// 	childrens.forEach(item => {
		// 		let currentItem = {};
		// 		let currentVal = item[key];
		// 		let index = FindIndex(result, item => item.valueKey === currentVal);
		// 		if (index >= 0) {
		// 			currentItem = result[index];
		// 			currentItem.children.push(item);
		// 		} else {
		// 			currentItem.value = currentVal.split(',').filter(item => item !== '');
		// 			currentItem.parentKey = parentKey;
		// 			currentItem.type = key;
		// 			if (level < configs.length - 1) {
		// 				currentItem.valueKey = currentVal;
		// 				currentItem.children = [item];
		// 			}
		// 			result.push(currentItem);
		// 		}
		// 	});
		// 	level ++;
		// 	if (level <= configs.length - 1) {
		// 		result.forEach(item => {
		// 			item.children = coventChildren(item.children, item.valueKey, level);
		// 		})
		// 	}
		// 	return result;
		// }
		// let result = coventChildren(list, 'project', 0);
		// this.newObj = result;
	}
}
</script>

