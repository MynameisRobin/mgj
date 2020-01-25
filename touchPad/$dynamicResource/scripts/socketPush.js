$(function () {
	var SocketPushDialog = function(opt){
        this.initSelf = opt.initSelf;
        this.muteKey = opt.muteKey;
        this.getAudioText = opt.getAudioText;
        this.render = opt.render;
        this.init();
	};
	SocketPushDialog.prototype = {
		dom: ['<div class="MGJ_Push">',
        '	<div class="MGJ_PushContent">',
        '		<div class="MGJ_close iconfont icon-guanbi2"></div>',
        '		<div class="MGJ_mute"></div><svg class="icon notice" aria-hidden="true"></svg>',
        '		<div class="MGJ_pushTitle">您有新的预约啦</div>',
        '		<div class="MGJ_status status1"><svg class="icon reservation" aria-hidden="true"><use xlink:href="#icon-ziyuan34"></use></svg><svg class="icon cancel" aria-hidden="true"><use xlink:href="#icon-ziyuan33"></use></svg>',
        '			<div class="MGJ_head MGJ_member male"></div>',
        '			<div class="MGJ_head MGJ_employee"></div>',
        '		</div>',
		'		<div class="MGJ_info">',
		'           <div class="orderImg"></div>',
        '			<table cellspacing="0" cellpadding="0" border="0"></table>',
        '		</div>',
        '		<div class="button MGJ_pinkBtn">知道了</div>',
        '	</div>',
		'</div>'].join(""),
		init: function () {
			var _this = this;

            this.$ = $(this.dom);
			$('body').append(this.$);
			this.$.removeClass("on");
			this.$notice = this.$.find(".notice");
			this.$table = this.$.find('table');
			this.$orderImg = this.$.find(".orderImg");
			this.$mute = this.$.find('.MGJ_mute').vclick(function () {
				var $this = $(this);
				if ($this.hasClass('mute')) {
					$this.removeClass('mute');
					localStorage.removeItem(_this.muteKey);
					am.msg("你已开启了语音提醒，", 1, true);
				} else {
					$this.addClass('mute');
					localStorage.setItem(_this.muteKey, 1);
					am.msg("你已启动静音模式，不再进行语音提醒", 1, true);
				}
			});

			var mute = localStorage.getItem(_this.muteKey);
			if (mute) {
				this.$mute.addClass('mute');
			}
			this.initSelf && this.initSelf();
		},
		_formatDate: function (date) {
			var y = date.getFullYear();
			var m = date.getMonth() + 1;
			var d = date.getDate();

			return y + "-" + m + "-" + d;
		},
		_add0: function (num) {
			num = num + "";
			if (num.length == 1) {
				num = "0" + num;
			}
			return num;
		},
		formatDate: function (date) {
			date = new Date(date);
			var d = this._formatDate(date);
			var H = date.getHours();
			var M = date.getMinutes();

			var today = new Date();
			var txt = "";
			if (d == this._formatDate(today)) {
				txt = "(今天) ";
			} else {
				today.setDate(today.getDate() + 1);
				if (d == this._formatDate(today)) {
					txt = "(明天) ";
				}
			}

			return d + "日 " + txt + this._add0(H) + ":" + this._add0(M);
		},
		getAudio: function (data) {
			var _this = this;
			var text = this.getAudioText?this.getAudioText(data):'';
			var data = {
				per: 0,
				text: text
			}
			am.api.audioPlayer.exec(data, function (ret) {
				if (ret.code == 0) {
					_this.playAudo(ret.content + "&tex=" + text);
				}

			});
		},
		playAudo: function (url) {
			if (navigator.userAgent.indexOf("Windows") !== -1 && window.wPlugin && window.wPlugin.playSound) {
				try {
					wPlugin.playSound(url);
				} catch (e) {
					console.error(e);
				}
			} else {
				var audio = new Audio(url);
				audio.play();
			}
		},
		show: function(data){
            this.render && this.render(data);
        },
        hide: function(){
            this.$.hide();
        }

	}
	var reservationDialog = new SocketPushDialog({
		muteKey: 'MGJ_reservation_audio_mute',
        getAudioText: function(data){
			var text = "";
			if (data.status == 2) {
				text = "美管加提醒您，有预约取消了";
			} else if (data.status == 0 && !data.originalReserTime) {
				if (am.metadata.configs.broadcastCraft && am.metadata.configs.broadcastCraft == "true") {
					text = "美管加提醒您，有顾客预约了" + (data.barberCode ? (data.barberCode + "号") : "") + data.barberName + "的服务，是否立即查看？";					
				}else{
					text = "美管加提醒您，有顾客预约了";
				}
			} else if (data.status == 0 && data.originalReserTime) {
				text = "美管加提醒您，有预约改期了";
			} else {
				return;
			}
            return text;
		},
		initSelf: function(){
			var _this = this;
			this.$.find(".MGJ_close,.MGJ_pinkBtn").vclick(function () {
				_this.$.hide();
			});
		},
		render: function(data){
			this.$.addClass("MGJ_rvPush");
			this.$notice.html('<use xlink:href="#icon-tongzhi"></use>');
			this.$table.removeClass("cancel").empty();
			//http://img.meiguanjia.net//customer/13190/44255212_s.jpg
			//http://img.meiguanjia.net//artisan/13190/2001193_s.jpg
			var $imgMem = am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				// updateTs: new Date().getTime()
				updateTs: data.lastphotoupdatetime || new Date().getTime()
			}, data.custId + ".jpg", "s",data.photopath||'');

			var emp = amGloble.metadata.empMap[data.barberId];
			var updateTs = '';
			if(emp && emp.mgjUpdateTime){
				updateTs = new Date(emp.mgjUpdateTime).getTime();
			}
			var $imgEmp = am.photoManager.createImage("artisan", {
				parentShopId: am.metadata.userInfo.parentShopId,
				updateTs: updateTs
			}, data.barberId + ".jpg", "s");

			this.$.find(".MGJ_member").empty()
				.removeClass("male").removeClass("female")
				.addClass(data.sex == "F" ? "female" : (data.sex == "M" ? "male" : ""))
				.append($imgMem);

			this.$.find(".MGJ_employee").empty().append($imgEmp);

			var $status = this.$.find(".MGJ_status").removeClass("status1").removeClass("status2").removeClass("status3");
			//美管加提醒您，有顾客预约了xxx号xxx的服务，请注意查看  barberCode号categoryName服务
			var setting = [{
				key: "custName",
				label: "顾客"
			}, {
				key: "barberName",
				label: "预约手艺人"
			}, {
				key: "reservationTime",
				label: "预约时间",
				highLight: 1,
				ts: 1
			}, {
				key: "categoryName",
				label: "预约项目"
			}, {
				key: "comment",
				label: "备注"
			}, {
				key: "reservationTime",
				label: "新预约时间",
				highLight: 1,
				ts: 1
			}, {
				key: "originalReserTime",
				label: "原预约时间",
				ts: 1
			}]
			var render = [];
			if (data.status == 2) {
				this.$.find(".MGJ_pushTitle").text("美管加提醒您，有预约取消了");
				$status.addClass("status2");
				this.$table.addClass("cancel")
				render = [0, 1, 2, 3, 4];
			} else if (data.status == 0 && !data.originalReserTime) {
				this.$.find(".MGJ_pushTitle").text("美管加提醒您，有新的预约啦");
				$status.addClass("status1");
				render = [0, 1, 2, 3, 4];
			} else if (data.status == 0 && data.originalReserTime) {
				this.$.find(".MGJ_pushTitle").text("美管加提醒您，有预约改期了");
				$status.addClass("status3");
				render = [0, 1, 6, 5, 3, 4];
			} else {
				return;
			}
			if (!this.$mute.hasClass('mute')) {
					this.getAudio(data);
			};

			for (var i = 0, l = render.length; i < l; i++) {
				var item = setting[render[i]];
				var val = data[item.key] || '';
				if (item.ts) {
					val = this.formatDate(val);
				}
				var $tr = $('<tr><td>' + item.label + '</td><td>' + val + '</td></tr>');
				if (item.highLight) {
					$tr.find("td:last").addClass("hightLight");
				}
				this.$table.append($tr);
			}
            this.$.show();

		}
	})
	var mallOrderDialog = new SocketPushDialog({
		muteKey: 'MGJ_mallOrder_audio_mute',
		getAudioText: function(data){
            var text = "美管加提醒您，有新的商城订单了";
            return text;
		},
        initSelf: function(){
			var _this = this;
			this.$.on("mouseenter",function(){
				_this.hideDom && clearTimeout(_this.hideDom);
			}).on("mouseleave",function(){
				_this.$.removeClass("on");
			}).on("vclick",function(){
				_this.hideDom && clearTimeout(_this.hideDom);
			})
			this.$.find(".MGJ_close").vclick(function () {
				_this.$.removeClass("on");
			});
            this.$.find('.MGJ_pinkBtn').vclick(function(){
				_this.$.removeClass("on");
                var opt={
					"code": $(this).data("code")
				};
				am.api.queryOrder.exec(opt, function (res) {
					am.loading.hide();
					if (res.code == 0 && res.content) {
						if(res.content){
							res.content.hideflag = 1;
							$.am.changePage(am.page.mallOrderDetail,"slideup",res.content);
						}
					}else{
						am.msg(res.message || "数据获取失败,请检查网络!");
					}
				});
            });
		},
		
        render: function(data){
			var _this = this;
			this.$notice.html('<use xlink:href="#icon-tongzhi-copy"></use>');
			this.$.addClass("MGJ_mallPush");
			this.$.find('.MGJ_status').remove();
			this.$orderImg.empty();
			this.$table.addClass("ordertable").empty();
			this.$.find(".MGJ_pushTitle").text("美管加提醒您，有新的商城订单了");
			this.$.find('.MGJ_pinkBtn').addClass("orderOk").text('查看订单 >').data("code",data.code);
			if ($("#lockScreen").is(":visible")) {
				this.$.find('.MGJ_pinkBtn').hide();
			} else {
				this.$.find('.MGJ_pinkBtn').show();
			}
			$html = $('<tr><td><span class="highlight">' + data.itemName + '</span></td></tr>' +
				'<tr><td><span>顾客：' + data.memName + '</span></td></tr>'
			)
			var images = data.images ? data.images.split(",")[0] : '';
			this.$.find(".orderImg").html(am.photoManager.createImage("mall", {
                parentShopId: am.metadata.userInfo.parentShopId,
            }, images, "s"))
			this.$table.append($html);
			if (!this.$mute.hasClass('mute')) {
				this.getAudio(data);
			}
			this.$.addClass("on");
			this.hideDom && clearTimeout(this.hideDom);
			this.hideDom = setTimeout(function () {
				_this.$.removeClass("on");
			},3000)

        }
    });

	var attendanceSoket = { //考勤推送
		start: function (message) {
			var msg = "上班了";
			if (message.employeeOutWorkTime) {
				msg = "下班了";
			}
			if (am.isNull(localStorage.mgjattendanceSoundDisabled)) {
				this.getAudio((message.employeeName || "") + "打卡" + msg);
			}
			console.log('getAudio静音', (message.employeeName || "") + "打卡" + msg);
			var activePage = $.am.getActivePage();
			if (activePage.id == am.page.about.id) {
				am.page.about.refreshData();
			}
		},
		playAudo: function (url) {
			//var url = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=3&text=" + text;
			if (navigator.userAgent.indexOf("Windows") !== -1 && window.wPlugin && window.wPlugin.playSound) {
				try {
					wPlugin.playSound(url);
				} catch (e) {
					console.error(e);
				}
			} else {
				var audio = new Audio(url);
				audio.play();
			}
		},
		getAudio: function (text) {
			var _this = this;
			var data = {
				per: 0,
				text: text
			}
			console.log('getAudio', text);
			am.api.audioPlayer.exec(data, function (ret) {
				if (ret.code == 0) {
					_this.playAudo(ret.content + "&tex=" + text);
				}

			});

		},
	}
	window.attendanceSoket = attendanceSoket;
	var socketPush = {
		init: function (parentShopId, cb) {
			//
			//config.wsServer = config.wsServer.replace('8039',parentShopId%3+8040);//parentShopId
			var self = this;
			// 商城订单时间推送时间间隔（时间戳）
			this.mallDisableTimes = 5 * 60 * 1000;
			this.getWsUrl(parentShopId, function (url) {
				var wsurl = "ws://" + url;
				if (location.protocol === 'https:') {
					wsurl = wsurl.replace('ws:', 'wss:').replace(':804', ':805');
				}
				var iosocket = self.iosocket = io.connect(wsurl);


				iosocket.on('connect', function (message) {
					console.log("onconnect", message);
					if (cb) cb(this);
				});
				iosocket.on('message', function (message) {
					console.log("onmessage", message);
					if (message && message.data && message.data.message) {
						var data;
						try {
							data = JSON.parse(message.data.message);
						} catch (e) {
							console.log("JSON parse error");
							return;
						}
						self.onmessage(data);
					}
				});
				iosocket.on('disconnect', function (message) {
					console.log("disconnect", message);
				});
			});


			// iosocket.on('attendance', function(message) {
			// 	console.log("attendance", message);
			// 	attendanceSoket.start(message);
			// });
		},
		getWsUrl: function (parentShopId, cb) {
			var _this = this;
			$.ajax({
				url: config.wsServer + "socketRouter",
				data: {
					platform: "touchPad",
					parentShopId: parentShopId
				},
				type: "GET",
				dataType: "jsonp", //指定服务器返回的数据类型
				jsonpCallback: "socketRouterCallBack", //指定回调函数名称
				success: function (data) {
					if (data) {
						cb && cb(data);
					}
				},
				error: function () {
					setTimeout(function () {
						_this.getWsUrl(parentShopId, cb);
					}, 60 * 1000);
				}
			});
		},
		login: function () {
			var userInfo = am.metadata.userInfo;
			var opt = {
				shopId: userInfo.shopId,
				parentShopId: userInfo.parentShopId,
				userId: userInfo.userId,
				platform: "touchPad"
			};

			if (!this.iosocket) {
				this.init(userInfo.parentShopId, function (iosocket) {
					iosocket.emit("login", opt);
				});
			} else {
				this.iosocket.emit("login", opt);
			}
			console.log(opt);
			this.getReservationNum();
		},
		onmessage: function (data) {
			if (data && (!data.actionType || data.actionType == 1)) {
				this.getReservationNum();
				var activePage = $.am.getActivePage();
				if (activePage == am.page.reservation) {
					am.page.reservation.refreshData(false, true);
				}
				reservationDialog.show(data);
				// 如果在锁屏界面则5s后消失弹窗
				if($('#lockScreen').is(':visible')) {
					var timer = setTimeout(function(){
						$(".MGJ_rvPush").hide();
						clearTimeout(timer);
					}, 5000);
                }
			} else if (data && data.actionType == 3) {
				//挂单
				if (data.token == am.metadata.userInfo.mgjtouchtoken) {
					//推送者自己不更新数据
					return;
				}
				$.am.trigger('instoreServiceHasBeenChanged',data);
				/* am.page.hangup.startGetDate();
				var currentPage = $.am.getActivePage();
				if (currentPage.id == 'page_openbill') {
					//当前停留于开单界面
					am.page.openbill.onPosStatusChange();
				}else if (currentPage.id == 'page_service' || currentPage.id == 'page_product') {
					//当前停留于卖品界面
					am.page.service.onBillStatusChange(data);
				}else if(currentPage===am.page.pay){
					//TODO 在支付页面时也要更新
				}else if(currentPage===am.page.itemPay){
					//TODO 在高级支付页面时也要更新
				}else if(currentPage===am.page.itemPay){
					//TODO 在高级支付页面时也要更新
				} */
			} else if (data && data.actionType == 4) {
				//轮牌
				if (data.token == am.metadata.userInfo.mgjtouchtoken) {
					return;
				}
				var currentPage = $.am.getActivePage();
				if (currentPage.id == 'page_queue') {
					am.page.queue.hasSocket = true;
					am.page.queue.getQueueList();
				} else if (currentPage.id == 'page_openbill') {
					am.page.openbill.onsocket();
				}
			} else if (data && data.actionType == 5) {
				// if(data.token==am.metadata.userInfo.mgjtouchtoken){
				// 	return;
				// }
				attendanceSoket.start(data);
			} else if (data && data.actionType == 6) {
				if (am.metadata.userInfo.userId == data.submiterId) {
					attendanceSoket.getAudio("美管加提醒您，有新的工单正在处理");
					am.page.login.getWorkTip(am.metadata.userInfo, 0);
				}
			} else if (data && data.actionType == 7) {
				console.info("接收推送", data)
				var uuid = localStorage.getItem("uuid_" + am.metadata.userInfo.userId);
				if (!data.uuid) {
					return console.info("小程序推送的uuid为空");
				} else if (!uuid) {
					return console.info("本地缓存uuid为空");
				}
				if (data.uuid == uuid) {
					if (am.page.searchMember.queryMemberFn) {
						am.page.searchMember.queryMemberFn(data);
					} else {
						console.info("小掌柜开单异常");
					}
				} else {
					am.msg("二维码失效，请顾客重新扫码！")
				}
			} else if (data && data.actionType == -1) {
				// am.switchServer(data.url);
			} else if (data && data.actionType == 8) {
				//socket检查收银界面订单状态
				console.log('收到小程序结算 socketPush 推送-----------------------------------------');
				am.page.hangup.afterShow();

				am.autoPay.getBillData(data.inStoreServiceId);

			} else if (data && data.actionType == 9) {
				console.log('收到支付推送 socketPush 推送-----------------------------------------');
				am.socketPush.getPay(data);
			} else if (data && data.actionType == 21) {
				var nowtime = am.now().getTime();
				var mallStartTime = localStorage.getItem("mallStartTime") * 1 || 0
				if (nowtime - mallStartTime >= this.mallDisableTimes) {
					if (data.distrshopid == am.metadata.userInfo.shopId) {
						mallOrderDialog.show(data);
						localStorage.setItem("mallStartTime", am.now().getTime())
					}
				}
			}
		},
		// 收到支付推送
		getPay: function(data) {
			if (data && data.order) {
				var orderId = data.order.id;
				var status = data.order.status;
				// if(this.orderId === orderId && this.status === status){
				// 	return false;
				// }
				this.orderId = orderId;
				this.status = status;
				// payway 1支付宝 3微信
				var payway = data.order.payway;
				var sourceFlag = $.am.getActivePage().id === "page_prepay" || $.am.getActivePage().id === "page_addIncome";
				var pay = '';
				if (payway === 1) {
					pay = 'alipay';
					if (sourceFlag){
						pay = 'alipayObj';
					}
				}
				else if(payway === 3){
					pay = 'wechat';
					if (sourceFlag){
						pay = 'wechatObj';
					}
				}
				if (data.order.status === 3) {
					// payway 1支付宝 3微信
					try{
						if ($.am.getActivePage().id === "page_pay") {
							am.page.pay.paytool[pay].getSocketPush(data.order);
						}
						else if ($.am.getActivePage().id === "page_itemPay") {
							am.page.itemPay.paytool[pay].getSocketPush(data.order);
						}
						else if ($.am.getActivePage().id === "page_addIncome") {
							am.page.addIncome[pay].getSocketPush(data.order);
						}
						else if ($.am.getActivePage().id === "page_prepay") {
							am.page.prepay[pay].getSocketPush(data.order);
						}
					} catch(e) {
						console.log(e, '----推送支付----');
					}
				}
				
			}
		},
		getReservationNum: function () {
			am.api.getShopReservationsNum.exec({
				shopId: am.metadata.userInfo.shopId,
			}, function (ret) {
				console.log("getShopReservationsNum", ret);
				if (ret.code == 0) {
					am.tab.main.setBadge(0, ret.content);
					am.page.openbill.setHangUpNum(ret.content);
					am.page.searchMember.setHangUpNum(ret.content);
				}
			});
		},
		getStatus:function() {
			return this.iosocket && this.iosocket && this.iosocket.io.readyState;
		}
	}

	//socketPush.init();
	am.socketPush = socketPush;

});