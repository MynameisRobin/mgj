(function(){
    var autoPay = {
        setData: function(data){
            this.paying = false;
            this.data = data;
            this.getJson();
            this.getBillRemark();
            this.getSettlementPayDetail();
            this.start();
            $('.nativeUIWidget-confirm,#preventRobot,#refundVccode').hide();
        },
        start: function(){
            this.paying = true;
            sessionStorage._autoPay1214 = 'autoPay';
            if(this.billRemark && this.billRemark.opencard && !this.billRemark.opencard.isbuy){
                this.opencard();
                return;
            }
            if(this.billRemark && this.billRemark.recharge && !this.billRemark.recharge.isbuy){
                this.recharge();
                return;
            }
            if(this.billRemark && this.billRemark.buypackage && !this.billRemark.buypackage.isbuy){
                this.buypackage();
                return;
            }
            this.service();
		},
        service: function(){
            autoPayCheck.start('service',this.data);
            this.reduce();
            $('#autoWrap').show();
            autoPayCheck.setStep('process feedBillData');
            var data = this.data;
            data.data = JSON.parse(data.data);
            var jsonstrObj = {};
            var timer = data.shampooFinishTime - data.shampooStartTime;
            if(timer && timer > 0){
                var flag = "";
                var timeStr = new Date(timer).format("MM:ss").replace(":", "分") + "秒";//转换分秒
                if((timer/60000) > 60){//如果超过1个小时
                    timeStr = Math.floor(timer/60000/60) + "小时" + timeStr;
                }
                am.metadata.configs.washPassTime = am.metadata.configs.washPassTime ? am.metadata.configs.washPassTime : 30;
                //是否合格
                if((am.metadata.configs.washPassTime - 0) * 60000 < (data.shampooFinishTime - data.shampooStartTime)){
                    flag = "pass";
                }else{
                    flag = "nopass";
                }
                jsonstrObj = {
                    washPassTime: timeStr,
                    flag: flag
                };
            }
            jsonstrObj.autopay = 1;
            data.jsonstr = JSON.stringify(jsonstrObj);

            var billRemark = this.billRemark;
            if(billRemark && ((billRemark.opencard && billRemark.opencard.isXCX) || (billRemark.recharge && billRemark.recharge.isXCX) || (billRemark.buypackage && billRemark.buypackage.isXCX))){
				var payType = 'pay_memberCard';
                if(this.billRemark && this.billRemark.buypackage && this.billRemark.buypackage.isbuy){
                    payType = 'pay_wechat';
                    if(this.settlementPayDetail.payMoney && this.settlementPayDetail.payMoney.wechatOrder){
                        this.settlementPayDetail.payMoney.wechat = Math.round((this.settlementPayDetail.payMoney.wechat - this.billRemark.buypackage.data[0].itemMoney * 1)*100)/100;
                        this.settlementPayDetail.payMoney.wechatOrder.price = Math.round((this.settlementPayDetail.payMoney.wechatOrder.price - this.billRemark.buypackage.data[0].itemMoney * 1)*100)/100;
                    }
                }
                data.data.settlementPayDetail = {
                    comment: this.settlementPayDetail.comment,
                    payType: payType,
                    payMoney: this.settlementPayDetail.payMoney,
                }
            }

            if(!data.serviceNO){
                data.serviceNO = data.serviceNOBak;
            }
            autoPayCheck.setStep('to feedBill');
            am.cashierTab.feedBill(data,1,true);
        },
        opencard: function(){
            if(!this.billRemark || !this.billRemark.opencard){
                return;
            }
            autoPayCheck.start('opencard',this.data);
            autoPayCheck.setStep('process openCardData');
            var opencard = this.billRemark.opencard;
            console.log(opencard);
            this.setAutoJsonStr('opencard');
            this.data.serviceNOBak = this.data.serviceNO;
            this.data.serviceNO = '';
            var opt = {
                isXCX: opencard.isXCX,
                billRemark: this.data
            }
            if(opencard.calcAchievement){
                var server = this.getFirstEmp();
                if(server){
                    opt.server = server;
                }
            }
            autoPayCheck.setStep('to page.memberCard');
            $('#autoWrap').show();
            $.am.changePage(am.page.memberCard,'',opt);
        },
        recharge: function(){
            if(!this.billRemark || !this.billRemark.recharge){
                return;
            }
            autoPayCheck.start('recharge',this.data);
            autoPayCheck.setStep('queryMemberById');
            var _this = this;
            this.queryMemberById(function(member){
                autoPayCheck.setStep('process rechargeData');
                var recharge = _this.billRemark.recharge;
                console.log(recharge);
                _this.setAutoJsonStr('recharge');
                var remarkCallback = function(members){
                    var _data = am.clone(_this.data);
                    var sendData = am.clone(_this.json);
                    if(members){
                        sendData.cid = members.cid;
                        sendData.memGender=members.sex;
                        _data.memId  = members.id;
                        _data.memName= members.name;
                        _data.memPhone=members.mobile;
                        _data.memcardid=members.cid;
                    }
                    sendData.billRemark.recharge.isbuy = true;
                    _data.data = JSON.stringify(sendData);
                    return _data.data;
                }
                var opt = {
                    action: "recharge",
                    member: member,
                    isXCX: recharge.isXCX,
                    settlementPayDetail: {
                        payMoney: _this.settlementPayDetail.payMoney,
						payType: _this.settlementPayDetail.payType
                    },
                    autoRechargeData: {
                        cardfee: recharge.money,
                        presentfee: recharge.givingAmount
                    },
                    jsonstr: _this.data.jsonstr,
                    remarkCallback: remarkCallback,
                    billRemark: _this.data
                }
                if(recharge.calcAchievement){
                    var server = _this.getFirstEmp();
                    if(server){
                        opt.server = server;
                    }
                }
                autoPayCheck.setStep('to page.pay');
                $('#autoWrap').show();
                $.am.changePage(am.page.pay, "slideup", opt);
            });
        },
        buypackage: function(){
            if(!this.billRemark || !this.billRemark.buypackage){
                return;
            }
            autoPayCheck.start('buypackage',this.data);
            autoPayCheck.setStep('process comboCardData');
            var buypackage = this.billRemark.buypackage;
            console.log(buypackage);
            this.setAutoJsonStr('buypackage');
            this.data.serviceNOBak = this.data.serviceNO;
            this.data.serviceNO = '';
            var opt = {
                isXCX: buypackage.isXCX,
                billRemark: this.data
            }
            if(buypackage.calcAchievement){
                var server = this.getFirstEmp();
                if(server){
                    opt.server = server;
                }
            }
            autoPayCheck.setStep('to page.comboCard');
            $('#autoWrap').show();
            $.am.changePage(am.page.comboCard,'',opt);
        },
        reduce:function(){
            autoPayCheck.setStep('reduce');

            var reduceMoney = 0;

            if(this.billRemark && this.billRemark.opencard && this.billRemark.opencard.firstReduction * 1){
                reduceMoney = this.billRemark.opencard.firstReduction * 1;
            }
            if(this.billRemark && this.billRemark.recharge && this.billRemark.recharge.firstReduction * 1){
                reduceMoney = this.billRemark.recharge.firstReduction * 1;
            }
            if(this.billRemark && this.billRemark.buypackage && this.billRemark.buypackage.firstReduction * 1){
                reduceMoney = this.billRemark.buypackage.firstReduction * 1;
            }

            if(!reduceMoney){
                return;
            }

            var total = 0;
            var serviceItems = this.json.serviceItems?this.json.serviceItems:[];
            if(serviceItems && serviceItems.length){
                for(var i=0;i<serviceItems.length;i++){
                    var item = serviceItems[i];
                    if(item.consumeType==0){
                        total += item.price * 1;
                    }
                }
            }
            var depots = (this.json.products && this.json.products.depots)?this.json.products.depots:[];
            for(var i=0;i<depots.length;i++){
                var depot = depots[i];
                total += depot.salePrice * 1 * depot.number;
            }

            if(!total){
                return;
            }

            if(serviceItems && serviceItems.length){
                for(var i=0;i<serviceItems.length;i++){
                    var item = serviceItems[i];
                    if(item.consumeType==0){
                        var percent = item.price/total;
                        item.price = Math.round((item.price - reduceMoney * percent)*100)/100;
                        item.modifyed = 1;
                        if(item.price < 0){
                            item.price = 0;
                        }
                    }
                }
            }
            for(var i=0;i<depots.length;i++){
                var depot = depots[i];
                var percent = (depot.salePrice * depot.number)/total;
                depot.salePrice = Math.round((depot.salePrice - reduceMoney * percent / depot.number)*100)/100;
                depot.modifyed = 1;
                if(depot.salePrice < 0){
                    depot.salePrice = 0;
                }
            }

            this.data.data = this.json;
        },
        setAutoJsonStr: function(type){
            var map = ['opencard','recharge','buypackage'];
            this.data.jsonstr = JSON.stringify({
                autopay: type,
                mgjUniformMessage: this.json.mgjUniformMessage,
                selfPayType: map.indexOf(type) + 1
            });
        },
        getFirstEmp: function(){
            if(this.data.emp1!=-1){
                var emp = amGloble.metadata.empMap[this.data.emp1];
                if(emp){
                    var server = {
                        dutyid: emp.dutyid,
                        dutytypecode: emp.dutyType,
                        empId: emp.id,
                        empName: emp.name,
                        empNo: emp.no,
                        per: 100,
                        perf: 0,
                        gain: 0,
                        pointFlag: this.data.isSpecified1,
                        station: emp.pos
                    }
                    return server;
                }
            }
        },
        queryMemberById: function(callback){
            var _this = this;
            am.loading.show();
			am.api.queryMemberById.exec({
				memberid: this.data.memId
			},function(ret){
				am.loading.hide();
				if(ret && ret.code==0 && ret.content && ret.content.length){
					if(ret.content.length==1){
						callback(ret.content[0]);
					}else if(ret.content.length>1){
						for (var i = 0; i < ret.content.length; i++) {
                            if(ret.content[i].cid == _this.json.cid){
                                callback(ret.content[i]);
                                break;
                            }
                        }
					}
				}
			});
        },
        getBillData: function(id){
            var _this = this,
                userInfo = am.metadata.userInfo;
            am.api.hangupList.exec({
                channel : 1,
                pageSize : 99999,
                "parentShopId": userInfo.parentShopId,
                "shopId": userInfo.shopId,
                id: id
            },function(ret){
                if(ret.code == 0 && ret.content.length > 0){
                    var retData = ret.content[0];
                    retData.data = JSON.parse(retData.data);

                    am.lockScreen.autopay(retData);

                    if(retData.status==2){
                        if(localStorage.getItem('mgjAutoPayFirstDisabled') == 1){
                            return;
                        }
                        _this.checkBillData(retData);
                    }
                }
            },null,3000);
        },
        checkBillData: function(data){
            if(!this.queue){
                this.queue = [];
                this.queueMap = {};
            }
            if(this.queue.indexOf(data.id) == -1){
                this.queue.push(data.id);
                this.queueMap[data.id] = data;
            }
			if(this.paying) {
                return;
            }
            this.setData(data);
        },
        getJson: function(key){
            var json = this.data.data?JSON.parse(this.data.data):null;
            this.data.data = json;
            this.json = json;
        },
        getBillRemark: function(){
            if(this.json){
                var billRemark = this.json.billRemark;
                this.billRemark = billRemark;
            }
        },
        getSettlementPayDetail: function(){
            if(this.json){
                this.settlementPayDetail = this.json.settlementPayDetail;
            }
        },
        reset: function(){
            this.data = this.json = this.billRemark = this.settlementPayDetail = null;
            this.paying = false;
            sessionStorage.removeItem('_autoPay1214');
            $('#autoWrap').hide(); 
            am.lockScreen.reset();
            autoPayCheck.reset();
            this.checkQueue();
        },
        checkQueue: function(){
            if(this.queue && this.queue[0]){
                var id = this.queue[0];
                this.queue.shift();
                delete this.queueMap[id];
                var nextId = this.queue[0];
                if(nextId && this.queueMap[nextId]){
                    this.setData(this.queueMap[nextId]);
                }
            }
        }
    }
    var autoPayCheck = {
        defaultTimeout: 60*1000,
        init: function(){
            var _this = this;
            window.addEventListener('error', function(message){
                if(sessionStorage._autoPay1214 == 'autoPay'){
                    var ret = {
                        error: message.message,
                        filename: message.filename,
                        line: message.lineno,
                        col: message.colno,
                        step: _this.step,
                    }
                    if(!_this.errorMsg){
                        _this.errorMsg = [];
                    }
                    _this.errorMsg.push(ret);
                }
            });
        },
        reset: function(){
            this.errorMsg = [];
            delete this.type;
            delete this.data;
            this.waitCount = 0;
            this.clearTimer();
        },
        setStep: function(step){
            this.step = step;
        },
        start: function(type,data){
            this.reset();
            this.type = type;
            this.data = data;
            this.waitCount = 0;
            this.setTimer();
        },
        setTimer: function(){
            var _this = this;
            this.startTs = new Date().getTime();
            this.clearTimer();
            this.timer = setInterval(function(){
                var nowTs = new Date().getTime();
                if(nowTs - _this.startTs > _this.defaultTimeout){
                    _this.clearTimer();
                    _this.timeoutRemind();
                }
            },1000);
        },
        clearTimer: function(){
            this.timer && clearInterval(this.timer);
        },
        timeoutRemind: function(){
            var _this = this;
            if(this.waitCount<3){
                var caption = '自助结单异常',
                    description = '本次自助结单已经超过1分钟,可能已经出现异常，如果无法继续，请点击报告问题，美管加将尽快为您解决',
                    okCaption = '报告问题',
                    cancelCaption = '继续等待';
                am.confirm(caption,description,okCaption,cancelCaption,function(){
                    _this.report();
                },function(){
                    _this.waitCount ++;
                    _this.setTimer();
                });
            }else {
                am.msg('本次自助结单已经超过1分钟,可能出现异常,已无法结算，请联系客服处理，美管加将尽快为您解决');
                this.back();
                this.report(1);
            }
        },
        report: function(back){
            var _this = this;
            var userAgent = navigator.userAgent;
			var platfrom = /(iOS)/i.test(userAgent) ? "iOS" : /(iPhone)/i.test(userAgent) ? "iPhone" : /(iPad)/i.test(userAgent) ? "iPad" : /(Android)/i.test(userAgent) ? "Android" : "PC";
            var connType = navigator.connection && navigator.connection.type;
            var userInfo = am.metadata.userInfo;
            var sms = '【'+ userInfo.shopName + userInfo.osName +'】【'+ userInfo.shopId +'】：【'+ this.data.serviceNO +'】发生霸屏结算故障，联系人【'+ userInfo.userName +'】【'+ (userInfo.mobile || userInfo.secondPhone)+'】';
            var req = {
                dbName: 'mgj-monitor',
                collName: 'autoPay',
                data: {
                    type: this.type,
                    step: this.step,
                    sms: sms,
                    bill: {
                        billNo: this.data.serviceNO,
                        data: this.data.data
                    },
                    errorMsg: this.errorMsg || [],
                    platfrom: platfrom + '-' + $('.app_version').text(),
					userAgent: userAgent,
					connType: connType
                }
            }
            if(!back){
                am.loading.show();
            }
            $.ajax({
                type: "post",
                data: JSON.stringify(req),
                url: this.getUrl(),
                timeout: 30 * 1000,
                dataType: "json",
                contentType: "application/json",
                success: function (ret) {
                    am.loading.hide();
                    if(ret && ret.code==0 && !back){
                        var caption = '问题已报告',
                        description = '问题已报告，我们将尽快解决，请耐心等待回复，造成不便请谅解',
                        okCaption = '确认',
                        cancelCaption = '返回';
                        am.confirm(caption,description,okCaption,cancelCaption,function(){
                            _this.back();
                        },function(){
                            _this.back();
                        });
                    }else {
                        _this.back();
                    }
                },
                error: function (ret) {
                    am.loading.hide();
                    _this.back();
                }
            });
        },
        back: function(){
            $('#autoWrap').hide();
            am.goBackToInitPage();
            if(autoPay.queue && autoPay.queue[0]){
                var id = autoPay.queue[0];
                autoPay.queue.shift();
                delete autoPay.queueMap[id];
                autoPay.paying = false;
            }
        },
        getUrl: function(){
            if(!this.url){
                var url = 'https://ops.meiguanjia.net/monitor/commdata/save';
                if(location.protocol === 'http:'){
                    url = url.replace('https','http');
                }
                this.url = url;
            }
            return this.url;
        }
    }
    autoPayCheck.init();

    am.autoPay = autoPay;
    am.autoPayCheck = autoPayCheck;

})();