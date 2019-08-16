/* eslint-disable */

const Com = {
	tabType(data) {
		const { list, val } = data;
		let obj = null;
		list.forEach(k=> {
			if(val == k.name) {
				obj = k.type; 
			}
		});
		return obj;
	},

	idStringToArr(str) {
		str = str.substr(0, str.length-1);
		str = str.substr(1, str.length-1);
		str = str.split(',');
		return str;
	},

	forLevelids(data) {
		//员工等级
		let dutyname = null;
		data.levelList.forEach(k=> {
			if(k.dutyId == data.userLevel) {
				dutyname = k.name;
			}
		})
		return dutyname;
	},

	payTypesFun(data) {
		//支付方式转换
		let obj = {};
		data.list.forEach(k=> {
			obj = k;
		});
		return obj;
	}
}
export default Com;