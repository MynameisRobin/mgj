<template>
    <div id="rule" v-loading="loading">
		<div class="tableBox">
			<el-table
			    class="ruleTable"
				v-loading="tableLoading"
				:data="tableData"
				tooltip-effect="dark"
				border
				size="mini"
				height="calc(100vh - 175px)">
				<el-table-column v-for="(item, index) in columnData" :key="index" :width="item.width" :label="item.label" show-overflow-tooltip>
					<template slot-scope="props">
						<span v-if="item.index === 'name'" @click="onEdit(props.row['id'])" class="name_span">{{ props.row[item.index] }}</span>
						<div v-else-if="item.index === 'dateJson'">
							<span class="content_span">{{ getDateStr(props.row['dateJson']) }}</span>
						</div>
						<div v-else-if="item.index === 'content'">
							<span class="content_span">{{ getContentStr(props.row) }}</span>
						</div>
						<span v-else-if="item.index === 'schemeAndCardType'">{{ (props.row['schemeAndCardType']) }}</span>
						<span v-else-if="item.index === 'priority'">
							<am-icon 
								class="icon"
								v-if="isEdit"
								isElement
								v-for="(v, k) in sortList"
								:key="k"
								:name="v.name"
								:title="v.title"></am-icon>
							<am-icon 
								class="icon"
								v-if="!isEdit"
								isElement
								v-for="(v, k) in sortList"
								@click.native="v.function(props.row,props.$index)" 
								:key="k" 
								:name="v.name"
								:title="v.title"></am-icon>
						</span>
						<span v-else-if="item.index === 'opeartion'" class="opeartion">
							<am-icon 
								class="icon isEdit" 
								v-if="isEdit"
								:key="k" 
								v-for="(v, k) in editTextList"
								:name="v.name"
								:title="v.title"></am-icon>
							<am-icon 
								class="icon" 
								v-if="!isEdit"
								v-for="(v, k) in editTextList"
								@click.native="v.function(props.row,k)" 
								:key="k" 
								:name="v.name"
								:title="v.title"></am-icon>
						</span>
						<span v-else>{{ props.row[item.index] }}</span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="footer">
			<el-button type="primary" @click="onEdit(null)" v-if="!isEdit">增加新规则</el-button>
		</div>
	</div>
</template>

<script>
import Api from "@/api";
import MetaDataMixin from "../mixins/meta-data";
import amDialog from "../components/dialog/index";
import FindIndex from "lodash.findindex";
export default {
	name: "Rule",
	components: {
		amDialog
	},
	mixins: [MetaDataMixin],
	data() {
		return {
			apiUrl: {
				getDiscountRuleList: '/discountRule!getDiscountRuleList.action',
				editDiscountRulePriority: '/discountRule!editDiscountRulePriority.action',
				deleteDiscountRule: '/discountRule!deleteDiscountRule.action',
				copyDiscountRule: '/discountRule!copyDiscountRule.action',
			},
			loading: false,
			tableLoading: false,
			columnData: [
				{
					index: 'name',
					width: '280',
					label: '折扣规则名称'
				},
				{
					index: 'dateJson',
					width: '',
					label: '折扣时段',
				},
				{
					index: 'content',
					width: '',
					label: '折扣内容',
				},
				{
					index: 'schemeAndCardType',
					width: '',
					label: '应用到',
				},
				{
					index: 'priority',
					width: '100',
					label: '优先级',
				},
				{
					index: 'opeartion',
					width: '100',
					label: '操作',
				},
			],
			editTextList: [
				{
					name: "fanganshanchu",
					title: "删除",
					function: this.onDelete
				},
				{
					name: "fanganfuzhi",
					title: "复制",
					function: this.onCopy
				}
			],
			sortList: [
				{
					name: "top",
					title: "升序",
					function: this.onUp
				},
				{
					name: "bottom",
					title: "降序",
					function: this.onDown
				}
			],
			tableData: []
		};
	},
	async created() {
		try {
			let res = await Api.getMetaData();
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.$eventBus.env = {
					...content
				}
			}
		} catch (e) {
			console.log(e);
		}
		this.getRuleList();
	},
	methods: {
		getDateStr(dateJson) {
			if (!dateJson) return '';
			let str = '';
			dateJson = JSON.parse(dateJson);
			if (!dateJson.highChecked) {
				str = "不限时段,";
			} else {
				if (dateJson.everyday) {
					str += "每天";
					if (dateJson.daysData.length > 0) {
						str += dateJson.daysData.join("-") + '，';
					}
				} 
				if (dateJson.weekly) {
					if (dateJson.weeklyData && dateJson.weeklyData.length > 0) {
						str += "每";
						dateJson.weeklyData.forEach(item => {
							str += '周' + this.getDayToWeek(item) + "、";
						});
					}
				} 
				if (dateJson.monthly) {
					str += "每月";
					if (dateJson.monthlyData.length > 0) {
						str += dateJson.monthlyData.join("日，") + '日，';
					}
				} 
				if (dateJson.assignDays) {
					str += "指定日期";
					if (dateJson.assignDaysData.length > 0) {
						str += dateJson.assignDaysData.join("，") + '，';
					}
				}
			}
			return str.length > 0 ? str.substr(0, str.length - 1) : str;
		},
		getContentStr(data) {
			if (!data) return '';
			let str = '',
				serviceItemJson = JSON.parse(data.serviceItemJson),
				depotJson = JSON.parse(data.depotJson);
			if (serviceItemJson) {
				if (serviceItemJson.discountChecked) {
					str += '项目（' + serviceItemJson.discount + '折），';
				} 
				if (serviceItemJson.highChecked) {
					str += this.getServiceStr(serviceItemJson);
			
				}
			}
			if (depotJson) {
				if (depotJson.discountChecked) {
					str += '卖品（' + depotJson.discount + '折），';
				} 
				if (depotJson.highChecked) {
					str += this.getDepotStr(depotJson);
				}
			}
			return str ? str.substring(0, str.length - 1) : '';
		},
		getServiceStr(data) {
			let str = '';
			if (!data) return '';
			data = this.getServiceHighData(data);
			if (data.highData.length === 0) return str; 
			data.highData.forEach(item => {
				if (item.rule) {
					str += item.name + '（' + item.rule + (item.ruleType ? '元' : '折') + '），'; 
				}
				if (item.sub.length > 0) {
					item.sub.forEach(v => {
						if (v.rule) {
							str += v.name + '（' + v.rule + (v.ruleType ? '元' : '折') + '），';
						}
					})
				} 
			});
			return str;
		},
		getDepotStr(data) {
			let str = '';
			if (!data) return '';
			data = this.getDepotHighData(data);
			if (data.highData.length === 0) return str; 
			data.highData.forEach(item => {
				if (item.rule) {
					str += item.name + '（' + item.rule + (item.ruleType ? '元' : '折') + '），'; 
				}
				if (item.sub.length > 0) {
					item.sub.forEach(v => {
						if (v.rule) {
							str += v.name + '（' + v.rule + (v.ruleType ? '元' : '折') + '），';
						}
					})
				} 
			});
			return str;
		},
		getRuleList() {
			this.loading = true;
			this.$http.post(this.apiUrl.getDiscountRuleList, {
				parentShopId: this.parentShopId
			})
			.then(res => {
				this.loading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					this.tableData = content.sort((a, b) => {
						return b.priority - a.priority;
					}) || [];					
				}
			});
		},
		onUp(item, index) {
			let len = this.tableData.length;
			if ( index === 0 || len <= 1 ) return;
			let upData = this.tableData[index - 1] || {};
			if ( !upData ) return console.log('数据异常');
			this.onSort(item, upData);
			console.log(item.id, upData.id);
		},
		onDown(item, index) {
			let len = this.tableData.length;
			if ( index === len - 1 || len <= 1 ) return;
			let downData = this.tableData[index + 1] || {};
			if ( !downData ) return console.log('数据异常');
			this.onSort(item, downData);
			console.log(item.id, downData.id);
		},
		onSort(data1, data2) {
			if (this.isEdit) {
				return this.$message({
					type: 'error',
					message: '直属店统一由总部编辑'
				});
			}
			this.loading = true;
			this.$http.post(this.apiUrl.editDiscountRulePriority, {
				parentShopId: this.parentShopId,
				discountRuleId1: data1.id + '',
				priority1: data2.priority + '',
				discountRuleId2: data2.id + '',
				priority2: data1.priority + ''
			})
			.then(res => {
				this.loading = false;
				if (!res) {
					return;
				}
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					this.getRuleList();
					this.$message({
						type: "success",
						message: "操作成功"
					})
				}
			});
		},
		onCopy(data) {
			if (this.isEdit) {
				return this.$message({
					type: 'error',
					message: '直属店统一由总部编辑'
				});
			}
			let params = JSON.parse(JSON.stringify(data));
			this.$confirm("确定要复制此折扣吗?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.loading = true;
				this.$http.post(this.apiUrl.copyDiscountRule, {
					parentShopId: this.parentShopId,
					name: params.name
				})
				.then(res => {
					this.loading = false;
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						this.getRuleList();
						this.$message({
							type: "success",
							message: "复制成功"
						})
					}
				});
			}).catch(() => {});
		},
		onEdit(discountRuleId) {
			// 打开弹窗
			if (discountRuleId) {
				if (this.modalFlag) {
					this.$router.push({ name: 'ruleDetail', params: { discountRuleId: discountRuleId }});
					return false;
				}
				this.openShowDetail(discountRuleId);
			} else {
				if (this.modalFlag) {
					this.$router.push({ name: 'ruleDetail', params: {}});
					return false;
				}
				this.openShowDetail('');
			}
		},
		openShowDetail(discountRuleId) {
			try {
				const parentDocument = window.parent.document;
				const iframeBoxEl = parentDocument.querySelector('#customer_detail_box');
				const curClassName = iframeBoxEl.className;
				iframeBoxEl.className = `${curClassName} show`;
				const iframeEl = parentDocument.querySelector('.customer_detail_iframe');
				setTimeout(() => {
					iframeEl.src = `/shair/components/timeDiscount/index.html#/ruleDetail?discountRuleId=${discountRuleId}`;
				}, 500);
			}
			catch (e) {
				console.log(e);
			}
		},
		onDelete(data) {
			if (this.isEdit) {
				return this.$message({
					type: 'error',
					message: '直属店统一由总部编辑'
				});
			}
			this.$confirm("确定要删除此折扣吗?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.loading = true;
				this.$http.post(this.apiUrl.deleteDiscountRule, {
					parentShopId: this.parentShopId,
					id: data.id
				})
				.then(res => {
					this.loading = false;
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						this.getRuleList();
						this.$message({
							type: "success",
							message: "删除成功"
						})
					}
				});
			}).catch(() => {});
		},
	}
};
</script>

<style lang="less">
	#rule{
		padding: 20px 10px;
		.tableBox{
			.icon {
				margin-right: 5px;
				padding: 0 2px;
				cursor: pointer;
				&:hover{
					color:#409eff;
				}
			}
			tr{
				.name_span{
					color:#409EFF;
					cursor: pointer;
				}
				.content_span{
					width: 100%;
					text-overflow: ellipsis;
					white-space: nowrap;
					display: inline-block;
					overflow: hidden;
					vertical-align: middle;
				}
				&:first-child{
					.el-icon-top{
						color: #d6d6d6;
						cursor: no-drop;
					}
				}
				&:last-child{
					.el-icon-bottom{
						color: #d6d6d6;
						cursor: no-drop;
					}
				}
				.isEdit{
					color: #d6d6d6;
					cursor: no-drop;
					&:hover{
						color: #d6d6d6;
					}
				}
			}
		}
		.footer{
			margin-top: 20px;
		}
	}
</style>

