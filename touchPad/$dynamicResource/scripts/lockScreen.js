(function () {
	var self = am.lockScreen = {
		$: $("#lockScreen"),
		timer: null, // 定时器对象
		minute: 60, // 1m = 60s，这里测试使用自定义
		baseTime: '', // 存入分钟值，默认为空永不锁屏
		countTime: 0, // 计时
		password: '',
		init: function () {
			self.$content = self.$.find('.content'); 
			// 启动时间表
			self.showTime();
			// 开始点击
			this.$.vclick(function () {
				self.unlock();
			}).on("vclick", '.pwdBtn', function (e) {
				e.stopPropagation();
				self.forget();
			}).on("vclick", '.setPwdBtn', function (e) {
				e.stopPropagation();
				if ($.am.getActivePage().id === 'page_searchMember') {
					am.keyboard.hide();
					setTimeout(function(){
						self.setPwd();
					}, 300);
				} else {
					self.setPwd();
				}
			});

			$(function(){
				// 手势锁屏
				var x = 0, y = 0;
				var wid = -($(".am-app").outerWidth() * 0.2);
				$('.am-app').addClass("am-touchable").bind({
					"vtouchstart" : function(e, pos) {
						x = pos.x;
						y = pos.y;
					},
					"vtouchmove" : function(e, pos) {
						// console.log((pos.x - x),(pos.x - x) < wid);
					},
					"vtouchend" : function(e, pos) {
						if ((pos.x - x) < wid && (pos.y - y) <= 30) {
							if (!$('#lockScreen').is(':visible')) {
								if($(e.target).is('.cashierItems,.cashierItemScroll,.cashierTab,.cashierMain .body')){
									return false;
								}
								self.show();
							}
						}
						x = 0,y = 0;
					}
				});
			})
		},
		show: function () {
			if ($("#signname").is(":visible") || $('#pswp_dom').is(':visible')) {
				return false;
			}
			if ($.am.getActivePage().id === 'page_login') {
				return false;
			}
			self.$.show().animate({
				left: '0'
			}, 500);
			this.render();
			localStorage.setItem('lockScreenFlag_' + am.metadata.userInfo.userId, '1');
		},
		hide: function () {
			self.$.hide().animate({
				left: '100%'
			}, 500);
			// 重新计时
			self.operateTime();
			localStorage.removeItem('lockScreenFlag_' + am.metadata.userInfo.userId);
		},
		render: function () {
			if (!am.metadata) return false;
			// 是否设置过密码
			var config = am.metadata.configs && JSON.parse(am.metadata.configs['lockConfig' + am.metadata.userInfo.userId]) || {};
			self.password = config.password;
			if (!self.password) {
				self.$.find(".pwdBtn").hide();
				self.$.find(".setPwdBtn").show();
			} else {
				self.$.find(".setPwdBtn").hide();
				self.$.find(".pwdBtn").show();
				$("#page_about").find(".account").find('.clearBtn').show();
				$("#page_about").find(".account").find('.editPwdBtn').show();
				$("#page_about").find(".account").find('.setPwdBtn').hide();
			}
			var locLogo = localStorage.getItem('TP_logo');
			if(locLogo){
				this.$.find('.header-default').show();
				this.$.find('.defaulImg').html($('<img src="'+locLogo+'" />'));
			}else{
				this.$.find('.header-default').hide();
			}
		},
		// 解锁
		unlock: function () {
			var config = am.metadata.configs && JSON.parse(am.metadata.configs['lockConfig' + am.metadata.userInfo.userId]) || {};
			self.password = config.password;
			if (!self.password) {
				self.hide();
				return false;
			}
			am.keyboard.show({
				title: "请输入4位数锁屏密码", //可不传
				hidedot: true,
				ciphertext: true,
				zIndex: 1001,
				submit: function (value) {
					if (am.isNull(value)) {
						am.msg("请输入正确的数字");
						return true;
					}
					if (value.length !== 4) {
						am.msg("请输入4位数密码");
						return true;
					}
					if (value !== self.password) {
						am.msg("请输入正确的密码");
						return true;
					}
					// 避免数字键盘冲突
					if ($.am.getActivePage().id === 'page_searchMember' || $.am.getActivePage().id === 'page_prepay') {
						$.am.page.back();
					}
					self.hide();
				}
			});
		},
		// 设置密码
		setPwd: function (cb) {
			var config = am.metadata.configs && JSON.parse(am.metadata.configs['lockConfig' + am.metadata.userInfo.userId]) || {};
			am.keyboard.show({
				title: "请输入4位数锁屏密码", //可不传
				hidedot: true,
				ciphertext: true,
				zIndex: 1001,
				submit: function (value) {
					if (am.isNull(value)) {
						am.msg("请输入正确的数字");
						return true;
					}
					if (value.length !== 4) {
						am.msg("请输入4位数密码");
						return true;
					}
					am.addNormalConfig({
						id: 9,
						key: 'lockConfig' + am.metadata.userInfo.userId,
						value: {
							password: value,
							time: config.time
						}
					}, self.render);
				},
				cancel: function() {
					cb && cb();
				}
			});
		},
		// 忘记密码-回到登录
		forget: function () {
			$.am.changePage(am.page.login, "");
			localStorage.removeItem('userToken');
			localStorage.removeItem('lockScreenFlag_' + am.metadata.userInfo.userId);
			location.reload();
			return;
		},
		// 自助结算
		autopay: function (data) {
			if(!self.$.is(':visible')){
				return;
			}
			self.$content.find('.paying,.success,.default').hide();
			self.renderContent(data);
			// 支付结算中
			if (data.status == '1') {
				self.$content.find('.paying').show();
				// 头像
				self.$content.find(".payingImg").html(am.photoManager.createImage("customer", {
					parentShopId: am.metadata.userInfo.parentShopId,
					updateTs: data.lastphotoupdatetime || new Date().getTime()
				}, data.memId + ".jpg", "s", data.photopath || ''));
			}
			// 结算完成未结单
			else if (data.status == '2') {
				self.$content.find('.success').show();
				// 头像
				self.$content.find(".successImg").html(am.photoManager.createImage("customer", {
					parentShopId: am.metadata.userInfo.parentShopId,
					updateTs: data.lastphotoupdatetime || new Date().getTime()
				}, data.memId + ".jpg", "s", data.photopath || ''));
			} else {
				self.$content.find('.default').show();
			}
		},
		// 渲染项目卖品
		renderContent: function (data) {
			// 名称
			self.$.find(".memName").html(data.memName);
			// 优质客
			if (data.mgjIsHighQualityCust == 1) {
				self.$.find(".header").addClass('good');
			} else {
				self.$.find(".header").removeClass('good');
			}
			// 项目详情
			var detail = JSON.parse(data.data);
			var serviceItems = detail.serviceItems || [],
				productItems = []; //项目数据数组
			if (detail.products && detail.products.depots && detail.products.depots.length) {
				productItems = detail.products.depots;
			}

			//项目和卖品
			var arrItems = serviceItems.concat(productItems);
			var sumfee = 0;
			var itemNameStr = '项目：';
			var productNameStr = '卖品：';
			$.each(arrItems, function (i, itemin) {
				if (itemin.productid) {
					sumfee += itemin.salePrice * itemin.number;
					productNameStr += itemin.productName + '、';
				} else {
					sumfee += itemin.price || 0;
					itemNameStr += itemin.name + '、';
				}
			});
			var nameStr = '';
			if (itemNameStr === '项目：') {
				nameStr = productNameStr.substr(0, productNameStr.length - 1);
			}
			if (productNameStr === '卖品：') {
				nameStr = itemNameStr.substr(0, itemNameStr.length - 1);
			}
			if (itemNameStr !== '项目：' && productNameStr !== '卖品：') {
				nameStr = itemNameStr.substr(0, itemNameStr.length - 1) + '&nbsp;&nbsp;&nbsp;&nbsp;' + productNameStr.substr(0, productNameStr.length - 1);
			}
			self.$.find(".itemSpan").html(nameStr);
			self.$.find(".sum").html(sumfee);
		},
		// 时间表
		showTime: function () {
			var date = new Date().format("HH:MM");
			var $time = self.$.find('.timeBox');
			$time.html(date);
			setTimeout(self.showTime, 1000);
		},
		// 计算操作时间
		operateTime: function () {
			var config = am.metadata.configs && JSON.parse(am.metadata.configs['lockConfig' + am.metadata.userInfo.userId]) || {};
			var time = config.time;
			// 默认不设置锁屏自动切换为5分钟，否则没有人使用锁屏功能
			if (am.isNull(config)) {
				am.metadata.configs['lockConfig' + am.metadata.userInfo.userId] = '{"password":"","time":"5"}';
				time = 5;
			}
			if (!time) {
				console.log('没有设置锁屏时间');
				return false;
			}
			self.baseTime = time;
			// 开始计时
			if (self.timer) {
				self.countTime = 0;
				clearInterval(self.timer);
				self.timer = null;
			}
			self.timer = setInterval(function () {
				if ($.am.getActivePage().id === 'page_login') {
					self.countTime = 0;
					clearInterval(self.timer);
					return false;
				}
				self.countTime++;
				// console.log(self.countTime + 's', '锁屏时间为:' + self.baseTime * self.minute + '秒')
				if (self.countTime === self.baseTime * self.minute) {
					self.show();
					self.countTime = 0;
					clearInterval(self.timer);
					console.log("锁屏")
				} else if (self.countTime > self.baseTime * self.minute) {
					self.countTime = 0; 
					console.log("切换永不锁屏")
				}
			}, 1000);

			//监听键盘
			$(document).keyup(function () {
				self.countTime = 0;
			});

			//监听鼠标
			var x, y;
			document.onmousemove = function (event) {
				var x1 = event.clientX;
				var y1 = event.clientY;
				if (x != x1 || y != y1) {
					self.countTime = 0;
				}
				x = x1;
				y = y1;
			};
		},
		reset: function(){
			self.$content.find('.success').hide();
			self.$content.find('.default').show();
		}
	};
	self.init();
	// self.show();
})();