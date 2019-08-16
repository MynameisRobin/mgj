<template>
	<div :style="tabStyle" class="tab_content">
		<div class="searchPlanDiv">
			<span class="spanLabel">选择方案</span>
			<div class="elSelectDiv" v-if="nowId">
				<!-- <PlanType class="typeIcon" :type="nowIsBonus"></PlanType> -->
				<el-select class="elSelect" v-model="nowId" @change="selectPlan">
					<el-scrollbar wrap-class="default-scrollbar__wrap" view-class="default-scrollbar__view" style="height: 150px;">
						<el-option
							v-for="(item, key) in allPlanList"
							:key="key"
							:label="item.name"
							:value="item.id">
							<!-- <PlanType :type="item.isBonus"></PlanType> -->
							<span>{{item.name}}</span>
						</el-option>
					</el-scrollbar>
				</el-select>
			</div>
			
			<div class="checkBoxG" v-if="tabPaneType < 5" @click="stepChange(nowEnableStep)">
				<span class="checkSpan"></span>
				<el-checkbox v-model="nowEnableStep"></el-checkbox>
					达标
			</div>
			
			<div class="standardInput" v-if="nowEnableStep && searchFormulaSplice.length > 0">
				<!-- <el-input  v-model="standardInput" placeholder="输入达标规则计算公式（如外卖业绩*1）"></el-input> -->
				<FormulaInput v-model="nowStepEquation"
					:factorList="searchFormulaSplice"
					:index="0"
					:payList=[]
					@valid="handleInputValid"></FormulaInput>
			</div>
			
			<el-button v-if="isHeadquarters !== '2' " ref="saveBtn" 
				class="btn" @click="savePlan">保存方案</el-button>
		</div>
	</div>
</template>

<script>
/* eslint-disable */
import ProjectName from '../project-name'
// import PlanType from '../label-content/planType'
import FindIndex from 'lodash.findindex'

import FormulaInput from '../formula-input/index'
import MetaDataMixin from '#/mixins/meta-data'


export default {
	name: "searchPlanHeader",
	mixins: [MetaDataMixin],
	components: {
		ProjectName,
		// PlanType,
		FormulaInput
	},
	props: {
		allPlanList: Array,
		tabPaneType: Number,
		searchFormulaSplice: Array
	},
	data() {
		return {
			standardInput : null,
			nowId: null,  
			nowIsBonus: null,
			nowEnableStep: null,
			nowStepEquation: null,
			stepValid: true,
			tabStyle: null
		}
	},
	computed: {
		routeParams() {
			return this.$route.params;
		}
	},
	watch: {
		nowId(newV, oldV) {
			this.$emit('selectPlan', {
				id: newV,
				isBonus: this.nowIsBonus,
				enableStep: this.nowEnableStep
			});
		},
	},
	created() {

		this.$on('handleChange', function(){
			console.log('something handled!');
		});
	},
	mounted() {	
		let planObj = {},
			planId = parseInt(this.routeParams.planId) || null;

		let index = FindIndex(this.allPlanList, item => item.id === planId);
		if (index >= 0) {	
			planObj = JSON.parse(JSON.stringify(this.allPlanList[index]));
		} else {
			planObj = JSON.parse(JSON.stringify(this.allPlanList[0]));			
		}
		this.nowId = planObj.id; 
		this.nowIsBonus = planObj.isBonus;
		this.nowEnableStep = planObj.enableStep == 0 ? false : true;	
		this.nowStepEquation = planObj.stepEquation ? planObj.stepEquation : null;
		this.handleResize();
		window.addEventListener('resize', this.handleResize);

		this.$emit('stepInit', this.nowEnableStep);
	},
	methods: {
		handleResize() {
			this.tabStyle = `width: ${document.body.clientWidth - 10}px`;
		},
		handleInputValid(valid, index) {
			this.stepValid = valid;
		},
		savePlan() {
			this.$emit('savePlan', {
				data: {
					proposalId: this.nowId,
					enableStep: this.nowEnableStep,
					stepEquation: this.nowStepEquation,
					stepValid: this.stepValid
				}
			});
			console.log('保存方案');
		},
		selectPlan(id) {
			this.$router.replace({
				path: `/indexConfigure/${this.routeParams.type}/${id}`,
			});
		},
		stepChange(val) {
			if (!val) {
				this.nowEnableStep = true;
				this.$emit('stepChange', true);
			} else {
				this.$confirm('确定更改此方案的达标状态吗? 处于编辑中数据将重置掉 ！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.nowEnableStep = false;
					this.$emit('stepChange', false);
				}).catch(() => {

				});
			}
		}
	}

}
</script>

<style lang="less">
	// .el-scrollbar__wrap{
	// 	overflow-x: hidden;
	// }
	.tab_content {
		.draghandle {
			cursor: move;
			cursor: -webkit-grabbing;
		}
		.elSelectDiv {
			.el-input__inner {
				padding-left: 30px;
			}
			.el-select-dropdown {
				padding-bottom: 10px;
			}
		}
	}
</style>

<style lang="less" scoped>
	.tab_content {
		.searchPlanDiv {
			position: relative;
			padding: 10px 13px 20px;
			.spanLabel {
				margin-right: 10px;
			}
			.elSelectDiv {
				position: relative;
				display: inline-block;
				.typeIcon {
					position: absolute;
					top: 8px;
					left: 12px;
					z-index: 1;
				}
				.elSelect {
				}
			}
		
			.checkBoxG {
				cursor: pointer;
				position: relative;
				display: inline-block;
				margin-left: 15px;
				.checkSpan {					
					position: absolute;
					z-index: 2;
					top: 0;
					left: 0;
					width: 50px;
					height: 30px;
				}
			}

			.standardInput {
				display: inline-block;
				width: 280px;
				margin-left: 15px;
			}
			.add {

			}
			.btn {
				position: absolute;
				right: 20px;
				font-size: 12px;
				color: #fff;
				background: #00AAEE;
			}
		}

		.listDiv {
			width: 100%;
			overflow: auto;
			// .el-scrollbar__wrap{
			// 	overflow-x:hidden;
			// }
			.content {
				padding: 25px 15px 20px;
				.el-aside {
					position: relative;
					overflow: hidden;
					height: 180px;
					.cirularDiv {
						position: absolute;
						top: 50px;
    					right: 25px;
						width: 45px;
						height: 45px;
						padding: 8px 10px 10px;
						border-radius: 50%;
						background: #F2F2F2;
						span {
							width:24px;
							height:28px;
							font-size:12px;
							font-weight:400;
							color: #A1A1A1;
							line-height:14px;
							&:after {

							}
						}
					}
				}
				.el-main {
					padding: 0;
					overflow: hidden;
				}
			}
			.content:nth-of-type(1) {
				padding-top: 15px;
			}
			.content:nth-of-type(odd) {
				background: #FAFAFA;
			}
		}
	}
</style>
