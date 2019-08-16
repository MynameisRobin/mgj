import FindIndex from 'lodash.findindex'
import GroupMove from '#/components/group-move'
export default {
	data() {
		return {
			isAction: false,
			isUpdate: false,
		}
	},
	created() {
		this.$on('column-end', (data) => {
			// console.log(211111);
			document.querySelector(".one.headTitle").style.visibility = 'visible';

			this.removeEmptyChild(data);
		});
		this.$on('column-add-copy', data => {
			this.builderTempChildren(data);
			this.isUpdate = true;
			if (this.isTree) {
				this.columnData.children.forEach(item => {
					let matchPackageIndex = null;
					matchPackageIndex = FindIndex(item.value, valueItem => valueItem._isPackages === true);
					item.parentKey = matchPackageIndex === -1 ? 'projectRoot' : 'packageRoot';
					const {
						parentKey,
						value
					} = item;
					const valueKey = `,${value.map(item => item.id).join(',')},`;
					item.valueKey = valueKey;
					this.updateParentKey(item, `${parentKey}_${valueKey}`);
				})
			} else {
				const {
					parentKey,
					value
				} = this.columnData;
				const valueKey = `,${value.map(item => item.id).join(',')},`;
				this.columnData.valueKey = valueKey;
				const childParentKey = parentKey ? `${parentKey}_${valueKey}` : 'root';
				this.updateParentKey(this.columnData, childParentKey);
			}
			this.isUpdate = false;
		})
	},
	methods: {
		handleGroupMove(params) {
			const {
				index,
				type
			} = params;
			const {
				children,
				parentKey,
				valueKey
			} = this.columnData;
			GroupMove.open({...params, children}).then((children) => {
				if (!children) return;
				this.columnData.children = children.filter(item => item);
				// 修复type 问题
				// const childParentKey = this.columnData.typeKey ? this.columnData.children[index].type : `${parentKey}_${valueKey}`;
				const childParentKey = this.columnData.typeKey ? type : `${parentKey}_${valueKey}`;
				this.updateParentKey(this.columnData, childParentKey);
				if (this.isTree) {
					this.updateData();
				} else {
					this.tree.updateData();
				}
			});
		},
		handleDbclick() {
			const {
				type
			} = this.columnData;
			this.$emit('group-move', { index: this.index, type});
		},
		handleAddTempChild(data) {
			const {
				valueKey,
				parentKey,
				children,
				type
			} = this.columnData;

			let tempItem = {
				// parentKey: parentKey ? `${parentKey}_${valueKey}` : children[0].parentKey,
				// parentKey: parentKey ? `${parentKey}_${valueKey}` : ( data.indexOf('packageRoot') !== -1 ? children[1].parentKey : children[0].parentKey ),
				parentKey: data ? data : ( data.indexOf('packageRoot') !== -1 ? children[1].parentKey : children[0].parentKey ),
				value: [],
				children: [],
				isTemp: true,
				type: children[0].type
			}
			// console.log(11111111111, parentKey, tempItem, data);

			this.columnData.children.push(tempItem);
		},
		builderTempChildren({index, columnData}) {
			const buildTemp = this.columnData.children[this.columnData.children.length - 1];
			if (buildTemp && buildTemp.isTemp) {
				const copyChildren = JSON.parse(JSON.stringify(columnData.children));
				buildTemp.children = [...copyChildren];
				const ids = buildTemp.value.map(item => item.id);
				buildTemp.valueKey = `,${ids.join(',')},`;
				delete buildTemp.isTemp;
			}
		},
		removeEmptyChild() {
			let removeIndex = FindIndex(this.columnData.children, item => item.value.length === 0);
			if (removeIndex >= 0) this.columnData.children.splice(removeIndex, 1);
		},
		onStart(data, evt, event) {
			let t = document.documentElement.scrollTop || document.body.scrollTop;
			if ( t >= 200 ) {
				document.querySelector(".one.headTitle").style.visibility = 'hidden';
			}
			if (this.columnData.value.length === 1) return;
			this.$emit('add-temp', data);
		},
		onRemove(data) {
			this.isAction = true;
			this.$parent.$emit('column-add-copy', {columnData: this.columnData});
			this.isAction = false;
		},
		updateParentKey(columnData, parentKey) {
			const {
				children
			} = columnData;

			for (let i = 0; i < children.length; i++) {
				const item = JSON.parse(JSON.stringify(children[i]));
				
				item.parentKey = parentKey;

				if (item.type === 'itemids' && item.valueKey.indexOf('T') !== -1) {
					item.parentKey = `packageRoot_${columnData.valueKey}`
				}

				if (item.type !== 'equation') {
					const ids = item.value.map(item => item.id);
					item.valueKey = `,${ids.join(',')},`;	
					let childParentKey = `${parentKey}_${item.valueKey}`;
					this.updateParentKey(item, childParentKey);
				}
				children[i] = item;
			}
		},
		stepValsetAndUpdata({index, value}) {
			// 验证参数，非法时主动修改值
			let thisIndex = this.columnData.children[index];
			thisIndex.valueKey = `,${thisIndex.value[0]},${thisIndex.value[1]},`;
			this.isUpdate = true;
			this.updateParentKey(this.columnData.children[index], `${thisIndex.parentKey}_${thisIndex.valueKey}`);
			this.isUpdate = false;
			this.updateData();
		}
	}
}