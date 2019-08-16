<template>
	<div class="formula_input" :class="{'is-error': !valid}">
		<el-autocomplete
			ref="input"
			size="mini"
			v-model="val"
			:title="val"
			@input="onChange"
			popper-class="formula_key_list_panel"
			:fetch-suggestions="querySearch">
			<template slot-scope="{ item }">
				<div class="formula_key_list-item" @click.stop>
					<h4 class="formula_key_list-name">{{ item.groupName }}</h4>
					<div class="formula_key_list-value">
						<span @click.stop="handleSelect(keyItem)" 
							class="formula_key_list-key_item" 
							:class="{'active': keyItem.active}"
							v-for="(keyItem, index) in item.value" :key="index"
							:title="keyItem.value">
							{{ keyItem.value | cutString(20) }}
						</span>
					</div>
				</div>
			</template>
			<slot name="prepend" slot="prepend"></slot>
		</el-autocomplete>
		<p class="error_tips" v-if="!valid">{{ validText }}</p>
	</div>
</template>
<script>
const operatorString = '()+-*/';
import FindIndex from 'lodash.findindex'
import IsNumber from 'is-number'
export default {
	name: 'formulaInput',
	props: {
		factorList: Array,
		index: [Number, String],
		value: String,
		payList: Array
	},
	data() {
		return {
			val: '',
			valid: true,
			inputEl: ''
		}
	},
	watch: {
		value(newVal, oldVal) {
			if (newVal === oldVal) return false;
			this.init(newVal);
		}
		
	},
	computed: {
		computeFactorList() {
			let result = [];
			this.factorList.forEach(item => {
				result.push(...item.value)
			})

			return result;
		},
		restaurants() {
			return this.factorList.map(item => {
				const { value } = item;
				let result = value.map(item => {
					return {
						value: item
					}
				})
				return {
					...item,
					value: result
				};
			});
		},
		computedItemList() {
			let value = this.val;
			let list = this.getChinese(value);
			return list;
		},
		customPayList() {
			return this.payList.filter(item => {
				if (item.id) {  // payList 在为空数组的情况下判断一下
					return item.id.indexOf('otherfee') !== -1;
				}
			})
		},
		typeLabel() {
			return this.computeFactorList[0].substr(0, 2);
		}
	},
	methods: {
		handleAutoSelect($event) {
			return false;
		},
		getMatchLabel(label) {
			return `${this.typeLabel}${label}业绩`
		},
		decodeValue(value) {
			if (!value) return '';
			let val = value;
			let list = this.getChinese(value);
			list.forEach(item => {
				let index = FindIndex(this.customPayList, cItem => cItem.id === item);
				if (index !== -1) {
					let name = this.getMatchLabel(this.customPayList[index].fieldName);
					val = val.replace(item, name);
				}
			})
			return val;
		},
		encode(value) {
			if (!value) return '';
			let val = value;
			let list = this.getChinese(value);
			list.forEach(item => {
				let index = FindIndex(this.customPayList, cItem => {
					let matchLabel = this.getMatchLabel(cItem.fieldName);
					return matchLabel === item;
				});
				if (index !== -1) {
					val = val.replace(item, this.customPayList[index].id);
				}
			})
			return val;
		},
		init(newVal) {
			this.$nextTick(() => {
				this.val = this.decodeValue(newVal || this.value);
				this.validFormula(this.val);
			})
		},
		getLastChars(value) {
			return value ? value.substr(value.length - 1) : value;
		},
		isOperator(value) {
			return value && operatorString.indexOf(value) >= 0;
		},
		querySearch(queryString, cb) {
			const currentVal = this.val;
			let index = this.getCursortPosition();
			let currentCharFactorList = this.getCursortBeforeFactorList();
			let queryKey = currentCharFactorList[currentCharFactorList.length - 1];
			let restaurants = this.restaurants;
			var results = restaurants.map(item => {
				item.value.forEach(keyItem => {
					keyItem.active = keyItem.value.indexOf(queryKey) > -1;
				})
				return item;
			});
			cb(results);
		},
		onChange(e) {
			let value = this.inputEl.value;
			this.val = value;
			this.validFormula(this.val);
		},
		handleSelect(item) {
			let index = this.getCursortPosition();
			let currentCharFactorList = this.getCursortBeforeFactorList();
			let lastFactor = currentCharFactorList[currentCharFactorList.length - 1];
			const lastChars = this.val ? this.getLastChars(this.val.substr(0, index)) : '';
			const lastCharsIsOperator = this.isOperator(lastChars);
			let preStr = this.val.substr(0, index - (lastFactor && !lastCharsIsOperator ? lastFactor.length : 0));
			let lastStr = this.val.substr(index);
			let result = `${preStr}${item.value}${lastStr}`;
			this.val = result;
			this.validFormula(result);
			this.inputEl.focus();
		},
		validFormula(value) {
			this.validText = '公式不合法，请重新输入';
			let result = null;
			let formulaVal = value;
			let noMatchIndex = FindIndex(this.computedItemList, item => !IsNumber(item) && this.computeFactorList.indexOf(item) === -1);
			if (noMatchIndex !== -1) {
				this.valid = false;
				this.validText = `“${this.computedItemList[noMatchIndex]}”,不是一个有效的计算关键字`
			} else {
				this.computedItemList.forEach(item => {
					formulaVal = formulaVal.replace(item, 10);
				})
				try {
					result = eval(formulaVal);
					this.valid = true;
				} catch (error) {
					this.valid = false;
				}
			}
			this.$emit('valid', this.valid, this.index);
			let enValue = this.encode(this.val);
			// console.log('enValue', enValue);
			this.$emit('input', enValue);
		},
		getChinese(strValue) {
			const chineseReg = /[\u4e00-\u9fa5]/;
			let chineseList = [];
			let currentChar = '';
			const strList = strValue ? strValue.split('').filter(item => !!item.trim()) : [];
			strList.forEach((item, index) => {
				if (operatorString.indexOf(item) === -1) {
					currentChar = `${currentChar}${item}`;
					if (index === strList.length - 1) {
						currentChar && chineseList.push(currentChar);
					}
				} else {
					currentChar && chineseList.push(currentChar);
					currentChar = "";
				}
			})
			return chineseList;
		},
		getCursortBeforeFactorList() {
			if (!this.val) return '';
			let index = this.getCursortPosition();
			let currentCharFactorList = this.getChinese(this.val.substr(0, index));
			return currentCharFactorList;
		},
		getCursortPosition() {
			const obj = this.inputEl;
			var cursorIndex = 0;
			if (document.selection) {
				// IE Support
				obj.focus();
				var range = document.selection.createRange();
				range.moveStart('character', -obj.value.length);
				cursorIndex = range.text.length;
			} else if (obj.selectionStart || obj.selectionStart === 0) {
				// another support
				cursorIndex = obj.selectionStart;
			}
			return cursorIndex;
		},
		update() {
			this.$refs.input.handleChange(this.val);
		}
	},
	mounted() {
		this.init();
		this.inputEl = this.$refs.input.$el.querySelector('input[type="text"]');
		this.inputEl.addEventListener('keyup', this.update)
		this.inputEl.addEventListener('click', this.update);
	},
	destroyed() {
		this.inputEl.removeEventListener('keyup', this.update);
		this.inputEl.removeEventListener('click', this.update);
	}
}
</script>
<style lang="less">
	.is-error .el-input__inner{
		border-color: #f56c6c;
	}
	.formula_input .error_tips {
		color: #f56c6c;
	}
	.formula_input .el-input-group__prepend {
		padding: 0 7px;
	}
	.formula_input .el-autocomplete {
		width: 100%;
	}
	.formula_key_list_panel {
		width: 637px !important;
	}
	.formula_key_list-item {
		display: flex;
		padding: 6px 0;
	}
	.formula_key_list-name {
		flex: 0 0 80px;
		padding-right: 10px;
		text-align: right;
		line-height: 27px;
		font-size: 12px;
	}
	.formula_key_list-key_item {
		flex: 0 0 25%;
		padding: 0 5px;
		line-height: 25px;
		border: 1px solid transparent;
		font-size: 12px;
		&:hover,
		&.active {
			background: #FFFADF;
			border-color: #F3E3A8;
		}
	}
	.el-autocomplete-suggestion {
		li {
			&:hover {
				background-color: transparent !important;
			}
			&:not(:last-child) {
				.formula_key_list-item {
					border-bottom: 1px solid #EBEBEB;
				}
			}
		}
	}
	.formula_key_list-value {
		flex: 1;
		position: relative;
		display: flex;
		flex-wrap: wrap;
	}
</style>