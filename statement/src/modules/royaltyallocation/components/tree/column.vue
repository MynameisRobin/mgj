<template>
	<div class="tree_column_wrap">
		<div class="tree_column">
			<div v-if="isFormula" :class="['tree_column-value', columnData.type]" :style="isItemsScroll">
				<FormulaInput
					:class="{'is_select_perf_pct': columnData.enabledPerfPct}"
					v-model="columnData.value"
					:factorList="formulaSplice"
					:pay-list="payList"
					:index="index"
					@valid="handleInputValid">
					<template slot="prepend">
						<el-popover
							v-if="formulaSplice[0] !== '项目原价'"
							popper-class="popInfo"
							placement="bottom"
							width="200"
							trigger="hover">
							<el-checkbox v-model="columnData.enabledPerfPct" title="自动按业绩占比分配">
								{{'自动按业绩占比分配' | cutString(20)}}
							</el-checkbox>
							<div class="content" v-for="(_item, _key) in equationInfo" :key="_key">
								<h4>{{_item.title}}</h4>
								<p>{{_item.content}}</p>
							</div>
							<img class="manyCommission" v-if="columnData.enabledPerfPct" slot="reference" src="../../assets/ManyCommission_icon_hover.png" alt="">
							<img class="manyCommission" v-else slot="reference" src="../../assets/ManyCommission_icon.png" alt="">
						</el-popover>
					</template>
				</FormulaInput>
				<!-- <div v-if="formulaSplice[0] !== '项目原价' "  class="note">
					<el-checkbox v-model="columnData.enabledPerfPct" title="自动按业绩占比分配"
						>{{'自动按业绩占比分配' | cutString(20)}}</el-checkbox>
				</div>	 -->
			</div>

			<div v-if="columnData.type == 'step' " :class="['tree_column-value', columnData.type]"
				:style="isItemsScroll">
				<div :id="`step${index}`">
					<el-input-number
						size="small"
						:min="0"
						:controls="false"
						@change="onStepStartChange"
						v-model="columnData.value[0]">
					</el-input-number>
					<el-input-number
						size="small"
						:min="isStepEnd"
						:controls="false"
						@input="onStepEndChange"
						v-model="columnData.value[1]">
					</el-input-number>
					<am-icon title="删除阶梯" style="cursor: pointer;" @click.native="onRemoveStep" name="remove-outline" is-element></am-icon>
				</div>
	
				<div v-if="columnData.value.length > 0">
					<div v-if="showPasteButton" 
						class="copyShadow">
						<span @click="pasteFun">
							<am-icon name="niantiepeizhi"></am-icon> 粘贴
						</span>
					</div>
				</div>
			</div>

			<div v-if=" columnData.type != 'step' && !isFormula" :class="['tree_column-value', columnData.type]" ref="container">
				<div v-if="tabPaneType == 4">
					<div class="packageBg" v-if="columnData.valueKey && columnData.type == 'itemids' && columnData.valueKey.indexOf('T') === -1" 
						style="background: #52A7FC;">项目</div>
					<div class="packageBg" v-if="columnData.valueKey && columnData.type == 'itemids' && columnData.valueKey.indexOf('T') !== -1"
						style="background: #FC9252;">套餐包</div>
				</div>
			
				<!-- <span v-if="columnData.type == 'itemids' && !batchObj.parentKey "  
					class="icon iconfont mgj-fanganbianji bianji"
					title="批量移动" @click="batchMove($event, index)"></span>
				<div v-if="columnData.type == 'itemids' && batchObj.parentKey == columnData.parentKey && batchObj.valueKey == columnData.valueKey">
					<span class="cancel">勾选可移动到其他算法 
						<span class="cancelBtn" @click="batchPasteCancel"> 取消</span>
					</span>
					<span class="icon iconfont mgj-niantiepeizhi niantiepeizhi newBatch" @click="batchPaste($event, index, 'new')"> 移动到新组</span>
				</div>
			
				<span v-if="columnData.type == 'itemids' && batchObj.parentKey == columnData.parentKey && batchObj.valueKey != columnData.valueKey"  
					class="icon iconfont mgj-niantiepeizhi niantiepeizhi" @click="batchPaste($event, index)"> 移动到该算法</span> -->

				<p v-if="isHidden" :style="isItemsScroll">默认配置</p>
				<div class="dragWrap" v-else :style="isItemsScroll">
					<ul element="ul"
						:class="{'is_temp': isTempEmpty, 'drag' : true}"
						@start="onStart(columnData.parentKey, $eventBus, $event)"
						@end="onEnd"
						@move="onMove"
						@remove="onRemove"
						:options="{ group: columnData.parentKey,
									scrollSpeed: 25, sort: false, scroll: false}">
						<component
							@dblclick.native="handleDbclick"
							:is="itemComponentsName"
							v-for="(item, key) in columnData.value"
							:key="key" :obj="item" 
							:parentKey="`${columnData.parentKey}_${columnData.valueKey}`" 
							:batchKey="`${batchObj.parentKey}_${batchObj.valueKey}`">
						</component>
					</ul>
				</div>

				<div v-if="columnData.value.length > 0">
					<span v-if="columnsConfig[0].type != columnData.type && copyData == null " class="fuzhi"
						@click="copyFun">
						<am-icon name="fuzhipeizhi"></am-icon>
						复制{{typeList[columnData.type]}}配置
					</span>
					
					<div v-if="showPasteButton" 
						class="copyShadow">
						<span @click="pasteFun">
							<am-icon name="niantiepeizhi"></am-icon> 粘贴
						</span>
					</div>
				</div>
			
			</div>
			<div v-if="columnData.children && !isUpdate" :class="['tree_column-child']" >
				<div :class="{'child_content': true, 
					'packContent': ( (columnData.type == 'step' && columnData.children[0].type == 'itemids') || columnData.type == 'itemids') && tabPaneType == 4 }" :style="[downClassFun(keyIndex)]">
					<tree-column
						@group-move="handleGroupMove"
						:hidden-list="hiddenList"
						@add-temp="handleAddTempChild"
						v-for="(item, key) in columnData.children"
						:key="key"
						:index="key"
						:formula-splice="formulaSplice"
						:payList="payList"
						:headersWidth="headersWidth"
						:columns-config="columnsConfig"
						:column-data="item"
						:typeKey="typeKey"
						:parentCopyData="parentCopyData"
						:ref="columnData.children[key].type == 'itemids' ? 'childContainer' : '' "
						:batchObj="batchObj"
						:tabPaneType="tabPaneType">
					</tree-column>
				</div>	

			</div>
		</div>
	</div>
	
</template>    

<script>
/* eslint-disable */

import FindIndex from 'lodash.findindex'
import Draggable from 'vuedraggable';
import emitter from '@/js/emitter'

import ProjectName from '../project-name/index'
import LabelContent from '../label-content/index'
import FormulaInput from '../formula-input/index'
import Com from '../../com'

import Tree from './tree'

import ColumnMixins from './mixins'

const close = 'false'

export default {
	name: 'TreeColumn',
	componentName: 'TreeColumn',
	mixins: [emitter, ColumnMixins],
	components: {
		Draggable,
		ProjectName,
		LabelContent,
		FormulaInput
	},
	props: {
		hiddenList: Array,
		headersWidth: Array,
		columnData: Object,
		formulaSplice: Array,
		payList: Array,
		keyIndex: Number,
		openList: Array,
		columnsConfig: Array,
		index: [Number, String],
		typeKey: Object,
		parentCopyData: Object,
		batchObj: Object,
		tabPaneType: Number
	},
	data() {
		return {
			tree: null,
			InputValidList: [],
			copyData: null,
			equationInfo: [
				{
					title: '多人提成的隐含逻辑：',
					content: '勾选“多人服务时，提成按业绩比例分”，可实现多人服务时，自动按业绩比例共享固定提成'
				},
				{
					title: '举例：',
					content: '同工位2个员工共同服务一个项目，项目总业绩为100，业绩比例为3:7，则启用此配置后，员工提成自动按3:7分配，员工1提成=30，员工2提成=70'
				}
			]
		}
	},
	computed: {
		isStepEnd () {
			return parseInt(this.columnData.value[0]) + 1;
		},
		showPasteButton() {
			const {
				parentCopyData,
				columnData
			} = this;
			return parentCopyData && parentCopyData.type == columnData.type && (parentCopyData.valueKey != columnData.valueKey || parentCopyData.parentKey != columnData.parentKey)
		},
		isHidden() {
			const {
				type
			} = this.columnData;
			return this.hiddenList.indexOf(type) >= 0;
		},
		isItems() {
			return this.columnData.type === 'itemids'
		},
		itemComponentsName() {
			return this.isItems ? 'project-name' : 'label-content';
		},
		isFormula() {
			return this.columnData.type === 'equation';
		},
		isTempEmpty() {
			const {
				isTemp,
				value
			} = this.columnData;
			return isTemp && value.length === 0;
		},
		isItemsScroll() {
			const {
				heightNumber,
				value
			} = this.columnData;
 			let itemidStyle = {
				width: '230px',
				height: `${heightNumber}px`,
				'margin-right': '20px',
				'overflow-y': 'auto'
			},
			stepStyle = {
				width: '240px'
			};

			if(this.columnData.type === 'itemids') {
				return itemidStyle;
			} else if( this.columnData.type === 'step') {
				return stepStyle;
			} else {
				let index = FindIndex(this.headersWidth, item => item.type === this.columnData.type);
				if (index >= 0) {
					return `${this.headersWidth[index].style}; height: ${heightNumber}px; overflow-y: auto`;
				}
			}
		},
		typeList() {
			let obj = {};
			this.columnsConfig.forEach(k => {
				obj[k.type] = k.name;
			});
			return obj;
		},
	},
	created() {
		const parent = this.$parent;
		if (parent.isTree) {
			this.tree = parent;
		} else {
			this.tree = parent.tree;
		}
	},
	mounted () {
		this.$eventBus.$on('paste', () => {
			this.handleCancelPaste();
		});
		this.$eventBus.$on('cancel-copy', () => {
			this.handleCancelPaste();
		})
		this.$eventBus.$on('batchPasteAfter', () => {
			// console.log(this.key, this.batchObj);

			if (`${this.columnData.parentKey}_${this.columnData.valueKey}` === this.batchObj.afterParentKey) {

				let data = this.batchObj;
				this.columnData.valueKey = data.valueKey;
				this.isUpdate = true;
				this.updateParentKey(this.columnData, `${data.parentKey}_${data.valueKey}`);
				this.isUpdate = false;
			}
			this.tree.updateData();
			this.$eventBus.$emit('onBatchObj', {});			
		})

		// if(this.columnData.type === 'itemids'){
		// 	let wrap = this.$refs.container,
		// 		scrollbar = wrap.querySelector('.el-scrollbar'),
		// 		column = wrap.parentNode;
		// 		scrollbar.style.height = column.clientHeight - 15 + 'px';

		// 		console.log('column.clientHeight', column.clientHeight);
		// } else if (this.columnData.children && this.columnData.children[0].type === 'itemids') {
		// 	console.log(3333, this.$refs);

		// 	let wrap = this.$refs.childContainer,
		// 	scrollbar = wrap.querySelector('.el-scrollbar'),
		// 	column = wrap.parentNode;
		// 	scrollbar.style.height = column.clientHeight - 15 + 'px';
		// }
		
	},
	methods: {

		onRemoveStep() {
			this.$emit('remove-step', this.index);
		},

		batchMove(e, index) {
			
			if (this.parentCopyData != null) {
				this.$message.warning('当前正处于复制状态中，不能处理此操作！');
				return;
			}
			if (this.columnData.value.length <= 1) {
				this.$message.warning('当前类别只有一个条目，不能处理此操作！');
				return;
			}
			
			this.$eventBus.$emit('onBatchObj', { 
					// ...JSON.parse(JSON.stringify(this.columnData)), 
					...this.columnData,
					'fromIndexKey': index
				}
			);
		},
		batchPaste(e, toIndex, type) {

			let pro_checkList = document.querySelectorAll('.pro_check');
				pro_checkList = Array.from(pro_checkList);

			let list = pro_checkList.map( k => {
				console.log(k);
				if ( k.getAttribute('aria-checked') == 'true' ) {
					return k.getAttribute('pro_id');
				}
			})
			list = list.filter( k => {
				if (k !== undefined) {
					return k
				}
			});

			if (pro_checkList.length === list.length) {
				this.$message.warning('被批量移动的算法中最少需保留一个类型,请去掉至少一个勾选项目！');
				return;
			} else if (list.length == 0) {
				this.$message.warning('请至少一个勾选项目！');
				return;
			}

			
			let valueList = [],
				afterParentKey = JSON.parse(JSON.stringify(this.batchObj));

			this.batchObj.afterParentKey = `${afterParentKey.parentKey}_${afterParentKey.valueKey}`;
			list.forEach( k => {
				let kIndex = FindIndex(this.batchObj.value, item => k === item.id);
				if (kIndex >= 0) {
					valueList.push(this.batchObj.value[kIndex]);
					this.batchObj.value.splice(kIndex, 1);
					this.batchObj.valueKey = this.batchObj.valueKey.replace(`,${k},`, ",");
				}
			});
			
			this.$eventBus.$emit('batchPasteAfter');
			if(type === 'new') {
				let data = JSON.parse(JSON.stringify(this.columnData)),
					dataChild = JSON.parse(JSON.stringify(this.columnData));

				if (data.parentKey.indexOf('step') !== -1) {
					let keyV = data.parentKey.split('step_')[1];
					// data.type = 'step';
					// data.value = Com.idStringToArr(keyV);
					// data.valueKey = keyV;
					// data.parentKey = 'step';

					dataChild.value = valueList;
					dataChild.valueKey = `${list.join(',')}`;
					data.children = [dataChild];

					let index = FindIndex(this.tree.columnData.children, item => {
						return item.valueKey == keyV;
					})
					

					console.log(index, this.tree.columnData);
					this.tree.columnData.children[index].children.push(dataChild);

					this.isUpdate = true;
					this.updateParentKey(dataChild, `${dataChild.parentKey}_${dataChild.valueKey}`);
					this.isUpdate = false;
				} else {
					data.value = valueList;
					data.valueKey = `${list.join(',')}`;
					this.tree.columnData.children.push(data);

					this.isUpdate = true;
					this.updateParentKey(data, `${data.parentKey}_${data.valueKey}`);
					this.isUpdate = false;
				}
			} else {
				let data = this.columnData;
				data.value = [
					...data.value,
					...valueList
				];
				data.valueKey = `${data.valueKey}${list.join(',')}`;

				this.isUpdate = true;
				this.updateParentKey(data, `${data.parentKey}_${data.valueKey}`);
				this.isUpdate = false;
			}
		},
		batchPasteCancel() {
			this.$eventBus.$emit('onBatchObj', {});			
		},
		onStepStartChange(value) {
			this.$emit('step-start-change', {index: this.index, value});
		},
		onStepEndChange(value) {
			this.$emit('step-end-change', {index: this.index, value});
		},
		handleCancelPaste() {
			this.$eventBus.$emit('childCopy', null);
		},
		handleInputValid(valid, index) {
			const {
				parentKey
			} = this.columnData;
			this.columnData.valid = valid;
		},
		onMove(evt) {
			console.log(evt)
		},
		onEnd(evt) {
			const {
				value
			} = this.columnData;
			if (this.isAction) return;
			this.$parent.$emit('column-end');
			this.tree.updateData();
		},
		copyFun() {
			if (JSON.stringify(this.batchObj) != '{}' ) {
				this.$message.warning('当前正处于批量移动算法状态中，不能处理此操作！');
				return;
			}
			this.$eventBus.$emit('paste');  //先取消
			this.$message.info('可按ESC键取消复制！');

			this.$eventBus.$emit('childCopy', this.columnData);
		},
		pasteFun() {
			this.$confirm('复制配置吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let data = this.columnData;
				let childrenData = JSON.parse(JSON.stringify(this.parentCopyData.children));
				data.children = childrenData;
				this.isUpdate = true;
				this.updateParentKey(data, `${data.parentKey}_${data.valueKey}`);
				this.isUpdate = false;
				this.tree.updateData();
				this.$eventBus.$emit('paste');

				this.$message({
					type: 'success',
					message: '复制成功!'
				});
			}).catch(() => {});
		},
		copyClass(type) {
			let _type = type;

			let index = FindIndex(this.fuzhiList, item => item === _type);
			if (index >= 0) {
				return 'close';
			}
		},
		collapseFun(type) {
			let _type = type;
			
			if (_type === 'itemids') {
				return;
			} else {
				let index = FindIndex(this.clickType, item => item === _type);
				if (index >= 0) {
					this.clickType.splice(index, 1);
				} else {
					this.clickType.push(_type);
				}
			}	
		},
		downFun(v) {
			let _v = v;
			let index = FindIndex(this.openList, item => item === _v);
			if (index >= 0) {
				this.openList.splice(index, 1);
			} else {
				this.openList.push(_v);
			}
		},
		downClassFun(v) {
			let _v = v;
			let index = FindIndex(this.openList, item => item === _v);
			if (index >= 0) {
				return {height: 'auto'};
			}
		},
	},
}
</script>

<style lang="less" scoped>
	.formula_tree {
		> .tree_column_wrap {
			&:nth-child(2n) {
				background: #FAFAFA;
			}
			&:nth-child(4n) {
				background: #fff;
			}
			padding: 20px 25px;
			> .headTitle {
				display: flex;
				flex: 0 0 auto;
				padding-bottom: 5px;
				background: red;
			}
			> .tree_column {
				min-width: 1750px;
				> .tree_column-child{
					// width: 100%;
					padding-bottom: 15px;
					>.child_content{
						box-sizing: border-box;
						overflow: hidden;
						// height: 90px;
						padding: 20px 10px;
						border-radius: 4px;
						border: 1px solid #E5E5E5;
						
					}
					>.packContent {
						padding-left: 26px;
					}
					>.down {
						text-align: center;
					}
				}
			}
		}	
	}
	
	.tree_column {
		display: flex;
		flex: 0 0 auto;
		.headTitle {
			display: none;
		}
		.packageBg {
			position: absolute;
			top: 6px;
			left: -22px;
			/* height: 20px; */
			width: 20px;
			padding: 4px 0;
			color: #fff;
			text-align: center;
		}
		& .tree_column-value {
			position: relative;
			min-height: 42px;
			transition: all .1s;
			.fuzhi {
				display: none;
				position: absolute;
				top: -15px;
				right: -25px;
				z-index: 2;
				cursor: pointer;
				padding: 4px;
				background: #fff;
				border-radius: 2px;
			}
			.copyShadow {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				z-index: 1;
				text-align: center;
				background:rgba(84,82,82,0.5);
				border-radius:2px;
				span {
					cursor: pointer;
					display: inline-block;
					// margin-top: 45px; 
					padding: 5px 15px;
					background: #fff;
					color: #00AAEE;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%,-50%);
				}
			}
			&:hover {
				.fuzhi {
					display: block;
					color: #fff;
					background: #00AAEE;
				}
			}
		}
		& .tree_column_wrap {
			&:not(:first-child) {
				margin-top: 5px;
				padding-top: 5px;
				border-top: 1px solid #efefef;
			}
		}
		& .is_temp {
			position: relative;
			height: 60px;
			border: 1px dashed #ccc;
			&:before {
				content: '拖动至此处创建新的公式';
				position: absolute;
				left: 50%;
				top: 50%;
				width: auto;
				transform: translate(-50%, -50%);
				color: #ccc;
				font-size: 12px;
				text-align: center;
			}
		}

		& .step {
			// display: flex;
			padding-top: 15px; 
			.el-input-number {
				display: inline-block;
				width: 40%;
				&:first-child {
					margin-right: 10px;
				}
			}
		}
		& .itemids{
			// width: 248px;
			.bianji {
				cursor: pointer;
				position: absolute;
				top: -17px;
				left: 5px;
				font-size: 13px;
				color: rgb(169, 169, 169);
				transition: color .3s;
				&:hover {
					color: #0ae;
				}
			}
			.niantiepeizhi {
				cursor: pointer;
				position: absolute;
				top: -20px;
				left: 2px;
				padding: 2px 4px;
				font-size: 12px;
				color: #00AAEE;
				background: #fff;
				border: 1px solid #EDEDED;
				border-radius: 4px;
			}
			.cancel {
				position: absolute;
				top: -13px;
				left: 5px;
				font-size: 12px;
				color: rgb(169, 169, 169);
				.cancelBtn {
					cursor: pointer;
					margin-left: 5px;
					color: #00AAEE;
				}
			}
			.newBatch {
				top: auto;
				bottom: 30px;
				z-index: 2;
			}
			.drag {
				padding: 0;
			}
		}
		.dragWrap {
			-webkit-mask: linear-gradient(#000 calc(100% - 3em), transparent);
			.drag {
				padding: 5px;
				.sortable-chosen{
					border: 1px solid #F3E3A8;
					background: #FFFADF;
				}
				span {
					cursor: pointer;
				}
			}
		}
		.dragWrap::-webkit-scrollbar {
			width: 5px;
		}
		.dragWrap::-webkit-scrollbar-track {
			background-color:#eee;
			-webkit-border-radius: 2em;
			-moz-border-radius: 2em;
			border-radius:2em;
		}
		.dragWrap::-webkit-scrollbar-thumb {
			background-color:rgba(144, 147, 153, .5);;
			-webkit-border-radius: 2em;
			-moz-border-radius: 2em;
			border-radius:2em;
		}
		
		& .close {
			flex-grow: 0;
			width: 100px;
		}

		.equation {
			padding: 5px;
			.note {
				position: relative;
				padding-right: 16px;
				.el-checkbox__label {
					font-size: 12px;
				}
				.mgj-info {
					position: absolute;
					top: 2px;
					right: 0;
					width: 15px;
					height: 15px;
					color: rgb(169, 169, 169);
					cursor: pointer;
					transition: color .3s;
					font-size: 14px;
					color: #606266;
					&:hover {
						color: #0ae;
					}
				}
				
			}
			.manyCommission {
				height: 20px;
				padding-top: 4px;
			}
		}
		
	}
</style>
<style>
	.is_select_perf_pct .el-input-group__prepend {
		background-color: #0ae;
	}
	.is_select_perf_pct .icon_info,
	.is_select_perf_pct .icon_info:hover
	 {
		color: #fff;
		
	}
</style>
