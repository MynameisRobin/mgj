<template>
	<li class="storeLi">
		<el-checkbox :label="item.id"
			:disabled="checkDisable">{{(item.osname || item.name) | cutString(22)}}</el-checkbox>
		<!-- <template>
			<el-popover
				popper-class="distributionPop"
				placement="bottom"
				width="220" 
				trigger="manual"
				v-model="visible"
				@show="userListShowFun">
				<div>
					<el-checkbox-group v-model="checkUserListCopy"
						@change="userListChange">
						<ul class="userUl scroll5">
							<li v-for="(user, userKey) in userList" :key="userKey">
								<el-checkbox :label="user.no" :disabled="user._checkDisable"></el-checkbox>
								<span class="name" :title="user.name || user.nickname">{{(user.name || user.nickname) | cutString(8) }}</span>
								<span class="title" :title="user.barberLevelName">{{user.barberLevelName | cutString(10)}}</span>
							</li>
						</ul>
					</el-checkbox-group>
					<div class="btnDiv">
						<el-button type="info" size="mini" 
							@click="userCancelFun">取消</el-button>
						<el-button type="primary" size="mini"
							@click="userSureFun">确定</el-button>
					</div>
				</div>
				
				<am-icon slot="reference"
					title="选择员工"
					:class="{'icon': true, 'user': true, 'has': checkUserListCopy.length > 0}" name="yonghutubiao"
					@click.native="visible = !visible"></am-icon>
			</el-popover>
		</template> -->
	</li>
</template>

<script>
import FindIndex from 'lodash.findindex'

export default {
	name: 'distributionTtem',
	props: {
		item: Object,
		planData: Object,
		giveChildParentShopId: String
	},
	computed: {

	},
	data() {
		return {
			visible: false,
			userList: [],
			checkUserList: [],
			checkUserListCopy: [],
			checkDisable: false
		}
	},
	mounted() {
		let planId = this.planData.id,
			index = FindIndex(this.item.proposals, item => item.id === planId && item.employeeNos !== null);
		if (index !== -1) {
			this.checkUserList = [...this.idStringToArr(this.item.proposals[index].employeeNos)];
		}
		this.checkUserListCopy = [...this.checkUserList];


		// 循环门店奖励方案个数
		let storePlanIndex = FindIndex(this.item.proposals, item => item.id === planId && item.employeeNos === null);
		let stroeIsBonusPlan = this.item.proposals.filter(item => (item.isBonus === 1 || item.isBonus === true) && item.employeeNos === null);
		console.log(stroeIsBonusPlan, storePlanIndex);

		// 判断是否是奖励方案 stroeIsBonusPlan 小于2 storePlanIndex 是否是此方案
		if ((this.planData.isBonus === 1 || this.planData.isBonus === true) && stroeIsBonusPlan.length > 2 && storePlanIndex === -1) {
			this.checkDisable = true;
			this.$emit('checkDisable');
		} 
	},
	methods: {
		idStringToArr(str) {
			str = str.substr(0, str.length - 1);
			str = str.substr(1, str.length - 1);
			str = str.split(',');
			return str;
		},
		userListShowFun() {
			// 小写
			let params = {
				parentshopid: this.giveChildParentShopId,
				shopid: this.item.id
			};	
			this.shopUserListApi(params);
		},
		userCancelFun() {
			this.visible = false;
			this.checkUserListCopy = [...this.checkUserList];
		},
		userSureFun() {
	
			this.visible = false;

		},
		shopUserListApi(params) {
			// 获取门店员工
			this.singleLoding = true;
			this.$http.post(`/employee!list.action`, params).then( res => {
				this.singleLoding = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					this.userList = content;

					this.userIsBonusPlanListFun();
				}
			})
		},
		userIsBonusPlanListFun() {
			let userIsBonusPlanList = this.item.proposals.filter(item => (item.isBonus === 1 || item.isBonus === true) && item.employeeNos !== null);

			let list = [],
				userIsBonusPlanIds = [];
			userIsBonusPlanList.forEach(item => {
				list = [
					...list,
					...this.idStringToArr(item.employeeNos)
				];
				userIsBonusPlanIds.push(item.id);
			});

			let counts = {},
				maxList = [];
			list.forEach(item => { 
				counts[item] = (counts[item] || 0) + 1; 
				if (counts[item] > 2) {
					// push奖励方案个数 大于2个的员工
					maxList.push(item);
				}
			});
			console.log('list', counts, maxList);

			maxList.forEach(item => {
				if (userIsBonusPlanIds.indexOf(this.planData.id) === -1) {
					this.disFun(item);
				}

				if (userIsBonusPlanIds.indexOf(this.planData.id) !== -1) {
					let indexA = FindIndex(userIsBonusPlanList, itemA => itemA.id === this.planData.id && itemA.employeeNos.indexOf(`,${item},`) === -1);
					if (indexA !== -1) {
						this.disFun(item);
					}
				}
			})
		},	
		disFun(no) {
			let indexB = FindIndex(this.userList, itemB => itemB.no === no);
			if (indexB !== -1) {
				// 赋值checkbox 禁用
				this.userList[indexB]._checkDisable = true;
			}
		},
		userListChange(val) {
			console.log(val);
		}
	}
}
</script>

<style lang="less" scoped>
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
			color: #909090;
			&:focus {
				outline: none;
			}
		}
		.user.has {
			color: #00AAEE;
		}
	}
</style>
