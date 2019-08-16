export default {
	computed: {
		userInfo() {
			return this.$eventBus.env.userInfo || {};
		},
		parentShopId() {
			const { parentShopId } = this.userInfo;
			return parentShopId;
		},
		shopId() {
			const { shopId } = this.userInfo;
			return shopId;
		},
		userId() {
			const { userId } = this.userInfo;
			return userId;
		},
		shops() {
			return this.shops;
		},
		emps() {
			return this.emps;
		},
		cardTypes() {
			return this.$eventBus.env.cardTypes || {};
		},
		isHeadquarters() {
			// return this.shopId === this.parentShopId
			const { softgenre } = this.userInfo;
			return softgenre;  // 0 总部 1单店 2直营 3附属
		}
	}
}