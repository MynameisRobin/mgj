(function() {

	var DT = 2000;
	var startTime = new Date().getTime();
	var pushType = {

		//显示消息列表
		"message" : {
			action : function() {
				$.am.debug.log("PUSH MESSAGE");
				am.loading.show();
				am.page.messageList.refreshPage(function(list){
					am.loading.hide();
					var actionData;
					if(list[0] && !list[0].acknowledged){
						try{
							 actionData = JSON.parse(list[0].data);
						}catch(e){

						}
					}
					$.am.debug.log(JSON.stringify(actionData));
					if(actionData && actionData.module==4 && (actionData.page==6 || actionData.page==2)){
						$.am.debug.log("PUSH takeAction");
						am.page.messageList.takeAction(actionData);
					}else{
						$.am.debug.log("PUSH goto list");
						$.am.changePage(am.page.messageList, "");
					}
				});
				// if ($.am.getActivePage() != am.page.messageList) {
				// 	$.am.changePage(am.page.messageList, "", "forceRefresh");
				// } else {
				// 	am.page.messageList.scrollview.touchTop(3);
				// }
			},
			action2 : function() {
				$.am.debug.log("PUSH MESSAGE");
				if (!am.metadata) {
					return;
				}
				am.loading.show();
				am.page.messageList.refreshPage(function(list){
					am.loading.hide();
					var actionData;
					if(list[0] && !list[0].acknowledged){
						try{
							 actionData = JSON.parse(list[0].data);
						}catch(e){

						}
					}
					$.am.debug.log(JSON.stringify(actionData));
					if(actionData && actionData.module==4 && (actionData.page==6 || actionData.page==2)){
						$.am.debug.log("PUSH takeAction");
						am.page.messageList.takeAction(actionData);
					}else{
						$.am.debug.log("PUSH goto list");
						$.am.changePage(am.page.messageList, "");
					}
				});
			}
		},
	};

	window.onMsgCheckInitDone = function(callback) {
		setTimeout(function() {
			if ($.am.getActivePage()) {
				callback && callback();
			} else {
				window.onMsgCheckInitDone(callback);
			}
		}, 300);
	};

	document.addEventListener('receivenotification', function(aps) {
		$.am.debug.log("onmessage: " + aps.alert);

		var type = pushType['message'];
		if (!type || !am.metadata) {
			return;
		}
		if (new Date().getTime() - startTime < DT) {
			//启动时
			setTimeout(function() {
				window.onMsgCheckInitDone(function() {
					type.action2 && type.action2();
				});
			}, 500);
		} else {
			//运行中
			am.setMessageDot(1);
			setTimeout(function() {
				atMobile.nativeUIWidget.confirm({
					caption : "您有新的消息，是否查看",
					description : aps.alert,
					okCaption : "是",
					cancelCaption : "否"
				}, function() {
					type.action && type.action();
				}, function() {
					if ($.am.getActivePage() == am.page.messageList) {
						am.page.messageList.scrollview.touchTop(3);
					} else {
						am.page.panel1.getGift();
					}
				});
			}, 100);
		}
	}, false);

})();
