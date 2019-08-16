<template>
	<div class="formula_tree">

		<div class="headTitle one" ref="headTitle" :style="headTitlScrollStyle">
			<h4 v-for=" (item, key) in columnsConfig" :key="key" :class="[item.type, closeClassFun(item.type)]">
				<span v-if="key == 0 ">提成算法1</span>  
				<el-button :plain="true" size="mini" :class="[colCLength]" v-if="key == 0 " @click="handleCopy(0, item.type)"
					:disabled="colC.length === 1"
					:title="colC.length === 1 ? '没有其他算法' : '复制该算法全部配置' ">
					<am-icon class="button_copy" :class="{'button_copy__active':colC.length > 1}" name="fuzhipeizhi"></am-icon>
				</el-button>	

				<span v-if="headTitlScrollStyle === null && columnData.children && columnData.children[0] && (item.type === 'step' || item.type === 'itemids') " class="open" 
					:title="columnData.children[0].open !== false ? '收起' : '展开'" @click="openFun(0)">
					<am-icon :name="columnData.children[0].open !== false ? 'list_retract' : 'list_open' "></am-icon>
				</span>

				<span :class="{'name': true, 'marginClass' : key == 0, 'stepSpan': item.type == 'step' }" 
					@click="addStep(item.type)"
					:title="item.type === 'equation' ? '“关键字”可帮助用户快速配置出合法的提成计算公式' : '' ">
					{{item.name}}
					<el-popover v-if="item.type === 'payTypes' "
						popper-class="popInfo"
						placement="bottom"
						width="200"
						trigger="hover">
						<div class="content" v-for="(_item, _key) in payTypesInfo" :key="_key">
							<h4>{{_item.title}}</h4>
							<p>{{_item.content}}</p>
						</div>
						<i slot="reference" class="icon_info icon iconfont mgj-info"></i>
					</el-popover>
				</span>

				<span v-if="key != 0" class="hasBg" @click="collapseFun(item.type)" disabled="disabled">
					<am-icon v-if="key != 0 && !closeClassFun(item.type)" style="color: #A9A9A9;" name="shouqi"
						title="收起该配置"></am-icon>
					<am-icon v-if="key != 0 && closeClassFun(item.type)" style="color: #00AAEE;" name="fangda"
						title="展开该配置"></am-icon>
				</span>	
			</h4>
		</div>

		<div v-if="columnData.children && columnData.children[0] && columnData.children[0].open === false" 
			class="one stepAndItemidsDiv">
			<ul @click="openFun(0)">
				<li v-for="(obj, key) in columnData.children[0].value" :key="key" 
					v-if="key < 6">
					<span class="label">{{obj.outer_name}}</span>
					<span class="id">{{obj.id}}</span>
					<span class="name">{{obj.name || obj.cardtypename || obj.packName}}</span>	
				</li>
			</ul>
		</div>

		<template v-if="headersWidth.length > 0" v-for="(item, key) in columnData.children">
			<div :class="{'headTitle' : true, 'odd' : key%2 === 0, 'even' : key%2 !== 0 }" v-if="key > 0" :key="key">
				<h4 class="openH4">
					<span>提成算法 {{key+1}}</span>  
					<!-- <span class="name">{{item.name}}</span>  -->
					<span class="hasBg singHas" @click="handleCopy(key, item.type)"
						title="复制该算法全部配置">
						<am-icon class="button_copy" :class="{'button_copy__active':colC.length > 1}" name="fuzhipeizhi"></am-icon>
					</span>

					<span v-if="item.type === 'step' || item.type === 'itemids' " class="open"
						:title="item.open !== false ? '收起' : '展开'" @click="openFun(key)">
						<am-icon :name="item.open !== false ? 'list_retract' : 'list_open' "></am-icon>
					</span>
				</h4>
				<div class="stepAndItemidsDiv" v-if="item.open !== false"></div>
				<div class="stepAndItemidsDiv" v-if="item.open === false" @click="openFun(key)">
					<ul>
						<li v-for="(obj, key) in item.value" :key="key"
							v-if="key < 6">
							<span class="label">{{obj.outer_name}}</span>
							<span class="id">{{obj.id}}</span>
							<span class="name">{{obj.name || obj.cardtypename || obj.packName}}</span>	
						</li>
					</ul>
				</div>
			</div>
		
			<tree-column
				@group-move="handleGroupMove"
				v-if="!isUpdate && item.open !== false"
				@add-temp="handleAddTempChild"
				@step-start-change="handleStepStartChange"
				@step-end-change="handleStepEndChange"
				:hidden-list="hiddenList"
				:key="`${item.parentKey}_${item.valueKey}`"
				:index="key"
				:column-data="item"
				:typeKey="typeKey"
				:parentCopyData="parentCopyData">
			</tree-column>

		</template>

	</div>
</template>

<script>
import FindIndex from 'lodash.findindex'
import TreeColumn from './column.vue'
import emitter from '@/js/emitter'
import Tree from './tree.js'
import ColumnMixins from './mixins'

export default {
	name: 'FormulaTree',
	mixins: [emitter, ColumnMixins],
	components: {
		TreeColumn
	},
	props: {
		data: Array,
		columnsConfig: Array,
		columnMap: Object,
		typeKey: Object,
		formulaSplice: Array,
		payList: Array,
		tabPaneType: Number,
	},
	data() {
		return {
			open: true,
			columnData: {
				children: null
			},
			isTree: false,
			hiddenList: [],
			headersWidth: [],
			parentCopyData: null,
			colC: [],
			headTitlScrollStyle: null,
			payTypesInfo: [
				{
					title: '支付方式拆分的计算逻辑：',
					content: '当用户按照不同支付方式配置不同的提成计算公式时，系统会根据员工基准业绩计算出总业绩，再按照支付方式的占比计算出不同支付方式对应的业绩，得出的业绩按照提成的计算公式算出相应的提成'
				}, 
				{
					title: '举例：',
					content: '项目消费时，员工基准业绩现金100%，卡金80%，现金支付50，卡金支付100，员工基准业绩=50*100%+100*80%=130'
				},
				{
					title: '支付方式拆分的公式为：',
					content: '现金对应的业绩=50/150*130=43.33，卡金对应的业绩=100/150*86.67*130'
				}
			]
		}
	},
	computed: {
		colCLength() {
			return this.colC.length === 1 ? 'dis' : 'noDis'
		}
	},
	watch: {
		data(newV, oldV) {
			this.init();
		},
		columnsConfig(newV, oldV) {
			// console.log(1, this.data, this.columnData, this.data[0].step);
			// console.log(2, this.data, this.columnsConfig, this.columnData);
			this.init();
		},
		'columnData.children'() {
			this.$emit('treeShow');
		}
	},
	created() {
		this.$eventBus.$on('childCopy', (data) => {
			window.addEventListener('keyup', this.handleEscKeyUp);
			this.parentCopyData = data;
		});

		window.addEventListener('scroll', this.handleScroll);

		// this.$eventBus.$on('onBatchObj', data => this.batchObj = data);

	},	
	mounted() {
		this.init();

		this.$eventBus.$on('fastNavItemOpen', obj => {
			// 接收快速导航点击的下标
			const {
				no,
				name
			} = obj;
			let child = this.columnData.children[no];
			this.columnData.children.forEach(item => {
				this.$set(item, 'open', false);
			})
			this.$set(child, 'open', true);
			this.$nextTick( () => {
				this.$eventBus.$emit('fastNavItemOpenAfter', obj);
			});
		});
	},
	methods: {
		openFun(index) {
			let child = this.columnData.children[index];
			this.$set(child, 'open', !child.open);
		},
		handleScroll(e) {
			this.$nextTick(() => {
				let t = document.documentElement.scrollTop || document.body.scrollTop,
					scrollL = document.documentElement.scrollLeft || document.body.scrollLeft,
					width = document.querySelector('.formula_tree').clientWidth;
				if (t >= 115) {
					this.headTitlScrollStyle = `position: fixed; top: 100px; width: ${width}px;`;
				} else {
					this.headTitlScrollStyle = null;
				}

				if (t >= 115 && scrollL > 0) {
					this.headTitlScrollStyle = `position: fixed; top: 100px; left: ${-scrollL}px; width: ${width}px;`;
				} else {
					// 预留
				}
			});
		},
		handleStepStartChange({index, value}) {
			this.stepValsetAndUpdata({index, value});
		},
		handleStepEndChange({index, value}) {
			this.stepValsetAndUpdata({index, value});
		},
		handleCopy(index, type) {
			// if (this.parentCopyData !== null && this.parentCopyData.type === type) {
			// 	return;
			// }
			const {
				children
			} = this.columnData;
			// this.$eventBus.$emit('copy', 'parent', children[index] );
			this.$message.info('可按ESC键取消复制！');
			this.parentCopyData = children[index];
		},
		handleEscKeyUp(e) {
			if (e.keyCode === 27) {
				this.parentCopyData = null;
				// this.$eventBus.$emit('cancel-copy');
				// window.removeEventListener('keyup', this.handleEscKeyUp);
			}
		},
		getData() {
			return this.columnData.children;
		},
		defaultHideFun() {
			let hideObj = {
				consumeTypes: null,
				payTypes: null,
				evaluate: null
			}; 

			this.data.forEach(item => {
				if (item.consumeTypes !== '-1') {
					hideObj.consumeTypes = 'consumeTypes';
				}
				if (item.payTypes !== '-1') {
					hideObj.payTypes = 'payTypes';
				}
				if (item.evaluate !== '-1') {
					hideObj.evaluate = 'evaluate';
				}
			});

			// console.log(hideObj, Object.values(hideObj));
			this.hiddenList = [];
			Object.keys(hideObj).forEach(item => {
				console.log(item, hideObj[item]);
				if (hideObj[item] === null) {
					this.hiddenList.push(item)
				}
			});
		},
		init() {
			this.defaultHideFun();

			const columns = [];
			const headers = [];
			this.$nextTick( () => {
				let headTitleDom = this.$refs.headTitle.children;
				this.headersWidthFun(headTitleDom);

				this.headers = headers;
				this.isTree = true;

				this.columnData = new Tree({
					data: this.data,
					columnsConfig: this.columnsConfig,
					columnData: this.columnMap,
					typeKey: this.typeKey  // 当前大类型
				});
				
				this.columnData.children = this.columnData.children.map(item => {
					this.$set(item, 'open', false);
					return item;
				})

				this.colC = this.columnData.children;

				this.$emit('treeShow');
			})
		},
		updateChild(column) {
			const {
				children,
			} = column;
			children && children.forEach(item => {
				item.children = this.updateChild(item);
				if (item.children && item.children.length) {
					item.heightNumber = this.columnData.renderHeightNumber(item);
				}
			})
			return children ? children.filter(item => item) : null;
		},
		updateData() {
			const {
				children
			} = this.columnData;
			this.columnData.children = this.updateChild(this.columnData);
			this.columnData.heightNumber = this.columnData.renderHeightNumber(this.columnData);
		},
		collapseFun(type) {
			let childrenFor,
				list = [];
			if (type) {
				childrenFor = function (data, type) {
					for (let i = 0; i < data.length; i++) {
						if (data[i].type === type) {
							list.push(i);
						} else {
							if (data[i].children && data[i].children.length) {
								childrenFor(data[i].children, type);
							}
						}
					}
					return list;
				}
				childrenFor(this.columnData.children, type);
				let matchIndex = FindIndex(list, item => item === 1);
				if (matchIndex !== -1) {
					this.$message.info('当前列已分组，不能收起');
					return;
				}
			}


			let index = FindIndex(this.hiddenList, item => item === type);
			if (index >= 0) {
				this.hiddenList.splice(index, 1)
			} else {
				this.hiddenList.push(type);
			}

			this.$nextTick(() => {
				let headTitleDom = this.$refs.headTitle.children;
				this.headersWidthFun(headTitleDom);
			})
		},
		headersWidthFun(headTitleDom) {
			this.headersWidth = [];

			//处理虚业绩收起消费类型时展示部分过短问题 start
			if (this.tabPaneType === 5) {
				headTitleDom.item(1).style = `width: 350px;`;
			} else {
				let index = FindIndex(this.hiddenList, item => item === this.columnsConfig[1].type);
				if (index === -1) {
					headTitleDom.item(1).style = `flex-grow: 1;`;
				} else {
					headTitleDom.item(1).style = `flex-grow: 0;`;
				}
			}
			//处理虚业绩收起消费类型时展示部分过短问题 end

			this.columnsConfig.forEach((item, v, arr) => {
				let styleObj = {
					type: item.type,
					style: `height: 105px; width: ${headTitleDom.item(v).clientWidth}px;`
				}
				if (v === 1) {
					styleObj.style = `${styleObj.style} margin-left: 20px;`;
				}

				this.headersWidth.push(styleObj);
			})
		},
		closeClassFun(type) {
			let _type = type;
			let index = FindIndex(this.hiddenList, item => item === _type);
			if (index >= 0) {
				return 'close';
			}
		},
		addStep(type) {
			if (type !== 'step') {
				return;
			} else {
				this.$eventBus.$emit('addStep');
			}
		}
	}
}
</script>

<style lang="less" scope>
	
	.formula_tree {
		padding-top: 90px; 
		.button_copy {
			color: #a9a9a9;
		}
		.button_copy__active {
			transition: color .3s;
			&:hover {
				color: #0ae;
			}
		}
		.headTitle.one {
			z-index: 4;
			width: 100%;
			transition: all .2s;
			background: #FAFAFA;
			box-shadow: rgba(206, 206, 206, 0.26) 1px 2px 1px 0px;
			.open {
				position: absolute;
				right: 20px;
				top: 5px;
			}
		}
		.stepAndItemidsDiv.one {
			padding-left: 280px;
			background: #FAFAFA;
		}
		.stepAndItemidsDiv {
			overflow: hidden;
			width: 100%;
			height: 47px;
			font-size: 12px;
			li {
				&:first-child {
					padding-left: 0; 
					border-left: none;
				}
				display: inline-block;
				overflow: hidden;
				text-overflow:ellipsis;
				white-space: nowrap;
				width: 200px;
				padding-left: 10px;
				margin: 16px 0;
				border-left: 1px solid #EAEAEA;
				.type, .id {
					display: inline-block;
					margin: 0 6px;
					color: #909090;
				}
				.name {
					color: #333;
				}
			}
			
		}
		.odd {
			background: #FAFAFA;
		}
		.even {
			background: #fff;
		}
		.headTitle {
			display: flex;
			padding: 10px 0 10px 25px;
			h4 {
				flex-grow: 1;
			}
			h4.step {
				flex-grow: 0;
				width: 240px;
				.marginClass {
					margin-left:40px;
				}
				.open {
					position: absolute;
				}
			}
			h4.itemids {
				position: relative;
				flex-grow: 0;
				width: 250px;
				.marginClass {
					margin-left: 80px;
				}
				.open {
					cursor: pointer;
					position: absolute;
					right: 20px;
					top: 5px;
				}
			}

			h4:nth-of-type(2) {
				margin-left: 20px;
			}
			h4.equation {
				flex-grow: 0;
				width: 250px;
				.hasBg {
					visibility: hidden;
				}
			}
			.stepSpan {
				cursor: pointer;
				font-weight: 400;
				padding: 5px 8px;
				background: #fff;
				border-radius: 4px;
			}
			.close {
				flex-grow: 0;
				width: 100px;
			}
			.openH4 {
				position: relative;
				top: 12px;
				width: 298px;
				.open {
					cursor: pointer;
					position: absolute;
					right: 20px;
					top: 5px;
				}
			}
			.mgj-list_retract {
				color: #00ADF4;
			}
			.mgj-list_open {
				color: #eee;
			}
		}
	}
	.icon_info {
		color: #606266;
		font-weight: 100;
		font-size: 14px;
		cursor: pointer;
		transition: color .3s;
		&:hover {
			color: #0ae;
		}
	}
	.popInfo {
		font-size: 12px;
		.content {
			margin-bottom: 5px;
			h4 {
				line-height:20px;
				color: #C9C9C9;
			}
			p {
				line-height:15px;
				color: #333
			}
		}
		
	}
</style>


