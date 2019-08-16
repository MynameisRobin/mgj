<template>
	<div class="group_move_wrap" v-if="show">
		<div class="group_move-primary">
			<el-input size="mini" placeholder="输入关键字搜索" clearable v-model.trim="searchVm.key"></el-input>
			<div class="primary_item"
				v-for="item in primaryList"
				:key="item.id">
				<div class="primary_item-main">
					<span v-if="isItems && item.outer_name" class="primary_item-category" title="item.outer_name">
						{{ item.outer_name | cutString(4) }}
					</span>
					<span v-if="isItems" class="primary_item-no">{{ item.id }}</span>
					<strong>{{ item.cardtypename || item.fieldName || item.packName || item.name | cutString(14) }}</strong>
				</div>
				<div class="primary_item-checkbox">
					<el-checkbox @change="checked => onChangeCheck(checked, item)"></el-checkbox>
				</div>
			</div>
		</div>
		<div class="group_move-list">
			<div class="group_move-create" @click="onCreate">
				<am-icon name="niantiepeizhi" size="12px"></am-icon>
				创建新分组
			</div>
			<group-move-item 
				v-if="item.parentKey === currentGroup.parentKey"
				v-for="(item, index) in list"
				:key="index"
				:index="item.index + 1"
				title="组"
				:data="item.value">
				<div slot="action">
					<span @click="onMove(item)">
						<am-icon name="niantiepeizhi" size="12px"></am-icon>
						添加到此
					</span>
					<span title="删除分组" class="group_move_item-delete" @click="onDelete(index)" v-if="createIndexList.indexOf(index) >= 0">
						<am-icon size="12px" name="close" is-element></am-icon>
					</span>
				</div>
			</group-move-item>
		</div>
		<div class="group_move-close" @click="close" title="点击关闭">
			<am-icon size="30px" name="close" is-element></am-icon>
		</div>
	</div>
</template>
<script>
import FindIndex from 'lodash.findindex'
import Some from 'lodash.some'
import GroupMoveItem from './group-item'
export default {
	name: 'groupMove',
	components: {
		GroupMoveItem
	},
	props: {
		index: Number,
		type: String,
		children: Array,
		resolve: Function
	},
	data() {
		return {
			show: false,
			list: [],
			currentGroup: null,
			selectList: [],
			createIndexList: [],
			searchVm: {
				key: '',
				select: false
			},
			isUpdate: false
		}
	},
	methods: {
		open() {
			this.list = this.children.filter((item, iIndex) => {
				if (iIndex !== this.index) {
					item.index = iIndex;
					return true;
				}
				return false;
			});
			this.currentGroup = JSON.parse(JSON.stringify(this.children[this.index]));
			this.selectList = [];
			this.createIndexList = [];
			this.searchVm = {
				key: '',
				select: false
			};
			this.show = true;
			this.isUpdate = false;
		},
		close() {
			if (this.createIndexList.length === 0 && !this.isUpdate) {
				this.resolve(false);
			}
			this.show = false;
			let list = this.list;
			this.list = [];
			list.splice(this.index, 0, this.currentGroup);
			list = list.filter(item => item.value.length > 0);
			this.resolve(list);
		},
		onChangeCheck(checked, item) {
			if (checked) {
				this.selectList.push(item);
			} else {
				let removeIndex = FindIndex(this.selectList, sItem => sItem.id === item.id );
				this.selectList.splice(removeIndex, 1);
			}
		},
		onMove(item) {
			if (!this.selectList.length) return;
			const selectList = this.selectList.map(item => {
				delete item.checked;
				return item;
			})
			item.value.push(...selectList);
			this.isUpdate = true;
			this.updateCurrentGroup();
		},
		onCreate() {
			if (!this.selectList.length) return;
			const {
				parentKey,
				type,
				valueKey,
				children
			} = this.currentGroup;
			this.list.push({
				parentKey,
				type,
				valueKey,
				value: [...this.selectList],
				index: this.list.length + 1,
				children
			});
			this.createIndexList.push(this.list.length - 1);
			this.updateCurrentGroup();
		},
		onDelete(index) {
			this.currentGroup.value.unshift(...this.list[index].value);
			this.list.splice(index, 1);
			const removeIndex = FindIndex(this.createIndexList, item => item === index);
			this.createIndexList.splice(removeIndex, 1);
			this.createIndexList.forEach((item, cIndex) => {
				if (item > index) {
					item -= 1;
					this.createIndexList[cIndex] = item;
				};
			})
		},
		updateCurrentGroup() {
			let {
				value
			} = this.currentGroup;
			this.currentGroup.value = value.filter(item => !Some(this.selectList, sItem => sItem.id === item.id));
			this.selectList = [];
		}
	},
	computed: {
		isItems() {
			return this.type === 'itemids'
		},
		primaryList() {
			const {
				value
			} = this.currentGroup;
			const {
				key
			} = this.searchVm;
			return value.filter(item => {
				const label = item.cardtypename || item.fieldName || item.packName || item.name;
				const { id } = item;
				return label.indexOf(key) >= 0 || key === '' || String(id).indexOf(key) >= 0;
			})
		}
	},
	mounted() {
		this.$eventBus.$on('change-tab', () => {
			this.close();
		})
	},
	destroyed() {
		this.$eventBus.$off('change-tab')
	}
}
</script>

<style lang="less">
	.group_move_wrap {
		& .el-input-group__append {
			padding: 0 10px;
		}
		& .el-checkbox__label {
			font-size: 12px;
		}
	}
</style>


<style lang="less" scoped>
	.group_move_wrap {
		position: fixed;
		z-index: 3001;
		left: 0;
		top: 0;
		bottom: 0;
		width: 555px;
		display: flex;
		&:before {
			content: "";
			position: absolute;
			left: 0;
			top: 0;
			width: 100vw;
			height: 100%;
			background: rgba(0, 0, 0, .6);
		}
	}
	.group_move-primary {
		position: relative;
		z-index: 2;
		flex: 0 0 300px;
		padding: 15px 20px;
		height: 100%;
		background: #fafafa;
		overflow-y: scroll;
		& .primary_item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 250px;
			padding: 0 6px;
			height: 32px;
			border: 1px solid #F2F2F2;
			background: #fff;
			box-shadow: 0 0 15px rgba(0, 0, 0, .1);
			margin-top: 8px;
			& strong {
				font-weight: normal;
			}
		}
		& .primary_item-main {
			display: flex;
			flex: 1;
		}
		& .primary_item-category {
			width: 42px;
			background: #eee;
		}
		& .primary_item-no {
			margin: 0 5px;
		}
		& .primary_item-checkbox {
			flex: 0 0 auto;
			margin-right: 3px;
		}
	}
	.group_move-list {
		z-index: 2;
		position: relative;
		flex: 0 0 255px;
		width: 255px;
		height: 100%;
		padding: 10px 20px;
		padding-left: 28px;
		background: #fff;
		overflow-y: scroll;
		overflow-x: visible;
		& .group_move_item {
			&:not(:first-child) {
				margin-top: 19px;
			}
			&:nth-child(2) {
				margin-top: 10px;
			}
		}
		& .group_move-create {
			width: 100%;
			height: 34px;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			border: 1px solid #e8e8e8;
			font-size: 12px;
			color: #0ae;
			cursor: pointer;
			& .iconfont {
				padding-right: 5px;
			}
		}
		& .group_move_item-delete {
			position: absolute;
			right: -10px;
			top: -10px;
			width: 18px;
			height: 18px;
			color: #c7c7c7;
			border: 1px solid #E8E8E8;
			border-radius: 100%;
			transform: translate(50%, -50%);
			text-align: center;
		}
	}
	.group_move-close {
		position: absolute;
		z-index: 2;
		right: -15px;
		top: 0;
		margin: 8px;
		transform: translateX(100%);
		color: #fff;
		cursor: pointer;
	}

</style>


