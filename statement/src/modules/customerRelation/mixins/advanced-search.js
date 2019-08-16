import IsNumber from 'is-number'
import Dayjs from 'dayjs'
import FindIndex from 'lodash.findindex'
import AdvancedBar from '#/components/advanced-bar'
import Api from '@/api'
const FindLabel = ({listData, matchKey, matchValue, labelKey}) => {
	const index = FindIndex(listData, item => item[matchKey] === matchValue);
	return index !== -1 ? listData[index][labelKey] : undefined;
}
const DayFormatList = [
	'createCardTime',
	'lastConsumeTime',
	'invalidDate'
]
export default {
	data() {
		return {
			advancedSearchTagList: [],
			timer: null,
			searchTimeout: false
		}
	},
	computed: {
		searchLoadingText() {
			return this.searchTimeout ? '根据您所选择的内容，查询所需的时间可能较长，请耐心等候；如果超过2分钟仍未看到结果，请点击右上角客服和QQ头像联系客服处理。' : '数据查询中';
		},
		isSingleShop() {
			const { softgenre } = this.userInfo;
			return softgenre !== '0';
		}
	},
	components: {
		AdvancedBar
	},
	methods: {
		startSearchTipsTimeout() {
			this.timer = setTimeout(() => {
				this.searchTimeout = true;
			}, 10 * 1000)
		},
		clearSearchTipsTimeout() {
			if (this.timer) {
				clearTimeout(this.timer);
				this.searchTimeout = false;
			}
		},
		validKeywordError(keyword) {
			let errorMsg = undefined;
			if (this.isSingleShop) return errorMsg;
			if (keyword) keyword = keyword.replace(/\s/g, '');
			if (!keyword && !IsNumber(keyword)) {
				errorMsg = '请输入查询关键字';
			} else if (IsNumber(keyword) && keyword.length < 3) {
				errorMsg = '搜索关键字是数字时，请最少输入三位数字';
			} else if (this.$utils.realLength(keyword) < 2) {
				errorMsg = '查询关键字至少输入俩个字符，中文至少一个字';
			}
			return errorMsg;
		},
		getAuxiliaryData(shopId) {
			this.auxiliaryCardTypes = [];
			Api.searchCondition({shops: [{shopId, parentId: shopId}]}).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					const {
						cardTypes
					} = resData.content;
					this.auxiliaryCardTypes = cardTypes;
				}
			})
		},
		handleSearchTagClose({data, index}) {
			const { key, type } = data;
			this.advancedSearchTagList.splice(index, 1);
			let result = undefined;
			switch (type) {
				case 'multipleSelect':
					result = [];
					break;
				case 'cover':
					result = [];
					break;
				case 'checkbox':
					result = false;
					break;
				default:
					break;
			}
			this.filterData[key] = result;
		},
		updateViewSearchContent(postData) {
			let advancedSearchTagList = [];
			for (let key in this.searchKeyConfig) {
				if (this.isSingleShop && key.toLocaleLowerCase() === 'shopids') continue;
				const value = postData[key];
				const config = this.searchKeyConfig[key];
				// 过滤无值的搜索字段
				if ((!value && !IsNumber(value)) || (value && value.length === 0)) continue;
				let currentContent = '';
				const {
					type,
					listDataKey,
					label,
					matchKey,
					labelKey,
					mapData
				} = config;
				const listData = this[listDataKey];
				let count = 0;
				let firstLabel = '';
				switch (type) {
					case 'range':
						var [startVal = '', endVal = ''] = value;
						if (DayFormatList.indexOf(key) !== -1) {
							startVal = Dayjs(startVal).format('YYYY-MM-DD');
							endVal = Dayjs(endVal).format('YYYY-MM-DD');
						}
						var currentLabel = label;
						if (key === 'invalidDate' && postData.invalidType === 0)  {
							currentLabel = '过期时间';
						}
						if (startVal !== '' || endVal !== '') {
							currentContent = `${currentLabel}${startVal}-${endVal}`;
						}
						break;
					case 'select':
						currentContent = FindLabel({listData, matchKey, matchValue: value, labelKey});
						break;
					case 'multipleSelect':
						count = 0;
						firstLabel = '';
						value.forEach(id => {
							const label = FindLabel({listData, matchKey, matchValue: id, labelKey});
							count += 1;
							if (count === 1) {
								firstLabel = label;
								currentContent = label;
							} else {
								currentContent = `${firstLabel} +${count - 1}`
							}
						});
						break;
					case 'map':
						currentContent = mapData[value];
						if (label && currentContent) {
							currentContent = `${label}: ${currentContent}`
						}
						break;
					case 'checkbox':
						if (value) currentContent = label;
						break;
					case 'cover':
						count = 0;
						firstLabel = '';
						value.forEach(item => {
							const label = FindLabel({listData, matchKey, matchValue: item.classid, labelKey});
							count += 1;
							const coverLabel = item.cover ? '做过' : '未做过';
							if (count === 1) {
								firstLabel = `${label}/${coverLabel}`;
								currentContent = firstLabel;
							} else {
								currentContent = `${firstLabel} +${count - 1}`
							}
						});
					default:
						break;
				}
				if (!currentContent) continue;
				advancedSearchTagList.push({
					label: currentContent,
					type,
					key,
				});
			}
			this.advancedSearchTagList = advancedSearchTagList;
		}
	},
}