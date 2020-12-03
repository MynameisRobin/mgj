/**
 * author 	Robin.Qiu
 * name 	util.js
 * params 	dom(css selector)
 * version 	1.0
 * date 	2018/11/05
 */

/* eslint-disable */
(function (w) {
	function qr(dom) {
		function _qr(dom) {
			this.ele = document.querySelector(dom);
		}
		_qr.prototype = {
			html: function (val) {
				if (!this.ele) {
					return false;
				}
				this.ele.innerHTML = val;
				return this;
			},
			data: function (key, val) {
				var self = this;
				if (!this.ele) {
					return false;
				}
				if (typeof key === 'string') {
					if (val) {
						this.ele.dataset[key] = val;
					} else {
						return this.ele.dataset[key];
					}
				} else if (typeof key === 'object') {
					for (var k in key) {
						self.ele.dataset[k] = key[k];
					}
				}
				return this;
			},
			attr: function (key, val) { //添加设置属性的方法
				if (!this.ele) {
					return false;
				}
				if (val === undefined) {
					this.ele.getAttribute(key);
				} else {
					this.ele.setAttribute(key, val);
				}
				return this;
			},
			css: function (prop, value) { //添加设置样式的方法
				if (!this.ele) {
					return false;
				}
				if (value === undefined) {
					if (typeof (prop) == 'object') {
						for (var key in prop) {
							this.ele.style[key] = prop[key];
						}
						return this;
					} else {
						var style = getComputedStyle(this.ele);
						return style[prop];
					}
				} else {
					this.ele.style[prop] = value;
					return this;
				}
			},
			show: function () {
				this.ele.style.display = "block";
				return this;
			},
			hide: function () {
				this.ele.style.display = "none";
				return this;
			},
			on: function (event, fun) {
				this.ele.addEventListener(event, fun, false);
				return this;
			}
		};
		return new _qr(dom);
	}

	// 是否为空
	qr.isNull = function (val) {
		if (val == null || val == undefined || val == "" || val == "NaN" || JSON.stringify(val) == "{}") {
			return true;
		}
		return false;
	}

	qr.isArrayLike = function (obj) {
		if (Object.prototype.toString.call(obj) == '[object Array]') {
			return true;
		}
		var length = 'length' in obj && obj.length;
		return typeof length === 'number' && length >= 0;
	}

	qr.each = function (object, callback) {
		var type = (function () {
			switch (object.constructor) {
				case Object:
					return 'Object';
					break;
				case Array:
					return 'Array';
					break;
				case NodeList:
					return 'NodeList';
					break;
				default:
					return 'null';
					break;
			}
		})();
		// 为数组或类数组时, 返回: index, value
		if (type === 'Array' || type === 'NodeList') {
			// 由于存在类数组NodeList, 所以不能直接调用every方法
			[].every.call(object, function (v, i) {
				return callback.call(v, i, v) === false ? false : true;
			});
		}
		// 为对象格式时,返回:key, value
		else if (type === 'Object') {
			for (var i in object) {
				if (callback.call(object[i], i, object[i]) === false) {
					break;
				}
			}
		}
	}

	//qr.format(v,"yyyy-MM-dd hh:mm")
	qr.format = function (d, fmt) {
		if (!fmt) fmt = 'yyyy-MM-dd'
		var date = new Date(d)
		if (date === 'Invalid Date') return ''
		var o = {
			'M+': date.getMonth() + 1,
			'd+': date.getDate(),
			'h+': date.getHours(),
			'm+': date.getMinutes(),
			's+': date.getSeconds(),
			'q+': Math.floor((date.getMonth() + 3) / 3),
			'S': date.getMilliseconds()
		}
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
		for (var k in o)
			if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
		return fmt;
	}

	qr.getCookie = function (c_name) {
		if (document.cookie.length > 0) {
			c_start = document.cookie.indexOf(c_name + "=")
			if (c_start != -1) {
				c_start = c_start + c_name.length + 1
				c_end = document.cookie.indexOf(";", c_start)
				if (c_end == -1) c_end = document.cookie.length
				return unescape(document.cookie.substring(c_start, c_end))
			}
		}
		return ""
	}

	// 按需加载
	qr.loadjs = function (url, callback) {
		var script = document.createElement('script');
		script.type = "text/javascript";
		if (typeof (callback) != "undefined") {
			if (script.readyState) {
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" || script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				}
			} else {
				script.onload = function () {
					callback();
				}
			}
		}
		script.src = url;
		document.head.appendChild(script);
	}

	// 重写JSON.parse防止报错
	JSON.parse = function (data) {
		try {
			JSON.parse(data);
		} catch (e) {
			console.log(e);
		}
	};

	// 深拷贝
	qr.clone = function (data) {
		try {
			return JSON.parse(JSON.stringify(data));
		} catch (e) {
			return data;
		}
	}
	w.$$ = w.qr = qr;
})(window);