import axios from "axios";
import { Message } from 'element-ui'
import Utils from '@/js/utils'
import AppConfig from '@/config/app'
import EventBus from '@/js/event-bus'
let axiosInst = axios.create({
	timeout: 60 * 3 * 1000,
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
});

// axiosInst.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

axiosInst.install = function (Vue, options) {
	var baseUrl = "";
	if (Utils.NODE_ENV !== "development") {
		baseUrl = AppConfig.REQUEST_URL ? AppConfig.REQUEST_URL : '';
	}
	baseUrl += AppConfig.REQUEST_URL_PREFIX;
	this.baseUrl = baseUrl;
	Vue.http = Vue.prototype.$http = this;
	this.interceptors.request.use(function (config) {
		if (!config.url) {
			console.log("services请求地址出错", this, config);
		}
		if (config.url.indexOf("http") !== 0) {
			const { data } = config;
			if (data) {
				config.data = `jsonObj=${JSON.stringify(data)}`;
				const { env } = EventBus;
				if (env && env.userInfo) {
					config.data = `${config.data}&shopid=${env.userInfo.shopId}`
				}
			}
			config.url = baseUrl + config.url;
		}
		return config;
	});
	this.interceptors.response.use(function (res) {
		let resData = res.data;
		const responseType = typeof resData;
		if ((responseType === 'string' && resData.indexOf('<!DOCTYPE html>') !== -1) || (resData.type === 'text/html')) {
			const { origin, pathname } = window.location;
			window.parent.location.href = `${origin}/shair/loginAction!logout.action?from=${pathname}`;
			return res;
		}
		const { code, message } = resData;
		if (code === undefined) return res;
		if (code !== 0 && res.config.url !== `/shair/paramSet!getNewPayConfig.action`) {
			Message.error(message);
		}
		return res;
	}, function (error) {
		Message.error('网络开小差，请稍后再试！');
	})
};

export default axiosInst;