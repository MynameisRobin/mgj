<template>
	<el-popover
		class="popover_select_container"
		popper-class="popover_select_popper"
		placement="right"
		:width="popoverWidth"
		trigger="click"
		@show="handleShowPopover"
		@hide="handleHidePopover"
		:disabled="disabled">
		<el-checkbox-group v-model="tempIds">
			<el-checkbox 
				v-for="option in options"
				:label="option[props.id]"
				:key="option[props.id]">
				<slot name="label" :option="option">
					{{ option[props.label] }}
				</slot>
			</el-checkbox>
		</el-checkbox-group>
		<div class="popover_select_popper-empty" v-if="options.length === 0">
			<slot name="empty"><p class="popover_select_popper-empty--default">{{this.emptyText}}</p></slot>
		</div>
		<div class="popover_select_popper-action">
			<el-button type="primary" @click="onConfirm">确定</el-button>
		</div>
		<div :class="classList" class="popover_select" slot="reference">
			<div class="popover_select-inner">
				<span v-if="ids.length === 0" class="popover_select-empty">{{this.placeholder}}</span>
				<el-tag
					size="mini"
					type="info"
					closable
					:disable-transitions="true"
					v-for="(item, index) in viewTagList"
					:key="item.key"
					@close="handleTagClose(item, index)">
					{{ item[props.label] }}
				</el-tag>
				<el-tag 
					:disable-transitions="true"
					v-if="tagList.length > 1"
					size="mini"
					type="info">
					+{{ tagList.length - 1 }}
				</el-tag>
			</div>
			<span class="popover_select-suffix">
				<am-icon class="popover_select-icon" name="arrow-up" is-element></am-icon>
			</span>
		</div>
	</el-popover>
</template>
<script>
export default {
	name: 'PopSelect',
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
		},
		disabled: {
			type: Boolean,
			default: false
		},
		emptyText: {
			type: String,
			default: '无数据'
		}
	},
	watch: {
		'value': function (newVal, oldVal) {
			if (newVal !== oldVal) {
				this.ids = newVal;
			}
		}
	},
	data() {
		return {
			ids: [],
			tempIds: [],
			focus: false
		}
	},
	computed: {
		classList() {
			const classPrefix = 'popover_select--';
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
			if (this.disabled) {
				result.push(`${classPrefix}disabled`)
			}
			return result;
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
			this.tempIds = [
				...this.ids
			];
		},
		handleHidePopover() {
			this.focus = false;
		},
		handleTagClose(item, index) {
			const id = item[this.props.id];
			const idIndex = this.ids.indexOf(id);
			if (idIndex !== -1) {
				this.ids.splice(idIndex, 1);
			}
			this.asyncValue();
		},
		asyncValue() {
			this.$emit('input', this.ids);
		},
		onConfirm() {
			this.ids = [
				...this.tempIds
			];
			this.asyncValue();
			document.body.click();
			this.$emit('updEmpCusts', this.ids);
		}
	}
}
</script>
<style>
	.popover_select_container {
		display: inline-block;
		width: 220px;
	}
	.popover_select {
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
	.popover_select-suffix {
		position: absolute;
		height: 100%;
		right: 5px;
		top: 0;
		text-align: center;
		color: #c0c4cc;
		transition: all .3s;
	}
	.popover_select-icon {
		width: 25px;
		transform: rotateZ(180deg);
		transition: inherit;
	}
	.popover_select--focus .popover_select-icon {
		transform: rotateZ(0deg);
	}
	.popover_select--focus {
		border-color: #0ae;
	}
	.popover_select.popover_select--disabled {
		background-color: #F5F7FA;
		cursor: not-allowed;
	}
	.popover_select.popover_select--collapse {
		height: 40px;
	}
	.popover_select--mini {
		line-height: 28px;
		min-height: 28px;
	}
	.popover_select--mini.popover_select--collapse {
		height: 28px;
	}
	.popover_select-inner {
		width: 100%;
		min-height: 100%;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}
	.popover_select .el-tag.el-tag--info {
		margin: 2px 0 2px 6px;
		color: #222;
		border-color: transparent;
	}
	.el-popover.popover_select_popper {
		padding-top: 30px;
		padding-bottom: 30px;
		padding-left: 30px;
		box-shadow: 0px 2px 28px 0px rgba(0,0,0,0.21);
	}
	.popover_select_popper .el-checkbox {
		margin-top: 14px;
		margin-right: 0;
		width: 50%;
	}
	.popover_select_popper .el-checkbox ~ .el-checkbox {
		margin-left: 0;
	}
	.popover_select_popper .el-checkbox__label {
		font-size: 12px;
	}
	.popover_select_popper .el-checkbox-group {
		max-height: 338px;
		overflow-y: auto;
	}
	.popover_select_popper-action {
		margin-top: 20px;
		text-align: right;
	}
	.popover_select-empty {
		font-size: 12px;
		padding-left: 15px;
		color: #bebebe;
	}
	.popover_select_popper-empty--default {
		text-align: center;
		color: #c1c1c1;
	}
</style>
