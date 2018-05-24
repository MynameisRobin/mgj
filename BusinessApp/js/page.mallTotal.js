amGloble.page.mallTotal = new $.am.Page({
	id : "page-mallTotal",
	init:function(){
        var self=this;
        
		this.$headerClick=this.$.find(".header .nav li").vclick(function(){
            var idx=$(this).index();
            self.$nav=idx;
            $(this).addClass("selected").siblings().removeClass('selected');
            self.rendeHeader(idx);
        });
        
        this.$.find(".header .withDraw").vclick(function(){
            $.am.changePage(amGloble.page.withDraw, "slideleft");
        });
        this.$nav=0;
        this.headName=["day","month","year"];

        this.$malltotal=this.$.find(".totalValue .malltotal");//销售总额
        this.$mallamount=this.$.find(".totalValue .mallamount");//订单笔数
        this.$saleProject=this.$.find(".centerProject .saleProject");//售卖中的项目
        this.$client=this.$.find(".centerProject .client");//购买的客户

        this.$error = this.$.find("div.am-page-error");
        this.$error.find(".button-common").vclick(function() {
            self.getData();
        });
        this.$reportList=[{report:{
            name:"门店PK",
            filter:"",
            apiName:"mallreportStopPK",
            dataProcessor: function(data) {
                return data;
            }
        }},{report:{
            name:"分类汇总",
            apiName:"reportCategory",
            filter:"showCategory",
            dataProcessor: function(data) {
                return data;
            }
        }},{report:{
            name:"明细汇总",
            filter:"showCategory",
            apiName:"reportItem"
        }}];
        this.$.find(".bottomList ul li").vclick(function(){
            var idx=$(this).index();
            $.am.changePage(amGloble.page.reportStandard, "slideleft",self.$reportList[idx]);
        });
        this.$dv = this.$.find(".mainTable");

        this.$.find(".centerProject .left").vclick(function(){
            var src=defaultConfig.shareRoot+"tenantId="+amGloble.metadata.userInfo.parentShopId+"&view=3";
            window.open(src,'_blank','location=no');
        });
	},
	beforeShow:function(ret){
        if (ret == "back") {
            return;
        }
	},
	afterShow:function(ret){
        if (ret == "back") {
            return;
        }
		this.getData();
	},
    render:function(ret){
        if(ret.content){
            this.$data=ret.content;
            this.rendeHeader(this.$nav);
            this.$saleProject.text(ret.content.project.saleProject);
            this.$client.text(ret.content.project.client);
        }
    },
    rendeHeader:function(idx){
        var data=this.$data,headData;
        var headName=this.headName;
        for(var i in data){
            if(i==headName[idx]){
                headData=data[i];
            }
        }
        this.$malltotal.text(headData.total);
        this.$mallamount.text(headData.amount);
    },
    getData:function(scb){
        var self=this;
        this.setStatus("loading");
        amGloble.api.mallPandect.exec({
            "parentShopId":amGloble.metadata.userInfo.parentShopId//amGloble.metadata.userInfo.parentShopId             
        }, function(ret) {
            // amGloble.loading.hide();
            console.log(ret);
            if (ret.code == 0) {
                self.setStatus("normal");
                self.render(ret);
            } else {
                self.setStatus("error");
            }
        });
    }
});

