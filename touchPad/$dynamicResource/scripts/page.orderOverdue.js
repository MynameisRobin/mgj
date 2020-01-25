(function() {
	var pageName = 'orderOverdue';
	var self = am.page[pageName] = new $.am.Page({
		id: "page_" + pageName,
		isWin:navigator.platform.indexOf('Win') == 0,
		backButtonOnclick: function() {
			$.am.page.back("slidedown",{openbill:amGloble.metadata.shopPropertyField.mgjBillingType == 1});
		},
		init: function() {

			var self = this;

			this.$operateWrap = $('#page_orderOverdue .operate_wrap');
            this.$keywordPc = this.$operateWrap.find('.input_no');
			this.$keywordMb = this.$operateWrap.find('.no_box');
			
			this.$container = $('#page_orderOverdue .content_wrap');
			
			this.orderOverdueScroll = new $.am.ScrollView({
                $wrap: this.$.find('.orderOverdue_wrap'),
                $inner: this.$container,
                direction: [false, true],
                hasInput: false
            });

			this.$.on('vclick', '.search_wrap .search_icon', function() {
                self.searchTheRes();
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
			}).on('vclick', '.cashierTab li', function() {
				
				var dataId = $(this).attr('data-id'),
					params = {};
                self.tabIndex = dataId;
                
				if(!$(this).hasClass('selected')) {
                    self.autoGetData();
                    self.pageLoading_show('正在获取数据，请稍候...');
                }else {}
                

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
                self.orderOverdueScroll.refresh();
            }).on('vclick','.hangup_mask',function(){
                $('.billTb.up').find('.tips').trigger("vclick");
            }).on('vclick', '.icon_delete', function() {
				var idx = $(this).closest('.hangup_block').attr('data-index');
				
                self.delete(self.tempData[idx]);
            }).on('vclick',"tr.remark",function(event){
                if(self.tabIndex === '2'){
                    return false;
                }else if(self.tabIndex === '1'){
                    event.stopPropagation();
                    var idx = $(this).closest('.hangup_block').attr('data-index');
                    var data =self.tempData[idx];
                    var $this=$(this).find(".remarkWrap");
                    var sendData = data.data?JSON.parse(data.data):{};
                    
    
                    $('#addMoreRemark .c-more-box').hide();
                    // $('#addMoreRemark .c-content').css({'minHeight' : '300px'});
    
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
                                serviceNO:data.serviceNO,
                                version: data.version
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
                                }else if(ret && ret.code==11008){
                                    am.msg('由于其它终端的操作，此单状态已改变！');
                                    self.autoGetData();
                                } else {
                                    am.msg("保存失败！");
                                }
                            });
                        }
                    });
                }
                

            }).on('vclick', '.delBox .icon-xiaoxi', function() {
                //显示删除信息
                var idx = $(this).closest('.hangup_block').attr('data-index'),
                    data = self.tempData[idx];
                console.log(data.memName);
                $('#page_orderOverdue .delAfterBoxWrap').show().find("h3").text(data.displayId+ "-" +(data.memName ? data.memName : '散客') )
                .siblings('.contentBox').find('.content').text(data.cancelReason);
            }).on('vclick', '.delAfterBoxWrap', function (event) {
                $('#page_orderOverdue .delAfterBoxWrap').hide();
            }).on('vclick', '.delAfterBoxWrap .delAfterBox', function (event) {
                event.stopPropagation();
            }).on('vclick', '.delAfterBox .icon-close', function () {
                $('#page_orderOverdue .delAfterBoxWrap').hide();
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
        
        beforeShow: function(params) {

            this.tabIndex = localStorage.page_orderOverdueTab;
            $('#page_orderOverdue .cashierTab li:eq(' + (this.tabIndex - 1) + ')').addClass('selected').siblings().removeClass('selected');

            if(this.tabIndex === '1' && params === 'back'){
                return;
            }
            
            this.pageLoading_show('正在获取数据，请稍候...');

            var myDate = new Date(),
                getFullYear = myDate.getFullYear(),
                getMonth = myDate.getMonth(),
                getDate = myDate.getDate(),
                getHours = myDate.getHours(),
                getMinutes = myDate.getMinutes(),
                getSeconds = myDate.getSeconds(),
                getMilliseconds = myDate.getMilliseconds(),

                //endTime = getFullYear + '-' +  (getDate - 2 <= 0 ? getMonth : getMonth + 1) + '-' + (getDate - 2 <= 0 ? this.getDaysInOneMonth(getFullYear, getMonth) : getDate - 2),
                //endTime = getFullYear + '/' + (getMonth + 1) + '/' + getDate,

                endTimeString = new Date(myDate.setHours(getHours, getMinutes, getSeconds, getMilliseconds)).getTime(); //将时间转成时间戳

                console.log(new Date(myDate.setHours(23, 59, 59, 0)).getTime() - new Date(myDate.setHours(0, 0, 0, 0)).getTime(), 86400*1000*2)
            //过期参数
            this.overParams = {
                "shopId": am.metadata.userInfo.shopId,
                "pageSize": 99999, //可选，如果有则分页，否则不分页
                // "channel":1,
                fromHistory : 0,
                startTime : 0,
                'endTime' : endTimeString - (86400*1000*2), //48小时
                instoreType: 3
            }

            //删除参数
            this.delParams = {
                "shopId": am.metadata.userInfo.shopId,
                "pageSize": 99999, //可选，如果有则分页，否则不分页
                "channel":1,
                fromHistory : 1,
                //startTime : endTimeString - 86400*1000, //24小时
                //'endTime' : endTimeString,
                // startDeleteTime : new Date(endTime + ' 00:00:00').getTime(),
                // 'endDeleteTime' : new Date(endTime + ' 23:59:59').getTime(),
                startDeleteTime : new Date(myDate.setHours(0, 0, 0, 0)).getTime(),
                'endDeleteTime' : new Date(myDate.setHours(23, 59, 59, 0)).getTime()
            }
 
        },

        afterShow: function () {

            if(localStorage.page_orderOverdueTab !== '2') {
                this.startGetDate(this.overParams);
            }else if(localStorage.page_orderOverdueTab === '2') {
                this.autoGetData();
            }
            
            this.orderOverdueScroll.refresh();
        },
        beforeHide : function () {
            $('#addMoreRemark .c-content').css({'minHeight' : '440px'});
            $('#addMoreRemark .c-more-box').show();
            $('.warn').show();
            this.$keywordPc.val('');

            localStorage.page_orderOverdueTab = this.tabIndex;
        },
		render: function(data) {
			console.log('data',data);
            var self = this;
            this.$container.empty();
            this.$.removeClass('empty');
            if (data && data.length > 0) {
				$('#page_orderOverdue .empty_wrap').hide();
                this.$container.append('<div class="hangup_mask am-clickable"></div>');

                if(self.tabIndex === '1') {
                    self.tempData = data.sort(function(a,b){
                        return b.createDateTime - a.createDateTime;
                    });
                }else {
                    self.tempData = data.sort(function(a,b){
                        return b.deleteDate - a.deleteDate;
                    });
                }

                
                var user = am.metadata.userInfo;
                var deleteOpt = user.operatestr.indexOf(',MGJZ6,') == -1;
                //var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
                //var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
                
				// 生成底部员工列表
				//this.computedMember(data)
				
                $.each(self.tempData, function(i, item) {
                    var detail = JSON.parse(item.data);
                    var sumfee = 0;
                    //detail.sumfee&&(sumfee = detail.sumfee);
                    //if(detail.sumfee){
                        //sumfee = detail.sumfee;
                    //} else {
                   /* var $info_list = $('<div class="info_list"></div>');
                    var $serviceItem = $('<div class="serviceItems"><div class="serviceItemsInner am-clickable"></div></div>');*/
					//var $billDate = $('<div class="date"><div class="c-left"></div><div class="c-right time_service"></div><div class="clear"></div></div>');//日期
					var $billDate = $('<div class="date"><div class="c-left"></div><div class="clear"></div></div>');//日期
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
                    // .append(washTimeFlag?'<tr class="line wash"><td colspan="2"><span class="info">'+(washTimeFlag ? (item.shampooStartTime ? item.shampooFinishTime ? '<span class="finished">已结束洗发</span>' : '<span class="wash-opt finish am-clickable">结束洗发</span>' : '<span class="wash-opt start am-clickable">开始洗发</span>') : '') + '</td></tr>':'')
                    .append('<tr class="line remark am-clickable">'+
                        '<td class="'+(item.instorecomment?"has":"")+'" colspan="2" >'+
                            '<div class="remarkbox">'+
                                '<div class="remarkComboBox"></div>'+
                                '<div class="remarkCardBox"></div>'+
                            '</div>'+
                            '<div class="remarkWrap am-clickable">' +(item.instorecomment ? item.instorecomment : '') + '</div>'+
                        '</td>'+
                    '</tr>');
                    if(self.tabIndex !== '1'){
                        // 已删除服务不显示编辑备注图标
                        $tfoot.find('.remarkWrap').css("background","none");
                    }
                    
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
                     
                    }else{
                        $billTb.removeClass("down").removeClass("up");
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
                    if(item.mgjIsHighQualityCust == 1){
                        $block.addClass("good");
                    }else{
                        $block.removeClass("good");
                    }
                    $block.find('.hangup_inner').append('<div class="title"><span class="flag" style="' + self.getFlagColor(item.flag) +'"></span><div class="content"><span class="no">' + item.displayId + "-"+'</span><span class="name '+(item.memId>0?'am-clickable':'') +'">' + (item.memName ? item.memName.substring(0,5) : '散客') +  '</span></div></div>');
                    item.data=detail;
                    $block.data('data',item);
                    $block.find('.hangup_inner')
                    .append($billDate)
                    .append($billServers)
                    .append($billTb)
                    .append('<div class="operation">' + (deleteOpt ? '<span class="icon icon_delete am-clickable"></span>' : '<span></span>') + '<span class="hangup_cash_btn">取单</span></div>')
                    .append('<div class="delBox"><p>删除时间 : ' + new Date(item.deleteDate).format("mm/dd HH:MM") + '</p><p>删除人 : ' + item.operatorName + '</p><span class="iconfont icon-xiaoxi am-clickable"></span></div>');
                    self.$container.append($block);
                });
                // if(washTimeFlag){
                //     this.$.find('.hangup_block').addClass('washTime');
                //     this.$.find('.hangup_inner').addClass('washTime');
                // }
                // self.timeMachine(amGloble.metadata.configs.jbTime);
            } else {
                $('.hangup-foot-list').html('');
                $('.hangup-right-arrow').hide();
                self.tempData = null;
                if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
                    this.$.addClass('empty');
                }
                $('#page_orderOverdue .empty_wrap').show();
            }
            this.pageLoading_hide();
        },
        pageLoading_show : function (text) {
            $('#page_orderOverdue .page-loading .text').text(text);
            $('#page_orderOverdue .page-loading .page-modalLoading-wrap').css({"top" : '44px', "backgroundColor" : '#f4f4f4'})
            .parent('.page-loading').show();
        },
        pageLoading_hide : function () {
            $('#page_orderOverdue .page-loading').hide();
        },
        autoGetData : function() {
            var self = this,
                params = {};
            if(self.tabIndex === '1') {
                $('.warn').show();
                params = self.overParams;
            }else if(self.tabIndex === '2'){
                $('.warn').hide();
                params = self.delParams;
            }
            $('#page_orderOverdue .cashierTab li:eq(' + (this.tabIndex - 1) + ')').addClass('selected').siblings().removeClass('selected');
            self.startGetDate(params);
        },

        getDaysInOneMonth: function (year, month) {//获取月份天数
            month = parseInt(month, 10);  
            var d= new Date(year, month, 0);  
            return d.getDate(); 
        },

		searchTheRes:function(){
            var keyword = self.$keywordPc.val();
            self.filter(keyword);
            self.orderOverdueScroll.refresh();
            self.orderOverdueScroll.scrollTo("top");
        },
        filter: function(key) {
            console.log(key)
            var $inners = this.$container.children('.hangup_block');
            if (!$.trim(key)) {
                if( $('#page_orderOverdue .hangup_block').length <= 0) {
                    $('#page_orderOverdue .empty_wrap').show();
                }else {
                    $('#page_orderOverdue .empty_wrap').hide();
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

                //2018-6-5 前人写的这段代码判断有问题所以注释掉了
                // if (findString(data.displayId) || findString($cust.text().slice(1)) || findString($serv.text().slice(4).split(' ')) ) {
                //     $this.show();
                // } else {
                //     $this.hide();
                // }

                if (findString(data.displayId) || findString($cust.text()) || findString($serv.text().split(' ')) ) {
                    hangup_block.push('a');
                    $this.show();
                } else {
                    $this.hide();
                }

                if(hangup_block.length > 0) {
                    $('#page_orderOverdue .empty_wrap').hide();
                }else {
                    $('#page_orderOverdue .empty_wrap').show();
                }

            });

        },
		getData: function(params, cb) {
            var self = this;
            if(!this.tempData){
                // am.loading.show("正在获取数据，请稍候...");
            }
            am.api.hangupList.exec(params, function(ret) {
                am.loading.hide();
                if (ret.code == 0) {
					self.cachedata = ret;
					console.log('params',params)
                    self.cachedata.ts = new Date().getTime();
                    am.cashierTab.setHangUpNum(ret.count);
                }
				cb(ret);
            });
        },
		startGetDate:function(params){
            $('.member-seleced-mark').hide();
            this.isRefreshing = true;
            this.getData(params, function(ret){
                self.isRefreshing = false;
                if (ret.code == 0) {
                    self.render(ret.content);
                    if(self.tabIndex === '1') {
                        $('.orderOverdue_container .operation').show();
                        $('.orderOverdue_container .delBox').hide();
                    }else {
                        $('.orderOverdue_container .operation').hide();
                        $('.orderOverdue_container .delBox').show();
                    }
                    self.$keywordPc.val('');
                    self.orderOverdueScroll.refresh();
                    self.orderOverdueScroll.scrollTo("top");
                } else {
                    am.msg(ret.message || "数据刷新失败，请重试！");
                }
            });
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
		delete: function(data) {
            var self = this;
            var reason = JSON.parse(am.metadata.configs.delBillRemarks || []);// 门店删单理由
            var hqReason= [];
            if(!(reason && reason.length)){
                // 如果门店未配置删单理由则再取总部的配置
                hqReason = JSON.parse(am.metadata.configs.cancleBilling);
            }
            var cancelReasons = (reason && reason.length ? reason : hqReason)||[];
            am.selectCancleReason.show({
                title: '请选择删单理由',
                warn: '警告:请选择或输入明确的删单理由，以便财务和管理层审核',
                reason: cancelReasons,
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
                            self.orderOverdueScroll.refresh();

                            self.startGetDate(self.overParams);
                        } else {
                            am.msg(ret.message || "删除服务单失败，请重试！");
                        }
                    });
                },
                saveToRemarkList:function(val){
                    if(!am.isNull(reason) && reason.indexOf(val)>-1){
                        // 常用已包含
                        am.msg(val+'已存在，请修改后再保存');
					    return;
                    }else if(!am.isNull(reason) && reason.indexOf(val)==-1){
                        // 常用未包含
                        saveReason = reason.concat([val]);
                    }else if(am.isNull(reason)){
                        // 没有常用
                        saveReason = [val];
                    }
                    am.loading.show();
                    am.api.saveNormalConfig.exec({
                        parentshopid: am.metadata.userInfo.parentShopId+'', 
                        configkey: 'delBillRemarks',
                        configvalue: JSON.stringify(saveReason),
                        shopid: am.metadata.userInfo.shopId+'',
                        setModuleid: 15
                    },function(ret){
                        am.loading.hide();
                        if(ret && ret.code==0){
                           am.metadata.configs.delBillRemarks=JSON.stringify(saveReason);
                           am.msg('【'+val+'】'+'已保存为常用删单理由')
                        }else {
                            am.msg('保存失败');
                        }
                    });
                }
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
		fixHeight:function(flag,offCount){//true增加相应的高度  false//减少相应的高度
            var curHeight = this.$container.height(),TRH = 40;
            var offsetH = TRH*offCount;
            if(flag){
                this.$container.height(curHeight+offsetH);
            }else{
                this.$container.height("auto");
            }
            this.orderOverdueScroll.refresh();
        },
	});
})();
