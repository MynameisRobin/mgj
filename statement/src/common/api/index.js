import Axios from '@/js/http'
import request from 'axios'
import Cookie from 'js-cookie'
import EventBus from '@/js/event-bus'
const Api = {
	getMetaData() {
		return new Promise((resolve, reject) => {
			const uri = '/metedata!reservationMetadata.action';
			const key = 'reservationMetadata';
			let res = localStorage.getItem(key);
			if (res) {
				resolve({
					data: {
						code: 0,
						content: JSON.parse(res)
					}
				});
				return;
			}
			Axios.post(uri).then(res => {
				if (res.data.code === 0) {
					localStorage.setItem(key, JSON.stringify(res.data.content));
				}
				resolve(res);
			})
		})
		
	},
	searchCondition(postData) {
		const uri = '/member!searchCondition.action';
		postData.shops = postData.shops.map(shop => {
			shop.parentShopId = EventBus.env.userInfo.parentShopId;
			return shop;
		})
		const { shops } = postData;
		const shopIds = shops.map(shop => shop.shopId).join(',');
		const parentIds = shops.map(shop => shop.parentId).join(',');
		const token = Cookie.get('token');
		const Key = `${uri}-${parentIds}-${shopIds}-${token}`;
		return new Promise((resolve, reject) => {
			const resDataStr = sessionStorage.getItem(Key);
			if (resDataStr) {
				resolve({
					data: JSON.parse(resDataStr)
				})
				return;
			}
			Axios.post(uri, postData).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					try {
						sessionStorage.setItem(Key, JSON.stringify(resData));
					} catch (error) {
						console.error(error);
					}
				}
				resolve(res);
			})
		})
	},
	superOperationReportGetAreas(postData) {
		const uri = '/superOperationReport!getAreas.action';
		const token = Cookie.get('token');
		const Key = `${uri}-${JSON.stringify(postData)}-${token}`;
		return new Promise((resolve, reject) => {
			const resDataStr = sessionStorage.getItem(Key);
			if (resDataStr) {
				resolve({
					data: JSON.parse(resDataStr)
				})
				return;
			}
			Axios.post(uri, postData).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					sessionStorage.setItem(Key, JSON.stringify(resData));
				}
				resolve(res);
			})
		})
	},
	getShopEmpDataById({shopId, parentShopId}) {
		const uri = '/employee!listEmpAndServiceItemByShopid.action';
		const token = Cookie.get('token');
		const Key = `${uri}-${shopId}-${token}`;
		return new Promise((resolve, reject) => {
			const resDataStr = sessionStorage.getItem(Key);
			if (resDataStr) {
				resolve({
					data: JSON.parse(resDataStr)
				})
				return;
			}
			Axios.post(uri, {
				shopId,
				parentShopId
			}).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					sessionStorage.setItem(Key, JSON.stringify(resData));
				}
				resolve(res);
			})
		})
	},
	getCardtypeList({shopId}) {
		const uri = '/cardTypeSet!getCardtypeList.action';
		const token = Cookie.get('token');
		const Key = `${uri}-${shopId}-${token}`;
		return new Promise((resolve, reject) => {
			const resDataStr = sessionStorage.getItem(Key);
			if (resDataStr) {
				resolve({
					data: JSON.parse(resDataStr)
				})
				return;
			}
			Axios.post(`${uri}?shopId=${shopId}`).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					sessionStorage.setItem(Key, JSON.stringify(resData));
				}
				resolve(res);
			})
		});
	},
	uploadFileBase64(data) {
		const uri = '/FilesMgr/base64Upload';
		return new Promise((resolve, reject) => {
			request.post(uri, data).then(res => {
				resolve(res);
			})
		})
	}
}

export default Api;