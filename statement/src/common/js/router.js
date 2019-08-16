import Router from "vue-router"
const merge = function () {
	return Array.prototype.concat.apply([], arguments);
};
function install(Vue, options) {
	let { moduleRoutes } = options;
	let routes = merge(moduleRoutes);
	Vue.use(Router);
	let router = new Router({
		routes,
		// mode: "history",
		// base: options.moduleConfig.moduleShortName,
		scrollBehavior(to, from, savedPosition) {
			if (savedPosition && from.matched[0] && !from.matched[0].meta.keepAlive) {
				return savedPosition
			} else {
				return { x: 0, y: 0 }
			}
		}
	});
	Vue.router = router;
	return router;
}
export default install;
