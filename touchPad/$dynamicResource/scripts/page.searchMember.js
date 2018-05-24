(function() {
    //http://192.168.3.182:8080/mgj-cashier/member/search
    var self = (am.page.searchMember = new $.am.Page({
        id: "page_searchMember",
        isWin: navigator.platform.indexOf("Win") == 0,
        backButtonOnclick: function() {
            if (this.backEvent && this.backEvent == 1) {
                this.changeresult(false);
            } else {
                /*if(amGloble.metadata.shopPropertyField.mgjBillingType == 1){
            		this.paras.onSelect(null);
            	}else{
            		$.am.page.back("slidedown");
            	}*/
                $.am.page.back("slidedown");
            }
            /*this.$.find("input,textarea").attr("disabled",true).attr("isdisabled",1);*/
        },
        init: function() {
            this.$input    = $("#page_searchMember .search_input");
            this.$btnGroup = this.$.find(".customerResult");
            this.$input
                .on("keyup", function(e) {
                    if (e.keyCode == 13) {
                        self.getData();
                    }
                })
                .on("focus", function() {
                    am.keyboard.hide();
                })
                .on("blur", function() {
                    am.keyboard.hide(true);
                });

            this.$scroller = this.$.find(".scroller");
            this.$fixedTable = this.$.find("> .fixedHead > table");
            this.$table = this.$scroller.children();

            this.$tbody = this.$table.children("tbody").on("vclick", "tr", function() {
                var item = $(this).data("item");
                if (!item.allowkd && item.shopId != am.metadata.userInfo.shopId) {
                    am.msg("此会员卡不允许跨店消费！");
                    return;
                }
                self.paras.onSelect(item);
                self.saveLastSelectMember(item, "s");
            });
            
            this.$tbody = $('.page_searchMember .serviceTable-warp').on('vclick','.list-body',function(){
                var item = $(this).data("item");
                if (!item.allowkd && item.shopId != am.metadata.userInfo.shopId) {
                    am.msg("此会员卡不允许跨店消费！");
                    return;
                }
                self.paras.onSelect(item);
                self.saveLastSelectMember(item, "s");
            }).on('vclick','.list-title-warp',function(){
                var id = $(this).data('customerId');
                $.am.changePage(am.page.memberDetails, "slideup",{
                    customerId:id,
                    tabId:1
                });
            });
            
            this.$tableTip = this.$scroller.find(".tip");

            this.$serviceTable = this.$.find('.serviceTable');
            this.$serviceTableWarp = this.$.find('.serviceTable-warp')
            // this.sc = new $.am.ScrollView({
            //     $wrap: this.$scroller,
            //     $inner: this.$table,
            //     direction: [0, 1]
            // });

            this.sc = new $.am.ScrollView({
                $wrap: this.$serviceTable,
                $inner: this.$serviceTableWarp,
                direction: [0, 1]
            });

            this.$.on("vclick", ".searchinput .ty_inputbox_icon", function() {
                self.$.find(".tabIndex li")
                    .eq(0)
                    .trigger("vclick");
                self.getData();
            })
                .on("vclick", ".footbutton", function() {
                    $.am.changePage(am.page.addMember, "slideup", self.paras);
                })
                .on("vclick", ".tabIndex li", function() {
                    var idx = $(this).index();
                    $(this)
                        .addClass("selected")
                        .siblings()
                        .removeClass("selected");
                })
                .on("vclick", ".searchMoreShop", function() {
                    var isActive = self.$btnGroup.hasClass("active");
                    self.$.find(".tabIndex li").eq(isActive?0:1).trigger("vclick");
                    if( $(this).parent().hasClass('active')){
                        $(this).parent().removeClass('active');
                    }else{
                        $(this).parent().addClass('active');
                    }
                    
                    self.getData(true);
                })
                .on("vclick", ".searchLastCard", function() {
                    var isSelected = $(this)
                        .find(".iconfont")
                        .hasClass("icon-checkbox");
                    if (!isSelected) {
                        $(this)
                            .find(".iconfont")
                            .addClass("icon-checkbox");
                        $(this)
                            .find(".iconfont")
                            .removeClass("icon-checkboxoutlineblank");
                        self.render(self.cacheData, true);
                    } else {
                        $(this)
                            .find(".iconfont")
                            .addClass("icon-checkboxoutlineblank");
                        $(this)
                            .find(".iconfont")
                            .removeClass("icon-checkbox");
                        self.render(self.cacheData, false);
                    }
                });
            // var data=[{"id":44260301,"name":"lu","mobile":"15827195158","sex":"M","lastphotoupdatetime":null,"points":0,"cardNo":"2015121244260301","cardName":"美一客会员","cardtype":2,"discount":0,"balance":0,"gift":0,"createDateTime":1472013791000,"comment":null,"cid":223051371,"timefee":null,"timeflag":0,"cardtimes":0,"treatpresentfee":0,"treatcardfee":0}];
            // this.render(data);

            this.$lastMember = this.$.find(".lastMember").on("vclick", ".lastMemberInfo", function() {
                var member = $(this).data("data");
                am.loading.show();
                am.api.queryMemberById.exec(
                    {
                        memberid: member.id
                    },
                    function(ret) {
                        am.loading.hide();
                        if (ret && ret.code == 0 && ret.content && ret.content.length) {
                            var selectedCard;
                            if (ret.content.length == 1) {
                                selectedCard = ret.content[0];
                            } else {
                                if (member.lastExpenseCategory == 2) {
                                    //如果是开卡，找到最新的卡
                                    ret.content.sort(function(a, b) {
                                        return b.cid - a.cid;
                                    });
                                    selectedCard = ret.content[0]; //self.paras.onSelect(ret.content[0]);
                                } else if (member.lastExpenseCategory == 4) {
                                    //如果是买程序，找默认套餐卡
                                    for (var i = 0; i < ret.content.length; i++) {
                                        if (ret.content[i].cardTypeId == 20161012) {
                                            selectedCard = ret.content[i]; //self.paras.onSelect(ret.content[i]);
                                            break;
                                        }
                                    }
                                }

                                if (!selectedCard) {
                                    //没有经过上面的流程，找到上次使用的卡
                                    for (var i = 0; i < ret.content.length; i++) {
                                        if (member.cid == ret.content[i].cid) {
                                            selectedCard = ret.content[i]; //self.paras.onSelect(ret.content[i]);
                                            break;
                                        }
                                    }
                                }
                                if (!selectedCard) {
                                    //上次使用的卡也不见了，找最新开的一张
                                    ret.content.sort(function(a, b) {
                                        return b.cid - a.cid;
                                    });
                                    selectedCard = ret.content[0];
                                }
                            }
                            if (selectedCard) {
                                if (am.operateArr.indexOf("MGJP") != -1) {
                                    selectedCard.realMobile = selectedCard.mobile;
                                    selectedCard.mobile = selectedCard.mobile.replace(/\d{4}$/, "****");
                                }
                                self.paras.onSelect(selectedCard);
                            } else {
                                am.msg("客户资料读取失败！");
                            }
                        } else {
                            am.msg("客户资料读取失败！");
                        }
                    }
                );
            });

            this.$lastMemberInfo = this.$lastMember.find(".lastMemberInfo").remove();
        },
        beforeShow: function(paras) {
            if (paras == "back") return;
            this.showkeyboard();
            if (this.isWin) {
                this.$input.focus();
            }
            this.$input.val("");
            self.changeresult();
            this.checkShowCrosShop();
            if (paras.addintroducer) {
                this.$.find(".foot").hide();
            } else {
                this.$.find(".foot").show();
            }
            this.paras = paras;
            this.paras._onSelect = this.paras.onSelect;
            this.paras.onSelect = function(card) {
                if (card && card.invaliddate) {
                    // var ts = new Date(card.invaliddate*1 || card.invaliddate);
                    // var n = new Date();
                    // if(ts){
                    // 	if(n.getFullYear()<=ts.getFullYear() && n.getMonth()<=ts.getMonth() && n.getDate()<=ts.getDate()){
                    // 		//(caption, description, okCaption, cancelCaption, scb, fcb)
                    // 	}else{
                    // 		am.confirm('已过期','此会员卡已过期，无法继续使用','知道了','返回');
                    // 		return;
                    // 	}
                    // }
                    var ts = new Date(card.invaliddate * 1 || card.invaliddate);
                    var n = new Date();
                    ts.setDate(ts.getDate() + 1);

                    if (ts) {
                        if (n.getTime() <= ts.getTime()) {
                            //(caption, description, okCaption, cancelCaption, scb, fcb)
                        } else {
                            // am.confirm('已过期','此会员卡已过期，无法继续使用','知道了','返回');
                            // return;
                            var cardType = am.metadata.cardTypeMap[card.cardTypeId];
                            if (cardType && cardType.expiredpayflag && cardType.expiredpayflag == "0" && am.operateArr.indexOf("U") == -1) {
                                //过期后不允许使用
                                am.confirm("已过期", "此会员卡已过期，无法继续使用", "知道了", "返回");
                                return;
                            } else {
                                am.msg("此会员卡已过期！");
                            }
                        }
                    }
                }
                this._onSelect(card);
            };

            var member = localStorage.getItem("tp_lastSelectMember_" + am.metadata.userInfo.userId);
            if (member) {
                try {
                    member = JSON.parse(member);
                } catch (e) {
                    member = null;
                }
                if (member) {
                    this.$lastMember.show().empty();
                    for (var i in member) {
                        var $mem = this.$lastMemberInfo.clone();
                        $mem.find(".name").text(member[i].name);
                        $mem.find(".mobile").text(member[i].mobile);
                        var $img = am.photoManager.createImage(
                            "customer",
                            {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: member.lastphotoupdatetime || ""
                            },
                            member[i].id + ".jpg",
                            "s"
                        );
                        $mem
                            .data("data", member[i])
                            .find(".img")
                            .html($img);
                        this.$lastMember.append($mem);
                    }
                } else {
                    this.$lastMember.hide();
                }
            } else {
                this.$lastMember.hide();
            }
        },
        checkShowCrosShop: function() {
            var userInfo = am.metadata.userInfo;
            if (userInfo.shopId == userInfo.parentShopId) {
                //单店
                this.$.find(".searchTit").addClass("hideCrosShop");
                this.$.find(".searchMoreShop,.searchTip").hide();
            } else {
                this.$.find(".searchTit").removeClass("hideCrosShop");
                this.$.find(".searchMoreShop");
            }
        },
        showkeyboard: function() {
            am.keyboard.show({
                onKeyup: function(value) {
                    self.$input.val(value);
                },
                $: $("#page_searchMember .searchnumber_box"),
                submit: function(value) {
                    self.$input.val(value);
                },
                onConfirm:function(){
                    self.getData();
                },
            });
        },
        afterShow: function(paras) {
            am.tab.main.hide();
            setTimeout(function() {
                self.$.find("[isdisabled=1]")
                    .attr("disabled", false)
                    .removeAttr("isdisabled");
                if (self.isWin) {
                    self.$input.focus();
                }
            }, 50);

            if (paras == "back") return;
        },
        beforeHide: function(paras) {
            
        },
        afterHide: function() {
            this.$.find("input,textarea")
                .attr("disabled", true)
                .attr("isdisabled", 1);
        },
        changeresult: function(flag) {
            if (flag) {
                self.$.find(".pagecontent")
                    .hide()
                    .end()
                    .find(".searchresult")
                    .show();
                self.backEvent = 1;
            } else {
                this.$.find(".searchLastCard").find(".iconfont").removeClass("icon-checkbox").addClass("icon-checkboxoutlineblank");
                this.$btnGroup.removeClass("active");
                self.$.find(".pagecontent")
                    .show()
                    .end()
                    .find(".searchresult")
                    .hide();
                self.backEvent = 0;
                self.$input.val("");
                this.showkeyboard();
                self.$.find(".tabIndex li").eq(0).trigger("vclick");
            }
        },
        render: function(data, hideIf) {
            this.cacheData = data;
            var $tbody = this.$tbody;
            var ishide = this.$.find(".searchLastCard .icon-checkbox").size();
            $tbody.empty();
            if (!data || !data.length) {
                am.msg("暂无数据");
                self.changeresult(true);
                this.$btnGroup.addClass("empty");
                this.$.find('.serviceTable-warp').html('');
            } else {
                if (data.length == 1 && (data.allowkd || data.shopId == am.metadata.userInfo.shopId)) {
                    //只有一条数据 直接选中
                    self.paras.onSelect(data[0]);
                    return;
                }
                self.changeresult(true);
                this.$tbody.show();
                this.$btnGroup.removeClass("empty");
                var _filterData = this.filterData(data,hideIf);
                this.renderList(_filterData);
                // $.each(data, function(i, item) {
                //     var cardtype = "",
                //         balance = am.cashierRound(item.balance) + "元",
                //         gift = item.gift + "元";
                //     if (ishide) {
                //         if ((item.invaliddate && Number(item.invaliddate) < new Date().getTime())) {
                //             return true;
                //         }
                //         if(item.balance == 0 && item.cardtype == 1){
                //             return true;
                //         }
                //     }

                //     if (am.operateArr.indexOf("MGJP") != -1) {
                //         item.realMobile = item.mobile;
                //         item.mobile = item.mobile.replace(/\d{4}$/, "****");
                //     }

                //     if (item.cardtype == 2) {
                //         cardtype = "现金消费卡";
                //     } else if (item.timeflag == 0) {
                //         cardtype = "储值卡";
                //     } else if (item.timeflag == 1) {
                //         cardtype = "<span class='red'>计次消费</span>";
                //         balance = balance + "<br><span class='red'>剩余" + (item.cardtimes || 0) + "次</span>";
                //     } else if (item.timeflag == 2) {
                //         cardtype = "<span class='red'>套餐消费</span>";
                //         balance = balance + "<br><span class='red'>套餐:" + (item.treatcardfee || 0) + "元</span>";
                //         gift = gift + "<br><span class='red'>套餐:" + (item.treatpresentfee || 0) + "元</span>";
                //     } else if (item.timeflag == 3) {
                //         cardtype = "<span class='red'>年卡消费</span>";
                //     }
                //     var $tr = $(
                //         [
                //             '<tr class="am-clickable">',
                //             "    <td>" + item.name + "</td>",
                //             "    <td>" + am.processPhone(item.mobile) + "</td>",

                //             "    <td>" + cardtype + "</td>",
                //             "    <td>" + item.cardName + "</td>",
                //             "    <td>" + item.cardNo + "</td>",
                //             "    <td>" + (item.discount == null ? 0 : item.discount) + "</td>",
                //             "    <td>" + balance + "</td>",
                //             "    <td>" + gift + "</td>",
                //             "    <td>" + item.points + "</td>",
                //             // '    <td>' + new Date(item.createDateTime).format("yyyy-mm-dd") + '</td>',
                //             '    <td><div class="comment">' + self.getShopName(item.shopId) + "</div></td>",
                //             '    <td><div class="comment">' + (item.cardComment || "--") + "</div></td>",
                //             '    <td><div class="comment">' + (item.comment || "--") + "</div></td>",
                //             "</tr>"
                //         ].join("")
                //     );
                //     $tr.data("item", item);

                //     $tbody.append($tr);
                // });

                this.resetHeight();
                this.sc.refresh();
                this.sc.scrollTo("top");
            }
            var txt = "";
            if (
                this.$.find(".search_input")
                    .val()
                    .indexOf("*0102") === 0
            ) {
                txt = "扫码搜索";
            }

            var isActive = self.$btnGroup.hasClass("active");
            if(isActive){
                txt = "在本店中搜索：" + this.$.find(".search_input").val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "");
                this.$.find(".search_input")
                this.$.find('.searchresult').removeClass('active');
            }else{
                txt = "在分店中搜索：" + this.$.find(".search_input").val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "");
                this.$.find('.searchresult').addClass('active');
            }
            this.$.find('.title').text(txt)
        },

        filterData:function(data, hideIf){
            var itemObj = {};
            $.each(data, function(i, item) {
                if(hideIf){
                    if ((item.invaliddate && Number(item.invaliddate) < new Date().getTime())) {
                        return true;
                    }
                    if(item.balance == 0 && item.cardtype == 1){
                        return true;
                    }
                }
                if(!itemObj[item.id]){
                    itemObj[item.id] = [item]; 
                }else{
                    itemObj[item.id].push(item) 
                }
            });
            return itemObj
        },

        renderList:function(filterData){
            console.log(filterData)
            var $serviceTableWarp = $('.page_searchMember .serviceTable .serviceTable-warp');
            $serviceTableWarp.html('');

            $.each(filterData, function(i, item) {
                var itemIndex = item[0];
                var $listWarp = $('<div class="list-warp"></div>');
                var $listAvatar = $('<div class="list-left"><div class="list-avatar"></div></div>');
                var $listRight = $('<div class="list-right"><dl class="list-content"></dl></div>');
                var $dt = '';
                $listAvatar.find('.list-avatar').html(am.photoManager.createImage("customer", {
                        parentShopId: am.metadata.userInfo.parentShopId,
                        updateTs: itemIndex.lastphotoupdatetime || ""
                    }, itemIndex.id + ".jpg", "s"));
                if(itemIndex.comment){
                    $dt = $('<dt class="list-title-warp am-clickable"><div class="name"> '+itemIndex.name+'  （'+ self.getShopName(itemIndex.shopId)+'）</div><div class="phone"><i class="icon iconfont icon-44"></i> '+ am.processPhone(itemIndex.mobile) +' </div><div class="score"><i class="icon iconfont icon-jifen"></i> 积分 ：'+itemIndex.points+'</div><div class="mark"><i class="icon iconfont icon-24_beizhu"></i> 备注 ：'+itemIndex.comment+'</div></dt>')
                }else{
                    $dt = $('<dt class="list-title-warp am-clickable"><div class="name"> '+itemIndex.name+'  （'+ self.getShopName(itemIndex.shopId)+'）</div><div class="phone"><i class="icon iconfont icon-44"></i> '+ am.processPhone(itemIndex.mobile) +' </div><div class="score"><i class="icon iconfont icon-jifen"></i> 积分 ：'+itemIndex.points+'</div></dt>')
                }
                $listRight.find('.list-content').append($dt.data('customerId',itemIndex.id));
                for (var index = 0; index < item.length; index++) {
                    var _item = item[index];

                    var $dd = $('<dd  class="list-body am-clickable"></dd>');
                    $dd.data("item", _item);
                    var _html = '';
                    var  imgType = '';
                    if ((_item.cardtype == "1")) {
						if (_item.timeflag == "2") {
							imgType='type_zero';
						} else {
							imgType='type_one';
						}
					} else {
                        imgType='type_two';
                    }
                    var cardtype = "",
                            balance = "<span class='red'>￥"+am.cashierRound(_item.balance)+"</span>",
                            gift = "<span class='red'>￥"+_item.gift+"</span>";
                    if (am.operateArr.indexOf("MGJP") != -1) {
                        _item.realMobile = _item.mobile;
                        _item.mobile = _item.mobile.replace(/\d{4}$/, "****");
                    }

                    if (_item.cardtype == 2) {
                        cardtype = "现金消费卡";
                    } else if (_item.timeflag == 0) {
                        cardtype = "储值卡";
                    } else if (_item.timeflag == 1) {
                        cardtype = "<span class='red'>计次消费</span>";
                        balance = balance + "<span class='red'>  剩余" + (_item.cardtimes || 0) + "次</span>";
                    } else if (_item.timeflag == 2) {
                        cardtype = "<span class='red'>套餐消费</span>";
                        balance = balance + "  套餐 <span class='red'>￥" + (_item.treatcardfee || 0) + "</span>";
                        gift = gift + "  套餐 <span class='red'>￥" + (_item.treatpresentfee || 0) + "</span>";
                    } else if (_item.timeflag == 3) {
                        cardtype = "<span class='red'>年卡消费</span>";
                    }

                    if(_item.cardtype==1){
                        _html = '<div class="card"><span class="cardImg '+ imgType+'"></span>'+ _item.cardName +'('+ _item.cardNo +')</div><div class="rest-money">余额 '+ balance +'</div><div class="rest-money">赠金 '+ gift +'</div><div class="money">折扣 <span class="red">'+(_item.discount == null ? 0 : _item.discount)+' </span> 折 </div>' ;
                    }else{
                        _html = '<div class="card"><span class="cardImg '+ imgType+'"></span>'+ _item.cardName +'('+ _item.cardNo +')</div><div class="money"> <span class="red" >资格卡</span></div><div class="money">折扣 <span class="red">'+(_item.discount == null ? 0 : _item.discount)+' </span> 折 </div>' ;
                    }

                    // _html = '<div class="card"><span class="cardImg '+ imgType+'"></span>'+ _item.cardName +'('+ _item.cardNo +')</div> <div class="money"> '+ cardtype +'</div> <div class="rest-money">余额 <b>￥'+ balance +'</b></div><div class="rest-money">赠金 <b>￥'+gift +'</b></div><div class="money">折扣 <b>'+(_item.discount == null ? 0 : _item.discount)+' </b> 折 </div>' ;

                    if(_item.cardComment){
                        _html+= '<div class="mark">备注 ：'+_item.cardComment+'</div>'
                    }
                    var $html = $(_html)
                    
                    $dd.append(_html);
                    $listRight.find('.list-content').append($dd);
                }
                $listWarp.append($listAvatar).append($listRight)
                $serviceTableWarp.append($listWarp)
            })
        },

        resetHeight:function(){
            //计算表格高度
            //顶部110 高度 底部55
            // var h = $('body').height();
            // var maxHeight = h-110-90;
            // var bheight   = this.$.find(".scroller table").height();
            // if(bheight>maxHeight){
            //     this.$.find(".scroller").css("max-height",maxHeight + "px");
            // }else{
            //     this.$.find(".scroller").css("max-height",bheight + "px");
            // }

            var h = $('body').height();
            var maxHeight = h-110-100;
            // debugger;
            var bheight   = this.$.find(".serviceTable .serviceTable-warp").height();
            if(bheight>maxHeight){
                this.$.find(".serviceTable").css("max-height",maxHeight + "px");
            }else{
                this.$.find(".serviceTable").css("max-height",bheight + "px");
            }
            var w =  this.$.find(".serviceTable .serviceTable-warp").width();
            var markMax = '';
            if($('body').height()<1100){
             markMax = w - 75-231-181-181-101-50;
            }else{
             markMax = w - 75-306-111-231-231-6;
            }
            this.$.find(".list-body  .mark").css("width",markMax + "px");
            
        },
        getShopName: function(id) {
            for (var i = 0; i < am.metadata.shopList.length; i++) {
                if (am.metadata.shopList[i].shopId == id) {
                    return am.metadata.shopList[i].osName;
                }
            }
            return "--";
        },
        getshopIds: function(id) {
            var res = [];
            var shopList = am.metadata.shopList;
            for (var i = 0; i < shopList.length; i++) {
                if (shopList[i].shopId != id) {
                    res.push(shopList[i].shopId);
                }
            }
            return res.join(",");
        },
        getData: function(norefresh, hideTable) {
            var self = this,
                idx;
            var isActive = self.$btnGroup.hasClass("active");
            if (isActive) {
                shopIds = this.getshopIds(am.metadata.userInfo.shopId);
                self.$btnGroup.removeClass("active");
            } else {
                shopIds = am.metadata.userInfo.shopId;
                self.$btnGroup.addClass("active");
            }
            var keywords = this.$.find(".search_input")
                .val()
                .replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "");
            this.$.find(".search_input").val(keywords);
            if (keywords == "") {
                am.msg("输入会员手机号或名称搜索！");
                return;
            }
            keywords = keywords.replace('j0102','*0102');
            am.loading.show("正在获取数据，请稍候...");
            am.api.searchmember.exec(
                {
                    parentShopId: am.metadata.userInfo.parentShopId,
                    shopId: am.metadata.userInfo.shopId,
                    shopIds: shopIds,
                    keyword: keywords,
                    pageSize: 1500,
                    pageNumber: 0
                },
                function(ret) {
                    am.loading.hide();
                    if (ret.code == 0) {
                        // console.log(ret);
                        self.data = ret.content;
                        self.render(ret.content);
                    } else {
                        am.msg(ret.message || "数据获取失败，请重试！");
                    }
                }
            );
        },
        //type p||s
        saveLastSelectMember: function(member, type) {
            // 4
            var lastMember;
            try {
                lastMember = JSON.parse(localStorage.getItem("tp_lastSelectMember_" + am.metadata.userInfo.userId));
            } catch (e) {}
            var filterMember;
            if (lastMember) {
                for (var i = 0; i < lastMember.length; i++) {
                    if (lastMember[i].id == member.id) {
                        filterMember = lastMember[i];
                        break;
                    }
                }
            }
            if (filterMember) {
                filterMember.cid = member.cid;
                filterMember.lastExpenseCategory = member.lastExpenseCategory;
                localStorage.setItem("tp_lastSelectMember_" + am.metadata.userInfo.userId, JSON.stringify(lastMember));
            } else {
                if (!lastMember) lastMember = [];
                lastMember.push(member);
                if (lastMember.length > 4) {
                    lastMember.shift();
                }
                localStorage.setItem("tp_lastSelectMember_" + am.metadata.userInfo.userId, JSON.stringify(lastMember));
            }
        }
    }));
})();
