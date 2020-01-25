(function() {
    var self = am.page.verifyRecord = new $.am.Page({
        id: "page_about_verifyrecord",
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function() {
            this.$refreshBtn=this.$.find('.refreshBtn');
            this.$stateBox=this.$.find('.recordList');
            this.$date=this.$.find('.dateSelect .date');
            this.$tbody=$('#page_about_verifyrecord').find('.recordList .table-content-list tbody');
            this.mainScroll = new $.am.ScrollView({
                $wrap : this.$.find(".table-content-list"),
                $inner : this.$.find(".table-content-list table"),
                direction : [false, true],
                hasInput: false
            });
            this.mainScroll.refresh();
            this.$date.mobiscroll().calendar({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'bottom',
                months: "auto",
                setOnDayTap: true,
                buttons: [],
                max:new Date(),
                endYear: amGloble.now().getFullYear()+50,
                onSet: function(valueText, inst) {
                    console.log(valueText, inst);
                    self.$date.text(valueText.valueText.replace(/\//g,'.'));
                    var time=new Date(valueText.valueText);
                    var period=self.getPeriodTime(time);
                    self.getData(period);
                }
            });
            this.$refreshBtn.on('vclick',function(){
                var time=new Date(self.$date.text());
                var period=self.getPeriodTime(time);
                self.getData(period);
            })
        },
        beforeShow: function(para) {
            var now=new Date();
            this.$date.text(now.format('yyyy.mm.dd'));
            var period=this.getPeriodTime(now);
            this.getData(period);
        },
        afterShow: function(opt) {
            
        },
        beforeHide: function() {
        },
        afterHide: function() {
            
        },
        renderRecord: function(opt){
            this.$tbody.empty();
            if(opt&&opt.length){
                for(var i=0;i<opt.length;i++){
                    var item=opt[i];
                    var $tr=$('<tr>'+
                    '<td class="td-no"><div class="tdwrap">'+(item.code?item.code:'')+'</div></td>'+
                    '<td class="td-name"><div class="tdwrap">'+item.mallItemName+'</div></td>'+
                    '<td class="td-price"><div class="tdwrap">'+item.cashPay+'</div></td>'+
                    '<td class="td-price"><div class="tdwrap">'+item.itemNum+'</div></td>'+
                    '<td class="td-cust"><div class="tdwrap">'+item.memName+'</div></td>'+
                    '<td class="td-shop"><div class="tdwrap">'+item.memShop+'</div></td>'+
                    '<td class="td-bug"><div class="tdwrap">'+(item.createTime?new Date(item.createTime*1).format("yyyy-mm-dd"):'')+'</div></td>'+
                    '<td class="td-consume"><div class="tdwrap">'+(item.consumeTime?new Date(item.consumeTime*1).format("yyyy-mm-dd"):'')+'</div></td>'+
                    '<td class="td-getProduct"><div class="tdwrap">'+(item.distrType?(item.distrType=='1'?'到店取货':'物流配送'):'')+'</div></td>'+
                    '<td class="td-billNo"><div class="tdwrap">'+(item.displayId?item.displayId:'')+'</div></td>'+
                    '<td class="td-operator"><div class="tdwrap">'+(item.operatorName?item.operatorName:'')+'</div></td>'+
                    '</tr>').data("item",item);
                    this.$tbody.append($tr);
                }
                this.mainScroll.refresh();
                this.$stateBox.removeClass('cutting empty');
            }else{
                this.$stateBox.removeClass('cutting').addClass('empty');
            }
        },
        getPeriodTime : function(date){
            var start=new Date(date.format("yyyy/mm/dd")+" 00:00:00").getTime();
            var end=new Date(date.format("yyyy/mm/dd")+" 23:59:59").getTime();
            return start+'_'+end;
        },
        getData : function(period){
            am.loading.show("正在获取,请稍候...");
            var parentShopId=am.metadata.userInfo.parentShopId;
            var shopId=am.metadata.userInfo.shopId;
            var opt={
                "parentShopId":parentShopId,
                "shopId":shopId,
                "period":period
            }
            am.api.verifyList.exec(opt, function (res) {
                am.loading.hide();
                console.log(res);
                if (res.code == 0) {
                    self.renderRecord(res.content);
                } else {
                    self.$stateBox.removeClass('empty').addClass("cutting");
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
            });
        }
    });
})();
