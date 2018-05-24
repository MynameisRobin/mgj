
(function() {
    var changeToPage = function(json){
        var data;
        try{
            data = JSON.parse(json.data);
        }catch(e){

        }
        $.am.debug.log("changeToPage:"+JSON.stringify(data));
        if(typeof(data)=="object" && data.module ){
            if(data.module == 11){
                //打赏绑定
                if($.am.getActivePage() != amGloble.page.withdrawdeposit){
                    amGloble.page.withdrawdeposit.changeToMe("");
                }
                amGloble.page.withdrawdeposit.refreshMetaAction();
            }else if(data.module == 8){
                if($.am.getActivePage() != amGloble.page.exceptional){
                    amGloble.page.exceptional.changeToMe("");
                }else{
                    amGloble.page.exceptional.beforeShow();
                }
            }else if(data.module == 5){
                if($.am.getActivePage() != amGloble.page.reservation){
                    amGloble.page.reservation.changeToMe("");
                }else{
                    amGloble.page.reservation.beforeShow();
                    amGloble.page.reservation.afterShow();
                }
            }else if(data.module == 12){
                //待办事项
                if($.am.getActivePage() != amGloble.page.todoList){
                    amGloble.page.todoList.changeToMe("");
                }else{
                    amGloble.page.todoList.beforeShow();
                    amGloble.page.todoList.afterShow();
                }
            }
            else if(data.module == 97){
	            if($.am.getActivePage() != amGloble.page.customerGrouping){
		            amGloble.page.customerGrouping.changeToMe("");
	            }else{
		            amGloble.page.customerGrouping.beforeShow();
		            amGloble.page.customerGrouping.afterShow();
	            }
            }
            else if(data.module == 99){
	            if($.am.getActivePage() != amGloble.page.msgDetail){
		            amGloble.page.msgDetail.changeToMe("");
	            }else{
		            amGloble.page.msgDetail.beforeShow();
		            amGloble.page.msgDetail.afterShow();
	            }
            }
            else if(data.module == 101){
	            if($.am.getActivePage() != amGloble.page.empGoalCheck){
		            amGloble.page.empGoalCheck.changeToMe("");
	            }else{
		            amGloble.page.empGoalCheck.beforeShow();
		            amGloble.page.empGoalCheck.afterShow();
	            }
            }
            else if(data.module == 103){
	            if($.am.getActivePage() != amGloble.page.shopGoal){
		            amGloble.page.shopGoal.changeToMe("");
	            }else{
		            amGloble.page.shopGoal.beforeShow();
		            amGloble.page.shopGoal.afterShow();
	            }
            }else if(data.module == 105){
	            if($.am.getActivePage() != amGloble.page.shopGoal){
		            amGloble.page.shopGoal.changeToMe("");
	            }else{
                    var now=new Date();
                    var month=now.getMonth()<11?(now.getMonth()+2)+'':'01';
                    if(month.length<2){
                        month='0'+month;
                    }
                    var year=now.getMonth()!=11?now.getFullYear():(now.getFullYear()+1);
                    var nextM=year+"/"+month
		            amGloble.page.shopGoal.beforeShow({time:nextM});
		            amGloble.page.shopGoal.afterShow();
	            }
            }
            
        }else{
            $.am.changePage(amGloble.page.message, "slideleft");
        }
    };
    var actionFn =function () {
        amGloble.loading.show();
        $.am.debug.log("actionFn");
        amGloble.page.message.refreshPage(function(list){
            amGloble.loading.hide();
            $.am.debug.log(list.length);
            if(list && list[0]){
                changeToPage(list[0]);
            }else{
                if ($.am.getActivePage() != amGloble.page.message) {
                    $.am.changePage(amGloble.page.message, "slideleft");
                }else {
                    //amGloble.page.message.scrollview.touchTop(3);
                }
            }
        });
    };
    var DT = 2000;
    var startTime = new Date().getTime();
    var pushType = {

        //显示消息列表
        "message": {
            action: function() {
                // if ($.am.getActivePage() != amGloble.page.message) {
                //     $.am.changePage(amGloble.page.message, "slideleft", "forceRefresh");
                // } else {
                //     amGloble.page.message.scrollview.touchTop(3);
                // }
                actionFn();
            },
            action2: function() {
                actionFn();
                // if (!config.userinfo) {
                //     return;
                // }
                // $.am.changePage(amGloble.page.message, "slideleft", "forceRefresh");
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

    window.onmessage = function(aps) {
        $.am.debug.log("onmessage: " + aps.alert);

        var type = pushType['message'];
        if (!type || !amGloble.metadata.userInfo || !amGloble.metadata.userInfo.appUserId) {
            $.am.debug.log("onmessage: return");
            return;
        }
        if (new Date().getTime() - startTime < DT) {
            //启动时
            $.am.debug.log("onmessage: start");
            setTimeout(function() {
                window.onMsgCheckInitDone(function() {
                    type.action2 && type.action2();
                });
            }, 500);
        } else {
            //运行中
            amGloble.setMessageDot(1);
            $.am.debug.log("onmessage: setMessageDot");
            setTimeout(function() {

                atMobile.nativeUIWidget.confirm({
                    caption: "您有新的消息，是否查看",
                    description: aps.alert,
                    okCaption: "是",
                    cancelCaption: "否"
                }, function() {
                    type.action && type.action();
                }, function() {
                    if ($.am.getActivePage() == amGloble.page.message) {
                        amGloble.page.message.scrollview.touchTop(3);
                    }
                });
            }, 100);
        }
    };

    document.addEventListener('receivenotification', onmessage, false);

})();
