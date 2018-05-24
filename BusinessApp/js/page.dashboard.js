(function () {

    // newRole 1操作员 2管理员(包括直属店和附属店老板) 3老板（总部老板） 4第一工位员工 5第二工位员工 6第三工位员工
    // shopType 0总店 1单店 2直营 3附属
    // userType 0管理者 1员工
    // role 1操作员 2管理员 3老板 如果是员工则返回真实的role id
    // permission 1盛传版 2风尚版 3尊享版 4青春版

    var authorities = {

        "1": ["appointment", "wheel", "report", "invention", "rankinglist", "scan", "customer", "service", "promotionbenefit", "paperless", "myk", "attendanceRecord", "community","audit"], //操作员
        "2": ["wheel", "appointment", "shopMall", "report", "invention", "rankinglist", "scan", "customer", "service", "promotionbenefit", "myk", "smsrecharge", "attendanceManage", "shopGoal", "community","audit"], //管理员 //
        "3": ["wheel", "appointment", "shopMall", "marketing", "mall", "withDraw", "report", "invention", "rankinglist", "scan", "customer", "service", "promotionbenefit", "smsrecharge", "optimization", "myk", "attendanceManage", "shopGoal", "community","audit"], //老板
        "4": ["wheel", "report", "invention", "rankinglist", "scan", "customer", "todolist", "reservation", "service", "promotionbenefit", "exceptional", "paperless", "myk", "attendanceRecord", "empGoal", "community"], //员工1
        "5": ["wheel", "report", "invention", "rankinglist", "scan", "customer", "todolist", "reservation", "service", "promotionbenefit", "exceptional", "paperless", "myk", "attendanceRecord", "empGoal", "community"], //员工2
        "6": ["wheel", "report", "invention", "rankinglist", "scan", "customer", "todolist", "reservation", "service", "promotionbenefit", "exceptional", "paperless", "myk", "attendanceRecord", "empGoal", "community"], //员工3

    };
    var module1 = {
        "reservation": {
            name: "预约",
            icon: "yuyue",
            page: "reservation",
            permission: "2,3,4"
        },
        "appointment": {
            name: "预约",
            icon: "yuyue",
            page: "appointmentView",
            permission: "2,3,4"
        },
        "customer": {
            name: "顾客",
            icon: "guke",
            page: "customerGrouping",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        },
        "wheel": {
            name: "轮牌",
            icon: "lunpai",
            page: "craftsmanWheel",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        },
        "todolist": {
            name: "待办事项",
            icon: "daibanshixiang",
            page: "todoList",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        },
        "invention": {
            name: "作品",
            icon: "zuopin",
            page: "archiveList",
            permission: "2,3,4"
        },
        "service": {
            name: "服务",
            icon: "dangriliushui",
            page: "serviceManagement",
            permission: "2,3,4"
        },
        "paperless": {
            name: "无纸化登录",
            icon: "wuzhihua",
            page: "paperlessCode",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        },
        "empGoal": { //员工目标 员工有权限
            name: "目标",
            icon: "mubiao",
            page: "empGoalCheck",
            permission: "3" //权限、"3"只允许尊享版使用
        },
        "shopGoal": { //门店目标 管理员 操作员 老板有权限
            name: "目标",
            icon: "mubiao",
            page: "shopGoal",
            permission: "3" //权限、"3"只允许尊享版使用
        },
        "attendanceRecord": {
            name: "考勤记录",
            icon: "kaoqin",
            page: "attendanceRecord",
            permission: "2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "attendanceManage": {
            name: "考勤管理",
            icon: "kaoqin",
            page: "attendanceManage",
            permission: "2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "community": {
            name: "工作社群",
            icon: "community",
            page: "community",
            permission: "2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "audit": {
            name: "工作审计",
            icon: "audit",
            page: "audit",
            permission: "1,2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        }
    }
    var module2 = {
        "rankinglist": {
            name: "排行榜",
            icon: "paihangbang",
            page: "rankinglist",
            permission: "1,2,3,4"
        },
        "report": {
            name: "数据",
            icon: "baobiao",
            page: "reportList",
            permission: "1,2,3,4",
            autohide: true //缩账时隐藏
        },
        "mall": {
            name: "商城",
            icon: "shangcheng",
            page: "mallTotal",
            permission: "2,3,4" //权限、1只允许尊享版使用
        },
        // "mallreport": {
        //     name: "商城报表",
        //     icon: "shangchengbaobiao",
        //     page: "",
        //     permission: ""
        // }
    }
    var module3 = {
        "exceptional": {
            name: "打赏",
            icon: "dashang",
            page: "exceptional",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        },
        "promotionbenefit": {
            name: "推广收益",
            icon: "shangchengtuiguang",
            page: "promotionbenefit",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        },
        "shopMall": {
            name: "美美汇",
            icon: "meimeihui",
            permission: "1,2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "myk": {
            name: "微主页",
            icon: "weizhuye",
            permission: "1,2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "marketing": {
            name: "营销",
            icon: "hongbaoyingxiao",
            page: "marketing",
            permission: "3" //权限、"3,4"只允许尊享版和青春版使用
        }
    }
    var module4 = {
        "optimization": {
            name: "财务优化",
            icon: "caiwuyouhua",
            page: "auxiliary",
            permission: "3" //权限、"3"只允许尊享版
        },
        "smsrecharge": {
            name: "短信充值",
            icon: "duanxinchongzhi",
            page: "msgDetail",
            permission: "1,2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "scan": { //扫一扫iconClass 从"m4"改为"m16"
            name: "扫一扫",
            icon: "saoyisao",
            page: "scan",
            permission: "2,3,4" //权限、"3,4"只允许尊享版和青春版使用
        },
        "withDraw": {
            name: "代收代付",
            icon: "daishoudaifu",
            page: "withDraw",
            permission: "2,3,4"
        },
    }
    var plates = [{
        name: '日常工作',
        sub: module1
    }, {
        name: '业绩分析',
        sub: module2
    }, {
        name: '运营推广',
        sub: module3
    }, {
        name: '其他',
        sub: module4
    }];
    amGloble.page.dashboard = new $.am.Page({
        id: "page-dashboard",
        backButtonOnclick: function () {
            var self = this;
            atMobile.nativeUIWidget.confirm({
                caption: "退出登录",
                description: "您将退出当前登录用户，是否继续？",
                okCaption: "是",
                cancelCaption: "否"
            }, function () {
                $.am.changePage(amGloble.page.login, "slideright", "logout");
            }, function () { });
        },

        init: function () {
            var self = this;
            //返回
            //
            this.$user = this.$header.find(".right").vclick(function () {
                //$.am.changePage(amGloble.page.userinfo, "slideleft");
                $.am.changePage(amGloble.page.message, "slideleft", $(this).hasClass("dot") ? "forceRefresh" : null);
            });

            this.$title = this.$header.find(".title > .text");
            this.$userinfo = this.$.find(".userinfo").vclick(function () {
                $.am.changePage(amGloble.page.userinfo, "slideleft");
            });
            this.$userinfo.find(".yuyue").vclick(function (e) {
                var userinfo = amGloble.metadata.userInfo;
                if (userinfo.mgjVersion != 1) {
                    $.am.changePage(amGloble.page.reservation, "slideleft");
                    e.stopPropagation()
                }
            });
            this.$userinfo.find(".account").vclick(function (e) {
                if ($(this).hasClass('disabled')) {
                    return;
                }
                amGloble.popupMenu("请选择帐号", self.accountList, function (ret) {
                    console.log(ret)
                    self.switchAccount(ret.id);
                });
                e.stopPropagation();
                return false;
            })
            this.$photo = this.$userinfo.find(".photo");
            // .vclick(function () {
            //     $.am.changePage(amGloble.page.userinfo, "slideleft");
            // });
            this.$name = this.$userinfo.find(".t-name");
            this.$role = this.$userinfo.find(".line2");
            this.$workStatus = this.$userinfo.find(".icons");
            // this.$message = this.$.find(".userinfo .message").vclick(function() {
            //     $.am.changePage(amGloble.page.message, "slideleft", $(this).hasClass("dot") ? "forceRefresh" : null);
            // });

            this.$table = this.$.find(".moduleList");
            this.$table.on("vclick", "td", function () {
                var $this = $(this),
                    open = $this.attr("data")
                url = $this.attr("href"),
                    page = $this.attr("page");
                if ($this.hasClass("disabled")) {
                    if (amGloble.checkVersion()) {
                        return;
                    };
                }
                if (page == 'scan') {
                    cordova.plugins.barcodeScanner.scan(function (result) {
                        //alert("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                        $.am.debug.log("扫码结果：" + JSON.stringify(result));
                        $.am.debug.log("扫码text：" + result.text);
                        var text = result.text;
                        if (text) {
                            try {
                                text = JSON.parse(text);
                            } catch (e) {
                                $.am.debug.log("error：" + e.message);
                            }
                        }
                        if ($.isPlainObject(text) && text.type == "attendance") {
                            $.am.debug.log("进入考勤逻辑！");
                            self.userAttendance(text);
                        } else {
                            var _uuid = $.isPlainObject(text) ? text._uuid : text;
                            amGloble.api.scan.exec({
                                codeId: _uuid
                            }, function (ret) {
                                $.am.debug.log(_uuid);
                                if (ret.code == 0) { //成功
                                    console.log(ret);
                                } else {
                                    amGloble.msg(ret.message || "扫一扫失败,请重试!");
                                }
                            });
                        }

                    }, function (error) {
                        //alert("Scanning failed: " + error);
                        amGloble.msg(error);
                    });
                    return;
                }
                if (url && open != "openWindow") {
                    // location.href = url;
                    window.open(url, '_blank', 'location=no');
                } else if (open == "openWindow") {
                    window.location.href = url;
                } else if (page) {
                    if(page == 'community'){
                        self.communityClickCb();
                    }else{
                        $.am.changePage(amGloble.page[page], "slideleft", "forceRefresh");
                    }
                }
            });



            // this.$jokes = this.$.find(".jokes");
            // this.$arrowmore = this.$.find('.arrowmore');

            // console.log(this.scrollview);
            // var showbtn = true;
            this.scrollview._onupdate = function (pos) {
                this.$inner.setTransformPos(pos, "xy", this.hasInput);
                // console.log("onupdate",pos);
                // if (showbtn) {
                //     showbtn = false;
                //     localStorage.setItem('showArrow', true);
                //     // self.$arrowmore.hide();
                // }
            };

            //临时用途
            //log开关

            // var timeArr = [];

            // var compareTime = function (time1, time2) {
            //     return time2 / 1000 - time1 / 1000;
            // };

            // this.$name = this.$.find('.userinfo .line1').vclick(function() {

            //     var nowTime = new Date().getTime();
            //     timeArr.push(nowTime);
            //     var difference = compareTime(timeArr[0], nowTime);
            //     if (difference < 4) { //时差在3秒内
            //         if (timeArr.length > 3) { //点击了10次
            //             timeArr.length = 0;


            //             $.am.changePage(amGloble.page.videoDemo, "slideleft");


            //         }
            //     } else { //时差大于3秒
            //         timeArr.length = 0;
            //     }

            // });
            this.accountList = [];
            this.accountMap = {};
        },
        saveCommunityRefreshTimeByUserId:function(){
            var userId = amGloble.metadata.userInfo.userId,
                now = new Date();
                localTime = this.getLocalTime();
            if (!localTime){
                localTime = {};
                localTime[userId] = now.getTime();
            }else{
                localTime[userId] = now.getTime();
            }
            console.log('refresh timeStamp:'+new Date(localTime[userId]).format('yyyy-mm-dd HH:MM:ss'));
            this.setLocalTime(localTime);
        },
        sendTime:function(time){
            console.log('send timeStamp:'+new Date(time).format('yyyy-mm-dd HH:MM:ss'));
            var self = this;
            var userInfo = amGloble.metadata.userInfo;
            amGloble.api.communityMsg.exec({
                "shopId": userInfo.shopId,  //门店id
                "publicUserId": userInfo.userId, //用户id
                "publicUserType": userInfo.userType, //用户类型
                "publicDate": time  //日期
            }, function (ret) {
                console.log(ret);
                if (ret.code == 0) {
                    // amGloble.msg("获取成功！");
                    if( ret.content ){
                        self.topicNum = Math.round( ret.content.NEWTOPICS );
                        self.detailNum = Math.round(ret.content.NEWCOMMENTS + ret.content.NEWSUPPORTS );
                        self.renderMsg(self.topicNum,self.detailNum,time);
                    }
                } else {
                    amGloble.msg(ret.message || "数据获取失败，请重试！", true);
                }
            });
        },
        communityInsertType:-1,
        renderMsg:function(topicNum,detailNum,time){
            var $dot = this.$.find('td[page="community"] .num');
            if(detailNum){
                $dot.show().text(detailNum).removeClass('dot');
                this.communityInsertType = 1;
                this.getNewTopic(time);
            }else{
                if(topicNum){
                    $dot.show().addClass('dot').text('');
                    this.communityInsertType = 2;
                }else{
                    $dot.hide().removeClass('dot').text('');
                    this.communityInsertType = -1;
                }
            }
        },
        communityClickCb:function(){
            var self = this;
            if(self.communityInsertType==-1){
                $.am.changePage(amGloble.page.community, "slideleft");
            }else if(self.communityInsertType==1){
                if(self.newTopicDetail){
                    atMobile.nativeUIWidget.confirm({
                        caption: '查看帖子详情页',
                        description: '有新消息，是否进入工作社群查看？',
                        okCaption: '是的',
                        cancelCaption: '取消'
                    }, function () {
                        $.am.changePage(amGloble.page.communityDetail, "slideleft", self.newTopicDetail);
                    }, function () {
                        $.am.changePage(amGloble.page.community, "slideleft");
                    });
                }else{
                    $.am.changePage(amGloble.page.community, "slideleft");
                }
            }else if(self.communityInsertType==2){
                $.am.changePage(amGloble.page.community, "slideleft");
            }
        },
        getNewTopic:function(time){
            var self = this;
            var userInfo = amGloble.metadata.userInfo;
            amGloble.api.getNewTopic.exec({
                "pageSize":8,
                "pageNumber":0,
                "shopId": userInfo.shopId,  //门店id
                "loginUserId": userInfo.userId, //用户id
                "loginUserType": userInfo.userType, //用户类型
                "publicUserId": userInfo.userId, 
                "publicUserType": userInfo.userType,
                "publicDate": time , //日期
                "supportNum":30
            }, function (ret) {
                console.log(ret);
                if (ret.code == 0) {
                    if( ret ){
                        self.newTopicDetail = ret.topic;
                    }
                } else {
                    amGloble.msg(ret.message || "数据获取失败，请重试！", true);
                }
            });
        },
        getLocalTime:function(){
            return JSON.parse(localStorage.getItem('communityTime'));
        },
        setLocalTime:function(obj){
            var data = JSON.stringify(obj);
            localStorage.setItem('communityTime',data);     
        },
        setUserSign:function(content){
            localStorage.setItem("lastSignTime",content.createTime);
        },
        getUserSign:function(){
            return localStorage.getItem("lastSignTime");
        },
        removeUserSign:function(){
            localStorage.removeItem("lastSignTime");
        },
        checkUserSign:function(times){
            var _time = times || 30;
            var lastTime = this.getUserSign();
            var now = new Date().getTime(); 
            var tips="";
            if(lastTime){
                var diffTime = (now-lastTime)/60000;
                var s = Math.floor(diffTime/60);
                var m = Math.floor(diffTime%60);
                if(s<1){
                    tips = m + "分钟";
                }else{
                    tips = s + "小时" + m + "分钟";
                }
                if(diffTime<30){
                    return {
                        flag:false,
                        tips:tips
                    };
                }
            }
            return {
                flag:true
            };
        },
        userAttendance: function (content,cb) {
            try{
                var _this = this;
                var isFirstSign = localStorage.getItem("isFirstSign");
                var res = {};
                var userInfo = amGloble.metadata.userInfo;
                res.shopId = userInfo.shopId;
                res.date = content.createTime;
                res.mobile = userInfo.mobile;
                res.employeeId = userInfo.userId;
                res.timeDifference = content.timeDifference;
                res.pushToken = device.uuid;//设备ID
                
                if(content.shopId!=userInfo.shopId){
                    amGloble.msg("请扫本店的二维码打卡！");
                    return;
                }

                function userSign(){
                    amGloble.loading.show("获取数据中，请稍后...");
                    amGloble.api.attendanceSignin.exec(res, function (ret) {
                        amGloble.loading.hide();
                        if (ret.code == 0) { //成功
                            //需要选择
                            var shiftSetting = _this.getShiftList(amGloble.metadata.shiftSettingList.shiftSetting);
                            if (shiftSetting && shiftSetting.length) {
                                amGloble.popupMenu("请选择班次", shiftSetting, function (con) {
                                    amGloble.loading.show("获取数据中，请稍后...");
                                    amGloble.api.attendanceUpdata.exec({
                                        mobile: userInfo.mobile,
                                        shiftSetId: con.id,
                                        shopId: userInfo.shopId,
                                        pushToken: device.uuid//设备ID
                                    }, function () {
                                        amGloble.loading.hide();
                                        amGloble.msg("打卡上班成功！");
                                        _this.setUserSign(content);
                                        _this.$workStatus.removeClass("rest");
                                        cb && cb();
                                    });
                                });
                            } else {
                                amGloble.msg("请先联系管理员设置班次！");
                            }
        
                        } else if (ret.code == 1) {
                            amGloble.msg("打卡下班成功！");
                            _this.$workStatus.addClass("rest");
                            _this.removeUserSign();
                            cb && cb();
                        } else if (ret.code == 300000) {
                            amGloble.msg(ret.message || "该二维码已经失效，请重新打卡!");
                        } else {
                            amGloble.msg(ret.message || "扫一扫失败,请重试!");
                        }
                    });
                    
                }

                $.am.debug.log("isFirstSign:" + isFirstSign);
                if(isFirstSign!=1){
                    $.am.debug.log("进入confirm之前！！！！");
                    setTimeout(function(){//苹果机的bug  两次容器接口后必须异步调！！
                        amGloble.confirm("提示", "当前账号首次在本设备打卡考勤，继续操作将会绑定账号至本设备，是否继续？", "确定", "取消", function() {
                            localStorage.setItem("isFirstSign",1);
                            userSign();
                        },function() {
                            $.am.debug.log("进入confirm错误！！");
                        });
                    },100);
                }else{
                    //非第一次 判断是否要弹提示
                    var checks = _this.checkUserSign();
                    if(!checks.flag){
                        amGloble.confirm("提示", "工作时长较短：" +checks.tips+ "，确定要打卡下班吗？", "确定", "取消", function() {
                            userSign();
                        });
                    }else{
                        userSign();
                    }
                    
                }
                
            }catch(e){
                $.am.debug.log(e.message);
            }
        },
        getShiftList: function (list) {
            var res = [];
            if (list && list.length) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].status == 0) {
                        res.push(list[i]);
                    }
                }
            }
            return res;
        },
        beforeShow: function (ret) {
            var userId = amGloble.metadata.userInfo.userId;
            var self = this;
            this.getDashbordCount();
            this.clear();
            this.render();
            if (amGloble.metadata.userInfoList) {
                this.metaAccountList = amGloble.metadata.userInfoList;
                this.transData(amGloble.metadata.userInfoList);
                if (!this.accountList.length) {
                    this.$userinfo.find(".account").addClass('disabled');
                } else {
                    this.$userinfo.find(".account").removeClass('disabled');
                }
            }
            // this.isShowArrow();
            var communityTime = this.getLocalTime();
            if(!communityTime || !communityTime[userId]){
                this.saveCommunityRefreshTimeByUserId();
            }
            this.setStatus("normal")
        },
        transData: function (accountList) {
            var curUserId = amGloble.metadata.userInfo.userId;
            var self = this;
            self.accountList = [];
            $.each(accountList, function (i, item) {
                if (curUserId != item.userId) {
                    var account = {
                        name: item.osName + '-' + item.levelName + '-' + item.userName,
                        id: item.userId
                    };
                    self.accountList.push(account);
                }
                self.accountMap[item.userId] = item;
            })
        },
        switchAccount: function (userId) { //切换帐号逻辑
            var curPwd = amGloble.metadata.userInfo.password,//当前账号密码是base64加密的
                accountData = this.accountMap[userId],//根据切换的userId拿到相应的data
                code = 9527,
                opt = {
                    code: code,
                    phone: accountData.mobile,
                    paras: {
                        userId: accountData.userId,
                        userType: accountData.userType,
                        shopid: accountData.shopId,
                    }
                };
            if (!accountData.password) { //设置密码
                this.savePwd(code,curPwd,accountData,opt);
            } else {//有密码就去登陆
                this.login(code,curPwd,accountData,opt);
            }
        },
        login:function(code,curPwd,accountData,opt){
            var self = this;
            amGloble.page.login.login(accountData.mobile, accountData.password, accountData, function () {
                self.beforeShow();
                self.afterShow();
            }, function () {
                amGloble.page.userinfoResetPwd.bindMobile(true, opt);
            }, function () {
                self.savePwd(code,curPwd,accountData);
            });
        },
        savePwd:function(code,curPwd,accountData,opt){
            var self = this;
            var data = {
                code: code,
                password: Base64.decode(curPwd),
                paras: {
                    userId: accountData.userId,
                    userType: accountData.userType,
                    phone: accountData.mobile,
                    shopid: accountData.shopId,
                }
            };
            amGloble.page.userinfoResetPwd.savePwd(true, data, function () {
                self.login(code,curPwd,accountData,opt);
            });
        },
        afterShow: function () {
            var userId = amGloble.metadata.userInfo.userId;
            this.sendTime(this.getLocalTime()[userId]);
        },
        beforeHide: function () { },
        afterHide: function () { },
        // isShowArrow: function() {
        //     if (localStorage.getItem('showArrow') == 'true') {
        //         this.$arrowmore.hide();
        //     }
        // },
        // randomJoke: function() {
        //     var jokes = window.jokes;
        //     var n = Math.floor(Math.random() * jokes.length + 1) - 1;
        //     var j = jokes[n];
        //     this.$jokes.find(".icon").html(j.title);
        //     this.$jokes.find("p").html(j.content);
        // },
        clear: function () {
            this.$title.empty();
            this.$name.empty();
            this.$role.empty();
            this.$photo.empty();
            this.$table.empty();
        },
        render: function () {
            var userinfo = amGloble.metadata.userInfo,
                authority = authorities[userinfo.newRole];

            //头像
            var type = userinfo.userType == 1 ? "artisan" : "manager";
            this.$photo.html(amGloble.photoManager.createImage(type, {
                parentShopId: userinfo.parentShopId,
                updateTs: userinfo.lastphotoupdatetime
            }, userinfo.userId + ".jpg", "s"));
            //性别
            if (userinfo.sex == "F") {
                this.$photo.addClass("female");
            } else {
                this.$photo.removeClass("female");
            }
            this.$name.text(userinfo.userName); //名字
            this.$role.text(userinfo.levelName); //角色
            this.$title.empty().text(userinfo.hqName); //租户名

            // if (userinfo.newRole == 2 || userinfo.newRole == 3) {//老板也要打卡了
            //     this.$workStatus.hide();
            // }

            var _configs = amGloble.metadata.configs;
            var operatorFacility = _configs.operatorFacility ? JSON.parse(_configs.operatorFacility) : null;
            var jurisdiction = {};
            if (userinfo.newRole == 1) { //操作员
                if (_configs.operatorFacility) {
                    jurisdiction = JSON.parse(_configs.operatorFacility);
                }
            } else if (userinfo.newRole >= 4) { //员工
                if (_configs.staffFacility) {
                    jurisdiction = JSON.parse(_configs.staffFacility);
                }
            }
            // console.log(authority)
            //功能块
            if (userinfo.newRole == 3 || userinfo.newRole == 2 || userinfo.newRole == 1) {
                this.$userinfo.find(".yuyue").hide();
            }else{
                this.$userinfo.find(".yuyue").show();
            }
            for (var key in plates) {
                var obj = plates[key];
                var $thead = "<thead><tr><td>" + obj.name + "</td></tr></thead>";
                if (JSON.stringify(obj.sub) != "{}") {
                    var i = 0;
                    var $tbody = $("<tbody></tbody>")
                    var $tr = $("<tr></tr>");
                    for (var k in obj.sub) {
                        var addflag = false;
                        for (var i1 = 0; i1 < authority.length; i1++) {
                            if (jurisdiction[authority[i1]] != 0 && k == authority[i1]) {
                                addflag = true;
                                break;
                            }
                        }
                        if (!addflag) {
                            continue;
                        }
                        var module = obj.sub[k];
                        var reducescale = amGloble.metadata.shops[0].reducescale;
                        if (module.autohide && reducescale && reducescale > 1) {
                            continue;
                        };
                        if (k == 'shopMall' && _configs.hideWxmall == 'true') {
                            continue;
                        }

                        if (userinfo.newRole == 1 && k == 'appointment' && operatorFacility && operatorFacility.reservation == 0) {
                            continue;
                        }
                        if ((userinfo.newRole == 1 || userinfo.newRole == 4 || userinfo.newRole == 5 || userinfo.newRole == 6) && k == 'wheel' && operatorFacility && operatorFacility.rotate == 0) {
                            continue;
                        }
                        var $td = $("<td></td>").addClass("am-clickable");
                        var $iconDiv = $("<div></div>").addClass("icon");
                        var $iconImg = $("<img />");
                        $iconImg.attr('src', "css/img/dashboard/" + module.icon + ".png");
                        $iconDiv.append($iconImg);
                        $td.append($iconDiv);
                        $td.append(module.name);
                        $td.append($("<span></span>").addClass("num").hide())
                        if (module.page != '') {
                            $td.attr("page", module.page);
                        }
                        if (k == 'shopMall') {
                            var imgSrc = amGloble.photoManager.createImage(type, {
                                parentShopId: userinfo.parentShopId,
                                updateTs: userinfo.lastphotoupdatetime
                            }, userinfo.userId + ".jpg", "s")[0].src;
                            imgSrc = encodeURIComponent(imgSrc)
                            var sex = amGloble.metadata.userInfo.sex;
                            if (!sex)
                                sex = "1";
                            var url = imgSrc + "/" +
                                amGloble.metadata.userInfo.mobile + "/" + amGloble.metadata.userInfo.userName + "/" + sex;
                            $td.attr("href", "mall/index.html#/login/" + encodeURI(url));
                            $td.attr("data", "openWindow");
                        } else if (k == "myk") {
                            $td.attr("href", config.shareRoot + $.param({
                                tenantId: amGloble.metadata.userInfo.parentShopId
                            }));
                        }
                        if (module.permission && module.permission.indexOf(amGloble.metadata.userInfo.mgjVersion) == -1) {
                            //风尚版 || 盛传版
                            $td.addClass("disabled");
                        } else {
                            $td.removeClass("disabled");
                        }
                        $tr.append($td);
                        i++;
                        if (i % 4 == 0) {
                            $tbody.append($tr)
                            $tr = $("<tr></tr>");
                        }

                    }
                    if (i % 4 != 0) {
                        for (var j = 0; j < 4 - i % 4; j++) {
                            $tr.append("<td></td>")
                        }
                        $tbody.append($tr)
                    }
                    if (i != 0) {
                        this.$table.append($thead);
                        this.$table.append($tbody);
                    }
                }
            }
            /**
            for (var i = 0, n = 0; i < authority.length; i++) {

                if (jurisdiction[authority[i]] == 0) {
                    continue;
                }
                if (authority[i] == "myk") {

                    //美一客链接

                    if (n % 3 == 0) {
                        $tr = $('<tr><td class="am-clickable"></td><td class="am-clickable"></td><td class="am-clickable"></td></tr>');
                        $tbody.append($tr);
                    }

                    var $td = $tr.children(":eq(" + n % 3 + ")");
                    $td.append('<div class="icon myk"></div>');
                    $td.append('<div class="text">' + amGloble.metadata.userInfo.hqName + '</div>');
                    $td.append('<div class="num" style="display:none;"></div>');
                    $td.attr("href", config.shareRoot + $.param({
                        tenantId: amGloble.metadata.userInfo.parentShopId
                    }));

                    if (config.v4_tenantLogo) {
                        $td.find(".icon").html(amGloble.photoManager.createImage("tenantLogo", {
                            parentShopId: config.parentShopId
                        }, config.v4_tenantLogo));
                    }
                    n++;
                }else if(authority[i] == "shopMall"){

                    if ((amGloble.metadata.userInfo.areaid=='0755'||amGloble.metadata.userInfo.areaid=='0769') && _configs.hideWxmall!='true'){
                        //商城
                        if (n % 3 == 0) {
                          $tr = $('<tr><td class="am-clickable"></td><td class="am-clickable"></td><td class="am-clickable"></td></tr>');
                          $tbody.append($tr);
                        }
                        var imgSrc=amGloble.photoManager.createImage(type, {
                          parentShopId: userinfo.parentShopId,
                          updateTs: userinfo.lastphotoupdatetime
                        }, userinfo.userId + ".jpg", "s")[0].src;
                        imgSrc=encodeURIComponent(imgSrc)
                        var sex=amGloble.metadata.userInfo.sex;
                        if(!sex)
                        sex="1";
                        var url=imgSrc+"/"+
                              amGloble.metadata.userInfo.mobile+"/"+amGloble.metadata.userInfo.userName+"/"+sex;
                        // console.log(amGloble.metadata.userInfo.userId);
                        // console.log(amGloble.metadata.userInfo.userName);
                        // console.log(amGloble.metadata.userInfo.mobile);
                        // console.log(amGloble.metadata.userInfo.sex);
                        // console.log(amGloble.metadata.userInfo.logo);
                        // console.log(amGloble.metadata);
                        var $td = $tr.children(":eq(" + n % 3 + ")");
                        $td.append('<div class="icon m17"></div>');
                        $td.append('<div class="text">美美汇</div>');
                        $td.append('<div class="num" style="display:none;"></div>');
                        $td.attr("href", "mall/index.html#/login/"+encodeURI(url));
                        $td.attr("data", "openWindow");
                        n++;
                    }
                } else {
                    var module = modules[authority[i]];
                    var reducescale = amGloble.metadata.shops[0].reducescale;
                    //缩账时隐藏
                    if (module.autohide && reducescale && reducescale > 1) {
                        continue;
                    };

                    if (n % 3 == 0) {
                        $tr = $('<tr><td class="am-clickable"></td><td class="am-clickable"></td><td class="am-clickable"></td></tr>');
                        $tbody.append($tr);
                    }

                    var $td = $tr.children(":eq(" + n % 3 + ")");
                    if (module.permission && module.permission.indexOf(amGloble.metadata.userInfo.mgjVersion) == -1) {
                        //风尚版 || 盛传版
                        $td.addClass("disabled");
                    } else {
                        $td.removeClass("disabled");
                    }
                    //缩账时隐藏
                    $td.append('<div class="icon ' + module.iconClass + '"></div>');
                    $td.append('<div class="text">' + module.name + '</div>');
                    $td.append('<div class="num" style="display:none;"></div>');
                    $td.attr("href", module.href).attr("page", module.page);
                    n++;
                }
            }
            */

            //资料不全给头部加红点
            if (userinfo.userType == 1 && (!userinfo.cutPrice || !userinfo.bio || !userinfo.tags)) {
                this.$user.addClass("dot");

            } else {
                this.$user.removeClass("dot");
            }

            //判断是否显示向下箭头
            // var _length = this.$table.find('tbody td').length;
            // if (_length > 9) {
            //     this.$jokes.find('.arrowmore').show();
            // }

            //下方随机出现一段吹牛文字
            // this.randomJoke();
            // this.refresh();
        },
        getDashbordCount: function () {
            var user = amGloble.metadata.userInfo;
            var self = this;

            // amGloble.loading.show("正在获取,请稍候...");
            amGloble.api.dashboard.exec({
                shopid: user.shopId,
                empid: user.userId,
                userType: user.userType,
                appUserId: user.appUserId
            }, function (ret) {
                // amGloble.loading.hide();
                if (ret.code == 0) {
                    // ret.content.reservationNum = 12;
                    if (ret.content.reservationNum) {
                        self.$table.find('td[page="reservation"] > .num').show().text(ret.content.reservationNum);
                    } else {
                        self.$table.find('td[page="reservation"] > .num').hide();
                    }
                    if (ret.content.currentServiceNum) {
                        self.$table.find('td[page="serviceManagement"] > .num').show().text(ret.content.currentServiceNum);
                    } else {
                        self.$table.find('td[page="serviceManagement"] > .num').hide();
                    }
                    if (ret.content.todoListNum) {
                        self.$table.find('td[page="todoList"] > .num').show().text(ret.content.todoListNum);
                    } else {
                        self.$table.find('td[page="todoList"] > .num').hide();
                    }
                    if (ret.content.workStatus == 0) { //休息
                        self.$workStatus.addClass("rest");
                    } else { //工作中
                        self.$workStatus.removeClass("rest");
                    }
                    amGloble.setMessageDot(ret.content.pushMessageNum);
                } else {
                    amGloble.msg(ret.message || "数据获取失败，请重试！", true);
                }
            });
            if (user.newRole != 3 && user.newRole != 2 && user.newRole != 1) {
                console.log(user.userId)
                amGloble.api.reservationCount.exec({
                    shopId: user.shopId,
                    barberId: user.userId
                }, function (ret) {
                    // amGloble.loading.hide();
                    if (ret.code == 0) {
                        self.$userinfo.find(".yuyue span").text(ret.content)
                    } else {
                        amGloble.msg(ret.message || "数据获取失败，请重试！", true);
                    }
                });
            }
            // user.appUserId = null;
            //如果拿到了pushToken,但是此设备没有注册
            if (config.pushToken && !user.appUserId) {
                $.am.debug.log('重新注册设备');
                amGloble.api.registerDevice.exec({
                    "parentShopId": user && user.parentShopId,
                    "userId": user && user.userId,
                    "userName": user && user.mobile,
                    "userType": user && user.userType,
                    "deviceType": device.platform != "Android" ? 1 : 2,
                    "deviceId": device.uuid,
                    "sysInfo": "",
                    "pushToken": config.pushToken
                }, function (ret) {
                    console.log(ret);
                    if (ret.code == 0) {
                        amGloble.api.metadata.exec({
                            parentShopId: config.parentShopId,
                            token: config.token
                        }, function (ret, isLocal) {
                            // amGloble.loading.hide();
                            if (ret.code == 0 && ret.content) {
                                amGloble.metadata = amGloble.processMetadata($.extend(true, {}, ret.content));
                                //初始化下拉菜单
                                amGloble.storeSelect.init();
                            }
                        }, 1);
                    } else {
                        amGloble.msg(ret.message || "数据获取失败，请重试！", true);
                    }
                });
            }
        }
    });

})();



//
