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
			return this.$eventBus.env.shops || {};
		},
		softgenre() {
			const { softgenre } = this.userInfo;
			return softgenre;
		},
		isHeadquarters() {
			return this.softgenre === '0';
		}
	}
}