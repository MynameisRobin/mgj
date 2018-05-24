amGloble.page.withDraw = new $.am.Page({
	id : "page-withDraw",
	disableScroll: false,
    withdrawMoney:false,
	init:function(){
        var self=this;
		this.$.find(".am-body-inner").delegate(".am-backbutton", "vclick", function() {
			$.am.page.back();
		});
        this.$.find(".am-body-inner").delegate(".moneyTit", "vclick", function() {
            if($(this).hasClass("show")){
                $.am.changePage(amGloble.page.drawCash, "slideleft",self.userInfo);
            }
        });
        this.$.find(".am-body-inner").delegate(".statueBox", "vclick", function() {
            if($(this).hasClass("show")){
                $.am.changePage(amGloble.page.withDrawSign, "slideleft",self.userInfo);
            }
        });
        this.$.find(".am-header .record").vclick(function() {
            
            $.am.changePage(amGloble.page.reportWithDraw, "slideleft",self.userInfo);

        });

        this.$error = this.$.find("div.am-page-error");
        this.$error.find(".button-common").vclick(function() {
            self.getData();
        });
        this.$.find(".confirmMoney_text").eq(0).find(".ico").vclick(function(){
            amGloble.messageBox("提示", '待确认金额满1000即会转入可提现金额；月底会将所有待确认金额转入可提现金额', function() {
            
            });
        });
        this.$.find(".confirmMoney_text").eq(1).find(".ico").vclick(function(){
            amGloble.messageBox("提示", '当天收的款项会归入"待确认金额"，第二天转入可提现金额进行提现', function() {
            
            });
        });
        this.fixed=2;
        
	},
	beforeShow:function(ret){
        if (ret == "back") {
            return;
        }
	},
	afterShow:function(paras){
        if (paras == "back") {
            return;
        }
		//console.log("sss");
		this.getData();
	},
    renLoop:function(data){
        var dataObj={};
        for(var i in data){
            if(i!="color"){
                dataObj[i]=$(".data-"+i);
            }
        }
        dataObj.statue.text(data.statue).css("color",data.color);
        dataObj.signClass.removeClass('show').addClass(data.signClass);

        dataObj.reasonValue.text(data.reasonValue);
        dataObj.withdrawMoney.removeClass('show').addClass(data.withdrawMoney);
        dataObj.faceMoney.text(this.toFixed(data.faceMoney));
        dataObj.mallMoney.text(this.toFixed(data.mallMoney));
        dataObj.withdrableMoney.text(this.toFixed(data.withdrableMoney));  
    },
    toFixed:function(num){
        var number=new Number(num);
        return number.toFixed(this.fixed);
    },
    //签约状态 0: 未提交 1：提交审核 2：已签约 3：已驳回
	render:function(ret){
        var headData,headArr=[],res,stu;
        var reason={
                "0":{
                    "color":"#e41919",
                    "statue":"未签约",
                    "reasonValue":"签约后方可提现，立即签约",
                    "signClass":"show",
                    "withdrawMoney":""
                },
                "1":{
                    "color":"#f58a00",
                    "statue":"签约中",
                    "reasonValue":"签约信息已提交，请等待审核",
                    "signClass":"show",
                    "withdrawMoney":""
                },
                "2":{
                    "color":"#32c972",
                    "statue":"已签约",
                    "signClass":"show",
                    "reasonValue":"查看签约信息",
                    "withdrawMoney":"show"
                },
                "3":{
                    "color":"#e41919",
                    "statue":"被驳回",
                    "signClass":"show",
                    "reasonValue":"点击查看驳回理由并重新签约",
                    "withdrawMoney":""
                }
            }
        if(ret.content){
            headData=ret.content;
            stu=headData.status || 0;
            //headData.status=2;
            res=reason[stu];
            this.userInfo=ret.content;
        }else{//未签约 显示--
            headData={
                faceMoney:"--",//当面付
                mallMoney:"--",//商城
                withdrableMoney:"--",//可提现总额
            }
            res=reason[0];
            stu=0;
        }
        var data=$.extend({},res,headData);

        this.renLoop(data);
        
    },
    getData:function(scb){
        var self=this;
        this.setStatus("loading");
        amGloble.api.queryWithdraw.exec({
            "parentShopId":amGloble.metadata.userInfo.parentShopId                
        }, function(ret) {
            // amGloble.loading.hide();
            console.log(ret);
            if (ret.code == 0) {
                self.setStatus("normal");
                self.render(ret);
            } else {
                self.setStatus("error");
                // if (self.$ul.children(":not(.empty)").length) {
                //     amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                // } else {
                //     self.setStatus("error");
                // }
            }
        });
    }
});

