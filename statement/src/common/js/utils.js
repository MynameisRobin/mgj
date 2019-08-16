import eventBus from "./event-bus";
let utils = {
	refresh() {
		eventBus.$emit("global-message", { type: "refresh" });
	},
	renderFileAsDataURL(file) {
		return new Promise((resolve, reject) => {
			if (typeof FileReader === 'function') {
				const reader = new FileReader();
				reader.onload = (event) => {
					resolve(event.target.result);
				};
				reader.readAsDataURL(file);
			} else {
				reject('FileReader is not function');
			}
		})
	},
	realLength(str) {
		return str.replace(/[^\x00-\xff]/g, "**").length; 
	},
};

utils.install = function (Vue, options) {
	let { moduleConfig } = options;
	utils.NODE_ENV = moduleConfig.NODE_ENV;
	utils.moduleConfig = moduleConfig;
	Vue.prototype.$utils = Vue.utils = utils;
};
export default utils;
