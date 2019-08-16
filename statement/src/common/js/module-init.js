import utils from "./utils";
import EventBus from "./event-bus";
import filter from "../filters";
import Http from "./http";
import Router from "./router";
import App from '@/views/App'
// import '@/css/element-ui/index.css'
import 'element-ui/lib/theme-chalk/index.css';
import Element from 'element-ui'
import Components from './components'

let moduleInit = {};
moduleInit.install = async function (Vue, options) {

	Object.assign(moduleInit, options.moduleConfig)
	if (!moduleInit.moduleName)
		console.error('appconfig中必须配置moduleName')
	Vue.prototype.$module = Vue.module = module;
	Vue.prototype.$moduleOptions = Vue.moduleOptions = options;

	for (let name in filter) {
		Vue.filter(name, filter[name]);
	}
	Vue.use(Element, {size: 'small'});
	Vue.use(Components);
	Vue.use(EventBus, options);	
	Vue.use(utils, options);
	Vue.use(Http, options);
	window.handleError = true;
	Vue.config.productionTip = false;	
	let router = Router(Vue, options)
	
	let vueInst =  new Vue({
		el: '#app',
		router,
		template: '<app/>',
		components: { App }
	});
	return vueInst;
}
export default moduleInit;
