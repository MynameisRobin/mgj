import Dayjs from 'dayjs'
import FindIndex from 'lodash.findindex'
import IsNumber from 'is-number'
import highQualityIcon from '#/assets/img/good.png'
const generateClassMapKey = (shopId, classid) => {
	return `${shopId}-${classid}`
}
export default {
	data() {
		return {
			highQualityIcon
		}
	},
	computed: {
		userInfo() {
			return this.$eventBus.env.userInfo || {};
		},
		parentShopId() {
			const { baseId, parentShopId } = this.userInfo;
			return baseId || parentShopId;
		},
		shopId() {
			const { shopId } = this.userInfo;
			return shopId;
		},
		userId() {
			const { userId } = this.userInfo;
			return userId;
		},
		allShopList() {
			return this.$eventBus.env.shops.map(item => {
				const {
					osName,
					name
				} = item;
				item.osName = osName.trim() || name.trim() || '门店名称未设置';
				return item;
			});
		},
		// 1、盛传版本	2、风尚版	3、尊享版	4、青春版
		shopList() {
			const {
				shopIds
			} = this.userInfo;
			if (!shopIds) return [];
			const shopIdList = shopIds.split(',');
			return this.allShopList.filter(item => (shopIdList.indexOf(String(item.id)) !== -1) && item.mgjversion === '3');
		},
		hasTenantShopList() {
			let result = this.shopList;
			const {
				softgenre,
				shopName,
				shopId
			} = this.userInfo;
			if (softgenre === '0') {
				result.unshift({
					id: parseInt(shopId),
					osName: shopName,
					softgenre,
					parentId: shopId,
					baseId: shopId
				})
			}
			return result;
		},
		allClassesMap() {
			let result = {};
			const { classes, mapClasses } = this.$eventBus.env;
			classes.forEach(item => {
				const {
					classid,
					name
				} = item;
				const key = generateClassMapKey(this.shopId, classid);
				result[key] = name;
			})
			mapClasses && Object.keys(mapClasses).forEach(shopId => {
				const shopClasses = mapClasses[shopId];
				shopClasses.forEach(item => {
					const {
						classid,
						name
					} = item;
					const key = generateClassMapKey(shopId, classid);
					result[key] = name;
				})
			})
			return result;
		},
		userPowerList() {
			const powerStr = this.userInfo.powerStr;
			return powerStr ? powerStr.split(',') : [];
		},
		userOperateList() {
			const operateStr = this.userInfo.operateStr;
			return operateStr ? operateStr.split(',') : [];
		},
		isAuxiliaryShop() {
			return this.userInfo.softgenre === '3';
		},
		hasDeletePower() {
			return this.userOperateList.indexOf('E') !== -1;
		},
		hasLockPower() {
			return this.userOperateList.indexOf('U1') !== -1;
		},
		hasHideMobilePower() {
			return this.userOperateList.indexOf('MGJP') !== -1;
		},
		hasSendPointPower() {
			return this.userOperateList.indexOf('a38') !== -1;
		},
		shopMaps() {
			let result = {};
			this.allShopList.forEach(shop => {
				const {
					id,
					osName
				} = shop;
				result[parseInt(id)] = shop;
			})
			const {
				softgenre,
				shopName,
				shopId
			} = this.userInfo;
			if (softgenre === '0') {
				const shopData = {
					id: parseInt(shopId),
					osName: shopName,
					softgenre,
					parentId: shopId,
					baseId: shopId
				}
				result[shopData.id] = shopData;
			}
			return result;
		}
	},
	methods: {
		mobileDecorator(mobile) {
			if (!mobile) return;
			let mobileStr = String(mobile);
			if (!this.hasHideMobilePower || mobileStr.length < 11) return mobile;
			return `${mobileStr.substring(0, 3)}****${mobileStr.substring(7)}`;
		},
		lastconsumetimeDecorator(time, dateFormat = 'YYYY-MM-DD') {
			if (!time) return '--';
			const lasttimeDate = Dayjs(time);
			const currentData = Dayjs();
			const currentMonth = currentData.month();
			const currentDay = currentData.date();
			if (lasttimeDate.year() === 1970) {
				return '--';
			}
			
			const lastTimeMonth = lasttimeDate.month();
			const lastTimeDay = lasttimeDate.date();
			const diffHours = currentData.diff(lasttimeDate, 'hours');
			const diffMinute = currentData.diff(lasttimeDate, 'minute');
			const diffDay = lastTimeMonth === currentMonth ? currentDay - lastTimeDay : (currentDay + lasttimeDate.daysInMonth()) - lastTimeDay;
			let diffContent = '刚刚';
			if (diffDay >= 3) {
				diffContent = lasttimeDate.format(dateFormat);
			} else if (diffDay >= 1) {
				diffContent = `${diffDay}天前`
			} else if (diffHours >= 1) {
				diffContent = `${diffHours}小时前`;
			} else if (diffMinute > 0) {
				diffContent = `${diffMinute}分钟前`;
			}
			return diffContent;
		},
		findShopById(id) {
			return (id || IsNumber(id)) ? this.shopMaps[parseInt(id)] : undefined;
		},
		findClassNameById(shopId, classid) {
			const shopData = this.findShopById(shopId);
			let name = classid;
			if (shopData) {
				const keyShopId = shopData.softgenre === '3' ? shopId : shopData.parentId;
				const key = generateClassMapKey(keyShopId, classid);
				name = this.allClassesMap[key];
			}
			return name;
		},
		convertItemClasses(classids, shopid) {
			if (!classids) return undefined;
			return classids.split(',').filter(item => item !== '').map(classid => {
				return this.findClassNameById(shopid, classid);
			});
		}
	}
}