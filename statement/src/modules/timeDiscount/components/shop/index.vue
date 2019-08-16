<template>
	<div>
		<el-button @click="openShop" class="bind-card">适配门店</el-button>
		<span class="shopNameSpan" v-show="overflowFlag">{{ shopNames || '' }}</span>
		<el-tooltip class="item" effect="dark" :content="shopNames || ''" placement="top" v-show="!overflowFlag">
			<span class="shopNameSpan">{{ shopNames || '' }}</span>
		</el-tooltip>
		<amDialog v-model="shopFlag" width="600px" title="选择门店" ref="amDialog" v-loading="shopLoading">
			<div id="shopSelect" v-loading="loading">
				<div class="header"></div>
				<div class="content">
					<div class="shopList">
						<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" v-show="checkAllDisabled">全选</el-checkbox>
						<div style="margin: 15px 0;"></div>
						<el-checkbox-group v-model="checkedShopList" @change="handleCheckedShopsChange">
							<el-checkbox v-for="(item, index) in shopList" :label="item.shopName" @change="flag => onShopClick(flag, item.disabled)" :key="index" v-show="item.softgenre !== '3'" >{{ item.shopName }}</el-checkbox>
						</el-checkbox-group>
					</div>
					<div class="footer">
						<el-button @click="onCancel">取消</el-button>
						<el-button type="primary" @click="onConfirm">确定</el-button>
					</div>
				</div>
			</div>
		</amDialog>
	</div>
</template>

<script>
import FindIndex from "lodash.findindex";
import amDialog from "../dialog/index";
export default {
	name: 'amShop',
	components: {
		amDialog
	},
	data() {
		return {
			shopFlag: false, // 门店弹窗开关
			shopLoading: false, // 门店loading
			loading: false,
			checkAll: false,
			checkAllDisabled: true,
			isIndeterminate: false,
			overflowFlag: false,
			checkedShopList: [],
			disabledLen: 0,
			shops: '',
			shopNames: '',
			apiUrl: {
				returnSchemeShop: '/discountRule!returnSchemeShop.action' // 门店置灰
			}
		}
	},
	props: {
		schemeId: String,
		shopId: String,
		parentShopId: String,
		shopList: Array,
		shops: String,
		shopNames: String
	},
	watch: {
		shopNames(newVal, oldVal) {
			if (newVal.length > 85) {
				this.overflowFlag = false;
			} else {
				this.overflowFlag = true;
			}
		}
	},
	methods: {
		getShopData() {
			this.$emit('getShopData', {
				shops: this.shops,
				shopNames: this.shopNames
			});
		},
		// 打开门店选择
		openShop() {
			this.disabledShops();
		},
		onShopClick(flag, disabled) {
			if (flag && disabled) {
				this.$message({
					type: 'warning',
					message: '该门店关联了其他方案，一个门店仅可关联一个方案'
				})
			}
		},
		render() {
			this.checkedShopList = this.shopNames.split('，');
		},
		handleCheckAllChange(val) {
			let arr = [];
			this.shopList.forEach(item => {
				if (!item.disabled) {
					arr.push(item.shopName);
				}
			});
			this.checkedShopList = val ? arr : [];
			this.isIndeterminate = false;
		},
		handleCheckedShopsChange(value) {
			let checkedCount = value.length;
			this.checkAll = checkedCount === (this.shopList.length - this.disabledLen);
			this.isIndeterminate = checkedCount > 0 && checkedCount < (this.shopList.length - this.disabledLen);
		},
		disabledShops() {
			let self = this;
			this.disabledLen = 0;
			this.loading = true;
			this.$http.post(this.apiUrl.returnSchemeShop, {
				parentShopId: this.parentShopId,
				shopId: this.shopId
			})
			.then(res => {
				this.loading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					if (content && content.length > 0) {
						const shopSchemeConfig = {}
						content.forEach(schemeData => {
							const { schemeId, shopId } = schemeData;
							if (!shopId) return;
							shopSchemeConfig[shopId] = schemeId;
						});
						self.shopList.forEach(item => {
							const shopSchemeId = shopSchemeConfig[item.id];
							const disabled = shopSchemeId && shopSchemeId !== (self.schemeId - 0);
							item.disabled = disabled;
							if (disabled) {
								self.disabledLen++;
							}
						});
					}
					// if (self.disabledLen === self.shopList.length) {
					// 	self.checkAllDisabled = false;
					// 	this.$message({
					// 		type: 'warning',
					// 		message: '所有门店都适配过方案，无法再适配门店'
					// 	})
					// 	return false;
					// }
					this.shopFlag = true;
					if (this.shopNames) {
						this.render();
					}
				}
			});
		},
		onConfirm() {
			let shops = [];
			this.shopList.forEach(item => {
				this.checkedShopList.forEach(v => {
					if (v === item.shopName) {
						shops.push(item.id);
					}
				});
			});
			if (shops.length === 0) {
				// return this.$message({
				// 	type: 'error',
				// 	message: '请选择门店'
				// })
				this.shops = '';
				this.shopNames = '';
			} else {
				this.shops = shops.join(',');
				this.shopNames = this.checkedShopList.join('，');
			} 
			this.getShopData();
			this.shopFlag = false;
		},
		onCancel() {
			this.shopFlag = false;
			this.checkAll = false;
			this.isIndeterminate = false;
			this.checkedShopList = [];
		}
	}
}
</script>

<style lang="less">
	.shopNameSpan{
		margin-left: 20px;
		max-width: 900px;
		text-overflow: ellipsis;
		overflow: hidden;
		display: inline-block;
		white-space: nowrap;
		vertical-align: -2px;
	}
	#shopSelect{
		margin-top: -10px;
		.content{
			 overflow: hidden;
			 .el-checkbox-group{
				 .el-checkbox{
					width: 160px;
					margin-right: 20px;
					.el-checkbox__input{
						vertical-align:3px;
					}
					.el-checkbox__label{
						width: 130px;
						overflow: hidden;
						text-overflow:ellipsis;
						white-space: nowrap;
						padding-left: 10px;
					}
				 }
			 }
			.areas{
				float: left;
				width: 120px;
				font-size: 14px;
				background: #eaeaea;
				ul {
					li {
						padding: 8px 0;
						font-size: 14px;
						&.act{
							color: #409EFF;
							font-weight: bold;
							background: #fff;
						}
					}
				}
			}
			.shops{
				width: calc(~'100%' - 130px);
				float: right;
				font-size: 12px;
				.shops-head{
					.input{
						width: 100%;
					}
					.tip{
						color: #909090;
						margin-left: 5px;
						margin-top: 5px;
						.num{
							color: #222222;
						}
					}
				}
				.shops-content{
					margin-left: 5px;
					margin-top: 20px;
				}
			}
		}
		.footer{
			text-align: right;
			.footer-line{
				padding: 0 5px;
				height:1px;
				background:rgba(220,223,230,1);
			}
			.footer-content{
				margin-top: 10px;
				overflow: hidden;
				.footer-left{
					float: left;
					.btn-border{
						color: #409EFF;
						border: 1px solid #409EFF;
					}
				}
				.footer-right{
					float: right;
				}
			}
		}
	}
</style>