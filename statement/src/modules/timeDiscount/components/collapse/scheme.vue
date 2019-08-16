<template>
	<!-- 折叠面板 -->
	<div id="collapseBox" v-loading="loading">
		<ul class="parent-ul">
			<li class="parent-li" v-for="(value, key) in listData" :key="key">
				<div :class="{titleBox:true, show: value.tableShow}" @click="changeTableShow(value)">
					<am-icon :class="{'card-icon': true, 'act': !value.tableShow}" name="sanjiaoxing-1"></am-icon>
					<span class="card-name">{{ value.schemeName || '' }}</span>
					<span class="card-info" v-show="value.tableShow">{{ getRuleInfo(value) }}</span>
					<span class="card-edit" v-show="!value.tableShow" @click="editScheme($event, value.schemeId)"><am-icon class="icon" name="fanganbianji"></am-icon>编辑方案</span>
				</div>
				 <el-collapse-transition>
					<ul class="child-ul" transition="fade" v-show="!value.tableShow">
						<li class="child-li">
							<el-table class="ruleTable"
								v-loading="tableLoading"
								:data="value.discountRules"
								tooltip-effect="dark"
								border
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
												@click.native="v.function(props.row,props.$index,value)" 
												:key="k" 
												:name="v.name"
												:title="v.title"></am-icon>
										</span>
										<div v-else-if="item.index === 'opeartion'" class="opeartion">
											<span class="cursor isEdit" v-if="isEdit">
												<am-icon class="icon" name="fanganshezhi"></am-icon>去设置
											</span>
											<span @click="onSet(props.row)" class="cursor" v-if="!isEdit">
												<am-icon class="icon" name="fanganshezhi"></am-icon>去设置
											</span>
										</div>
										<span v-else>{{ props.row[item.index] }}</span>
									</template>
								</el-table-column>
							</el-table>
							<div class="table-footer">
								<el-button class="setRuleBtn bind-card" @click="onSetDiscountRule(value)">设置折扣规则</el-button>
								<span class="info"><am-icon class="icon" name="info"></am-icon>上方的折扣规则优先</span>
							</div>
							<div class="tip">
								折扣描述：请用通俗易懂的语言描述以上规则，描述将在公众号向顾客展示用于解释会员卡折扣规则
							</div>
							<div class="descriptionBox">
								<el-input type="textarea" v-model="value.remark" maxlength="250" :rows="3" placeholder="请输入折扣描述..."></el-input>
							</div>
						</li>
					</ul>
				</el-collapse-transition>
			</li>
		</ul>

		<amDialog v-model="discountRuleFlag" title="设置折扣">
			<el-table
				class="ruleTable"
				ref="ruleTable"
				v-loading="discountRuleLoading"
				:data="discountRuleData"
				tooltip-effect="dark"
				border
				size="mini"
				height="350"
				@selection-change="sortDiscountRules">
				<el-table-column
				type="selection"
				width="55"></el-table-column>
				<el-table-column v-for="(item, index) in columnData2" :key="index" :width="item.width" :label="item.label" show-overflow-tooltip>
					<template slot-scope="props">
						<span v-if="item.index === 'name'" @click="onEdit(props.row['id'])" class="name_span">{{ props.row[item.index] }}</span>
						<div v-else-if="item.index === 'dateJson'">
							<span class="content_span">{{ getDateStr(props.row['dateJson']) }}</span>
						</div>
						<div v-else-if="item.index === 'content'">
							<span class="content_span">{{ getContentStr(props.row) }}</span>>
						</div>
						<span v-else>{{ props.row[item.index] }}</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="footer">
				<el-button @click="()=>this.discountRuleFlag=false">取消</el-button>
				<el-button type="primary" @click="onDiscountRuleSelect">确定</el-button>
			</div>
		</amDialog>
	</div>
</template>

<script>
import Api from "@/api";
import MetaDataMixin from "../../mixins/meta-data";
import FindIndex from "lodash.findindex";
import amDialog from "../dialog/index"
export default {
	components: {
		amDialog
	},
	mixins: [MetaDataMixin],
	data() {
		return {
			loading: false,
			tableLoading: false,
			discountRuleFlag: false,
			discountRuleLoading: false,
			apiUrl: {
				getDiscountRuleList: '/discountRule!getDiscountRuleList.action',
				deleteDiscountRule: '/discountRule!deleteDiscountRule.action',
				copyDiscountRule: '/discountRule!copyDiscountRule.action',
				setDiscountRuleToScheme: '/discountRule!setDiscountRuleToScheme.action',	// 设置折扣规则
				editDiscountRulePriorityBySchemeId: '/discountRule!editDiscountRulePriorityBySchemeId.action', // 按照会员卡的优先级规则
			},
			columnData: [
				{
					index: 'name',
					width: '250',
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
					index: 'priority',
					width: '100',
					label: '优先级',
				},
				{
					index: 'opeartion',
					width: '100',
					label: '操作',
				}
			],
			columnData2: [
				{
					index: 'name',
					width: '',
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
				}
			],
			editTextList: [
				{
					name: "fanganshezhi",
					title: "去设置",
					function: this.onSet
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
			listData: [],
			cardTypeId: '',
			discountRuleData: [],
			discountRuleSelectVal: [],
			currentSchemeId: ''
		}
	},
	props: {
		listData: [],
		cardTypeId: String
	},
	methods: {
		// 跳转编辑方案
		editScheme(e, schemeId) {
			e.stopPropagation();
			if (schemeId) {
				this.$router.push({ name: "schemeDetail", params: { schemeId: schemeId, source: 'cardScheme', cardTypeId: this.cardTypeId } });
			}
		},
		// 折叠后显示的优先级最高的规则说明
		getRuleInfo(data) {
			let str = '';
			if (data && data.discountRules && data.discountRules.length > 0) {
				let discountRules = data.discountRules;
				const {
					name,
					dateJson
				} = discountRules[0];
				if (!name || !dateJson) {
					str = ''
				} else {
					// 取到优先级最高的一条
					str = '【' + name +  '，' + this.getDateStr(dateJson) + '，默认折扣规则】';
				}
			}
			return str;
		},
		changeIcon() {
			
		},
		// 切换折叠面板表格显示隐藏
		changeTableShow(item) {
			item.tableShow = !item.tableShow;
		},
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
						})
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
		getAppStr(application) {
			if (!application) return '';
			let str = '';
			return str;
		},
		// 去设置
		onSet(data) {
			this.$router.push({name: 'ruleDetail', params: { discountRuleId: data.discountRuleId, schemeId: this.schemeId, source: 'cardScheme', cardTypeId: this.cardTypeId}});
		},
		onUp(item, index, listData) {
			let len = listData.discountRules.length;
			console.log(item, index, listData)
			if ( index === 0 || len <= 1 ) return;
			let upData = JSON.parse(JSON.stringify(listData.discountRules[index - 1])) || {};
			if ( !upData ) return console.log('数据异常');
			this.onSort(item, upData, listData, index);
		},
		onDown(item, index, listData) {
			let len = listData.discountRules.length;
			if ( index === len - 1 || len <= 1 ) return;
			let downData = JSON.parse(JSON.stringify(listData.discountRules[index + 1])) || {};
			if ( !downData ) return console.log('数据异常');
			this.onSort(item, downData, listData, index);
		},
		onSort(data1, data2, listData) {
			let cpData2 = JSON.parse(JSON.stringify(data2));
			data2.priority = data1.priority;
			data1.priority = cpData2.priority;
			listData.discounRules = listData.discountRules.sort((a, b) => {
				return b.priority - a.priority;
			})
			if (data1.priority === data2.priority) {
				return console.log('优先级排序序号异常');
			}
		},
		getRuleList() {
			this.discountRuleLoading = true;
			this.$http.post(this.apiUrl.getDiscountRuleList, {
				parentShopId: this.parentShopId
			})
			.then(res => {
				this.discountRuleLoading = false;
				if (!res) return console.log('接口异常');
				const {
					content,
					code
				} = res.data;
				if (code === 0) {
					if (!content.length) {
						this.$message({
							type: 'warning',
							message: '请先配置折扣规则'
						});
						return false;
					}
					this.discountRuleData = content.sort((a, b) => {
						return b.priority - a.priority;
					}) || [];
					this.selectRuleList();				
				}
			});
		},
		// 设置折扣规则
		setDiscountRuleToScheme() {
			let cardIndex = FindIndex(this.listData, item => item.schemeId === this.currentSchemeId);
			if (cardIndex === -1) return;
			this.discountRuleFlag = false;
			this.listData[cardIndex]['discountRules'] = this.discountRuleSelectVal;
			this.listData[cardIndex]['remark'] = this.autoRemark(cardIndex);
		},
		// 打开设置折扣规则弹窗
		onSetDiscountRule(data) {
			this.discountRuleFlag = true;
			this.currentSchemeId = data.schemeId;
			this.getRuleList();
		},
		// 选中规则
		selectRuleList() {
			let discountRules = [];
			for (let index = 0; index < this.listData.length; index++) {
				const element = this.listData[index];
				if (element.schemeId === this.currentSchemeId) {
					discountRules = element.discountRules;
					break;
				}
			}

			let rows = [];
			if (this.discountRuleData.length > 0 && discountRules.length > 0) {
				discountRules.forEach(item1 => {
					this.discountRuleData.forEach(item => {
						if (item.id === (item1.discountRuleId || item1.id)) {
							rows.push(item);
						}
					});
				});
			}
			if (rows.length > 0) {
				this.$nextTick(() => {
					rows.forEach(row => {
						this.$refs.ruleTable.toggleRowSelection(row, true);
					});
				});
			}
		},
		// 选择规则的值
		onDiscountRuleSelect() {
			this.setDiscountRuleToScheme();
		},
		// 设置折扣后点击确定自动生成描述
		autoRemark(cardIndex) {
			let remark = this.listData[cardIndex]['remark'];
			if (remark) {
				this.$message({
					type: 'warning',
					message: '请重新调整折扣描述'
				})
				return remark;
			} 
			let discounRules = this.discountRuleSelectVal;
			let str = '';
			if (discounRules.length > 0) {
				discounRules.forEach((item, index) => {
					str += item.name + '，' + this.getDateStr(item['dateJson']) + '；\r\n';
				});
			}
			return str;
		},
		// 排序
		sortDiscountRules(val) {
			this.discountRuleSelectVal = val.sort((a, b) => {
				return b.priority - a.priority;
			}) || [];
		}
	}
}
</script>