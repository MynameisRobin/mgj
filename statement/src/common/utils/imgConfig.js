import AppConfig from '@/config/app'
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
Math.uuid = function (len, radix) {
	var chars = CHARS,
		uuid = [],
		i;
	radix = radix || chars.length;

	if (len) {
		// Compact form
		for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
	} else {
		// rfc4122, version 4 form
		var r;

		// rfc4122 requires these characters
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		// Fill in random data.  At i==19 set the high bits of clock sequence as
		// per rfc4122, sec. 4.1.5
		for (i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}

	return uuid.join('');
};

const imgClass = {
	imgtype: {
		"tempQrCode": {
			"dir": "qrCode/%parentShopId%/",
			"size": [1024, 1024],
			"name": "uuid",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"poster": {
			"dir": "poster/%parentShopId%/",
			"size": [1080, 1920],
			"name": "uuid",
			"variations": [{
				"suffix": "l",
				"resolution": "1080x1920"
			}, {
				"suffix": "m",
				"resolution": "540x960"
			}, {
				"suffix": "s",
				"resolution": "270x480"
			}]
		},
		"plancontent": {
			"dir": "plancontent/%parentShopId%/",
			"size": [1920, 1080],
			"name": "uuid",
			"variations": [{
				"suffix": "l",
				"resolution": "1920x1080"
			}, {
				"suffix": "m",
				"resolution": "960x540"
			}, {
				"suffix": "s",
				"resolution": "480x270"
			}]
		},
		"mall": {
			"dir": "mall/%parentShopId%/",
			"size": [1024, 1024],
			"name": "uuid",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"cert": {
			"dir": "cert/%parentShopId%/",
			"size": [1024, 1024],
			"name": "uuid",
			"variations": []
		},
		"artisan": {
			"dir": "artisan/%parentShopId%/",
			"size": [1024, 1024],
			"name": "%employeeId%.jpg",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"manager": {
			"dir": "manager/%parentShopId%/",
			"size": [1024, 1024],
			"name": "%employeeId%.jpg",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"customer": {
			"dir": "customer/%parentShopId%/",
			"name": "%customerId%.jpg",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"customerFile": {
			"dir": "customerFile/%parentShopId%/",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"signature": {
			"dir": "signature/member/%parentShopId%/",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"signaturebill": {
			"dir": "signature/bill/%parentShopId%/%shopId%/",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"shop": {
			"dir": "shop/%parentShopId%/",
			"size": [1024, 1024],
			"name": "uuid",
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"show": {
			"dir": "show/s%catigoryId%/%parentShopId%/%authorId%/",
			// "size": [1024, 1024],
			"variations": [{
				"suffix": "l",
				"resolution": "1024x1024"
			}, {
				"suffix": "m",
				"resolution": "512x512"
			}, {
				"suffix": "s",
				"resolution": "256x256"
			}]
		},
		"tenantLogo": {
			"dir": "tenant/%parentShopId%/",
			"size": [256, 256],
			"name": "uuid",
			"variations": []
		},
		"mykHome": {
			"dir": "tenant/%parentShopId%/",
			"size": [640, 300],
			"name": "uuid",
			"variations": []
		},
		"mykMe": {
			"dir": "tenant/%parentShopId%/",
			"size": [640, 393],
			"name": "uuid",
			"variations": []
		},
		"mykMall": {
			"dir": "tenant/%parentShopId%/",
			"size": [640, 200],
			"name": "uuid",
			"variations": []
		},
		"mykCardFace": {
			"dir": "tenant/%parentShopId%/",
			"size": [640, 146],
			"name": "uuid",
			"variations": []
		},
		"mykLogin": {
			"dir": "mykLogin/%parentShopId%/",
			"size": [640, 200],
			"name": "uuid",
			"variations": []
		}
	},
	getOptionObj: function (type, itemData) {
		var opt = this.imgtype[type];
		if (opt) {
			var ret = Object.assign({
				"trim": true,
				"realName": "1.jpg"
			}, opt);
			ret.dir = this.replaceHtml(ret.dir, itemData);
			if (!/^[^%]*$/.test(ret.dir)) {
				// 参数不足则报错
				throw "参数不足!"
			}
			if (ret.name) {
				// 如果文件名指定
				ret.name = this.replaceHtml(ret.name, itemData);
				if (!/^[^%]*$/.test(ret.name)) {
					throw "参数不足!"
				}
				// 暂时兼容 待修改
				// if (ret.name == "uuid") {
				// 	ret.name = Math.uuid() + ".jpg";
				// }
			} else {
				// 如果文件名未指定
				ret.name = Math.uuid() + ".jpg";
			}
			return ret;
		} else {
			throw "错误的图片类型!"
		}
	},
	/**
	 * 根据实体获取实体的图片URL
	 * 
	 * @param {*} type 图片类型
	 * @param {*} itemData 实体数据
	 * @param {*} filename 实体的图片名
	 * @param {*} suffix 要获取的后缀
	 */
	getImageUrl(type, itemData, filename, suffix) {
		if (!filename) {
			throw "缺少文件名参数!";
		}
		var opt = this.imgtype[type];
		if (opt) {
			var ret = this.replaceHtml(opt.dir, itemData);
			if (!/^[^%]*$/.test(ret)) {
				// 参数不足则报错    
				throw "参数不足!"
			}
			return this.processType(ret + filename, suffix);
		} else {
			throw "错误的图片类型!";
		}
	},
	processType(filepath, type) {
		if (filepath && type) {
			var tempArr = filepath.split(".");
			if (tempArr.length >= 2) {
				tempArr[tempArr.length - 2] += ("_" + type);
				return tempArr.join(".");
			} else {
				return filepath + "_" + type;
			}
		} else {
			return filepath;
		}
	},
	replaceHtml(html, obj) {
		for (var variable in obj) {
			if (obj.hasOwnProperty(variable)) {
				html = html.replace("%" + variable + "%", obj[variable]);
			}
		}
		return html;
	}

}
export const getPicture = (type, opt) => {
	return AppConfig['IMAGE_URL'] + '/' + imgClass.getImageUrl(type, opt.itemData, opt.filename, opt.suffix) + '?ts=' + new Date().getTime()
}

export {
	imgClass
}