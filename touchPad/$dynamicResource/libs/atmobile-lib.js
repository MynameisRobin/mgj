(function() {
	var mobileApi = {
		nativeUIWidget : {
			showMessageBox : function(opt, successCallback, failedCallback) {
				navigator.notification.alert(opt.content, successCallback, opt.title, '确定');

			},
			popupWebsite : function(opt, successCallback, failedCallback) {
				// $.am.debug.log(opt.url);
				window.open(opt.url, '_blank', 'location=no');

			},
			showPopupMenu : function(opt, successCallback, failedCallback) {
				// $.am.debug.log(opt.items);

				var options = {
					//'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT, // default is THEME_TRADITIONAL
					'title' : opt.title,
					'buttonLabels' : opt.items,
					'addCancelButtonWithLabel' : '取消'
				};

			    try{
			        options.androidTheme = window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT;
			    } catch (e) {

			    }

				var callback = function(buttonIndex) {
					setTimeout(function() {
						// alert('button index clicked: ' + buttonIndex);
						successCallback && successCallback(buttonIndex - 1);
					});
				};

				window.plugins.actionsheet.show(options, callback);

			},
			confirm : function(opt, successCallback, failedCallback) {
				// $.am.debug.log(opt.description);
				navigator.notification.confirm(opt.description, function(buttonIndex) {
					if (buttonIndex == 1) {
						successCallback && successCallback();
					} else {
						failedCallback && failedCallback();
					}
				}, opt.caption, [opt.okCaption, opt.cancelCaption]);
			},
			openUrl : function(opt, successCallback, failedCallback) {
				window.open(opt.url, '_system', 'location=no');
			}
		},
		appManager : {
			exitApp : function(opt, successCallback, failedCallback) {
				navigator.app.exitApp();
			}
		},

		social : {
			shareTo : function(content, title, image, url, scb, fcb, wxTimeline) {
				navigator.appplugin.share(content, title, image, url, function(msgCode) {
					scb && scb(msgCode);
				}, function(msgCode) {
					fcb && fcb(msg);
				}, wxTimeline ? ["wxtimeline"] : null);
			}
		},

		getMetadata : function(opt, successCallback, failedCallback) {

			navigator.appplugin.appMetadata(function(msgCode) {
				try {
					var ret = JSON.parse(msgCode);
					successCallback && successCallback(ret);
				} catch(e) {
					failedCallback && failedCallback("Parse json error");
				}

			}, function(msg) {
				failedCallback && failedCallback(msg);
			});
		},

		startPush : function() {
			$.am.debug.log("startPush");
			setTimeout(function() {
				navigator.appplugin.startPush();
			}, 100);
		},

		payment : {
			alipay : function(payString, scb, fcb) {
				navigator.alipay.pay({
					"payString" : payString
				}, function(msg) {
					scb && scb(msg);
				}, function(msg) {
					fcb && fcb(msg);
				});
			},
			wechat : function(payString, scb, fcb) {
				navigator.weixin.sendPayReq({
					"payJson" : payString
				}, function(msg) {
					$.am.debug.log("wexinpay success" + msg);
					scb && scb(msg);
				}, function(msg) {
					$.am.debug.log("wexinpay failed" + msg);
					fcb && fcb(msg);
				});

			}
		}
	};

	window.atMobile = mobileApi;

})();
