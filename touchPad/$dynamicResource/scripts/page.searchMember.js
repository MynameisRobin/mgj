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
            this.$input = $("#page_searchMember .search_input");
            this.$btnGroup = this.$.find(".customerResult");
            this.$input
                .on("keyup", function(e) {
                    if (e.keyCode == 13) {
                        self.searchKeywords = self.$.find(".search_input").val();
                        self.getData();

                        sessionStorage.keyboardCtrl_A = 'prevent';

                        //为兼容 回车键的keyup事件跟选择会员卡界面的快捷功能 做的延迟
                        clearTimeout(time);
                        var time = null;
                        if(!time) {
                            time = setTimeout(function() {
                                sessionStorage.keyboardCtrl_A = 'post';
                            }, 500);
                        }else {}

                    }
                    am.listSelect.hide();
                })
                .on("focus", function() {
                    am.keyboard.hide();
                })
                .on("blur", function() {
                    am.keyboard.hide(true);
                }).on("input",function(){
                    var $this = $(this),
                        val = $this.val();
                    if (val === "0" || val) {
                        var timer = ''
                        if (timer && timer.clearExecuted) {
                            timer.clearExecuted();
                            timer = am.listSelect.handleTimer(function () {
                                self.optimizeCardandCustomer($this, val);
                            }, 500);
                        } else {
                            timer = am.listSelect.handleTimer(function () {
                                self.optimizeCardandCustomer($this, val);
                            }, 500);
                        }
                    } else {
                        am.listSelect.hide();
                    }
                });

            this.$scroller = this.$.find(".scroller");
            this.$fixedTable = this.$.find("> .fixedHead > table");
            this.$table = this.$scroller.children();

            this.$tbody = this.$table.children("tbody").on("vclick", "tr", function() {
                var item = $(this).data("item");
                if (!(item.allowkd*1) && item.shopId != am.metadata.userInfo.shopId) {
                    am.msg("此会员卡不允许跨店消费！");
                    return;
                }
                self.paras.onSelect(item);
                self.saveLastSelectMember(item, "s");
            });
            
            this.$tbody = $('.page_searchMember .serviceTable-warp').on('vclick','.list-body',function(){
                console.log(self.allData);
                var $this=$(this);
                var item = $this.data("item");
                var fn=function(){
                    var $lock = $this.parents(".list-right").prev(".list-left").find(".list-avatar");
                    if (!(item.allowkd * 1) && item.cardshopId != am.metadata.userInfo.shopId) {
                        am.msg("此会员卡不允许跨店消费！");
                        return;
                    }
                    item.openbill = 0;
                    if (self.allData && self.allData[item.id]) {
                        item.cardNum = self.allData[item.id].length;
                    }
                    if ($lock.hasClass("lock")) {
                        //会员已锁,查看是否有U.允许过期或锁定的会员仍然可以输入水单
                        if (am.metadata.userInfo.operatestr.indexOf("U,") == -1) {
                            am.unLock({
                                memberId: item.id,
                                locking: 1,
                                cb: function () {
                                    item.locking = 1;
                                    $lock.removeClass("lock");
                                    self.paras.onSelect(item);
                                    self.saveLastSelectMember(item);
                                }
                            });
                            return;
                        }
                        console.log("有允许锁定会员消费权限");
                    }
                    self.paras.onSelect(item);
                    self.saveLastSelectMember(item, "s");
                };
                if (amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && item) {
                    am.pw.check(item, function (verifyed) {
                        if (verifyed) {
                            fn();
                        }
                    });
                } else {
                    fn();
                }
            }).on('vclick','.list-title-warp,.list-left',function(){
				var index = $(this).parent().index();
				var listWarpIndex = $(this).parents(".list-warp").index();
                var id = $(this).parents('.list-warp').data('customerId');
                $.am.changePage(am.page.memberDetails, "slideup",{
                    customerId:id,
					tabId:1,
					index: index,
					listWarpIndex:listWarpIndex
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
                self.searchKeywords = self.$.find(".search_input").val();
                self.getData();
                am.listSelect.hide();
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

            //开单模式切换
            this.$.find(".o-title span").vclick(function(){
                $(this).addClass("active").siblings().removeClass("active");
                if($(this).hasClass('memberBill')){
                    self.$.find(".pagecontent").show().end().find(".qrcode,.open-wx").hide();
                }else if($(this).hasClass('autoBill')){
                    //检查是否开通了小程序
                    if(am.metadata.shopPropertyField && am.metadata.shopPropertyField.openSmallProgram){
                        self.getQrCode();
                        self.$.find(".qrcode").show().end().find(".open-wx,.pagecontent,.searchresult").hide();
                    }else{
                        self.$.find(".open-wx").show().end().find(".qrcode,.pagecontent,.searchresult").hide();
                    }
                }
            });
            //我要开通(小程序)
            this.$.find(".btn.open").vclick(function(){
                window.open("http://cn.mikecrm.com/pKDAmFu","_blank", "location=yes");
            });
            //切散客
            this.$.find(".icon-tuandui").vclick(function(){
                self.paras.onSelect(null);
            });
            //预约开单
            this.$.find(".icon-ziyuan11").vclick(function(){
                var opt = {
                    openbill: 1
                }
                if(self.paras && self.paras.displayId){
                    opt.displayId = self.paras.displayId;
                }
                $.am.changePage(am.page.reservation, "slideup", opt);
            });
            //点击最近的会员
            this.$lastMember = this.$.find(".lastMember").on("vclick", ".lastMemberInfo", function() {
                // 校验密码
                var member = $(this).data("data");
                if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && member){
                    am.pw.check(member, function (verifyed) {
                        if (verifyed) {
                            self.queryMemberFn(member);
                        }
                    });
                }else{
                    self.queryMemberFn(member);
                }
				// var member = $(this).data("data");
                // self.queryMemberFn(member);
            });
            this.$lastMemberInfo = this.$lastMember.find(".lastMemberInfo").remove();

            this.$waiting = this.$.find('.waiting').on('vclick','.seat',function(){
                var data = $(this).data('data');
                if(self.paras && !self.paras.openbill){
                    var jsonData = JSON.parse(data.data);
                    self.queryMemberFn({
                        id:data.memId,
                        cid: jsonData?jsonData.cid:'',
                        needDeletedWaitedBillId: data.id
                    });
                }else {
                    if(self.paras && self.paras.displayId){
                        data.displayId = self.paras.displayId;
                    }
                    $.am.changePage(am.page.openbill, 'slideup',{rowdata:data,source:'service'});
                }
            });
            this.$waitingItem = this.$waiting.find('.seat').remove();
            this.waitingScroll = new $.am.ScrollView({
				$wrap : this.$waiting.find('.waiting-wrapper'),
                $inner : this.$waiting.find('.waiting-inner'),
                direction : [false, true],
                hasInput: false
			});
        },
        // 顾客搜索优化
        optimizeCardandCustomer: function ($dom, val) {
            // am.api.optimizeCardandCustomer.exec({
            //     "shopId": am.metadata.userInfo.shopId,
            //     "keyword": val
            // }, function (res) {
            //     am.loading.hide();
            //     console.log(res);
            //     if (res.code == 0) {
            //         console.log(res);
            //         am.listSelect.show({
            //             $: $dom.parents('.searchinput'),
            //             data: res.content
            //         });
            //     } else {}
            // });
        },
        //查询会员信息
        queryMemberFn:function(member){
            var self = this;
            var uuid = '';
			if(!member) return am.msg("没有查询到会员信息");
			if(am.isMemberLock(member.lastconsumetime || member.lastConsumeTime,member.locking)){
				//会员已锁,查看是否有U.允许过期或锁定的会员仍然可以输入水单
				if(am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					return am.msg("会员被锁定,请在会员详情解锁~");
				}
			}
            am.api.queryMemberById.exec({
                memberid: member.id || member.memberid
            },function (ret) {
                am.loading.hide();
                if (ret && ret.code == 0 && ret.content && ret.content.length) {
                    var selectedCard;
                    if (ret.content.length == 1) {
                        selectedCard = ret.content[0];
                    } else {                     
                        if (member.lastExpenseCategory == 2) {
                            //如果是开卡，找到最新的卡
                            ret.content.sort(function (a, b) {
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
                            ret.content.sort(function (a, b) {
                                return b.cid - a.cid;
                            });
                            selectedCard = ret.content[0];
                        }
                    }
                    if (selectedCard) {
                        if (am.operateArr.indexOf("MGJP") != -1) {
                            selectedCard.realMobile = selectedCard.mobile;
                            selectedCard.mobile = selectedCard.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'); //手机号隐藏中间四位
                        }
                        //推送
                        if(member.actionType == 7){
                            //如果是自助开单推送，选择对应卡
                            for (var i = 0; i < ret.content.length; i++) {
                                if (ret.content[i].cid == member.cid) {
                                    selectedCard = ret.content[i];
                                    break;
                                }
                            }
                            //是否自助扫码开单，1是0否
                            selectedCard.openbill = 1;
                            selectedCard.uuid = member.uuid;
                        }else{
                            selectedCard.openbill = 0;
                        }
						console.info(self.paras);
						if(am.isMemberLock(selectedCard.lastconsumetime || selectedCard.lastConsumeTime,selectedCard.locking)){
							//会员已锁,查看是否有U.允许过期或锁定的会员仍然可以输入水单
							if(am.metadata.userInfo.operatestr.indexOf("U,") == -1){
								am.unLock({
									memberId: selectedCard.id,
									locking: 1,
									cb: function() {
										selectedCard.locking = 1;
										self.paras && self.paras.onSelect(selectedCard);
									}
								});
								return;
							}
                        }
                        if(member.needDeletedWaitedBillId){
                            selectedCard.needDeletedWaitedBillId = member.needDeletedWaitedBillId;
                        }
                        self.paras && self.paras.onSelect(selectedCard);
                    } else {
                        am.msg("客户资料读取失败！");
                    }
                } else {
                    am.msg("客户资料读取失败！");
                }
            });
        },
        //获取小程序二维码
        getQrCode: function () {
            var self = this;
            var uuid = "mgj" + getUuid() + getUuid();
            var scene = "" + am.metadata.userInfo.shopId + "," +uuid;
            var url = config.gateway + "/mgj-cashier/comment/qrCode?" + $.param({
                parentShopId: am.metadata.userInfo.parentShopId,
                token:am.metadata.userInfo.mgjtouchtoken,
                tenantId: am.metadata.userInfo.parentShopId,
                page: "pages/mine/index",
                scene: scene
            });
            //get方式放入二维码
            var ewm = $('<img src="' + url + '"/>');
            console.info(url)
            // localStorage.uuid = uuid;
            localStorage.setItem("uuid_" + am.metadata.userInfo.userId, uuid);
            self.$.find(".ewm").html(ewm);
            //用于生成uuid
            function getUuid() {
                var num  = '' + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                return num;
            }
        },
        isOpenbill: function (paras) {
            var openbill = localStorage.openbill || "";
            if (paras && paras.openbill) {
                this.$.addClass("openbillShow").end().find(".pagecontent,.searchresult").hide();
                //读取上次是否是自助开单
                if (openbill == "1") {
                    this.$.find(".autoBill").trigger("vclick");
                    //检查是否开通了小程序
                    if(am.metadata.shopPropertyField && am.metadata.shopPropertyField.openSmallProgram){
                        self.getQrCode();
                        this.$.find(".qrcode").show().end().find(".pagecontent,.searchresult,.open-wx").hide();
                    }else{
                        this.$.find(".open-wx").show().end().find(".qrcode,.pagecontent,.searchresult").hide();
                    }
                }else{
                    this.$.find(".memberBill").trigger("vclick");
                    this.$.find(".pagecontent").show().end().find(".qrcode,.open-wx").hide();
                }
            } else {
                this.$.removeClass("openbillShow");
                this.$.find(".pagecontent").show().end().find(".qrcode,.open-wx").hide();
            }
        },
        setHangUpNum: function (i) {
			if (i) {
				this.$.find('.icon-ziyuan11 .num').show().text(i);
			} else {
				this.$.find('.icon-ziyuan11 .num').hide().text("");
			}
		},
        beforeShow: function(paras) {
            if(!(paras && paras.notNeedWaiting)){
                this.waiting();
            }
            if (paras == "back") return;
            this.showkeyboard();
            if (this.isWin) {
                this.$input.focus();
            }
            this.$input.val("");
            self.changeresult();
            this.checkShowCrosShop();
            this.isOpenbill(paras);//是否开单
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
                        // $mem.find(".mobile").text(member[i].mobile);   realMobile
                        if(am.operateArr.indexOf("MGJP") !=-1){// 敏感权限 //手机号隐藏中间四位
                            var fakePhone=am.processPhone(member[i].mobile);
                            $mem.find(".mobile").text(fakePhone);
                        }else{
                            $mem.find(".mobile").text(member[i].realMobile||member[i].mobile);
                        }
                        var $img = am.photoManager.createImage(
                            "customer",
                            {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: member.lastphotoupdatetime || ""
                            },
                            member[i].id + ".jpg",
                            "s"
                        );
                        $mem.data("data", member[i]).find(".img").html($img);
                        if(member[i].mgjIsHighQualityCust == 1){
                            $mem.find(".img").addClass("good");
                        }else{
                            $mem.find(".img").removeClass("good");
						}
						//已锁定
						if(am.isMemberLock(member[i].lastConsumeTime || member[i].lastconsumetime,member[i].locking)){
                            $mem.find(".img").addClass("lock");
						}else{
                            $mem.find(".img").removeClass("lock");
						}
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
                    self.searchKeywords = self.$.find(".search_input").val();
                    self.getData();
                },
            });
        },
        afterShow: function(paras) {
            //不允许搜索分店会员
            var ifm=am.metadata.userInfo.operatestr.split(',').indexOf('T1');
            if(ifm!=-1){
                self.$.find('.searchFooter').css({
                    display:'none'
                })
            }

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
        afterHide: function() {
            this.$.find("input,textarea").attr("disabled", true).attr("isdisabled", 1);
            this.$waiting.hide();
        },
        waiting: function(){
            if(amGloble.metadata.shopPropertyField.mgjBillingType == 1 && amGloble.metadata.configs.workStationSwitch=='true'){
                this.getWaitingData();
            }else {
                this.$waiting.hide();
            }
        },
        getWaitingData: function(){
            var user = am.metadata.userInfo;
            am.api.hangupList.exec({
                "shopId": user.shopId,
                "parentShopId":user.parentShopId,
                "status": 3,
                "pageSize": 99999, //可选，如果有则分页，否则不分页
                "channel":1
            }, function(ret) {
                if (ret.code == 0) {
                    self.renderWaiting(ret.content);
                }else {
                    self.$waiting.hide()
                }
            });
        },
        renderWaiting: function(data){
            this.$waiting.find('.list').empty();
            if (this.seatMachineBox && this.seatMachineBox.length > 0) {
                for (var i = 0; i < this.seatMachineBox.length; i++) {
                    clearInterval(this.seatMachineBox[i]);
                }
            }
            if(data && data.length){
                data.sort(function(a,b){
                    return b.createDateTime - a.createDateTime;
                });
                this.seatMachineBox = [];
                var sdtime=amGloble.metadata.sdTime ? amGloble.metadata.sdTime*3600*1000:3*3600*1000;
                for(var i=0;i<data.length;i++){
                    if(data[i].tableId){
                        if((new Date().getTime()-data[i].createDateTime)>(60*60*1000)){
                            continue;
                        }
                        var $item = this.$waitingItem.clone(true,true);
                        var info = am.cashierTab.getSeatInfo(data[i].tableId);
                        $item.find('.info .name').text(info.tableName || '');
                        $item.find('.bill .header').html(data[i].memId==-1?'':am.photoManager.createImage("customer", {
                            parentShopId: am.metadata.userInfo.parentShopId,
                            updateTs: data[i].lastphotoupdatetime || ""
                        }, data[i].memId + ".jpg", "s",data[i].photopath||''));
                        $item.find('.bill .name').text(data[i].memId==-1?'散客':data[i].memName);
                        var rate = 1 - ((new Date().getTime()-data[i].createDateTime)/(60*60*1000));
                        $item.css('opacity',0.7+0.3*rate);
                        this.$waiting.find('.list').append($item.data('data',data[i]));
                        var item = data[i];
                        var $ts = $item.find('.time');
                        var nowtime=am.now();
                        if(nowtime-item.createDateTime<sdtime){
                            $ts.text(am.page.hangup.calcTime(0, item.createDateTime));
                        }
                        if(nowtime-item.createDateTime>sdtime){
                            $ts.text(am.page.hangup.calcTime(0, item.createDateTime));
                        };
                        var tsMachineNo = setInterval(function() {                    	
                            var nowtime=am.now();
                            var jgtime=nowtime-item.createDateTime;			           
                            if(jgtime>sdtime){
                                $ts.text(am.page.hangup.calcTime(0, item.createDateTime));
                            }else{
                                $ts.text(am.page.hangup.calcTime(0, item.createDateTime)); 
                            }                  
                        }, 1000);
                        if (tsMachineNo) {
                            self.seatMachineBox.push(tsMachineNo);
                        }
                    }
                }
                this.$waiting.show();
                this.waitingScroll.refresh();
                this.waitingScroll.scrollTo('top');
            }else {
                this.$waiting.hide();
            }
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
                // if (data.length == 1 && (data[0].allowkd || data[0].shopId == am.metadata.userInfo.shopId)) {
                //     //只有一条数据 直接选中
                //     data[0].cardNum = 1;
                //     self.paras.onSelect(data[0]);
                //     return;
                // }
                self.changeresult(true);
                this.$tbody.show();
                this.$btnGroup.removeClass("empty");
                var _filterData = this.filterData(data,hideIf);
                this.renderList(_filterData);
                //this.resetHeight();
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
                txt = "在本店中搜索：" + this.$.find(".search_input").val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "").replace('*0102','');
                this.$.find(".search_input")
                this.$.find('.searchresult').removeClass('active');
            }else{
                txt = "在分店中搜索：" + this.$.find(".search_input").val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "").replace('*0102','');
                this.$.find('.searchresult').addClass('active');
            }
            this.$.find('.title').text(txt)
        },

        filterData:function(data,hideIf){
            var itemObj = {};
            var invalidKey = 'invalid';
            $.each(data, function(i, item) {
                if(hideIf){
                    if (
                        (item.invaliddate && Number(item.invaliddate) < new Date().getTime()) || //已过期
                        (!item.balance && !item.gift && item.cardtype==1)  //如果是没有余客的储值卡
                    ) {
                        if(!itemObj[item.id+invalidKey]){
                            itemObj[item.id+invalidKey] = [item]; 
                        }else if(item.cardTypeId === '20151212'){
                            //如果是散客卡，放到第一个
                            itemObj[item.id+invalidKey].unshift(item);
                        }else{
                            //不是散客卡往后追加
                            itemObj[item.id+invalidKey].push(item);
                        }
                        return true;
                    }
                }
                if(!itemObj[item.id]){
                    itemObj[item.id] = [item]; 
                }else if(item.cardTypeId === '20151212'){
                    //如果是散客卡，放到第一个
                    itemObj[item.id].unshift(item);
                }else{
                    //不是散客卡往后追加
                    itemObj[item.id].push(item);
                }
            });
            if(hideIf){
                for(var key in itemObj){
                    var id = key.replace(invalidKey,'');
                    if(!itemObj[id]){
                        if(itemObj[id+invalidKey].length>1){
                            itemObj[id] = [itemObj[id+invalidKey][1]];
                        }else {
                            itemObj[id] = [itemObj[id+invalidKey][0]];
                        }
                    }
                    delete itemObj[id+invalidKey];
                }
            }else {
                this.allData = itemObj;
            }
            return itemObj;
        },

        renderList:function(filterData){
            console.log(filterData)
            var $serviceTableWarp = $('.page_searchMember .serviceTable .serviceTable-warp');
            $serviceTableWarp.html('');

            $.each(filterData, function(i, item) {
                var itemIndex = item[0];
                var $listWarp = $('<div class="list-warp"></div>');
                var $listAvatar = $('<div class="list-left am-clickable"><div class="list-avatar"></div></div>');
                var $listRight = $('<div class="list-right"><dl class="list-content"></dl></div>');
                var $dt = '';
                if(itemIndex.mgjIsHighQualityCust == 1){
                    $listAvatar.find(".list-avatar").addClass("good");
                }else{
                    $listAvatar.find(".list-avatar").removeClass("good");
				}

				//判断是否锁定
				var lastconsumetime = itemIndex.lastConsumeTime || itemIndex.lastconsumetime;
				//根据会员的消费时间和登录者的配置月份匹配
				if(am.isMemberLock(lastconsumetime, itemIndex.locking)){
					$listAvatar.find(".list-avatar").addClass("lock");
				}else{
                    $listAvatar.find(".list-avatar").removeClass("lock");
				}

                $listAvatar.find('.list-avatar').html(am.photoManager.createImage("customer", {
                        parentShopId: am.metadata.userInfo.parentShopId,
                        updateTs: itemIndex.lastphotoupdatetime || ""
                    }, itemIndex.id + ".jpg", "s",itemIndex.photopath||''));
                if(itemIndex.comment){
                    $dt = $('<dt class="list-title-warp am-clickable"><div class="name"> '+itemIndex.name+'  （'+ self.getShopName(itemIndex.shopId)+'）</div><div class="phone"><i class="icon iconfont icon-44"></i> '+ am.processPhone(itemIndex.mobile) +' </div><div class="score"><i class="icon iconfont icon-jifen"></i> 积分 ：'+itemIndex.points+'</div><div class="mark"><i class="icon iconfont icon-24_beizhu"></i> 备注 ：'+itemIndex.comment+'</div></dt>')
                }else{
                    $dt = $('<dt class="list-title-warp am-clickable"><div class="name"> '+itemIndex.name+'  （'+ self.getShopName(itemIndex.shopId)+'）</div><div class="phone"><i class="icon iconfont icon-44"></i> '+ am.processPhone(itemIndex.mobile) +' </div><div class="score"><i class="icon iconfont icon-jifen"></i> 积分 ：'+itemIndex.points+'</div></dt>')
				}
				$listRight.find('.list-content').append($dt);

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
							imgType='type_two';
						}
					} else {
                        imgType='type_one';
                    }
                    var cardtype = "",
                            balance = "<span class='red'>￥"+am.cashierRound(_item.balance)+"</span>",
                            gift = "<span class='red'>￥"+_item.gift+"</span>";
                    if (am.operateArr.indexOf("MGJP") != -1) {
                        _item.realMobile = _item.mobile;
                        // _item.mobile = _item.mobile.replace(/\d{4}$/, "****");
                        _item.mobile = _item.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');//手机号隐藏中间四位
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
                        _html = '<div class="card"><span class="cardImg '+ imgType+'"></span><div class="cardinfo"><p>'+ _item.cardName +'('+ _item.cardNo +')</p><p>'+(self.getShopName(_item.cardshopId)+(_item.cardshopId==amGloble.metadata.userInfo.shopId?'(本店)':''))+'</p></div></div><div class="rest-money">余额 '+ balance +'</div><div class="rest-money">赠金 '+ gift +'</div><div class="money">折扣 <span class="red">'+(_item.discount == null ? 0 : _item.discount)+' </span> 折 </div>' ;
                    }else{
                        _html = '<div class="card"><span class="cardImg '+ imgType+'"></span><div class="cardinfo"><p>'+ _item.cardName +'('+ _item.cardNo +')</p><p>'+(self.getShopName(_item.cardshopId)+(_item.cardshopId==amGloble.metadata.userInfo.shopId?'(本店)':''))+'</p></div></div><div class="money"> <span class="red" >资格卡</span></div><div class="money">折扣 <span class="red">'+(_item.discount == null ? 0 : _item.discount)+' </span> 折 </div>' ;
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
                $serviceTableWarp.append($listWarp.data('customerId',itemIndex.id))
            })


            //判断PC或者mac才有的样式
            if(device2.windows() || navigator.platform.indexOf("Mac") == 0) {
                this.$listBodyAll = $('.searchresult .list-body');
                this.$listBodyAll.eq(0).addClass('keypad_active');
            }else {};

        },

        /* resetHeight:function(){
            /* var h = $('body').height();
            var maxHeight = h-110-100;
            var bheight   = this.$.find(".serviceTable .serviceTable-warp").height();
            if(bheight>maxHeight){
                this.$.find(".serviceTable").css("max-height",maxHeight + "px");
            }else{
                this.$.find(".serviceTable").css("max-height",bheight + "px");
            } 
            /* var w =  this.$.find(".serviceTable .serviceTable-warp").width();
            var markMax = '';
            if($('body').height()<1100){
             markMax = w - 75-231-181-181-101-50;
            }else{
             markMax = w - 75-306-111-231-231-6;
            }
            this.$.find(".list-body  .mark").css("width",markMax + "px");
        }, */
        getShopName: function(id) {
            for (var i = 0; i < am.metadata.shopList.length; i++) {
                if (am.metadata.shopList[i].shopId == id) {
                    var item = am.metadata.shopList[i];
                    return (item.osName==' ' || item.osName=='' || item.osName==null)?((item.shopName==' ' || item.shopName=='' || item.shopName==null)?'门店名称未设定':item.shopName):item.osName;
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
            if (this.searchKeywords == "") {
                am.msg("输入会员手机号或名称搜索！");
                return;
            }
            var isActive = self.$btnGroup.hasClass("active");
            if (isActive) {
                shopIds = this.getshopIds(am.metadata.userInfo.shopId);
                self.$btnGroup.removeClass("active");
            } else {
                shopIds = am.metadata.userInfo.shopId;
                self.$btnGroup.addClass("active");
            }
            this.$.find(".search_input").val(this.searchKeywords.replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "").replace('j0102','*0102').replace('*0102',''));
            am.searchMemberLoading.show({
                cb:function(){
                    self.searchMemberAjax.abort();
                    // if(self.$.find('.searchresult').is(':visible')){
                    //     self.backButtonOnclick();
                    // }
                    self.$btnGroup.removeClass("active");

                    // 用户中止，reset
                    monitor.resetTimer()
                }
            });

            var param = {
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                shopIds: shopIds,
                keyword: self.searchKeywords.replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "").replace('j0102','*0102'),
                pageSize: 1500,
                pageNumber: 0
            }

            // 性能监控点
            if (norefresh) {
                // 分店
                monitor.startTimer('M10', param)
            } else {
                // 本店
                monitor.startTimer('M09', param)
            }

            this.searchMemberAjax = am.api.searchmember.exec(param, function(ret) {
                    am.searchMemberLoading.hide();
                    if (ret.code == 0) {
                        // 性能监控点
                        if (norefresh) {
                            // 分店
                            monitor.stopTimer('M10', 0)
                        } else {
                            // 本店
                            monitor.stopTimer('M09', 0)
                        }


                        self.data = ret.content;
                        self.render(ret.content);
                    } else {
                        // 性能监控点
                        if (norefresh) {
                            // 分店
                            monitor.stopTimer('M10', 1)
                        } else {
                            // 本店
                            monitor.stopTimer('M09', 1)
                        }

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
				filterMember.mgjIsHighQualityCust = member.mgjIsHighQualityCust;
				if(member.lastConsumeTime){
					filterMember.lastConsumeTime = member.lastConsumeTime;
				}
                localStorage.setItem("tp_lastSelectMember_" + am.metadata.userInfo.userId, JSON.stringify(lastMember));
            } else {
                if (!lastMember) lastMember = [];
                lastMember.push(member);
                if (lastMember.length > 4) {
                    lastMember.shift();
                }
                localStorage.setItem("tp_lastSelectMember_" + am.metadata.userInfo.userId, JSON.stringify(lastMember));
            }
		},
		updateLastSelectMember: function(member){
            var lastMember;
			try {
                lastMember = JSON.parse(localStorage.getItem("tp_lastSelectMember_" + am.metadata.userInfo.userId));
            } catch (e) {}
			if(lastMember){
				$.each(lastMember,function(i,v){
					if (v.id == member.id) {
						v.locking = member.locking;
						return false;
                    }
				});
			}
			localStorage.setItem("tp_lastSelectMember_" + am.metadata.userInfo.userId, JSON.stringify(lastMember));
		},

        directionKey:function (obj) {
            var self = this;
            switch (obj.keyCode) {　　　　　　　
                case 38: //向上键
                    if(self.$listBodyAll){
                        self.$listBodyAll.each(function (i, item) {
                            var thisDom = $(this);
                            if(thisDom.hasClass('keypad_active') && i != 0 ) {
                                self.$listBodyAll.removeClass('keypad_active')
                                self.$listBodyAll.eq(i-1).addClass('keypad_active');
    
                                var top = self.$listBodyAll.eq(i-1).position().top,
                                    customerResultHeight = $('#page_searchMember .customerResult').outerHeight(),
                                    wrap =  $('#page_searchMember .serviceTable-warp'),
                                    wrapTransform = wrap.css('transform').replace(/[^0-9\-,]/g,'').split(',')[5],
                                    positive = (0 - wrapTransform),
                                    domOffset = null;
    
                                if(top < 100 && positive > customerResultHeight ) {
                        
                                    domOffset = ((0 - wrapTransform) - customerResultHeight) + top + 100;
                                    wrap.css({
                                        'webkitTransform' : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -"+ ( domOffset ) +", 0, 1)"
                                    })
                                }else if(top < 100 && positive < customerResultHeight) {
                                    wrap.css({
                                        'webkitTransform' : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)"
                                    })
                                }
    
                                return false;
                            }
                        })　
                    }　　
                    break;　　　　　　　
                case 40: //向下键
                    if(self.$listBodyAll&&self.$listBodyAll.length){
                        self.$listBodyAll.each(function (i, item) {
                            var thisDom = $(this);
                            if(thisDom.hasClass('keypad_active') && i != self.$listBodyAll.length-1 ) {
                                self.$listBodyAll.removeClass('keypad_active')
                                var dom = self.$listBodyAll.eq(i+1),
                                    domOffset = dom.position().top, //获取垂直距离坐标
                                    customerResultHeight = $('#page_searchMember .customerResult').outerHeight();
    
                                    if(domOffset > customerResultHeight ) {
                                        var wrap =  $('#page_searchMember .serviceTable-warp'),
                                            wrapTransform = wrap.css('transform').replace(/[^0-9\-,]/g,'').split(',')[5],
                                            domOffsetHeight = (domOffset - customerResultHeight - wrapTransform) + 100;
                                            console.log(domOffsetHeight, wrapTransform);
                                        wrap.css({
                                            'webkitTransform' : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -"+ ( domOffsetHeight ) +", 0, 1)"
                                        })
                                        
                                    }
    
                                    dom.addClass('keypad_active');
                            
                                return false;
                            }
                        })
                    }
                    break;　　　　
                case 13: //回车键
                    console.log("回车");　　　　
                default:
                    break;　　
            }
        },

        keyboardCtrl:function(keyCode){
			var self = this,
				ctrl = window.keyboardCtrl;

            if(document.activeElement && $(document.activeElement).hasClass('input_no')){

            }else{
                if(keyCode == 13) {
                    if(sessionStorage.keyboardCtrl_A == 'post' && $('#page_searchMember .searchresult')) {
                        $('#page_searchMember .keypad_active').trigger('vclick');
                    }
                }else if(keyCode >= 37 && keyCode <= 40 ) {
                    var obj = {
                        keyCode : keyCode
                    }
                    self.directionKey(obj);
				}else if(keyCode === 111) {
                    $('#page_searchMember .am-backbutton').trigger('vclick');
                }
            }
        }
    }));
})();