(function() {
	var self = am.page.login = new $.am.Page({
		id : "page_login",
		backButtonOnclick : function() {

		},
		init : function() {
			this.$code = this.$.find('.code');
			this.timer = null;

			this.$.on("vclick",".title_words,.title_icon",function(){
				var $box=self.$.find(".formbox");
				if($box.hasClass('changeLogin')){

					self.changeLogin(false);
				}else{

					self.changeLogin(true);
				}
			})
			this.$username = this.$.find("#page-login-username");
            this.$password = this.$.find("#page-login-password").keyup(function(e) {
                if (e.keyCode == 13) {
                    self.$loginBtn.trigger("vclick");
                }
            });
            //初始化增加填数据
            var user=localStorage.getItem("user");
            if(user){
            	var userData=JSON.parse(user);
            	this.$username.val(userData.userName);
            	// this.$password.val(userData.password);
            }
			this.$loginBtn = this.$.find(".btnOk").vclick(function() {
			    var login = function() {
			        var userName = self.$username.val();
			        var pwd = self.$password.val();

			        if (!userName || !pwd) {
			            am.msg("请输入正确的登录信息!");
			            return;
			        }
			        // if (!$.trim(pwd)) {
			        //     am.msg("请输入密码!");
			        //     return;
			        // }

			        self.login(userName, pwd);
			    };
			    if (navigator.appplugin && navigator.appplugin.hideIme) {
			        navigator.appplugin.hideIme();
			        setTimeout(login, 500);
			    } else {
			        login();
			    }
			});

			this.shopStatus.init();
		},
		changeLogin:function(flag){
			var _this = this;
			var title_words=this.$.find(".title_words");
			var title_icon=this.$.find(".title_icon");
			var $box=self.$.find(".formbox");
			if(flag){
				title_words.text("点击此处帐号登录");
				title_icon.removeClass("codeIcon");
				$box.addClass('changeLogin');

				_this.timer = setInterval(function(){
					var _ajax = am.api.query.exec({
		                codeId : _this._uuid
		            }, function(ret) {
		                if(ret.code == 0 && ret.content){
		                	//登录成功
							if(self.checkStatus(ret.content)){
								return;
							}
		                	clearInterval(_this.timer);
		                	_ajax.abort();
		                	_this.showQrcode();
							am.clearUserData(ret.content.parentShopId,ret.content.userId);
		                    localStorage.setItem("userToken",JSON.stringify(ret.content));
		                    am.getmetadata(ret.content);
		                }else if(ret.code == 1021030){
							//正常轮询
						}else{
							am.msg(ret.message || '登录失败！');
						}
		            });
				},5000);
			}else{
				title_words.text("点击此处扫码登录");
				title_icon.addClass("codeIcon");
				$box.removeClass('changeLogin');

				clearInterval(_this.timer);
			}
		},
		showQrcode: function(){
			this._uuid = Math.uuid();
			var _src = am.getQRCode(JSON.stringify({
				_uuid: this._uuid,
				type : "login"
			}),180,180);
			this.$code.html('<img src="'+ _src +'" />');
		},
		beforeShow : function(paras) {
			am.tab.main.hide();
			this.$password.val("");
			this.changeLogin(true);
			this.showQrcode();

			var locLogo = localStorage.getItem('TP_logo');
			if(locLogo){
				this.$.find('.logo').html($('<img src="'+locLogo+'" />').load(function(){
					$(this).show();
				}).error(function(){
					self.$.find('.logo').addClass('mgj');
				}));
			}else{
				this.$.find('.logo').addClass('mgj');
			}
			am.cashierTab.visible(0);

			am.stopBTScanner();
		},
		afterShow : function(paras) {
			$("body").addClass("loginBg");
			var token = this.GetQueryString('token');
			if(token){
				console.log(token);
				am.loading.show("正在登录,请稍候...");
	            am.api.login.exec({
	                "token": token
	            }, function(loginres) {
	                am.loading.hide();
	                if (loginres.code == 0 && loginres.content) {
						am.clearUserData(loginres.content.parentShopId,loginres.content.userId);

						if(self.checkStatus(loginres.content)){
							return;
						}

	                    //登录成功
	                    console.log(loginres);
	                    localStorage.setItem("userToken",JSON.stringify(loginres.content));
	                    localStorage.setItem("user",JSON.stringify({"userName": loginres.content.userName}));
	                    am.getmetadata(loginres.content);
	                    location.hash = '';
	                }else {
	                    //登录失败
	                    am.msg(loginres.message || "数据获取失败,请检查网络!");
	                }
	            });
			}
		},
		beforeHide : function(paras) {
			$("body").removeClass("loginBg");
		},
		afterHide:function () {
			var params = JSON.parse(JSON.stringify(am.metadata.configs));
			//console.log(config);
			am.mediaShow(0,params);
			am.cashierTab.visible(1);
		},
		GetQueryString:function (name) {
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     		var r = window.location.hash.substr(1).match(reg);
     		if(r!=null)return  unescape(r[2]); return null;
		},
		checkStatus:function(userinfo){
			if(userinfo.shopStatus == 1){
				//状态正常
				if(userinfo.comFee && userinfo.comFee.fee_list){
					var dom = '';
					var header = '<li><div>ID</div><div>产品名称</div><div>消费金额</div><div>消费时间</div><div>是否付款</div></li>';
					var body = '';
					var tpl = '<li><div>{{id}}</div><div>{{productname}}</div><div>{{consumefee}}</div><div>{{consumetime}}</div><div>{{payFlag}}</div></li>';
					if(userinfo.comFee.fee_list.length){
						for(var i=0;i<userinfo.comFee.fee_list.length;i++){
							var item = userinfo.comFee.fee_list[i];
							body += tpl
							.replace('{{id}}',item.id)
							.replace('{{productname}}',item.productname)
							.replace('{{consumefee}}',item.consumefee+'元')
							.replace('{{consumetime}}',item.consumetime.substring(0,16))
							.replace('{{payFlag}}',item.payFlag?'已付款':'未付款');
						}
					}
					dom = '<ul>'+ header + body+'</ul>';
					if(userinfo.comFee.days<=1){
						this.shopStatus.show({
							title:"欠款提醒",
							content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您有欠款记录，欠款清单如下表，请及时清缴。"+dom+'<p>总计费用：<span class=\"highlight\">'+userinfo.comFee.sumfee+'</span>元</p>',
							btn:true,
							comFee: 1,
						});
					}else {
						this.shopStatus.show({
							title:"欠款提醒",
							content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您有超过<span class=\"highlight\">"+ userinfo.comFee.days+"</span>天的欠款记录，欠款清单如下表，请及时清缴。"+dom+'<p>总计费用：<span class=\"highlight\">'+userinfo.comFee.sumfee+'</span>元</p>',
							btn:false,
							comFee: 1,
						});
						return 1;
					}
				}
				else if(userinfo.invaliddate){
					//有到期时间
					var out = userinfo.invaliddate - new Date().getTime();
					if(out < -2*24*3600*1000){
						//超过24小时
						this.shopStatus.show({
							title:"到期提醒",
							content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您的系统到期日期是：<span class=\"highlight\">"+new Date(userinfo.invaliddate).format('yyyy年mm月dd日')+"，目前已超过使用期限</span>，请尽快联系本公司相关人员续费！",
							btn:false
						});
						return 1;
					}else if(out<10*24*3600*1000){
						this.shopStatus.show({
							title:"到期提醒",
							content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您的系统到期日期是：<span class=\"highlight\">"+new Date(userinfo.invaliddate).format('yyyy年mm月dd日')+"，目前还可以正常使用</span>，请尽快联系本公司相关人员续费！",
							btn:true
						});
					}
				}else{
					//没有到期时间
					var t =(new Date().getTime() - userinfo.inputDate);
					var r = 15 - Math.ceil(t/24*3600*1000);
					if(r<0) r=0;

					if(t > 16*24*3600*1000){
						this.shopStatus.show({
							title:"签约提醒",
							content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您的系统尚未付费，目前还可以正常使用"+r+"天，请尽快联系本公司相关人员缴费。",
							btn:true
						});
						return 1;
					}else if(t > 10*24*3600*1000){
						this.shopStatus.show({
							title:"签约提醒",
							content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您的系统尚未付费，目前还可以正常使用"+r+"天，请尽快联系本公司相关人员缴费。",
							btn:true
						});
					}
				}
			}else{
				//状态不为1，不能用
				this.shopStatus.show({
					title:"系统提示",
					content:"尊敬的小掌柜用户（"+userinfo.osName+"<"+userinfo.shopId+">），您好！您的系统已关闭，目前无法使用，请尽快联系本公司相关人员缴费。",
					btn:true
				});
				return 1;
			}
		},
		shopStatus:{
			init:function(){
				var _this=this;
				this.$ = $("#shopStatus");
				this.$btn = this.$.find('div.noted').vclick(function(){
					_this.$.hide();
				});
				this.$title = this.$.find('.title');
				this.$content = this.$.find('.content');
			},
			show:function(opt){
				this.$.show();
				this.$title.html(opt.title);
				this.$content.html(opt.content);
				if(opt.btn){
					this.$btn.show();
				}else{
					this.$btn.hide();
				}
				if(opt.comFee){
					this.$.addClass('comFee');
				}else {
					this.$.removeClass('comFee');
				}
			}
		},
		login: function(userName, pwd) {
            var self = this;
            am.loading.show("正在登录,请稍候...");
            am.api.login.exec({
                "userName": userName,
                "password": pwd,
            }, function(loginres) {
                am.loading.hide();
                if (loginres.code == 0 && loginres.content) {
					am.clearUserData(loginres.content.parentShopId,loginres.content.userId);

					if(self.checkStatus(loginres.content)){
						return;
					}
                    //登录成功
                    localStorage.setItem("userToken",JSON.stringify(loginres.content));
                    localStorage.setItem("user",JSON.stringify({"userName": userName}));
					am.getmetadata(loginres.content);
					// self.getWorkTip(loginres.content.userId);
                }else {
                    //登录失败
                    am.msg(loginres.message || "数据获取失败,请检查网络!");
                }
            });
		},
		getLoginNum: function(sum) {
			var loginNum = am.isNull(localStorage.loginNum) ? "" : localStorage.loginNum;
			var myDate = new Date();
			var date = new Date(localStorage.date - 0).getTime() + 86400000;
			var tomorrow = new Date().getTime();
			if (am.isNull(localStorage.date)) {
				localStorage.date = new Date().getTime();
				localStorage.loginNum = 0;
			}
			if(date < tomorrow){
				localStorage.loginNum = 1;
				localStorage.date = date;
			}else{
				if (loginNum == 3) {
					return;
				}
				localStorage.loginNum++;
			}
			setTimeout(function(){
				am.confirm("工单提醒", "您有" + sum + "个工单目前仍未结单或点评，现在去支持中心么？", "好的", "关闭", function() {
					$("canvas").hide();
					$.am.changePage(am.page.workOrder, "slideup", "");
				});
			},500);
        },
        getWorkTip: function(userId) {
            var self = this;
            am.loading.show("正在获取,请稍候...");
            var opt = { submiterId: userId };
            am.api.workTip.exec(opt, function(res) {
                am.loading.hide();
                if (res.code == 0 && res.content) {
                    var len = res.content.length;
                    if (len > 0) {
                        self.getLoginNum(len);
                    }
                }
            });
		},
	});
})();
