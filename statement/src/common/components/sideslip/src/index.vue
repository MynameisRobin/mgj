<template>
	<div class="sideslip" :class="className" :style="styleList">
		<slot></slot>
		<div class="sideslip-button" @click="triggerExpand" :style="buttonStyle" :class="className">
			<am-icon is-element :name="buttonIconName"></am-icon>
		</div>
	</div>
</template>
<script>
export default {
	name: 'am-sideslip',
	props: {
		value: Boolean,
		width: {
			type: String,
			default: '230px'
		},
		height: {
			type: String,
			default: '230px'
		},
		postion: {
			type: String,
			default: 'left'
		},
		backgroundColor: {
			type: String,
			default: '#eee'
		},
		defaultExpand: {
			type: Boolean,
			default: false,
		}
	},
	data() {
		return {
			expand: true,
		}
	},
	computed: {
		buttonIconName() {
			return this.isVertical ? 'caret-left' : 'caret-top'
		},
		className() {
			return [
				this.isVertical ? 'is_vertical' : 'is_horizontal',
				this.postion,
				this.expand ? 'is_expand' : 'is_collapse'
			]
		},
		isVertical() {
			return ['left', 'right'].includes(this.postion);
		},
		buttonStyle() {
			let backgroundColor = this.backgroundColor;
			let result = {
				backgroundColor
			};
			result[this.postion] = '100%';
			return result;
		},
		styleList() {
			let backgroundColor = this.backgroundColor;
			let result = {
				backgroundColor,
			}
			if (this.isVertical) {
				result['width'] = this.width;
			} else {
				result['height'] = this.height;
			}
			result[this.postion] = 0;
			return result;
		}
	},
	watch: {
		value(newVal, oldVal) {
			if (newVal === this.expand) return;
			this.expand = newVal;
		}
	},
	methods: {
		triggerExpand() {
			this.expand = !this.expand;
			this.$emit('input', this.expand);
			if (this.expand) {
				this.$emit('expand');
			} else {
				this.$emit('collapse');
			}
		}
	},
	created() {
		this.expand = this.value || this.defaultExpand;
	}
}
</script>
<style lang="less">
	.sideslip {
		position: fixed;
		z-index: 1001;
		transition: transform .3s;
		&.is_horizontal {
			left: 0;
			right: 0;
		}
		&.is_vertical {
			top: 0;
			bottom: 0;
		}
		
		&.is_collapse {
			transition: transform .3s;
			&.left {
				transform: translateX(-100%);
			}
			&.right {
				transform: translateX(100%);
			}
			&.top {
				transform: translateY(-100%); 
			}
			&.bottom {
				transform: translateY(100%); 
			}
		}
	}
	.sideslip-button {
		position: absolute;
		overflow: hidden;
		cursor: pointer;
		color: #a0a0a0;
		& i {
			transition: transform .3s;
		}
		&.is_vertical {
			top: 50%;
			width: 16px;
			line-height: 54px;
			height: 54px;
			border-radius: 0 6px 6px 0;
			transform: translateY(-50%);
		}
		&.is_horizontal {
			left: 50%;
			width: 54px;
			line-height: 16px;
			height: 16px;
			border-radius: 0 0 6px 6px;
			text-align: center;
			transform: translateX(-50%);
		}
		&.bottom {
			transform: rotate(180deg);
		}
		&.right {
			transform: rotate(180deg);
		}
		&.is_collapse i {
			transform: rotate(180deg);
		}
	}
</style>
