export default {
	data() {
		return {
			modalFlag: false, // 控制iframe弹窗默认false
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
		softgenre() {
			const { softgenre } = this.userInfo;
			return softgenre + '';
		},
		isEdit() {
			// 直属店不能编辑
			return this.softgenre === "2";
		},
		classes() {
			return this.$eventBus.env.classes;
		},
		marques() {
			return this.$eventBus.env.marques;
		},
		depotList() {
			return this.$eventBus.env.depotList;
		},
		serviceItems() {
			return this.$eventBus.env.serviceItems;
		},
		serviceHighData() {
			return this.getServiceItem();
		},
		depotHighData() {
			return this.getDepotItem();
		},
		allShopList() {
			return this.$eventBus.env.shops.map(item => {
				const {
					osName,
					name
				} = item;
				item.osName = (osName && osName.trim()) || (name && name.trim()) || '门店名称未设置';
				return item;
			});
		},
		// mgjversion 1、盛传版本	2、风尚版	3、尊享版	4、青春版
		shopList() {
			const {
				shopIds
			} = this.userInfo;
			if (!shopIds) return [];
			const shopIdList = shopIds.split(',');
			return this.allShopList.filter(item => (shopIdList.indexOf(String(item.id)) !== -1) && item.softgenre !== "3");
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
		getWeekToDay(day) {
			let week = {
				"一": 1,
				"二": 2,
				"三": 3,
				"四": 4,
				"五": 5,
				"六": 6,
				"日": 7,
			}
			return week[day];
		},
		getDayToWeek(week) {
			let day = {
				1: '一',
				2: '二',
				3: "三",
				4: "四",
				5: "五",
				6: "六",
				7: "日",
			}
			return day[week];
		},
		// 获取项目大小类数据
		getServiceItem() {
			let arr = [];
			let classes = this.classes || [],
				serviceItems = this.serviceItems || []; 
			classes.forEach(v => {
				v.sub = [];
				serviceItems.forEach(r => {
					if (v.classid === r.classid) {
						v.sub.push({
							id: r.id,
							name: r.name,
							ruleType: 0,
							rule: ''
						});
					}
				});
				arr.push({
					id: v.id,
					name: v.name,
					ruleType: 0,
					rule: '',
					sub: v.sub
				});
			});
			return arr;
		},
		// 获取卖品大小类数据
		getDepotItem() {
			let arr = [];
			let marques = this.marques,
				depotList = this.depotList;
			marques.forEach(v => {
				v.sub = [];
				depotList.forEach(r => {
					if (v.marqueid === r.marqueid) {
						v.sub.push({
							id: r.id,
							name: r.name,
							ruleType: 0,
							rule: ''
						});
					}
				});
				arr.push({
					id: v.id,
					name: v.type,
					ruleType: 0,
					rule: '',
					sub: v.sub
				});
			});
			return arr;
		},
		// 获取高级数据
		getDepotHighData(depotJson) {
			let depotHighData = [];
			// 比对有规则的数据 卖品
			this.depotHighData.forEach(item1 => {
				if (depotJson.highData.length > 0) {
					depotJson.highData.forEach(item => {
						let depotSub = [];
						if (item1.sub.length > 0) {
							item1.sub.forEach(v1 => {
								let obj = v1;
								if (item.sub.length > 0) {
									item.sub.forEach(v => {
										if (v1.id === v.id) {
											obj = {
												id: v.id,
												name: v1.name,
												rule: v.rule,
												ruleType: v.ruleType
											};
										}
									});
								}
								depotSub.push(obj);
							});
						}
						if (item1.id === item.id) {
							depotHighData.push({
								id: item.id,
								name: item1.name,
								rule: item.rule,
								ruleType: item.ruleType,
								sub: depotSub
							})
						}
					});
				}
			});
			depotJson.highData = depotHighData;
			return depotJson;
		},
		// 获取高级数据
		getServiceHighData(serviceItemJson) {
			let serviceHighData = [];
			// 比对有规则的数据 项目
			this.serviceHighData.forEach(item1 => {
				if (serviceItemJson.highData.length > 0) {
					serviceItemJson.highData.forEach(item => {
						let serviceSub = [];
						if (item1.sub.length > 0) {
							item1.sub.forEach(v1 => {
								let obj = v1;
								if (item.sub.length > 0) {
									item.sub.forEach(v => {
										if (v1.id === v.id) {
											obj = {
												id: v.id,
												name: v1.name,
												rule: v.rule,
												ruleType: v.ruleType
											};
										}
									});
								}
								serviceSub.push(obj);
							});
						}
						if (item1.id === item.id) {
							serviceHighData.push({
								id: item.id,
								name: item1.name,
								rule: item.rule,
								ruleType: item.ruleType,
								sub: serviceSub
							})
						}
					});
				}
			});
			serviceItemJson.highData = serviceHighData;
			return serviceItemJson;
		},
		findShopById(id) {
			return id ? this.shopMaps[parseInt(id)] : undefined;
		},
		hovercUnique(arr) {
			let result = [], hash = {};
			for (let i = 0, elem; (elem = arr[i]) !== null; i++) {
				if (!hash[elem]) {
					result.push(elem);
					hash[elem] = true;
				}
			}
			return result;
		}
	}
}