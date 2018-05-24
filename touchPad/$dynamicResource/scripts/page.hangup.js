(function() {
    var self = am.page.hangup = new $.am.Page({
        id: "page_hangup",
        isWin:navigator.platform.indexOf('Win') == 0,
        backButtonOnclick: function() {
            //$.am.page.back("slidedown");
            if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                return;
            }else{
                $.am.changePage(am.page.service,'');
            }
            
	        /*,{
		        opt: "back",
			        delBillArr: self.delBillArr
	        }*/
        },
        init: function() {
 
            am.hangupRemark.init();


            this.$win = this.$.find('.search_wrap');
            if(this.isWin){
                this.$win.addClass('isWin');
            }else{
                this.$win.removeClass('isWin');
            }
            var self = this;
            this.$root = $('#page_hangup');
            this.$warn = this.$.find('.warn');
            this.$container = $('#content_wrap');

            $('.member-seleced-mark').hide();

            $('.cansel-mark').on('vclick', function(){
                $('.member-seleced-mark').hide();
                self.filter();
                $('.hangup-foot-list li').removeClass('selected');
            })

            this.hangupScroll = new $.am.ScrollView({
                $wrap: this.$.find('.hangup_wrap'),
                $inner: this.$container,
                direction: [false, true],
                hasInput: false
            });

            this.initMember(self);

         
            this.$operateWrap = $('#page_hangup .operate_wrap');
            this.$keywordPc = this.$operateWrap.find('.input_no');
            this.$keywordMb = this.$operateWrap.find('.no_box');
            this.$.on('vclick', '.merge_btn', function() {
                self.$root.addClass('active');
                self.$warn.hide();
                self.$.find('.hangup_inner table.up .tips').trigger('vclick');
            }).on('vclick', '.sure_btn', function() {
                self.merge();
            }).on('vclick', '.cancel_btn', function() {
                self.resetMergeClass();
            }).on('vclick', '.self_mask', function() {
                var $first = self.$container.find('.firstSelected');
                if($first.length>0){
                    if( !$(this).hasClass('selected')&& !$(this).hasClass('firstSelected')){
                        $(this).addClass('selected');
                    }else{
                        if($(this).hasClass('selected')){
                            $(this).removeClass('selected');
                        }else if($(this).hasClass('firstSelected')){
                            $(this).removeClass('firstSelected');
                            $(this).parents('.content_wrap').find('.self_mask.selected').eq(0).removeClass('selected').addClass('firstSelected');
                        }
                    }
                }else{
                    $(this).addClass('firstSelected');
                }
            }).on('keyup', '.search_wrap .input_no', function(e) {//pc版 input 修改：每次输入后500毫秒之后自动搜索 
                if (e.keyCode == 13) {
                    self.searchTheRes();
                }else{
                    clearTimeout(self.searchTimer);
                    self.searchTimer=null;
                    if(!self.searchTimer){
                        self.searchTimer = setTimeout(function(){
                            self.searchTheRes();
                        },400);
                    }
                }
            }).on('vclick', '.search_wrap .search_icon', function() {
                self.searchTheRes();
            }).on('vclick', '.icon_delete', function() {
                var idx = $(this).closest('.hangup_block').attr('data-index');
                self.delete(self.tempData[idx]);
            }).on('vclick', '.hangup_cash_btn', function() {
                var idx   = $(this).closest('.hangup_block').attr('data-index');
                var items = self.tempData[idx];
                self.getBill(items);
            }).on('vclick', '.wash-opt', function() {
                var idx = $(this).closest('.hangup_block').attr('data-index');
                var _this = $(this);
              
                self.washOpt(_this, self.tempData[idx]);
            }).on('vclick','.serviceItemsInner',function(){
                var $this=$(this);
                if($this.hasClass("down")){
                    $this.removeClass("down").addClass("up");
                }else if($this.hasClass("up")){
                    $this.removeClass("up").addClass("down");
                }
            }).on('vclick','.tips',function(){
                var $this=$(this);
                var parent= $this.parents("table");
                var block = $this.parents("div.hangup_block");
                var offCount = parent.find(".restData tr").length;
                if(parent.hasClass("down")){//展开 显示剩余的
                    $('.hangup_mask').show();
                    self.fixHeight(true,offCount);
                    parent.removeClass("down").addClass("up");
                    block.addClass("float");
                    $this.text("收起");
                }else if(parent.hasClass("up")){//收起 收起剩余的
                    $('.hangup_mask').hide();
                    self.fixHeight(false,offCount);
                    parent.removeClass("up").addClass("down");
                    block.removeClass("float");
                    $this.text("展开");
                }
                self.hangupScroll.refresh();
            }).on('vclick','.hangup_mask',function(){
                $('.billTb.up').find('.tips').trigger("vclick");
            }).on("vclick",".openbill",function(){
                $.am.changePage(am.page.openbill, "",{source:"hangup"});
                
                
                //$.am.changePage(am.page.openbill, "slideup",{source:"openbill"});
            }).on("vclick",".cards_btn",function(){
                $.am.changePage(am.page.queue, "slideup");
            }).on("vclick",".pay_btns",function(){
                $.am.changePage(am.page.prepay, "slideup");
            }).on('vclick','.manualRefresh',function(){
                if(!self.isRefreshing){
                    self.startGetDate();
                }
            }).on("vclick",".remarkComboBox",function(e){
                e.stopPropagation();
                var idx = $(this).closest('.hangup_block').attr('data-index');
                var data = $(this).data("item");
                var item  = am.clone(self.tempData[idx]);
                var sdata = am.clone(self.getBillData(item)); 
                var $this = $(this);
                am.confirm("提示","确定要更改购买套餐状态吗？","确定","取消",function(){
                    data.isbuy = !data.isbuy;
                    if(data.isbuy){
                        $this.addClass("selected");
                    }else{
                        $this.removeClass("selected");
                    }
                    sdata.billRemark.buypackage = data;
                    var temp = item;
                    item.data = JSON.stringify(sdata);
                    self.saveBill(item);
                    temp.data = sdata;
                    self.tempData[idx] = temp;
                });
            }).on('vclick',"tr.remark",function(event){
                event.stopPropagation();
	            var idx = $(this).closest('.hangup_block').attr('data-index');
	            var data =self.tempData[idx];
	            var $this=$(this).find(".remarkWrap");
                console.log('remarkWrap:',data);
                var sendData = data.data?JSON.parse(data.data):{};

                am.hangupRemark.show({
                    value:data.instorecomment || "",
                    billData:data,
                    submit:function (res) {
                        var remark = res.textarea;
                        sendData.billRemark = res;
                        delete sendData.billRemark.textarea;
	                    am.loading.show();
	                    am.api.hangupSave.exec({
                            id:data.id,
                            data:JSON.stringify(sendData),
		                    instorecomment:remark,
                            parentShopId:am.metadata.userInfo.parentShopId,
                            shopId:am.metadata.userInfo.shopId,
                            serviceNO:data.serviceNO
                        }, function(ret){
		                    am.loading.hide();
		                    if(ret && ret.code===0){
			                    am.msg("修改成功");
                                data.instorecomment = remark;
                                data.data = sendData;
                                self.rendBillRemark(data,$this.parents(".gatherData"));
                                if(remark){
                                    $this.text(remark);
                                    $this.parent().addClass('has');
                                }else {
                                    $this.text('');
                                    $this.parent().removeClass('has');
                                }  
		                    } else {
			                    am.msg("保存失败！");
		                    }
	                    });
                    }
                });
            }).on("vclick",".remarkCardBox span",function(event){
                event.stopPropagation();
                var data = $(this).data("item");
                var sname = $(this).data("sname");
                var idx = $(this).closest('.hangup_block').attr('data-index');
                var item  = am.clone(self.tempData[idx]);
                var sdata = am.clone(self.getBillData(item)); 
                var $this = $(this);
                var tips = "确定要更改状态吗？";
                if(sname == 'opencard'){
                    tips = "确定要更改开卡状态吗？";
                }
                if(sname == 'recharge'){
                    tips = "确定要更改充值状态吗？";
                }
                am.confirm("提示",tips,"确定","取消",function(){
                    data.isbuy = !data.isbuy;
                    if(data.isbuy){
                        $this.addClass("selected");
                    }else{
                        $this.removeClass("selected");
                    }
                    sdata.billRemark[sname] = data;
                    var temp = item;
                    item.data = JSON.stringify(sdata);
                    self.saveBill(item);
                
                    temp.data = sdata;
                    self.tempData[idx] = temp;
                });
                
            }).on('vclick','.content .name',function(){
                var idx   = $(this).closest('.hangup_block').attr('data-index');
                var items = self.tempData[idx];
                console.log(items)
                var paras = {
                    customerId:items.memId,
                    tabId:1
                }
                if(self._billType){
                    paras.openbill = self._billType;
                }
                $.am.changePage(am.page.memberDetails, "slideup",paras);
            });
        },
        saveBill:function(item){
            am.api.hangupSave.exec({
                id:item.id,
                data:item.data,
                memId:item.memId,
                memName:item.memName,
                memPhone:item.memPhone,
                memcardid:item.memcardid,
                parentShopId:am.metadata.userInfo.parentShopId,
                shopId:am.metadata.userInfo.shopId,
                serviceNO:item.serviceNO || ""
            }, function(ret){
                am.loading.hide();
                if(ret && ret.code===0){
                    
                } else {
                    am.msg("原单据信息更新失败！");
                }
            });
        },
        checkRemark:function(data,callback,ishideService){
            //校验备注框
            var billRemark = null;
            var _data = data.data;
            var sendData = {};
            try{    
                sendData = JSON.parse(_data);
            }catch(e){}
            if(sendData.billRemark){//存在备注
                var remarkList = this.getOperate(sendData.billRemark,ishideService);
                if((remarkList.length==1 && remarkList[0].code==0) || remarkList.length==0){
                    return false;
                }else{
                    am.popupMenu("请选择操作",remarkList,function(res){
                        callback && callback(res);
                    });
                }
                
                return true;
            }else{
                return false;
            }
        },
        getBill:function(items){
            var billData = self.getBillData(items);
            var billRemark = billData.billRemark;
            var remarkCallback = function(members){
                var _data = am.clone(items);
                var sendData = am.clone(billData);
                if(members){
                    sendData.cid = members.cid;
                    sendData.memGender=members.sex;
                    _data.memId  = members.id;
                    _data.memName= members.name;
                    _data.memPhone=members.mobile;
                    _data.memcardid=members.cid;
                }
                sendData.billRemark.recharge.isbuy = true;
                _data.data = JSON.stringify(sendData);
                self.saveBill(_data);
            }
            var checkRemark = self.checkRemark(items,function(res){
                if(res.code==0){
                    am.cashierTab.feedBill(items,1);
                }
                if(res.code == 1){//开卡
                    $.am.changePage(am.page.memberCard,"",{billRemark:items});
                }
                if(res.code == 2){//充值
                    am.searchMember.getMemberById(items.memId,billRemark.recharge.id,function(content){
                        if(content){
                            // am.pw.check(content, function (verifyed) {
                            //     if (verifyed) {
                                    $.am.changePage(am.page.pay, "slideup", {
                                        action: "recharge",
                                        member: content,
                                        rechargeMoney:billRemark.recharge.money,
                                        billRemark:items,
                                        remarkCallback:remarkCallback
                                    });
                            //     }
                            // });
                            $.am.changePage(am.page.pay, "slideup", {
                                action: "recharge",
                                member: content,
                                rechargeMoney:billRemark.recharge.money,
                                billRemark:items,
                                remarkCallback:remarkCallback
                            });
                        }else{
                            amGloble.msg("该顾客没找到可充值的卡！");
                        }
                        
                    });
                    
                }
                if(res.code == 3){//购买套餐
                    $.am.changePage(am.page.comboCard,"",{billRemark:items});
                }
            });
            if(!checkRemark){
                am.cashierTab.feedBill(items,1);
            }
        },
        getOperate:function(billRemark,ishideService){
            var res = [];
            if(!ishideService){
                res.push({
                    code:0,
                    name:"项目收银"
                });
            }
            
            if(billRemark.opencard && !billRemark.opencard.isbuy){
                res.push({
                    code:1,
                    name:"开卡"
                });
            }
            if(billRemark.recharge && !billRemark.recharge.isbuy){//
                res.push({
                    code:2,
                    name:"充值"
                });
            }
            if(billRemark.buypackage && !billRemark.buypackage.isbuy){
                res.push({
                    code:3,
                    name:"购买套餐"
                });
            }
            return res;
        },
        searchTheRes:function(){
            var keyword = self.$keywordPc.val();
            self.filter(keyword);
            self.hangupScroll.refresh();
            self.hangupScroll.scrollTo("top");
        },
        fixHeight:function(flag,offCount){//true增加相应的高度  false//减少相应的高度
            var curHeight = this.$container.height(),TRH = 40;
            var offsetH = TRH*offCount;
            if(flag){
                this.$container.height(curHeight+offsetH);
            }else{
                this.$container.height("auto");
            }
            this.hangupScroll.refresh();
        },
        changePageType:function(tags){//tags 0:全屏 1:非全屏
            if(tags){
                this.$.removeClass('am-full').addClass('half_page');
            }else{
                this.$.addClass('am-full').removeClass("half_page");
            }
        },
        beforeShow: function(paras) {

            if(amGloble.metadata.userInfo.operatestr.indexOf('a30,') != -1 && amGloble.metadata.shopPropertyField.mgjBillingType==1){
                this.$.find(".openbill").hide();
            }else{
                this.$.find(".openbill").show();
            }
            if(paras){
                self.setting_washTime = paras.setting_washTime;
            }
            if(paras && paras.openbill){
                this.changePageType(1);
                am.tab.main.show().select(1);
                this._billType = paras.openbill;
            }else{
                this.changePageType(0);
            }
            if(am.metadata){
                am.hangupRemark.refresh();
            }
            // am.loading.show("正在获取数据，请稍候...");
            // this.$container.append('<div class="hangup_mask am-clickable"></div>');
            this.$hangupMask = this.$.find('.hangup_mask').hide();
            //this.hangupScroll.refresh();
            if(am.metadata.userInfo.mgjVersion==3){
                this.$.find('.cards_btn').show();
            }else {
                this.$.find('.cards_btn').hide();
            }

            this.removeCheckedBIll();
        },
        afterShow: function() {
            this.startGetDate();
            this.hangupScroll.refresh();
            // this.initMember();
        },
        removeCheckedBIll:function(){
            if(this.lastCheckedBillId){
                if(this.tempData && this.tempData.length){
                    for(var i=0;i<this.tempData.length;i++){
                        if(this.tempData[i].id==this.lastCheckedBillId){
                            this.$container.find('.hangup_block[data-index='+i+']').remove();
                            this.lastCheckedBillId = '';
                            return;
                        }
                    }
                }
            }
        },
        startGetDate:function(){
            $('.member-seleced-mark').hide();
            this.isRefreshing = true;
            this.getData(function(ret){
                self.isRefreshing = false;
                if (ret.code == 0) {
                    self.render(ret.content);
                    self.hangupScroll.refresh();
                    self.hangupScroll.scrollTo("top");
                    // self.hangupFootScroll.refresh();
                } else {
                    am.msg(ret.message || "数据刷新失败，请重试！");
                }
            });
        },
        initMember: function(self){
              //底部员工列表
            // this.hangupFooList = $('.hangup-foot-list');
            // var hangupWarp= $(window).width() -75+'px';
            // $('.hangup-foot-show').css('width',hangupWarp)
            $('.hangup-foot-list').on('vclick', 'li', function() {
                var _this = $(this);
                var selectImg = _this.find('img');
                var $name = _this.attr('name');
                var $no = _this.attr('no');
                var $memberSelect = $('.member-seleced-mark');
                var $displayId = _this.attr('displayId');
                if(_this.hasClass('selected')){
                    _this.removeClass('selected')
                    selectImg.removeClass('hangup-img-none');
                    self.filterServerMember();
                    self.hangupScroll.refresh();
                    self.hangupScroll.scrollTo("top");
                    $memberSelect.hide();
                }else{
                    _this.parent().find('li').removeClass('selected');
                    _this.parent().find('img').removeClass('hangup-img-none');
                    _this.addClass('selected')
                    selectImg.addClass('hangup-img-none');                    
                    self.filterServerMember($displayId);
                    self.hangupScroll.refresh();
                    self.hangupScroll.scrollTo("top");
                    $('.member-seleced-mark .mark-content').text($no+ ' ' + $name);
                    $memberSelect.show();
                }
            })
        },
        beforeHide: function() {
            this.resetMergeClass();
            // this.$container.empty();
            this.delBillArr = null;
            this.$keywordPc.val('');
            // 清除定时器
            if (this.machineBox && this.machineBox.length > 0) {
                for (var i = 0; i < this.machineBox.length; i++) {
                    clearInterval(this.machineBox[i]);
                }
            }
        },
        merge:function(){//并单 //读取数据//confirm确认并单//保存新订单数据  //删除其他非主订单的数据
            var ret=this.checkSelection();
            var firstSelected = ret.firstSelected;
            if(!ret.selected.length){
                am.msg("请选中至少两个单据！");
                return;
            }
            var data = $.extend(true, {}, firstSelected.data || {});
            data.serviceItems = data.serviceItems || [];
            data.products = data.products || {};
            data.products.depots = data.products.depots || [];
            var ids = [];
            var displayIds = [];
            $.each(ret.selected, function(i, item) {
                if(!data.billRemark && item.data && item.data.billRemark){
                    data.billRemark = {};
                }
                if(item.data && item.data.billRemark){
                    if(item.data.billRemark.buypackage && !data.billRemark.buypackage){
                        data.billRemark.buypackage = item.data.billRemark.buypackage;
                    }
                    if(item.data.billRemark.recharge && !data.billRemark.recharge){
                        data.billRemark.recharge = item.data.billRemark.recharge;
                    }
                    if(item.data.billRemark.opencard && !data.billRemark.opencard){
                        data.billRemark.opencard = item.data.billRemark.opencard;
                    }
                }
                if (item.data && item.data.serviceItems && item.data.serviceItems.length) {
                    data.serviceItems = data.serviceItems.concat(item.data.serviceItems);                
                    $.each(data.serviceItems,function(i,item){item.notAuto=0});//不动位置              
                }
                if (item.data && item.data.products && item.data.products.depots && item.data.products.depots.length) {//新增合并卖品
                    data.products.depots = self.uniqueArray(data.products.depots.concat(item.data.products.depots));
                }
                ids.push(item.id);
                displayIds.push(item.displayId);
            });
            console.log(data,ids);
            atMobile.nativeUIWidget.confirm({
                caption: '确认合并',
                description: displayIds.join(",") + "号服务将被并入" + firstSelected.displayId + "号服务，此操作不可撤销，是否确定合并？",
                okCaption: '合并',
                cancelCaption: '取消'
            }, function(){
                var opt = {
                    id: firstSelected.id,
                    data: JSON.stringify(data),
                    "parentShopId": firstSelected.parentShopId,//传parentShopId和shopId流水单号serviceNO才会正确生成
                    "shopId": firstSelected.shopId,
                };
                if(firstSelected.serviceNO){
                    opt.serviceNO = firstSelected.serviceNO;
                }
                am.loading.show();
                opt.parentShopId = amGloble.metadata.userInfo.parentShopId;
                am.api.hangupSave.exec(opt, function(ret) {
                    am.loading.hide();
                    if (ret && ret.code == 0) {
                        //删除被合并单
                        am.api.hangupDelete.exec({
                            ids: ids,
                            "shopId": am.metadata.userInfo.shopId,
                            "parentShopId": am.metadata.userInfo.parentShopId,
                            "cancelReason":"并单删除",
                            "operatorId": am.metadata.userInfo.userId,
                            "operatorName": am.metadata.userInfo.userName
                        }, function(ret) {
                            if (ret.code == 0) {
                                self.getData(function(ret){
                                    am.loading.hide();
                                    if (ret.code == 0) {
                                        am.msg("操作成功");
                                        self.render(ret.content);
                                        self.hangupScroll.refresh();
                                        self.hangupScroll.scrollTo("top");
                                        self.resetMergeClass();
                                        self.startGetDate();
                                    } else {
                                        am.msg(ret.message || "数据刷新失败，请重试！");
                                    }
                                })
                            } else {
                                am.msg(ret.message || "删除服务单失败，请重试！");
                            }
                        });
                    } else {
                        am.msg("操作失败，请重试~");
                    }
                });
            }, function(){

            });
        },
        uniqueArray:function(arr){//去重 合并数量
            var res = [], hash = {};
            for (var i = 0;i<arr.length; i++) {
                var item = arr[i];
                var key = arr[i].productid;
                if (!hash[key]) {
                    res.push(item);
                    hash[key] = item;
                }else{
                    hash[key].number=hash[key].number+item.number;
                }
            }
            $.each(res,function(j,jtem){
                if(hash[jtem.productid]){
                    jtem = hash[jtem.productid];
                }
            })
            return res;
        },
        checkSelection:function(){
            var ret={};
            var $firstSelected=this.$container.find('.firstSelected').parents('.hangup_block');
            ret.firstSelected=$firstSelected.data('data');
            var $selected=this.$container.find('.self_mask.selected').parents('.hangup_block');
            ret.selected=[];
            $selected.each(function(i,item){
                ret.selected.push($(item).data('data'));
            });
            return ret;
        },
        resetMergeClass:function(){
            self.$root.removeClass('active');
            /*this.$container.removeClass('active');
            this.$operateWrap.removeClass('active');*/
            this.$container.find('.self_mask').removeClass('selected').removeClass('firstSelected');
            if(this.$.hasClass('half_page')){
                this.$warn.show();
            }
        },
        filter: function(key) {
            var $inners = this.$container.children('.hangup_block');
            if (!$.trim(key)) {
                $inners.show();
                return;
            }

            var keys = key.split(" ");
            var findString = function(str) {
                if (!str) {
                    return false;
                }
                if(typeof str == 'string'){
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (key && str.search(key) != -1) {
                            // console.log("true");
                            return true;
                        }
                    }
                }else if(typeof str =='object'){
                    if(Object.prototype.toString.call(str) === '[object Array]'){
                        for(var k=0;k<str.length;k++){
                            var ktem = str[k];
                            for (var i = 0; i < keys.length; i++) {
                                var key = keys[i];
                                if (key && ktem.search(key) != -1) {
                                    // console.log("true");
                                    return true;
                                }
                            }
                        }
                    }
                }
                
                return false;
            };
            $inners.each(function(i, item) {
                var $this = $(item);
                var $cust = $this.find('.name');
                var $serv = $this.find('.serversContent');
                var data = $this.data("data");
                var found = false;
                if (findString(data.displayId) || findString($cust.text().slice(1)) || findString($serv.text().slice(4).split(' ')) ) {
                    $this.show();
                } else {
                    $this.hide();
                }
            });

        },

        filterServerMember: function(key) {
            var $inners = this.$container.children('.hangup_block');
            if (!$.trim(key)) {
                $inners.show();
                return;
            }
            var keys = key.split(" ");
            var findString = function(str) {
                if (!str) {
                    return false;
                }
                if(typeof str == 'string'){
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (key && str == key) {
                            return true;
                        }
                    }
                }
                return false;
            };
            $inners.each(function(i, item) {
                var $this = $(item);
                var $cust = $this.find('.name');
                var $serv = $this.find('.serversContent');
                var data = $this.data("data");
                var found = false;
                if (findString(data.displayId)) {
                    $this.show();
                } else {
                    $this.hide();
                }
            });

        },
        getData: function(cb) {
            var self = this;
            var user = am.metadata.userInfo;
            //self.$container.empty();
            //self.hangupScroll.refresh();
            if(!this.tempData){
                am.loading.show("正在获取数据，请稍候...");
            }
            am.api.hangupList.exec({
                "shopId": user.shopId,
                //"employeeId": 1234, //可选，如果有则按员工查询
                //"key": "", //可选，如果有则按关键字搜索，包括服务号、客户姓名、服务者姓名、备注
                //"displayId": "1234", //可选，如果有则按手牌号查询
                //"period": "2016-01-05_2016-05-05", //可选，如果有则按时间区间查询，否则查询全部
                //"fromHistory": 1, //可选，如果为1，则查询删除表，否则查询进行中的服务的表
                //"status": 2, //可选，如果有，则按status查询，0普通单 1已结算 2已删除
                "pageSize": 99999, //可选，如果有则分页，否则不分页
                //"pageNumber": 0, //可选，如果有pageSize，此参数才有意义
                //"simpleData":1  //如果为1 则只返回  displayId
                "channel":1
            }, function(ret) {
                console.log(ret);
                am.loading.hide();
                if (ret.code == 0) {
                    self.cachedata = ret;
                    self.cachedata.ts = new Date().getTime();
	                am.cashierTab.setHangUpNum(ret.count);
                }
                cb(ret);
            });
        },
        getBillData:function(item){
            var sdata = item.data;
            var _data = {};
            try{
                if(sdata){
                    _data = JSON.parse(sdata);
                }
            }catch(e){};
            return _data;
        },
        rendBillRemark:function(item,$tfoot){
            var billData = self.getBillData(item);
            var billRemark = billData.billRemark;
            if(!item.instorecomment && !billRemark){
                $tfoot.find(".remarkbox").append('<p class="empty">暂无备注~</p>').show();
            }
            
            if(billRemark){
                $tfoot.find(".remarkbox p").hide();
                $tfoot.find(".remarkComboBox").empty();
                $tfoot.find(".remarkCardBox").empty();
                if(billRemark.buypackage){//存在购买套餐
                    if(billRemark.buypackage.data && billRemark.buypackage.data.length){
                        for(var i=0;i<billRemark.buypackage.data.length;i++){
                            var itemj = billRemark.buypackage.data[i];
                            if(itemj.number){
                                var $span0 = $('<span class="am-clickable">'+itemj.name+"*"+itemj.number+'</span>');
                            }else{
                                var $span0 = $('<span class="am-clickable">'+itemj.name + '</span>');
                            }
                            
                            $tfoot.find(".remarkComboBox").append($span0);
                        }
                    }
                    
                    $tfoot.find(".remarkComboBox").data("item",billRemark.buypackage);
                    if(billRemark.buypackage.isbuy){
                        $tfoot.find(".remarkComboBox").addClass("selected");
                    }
                    $tfoot.find(".remarkComboBox").show();
                }else{
                    $tfoot.find(".remarkComboBox").hide();
                }
                if(billRemark.opencard){
                    var $span1 = $('<span class="am-clickable">开卡￥' + billRemark.opencard.money + '</span>');
                    $span1.data("item",billRemark.opencard);
                    $span1.data("sname","opencard");
                    if(billRemark.opencard.isbuy){
                        $span1.addClass("selected");
                    }
                    $tfoot.find(".remarkCardBox").append($span1);
                }
                if(billRemark.recharge){
                    var $span2 = $('<span class="am-clickable">充值￥' + billRemark.recharge.money + '</span>');
                    $span2.data("item",billRemark.recharge);
                    $span2.data("sname","recharge");
                    if(billRemark.recharge.isbuy){
                        $span2.addClass("selected");
                    }
                    $tfoot.find(".remarkCardBox").append($span2);
                }
            }
        },
        
        filterRepeat:function(data){
            //讲server进行去重，避免一单里面多个相同的服务者导致下标计算错误
            var currentServer = [];
            for (var index = 0; index < data.length; index++) {
                var dataItem = data[index];
                var repeatIf = false;
                for (var i = 0; i < currentServer.length; i++) {
                    var currentServerItem = currentServer[i];
                    if(currentServerItem.name == dataItem.name){
                        repeatIf = true;
                        break;
                    }
                }
                if(!repeatIf){
                    currentServer.push(dataItem)
                } 
            }
            return currentServer;
            
        },

        computedMember: function(data){
            var self = this;
            var _isArr = function(item){
                if(item){
                    if(item.length>0){
                        return true;
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            }
           var serverMember = [];
           console.log(self.tempData)
            $.each(self.tempData, function(i, item) {
                var server = [];//服务者
                var serverItem1 = {displayId:item.displayId};
                var serverItem2 = {displayId:item.displayId};
                var serverItem3 = {displayId:item.displayId};

                if(item.emp1Name){
                    serverItem1.name =item.emp1Name;
                    serverItem1.id = item.emp1;
                    server.push(serverItem1);
                }
                if(item.emp2Name){
                    serverItem2.name =item.emp2Name;
                    serverItem2.id = item.emp2;
                    server.push(serverItem2);
                } 
                if(item.emp3Name){
                    serverItem3.name =item.emp3Name;
                    serverItem3.id = item.emp3;
                    server.push(serverItem3);
                }
                 console.log(item)
                if(!item.emp1Name && !item.emp2Name && !item.emp3Name){
                    var dataStr = item.data;
                    var dataJson =  JSON.parse(dataStr)
                    if(item.data&& _isArr(dataJson.serviceItems)){
                            var _serviceItems = dataJson.serviceItems; 
                            for (var index = 0; index < _serviceItems.length; index++) {
                                if(_isArr(_serviceItems[index].servers)){
                                    var _servers = _serviceItems[index].servers;
                                    for (var serverIndex = 0; serverIndex < _servers.length; serverIndex++) {
                                        var _serversItem = _servers[serverIndex];
                                        if(!_serversItem){
                                            continue;
                                        }
                                        if(_serversItem.id!=item.emp1&&_serversItem.id!=item.emp2&&_serversItem.id!=item.emp3){
                                            _serversItem.displayId = item.displayId
                                                server.push(_serversItem);
                                        }
                                    }
                                }
                               } 
                            }
                    }

                
                var lastArr =  self.filterRepeat(server);
                serverMember= serverMember.concat(lastArr)
            })
            
            // console.log(serverMember)
            var markServer = this.filterServer(serverMember);
            // console.log(markServer)
            
            $('.hangup-foot-list').html('');
            // $('.hangup-foot-list').off("vclick", "li", btnClick2);
            for (var serversIndex = 0; serversIndex < markServer.length; serversIndex++) {
                var $li = $('<li class="am-clickable"  name='+ markServer[serversIndex].name  +' no='+markServer[serversIndex].no+' displayId="'+ markServer[serversIndex].displayId +'"></li>');
                var $img = am.photoManager.createImage("artisan", {
                    parentShopId: am.metadata.userInfo.parentShopId
                }, markServer[serversIndex].id + ".jpg", "s");
                var _mark = '<div class="hangup-foot-target">'+markServer[serversIndex].mark +'</div>'
                $li.append(_mark)
                $li.append(am.photoManager.createImage("artisan", {
                    parentShopId: am.metadata.userInfo.parentShopId
                }, markServer[serversIndex].id + ".jpg", "s"))
    
                var _html = '';
                _htm = '<div class="hangup-foot-content">'+
                '<section class="hangup-foot-title">'+markServer[serversIndex].no+'</section>'+
                '<div class="hangup-foot-name">'+ markServer[serversIndex].name +'</div>'+
                '</div>'
                $li.append(_htm)
                $('.hangup-foot-list').append( $li)
                
            }

            

            this.$hangupFootShow = $('.hangup-foot-show');
            this.$hangupFootList = $('.hangup-foot-list');
            // var html = '';
            // for(var i=0;i<20;i++){
            //     html += '<li></li>'
            // }
            // this.$hangupFootList.html(html);
            var width = 0;
            var windowWidth= 0;
            var openbillIf = amGloble.metadata.shopPropertyField.mgjBillingType
            width =(this.$hangupFootList.find('li').length) * 60+ 10;
            if(openbillIf){
                windowWidth = window.innerWidth - 83;
            }else{
                windowWidth =window.innerWidth-8;
            }
            
            if(width<=windowWidth){
                width = windowWidth;
                this.$hangupFootShow.css('right','0');
                $('.hangup-right-arrow').hide();
            }else{
                this.$hangupFootShow.css('right','75px');
                $('.hangup-right-arrow').show();
            }
            this.$hangupFootList.css('width',width);
            this.hangupFootScroll = new $.am.ScrollView({
                $wrap: this.$hangupFootShow,
                $inner: this.$hangupFootList,
                direction: [true, false],
                hasInput: false
            });
            $('.hangup-right-arrow').on('vclick',function(){
                self.hangupFootScroll.scrollTo('bottom');
                $('.hangup-right-arrow').hide();
            })
            
            this.$hangupFootShow.on('vtouchend',function(){
                setTimeout(function(){
                    if(self.hangupFootScroll._currentPos[0]<=self.hangupFootScroll._min[0]){
                        $('.hangup-right-arrow').hide();
                    }else{
                        $('.hangup-right-arrow').show();
                    }
                },500)
                
            })
        },

        //将获取的订单集合过滤  并计算右上角下标
        filterServer: function(data) {
            var markServer = []; 
            $.each(data, function(i, item) {
                if(!item){
                    return 
                }
                var markIf = false;
                if(markServer.length>0){
                    for (var index = 0; index < markServer.length; index++) {
                         if(markServer[index].id==item.id){
                            markServer[index].mark++;
                            markServer[index].displayId =markServer[index].displayId+ ' '+ item.displayId 
                            markIf = true;
                            return;
                         } 
                    }
                    if(!markIf){
                        data[i].mark = 1;
                        markServer.push(data[i])
                    }
                }else if(markServer.length == 0){
                    data[i].mark = 1;
                    markServer.push(data[i])
                }
            })
            for (var markServerItem = 0; markServerItem < markServer.length; markServerItem++) {
                if(amGloble.metadata.empMap[markServer[markServerItem].id]){
                    markServer[markServerItem].no = amGloble.metadata.empMap[markServer[markServerItem].id].no;
                }
                
            }

            var desc = function(x,y)  
            {  
                return (parseInt(x.no,10) > parseInt(y.no,10)) ? 1 : -1  
            }  
            markServer.sort(desc)

            
            return markServer
        },

        render: function(data) {
            var self = this;
            this.$container.empty();
            this.$.removeClass('empty');
            if (data.length > 0) {
                this.$container.append('<div class="hangup_mask am-clickable"></div>');
                self.tempData = data.sort(function(a,b){
                    return b.createDateTime - a.createDateTime;
                });
                var user = am.metadata.userInfo;
                var deleteOpt = user.operatestr.indexOf(',MGJZ6,') == -1;
                var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
                var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
                
                // 生成底部员工列表
                this.computedMember(data)
                $.each(self.tempData, function(i, item) {
                    var detail = JSON.parse(item.data);
                    var sumfee = 0;
                    //detail.sumfee&&(sumfee = detail.sumfee);
                    //if(detail.sumfee){
                        //sumfee = detail.sumfee;
                    //} else {
                   /* var $info_list = $('<div class="info_list"></div>');
                    var $serviceItem = $('<div class="serviceItems"><div class="serviceItemsInner am-clickable"></div></div>');*/
                    var $billDate = $('<div class="date"><div class="c-left"></div><div class="c-right time_service"></div><div class="clear"></div></div>');//日期
                    var $billServers = $('<div class="servers"></div>');//服务者
                    var $billTb = $('<table cellpadding="0" cellspacing="0" class="billTb"></table>');//中间表格 包含项目列表 合计 洗发计时 备注
                    var $thead = $('<thead><tr><th>项目</th><th>价格</th></tr></thead>');//表头
                    $billTb.append($thead);
                    var $defaultTbody = $('<tbody class="defaultData"></tbody>');//默认显示两行数据
                    $billTb.append($defaultTbody);
                    var $restTbody = $('<tbody class="restData"></tbody>');//剩余数据
                    $billTb.append($restTbody);
                    var $tfoot = $('<tfoot class="gatherData"></tfoot>');//表格底部
                    $tfoot.append('<tr class="line sumFee"><td colspan="2" class="money"><div class="am-clickable tips"></div><div class="content"><span class="text">合计:</span><span class="num">￥' + sumfee.toFixed(1) + '</span></div></td></tr>')
                    .append(washTimeFlag?'<tr class="line wash"><td colspan="2"><span class="info">'+(washTimeFlag ? (item.shampooStartTime ? item.shampooFinishTime ? '<span class="finished">已结束洗发</span>' : '<span class="wash-opt finish am-clickable">结束洗发</span>' : '<span class="wash-opt start am-clickable">开始洗发</span>') : '') + '</td></tr>':'')
                        .append('<tr class="line remark am-clickable">'+
                            '<td class="'+(item.instorecomment?"has":"")+'" colspan="2" >'+
                                '<div class="remarkbox">'+
                                    '<div class="remarkComboBox"></div>'+
                                    '<div class="remarkCardBox"></div>'+
                                '</div>'+
                                '<div class="remarkWrap am-clickable">' +(item.instorecomment ? item.instorecomment : '') + '</div>'+
                            '</td>'+
                        '</tr>');
                    
                    self.rendBillRemark(item,$tfoot);
                   
                    $billTb.append($tfoot);
                    var $billTips = $tfoot.find('.tips');
                    var $sumFeeTr = $tfoot.find(".sumFee");

                    var now = new Date(item.createDateTime).format("mm/dd HH:MM");
                    $billDate.find(".c-left").text(now);
                    $billDate.find(".c-right").text();

                    var serviceItems = detail.serviceItems || [],productItems = [];//项目数据数组
                    if(detail.products && detail.products.depots && detail.products.depots.length){
	                    productItems = detail.products.depots;
                    }

                   var serverName = [];//服务者
                  if(item.emp1Name){
                    	if(item.isSpecified1==1){
                    		serverName.push('<span class="appoint">'+item.emp1Name+'</span>');
                    	}else{
                    		serverName.push('<span class="noappoint">'+item.emp1Name+'</span>');
                    	}                       
                    }
                     if(item.emp2Name){
                    	if(item.isSpecified2==1){
                    		serverName.push('<span class="appoint">'+item.emp2Name+'</span>');
                    	}else{
                    		 serverName.push('<span class="noappoint">'+item.emp2Name+'</span>');
                    	}
                       
                    }
                      if(item.emp3Name){
                    	if(item.isSpecified3==1){
                    		serverName.push('<span class="appoint">'+item.emp3Name+'</span>');
                    	}else{
                    		serverName.push('<span class="noappoint">'+item.emp3Name+'</span>');
                    	}

                    }
                 
                    //if (serviceItems) {
                    if(serviceItems.length+productItems.length>2){//先截取两条数据 放在$defaultTbody 然后剩余的放在$restTbody
                        $billTb.addClass("down");
                        $billTips.text("展开");
                        /*var defaultItems = serviceItems.slice(0,2);
                        var restItems = serviceItems.slice(2);
                        $.each(defaultItems, function(i, itemin) {
                            (!detail.sumfee)&&(sumfee += itemin.price);
                            $defaultTbody.append('<tr class="line"><td class="iteminName"><div class="iteminNameWrap">'+itemin.name+'</div></td><td class="iteminPrice">￥'+itemin.price+'</td></tr>');
                            if(itemin.servers && itemin.servers.length ){
                                for (var j = 0; j < itemin.servers.length; j++) {
                                    if(itemin.servers[j] && itemin.servers[j].name && serverName.indexOf(itemin.servers[j].name) == -1){
                                        serverName.push(itemin.servers[j].name);
                                    }
                                }
                            }
                        });

                        $.each(restItems, function(i, itemin) {
                            (!detail.sumfee)&&(sumfee += itemin.price);
                            $restTbody.append('<tr class="line"><td class="iteminName"><div class="iteminNameWrap">'+itemin.name+'</div></td><td class="iteminPrice">￥'+itemin.price+'</td></tr>');
                            if(itemin.servers && itemin.servers.length ){
                                for (var j = 0; j < itemin.servers.length; j++) {
                                    if(itemin.servers[j] && itemin.servers[j].name && serverName.indexOf(itemin.servers[j].name) == -1){
                                        serverName.push(itemin.servers[j].name);
                                    }
                                }
                            }
                        });*/
                    }else{
                        $billTb.removeClass("down").removeClass("up");
                        /*$.each(serviceItems, function(i, itemin) {
                            (!detail.sumfee)&&(sumfee += itemin.price);
                            $defaultTbody.append('<tr class="line"><td class="iteminName"><div class="iteminNameWrap">'+itemin.name+'</div></td><td class="iteminPrice">￥'+itemin.price+'</td></tr>');
                            if(itemin.servers && itemin.servers.length ){
                                for (var j = 0; j < itemin.servers.length; j++) {
                                    if(itemin.servers[j] && itemin.servers[j].name && serverName.indexOf(itemin.servers[j].name) == -1){
                                        serverName.push(itemin.servers[j].name);
                                    }
                                }
                            }
                        });*/
                    }
                    var arrItems = serviceItems.concat(productItems);
	                $.each(arrItems, function(i, itemin) {
	                    var $tr = $('<tr class="line"><td class="iteminName"><div class="iteminNameWrap"></div></td><td class="iteminPrice"></td></tr>');
	                    if(itemin.productid) {
		                    $tr.addClass('prod');
		                    $tr.find('.iteminNameWrap').text(itemin.productName+'x'+itemin.number);
		                    $tr.find('.iteminPrice').text('￥'+toFloat(itemin.salePrice*itemin.number));
		                    sumfee+= itemin.salePrice*itemin.number;
	                    }else{
		                    sumfee += itemin.price || 0;
		                    $tr.find('.iteminNameWrap').text(itemin.name);
		                    $tr.find('.iteminPrice').text('￥'+itemin.price);
                            if(!serverName.length){
                                if(itemin.servers && itemin.servers.length){
                                    for (var j = 0; j < itemin.servers.length; j++) {
                                        if(itemin.servers[j] && itemin.servers[j].name && serverName.indexOf(itemin.servers[j].name) == -1){
                                           if(itemin.servers[j].specified==1){
                	    							serverName.push('<span class="appoint">'+itemin.servers[j].name+'</span>')               	
                	    	  }else{
                	    	                        serverName.push('<span class="noappoint">'+itemin.servers[j].name+'</span>')              	    	}
                                        }
                                    }
                                }
                            }
                        }
	                   
                        if(i<3){
	                        $defaultTbody.append($tr);
                        }else{
                            $restTbody.append($tr);
	                        
                        }
	                });
                    if(!arrItems || (arrItems && arrItems.length<3)){
                        for(var j=0;j<3-arrItems.length;j++){
                            var $tr = "";
                            $tr = $('<tr class="line"><td class="iteminName"><div class="iteminNameWrap"></div></td><td class="iteminPrice"></td></tr>');
                            
                            $defaultTbody.append($tr);
                        }
                        
                    }

	                $sumFeeTr.find("span.num").text(toFloat(sumfee));
                    //(!detail.sumfee)&&($sumFeeTr.find("span.num").text(sumfee.toFixed(1)));
                    //}
                    $billServers.append('<div class="line serversContent">'+ (serverName.join(" ")||"无") +'</div>');

                    var $block = $('<div class="hangup_block" data-index="' + i + '" data-id="' + item.id + '"><div class="self_mask am-clickable"><div class="tips_wrap"><span>第一个选中的单将作为主单后续选中的单据将被合并至此单</span></div></div><div class="hangup_inner"></div></div>');
                    
                    $block.find('.hangup_inner').append('<div class="title"><span class="flag" style="' + self.getFlagColor(item.flag) +'"></span><div class="content"><span class="no">' + item.displayId + "-"+'</span><span class="name '+(item.memId>0?'am-clickable':'') +'">' + (item.memName ? item.memName : '散客') +  '</span></div></div>');
                    item.data=detail;
                    $block.data('data',item);
                    $block.find('.hangup_inner')
                    .append($billDate)
                    .append($billServers)
                    .append($billTb)
                    .append('<div class="operation">' + (deleteOpt ? '<span class="icon icon_delete am-clickable"></span>' : '<span></span>') + '<span class="hangup_cash_btn am-clickable">取单</span></div>');
                    self.$container.append($block);
                });
                if(washTimeFlag){
                        this.$.find('.hangup_block').addClass('washTime');
                        this.$.find('.hangup_inner').addClass('washTime');
                    }
                self.timeMachine(amGloble.metadata.configs.jbTime);
            } else {
                $('.hangup-foot-list').html('');
                $('.hangup-right-arrow').hide();
                self.tempData = null;
                self.$container.html('<p>还没有进行中的服务哦~</p>');
                if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
                    this.$.addClass('empty');
                }
            }
        },
        delete: function(data) {
            var self = this;
            var reason = JSON.parse(am.metadata.configs.cancleBilling);
            am.selectCancleReason.show({
                title: '请选择删单理由',
                warn: '警告:请选择或输入明确的删单理由，以便财务和管理层审核',
                reason: reason,
                callback: function(str){
                    am.api.hangupDelete.exec({
                        "ids": [data.id],
                        "shopId": data.shopId,
                        "parentShopId": data.parentShopId,
                        "cancelReason":str,
                        "operatorId": am.metadata.userInfo.userId,
                        "operatorName": am.metadata.userInfo.userName
                    }, function(ret) {
                        am.loading.hide();
                        if (ret.code == 0) {
                            $('.hangup_mask').hide();
                            if(!self.delBillArr) self.delBillArr = [];
                            self.delBillArr.push(data);
                            self.$container.find('.hangup_block[data-id="' + data.id + '"]').remove();
                            am.msg("删除服务单成功！");
                            self.$container.height("auto");
                            self.hangupScroll.refresh();
                            self.startGetDate();
                        } else {
                            am.msg(ret.message || "删除服务单失败，请重试！");
                        }
                    });
                }
            });
        },
        washOpt: function($target, data,callback) {
            var opt = {
                "id": data.id,
                "shopId": data.shopId,
                "parentShopId": data.parentShopId
            };
			if(data.serviceNO) {
				opt.serviceNO = data.serviceNO;
			}
			var index = $target.closest('.hangup_block').attr('data-index');
            if ($target.hasClass('start')){
                opt.shampooStartTime = am.getTime();
                if($target.text()){
                    $target.text('结束洗发')
                    this.tempData[index].shampooStartTime = opt.shampooStartTime;
                }
            }  
            else if ($target.hasClass('finish')){
                opt.shampooFinishTime = am.getTime();
                if($target.text()){
                    $target.text('已结束洗发');
                    $target.removeClass('wash-opt').addClass('finished');
                    this.tempData[index].shampooFinishTime = opt.shampooFinishTime;
                }
            }
                
               
            else
                return;

            am.loading.show();
            opt.parentShopId = amGloble.metadata.userInfo.parentShopId;
            am.api.hangupSave.exec(opt, function(ret) {
                am.loading.hide();
                if (ret && ret.code == 0) {
                    am.msg("操作成功");
                    if ($target.hasClass('start')) {
                        $target.removeClass('start').addClass('finish');
                        var $tw = $target.prev().find('.time_wash');
                        $tw.text(self.calcTime(1, opt.shampooStartTime));
                        var twMachineNo = setInterval(function() {
                            $tw.text(self.calcTime(1, opt.shampooStartTime));
                        }, 1000);
                        if (twMachineNo) {
                            $tw.attr('data-machineno', twMachineNo);
                            self.machineBox.push(twMachineNo);
                        }
                    } else if ($target.hasClass('finish')) {
                        $target.removeClass('finish').addClass('disabled');
                        var $tw = $target.prev().find('.time_wash');
                        var machineNo = $tw.attr('data-machineno');
                        if (machineNo)
                            clearInterval(machineNo);
                    }
                    callback && callback(ret.content);
                } else {
                    am.msg("操作失败，请重试~");
                }
            });
        },
       timeMachine: function(sdTime) {
        	
            // 清除定时器
            if (this.machineBox && this.machineBox.length > 0) {
                for (var i = 0; i < this.machineBox.length; i++) {
                    clearInterval(this.machineBox[i]);
                }
            }
            var self = this;           
            if (self.tempData) {
                self.machineBox = [];              
                $.each(self.tempData, function(i, item) {
                    // 服务时长
                    var sdtime=sdTime ? sdTime*3600*1000:3*3600*1000;
                    var $parent =self.$.find('.hangup_block[data-index="' + i + '"]');
                    var $title =self.$.find('.hangup_block[data-index="' + i + '"] .title');
                    var $ts = self.$.find('.hangup_block[data-index="' + i + '"] .time_service');
                    var nowtime=am.now();
                    if(nowtime-item.createDateTime<sdtime){
                    	$ts.text(self.calcTime(0, item.createDateTime));
                    	$ts.removeClass('c-right-warring');
                    	$ts.removeClass('c-right-warring');
                    }
                    if(nowtime-item.createDateTime>sdtime){
                    	$ts.text(self.calcTime(0, item.createDateTime));
                    	$ts.addClass('c-right-warring');
                    	$parent.addClass('warningTime');
//                  	$parent.find('.content').append('<span class="redWarring"></span>');
                  };
                    var tsMachineNo = setInterval(function() {                    	
			            var nowtime=am.now();
			            var jgtime=nowtime-item.createDateTime;			           
			            if(jgtime>sdtime){
			            	 $ts.text(self.calcTime(0, item.createDateTime));			            				    
			                 $parent.addClass('warningTime');
			                 $ts.addClass('c-right-warring');
			            }else{
			            	 $ts.removeClass('c-right-warring');
			            	 $ts.removeClass('c-right-warring');
			            	 $ts.text(self.calcTime(0, item.createDateTime)); 
			            }                  
                    }, 1000);   
                   
                    if (tsMachineNo) {
                        $ts.attr('data-machineno', tsMachineNo);
                        self.machineBox.push(tsMachineNo);
                    }
                    // 洗头时长
                    if (item.shampooStartTime) {
                        var $tw = self.$.find('.hangup_block[data-index="' + i + '"] .time_wash');
//                      $tw.text(self.calcTime(0, item.shampooStartTime, item.shampooFinishTime));
//                      if (!item.shampooFinishTime) {
//                          var twMachineNo = setInterval(function() {
//                              $tw.text(self.calcTime(0, item.shampooStartTime));
//                          }, 1000);
//                          if (twMachineNo) {
//                              $tw.attr('data-machineno', twMachineNo);
//                              self.machineBox.push(twMachineNo);
//                          }
//                      }
                    }
                });
            }
        },
        calcTime: function(type, startTime, finishTime) {
            var tless = (finishTime ? finishTime : am.now()) - startTime;
            //计算出相差天数
            var days = Math.floor(tless / (24 * 3600 * 1000));
            //计算出小时数
            var leave1 = tless % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / (3600 * 1000));
            //计算相差分钟数
            var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / (60 * 1000));
            //计算相差秒数
            var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
            var seconds = Math.round(leave3 / 1000);
            var ts = '' + (days > 0 ? '超过一天' : (type == 0 ? ((hours < 10 ? ('0' + hours) : hours)) + ':' : '' ) + (minutes < 10 ? ('0' + minutes) : minutes) + ':' + (seconds < 10 ? ('0' + seconds) : seconds));

            return ts;
        },
        getFlagColor: function(key) {
            switch (key) {
                case "blue":
                    return "background-color: #7499e1; border: #28518e 1px solid;";
                case "purple":
                    return "background-color: #937bd1; border: #4b308d 1px solid;";
                case "red":
                    return "background-color: #d98889; border: #a71d23 1px solid;";
                case "green":
                    return "background-color: #7cce6e; border: #397d2a 1px solid;";
                case "yellow":
                    return "background-color: #f8f264; border: #a0981d 1px solid;";
                case "orange":
                    return "background-color: #f19d5a; border: #b14f0c 1px solid;";
                default:
                    return "";
            }
        },

    });
})();
