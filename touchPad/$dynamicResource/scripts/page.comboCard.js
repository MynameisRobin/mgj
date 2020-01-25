(function() {
    giftSelect = {
        init: function () {
            var _this = this;
            this.$ = $("#combo-card-giftItem-selector");
            this.serviceItemScroll = new $.am.ScrollView({
                $wrap: _this.$.find(".serviceItemGiftWarp"),
                $inner: _this.$.find(".serviceItemGiftWarp .serviceWrap"),
                direction: [false, true],
                hasInput: false
            });
            this.productScroll = new $.am.ScrollView({
                $wrap: _this.$.find(".productItemGiftWrap"),
                $inner: _this.$.find(".productItemGiftWrap .productWrap"),
                direction: [false, true],
                hasInput: false
            });
            this.$.find(".close").vclick(function () {
                _this.$.hide();
            });
            this.$.find(".inner").vclick(function (e) {
                e.stopPropagation();
            })
            this.$.vclick(function () {
                _this.$.hide();
            });
            this.$.find(".cancel").vclick(function () {
                _this.$.hide();
            });
            this.$.find(".save").vclick(function () {
                var serviceItem = [];
                var productItem = [];
                var flag = 0;
                _this.$.find('.content .serviceLi.selected').each(function(){
                    var data = $(this).data('data');
                    if(data.itemTimes==0||data.itemTimes==""){
                        flag = 1;
                    }else{
                        serviceItem.push(data);
                    }
                });
                _this.$.find('.content .productli.selected').each(function(){
                    var data = $(this).data('data');
                    if(data.amount==0||data.amount==""){
                        flag = 1;
                    }else{
                        productItem.push(data);
                    }
                });
                if(flag==1){
                    am.msg('次数不能为空！');
                    return;
                }
                if(serviceItem.length>0||productItem.length>0){
                    _this.opt.itemSave && _this.opt.itemSave({
                        serviceItem:serviceItem,
                        productItem:productItem
                    });
                }
                _this.$.hide();
            });
            this.$.find('.content').on("vclick", ".name", function () {
                var $li = $(this).parent();
                if($li.hasClass('selected')){
                    $li.removeClass('selected')
                }else{
                    $li.addClass("selected");
                }
            }).on("vclick", ".icon-juxingkaobei", function () {
                var $parentLi = $(this).parent();
                var currentTpd = $parentLi.data('data');
                if (currentTpd.timesItemNOs) {
                    var timesItemNOList = currentTpd.timesItemNOs.split(',');
                    if (currentTpd.itemId == -1 && timesItemNOList.length > 1) {
                        self.initComboCardItemSelector();
                        self.ComboCardItemSelectorMaxCount = currentTpd.itemTimes;
                        self.ComboCardItemSelectorCallBack = function(newTpd) {
                            for(var i=0;i<newTpd.length;i++){
                                if(newTpd[i].itemTimes==-99){
                                    var $li = $('<li class="serviceLi"><span class="name am-clickable">'+ newTpd[i].itemName +'</span><div class="unlimit am-clickable">不限次</div></li>')
                                }else{
                                    var $li = $('<li class="serviceLi"><span class="name am-clickable">'+ newTpd[i].itemName +'</span><div class="num"><input type="text" class="number" value="'+ newTpd[i].itemTimes +'"></div></li>')
                                }
                                $parentLi.before($li);
                                $li.data('data',newTpd[i])
                            }
                            $parentLi.remove();
                            if (navigator.userAgent.indexOf("Windows") === -1) {
                                _this.$.find('.content .number').prop('readonly',true).addClass('am-clickable');
                            }
                            self.comboCardItemSelector.hide();
                            _this.serviceItemScroll.refresh();
                            _this.serviceItemScroll.scrollTo('top');
                        }
                        var dialogTitleEl = self.comboCardItemSelector.find('.title'),
                            dialogContentEl = self.comboCardItemSelector.find('.scrollInner');
                        var itemTimesLabel = currentTpd.itemTimes == -99 ? '不限' : currentTpd.itemTimes + '次';
                        dialogTitleEl.find('h4 > span').remove();
                        if(am.metadata.userInfo.operatestr.indexOf("a52") == -1){
                            dialogTitleEl.find('h4').append('<span>('+itemTimesLabel+')</span>');
                        }else{
                            dialogTitleEl.find('h4').append('<span>(无次数限制)</span>');
                        }
						dialogContentEl.html('');
						
						if (currentTpd.itemTimes == -99) {
							self.comboCardItemSelector.find('.save').addClass('unlimited');
						} else {
							self.comboCardItemSelector.find('.save').removeClass('unlimited');
						}

                        var tpdTamplate = am.clone(currentTpd);
                        $.each(timesItemNOList, function(index, item) {
                            var paramObj={
                                showStopedItem:1,
                                showFixedStopName:1,
                                onlyShowValidName:0
                            }
                            // var currentName = self.getItemNamesByNos(item,'',1,1)[0];
                            var currentName = self.getItemNamesByNos(item,'',paramObj)[0];
                            tpdTamplate.itemName = currentName;
                            tpdTamplate.timesItemNOs = null;
                            tpdTamplate.itemId = item;
                            tpdTamplate.itemTimes = currentTpd.itemTimes == -99 ? -99 : 0;
                            var itemEl = $(self.renderComboCardSelectorItem(tpdTamplate)).data('data', am.clone(tpdTamplate));
                            dialogContentEl.append(itemEl);
                        });

                        self.comboCardItemSelector.show();

                        if(self.comboCardItemSelectorScroll){
                            self.comboCardItemSelectorScroll.refresh();
                            self.comboCardItemSelectorScroll.scrollTo('top');
                        }else {
                            self.comboCardItemSelectorScroll = new $.am.ScrollView({
                                $wrap : self.comboCardItemSelector.find('.content'),
                                $inner :  self.comboCardItemSelector.find('.scrollInner'),
                                direction : [false, true],
                                hasInput: false
                            });
                        }
                    }
                }
            });
            if (navigator.userAgent.indexOf("Windows") === -1) {
                this.$.find('.content').on('vclick','.number',function () {
                    if(am.metadata.userInfo.operatestr.indexOf("a52") == -1){
                        am.msg('您没有修改次数的权限！')
                    }else{
                        var $this = $(this);
                        am.keyboard.show({
                            "title":'修改赠送内容次数',
                            "submit":function(value){
                                value = value.replace(/[^\d.]/g,"");
                                value = value.replace(/\./g,"");
                                value = value * 1;
                                if(value==0){
                                    am.msg("次数不能为空或0！");
                                    return;
                                }
                                $this.val(value);
                                var data = $this.parents('li').data('data');
                                var newData = am.clone(data);
                                if($this.parents('li').hasClass('serviceLi')){
                                    newData.itemTimes = value;
                                }else{
                                    newData.amount = value;
                                }
                                $this.parents('li').data('data',newData);
                            }
                        });
                    }
                });
            }else{
                this.$.find('.content').on('keyup keypress','.number',function () {
                    var $this = $(this);
                    var value = $this.val();
                    var data = $this.parents('li').data('data');
                    if(am.metadata.userInfo.operatestr.indexOf("a52") == -1){
                        if($this.parents('li').hasClass('serviceLi')){
                            $this.val(data.itemTimes);
                        }else{
                            $this.val(data.amount);
                        }
                        am.msg('您没有修改次数的权限！');
                    }else{
                        var newData = am.clone(data);
                        value = value.replace(/[^\d.]/g,"");
                        value = value.replace(/^0/g,"");
                        value = value.replace(/\./g,"");
                        value = value?value * 1:"";
                        $this.val(value);
                        if($this.parents('li').hasClass('serviceLi')){
                            newData.itemTimes = value;
                        }else{
                            newData.amount = value;
                        }
                        $this.parents('li').data('data',newData);
                    }
                });
            }
        },
        render:function(data){
            var tpd=[];
            var tdList = data.tdList;
            for(var m=0;m<data.tpd.length;m++){
                if(data.tpd[m].treatType==1 || data.tpd[m].treatType == 2){
                    tpd.push(data.tpd[m]);
                }
            }
            this.$.find('.productWrap').empty();
            this.$.find('.serviceWrap').empty();
            if(tpd&&tpd.length>0){
                this.$.find('.serviceItemGift').show()
                for(var i=0;i<tpd.length;i++){
                    if(tpd[i].timesItemNOs){
                        var itemname = am.page.comboCard.getItemNamesByNos(tpd[i].timesItemNOs).join("，");
                        if(tpd[i].itemTimes==-99){
                            var $li = $('<li class="serviceLi"><span class="name am-clickable">'+ itemname +'</span><div class="unlimit am-clickable">不限次</div><i class="iconfont icon-juxingkaobei am-clickable"></i></li>')
                        }else{
                            var $li = $('<li class="serviceLi"><span class="name am-clickable">'+ itemname +'</span><div class="num"><input type="text" class="number" value="'+ tpd[i].itemTimes +'"></div><i class="iconfont icon-juxingkaobei am-clickable"></i></li>')
                        }
                    }else{
                        if(tpd[i].itemTimes==-99){
                            var $li = $('<li class="serviceLi"><span class="name am-clickable">'+ tpd[i].itemName +'</span><div class="unlimit am-clickable">不限次</div></li>')
                        }else{
                            var $li = $('<li class="serviceLi"><span class="name am-clickable">'+ tpd[i].itemName +'</span><div class="num"><input type="text" class="number" value="'+ tpd[i].itemTimes +'"></div></li>')
                        }
                    }
                    this.$.find('.serviceWrap').append($li);
                    $li.data('data',tpd[i])
                }
            }else{
                this.$.find('.serviceItemGift').hide()
            }
            if(tdList&&tdList.length>0){
                this.$.find('.productItemGift').show()
                for(var i=0;i<tdList.length;i++){
                    var $li = $('<li class="productli"><span class="name am-clickable">'+ tdList[i].name +'</span><div class="num"><input type="text" class="number" value="'+  tdList[i].amount +'"></div></li>')
                    this.$.find('.productWrap').append($li);
                    $li.data('data',tdList[i]);
                }
            }else{
                this.$.find('.productItemGift').hide()
            }
            if (navigator.userAgent.indexOf("Windows") === -1) {
                this.$.find('.content .number').prop('readonly',true).addClass('am-clickable');
            }
        },
        show: function (opt) {
            if (!this.$){
                this.init();
            }
            this.opt = opt;
            this.render(opt&&opt.data);
            this.serviceItemScroll.refresh();
            this.serviceItemScroll.scrollTo('top');
            this.productScroll.refresh();
            this.productScroll.scrollTo('top');
            this.$.show();
            var innerHeight = this.$.find(".inner").outerHeight();
            this.$.find(".inner").css("margin-top",-innerHeight/2);
        }
    };
    var $tempDateTarget;
    var self = am.page.comboCard = new $.am.Page({
        id: "page_comboCard",
        backButtonOnclick: function() {

        },
        init: function() {
            var _this = this;
            this.billItemSelector = new cashierTools.BillItemSelector({
                $: this.$,
                tab: 1,
                filter: 1,
                itemWidth:238,
                typeFilter: 1,
                groupKey: 'COMBOCARD_ITEM_GROUP',
                onSelect: function(data) {
                    return _this.billMain.addItem(data,null,null,'isNewAdd');
                },
                onTouch: function(isVclick) {
					self.billMain.hideMemberInfo(1);
                    //如果底下两个模块升起来了，要降下来~~
                    if(isVclick){
                        self.billMain.rise(1);
                        self.billServerSelector.rise(1);
                    }
                },
                beforeTabChange:function(data){
                    if(data.id){
                        this.itemWidth = 162;
                        this.itemScroll.$wrap.parent().removeClass("wider");
                    }else{
                        this.itemScroll.$wrap.parent().addClass("wider");
                        this.itemWidth = 238;
                    }
                },
                onTouchHold: function(data, $this){
					self.billItemSelector.startGrouping();
				},
				onSize:function(){
                    self.billMain.dispatchSettingSelf();
                }
            });

            this.billMain = new cashierTools.BillMain({
                $: this.$,
                th: [{
                    name: "套餐名称",
					width: "130px",
                }, {
                    name: "价格",
                    width: "120px",
                    className: "center"
                }, {
                    name: "套餐内容",
                }, {
                    name: "销售",
                    width: "100px",
					// className:"center"
                }],
                onSelect: function($item,t) {
                    console.log($item,t)
					self.billServerSelector.reset($item);
                    // self.billServerSelector.rise(0,t);
				},
                onAddItem: function(data, $container,isAutoFill,comboItem,isNewAdded) {
                    if(data.hasStoped || data.hasDeleted){
                        return;
                    }
                    var $tr;
					var data = am.clone(data);

					if(!am.isNull(self.treatDetailList) && self.member){
						data = self.changePrice(data,self.member);
					}
                    if(data.tpd){
                        $tr = $('<tr class="am-clickable show"></tr>');
                        $tr.append('<td><div class="am-clickable delete"></div><span class="server_" style="display:none"></span></td>');
                        $tr.append('<td>' + data.name + '</td>');
	                    var spanClass='';
	                    if(am.operateArr.indexOf("H2")!=-1 && am.metadata.userInfo.operatestr.indexOf("a49") == -1){
		                    spanClass = 'am-disabled';
						}
                        $tr.append('<td class="center"><span class="price oncePerformance totalPrice am-clickable '+spanClass+'">' + ((data.nowPrice === undefined)? data.price : data.nowPrice) + '</span></td>');
    					var tpds = [];
                        // if(data.costMoney){
                        //     tpds.push('<span class="comboCardItem">成本:￥'+data.costMoney+'</span>');
                        // }

                        var oldData = am.clone(data);
    					var manualgift = data.manualgift||0;
                        if(manualgift==1){
                            var newtpd = [];
                            var hasGiftTpd = 0;
                            var index = 0;
                            for(var i=0;i<data.tpd.length;i++){
                                if(data.tpd[i].treatType==0){
                                    newtpd.push(data.tpd[i]);
                                    tpds.push(self.renderComboCardItem(data.tpd[i], index));
                                    index += 1;
                                }else{
                                    hasGiftTpd = 1;
                                }
                            }
                            if(hasGiftTpd==1||data.tdList.length>0){
                                tpds.unshift('<span class="giftItem am-clickable"></span>')
                            }
                            data.tpd = newtpd;
                            data.tdList = [];
                        }else{
                            for(var i=0;i<data.tpd.length;i++){
                                tpds.push(self.renderComboCardItem(data.tpd[i], i));
                            }
                            var tdList=data.tdList;
                            if(tdList&& tdList.length){
                                for(var t=0,tlen=tdList.length;t<tlen;t++){
                                    var tdItem=tdList[t];
                                   var span= '<span class="comboCardItem" style="background:#FFF5DA">赠：'+tdItem.name +'<i class="comboCardItem-times">x'+tdItem.amount+(tdItem.unit||'')+'</i></span>';
                                   tpds.push(span);
                                }
                            }
                        }
                        // for(var i=0;i<data.originTpd.length;i++){
                        //     if(data.originTpd[i].itemId == "-1" && data.originTpd[i].timesItemNOs){
                        //         // var timesItemNOs = data.tpd[i].timesItemNOs.split(",");
                        //         // var itemnames = [];
                        //         // for(var j=0;j<timesItemNOs.length;j++){
                        //         //     var itemdata = am.metadata.serviceCodeMap[timesItemNOs[j]];
                        //         //     if(itemdata){
                        //         //         itemnames.push(itemdata.name);
                        //         //     }
                        //         // }
                        //         // if(itemnames.length>3){
                        //         //     var len = '等'+itemnames.length+'种项目';
	                    //          //    itemnames.splice(3);
	                    //          //    itemnames.push(len);
                        //         // }
                        //         var itemnames = _this.getItemNamesByNos(data.originTpd[i].timesItemNOs);
                        //         tpds.push('<span class="am-clickable comboCardItem" data-index="'+i+'">'+(data.originTpd[i].treatType==1?"赠:":"")+itemnames.join(",")+(data.originTpd[i].itemTimes==-99?"-不限":'x'+data.originTpd[i].itemTimes)+'次'+'</span>');
                        //     }else{
                        //         tpds.push('<span class="am-clickable comboCardItem" data-index="'+i+'">'+(data.originTpd[i].itemName || data.originTpd[i].itemId)+(data.originTpd[i].itemTimes==-99?"-不限":'x'+data.originTpd[i].itemTimes)+'次'+'</span>');
                        //     }
                        // }
                        
                        $tr.append('<td style="font-size:12px;">'+tpds.join("")+'</td>');
                        $tr.append('<td class=""><div class="server am-clickable"></div></td>');
                        $container.eq(0).append($tr.data("data", data)).parent().show();
                        $tr.data("oldData", oldData);
                        if($container.eq(1).is(":empty")){
                            $container.eq(1).parent().hide();
                        }
                    }else{
                        var $children = $container.find("tr").removeClass("selected");
                        for (var i = 0; i < $children.length; i++) {
    						var $etr = $children.eq(i);
    						if($etr.data("data") == data){
    							$etr.trigger("vclick").find(".plus").trigger("vclick");
    							return $etr.addClass("show1");
    						}
    					}
                        $tr = _this.renderTable(data);                            
                        $container.eq(1).append($tr.data("data", data)).parent().show();
                        if ($container.eq(0).is(":empty")) {
                            $container.eq(0).parent().hide();
                        }
                        if(self.$.find(".scanToCost").hasClass("on")){
                            self.$.find(".comboitem .costFlagOpen").show();
                            self.$.find(".comboitem .costFlagClose").hide();
                            $container.find(".productCostTd,.oncePerformanceTd").each(function(){
                                $(this).show();
                            });
                        }else{
                            self.$.find(".comboitem .costFlagOpen").hide();
                            self.$.find(".comboitem .costFlagClose").show();
                            $container.find(".productCostTd,.oncePerformanceTd").each(function(){
                                $(this).hide();
                            });
                        }
                        setTimeout(function () {//动画正在运行  获取的位置不准确 必须异步！！ 
                            am.tips.unlimitComboItem($tr.find(".numberTouch"));
                        }, 500);
                    }
                    return $tr;
                },
                onPriceChange: function($ptr) {
                    var totalPrice = 0,costSum=0,totalproductCost=0;
                    if(!this.$list.find("tr").length){
                        _this.$costEdit.removeClass('modifyed').html(0);
                    }
                    this.$list.find("tr").each(function() {
                        var $tr = $(this);
                        var data = $tr.data("data");
                        var costConfig = JSON.parse(data.costConfig);
                        var costFlag = data.costFlag;
                        var $price = $tr.find(".totalPrice");
                        var $productCost = $tr.find(".productCost");
                        var $oncePerformance = $tr.find(".oncePerformance");
                        var $cost = $tr.find(".cost");//单价
                        if(costFlag && costConfig && data.groupSaleFlag==1){
                            var $num = $tr.find(".numberSelect")
                        }else{
                            var $num = $tr.find("div.number .value")
                        }
                        var num = $num.text()*1 || 0;
                        var money = $price.text()*1 || 0;
                        var onceMoney = $cost.text()*1 || 0;
                        var productCost = $productCost.text()*1 || 0;
                        var oncePerformance = $oncePerformance.text()*1 || 0;
                        var costRatio = 0
                        var sumMoney = Math.round(onceMoney* num*100)/100; //算出来的钱
                        if($ptr && $ptr[0]===this && $price.hasClass("sItemPrice")){
                            //自选项目
	                        if(!$num.parent().parent().hasClass("unlimit")){
	                            //如果不限次，爱怎么卖怎么卖, 限次要检查钱
                                $tr.data("cost",0);
                                if (costFlag && !data.isXCX){
                                    if($cost.hasClass("modifyed")){
                                        $cost.removeClass("modifyed");
                                        $price.text(Math.round(onceMoney*num*100)/100);
                                        money=sumMoney;
                                        if(costConfig){
                                            var hasCostFlag = 0;
                                            $.each(costConfig, function (i, item) {
                                                if (item.times == num) {
                                                    hasCostFlag = 1;
                                                    if(data.fixedRatioFlag == 1){
                                                        costRatio = data.fixedRatio
                                                    }else{
                                                        costRatio = item.costRatio
                                                    }
                                                    $productCost.text(Math.round(costRatio * $price.text())/100)
                                                }
                                            })
                                            if(hasCostFlag==0){
                                                if(data.fixedRatioFlag == 1){
                                                    costRatio = data.fixedRatio
                                                }else{
                                                    costRatio = false;
                                                }
                                                if(costRatio==false){
                                                    if($price.text()-$productCost.text()<0){
                                                        am.msg("总价小于产品成本，产品成本自动置为0！")
                                                        $productCost.text(0);
                                                    }
                                                }else{
                                                    $productCost.text(Math.round(costRatio * $price.text())/100)
                                                }
                                            }
                                            $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100)
                                        }
                                    }else if($price.hasClass("modifyed")) {
                                        $price.removeClass("modifyed");
                                        $cost.text(Math.round((money/num)*1000)/1000);
                                        if(costConfig){
                                            var hasCostFlag = 0;
                                            $.each(costConfig, function (i, item) {
                                                if (item.times == num) {
                                                    hasCostFlag = 1;
                                                    if(data.fixedRatioFlag == 1){
                                                        costRatio = data.fixedRatio
                                                    }else{
                                                        costRatio = item.costRatio
                                                    }
                                                    $productCost.text(Math.round(costRatio * $price.text())/100)
                                                }
                                            })
                                            if(hasCostFlag==0){
                                                if(data.fixedRatioFlag == 1){
                                                    costRatio = data.fixedRatio
                                                }else{
                                                    costRatio = false;
                                                }
                                                if(costRatio==false){
                                                    if($price.text()-$productCost.text()<0){
                                                        am.msg("总价小于产品成本，产品成本自动置为0！")
                                                        $productCost.text(0);
                                                    }
                                                }else{
                                                    $productCost.text(Math.round(costRatio * $price.text())/100)
                                                }
                                            }
                                            $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100)
                                        }
                                    }else if($productCost.hasClass("modifyed")) {
                                        $productCost.removeClass("modifyed");
                                        $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100)
                                    }else if($oncePerformance.hasClass("modifyed")) {
                                        $oncePerformance.removeClass("modifyed");
                                        var productMoney = Math.round(($price.text()-$oncePerformance.text()*num)*100)/100;
                                        if(productMoney<0){
                                            $productCost.text(0);
                                        }else{
                                            $productCost.text(productMoney);
                                        }
                                    }else{
                                        //没改过，用算出来的钱自动填进去
                                        if(data.fixedRatioFlag == 1){
                                            costRatio = data.fixedRatio
                                        }else{
                                            costRatio = money==0?0:productCost/money*100;
                                        }
                                        money=sumMoney;
                                        $price.text(sumMoney);
                                        $productCost.text(Math.round(money*costRatio)/100);
                                        $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100);
                                        if ($cost.data("flag") == 1 && !$tr.find('.gift').hasClass('checked')) {
                                            $cost.text(data.price||0);
                                            money = $cost.text()*num;
                                            $price.text(money);
                                            $productCost.text(Math.round(money*costRatio)/100);
                                            $oncePerformance.text($cost.text());
                                            $cost.data("flag",0)
                                        }
                                        if(costConfig && !$tr.find('.gift').hasClass('checked')){
                                            $.each(costConfig, function (i, item) {
                                                if (item.times == num) {
                                                    $price.text(item.totalPrice);
                                                    $cost.text(Math.round(item.totalPrice / num*1000)/1000);
                                                    $cost.data("flag",1)
                                                    if(data.fixedRatioFlag == 1){
                                                        costRatio = data.fixedRatio
                                                    }else{
                                                        costRatio = item.costRatio
                                                    }
                                                    $productCost.text(Math.round(costRatio * $price.text())/100);
                                                    $oncePerformance.text(Math.round((($price.text()-costRatio * $price.text()/100))/num*100)/100);
                                                    money = Number(item.totalPrice);
                                                    return false;
                                                }
                                            })
                                        }
                                    }
                                }else{
                                    if($cost.hasClass("modifyed")){
                                        $cost.removeClass("modifyed");
                                        $price.text(Math.round(onceMoney*num*100)/100);
                                        money=sumMoney;
                                        if($price.text()-$productCost.text()<0){
                                            am.msg("总价小于产品成本，产品成本自动置为0！")
                                            $productCost.text(0);
                                        }
                                        $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100);
                                    }else if($price.hasClass("modifyed")) {
                                        $price.removeClass("modifyed");
                                        $cost.text(Math.round((money/num)*1000)/1000);
                                        if($price.text()-$productCost.text()<0){
                                            am.msg("总价小于产品成本，产品成本自动置为0！")
                                            $productCost.text(0);
                                        }
                                        $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100);
                                    }else if($productCost.hasClass("modifyed")) {
                                        $productCost.removeClass("modifyed");
                                        $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100);
                                    }else if($oncePerformance.hasClass("modifyed")) {
                                        $oncePerformance.removeClass("modifyed");
                                        var productMoney = Math.round(($price.text()-$oncePerformance.text()*num)*100)/100;
                                        if(productMoney<0){
                                            $productCost.text(0);
                                        }else{
                                            $productCost.text(productMoney);
                                        }
                                    }else{
                                        //没改过，用算出来的钱自动填进去
                                        costRatio = money==0?0:productCost/money*100;
                                        money=sumMoney;
                                        $price.text(sumMoney);
                                        $productCost.text(Math.round(money*costRatio)/100);
                                        $oncePerformance.text(Math.round(($price.text()-$productCost.text())/num*100)/100);
                                    }
                                }
		                        
                            }else{
                                $cost.text(0)
                                $tr.data("cost",0);
                                if(costFlag && !data.isXCX && costConfig && !$tr.find('.gift').hasClass('checked')){
                                    var hasCostFlag = 0;
                                    $.each(costConfig, function (i, item) {
                                        if (item.times == -99) {
                                            hasCostFlag = 1;
                                            if(data.fixedRatioFlag == 1){
                                                costRatio = data.fixedRatio
                                            }else{
                                                costRatio = item.costRatio
                                            }
                                            if($cost.hasClass("modifyed")){
                                                $cost.removeClass("modifyed");
                                            }else if($price.hasClass("modifyed")) {
                                                $price.removeClass("modifyed");
                                                $productCost.text(Math.round(costRatio * $price.text())/100)
                                                $oncePerformance.text(data.price||0)
                                            }else if($productCost.hasClass("modifyed")) {
                                                $productCost.removeClass("modifyed");
                                                $oncePerformance.text(data.price||0)
                                            }else if($oncePerformance.hasClass("modifyed")) {
                                                $oncePerformance.removeClass("modifyed");
                                            }else{
                                                //没改过，用算出来的钱自动填进去
                                                $price.text(item.totalPrice);
                                                money = Number(item.totalPrice);
                                                $productCost.text(Math.round(costRatio * $price.text())/100)
                                                $oncePerformance.text(data.price||0)
                                            }
                                        }
                                    })
                                    if(hasCostFlag==0){
                                        if(data.fixedRatioFlag == 1){
                                            costRatio = data.fixedRatio
                                        }else{
                                            costRatio = false;
                                        }
                                        if($cost.hasClass("modifyed")){
                                            $cost.removeClass("modifyed");
                                        }else if($price.hasClass("modifyed")) {
                                            $price.removeClass("modifyed");
                                            if(costRatio==false){
                                                if($price.text()-$productCost.text()<0){
                                                    am.msg("总价小于产品成本，产品成本自动置为0！")
                                                    $productCost.text(0);
                                                }
                                            }else{
                                                $productCost.text(Math.round(costRatio * $price.text())/100)
                                            }
                                        }else if($productCost.hasClass("modifyed")) {
                                            $productCost.removeClass("modifyed");
                                        }else if($oncePerformance.hasClass("modifyed")) {
                                            $oncePerformance.removeClass("modifyed");
                                        }else{
                                            //没改过，用算出来的钱自动填进去
                                            $productCost.text(Math.round(costRatio * $price.text())/100)
                                            $oncePerformance.text(data.price||0)
                                        }
                                    }
                                }else if(!costFlag && !data.isXCX && !$tr.find('.gift').hasClass('checked')){
                                    if($cost.hasClass("modifyed")){
                                        $cost.removeClass("modifyed");
                                    }else if($price.hasClass("modifyed")) {
                                        $price.removeClass("modifyed");
                                        if(money < $productCost.text()){
                                            am.msg("总价小于产品成本，产品成本自动置为0！")
                                            $productCost.text(0);
                                        }
                                    }else if($productCost.hasClass("modifyed")) {
                                        $productCost.removeClass("modifyed");
                                    }else if($oncePerformance.hasClass("modifyed")) {
                                        $oncePerformance.removeClass("modifyed");
                                    }else{
                                        //没改过，用算出来的钱自动填进去
                                        $productCost.text(0)
                                        $oncePerformance.text(data.price||0)
                                    }
                                }
                            }
                        }
                        totalPrice += money;
                        if($tr.parents("table").hasClass("comboitem")){
                            totalproductCost += ($productCost.text()*1||0);
                        }else{
                            var itemCost = 0;
                            if(data.price==0){
                                itemCost = 0;
                            }else{
                                $.each(data.tpd,function(i,item){
                                    itemCost +=  Math.round(money * (item.itemMoney / data.price) * item.costRatio)/100;
                                })
                            }
                            $tr.data('itemCost',itemCost)
                            totalproductCost += itemCost
                        }
                        if(data && data.costMoney){
							if(self.member){
								if(data.nowCostMoney === undefined){
									costSum+=(data.costMoney*1||0);
								}else{
									costSum+=(data.nowCostMoney*1||0);
								}
							}else{
								costSum+=(data.costMoney*1||0);
							}
							// totalPrice+=(data.costMoney*1||0);
                        }else if($tr.data("cost")){
	                        costSum+=$tr.data("cost");
                        }
                    });
                    if(_this.$costEdit.hasClass('modifyed')){
                        costSum = _this.$costEdit.text()*1 || 0;
                    }
                    //this.$.find('span.costMoney').text();
                    var txt = '<span style="font-size: 14px">总计：</span>￥';
                    if(costSum||totalproductCost){
                        txt = '总计:￥';
                        if(totalPrice - 0){
                            txt = '<span style="font-size: 14px;color:#555;padding-right:10px;">服务费:￥'+toFloat(totalPrice-totalproductCost)+'</span>总计:￥';
                        }
                        // txt= '<span style="font-size: 14px;color:#555;padding-right:10px;">套餐金额:￥'+toFloat(totalPrice)+'</span>总计:￥';
                    }
                    _this.$costEdit.text(costSum)
                    this.totalPrice = toFloat(totalPrice);
                    this.$totalPrice.html(txt+toFloat(totalPrice+costSum));
                },
                settingKey: "setting_seller",
                defaultSetting: null,
                dispatchSetting: function(settings) {
                    _this.billServerSelector.dispatchSetting(settings,0,1);//bill头 工位  是否销售
                },
                onSubmit: function() {
                    var $tr = this.$list.find("tr");
                    var hasComboitem = 0;
                    for(var i = 0; i < $tr.length; i++){
                        if($tr.eq(i).parents("table").hasClass("comboitem")){
                            hasComboitem = 1;
                            break;
                        }
                    }
                    if(self.settlementPayDetail != undefined){
                        // 自助结算流程
                        _this.submit();
                    } else {
                        if (hasComboitem == 1 && amGloble.operateArr.indexOf('a50') == -1) {
                            if (amGloble.metadata.userInfo.mgjVersion == 1) {
                                return;
                            }
                            if (!amGloble.metadata.shopPropertyField.authorizationCard) {
                                am.msg('没有权限操作或没有设置授权卡');
                                return;
                            }
                            am.auth.show({
                                anthSuccess: function () {
                                    _this.submit();
                                }
                            });
                        } else {
                            _this.submit();
                        }
                    }
                },
                changekbtab:true
            });
            this.billMain.$list.on("vclick",".checkbox",function(){
                var $this = $(this);
                var $tr = $this.parent().parent();
                var $price = $tr.find('span.price');
                if($this.hasClass('checked')){
                    $this.removeClass('checked');
	                $price.each(function () {
		                $(this).removeClass('am-disabled').text($(this).data("oPrice"));
	                });
                }else{
                    $this.addClass('checked');
                    $price.each(function () {
	                    $(this).data('oPrice',$(this).text()).addClass('am-disabled').text(0);
                    });
                }
                self.billMain.onPriceChange($tr);
            }).on("vclick", '.comboCardItem', function() {
                var $this = $(this);
                var $parentTd = $this.parent()
                var $parentTr = $parentTd.parent();
                var index = parseInt($(this).attr('data-index'));
                var itemData = $parentTr.data('data');
                var tpd = itemData.tpd;
                var currentTpd = tpd[index];
                if (currentTpd.timesItemNOs) {
                    var timesItemNOList = currentTpd.timesItemNOs.split(',');
                    if (currentTpd.itemId == -1 && timesItemNOList.length > 1) {
                        self.initComboCardItemSelector();
                        self.ComboCardItemSelectorMaxCount = currentTpd.itemTimes;
                        self.ComboCardItemSelectorCallBack = function(newTpd) {
                            tpd.splice(index, 1);
                            $.each(newTpd, function(cIndex, item) {
                                tpd.splice(index, 0, item);
                                index ++;
                            });
                            var newTpdElList = [];
                            for(var i = 0; i < tpd.length; i ++){
                                newTpdElList.push(self.renderComboCardItem(tpd[i], i));
                            }
                            itemData.tpd = tpd;

                            // 卖品
                            var tdList = itemData.tdList;
                            if(tdList && tdList.length){
                                for(var t = 0,tlen = tdList.length;t<tlen;t++){
                                    var tdItem = tdList[t];
                                    var span = '<span class="comboCardItem" style="background:#FFF5DA">赠：'+tdItem.name +'<i class="comboCardItem-times">x'+tdItem.amount+(tdItem.unit||'')+'</i></span>';
                                    newTpdElList.push(span);
                                }
                            }
                            if($parentTd.find('.giftItem').length>0){
                                newTpdElList.unshift('<span class="giftItem am-clickable"></span>')
                            }
                            $parentTd.html(newTpdElList.join(''));
                            $parentTr.data('data', itemData);
                            self.comboCardItemSelector.hide();
                        }
                        var dialogTitleEl = self.comboCardItemSelector.find('.title'),
                            dialogContentEl = self.comboCardItemSelector.find('.scrollInner');
                        var itemTimesLabel = currentTpd.itemTimes == -99 ? '不限' : currentTpd.itemTimes + '次';
                        dialogTitleEl.find('h4 > span').remove();
                        if(am.metadata.userInfo.operatestr.indexOf("a52") != -1 && currentTpd.treatType == 1){
                            dialogTitleEl.find('h4').append('<span>(无次数限制)</span>');
                        }else{
                            dialogTitleEl.find('h4').append('<span>('+itemTimesLabel+')</span>');
                        }
						dialogContentEl.html('');
						
						if (currentTpd.itemTimes == -99) {
							self.comboCardItemSelector.find('.save').addClass('unlimited');
						} else {
							self.comboCardItemSelector.find('.save').removeClass('unlimited');
						}

                        var tpdTamplate = am.clone(currentTpd);
                        $.each(timesItemNOList, function(index, item) {
                            var paramObj={
                                showStopedItem:1,
                                showFixedStopName:1,
                                onlyShowValidName:0
                            }
                            // var currentName = self.getItemNamesByNos(item,'',1,1)[0];
                            var currentName = self.getItemNamesByNos(item,'',paramObj)[0];
                            tpdTamplate.itemName = currentName;
                            tpdTamplate.timesItemNOs = null;
                            tpdTamplate.itemId = item;
                            tpdTamplate.itemTimes = currentTpd.itemTimes == -99 ? -99 : 0;
                            var itemEl = $(self.renderComboCardSelectorItem(tpdTamplate)).data('data', am.clone(tpdTamplate));
                            dialogContentEl.append(itemEl);
                        });

                        self.comboCardItemSelector.show();

                        if(self.comboCardItemSelectorScroll){
                            self.comboCardItemSelectorScroll.refresh();
                            self.comboCardItemSelectorScroll.scrollTo('top');
                        }else {
                            self.comboCardItemSelectorScroll = new $.am.ScrollView({
                                $wrap : self.comboCardItemSelector.find('.content'),
                                $inner :  self.comboCardItemSelector.find('.scrollInner'),
                                direction : [false, true],
                                hasInput: false
                            });
                        }

                        // atMobile.nativeUIWidget.showPopupMenu(
                        //     {
                        //         title: '请选择项目',
                        //         items: itemsText,
                        //     },
                        //     function(idx) {
                        //         itemData.tpd[index].itemId = timesItemNOList[idx];
                        //         itemData.tpd[index].timesItemNOs = null;
                        //         itemData.tpd[index].itemName = itemsText[idx];
                        //         var newItemHtml = self.renderComboCardItem(itemData.tpd[index], index, true);
                        //         var mainHtml = $(newItemHtml).html();
                        //         $this.html(mainHtml);
                        //         $parentTr.data('data', itemData);
                        //     }
                        // )
                    }
                }
            }).on("vclick",".date",function(){
                self.showCalendar($(this));
                return false;
            }).on("vclick",".giftItem",function(){
                var $parentTd = $(this).parent()
                var $parentTr = $parentTd.parent();
                var oldData = $(this).parents('tr').data('oldData');
                var data = $(this).parents('tr').data('data');
                var tpd=[],tdList;
                giftSelect.show({
                    data:oldData,
                    itemSave:function(opt){
                        for(var i=0;i<data.tpd.length;i++){
                            tpd.push(data.tpd[i]);
                        }
                        for(var i=0;i<opt.serviceItem.length;i++){
                            tpd.push(opt.serviceItem[i]);
                        }
                        tdList = opt.productItem;
                        var newTpdElList = [];
                        for(var i = 0; i < tpd.length; i ++){
                            newTpdElList.push(self.renderComboCardItem(tpd[i], i));
                        }
                        oldData.tpd = tpd;
                        oldData.tdList = tdList;
                        if(tdList && tdList.length){
                            for(var t = 0,tlen = tdList.length;t<tlen;t++){
                                var tdItem = tdList[t];
                                var span = '<span class="comboCardItem" style="background:#FFF5DA">赠：'+tdItem.name +'<i class="comboCardItem-times">x'+tdItem.amount+(tdItem.unit||'')+'</i></span>';
                                newTpdElList.push(span);
                            }
                        }

                        $parentTd.html(newTpdElList.join(''));
                        $parentTr.removeClass('warn');
                        $parentTr.data('data', oldData);
                    }
                })
            }).on("vclick",".comboItemSetting",function(){
	            var $this = $(this);
	            var $tr = $this.parent().parent();
                var data = $tr.data("data");
                var mutiItem = $tr.data('mutiItem');
                console.log(data);
	            am.comboItemSet.show({
                    ids:mutiItem?mutiItem.ids:[data.itemid]
                },function (ret) {
                    console.log(ret);
                    var mutiItem={
                        ids:[],
	                    names:[]
                    };
                    for(var i=0;i<ret.length;i++){
	                    mutiItem.ids.push(ret[i].itemid);
	                    mutiItem.names.push(ret[i].name);
                    }
		            $tr.data('mutiItem',mutiItem);
                    $tr.find("span.comboSelectItemNames").text(mutiItem.names.join(","));
	            });
	            return false;
            }).on("vtouchstart",".numberTouch",function (a,b) {
                _this.touchStart = b;
	            _this.touchPos = _this.touchPos ||0;
	            _this.$numberScroller = $(this).find('.numberScroller');
	            _this.touchPos  = _this.$numberScroller.hasClass("unlimit")?0:-27;
	            _this.$numberScroller.removeClass('transition');
	            return false;
            }).on("vtouchmove",".numberTouch",function (a,b) {
	            var h = b.y-_this.touchStart.y + _this.touchPos;
	            if(h<-32){
		            h = -37;
                }else if(h>5){
	                h=10;
                }
	            _this.$numberScroller.setTransformPos(h,"y");
	            return false;
            }).on("vtouchend",".numberTouch",function (a,b) {
	            var h = b.y-_this.touchStart.y + _this.touchPos;
	            var changed = 1;
	            if(h<-37){
		            h = -27;
	            }else if(h>10){
		            h = 0;
	            }else{
	                if(_this.$numberScroller.hasClass("unlimit")){
		                h=-27;
                    }else{
		                h=0;
                    }
		            changed = 0;
                }

	            if(h<0){
		            _this.$numberScroller.addClass('unlimit');
                }else{
		            _this.$numberScroller.removeClass('unlimit');
                }
                _this.$numberScroller.addClass('transition').setTransformPos(h,"y");
                var $price = _this.$numberScroller.parents('tr').find('span.price');
                if(_this.$numberScroller.hasClass('unlimit')){
                    if(!_this.$numberScroller.parents('tr').find('.gift').hasClass('checked')){
                        $price.each(function () {
                            $(this).data('oldPrice',$(this).text());
                        });
                    }
                    changed && self.billMain.onPriceChange($(this).parent());
                }else{
                    if(!_this.$numberScroller.parents('tr').find('.gift').hasClass('checked')){
                        $price.each(function () {
                            $(this).text($(this).data("oldPrice"));
                        });
                    }
                    changed && self.billMain.onPriceChange($(this).parent());
                    // var data = _this.$numberScroller.parents('tr').data('data')
                    // if(_this.$numberScroller.parents('tr').find('.gift').hasClass('checked')){
                    //     changed && self.billMain.onPriceChange($(this).parent());
                    // }else{
                    //     var $newTr = _this.renderTable(data);
                    //     changed && _this.$numberScroller.parents('tr').html($newTr.html()) && self.billMain.onPriceChange($newTr);
                    //     if(self.$.find(".scanToCost").hasClass("on")){
                    //         $newTr.find(".productCostTd,.oncePerformanceTd").each(function(){
                    //             $(this).show();
                    //         });
                    //     }else{
                    //         $newTr.find(".productCostTd,.oncePerformanceTd").each(function(){
                    //             $(this).hide();
                    //         });
                    //     }
                    // }
                }
	            return false;
            });

            this.billMain.$.find('.memberInfoBtn').vclick(function() {
                $.am.changePage(am.page.memberDetails, "slideup",{
                    "customerId":self.member.id,
                    "cardId":self.member.cid,
                    "shopId":self.member.shopId,
                    "tabId":1
                });
            });
            this.$member = this.billMain.$.find(".member").vclick(function() {
                if(self.member){
                    self.billMain.showMemberInfo(self.member);
                }else{
                    $.am.changePage(am.page.searchMember, "slideup",{
                        onSelect:function(item){
                            $.am.changePage(self, "slidedown",{
                               member:item
                           });
                        }
                    });
                }
            });

            this.billMain.$.find(".selectMember").vclick(function() {
                $.am.changePage(am.page.searchMember, "slideup", {
                    onSelect: function(item) {
                        $.am.changePage(self, "slidedown", {
                            member: item
						});
                    },
                    notNeedWaiting: 1
                });
            });

            this.billServerSelector = new cashierTools.BillServerSelector({
                $: this.$,
                onSelect: function(data) {
                    // 选择员工
					var _this = this;
					setTimeout(function () {
						var emps = _this.getEmps();
						self.billMain.setEmps(emps,null,"isSeller");// 员工 卖品行 是否销售
					}, 50);
					return false;
                    // self.selectedServer = data;
	                // if(this.$body.find('li.selected').length>0){
		            //     am.tips.perfSetting(self.billServerSelector.$.find('li[serverid='+data.id+']'));
	                // }
                },
                onRemove: function(){// 删除员工
					var _this = this;
					setTimeout(function () {
						var emps = _this.getEmps();
						self.billMain.setEmps(emps,null,"isSeller");// 员工 卖品行 是否销售
					}, 50);
					return false;
                    self.selectedServer = null;
                },
                muti:true,
                // notSharedPerformance:amGloble.metadata.shopPropertyField.notSharedPerformance || 0,// 0/undefined  原来的  1 独享100%，2共享100%
	            getTotalPerf:function () {
                    // 获取总业绩 待增加成本
                    var total = -1,
                        $selectedTr = self.billMain.$.find('tr.selected');
                    if ($selectedTr && $selectedTr.length == 1) {
                        if (am.metadata.configs.combNotCalIntoAchiev == 'true') {
                            // 成本不算业绩
                            total = $selectedTr.find('.totalPrice').text().trim() * 1;
                        } else {
                            // 成本算业绩
                            var opt = self.submit('onlyGetPrice');
                            var treatments = opt.comboCard.treatments;
                            var currentItem = $selectedTr.data('data');
                            var currentData = {};
                            for (var i = 0, len = treatments.length; i < len; i++) {
                                if (treatments[i].packageId != -1 && treatments[i].packageId == currentItem.id) {
                                    // 套餐包
                                    currentData = treatments[i];
                                    break;
                                } else if (treatments[i].packageId == -1) {
                                    // 单个项目
                                    var serviceItems = treatments[i].serviceItems;
                                    var finded = 0;
                                    for (var j = 0, length = serviceItems.length; j < length; j++) {
                                        if (serviceItems[j].itemId == currentItem.itemid) {
                                            currentData = serviceItems[j];
                                            finded++;
                                            break;
                                        }
                                    }
                                    if (finded) {
                                        break;
                                    }
                                }
                            }
                            if (currentData.serviceItems) {
                                // 套餐包
                                total = currentData.price + currentData.treatsCost;
                            } else {
                                // 单个项目
                                total = currentData.allPrice;
                            }
                        }
                    }
                    return total;

                    // return self.billMain.$.find('tr.selected') && self.billMain.$.find('tr.selected').find('.totalPrice').text().trim()*1;
					// // return -1;
                    // if(am.metadata.configs.combNotCalIntoAchiev=='true'){
                    //     return self.billMain.totalPrice;
                    // }else {
                    //     return toFloat(self.billMain.totalPrice + self.$costEdit.text()*1);
                    // }
                },
                onSetEmpPer: function(emp, per,perf,gain) {
					// 拖动或者手动计算业绩的回调
					var $server = self.billMain.$list.find("tr.selected .server");//销售dom
					var $service = self.billMain.$list.find("tr.selected");// 卖品dom
					var data = $server.data("data");// 卖品员工
					var serviceData = $service.data('data');// 卖品信息
					if (serviceData) {
						serviceData.manual = 1;
					}
					if (data) {
						setTimeout(function () {
							for (var i = 0; i < data.length; i++) {
								if (data[i] && data[i].empId === emp.id) {
									data[i].per = per;
									data[i].perf = perf;
									data[i].gain = gain;
									break;
								}
							}
						}, 51);
					}
					// return;
                    // var $server = self.billMain.$list.find("tr.selected .server").eq(emp.pos);
                    // var data = $server.data("data");
                    // if (data) {
                    //     setTimeout(function() {
                    //         for (var i = 0; i < data.length; i++) {
                    //             if (data[i] && data[i].empId === emp.id) {
                    //                 data[i].per = per;
                    //                 data[i].perf = perf;
                    //                 data[i].gain = gain;
                    //                 break;
                    //             }
                    //         }
                    //     }, 51);
                    // }
                },
            });

            this.$costEdit = this.$.find('.cost-edit').vclick(function(){
                var _this = $(this);
                am.keyboard.show({
                    title:"请输入数字",//可不传
                    hidedot:false,
                    submit:function(value){
                        _this.html(value).addClass('modifyed');
                        self.billMain.onPriceChange();
                    }
                });
            });
            this.$videoHelpWrap=this.$.find('.videoHelpWrap').on('vclick',function(){
                console.log('视频帮助28');
                am.getVideoHelp(this,"28");
			});
        },
        renderTable: function(data){
            var oncePrice = ((data.nowPrice === undefined)? (data.price||0) : data.nowPrice);
            var times = data.feedNum || 1;
            var totalPrice = Math.round(oncePrice * times * 100)/100;
            var productCost = 0;
            if(data.isXCX){
                productCost = data.productCost;
            }
            var oncePerformance = Math.round((totalPrice - productCost) / times*100)/100;
            var costFlag = data.costFlag;
            var costConfig = JSON.parse(data.costConfig);
            if (costFlag && !data.isXCX){
                if(costConfig){
                    if(data.groupSaleFlag==1){
                        $.each(costConfig, function (i, item) {
                            totalPrice = item.totalPrice;
                            times = item.times;
                            oncePrice = Math.round(totalPrice / times*100)/100;
                            if(data.fixedRatioFlag == 1){
                                costRatio = data.fixedRatio
                            }else{
                                costRatio = item.costRatio
                            }
                            productCost = Math.round(totalPrice * (costRatio/100)*100)/100;
                            oncePerformance = Math.round((totalPrice - productCost) / times *100)/100;
                            return false;
                        })
                    }else{
                        $.each(costConfig, function (i, item) {
                            if (item.times == 1) {
                                totalPrice = item.totalPrice;
                                times = item.times;
                                oncePrice = Math.round(totalPrice / times*100)/100;
                                if(data.fixedRatioFlag == 1){
                                    costRatio = data.fixedRatio
                                }else{
                                    costRatio = item.costRatio
                                }
                                productCost = Math.round(totalPrice * (costRatio/100)*100)/100;
                                oncePerformance = Math.round((totalPrice - productCost) / times *100)/100;
                                return false;
                            }
                        })
                    }
                }
            }
            var ts = am.now();
            if(data.isXCX){
                if(data.days*1){
                    ts.setDate(ts.getDate()+data.days*1)
                }else if(data.validDate){
                    ts = new Date(data.validDate.replace('-','/').replace('-','/'));
                }else {
					ts = false;
                    // ts.setFullYear(ts.getFullYear()+1);
                }
            }else {
                ts.setFullYear(ts.getFullYear()+1);
            }
            if(costFlag && costConfig && data.groupSaleFlag == 1){
                var timestr = '<td class="center"><div><div><div><span class="numberSelect am-clickable">'+ times +'</span></div></div></div></td>';
            }else{
                if(times==1){
                    var timestr = '<td class="center numberTouch am-touchable"><div class="numberWrap"><div class="numberScroller"><div class="number"><span class="reduce am-clickable am-disabled"></span><span class="value am-clickable">'+times+'</span><span class="plus am-clickable"></span></div><div class="unlimitText">不限次</div></div></div></td>'
                }else{
                    var timestr = '<td class="center numberTouch am-touchable"><div class="numberWrap"><div class="numberScroller"><div class="number"><span class="reduce am-clickable"></span><span class="value am-clickable">'+times+'</span><span class="plus am-clickable"></span></div><div class="unlimitText">不限次</div></div></div></td>'
                }
            }
            $tr = $('<tr class="am-clickable show">'+
            '<td><div class="am-clickable delete"></div><span class="server_" style="display:none"></span></td>'+
            '<td><span class="comboSelectItemNames">' + data.name + '</span><span class="comboItemSetting am-clickable">设置</span></td>'+
            '<td class="center"><span class="cost price changed am-clickable noDiscount">' + oncePrice + '</span></td>'+
            timestr+
            '<td class="center"><span class="sItemPrice price changed totalPrice am-clickable noDiscount">' + totalPrice + '</span></td>'+
            '<td class="center productCostTd"><span class="sItemPrice productCost price changed am-clickable noDiscount">' + productCost + '</span></td>'+
            '<td class="center oncePerformanceTd"><span class="sItemPrice oncePerformance price changed am-clickable noDiscount">' + oncePerformance + '</span></td>'+
            '<td class="center"><div class="number date am-clickable">'+ (ts ? ts.format('yyyy/mm/dd') : '不限期') + '</div></td>'+
            '<td class="center"><span class="gift checkbox am-clickable">赠送</span></td>'+
            '<td class=""><div class="server am-clickable"></div></td></tr>'
            );
            return $tr;
        },
		renderItemTr: function () {
			var self = this;
			this.billMain.$list.find("tr").each(function (i,v) {
				var data = $(this).data('data');
				if(!data) return false;
                var $price = $(this).find("span.price");
                var $send = $(this).find(".checkbox");
				if ($price.hasClass("modifyed") || $send.hasClass("checked") || $price.hasClass("changed") || data.isXCX) {
                    //如果手改过价格，不算折扣  //赠送不算
                    return true;
				} else {
					//如果没有手改过价格，算折扣
					if(self.member){
						data = self.changePrice(data,self.member);
						$price.text(data && data.nowPrice === undefined ? data.price : data && data.nowPrice);
					}else{
						$price.text(data.price || 0);
                    }
                    self.billMain.onPriceChange($(this));
				}
				
			});
			self.billMain.onPriceChange();
		},
		changePrice: function(data,member){
			var id = data.id;
			if(am.isNull(self.treatDetailList)){
				//重置
				data.nowCostMoney = undefined;
				data.nowPrice = undefined;
				return data;
			}
			$.each(self.treatDetailList.cardUpgRuleDtoList,function(i,v){
				if(v.treatPackageId == id){
					var ruleModelList0 = v.ruleModelList[0];
					if(member.cardTypeId == ruleModelList0.cardTypeId){
						data = getRule(ruleModelList0,data);
					}
					return false;
				}else{
					data.nowCostMoney = undefined;
					data.nowPrice = undefined;
				}
			});

			function getRule(ruleModelList,data){
				var ruleType = ruleModelList.ruleType;
				var rate = ruleModelList.rate;
				//折扣
				if(ruleType == 1){
					data.nowPrice = data.price * (rate == "0" ? 10 : rate) * 0.1;
					data.nowCostMoney = data.costMoney * (rate == "0" ? 10 : rate) * 0.1;
					data.nowCostMoney = toFloat(data.nowCostMoney);
					data.nowPrice = toFloat(data.nowPrice);
				}
				//价格
				else if(ruleType == 2){
					var total = ((data.price-0) + (data.costMoney-0))*1;
					var costMoneyRate = data.costMoney/total;
					var priceRate = data.price/total;
					data.nowCostMoney = toFloat(rate * costMoneyRate);
					data.nowPrice = toFloat(rate * priceRate);
				}else{
					data.nowCostMoney = undefined;
					data.nowPrice = undefined;
				}
				return data;
			}

			return data;
		},
		treatDetailList:[],
        getTreatDetail: function(member){
			if(am.isNull(member)) return;
            var self = this;
			am.api.treatDetail.exec({
				parentShopId: am.metadata.userInfo.parentShopId,
                cardtypeid: member.cardTypeId,
                shopId: member.cardshopId
            },function(ret){
                console.log(ret);
                if(ret.code==0){
					self.treatDetailList = ret.content;
					self.renderItemTr();
                }else {
					console.log("获取规则失败");
                }
            });
        },
        getItemNamesByNos:function (timesItemNOs,l,paramObj) {
            // timesItemNOs 项目no
            // l  要显示几个项目名称 默认3个
            // showStopedItem 1 显示停用项目名称 ，不传或false 则不显示
            // showFixedStopName 停用项目 显示为 项目已停用
            // onlyShowValidName 仅显示有效项目名称
            var showStopedItem=0,showFixedStopName=0,onlyShowValidName=0;
            if(paramObj){
                showStopedItem=paramObj.showStopedItem;
                showFixedStopName=paramObj.showFixedStopName;
                onlyShowValidName=paramObj.onlyShowValidName;
            }
	        timesItemNOs = timesItemNOs.split(",");
	        l = l || 3;
            var itemNames = [];
            // var name='';
            var delCount=0;
	        for(var j=0;j<timesItemNOs.length;j++){
                var itemData = am.metadata.serviceCodeMap[timesItemNOs[j]];
                var name='';
                if(!onlyShowValidName){
                    if(showStopedItem && !itemData){
                        // 显示停用项目名称
                        itemData = am.metadata.stopServiceCodeMap[timesItemNOs[j]];
                    }
                    if(!itemData){
                        name='项目已删除';
                        delCount++
                    }
                    if(itemData){
                        itemNames.push(itemData.name);
                    }else{
                        itemNames.push(name);
                    }
                }else{
                    if(itemData){
                        itemNames.push(itemData.name);
                    }
                }
                // if(showStopedItem && !itemData){
                //     // 显示停用项目名称
                //     itemData = am.metadata.stopServiceCodeMap[timesItemNOs[j]];
                //     if(itemData && showFixedStopName){
                //         name='项目已停用';
                //     }
                // }
                // if(!itemData){
                //     // 项目已删除
                //     name='项目已删除'
                // }
		        // if(itemData){
			    //     itemNames.push((name || itemData.name));
		        // }else{
                //     itemNames.push((name || itemData.name));
                // }
	        }
	        if(itemNames.length>l){
		        var len = '等'+(itemNames.length-delCount)+'种项目';
		        itemNames.splice(l);
		        itemNames.push(len);
	        }
	        return itemNames;
        },
        beforeShow: function(paras) {
            this.settlementPayDetail = null;
			this.settlementServer = null;
            var _this = this;
            var scanToCostFlag = localStorage.getItem("scanToCostFlag");
            if (scanToCostFlag==1) {
                this.$.find(".scanToCost").addClass("on");
                this.$.find(".comboitem .costFlagOpen").show();
                this.$.find(".comboitem .costFlagClose").hide();
                this.$.find(".productCostTd,.oncePerformanceTd").each(function () {
                    $(this).show();
                });
            }else{
                this.$.find(".scanToCost").removeClass("on");
                this.$.find(".comboitem .costFlagOpen").hide();
                this.$.find(".comboitem .costFlagClose").show();
                this.$.find(".productCostTd,.oncePerformanceTd").each(function () {
                    $(this).hide();
                });
            }
            if(paras && paras.afterRecharge && this.member){
				var afterRecharge = paras.afterRecharge;
				if(afterRecharge.memId){
					//自动升级
					am.searchMember.getMemberById(afterRecharge.memId,afterRecharge.cid,function(card){
						if(card){
							_this.setMember(card);
						}
					});
				}
				// else {
				// 	//手动升级
				// 	this.member.balance += paras.afterRecharge.cardFee;
				// 	this.member.gift += paras.afterRecharge.presentFee;
				// 	if(afterRecharge.upgradeCard){
				// 		this.member.cardName = afterRecharge.upgradeCard.cardName;
				// 		this.member.discount = afterRecharge.upgradeCard.discount;
				// 		this.member.buydiscount = afterRecharge.upgradeCard.buydiscount;
				// 	}
				// 	this.setMember(this.member,null);
				// }
				return;
			}
            am.tab.main.show().select(4);
            if(!paras){
                _this.$costEdit.removeClass('modifyed').html(0);
                this.billRemark = null;
            }
            if (paras == "back") {
                return;
            } else if (paras && paras.hasOwnProperty("member")) {
				this.treatDetailList = [];
                if(am.isNull(paras.member)){
					this.member = null;
					this.$member.html('<span class="tag">顾客:</span>散客').prev().hide();
					this.renderItemTr();
					return false;
				}
				this.setMember(paras.member);
                setTimeout(function(){
                    am.tips.details( am.page.comboCard.billMain.$.find(".member"), am.page.comboCard.billMain.$.find('.memberInfoBtn') );
                }, 500);
            } else if(paras && paras.cardData){
                //客户详情，重新选卡
                this.setMember(am.convertMemberDetailToSearch(paras.cardData));
            } else if (am.metadata) {
				var employeeList = am.metadata.employeeList || [];
                this.billItemSelector.dataBind(this.processData(am.metadata.tpList));
                this.billItemSelector.setGroup(am.page.service.getGroupData.call(this));
                if(!this.billServerSelector.data){
                    this.billServerSelector.dataBind(employeeList, ["第一工位","第二工位","第三工位"]);
                }

                this.billItemSelector.reset();
                this.billServerSelector.reset();
                this.billMain.defaultSetting = am.page.product.getServerDefultSetting(employeeList);
                this.billMain.reset();
                this.billMain.$list.eq(0).parent().show();
                this.billMain.$list.eq(1).parent().hide();
                this.selectedServer = null;

                if (paras && paras.reset) {
                    this.setMember(paras.reset);
                } else if (paras && paras.cardData) {
                    this.setMember(am.convertMemberDetailToSearch(paras.cardData));
                } else {
                    this.member = null;
                    this.$member.html('<span class="tag">顾客:</span>散客').prev().hide();
                }
            } else {
                //throw "metadata should be ready";
            }
            if(paras && paras.billRemark){
                this.billRemark = paras.billRemark;
                var sdata = paras.billRemark.data;
                var _data = {};
                try{
                    _data = JSON.parse(sdata);
                }catch(e){}
                am.searchMember.getMemberById(paras.billRemark.memId,_data.cid,function(card){
                    if(card){
                        _this.setMember(card);
                    }
                });
                //渲染套餐
                this.renderFeedRemark(_data);
            }else{
                if(paras && !paras.member){
                    this.billRemark = null;
                }
            }
        },
        renderFeedRemark:function(sdata){
            var remark = sdata.billRemark.buypackage.data;
            var isXCX = sdata.billRemark.buypackage.isXCX;
            var list   = this.processData(am.metadata.tpList);
            var package= list.shift();
            var single = list.shift();
            var res = [];
            for(var i=0;i<remark.length;i++){
				var item = remark[i];
				if(item.tpd){//套餐包
                    for(var j=0;j<package.sub.length;j++){
                        var itemj = package.sub[j];
                        if(itemj.id == item.id){
                            res.push(itemj);
                        }
                    }
                }else{//单个套餐
                    for(var n=0;n<single.sub.length;n++){
                        var itemn = single.sub[n];
                        if(isXCX){
                            if(itemn.itemid == item.itemId){
                                var _itemn = JSON.parse(JSON.stringify(itemn));
                                _itemn.isXCX = isXCX;
                                _itemn.feedNum = item.itemTimes;
                                _itemn.nowPrice = item.itemMoney/item.itemTimes;
								_itemn.days = item.days;
                                _itemn.validDate = item.validDate;
                                _itemn.productCost = Math.round(((item.itemMoney - (item.oncemoney || 0)*item.itemTimes))*100)/100;
                                res.push(_itemn);
                            }
                        }else {
                            if(itemn.id == item.id){
                                itemn.feedNum = item.number;
                                res.push(itemn);
                            }
                        }
                    }
                }
            }
            for(var k=0;k<res.length;k++){
                this.billMain.addItem(res[k]);
            }
            // 取单选中第一个
            this.billMain.$.find("tbody tr:eq(0)").trigger('vclick');

        },
        afterShow: function(paras) {
            //自动点击结算
			if (amGloble.metadata.shopPropertyField.mgjBillingType == 1 && paras && paras.isXCX && paras.billRemark && paras.billRemark.data) {
				var settlementPayDetail = paras.billRemark.data.settlementPayDetail;
				if (settlementPayDetail != undefined) {
					if(settlementPayDetail.payMoney && settlementPayDetail.payMoney.wechatOrder){
                        settlementPayDetail = JSON.parse(JSON.stringify(settlementPayDetail));
                        settlementPayDetail.payMoney.wechat = paras.billRemark.data.billRemark.buypackage.data[0].itemMoney * 1;
                        settlementPayDetail.payMoney.wechatOrder.price = paras.billRemark.data.billRemark.buypackage.data[0].itemMoney * 1;
                    }
					sessionStorage._autoPay1214 = 'autoPay'; 
					this.settlementPayDetail = {
						payMoney: settlementPayDetail.payMoney,
						payType: settlementPayDetail.payType
					};
					if(paras.server){
						this.settlementServer = paras.server;
					}
					setTimeout(function () {
                        am.autoPayCheck.setStep('trigger vclick to page.pay');
                        $('canvas').trigger('vclick');
						self.$.find('.submit').trigger('vclick');		
					}, 3000)
				} else {}
			}
        },
        beforeHide: function(paras) {
            this.billMain.hideMemberInfo();
            this.billItemSelector.typeFilterSelect && this.billItemSelector.typeFilterSelect.hide();
            this.$.find('.typeFilterWrap .result .val').removeData('data').text('选择项目大类').removeClass('selected');
        },
        showCalendar:function($dom){
            $tempDateTarget = $dom;
            if(!this.calenderSelector){
                var $calenderSelector = $('<div></div>');

                var options = ['1个月','3个月','6个月','12个月','不限期','选择日期'];
                this.calenderSelector = $calenderSelector.mobiscroll().scroller({
                    theme: 'mobiscroll',
                    display: 'bottom',
                    lang: 'zh',
                    rows: 5,
                    wheels: [
                        [{
                            circular: false,
                            data: options,
                            label: '选择有效期'
                        }]
                    ],
                    showLabel: true,
                    minWidth: 200,
                    onSet: function(valueText, inst) {
                        //to do
                        var date = amGloble.now();
                        var cm = date.getMonth();
                        switch (valueText.valueText) {
                            case '1个月':
                                date.setMonth(cm+1);
                            break;
                            case '3个月':
                                date.setMonth(cm+3);
                            break;
                            case '6个月':
                                date.setMonth(cm+6);
                            break;
                            case '12个月':
                                date.setMonth(cm+12);
                            break;
                            case '不限期':
                                date=0;
                            break;
                            case '选择日期':
                                date=-1;
                            break;
                        }

                        if(date!=-1){
                            $tempDateTarget.text(date?date.format('yyyy/mm/dd'):'不限期');
                        }else{
                            self.showCalendar2($tempDateTarget);
                        }
                    }
                }).mobiscroll('getInst');
            }
            var _this=this;
            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(function(){
                _this.calenderSelector.setVal('12个月');
                _this.calenderSelector.show();
            },500);
        },
        showCalendar2:function($dom){
            // if(!this.calenderSelector2){
            //     var $calenderSelector = $('<div></div>');
            //     this.calenderSelector2 = $calenderSelector.mobiscroll().calendar({
            //         theme: 'mobiscroll',
            //         lang: 'zh',
            //         display: 'bottom',
            //         months: "auto",
            //         min: amGloble.now(),
            //         setOnDayTap: true,
            //         buttons: [],
            //         onSet: function(obj, inst) {
            //             $dom.text(obj.valueText);
            //         }
            //     }).mobiscroll('getInst');
            // }
            //this.calenderSelector2.show();
            var obj = am.getCalenderSelector(function(date){
                $dom.text(date);
            }).show();
            console.log(obj);
        },
		setMember:function(member,pass){
			var _this=this;
			_this.getTreatDetail(member);
            if(!pass && amGloble.metadata.configs.typePasswordtToSelectMember == 'true'){
                am.pw.check(member,function(verifyed){
                    if(verifyed){
                        _this.setMember(member,1);
                    }
                });
                return;
            }else{

            }
			this.member = member;
            console.log(member)
            var cardName = this.member.cardName;
            var balanceFee = this.member.balance;
            if(this.member.cardtype == 1 && this.member.timeflag==0 && balanceFee){
                cardName+='(￥'+balanceFee.toFixed(0)+')';
            }
            this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div><div class="cardname">'+cardName+'</div>').prev().show();

			this.$member.find('.img').html(am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				updateTs: member.lastphotoupdatetime || ""
			}, member.id + ".jpg", "s",member.photopath||''));
            if(member.mgjIsHighQualityCust == 1){
                this.$member.find('.img').addClass("good");
            }else{
                this.$member.find('.img').removeClass("good");
			}
			if(am.isMemberLock(member.lastconsumetime || member.lastConsumeTime, member.locking)){
                this.$member.find('.img').addClass("lock");
			}else{
                this.$member.find('.img').removeClass("lock");
			}
            cashierDebt.check(member);
		},
        processData: function(types) {
            var categorys = [];
                for (var i = 0; i < types.length; i++) {
                    // if(types[i].applyShopIds && types[i].applyShopIds.indexOf(am.metadata.userInfo.shopId) == -1){
                    //     continue;
                    // }
                    if(types[i].applyShopIds){
                        // 指定了门店
                        var obj={
                            shopIdsStr:types[i].applyShopIds,// ',r,234,43,'
                            targetShopId:am.metadata.userInfo.shopId
                        }
                        var available= am.checkShopAvailable(obj);
                        if(!available){
                            continue;
                        }
                    }else{
                        // 全部门店可用
                    }
                    
                    var type = {
                        name: types[i].packName,
                        id: types[i].id,
                        price: types[i].price,
                        pinyin: types[i].pinyin,
                        tpd: types[i].tpd,
                        tdList:[],// 商品
                        allowedSellEmpty:types[i].allowedSellEmpty,
                        autoSellWithCombo:types[i].autoSellWithCombo,
                        modifyEnable:types[i].modifyEnable,
                        minPrice:types[i].minPrice,
                        manualgift:types[i].manualgift,
                        costMoney: types[i].costMoney,
                        img:"$dynamicResource/images/card3.jpg",
                        isNewTreatment:types[i].isNewTreatment,
                        validDay:types[i].validDay,
                        validity:types[i].validity,
                        validitycheck:types[i].validitycheck,
                        cashshopids:types[i].cashshopids,
                        itemid: types[i].id.toString(),
                        hasStoped:types[i].hasStoped,// 套餐包含停用项目
                        hasDeleted:types[i].hasDeleted// 套餐包含删除项目
                    };
                    var tdList=am.metadata.tdList;
                    if(tdList && tdList.length){
                        for(var t=0,tlen=tdList.length;t<tlen;t++){
                            var tdItem=tdList[t];
                            if(tdItem && tdItem.treatid== types[i].id)
                            type.tdList.push(tdItem);
                        }
                    }
                    categorys.push(type);
                }
            
            var serviceItem = [];
            if(am.metadata.classes){// for bug 0015775
                for (var i = 0; i < am.metadata.classes.length; i++) {
                    var sub = am.metadata.classes[i].sub;
                    if(sub){
                        for (var j = 0; j < sub.length; j++) {
                            if(sub[j].treatFlag== "1") continue;
                            serviceItem.push(sub[j]);
                        }
                    }
                }
            }

            return [
                {
                    id:0,
                    name:"套餐",
                    sub:categorys
                },
                {
                    id:1,
                    name:"单个项目",
                    sub:serviceItem
                }
            ];
        },
        submit: function(onlyGetPrice) {
            var _this = this;
            var user = am.metadata.userInfo;
            var opt = {
                "parentShopId": user.realParentShopId,
                "shopId": user.shopId,
                "expenseCategory": 4,
                "custSource": 0,
                "comment": "",
                "clientflag": 1,
                "otherFlag": 0,
                "token": user.mgjtouchtoken,
                "comboCard": {
                    "treatments": [],
                    "costDetail": {
                        "total": 0,
                        "eaFee": 0,
                        "cardFee": 0,
                        "presentFee": 0,
                        "cashFee": 0,
                        "unionPay": 0,
                        "cooperation": 0,
                        "mall": 0,
                        "weixin": 0,
                        "pay": 0,
                        "voucherFee": 0,
                        "mdFee": 0,
                        "divideFee": 0,
                        "pointFee": 0,
                        "debtFee": 0,
                        "dpFee": 0,
                        "treatfee": 0,
                        "treatpresentfee": 0,
                        "jdFee":0,
                        "onlineCredit":0,
                        "onlineCreditPay":0,
                        "offlineCredit":0,
                        "offlineCreditPay":0,
                        "mallOrderFee":0,
                        "dpId": null,
                        "payId": null,
                        "weixinId": null
                    },
                    "treattype": 0,
                    "detail":"",
                    "servers":[]
                },
                "billingInfo": {
                    "total": 0,
                    "eaFee": 0, //入账金额
                    "treatfee": 0,
                    "treatpresentfee": 0,
                },
                'jsonstr': this.billRemark?this.billRemark.jsonstr:''
            };
            if(this.billRemark){
                opt.billNo = this.billRemark.serviceNO;
            }
            var $tr = this.billMain.$list.find("tr");

            var singleItemTreatment = {
                "packageId":-1,
                "packageName":"",
                "cashshopids":"",
                "price":0,
                "serviceItems":[]
            };
            opt.cost = this.$costEdit.text()*1 || 0;
            for(var i = 0; i < $tr.length; i++){
                if($tr.eq(i).parents("table").hasClass("comboitem")){
                    var $productCost = $tr.eq(i).find(".price.productCost");
                    opt.cost += $productCost.text() * 1;
                }else{
                    var itemCost = $tr.eq(i).data('itemCost');
                    opt.cost += itemCost;
                    var data = $tr.eq(i).data("data");
                    if(data.tpd.length==0){
                        am.msg('请选择套餐内容（必须包含项目）');
                        $tr.eq(i).addClass('warn');
                        return false;
                    }
                }
            }
            var costEdit = this.$costEdit.text()*1 || 0;
            opt.billingInfo.total= this.billMain.totalPrice - opt.cost + costEdit;

            var hasZeroPrice = 0;
            for(var i = 0; i < $tr.length; i++){
                var $price = $tr.eq(i).find(".price.totalPrice");
                var price = $price.text() * 1;
                if(price==0){
                    hasZeroPrice ++;
                }
            }
            for (var i = 0; i < $tr.length; i++) {
                var data = $tr.eq(i).data("data");
                var $price = $tr.eq(i).find(".price");
                var $oncePerformance = $tr.eq(i).find(".oncePerformance");
                var $productCost = $tr.eq(i).find(".productCost");
                var price = $price.eq(0).text() * 1;
                var servers = $tr.eq(i).find(".server").data("data") || [];
                if(data.tpd){
                    // costEdit += data.costMoney*1||0;
                    //opt.billingInfo.total += price;
                    var invaliddate = null;
                    var itemCost = $tr.eq(i).data('itemCost');
                    var trueprice = Math.round((price - itemCost)*100)/100;
                    if(data.validitycheck == 1 && data.validity){
                        //有效期
                        invaliddate = new Date();
                        invaliddate.setMonth(invaliddate.getMonth()+data.validity*1);
                    }else if(data.validDay){
                        //0 固定期
                        invaliddate = new Date(data.validDay);
                        if(!invaliddate.getTime()){
                            $.am.debug.log(invaliddate);
                            invaliddate = undefined;
                        }
                    }
                    var treatment = {
                        "packageId":data.id,
                        "packageName":data.name,
                        "cashshopids":data.cashshopids,
                        "price":trueprice,
                        "serviceItems":[],
                        "depots":[],
                        "allowedSellEmpty":data.allowedSellEmpty,
                        "autoSellWithCombo":data.autoSellWithCombo,
                        "servers": servers // 销售
                    };
                    
                    for (var j = 0; j < data.tpd.length; j++) {
                    	var itemInvalidDate = invaliddate;
                        if(data.tpd[j].days){
	                        itemInvalidDate = new Date();
	                        itemInvalidDate.setDate(itemInvalidDate.getDate()+data.tpd[j].days*1);
                        }else if(data.tpd[j].validDate){
	                        itemInvalidDate = new Date(data.tpd[j].validDate);
                        }
                        //var money = toFloat(data.tpd[j].itemMoney*price/data.price) || 0;
                        //var cost = price?(data.costMoney*money/price):(data.costMoney/data.tpd.length);
	                    var money,cost;
                        if(data.price){
							money = toFloat(data.tpd[j].itemMoney*price/data.price);
                            cost = costEdit*money/this.billMain.totalPrice;
                        }else{
	                        money = toFloat(price/data.tpd.length);
	                        cost = costEdit*money/this.billMain.totalPrice;
                        }
                        if(hasZeroPrice){
                            var trCost = costEdit/$tr.length;
                            if(price){
                                if(data.price){
                                    cost = trCost*data.tpd[j].itemMoney/data.price;
                                }else {
                                    cost =  trCost/data.tpd.length;
                                }
                            }else {
                                cost = trCost/data.tpd.length;
                            }
                        }
                        var truemoney = toFloat((100-data.tpd[j].costRatio)*money/100)
                        //var itemnames = _this.getItemNamesByNos(data.tpd[i].timesItemNOs);
    					treatment.serviceItems.push({
						    "itemId": data.tpd[j].itemId,
						    "times": data.tpd[j].itemTimes,
						    "money": truemoney,
						    "allPrice":cost+money,
						    "name":data.tpd[j].itemName || (data.tpd[j].timesItemNOs ? this.getItemNamesByNos(data.tpd[j].timesItemNOs,1).join(","):' '),
						    "invaliddate": itemInvalidDate ? itemInvalidDate.format('yyyy-mm-dd') : null,

						    "oncemoney":data.tpd[j].oncemoney || 0, // || toFloat(money/data.tpd[j].itemTimes)
						    "isNewTreatment":data.isNewTreatment,
						    "timesItemNOs":data.tpd[j].timesItemNOs,
						    "isFree":data.tpd[j].treatType,

						    "itemRemark":"",
                            "packageRemark":"",
                            "shopid": amGloble.metadata.userInfo.shopId,
                            // "servers": servers // 销售
                        });
                        if(!treatment.treatsCost){
                            treatment.treatsCost = cost;
                        }else{
                            treatment.treatsCost += cost;
                        }
                    }
                    treatment.treatsCost += itemCost;
                    for (var k = 0; k < data.tdList.length; k++){
                        treatment.depots.push({
                            productid:data.tdList[k].depotid,
                            number:data.tdList[k].amount,
                            productName:data.tdList[k].name
                        })
                    }
                    opt.comboCard.treatments.push(treatment);
                }else{
                    var $num = $tr.eq(i).find(".number .value").length?$tr.eq(i).find(".number .value"):$tr.eq(i).find(".numberSelect");
                    var num = -99;
                    if(!$num.parent().parent().hasClass('unlimit')){
	                    num = $num.text()*1 || 0;
                    }
                    var invalidDate = $tr.eq(i).find(".date").text();
                    var onceMoney = $oncePerformance.text()*1;
                    var productCost = $productCost.text()*1;
	                var setMoney = $price.eq(1).text()*1;
                    var sMoney = setMoney-productCost;
                    // if(setMoney<sMoney){
                    //     //如果走到这里，说明前面的校验有漏洞
	                   //  if(sMoney - setMoney > 0.1){
		                  //   atMobile.nativeUIWidget.showMessageBox({
			                 //    title: "提示",
			                 //    content: '价格设定有误，请调整!'
		                  //   });
		                  //   return;
	                   //  }
                    // }else if(setMoney>sMoney){
                    //     //如果售卖价超过计算价，超出部分加到cost
	                   //  costEdit+=setMoney-sMoney;
                    // }
                    var cost = costEdit*setMoney/this.billMain.totalPrice;
                    if(hasZeroPrice){
                        cost = costEdit/$tr.length;
                    }
                    var singleItemData = {
	                    "itemId": -1,
	                    "times": num,
	                    "money": sMoney,
                        "name":"",
                        "productCost": productCost,
	                    "invaliddate": invalidDate==="不限期" ? null:invalidDate.replace(/\//g,"-"),
	                    "isFree":$tr.eq(i).find("span.gift").hasClass("checked")?1:0,
                        "allPrice": sMoney+cost+productCost,// 单个套餐项目allprice包含自身成本
	                    "oncemoney":onceMoney,
	                    "isNewTreatment":1,
	                    "timesItemNOs":null,
	                    "itemRemark":"",
                        "packageRemark":"",
                        "shopid": amGloble.metadata.userInfo.shopId,
                        "servers": servers //组合套餐的服务项目
                    };

	                var mutiItem = $tr.eq(i).data("mutiItem");
	                if(mutiItem && mutiItem.ids){
                        if(mutiItem.ids.length>1){
                            singleItemData.timesItemNOs = mutiItem.ids.join(",");
                            singleItemData.name=this.getItemNamesByNos(singleItemData.timesItemNOs,1).join(",");
                        }else {
                            singleItemData.itemId = mutiItem.ids[0];
	                        singleItemData.name = mutiItem.names[0];
                        }
	                }else{
		                singleItemData.itemId = data.itemid;
		                singleItemData.name = data.name;
                    }
                    singleItemTreatment.price+=sMoney;
                    //opt.billingInfo.total+=sMoney;
                    singleItemTreatment.serviceItems.push(singleItemData);
                }
            }

            if(singleItemTreatment && singleItemTreatment.serviceItems && singleItemTreatment.serviceItems.length){
                opt.comboCard.treatments.push(singleItemTreatment);
                if(this.settlementServer){
                    opt.comboCard.treatments[0].serviceItems[0].servers = [this.settlementServer];
                }
            }
            if(onlyGetPrice){
                // 如果只是获取套餐包价格 则返回opt
                return opt;
            }
            if(!this.settlementPayDetail && am.checkContainedServers(opt)===0){
                am.msg('请选择服务员工!');
                return;
            }
            /*if (this.selectedServer) {
                opt.comboCard.servers.push({
                    "empId": this.selectedServer.id,
                    "empName": this.selectedServer.name,
                    "empNo": this.selectedServer.no,
                    "station": this.selectedServer.pos,
                    "pointFlag": 1, // 是否指定 0指定 1非指定
                    "dutyid": this.selectedServer.dutyType
                });
            }*/
	        // opt.comboCard.servers = this.billServerSelector.getEmps();

            opt.billingInfo.eaFee = opt.billingInfo.total;
            console.log(opt);
            var remarkCallback = function(members){//备注买单完成回调
                var _data = this.billRemark;
                var sdata = _data.data;
                var sendData = {};
                try{
                    sendData = JSON.parse(sdata);
                }catch(e){}
                if(members){
                    sendData.cid = members.cid;
                    sendData.memGender=members.sex;
                    _data.memId  = members.id;
                    _data.memName= members.name;
                    _data.memPhone=members.mobile;
                    _data.memcardid=members.cid;
                }
                if(sendData.billRemark.buypackage.isXCX){
                    var serviceItems = sendData.serviceItems;
                    var itemid = sendData.billRemark.buypackage.data[0].itemid;
                    if(serviceItems && serviceItems.length){
                        for(var i=0;i<serviceItems.length;i++){
                            if(serviceItems[i].itemId==itemid && serviceItems[i].consumeType && !serviceItems[i].consumeId){
                                serviceItems[i].consumeId = '$consumeId';
                            }
                        }
                    }
                }
                sendData.billRemark.buypackage.isbuy = true;
                _data.data = JSON.stringify(sendData);
                return _data.data;
            }
            if (this.member) {
				var member = this.member;
				opt.memId = member.id;
				opt.cardId = member.cid;
				opt.gender = member.sex;
				var billRemark = this.billRemark;
				if (member.cardtype == 1 && member.cardTypeId != "20151212" && member.cardTypeId != "20161012" && (member.timeflag == 0 || member.timeflag == 2) && !this.shutDownSubmit) {
					var sum = this.$costEdit.text() - 0 + this.billMain.totalPrice;// 总计价格
					if (member.balance && member.balance < member.alarmfee) {
						am.confirm("余额不足", "卡内余额为" + member.balance + "元；已经低于最低值" + member.alarmfee + "元", "去充值", "结算", rechangeFn, jumpAccount);
					} else if (member.balance && member.balance <  sum) {
						am.confirm("余额不足", "卡内余额为" + member.balance + "元；已不足以支付当前订单，是否现在去充值？", "去充值", "结算", rechangeFn, jumpAccount);
					} else{
						jumpAccount(member);
					}
				}else{
					jumpAccount(member);
				}
				function rechangeFn() {
					$.am.changePage(am.page.pay, "slideup",{
						action:"recharge",
						from:"recharge",
						member:member
					});
				}
				function jumpAccount(){
                    am.crossOpenCardNote.show({
                        member: member,
                        callback: function(){
                            $.am.changePage(am.page.pay, "slideup", {
                                comboitem: [],
                                option: opt,
                                member: member,
                                billRemark:billRemark,
                                remarkCallback:remarkCallback,
                                from:"comboCard",
                                settlementPayDetail: _this.settlementPayDetail
                            });
                        }
                    })
				}
					// var memberShop = am.metadata.shopList.filter(function (e) { return e.shopId === self.member.shopId*1 });
					// if(this.member.shopId*1 === am.metadata.userInfo.shopId*1 || (am.metadata.userInfo.shopType===2 && memberShop[0] && memberShop[0].softgenre===2)){
					//if(this.member.shopId == am.metadata.userInfo.shopId){
                // }
                // else{
                //     atMobile.nativeUIWidget.showMessageBox({
                //         title: "非本店会员",
                //         content: '此会员为其它门店会员，将自动为会员创建本店会员档案后继续开卡'
                //     });
				// 	am.page.addMember.submit="createMember";
				// 	am.page.addMember.setData({
				// 		name:this.member.name,
				// 		mobile:this.member.mobile,
				// 		sex:this.member.sex,
				// 		sourceId:3,
				// 		page:this.member.comment
				// 	},function(ret){
                //         opt.memId = ret.id;
                //         opt.cardId = ret.cid;
                //         opt.gender = ret.sex;
				// 		$.am.changePage(am.page.pay, "slideup", {
			    //             comboitem: [],
			    //             option: opt,
                //             member: ret,
                //             billRemark:_this.billRemark,
                //             remarkCallback:remarkCallback,
                //             from:"comboCard"
			    //         });
				// 	});
				// }
            } else {
                $.am.changePage(am.page.addMember, "slideup", {
                    onSelect: function(member) {
                        opt.memId = member.id;
                        opt.cardId = member.cid;
                        opt.gender = member.sex;
                        self.setMember(member);
                        $.am.changePage(am.page.pay, "slideup", {
                            comboitem: [],
                            option: opt,
                            member: member,
                            billRemark:_this.billRemark,
                            remarkCallback:remarkCallback,
                            from:"comboCard",
                            settlementPayDetail: _this.settlementPayDetail
                        });
                    }
                });
            }
        },
        initComboCardItemSelector:function() {
            if (self.comboCardItemSelector) return;
            var getItemTimes = function(el) {
                var val = Number(el.val());
                if (isNaN(val) || val <= 0) {
                    el.val('');
                    return false;
                }
                return val;
            }

            var getSelectTimesCount = function () {
                var itemEls = self.comboCardItemSelector.find('.combo_card_item_selector-item');
                var timesCount = 0;
                $.each(itemEls, function(index, item) {
                    var isSelect = $(item).find('input[type="checkbox"]').prop('checked');
                    if (isSelect) {
                        var currentTimes =  getItemTimes($(item).find('input[name="itemTimes"]'));
                        if (currentTimes) {
                            timesCount += currentTimes;
                        }
                    }
                })
                return timesCount;
            }
            
            self.comboCardItemSelector = $('#combo-card-item-selector');
            // self.comboCardItemSelector.on('change', 'input[name="itemTimes"]', function() {
            //     var val = getItemTimes($(this));
            //     if (!val) {
            //         am.msg('请输入正确的数值');
            //         return;
            //     }
            //     var timesCount = getSelectTimesCount();
            //     if ($(this).siblings('.combo_card_item_selector-checkbox').hasClass('is_select') && timesCount > self.ComboCardItemSelectorMaxCount) {
            //         $(this).val(val - (timesCount - self.ComboCardItemSelectorMaxCount));
            //     }
            // })
            self.comboCardItemSelector.on('click', 'input[name="itemTimes"]', function() {
                var _this = $(this);
                var oldValue = $(this).html();
                am.keyboard.show({
                    title:"请输入数字",//可不传
                    hidedot:false,//是否隐藏点
                    submit:function(val){
                        if (isNaN(val) || val <= 0) {
                            am.msg('请输入正确的数值');
                            return;
                        }
                        _this.val(val);
                    },
                    cancel:function(){

                    }
                });
                
            })
            self.comboCardItemSelector.find('.save').vclick(function(){
				var itemEls = self.comboCardItemSelector.find('.combo_card_item_selector-item');
				// 不限次套餐组合选几个
				if($(this).hasClass("unlimited")) {
                    var newTpd = [];
                    var len = itemEls.find('.title-span.selected').length || 1;
					$.each(itemEls, function(i, v) {
						var isSelect = $(v).find('.title-span').hasClass('selected');
						if (isSelect) {
                            var itemData = $(v).data('data');
                            // 不限次价格平分
                            itemData.itemMoney = Math.round( itemData.itemMoney/len*100 ) / 100;
							newTpd.push(itemData);
						}
                    });
                    if(newTpd.length === 0) {
                        am.msg('请至少选择一个项目');
                        return;
                    }
					self.ComboCardItemSelectorCallBack(newTpd);
					return false;
				}

                var newTpd = [],
                    timesCount = 0,
                    treatType = 0;
                for (var i =0; i < itemEls.length; i++) {
                    var item = itemEls.eq(i);
                    var isSelect = $(item).find('.combo_card_item_selector-times').val();
                    if (isSelect) {
                        var itemData = $(item).data('data');
                        var itemTimes = getItemTimes($(item).find('input[name="itemTimes"]'));
                        if (itemTimes || self.ComboCardItemSelectorMaxCount == -99) {
                            itemData.itemTimes = itemTimes || -99;
                            itemData.itemMoney = Math.round(itemTimes * itemData.oncemoney*100)/100;
                            timesCount += itemTimes;
                            treatType = itemData.treatType;
                            newTpd.push(itemData);
                        } else {
                            am.msg('请输入正确的次数');
                            return;
                        }
                    }
                }
                if(newTpd.length === 0) {
                    am.msg('请至少选择一个项目');
                    return;
                }
                if (self.ComboCardItemSelectorMaxCount !== -99) {
                    if(am.metadata.userInfo.operatestr.indexOf("a52") != -1 && treatType==1){
                        
                    }else{
                        if (timesCount !== -99) {
                            if(timesCount > self.ComboCardItemSelectorMaxCount){
                                am.msg('设置的次数大于总次数，请修改');
                                return;
                            }else if(timesCount < self.ComboCardItemSelectorMaxCount){
                                am.msg('设置的次数小于总次数，请修改');
                                return;
                            }
                        }
                    }
                }   
                
                self.ComboCardItemSelectorCallBack(newTpd);
            });
            self.comboCardItemSelector.find('.cancel,.close').vclick(function(){
                self.comboCardItemSelector.hide();
            });
            self.comboCardItemSelector.on('vclick', '.combo_card_item_selector-checkbox', function() {
                // var checkboxEl = $(this).children('input[type="checkbox"]'),
                //     select = checkboxEl.prop('checked');
                var select = $(this).hasClass('is_select');
                if (select) {
                    $(this).removeClass('is_select');
                } else {
                    // if (self.ComboCardItemSelectorMaxCount != -99) {
                    //     var inputEl = $(this).siblings('input[name="itemTimes"]');
                    //     var currentTimes = getItemTimes(inputEl);
                    //     var timesCount = getSelectTimesCount();
                    //     if (timesCount >= self.ComboCardItemSelectorMaxCount) {
                    //         am.msg('次数已分配完毕，若要更换项目，请取消其他勾选或是修改已分配次数。');
                    //         return;
                    //     } else if(timesCount + currentTimes > self.ComboCardItemSelectorMaxCount) {
                    //         inputEl.val(self.ComboCardItemSelectorMaxCount - timesCount);
                    //     }
                    // }
                    $(this).addClass('is_select');
                }
                // checkboxEl.prop('checked', !select);
			})
			
			// 不限次选中
            self.comboCardItemSelector.on('vclick', '.title-span', function() {
				var select = $(this).hasClass('selected');
                if (select) {
                    $(this).removeClass('selected');
                } else {
                    $(this).addClass('selected');
				}
			});
        },
        
        isMultipleItem: function(itemData) {
            var timesItemNOs = itemData.timesItemNOs ? itemData.timesItemNOs.split(',') : [],
                itemId = itemData.itemId;
            return itemId == '-1' && timesItemNOs.length > 1;
        },
        renderComboCardSelectorItem: function(data) {
            var classPrefix = "combo_card_item_selector";
            var createElementClass = function(name) {
                return classPrefix + '-' + name;
			}
			var itemNumber = '',itemSelect = '';
            if(data.itemName==='项目已删除' || data.itemName==='项目已停用'){
                var itemLabel = "<p class='"+ createElementClass('label') +"'>" + data.itemName + "</p>";
                itemNumber = data.itemTimes == -99 ? '' : "<input placeholder='0次' name='itemTimes' disabled readonly class='am-clickable "+ createElementClass('times') +"'>";
            }else{
                var itemLabel = "<p class='"+ createElementClass('label') +"'>" + data.itemName + "</p>";
                itemNumber = data.itemTimes == -99 ? '' : "<input placeholder='次数' name='itemTimes' diaabled readonly class='am-clickable "+ createElementClass('times') +"'>";
			}
			
			if (data.itemTimes == -99) {
				itemSelect = '<span class="am-clickable title-span"></span>';
			}
            // var itemCheckbox = "<span class='am-clickable " + createElementClass('checkbox') + "'><i class='iconfont icon-danxuan'></i><i class='iconfont icon-queren'></i></span>";
            // var itemLabel = "<p class='"+ createElementClass('label') +"'>" + data.itemName + "</p>";
            //     itemNumber = data.itemTimes == -99 ? '' : "<input placeholder='次数' name='itemTimes' diaabled readonly class='am-clickable "+ createElementClass('times') +"'>";

            return "<div class='"+ createElementClass('item') +"'>" + itemSelect + itemLabel + itemNumber +"</div>";
        },
        renderComboCardItem: function(itemData, index, isMultiple,onlyShowValidName) {
            if (onlyShowValidName) {
                if (itemData && itemData.itemId!=='-1') {
                    // 不是组合套餐
                    var validItem = am.metadata.serviceCodeMap[itemData.itemId];
                    if (!validItem) {
                        // 项目已经停用或删除
                        return;
                    }
                }
            }
            var itemMainHtml;
            var itemClassName = 'comboCardItem',
                itemTimes = itemData.itemTimes;
            itemMainHtml = self.renderComboCardItemName(itemData) + self.renderComboCardItemTimes(itemTimes);
            if (self.isMultipleItem(itemData) || isMultiple) {
                itemMainHtml += '<i class="iconfont icon-juxingkaobei"></i>';
                itemClassName += ' am-clickable';
            }
            return '<span class="'+itemClassName+'" data-index="'+index+'">'+itemMainHtml+'</span>';
        },
        renderComboCardItemName: function(itemData) {
            var timesItemNOs = itemData.timesItemNOs,
                itemId = itemData.itemId,
                itemName = itemData.itemName,
                treatType = itemData.treatType;
            var itemnames;
            if (self.isMultipleItem(itemData)) {
                var paramObj={
                    showStopedItem:1,
                    showFixedStopName:0,
                    onlyShowValidName:1
                }
                // itemnames = self.getItemNamesByNos(timesItemNOs,'',1,'',1).join('、');
                itemnames = self.getItemNamesByNos(timesItemNOs,'',paramObj).join('、');
                if (treatType == 1 || treatType == 2) {
                    itemnames = '赠：' + itemnames;
                }
            } else {
                if (treatType == 1 || treatType == 2) {
                    itemnames = '赠：' + itemName || itemId;
                }else{
                    itemnames = itemName || itemId;
                }
            }
            // 提醒
            if(timesItemNOs){
                var itemArr=timesItemNOs.split(',');
                for(var i=0,len=itemArr.length;i<len;i++){
                    var itemCode=itemArr[i];
                    var validItem=am.metadata.serviceCodeMap[itemCode];
                    if(!validItem){
                        am.msg('套餐中包含已停用/已删除项目，购买后其他项目仍可正常使用');
                        break;
                    }
                }
            }
            return itemnames;
        },
        renderComboCardItemTimes: function(times) {
            var text = times == -99 ? '-不限' : 'x'+times+'次';
            return '<i class="comboCardItem-times">'+text+'</i>';
        }
    });
})();
