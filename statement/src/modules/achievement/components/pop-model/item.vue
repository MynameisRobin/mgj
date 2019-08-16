<template>
	<li class="pop_model_item" v-loading="singleLoding">
		<div v-if="!isEdit">
			<div class="textDiv planName">
				<div v-if="itemBig.name" :title="itemBig.name">
					{{itemBig.name | cutString(20)}}
					<span v-if="itemBig.id === planId" style="float: right; color: #B8B8B8;">当前</span>
				</div>
			</div>
			<div class="textDiv">
				<div>
					{{ typeLabel }}
				</div>
			</div>
			<div class="textDiv storeList">
				<div>
					<el-scrollbar wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view" 
						v-if="itemBig.shopsList && itemBig.shopsList.length > 0" :style="showShopStyle">
						<div v-for="(itemA, keyA) in itemBig.shopsList " :key="keyA" :title="itemA.osname">
							{{itemA.osname | cutString(8)}}
							<el-popover
								placement="right"
								trigger="hover">
								<UserList :arr="itemA.employees"></UserList>
								<am-icon slot="reference" v-if="itemA.employees && itemA.employees.length" 
									class="icon user" name="yonghutubiao"></am-icon>
							</el-popover>
						</div>
					</el-scrollbar>
					<span v-if="itemBig.shopsList && itemBig.shopsList.length == 0">--</span>
				</div>
			</div>
			<div class="textDiv">{{ itemBig.createTime | date('YYYY-MM-DD') }}</div>
			<div class="textDiv">
				<div class="operation">
					<am-icon 
						class="icon"
						v-for="(item, key) in editTextList"
						@click.native="item.function(itemBig)"
						:key="key"
						:name="item.name"
						:title="item.title" >
					</am-icon>
				</div>
			</div>	
		</div>
		
		<!-- 编辑 -->
		<div v-else>
			<div class="textDiv planName">
				<el-input type="text" :maxlength="25" v-model="editVm.name"></el-input>
			</div>
			<div class="textDiv typeList">
				<el-select v-if="!editVm.id" v-model="editVm.type" placeholder="请选择">
					<el-option
					v-for="item in typeList"
					v-if="item.type !== 5"
					:key="item.type"
					:label="item.label"
					:value="item.type">
					</el-option>
				</el-select>
			
				<div v-else>
					{{ typeLabel }}
				</div>
			</div>
			
			<div v-if="editVm.id" :class="{'textDiv': true, 'storeList' : true, 'isEdit': isEdit}" @click="distributionFun(editVm)">
				<div>
					<div class="shopks_setDiv">
						<div>
							<am-icon name="shopks_set"></am-icon>
						</div>
					</div>

					<div v-if="editVm.shopsList  && editVm.shopsList .length > 0 && editVm.shopsList .length < 2" 
						v-for="(itemA, keyA) in editVm.shopsList  " :key="keyA">
						{{itemA.osname | cutString(8)}}
						<el-popover
							placement="right"
							trigger="hover">
							<UserList :arr="itemA.employees"></UserList>
							<am-icon slot="reference" v-if="itemA.employees && itemA.employees.length" 
								class="icon user" name="yonghutubiao"></am-icon>
						</el-popover>
					</div>
					<el-scrollbar wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view" 
						v-if="editVm.shopsList  && editVm.shopsList .length >= 2" style="height: 100px;">
						<div v-for="(itemA, keyA) in editVm.shopsList  " :key="keyA">
							{{itemA.osname | cutString(8)}}
							<el-popover
								placement="right"
								trigger="hover">
								<UserList :arr="itemA.employees"></UserList>
								<am-icon slot="reference" v-if="itemA.employees && itemA.employees.length" 
									class="icon user" name="yonghutubiao"></am-icon>
							</el-popover>
						</div>
					</el-scrollbar>
					<span v-if="!editVm.shopsList  || editVm.shopsList .length == 0">--</span>
				</div>
			</div>
			<div class="textDiv">{{ editVm.createTime | date('YYYY-MM-DD') }}</div>
			<div class="textDiv">
				<div class="operation">
					<span class="btn cancel" @click="onCancel(itemBig)">取消</span>
					<span class="btn edit" @click="onSave">{{ itemBig.id ? '确定修改' : '确定新增' }}</span>
				</div>
			</div>	
		</div>

	</li>

</template>
<script>
/* eslint-disable */
import UserList from './usersList'
import PlanType from '../label-content/planType'
import MetaDataMixin from '#/mixins/meta-data'

export default {
	mixins: [MetaDataMixin],
	name:'pop-model-item',
	components: {
		UserList,
		PlanType
	},
	data() {
		return {
			isEdit: false,
			singleLoding : false,
			itemBig: {},
			editVm: {
				type: null
			},
			editTextList: [
				{
					name: 'fanganbianji',
					title: '编辑',
					function: this.onEdit
				},
				{
					name: 'fanganshanchu',
					title: '删除',
					function:this.onDelete
				},
				{
					name: 'fanganfuzhi',
					title: '复制',
					function: this.onCopy
				},
				{
					name: 'fanganshezhi',
					title: '方案配置',
					function: this.onSetting
				}
			],
			checkBoxG: [1]
		}
	},
	props: {
		typeList: Array,
		countConfig: Object,
		itemData: Object,
		index: Number,
		planId: [String, Number]
	},
	computed: {
		typeLabel() {
			let label = null;
			for( let i of this.typeList) {	
				if (i.type === this.itemBig.type) {
					label = i.label;
					break;
				}
			}
			return label;
		},
		showShopStyle() {
			let height = this.itemBig.shopsList .length > 1 ? '80' : '40'
			return {
				height: `${height}px`
			}
		},
		countConfigIndex() {
			return this.index;
		}
	},
	watch:{
		itemData(newVal) {
			this.init(newVal);
			// if(this.itemBig.shops.length > 1) {
			// 	this.showShopH = '80px';
			// }
		}
	},
	mounted () {
		this.init(this.itemData);
	
	},
	methods: {
		init(data) {
			this.isEdit = !this.itemData.id;

			data.shopsList = this.hashListFun(data);
			this.itemBig = data;
		},

		onEdit(data) {
			let arr = JSON.parse(JSON.stringify(data));
			arr.shopsList = this.hashListFun(arr);

			this.editVm = arr;
			this.isEdit = true;
		},
		hashListFun(arr) {
			let hashList = [],
				list = [];
			arr.shops.forEach(item => {
				if (hashList.indexOf(item.id) === -1) {
					list.push(item);
				} else if (hashList.indexOf(item.id) !== -1 && item.employeeNos !== null) {
					let index = hashList.indexOf(item.id);
					list.splice(index, 1);
					list.push(item);
				}
				hashList.indexOf(item.id) === -1 ? hashList.push(item.id) : '';
			});
			return list;
		},
		onDelete(data) {
			if(data.shops.length > 0) {
				this.$message.warning('使用中的方案不能删除！');
				return;
			}
			if (this.countConfig[data.type].length === 1) {
				this.$message.warning('每个类型下至少保留一个方案');
				return;
			}

			this.$confirm('此操作将删除该方案, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let params = {
					proposalId : data.id,
					parentShopId: this.shopId,
				}
				this.delProposal(params);
			}).catch(() => {});	
		},
		onCopy(data) {

			this.$confirm('确定要复制此方案吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let params = {
					proposalId : data.id,
					parentShopId: this.shopId,
				};
				this.singleLoding = true;
				this.$http.get(`/shop/proposal!copyProposal.action`, {'params' : params}).then( res => {
					this.singleLoding = false;
					let resData = res.data;
					const { code, content } = resData;
					if (code === 0) {
						this.isEdit = false;
						this.$message({
							message: '操作成功',
							type: 'success'
						});
						
						this.$emit('update', {index: null, item: {} });
					}
				})
			}).catch(() => {});	
		},
		onSetting(data) {
			this.$emit('onSetting', {popModel: false, item: data});
		},
		onSave() {
			if(!this.editVm.name) {
				this.$message({
					message: '请输入方案名！',
					type: 'warning'
				});
				return;
			}else if(this.editVm.type == null) {
				this.$message({
					message: '请选择方案类型！',
					type: 'warning'
				});
				return;
			}

			this.editVm.isBonus = this.editVm.isBonus ? 1:0;
			let params = {
				...this.editVm,
				enableStep : this.editVm.enableStep ? this.editVm.enableStep : 0, //默认传0
				parentShopId: this.shopId,
			}
			console.log('updata', params);
			this.singleLoding = true;
			this.$http.post(`/shop/proposal!saveProposal.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.isEdit = false;
					this.$message({
						message: '操作成功',
						type: 'success'
					});
					
					this.$emit('update', {index: this.index, item: this.editVm});
				}
			})
		},
		onCancel(data) {
			this.isEdit = false;
			if(!data.id) {
				this.$emit('cancle', {index: this.index, item: this.editVm});
			}else {}
		},
		delProposal(params) {
			//删除   
			this.singleLoding = true;
			this.$http.get(`/shop/proposal!delProposal.action`, {'params' : params}).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.$message({
						message: '删除成功',
						type: 'success'
					});
					this.$emit('delete', {index: this.index});
				}
			})
		},
		distributionFun(obj) {
			this.$emit('distribution', obj);
		}
	}
}
</script>

<style lang="less" scoped>
	.wrapDl {

		li {
			background: #fff;
			&:nth-of-type(odd) {
				background: #FAFAFA;
			}
			>div {
				display: flex;
				.textDiv {
					line-height: 40px;
					overflow: hidden;
				}
				.planName {
					position: relative;
					.planType {
						position: absolute;
						top: 0;
						left: 10px;
						height: auto;
					}
				}
				.storeList {
					> div {
						position: relative;
						padding-left: 5px;
    					margin: 5px;
						.shopks_setDiv {
							position: absolute;
							// top: 10%;
							right: 20px;
							width: 15px;
							height: 80%;
							border-radius: 18px;
							// background: #EDEDED;
							> div {
								position: relative;
								width: 100%;
								height: 100%;
								.mgj-shopks_set {
									position: absolute;
									top: 6%;
									right: -4px;
									font-size: 10px;
									color: #00AAEE;
									transform: scale(.4, .4);
								}
							}
						}
					}
					
				}
				.operation {
					.icon {
						cursor: pointer;
						margin-right: 5px;
					}
					.btn {
						cursor: pointer;
						display: inline-block;
						// margin-right: 10px;
					}
					.cancel {
						color: #909090;
					}
					.edit, .add {
						color: #00AAEE;
					}
				}
			}	
		}
		
		.textDiv:nth-of-type(1) {
			padding-left: 30px;
			margin-right: 10px;
			width: 280px;
		}
		.textDiv:nth-of-type(2) {
			margin-right: 10px;
			width: 100px;
		}
		.textDiv:nth-of-type(3) {
			width: 180px;
		}
		.textDiv:nth-of-type(4) {
			width: 150px;
		}
		.textDiv:nth-of-type(5) {
			width: 100px;
		}
		.textDiv:nth-of-type(6) {
			width: 150px;
		}
		.bonus_checkbox_group {
			& .el-checkbox__label {
				font-size: 12px;
			}
		}
	}
</style>

