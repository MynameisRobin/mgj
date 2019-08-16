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
            this.$downloadtip = this.$.find('.downloadtip');
            this.$hangup_orderOverdueBig = this.$.find('#hangup_orderOverdueBig');
            this.$container = $('#content_wrap');

            $('.member-seleced-mark').hide();

            $('.cansel-mark').on('vclick', function(){
                $('.member-seleced-mark').hide();
                $('.hangup-foot-list li').removeClass('selected');
                if($(this).parents('.member-seleced-mark').hasClass('seat')){
                    self.filterSpace();
                }else {
                    self.filter();
                }
            })
            
            this.hangupScroll = new $.am.ScrollView({
                $wrap: this.$.find('.hangup_wrap'),
                $inner: this.$container,
                direction: [false, true],
                hasInput: false,
                onScroll: function(pos){
                    // console.log('pos', pos[1]);
                    if(pos[1] < 0) {
                        self.$hangup_orderOverdueBig.css({'z-index' : '0'})
                    }else {
                        self.$hangup_orderOverdueBig.css({'z-index' : '1'})
                    }
                }
            });

            this.initMember(self);

            this.$warn.show();
         
            this.$operateWrap = $('#page_hangup .operate_wrap');
            this.$keywordPc = this.$operateWrap.find('.input_no');
            this.$keywordMb = this.$operateWrap.find('.no_box');
            this.$withoutBillPayTip = this.$.find('#withoutBillPayTip').on('vclick', '.cancel,.close', function () {
                self.$withoutBillPayTip.hide();
            }).on('vclick', '.OK', function () {
                $.am.changePage(am.page.prepay, "slideup");
                self.$withoutBillPayTip.hide();
            }).on('vclick', '.noTip', function () {
                $(this).toggleClass('checked');
                localStorage.setItem("withoutBillPayTip"+amGloble.metadata.userInfo.userId, "true");
                $.am.changePage(am.page.prepay, "slideup");
                self.$withoutBillPayTip.hide();
            });
            this.$.on('vclick', '.merge_btn', function() {
                var items = []; // 弹窗
                var ret = {}; // merge函数 的参数
                var index = $('.hanup_wrapper .hangup_container:visible').index();
                var fn = function(){
                    am.popupMenu("合并至", items, function (item) {
                        console.log('合并至', item);
                        ret.firstSelected = item.data;
                        ret.selected = [];
                        for (var i = 0, len = items.length; i < len; i++) {
                            if (item.data.id != items[i].data.id) {
                                ret.selected.push(items[i].data);
                            }
                        }
                        console.log(ret);
                        self.merge(ret);
                    });
                }
                if(index==0){
                    var $bills = self.$container.find('.hangup_inner .flag.selected');
                    if ($bills && $bills.length > 1) {
                        $.each($bills, function (i, v) {
                            var itemData = $(v).parents('.hangup_block').data('data');
                            var item = {
                                name: itemData.displayId + '-' + (itemData.memName||'散客'),
                                data: itemData
                            };
                            items.push(item);
                        });
                        fn();
                    } else {
                        am.msg("请先选中至少两个单据！");
                    }
                }else {
                    var bills = self.$spaceWrapper.find('.selected');
                    if(bills.length>1){
                        $.each(bills, function (i, v) {
                            var itemData = $(v).parent().data('data');
                            itemData.data = JSON.parse(itemData.data);
                            var seat = am.cashierTab.getSeatInfo(itemData.tableId);
                            var item = {
                                name: seat.name+'-'+ seat.tableName + '-' + itemData.displayId +  '-' + (itemData.memName||'散客') ,
                                data: itemData
                            };
                            items.push(item);
                        });
                        fn();
                    }else {
                        am.msg("请先选中至少两个单据！");
                    }
                }
                // self.$root.addClass('active');
                // self.$warn.hide();
                // self.$hangup_orderOverdueBig.hide();
                // self.$.find('.hangup_inner table.up .tips').trigger('vclick');
            }).on('vclick','.hangup_block .flag',function(){
                if($(this).hasClass('selected')){
                    $(this).removeClass('selected');
                }else {
                    $(this).addClass('selected');
                }
                $(this).parents('.hangup_container').find('.selectBillTip').hide();
                self.showSelectBillTipStep2();
            }).on('vclick', '.sure_btn', function() {
                self.merge();
            }).on('vclick', '.cancel_btn', function() {
                self.resetMergeClass();
            }).on('vclick', '.self_mask', function() {
                var hangup_inner = $(this).siblings('.hangup_inner');
                if(hangup_inner.hasClass('settle')) {
                    //结算单据
                    am.msg("不能选取结算单据！");
                    return;
                }


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
                    self.searchTheRes(true);
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
                self.autoGetData($(this).parents('.hangup_block'),function(data){
                    if(data.status > 0) {
                        return;
                    }
                    self.delete(data);
                });
            }).on('vclick', '.hangup_cash_btn', function() {

                self.autoGetData($(this).parents('.hangup_block'),function(data){
                    if(data.status > 0) {
                        return;
                    }
                    // 性能监控点
                    monitor.startTimer('M04')

                    var timer = data.shampooFinishTime - data.shampooStartTime;
                    if(timer && timer > 0){
                        var flag = "";
                        var timeStr = new Date(timer).format("MM:ss").replace(":", "分") + "秒";//转换分秒
                        if((timer/60000) > 60){//如果超过1个小时
                            timeStr = Math.floor(timer/60000/60) + "小时" + timeStr;
                        }
                        am.metadata.configs.washPassTime = am.metadata.configs.washPassTime ? am.metadata.configs.washPassTime : 30;
                        //是否合格
                        if((am.metadata.configs.washPassTime - 0) * 60000 < (data.shampooFinishTime - data.shampooStartTime)){
                            flag = "pass";
                        }else{
                            flag = "nopass";
                        }
                        data.jsonstr = JSON.stringify({
                            washPassTime: timeStr,
                            flag: flag
                        });
                    }

                    self.getBill(data,true);
                });
            }).on('vclick', '.hangup_settle_btn', function() {

                if(navigator.connection && navigator.connection.type == 'none') {
                    //断网提示
					var gotoHangup = function () {
						$.am.changePage(am.page.hangup,"",{openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
					};
                    am.confirm('网络断开','由于网络断开，无法进行后续操作！','知道了','返回', gotoHangup, gotoHangup);
                    return;
                }

                //结单

                // var idx = $(this).closest('.hangup_block').attr('data-index'),
                //     items = self.tempData[idx],
                //     data = {
                //         bill : items,
                //         openbill : amGloble.metadata.shopPropertyField.mgjBillingType  //开单模式为 1
                //     }
                // $.am.changePage(am.page.pay, "slideup", data);
                 
                //自助结算遮罩
                $('#autoWrap').show();
                // 性能监控点
                monitor.startTimer('M04')

                var idx = $(this).closest('.hangup_block').attr('data-index');
                if(self.$seatMoreBill.is(':visible')){
                    var items = self.seatTempData[idx];
                }else {
                    var items = self.tempData[idx];
                }
                self.getBill(items,true);

            }).on('vclick', '.wash-opt', function() {
                var idx = $(this).closest('.hangup_block').attr('data-index');
                if(self.$seatMoreBill.is(':visible')){
                    var items = self.seatTempData[idx];
                }else {
                    var items = self.tempData[idx];
                }
                var _this = $(this);
                self.washOpt(_this, items);
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
            }).on('vclick','span.good',function(){
                //优质客
                am.goodModal.show();
            }).on("vclick",".openbill",function(){
                // 性能监控点
                monitor.startTimer('M01')
                window.isIdInvoked = 0;
                am.billOriginData = null;
                $.am.changePage(am.page.searchMember, "slideup", {
                    openbill: 1,
                    onSelect: function (item) {
                        $.am.changePage(am.page.openbill, "slidedown", {
                            member: item
                        });
                    }
                });
                // $.am.changePage(am.page.openbill, "",{source:"hangup"});
                //$.am.changePage(am.page.openbill, "slideup",{source:"openbill"});
            }).on('vclick','.toSetWorkStation',function(){
                if(am.metadata.shopPropertyField && am.metadata.shopPropertyField.openSmallProgram){
                    $.am.changePage(am.page.workStationTip, "slideup");
                    localStorage.setItem('openBillMode_'+amGloble.metadata.userInfo.userId,'seat');
                }else {
                    am.noSmallProgram.show();
                }
            }).on("vclick",".cards_btn",function(){
                $.am.changePage(am.page.queue, "slideup");
            }).on("vclick",".pay_btns",function(){
                var index = $('.hanup_wrapper .hangup_container:visible').index();
                if(index==0){
                    var bills = self.$container.find('.hangup_inner .flag.selected');
                }else {
                    var bills = self.$spaceWrapper.find('.selected');
                }
                if (bills.length) {
                    var opt = [];
                    for (var i = 0; i < bills.length; i++) {
                        if(index==0){
                            var data = self.tempData[$(bills[i]).parents('.hangup_block').data('index')];
                        }else {
                            var data = $(bills[i]).parent().data('data');
                            data.data = JSON.parse(data.data);
                        }
                        if (data) {
                            opt.push({
                                displayId: data.displayId,
                                memName: data.memName,
                                memId: data.memId,
                                sumfee: self.getRealSumFee(data.data.serviceItems),
                                prodSumfee: data.data.prodSumfee
                            })
                        }
                    }
                    $.am.changePage(am.page.prepay, "slideup", {
                        bill: opt
                    });
                } else {
                    // 未选择单子
                    var withoutBillPayTip = localStorage.getItem("withoutBillPayTip"+amGloble.metadata.userInfo.userId);
                    if (withoutBillPayTip) {
                        $.am.changePage(am.page.prepay, "slideup");
                    } else {
                        if(self.$container.find('.hangup_block').length){
                            // 有挂单
                            self.$withoutBillPayTip.show();
                        }else{
                            // 无挂单 直接付
                            $.am.changePage(am.page.prepay, "slideup");
                        }
                    }
                }
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
                var _this = this;
                self.autoGetData($(this).parents('.hangup_block'),function(data){
                    if(data.status > 0) {
                        return;
                    }
                    var $this=$(_this).find(".remarkWrap");
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
                var idx = $(this).closest('.hangup_block').attr('data-index');
                if(self.$seatMoreBill.is(':visible')){
                    var items = self.seatTempData[idx];
                }else {
                    var items = self.tempData[idx];
                }
                console.log(items)
                var paras = {
                    customerId:items.memId,
                    tabId:1
                }
                if(self._billType){
                    paras.openbill = self._billType;
                }
                $.am.changePage(am.page.memberDetails, "slideup",paras);
            }).on("vclick", '#hangup_orderOverdueBig',function(){
                localStorage.page_orderOverdueTab = '1';
                $.am.changePage(am.page.orderOverdue, "slideup");
            }).on('vclick','.toggleMode',function(){
                var index = 0;
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    localStorage.setItem('openBillMode_'+amGloble.metadata.userInfo.userId,'bill');
                    self.$.find('.hanup_wrapper .hangup_container').eq(index).show().siblings().hide();
                    self.renderBillMode(self.tempData);
                }else {
                    $(this).addClass('active');
                    index = 1;
                    localStorage.setItem('openBillMode_'+amGloble.metadata.userInfo.userId,'seat');
                    self.$.find('.hanup_wrapper .hangup_container').eq(index).show().siblings().hide();
                    self.renderSeatMode(self.tempData);
                }
            });

            this.$toggleMode = this.$.find('.toggleMode');
            this.$spaceWrapper = this.$.find('#hangup_container_workStation .content_wrap');
            this.$billedItem = this.$spaceWrapper.find('.seat .billed').remove();
            this.$waitedItem = this.$spaceWrapper.find('.seat .waited').remove();
            this.$seatItem = this.$spaceWrapper.find('.seat').remove();
            this.$space = this.$spaceWrapper.find('.space').remove();
            this.$space.on('vclick','.intro',function(){
                var height = $(this).parents('.space').find('.list').data('height');
                if($(this).hasClass('up')){
                    $(this).removeClass('up');
                    $(this).parents('.space').find('.list,.summary').removeClass('close');
                    $(this).parents('.space').find('.list').css('height',height+'px');
                }else {
                    $(this).addClass('up');
                    $(this).parents('.space').find('.list,.summary').addClass('close');
                    $(this).parents('.space').find('.list').css('height',0);
                }
                $(this).parents('.space').find('.selectBillTip').hide();
                self.spaceScroll.refresh();
            }).on('vclick','.empty',function(){
                var seat = $(this).parents('.seat').data('data');
                var space = $(this).parents('.space').find('.spaceName').text();
                var select = self.$spaceWrapper.find('.selected');
                if(select.length==1){
                    var data = $(select[0]).parent().data('data');
                    var originSeat = $(select[0]).parents('.seat').data('data');
                    var originSpace = $(select[0]).parents('.space').find('.spaceName').text();
                    atMobile.nativeUIWidget.confirm({
						caption: '换座位',
						description: '要将 '+originSpace+'-'+originSeat.tablename+' '+(data.memId==-1?'散客':data.memName)+' 换到 '+space+'-'+seat.tablename+' 吗？',
						okCaption: '确定',
						cancelCaption: '取消'
					}, function(){
						self.changeSeat(data,seat.id);
					}, function(){
						
					});
                    return;
                }
                // 性能监控点
                monitor.startTimer('M01')
                window.isIdInvoked = 0;
                am.billOriginData = null;
                $.am.changePage(am.page.searchMember, "slideup", {
                    openbill: 1,
                    onSelect: function (item) {
                        $.am.changePage(am.page.openbill, "slidedown", {
                            member: item,
                            tableId: seat.id
                        });
                    }
                });
            }).on('vclick','.waited',function(){
                var data = $(this).data('data');
                $.am.changePage(am.page.openbill, 'slideup',{rowdata:data,source:'service'});
            }).on('vclick','.billed',function(){
                var bills = $(this).parent().find('.billed');
                if(bills.length==1){
                    self.autoGetData($(this),function(data){
                        if(data.status==1){
                            return am.msg('顾客正在使用小程序支付中...');
                        }else if(data.status==2){
                            if(navigator.connection && navigator.connection.type == 'none') {
                                //断网提示
                                var gotoHangup = function () {
                                    $.am.changePage(am.page.hangup,"",{openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
                                };
                                am.confirm('网络断开','由于网络断开，无法进行后续操作！','知道了','返回', gotoHangup, gotoHangup);
                                return;
                            }
                            //自助结算遮罩
                            $('#autoWrap').show();
                            // 性能监控点
                            monitor.startTimer('M04')
                            data.data = JSON.parse(data.data);
                            self.getBill(data,true);
                        }else {
                            // 性能监控点
                            monitor.startTimer('M04')     
                            self.getBill(data,true);
                        }
                    });
                }else {
                    self.$seatMoreBill.show();
                    var data = [];
                    var selectedArr = [];
                    for(var i=0;i<bills.length;i++){
                        if($(bills[i]).find('.select').hasClass('selected')){
                            selectedArr.push(1);
                        }else {
                            selectedArr.push(0);
                        }
                        data.push($(bills[i]).data('data'));
                    }
                    self.renderSeatMoreBill(data,selectedArr);
                    self.$seatMoreBillOrigin = $(this).parent();
                }
            }).on('vclick','.select',function(e){
                e.stopPropagation();
                if($(this).hasClass('selected')){
                    $(this).removeClass('selected');
                }else {
                    $(this).addClass('selected');
                }
                $(this).parents('.space').find('.selectBillTip').hide();
                self.showSelectBillTipStep2();
            }).on('vhold','.seat',function(){
                var data = $(this).data('data');
                var spaceName = $(this).parents('.space').find('.spaceName').text();
                am.seatDownload.show({
                    areaid: data.areaid,
                    spaceName: spaceName,
                    id: data.id,
                    seatName: data.tablename
                });
            }).on('vclick','.header,.name',function(e){
                var items = $(this).parents('.bill').data('data');
                if(items.memId==-1){
                    return;
                }
                e.stopPropagation();
                var paras = {
                    customerId:items.memId,
                    tabId:1
                }
                if(self._billType){
                    paras.openbill = self._billType;
                }
                $.am.changePage(am.page.memberDetails, "slideup",paras);
            });

            this.$seatMoreBill = this.$.find('.seatMoreBill').on('vclick','.seatMoreBillCancel',function(){
                self.$seatMoreBill.hide();
                self.$seatMoreBillOrigin = null;
            }).on('vclick','.seatMoreBillSure',function(){
                var selecedArr = [];
                var list = self.$seatMoreBill.find('.seatMoreBillContent .hangup_block .hangup_inner .flag');
                for(var i=0;i<list.length;i++){
                    if($(list[i]).hasClass('selected')){
                        selecedArr.push(1);
                    }else {
                        selecedArr.push(0);
                    }
                }
                if(self.$seatMoreBillOrigin){
                    var bills = self.$seatMoreBillOrigin.find('.billed');
                    for(var i=0;i<bills.length;i++){
                        if(selecedArr[i]){
                            $(bills[i]).find('.select').addClass('selected');
                        }else {
                            $(bills[i]).find('.select').removeClass('selected');
                        }
                    }
                }
                self.$seatMoreBill.hide();
                self.$seatMoreBillOrigin = null;
            });

            this.spaceScroll = new $.am.ScrollView({
                $wrap : this.$.find('#hangup_container_workStation'),
                $inner : this.$spaceWrapper,
                direction : [false, true],
                hasInput: false
            });

            this.$.on('vclick','.selectBillTip .closeSelectBillTip',function(){
                if($(this).parents().hasClass('selectBillTipStep1')){
                    $(this).parent().remove();
                    localStorage.setItem(amGloble.metadata.userInfo.userId+'_selectBillTipStep1',1);
                }else {
                    $(this).parent().hide()
                    localStorage.setItem(amGloble.metadata.userInfo.userId+'_selectBillTipStep1',1);
                    localStorage.setItem(amGloble.metadata.userInfo.userId+'_selectBillTipStep2',1);
                    self.$.find('.selectBillTipStep1').remove();
                }
            });
            this.$selectBillTipStep1 = this.$.find('.selectBillTipStep1').remove();
            
            this.$selectBillTipStep2 = this.$.find('.selectBillTipStep2').hide();

            $('#wifiTips').on('vclick', '.iconfont', function() {
                $('#wifiTips').hide();
            }).on('vclick', '.sure', function() {
                $('#wifiTips').hide();
            }).on('vclick', '.after', function() {
                //3天后提示
                $('#wifiTips').hide();
                localStorage.TP_wifiTips = new Date().getTime() + (3*24*60*60*1000);
            })
        },
        getRealSumFee: function(items){
            var sum = 0;
            for(var i=0;i<items.length;i++){
                if(items[i].consumeType==0){
                    sum += items[i].price;
                }
            }
            return sum;
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
                serviceNO:item.serviceNOBak?item.serviceNOBak:(item.serviceNO?item.serviceNO:'')
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
        getBill:function(items,getBill){
            var _data = JSON.parse(JSON.stringify(items));
            _data.data = JSON.stringify(_data.data);
            am.billOriginData = _data;
            items.src = "hangup";
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
                items.serviceNOBak = items.serviceNO;
                items.serviceNO = '';
                if(res.code==0){
                    am.cashierTab.feedBill(items,1,getBill);
                }
                if(res.code == 1){//开卡
                    $.am.changePage(am.page.memberCard,"",{billRemark:items});
                }
                if(res.code == 2){//充值
                    am.searchMember.getMemberById(items.memId,billRemark.recharge.id,function(content){
                        if(content){
                            var fn=function(){
                                $.am.changePage(am.page.pay, "slideup", {
                                    action: "recharge",
                                    member: content,
                                    rechargeMoney:billRemark.recharge.money,
                                    billRemark:items,
                                    remarkCallback:remarkCallback
                                });
                            };
                            if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true'){
                                am.pw.check(content, function (verifyed) {
                                    if (verifyed) {
                                        fn();
                                    }
                                },function(){
                                    $.am.page.back()
                                });
                            }else{
                                fn();
                            }
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
                am.cashierTab.feedBill(items,1,getBill);
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
        searchTheRes:function(open){
            var keyword = self.$keywordPc.val();
            self.filter(keyword);
            self.hangupScroll.refresh();
            self.hangupScroll.scrollTo("top");

            var $btn = self.$container.find('.hangup_cash_btn:visible');
            if(open && $btn.length===1){
                $btn.trigger('vclick');
            }
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
            this.$seatMoreBill.hide();
            $('#autoWrap').hide();
            //为解决 结算完单后 快速按+号触发开单出现英文服务号问题
            sessionStorage.cardPreventKeyB = 'prevent';

            if(amGloble.metadata.userInfo.operatestr.indexOf('a30,') != -1 && amGloble.metadata.shopPropertyField.mgjBillingType==1){
                this.$.find(".openbill").hide();
                this.$.find(".toSetWorkStation").hide();
            }else{
                this.$.find(".openbill").show();
                this.$.find(".toSetWorkStation").show();
            }
            if(paras){
                self.setting_washTime = paras.setting_washTime;
            }
            if(paras && paras.openbill){
                this.changePageType(1);
                am.tab.main.show().select(1);
                this._billType = paras.openbill;
            }
            else if(paras == "back"){
                this.changePageType(1);
                am.tab.main.show().select(1);
            }
            else{
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

            //小红点
            if(self.mgj_orderOverdue !== new Date().format('yyyy-mm-dd')){
                this.getCount(function(ret) {
                    if (ret.code == 0) {
                        self.mgj_orderOverdue = new Date().format('yyyy-mm-dd');
                        if(ret.count > 0){
                            $('#hangup_orderOverdue .num').show();
                        }
                    } else {}
                });
            }

            var workStationSwitch = amGloble.metadata.configs.workStationSwitch;
            if(workStationSwitch=='true'){
                this.$toggleMode.show();
                var openBillMode = localStorage.getItem('openBillMode_'+amGloble.metadata.userInfo.userId);
                if(openBillMode=='seat'){
                    this.$toggleMode.addClass('active');
                    self.$.find('.hanup_wrapper .hangup_container').eq(1).show().siblings().hide();
                }
            }else {
                this.$toggleMode.hide();
                this.$.find('.hanup_wrapper .hangup_container').eq(0).show().siblings().hide();
            }

            this.$warn.hide();
            this.$downloadtip.hide();
            this.$hangup_orderOverdueBig.hide();
        },
        afterShow: function() {
    
			sessionStorage.removeItem('_autoPay1214'); 

            //为解决 结算完单后 快速按+号触发开单出现英文服务号问题
            clearTimeout(time);
            var time = null;
            if(!time) {
                time = setTimeout(function() {
                    sessionStorage.cardPreventKeyB = 'post';
                }, 500);
            }else {}
            
            this.startGetDate();
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
            this.$seatMoreBill.hide();
            this.isRefreshing = true;
            this.getData(function(ret){
                self.isRefreshing = false;
                if (ret.code == 0) {
                    self.render(ret.content);
                    // self.hangupFootScroll.refresh();
                } else {
                    am.msg(ret.message || "数据刷新失败，请重试！");
                }
            });
        },
        getCount:function(cb) {
            am.api.instoreServiceCount.exec({
                "shopId": am.metadata.userInfo.shopId,
                "pageSize": 99999, //可选，如果有则分页，否则不分页
                fromHistory : 0,
                startTime : 0,
                'endTime' : new Date().getTime() - (86400*1000*2), //48小时
            }, function(ret) {
                cb(ret);
            });
        },
        initMember: function(self){
              //底部员工列表
            // this.hangupFooList = $('.hangup-foot-list');
            // var hangupWarp= $(window).width() -75+'px';
            // $('.hangup-foot-show').css('width',hangupWarp)
            $('.hangup-foot-list').on('vclick', 'li', function() {
                var _this = $(this);
                var $memberSelect = $('.member-seleced-mark');
                if(!$(this).hasClass('seat')){
                    var selectImg = _this.find('img');
                    var $name = _this.attr('name');
                    var $no = _this.attr('no');
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
                        $memberSelect.show().removeClass('seat');
                    }
                }else {
                    if($(this).hasClass('selected')){
                        $(this).removeClass('selected');
                        self.filterSpace();
                        $memberSelect.hide();
                    }else {
                        $(this).addClass('selected');
                        $(this).siblings().removeClass('selected');
                        var data = $(this).data('data');
                        self.filterSpace(data);
                        $('.member-seleced-mark .mark-content').text(data.name);
                        $memberSelect.show().addClass('seat');
                    }
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
            if (this.seatMachineBox && this.seatMachineBox.length > 0) {
                for (var i = 0; i < this.seatMachineBox.length; i++) {
                    for(var j=0;j<this.seatMachineBox[i].length;j++){
                        this.seatMachineBox[i][j] && clearInterval(this.seatMachineBox[i][j]);
                    }
                }
            }
            if (this.moreBillMachineBox && this.moreBillMachineBox.length > 0) {
                for (var i = 0; i < this.moreBillMachineBox.length; i++) {
                    clearInterval(this.moreBillMachineBox[i]);
                }
            }
            if (this.seatToggleMachineBox && this.seatToggleMachineBox.length > 0) {
                for (var i = 0; i < this.seatToggleMachineBox.length; i++) {
                    this.seatToggleMachineBox[i] && clearInterval(this.seatToggleMachineBox[i]);
                }
            }
        },
        merge:function(ret){//并单 //读取数据//confirm确认并单//保存新订单数据  //删除其他非主订单的数据
            // var ret=this.checkSelection();
            var firstSelected = ret.firstSelected;
            if(!ret.selected.length){
                am.msg("请选中至少两个单据！");
                return;
            }

            var list = this.getComboItems(firstSelected.memId); //获取卡套餐项目

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

                    //对比 项目id 和 卡套餐项目。有则抵扣次数，无则扣原价
                    $.each(item.data.serviceItems, function(serviceItems_i, serviceItems_item){
                        if(list && list.length){
                            $.each(list, function(list_i, list_item){
                                if(serviceItems_item.itemId == list_item.itemid) {
                                    
                                    // if(!serviceItems_item.sumtimes || !serviceItems_item.leavetimes) {
                                        serviceItems_item.sumtimes = list_item.sumtimes;
                                        serviceItems_item.leavetimes = list_item.leavetimes;
                                        console.log(1112, serviceItems_item, list_item);
                                    // }
                                    return false;
                                }else {
                                    delete serviceItems_item.sumtimes;
                                    delete serviceItems_item.leavetimes;
                                }
                            }); 
                        }
                        console.log(serviceItems_item);
                    });    

                    data.serviceItems = data.serviceItems.concat(item.data.serviceItems);  
                    $.each(data.serviceItems,function(i,item){item.notAuto=0});//不动位置              
                }
                if (item.data && item.data.products && item.data.products.depots && item.data.products.depots.length) {//新增合并卖品
                    data.products.depots = self.uniqueArray(data.products.depots.concat(item.data.products.depots));
                }
                ids.push(item.id);
                displayIds.push(item.displayId);

                
            });

            var sumfee = 0,  //服务总价
                prodSumfee = 0;  //卖品总价
            $.each(data.serviceItems, function(i, item) {
                //并单后的服务总价
                sumfee += item.price;
            });
            $.each(data.products.depots, function(i, item) {
                //并单后的卖品总价
                prodSumfee += (item.salePrice * item.number);
            });  
            data.sumfee = sumfee;    
            data.prodSumfee = prodSumfee; 

            console.log(list, firstSelected, ret.selected, data, ids);
            // return;
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
                                        // self.hangupScroll.refresh();
                                        // self.hangupScroll.scrollTo("top");
                                        // self.resetMergeClass();
                                        // self.startGetDate();
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
        getComboItems: function(id) { //并单前查询主单据 卡套餐

            //获取状态
            var self = this,
                userInfo = am.metadata.userInfo,
                list;

            $.ajax({
                url : config.originBaseUrl + '/mgj-cashier/member/itemOfCard?parentShopId=' + userInfo.parentShopId + '&token=' + userInfo.mgjtouchtoken,
                type : "POST",
                contentType: 'application/json',
                data : JSON.stringify({
                    "parentShopId": userInfo.parentShopId,
                    "shopId": userInfo.shopId,
                    "memberid" : id
                }),
                async: false,
                dataType : "json",
                success : function(ret) {
                    if(ret.code == 0 && ret.content.length > 0){
                        list = ret.content;
                    }else{
                        // am.msg(ret.message || "数据获取失败，请重试！");
                    }
                },
                error : function(){}
            });

            return list;
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

            // if(this.$.hasClass('half_page')){
            //     this.$warn.show();
            //     this.$hangup_orderOverdueBig.show();
            // }
            // this.$warn.show();
            // this.$hangup_orderOverdueBig.show();
        },
        filter: function(key) {
            var $inners = this.$container.children('.hangup_block');
            if (!$.trim(key)) {
                if( $('#page_hangup .hangup_block').length <= 0) {
                    $('#page_hangup .empty_wrap').show();
                }else {
                    $('#page_hangup .empty_wrap').hide();
                }
                
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
            
            var hangup_block = [];
            $inners.each(function(i, item) {
                var $this = $(item);
                var $cust = $this.find('.name');
                var $serv = $this.find('.serversContent');
                var data = $this.data("data");
                var found = false;
                if (findString(data.displayId) || findString($cust.text()) || findString($serv.text().split(' ')) ) {
                    hangup_block.push('a');
                    $this.show();
                } else {
                    $this.hide();
                } 
 
                if(hangup_block.length > 0) {
                    $('#page_hangup .empty_wrap').hide();
                }else {
                    $('#page_hangup .empty_wrap').show();
                }
            });

        },
        changeSeat:function(data,id){
            var _this = this;
            am.loading.show();
            am.api.hangupSave.exec({
                id: data.id,
                tableId: id,
                parentShopId:am.metadata.userInfo.parentShopId,
                shopId:am.metadata.userInfo.shopId,
            }, function(ret){
                am.loading.hide();
                if(ret && ret.code===0){
                    am.msg("座位更换成功");
                    data.tableId = id;
                    self.renderSeatMode(self.tempData);
                } else {
                    am.msg("座位更换失败！");
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
        filterSpace: function(setting){
            var spaces = this.$spaceWrapper.find('.space');
            if(!setting){
                spaces.show();
            }else {
                for(var i=0;i<spaces.length;i++){
                    var data = $(spaces[i]).data('data');
                    if(data.id==setting.id){
                        $(spaces[i]).show();
                    }else {
                        $(spaces[i]).hide();
                    }
                }
            }
            this.spaceScroll.refresh();
            this.spaceScroll.scrollTo('top');  
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
                "parentShopId":user.parentShopId,//for wyl增加该参数
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
        computedMember: function(data,type){
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
            if(type){
                $('.hangup-foot-list').empty();
                var setting = amGloble.metadata.areaList;
                var using = {};
                if(data){
                    for(var key in data){
                        var status = am.cashierTab.getSeatInfo(key).status;
                        if(!status){
                            continue;
                        }
                        var id = am.cashierTab.getSeatInfo(key).id;
                        if(!using[id]){
                            using[id] = 0;
                        }
                        using[id] ++;
                    }
                }
                for(var i=0;i<setting.length;i++){
                    var all = 0;
                    for(var j=0;j<setting[i].seats.length;j++){
                        if(setting[i].seats[j].status){
                            all ++;
                        }
                    }
                    if(!all){
                        continue;
                    }
                    var $li = $('<li class="seat am-clickable"><div class="visible"></div><div class="wrap"><div class="spaceName text"></div><div class="usedInfo text"></div></div></li>');
                    $li.find('.spaceName').text(setting[i].name);
                    $li.data('data',setting[i]);
                    var used = using[setting[i].id]?using[setting[i].id]:0;
                    var usedInfo = '';
                    if(!used){
                        usedInfo = '空闲';
                    }else {
                        $li.addClass('used');
                        if(used>=all){
                            usedInfo = '满员';
                        }else {
                            usedInfo = used+'/'+all;
                        }
                        var c = document.createElement('canvas');
                        $li.append($(c));
                        var ctx = c.getContext("2d");
                        ctx.canvas.width = 50;
                        ctx.canvas.height = 50;

                        ctx.beginPath();
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = 'rgb(238,238,238)';
                        ctx.lineCap = 'round';
                        ctx.arc(25, 25, 23, -90 * Math.PI / 180, 270 * Math.PI / 180);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.lineWidth = 4;
                        var strokeStyle = '#e82742';
                        if(themeSetting.themeConfig){
                            strokeStyle = themeSetting.themeConfig.color.standard;
                        }
                        ctx.strokeStyle = strokeStyle;
                        ctx.lineCap = 'round';
                        ctx.arc(25, 25, 23, -90 * Math.PI / 180, 2 * Math.PI*parseFloat(used/all)-90 * Math.PI / 180);
                        ctx.stroke();
                    }   
                    $li.find('.usedInfo').text(usedInfo);
                    $('.hangup-foot-list').append($li);
                    
                }
            }else {
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
                this.$hangupFootShow.css('right','106px');
                $('.hangup-right-arrow').hide();
            }else{
                this.$.find(".hangup-foot-show").css({
                    left: 0
                })
                this.$hangupFootShow.css('right','181px');
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
        render: function(data){
            if(data.length>0){
                self.tempData = data.sort(function(a,b){
                    return b.createDateTime - a.createDateTime;
                });
            }else {
                self.tempData = null;
            }
            if(this.$toggleMode.is(':visible') && this.$toggleMode.hasClass('active')){
                this.renderSeatMode(self.tempData);
            }else {
                this.renderBillMode(self.tempData);
            }
        },
        showSelectBillTipStep1: function(type){
            var selectBillTipStep1 = localStorage.getItem(amGloble.metadata.userInfo.userId+'_selectBillTipStep1');
            if(selectBillTipStep1){
                return;
            }
            var bills = null;
            if(type){
                bills = this.$spaceWrapper.find('.billed');
            }else {
                bills = this.$container.find('.hangup_block')
            }
            if(bills && bills.length){
                var bill = bills[0];
                var $selectBillTipStep1 = this.$selectBillTipStep1.clone(true,true);
                $selectBillTipStep1.removeClass('top');
                if(type){
                    var $seat = $(bill).parents('.seat');
                    $(bill).parents('.space').append($selectBillTipStep1);
                    var offset = $seat.offset();
                    $selectBillTipStep1.css({
                        'left': offset.left - 75 + 102 + 'px',    //-75左侧tab宽度   +102向右偏移
                        'top': offset.top - 51 - 40 + 'px'       //-51顶部操作栏高度  -40 向上偏移
                    });
                }else {
                    $(bill).append($selectBillTipStep1);
                }
            }
        },
        showSelectBillTipStep2: function(){
            var selectBillTipStep2 = localStorage.getItem(amGloble.metadata.userInfo.userId+'_selectBillTipStep2');
            if(!selectBillTipStep2){
                this.$selectBillTipStep2.addClass('bounceIn').show(); 
            }
            var index = $('.hanup_wrapper .hangup_container:visible').index();
            var seleced = null;
            if(index==0){
                seleced = this.$container.find('.hangup_inner .flag.selected')
            }else {
                seleced = this.$spaceWrapper.find('.selected');
            }
            if(seleced.length>1){
                this.$.find('.pay_btns,.merge_btn').addClass('tip-highlight');
            }else if(seleced.length==1) {
                this.$.find('.pay_btns').addClass('tip-highlight');
                this.$.find('.merge_btn').removeClass('tip-highlight');
            }else {
                this.$.find('.pay_btns,.merge_btn').removeClass('tip-highlight');
                this.$selectBillTipStep2.removeClass('bounceIn').hide();
            }
        },
        renderBlock:function(data,$parent){
            var user = am.metadata.userInfo;
            var deleteOpt = user.operatestr.indexOf(',MGJZ6,') == -1;
            var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
            var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
            $.each(data, function(i, item) {
                if(item.status==3){
                    return true;
                }
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
                var timer = item.shampooFinishTime - item.shampooStartTime;//洗发时长
                var timeStr = new Date(timer).format("MM:ss").replace(":", "分") + "秒";//转换分秒
                if((timer/60000) > 60){//如果超过1个小时
                    timeStr = Math.floor(timer/60000/60) + "小时" + timeStr;
                }
                am.metadata.configs.washPassTime = am.metadata.configs.washPassTime ? am.metadata.configs.washPassTime : 30;
                var isPassStr = "",flag = "";
                //是否合格
                if((am.metadata.configs.washPassTime - 0) * 60000 < (item.shampooFinishTime - item.shampooStartTime)){
                    isPassStr = "洗发合格，时长" + timeStr;
                    flag = "pass";
                }else{
                    isPassStr = '<span class="iconfont icon-shijianbiao"></span>洗发不合格，时长' + timeStr; 
                    flag = "nopass";
                }
                if(timer && timer > 0){//存在洗发时长
                    item.jsonstr = JSON.stringify({
                        washPassTime: timeStr,
                        flag: flag
                    });
                }
                var washTimeStr = (washTimeFlag ? (item.shampooStartTime ? item.shampooFinishTime ? '<span class="finished">' + isPassStr + '</span>' : '<span class="wash-opt finish am-clickable">结束洗发</span>' : '<span class="wash-opt start am-clickable">开始洗发</span>') : '');
                if(am.metadata.shopPropertyField.mgjBillingType == 0){
                    washTimeStr = "";
                }
                $tfoot.append('<tr class="line sumFee"><td colspan="2" class="money"><div class="am-clickable tips"></div><div class="content"><span class="text">合计:</span><span class="num">￥' + sumfee.toFixed(1) + '</span></div></td></tr>')
                .append(washTimeFlag?'<tr class="line wash"><td colspan="2"><span class="info">' + washTimeStr + '</td></tr>':'')
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
                        serverName.push('<span class="appoint iconfont icon-gou">'+item.emp1Name+'</span>');
                    }else{
                        serverName.push('<span class="noappoint">'+item.emp1Name+'</span>');
                    }                       
                }
                 if(item.emp2Name){
                    if(item.isSpecified2==1){
                        serverName.push('<span class="appoint iconfont icon-gou">'+item.emp2Name+'</span>');
                    }else{
                         serverName.push('<span class="noappoint">'+item.emp2Name+'</span>');
                    }
                   
                }
                  if(item.emp3Name){
                    if(item.isSpecified3==1){
                        serverName.push('<span class="appoint iconfont icon-gou">'+item.emp3Name+'</span>');
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
                                                serverName.push('<span class="appoint iconfont icon-gou">'+itemin.servers[j].name+'</span>')               	
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

                    var $block = $('<div class="hangup_block" data-index="' + i + '" data-id="' + item.id + '"><img class="backjiaz" src="$dynamicResource/images/hangup/backjiaz.png" /><div class="self_mask am-clickable"><div class="tips_wrap"><span>第一个选中的单将作为主单后续选中的单据将被合并至此单</span></div></div><div class="hangup_inner"></div></div>');
                    var $good = "";
                    if(item.mgjIsHighQualityCust == 1 || detail.mgjIsHighQualityCust == 1){
                        $block.addClass("good");
                        $good = '<span class="good am-clickable"></span>';
                    }else{
                        $block.removeClass("good");
                        $good = '';
                    }
                    $block.find('.hangup_inner').append('<div class="title">' + '<div class="content"><span class="no">' + item.displayId +'</span><span class="name '+(item.memId>0?'am-clickable':'') +'">' + (item.memName ? item.memName : '散客') + '</span>'+ $good +'</div></div>');
                    $block.find('.hangup_inner').append('<span class="flag am-clickable"><b></b><svg aria-hidden="true"><use xlink:href="#icon-ziyuan32"></use></svg></span>');
                    if(item.tableId){
                        var tableInfo = am.cashierTab.getSeatInfo(item.tableId);
                        if(tableInfo.id){
                            $block.find('.hangup_inner').append('<div class="tableInfo">'+tableInfo.name+tableInfo.tableName+'</div>');
                        }
                    }
                    item.data=detail;
                    $block.data('data',item);

                var hangup_inner = $block.find('.hangup_inner');
                hangup_inner.append($billDate)
                .append($billServers)
                .append($billTb);
                
                //status 0和null 开单 1.结算中 2.已结算
                if(item.status == '0' || item.status == null) {
                    var billBtn = '<span class="hangup_cash_btn am-clickable">取单</span></div>';
                    if(am.metadata.userInfo.operatestr.indexOf("a41") > -1){
                        billBtn = '<span class="hangup_cash_btn disabled">刷卡取单</span></div>';
                    }
                    hangup_inner
                    .append('<div class="operation">' + (deleteOpt ? '<span class="icon icon_delete am-clickable"></span>' : '<span></span>') + billBtn)
                }else if(item.status == '1') {
                    hangup_inner
                    // .append('<div class="operation">' + '<span class="hangup_settle_btn am-clickable">结单</span></div>')
                    .addClass('settle').append('<div class="settleModel"><img class="settleImg" src="$dynamicResource/images/hangup/ckecking.png" alt="结算中" /></div>');
                }else if(item.status == '2') {
                    hangup_inner
                        .append('<div class="operation">' + '<span class="hangup_settle_btn am-clickable">结单</span></div>')
                        .addClass('settle').append('<div class="settleModel"><img class="settleImg" src="$dynamicResource/images/hangup/ckeck_ok.png" alt="结算" /></div>');
                }

                $parent.append($block);
            });
        },
        renderSeatMoreBill: function(data,selecedArr){
            this.seatTempData = data;
            var self = this;
            this.$seatMoreBill.find('.seatMoreBillContent .inner').empty();
            if (data) {
                var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
                var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
                this.renderBlock(data,this.$seatMoreBill.find('.seatMoreBillContent .inner'));
                if(washTimeFlag){
                    this.$seatMoreBill.find('.hangup_block').addClass('washTime');
                    this.$seatMoreBill.find('.hangup_inner').addClass('washTime');
                }
                var list = this.$seatMoreBill.find('.seatMoreBillContent .hangup_block');
                for(var i=0;i<list.length;i++){
                    if(selecedArr && selecedArr[i]){
                        $(list[i]).find('.flag').addClass('selected');
                    }
                }
                var width = list.eq(0).outerWidth(true);
                this.$seatMoreBill.find('.seatMoreBillContent .inner').css('width',width*list.length+'px');
                if(!this.seatMoreBillScroll){
                    this.seatMoreBillScroll = new $.am.ScrollView({
                        $wrap: this.$seatMoreBill.find('.seatMoreBillContent'),
                        $inner: this.$seatMoreBill.find('.seatMoreBillContent .inner'),
                        direction: [1,0],
                        hasInput: false
                    });
                }else {
                    this.seatMoreBillScroll.refresh();
                    this.seatMoreBillScroll.scrollTo('top');
                }
                self.moreBillTimeMathine(data,amGloble.metadata.configs.jbTime);
            }
        },
        renderBillMode: function(data) {
            this.$warn.show();
            this.$downloadtip.hide();
            this.$hangup_orderOverdueBig.show();
            this.$.find('.member-seleced-mark').hide();
            this.$selectBillTipStep2.removeClass('bounceIn').hide();
            this.$.find('.pay_btns,.merge_btn').removeClass('tip-highlight');
            var self = this;
            this.$container.empty();
            this.$.removeClass('empty');
            if (data) {
				$('#hangup_container .empty_wrap').hide();
                this.$container.append('<div class="hangup_mask am-clickable"></div>');
                var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
                var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
                // 生成底部员工列表
                this.computedMember(data)
                this.renderBlock(data,this.$container);
                if(washTimeFlag){
                    this.$.find('.hangup_block').addClass('washTime');
                    this.$.find('.hangup_inner').addClass('washTime');
                }
                self.timeMachine(amGloble.metadata.configs.jbTime);
            } else {
                $('.hangup-foot-list').html('');
                $('.hangup-right-arrow').hide();
                // self.$container.html('<p>还没有进行中的服务哦~</p>');
                // if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
                //     this.$.addClass('empty'); 
                // }
                this.$.addClass('empty'); 
                $('#hangup_container .empty_wrap').show();
            }
            this.$hangup_orderOverdueBig.show();
            this.$keywordPc.val('');
            this.hangupScroll.refresh();
            this.hangupScroll.scrollTo("top");
            this.showSelectBillTipStep1();
        },
        renderSeatMode: function(data){
            this.$warn.hide();
            this.$downloadtip.show();
            this.$hangup_orderOverdueBig.hide();
            this.$.find('.member-seleced-mark').hide();
            this.$selectBillTipStep2.removeClass('bounceIn').hide();
            this.$.find('.pay_btns,.merge_btn').removeClass('tip-highlight');
            this.renderSeats(function(){
                if(!data){
                    self.computedMember(null,1);
                    self.calSpaceSummary();
                    return;
                }
                var renderData = {};
                var needDeletedWaitedBills = [];
                for(var i=0;i<data.length;i++){
                    if(data[i].tableId){
                        if(data[i].status==3 && (new Date().getTime()-data[i].createDateTime)>(60*60*1000)){
                            needDeletedWaitedBills.push(data[i].id);
                        }else {
                            if(!renderData[data[i].tableId]){
                                renderData[data[i].tableId] = [];
                            }
                            renderData[data[i].tableId].push(data[i]);
                        }
                    }
                }
                if(needDeletedWaitedBills.length){
                    self.deleteWaitedBills(needDeletedWaitedBills);
                }
                if(JSON.stringify(renderData)=='{}'){
                    self.computedMember(null,1);
                    self.calSpaceSummary();
                    return;
                }
                self.computedMember(renderData,1);
                var seats = self.$spaceWrapper.find('.seat');
                for(var i=0;i<seats.length;i++){
                    var seat = $(seats[i]);
                    var seatData = seat.data('data');
                    if(renderData[seatData.id]){
                        seat.find('.empty').hide().end().find('.used').show();
                        var _data = renderData[[seatData.id]];
                        for(var j=0;j<_data.length;j++){
                            if(_data[j].status==3){
                                var $bill = self.$waitedItem.clone(true,true);
                                $bill.find('.header').html(_data[j].memId==-1?'':am.photoManager.createImage("customer", {
                                    parentShopId: am.metadata.userInfo.parentShopId,
                                    updateTs: _data[j].lastphotoupdatetime || ""
                                }, _data[j].memId + ".jpg", "s",_data[j].photopath||''));
                                $bill.find('.name').text(_data[j].memId==-1?'散客':_data[j].memName);
                            }else {
                                var $bill = self.$billedItem.clone(true,true);
                                var deskinfo = am.cashierTab.getSeatInfo(_data[j].tableId);
                                $bill.find('.deskinfo .infoname').html(deskinfo.tableName+'-<b>'+_data[j].displayId+'</b>');
                                $bill.find('.customer .header').html(_data[j].memId==-1?'':am.photoManager.createImage("customer", {
                                    parentShopId: am.metadata.userInfo.parentShopId,
                                    updateTs: _data[j].lastphotoupdatetime || ""
                                }, _data[j].memId + ".jpg", "s",_data[j].photopath||''));
                                $bill.find('.customer .name').text(_data[j].memId==-1?'散客':_data[j].memName);

                                var serverName = [];
                                if(_data[j].emp1Name){
                                    serverName.push(_data[j].emp1Name);                  
                                }
                                if(_data[j].emp2Name){
                                    serverName.push(_data[j].emp2Name); 
                                }
                                if(_data[j].emp3Name){
                                    serverName.push(_data[j].emp3Name); 
                                }

                                var jsondata = JSON.parse(_data[j].data);

                                var serviceItems = jsondata.serviceItems || [],
                                    products = [];
                                if(jsondata.products && jsondata.products.depots && jsondata.products.depots.length){
                                    products = jsondata.products.depots;
                                }
                                var html = [];
                                if(serviceItems && serviceItems.length){
                                    for(var m=0;m<serviceItems.length;m++){
                                        html.push('<p class="text">'+serviceItems[m].name+'</p>');
                                        if(!serverName.length){
                                            var itemin = serviceItems[m];
                                            if(itemin.servers && itemin.servers.length){
                                                for (var n = 0; n < itemin.servers.length; n++) {
                                                    if(itemin.servers[n] && itemin.servers[n].name && serverName.indexOf(itemin.servers[n].name) == -1){
                                                        serverName.push(itemin.servers[n].name);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if(products && products.length){
                                    for(var m=0;m<products.length;m++){
                                        html.push('<p class="text">'+products[m].productName+'</p>');
                                    }
                                }
                                if(html.length){
                                    $bill.find('.serviceItems').html(html.slice(0,2).join(''));
                                }
                                $bill.find('.serverName').text(serverName.join(',') || '');
                                if(_data[j].status==1){
                                    $bill.find('.serviceItems').addClass('paying');
                                }else if(_data[j].status==2) {
                                    $bill.find('.serviceItems').addClass('payed');
                                }
                            }
                            if(jsondata && jsondata.mgjIsHighQualityCust==1){
                                $bill.addClass('quality');
                            }
                            // if(_data.length>1){
                                // $bill.find('.select').remove();
                            // }
                            var nowtime = am.now();
                            var sdTime = amGloble.metadata.configs.jbTime;
                            sdTime = sdTime ? sdTime*3600*1000:3*3600*1000;
                            if(nowtime-_data[j].createDateTime>sdTime){
                                $bill.addClass('warningTime');
                            };
                            if(j==0){
                                $bill.addClass('active');
                            }
                            seat.find('.used').prepend($bill.data('data',_data[j]));
                        }
                    }
                }
                self.seatTimeMachine(amGloble.metadata.configs.jbTime);
                self.seatBillToggleMachine();
                self.calSpaceSummary();
                self.showSelectBillTipStep1(1);
            });
        },
        renderSeats: function(callback){
            this.$spaceWrapper.empty();
            var setting = amGloble.metadata.areaList;
            if(!setting || !setting.length){
                $('#hangup_container_workStation .empty_wrap').show();
                this.computedMember(null,1);
                return;
            }
            var used = 0;
            for(var i=0;i<setting.length;i++){
                for(var j=0;j<setting[i].seats.length;j++){
                    if(setting[i].seats[j].status){
                        used ++;
                    }
                }
            }
            if(!used){
                $('#hangup_container_workStation .empty_wrap').show();
                this.computedMember(null,1);
                return;
            }
            $('#hangup_container_workStation .empty_wrap').hide();
            var column = 0;
            for(var i=0;i<setting.length;i++){
                var $space = this.$space.clone(true,true);
                $space.find('.intro .spaceName').text(setting[i].name);
                if(!column){
                    column = setting[i].colnumber;
                }
                var seats = setting[i].seats.sort(function(a,b){
                    return a.sort - b.sort;
                });
                for(var j=0;j<seats.length;j++){
                    var $item = this.$seatItem.clone(true,true);
                    $item.find('.empty .name').text(seats[j].tablename);
                    $item.find('.empty').show();
                    if(!seats[j].status){
                        $item.addClass('hidden');
                    }
                    $space.find('.list').append($item.data('data',seats[j]));
                }
                if($space.find('.list').find('.seat.hidden').length != $space.find('.list').find('.seat').length){
                    this.$spaceWrapper.append($space.data('data',setting[i]));
                }
            }
            this.calSize(column);
            this.removeEmptyRow(column);
            this.setSeatHeight();
            this.spaceScroll.refresh();
            this.spaceScroll.scrollTo('top');
            callback && callback();
        },
        setSeatHeight: function(){
            var uls = this.$spaceWrapper.find('.list');
            for(var i=0;i<uls.length;i++){
                var height = $(uls[i]).height();
                $(uls[i]).data('height',height).css('height',height+'px');
            }
        },
        calSize: function(column){
            var itemWidth = this.$spaceWrapper.find('.seat').outerWidth(true);
            if(!this.containerWidth){
                this.containerWidth = this.$spaceWrapper.width();
            }
            var margin = 10;
            if(this.containerWidth>itemWidth*column){
                margin = (this.containerWidth -  itemWidth*column)/(column-1);
            }else {
                for(var i=column;i<=column;i--){
                    if(this.containerWidth-itemWidth*i>0){
                        this.calSize(i);
                        return;
                    }
                }
            }
            this.$spaceWrapper.find('.seat').css('margin-right',margin+'px');
            this.$spaceWrapper.find('.seat:nth-child('+column+'n)').css('margin-right',0);
            this.$spaceWrapper.find('.list').css('width',itemWidth*column+margin*(column-1)+'px');
        },
        removeEmptyRow: function(column){
            var uls = this.$spaceWrapper.find('.list');
            var row = [];
            for(var i=0;i<uls.length;i++){
                var lis = $(uls[i]).find('.seat');
                for(var j=0;j<lis.length;j+=column){
                    row.push(lis.slice(j,(j+column)));
                }
            }
            for(var i=0;i<row.length;i++){
                var empty = 0;
                for(var j=0;j<row[i].length;j++){
                    if($(row[i][j]).hasClass('hidden')){
                        empty ++;
                    }else {
                        break;
                    }
                }
                if(empty==row[i].length){
                    for(var j=0;j<row[i].length;j++){
                        $(row[i][j]).remove();
                    }
                }
            }
        },
        calSpaceSummary: function(){
            var spaces = this.$spaceWrapper.find('.space');
            if(!spaces.length){
                return;
            }
            for(var i=0;i<spaces.length;i++){
                var seats = $(spaces[i]).find('.seat:not(.hidden)');
                var empty = seats.find('.empty:visible').length,
                    waited = seats.find('.waited').length,
                    billed = seats.find('.payed').length;
                $(spaces[i]).find('.summary').text('空桌'+empty+'、待开单'+waited+'、待结算'+billed);
            }
        },
        deleteWaitedBills: function(ids,reason,callback){
            am.api.deleteInstoreServices.exec({
                ids: ids,
                "shopId": am.metadata.userInfo.shopId,
                "parentShopId": am.metadata.userInfo.parentShopId,
                "cancelReason": reason?reason:"待开单过期删除",
                "operatorId": am.metadata.userInfo.userId,
                "operatorName": am.metadata.userInfo.userName
            },function(ret){
                callback && callback();
            });
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
                            self.$seatMoreBill.hide();
                        } else {
                            am.msg(ret.message || "删除服务单失败，请重试！");
                        }
                    });
                }
            });
        },
        washOpt: function($target, data,notBack,callback) {
            var opt = {
                "id": data.id,
                "shopId": data.shopId,
                "parentShopId": data.parentShopId
            };
			if(data.serviceNO) {
				opt.serviceNO = data.serviceNO;
            }else if(data.serviceNOBak){
                opt.serviceNO = data.serviceNOBak
            }
            var index = $target.closest('.hangup_block').attr('data-index');
            if(self.$seatMoreBill.is(':visible')){
                var _tempData = self.seatTempData[index];
            }else {
                var _tempData = self.tempData[index];
            }
            if(data.emp1==-1 && data.emp2==-1 && data.emp3==-1){
                am.msg('还未选择员工，无法进行洗发操作');
                return;
            }else if(!data.shampooworkbay){
                var emps = [];
                for(var i=1;i<=3;i++){
                    if(data['emp'+i]!==-1){
                        emps.push({
                            name: data['emp'+i+'Name'],
                            pos: i
                        })
                    }
                }
                am.popupMenu('请指定洗发员工', emps , function (ret) {
                    var editData = JSON.parse(JSON.stringify(data));
                    editData.shampooworkbay = ret.pos;
                    editData.data = JSON.stringify(editData.data);
                    if(data.serviceNO) {
                        editData.serviceNO = data.serviceNO;
                    }else if(data.serviceNOBak){
                        editData.serviceNO = data.serviceNOBak;
                    }
                    am.cashierTab.hangupSave(editData,notBack,function(){
                        if($.am.getActivePage().id=='page_hangup'){
                            _tempData.shampooworkbay = ret.pos;
                        }
                        data.shampooworkbay = ret.pos;
                        self.washOpt($target, data,notBack,callback);
                    });
                });
                return;
            }
			
            if ($target.hasClass('start')){
                opt.shampooStartTime = am.getTime();
                if($.am.getActivePage().id == "page_hangup"){//区分页面
                    $target.text('结束洗发')
                    _tempData.shampooStartTime = opt.shampooStartTime;
                }
                am.washTipModal.show({
                    flag:"start"
                });
            }  
            else if ($target.hasClass('finish')) {
                var washPassTime = am.metadata.configs.washPassTime ? (am.metadata.configs.washPassTime - 0) * 60 * 1000 : 30 * 60 * 1000;
                opt.shampooFinishTime = am.getTime();
                var timer = am.getTime() - data.shampooStartTime;
                if (!am.isNull(timer)) { //洗发时长
                    var timeStr = new Date(timer).format("MM:ss").replace(":", "分") + '秒';
                    if ((timer / 60000) > 60) { //如果超过1个小时
                        timeStr = Math.floor(timer / 60000 / 60) + "小时" + timeStr;
                    }
                    var htmStr = '',
                        styleStr = '',
                        flag = '';
                    if (timer > washPassTime) {
                        flag = 'pass';
                        htmStr = '洗发合格，时长' + timeStr;
                        styleStr = "<style>#tab_cash .operatehair.disabled::before{height:auto;content:'洗发结束" + timeStr + "';}</style>";
                        
                    } else {
                        flag = 'nopass';
                        htmStr = '<span class="iconfont icon-shijianbiao red"></span>洗发不合格，时长' + timeStr;
                        styleStr = "<style>#tab_cash .operatehair.disabled{color:red;} #tab_cash .operatehair.disabled::before{height:auto;content:'洗发结束" + timeStr + "';}</style>";
                    }
                    var jsonstr = JSON.stringify({
                        washPassTime: timeStr,
                        flag: flag
                    });
                    if ($.am.getActivePage().id == "page_hangup") { //区分页面
                        $target.html(htmStr);
                        $target.removeClass('wash-opt').addClass('finished');
                        _tempData.shampooFinishTime = opt.shampooFinishTime;
                        _tempData.jsonstr = jsonstr;
                    } else if($.am.getActivePage().id == "page_service") {
                        $target.html(styleStr);
                    }
                    if(am.isNull(localStorage.mgjSoundDisabled)){
                        attendanceSoket.getAudio("洗发小助理洗发结束，时间为" + timeStr);
                    }
                    am.washTipModal.show({
                        flag: flag,
                        str: timeStr
                    });
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
                            if(self.machineBox){
                                self.machineBox.push(twMachineNo);
                            }
                        }
                    } else if ($target.hasClass('finish')) {
                        $target.removeClass('finish').addClass('disabled');
                        var $tw = $target.prev().find('.time_wash');
                        var machineNo = $tw.attr('data-machineno');
                        if (machineNo)
                            clearInterval(machineNo);
                    }
                    if(jsonstr){
                        ret.content.jsonstr = jsonstr;
                    }
                    callback && callback(ret.content);
                } else {
                    am.msg("操作失败，请重试~");
                }
            });
        },
        moreBillTimeMathine:function(data,sdTime){
            if (this.moreBillMachineBox && this.moreBillMachineBox.length > 0) {
                for (var i = 0; i < this.moreBillMachineBox.length; i++) {
                    clearInterval(this.moreBillMachineBox[i]);
                }
            }
            var self = this;           
            if (data) {
                self.moreBillMachineBox = [];              
                $.each(data, function(i, item) {
                    // 服务时长
                    var sdtime=sdTime ? sdTime*3600*1000:3*3600*1000;
                    var $parent =self.$seatMoreBill.find('.hangup_block[data-index="' + i + '"]');
                    var $title =self.$seatMoreBill.find('.hangup_block[data-index="' + i + '"] .title');
                    var $ts = self.$seatMoreBill.find('.hangup_block[data-index="' + i + '"] .time_service');
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
                        self.moreBillMachineBox.push(tsMachineNo);
                    }
                    // 洗头时长
                    if (item.shampooStartTime) {
                        var $tw = self.$.find('.hangup_block[data-index="' + i + '"] .time_wash');
                    }
                });
            }
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
                    var $parent =self.$container.find('.hangup_block[data-index="' + i + '"]');
                    var $title =self.$container.find('.hangup_block[data-index="' + i + '"] .title');
                    var $ts = self.$container.find('.hangup_block[data-index="' + i + '"] .time_service');
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
        seatTimeMachine: function(sdTime){
            if (this.seatMachineBox && this.seatMachineBox.length > 0) {
                for (var i = 0; i < this.seatMachineBox.length; i++) {
                    for(var j=0;j<this.seatMachineBox[i].length;j++){
                        this.seatMachineBox[i][j] && clearInterval(this.seatMachineBox[i][j]);
                    }
                }
            }
            this.seatMachineBox = [];
            var sdtime=sdTime ? sdTime*3600*1000:3*3600*1000;
            var space = this.$spaceWrapper.find('.space');
            var fn = function(i){
                if(i<space.length){
                    self.seatMachineBox[i] = [];
                    var bills = $(space[i]).find('.bill');
                    var fn2 = function(j){
                        if(j<bills.length){
                            var bill = $(bills[j]);
                            var item = bill.data('data');
                            var $ts = bill.find('.time');
                            var nowtime=am.now();
                            if(nowtime-item.createDateTime<sdtime){
                                $ts.text(self.calcTime(0, item.createDateTime));
                            }
                            if(nowtime-item.createDateTime>sdtime){
                                $ts.text(self.calcTime(0, item.createDateTime));
                                bill.addClass('warningTime');
                            };
                            var tsMachineNo = setInterval(function() {                    	
                                var nowtime=am.now();
                                var jgtime=nowtime-item.createDateTime;			           
                                if(jgtime>sdtime){
                                    $ts.text(self.calcTime(0, item.createDateTime));
                                    bill.addClass('warningTime');
                                }else{
                                    $ts.text(self.calcTime(0, item.createDateTime)); 
                                }                  
                            }, 1000);
                            if (tsMachineNo) {
                                self.seatMachineBox[i][j] = tsMachineNo;
                            }
                            j ++;
                            fn2(j); 
                        }else {
                            i ++;
                            fn(i);
                        } 
                    }
                    fn2(0);
                }
                
            }
            fn(0);
        },
        seatBillToggleMachine: function(){
            if (this.seatToggleMachineBox && this.seatToggleMachineBox.length > 0) {
                for (var i = 0; i < this.seatToggleMachineBox.length; i++) {
                    this.seatToggleMachineBox[i] && clearInterval(this.seatToggleMachineBox[i]);
                }
            }
            this.seatToggleMachineBox = [];
            var seats = this.$spaceWrapper.find('.seat');
            var fn = function(seat){
                var length = seat.find('.bill').length;
                if(length>1){
                    var i = 0;
                    var tsMachineNo = setInterval(function() {
                        i++;
                        if(i>=length){
                            i=0;
                        }                    	
                        seat.find('.bill').removeClass('active');
                        seat.find('.bill').eq(i).addClass('active');              
                    }, 5000);
                    return tsMachineNo;
                }
            };
            for(var i=0;i<seats.length;i++){
                var seat = $(seats[i]);
                this.seatToggleMachineBox.push(fn(seat));
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
        keyboardCtrl:function(keyCode){
            var ctrl = window.keyboardCtrl;
            if($('.nativeUIWidget-confirm').is(':visible') || $('#autoStationTip').is(':visible') || $('#addMoreRemark').is(':visible')){
                //触发会员弹窗问题
                return;
            }else{
                var num = ctrl.getNum(keyCode),$val = this.$.find('input.input_no');
                // if(typeof(num) === 'number'){
                //     $val.val(num);
                // }
                // $val.focus();
                if(typeof(num) === 'number'){
                    var val = $val.val();
                    if($val.is(':focus')){
                        $val.val(val);
                    }else {
                        $val.val(val+num);
                    }
                    $val.focus();
                }else if(keyCode === 107) {
                    // $.am.changePage(am.page.openbill, "",{source:"hangup"});
                    $.am.changePage(am.page.searchMember, "slideup", {
                        openbill: 1,
                        onSelect: function (item) {
                            $.am.changePage(am.page.openbill, "slidedown", {
                                member: item
                            });
                        }
                    });
                }
            }
        },
        autoGetData:function(eleData,callback) {
            var self = this,
                eleDataO = eleData.data('data'),
                userInfo = am.metadata.userInfo;
            am.api.hangupList.exec({
                channel : 1,
                pageSize : 99999,
                "parentShopId": userInfo.parentShopId,
                "shopId": userInfo.shopId,
                id: eleDataO.id
            },function(ret){
                if(ret.code == 0 && ret.content.length > 0){
                    var retData = ret.content[0];
                    if(retData.status!=eleDataO.status){
                        if(retData.status==1){
                            am.msg('顾客正在使用小程序支付中...');
                        }else if(retData.status==2){
                            am.msg('顾客已在小程序中自助结算了此单');
                        }
                        self.startGetDate();
                    }else {
                        retData.data = JSON.parse(retData.data);
                        callback && callback(retData);
                    }
                }else{
                    callback && callback(eleDataO);
                }
            },null,3000);
        }
    });
})();
