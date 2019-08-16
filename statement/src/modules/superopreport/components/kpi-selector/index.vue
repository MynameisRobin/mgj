<template>
	<div class="kpi_selector" v-if="kpisData.length > 0" v-loading="loading">
		<div class="kpi_selector-main">
			<div class="kpi_selector-group" v-for="(item, index) in kpisData" :key="index">
				<el-checkbox :indeterminate="item.isIndeterminate" v-model="item.checkAll" @change="handleCheckGroupAll(index)">{{ item.title }}</el-checkbox>
				<el-checkbox-group v-model="item.checkModel" @change="e => handleCheckGruop(e, index)">
					<div class="kpi_selector-item" v-for="(cItem, cIndex) in item.kpis" :key="cIndex">
						<el-checkbox :label="cItem.id" :disabled="isCheckboxDisabled(cItem)">
							<span :title="cItem.title">
								{{cItem.title | cutString(18)}}
							</span>
						</el-checkbox>
						<el-popover
							placement="right"
							width="200"
							trigger="hover"
							:content="cItem.description">
							<am-icon class="icon_info" slot="reference" name="info"></am-icon>
						</el-popover>
					</div>
				</el-checkbox-group>
			</div>
		</div>
	</div>
</template>
<script>
import FindIndex from 'lodash.findindex'
import MetaDataMixin from '#/mixins/meta-data'
export default {
	name: 'kpi-selector',
	mixins: [MetaDataMixin],
	props: {
		value: Array,
		level: [String, Number],
		validSubsidiary: Boolean
	},
	data() {
		return {
			kpisData: [],
			selectData: [],
			loading: true,
			oldLevel: '',
			isAsync: false,
			projectFeeKpis: [],
			shopProjectFeeKpisMaps: {}
		}
	},
	computed: {
		currentRole() {
			let levelObj = {
				0: 'tenant',
				1: 'area',
				2: 'shop',
				3: 'detp',
				4: 'job',
				5: 'emp'
			}
			return levelObj[this.level];
		},
	},
	watch: {
		value(newVal, oldVal) {
			this.selectData = newVal;
			if (this.isAsync) {
				this.isAsync = false;
			} else {
				if (newVal) {
					this.invertSelect();
				}
			}
		},
		validSubsidiary(newVal, oldVal) {
			if (oldVal === newVal) return;
			this.update();
		},
		level(newVal) {
			if (this.oldLevel === newVal) return;
			this.oldLevel = newVal;
			this.update();
		}
	},
	methods: {
		getShopProjectFeeKpis(parentShopId) {
			return new Promise((resolve, reject) => {
				let data = this.shopProjectFeeKpisMaps[parentShopId];
				if (data)  {
					resolve(data);
					return;
				}
				this.loading = true;
				this.$http.post('/shair/superOperationReport!getKpi.action', {"id": 427, parentShopId}).then(result => {
					this.loading = false;
					const resData = result.data;
					const { code, content } = resData;
					if (code === 0) {
						const kpisData = content.kpis;
						this.shopProjectFeeKpisMaps[parentShopId] = kpisData;
						resolve(kpisData);
					} else {
						resolve(this.shopProjectFeeKpisMaps);
					}
				}).catch(() => {
					this.loading = false;
				});
			})
		},
		// 附属店时，更新部分 kpis
		updateKpis(parentShopId) {
			let index = FindIndex(this.kpisData, item => item.title === '项目业绩分析');
			// 请求附属店的 kpis
			if (parentShopId) {
				this.getShopProjectFeeKpis(parentShopId).then(data => {
					this.kpisData[index].kpis = data;
				});
			} else {
				// 还原直属店的 kpis
				this.kpisData[index].kpis = [...this.projectFeeKpis];
			}
			this.kpisData[index].checkModel = [];
			this.kpisData[index].checkAll = false;
			this.asyncValue();
		},
		update() {
			this.kpisData.forEach(kItem => {
				const { checkModel, kpis } = kItem;
				if (checkModel && checkModel.length > 0) {
					let newCheckModel = [];
					kpis.forEach(item => {
						if (!this.isCheckboxDisabled(item) && checkModel.includes(item.id)) {
							newCheckModel.push(item.id);
						}
					})
					kItem.checkModel = newCheckModel;
					kItem.checkAll = newCheckModel.length === kpis.length;
					kItem.isIndeterminate = newCheckModel.length > 0 && newCheckModel.length < kpis.length;
				}
			});
			this.asyncValue();
		},
		isCheckboxDisabled(item) {
			const { role } = item;
			let roleObj = role ? JSON.parse(role) : null;
			let result = (this.currentRole && roleObj && roleObj[this.currentRole] < 1) || (this.validSubsidiary && item.subsidiary === 1);
			return result;
		},
		handleCheckGruop(value, index) {
			const checkedCount = value.length;
			const currentGroup = this.kpisData[index];
			let activeCheckboxList = currentGroup.kpis.filter(item => !this.isCheckboxDisabled(item));
			currentGroup.checkAll = checkedCount === activeCheckboxList.length;
			currentGroup.isIndeterminate = checkedCount > 0 && checkedCount < activeCheckboxList.length;
			this.asyncValue();
		},
		handleCheckGroupAll(index, value) {
			const currentGroup = this.kpisData[index];
			const checkVal = currentGroup.checkAll;
			currentGroup.isIndeterminate = false;
			if (checkVal) {
				let checkModel = [];
				currentGroup.kpis.forEach(item => {
					if (!this.isCheckboxDisabled(item)) {
						checkModel.push(item.id);
					}
				})
				currentGroup.checkModel = checkModel;
			} else {
				currentGroup.checkModel = [];
			}
			this.asyncValue();
		},
		asyncValue() {
			let result = this.selectData = this.getSelectKpiGroups();
			this.isAsync = true;
			this.$emit('input', result);
			this.$emit('change', result);
		},
		getSelectKpiGroups() {
			let result = []
			this.kpisData.forEach(item => {
				const { id, title, checkModel } = item;
				let kpis = [];
				if (checkModel.length) {
					item.kpis.forEach(kItem => {
						const { id, title, pct, ryg, tplt, sqlGroup, ukey, depend } = kItem;
						if (checkModel.includes(id)) {
							kpis.push({
								id,
								title,
								pct,
								ryg,
								tplt,
								sqlGroup,
								ukey,
								depend
							})
						}
					})
					let currentGroup = {
						id,
						title,
						kpis
					}
					result.push(currentGroup);
				}
			})
			return result;
		},
		invertSelect() {
			this.kpisData.forEach(kItem => {
				kItem.checkAll = false;
				kItem.isIndeterminate = false;
				kItem.checkModel = [];
				this.selectData.forEach(sItem => {
					if (sItem.id === kItem.id) {
						const { kpis } = sItem;
						let activeCheckboxList = kItem.kpis.filter(item => !this.isCheckboxDisabled(item));
						let kpisCount = activeCheckboxList.length;
						kItem.checkAll = kpis.length === kpisCount;
						kItem.isIndeterminate = kpis.length > 0 && kpis.length < kpisCount;
						kItem.checkModel = kpis.map(item => item.id);
					}
				})
			});
			this.$nextTick(() => {
				let mainEl = document.querySelector('.kpi_selector-main');
				let checkedEl = document.querySelector('.el-checkbox.is-checked');
				if (checkedEl) {
					let mainPosObj = mainEl.getBoundingClientRect();
					let posObj = checkedEl.getBoundingClientRect();
					if ((posObj.y - mainPosObj.y) > mainPosObj.height / 3) {
						mainEl.scrollTop = (posObj.y - mainPosObj.y);
					} else {
						mainEl.scrollTop = 0;
					}
				}
			})
		},
		getKpisData() {
			return new Promise((resolve, reject) => {
				const postData = {parentShopId: this.parentShopId};
				// 判断如果是生产环境时，增加入参，测试环境、stg 环境、本地环境不加此参数
				const EnvDomainName = location.hostname.split('.')[0];
				if (EnvDomainName.indexOf('stg') === -1 && EnvDomainName.indexOf('test') === -1 && EnvDomainName.indexOf('localhost') === -1) {
					postData.enable = 1;
				}
				this.$http.post('/superOperationReport!getKpis.action', postData).then(res => {
					let resData = res.data;
					let { code, content, message } = resData;
					if (code === 0) {
						content.forEach(item => {
							item.isIndeterminate = false;
							item.checkAll = false;
							item.checkModel = [];
							if (item.title === '项目业绩分析') {
								this.projectFeeKpis = item.kpis;
							}
						})
						resolve(content);
					} else {
						reject(message)
					}
				});
			})
		}
	},
	mounted() {
		this.loading = true;
		this.selectData = this.value;
		this.oldLevel = this.level;
		this.getKpisData().then(data => {
			this.loading = false;
			this.kpisData = data;
			if (this.selectData) {
				this.invertSelect();
			}
		});
	}
}
</script>
<style>
	.kpi_selector-main {
		width: 100%;
		height: calc(100vh - 120px);
		min-height: 100px;
		overflow-y: auto;
	}
	.kpi_selector-item {
		display: inline-block;
		width: 50%;
	}
	.kpi_selector-group {
		&~ .kpi_selector-group {
			margin-top: 10px;
		}
		& > .el-checkbox {
			margin-top: 15px;
			margin-bottom: 5px;
			& .el-checkbox__label {
				font-weight: 700;
				color: #000;
			}
		}
		& .el-checkbox-group .el-checkbox {
			margin: 5px 5px 0 0;
		}
		& .el-checkbox__label {
			font-size: 12px;
			color: #222;
		}
		& .icon_info {
			color: #c1c1c1;
			cursor: pointer;
			transition: color .3s;
			&:hover {
				color: #0ae;
			}
		}
	}
</style>
