<template>
	<div class="customer_point_change" v-loading="loading">
		<div class="point_change_header">
			<div class="title">积分变动</div>
			<el-form :inline="true">
				<el-form-item>
					<el-select v-model="queryData.type" placeholder="请选择">
						<el-option v-for="item in pointTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="开始日期：">
					<el-date-picker
						v-model="queryData.startDate"
						type="date"
						placeholder="选择日期"
						value-format="yyyy-MM-dd">
					</el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onQuery">开始查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-popover placement="bottom" width="240" trigger="click" v-model="visible">
						<el-input v-model="point" clearable placeholder="请输入要赠送的积分"></el-input>
						<div style="text-align: right; margin: 20px 0 0">
							<el-button size="mini" type="text" @click="visible=false">取消</el-button>
							<el-button type="primary" size="mini" @click="sendPoint">确定</el-button>
						</div>
						<el-button slot="reference" type="warning" @click="triggerPopover">赠送积分</el-button>
					</el-popover>
				</el-form-item>
			</el-form>
		</div>

		<div class="point_change_content">
			<div class="point_change_content-empty" v-if="!contentData">
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
				:data="contentData.content">
				<el-table-column prop="pointSource" label="积分来源&使用" width=""></el-table-column>
				<el-table-column label="积分变动">
					<template slot-scope="{ row }">
						<span v-if="row.pd === 1" class="increase">{{'+' + row.changePoint}}</span>
						<span v-else class="decrease">{{'-' + row.changePoint}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="surPoint" label="剩余积分" width=""></el-table-column>
				<el-table-column prop="changeTime" label="积分变动时间"></el-table-column>
				<el-table-column v-if="showShopName" prop="shopName" label="积分变动门店"></el-table-column>
				<div slot="empty">暂无数据</div>
			</mgj-table>
			<!-- 分页 -->
			<el-pagination
				v-if="contentData && contentData.count"
				background
				:pager-count="9"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryData.pageNum"
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
import MetaDataMixin from '#/mixins/meta-data'
const DateFormat = 'YYYY-MM-DD'
export default {
	name: 'pointChange',
	components: {
		MgjTable
	},
	mixins: [
		MetaDataMixin,
	],
	data() {
		return {
			loading: false,
			visible: false,
			showShopName: true,
			point: '',
			queryData: {
				memberId: this.$route.params.id,
				pageNum: 1,
				pageSize: 15,
				type: 1,
				startDate: ''
			},
			pointTypes: [
				{id: 1, name: '门店消费积分'},
				{id: 2, name: '线上消费积分'}
			],
			contentData: null
		}
	},
	mounted() {
		this.queryData.startDate = Dayjs(new Date()).format(DateFormat)
	},
	methods: {
		onQuery() {
			this.showShopName = this.queryData.type === 1 ? true : false
			this.queryData.pageNum = 1;
			this.getData();
		},
		getData() {
			const postData = this.queryData
			this.loading = true;
			this.$http.post('/memberDetail!queryPoint.action', postData).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					resData.content && resData.content.forEach(item => {
						const {changeTime} = item;
						item.changeTime = changeTime ? Dayjs(changeTime).format(DateFormat) : ''
					})
					this.contentData = resData
				}	
			}).catch(() => {
				this.loading = false;
			})
		},
		// formatterChangePoint(row) {
		// 	const {changePoint, pd} = row;
		// 	return pd === 1 ? <span class="increase">{'+' + changePoint}</span> : <span class="decrease">{'-' + changePoint}</span>
		// },
		triggerPopover() {
			this.point = '';
		},
		sendPoint() {
			if (this.hasSendPointPower) {
				if (!this.point) {
					this.$message({
						message: '请输入要赠送的积分',
						type: 'warning',
						duration: 2000
					})
					return;
				}
				if (!/(^[1-9]\d*$)/.test(this.point)) {
					this.$message({
						message: '赠送的积分必须为大于0的整数',
						type: 'warning',
						duration: 2000
					})
					return;
				}
				const {shopId, userName, userId, shopName} = this.userInfo
				const postData = {
					memberId: this.$route.params.id,
					operator: userName,
					operatorId: userId,
					point: +this.point,
					shopId: shopId,
					shopName: shopName
				}
				this.loading = true
				this.$http.post('/memberDetail!sendPointManual.action', postData).then(res => {
					this.loading = false
					const resData = res.data;
					if (resData.code === 0) {
						this.$message({
							message: '积分赠送成功',
							type: 'success',
							duration: 2000
						})
						if (this.queryData.type === 1) {
							this.queryData.pageNum = 1;
							this.getData();
						}
					} else {
						this.$message.error(resData.message);
					}
				})
			} else {
				this.$message({
					message: '对不起，您没有赠送积分的权限！',
					type: 'warning',
					duration: 2000
				})
			}
			this.visible = false;
		},
		handleCurrentChange(pageNum) {
			this.queryData.pageNum = pageNum;
			this.getData();
		},
		handleSizeChange(pageSize) {
			this.queryData.pageNum = 1;
			this.queryData.pageSize = pageSize;
			this.getData();
		}
	}
}
</script>

<style lang="less">
	.customer_point_change {
		position: relative;
		padding: 20px 40px 0;
		height: 100vh;
		.point_change_header {
			display: flex;
			justify-content: space-between;
			.title {
				font-size: 13px;
				color: #222;
				line-height: 2.4;
				font-weight: bold;
			}
		}

		.point_change_content {
			.point_change_content-empty {
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
			.increase {
				color: #51A661;
			}
			.decrease {
				color: #DA3D4D;
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
</style>
