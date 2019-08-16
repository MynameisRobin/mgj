<template>
	<el-dialog class="distribution wrap"
	:visible.sync="distributionVisible"
	width="500px"
	left
	:before-close="handleClose">
	<h3>将 <span>{{planData.name}}</span> 方案分配到门店</h3>
	<div v-if="storeList.length > 0" v-loading="loading">
		<ul v-if="softgenre === '0' ">
			<li class="storeLi">
				<el-checkbox :indeterminate="isIndeterminate" 
					:disabled="checkAllDisabled"
					v-model="checkAll" @change="handleCheckAllChange">选择所有直营店</el-checkbox>
			</li>
		</ul>
		<el-checkbox-group v-model="checkStoreListCopy" @change="handleCheckedCitiesChange">
			<ul ref="storeUl" class="storeUl scroll5">
				<DistributionItem ref="storeLi" class="storeLi" v-for="(item, key) in storeList" 
					:key="key" 
					:item="item" 
					:planData="planData"
					:giveChildParentShopId="parentShopId"
					@checkDisable="onCheckDisable"></DistributionItem>
			</ul>
		</el-checkbox-group>
	</div>

	<span slot="footer" class="dialog-footer">
		<el-button type="primary" @click="distrSave">保存</el-button>
	</span>
	</el-dialog>
</template>

<script>
import FindIndex from 'lodash.findindex'
import DistributionItem from './distributionItem'

export default {
	name: "Distribution",
	props: {
		distributionVisible: Boolean,
		planData: Object,
		parentShopId: String,
		shopId: String,
		shopIds: String,
		selectType: Number
	},
	components: {
		DistributionItem	
	},
	data() {
		return {
			loading: true,
			checkStoreList: [],
			checkStoreListCopy: [],
			allStoreIds: [],
			checkAll: false,
			checkAllDisabled: false,
			isIndeterminate: null,
			storeList: [],
			userList: [],
			editData: [],
			editDataCopy: []
		}
	},
	computed: {
		softgenre() {
			return JSON.parse(localStorage.reservationMetadata).userInfo.softgenre;
		}
	},
	mounted() {

		// 方案对店
		let list = [];
		this.planData.shops.forEach( item => {
			if (item.employeeNos === null) {
				list.push(item.id);
			}
		});

		this.checkStoreList = list;

		this.checkStoreListCopy = [...this.checkStoreList];

		let params = {
			parentShopId: this.shopId,
			type: this.planData.type,
			proposalId: -1,
		}
		this.shopsWithProposalsApi(params);
	},
	methods: {
		onCheckDisable() {
			this.checkAllDisabled = true;
		},
		handleClose() {  
			this.checkStoreListCopy = [...this.checkStoreList];
			this.$emit('distributionVisible', false);
		},
		userPopFun(data) {
			const {
				shopId
			} = data;
			this.userPopId = data;
		},
		handleCheckAllChange(val) {
			this.checkStoreListCopy = val ? this.allStoreIds : [];
			this.isIndeterminate = false;
		},
		handleCheckedCitiesChange(value) {
			let checkedCount = value.length;
			this.checkAll = checkedCount === this.storeList.length;
			this.isIndeterminate = checkedCount > 0 && checkedCount < this.storeList.length;
		},
		shopsWithProposalsApi(parmas) {
			// 获取所有门店
			this.loading = true;
			this.$http.get(`/shop/proposal!shopsWithProposals.action`, {'params': parmas }).then( res => {
				this.loading = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					
					this.storeList = this.shopSplit(content);
					this.allStoreIds = this.storeList.map(item => item.id);

					// 默认全选与否
					if (this.checkStoreListCopy.length >= this.storeList.length) {
						this.checkAll = true;
						this.isIndeterminate = false;				
					}

					if (this.checkStoreListCopy.length > 0 && this.checkStoreListCopy.length < this.storeList.length) {
						this.isIndeterminate = true;											
					}
				}
			})
		},
		shopSplit(data) {
			let shopIds = this.shopIds.split(','),
				list = [];
			shopIds.forEach( k => {
				data.forEach( k1 => {
					if (k === k1.id.toString()) {
						list.push(k1);
					}
				})
			})
			return list;
		},
		distrSave() {
			let storeLi = this.$refs.storeLi,
				list = [];

			let proposalsObj = {
				id: this.planData.id,
				isBonus: (this.planData.isBonus === true || this.planData.isBonus === 1 ) ? 1 : 0
			};

			list = storeLi.map(el => {
				let obj = {
					type: this.planData.type,
					id: el.item.id,
					proposals: []
				}

				// 赋值已有方案
				if (el.item.proposals.length > 0) {
					el.item.proposals.forEach(itemA => {
						if (itemA.id !== this.planData.id) {
							let elObj = {
								id: itemA.id,
								isBonus: itemA.isBonus === 0 ? 0 : 1,
							}
							if (itemA.employeeNos) {
								elObj.employeeNos = itemA.employeeNos;
							}
							obj.proposals.push(elObj);
						}
					});
				}

				// 新增push门店员工
				if (el.checkUserListCopy.length > 0) {
					obj.proposals.push({
						...proposalsObj,
						employeeNos: `,${el.checkUserListCopy.join(',')},`
					});
				}
				return obj;
			});

			list.forEach( (item, index, arr) => {
				// 如果这是一个主方案并且 已被勾选 那就先清除本门下的主方案
				if (this.planData.isBonus === 0 && this.checkStoreListCopy.indexOf(item.id) !== -1) {
					item.proposals.forEach((itemA, indexA, arrA) => {
						if (itemA.isBonus === 0 && !itemA.employeeNos) {
							arrA.splice(indexA, 1);
						}
					})	
				}

				if (this.checkStoreListCopy.indexOf(item.id) !== -1) {
					arr[index].proposals.push(proposalsObj);
				}
			});

			// console.log(list);
			// return
			this.saveFun(list);
		},
		saveFun(params) {
			this.$http.post(`/proposal!saveShopWithProposal.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.$message({
						type: 'success',
						message: '保存成功!'
					});
					this.$emit('distributionSave', this.selectType);
				}
			});
		}
	}
}
</script>

<style lang="less">
	.distribution {
		.el-dialog__body {
			padding-top: 0;
		}
		.el-checkbox__label {
			font-size: 12px;
		}
		div.el-dialog__footer {
			text-align: left;
		}
	}
	.distributionPop {
		.el-checkbox-group {
			font-size: 12px;
			.el-checkbox__label {
				width: 45px;
				font-size: 12px;
			}
		}
		.userUl {
			overflow-y: auto;
			max-height: 250px;
			li {
				padding: 5px 0;
				span {
					display: inline-block;
				}
				.name {
					width: 50px;
				}
				.title {
					margin-left: 5px;
					color: #B6B6B6;
				}
			}
		}
		.btnDiv {
			padding-top: 20px;
			text-align: right;
		}
	}
	.scroll5::-webkit-scrollbar {
		width: 5px;
	}
	.scroll5::-webkit-scrollbar-track {
		background-color:#eee;
		-webkit-border-radius: 2em;
		-moz-border-radius: 2em;
		border-radius:2em;
	}
	.scroll5::-webkit-scrollbar-thumb {
		background-color:rgba(144, 147, 153, .5);;
		-webkit-border-radius: 2em;
		-moz-border-radius: 2em;
		border-radius:2em;
	}
</style>

<style lang="less" scoped>
	.wrap {
		h3 {
			margin-bottom: 28px;
			font-size: 13px;
			color: #333;
			span {
				color: #00AAEE;
			}
		}
		.storeUl {
			// display: flex;
			overflow-y: auto;
			height: 190px;
		}
		.storeLi {
			position: relative;
			display: inline-block;
			width: 48%;
			margin-bottom: 11px;
			padding: 8px 11px;
			font-size: 13px;
			background:rgba(255,255,255,1);
			border-radius:4px;
			border:1px solid rgba(221,223,230,1);
			&:nth-child(odd) {
				margin-right: 4%;
			}
			.user {
				cursor: pointer;
				position: absolute;
				top: 8px;
				right: 11px;
			}
			.user.nobody {
				color: #909090;
			}
		}
	}
	
</style>
