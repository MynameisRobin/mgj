(function() {
    var that = am.page.outinRecord = new $.am.Page({
        id: "page_outinRecord",
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function() {
            this.$dateSelect = this.$.find('.dateSelect');
            this.$left = this.$dateSelect.find('.left').vclick(function() {
                that.$date.text(that.lastMonthDate(new Date(that.$date.text())));
                that.checkDate();
                that.outinRecord.outinGetData(1,that.opt.id);
            });

            var months = [];
            var ts = new Date();
            var thisYear = ts.getFullYear();
            for(var i=0;i<3;i++){
                var y = thisYear-i;
                for(var j=12;j>0;j--){
                    if(i!=0 || j <= (ts.getMonth()+1)){
                        months.push(y+'-'+(j<10?'0'+j:j));
                    }
                }
            }
            this.$date = this.$dateSelect.find('.date').mobiscroll().scroller({
                theme: 'mobiscroll',
                display: 'bottom',
                lang: 'zh',
                rows: 5,
                wheels: [
                    [{
                        circular: false,
                        data: months,
                        label: '选择月份'
                    }]
                ],
                showLabel: true,
                minWidth: 200,
                cssClass: 'md-pricerange',
                onSet: function(valueText, inst) {
                    //to do
                    console.log(valueText, inst);
                    that.$date.text(valueText.valueText);
                    that.checkDate();
                    that.outinRecord.outinGetData(1,that.opt.id);
                }
            });
            this.$right = this.$dateSelect.find('.right').vclick(function() {
                that.$date.text(that.nextMonthDate(new Date(that.$date.text())));
                that.checkDate();
                that.outinRecord.outinGetData(1,that.opt.id);
            });

        },
        checkDate:function(){
            var strts = this.$date.text();
            var today = new Date().format('yyyy-mm');
            if(strts == today){
                this.$right.addClass('am-disabled');
            }else {
                this.$right.removeClass('am-disabled');
            }
        },
        lastMonthDate:function(time){
            var year = time.getFullYear();
            var month = time.getMonth() + 1;
            if(month==1){
                year = time.getFullYear()-1;
                month = 12;
            }else{
                month = month -1;
            }
            if(month<10){
                month = '0' +month;
            }
            var date =year+"-"+ month;
            return date;
        },
        nextMonthDate:function(time){
            var year = time.getFullYear();
            var month = time.getMonth() + 1;
            if(month==12){
                year = time.getFullYear()+1;
                month = 1;
            }else{
                month = month +1;
            }
            if(month<10){
                month = '0' +month;
            }
            var date =year+"-"+ month;
            return date;
        },
        beforeShow: function(opt) {
            this.$date.text(new Date().format('yyyy-mm'));
            this.renderProduct(opt);
            $(".page_outinRecord .recordList .listContent ul").hide();
        },
        afterShow: function(opt) {
            this.opt = opt;
            this.outinRecord.outinGetData(1,this.opt.id);
            this.checkDate();
            this.$.find('.dateSelect').show();

            this.inoutDepotType = JSON.parse(am.metadata.inoutDepotType) || [];
            console.log(this.inoutDepotType)
        },
        beforeHide: function() {
        },
        afterHide: function() {
            this.$.find('.dateSelect').hide();
        },
        outinPager: function(l) {
            var self = this;
            this.diffPage = new $.am.Paging({
                $: $("#outinPage"),
                showNum: 15,
                total: l,
                action: function(_this, index) {
                    _this.refresh(index, l);
                    self.outinRecord.outinGetData((index+1),self.opt.id);
                }
            });
        },
        recordListScroll:function (){
            if(!this.listScroll){
                var self=this;
                var $parent=$(".page_outinRecord .recordList .rtContent .listContent");
                this.outListLeftScroll = new $.am.ScrollView({
                    $wrap : $parent,
                    $inner : $parent.find("ul"),
                    direction : [false, true],
                    hasInput: false
                });
            }else {
                this.listScroll.refresh();
                this.listScroll.scrollTo('top');
            }
         },
        outinRecord: {
            outinGetData: function(i,id) {
                var self = this;
                var date  = new Date(that.$date.text()),
                    year = date.getFullYear(),
                    month = date.getMonth(),
                    nextYear,nextMonth;
                if(month==12){
                    nextYear = year + 1;
                    nextMonth = 1;
                }else {
                    nextYear = year;
                    nextMonth = month + 1;
                }
                var startDate = new Date(year,month,1,0,0,0),
                    endDate = new Date(nextYear,nextMonth,1,0,0);
                am.loading.show();
                am.api.storageOutinRecord.exec({
                    "parentShopId":am.metadata.userInfo.parentShopId,
                    "shopId":am.metadata.userInfo.shopId,
                    "pageSize":15,
                    "pageNum":i,
                    "id":id*1,
                    "startDate":startDate.getTime(),
                    "endDate":endDate.getTime()
                }, function(res) {
                    console.log(res)
                    am.loading.hide();
                    if (res.code == 0 && res.content.length) {
                        self.outinRender(i, res.content);
                        $(".page_outinRecord .recordList .listContent ul").show();
                        $("#outinPage").show();
                        // that.recordListScroll();
                        if(!that.diffPage){
                            that.outinPager(res.count);
                        }
                        that.diffPage.refresh(i-1,res.count);
                    }else if(res.code == 0 && !res.content.length){
                        $(".page_outinRecord .recordList .listContent ul").hide();
                        $("#outinPage").hide();
                        am.msg('暂时没有数据！');
                    }else if(res.code == -1){
                        atMobile.nativeUIWidget.confirm({
                            caption: '网络错误',
                            description: '发生网络错误，请检查网络',
                            okCaption: '重试',
                            cancelCaption: '返回'
                        }, function(){
                            self.outinGetData(i);
                        }, function(){
                            $.am.page.back();
                        });
                    }
                });
            },
            outinRender: function(index, data) {
                if(!this.$ul){
                    this.$ul = that.$.find(".recordList .listContent ul");
                    this.$li = this.$ul.find("li").remove();
                }
                var html = "";
                this.$ul.empty();
                for (var i = 0; i < data.length; i++) {
                    var $li = this.$li.clone();
                    var $div = $li.find('div');

                    $div.eq(6).text(that.getRelated(data[i]));

                    data[i].stype = that.getStype(data[i].type,data[i].stype);
                    
                    if(data[i].type==1){
                        data[i].type="入库";
                    }else if (data[i].type==2){
                        data[i].type="出库";
                    }
                    
                    $div.eq(0).text(new Date(data[i].operationdate).format('yyyy-mm-dd'));
                    $div.eq(1).text(data[i].billno);
                    $div.eq(2).text(data[i].type);
                    $div.eq(3).text(Math.round(data[i].num*10)/10);
                    $div.eq(4).text(data[i].timeNum);
                    $div.eq(5).text(data[i].stype);
                    
                    $div.eq(7).text(data[i].remark?data[i].remark:"");
                    $div.eq(8).text(that.getOperatorName(data[i].operatid));

                    if(data[i].type=='出库'){
                        $div.eq(2).addClass('outway');
                        $div.eq(3).addClass('outway');
                    }else if(data[i].type=='入库'){
                        $div.eq(2).addClass('intoway');
                        $div.eq(3).addClass('intoway');
                    }

                    this.$ul.append($li);
                }
                that.recordListScroll();
            }
        },
        getStype:function(type,stype){
            if(type == 2){
                type = 0
            };
            if(this.inoutDepotType.length){
                for(var i=0;i<this.inoutDepotType.length;i++){
                    if(type == this.inoutDepotType[i].type && stype == this.inoutDepotType[i].code){
                        return this.inoutDepotType[i].typeName;
                    }
                }
            }
            return '';
        },
        getRelated:function(data){
            if((data.supplierId && data.type==1 && data.stype==0) || (data.supplierId && data.type==2 && data.stype==2)){ //采购入库退货
                if(am.metadata.suppliers.length){
                    for(var i=0;i<am.metadata.suppliers.length;i++){
                        if(am.metadata.suppliers[i].id==data.supplierId){
                            return am.metadata.suppliers[i].name;
                        }
                    }
                    return '--';
                }
            }else if(data.sourceShopId && data.stype==3){ //内部调入调出
                if(am.metadata.shopList.length){
                    for(var i=0;i<am.metadata.shopList.length;i++){
                        if(am.metadata.shopList[i].shopId==data.sourceShopId){
                            return am.metadata.shopList[i].osName;
                        }
                    }
                    return '--';
                }
            }else {
                return '--';
            } 
        },
        getOperatorName:function (id){
            if(!this.adminMap){
                var array = am.metadata.adminList;
                this.adminMap = {};
                for (var i = 0; i < array.length; i++) {
                    this.adminMap[array[i].id] = array[i];
                }
            }
            return this.adminMap[id] ? this.adminMap[id].name : "--";
        },
        getShopName:function (id){
            var name="";
            console.log(id);
            for (var i=0;i<am.metadata.shopList.length;i++){
                if (am.metadata.shopList[i].shopId==id){
                    return name=am.metadata.shopList[i].shopName+(am.metadata.shopList[i].osName?am.metadata.shopList[i].osName:"");
                }
            }
        },
        getSupplierName:function (id){
            var name="";
            console.log(id);
            if(am.metadata.suppliers.length){
                for (var i=0;i<am.metadata.suppliers.length;i++){
                    if (am.metadata.suppliers[i].shopId==id){
                        name = am.metadata.suppliers[i].name;
                    }
                }
            }
            return name;
        },
        renderProduct: function(opt){
            if(!this.$img){
                this.$img = this.$.find('.aside .img');
            }
            if(!this.$discrip){
                this.$discrip = this.$.find('.discrip p');
            }
            if(!this.$num){
                this.$num = this.$.find('.num p');
            }
            if(opt.mgjdepotlogo){
                var $img = am.photoManager.createImage("goods", {
                    parentShopId: am.metadata.userInfo.parentShopId
                }, opt.mgjdepotlogo, "s");
                this.$img.html($img);
            }else{
                this.$img.empty();
            }
            this.$discrip.text(opt.name);
            this.$num.text('编码:'+opt.no);
        }
    });
})();
