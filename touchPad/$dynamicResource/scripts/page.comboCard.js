(function() {
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
                    return _this.billMain.addItem(data);
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
                }],
                onSelect: function($item,t) {
                    self.billServerSelector.rise(0,t);
				},
                onAddItem: function(data, $container) {
                    var $tr;
					var data = am.clone(data);

					if(!am.isNull(self.treatDetailList) && self.member){
						data = self.changePrice(data,self.member);
					}
                    if(data.tpd){
                        $tr = $('<tr class="am-clickable show"></tr>');
                        $tr.append('<td><div class="am-clickable delete"></div><span class="server" style="display:none"></span></td>');
                        $tr.append('<td>' + data.name + '</td>');
	                    var spanClass='';
	                    if(am.operateArr.indexOf("H2")!=-1){
		                    spanClass = 'am-disabled';
						}
                        $tr.append('<td class="center"><span class="price am-clickable '+spanClass+'">' + ((data.nowPrice === undefined)? data.price : data.nowPrice) + '</span></td>');
    					var tpds = [];
                        // if(data.costMoney){
                        //     tpds.push('<span class="comboCardItem">成本:￥'+data.costMoney+'</span>');
                        // }


    					for(var i=0;i<data.tpd.length;i++){
                            tpds.push(self.renderComboCardItem(data.tpd[i], i));
                        }
                        var tdList=data.tdList;
                        if(tdList&& tdList.length){
                            for(var t=0,tlen=tdList.length;t<tlen;t++){
                                var tdItem=tdList[t];
                               var span= '<span class="comboCardItem" style="background:#FFF5DA">'+tdItem.name +'<i class="comboCardItem-times">x'+tdItem.amount+(tdItem.unit||'')+'</i></span>';
                               tpds.push(span);
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
                        $container.eq(0).append($tr.data("data", data)).parent().show();
                        if($container.eq(1).is(":empty")){
                            $container.eq(1).parent().hide();
                        }
                    }else{
                        var $children = $container.find("tr");
                        for (var i = 0; i < $children.length; i++) {
    						var $etr = $children.eq(i);
    						if($etr.data("data") == data){
    							$etr.trigger("vclick").find(".plus").trigger("vclick");
    							return $etr.addClass("show1");
    						}
    					}
    					var ts = am.now();
                        ts.setFullYear(ts.getFullYear()+1);

                        var feedNum = data.feedNum || 1;

                        $tr = $('<tr class="am-clickable show"></tr>');
                        $tr.append('<td><div class="am-clickable delete"></div><span class="server" style="display:none"></span></td>');
                        $tr.append('<td><span class="comboSelectItemNames">' + data.name + '</span><span class="comboItemSetting am-clickable">设置</span></td>');
                        $tr.append('<td class="center"><span class="cost price am-clickable noDiscount">' + ((data.nowPrice === undefined)? (data.price||0) : data.nowPrice) + '</span></td>');
                        $tr.append('<td class="center numberTouch am-touchable"><div class="numberWrap"><div class="numberScroller"><div class="number"><span class="reduce am-clickable am-disabled"></span><span class="value am-clickable">'+feedNum+'</span><span class="plus am-clickable"></span></div><div class="unlimitText">不限次</div></div></div></td>');
	                    $tr.append('<td class="center"><span class="sItemPrice price am-clickable noDiscount">' + ((data.nowPrice === undefined)? data.price : data.nowPrice) + '</span></td>');
                        $tr.append('<td class="center"><div class="number date am-clickable">'+ts.format('yyyy/mm/dd')+'</div></td>');
                        $tr.append('<td class="center"><span class="gift checkbox am-clickable">赠送</span></td>');
                        $container.eq(1).append($tr.data("data", data)).parent().show();
                        if($container.eq(0).is(":empty")){
                            $container.eq(0).parent().hide();
                        }
                        setTimeout(function(){//动画正在运行  获取的位置不准确 必须异步！！ 
                            am.tips.unlimitComboItem($tr.find(".numberTouch"));
                        },500);
	                    
                    }
                    return $tr;
                },
                onPriceChange: function($ptr) {
                    var totalPrice = 0,costSum=0;
                    if(!this.$list.find("tr").length){
                        _this.$costEdit.removeClass('modifyed').html(0);
                    }
                    this.$list.find("tr").each(function() {
                        var $tr = $(this);
						var data = $tr.data("data");
                        var $price = $tr.find(".price:not(.cost)");
						var money = $price.text()*1 || 0;
                        if($ptr && $ptr[0]===this && $price.hasClass("sItemPrice")){
                            //自选项目
	                        var $num = $tr.find("div.number .value");
	                        if(!$num.parent().parent().hasClass("unlimit")){
	                            //如果不限次，爱怎么卖怎么卖, 限次要检查钱
		                        var $cost = $tr.find(".cost");//单次业绩
                                var onceMoney = $cost.text()*1 || 0;
                                var num = $num.text()*1 || 0;
		                        var sumMoney = Math.round(onceMoney* num*100)/100; //算出来的钱
		                        $tr.data("cost",0);
		                        if($price.hasClass("modifyed") && $cost.hasClass("modifyed")){
		                            //手动改过售价
			                        // if(money<sumMoney){
				                       //  //售价小了，报error，自动填算出来的钱
				                       //  //am.msg('项目售价不能小于单次业绩x次数！')
				                       //  atMobile.nativeUIWidget.showMessageBox({
					                      //   title: "提示",
					                      //   content: '限次项目的售卖价格不能小于单次业绩x次数！'
				                       //  });
				                       //  money=sumMoney;
				                       //  $price.text(sumMoney);
			                        // }else if(money>sumMoney){
				                       //  //售价多了，提示用户，超出来的钱算进成本
				                       //  //am.msg('项目售价大于单次业绩x次数,！');
				                       //  atMobile.nativeUIWidget.showMessageBox({
					                      //   title: "增加成本",
					                      //   content: '您输入的售卖价格(￥'+money+')超出单次业绩x次数(￥'+onceMoney+'x'+num+')，超出￥'+Math.round((money-sumMoney)*100)/100+'将计入套餐成本'
				                       //  });
				                       //  $tr.data("cost",(money-sumMoney));
                           //          }
		                        }else if($cost.hasClass("modifyed")){
                                    $cost.removeClass("modifyed");
                                    $price.text(Math.round(onceMoney*num*100)/100);
                                    money=sumMoney;
                                }else if($price.hasClass("modifyed")) {
                                    $price.removeClass("modifyed");
			                        $cost.text(Math.floor((money/num)*10000)/10000);
		                        }else{
		                            //没改过，用算出来的钱自动填进去
			                        money=sumMoney;
			                        $price.text(sumMoney);
		                        }
                            }else{
		                        $tr.data("cost",0);
                            }
                        }
						totalPrice += money;
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
                    if(costSum){
	                    txt= '<span style="font-size: 14px;color:#555;padding-right:10px;">套餐金额:￥'+toFloat(totalPrice)+'</span>总计:￥';
                    }
                    _this.$costEdit.text(costSum)
                    this.totalPrice = toFloat(totalPrice);
                    this.$totalPrice.html(txt+toFloat(totalPrice+costSum));
                },
                settingKey: "setting_seller",
                defaultSetting: null,
                dispatchSetting: function(settings) {
                    _this.billServerSelector.dispatchSetting(settings);
                },
                onSubmit: function() {
                    _this.submit();
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
                            $parentTd.html(newTpdElList.join(''));
                            itemData.tpd = tpd;
                            $parentTr.data('data', itemData);
                            self.comboCardItemSelector.hide();
                        }
                        var dialogTitleEl = self.comboCardItemSelector.find('.title'),
                            dialogContentEl = self.comboCardItemSelector.find('.scrollInner');
                        var itemTimesLabel = currentTpd.itemTimes == -99 ? '不限' : currentTpd.itemTimes + '次';
                        dialogTitleEl.find('h4 > span').remove();
                        dialogTitleEl.find('h4').append('<span>('+itemTimesLabel+')</span>');
                        dialogContentEl.html('');

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
	            changed && self.billMain.onPriceChange($(this).parent());
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
                    self.selectedServer = data;
	                if(this.$body.find('li.selected').length>0){
		                am.tips.perfSetting(self.billServerSelector.$.find('li[serverid='+data.id+']'));
	                }
                },
                onRemove: function(){
                    self.selectedServer = null;
                },
	            muti:true,
	            getTotalPerf:function () {
                    if(am.metadata.configs.combNotCalIntoAchiev=='true'){
                        return self.billMain.totalPrice;
                    }else {
                        return toFloat(self.billMain.totalPrice + self.$costEdit.text()*1);
                    }
	            }
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
		},
		renderItemTr: function () {
			var self = this;
			this.billMain.$list.find("tr").each(function (i,v) {
				var data = $(this).data('data');
				if(!data) return false;
				var $price = $(this).find("span.price");
				if ($price.hasClass("modifyed")) {
					//如果手改过价格，不算折扣
				} else {
					//如果没有手改过价格，算折扣
					if(self.member){
						data = self.changePrice(data,self.member);
						$price.text(data && data.nowPrice === undefined ? data.price : data && data.nowPrice);
					}else{
						$price.text(data.price || 0);
					}
				}
				self.billMain.onPriceChange($(this));
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
			var _this = this;
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
				if(am.metadata.configs && am.metadata.configs['EMP_SORT']){
					employeeList = JSON.parse(am.metadata.configs['EMP_SORT']);
					employeeList = am.getConfigEmpSort(employeeList);
				}
                this.billItemSelector.dataBind(this.processData(am.metadata.tpList));
                this.billItemSelector.setGroup(am.page.service.getGroupData.call(this));
                this.billServerSelector.dataBind(employeeList, ["销售"]);

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
                        if(itemn.id == item.id){
                            itemn.feedNum = item.number;
                            res.push(itemn);
                        }
                    }
                }
            }
            for(var k=0;k<res.length;k++){
                this.billMain.addItem(res[k]);
            }

        },
        afterShow: function(paras) {

        },
        beforeHide: function(paras) {
            this.billMain.hideMemberInfo();
            this.billItemSelector.typeFilterSelect && this.billItemSelector.typeFilterSelect.hide();
            this.$.find('.typeFilterWrap .result .val').removeData('data').text('选择项目大类').removeClass('selected');
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
            var balanceFee = this.member.balance-this.member.treatcardfee;
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
                    if(types[i].applyShopIds && types[i].applyShopIds.indexOf(am.metadata.userInfo.shopId) == -1){
                        continue;
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
        submit: function() {
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
                }
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
            opt.billingInfo.total= this.billMain.totalPrice;

            var hasZeroPrice = 0;
            for(var i = 0; i < $tr.length; i++){
                var $price = $tr.eq(i).find(".price");
                var price = $price.eq(0).text() * 1;
                if(price==0){
                    hasZeroPrice ++;
                }
            }
            for (var i = 0; i < $tr.length; i++) {
                var data = $tr.eq(i).data("data");
                var $price = $tr.eq(i).find(".price");
                var price = $price.eq(0).text() * 1;
                if(data.tpd){
                    // opt.cost += data.costMoney*1||0;
                    //opt.billingInfo.total += price;
                    var invaliddate = null;
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
                        "price":price,
                        "serviceItems":[],
                        "allowedSellEmpty":data.allowedSellEmpty,
                        "autoSellWithCombo":data.autoSellWithCombo,
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
                            cost = opt.cost*money/this.billMain.totalPrice;
                        }else{
	                        money = toFloat(price/data.tpd.length);
	                        cost = opt.cost*money/this.billMain.totalPrice;
                        }
                        if(hasZeroPrice){
                            var trCost =  opt.cost/$tr.length;
                            if(price){
                                if(data.price){
                                    cost = trCost*money/data.price;
                                }else {
                                    cost =  trCost/data.tpd.length;
                                }
                            }else {
                                cost = trCost/data.tpd.length;
                            }
                        }
                        //var itemnames = _this.getItemNamesByNos(data.tpd[i].timesItemNOs);
    					treatment.serviceItems.push({
						    "itemId": data.tpd[j].itemId,
						    "times": data.tpd[j].itemTimes,
						    "money": money,
						    "allPrice":cost+money,
						    "name":data.tpd[j].itemName || (data.tpd[j].timesItemNOs ? this.getItemNamesByNos(data.tpd[j].timesItemNOs,1).join(","):' '),
						    "invaliddate": itemInvalidDate ? itemInvalidDate.format('yyyy-mm-dd') : null,

						    "oncemoney":data.tpd[j].oncemoney || 0, // || toFloat(money/data.tpd[j].itemTimes)
						    "isNewTreatment":data.isNewTreatment,
						    "timesItemNOs":data.tpd[j].timesItemNOs,
						    "isFree":data.tpd[j].treatType,

						    "itemRemark":"",
                            "packageRemark":"",
                            "shopid": amGloble.metadata.userInfo.shopId
					    });
                    }
                    opt.comboCard.treatments.push(treatment);
                }else{
                    var $num = $tr.eq(i).find(".number .value");
                    var num = -99;
                    if(!$num.parent().parent().hasClass('unlimit')){
	                    num = $num.text()*1 || 0;
                    }
                    var invalidDate = $tr.eq(i).find(".date").text();
                    var onceMoney = $price.eq(0).text()*1;
	                var setMoney = $price.eq(1).text()*1;
                    var sMoney = num===-99 ? setMoney : Math.round(num*onceMoney*100)/100;
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
	                   //  opt.cost+=setMoney-sMoney;
                    // }
                    var cost = opt.cost*sMoney/this.billMain.totalPrice;
                    if(hasZeroPrice){
                        cost = opt.cost/$tr.length;
                    }
                    var singleItemData = {
	                    "itemId": -1,
	                    "times": num,
	                    "money": sMoney,
	                    "name":"",
	                    "invaliddate": invalidDate==="不限期" ? null:invalidDate.replace(/\//g,"-"),
	                    "isFree":$tr.eq(i).find("span.gift").hasClass("checked")?1:0,
                        "allPrice": sMoney+cost,
	                    "oncemoney":onceMoney,
	                    "isNewTreatment":1,
	                    "timesItemNOs":null,
	                    "itemRemark":"",
                        "packageRemark":"",
                        "shopid": amGloble.metadata.userInfo.shopId
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
	        opt.comboCard.servers = this.billServerSelector.getEmps();

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
                sendData.billRemark.buypackage.isbuy = true;
                _data.data = JSON.stringify(sendData);
                _this.saveBill(_data);
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
                                from:"comboCard"
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
                        $.am.changePage(am.page.pay, "slideup", {
                            comboitem: [],
                            option: opt,
                            member: member,
                            billRemark:_this.billRemark,
                            remarkCallback:remarkCallback,
                            from:"comboCard"
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
                var newTpd = [];
                    timesCount = 0;
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
            if(data.itemName==='项目已删除' || data.itemName==='项目已停用'){
                var itemLabel = "<p class='"+ createElementClass('label') +"'>" + data.itemName + "</p>";
                itemNumber = data.itemTimes == -99 ? '' : "<input placeholder='0次' name='itemTimes' disabled readonly class='am-clickable "+ createElementClass('times') +"'>";
            }else{
                var itemLabel = "<p class='"+ createElementClass('label') +"'>" + data.itemName + "</p>";
                itemNumber = data.itemTimes == -99 ? '' : "<input placeholder='次数' name='itemTimes' diaabled readonly class='am-clickable "+ createElementClass('times') +"'>";
            }
            // var itemCheckbox = "<span class='am-clickable " + createElementClass('checkbox') + "'><i class='iconfont icon-danxuan'></i><i class='iconfont icon-queren'></i></span>",
            // var itemLabel = "<p class='"+ createElementClass('label') +"'>" + data.itemName + "</p>";
            //     itemNumber = data.itemTimes == -99 ? '' : "<input placeholder='次数' name='itemTimes' diaabled readonly class='am-clickable "+ createElementClass('times') +"'>";

            return "<div class='"+ createElementClass('item') +"'>"+ itemLabel + itemNumber +"</div>";
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
                if (treatType == 1) {
                    itemnames = '赠：' + itemnames;
                }
            } else {
                itemnames = itemName || itemId;
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
