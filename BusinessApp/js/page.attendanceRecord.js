(function () {
    var timeController = {
        getRoundTime:function(time){
            //获取某一天内的随机时间
            var t1 = new Date(time);
            var t2 = new Date(time);
            t1.setHours(this.getNumber(24));
            t1.setMinutes(this.getNumber(60));
            t1.setSeconds(this.getNumber(60));
            t2.setHours(this.getNumber(24));
            t2.setMinutes(this.getNumber(60));
            t2.setSeconds(this.getNumber(60));
            var res = [new Date(t1).getTime(),new Date(t2).getTime()];
            res.sort(function(a,b){
                return a-b
            });
            return res;
        },
        getNormalTime:function(time,t1,t2,status,workStatus){
            var d = new Date(time);
            var s1,s2,t3,t4;
            s1 = t1.split(":");
            s2 = t2.split(":");
            t3 = new Date(time);
            t4 = new Date(time);
            if(workStatus==0){
                t3.setHours(Number(s1[0])-1);
                t4.setHours(Number(s2[0])+1);
            }else if(workStatus==1){//迟到
                t3.setHours(Number(s1[0])+1);
                t4.setHours(Number(s2[0])+1);
            }else if(workStatus==2){//早退
                t3.setHours(s1[0]-1);
                t4.setHours(s2[0]-1);
            }else{//迟到+早退
                t3.setHours(Number(s1[0])+1);
                t4.setHours(s2[0]-1);
            }
            t3.setMinutes(this.getNumber(60));
            t3.setSeconds(this.getNumber(60));
            t4.setMinutes(this.getNumber(60));
            t4.setSeconds(this.getNumber(60));
            if(status==1){//异常
                t4.setHours(s2[0]+10);
            }
            var res = [new Date(t3).getTime(),new Date(t4).getTime()];
            res.sort(function(a,b){
                return a-b
            });
            return res;
        },
        getNumber:function(number){
            return Math.floor(Math.random()*number);
        },
        getRoundData:function(time){
            //获取随机数据
            var msName = ["早班","中班","晚班"];
            var times  = this.getRoundTime(time); 
            var res = {
                "employeeId": 16890,
                "name": "刀男",
            };
            res.msName = msName[this.getNumber(3)];
            res.employeeGoWorkTime = times[0];
            res.employeeOutWorkTime = times[1];
            res.status = this.getNumber(2);
            if(res.status==1){
                res.workStatus = this.getNumber(2);
            }else{
                res.workStatus = this.getNumber(4);
            }
            res.workTime = Math.floor(res.employeeOutWorkTime-res.employeeGoWorkTime)/(1000*60*60);
            res.remark   = (Math.random()-0.5)?"测试说明" + Math.random():"";
            return res;
        },
        getNormalData:function(time){
            //获取正常数据
            //Mock三个班次信息
            var shiftConfig = [{
                name:"早班",
                goWorkTime:"08:00",
                outWorkTime:"16:00"
            },{
                name:"中班",
                goWorkTime:"10:00",
                outWorkTime:"20:00"
            },{
                name:"晚班",
                goWorkTime:"15:00",
                outWorkTime:"23:00"
            }];
            var res = {
                "employeeId": 16890,
                "name": "刀男"
            };
            res.status = (Math.random()-0.8)>0?"1":"0";
            if(res.status==1){//异常
                res.workStatus = this.getNumber(2);
            }else{
                res.workStatus = this.getNumber(4);
            }
            var shift  = shiftConfig[this.getNumber(3)];
            var times  = this.getNormalTime(time,shift.goWorkTime,shift.outWorkTime,res.status,res.workStatus);
            res.msName = shift.name;
            res.employeeGoWorkTime = times[0];
            res.employeeOutWorkTime = times[1];
            
            res.workTime = Math.floor(res.employeeOutWorkTime-res.employeeGoWorkTime)/(1000*60*60);
            res.remark   = Math.random()>0.5?((Math.random()-0.5)?"测试说明" + Math.random():""):"";
            return res;
        },
        spliceArr:function(list){
            var temp = list;
            var num = this.getNumber(10);
            for(var i=0;i<num;i++){
                temp.splice(this.getNumber(temp.length),1);
            }
            return temp;
        },
        getMockData: function (time,isNormal) {
            var res = [];
            var list = this.getTimeList(time);
            //随机剔除几个 造成未出勤
            list = this.spliceArr(list);
            //生成一个月的随机数据
            for(var i = 0;i<list.length;i++){
                if(isNormal){//正常数据
                    res.push(this.getNormalData(list[i].date));
                }else{//随机数据
                    res.push(this.getRoundData(list[i].date));
                }
            }
            return res;
        },
        getTotalDate: function (date) {
            var date = new Date(date);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var d = new Date(year, month, 0);
            return d.getDate();
        },
        complte: function (list) {
            var l = list.length;
            if (list && l) {
                var p1 = list.slice(0, 1);
                var p2 = list.slice(-1);
                Array.prototype.unshift.apply(list, new Array(p1[0].week));
                if (p2[0].week == 6 && l < 28) {
                    Array.prototype.push.apply(list, new Array(6));
                } else {
                    Array.prototype.push.apply(list, new Array(6 - p2[0].week));
                }
            }
            return list;
        },
        getTimeList: function (date) {//一个月的数据
            var res = [];
            var total = this.getTotalDate(date);
            for (var i = 1; i <= total; i++) {
                var ret = {};
                var d = new Date(new Date(date).setDate(i));
                ret.number = i;
                ret.week = d.getDay();
                ret.date = d.getTime();
                res.push(ret);
            }
            return res;
        }
    }
    amGloble.page.attendanceRecord = new $.am.Page({
        id: "page-attendanceRecord",
        backButtonOnclick : function() {
            try{
                window.plugins.actionsheet.hide();
                atMobile.nativeUIWidget.hidePopupMenu();
            }catch(e){
                $.am.debug.log(e.message);
                atMobile.nativeUIWidget.hidePopupMenu();
            }
            
			$.am.page.back();
		},
        init: function () {
            var _this = this;

            this.showEmployeeMap = {};

            this.isMock = false;//是否开启mock数据

            this.$recordMain = this.$.find(".recordMain");
            this.$recordcontent = this.$.find(".recordcontent");
            this.$item = this.$recordcontent.find(".item:first").remove();
            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
                onchange: function () { //条件修改时触发
                    var val = new Date(_this.reportFilter.getDate());
                    _this.getData(function (content) {
                        _this.render(content);
                    });
                },
                refreshEmp:function(){
                    _this.getEmps(function(emp){
                        _this.reportFilter.refreshEmps(emp);
                    });
                    
                }
            });

            this.attendanceOperate = new amGloble.attendanceOperate({
                target: this.$,
                success:function(){
                    _this.getData(function (content) {
                        _this.render(content);
                    });
                },
                close:function(){
                    _this.$recordcontent.find(".item").removeClass("active");
                }
            });
            this.$recordcontent.on("vclick", ".item", function () {
                var data = $(this).data("item");
                data = _this.addParams(data);
                if(data.isEmpty) return;//空格子 以及还没到的日子
                if(data && data.status != undefined && data.status!=3){
                    if (!$(this).hasClass("unoperate")) {
                        if (_this.paras && _this.paras.isManage) {
                            if(!_this.checkIsAllow()){
                                amGloble.msg("您没有权限修改考勤记录！");
                                return;
                            }
                            $(this).addClass("active");
                            _this.attendanceOperate.show(data);
                        } else {
                            $.am.changePage(amGloble.page.editException, "slideleft", data);
                        }
                    }
                }else{//未出勤
                    if (_this.paras && _this.paras.isManage) {
                        if(!_this.checkIsAllow()){
                            amGloble.msg("您没有权限修改考勤记录！");
                            return;
                        }
                        $(this).addClass("active");
                        _this.attendanceOperate.show(data);
                    }else{//员工未出勤
                        if(!data.isEmpty){
                            data.status = 3;
                            data.workStatus = 0; 
                            $.am.changePage(amGloble.page.editException, "slideleft", data);
                        }
                        
                    }
                }
            });
            this.$.on("vclick", ".am-page-error .button-common", function () {
                _this.getData(function (content) {
                    _this.render(content);
                });
            }).on("vclick",".unbundling",function(){
                amGloble.confirm("提示", "此操作将会解绑员工账号与设备的绑定，确定要解绑吗？", "确定", "取消", function() {
                    _this.unbundling({
                        shopId:_this.paras.shopId,   
                        pushToken:_this.paras.pushToken
                    },function(){
                        amGloble.msg("操作成功！");
                    });
                }, function() {});
            }).on("vclick",".sign",function(){
                try{
                    cordova.plugins.barcodeScanner.scan(function (result) {
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
                            amGloble.page.dashboard.userAttendance(text,function(){
                                _this.getData(function (content) {
                                    _this.render(content);
                                });
                            });
                        }else{
                            amGloble.msg("请扫描考勤二维码！");
                        }
                    });
                }catch(e){

                }
            });
        },
        unbundling:function(data,cb){
            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api['cleanPushToken'].exec(data, function (ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    cb && cb(ret.content);
                } else {
                    amGloble.msg(ret.message || "网络请求出错，请稍后重试！");
                }

            });
        },
        checkIsAllow:function(){
            var optstr = amGloble.metadata.userInfo.operatestr;
            if(optstr){
                if(optstr.indexOf("V2")!=-1){
                    return false;
                }else{
                    return true;
                }
            }else{
                return true;
            }
            
        },
        getDutyName:function(dutyId){
            var employeeLevels = amGloble.metadata.employeeLevels;
            for(var i=0;i<employeeLevels.length;i++){
              var item = employeeLevels[i];
              if(item.dutyId==dutyId){
                return item.name;
              }
            }
            return "";
        },
        getEmps:function(cb){
            var _this  = this;
            var shopId = this.getCurrentShopId();
            if(!this.showEmployeeMap[shopId]){
                this.getlistEmployee(shopId,function(list){
                    var res = [];
                    for(var i=0;i<list.length;i++){
                        var item = list[i];
                        var ret  = {};
                        ret.name = item.name;
                        if(item.dutyId || item.roleType){
                            var dutyName = _this.getDutyName(item.dutyId);
                            if(dutyName){
                                ret.vname = dutyName + " - " + item.name;
                            }else{
                                var nameMap = ['','操作员 - ','管理员 - ','老板 - '];
                                if(item.roleType && item.roleType<4){
                                    ret.vname= nameMap[item.roleType] + item.name;
                                }else{
                                    ret.vname= item.name;
                                }
                                
                            }
                        }else{
                            ret.vname= item.name;
                        }
                        ret.empid= item.employeeId;
                        res.push(ret);
                    }
                    _this.showEmployeeMap[shopId] = res;
                    cb && cb(res); 
                });
            }else{
                cb && cb(this.showEmployeeMap[shopId]);
            }
        },
        addParams:function(data){//弹框需要新加数据过去
            var res = data;
            if(this.paras && this.paras.isManage){
                var empdata = this.reportFilter.getEmp();
                if (empdata) {
                    res.employeeId = empdata.employeeId || empdata.empid;
                    res.name       = empdata.name || empdata.empname;
                } else {
                    res.employeeId = this.paras.employeeId;
                    res.name       = this.paras.name;
                }
                res.searchTime = this.getSearchTime(data);
                res.shopId     = this.paras.shopId;
            }else{//编辑备注
                res.employeeId = amGloble.metadata.userInfo.userId;
                res.shopId     = amGloble.metadata.userInfo.shopId;
                res.name       = amGloble.metadata.userInfo.userName;
                res.remark     = data.remark;
                res.roleType   = amGloble.metadata.userInfo.userType;
                if(data.isEmpty){
                    res.isEmpty = data.isEmpty;
                }
            }
            return res;
        },
        getSearchTime:function(data){
            //获取点击的块的时间
            var number = data.number;
            var filter = this.reportFilter.getValue();
            var range = filter.range;
            var period = this.getPeriod(range);
            var t = period.split("_");
            var d = new Date(Number(t[0]));
            d.setDate(number);
            return d.getTime();
        },
        beforeShow:function (paras) {
            if(paras && paras=='back'){
                return;
            }
            this.$recordcontent.empty();
            if(paras.isManage && paras.pushToken){
                this.$.find(".unbundling").show();
            }else{
                this.$.find(".unbundling").hide();
            }
            if(paras.isManage){
                this.$header.find(".text").html(paras.name + "的考勤记录");
                this.$header.find(".sign").hide();
            }else{
                this.$header.find(".text").html("考勤记录");
                this.$header.find(".sign").show();
            }
            this.paras = paras;
            var _this = this;
            var opt = {
                datePickerType: 'ym',
                showEmployeeLevel:true
            };
            if (paras && paras.employeeId) {
                opt.enableEmp = true;
            }else{
                opt.enableEmp = false;
            }
            this.reportFilter.setOpt(opt);
            if (paras && paras.employeeId) {
                this.reportFilter.setEmp(paras);
            }else{
                this.getData(function (content) {
                    _this.render(content);
                });
            }
            
        },
        getCurrentShopId:function(){
            var shopId = amGloble.metadata.userInfo.shopId;
            if(this.paras && this.paras.shopId){
                shopId = this.paras.shopId;
            }
            return shopId;
        },
        afterShow: function () {
            //this.getlistEmployee();
        },
        beforeHide: function () { },
        getlistEmployee:function(shopId,cb){
            var _this=this;
            //amGloble.loading.show("正在加载,请稍候...");
            amGloble.api['listEmployee'].exec({
                shopId:shopId
            }, function (ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    _this.setStatus("normal");
                    cb && cb(ret.content);
                } else {
                    _this.setStatus("error");
                }

            });
        },
        getRenderStatus:function(item){
            //获取render状态
            var res = {
                _class:"",//最终class
                status:null,//左上角标
                remark:0,//0不显示 1灰色 2亮色 右上角标
                fontColor:[null,null],//blue orange red 下方时间的颜色
                isEmpty:true//是否是空格子
            }
            if(!item){
                res.isEmpty = true;
            }else{
                res.isEmpty = false;
                var data    = item.data;
                var isToDay = new Date(item.date).format("yyyy/mm/dd") === new Date().format("yyyy/mm/dd");
                if(data){//有考勤数据
                    //if(data.status!="0" || data.workStatus!="0") 
                    if(data.remark) res.remark = 2;
                }else{//没有考勤数据

                }
            }

        },
        render: function (list) {
            console.log("获取到的数据",list);
            this.$recordcontent.empty();
            var timeList = timeController.getTimeList(this.reportFilter.getDate());
            timeList = this.extendData(timeList, list);//补全dom数据
            timeList = timeController.complte(timeList);//补全空格
            var searchData = this.getSearchData();
            console.log("timeList",timeList);
            for (var i = 0; i < timeList.length; i++) {
                var item = timeList[i],
                    $item = this.$item.clone(true, true);
                var isEmpty = false;
                //var renderStatus = this.getRenderStatus();

                if (!item) {//为null的空格子
                    $item.find(".item-status").hide();
                    $item.find(".item-operate").hide();
                    $item.find(".item-content").hide();
                } else {
                    var data = item.data;
                    var isToDay = new Date(item.date).format("yyyy/mm/dd") == new Date().format("yyyy/mm/dd");
                    if(data && data.remark){
                        $item.find(".item-operate").addClass("selected");
                    }
                    $item.find(".item-content .p1").html(item.number);
                    if (isToDay) {//今天
                        $item.addClass("selected");
                    }
                    if (item.data && data.status!=3) {//有考勤数据
                        //"status"   // 异常状态 0：正常 1：异常
                        //"workStatus // 工作状态 0：正常 1：迟到 2：早退
                        
                        $item.find(".p2").html(data.msName);
                        if (data.status == 0) {//正常
                            $item.find(".item-status").hide();
                        } else {//异常
                            $item.find(".item-status .item-status1").html("异常").addClass("red").show();
                            $item.find(".item-status .item-status2").hide();
                            $item.find(".item-operate").show();
                            $item.find(".p4").addClass("red");
                        }
                        if (data.workStatus == 0) {//工作状态
                            if (data.status == 0) {//并且非异常
                                $item.find(".item-status").hide();
                                $item.find(".item-operate").hide();
                            }
                        } else {//迟到或者早退
                            $item.find(".item-status").show();
                            if (data.status != 0) {//异常 只能迟到
                                $item.find(".item-status .item-status2").html("迟到").show();
                                $item.find(".p3").addClass("blue");
                            } else {//非异常
                                if (data.workStatus == 1) {
                                    $item.find(".item-status .item-status1").html("迟到").show();
                                    $item.find(".p3").addClass("blue");
                                }
                                if (data.workStatus == 2) {
                                    $item.find(".item-status .item-status1").html("早退").show();
                                    $item.find(".p4").addClass("blue");
                                }
                                if (data.workStatus == 3) {
                                    $item.find(".item-status .item-status1").html("早退").show();
                                    $item.find(".item-status .item-status2").html("迟到").show();
                                    $item.find(".p3").addClass("blue");
                                    $item.find(".p4").addClass("blue");
                                }
                            }
                        }

                        if (data.employeeGoWorkTime) {
                            $item.find(".p3 span").html(new Date(data.employeeGoWorkTime).format("HH:MM"));
                        } else {
                            $item.find(".p3 span").html(" - : - ");
                        }
                        if (data.employeeOutWorkTime) {//打了下班卡
                            $item.find(".p4 span").html(new Date(data.employeeOutWorkTime).format("HH:MM"));
                        } else {//没打下班卡
                            if (new Date(item.date).format("yyyy/mm/dd") == new Date().format("yyyy/mm/dd")) {//今天 工作中
                                $item.find(".p4 span").html("工作中");
                            }
                            else{
                                $item.find(".p4 span").html("工作中");
                            }
                        }
                    } else {//没有考勤数据
                        $item.find(".item-status").hide();
                        $item.find(".item-operate").hide();
                        if (item.date < new Date().getTime()) {//今天以前的
                            $item.find(".p2").html("未出勤");
                            $item.find(".p3 span,.p4 span").html(" - : - ");
                            $item.addClass("outwork");
                            $item.find(".item-operate").show();
                            if(item.data && data.status==3 && data.remark){
                                $item.find(".item-operate").addClass("selected").show();
                            }
                        } else {
                            var isEmpty = true;
                            
                            //$item.addClass("unoperate");
                            $item.find(".item-operate").hide();
                            $item.find(".p2,.p3,.p4").hide();
                        }
                    }
                    if(this.paras.isManage){//管理员不需要显示
                        $item.find(".item-operate").hide();
                    }
                    $item.data("index",item.number);
                    var saveData = data || {};
                    saveData.number = item.number;
                    // console.log(saveData);
                    saveData.searchTime = searchData.period.split("_").shift();
                    if(isEmpty){
                        saveData.isEmpty = isEmpty;
                    }
                    $item.data("item", saveData);
                }
                this.$recordcontent.append($item);

            }
        },
        getSearchData: function () {
            var filter = this.reportFilter.getValue();
            var range = filter.range;
            var period = this.getPeriod(range);
            var res = {
                shopId: amGloble.metadata.userInfo.shopId,
                employeeId: amGloble.metadata.userInfo.userId,
                period: period
            }
            if (this.paras && this.paras.shopId) {
                res.shopId = this.paras.shopId;
            }
            if (this.paras && this.paras.employeeId) {
                var empdata = this.reportFilter.getEmp();
                if (empdata) {
                    res.employeeId = empdata.employeeId || empdata.empid;
                } else {
                    res.employeeId = this.paras.employeeId;
                }

            }
            return res;
        },
        getPeriod: function (range) {
            var date = new Date(range);
            var date1 = new Date(date.setDate(1));
            var date2 = new Date(date.setDate(timeController.getTotalDate(date)));
            date1.setHours(0);
            date1.setMinutes(0);
            date1.setSeconds(0);
            date2.setHours(0);
            date2.setMinutes(0);
            date2.setSeconds(0);
            return date1.getTime() + "_" + date2.getTime();
        },
        extendData: function (data, list) {
            if (list && list.length) {
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    if (item.employeeGoWorkTime) {
                        var d = new Date(item.employeeGoWorkTime).getDate();
                        data[d - 1].data = list[i];
                    }

                }
            }
            return data;
        },
        getData: function (cb) {
            var _this = this;
            var data = this.getSearchData();
            //amGloble.loading.show("正在加载,请稍候...");
            _this.setStatus("loading");
            if (this.isMock) {
                _this.setStatus("normal");
                var filter = this.reportFilter.getValue();
                var range = filter.range;
                cb && cb(timeController.getMockData(range,true));
            } else {
                amGloble.api['employeeRecord'].exec(data, function (ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0) {
                        _this.setStatus("normal");
                        console.log(ret.content);
                        cb && cb(ret.content);
                    } else {
                        _this.setStatus("error");
                    }

                });
            }
        },
        setStatus:function(status){
            var $page=this.$.removeClass("am-status-loading am-status-error am-status-empty");
            switch(status) {
				case "loading":
					//amGloble.loading.show();
					$page.addClass("am-status-loading");
					break;
				case "error":
					amGloble.loading.hide();
					$page.addClass("am-status-error");
					break;
				case "empty":
					amGloble.loading.hide();
					$page.addClass("am-status-empty");
					break;
				case "normal":
					amGloble.loading.hide();
				default:

			}
        }
    });
})();
