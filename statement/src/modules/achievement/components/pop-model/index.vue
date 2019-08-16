<template>
	<div class="popModel">
		<el-dialog
			title="方案管理"
			:visible.sync="dialogVisible"
			width="915px"
			:before-close="handleClose">

			<dl class="wrapDl">
				<dt>
					<span v-for="(item, key) in head" :key="key">
						{{item}}
					</span>
				</dt>
				<dd>
					<el-scrollbar wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view" style="height: 300px;"
						ref="popModelDD">
						<div class="notEdit" v-if="tabPaneType === 5">虚业绩不支持编辑</div>
						<ul>
							<Item ref="item"
								v-for="(itemBig, listKey) in copyData.planList"
								:key="listKey"
								:index="listKey"
								:type-list="typeList"
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
				<el-button class="add" :disabled="tabPaneType === 5" @click="addFun">新增方案</el-button>
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
			@distributionVisible="onDistributionVisible"
			@distributionSave="onDistributionSave"></Distribution>

	</div>
</template>

<script>
/* eslint-disable */

import Com from '../../com'
import MapData from '../../mapData'

import UserList from './usersList'
import Item from './item.vue'
import Distribution from './distribution'

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
			dialogVisible: true,
			listData: [],
			...MapData.popModelIndexData({modelType: 'achievement'}),
			distributionVisible: false,
			planData: null,
			parentShopId: this.$parent.parentShopId,
			shopId: this.$parent.shopId
		}
	},
	watch: {
		planList(newVal) {
			this.init(newVal)
		}
	},
	computed: {
		typeList() {
			return MapData.tabPaneListFun({modelType: 'achievement'})
		},
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
		console.log(this.shopIds);
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
				this.$emit('childEditPlanAter');  //新增数据 获取数据
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
			let itemIsEdit = this.$refs.item && this.$refs.item.some(item => {
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

			// this.$router.push({
			// 	path: `/StoreConfig/storeTable/${this.tabPaneType}`,
			// });

			if (this.tabPaneType === 5) {
				this.$router.push({
					path: `/StoreConfig`,
				});
			} else {
				this.$router.push({
					path: `/StoreConfig/storeTable/${this.tabPaneType}`,
				});
			}

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
			this.$emit('distributionSave');
		},
		btnClick() {
			console.log(this.propsObj);
		}
	}

}
</script>

<style lang="less">
	.popModel {
		.el-dialog {
			border-radius: 4px;
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
			.notEdit {
				text-align: center;
				line-height: 300px;
				font-size: 16px;
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
