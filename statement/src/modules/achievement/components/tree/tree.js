/* eslint-disable */
import FindIndex from 'lodash.findindex'

export default class Tree {
	constructor(options) {
		this.children = null;
		for (let option in options) {
			if (options.hasOwnProperty(option)) {
				this[option] = options[option];
			}
		}
		this.initData();
	}

	initData() {
		let obj = {
			'childrens': this.data,
			'level' : 0,
			'parent' : null,
		}
		this.children = this.coventChildren(obj);
	}
	mapping(obj) {	
		//映射函数
		//type映射类型 val原数据 mappingV映射值
		const { type , val , mappingV } = obj;
		let list = [];
		val.forEach( (k, v, arr)=> {
			mappingV.forEach(k1=> {
				let k1V = k1[this.typeKey[type]];
				if(k == k1V) {
					k1.id = k1V;
					list.push(k1);
				} else {
					// val.slice(0, v);
				}
			})
		})
		return list;
	}

	coventChildren(obj) {
		let {childrens, parentKey, level, parent} = obj;
		
		let result = [];
		const configs = this.columnsConfig;
		const key = configs[level].type;
	
		childrens.forEach(item => {
			let currentItem = {};
			let currentVal = item[key];
			let index = FindIndex(result, item => item.valueKey === currentVal);
			if (index >= 0) {
				currentItem = result[index];
				currentItem.children.push(item);
			} else {
				let value = currentVal ? currentVal.split(',').filter(item => item !== '') : [],
					mappingV = this.columnData[`${key}Map`]; 
				
				//区分套餐与套餐包
				if (key === 'itemids') {
					let list = [];
					// console.log(222222222222, key, value, this.columnData);
					if(value.length > 0 && value[0].indexOf('T') !== -1) {
						this.columnData[`${key}Map`].forEach(k => {
							if (k._isPackages === true) {
								list.push(k);
							}
						});
					}else {
						this.columnData[`${key}Map`].forEach(k => {
							if (k._isPackages !== true) {
								list.push(k);
							}
						});
					}
					mappingV = list;
				}				

				// currentItem.root = this.root;
				if(value[0] != '-1' && value[0] != 'T-1' && mappingV != undefined) {
					currentItem.value = this.mapping({type: key, val: value, 'mappingV' : mappingV});
				}else if(value[0] == '-1' || value[0] == 'T-1'){
					mappingV.forEach(k => {

						// 强制 改变原有id
						k.id = k[this.typeKey[key]];

					})
					currentItem.value = mappingV;
				}else {
					if(key == 'step') {
						currentItem.value = value
					}else if('equation') {
						currentItem.value = currentVal;
						currentItem.enabledPerfPct = item.enabledPerfPct === 1 ? true : false;
					}
				}
			
				currentItem.type = key;

				if (level < configs.length - 1) {
					currentItem.valueKey = currentVal;
					currentItem.children = [item];	
				}
				let keyP = `${key}`;
				if (key === 'itemids' && currentItem.valueKey.indexOf('T') !== -1 ) {
					keyP = 'packageRoot';
				}
				currentItem.parentKey = parentKey ? parentKey : keyP;
				
				result.push(currentItem);
			}
		});
		level++;
		if (level <= configs.length - 1) {
			result.forEach(item => {
				let obj = {
					childrens : item.children,
					parentKey : `${item.parentKey}_${item.valueKey}`,
					level : level,
					parent : item
				}
				item.children = this.coventChildren(obj);
				if (item.children && item.children.length) {
					item.heightNumber = this.renderHeightNumber(item);
				}
			})
		}
		return result;
	}

	computedChildMarginTotal(item) {
		const {
			children
		} = item;
		return (children.length - 1) * 10;
	}

	renderHeightNumber(columnData) {
		const {
			children,
			type,
			value
		} = columnData;
		const newlineCountConfig = {
			'itemids': 4,
			'evaluate': 3,
			'payTypes': 3,
			'consumeTypes': 2,
			'levelids': 2,
		}
		let heightNumber = 0;
		children.forEach(cItem => {
			heightNumber += cItem.heightNumber || 40;
		})
		heightNumber += this.computedChildMarginTotal(columnData);
		const miniHeight = type === 'itemids' ? 150 : 80;
		const count = newlineCountConfig[type] || 2;
		return (heightNumber < miniHeight && value.length > count) ? miniHeight : heightNumber;
	}
}