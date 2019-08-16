<template>
    <div id="scheme" v-loading="loading">
		<div class="tableBox">
			<el-table
				class="schemeTable"
				v-loading="tableLoading"
				:data="tableData"
				tooltip-effect="dark"
				border
				size="mini"
				height="calc(100vh - 175px)">
				<el-table-column v-for="(item, index) in columnData" :key="index" :width="item.width" :label="item.label">
					<template slot-scope="props">
						<span v-if="item.index === 'schemeName'" @click="onEdit(props.row['id'])" class="name_span">{{ props.row['schemeName'] }}</span>
						<span v-else-if="item.index === 'shopName'">{{ props.row['shopName'] }}</span>
						<span v-else-if="item.index === 'opeartion'" class="opeartion">
							<am-icon class="icon isEdit" name="fanganfuzhi" v-if="softgenre !== '0'"></am-icon>
							<am-icon class="icon" name="fanganfuzhi" @click.native="onCopy(props.row)" v-else-if="softgenre === '0'"></am-icon>
							<am-icon class="icon isEdit" name="fanganshanchu" v-if="isEdit"></am-icon>
							<am-icon class="icon" name="fanganshanchu" @click.native="onDelete(props.row)" v-else-if="!isEdit"></am-icon>
						</span>
						<span v-else>{{ props.row[item.index] }}</span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="footer">
			<el-button type="primary" disabled v-if="isDiabledBtn">增加新方案</el-button>
			<el-button type="primary" @click="onEdit(null)" v-if="!isDiabledBtn && !isEdit">增加新方案</el-button>
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
				getSchemeList: '/discountRule!getSchemeList.action', // 获取方案列表
				copyScheme: '/discountRule!copyScheme.action', // 复制方案
				delScheme: '/discountRule!delScheme.action' // 删除方案
			},
			loading: false,
			tableLoading: false,
			isDiabledBtn: false,
			columnData: [
				{
					index: 'schemeName',
					width: '300',
					label: '方案名称'
				},
				{
					index: 'shopName',
					width: '',
					label: '适用门店',
				},
				{
					index: 'opeartion',
					width: '150',
					label: '操作',
				},
			],
			editTextList: [
				{
					name: "fanganfuzhi",
					title: "复制",
					function: this.onCopy
				},
				{
					name: "fanganshanchu",
					title: "删除",
					disabled: false,
					function: this.onDelete
				}
			],
			tableData: []
		};
	},
	async mounted() {
		try {
			let res = await Api.getMetaData();
			let resData = res.data;
			const { code, content } = resData;
			if (code === 0) {
				this.$eventBus.env = {
					...content
				}
			}
			await this.getSchemeList();
		} catch (e) {
			console.log(e);
		}
	},
	methods: {
		isShowAddBtn() {
			if (((this.softgenre === '1' || this.softgenre === '3') && this.tableData.length > 0)) {
				this.isDiabledBtn = true;
			} else {
				this.isDiabledBtn = false;
			}
		},
		getSchemeList() {
			this.loading = true;
			this.$http.post(this.apiUrl.getSchemeList, {
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
					this.tableData = content || [];		
					this.isShowAddBtn();
				}
			});
		},
		onCopy(data) {
			this.$confirm("确定要复制此方案吗?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.loading = true;
				this.$http.post(this.apiUrl.copyScheme, {
					parentShopId: this.parentShopId,
					name: data.schemeName
				})
				.then(res => {
					this.loading = false;
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						this.getSchemeList();
						this.$message({
							type: "success",
							message: "复制成功"
						})
					}
				});
			}).catch(() => {});
		},
		onEdit(schemeId) {
			// if (this.softgenre === "2") {
			// 	return this.$message({
			// 		type: 'error',
			// 		message: '直属店统一由总部编辑'
			// 	});
			// }
			if (schemeId) {
				if (this.modalFlag) {
					this.$router.push({ name: 'schemeDetail', params: { schemeId: schemeId }});
					return false;
				}
				this.openShowDetail(schemeId);
			} else {
				if (this.modalFlag) {
					this.$router.push({ name: 'schemeDetail', params: {}});
					return false;
				}
				this.openShowDetail('');
			}
		},
		openShowDetail(schemeId) {
			try {
				const parentDocument = window.parent.document;
				const iframeBoxEl = parentDocument.querySelector('#customer_detail_box');
				const curClassName = iframeBoxEl.className;
				iframeBoxEl.className = `${curClassName} show`;
				const iframeEl = parentDocument.querySelector('.customer_detail_iframe');
				setTimeout(() => {
					iframeEl.src = `/shair/components/timeDiscount/index.html#/schemeDetail?schemeId=${schemeId}`;
				}, 500);
			}
			catch (e) {
				console.log(e);
			}
		},
		onDelete(data) {
			this.$confirm("确定要删除此方案吗?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.loading = true;
				this.$http.post(this.apiUrl.delScheme, {
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
						this.getSchemeList();
						this.$message({
							type: "success",
							message: "删除成功"
						})
					}
				});
			}).catch(() => {});
		}
	}
};
</script>

<style lang="less">
	#scheme{
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
					width: 95%;
					text-overflow: ellipsis;
					white-space: nowrap;
					display: inline-block;
					overflow: hidden;
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

