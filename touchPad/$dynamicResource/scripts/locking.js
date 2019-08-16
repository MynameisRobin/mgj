(function () {
	var self = am.locking = {
		$: $("#locking"),
		init: function () {
			// 启动时间表
			self.showTime();
			// 开始点击
			this.$.vclick(function () {
				self.hide();
			}).on("vclick", '.pwdBtn', function (e) {
				e.stopPropagation();
				self.forget();
			});
		},
		show: function () {
			self.$.slideDown(300);
		},
		hide: function () {
			self.$.slideUp(300);
		},
		reset: function () {},
		unlock: function () {
			am.keyboard.show({
				title: "请输入数字", //可不传
				hidedot: false,
				submit: function (value) {
					if (am.isNull(value)) {
						return am.msg("请输入正确的数字");
					}
					self.hide();
				}
			});
		},
		// 忘记密码
		forget: function () {
			var passwd = am.metadata.passwd;
			if(passwd){
				am.confirm("忘记密码?","密码将通过短信方式发送至顾客手机","发送","返回",function(){
					self.getCode(self.opt.phone,passwd);
				});
			}else{
				self.hide();
			}
		},
		getCode: function (passwd) { //发送短信获取密码
			var self = this;
			am.loading.show("正在获取,请稍候...");
			var opt = {
				phone: am.metadata.userInfo.mobile,
				shopId: am.metadata.userInfo.shopId,
				content: "尊敬的顾客您的密码是：" + passwd
			};
			am.api.sendMemPwd.exec(opt, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					am.msg("短信发送成功");
				} else {
					am.msg(res.message || "哎呀出错啦");
				}
			});
		},
		// 自助结算
		autopay: function () {},
		// 时间表
		showTime: function () {
			var date = new Date().format("HH:MM");
			var $time = self.$.find('.timeBox');
			$time.html(date);
			setTimeout(self.showTime, 1000);
		}

	};
	self.init();
})();