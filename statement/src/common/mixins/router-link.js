export default {
	props: {
		to: [
			String,
			Object,
		],
		replace: Boolean,
		append: Boolean,
		tag: String,
		activeClass: String,
		exact: Boolean,
		events: [
			String,
			Array
		]
	},

	computed: {
		routerLinkProps() {
			return {
				to: this.to,
				replace: this.replace,
				append: this.append,
				tag: this.tag,
				activeClass: this.activeClass,
				exact: this.exact,
				events: this.events,
			};
		}
	}
};