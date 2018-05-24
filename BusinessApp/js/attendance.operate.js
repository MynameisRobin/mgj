(function(){
    var operate = [
        '<div class="operate_mask am-clickable"></div>',
        '<div class="operate_wrapper">',
            '<div class="operate_tit">',
                '<div class="operate_tit_body">',
                    '<div class="c-left">',
                        '<span>异常</span>',
                    '</div>',
                    '<div class="c-right">',
                        '<div class="c-right-body">',
                            '<p>下班打卡超过次日03:00点是为异常，直接修改异常打卡时间，或直接取消异常均可处理。</p>',
                        '</div>',
                    '</div>',
                    '<div class="clear"></div>',
                '</div>',
            '</div>',
            '<div class="operate_selectTime">',
                '<div class="selectTime_times am-clickable"></div>',
                '<div class="selectTime_startTime am-clickable">',
                    '<input type="text" readonly="readonly" />',
                '</div>',
                '<div class="line">-</div>',
                '<div class="selectTime_endTime am-clickable">',
                    '<input type="text" readonly="readonly" />',
                '</div>',
                '<div class="clear"></div>',
            '</div>',
            '<div class="operate_remark">',
                '<div class="c-tit">异常打卡说明</div>',
                '<div class="c-content"><p>忘记打卡啦！</p></div>',
            '</div>',
            '<div class="btn_group">',
                '<div class="btns cancelNormal am-clickable">取消异常</div>',
                '<div class="btns setout am-clickable">设置为未出勤</div>',
                '<div class="btns save am-clickable">确定</div>',
            '</div>',
        '</div>'
    ];
    var attendanceOperate = function(opt){
        $.extend(this,opt);
        this.init(opt);
    }
    attendanceOperate.prototype = {
        init:function(opt){
            var _this   = this; 

            this.isEdit = false;//是否修改过了

            this.colorMap = ["#2DBD84","#F2A957","#213F83","#D42A2A"];//绿 黄 蓝 红 
            this.$dom   = $(operate.join(""));
            this.$mask  = this.$dom.eq(0);
            this.$      = this.$dom.eq(1);
            this.$save  = this.$.find(".save");
            this.$cancelNormal = this.$.find(".cancelNormal");
            this.$setout  = this.$.find(".setout");
            this.$details = this.$.find(".operate_remark"); 
            this.$tips    = this.$.find(".operate_tit .c-right");
            this.$tit     = this.$.find(".operate_tit .c-left span");

            this.$selectName = this.$.find(".selectTime_times");//选择班次名
            this.$start = this.$.find(".selectTime_startTime input");
            this.$end   = this.$.find(".selectTime_endTime input"); 

            opt.target.append(this.$dom);
            this.setOperate();
            this.reset();
            this.$mask.vclick(function(){
                _this.hide();
            });
            this.$save.vclick(function(){
                var check = _this.checkVal();
                if(!check.ispass){
                    amGloble.msg(check.msg);
                    return;
                }
                console.log(check.data);
                _this.setData(check.data,function(){
                    amGloble.msg("操作成功！");
                    _this.hide();
                    opt.success && opt.success();
                });
            });
            this.$cancelNormal.on("vclick",function(){
                //取消异常
                var check = _this.checkVal();
                if(!check.ispass){
                    amGloble.msg(check.msg);
                    return;
                }
                check.data.status = 0;//手动取消异常
                _this.setData(check.data,function(){
                    amGloble.msg("操作成功！");
                    _this.hide();
                    opt.success && opt.success();
                });
            });
            this.$setout.on("vclick",function(){
                //设置未出勤
                var data = _this.getOutData();
                _this.setData(data,function(){
                    amGloble.msg("操作成功！");
                    _this.hide();
                    opt.success && opt.success();
                });
            });
            this.$selectName.on("vclick",function(){
                //选择班次名
                var shiftSetting = _this.getShiftList(amGloble.metadata.shiftSettingList.shiftSetting);
                if(shiftSetting && shiftSetting.length){
                    amGloble.popupMenu("请选择班次",shiftSetting,function(content){
                        _this.changeShowBtn();
                        _this.$selectName.html(content.name);
                        _this.$selectName.data("item",content);
                    });
                }else{
                    amGloble.msg("请先联系管理员设置班次！");
                }
            });
            this.$start.mobiscroll().scroller({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'center',
                wheels: [
                    [{
                        data: ['当日','次日']
                    }, {
                        data: _this.getDayData()
                    },{
                        data: _this.getTimeData(1)
                    }]
                ],
                onBeforeShow:function(){
                    var start = _this.operateData.employeeGoWorkTime;
                    if(start){
                        var isToDay = new Date(start).format("yyyy/mm/dd") === new Date(_this.operateData.searchTime).format("yyyy/mm/dd");
                        var time    = new Date(start).format("HH MM");
                        if(isToDay){
                            _this.$start.mobiscroll("setVal","当日 " + time);
                        }else{
                            _this.$start.mobiscroll("setVal","次日 " + time);
                        }
                    }else{
                        _this.$start.mobiscroll("setVal","当日 10 00");
                    }
                },
                onSet:function(v){
                    _this.changeShowBtn();
                    var value = v.valueText;
                    var d     = new Date(_this.operateData.searchTime);
                    if(value){
                        var arr   = value.split(" ");
                        var words = arr.shift();
                        var text  = arr.join(":");
                        if(words=="次日"){
                            d.setDate(d.getDate()+1);
                        }
                        var saveData = new Date(d.format("yyyy/mm/dd") + " " + text);
                        this.value= text;
                        $(this).data("item",saveData.getTime());
                    }
                    
                }
            });
            this.$end.mobiscroll().scroller({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'center',
                wheels: [
                    [{
                        data: ['当日','次日']
                    }, {
                        data: _this.getDayData()
                    },{
                        data: _this.getTimeData(1)
                    }]
                ],
                onBeforeShow:function(){
                    var end = _this.operateData.employeeOutWorkTime;
                    if(end){
                        var isToDay = new Date(end).format("yyyy/mm/dd") === new Date(_this.operateData.searchTime).format("yyyy/mm/dd");
                        var time    = new Date(end).format("HH MM");
                        var dateTxt = new Date(end).getDate();
                        if(isToDay){
                            _this.$end.mobiscroll("setVal","当日 " + time);
                        }else{
                            _this.$end.mobiscroll("setVal",dateTxt + "日 " + time);
                        }
                    }else{
                        _this.$end.mobiscroll("setVal","当日 10 00");
                    }
                },
                onSet:function(v){
                    _this.changeShowBtn();
                    var value = v.valueText;
                    var d     = new Date(_this.operateData.searchTime);
                    if(value){
                        var arr   = value.split(" ");
                        var words = arr.shift();
                        var text  = arr.join(":");
                        if(words=="次日"){
                            d.setDate(d.getDate()+1);
                            this.value= "次日" + text;
                        }else{
                            this.value= text;
                        }
                        var saveData = new Date(d.format("yyyy/mm/dd") + " " + text);
                        
                        $(this).data("item",saveData.getTime());
                    }
                    
                }
            });
        },
        getDayData:function(){
            var res = [];
            //24小时
            for(var i=0;i<24;i++){
                res.push(i<10?"0"+i:i);
            }
            return res;
        },
        getTimeData:function(space){
            //具体时间 10分钟一次
            var res = [];
            for(var i=0;i<Math.ceil(60/space);i++){
                var num = i*space;
                res.push(num<10?"0"+num:num);
            }
            return res;
        },
        getOutData:function(){//设置未出勤
            var dataJson = {
                employeeGoWorkTime:this.operateData.employeeGoWorkTime,
                employeeOutWorkTime:this.operateData.employeeOutWorkTime,
                msName:this.operateData.msName
            };
            var res = {
                employeeCheckId:this.operateData.employeeCheckId,
                status:2,
                dataJson:JSON.stringify(dataJson),
                msName:"",
                name:this.operateData.name,
                shopId: this.operateData.shopId,
                operator:amGloble.metadata.userInfo.userName,
                employeeId:this.operateData.employeeId,
                employeeGoWorkTime:this.operateData.employeeGoWorkTime,
                employeeOutWorkTime:this.operateData.employeeOutWorkTime
            }
            return res;
        },
        checkVal:function(){
            var res = {
                ispass:false,
                data:{},
                msg:""
            };
            var $selectName = this.$selectName.html();
            var $start      = this.$start.val();
            var $end        = this.$end.val();
            if(!$selectName || $selectName=="请选择"){
                res.msg    = "请先选择班次！";
                return res;
            }
            if(!$start || $start == "未出勤"){
                res.msg    = "请先选择上班时间！";
                return res;
            }
            if(!$end || $end == "未出勤"){
                res.msg    = "请先选择下班时间！";
                return res;
            }
            //res.data.name = $selectName;
            res.data.employeeGoWorkTime  = new Date(this.$start.data("item")).getTime();
            res.data.employeeOutWorkTime = new Date(this.$end.data("item")).getTime();
            if(res.data.employeeGoWorkTime>res.data.employeeOutWorkTime){
                res.msg    = "上班时间必须小于下班时间！";
                return res;
            }
            var shiftData = this.getMsDataByName($selectName);
            res.data.shiftSetId = shiftData.id;
            res.data.msName = shiftData.name;
            res.data.employeeId = this.operateData.employeeId;
            res.data.shopId   = this.operateData.shopId;
            res.data.operator   = amGloble.metadata.userInfo.userName;
            var dataJson = {
                employeeGoWorkTime:this.operateData.employeeGoWorkTime,
                employeeOutWorkTime:this.operateData.employeeOutWorkTime,
                msName:this.operateData.msName
            };
            res.data.name     = this.operateData.name;
            res.data.dataJson = JSON.stringify(dataJson);
            if(this.operateData.employeeCheckId){
                res.data.employeeCheckId = this.operateData.employeeCheckId;
                res.data.roleType        = this.operateData.roleType;
            }else{//新增
                res.data.roleType = this.operateData.roleType;
                res.data.name     = this.operateData.name;
                
            }
            res.ispass    = true;
            return res;
        },
        changeShowBtn:function(){
            if(!this.isEdit){
                this.isEdit = true;
                var operate = this.operate;
                operate.editBtn(true);
            }
        },
        getShiftList:function(list){
            var res = [];
            if(list && list.length){
                for(var i = 0;i<list.length;i++){
                    if(list[i].status==0){
                        res.push(list[i]);
                    }
                }
            }
            return res;
        },
        setOperate:function(){
            var _this = this;
            this.operate = {
                editBtn:function(status){
                    if(status){
                        _this.$save.show();
                    }else{
                        _this.$save.hide();
                    }
                },
                editNomal:function(status){
                    if(status){
                        _this.$cancelNormal.show();
                        _this.$setout.show();
                    }else{
                        _this.$cancelNormal.hide();
                        _this.$setout.hide();
                    }
                },
                editDetails:function(status){
                    if(status){
                        _this.$details.show();
                    }else{
                        _this.$details.hide();
                    }
                },
                editTips:function(status){
                    var text = "下班打卡超过{time}点视为异常，直接修改异常打卡时间，或直接取消异常均可处理。";
                    if(amGloble && amGloble.metadata){
                        var shiftSettingList = amGloble.metadata.shiftSettingList;
                        var closeTime = "";
                        if(shiftSettingList){
                            closeTime = shiftSettingList.business_closingtime;
                            if(closeTime){
                                var arr = closeTime.split(":");
                                var a1  = arr.shift();
                                if(Number(a1)<9){
                                    closeTime = "次日" + closeTime;
                                } 
                            }else{
                                amGloble.msg("请先配置营业结束时间！");
                            }
                        }
                        
                        if(status){
                            text = text.replace(/\{(.*?)\}/g,function(a,b){return closeTime});
                            _this.$tips.find(".c-right-body p").html(text);
                            _this.$tips.show();
                        }else{
                            _this.$tips.hide();
                        }
                    }
                    
                }
            }
        },
        reset:function(){
            this.isEdit = false;
            for(var k in this.operate){
                this.operate[k]();
            }
            this.$selectName.html("请选择");
            this.$start.val("未出勤");
            this.$start.data("item",null);
            this.$end.val("未出勤");
            this.$end.data("item",null);

        },
        // {
        //     "id": 1001 , // 员工考勤主键ID
        //     "name":"时间3",
        //     "ssname" : "早班",
        //     "status": 1 ,   // 异常状态 0：正常 1：异常
        //     "workstatus": 0, // 工作状态 0：正常 1：迟到 2：早退
        //     "remark" : "回家吃年饭",  // 备注，异常原因描述
        //     "goworktime":1520820000000,
        //     "outworktime": 1520837400000, // 下班打卡时间
        //     "times" : 524  // 工作时长 分钟
        // }
        show:function(data){
            this.reset();
            this.operateData = data;
            // console.log(this.operateData);
            this.$mask.show();
            
            this.render(data);
        },
        render:function(data){
            //根据data数据判断显示隐藏
            var tit;
            var operate = this.operate;
            
            if(data.status == 0 && data.workStatus==0){
                this.$tit.html("正常").css("background-color",this.colorMap[0]);
            }
            
            if(data.workStatus!=0){
                if(data.workStatus==1){
                    this.$tit.html("迟到");
                    this.$details.find(".c-tit").html("迟到说明");
                }else if(data.workStatus==2){
                    this.$tit.html("早退");
                    this.$details.find(".c-tit").html("早退说明");
                }else{
                    this.$tit.html("迟到");
                    this.$details.find(".c-tit").html("迟到说明");
                }
                this.$tit.css("background-color",this.colorMap[2]);
            }
            if(data.status == 1){//异常
                operate.editNomal(true);
                operate.editTips(true);
                this.$tit.html("异常").css("background-color",this.colorMap[3]);
                this.$details.find(".c-tit").html("异常说明");
            }
            if(data.remark){
                operate.editDetails(true);
                this.$details.find(".c-content p").html(data.remark);
            }
            if(!data.employeeGoWorkTime || data.status == 3){//未出勤
                this.$details.find(".c-tit").html("未出勤说明");
                this.$tit.html("未出勤").css("background-color",this.colorMap[1]);
            }
            this.$.addClass('active');

            

            //渲染时间
            if(data.employeeGoWorkTime && data.status != 3){
                var isToDay = new Date(data.employeeGoWorkTime).format("yyyy/mm/dd") === new Date(this.operateData.searchTime).format("yyyy/mm/dd");
                if(isToDay){
                    this.$start.val(new Date(data.employeeGoWorkTime).format("HH:MM"));
                }else{
                    this.$start.val("次日" + new Date(data.employeeGoWorkTime).format("HH:MM"));
                }
                
                this.$start.data("item",data.employeeGoWorkTime);
            }
            if(data.employeeOutWorkTime){
                var isToDay = new Date(data.employeeOutWorkTime).format("yyyy/mm/dd") === new Date(this.operateData.searchTime).format("yyyy/mm/dd");
                if(isToDay){
                    this.$end.val(new Date(data.employeeOutWorkTime).format("HH:MM"));
                }else{
                    this.$end.val(new Date(data.employeeOutWorkTime).getDate() + "日 " + new Date(data.employeeOutWorkTime).format("HH:MM"));
                }
                
                this.$end.data("item",data.employeeOutWorkTime);
            }

            var msdata = this.getMsDataByName(data.msName);
            if(msdata){
                this.$selectName.html(msdata.name || "请选择");
            }else{
                this.$selectName.html("请选择");
            }
            
            this.$selectName.data("item",msdata);

            var tempdata = data.employeeGoWorkTime;
            if(!tempdata){
                tempdata = new Date(data.searchTime);
            }
            var d  = new Date(tempdata).setHours(0);
            var d2 = new Date(tempdata).setHours(23,59); 
            var max = new Date(new Date().setDate(new Date(d).getDate()+1));
            this.$start.mobiscroll('option', {
                min: new Date(d),
                max: new Date(d2)
            });
            this.$end.mobiscroll('option', {
                min: new Date(d),
                max: max
            });
        },
        getMsDataByName:function(name){
            var shiftSetting = amGloble.metadata.shiftSettingList.shiftSetting;
            if(shiftSetting && shiftSetting.length){
                for(var i=0;i<shiftSetting.length;i++){
                    var item = shiftSetting[i];
                    if(item.name == name && item.status == 0){
                        return item;
                    }
                }
            }
            return null;
        },
        getValue:function(){
            var res = {};
            return res;
        },
        hide:function(){
            this.$mask.hide();
            this.$.removeClass('active');
            this.close && this.close();
        },
        setData:function(data,cb){
            var _this = this;
            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api['updateEmployeeCheck'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    amGloble.loading.hide();
                    cb && cb(ret.content);
                } else {
                    amGloble.msg(ret.message || "数据保存失败，请稍后重试！");
                }

            });
        }
    }
    amGloble.attendanceOperate = attendanceOperate;
})();