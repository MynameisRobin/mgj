<template>
	<el-popover
		class="item_cover_select_container"
		popper-class="item_cover_select_popper"
		placement="right"
		:width="popoverWidth"
		trigger="click"
		@show="handleShowPopover"
		@hide="handleHidePopover">
		<div class="item_cover_select_content">
			<h5 class="item_cover_select_title">项目覆盖搜索</h5>
			<p class="item_cover_select_tips">不选择不作为查询条件，选择多个时需同时满足才在结果中</p>
			<div class="radio_group_list">
				<div class="radio_group_item"
					v-for="option in options"
					:key="option[props.id]">
					<span class="radio_group_item-title" :title="option[props.label]">{{ option[props.label] | cutString(10) }}</span>
					<el-radio-group v-model="tempVm[option[props.id]]">
						<el-radio :label="1">做过</el-radio>
						<el-radio :label="0">未做过</el-radio>
					</el-radio-group>
				</div>
			</div>
		</div>
		<div class="item_cover_select_popper-empty" v-if="options.length === 0">
			<slot name="empty"><p class="item_cover_select_popper-empty--default">无数据</p></slot>
		</div>
		<div class="item_cover_select_popper-action">
			<el-button type="primary" @click="onConfirm">确定</el-button>
		</div>
		<div :class="classList" class="item_cover_select" slot="reference">
			<div class="item_cover_select-inner">
				<span v-if="ids.length === 0" class="item_cover_select-empty">{{this.placeholder}}</span>
				<el-tag
					size="mini"
					type="info"
					closable
					:disable-transitions="true"
					v-for="(item, index) in viewTagList"
					:key="item.key"
					@close="handleTagClose(item, index)">
					{{ item[props.label] | cutString(10) }}/{{radioVm[item[props.id]] ? '做过' : '未做过'}}
				</el-tag>
				<el-tag 
					:disable-transitions="true"
					v-if="tagList.length > 1"
					size="mini"
					type="info">
					+{{ tagList.length - 1 }}
				</el-tag>
			</div>
			<span class="item_cover_select-suffix">
				<am-icon class="item_cover_select-icon" name="arrow-up" is-element></am-icon>
			</span>
		</div>
	</el-popover>
</template>
<script>
export default {
	name: 'ItemCoverSelect',
	props: {
		value: {
			type: Array,
			default: () => []
		},
		options: {
			type: Array,
			default: () => []
		},
		placeholder: String,
		size: String,
		collapseTags: Boolean,
		multipleLimit: {
			type: Number,
			default: 0
		},
		props: {
			type: Object,
			default: () => {
				return {
					label: 'label',
					id: 'id'
				}
			}
		},
		popoverWidth: {
			type: Number,
			default: 285
		}
	},
	watch: {
		'value': function (newVal, oldVal) {
			if (newVal !== oldVal) {
				this.radioVm = {};
				newVal.forEach(item => {
					const {
						classid,
						cover
					} = item;
					this.radioVm[classid] = cover;
				})
			}
		}
	},
	data() {
		return {
			tempVm: {},
			focus: false,
			radioVm: {}
		}
	},
	computed: {
		classList() {
			const classPrefix = 'item_cover_select--';
			let result = [];
			if (this.collapseTags) {
				result.push(`${classPrefix}collapse`)
			}
			if (this.size) {
				result.push(`${classPrefix}${this.size}`)
			}
			if (this.focus) {
				result.push(`${classPrefix}focus`)
			}
			return result;
		},
		ids() {
			const ids = Object.keys(this.radioVm);
			return Object.keys(this.radioVm).filter(classid => this.radioVm[classid] !== undefined);
		},
		tagList() {
			return this.options.filter(option => this.ids.indexOf(option[this.props.id]) !== -1);
		},
		viewTagList() {
			if (!this.collapseTags) return this.tagList;
			const tagLength = this.tagList.length;
			return tagLength ? [this.tagList[0]] : [];
		}
	},
	methods: {
		handleShowPopover() {
			this.focus = true;
			this.tempVm = {
				...this.radioVm
			}
		},
		handleHidePopover() {
			this.focus = false;
		},
		handleTagClose(item, index) {
			const id = item[this.props.id];
			delete this.radioVm[id];
			this.asyncValue();
		},
		asyncValue() {
			let result = [];
			for (let classid in this.radioVm) {
				const cover = this.radioVm[classid];
				if (cover !== undefined) {
					result.push({
						classid,
						cover
					})
				}
			}
			this.$emit('input', result);
		},
		onConfirm() {
			this.radioVm = {
				...this.tempVm
			}
			this.asyncValue();
			document.body.click();
		}
	}
}
</script>
<style>
	.item_cover_select_container {
		display: inline-block;
		width: 220px;
	}
	.item_cover_select {
		position: relative;
		padding: 0 30px 0 0;
		-webkit-appearance: none;
		background-color: #fff;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #dcdfe6;
		box-sizing: border-box;
		color: #606266;
		font-size: inherit;
		min-height: 40px;
		line-height: 40px;
		outline: none;
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		cursor: pointer;
	}
	.item_cover_select-suffix {
		position: absolute;
		height: 100%;
		right: 5px;
		top: 0;
		text-align: center;
		color: #c0c4cc;
		transition: all .3s;
	}
	.item_cover_select-icon {
		width: 25px;
		transform: rotateZ(180deg);
		transition: inherit;
	}
	.item_cover_select--focus .item_cover_select-icon {
		transform: rotateZ(0deg);
	}
	.item_cover_select--focus {
		border-color: #0ae;
	}
	.item_cover_select.item_cover_select--collapse {
		height: 40px;
	}
	.item_cover_select--mini {
		line-height: 28px;
		min-height: 28px;
	}
	.item_cover_select--mini.item_cover_select--collapse {
		height: 28px;
	}
	.item_cover_select-inner {
		width: 100%;
		min-height: 100%;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}
	.item_cover_select .el-tag.el-tag--info {
		margin: 2px 0 2px 6px;
		color: #222;
		border-color: transparent;
	}
	.el-popover.item_cover_select_popper {
		padding-top: 30px;
		padding-bottom: 30px;
		padding-left: 30px;
		box-shadow: 0px 2px 28px 0px rgba(0,0,0,0.21);
	}
	.item_cover_select_popper .el-checkbox {
		margin-top: 10px;
		width: 50%;
	}
	.item_cover_select_popper .el-checkbox ~ .el-checkbox {
		margin-left: 0;
	}
	.item_cover_select_popper .el-checkbox__label {
		font-size: 12px;
	}
	.item_cover_select_popper .el-checkbox-group {
		max-height: 200px;
		overflow-y: auto;
	}
	.item_cover_select_popper-action {
		margin-top: 20px;
		text-align: right;
	}
	.item_cover_select-empty {
		font-size: 12px;
		padding-left: 15px;
		color: #bebebe;
	}
	.item_cover_select_popper-empty--default {
		text-align: center;
		color: #c1c1c1;
	}
	.item_cover_select_content .el-radio__label,
	.item_cover_select_content .radio_group_item {
		font-size: 12px;
	}
	.item_cover_select_content .radio_group_item {
		color: #222;
		margin-top: 12px;
	}
	.item_cover_select_content .el-radio__label {
		color: #5c5c5c;
	}
	.item_cover_select_content .radio_group_item-title {
		display: inline-block;
		width: 100px;
	}
	.item_cover_select_content .radio_group_list {
		max-height: 236px;
		overflow-y: auto;
	}
	.item_cover_select_title {
		color: #222;
		font-weight: normal;
	}
	.item_cover_select_tips {
		margin: 9px 0;
		color: #909090;
		font-size: 12px;
		line-height: 19px;
	}
</style>
