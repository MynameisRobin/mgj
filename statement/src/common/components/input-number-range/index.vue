<template>
	<div class="input_number_range">
		<el-input-number
			v-model="minValue"
			:style="inputStyleList"
			:min="min"
			:controls="false"
			:precision="precision"
			@change="handleMinChange">
		</el-input-number>
		<span class="input_number_range-separator">至</span>
		<el-input-number
			v-model="maxValue"
			:style="inputStyleList"
			:controls="false"
			:max="max"
			:precision="precision"
			@change="handleMaxChange">
		</el-input-number>
	</div>
</template>
<script>
export default {
	name: 'InputNumberRange',
	props: {
		value: Array,
		size: String,
		min: Number,
		max: Number,
		precision: Number,
		width: String,
	},
	data() {
		return {
			minValue: undefined,
			maxValue: undefined
		}
	},
	watch: {
		value(newVal) {
			this.pullValue(newVal);
		}
	},
	computed: {
		inputStyleList() {
			if (this.width) {
				return {
					width: this.width
				}
			} else {
				return null
			}
		}
	},
	methods: {
		pullValue(value) {
			if (!value || value.length === 0) {
				this.minValue = undefined;
				this.maxValue = undefined;
				return;
			};
			const [minVal, maxVal] = this.value;
			this.minValue = minVal;
			this.maxValue = maxVal;
		},
		handleMinChange(value) {
			if (value > this.maxValue) {
				this.maxValue = value;
			}
			this.syncData();
		},
		handleMaxChange(value) {
			if (value < this.minValue) {
				this.minValue = value;
			}
			this.syncData();
		},
		syncData() {
			this.$emit('input', [this.minValue, this.maxValue]);
		}
	},
	mounted() {
		this.pullValue(this.value);
	}

}
</script>
<style>
	.input_number_range-separator {
		color: #999;
		font-size: 12px;
		margin: 0 6px;
	}
	.input_number_range .el-input-number .el-input__inner {
		text-align: left;
	}
</style>
