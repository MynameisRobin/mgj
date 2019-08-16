<template>
	<div class="customer_operation_record" v-loading="loading">
		<div class="operation_record_header">
			<div class="title">操作记录</div>
			<el-form :inline="true">
				<el-form-item class="operationDate" label="操作时间段：">
					<el-date-picker
						v-model="operationDate"
						type="daterange"
						value-format="yyyy-MM-dd"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
					></el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onQuery">开始查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="operation_record_content">
			<div class="operation_record_content-empty" v-if="!contentData">
				<am-icon class="content_empty-icon" size="76px" name="sousuo"></am-icon>
				<p class="content_empty-text">点击开始查询按钮进行查询~</p>
			</div>
			<mgj-table
				v-if="contentData"
				tooltip-effect="dark"
				stripe
				border
				size="mini"
				height="calc(100vh - 132px)"
				:showHeader="false"
				:data="contentData.data">
				<el-table-column prop="number" label="序号" width="50"></el-table-column>
				<el-table-column prop="operatorName" label="操作员" width="80" show-overflow-tooltip></el-table-column>
				<el-table-column prop="operatorTime" label="时间" width="130"></el-table-column>
				<el-table-column prop="content" label="执行操作" show-overflow-tooltip></el-table-column>
				<div slot="empty">暂无数据</div>
			</mgj-table>
			<!-- 分页 -->
			<el-pagination
				v-if="contentData && contentData.count"
				background
				:pager-count="9"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryData.pageNumber + 1"
				:page-size="queryData.pageSize"
				:page-sizes="[10, 15, 20, 25, 30]"
				layout="sizes, prev, pager, next"
				:total="contentData.count">
			</el-pagination>
		</div>
	</div>
</template>

<script>
import Dayjs from 'dayjs'
import MgjTable from "#/components/table";
const DateFormat = 'YYYY-MM-DD'
export default {
	name: "operationRecord",
	components: {
		MgjTable
	},
	data() {
		return {
			loading: false,
			operationDate: [],
			queryData: {
				shopid: undefined,
				memberId: this.$route.params.id,
				pageNumber: 0,
				pageSize: 15,
			},
			contentData: null,
		}
	},
	mounted() {
		// 操作时间段默认为 "当天至当天"
		const nowDate = Dayjs(new Date()).format(DateFormat)
		this.operationDate = [nowDate, nowDate]

		this.$parent.root.getMemberDetail().then(content => {
			this.queryData.shopid = content.memberInfo.shopid;
		})
	},
	methods: {
		onQuery() {
			this.queryData.pageNumber = 0;
			this.getData();
		},
		getData() {
			const [startDate, endDate] = this.operationDate;
			Object.assign(this.queryData, {
				startDate,
				endDate
			});
			const postData = this.queryData
			this.loading = true;
			this.$http.post('/memberDetail!operationList.action', postData).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content.data.forEach((item, index) => {
						const {operatorName, content} = item
						const {pageNumber, pageSize} = this.queryData
						const lastCount = pageNumber * pageSize
						item.number = lastCount + index + 1
						item.operatorName = operatorName ? operatorName : '--'
						item.content = this.transformPunctuation(content)
					});
					this.contentData = resData.content
				}	
			}).catch(() => {
				this.loading = false;
			})
		},
		handleCurrentChange(pageNumber) {
			this.queryData.pageNumber = pageNumber - 1;
			this.getData();
		},
		handleSizeChange(pageSize) {
			this.queryData.pageNumber = 0;
			this.queryData.pageSize = pageSize;
			this.getData();
		},
		// 英文标点符号转换为中文标点符号
		transformPunctuation(str) {
			str = str.replace(/,/g, "，").replace(/:/g, "：").replace(/;/g, "；")
			return str
		}
	},
}
</script>

<style lang="less">
	.customer_operation_record {
		position: relative;
		padding: 20px 40px 0;
		height: 100vh;
		.operation_record_header {
			display: flex;
			justify-content: space-between;
			.title {
				font-size: 13px;
				color: #222;
				line-height: 2.4;
				font-weight: bold;
			}
			.operationDate {
				.el-date-editor {
					width: 236px;
					.el-range-separator {
						min-width: 20px;
					}
				}	
			}
		}
		.operation_record_content {
			.operation_record_content-empty {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				text-align: center;
				.content_empty-icon {
					color: #ddd;
				}
				.content_empty-text {
					margin-top: 15px;
					color: #a3a3a3;
					line-height: 20px;
				}
			}
			.el-pagination {
				margin: 10px -10px 0;
			}
			.el-table {
				color: #333;
				th {
					background-color: #FAFCFF;
					display: table-cell!important;
				}
			} 
			.mgj_table-content .el-table thead {
				color: #909399;
			}
		}
	}
	.el-tooltip__popper {
		max-width: 400px;
	}
</style>
