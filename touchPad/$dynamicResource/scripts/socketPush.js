$(function () {
	var html = '<div class="MGJ_rvPush" id="MGJ_rvPush">';
	html += '<div class="MGJ_rvPushContent">';
	html += '<div class="MGJ_close iconfont icon-guanbi2"></div>';
	html += '<div class="MGJ_mute"></div><svg class="icon" aria-hidden="true"><use xlink:href="#icon-tongzhi"></use></svg>';
	html += '<div class="MGJ_pushTitle">你有新预约了</div>';
	html += '<div class="MGJ_status status1"><svg class="icon reservation" aria-hidden="true"><use xlink:href="#icon-ziyuan34"></use></svg><svg class="icon cancel" aria-hidden="true"><use xlink:href="#icon-ziyuan33"></use></svg>';
	html += '<div class="MGJ_head MGJ_member"></div>';
	html += '<div class="MGJ_head MGJ_employee"></div>';
	html += '</div>';
	html += '<div class="MGJ_info">';
	html += '<table cellspacing="0" cellpadding="0" border="0">';
	html += '</table>';
	html += '</div>';
	html += '<div class="button MGJ_pinkBtn">知道了</div>';
	html += '</div>';
	html += '</div>';

	$("body").append(html);
	var _this = {
		$: $("#MGJ_rvPush"),
		$table: $("#MGJ_rvPush").find("table"),
		init: function () {
			this.$.find(".MGJ_close,.MGJ_pinkBtn").vclick(function () {
				_this.$.hide();
			});

			if (navigator.userAgent.indexOf("Windows") !== -1 && window.wPlugin && window.wPlugin.playSound) {
				this.audio = {
					create: {
						play: function () {
							try {
								wPlugin.playSound("src/create.mp3");
							} catch (e) {
								console.error(e);
							}
						}
					},
					change: {
						play: function () {
							try {
								wPlugin.playSound("src/change.mp3");
							} catch (e) {
								console.error(e);
							}
						}
					},
					cancel: {
						play: function () {
							try {
								wPlugin.playSound("src/cancel.mp3");
							} catch (e) {
								console.error(e);
							}
						}
					}
				}
			} else {
				this.audio = {
					create: new Audio("src/create.mp3"),
					change: new Audio("src/change.mp3"),
					cancel: new Audio("src/cancel.mp3")
				}
			}


			this.$mute = this.$.find('.MGJ_mute').vclick(function () {
				var $this = $(this);
				if ($this.hasClass('mute')) {
					$this.removeClass('mute');
					localStorage.removeItem('MGJ_reservation_audio_mute');
					am.msg("你已开启了语音提醒，", 1, true);
				} else {
					$this.addClass('mute');
					localStorage.setItem('MGJ_reservation_audio_mute', 1);
					am.msg("你已启动静音模式，不再进行语音提醒", 1, true);
				}
			});

			var mute = localStorage.getItem('MGJ_reservation_audio_mute');
			if (mute) {
				this.$mute.addClass('mute');
			}
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
		getAudio: function (data, callback) {
			//美管加提醒您，有顾客预约了xxx号xxx的服务，请注意查看  barberCode号categoryName服务
			var text = "美管加提醒您，有顾客预约了" + (data.barberCode ? (data.barberCode + "号") : "") + data.barberName + "的服务，请注意查看";
			//broadcastCraft 预约字段
			var data = {
				per: 0,
				text: text
			}
			$.ajax({
				url: "http://vip7.meiguanjia.net/shair/mgjaudio!getAudioByText.action",
				type: "GET",
				data: data,
				dataType: "jsonp",
				contentType: "application/json", //返回数据类型
				jsonp: "callback",
				success: function (res) {
					callback && callback(res, text);
				},
				error: function (res) {
					callback && callback(res, text);
				}
			});
		},
		show: function (data) {
			this.$table.removeClass("cancel").empty();

			//http://img.meiguanjia.net//customer/13190/44255212_s.jpg
			//http://img.meiguanjia.net//artisan/13190/2001193_s.jpg
			var $imgMem = am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				// updateTs: new Date().getTime()
				updateTs: data.lastphotoupdatetime || new Date().getTime()
			}, data.custId + ".jpg", "s",data.photopath||'');

			var $imgEmp = am.photoManager.createImage("artisan", {
				parentShopId: am.metadata.userInfo.parentShopId
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
			var audioType = "";
			if (data.status == 2) {
				this.$.find(".MGJ_pushTitle").text("美管加提醒您，有预约取消了");
				$status.addClass("status2");
				this.$table.addClass("cancel")
				render = [0, 1, 2, 3, 4];
				audioType = "cancel";
			} else if (data.status == 0 && !data.originalReserTime) {
				this.$.find(".MGJ_pushTitle").text("美管加提醒您，有新的预约啦");
				$status.addClass("status1");
				render = [0, 1, 2, 3, 4];
				audioType = "create";
			} else if (data.status == 0 && data.originalReserTime) {
				this.$.find(".MGJ_pushTitle").text("美管加提醒您，有预约改期了");
				$status.addClass("status3");
				render = [0, 1, 6, 5, 3, 4];
				audioType = "change";
			} else {
				return;
			}

			if (!this.$mute.hasClass('mute')) {
				try {
					if (!data.flagTip) {
						this.audio[audioType].play();
					}
				} catch (e) {

				}
			}

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
	}
	_this.init();

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
			this.getWsUrl(parentShopId, function (url) {
				var wsurl = "ws://" + url;
				if (location.protocol === 'https:') {
					wsurl = wsurl.replace('ws:', 'wss:').replace(':804', ':805');
				}
				var iosocket = this.iosocket = io.connect(wsurl);


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
			var configs = am.metadata.configs.broadcastCraft;
			this.getReservationNum();
			if (data && (!data.actionType || data.actionType == 1)) {
				var text;
				if (data.status == 2) {
					text = "美管加提醒您，有预约取消了";
				} else if (data.status == 0 && !data.originalReserTime) {
					text = "美管加提醒您，有顾客预约了" + (data.barberCode ? (data.barberCode + "号") : "") + data.barberName + "的服务，是否立即查看？";
				} else if (data.status == 0 && data.originalReserTime) {
					text = "美管加提醒您，有预约改期了";
				} else {
					return;
				}
				this.getReservationNum();
				var activePage = $.am.getActivePage();
				if (activePage == am.page.reservation) {
					am.page.reservation.refreshData(false, true);
				}
				if (am.metadata.configs.broadcastCraft && am.metadata.configs.broadcastCraft == "true") {
					data.flagTip = true;
					_this.show(data);
					if (!_this.$mute.hasClass('mute')) {
						attendanceSoket.getAudio(text);
					}
				} else {
					data.flagTip = false;
					_this.show(data);
				}
				//else if(activePage == am.page.pay){
				//} else {
				// am.confirm("预约", text, "立即查看", "取消", function() {
				//     $.am.changePage(am.page.reservation, "");
				// }, function() {
				//
				// });
				// if (am.metadata.configs.broadcastCraft && am.metadata.configs.broadcastCraft == "true" && true) {
				// attendanceSoket.getAudio(text, function(res, text) {
				// if (res.code == 0) {
				//     _this.audio.create = new Audio(res.content + "&tex=" + text);
				// }
				// } else {
				// }
				//}
			} else if (data && data.actionType == 3) {
				//挂单
				if (data.token == am.metadata.userInfo.mgjtouchtoken) {
					return;
				}
				var currentPage = $.am.getActivePage();
				if (currentPage.id == 'page_hangup') {
					am.page.hangup.startGetDate();
				}
				if (currentPage.id == 'page_openbill') {
					am.page.openbill.onPosStatusChange();
				}
				if (currentPage.id == 'page_service' || currentPage.id == 'page_product') {
					am.page.service.onBillStatusChange(data);
				}
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

				if ($('#page_service').is(':visible')) {
					//若在服务页面订单状态发生改变则刷新
					var gotoHangup = function () {
						$.am.changePage(am.page.hangup, "", {
							openbill: 1,
							setting_washTime: am.page.service.billMain.getSetting().setting_washTime
						});
					};
					am.confirm('单据已变更', '由于其它终端的操作，此单状态已改变！', '知道了', '返回', gotoHangup, gotoHangup);
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
		}
	}

	//socketPush.init();
	am.socketPush = socketPush;

});