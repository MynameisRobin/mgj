(function(){
    amGloble.page.editException = new $.am.Page({
        id:"page-editException",
        init:function(){
            var _this = this;
            this.$input = this.$.find(".areabox textarea").focus(function(){
                _this.$mask.show();
            });
            this.$btn   = this.$.find(".editbtn");
            this.$btn.vclick(function(){
                var data = _this.getVal();
                if(!data.remark){
                    amGloble.msg("请先填写说明！"); 
                    return;
                }
                _this.setData(function(){
                    $.am.page.back("",1);
                });
            });
            this.$mask = this.$.find('.mask').on('touchstart',function(){
                _this.$.find("input, textarea").blur().prop("disabled", true);
                setTimeout(function(){
                    _this.$mask.hide();
                    _this.$.find("input, textarea").prop("disabled", false);;
                },500);
            });
            if($.am.checkScroll(true)<11){
                this.$mask.remove();
            }
        },
        beforeShow:function(paras){
            this.paras = paras;
            var $tit   = this.$.find(".am-header .text");
            var time   = ""; 
            if(paras && paras.searchTime){
                var d  = new Date(Number(paras.searchTime));
                var t1 = d.getMonth() + 1;
                time   = t1 + "月" + paras.number + "日";
            }
            if(paras && paras.remark){
                this.$input.val(paras.remark);
                this.$btn.text("确认");
            }else{
                this.$input.val("");
                this.$btn.text("提交");
            }
            if(paras && paras.status==1){
                $tit.html(time + "异常说明");
            }else{
                if(paras && paras.workStatus==1){//迟到
                    $tit.html(time + "迟到说明");
                }else if(paras && paras.workStatus==2){
                    $tit.html(time + "早退说明");
                }else if(paras && paras.workStatus==3){
                    $tit.html(time + "迟到早退说明");
                }else{
                    $tit.html(time + "说明");
                }
            }
        },
        afterShow:function(){},
        beforeHide:function(){},
        getVal:function(){
            var res = {};
            var remark = this.$input.val();
            res.employeeId = this.paras.employeeId; 
            res.remark = remark;
            res.shopId = amGloble.metadata.userInfo.shopId;
            if(this.paras.status!=3){
                res.employeeCheckId = this.paras.employeeCheckId; 
                res.employeeGoWorkTime = this.paras.employeeGoWorkTime;
                res.employeeOutWorkTime= this.paras.employeeOutWorkTime;
            }else{//未出勤加备注
                var d    = new Date(Number(this.paras.searchTime));
                res.name = this.paras.name;
                d.setDate(this.paras.number);
                res.employeeGoWorkTime = d.getTime();
                res.roleType   = this.paras.roleType;
                res.workStatus = 0;
                res.status     = 3;
                if(this.paras.employeeGoWorkTime){
                    res.employeeGoWorkTime = this.paras.employeeGoWorkTime;
                }
                if(this.paras.employeeCheckId){
                    res.employeeCheckId = this.paras.employeeCheckId;
                }
                res.employeeId = this.paras.employeeId;
                res.shopId     = this.paras.shopId;
            }
            res.status = this.paras.status;
            return res;
        },
        setData:function(cb){
            var _this=this;
            amGloble.loading.show();
            var data = this.getVal();
            amGloble.api['updateEmployeeCheck'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    amGloble.msg("操作成功！");
                    cb && cb();
					
                } else {
                    amGloble.msg(ret.msg || "保存失败，请稍后重试！");
                }
            });
        }
    });
})();
