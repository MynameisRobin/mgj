<template>
	<div id="app">
		<keep-alive :exclude='exclude'>
			<component ref='keepAliveComponent' v-if="$route.meta.keepAlive" v-bind:is="currentView"></component>
		</keep-alive>
		<component v-if="!$route.meta.keepAlive" v-bind:is="currentView"></component>
	</div>
</template>
<script>
let needRefreshOnBack = false;
export default {
	watch: {
		'$route'(to, from) {
			this.$eventBus.$emit('router-change');
			if (needRefreshOnBack && to.meta.keepAlive) {
				needRefreshOnBack = false;
				this.refreshComponents = to.matched[to.matched.length - 1].components.default;
				this.handlePopstate();
				return;
			}
			if (this.$refs.keepAliveComponent && from.meta.keepAlive) {
				this.refreshComponents = from.matched[from.matched.length - 1].components.default
			} else {
				this.refreshComponents = null;
			}
		}
	},
	async created() {
		this.$eventBus.$on('global-message', this.handleGlobalMessage)
		window.addEventListener('popstate', this.handlePopstate);
	},
	beforeDestroy() {
		this.$eventBus.$off('global-message', this.handleGlobalMessage);
		window.removeEventListener('popstate', this.handlePopstate);
	},
	data() {
		return {
			currentView: 'router-view',
			exclude: '',
			lastComponents: null
		}
	},
	methods: {
		handlePopstate(e) {
			if (!this.refreshComponents) return;
			let name = this.refreshComponents.name;
			if (!name) console.error('keepalive 路由组件必须定义name', this.refreshComponents);
			this.exclude = name;
			this.$nextTick(() => {
				this.exclude = ''
			})
		},
		refresh() {
			let currentView = this.currentView;
			this.currentView = null;

			if (this.$refs.keepAliveComponent) {
				let opts = this.$refs.keepAliveComponent.$vnode.componentOptions
				let name = opts.Ctor.options.name || opts.tag;
				this.exclude = name;
			}
			this.$nextTick(() => {
				this.currentView = currentView;
				this.exclude = ''
			})
		},
		refreshOnBack() {
			needRefreshOnBack = true;
		},
		handleGlobalMessage(message) {
			if (typeof message === 'function') {
				message(this);
			} else if (message.action)
				message.action(this);
			else if (this[message.type])
				this[message.type](message)
		}
	}
}
</script>
<style lang="less">
	@import url('../css/global.less');
</style>
