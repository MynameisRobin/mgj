(function () {
	var lockConfig = function (opt) {
		this.$ = opt.$;
		this.time = '';	// 锁屏时间
		this.password = '';// 锁屏密码
		this.lockConfigKey = 'lockConfig' + am.metadata.userInfo.userId;
		this.lockList = [{
			name: '永不锁屏',
			value: ''
		}, {
			name: '1分钟',
			value: '1'
		}, {
			name: '5分钟',
			value: '5'
		}, {
			name: '10分钟',
			value: '10'
		}, {
			name: '20分钟',
			value: '20'
		}, {
			name: '30分钟',
			value: '30'
		}];
		this.init();
		this.render();
	};

	lockConfig.prototype = {
		init: function () {
			var self = this;
			// 设置锁屏密码
			this.$selectLockBtn = this.$.find('.selectLockBtn').vclick(function () {
				var $this = $(this);
				self.setTime($this);
			});

			// 设置密码
			this.$setPwdBtn = this.$.find(".setPwdBtn").vclick(function() {
				self.setPwd();
			});

			//清除密码
			this.$clearBtn = this.$.find(".clearBtn").vclick(function() {
				self.clearPwd();
			});

			//修改密码
			this.$editPwdBtn = this.$.find(".editPwdBtn").vclick(function() {
				self.editPwd();
			});
		},
		// 设置锁屏时间
		setTime: function($this) {
			var self = this;
			var config = am.metadata.configs && JSON.parse(am.metadata.configs[this.lockConfigKey]) || {};
			self.time = config.time || '';
			am.popupMenu("请选择锁屏时间", self.lockList, function (ret) {
				if (self.time === ret.value) {
					return false;
				}
				if (ret.value) {
					$this.find('.default').hide();
					$this.find('.normal').show();
					$this.find('.time').html(ret.name);
					self.time = ret.value;
				} else {
					$this.find('.default').show();
					$this.find('.normal').hide();
					self.time = '';
				}
				am.addNormalConfig({
					id: 9,
					key: self.lockConfigKey,
					value: {
						password: config.password,
						time: self.time
					}
				}, self.render);
			});
		},
		// 设置锁屏密码
		setPwd: function() {
			var self = this;
			var config = am.metadata.configs && JSON.parse(am.metadata.configs[this.lockConfigKey]) || {};
			am.keyboard.show({
				title: "请输入4位数锁屏密码", //可不传
				hidedot: true,
				ciphertext: true,
				submit: function (value) {
					if (am.isNull(value)) {
						am.msg("请输入正确的数字");
						return true;
					}
					if (value.length !== 4) {
						am.msg("请输入4位数密码");
						return true;
					}
					self.password = value;
					am.addNormalConfig({
						id: 9,
						key: self.lockConfigKey,
						value: {
							password: value,
							time: config.time
						}
					}, self.render);
				}
			});
		},
		// 清除密码
		clearPwd: function () {
			var self = this;
			var config = am.metadata.configs && JSON.parse(am.metadata.configs[this.lockConfigKey]) || {};
			am.confirm('清除密码', '确定要清除锁屏密码吗？', '确定', '取消', function() {
				am.addNormalConfig({
					id: 9,
					key: self.lockConfigKey,
					value: {
						password: '',
						time: config.time
					}
				}, self.render);
			},function(){});
		},
		// 修改密码
		editPwd: function() {
			var self = this;
			var config = am.metadata.configs && JSON.parse(am.metadata.configs[this.lockConfigKey]) || {};
			am.keyboard.show({
				title: "请输入旧密码",
				hidedot: true,
				ciphertext: true,
				submit: function (value) {
					if (am.isNull(value)) {
						am.msg("请输入正确的数字");
						return true;
					}
					if (value.length !== 4) {
						am.msg("请输入四位数密码");
						return true;
					}
					if (value != config.password) {
						am.msg("请输入正确的锁屏密码");
						return true;
					}
					self.setPwd();
					return true;
				}
			});
		},
		render: function () {
			am.lockScreen.operateTime();
			var config = am.metadata.configs && JSON.parse(am.metadata.configs['lockConfig' + am.metadata.userInfo.userId]) || {};
			// 如果没有设置过密码
			if (!config.password) {
				$("#page_about").find(".account").find('.clearBtn').hide();
				$("#page_about").find(".account").find('.editPwdBtn').hide();
				$("#page_about").find(".account").find('.setPwdBtn').show();
			} else {
				$("#page_about").find(".account").find('.clearBtn').show();
				$("#page_about").find(".account").find('.editPwdBtn').show();
				$("#page_about").find(".account").find('.setPwdBtn').hide();
			}

			// 如果没有设置过时间
			if (!config.time) {
				am.lockScreen.baseTime = '';
				$("#page_about").find(".account").find('.default').show();
				$("#page_about").find(".account").find('.normal').hide();
			} else {
				am.lockScreen.baseTime = config.time;
				$("#page_about").find(".account").find('.default').hide();
				$("#page_about").find(".account").find('.normal').show();
				$("#page_about").find(".account").find('.time').html(config.time + '分钟');
			}
		}
	}

	$.am.lockConfig = lockConfig;
})();