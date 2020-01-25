(function() {
	var self = am.page.login = new $.am.Page({
		id : "page_login",
		backButtonOnclick : function() {

		},
		init : function() {
			this.$code = this.$.find('.code');
			this.timer = null;
			$(".auth_box").on("vclick",".close_btn",function(){
				$(".auth_box").hide();
			})
			this.$.on("vclick",".title_words,.title_icon",function(){
				var $box=self.$.find(".formbox");
				if($box.hasClass('changeLogin')){

					self.changeLogin(false);
				}else{

					self.changeLogin(true);
				}
			})
			this.$username = this.$.find("#page-login-username").blur(function(){
				self.setVcCode();
				self.$loginBtn.removeClass('am-disabled').text('登录');
				self.lockLoginTimer && clearInterval(self.lockLoginTimer);
			});
            this.$password = this.$.find("#page-login-password").keyup(function(e) {
                if (e.keyCode == 13) {
                    self.$loginBtn.trigger("vclick");
                }
			});
			this.$vcCodeWrap = this.$.find('.vcCodeWrap');
			this.$vcCode = this.$.find('#page-login-vcCode').keyup(function(e) {
                if (e.keyCode == 13) {
                    self.$loginBtn.trigger("vclick");
                }
			});
			this.$vcCodeImg = this.$.find('.vcCodeImg').vclick(function(){
				self.setVcCode();
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
					var code = self.$vcCode.val();
			        if (!userName || !pwd) {
			            am.msg("请输入正确的登录信息!");
			            return;
					}
					if(self.$vcCodeWrap.is(':visible') && !code){
						am.msg("请输入正确的验证码!");
			            return;
					}
			        // if (!$.trim(pwd)) {
			        //     am.msg("请输入密码!");
			        //     return;
			        // }
					if(!self.checkServer.hasChecked){
						self.checkServer.userName = userName;
						self.checkServer.check(function(){
							self.login(userName, pwd, code);
						});
					}else {
						self.login(userName, pwd, code);
					}
			    };
			    if (navigator.appplugin && navigator.appplugin.hideIme) {
			        navigator.appplugin.hideIme();
			        setTimeout(login, 500);
			    } else {
			        login();
			    }
			});

			this.shopStatus.init();
			
			if(/Windows/i.test(navigator.userAgent)) {
				try {
					console.log(wPlugin && location.href.indexOf("file:") != -1)
				}
				catch(err) {
					$('#downApp').show();
					console.log(err)
				}
			}
			
			if(localStorage.MGJ_LOGID) {
				$('#mgjLogIdNum').text(localStorage.MGJ_LOGID)
			}

			this.checkServer.init();
			
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

				// _this.timer = setInterval(function(){
				// 	if(am&&am.api){
				// 		var _ajax = am.api.query.exec({
				// 			codeId : _this._uuid
				// 		}, function(ret) {
				// 			if(ret.code == 0 && ret.content){
				// 				//登录成功
				// 				if(self.checkStatus(ret.content)){
				// 					return;
				// 				}
				// 				clearInterval(_this.timer);
				// 				_ajax.abort();
				// 				_this.showQrcode();
				// 				am.clearUserData(ret.content.parentShopId,ret.content.userId);
				// 				localStorage.setItem("userToken",JSON.stringify(ret.content));
				// 				am.getmetadata(ret.content);
				// 			}else if(ret.code == 1021030){
				// 				//正常轮询
				// 			}else{
				// 				am.msg(ret.message || '登录失败！');
				// 			}
				// 		});
				// 	}
				// },5000);
			}else{
				title_words.text("点击此处扫码登录");
				title_icon.addClass("codeIcon");
				$box.removeClass('changeLogin');

				// clearInterval(_this.timer);
			}
		},
		showQrcode: function(){
			this._uuid = Math.uuid();
			// this._uuid = '4C5197B8-5A6A-43A4-9183-6B6819919288';
			var _src = am.getQRCode(JSON.stringify({
				_uuid: this._uuid,
				type : "login"
			}),180,180);
			this.$code.html('<img src="'+ _src +'" />');
		},
		beforeShow : function(paras) {
			// 到了登录就隐藏锁屏
			if ($("#lockScreen")) {
				$("#lockScreen").hide();
			}

			// 登录不锁屏加个标识
			am.lockScreenFlag = true;

			am.tab.main.hide();
			this.$password.val("");
			// this.changeLogin(true);
			this.showQrcode();
			this.socketPush.login();

			var locLogo = localStorage.getItem('TP_logo');
			if(locLogo){
				this.$.find('.logo').html($('<img src="'+locLogo+'" />').load(function(){
					$(this).show();
				}).error(function(){
					// self.$.find('.logo').addClass('mgj');
				}));
			}else{
				// this.$.find('.logo').addClass('mgj');
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
						localStorage.setItem("user",JSON.stringify({"userName": loginres.content.trueUserName}));
						localStorage.removeItem('errorInfo'+loginres.content.trueUserName);
						am.getmetadata(loginres.content);
						self.checkServer.changeShopName(loginres.content.shopName);
	                    location.hash = '';
	                }else {
	                    //登录失败
	                    am.msg(loginres.message || "数据获取失败,请检查网络!");
	                }
	            });
			}

			var queryUserName = this.GetQueryString2('userName');
			var queryClusterName = this.GetQueryString2('cluster');
			var queryShopName = this.GetQueryString2('shopName');
			var queryExistence = this.GetQueryString2('existence');
			var queryUrl = this.GetQueryString2('url');
			if(queryUserName){
				this.$username.val(queryUserName);
			}
			if(queryClusterName){
				this.checkServer.setCluster({
					cluster: queryClusterName,
					shopName: queryShopName,
					existence: queryExistence,
					url: queryUrl
				});
				location.hash = '';
			}

			var cluster = localStorage.getItem('CLUSTER')?JSON.parse(localStorage.getItem('CLUSTER')):'';
			if(cluster){
				this.checkServer.$clusterName.text(cluster.cluster);
				this.checkServer.$clusterShopName.text(cluster.shopName);
				this.checkServer.changeStatus(5);
				this.checkServer.handleCluster(cluster);
				this.checkServer.hasChecked = true;
			}
		},
		beforeHide : function(paras) {
			$("body").removeClass("loginBg");
		},
		afterHide:function () {
			var params = JSON.parse(JSON.stringify(am.metadata && am.metadata.configs));
			//console.log(config);
			am.mediaShow(0,params);
			am.cashierTab.visible(1);
			this.socketPush.logout();
		},
		GetQueryString:function (name) {
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     		var r = window.location.hash.substr(1).match(reg);
     		if(r!=null)return  unescape(r[2]); return null;
		},
		GetQueryString2:function (name) {
			var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     		var r = window.location.hash.substr(1).match(reg);
     		if(r!=null)return  decodeURI(r[2]); return null;
		},
		checkStatus:function(userinfo){
			if(userinfo.shopStatus == 1){
				//状态正常
				if(userinfo.comFee && userinfo.comFee.fee_list){
					var dom = '';
					var header = '<li><div>ID</div><div>产品名称</div><div>消费金额</div><div>消费时间</div><div>商户名称</div><div>是否付款</div></li>';
					var body = '';
                    var tpl = '<li><div>{{id}}</div><div>{{productname}}</div><div>{{consumefee}}</div><div>{{consumetime}}</div><div>{{shopname}}</div><div>{{payFlag}}</div></li>';
                    var onlyXcxFee = true
					if(userinfo.comFee.fee_list.length){
						for(var i=0;i<userinfo.comFee.fee_list.length;i++){
                            var item = userinfo.comFee.fee_list[i];

                            // 判断是否仅有小程序欠费，仅小程序欠费时要显示关闭按钮
                            if ('22' != item.productno && '23' != item.productno) {
                                onlyXcxFee = false
                            }

							body += tpl
							.replace('{{id}}',item.id)
							.replace('{{productname}}',item.productname)
							.replace('{{consumefee}}',item.consumefee+'元')
							.replace('{{consumetime}}',item.consumetime.substring(0,16))
							.replace('{{shopname}}',item.shopname)
							.replace('{{payFlag}}',item.payFlag?'已付款':'未付款');
						}
					}
					dom = '<ul>'+ header + body+'</ul>';
					if(userinfo.comFee.days<=1 || onlyXcxFee){
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
		login: function(userName, pwd, code, checkEasyPwd) {
            var self = this;
			am.loading.show("正在登录,请稍候...");
			var loginSign = localStorage.getItem("loginToken_"+userName) || localStorage.getItem("loginToken");
			if(am&&am.api){
				am.api.login.exec({
					"userName": userName,
					"password": pwd,
					"mgjtpsingletoken":loginSign,
					"checkEasyPwd": checkEasyPwd,
					"code": code
				}, function(loginres) {
					console.log("登录回调数据",loginres);
					am.loading.hide();
					if (loginres.code == 0 && loginres.content) {
						localStorage.setItem("loginToken_"+userName,loginres.content.mgjtpsingletoken);
						am.clearUserData(loginres.content.parentShopId,loginres.content.userId);
						
						if(self.checkStatus(loginres.content)){
							return;
						}
						//登录成功
						localStorage.setItem("userToken",JSON.stringify(loginres.content));
						localStorage.setItem("user",JSON.stringify({"userName": userName}));
						localStorage.removeItem('errorInfo'+userName);
						am.getmetadata(loginres.content);
						self.checkServer.changeShopName(loginres.content.shopName);
					}else if(loginres.code == 20190306){
						am.msg('验证码校验失败');
						self.setVcCode(1);
					}else if(loginres.code == 200013){
						$(".auth_box").show();
						var query="from=pad&shopId="+loginres.content.shopId+"&mobile="+loginres.content.mobile+"&userId="+loginres.content.userId+"&pwd="+encodeURIComponent(pwd)+"&pwFlag="+loginres.content.pwFlag;
						var iframeUrl=window.config.gateway+"mgj-auth/index.jsp?"+query
						$('.auth_box iframe').attr('src',iframeUrl);
						console.log(iframeUrl)
					}else if(loginres.code == 200014){
						loginres.content.userName = userName;
						loginres.content.pwd = pwd;
						loginres.content.code = code;
						self.modifyPasswordTip.show(loginres);
					}else if(loginres.code == 200003){
						if(!loginres.content){
							am.msg('用户名或密码错误，请重新输入！');
							return;
						}
						localStorage.setItem('errorInfo'+userName,JSON.stringify(loginres.content));
						if(loginres.content.failedLoginTimes==1){
							am.msg('用户名或密码错误，请重新输入！');
						}else if(loginres.content.failedLoginTimes>=2 && loginres.content.failedLoginTimes<=4){
							atMobile.nativeUIWidget.confirm({
								caption: '用户名或密码错误',
								description: '用户名或密码错误第'+loginres.content.failedLoginTimes+'次，连续5次输入错误账号将被锁定，请重新输入！',
								okCaption: '确定',
								cancelCaption: '取消'
							}, function(){
								
							}, function(){
								
							});
						}else if(loginres.content.failedLoginTimes>=5){
							var diff = self.getLockTs(loginres.content.lastLoginTime,loginres.content.failedLoginTimes,loginres.content.nowTime);
							var timeStr = self.getLockStr(loginres.content.failedLoginTimes);
							atMobile.nativeUIWidget.confirm({
								caption: '用户名或密码错误',
								description: '用户名或密码错误过于频繁，您的账号被锁定'+timeStr+'！',
								okCaption: '确定',
								cancelCaption: '取消'
							}, function(){
								
							}, function(){
								
							});
							self.setLoginStatus(userName);
						}
						self.setVcCode();
					}else if(loginres.code == 200015){
						localStorage.setItem('errorInfo'+userName,JSON.stringify(loginres.content));
						var diff = self.getLockTs(loginres.content.lastLoginTime,loginres.content.failedLoginTimes,loginres.content.nowTime);
						var timeStr = self.getLockStr(loginres.content.failedLoginTimes);
						atMobile.nativeUIWidget.confirm({
							caption: '用户名或密码错误',
							description: '用户名或密码错误过于频繁，您的账号被锁定'+timeStr+'！',
							okCaption: '确定',
							cancelCaption: '取消'
						}, function(){
							
						}, function(){
							
						});
						self.setLoginStatus(userName);
						self.setVcCode();
					}else {
						//登录失败
						am.msg(loginres.message || "数据获取失败,请检查网络!");
					}
				});
			}
		},
		loginOtherShop: function(token,shopId){
			am.loading.show("正在登录,请稍候...");
			am.api.login.exec({
				"token": token,
				"shopid": shopId
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
					localStorage.setItem("user",JSON.stringify({"userName": loginres.content.trueUserName}));
					localStorage.removeItem('errorInfo'+loginres.content.trueUserName);
					am.getmetadata(loginres.content,shopId);
					self.checkServer.changeShopName(loginres.content.shopName);
				}else {
					//登录失败
					am.msg(loginres.message || "数据获取失败,请检查网络!");
				}
			});
		},
		getLoginNum: function(sum,sum2) {
			var loginNum = am.isNull(localStorage.loginNum) ? "" : localStorage.loginNum;
			var myDate = new Date();
			var date = new Date(localStorage.date - 0).getTime() + 86400000;
			var today = new Date().getTime();
			if (am.isNull(localStorage.date) || am.isNull(localStorage.loginNum)) {
				localStorage.date = new Date().getTime();
				localStorage.loginNum = 0;
			}
			if(date < today){
				localStorage.loginNum = 1;
				localStorage.date = today;
			}else{
				if (loginNum == 1) {
					return;
				}
				localStorage.loginNum++;
			}
			setTimeout(function () {
				var str = '',
					data = {};
				if (sum > 0) {
					str = "您当前有" + sum + "个工单客服已经完成服务流程，请您结单并点评，现在去支持中心么？";
					if (sum2 > 0) {
						str = "您当前有" + sum + "个工单可结单和" + sum2 + "个工单未点评,现在去支持中心么？";
					}
				} else {
					if (sum2 > 0) {
						str = "您当前有" + sum2 + "个工单未点评,现在去支持中心么？";
						if(sum2 == 1){
							data.detail = 1;
						}
					} 
					else{
						return false;
					}
				}
				am.confirm("工单提醒", str, "好的", "关闭", function () {
					$("canvas").hide();
					$.am.changePage(am.page.workOrder, "slideup", data);
				});
			}, 1000);
        },
        getWorkTip: function(userInfo,flag) {
			return;
			var self = this;
			self.getWorkTipTimer && clearTimeout(self.getWorkTipTimer);
			var opt = { 
				submiterId: userInfo.userId,
				token:userInfo.mgjtouchtoken
			};
            am.api.workTipCount.exec(opt, function(res) {
				if(am.isNull(res.content)){
                    return;
                }
                var count = "";
                if(res.content.HANDINGCOUNT == 0){
                    count = "<svg class='icon' aria-hidden='true'><use xlink:href='#icon-ziyuan24'></use></svg><div class='num act bounceIn'></div>";
                    if(res.content.NOEVALUATECOUNT == 0){
                        count = "";
                    }
                }else{
                    if(!am.isNull(res.content.HANDINGCOUNT)){
                        count = "<svg class='icon' aria-hidden='true'><use xlink:href='#icon-ziyuan24'></use></svg><div class='num bounceIn'>"+res.content.HANDINGCOUNT+"</div>";
                    }
                }
				$("#tab_main .logo").html(count);
				//弹窗
				if(flag){
					self.getLoginNum(res.content.REMINDSUBMITERCOUNT,res.content.NOEVALUATECOUNT);
				}

				self.getWorkTipTimer = setTimeout(function(){
					self.getWorkTip(userInfo,0);
				},12*60*1000);
            });
		},
		modifyPasswordTip: {
			init: function(){
				var _this = this;
				this.$ = self.$.find('.modifyPasswordTip');
				this.$.on('click','.modifyPasswordTip-close_btn',function(){
					_this.hide();
				}).on('click','.modifyNow',function(){
					var loginres = _this.data;
					$(".auth_box").show();
					var query="from=pad&shopId="+loginres.content.shopId+"&mobile="+loginres.content.mobile+"&userId="+loginres.content.userId+"&pwd="+loginres.content.pwd+"&pwFlag="+loginres.content.pwFlag+"&modify=1";
					var iframeUrl=window.config.mobile+"mgj-auth/index.jsp?"+query
					// var iframeUrl="http://192.168.3.99:8080"+"/mgj-auth/index.jsp?"+query
					$('.auth_box iframe').attr('src',iframeUrl);
					_this.hide();
				}).on('click','.modifyLater',function(){
					var loginres = _this.data;
					self.login(loginres.content.userName,loginres.content.pwd,loginres.content.code,1);
					_this.hide();
				});
			},
			show: function(data){
				if(!this.$){
					this.init();
				}
				this.data = data;
				this.$.show();
			},
			hide: function(){
				this.$.hide();
			}
		},
		getLockTs: function(lastLoginTime,failedLoginTimes,nowTime){
			var totalTs = 0;
			if(config.gateway.indexOf("test") != -1 || config.gateway.indexOf("develop") != -1 || config.gateway.indexOf("youngb") != -1){
				if(failedLoginTimes==5){
					totalTs = 1*60*1000;
				}else if(failedLoginTimes==6){
					totalTs = 3*60*1000;
				}else if(failedLoginTimes>=7){
					totalTs = 5*60*1000;
				}
			}else {
				if(failedLoginTimes==5){
					totalTs = 60*1000;
				}else if(failedLoginTimes==6){
					totalTs = 15*60*1000;
				}else if(failedLoginTimes>=7){
					totalTs = 24*60*60*1000;
				}
			}

			if(nowTime){
				var timeDuration = nowTime - new Date().getTime();
				localStorage.setItem('_timeDuration',timeDuration);
			}
	
			var ts = localStorage.getItem('_timeDuration')*1 || 0;
	
			var unLockTs = lastLoginTime + totalTs;
			var diff = unLockTs - (new Date().getTime() + ts);
			return diff;
		},
		getTimeStr: function(ts){
			var leave1 = ts%(24*3600*1000);
            var h = Math.floor(leave1/(3600*1000));
            var leave2 = leave1%(3600*1000);
            var m = Math.floor(leave2/(60*1000));
            var leave3 = leave2%(60*1000);
            var s = Math.round(leave3/1000);
			return this.addZero(h) + ':' + this.addZero(m) + ':' + this.addZero(s);
		},
		getLockStr: function(failedLoginTimes){
			if(config.gateway.indexOf("test") != -1 || config.gateway.indexOf("develop") != -1 || config.gateway.indexOf("youngb") != -1){
				if(failedLoginTimes==5){
					return '1分钟'
				}else if(failedLoginTimes==6){
					return '3分钟'
				}
				else if(failedLoginTimes>=7){
					return '5分钟'
				}
			}else {
				if(failedLoginTimes==5){
					return '1分钟'
				}else if(failedLoginTimes==6){
					return '15分钟'
				}
				else if(failedLoginTimes>=7){
					return '24小时'
				}
			}
			return '';
		},
		addZero: function(num){
			if(num<10){
				num = '0' + num;
			}
			return num;
		},
		setLoginStatus: function(userName){
			this.$loginBtn.removeClass('am-disabled').text('登录');
			this.lockLoginTimer && clearInterval(this.lockLoginTimer);
			var errorInfo = localStorage.getItem('errorInfo'+userName)?JSON.parse(localStorage.getItem('errorInfo'+userName)):null;
			if(!errorInfo){
				return;
			}
			var diff = this.getLockTs(errorInfo.lastLoginTime,errorInfo.failedLoginTimes);
			if(diff>0){
				this.$loginBtn.addClass('am-disabled').text('账号被锁定（'+ this.getTimeStr(diff) +'）');
				this.lockLoginTimer = setInterval(function(){
					diff -= 1000;
					if(diff>0){
						self.$loginBtn.addClass('am-disabled').text('账号被锁定（'+ self.getTimeStr(diff) +'）');
					}else {
						clearInterval(self.lockLoginTimer);
						self.$loginBtn.removeClass('am-disabled').text('登录');
					}
				},1000);
			}
		},
		setVcCode: function(force){
			var username = this.$username.val();
			this.$vcCode.val('');
			this.$vcCodeWrap.hide();
			if(username){
				if(!force){
                    var errorInfo = localStorage.getItem('errorInfo'+username)?JSON.parse(localStorage.getItem('errorInfo'+username)):null;
                    if(!errorInfo){
                        return;
                    }
                } 
				var src = config.gateway + 'mgj-cashier/user/vc2?userKey='+username+'&ts='+new Date().getTime();
				this.$vcCodeImg.attr('src',src);
				this.$vcCodeWrap.show();
			}else {
				this.$vcCodeWrap.hide();
			}
		},
        socketPush: {
            init: function (uuid, cb) {
				var _this = this;
                this.getWsUrl(uuid, function (url) {
                    var wsurl = "ws://" + url;
                    if (location.protocol === 'https:') {
                        wsurl = wsurl.replace('ws:', 'wss:').replace(':804', ':805');
                    }
                    var iosocket = _this.iosocket = io.connect(wsurl);
    
                    iosocket.on('connect', function (message) {
                        console.log("onconnect", message);
                        if (cb) cb(this);
                    });
                    iosocket.on('message', function (message) {
                        console.log("onmessage", message);
                        if (message && message.data) {
                            _this.onmessage(message.data);
                        }
                    });
                    iosocket.on('disconnect', function (message) {
						console.log("disconnect", message);
					});
					iosocket.on('connect_error', function (message) {
						console.log("connect_error", message);
						iosocket.disconnect();
						self.changeLogin(false);
						self.$.find('.formbox .title').addClass('hidden');
                    });
                });
            },
            getWsUrl: function (uuid, cb) {
				if(window.config.socketloginurl){
					cb && cb(window.config.socketloginurl);
					return; 
				}
				cb && cb('dev.sentree.com.cn:8039');
            },
            login: function () {
                var opt = {
                    uuid: self._uuid
                };
                if (!this.iosocket) {
                    this.init(self._uuid, function (iosocket) {
                        iosocket.emit("login", opt);
                    });
                } else {
                    this.iosocket.emit("login", opt);
                }
                console.log(opt);
			},
			logout: function(){
				if(this.iosocket){
					this.iosocket.close();
				}
			},
            onmessage: function (data) {
				var _this = this;
				if(data.uuid==self._uuid){
					var cluster = data.cluster ? JSON.parse(data.cluster) : null;
					if(cluster){
						var url = serverClusterConfig[cluster.cluster]?serverClusterConfig[cluster.cluster].url:'';
						if(url){
							cluster.url = url;
						}
					}
					if(config.mobile.indexOf('gray')!=-1){
						cluster = null;
					}
					if(data.token){
						if(location.protocol.indexOf('http')!=-1){
							_this.tokenWeb(cluster,data.token);
						}else {
							if(cluster){
								self.checkServer.handleCluster(cluster,function(){
									_this.tokenApp(data.token);
								});
							}else {
								_this.tokenApp(data.token);
							}
						}
					}
				}
			},
			tokenWeb: function(cluster,token){
				if(!cluster){
					this.tokenApp(token);
					return;
				}
				if(location.host.indexOf(cluster.url.replace('https://','').replace('http://','').replace('www.','').split('/')[0])==-1){
					var params = '#token='+token;
					for(var key in cluster){
						params += '&'+key+'='+ cluster[key];
					}
					window.location.href = cluster.url + 'young' + params;
				}else {
					self.checkServer.setCluster(cluster);
					this.tokenApp(token);
				}
			},
			tokenApp: function(token){
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
					}else {
						//登录失败
						am.msg(loginres.message || "数据获取失败,请检查网络!");
					}
				});
			}
        },
		checkServer: {
			init: function(){
				var _this = this;

				this.$status = self.$.find('.checkServer .status');
				this.$status1 = self.$.find('.checkServer .status.status-checking');
				this.$status2 = self.$.find('.checkServer .status.status-pass');
				this.$status3 = self.$.find('.checkServer .status.status-recheck').vclick(function(){
					var userName = _this.$input.val();
					if(userName){
						_this.userName = userName;
						_this.changeStatus(1);
						_this.check();
					}
				});

				this.$cluster = self.$.find('.cluster');
				this.$clusterName = this.$cluster.find('.cluster-info');
				this.$clusterShopName = this.$cluster.find('.cluster-shopname .shopname');
				this.$clusterReset = this.$cluster.find('.cluster-reset').vclick(function(){
					localStorage.removeItem('CLUSTER');
					_this.changeStatus(4);
					_this.reset();
				});

				this.$linkJump = self.$.find('.linkJump');
				this.$linkJumpName = this.$linkJump.find('.jump-info');
				this.$linkJumpShopName = this.$linkJump.find('.jump-shopname');
				this.$linkJumpLink = this.$linkJump.find('.jump-link');
				this.$linkJumpTo = this.$linkJump.find('.jump').vclick(function(){
					var cluster = $(this).data('cluster');
					_this.setCluster(cluster);
					var params = '#userName='+_this.$input.val();
					for(var key in cluster){
						params += '&'+key+'='+ cluster[key];
					}
					window.location.href = cluster.url + 'young' + params;
				});
				this.$linkJumpClose = this.$linkJump.find('.close').vclick(function(){
					_this.$linkJump.hide();
					_this.changeStatus(4);
					_this.reset();
				});

				this.$input = self.$.find('#page-login-username').blur(function(){
					if(_this.currentCluster){
						return;
					}
					var userName = $(this).val();
					if(userName){
						_this.userName = userName;
						_this.check();
					}
				});
			},
			reset: function(){
				this.result = [];
				this.successNumber = 0;
				this.currentCluster = null;
				this.hasChecked = false;
				localStorage.clear();
			},
			changeStatus: function(status){
				this.$status.hide();
				if(status==1){
					this.$status1.show();
				}else if(status==2){
					this.$status2.show().removeClass('all');
				}else if(status==3){
					this.$status2.show().addClass('all');
				}else if(status==4){
					this.$status3.show();
					this.$cluster.hide();
				}else if(status==5){
					this.$status3.show();
					this.$cluster.show();
				}
			},
			render: function(cluster){
				var _this = this;
				if(!cluster.length){
					if(this.callback){
						this.callback();
					}else {
						this.$cluster.hide();
						this.changeStatus(4);
						am.msg('请稍后重试');
					}
					return;
				}
				if(cluster.length==1){
					this.$cluster.show();
					this.$clusterName.text(cluster[0].cluster);
					this.$clusterShopName.text(cluster[0].shopName);
					if(this.successNumber==this.serverCluster.length){
						this.changeStatus(3);
					}else {
						this.changeStatus(2);
					}
					this.handleCluster(cluster[0]);
				}else {
					am.popupMenu('请选择门店账号',cluster,function(ret){
						_this.render([ret]);
					},'shopName',null,function(){
						_this.changeStatus(4);
						_this.reset();
					});
				}
			},
			handleCluster: function(cluster,callback){
				if(location.protocol.indexOf('http')!=-1){
					this.changUrl(cluster);
				}else {
					this.changeConfig(cluster,callback);
				}
			},
			changUrl: function(cluster){
				if(location.host.indexOf(cluster.url.replace('https://','').replace('http://','').replace('www.','').split('/')[0])==-1){
					this.showLinkJump(cluster);
				}else {
					this.setCluster(cluster);
					this.callback && this.callback();
				}
			},
			changeConfig: function(cluster,callback){
				var baseUrl = config.gateway;
				config.originBaseUrl = config.gateway = config.mobile = config.originBaseUrl.replace(baseUrl,cluster.url);
				config.baseSys = config.baseSys.replace(baseUrl,cluster.url);
				if(serverClusterConfig && serverClusterConfig[cluster.cluster]){
					config.ping = serverClusterConfig[cluster.cluster].ping || [];
					if(serverClusterConfig[cluster.cluster].filesMgr){
						config.filesMgr = serverClusterConfig[cluster.cluster].filesMgr;
					}
					if(serverClusterConfig[cluster.cluster].wsServer){
						config.wsServer = serverClusterConfig[cluster.cluster].wsServer;
					}
					if(serverClusterConfig[cluster.cluster].calcServerUrl){
						config.calcServerUrl = serverClusterConfig[cluster.cluster].calcServerUrl;
					}
					if(serverClusterConfig[cluster.cluster].baseSys){
						config.baseSys = serverClusterConfig[cluster.cluster].baseSys;
					}
				}
				this.setCluster(cluster);
				callback && callback();
				this.callback && this.callback();
			},
			setCluster: function(cluster){
				localStorage.setItem('CLUSTER',JSON.stringify(cluster));
				this.currentCluster = cluster;
			},
			check: function(callback){
				if(am.isNull(serverClusterConfig)){
					callback && callback();
					return;
				}

				var serverClusterConfigTemp = JSON.parse(JSON.stringify(serverClusterConfig));
				var serverCluster = [];
				for(var key in serverClusterConfigTemp){
					serverCluster.push({
						name: key,
						url: serverClusterConfigTemp[key].url,
						ping: serverClusterConfigTemp[key].ping,
					});
				}

				if(!serverCluster.length){
					return;
				}

				this.serverCluster = serverCluster;

				this.reset();

				if(callback){
					this.callback = callback;
				}else {
					this.callback = null;
				}

				this.changeStatus(1);

				this.setSelfToMainCheck();

				for(var i=0;i<this.serverCluster.length;i++){
					this.ajax(this.serverCluster[i].url,i);
				}
			},
			setSelfToMainCheck: function(){				
				for(var key in this.serverCluster){
					var ping = this.serverCluster[key].ping;
					if(ping && ping.length){
						for(var i=0;i<ping.length;i++){
							if(ping[i].replace('https://','').replace('http://','').indexOf(config.gateway.replace('https://','').replace('http://','')) != -1){
								this.serverCluster[key].url = ping[i];
								break;
							}
						}
					}
				}
				for(var key in this.serverCluster){
					var ping = this.serverCluster[key].ping;
					if(ping && ping.length){
						for(var i=0;i<ping.length;i++){
							if(ping[i].indexOf(this.serverCluster[key].url) != -1){
								this.serverCluster[key].ping.splice(i,1);
								break;
							}
						}
					}
				}
			},
			end: function(){
				console.log('end');
				console.log(this.result);
				var aviable = [];
				for(var i=0;i<this.result.length;i++){
					if(this.result[i].flag && this.result[i].data.existence){
						aviable.push(this.result[i].data);
					}
				}
				this.render(aviable);
				this.hasChecked = true;
			},
			watch: function(){				
				var checkNumber = 0;
				for(var i=0;i<this.result.length;i++){
					if(this.result[i]){
						checkNumber ++;
					}
				}
				if(checkNumber==this.serverCluster.length){
					this.end();
				}
			},
			success: function(index,flag,data){
				var clusterResult = {
					flag: flag
				};
				if(flag){
					clusterResult.data = data;
					this.successNumber ++;
				}
				this.result[index] = clusterResult;
				this.watch();
			},
			ajax: function(url,index,pingIndex){
				var _this = this;
				var opt = {
					userName: this.userName
				}
				var ping = _this.serverCluster[index].ping;
                $.ajax({
					url: url + 'mgj-cashier/user/check',
					data: JSON.stringify(opt),
                    type: "POST",
                    timeout: 3000,
                    contentType: "application/json",
                    success: function (ret) {
						if(ret && ret.code==0){
							ret.content.url = url;
							_this.success(index,true,ret.content);
						}else {
							if(ping && ping.length){
								if(pingIndex == undefined){
									for(var i=0;i<ping.length;i++){
										_this.ajax(ping[i],index,i);
									}
								}else {
									if(pingIndex>=ping.length-1){
										if(!_this.result[index]){
											_this.success(index,false);
										}
									}
								}
							}else {
								_this.success(index,false);
							}
						}
                    },
                    error: function (ret) {
						if(ping && ping.length){
							if(pingIndex == undefined){
								for(var i=0;i<ping.length;i++){
									_this.ajax(ping[i],index,i);
								}
							}else {
								if(pingIndex>=ping.length-1){
									if(!_this.result[index]){
										_this.success(index,false);
									}
								}
							}
						}else {
							_this.success(index,false);
						}
                    }
                });
			},
			showLinkJump: function(cluster){
				this.$linkJump.show();
				this.$linkJumpName.text(cluster.cluster);
				this.$linkJumpShopName.text(cluster.shopName);
				this.$linkJumpLink.text(cluster.url+'young');
				this.$linkJumpTo.data('cluster',cluster);
			},
			changeShopName: function(shopName){
				if(!shopName){
					return;
				}
				var cluster = localStorage.getItem('CLUSTER')?JSON.parse(localStorage.getItem('CLUSTER')):'';
				if(cluster){
					cluster.shopName = shopName;
					localStorage.setItem('CLUSTER',JSON.stringify(cluster));
				}
			}
		}
	});
})();
