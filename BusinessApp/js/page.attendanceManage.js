(function(){
    amGloble.page.attendanceManage = new $.am.Page({
        id:"page-attendanceManage",
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
        init:function(){
            var _this  = this;

            this.shopSettingMap = {};

            this.$list = this.$.find(".recordList");
            this.$item = this.$list.find(".item:first").remove();

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
                // enableDept: true, //是否启用部门选择器
                // enableLevel: true, //是否启用部门选择器
                onDatePickerClick: function() {
                    // if (_this.isLandscape) {
                    //     _this.$right.trigger("vclick");
                    // }
                },
                onchange: function() { //条件修改时触发
                    _this.getShopShiftSetting(function(settingShift){
                        if(settingShift){
                            amGloble.metadata.shiftSettingList = settingShift;
                        }
                    });
                    _this.getData(function(list){
                        _this.render(list);
                    });
                    
                }
            });
            this.$header.children(".right.ellips").vclick(function () {
                var display = _this.$.find(".menu-list").css('display');
                if (display == 'none') {
                    _this.$.find(".menu-list").slideDown(200);
                    _this.$.find(".menu-list-mask").show();
                }
            });
            this.$header.on("vclick",".setTime",function(){
                var data = _this.getSearchData();
                $.am.changePage(amGloble.page.settingShift,"slideleft",{shopId:data.shopId});
            });
            this.$.find(".menu-list-mask").vclick(function () {
                _this.$.find(".menu-list").slideUp(200);
                _this.$.find(".menu-list-mask").hide();
            })
            this.$.find(".menu-list li").vclick(function () {
                var index = $(this).data("index");
                _this.$.find(".menu-list").slideUp(200);
                _this.$.find(".menu-list-mask").hide();
                $(this).addClass("selected").siblings().removeClass("selected");
                if(index == 1){
                    _this.reportFilter.setOpt(_this.getOpt('ymd'));
                }else{
                    _this.reportFilter.setOpt(_this.getOpt('single'));
                }
                _this.getData(function(list){
                    _this.render(list);
                });
            });

            this.$.on("vclick",".c-operate",function(e){
                e.stopPropagation();
                if(!_this.checkIsAllow()){
                    amGloble.msg("您没有权限修改考勤记录！");
                    return;
                }
                var data = $(this).parents(".item").data("item");
                var searchData = _this.getSearchData();
                data.searchTime= _this.getSearchTime(data);
                data.shopId    = searchData.shopId;
                _this.attendanceOperate.show(data);
            }).on("vclick",".recordList .item",function(){
                var data = _this.getSearchData();
                var item = $(this).data("item");
                $.am.changePage(amGloble.page.attendanceRecord,"slideleft",{
                    shopId:data.shopId,
                    employeeId:item.employeeId,
                    isManage:true,
                    name:item.name,
                    pushToken:item.pushToken
                });
            }).on("vclick",".am-page-error .button-common",function(){
                _this.getData(function(list){
                    _this.render(list);
                });
            });
            this.attendanceOperate = new amGloble.attendanceOperate({
                target:this.$,
                success:function(){
                    _this.getData(function(list){
                        _this.render(list);
                    });
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
        getOpt:function(datePickerType){
            var opt = {
                datePickerType:datePickerType,
                enableShop:false,
                refresh:true
            };
            var userInfo = amGloble.metadata.userInfo;
            if(userInfo.shopType==0 && (userInfo.newRole==2 || userInfo.newRole==3)){
                opt.enableShop = true;
                opt.hideSCshop = true;
            }
            return opt;
        },
        getSearchTime:function(data){
            var filter = this.reportFilter.getValue();
            var range = filter.range;
            var period = this.getPeriod(range);
            var t = period.split("_");
            var d = new Date(Number(t[0]));
            return d.getTime();
        },
        checkShiftSetting:function(){
            var shiftSettingList = amGloble.metadata.shiftSettingList;
            var userInfo = amGloble.metadata.userInfo;
            if(userInfo.shopType==0 && (userInfo.newRole==2 || userInfo.newRole==3)){//总部老板
                return;
            }
            if(!shiftSettingList.business_closingtime && !shiftSettingList.shiftSetting.length){
                if(userInfo.newRole==2 || userInfo.newRole==3){
                    var shopid = amGloble.metadata.userInfo.shopId;
                    if(amGloble.metadata.userInfo.newRole==3){
                        var _shopid = this.reportFilter.getShop();
                        shopid = _shopid.shopId;
                    }
                    setTimeout(function(){
                        $.am.changePage(amGloble.page.settingShift,"slideleft",{shopId:shopid});
                    },500);
                }else{
                    amGloble.msg("请先联系管理员配置班次！");
                    $.am.page.back();
                }
                
            }
        },
        beforeShow:function(paras){
            if(paras && paras=='back'){
                return;
            }
            var _this=this;
            this.$list.empty();
            this.$.find(".menu-list li").removeClass("selected");
            this.checkShiftSetting();
            this.reportFilter.setOpt(this.getOpt('single'));
            //校验是否能配置班次
            var userInfo = amGloble.metadata.userInfo;
            if(userInfo.shopType==0 && (userInfo.newRole==2 || userInfo.newRole==3)){//总部
                this.$.find(".setTime").hide();
                //总部要去拿门店班次
                this.getShopShiftSetting(function(settingShift){
                    if(settingShift){
                        amGloble.metadata.shiftSettingList = settingShift;
                    }
                });
            }else{
                this.$.find(".setTime").show();
            }
            this.getData(function(list){
                _this.render(list);
            });
        },
        afterShow:function(){},
        beforeHide:function(){},
        getShiftData:function(data,cb){
            var _this = this;
            //amGloble.loading.show("正在加载,请稍候...");
            amGloble.api['shiftList'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    _this.setStatus("normal");
                    cb && cb(ret);
                } else {
                    _this.setStatus("error");
                }

            });
        },
        getShopShiftSetting:function(cb){
            var _this = this;
            var _shopid = this.reportFilter.getShop();
            var shopid = _shopid.shopId;
            var map = this.shopSettingMap;
            if(map[shopid]){
               cb && cb(map[shopid]);
            }else{
                this.getShiftData({shopId:shopid},function(ret){
                    _this.shopSettingMap[shopid] = ret.content;
                    cb && cb(ret.content);
                });
            }
            
        },
        getDateDiff:function(times){//计算两个时间差
            var d1 = new Date(times);
            var h = Math.floor(d1/60);
            var m = Math.ceil(d1%60);
            return h + "时" + m + "分";
        },
        getLineDiff:function(lineReference,t1,t2){
            //计算left和width
            var min  = lineReference[0];//最小参照
            var max  = lineReference[1];//最大参照  比max还大的绝对是异常的
            var l    = Math.ceil(100*(t1-min)/(max-min));
            var w    = Math.ceil(100*(t2-t1)/(max-min));
            return {
                left:l,
                width:w
            }
        },
        getCloseTime:function(time){
            var business_closingtime = amGloble.metadata.shiftSettingList.business_closingtime || "23:59";
            var date = new Date(time);
            var s = business_closingtime.split(":");
            date.setHours(s[0]);
            date.setMinutes(s[1]);
            return date.getTime();
        },
        getLineReference:function(list){//获取最大最小参照数据
            var s1=[],s2=[],temp=[];
            //去掉异常卡
            if(list && list.length){
                for(var i=0;i<list.length;i++){
                    var item = list[i];
                    if(item.status!=1){//异常卡不参与参照
                        if(item.employeeGoWorkTime && item.employeeOutWorkTime){
                            s1.push(item.employeeGoWorkTime);
                            s2.push(item.employeeOutWorkTime);
                        }
                        if(item.employeeGoWorkTime && !item.employeeOutWorkTime){
                            s1.push(item.employeeGoWorkTime);
                            s2.push(this.getCloseTime(item.employeeGoWorkTime));
                        }
                    }
                }
            }
            var min = s1.sort(function(a,b){
                return a-b;
            });
            var max = s2.sort(function(a,b){
                return b-a;
            });
            return [min.shift(),max.shift()];
        },
        getTotalDate:function(date){
            
        },
        getPeriod:function(range){
            var period = '';
            var s1,s2;
            if($.isArray(range)){//区间
                var d1 = new Date(range[0]);
                var d2 = new Date(range[1]);
                s1 = d1.format("yyyy/mm/dd") + " 00:00:00";
                s2 = d2.format("yyyy/mm/dd") + " 23:59:59";
            }else{//某一天
                var d  = new Date(range);
                s1 = d.format("yyyy/mm/dd") + " 00:00:00";
                s2 = d.format("yyyy/mm/dd") + " 23:59:59";
            }
            return new Date(s1).getTime() + "_" + new Date(s2).getTime();
        },
        getSearchData:function(){
            var filter = this.reportFilter.getValue();
            var range  = filter.range;
            var period = this.getPeriod(range);
            var shopid = amGloble.metadata.userInfo.shopId;
            var userInfo = amGloble.metadata.userInfo;
            if(userInfo.shopType==0 && (userInfo.newRole==2 || userInfo.newRole==3)){
                var _shopid = this.reportFilter.getShop();
                shopid = _shopid.shopId;
            }
            return {
                shopId:shopid,
                period:period
            }
            
        },
        setWorkTime:function(item){
            if(item.employeeGoWorkTime && item.employeeOutWorkTime){
                return Math.floor((item.employeeOutWorkTime - item.employeeGoWorkTime)/(1000*60));
            }
            return 0;
        },
        render:function(list){
            var _this=this;
            this.$list.empty();
            var index = this.$.find(".menu-list li.selected").index();
            if(list && list.length){
                var lineReference = this.getLineReference(list);
                console.log(lineReference);
                for(var i=0;i<list.length;i++){
                    var item  = list[i];
                    // if(item.status==3){//未出勤加的备注
                    //     continue;
                    // }
                    if(item.status!=1 && index==1){//异常
                        continue;
                    }
                    var $item = this.$item.clone(true,true);
                    var time  = ''; 
                    var colorArr = ["#213F83","#D42A2A","#2DBD84"];//蓝色 红色 绿色
                    var _color=colorArr[2];
                    var userInfo = amGloble.metadata.userInfo;
                    $item.find(".p3 span").text(item.msName);
                    $item.find(".c-users .p1").text(item.name);
                    item.workTime = this.setWorkTime(item);
                    if(item.workTime){
                        $item.find(".c-users .p2").text(this.getDateDiff(item.workTime));
                    }else{
                        $item.find(".c-users .p2").text("工作中");
                    }
                    if(!item.employeeGoWorkTime){
                        $item.find(".c-users .p2").text("未出勤");
                        $item.find(".c-right").addClass("status3");
                    }
                    var type = item.roleType == 1 ? "artisan" : "manager";
                    $item.find(".c-logo").html(amGloble.photoManager.createImage(type, {
                        parentShopId: userInfo.parentShopId,
                        updateTs: userInfo.lastphotoupdatetime
                    }, item.employeeId + ".jpg", "s"));
                    $item.find(".c-users .p3 span").text(item.msName);
                    if(item.employeeGoWorkTime){
                        time += new Date(item.employeeGoWorkTime).format("HH:MM");
                    }
                    if(item.employeeOutWorkTime){
                        time += " - ";
                        if(new Date(item.employeeOutWorkTime).format("yyyy/mm/dd")!=new Date(item.employeeGoWorkTime).format("yyyy/mm/dd")){
                            time += new Date(item.employeeOutWorkTime).getDate() + "日 " + new Date(item.employeeOutWorkTime).format("HH:MM");
                        }else{
                            time += new Date(item.employeeOutWorkTime).format("HH:MM");
                        }
                        
                    }
                    if(item.employeeGoWorkTime && !item.employeeOutWorkTime){
                        time += "-";
                        time += "至今";
                    }
                    $item.find(".p4").html(time);
                    //渲染线
                    if(item.workStatus==0){
                        _color = colorArr[2];
                    }else{
                        _color = colorArr[0];
                    }
                    if(item.status == 1){
                        _color = colorArr[1];
                    }
                    var lineobj = this.getLineDiff(lineReference,item.employeeGoWorkTime,item.employeeOutWorkTime);
                    $item.find(".c-line").css({
                        "width":lineobj.width + '%',
                        "left":lineobj.left + '%',
                        "background-color":_color
                    });
                    if(!item.employeeGoWorkTime){
                        $item.find(".c-line").hide();
                    }
                    //渲染状态以及图标
                    var $i = $item.find(".p3 i");
                    if(item.status==1){//异常
                        $i.eq(0).html("异常").addClass("show");
                        $i.eq(0).css("background-color",colorArr[1]);
                        $item.find(".c-right").addClass("status2");
                        if(item.workStatus==1){//迟到
                            $i.eq(1).html("迟到").addClass("show");
                            $i.eq(1).css("background-color",colorArr[0]);
                        }
                    }else{
                        if(item.workStatus==1){
                            $i.eq(0).html("迟到").addClass("show");
                        }
                        if(item.workStatus==2){
                            $i.eq(0).html("早退").addClass("show");
                        }
                        if(item.workStatus==3){
                            $i.eq(0).html("迟到").addClass("show");
                            $i.eq(1).html("早退").addClass("show");
                        }
                    }
                    // if(item.remark){
                    //     $item.find(".c-operate .icon-fankuitianxie").css("color",colorArr[2]);
                    // }
                    if(item.status==3){
                        $item.find(".c-users .p2").text("未出勤");
                        $item.find(".c-right").addClass("status3");
                    }
                    $item.data("item",item);
                    this.$list.append($item); 
                }
            }else{
                _this.setStatus("empty");
            }
            if(this.$list.find(".item").size()==0){
                amGloble.msg("暂无数据！");
            }
            this.scrollview.refresh();
        },
        getUserList:function(){
            
        },
        getData:function(cb){
            var _this=this;
            var data = this.getSearchData();
            console.log(data);
            //差上班和下班时间
            //员工ID
            // cb && cb([{
            //     "id": 1001 , // 员工考勤主键ID
            //     "employeeId":12121,
            //     "name":"时间1",
            //     "ssname" : "早班",
            //     "status": 0 ,   // 异常状态 0：正常 1：异常
            //     "workstatus": 0, // 工作状态 0：正常 1：迟到 2：早退
            //     "remark" : "",  // 备注，异常原因描述
            //     "goworktime":1520812800000,
            //     "outworktime": 1520841600000, // 下班打卡时间
            //     "times" : 524  // 工作时长 分钟
            // },{
            //     "id": 1001 , // 员工考勤主键ID
            //     "employeeId":12122,
            //     "name":"时间2",
            //     "ssname" : "早班",
            //     "status": 0 ,   // 异常状态 0：正常 1：异常
            //     "workstatus": 1, // 工作状态 0：正常 1：迟到 2：早退
            //     "remark" : "回家吃年饭",  // 备注，异常原因描述
            //     "goworktime":1520809200000,
            //     "outworktime": 1520848800000, // 下班打卡时间
            //     "times" : 524  // 工作时长 分钟
                
            // },{
            //     "id": 1001 , // 员工考勤主键ID
            //     "employeeId":12123,
            //     "name":"时间3",
            //     "ssname" : "早班",
            //     "status": 1 ,   // 异常状态 0：正常 1：异常
            //     "workstatus": 0, // 工作状态 0：正常 1：迟到 2：早退
            //     "remark" : "回家吃年饭",  // 备注，异常原因描述
            //     "goworktime":1520820000000,
            //     "outworktime": 1520837400000, // 下班打卡时间
            //     "times" : 524  // 工作时长 分钟
            // }]);
            // return;
            
            //amGloble.loading.show("正在加载,请稍候...");
            this.setStatus("loading");
            amGloble.api['employeeRecord'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    _this.setStatus("normal");
                    cb && cb(ret.content);
                } else {
                    _this.setStatus("error");
                }

            });
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