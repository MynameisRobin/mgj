<template>
	<div class="popModel">
		<el-dialog
			:visible.sync="dialogVisible"
			width="915px"
			:before-close="handleClose">

			<div slot="title" class="dialog-header">
				<span>方案管理</span>
				<el-select v-model="selectType" placeholder="请选择"
					@change="typeChange">
					<el-option
					v-for="item in selectList"
					:key="item.type"
					:label="item.label"
					:value="item.type">
					</el-option>
				</el-select>
			</div>

			<dl class="wrapDl">
				<dt>
					<span v-for="(item, key) in head" :key="key">
						{{item}}
						<el-popover v-if="item === '额外奖励'"
							popper-class="popInfo"
							placement="bottom"
							width="200"
							trigger="hover">
							<div class="content" v-for="(_item, _key) in JInfo" :key="_key">
								<h4>{{_item.title}}</h4>
								<p>{{_item.content}}</p>
							</div>
							<i slot="reference" class="icon_info icon iconfont mgj-info"></i>
						</el-popover>
					</span>
				</dt>
				<dd>
					<el-scrollbar wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view" style="height: 300px;"
						ref="popModelDD">
						<ul>
							<Item ref="item"
								v-for="(itemBig, listKey) in copyData.planList"
								:key="listKey"
								:index="listKey"
								:count-config="countConfig"
								:item-data="itemBig"
								:plan-id="planId"
								@update="handleItemUpdate"
								@copy="handleItemCopy"
								@delete="handleItemDelete"
								@cancle="handelItemCancel"
								@onSetting="handelItemSetting"
								@distribution="onDistribution"
								>
							</Item>
						</ul>
					</el-scrollbar>
				</dd>
			</dl>

			<div slot="footer" class="dialog-footer">
				<el-button class="add" @click="addFun">新增方案</el-button>
				<el-button class="store" @click="gotoFun('store')">分配方案门店</el-button>	
			</div>
		</el-dialog>

		<Distribution
			v-if="distributionVisible"
			:distributionVisible="distributionVisible"
			:planData="planData"
			:parentShopId="parentShopId"
			:shopId="shopId"
			:shopIds="shopIds"
			:selectType="selectType"
			@distributionVisible="onDistributionVisible"
			@distributionSave="onDistributionSave"></Distribution>
	</div>
</template>

<script>
/* eslint-disable */

import Com from '../../com'
import UserList from './usersList'
import Item from './item.vue'
import Distribution from './distribution'

const selectList = [
	{ label: '全部', type: -1},
	{ label: '项目', type: 0 },
	{ label: '卖品', type: 1 },
	{ label: '开卡', type: 2 },
	{ label: '充值', type: 3 },
	{ label: '套餐销售', type: 4 },
];

export default {
	name: "popModel",
	components: {
		UserList,
		Item,
		Distribution
	},
	props: {
		propsObj: Object,
		planList: Array,
		tabPaneType: Number,
		planId: [String, Number]
	},
	data() {
		return {
			selectList: selectList,
			selectType: this.propsObj.selectType,
			dialogVisible: true,
			listData: [],
			head : ['方案名称', '类别', '使用门店', '创建时间', '额外奖励', '操作'],
			JInfo: [
				{
					title: '主方案和额外奖励方案的说明：',
					content: '门店仅可启用1种主方案，所有营收类型的提成均按照主方案的配置来计算；门店还可以同时启用最多3种额外奖励方案；员工的提成=主方案计算的提成+额外奖励方案的提成；'
				},
				{
					title: '需要注意的是：',
					content: '门店可单独为员工配置1种主方案及最多3种额外奖励方案；一旦员工有独立启用的方案，以员工的主方案为准+员工额外奖励方案+门店额外奖励方案的模式来计算提成；没有独立启用方案的员工按门店启用的方案来计算提成。 '
				}
			],
			distributionVisible: false,
			planData: null,
			parentShopId: this.$parent.parentShopId,
			shopId: this.$parent.shopId
		}
	},
	watch: {
		planList(newVal) {
			this.init(newVal);
		}
	},
	computed: {
		copyData () {
			return this.propsObj;
		},
		countConfig() {
			let result = {};
			this.planList.forEach(item => {
				const {
					type,
					id
				} = item;
				if (result[type]) {
					result[type].push(id)
				} else {
					result[type] = [id];
				}
			})
			return result;
		},
		shopIds() {
			return this.$parent.userInfo.shopIds;
		}
	},
	created() {

	},
	mounted() {
		this.init(this.planList)
	},
	methods: {
		init(data) {
			this.listData = data;
		},
		handleItemUpdate(data) {
			console.log(data);
			if(!data.item.id) {
				//新增
				this.$nextTick(()=>{
					this.$refs.popModelDD.wrap.scrollTop = 0;
				})
				this.$emit('childEditPlanAter', this.selectType);  //新增数据 获取数据
			}else {
				//更新
				this.listData.splice(data.index, 1, data.item);
			}
		},
		handleItemCopy(data) {

		},
		handleItemDelete(data){
			console.log(data);
			this.copyData.planList.splice(data.index, 1);
		},
		handelItemCancel(data) {
			if(!data.item.id) {
				this.listData.splice( data.index, 1 );
				console.log(this.listData);
			}else {}
		},
		handleClose(done) {		
			let itemIsEdit = this.$refs.item.some(item => {
				return item.isEdit === true;
			});
			if (itemIsEdit) {
				this.$confirm('确认关闭？')
				.then(_ => {
					this.$emit('childClose', {show: false, doWhat: 'upData'});  //关闭窗口
					done();
				})
				.catch(_ => {});
			} else {
				this.$emit('childClose', {show: false, doWhat: 'upData'});  //关闭窗口
				done();
			}
		},
		handelItemSetting(data) {
			console.log('跳转指定方案数据', data.item);

			let obj = {
				show : false,
				doWhat : 'goto',
				itemData : data.item
			};
			
			this.$emit('childClose', obj);
		},
		addFun(){
			//新增按钮
			this.listData.push({shops: []});

			this.$nextTick(()=>{
				this.$refs.popModelDD.wrap.scrollTop = this.$refs.popModelDD.wrap.scrollHeight;
			})
		},
		gotoFun(type) {
			console.log(`跳转${type}`);
			this.$router.push({
				name: 'StoreConfig',
				params: {
					type: this.tabPaneType
				}
			});
		},
		onDistribution(obj) {	
			this.distributionVisible = true;
			this.planData = obj;
		},
		onDistributionVisible() {
			this.distributionVisible = false;
		},
		onDistributionSave() {
			// 监听保存
			this.distributionVisible = false;
			this.$emit('distributionSave', this.selectType);
		},
		typeChange(val) {
			this.$emit('popModelTypeChange', val);
		},
		btnClick() {
			console.log(this.propsObj);
		}
	}

}
</script>

<style lang="less" scoped>
	.popModel {
		.el-dialog {
			border-radius: 4px;
		}
		.el-dialog__header {
			position: relative;
			padding: 0;
			span {
				position: absolute;
				top: 24px;
				font-size: 18px;
			}
			.el-select {
				margin-left: 100px;
				width: 100px;
			}
		}
		.el-dialog__body {
			padding-bottom: 0px;
		}
		.dialog-footer {
			overflow: hidden;
		}
		.wrapDl {
			font-size:12px;
			dt {
				display: flex;
				margin-bottom: 15px;
				span {
					color:rgba(144,144,144,1);
					line-height:15px;
				}
			}
			dd  {
				border-radius:2px;
				border:1px solid #EDEDED;
			}
			dt span:nth-of-type(1), dd li .textDiv:nth-of-type(1) {
				// padding-left: 30px;
				margin-right: 10px;
				width: 280px;
			}
			dt span:nth-of-type(2), dd li .textDiv:nth-of-type(2) {
				margin-right: 10px;
				width: 100px;
			}
			dt span:nth-of-type(3), dd li .textDiv:nth-of-type(3) {
				width: 180px;
			}
			dt span:nth-of-type(4), dd li .textDiv:nth-of-type(4) {
				width: 150px;
			}
			dt span:nth-of-type(5), dd li .textDiv:nth-of-type(5) {
				width: 100px;
			}
			dt span:nth-of-type(6), dd li .textDiv:nth-of-type(6) {
				width: 150px;
			}
		}
		.dialog-footer {
			.add {
				float: left;
				color: #fff;
				height:30px;
				background: #00AAEE;
			}
			.store {
				height:30px;
				color: #fff;
				background: #FC9252;
			}
		}
		

	}
</style>
