window.am.cardNumberController = {
	start:function(code){
		code = code.toString().substring(code.toString().length-3);
		var activePage = $.am.getActivePage();
		this.getUserData(code,function(data){
			//如果点评界面是打开的，关掉
			$('#commentService').hide();
			if(data){//取单
				if(activePage.id == "page_service"){
					var rowdata = {
						bill:data,
						openbill:1
					}
					am.page.service.beforeShow(rowdata);
					am.page.service.afterShow(rowdata);
					am.cashierTab.feedBill(data,1);
					am.cashierTab.$memberInfo.hide();
				}else{
					data.data = JSON.parse(data.data);
					am.page.hangup.getBill(data);
				}
			}else{//开单
				var rowdata = {source:"hangup"};
				if(activePage.id == "page_openbill"){//本来就在开单页面
					am.page.openbill.beforeShow(rowdata);
					am.page.openbill.afterShow(rowdata);
				}else{
					$.am.changePage(am.page.openbill,"",rowdata);
				}
				am.page.openbill.setdisplayId(code);
			}
		});
	},
	getOwnerData:function(code,list){
		if(list && list.length){
			for(var i=0;i<list.length;i++){
				var item = list[i];
				if(item.displayId == code){
					return item;
					break;
				}
			}
		}else{
			return null;
		}
	},
	getUserData:function(code,cb){
		var self = this;
		this.getData(function(ret){
			if(ret.code==0){
				var data = self.getOwnerData(code,ret.content);
				cb && cb(data);
			}else{
				am.msg(ret.message || "获取单据失败！");
			}
		});
	},
	getData:function(cb){
		var self = this;
		var user = am.metadata.userInfo;
		am.loading.show("获取数据中，请稍后...");
	    am.api.hangupList.exec({
	        "shopId": user.shopId,
	        "pageSize": 99999, //可选，如果有则分页，否则不分页
	        "channel":1
	    }, function(ret) {
	        am.loading.hide();
	        if (ret.code == 0) {
	            am.cashierTab.setHangUpNum(ret.count);
	        }
	        cb(ret);
	    });

	}
}
// 读卡器取单/开单
window.cardNumberRead = function(msg){
	if($('#auth').is(":visible")){
		am.auth.checkAuth(msg);
		return;
	}
	var u = navigator.userAgent;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	var isNeedConfirm = false,
		activePage    = $.am.getActivePage(),
		activeId= activePage.id;
	if(activePage.id == "page_service" || activePage.id == "page_product" || activePage.id == "page_pay"){
		isNeedConfirm = true;
    }
	var $id=$('#'+activeId);
    var isFocus = $('input[type="text"].debarInput').is(":focus");//jq类数组中有一个聚焦 就true
    var startBt = $('.scanCheckbox.debarInput').hasClass('checked');
    $.am.debug.log("isFocus"+ isFocus );
    $.am.debug.log("startBt"+ startBt );
  
    if( 
        ( (activePage.id == "page_about" || activePage.id == "page_pay" || activePage.id == "page_prepay" || activePage.id == "page_searchMember" || activePage.id == "page_appointment" || activePage.id == "page_storage" )) 
        || (activePage.id == "page_product" && startBt) 
    )
    {   
    	if(isFocus){   		
    		var $target = $('input[type="text"].debarInput:focus'),
            e = $.Event("keyup", {keyCode: 13});
            if(isAndroid&& ( activePage.id == "page_searchMember" || activePage.id == "page_appointment" ) ){//
                if( msg.indexOf('0102') == 0 ){
                    msg = '*' + msg;
                }
                if(msg.indexOf('0102') == 1){
                    msg = msg.replace(/(\w+0102)/,'*0102');
                }
                $.am.debug.log( msg );
                
            }else if( (navigator.platform == 'Win32' || navigator.userAgent.indexOf("Windows") !== -1 )&& activePage.id == "page_appointment" ){//window容器并且是预约
                msg = msg.replace(" ",'');
			}
			this.timer && clearTimeout(this.timer);
			this.timer = setTimeout(function(){
				$target.val(msg.replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "")).trigger(e);
            	$.am.debug.log("$target",$target );
			},500);
            return;
    	}else if( isAndroid && ($id.find('.onlinePay.alipay').is('.show') || $id.find('.onlinePay.wechat').is('.show'))){
            var $targetInput = $('input[type="text"].debarInput:visible'),
			e = $.Event("keyup", {keyCode: 13});
			$targetInput.val(msg).trigger(e);
			$.am.debug.log("$targetInput",$targetInput );
            return ;
        }
    }
    if(amGloble.metadata.shopPropertyField.mgjBillingType!=1){
		am.msg("此功能只在开单模式下生效！");
		return;
	}
    $.am.debug.log("msg："+ msg );
	if(msg){
		if(isNeedConfirm){
			$.am.debug.log("isNeedConfirm:"+ isNeedConfirm);
			setTimeout(function(){
				am.confirm("提示信息","检测到刷卡信息，需要执行开单/取单操作吗？","确定","取消",function(){
					am.cardNumberController.start(msg);
				});
			},window.device2.ios() ? 200:0);
		}else{
			am.cardNumberController.start(msg);
		}
	}
}
window.cardNumberResult = function(msg){
	$.am.debug.log("window容器读卡返回信息："+JSON.stringify(msg));
	if(msg){
		window.cardNumberRead(msg.result);
	}
}
window.addEventListener("cardNumberResult",cardNumberResult,true);

(function(){
	if( location.protocol == "http:" || location.protocol == "https:" ){
		var code = "";
	    var lastTime,nextTime;
	    var lastCode,nextCode;
		document.addEventListener("keydown",function(e){	
			nextCode = e.which;	
	        nextTime = new Date().getTime();
	        if(lastCode != null && lastTime != null && nextTime - lastTime <= 30) {
				code += String.fromCharCode(lastCode); 
				$.am.debug.log("触发web keydown,code为："+ code );
	        } else if(lastCode != null && lastTime != null && nextTime - lastTime > 100){
	            code = "";
	        }
	        lastCode = nextCode;
	        lastTime = nextTime;
	        if(e.which == 13){
	            if(code && code.toString().length!=18 && code.toString().indexOf("j0102")==-1){
					$.am.debug.log("触发web 读卡,code为："+ code );
	            	window.cardNumberRead(code);
	            }
	            code = "";
	        }
			
		},true);
	}
})()
