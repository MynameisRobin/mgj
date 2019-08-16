export default {
	computed: {
		userInfo() {
			return this.$eventBus.env.userInfo || {};
		},
		parentShopId() {
			const { parentShopId } = this.userInfo;
			return parseInt(parentShopId);
		},
		userPowerList() {
			const powerStr = this.userInfo.powerStr;
			return powerStr ? powerStr.split(',') : [];
		},
		userOperateList() {
			const operateStr = this.userInfo.operateStr;
			return operateStr ? operateStr.split(',') : [];
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
	}
}