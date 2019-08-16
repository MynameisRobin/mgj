(function() {
    var popUp = {
        show: function($li, cb) {
            if(!this.$){
                this.initEventBind();
            }
            this.$.addClass("active");
            this.$mask.show();
            this.$li = $li;
            this.getDataAndRender();
            this.cb = cb;
            if(this.$li.data('data').status==0){
                if(amGloble.metadata.userInfo.operatestr.indexOf(',J,')!=-1){
                    this.$.find(".DeleteBill").show();
                }else {
                    this.$.find(".DeleteBill").hide();
                }
                this.$.find(".AuditBill").show();
                this.$.find(".CancelBill").hide();
            }else if(this.$li.data('data').status==1){
                this.$.find(".DeleteBill").hide();
                this.$.find(".AuditBill").hide();
                this.$.find(".CancelBill").show();
            }
            var data=this.$li.data('data');
            if(data.outwaretype==11 && data.billId){
                // 随套餐出库的出库单不能审核和反审
                this.$.find(".AuditBill").hide();
                this.$.find(".CancelBill").hide();
            }
        },
        initEventBind:function(){
            var _this=this;
            this.$ = am.page.storage.$.find(".outbillPop");
            this.$mask = am.page.storage.$.find(".outOpacity").vclick(function(){
                _this.hide();
            });
            this.$.find(".Audit").vclick(function(){
                // _this.abort();
                var data = _this.$li.data("data")
                var title,subTitle;
                if(data.status==0){
                    title = '确定审核';
                    subTitle = '是否确定审核此单？';
                }else if(data.status==1){
                     title = '确定反审核';
                    subTitle = '是否确定反审核此单？'
                }
                atMobile.nativeUIWidget.confirm({
                    caption: title,
                    description: subTitle,
                    okCaption: '确定',
                    cancelCaption: '取消'
                }, function(){
                    _this.operateBill();
                }, function(){
                   _this.hide();
                });
            });

            this.$.find(".DeleteBill").vclick(function(){
                atMobile.nativeUIWidget.confirm({
                    caption: '删除单据',
                    description: '是否确定删除此单？',
                    okCaption: '确定',
                    cancelCaption: '取消'
                }, function(){
                    _this.deleteBill();
                }, function(){
                   _this.hide();
                });
            });

            this.$date = this.$.find(".PopDate");
            this.$name = this.$.find(".name");
            this.$list = this.$.find(".PopContentD ul");
            this.$no = this.$.find(".billNo");
            this.$typeLabel = this.$.find(".billTypeLabel");
            this.$type = this.$.find(".billType");
            this.$emp = this.$.find(".emp");
            this.$remark = this.$.find(".remark");
            this.$typeNumber = this.$.find('.PopContentH div:nth-child(3)');
            this.$totalPrice = this.$.find('.price');

            this.scrollor = new $.am.ScrollView({
                $wrap : this.$.find('.PopContentD'),
                $inner : this.$.find('.PopContentD ul'),
                direction : [false, true],
                hasInput: false
            });
        },
        getDataAndRender:function(){
            var _this=this;
            am.page.storage.getData(function(ret){
                if(ret && ret.code==0){
                    _this.render(ret.content);
                }else{
                    am.msg("数据读取失败！");
                }
            });
        },
        render:function(inventory){
            console.log(inventory)
            var data = this.$li.data("data");
            console.log(data);
            this.$list.empty();
            for (var i=0;i<data.details.length;i++){
                var item = data.details[i];
                if(item){
                    var depot = this.getDepotById(inventory,item.depotid);
                    if(depot){
                        var categoryName = this.getCategoryName(depot.marqueid);
                        this.$list.append('<li class="clearfix"><div>'+depot.name+'</div><div>'+categoryName+'</div><div>'+item.num+'</div><div>'+item.price+'</div></li>');
                    }
                }
            }
            if(!am.page.storage.showPrice){
                this.$list.find('li').addClass('hidePrice');
                this.$list.parent().prev().addClass('hidePrice');
            }
            if(data.inwaretype){
                this.$name.text("入库单");
                this.$typeLabel.text("入库类型：");
                this.$typeNumber.text('入库数量');
                this.$type.text(this.getIntoType(data.inwaretype));
                this.$date.text(data.intodate ? new Date(data.intodate).format("yyyy/mm/dd HH:MM") :"");
                if(data.inwaretype==0){
                    this.$emp.text(this.getSupplierName(data.supplierid)).prev().html('<b style="visibility: hidden;">占</b>供应商：').parent().show();
                }else if(data.inwaretype==3){
                    this.$emp.text(this.getShopName(data.fromshopid)).prev().html('调出门店：').parent().show();
                }else {
                    this.$emp.parent().hide();
                }
            }else{
                this.$name.text("出库单");
                this.$typeLabel.text("出库类型：");
                this.$typeNumber.text('出库数量');
                this.$type.text(this.getOutType(data.outwaretype,data.type));
                this.$date.text(data.outdate ? new Date(data.outdate).format("yyyy/mm/dd HH:MM") :"");
                if(data.outwaretype==2){
                    this.$emp.text(this.getSupplierName(data.supplierId)).prev().html('<b style="visibility: hidden;">占</b>供应商：').parent().show();
                }else if(data.outwaretype==3){
                    this.$emp.text(this.getShopName(data.toshopid)).prev().html('调入门店：').parent().show();
                }else if(data.outwaretype==4 || data.outwaretype==8 || data.outwaretype==6 || data.outwaretype==7){
                    this.$emp.text(am.metadata.empMap[data.employeeid].name).prev().html('员<b style="visibility: hidden;">占位</b>工：').parent().show();
                }else{
                    this.$emp.parent().hide();
                }
            }

            this.$no.text(data.billno);
            this.$remark.text(data.remark);

            this.$totalPrice.text(Number(data.price).toFixed(2));

            this.scrollor.refresh();
            this.scrollor.scrollTo('top');
        },
        operateBill:function(){
            var data = this.$li.data("data"),_this=this;
            am.loading.show();
            var index = am.page.storage.$.find('.nav .active').index();
            var apiName = '';
            var option = {};
            if(index==2){
                if(data.status==0){
                    apiName = 'storageOutAudit';
                }else if(data.status==1){
                    apiName = 'storageOutCancel';
                }
                option = {
                    "id": data.id,
                    "auditid": am.metadata.userInfo.userId,
                    "outwaretype": data.outwaretype,
                    "status": data.status,
                    "type": data.type,
                }
            }else if(index==4){
                if(data.status==0){
                    apiName = 'storageIntoAudit';
                }else if(data.status==1){
                    apiName = 'storageIntoCancel';
                }
                option = {
                    "id": data.id,
                    "auditid": am.metadata.userInfo.userId,
                }
            }
            var para = {};
            if(index==2){
                para.outdepot = {};
                para.outdepot = option;
            }else if(index==4){
                para.intodepot = {};
                para.intodepot = option
            }
            am.api[apiName].exec(para,function (ret){
                am.loading.hide();
                if(ret && ret.code == 0){
                    _this.$li.remove();
                    _this.cb && _this.cb("remove");
                    _this.hide();
                    am.page.storage.deepfresh();
                    if(index==2){
                        $('#outgf .pagerBox li').filter(".active").trigger("vclick");
                    }else if(index==4){
                        $('#intogf .pagerBox li').filter(".active").trigger("vclick");
                    }
                }else{
                    var str = '';
                    if(data.status==0){
                        str = '审核失败';
                    }else {
                        str = '反审核失败！';
                    }
                    am.msg(ret.message || str);
                }
            });
        },
        deleteBill:function(){
            var data = this.$li.data("data"),_this=this;
            am.loading.show();
            var index = am.page.storage.$.find('.nav .active').index();
            var apiName = '';
            var para = {
                shopId: amGloble.metadata.userInfo.shopId
            };
            if(index==2){
                apiName = 'storageOutDelete';
                para.outdepot = {};
                para.outdepot = {id:data.id};
            }else if(index==4){
                apiName = 'storageIntoDelete';
                para.intodepot = {};
                para.intodepot = {id:data.id};
            }
            am.api[apiName].exec(para,function (ret){
                am.loading.hide();
                if(ret && ret.code == 0){
                    _this.$li.remove();
                    _this.cb && _this.cb("remove");
                    _this.hide();
                    if(index==2){
                        $('#outgf .pagerBox li').filter(".active").trigger("vclick");
                    }else if(index==4){
                        $('#intogf .pagerBox li').filter(".active").trigger("vclick");
                    }
                }else{
                    am.msg(ret.message || '删除失败');
                }
            });
        },
        hide:function(){
            this.$.removeClass("active");
            this.$mask.hide();
        },
        getOutType:function(stype){
            var methods = JSON.parse(am.metadata.inoutDepotType);
            var outMethods = [];
             for(var i=0;i<methods.length;i++){
                if(methods[i].type==0){
                    outMethods.push(methods[i]);
                }
            }
            for(var i=0;i<outMethods.length;i++){
                if(stype==outMethods[i].code){
                    return outMethods[i].typeName;
                }
            }
            return '--';
        },
        getIntoType:function(stype){
            var methods = JSON.parse(am.metadata.inoutDepotType);
            var intoMethods = [];
             for(var i=0;i<methods.length;i++){
                if(methods[i].type==1){
                    intoMethods.push(methods[i]);
                }
            }
            for(var i=0;i<intoMethods.length;i++){
                if(stype==intoMethods[i].code){
                    return intoMethods[i].typeName;
                }
            }
            return '--';
        },
        getDepotById:function(list,id){
            if(!list.idmap){
                list.idmap = {};
                for (var i = 0; i < list.length; i++) {
                    list.idmap[list[i].id] = list[i];
                }
            }
            return list.idmap[id];
        },
        getCategoryName:function(id){
            if(!am.metadata.categoryMap){
                am.metadata.categoryMap = {};
                var category = am.metadata.category;
                for (var i = 0; i < category.length; i++) {
                    am.metadata.categoryMap[category[i].marqueid] = category[i];
                }
            }
            var r =am.metadata.categoryMap[id];
            return r?r.type:"--"
        },
        getShopName:function(id){
            var shops = am.metadata.shopList;
            for(var i=0;i<shops.length;i++){
                if(shops[i].shopId==id){
                    return shops[i].osName;
                }
            }
            return '';
        },
        getSupplierName:function(id){
            var suppliers = am.metadata.suppliers;
            for(var i=0;i<suppliers.length;i++){
                if(suppliers[i].id==id){
                    return suppliers[i].name;
                }
            }
            return '';
        }
    };

    var List = function(opt) {
        this.api = opt.api;
        this.$ = opt.$;
        this.renderItem = opt.renderItem;
        this.$pager = opt.$pager;
        this.pageSize = opt.pageSize || 15;
        this.pageNum = 1;
    }
    List.prototype = {
        show: function() {
            var self = this;
            this.$.show();
            if(!this.pager){
                this.initEventBind();
            }
            this.$.find('.search-bill-type,.search-bill-status').html('全部');
            this.getData();
        },
        initEventBind:function(){
            var self = this;
            // this.pager = new $.am.Paging({
            //     $:this.$pager,
            //     showNum:this.pageSize,//每页显示的条数
            //     total:100,//总数
            //     action:function(_this,index){
            //         self.pageNum = index*1+1;
            //         self.getData();
            //     }
            // });
            console.log(this.pager);
            this.$ul = this.$.find("ul.datalist").on("vclick","li",function(){
                popUp.show($(this),function(){
                    // self.scrollor.refresh();
                });
                self.$commentPop.hide();
            }).on("vclick",".remark",function(e){
                e.stopPropagation();
                if($(this).find("p.sj").length){
                    var top=$(this).offset().top;
                    var left=$(this).offset().left;
                    var bottom=$("body").height()-top;
                    var width = $(this).outerWidth();
                    // self.$commentPop.css({"display":"block","bottom":bottom+"px","left":(left-64)+"px"});
                    self.$commentPop.show().css('left',left-75+'px').css('width',width+'px');
                    self.$commentPop.find('.text').text($(this).children('span').text());
                    var remarkHight = $(this).outerHeight();
                    var height = self.$commentPop.outerHeight();
                    if(height<=top){
                        self.$commentPop.css('bottom',bottom+'px');
                        self.$commentPop.find('.before').hide();
                        self.$commentPop.find('.after').show();
                    }else {
                        self.$commentPop.css('bottom',bottom-height-remarkHight+'px');
                        self.$commentPop.find('.after').hide();
                        self.$commentPop.find('.before').show();
                    }
                }
            }).on('vclick','.date',function(e){
                self.updateItem = $(this).parents('li').data('data');
                if(self.updateItem.status==0 && am.page.storage.canUpdateTime){
                    e.stopPropagation();
                }
            });
            this.$li = this.$ul.find("li").remove();

            this.$commentPop= this.$.find(".commentPoP").vclick(function(){
                $(this).hide();
            });

            var type = [];
            if(this.$.index()==2){
                type = JSON.parse(JSON.stringify(am.page.storage.out.methods));
            }else {
                type = JSON.parse(JSON.stringify(am.page.storage.into.methods));
            }
            type.unshift({
                name: '全部',
                code: null
            });

            this.$billSearchType = this.$.find('.search-bill-type').vclick(function(){
                var _this = $(this);
                am.popupMenu("请选择方式", type , function (ret) {
                    _this.html(ret.name);
                    self.waretype = ret.code;
                    var index = am.page.storage.$.find('.nav .active').index();
                    if(index==2){
                        self.condition = { 
                            outSto : {
                                status: self.status,
                                outwaretype: self.waretype
                            }
                        }   
                    }else if(index==4){
                        self.condition = { 
                            inSto : {
                                status: self.status,
                                inwaretype: self.waretype
                            }
                        }
                    }
                    self.pageNum = 1;
                    self.getData(self.condition);
                });
            });

            var status = [
                {
                    name: '全部',
                    code: null
                },
                {
                    name: '未审核',
                    code: 0
                },
                {
                    name: '已审核',
                    code: 1
                }
            ];

            this.$billSearchStatus = this.$.find('.search-bill-status').vclick(function(){
                var _this = $(this);
                am.popupMenu("请选择状态", status , function (ret) {
                    _this.html(ret.name);
                    self.status = ret.code;
                    var index = am.page.storage.$.find('.nav .active').index();
                    if(index==2){
                        self.condition = { 
                            outSto : {
                                status: self.status,
                                outwaretype: self.waretype
                            }
                        }   
                    }else if(index==4){
                        self.condition = { 
                            inSto : {
                                status: self.status,
                                inwaretype: self.waretype
                            }
                        }
                    }
                    self.pageNum = 1;
                    self.getData(self.condition);
                });
            });

            this.scrollor = new $.am.ScrollView({
                $wrap : this.$.find('.listContainer'),
                $inner : this.$.find('.listContainer').children(),
                direction : [false, true],
                hasInput: false
            });
        },
        getData: function(status) {
            var self = this;
            am.loading.show();
            var data = {
                "parentShopId": am.metadata.userInfo.parentShopId,
                "shopId": am.metadata.userInfo.shopId,
                "pageSize": this.pageSize,
                "pageNum":this.pageNum || 1
            }
            for(var key in status){
                data[key] = status[key];
            }
            am.api[this.api].exec(data, function(ret) {
                console.log(ret);
                am.loading.hide();
                if (ret && ret.code == 0 && ret.content.length) {
                    self.$pager.show();
                    self.render(ret.content);
                    if(self.pager){
                        self.pager.refresh(self.pageNum-1,ret.count);
                    }else {
                        self.pager = new $.am.Paging({
                            $:self.$pager,
                            showNum:self.pageSize,//每页显示的条数
                            total:ret.count,//总数
                            action:function(_this,index){
                                self.pageNum = index*1+1;
                                self.getData(self.condition);
                                self.$commentPop.hide();
                            }
                        });
                    }
                    // self.pager.refresh(self.pageNum-1,ret.count);
                } else if (ret && ret.code == 0 && !ret.content.length) {
                    am.msg("暂时没有数据...");
                    self.$ul.empty();
                    self.$pager.hide();
                } else if (ret.code == -1) {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络错误',
                        description: '发生网络错误，请检查网络',
                        okCaption: '重试',
                        cancelCaption: '返回'
                    }, function() {
                        self.getData();
                    }, function() {

                    });
                }
            })
        },
        render:function(data){
            var _this = this;
            am.page.storage.getData(function(ret){
                if(ret && ret.code==0){
                    _this.$ul.empty();
                    for(var i=0;i<data.length;i++){
                        var $li = _this.$li.clone();
                        _this.renderItem($li,data[i],ret.content);
                        if(data[i].status==0 && am.page.storage.canUpdateTime){
                            $li.find('.date').addClass('canUpdate')
                            $li.find('.date').mobiscroll().calendar({
                                theme: 'mobiscroll',
                                lang: 'zh',
                                display: 'bottom',
                                months: "auto",
                                // min:ts,
                                max: amGloble.now(),
                                defaultValue: data[i].outdate?new Date(data[i].outdate):new Date(data[i].intodate),
                                //controls: ['calendar', 'time'],
                                setOnDayTap: true,
                                buttons: [],
                                endYear: amGloble.now().getFullYear()+50,
                                onSet: function(valueText, inst) {
                                    _this.updateTime(valueText,inst);
                                }
                            });
                        }
                        _this.$ul.append($li.data('data',data[i]));
                    }
                    _this.checkMore();
                    _this.scrollor.refresh();
                    _this.scrollor.scrollTo('top');
                }else{
                    am.msg("数据读取失败！");
                }
            });
        },
        getAdminNameById:function(id){
            if(!this.adminMap){
                var array = am.metadata.adminList;
                this.adminMap = {};
                for (var i = 0; i < array.length; i++) {
                    this.adminMap[array[i].id] = array[i];
                }
            }
            return this.adminMap[id] ? this.adminMap[id].name : "--";
        },
        updateTime:function(valueText,inst){
            console.log(this.updateItem);
            // console.log(new Date(valueText.valueText).format("yyyy-mm-dd"));
            var newTime = new Date(valueText.valueText).getTime();
            if((this.updateItem.outdate && new Date(this.updateItem.outdate).format('yyyy-mm-dd') == new Date(valueText.valueText).format("yyyy-mm-dd")) ||
                (this.updateItem.intodate && new Date(this.updateItem.intodate).format('yyyy-mm-dd') == new Date(valueText.valueText).format("yyyy-mm-dd"))){
                return;
            }
            var para = {};
            var apiName = '';
            if(this.updateItem.outwaretype){
                this.updateItem.outdate = newTime;
                para.outdepot = this.updateItem;
                apiName = 'storageAddOutStoRecord';
            }else if(this.updateItem.inwaretype){
                this.updateItem.intodate = newTime;
                para.intodepot = this.updateItem;
                apiName = 'storageAddInStoRecord';
            }
            var _this = this;
            am.loading.show();
            am.api[apiName].exec(para,function(ret){
                console.log(ret)
                am.loading.hide();
                if(ret && ret.code==0){
                    am.msg('修改成功');
                    _this.getData(_this.condition);
                }else if(ret && ret.code==-1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据更新失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        _this.updateTime(valueText,inst);
                    }, function(){

                    });
                }
            });
        },
        checkMore:function(){
            this.$ul.find('li').each(function(){
                var $remark= $(this).find(".remark");
                if($remark.children("span").width() > $remark.width()){
                    $remark.append($('<p class="sj"></p>').show());
                }
            });
        },
        getDepotById:popUp.getDepotById,
        getOutType:popUp.getOutType,
        getIntoType:popUp.getIntoType,
    };
    am.page.storage.List = List;
    am.page.storage.inAndOutPopUp = popUp;
})();
