export default {
	mounted() {
		this.$eventBus.$on('fastNavItemOpenAfter', (obj) => {
			this.$emit('showModelChange', 'Round');
			this.fastNavItemOpenAfterFun(obj);
		});
	},
	methods: {
		handleClick(obj) {
			this.$eventBus.$emit('fastNavItemOpen', obj);	
		},
		fastNavItemOpenAfterFun(obj) {
			const {
				name
			} = obj;
			try {
				let el = document.querySelector(`#${name}`);
				// console.log(`${name}`, el, el.clientTop, el.offsetTop, el.offsetParent, el.offsetParent.offsetTop, el.getBoundingClientRect());
				if (el.offsetParent.offsetTop < 200) {
					document.documentElement.scrollTop = 0;
				} else {
					document.documentElement.scrollTop = el.offsetParent.offsetTop + el.offsetTop - 270;
				}
				// this.$emit('showModelChange', 'Round');
			} catch (err) {
				console.log(err);
			}
		},
		enterFun(obj) {
			this.$emit('showModelChange', 'Round');
			this.$eventBus.$emit('fastNavItemOpen', obj);
		}
	}
}