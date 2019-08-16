<template>
	<el-scrollbar v-loading="loading">
		<draggable
			:options="{disabled : !sortable}"
			class="report_list"
			@end="handleSortEnd"
			v-model="list">
			<div 
				class="report_item-wrap"
				v-for="(item, index) in list"
				:key="index">
				<div 
					class="report_item"
					@click="onItemClick(item, index)"
					:class="{is_active: activeId === item.id, is_unsaved: (item.unsaved && !isSystem), is_edit: editId === item.id}">
					<div class="report_item-top">
						<am-icon size="12px" @click.native.stop="onTop(item, index)" v-if="index !== 0 && sortable" title="点击可置顶报表" name="top"></am-icon>
					</div>
					<p class="report_item-label" :title="item.title">
						{{ item.title | cutString(24) }}
					</p>
					<div class="report_item-action" v-if="item.id === editId" @click.stop="onItemCloseEdit">
						<am-icon size="16px" title="关闭编辑" name="xiangzuo"></am-icon>
					</div>
					<div class="report_item-action" v-else @click.stop="onItemEdit(item)">
						<am-icon title="编辑方案" name="edit"></am-icon>
					</div>
				</div>
			</div>
		</draggable>
	</el-scrollbar>
</template>
<script>
import Draggable from 'vuedraggable'
import FindIndex from 'lodash.findindex'
import MetaDataMixin from '#/mixins/meta-data'
export default {
	mixins: [MetaDataMixin],
	props: {
		activeId: [String, Number],
		isSystem: Boolean,
		type: Number,
		sortable: Boolean,
		editId: [String, Number]
	},
	components: {
		Draggable
	},
	data() {
		return {
			list: [],
			loading: false,
		}
	},
	methods: {
		getItemIndexById(id) {
			return FindIndex(this.list, item => item.id === id);
			// return this.list.findIndex(item => item.id === id);
		},
		removeItem(id) {
			const index = this.getItemIndexById(id);
			if (index !== -1) {
				this.list.splice(index, 1);
			}
		},
		updateItem(data, unsaved) {
			const index = this.getItemIndexById(data.id);
			if (unsaved) {
				data.unsaved = true;
			}
			if (index >= 0) {
				this.list.splice(index, 1, data);
			} else {
				this.list.push(data);
			}
		},
		handleSortEnd() {
			this.loading = true;
			let orders = this.list.map((item, index) => {
				const { id } = item;
				return {
					id,
					od: index + 1
				}
			})
			this.$http.post('/superOperationReport!setorder.action', {
				orders,
				parentShopId: this.parentShopId
			}).then(res => {
				this.loading = false;
				let resData = res.data;
				const { code, message } = resData;
				if (code !== 0) {
					this.$message.error(message);
				}
			})
		},
		onTop(item, index) {
			this.list.splice(index, 1);
			this.list.unshift(item);
			this.handleSortEnd();
		},
		onItemCloseEdit(item) {
			this.$emit('item-close-edit', item)
		},
		onItemEdit(item) {
			this.$emit('item-edit', item);
		},
		onItemClick(item) {
			this.$emit('item-click', item);
		}
	},
	mounted() {
		this.loading = true;
		let postData = this.isSystem ? {} : {
			parentShopId: this.parentShopId,
			empId: this.userId,
			type: this.type
		};
		this.$http.post('/superOperationReport!schemeList.action', postData).then(res => {
			this.loading = false;
			let resData = res.data;
			const { code, message, content } = resData;
			if (code === 0) {
				this.list = content;
			}
		});
	}
}
</script>
<style lang="less">
	.report_list {
		padding-top: 5px;
		height: calc(100vh - 100px);
		& .report_item-wrap:nth-child(9n+1),
		& .report_item-wrap:nth-child(9n+2) {
			& .report_item {
				border-left: 2px solid #f7aca3;
			}
		}
		& .report_item-wrap:nth-child(9n+3) {
			& .report_item {
				border-left: 2px solid #fad99e;
			}
		}
		& .report_item-wrap:nth-child(9n+4),
		& .report_item-wrap:nth-child(9n+5) {
			& .report_item {
				border-left: 2px solid #c3f2b9;
			}
		}
		& .report_item-wrap:nth-child(9n+6) {
			& .report_item {
				border-left: 2px solid #a5c6f7;
			}
		}
		& .report_item-wrap:nth-child(9n+7),
		& .report_item-wrap:nth-child(9n+8) {
			& .report_item {
				border-left: 2px solid #c0c0fa;
			}
		}
		& .report_item-wrap:nth-child(9n+9) {
			& .report_item {
				border-left: 2px solid #aad2e6;
			}
		}
	}
	.report_item-wrap {
		& ~ .report_item-wrap {
			margin-top: 5px;
		}
	}
	.report_item {
		position: relative;
		width: auto;
		display: inline-block;
		padding: 0 6px 0 0;
		height: 34px;
		line-height: 34px;
		cursor: pointer;
		background-color: #fff;
		border-radius: 4px;
		box-shadow: 0 0 6px #dcdcdc;
		transition: all .3s;
		&:hover {
			box-shadow: 0 0 6px rgba(0, 167, 215, .58);
			& .report_item-label {
				color: #0ae;
			}
		}
		&.is_active {
			background: #0ae;
			& .report_item-label {
				color: #fff;
			}
			& .report_item-action {
				color: #fff;
			}
			&.is_edit {
				& .report_item-action {
					color: #fff;
				}
			}
		}
		&.is_edit {
			& .report_item-action {
				color: #0ae;
			}
		}
		&.is_unsaved {
			&:before {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				width: 8px;
				height: 8px;
				border-radius: 100%;
				background-color: #dc151e;
				transform: translate(40%, -40%);
			}
		}
		&:hover {
			& .report_item-top i {
				display: block;
				opacity: 1;
			}
		}
	}
	.report_item-top,
	.report_item-action {
		float: left;
		width: 20px;
		height: 20px;
		line-height: 20px;
		text-align: center;
		color: #DADADA;
		transition: color .3s;
	}
	.report_item-action {
		margin-top: 7px;
		margin-left: 4px;
		&:hover {
			color: #0ae;
		}
	}
	.report_item-top {
		margin-top: 6px;
		transition: opacity .3s;
		&:hover {
			color: #FC9252;
		}
		& i {
			display: none;
			opacity: 0;
		}
	}
	.report_item-label {
		float: left;
		font-size: 12px;
		color: #222;
		transition: color .3s;
	}
</style>

