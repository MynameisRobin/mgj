(function(){
    amGloble.page.settingShift = new $.am.Page({
        id:"page-settingShift",
        init:function(){
            var _this  = this;
            
            this.$list = this.$.find(".setting-content");
            this.$item = this.$list.find(".setting-item").remove();

            // $('.page-settingShift .setting-item .timebox input').mobiscroll().time({
            //     theme: 'mobiscroll',
            //     display: 'bottom',
            //     timeFormat: 'HH:ii A',
            //     lang: "zh",
            //     onSet:function(v){
            //         $(this).val(_this.transTime(v.valueText));
            //     }
            // });
            var timer = _this.getTimer("18:00","08:00");
            this.$.on("vclick",".setting-time",function(){
                amGloble.popupMenu("请选择时间",timer,function(v){
                    _this.$.find(".setting-time").html(v.name);
                    _this.$.find(".setting-time").data("item",v);
                });
            }).on("vclick",".setting-add",function(){
                var $item = _this.$item.clone(true,true);
                _this.bindTime($item.find(".timebox input"),function(v){
                    $(this).val(_this.transTime(v.valueText));
                });
                _this.$list.append($item);
                _this.scrollview.refresh();
            }).on("vclick",".setting-bottom-btn",function(){
                var val = _this.getValue();
                if(val.checks){
                    amGloble.msg(val.checks.msg);
                    return;
                }
                _this.setData(val,function(){
                    _this.getData({shopId:_this.paras.shopId},function(ret){
                        _this.render(ret.content);
                    });
                });
                console.log(val);
            }).on("vclick",".selectTime_close",function(){
                var $parents = $(this).parents(".setting-item");
                if(_this.$list.find(".setting-item:not(.hide)").size()==1){
                    amGloble.msg("必须保留一个班次！");
                    return;
                }
                $parents.addClass("hide");
            }).on("vclick",".am-page-error .button-common",function(){
                _this.getData({shopId:_this.paras.shopId},function(ret){
                    _this.render(ret.content);
                });
            });
        },
        beforeShow:function(paras){
            this.paras = paras;
            var _this=this;
            this.getData({shopId:paras.shopId},function(ret){
                _this.render(ret.content);
            });
        },
        afterShow:function(){},
        beforeHide:function(){},
        render:function(content){
            var _this = this;
                business_closingtime = content.business_closingtime,
                shiftSetting         = content.shiftSetting,
                $businessClosingTime = this.$.find(".setting-time");
            var closeTime =null;
            if(business_closingtime){
                closeTime = {
                    name:business_closingtime,
                    vname:business_closingtime
                }
                var s = business_closingtime.split(":");
                if(Number(s[0])<9){
                    closeTime.vname = "次日" + closeTime.name;
                }
                $businessClosingTime.html(closeTime.vname || "");
            }
            
            $businessClosingTime.data("item",closeTime);
            amGloble.metadata.shiftSettingList = content;
            this.$list.empty();
            if(shiftSetting && shiftSetting.length){
                for(var i=0,l=shiftSetting.length;i<l;i++){
                    var item  = shiftSetting[i],
                        $item = this.$item.clone(true,true);
                    $item.find(".selectTime_times input").val(item.name || "");
                    $item.find(".selectTime_startTime input").val(item.goWorkTime || "");
                    $item.find(".selectTime_endTime input").val(item.outWorkTime || "");
                    this.bindTime($item.find(".timebox input"),function(v){
                        $(this).val(_this.transTime(v.valueText));
                    });
                    if(item.status == 1){
                        $item.addClass("hide");
                    }
                    $item.data("item",item);
                    this.$list.append($item);
                }
            }else{
                var $item = this.$item.clone(true,true);
                this.bindTime($item.find(".timebox input"),function(v){
                    $(this).val(_this.transTime(v.valueText));
                });
                amGloble.msg("暂无班次数据，请先配置班次！");
                this.$list.append($item);
            }
        },
        bindTime:function($dom,cb){
            $dom.mobiscroll().time({
                theme: 'mobiscroll',
                display: 'bottom',
                timeFormat: 'HH:ii',
                timeWheels:'HH:ii',
                lang: "zh",
                steps: {
                    minute: 30
                },
                onSet:function(v){
                    cb && cb.call(this,v);
                }
            });
            // $dom.eq(0).mobiscroll().time({
            //     theme: 'mobiscroll',
            //     lang: 'zh',
            //     display: 'bottom',
            //     wheels: [
            //         [{
            //             data: this.getDayData()
            //         },{
            //             data: this.getTimeData(10)
            //         }]
            //     ],
            //     onSet:function(v){
            //         var temp = v.valueText;
            //         temp = v.replace(" ",":");
            //         v.valueText = temp;
            //         cb && cb.call(this,v);
            //     }
            // });
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
        getValue:function(){
            var _this = this;
            var shiftSettingList = [],
                res={},
                checks={
                    ispass:true,
                    msg:""
                };
            var businessClosingTime = this.$.find(".setting-time").html();
            this.$.find(".setting-item").each(function(i,item){
                var ret    = {}; 
                var data   = $(item).data("item");
                var ishide = $(item).hasClass("hide");
                var name   = $(item).find(".selectTime_times input").val();
                var goWorkTime  = $(item).find(".start").val();
                var outWorkTime = $(item).find(".end").val();
                // goWorkTime  = new Date("2018-01-01 " + goWorkTime).getTime();
                // outWorkTime = new Date("2018-01-01 " + outWorkTime).getTime();
                // businessClosingTime = new Date("2018-01-01 " + businessClosingTime).getTime();
                if(ishide && !data){
                    return false;
                }
                if(data){
                    ret.id      = data.id;
                }
                ret.name        = name;
                ret.status      = ishide?1:0;
                ret.goWorkTime  = goWorkTime;
                ret.outWorkTime = outWorkTime;
                shiftSettingList.push(ret);
                if(!ret.name){
                    checks.ispass = false;
                    checks.msg    = "请先填写班次名称！";
                 }
                if(!ret.goWorkTime){
                    checks.ispass = false;
                    checks.msg    = "请先填写上班时间！";
                }
                if(!ret.outWorkTime){
                    checks.ispass = false;
                    checks.msg    = "请先填写下班时间！";
                }
                if(ret.goWorkTime && ret.outWorkTime && ret.status==0){
                    if(_this.addTime(ret.goWorkTime)>=_this.addTime(ret.outWorkTime)){
                        checks.ispass = false;
                        checks.msg    = "上班时间必须小于下班时间！";
                    }
                }
            });
            if(!businessClosingTime){
                checks.ispass = false;
                checks.msg    = "请先填写营业结束时间！";
            }
            if(businessClosingTime && shiftSettingList.length && !this.checkTimeOut(businessClosingTime,shiftSettingList)){
                checks.ispass = false;
                checks.msg    = "营业结束时间需大于最晚下班时间！";
            }
            res.shiftSettingList    = shiftSettingList;
            var closeTime = this.$.find(".setting-time").data("item");
            if(closeTime){
                res.businessClosingTime = closeTime.vname.replace("次日","");
            }
            res.shopId              = this.paras.shopId;
            res.operator            = amGloble.metadata.userInfo.userName;
            if(!checks.ispass){
                res.checks = checks;
            }
            return res;
        },
        checkTimeOut:function(businessClosingTime,shiftSettingList){
            var arr   = [];
            var _this = this; 
            for(var i=0;i<shiftSettingList.length;i++){
                if(shiftSettingList[i].status==0){
                    arr.push(shiftSettingList[i]);
                }
            }
            arr.sort(function(a,b){
                return _this.addTime(b.outWorkTime)-_this.addTime(a.outWorkTime);
            });
            var t  = arr.shift();
            var t1 = _this.addTime(t.outWorkTime); 
            var t2 = _this.addTime(businessClosingTime,true);
            if(t1>t2){
                return false;
            }
            return true;
        },
        addTime:function(time,isCheckTomorrow){
            //22:10 -> 当天时间戳
            var t = new Date();
            var s = time.split(":"); 
            if(isCheckTomorrow && Number(t[0])<9){
                t.setDate(t.getDate()+1);
            }
            
            t.setHours(s[0]);
            t.setMinutes(s[1]);
            return t.getTime();
        },
        transTime:function(time){
            // if(time){
            //     if(time.indexOf("下午")!=-1){
            //         return $.trim(time.replace("下午",""));
            //     }else{
            //         return $.trim(time.replace("上午",""));
            //     }
            // }
            return time;
        },
        getTimer:function(start,end){
            var s1 = start || "18:00",
                s2 = end   || "08:00",
                d  = new Date(),
                res=[];
                diff = 0;
            res.push({name:s1,vname:s1});
            s1 = Number(s1.split(":").shift());
            s2 = Number(s2.split(":").shift());
            if(s2<s1){
                diff = 2*(s2 + 24 - s1);
            }else{
                diff = 2*(s2-s1);
            }
            d.setHours(s1);
            d.setMinutes(0);
            for(var i=0;i<diff;i++){
                var ds = new Date(d.setMinutes(d.getMinutes() + 30));
                var vs = ds.format("HH:MM");
                var s = vs;
                if(ds.getDate()!=new Date().getDate()){
                    s = "次日" + vs;
                }

                res.push({name:s,vname:vs});
            }
            return res;
        },
        setData:function(data,cb){
            var _this = this;
            amGloble.loading.show("正在保存,请稍候...");
            amGloble.api['shiftSetting'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    _this.setStatus("normal");
                    amGloble.msg("保存成功！");
                    cb && cb(ret);
                } else {
                    amGloble.msg(ret.message || "网络请求出错，请稍后重试！");
                    //_this.setStatus("error");
                }

            });
        },
        getData:function(data,cb){
            var _this = this;
            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api['shiftList'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    _this.setStatus("normal");
                    cb && cb(ret);
                } else {
                    _this.setStatus("error");
                }

            });
        }
    });
})();
