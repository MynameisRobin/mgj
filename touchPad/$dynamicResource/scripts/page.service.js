(function() {
    var self = (am.page.service = new $.am.Page({
        id: "page_service",
        backButtonOnclick: function() {
            if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                $.am.changePage(am.page.hangup, "", {
                    openbill: 1
                });
            } else {
                $.am.page.back();
            }
        },
        init: function() {
            this.billItemSelector = new cashierTools.BillItemSelector({
                $: this.$,
                tab: true,
                filter: true,
                timer: null,
                page: "service",
                clicked: 1,
                itemWidth:122,
                onSelect: function(data, cb) {
                    data = am.clone(data);
                    if (cb) {
                        self.changeProjectPrice(data, function(ret) {
                            data = ret.data;
                            if (ret.code == 1) {
                                var p = data.mgjAdjustPrice;
                                am.selectItem.show(ret.data, p.itemList, function(items) {
                                    if (items) {
                                        data.mgjAdjust = items;
                                    } else {
                                        data.mgjAdjust = null;
                                    }
                                    cb(self.billMain.addItem(data));
                                });
                            } else {
                                cb(self.billMain.addItem(data));
                            }
                        });
                    } else {
                        return self.billMain.addItem(data);
                    }
                },
                /*checkPromise:function(){
                    if(amGloble.metadata.userInfo.operatestr.indexOf('a32,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
                        am.msg("您没有权限修改单据！");
                        return true;
                    }
                    return false;
                },*/
                onTouch: function(isVclick,dom) {
                    self.billMain.hideMemberInfo(1);
                    //如果底下两个模块升起来了，要降下来~~
                    if (isVclick) {
                        self.billMain.rise(1);
                        self.billServerSelector.rise(1);
                    }
                },
                onTouchHold: function(data, $this) {
                    var operatestr = am.metadata.userInfo.operatestr;
                    var setItemImgFn = function(){
                        am.setItemImg.show(data, function(url) {
                            var $img = am.photoManager.createImage(
                                "service",
                                {
                                    parentShopId: am.metadata.userInfo.parentShopId
                                },
                                url + ".jpg",
                                "s"
                            );
                            $this.find(".img").html($img);
                        });
                    },
                    itemsGroupingFn = function(){
                        self.billItemSelector.startGrouping();
                    };

                    //项目分组的权限
                    var itemsGroupingAuthority = true,
                        setItemImgAuthority=operatestr.indexOf("a36") != -1;
                    if($this.hasClass('group')){
                        setItemImgAuthority = false;
                    }
                    if (setItemImgAuthority && itemsGroupingAuthority) {
                        am.popupMenu('请选择你要进行的操作',[{name:'设置图片'},{name:'设置分组'}],function(ret){
                            if(ret && ret.name == '设置分组'){
                                itemsGroupingFn();
                            }else if(ret && ret.name == '设置图片'){
                                setItemImgFn();
                            }
                        });
                    }else if(setItemImgAuthority){
                        setItemImgFn();
                    }else if(itemsGroupingAuthority){
                        itemsGroupingFn();
                    }else{
                        am.msg("您没有权限进行此操作");
                    }
                },
                onSize: function() {
                    self.billMain.dispatchSettingSelf();
                }
            });

            this.billMain = new cashierTools.BillMain({
                $: this.$,
                th: [
                    {
                        name: "项目"
                    },
                    {
                        name: "价格",
                        width: "80px",
                        className: "center"
                    },
                    {
                        name: "第一工位",
                        width: "100px",
                        className: "pos0"
                    },
                    {
                        name: "第二工位",
                        width: "100px",
                        className: "pos1"
                    },
                    {
                        name: "第三工位",
                        width: "100px",
                        className: "pos2"
                    }
                ],
                checkSpecified: 1,
                outerHeight: 43,
                onSelect: function($item, t, keepList) {
                    self.billServerSelector.reset($item, t, keepList);
                },
                checkPromise: function(tags) {
                    if (amGloble.metadata.userInfo.operatestr.indexOf(tags) != -1 && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                        if (tags == "a34,") {
                            am.msg("您没有权限修改价格！");
                            return true;
                        }
                        if (tags == "a33,") {
                            am.msg("您没有权限删除！");
                            return true;
                        }
                    }
                    return false;
                },
                onAddItem: function(data, $container, isAutoFill, comboItem) {
                    var $tr = self.getNewItemTr();
                    self.renderItemTr($tr, data, 0, comboItem);
                    $container.append($tr);
                    var $prev = $tr.prev();
                    if (!isAutoFill && $prev.length && this.setting && this.setting.setting_1stServer_autoChecked) {
                        var $pos0 = $prev.find(".pos0");
                        if ($pos0.length) {
                            var server = $pos0.find(".server").data("data");
                            console.log(server);
                            if (server) {
                                self.billMain.addServer(server, $tr, $pos0.find(".server").hasClass("checked"));
                            }
                        }
                    }

                    var _server = [];

                    if (data.autoStation) {
                        //先看有没有自动工位的
                        var autoStation = data.autoStation.split(",");
                        for (var n = 1; n < 4; n++) {
                            var bill = am.cashierTab.getFirstEmp(n - 1);
                            if (bill) {
                                if (autoStation.indexOf(n.toString()) != -1 && bill.no != -1) {
                                    _server.push({
                                        id: bill.no,
                                        name: bill.empName,
                                        per: 100,
                                        specified: bill.isSpecified
                                    });
                                }
                            }
                        }
                    }
                    if (_server && _server.length) {
                        var servers = [];
                        for (var j = 0; j < _server.length; j++) {
                            if (!_server[j]) {
                                continue;
                            }
                            var server = am.metadata.empMap[_server[j].id];
                            if (server) {
                                //this.billMain.addServer(server,$tr,items[i].servers[j].specified==1);
                                servers.push({
                                    dutyid: server.dutyid,
                                    dutytypecode: server.dutyType,
                                    empId: server.id,
                                    empName: server.name,
                                    empNo: server.no,
                                    per: _server[j].per,
                                    perf: 0,
                                    pointFlag: _server[j].specified,
                                    station: server.pos
                                });
                            }
                        }
                        self.billMain.setEmps(servers, $tr);
                    }

                    return $tr;
                },
                onPriceChange: function($tr, action) {
                    var totalPrice = 0;
                    var $trs = this.$list.find("tr");

                    $trs.each(function() {
                        totalPrice +=
                            $(this)
                                .find(".price")
                                .text()
                                .replace("￥", "") * 1 || 0;
                    });
                    this.$totalPrice.text("￥" + toFloat(totalPrice));

                    if ($tr && action == "delete") {
                        var comboitem = $tr.data("comboitem");
                        if (comboitem) {
                            comboitem.leavetimes != -99 && comboitem.leavetimes++;
                        }
                    }

                    am.cashierTab.setPrice({
                        totalPrice: totalPrice,
                        num: $trs.length,
                        type: 0
                    });
                },
                onServerClick: function(data) {
                    console.log("onServerClick", data);
                    if (data[0]) {
                        self.billServerSelector.$body.find("li[serverid=" + data[0].empId + "]").trigger("vclick");
                    }
                },
                settingKey: "setting_cashierService",
                defaultSetting: [
                    {
                        name: "显示男女客",
                        key: "setting_genderSelector",
                        flag: 1
                    },
                    // {
                    //     name: "显示单号输入框",
                    //     key: "setting_billNoInput",
                    //     flag: 0
                    // },
                    {
                        name: "显示第一工位",
                        key: "setting_server1",
                        flag: 1
                    },
                    {
                        name: "显示第二工位",
                        key: "setting_server2",
                        flag: 1
                    },
                    {
                        name: "显示第三工位",
                        key: "setting_server3",
                        flag: 1
                    },
                    {
                        "name": "显示洗发操作",
                        "key": "setting_washTime",
                        "flag": 1
                    }
                    /*{
                    "name": "自动选择第一工位",
                    "key": "setting_1stServer_autoChecked",
                    "flag": 1
                },*/
                    // {
                    //     "name": "显示洗发时间",
                    //     "key": "setting_washTime",
                    //     "flag": 0
                    // }
                ],
                dispatchSetting: function(settings) {
                    if (!settings.setting_genderSelector) {
                        self.$gender.hide();
                    } else {
                        self.$gender.show();
                    }
                    if (!settings.setting_billNoInput) {
                        self.$billNo.parent().hide();
                    } else {
                        self.$billNo.parent().show();
                    }

                    self.billServerSelector.dispatchSetting(settings, 1);
                    am.cashierTab.operatehair();
                },
                onSubmit: function() {
                    self.submit();
                }
            });
            localStorage.removeItem("setting_1stServer_autoChecked");
            localStorage.removeItem("setting_washTime");

            this.$gender = am.cashierTab.$t.find(".genderRadio").vclick(function() {
                $(this).toggleClass("male");
            });
            /*this.$gender = this.billMain.$.find(".genderRadio").vclick(function() {
                $(this).toggleClass("male");
            });*/

            this.billMain.$.find(".memberInfoBtn").vclick(function() {
                $.am.changePage(am.page.memberDetails, "slideup", {
                    customerId: self.member.id,
                    cardId: self.member.cid,
                    shopId: self.member.shopId,
                    tabId: 1
                });
            });
            this.$member = this.billMain.$.find(".member").vclick(function() {
                if (self.member) {
                    self.billMain.showMemberInfo(self.member);
                } else {
                    $.am.changePage(am.page.searchMember, "slideup", {
                        onSelect: function(item) {
                            $.am.changePage(self, "slidedown", {
                                member: item
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
                    }
                });
            });
            this.billMain.$list.on("vclick", ".serviceItemName", function() {
                /*                if(amGloble.metadata.userInfo.operatestr.indexOf('a32,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
                    am.msg("您没有权限修改！");
                    return false;
                }*/
                var $tr = $(this).parents("tr");
                var item = $tr.data("data");
                var comboitem = $tr.data("comboitem");
                if (comboitem) {
                    var cItems = self.getComboItemById(item.itemid);
                    self.selectComboItem(cItems, comboitem, function(reSelect) {
                        if (reSelect == comboitem) {
                        } else {
                            if (reSelect) {
                                reSelect.leavetimes != -99 && reSelect.leavetimes--;
                                comboitem.leavetimes != -99 && comboitem.leavetimes++;
                                $tr
                                    .data("comboitem", reSelect)
                                    .find(".price")
                                    .text(reSelect.oncemoney);
                                self.renderItemTr($tr, item, 0, reSelect);
                            } else {
                                comboitem.leavetimes != -99 && comboitem.leavetimes++;
                                item = am.clone(item);
                                item.noTreat = 1;
                                self.changeProjectPrice(item, function(ret) {
                                    var data = ret.data;
                                    if (ret.code == 1) {
                                        var p = JSON.parse(data.mgjAdjustPrice);
                                        am.selectItem.show(data, p.itemList, function(items) {
                                            if (items) {
                                                data.mgjAdjust = items;
                                            }
                                            self.renderItemTr($tr, data, 1);
                                            self.billMain.onPriceChange();
                                        });
                                    } else {
                                        self.renderItemTr($tr, data, 1);
                                    }
                                });
                                //self.renderItemTr($tr,item,1);
                            }
                            self.billMain.onPriceChange();
                        }
                    });
                }
            });

            this.$billNo = am.cashierTab.$t
                .find("input[name=billNo]")
                .attr("readonly", true)
                .vclick(function() {
                    //this.$billNo = this.$.find("input[name=billNo]").attr('readonly',true).vclick(function() {
                    if (amGloble.metadata.shopPropertyField.mgjBillingType != 1) {
                        var $this = $(this).removeClass("error");
                        am.keyboard.show({
                            title: "流水单号",
                            submit: function(value) {
                                $this.val(value);
                            }
                        });
                    } else {
                        am.msg("开单模式下单号自动生成！");
                    }
                });

            this.billServerSelector = new cashierTools.BillServerSelector({
                $: this.$,
                checkSpecified: 1,
                muti: true,
                checkManual: true,
                getTotalPerf: function() {
                    return -1;
                },
                /*checkPromise:function(){
                    if(amGloble.metadata.userInfo.operatestr.indexOf('a32,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
                        am.msg("您没有权限修改！");
                        return true;
                    }
                    return false;
                },*/
                /*onSelect: function(data,specified) {
                    var res = self.billMain.addServer(data,null,specified);
                    am.tips.specified(self.billServerSelector.$.find('li[serverid='+data.id+']'),data.pos);
                    return res;
                },
                onRemove: function(data,specified){
                    var res = self.billMain.removeServer(data,null,specified);
                    return res;
                }*/
                onSetEmpPer: function(emp, per,perf,gain) {
                    var $server = self.billMain.$list.find("tr.selected .server").eq(emp.pos);
                    var data = $server.data("data");
                    if (data) {
                        setTimeout(function() {
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
                },
                onSelect: function(data, specified) {
                    var _this = this;
                    setTimeout(function() {
                        var emps = _this.getEmps();
                        self.billMain.setEmps(emps);
                    }, 50);
                    return false;
                },
                onRemove: function(data, specified) {
                    var _this = this;
                    setTimeout(function() {
                        var emps = _this.getEmps();
                        self.billMain.setEmps(emps);
                    }, 50);
                    return false;
                }
            });
            this.$comboItemSelect = $("#cashierComboItemSelect");
            this.$comboItemSelect.find(".close").vclick(function() {
                self.$comboItemSelect.hide();
            });
            this.$comboItemSelect.find(".button").vclick(function() {
                var data = self.$comboItemSelect.find(".settings li.selected").data("data");
                self.selectComboItemCallback(data);
                self.$comboItemSelect.hide();
            });
            this.$comboItemSelect.find(".settings").on("vclick", "li", function() {
                $(this)
                    .addClass("selected")
                    .siblings()
                    .removeClass("selected");
            });

            this.$displayId = this.$.find(".displayId");
        },
        changeProjectPrice: function(data, callback) {
            if (data.mgjAdjustPrice) {
                //项目变价存在
                var p = data.mgjAdjustPrice;
                var firstemp = am.cashierTab.getFirstEmp();
                if (p.isEnable == 1 && p.itemList && p.itemList.length) {
                    callback({
                        code: 1,
                        data: data
                    });
                } else if (p.isEnable == 1 && p.dutyList && p.dutyList.length) {
                    if (firstemp && firstemp.no != -1) {
                        for (var j = 0; j < p.dutyList.length; j++) {
                            var itemj = p.dutyList[j],
                                empdata = amGloble.metadata.empMap[firstemp.no];
                            if (empdata && empdata.dutyid == itemj.dutyid) {
                                data.mgjAdjust = {
                                    name: data.name,
                                    price: itemj.price
                                };
                            }
                        }
                    }
                    callback({
                        code: 2,
                        data: data
                    });
                } else {
                    callback({
                        code: 3,
                        data: data
                    });
                }
            } else {
                callback({
                    code: 4,
                    data: data
                });
            }
        },
        beforeShow: function(paras) {
            console.log(paras)
            am.tab.main.show().select(1);
            this.$.removeClass("openBill");
            this.checkIsOpen(paras);
            if (paras == "back" || (paras && paras.opt == "back")) {
                // this.getHangupCount();
                // if(paras.delBillArr && paras.delBillArr.length > 0 && this.billData) {
                //     $.each(paras.delBillArr, function(i, bill) {
                //         if(bill.displayId == self.billData.displayId)
                //             self.billData = null;
                //     });
                // }
                //return;
            } else if (paras && paras.member) {
                //搜索客户
                this.setMember(paras.member);
                // setTimeout(function(){
                //     am.tips.details( am.page.service.billMain.$.find(".member"), am.page.service.billMain.$.find('.memberInfoBtn') );
                // }, 500);
            } else if (paras && paras.cardData) {
                //客户详情，重新选卡
                this.setMember(am.convertMemberDetailToSearch(paras.cardData), paras.cardData.card);
            } else if (paras == "freezing" && !this.needReset) {
                //this.checkIsOpen(paras);
            } else if (am.metadata) {
                //this.checkIsOpen(paras);
                if (!this.needReset) {
                    am.cashierTab.reset(0);
                }
                this.needReset = 0;
                this.reset(paras);
                // 自动入单开单模式
                this.getAutointoorder();
            } else {
                //throw "metadata should be ready";
            }

            /*收银第二屏显示*/
            //console.log(am.metadata.configs);
            /*var params = JSON.parse(JSON.stringify(am.metadata.configs))
            am.mediaShow(0,params);*/
        },
        getAutointoorder: function(){//获取自动入单
            if(this.billMain.$list.find('tr').length){
                return;
            }
            var classes = am.metadata.classes;
            if(am.isNull(classes)) return;
            for(var i = 0;i < classes.length;i++){
                var sub = classes[i].sub;
                if(!am.isNull(sub)){
                    for (var j = 0; j < sub.length; j++) {
                        if(sub[j].autointoorder == "1"){
                            self.billMain.addItem(sub[j], 1);
                        }                        
                    }
                }
            }
        },
        checkIsOpen: function(paras) {
            if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                this.$.addClass("openBill");
                if (paras && paras.bill) {
                    am.cashierTab.changeOpenBill(1, paras.bill);
                } else {
                    am.cashierTab.changeOpenBill(1);
                }
            } else {
                am.cashierTab.changeOpenBill(0);
            }
        },
        getGroupData:function(){
            var data;
            if(am.metadata.configs.SERVICE_ITEM_GROUP){
                try{
                    data = JSON.parse(am.metadata.configs.SERVICE_ITEM_GROUP);
                }catch(e){

                }
            }
            return data;
        },
        reset: function(paras) {
            am.cashierTab.operatehair(null);//重置洗发
            //重置
            this.billItemSelector.dataBind(am.metadata.classes);
            this.billItemSelector.setGroup(this.getGroupData());
            this.billServerSelector.dataBind(am.metadata.employeeList, ["第一工位", "第二工位", "第三工位"]); //多个工位;

            computingPerformance.updataConfig({
                empList: am.metadata.employeeList,
                itemList: am.metadata.classes,
                payConfig: am.metadata.payConfigs
            });

            this.billItemSelector.reset();
            this.billServerSelector.reset();
            this.billMain.reset();
            this.billNoError = 0;
            this.$billNo.val("").removeClass("error");
            if (paras && paras.reset) {
                //带用户信息的重置
                self.setMember(paras.reset);
            } else {
                am.cashierTab.setMember();
                this.member = null;
                this.$member
                    .html('<span class="tag">顾客:</span>散客')
                    .prev()
                    .hide();
                this.$gender.removeClass("male");
            }
            if (paras && paras.reservation) {
                //从预约进入收银
                am.loading.show();
                am.api.queryMemberById.exec(
                    {
                        memberid: paras.reservation.custId
                    },
                    function(ret) {
                        am.loading.hide();
                        if (ret && ret.code == 0 && ret.content && ret.content.length) {
                            if (ret.content.length == 1) {
                                self.setMember(ret.content[0]);
                            } else if (ret.content.length > 1) {
                                var pop = [];
                                for (var i = 0; i < ret.content.length; i++) {
                                    var item = ret.content[i];
                                    pop.push({
                                        name: item.cardName + " (" + (item.cardtype == 1 ? "余额:￥" + toFloat(item.balance) : "现金消费卡") + ")",
                                        data: item
                                    });
                                }
                                am.popupMenu("请选择卡进行消费", pop, function(sel) {
                                    self.setMember(sel.data);
                                });
                            }
                            self.feeReservation(paras.reservation);
                        } else {
                            am.msg("用户信息读取失败！");
                        }
                    }
                );
            }
            if (paras && paras.bill) {
                //携带单据
                this.billData = paras.bill;
                //this.feedBillData(paras.bill);
                this.feedMain(paras.bill);
                this.$displayId.text(paras.bill.displayId).show();
            } else {
                this.billData = null;
                this.$displayId.hide();
            }
            this.getHangupCount();
        },
        setMember: function(member, card) {
            am.cashierTab.setMember(member, 0, card);
        },
        _setMember: function(member, pass) {
            var _this = this;
            // if(!pass){
            //     // am.pw.check(member,function(verifyed){
            //     //     if(verifyed){
                            // _this.setMember(member,1);
            //     //     }
            //     // });
            //     
            //     return;
            // }

            this.member = member;
            /*if(this.member.timeflag==2){
                this.getComboItems(this.member.cid,this.member.shopId);
            }*/
            this.billMain.$list.find("tr").each(function() {
                self.renderItemTr($(this), $(this).data("data"));
            });

            this.billMain.onPriceChange();

            /*var cardName = this.member.cardName;
            var balanceFee = this.member.balance-this.member.treatcardfee;
            if(this.member.cardtype == 1 && this.member.timeflag==0 && balanceFee){
                cardName+='(￥'+balanceFee.toFixed(0)+')';
            }

            this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div><div class="cardname">'+cardName+'</div>').prev().show();
            this.$member.find('.img').html(am.photoManager.createImage("customer", {
                    parentShopId: am.metadata.userInfo.parentShopId,
                    updateTs: member.lastphotoupdatetime || ""
                }, member.id + ".jpg", "s"));
             */ if (
                this.member.sex == "F"
            ) {
                this.$gender.removeClass("male");
            } else {
                this.$gender.addClass("male");
            }

            var tip = localStorage.getItem("TP_timeflag_Tip");
            if (tip && new Date().getTime() - tip < 1 * 24 * 3600 * 1000) {
                //如果1天内不再提醒
                tip = false;
            } else {
                tip = true;
            }
            if (this.member.cardtype == 1 && (this.member.timeflag == 1 || this.member.timeflag == 3) && tip) {
                //计次卡
                // atMobile.nativeUIWidget.showMessageBox({
                // 	title : "计次卡/年卡",
                // 	content : '青春版暂不支持【计次卡】与【年卡】消费,你可以选择现金结算'
                // });
                atMobile.nativeUIWidget.confirm(
                    {
                        caption: "计次卡/年卡",
                        description: "小掌柜暂不支持【计次卡】与【年卡】消费,你可以选择现金结算!",
                        okCaption: "知道了",
                        cancelCaption: "不再提醒"
                    },
                    function() {},
                    function() {
                        localStorage.setItem("TP_timeflag_Tip", new Date().getTime());
                    }
                );
            }
        },
        afterShow: function(paras) {
            am.cashierTab.show(0); //左二级菜单
        },
        beforeHide: function(paras) {
            this.billMain.hideMemberInfo();
            am.cashierTab.hide();
            //am.cashierTab.changeOpenBill(0);
            am.cashierTab.fullTab(0);
        },
        getNewItemTr: function() {
            var $tr = $('<tr class="am-clickable show"></tr>');
            $tr.append('<td><div class="am-clickable delete"></div></td>');
            $tr.append('<td><span class="serviceItemName am-clickable"></span><span class="serviceItemChangeName am-clickable"></span></td>'); // am-disabled
            $tr.append('<td class="center"><span class="price am-clickable"></span></td>');
            for (var i = 0; i < 3; i++) {
                var $td = $('<td class="pos' + i + '"><div class="server am-clickable"></div></td>');
                if (this.billMain.setting["setting_server" + (i + 1)]) {
                } else {
                    $td.hide();
                }
                $tr.append($td);
            }
            return $tr;
        },
        renderItemTr: function($tr, data, passCombo, selectComboItem) {
            //data = am.clone(data);
            if (data.mgjAdjustPrice) {
                //项目变价存在
                var p = data.mgjAdjustPrice;
                if (p.isEnable == 1 && p.itemList && p.itemList.length) {
                    //手动选的  不做任何修改
                } else if (p.isEnable == 1 && p.dutyList && p.dutyList.length) {
                    data.mgjAdjust = null;
                    var firstemp = am.cashierTab.getFirstEmp();
                    if (firstemp && firstemp.no != -1) {
                        for (var j = 0; j < p.dutyList.length; j++) {
                            var itemj = p.dutyList[j],
                                empdata = amGloble.metadata.empMap[firstemp.no];
                            if (empdata && empdata.dutyid == itemj.dutyid) {
                                data.mgjAdjust = {
                                    name: data.name,
                                    dutyName: itemj.dutyName,
                                    price: itemj.price
                                };
                            }
                        }
                    }
                }
            } else {
                data.mgjAdjust = null;
            }

            var $price = $tr.find(".price");
            if (am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("Z3") != -1) {
                $price.addClass("am-disabled");
            } else {
                $price.removeClass("am-disabled");
            }
            var price = data.price;
            if (data.mgjAdjust) {
                //存在项目变价
                data.oName = data.name;
                data.name = data.mgjAdjust.name;
                $tr.find(".serviceItemName").text(data.oName);
                $tr.find(".serviceItemChangeName").text((data.mgjAdjust.dutyName || data.mgjAdjust.name) + ":" + data.mgjAdjust.price);
                price = data.mgjAdjust.price;
            } else {
                $tr.find(".serviceItemName").text(data.name); //.addClass("am-disabled");
            }

            if ($price.hasClass("modifyed")) {
                //如果手改过价格，不算折扣
            } else {
                //如果没有手改过价格，算折扣
                if (price === null) {
                    $price.text("未定价").removeClass("am-disabled");
                } else {
                    if (self.member) {
                        var discount = am.discountMap[self.member.cardTypeId + "_" + data.itemid];
                        if (discount) {
                            if (discount.dicmode == "1") {
                                price = discount.discount;
                            } else {
                                price = price * (discount.discount == "0" ? 10 : discount.discount) * 0.1;
                            }
                        } else if (self.member.discount) {
                            price = price * (self.member.discount == "0" ? 10 : self.member.discount) * 0.1;
                        }
                    }
                    price = toFloat(price);
                    //自动计算的价格
                    $price.text(price).data("autoPrice", price);
                }
            }

            $tr
                .removeData("comboitem")
                .find("td:eq(1)")
                .removeClass("comboitem");
            if (self.member && !data.noTreat) {
                //self.member.timeflag==2 && && !passCombo
                var comboitem = self.getComboItemById(data.itemid, selectComboItem);
                if (comboitem.length) {
                    comboitem = comboitem[0];
                    if (comboitem.leavetimes === -99) {
                        price = 0;
                    } else {
                        comboitem.leavetimes--;
                        price = comboitem.oncemoney || 0;
                    }
                    //自动计算的价格
                    $price
                        .text(price)
                        .addClass("am-disabled")
                        .data("autoPrice", price);
                    $tr.find("td:eq(1)").addClass("comboitem");
                    $tr.data("comboitem", comboitem);
                    $tr.find(".serviceItemName").removeClass("am-disabled");
                }
            }

            return $tr.data("data", data);
        },
        getComboItems: function(id, shopId) {
            var user = am.metadata.userInfo;
            am.api.itemOfCard.exec(
                {
                    //"cardId":id,
                    memberid: id,
                    shopId: shopId,
                    parentShopId: user.parentShopId
                },
                function(ret) {
                    if (ret && ret.code == 0) {
                        if (ret.content && ret.content.length) {
                            for (var i = 0; i < ret.content.length; i++) {
                                ret.content[i].tleavetimes = ret.content[i].leavetimes;
                            }
                            self.member.comboitems = ret.content;
                            self.checkComboMatch();
                            am.cashierTab.$card.trigger("vclick");
                        }
                    } else if (ret.code == -1) {
                        atMobile.nativeUIWidget.confirm(
                            {
                                caption: "网络错误",
                                description: "由于发生网络错误 ，用户套餐项目数据读取失败，无法使用套餐项目，是否重试？",
                                okCaption: "重试",
                                cancelCaption: "返回"
                            },
                            function() {
                                self.getComboItems(id, shopId);
                            },
                            function() {
                                //amGloble.msg("初始化错误,请退出检查网络环境后重试!");
                            }
                        );
                    }
                }
            );
        },
        checkComboMatch: function() {
            this.billMain.$list.find("tr").each(function() {
                self.renderItemTr($(this), $(this).data("data"));
            });
            this.billMain.onPriceChange();
        },
        getComboItemById: function(id, selectComboItem) {
            var items = this.member.comboitems;
            var ret = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var nos = items[i].timesItemNOs ? items[i].timesItemNOs.split(",") : [];
                    if (
                        (!selectComboItem && (items[i].itemid == id || nos.indexOf(id) != -1) && items[i].leavetimes) ||
                        (selectComboItem && selectComboItem.id === items[i].id && items[i].leavetimes)
                    ) {
                        var ts = am.now();
                        ts.setHours(0);
                        ts.setMinutes(0);
                        ts.setSeconds(0);
                        ts.setMilliseconds(0);
                        if (!items[i].validdate || items[i].validdate >= ts.getTime()) {
                            //items[i].leavetimes--;
                            //return items[i];
                            if (items[i].cashshopids && items[i].cashshopids.indexOf(am.metadata.userInfo.shopId) == -1) {
                                am.msg("套餐项目：" + items[i].itemname + " 不允许在本店使用！");
                            } else {
                                ret.push(items[i]);
                            }
                        } else {
                            am.msg("套餐项目：" + items[i].itemname + " 已于" + new Date(items[i].validdate).format("yyyy-mm-dd") + "日过期！");
                        }
                    }
                }
            }
            return ret;
        },
        selectComboItem: function(items, using, cb) {
            var $setting = this.$comboItemSelect.find(".settings").html('<li class="am-clickable">不使用套餐项目</li>');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var $li = $("<li></li>").addClass("am-clickable");
                if (using == item) {
                    $li.addClass("selected");
                }
                if (item.sumtimes == -99) {
                    $li.append('<div class="times">不限次</div>');
                } else {
                    $li.append('<div class="times">余' + item.leavetimes + "次<span>(总" + item.sumtimes + "次)</span></div>");
                }

                $li.append('<div class="itemName">' + item.itemname + "</div>");
                var $date = $('<div class="invalidDate"></div>');
                if (item.validdate) {
                    var ts = am.now();
                    ts.setHours(0);
                    ts.setMinutes(0);
                    ts.setSeconds(0);
                    ts.setMilliseconds(0);
                    var x = item.validdate - ts.getTime();
                    if (x < 0) {
                        $li.addClass("am-disabled");
                        $date.text("已过期");
                    } else if (x < 7 * 24 * 3600 * 1000) {
                        $date.addClass("highlight");
                        $date.text(new Date(item.validdate).format("yyyy-mm-dd") + "到期 即将到期");
                    } else {
                        $date.text(new Date(item.validdate).format("yyyy-mm-dd") + "到期");
                    }
                } else {
                    $date.text("不限期");
                }
                $li.append($date);
                $setting.append($li.data("data", item));
            }
            this.$comboItemSelect.css("display", "-webkit-box");
            this.selectComboItemCallback = cb;
        },
        submit: function(dataOnly) {
            var user = am.metadata.userInfo,
                _this = this;
            var opt = {
                parentShopId: user.realParentShopId,
                shopId: user.shopId,
                //"memId": -1,
                //"cardId": -1,
                //"billNo": "",
                expenseCategory: 0,
                discount: 10,
                gender: "F",
                custSource: 0,
                comment: "",
                clientflag: 1,
                otherFlag: 0,
                token: user.mgjtouchtoken,
                serviceItems: [],
                billingInfo: {
                    total: 0,
                    eaFee: 0, //入账金额
                    treatfee: 0,
                    treatpresentfee: 0,
                    //"pointFee":0,
                    //"coupon":0,

                    cardFee: 0, //卡金
                    presentFee: 0, //赠送金
                    cashFee: 0, //现金
                    unionPay: 0, //银联
                    cooperation: 0, //合作券
                    mall: 0, //商场卡
                    weixin: 0, //微信
                    pay: 0, //支付宝
                    voucherFee: 0, //代金券
                    mdFee: 0, //免单金额
                    divideFee: 0, //分期赠送进
                    pointFee: 0, //积分
                    debtFee: 0, //欠款
                    dpFee: 0, //点评
                    dpId: null, //点评id
                    payId: null, //支付宝id
                    weixinId: null, //微信 id
                    dpCouponId: null, //微信 id

                    luckymoney: 0,
                    coupon: 0,
                    //"dianpin": 0,
                    otherfee1: 0,
                    otherfee2: 0,
                    otherfee3: 0,
                    otherfee4: 0,
                    otherfee5: 0,
                    otherfee6: 0,
                    otherfee7: 0,
                    otherfee8: 0,
                    otherfee9: 0,
                    otherfee10: 0
                }
            };
            if (this.billData) {
                opt.instoreServiceId = this.billData.id;
                if (this.billData.instorecomment) {
                    opt.comment = this.billData.instorecomment;
                }
            }
            /*if (this.$billNo.is(":visible")) {
                opt.billNo = this.$billNo.val();
                if (!opt.billNo && !this.billNoError  && !dataOnly) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "流水单号未输入",
                        description: "不输入流水单号，系统将自动生成流水单号！",
                        okCaption: "自动生成",
                        cancelCaption: "去输入"
                    }, function() {
                        _this.billNoError=1;
                        //_this.submit();
	                    am.cashierTab.submit();
                    }, function() {
                        _this.$billNo.addClass("error");
                    });
                    opt.billNo = null;
                    return;
                }else{
                    this.billNoError=0;
                }
                if(!opt.billNo){
                    opt.billNo = null;
                }
            }*/
            if (this.member) {
                opt.memId = this.member.id;
                opt.cardId = this.member.cid;
                opt.discount = this.member.discount || 10;
            } else {
                opt.memId = 0;
            }
            if (this.$gender.hasClass("male")) {
                opt.gender = "M";
            }
            var arrComboitems = [];
            var $trs = this.billMain.$list.find("tr");
            for (var i = 0; i < $trs.length; i++) {
                var $tr = $trs.eq(i);
                var data = $tr.data("data");
                var $price = $tr.find(".price");
                var price = $price.text().replace("￥", "") * 1;
                if (!price && price != 0) {
                    am.msg("请设定项目价格！");
                    $price.addClass("error");
                    return;
                }
                var item = {
                    id: data.id,
                    itemId: data.itemid,
                    itemName: data.name,
                    noTreat: data.noTreat,
                    price: data.price || 0,
                    salePrice: price,
                    consumeType: 0, //0普通  1 套餐 2 计次 3 年卡
                    //"consumeId":12,//根据consumeType决定ID类型
                    depcode: this.getDepCode(data.id),
                    servers: []
                };
                if ($price.hasClass("modifyed")) {
                    item.modifyed = 1;
                }
                // if(item.depcode==-1 && am.metadata.deparList.length==1){
                //     //如果只有一个部门
                //     item.depcode = am.metadata.deparList[0].code;
                // }else if(item.depcode==-1 && am.metadata.deparList.length>1) {
                //     //有多个部门
                //     //TODO
                //     //目前先这样写
                //     item.depcode = am.metadata.deparList[0].code;
                // }
                var comboitem = $tr.data("comboitem");
                if (comboitem) {
                    item.consumeType = 1;
                    item.consumeId = comboitem.id;
                    item.totalTimes = comboitem.tleavetimes;

                    item.cashFee = comboitem.cashFee;
                    item.cardFee = comboitem.cardFee;
                    item.otherFee = comboitem.otherFee;

                    if (comboitem.sumtimes == -99) {
                        //不限次套餐   任务006  业绩修改 item.consumeType = 4（不限次套餐相当于年卡）
                        item.perfPrice = comboitem.oncemoney;
                        //006
                        //item.consumeType = 4;
                    }
                    arrComboitems.push({
                        itemname: data.name,
                        itemid: data.itemid,
                        price: price,
                        leavetimes: comboitem.leavetimes,
                        tleavetimes: comboitem.tleavetimes,
                        oncemoney: comboitem.oncemoney,
                        sumtimes: comboitem.sumtimes,

                        cashFee: comboitem.cashFee,
                        cardFee: comboitem.cardFee,
                        otherFee: comboitem.otherFee
                    });

                    if (comboitem.treattype == 1) {
                        item.consumeType = 3;
                    }
                }
                opt.billingInfo.total += price;
                var $servers = $tr.find(".server");
                for (var j = 0; j < $servers.length; j++) {
                    var server = $servers.eq(j).data("data");
                    if (server) {
                        item.servers = item.servers.concat(server);
                        /*item.servers.push({
                            "empId": server.id,
                            "empNo": server.no,
                            "empName": server.name,
                            "station":server.pos,
                            "pointFlag":$servers.eq(j).hasClass("checked")?1:0,// 是否指定 0非指定 1指定
                            "dutyid": server.dutyid,
                            "dutytypecode":server.dutyType
                        });*/
                    }
                }
                opt.serviceItems.push(item);
            }
            opt.billingInfo.eaFee = opt.billingInfo.total;

            var param = {
                comboitem: arrComboitems,
                option: opt,
                member: this.member
            };

            return param;
            /*if(dataOnly){
                return param;
            }else{
                $.am.changePage(am.page.pay, "slideup", param);
            }*/
        },
        getDepCode: function(id) {
            var classes = am.metadata.classes;
            for (var i = 0; i < classes.length; i++) {
                for (var j = 0; j < classes[i].sub.length; j++) {
                    if (classes[i].sub[j].id == id) {
                        return classes[i].depcode || "";
                    }
                }
            }
            return "";
        },
        getHangupCount: function() {
            var self = this;
            var user = am.metadata.userInfo;
            am.api.hangupList.exec(
                {
                    shopId: user.shopId,
                    pageSize: 99999,
                    //"employeeId": 1234, //可选，如果有则按员工查询
                    //"key": "", //可选，如果有则按关键字搜索，包括服务号、客户姓名、服务者姓名、备注
                    //"displayId": "1234", //可选，如果有则按手牌号查询
                    //"period": "2016-01-05_2016-05-05", //可选，如果有则按时间区间查询，否则查询全部
                    //"fromHistory": 1, //可选，如果为1，则查询删除表，否则查询进行中的服务的表
                    //"status": 2, //可选，如果有，则按status查询，0普通单 1已结算 2已删除
                    //"pageSize": 99999 //可选，如果有则分页，否则不分页
                    //"pageNumber": 0, //可选，如果有pageSize，此参数才有意义
                    //"simpleData":1  //如果为1 则只返回  displayId
                    channel: 1
                },
                function(ret) {
                    //self.$.find('.cashierHangupBtn > .badge').text(ret.count);
                    am.cashierTab.setHangUpNum(ret.count);
                }
            );
        },
        feedBillData: function(bill) {
            if (bill.memId && bill.memId != -1) {
                am.loading.show();
                am.api.queryMemberById.exec(
                    {
                        memberid: bill.memId
                    },
                    function(ret) {
                        am.loading.hide();
                        if (ret && ret.code == 0 && ret.content && ret.content.length) {
                            //to do 选择会员卡
                            if (ret.content.length == 1) {
                                self.setMember(ret.content[0]);
                            } else if (ret.content.length > 1) {
                                var data;
                                try {
                                    data = JSON.parse(bill.data);
                                } catch (e) {
                                    $.am.debug.log(data);
                                }
                                if (data && data.cid) {
                                    for (var i = 0; i < ret.content.length; i++) {
                                        if (ret.content[i].cid == data.cid) {
                                            self.setMember(ret.content[i]);
                                            break;
                                        }
                                    }
                                } else {
                                    var arr = [];
                                    for (var i = 0; i < ret.content.length; i++) {
                                        var item = ret.content[i];
                                        var cardName = item.cardName;
                                        var balanceFee = item.balance;
                                        if (item.cardtype == 1 && item.timeflag == 0 && balanceFee) {
                                            cardName += "(余额:￥" + balanceFee.toFixed(0) + ")";
                                        }
                                        arr.push({
                                            name: cardName,
                                            data: item
                                        });
                                    }
                                    am.popupMenu("请选择会员卡", arr, function(ret) {
                                        self.setMember(ret.data);
                                        self.feedMain(bill);
                                    });
                                    return;
                                }
                            }
                        } else {
                            am.msg("用户信息读取失败~");
                        }
                        self.feedMain(bill);
                    }
                );
            } else {
                self.feedMain(bill);
            }
        },
        selectChangePrice: function(data, item) {
            var p = data.mgjAdjustPrice,
                res = null;
            if (p) {
                if (p.itemList && p.itemList.length) {
                }
                $.each(p.itemList, function(i, itemj) {
                    if (itemj.name == item.name) {
                        res = itemj;
                    }
                });
            }
            return res;
        },
        feeReservation: function(reservation) {
            var data = reservation;
            try {
                data = JSON.parse(reservation);
            } catch (e) {
                $.am.debug.log(data);
            }
            if (data) {
                var items = JSON.parse(data.itemProp).items;
                var packages = JSON.parse(data.itemProp).packages;
                var itemData = null;
                if (!$.isEmptyObject(items)) {
                    itemData = items;
                } else {
                    if (!$.isEmptyObject(packages)) {
                        itemData = packages;
                    }
                }
                var $tr;
                if (itemData) {
                    for (var key in itemData) {
                        var data = am.metadata.serviceItemMap[key];
                        if (data) {
                            $tr = this.billMain.addItem(data, 1);
                            if (data.autoStation) {
                                //先看有没有自动工位的
                                var autoStation = data.autoStation.split(","),
                                    autoArr = [];
                                for (var n = 1; n < 4; n++) {
                                    if (autoStation.indexOf(n.toString()) != -1 ) {
                                        autoArr.push({
                                            id: reservation.barberId,
                                            name: reservation.barberName,
                                            per: 100,
                                            specified: 1
                                        });
                                    }
                                }
                                if (autoArr.length) {
                                    itemData[key].servers = autoArr;
                                }
                            }
                            if (itemData[key].servers) {
                                var servers = [];
                                for (var j = 0; j < itemData[key].servers.length; j++) {
                                    if (!itemData[key].servers[j]) {
                                        continue;
                                    }
                                    var server = am.metadata.empMap[itemData[key].servers[j].id];
                                    if (server) {
                                        //this.billMain.addServer(server,$tr,items[i].servers[j].specified==1);
                                        servers.push({
                                            dutyid: server.dutyid,
                                            dutytypecode: server.dutyType,
                                            empId: server.id,
                                            empName: server.name,
                                            empNo: server.no,
                                            per: itemData[key].servers[j].per || 100,
                                            perf: 0,
                                            pointFlag: itemData[key].servers[j].specified,
                                            station: server.pos
                                        });
                                    }
                                }
                                this.billMain.setEmps(servers, $tr);
                            }
                        }
                    }
                }
                if ($tr) {
                    $tr.trigger("vclick");
                    this.billMain.onPriceChange();
                }
            }
        },
        concatEmployee:function(auto,list){
            var res = [],
                ret = [],
                ren = [],
                rek = [];
                repeat = {};//重复的map
                obj = {};
            if(list && list.length){
                for(var j=0;j<list.length;j++){
                    var itemj = list[j];
                    ret.push(itemj);
                    obj[itemj.id] = itemj;
                }
            }
            for(var i=0;i<auto.length;i++){
                var item = auto[i];
                item.isAuto = 1;
                res.push(item);
                obj[item.id] = item;
            }
            // ren = [].concat(res,ret);
            for(var key in obj){
                ren.push(obj[key]);
            }

            for(var l=0;l<ren.length;l++){
                var iteml = ren[l];
                if(!repeat[iteml.station]){
                    repeat[iteml.station] = [];
                } 
                repeat[iteml.station].push(iteml);
            }
            for(var key in repeat){
                var itema = repeat[key];
                var ts = [],tn=[];
                for(var h=0;h<itema.length;h++){
                    var itemh = itema[h];
                    if(itemh.isAuto==1){
                        ts.push(itemh);
                    }else{
                        tn.push(itemh);
                    }
                }
                if(ts.length && tn.length){
                    rek = [].concat(rek,tn);
                }else if(ts.length){
                    rek = [].concat(rek,ts);
                }else{
                    rek= [].concat(rek,tn);
                }
            }
            return rek;
        },
        feedMain: function(bill) {
            console.log("bill======", bill);
            var data;
            try {
                data = JSON.parse(bill.data);
            } catch (e) {
                $.am.debug.log(data);
            }
            if (data) {
                //洗发操作
                am.cashierTab.operatehair(bill);
                var items = data.serviceItems;
                if (data.genderGuest) {
                    this.$gender.addClass("male");
                } else {
                    if (data.memGender == "F") {
                        this.$gender.removeClass("male");
                    } else {
                        this.$gender.addClass("male");
                    }
                }
                this.$billNo.val(bill.serviceNO || "");
                var $tr;
                if (items && items.length) {
                    for (var i = 0; i < items.length; i++) {
                        var data = am.metadata.serviceItemMap[items[i].id];
                        if (data) {
                            data = am.clone(data);
                            data.noTreat = items[i].noTreat;
                            if (items[i].name == data.name) {
                                $tr = this.billMain.addItem(data, 1);
                            } else {
                                //存在项目变价
                                var datas = this.selectChangePrice(data, items[i]);
                                data.mgjAdjust = datas;
                                $tr = this.billMain.addItem(data, 1);
                            }

                            if (typeof items[i].oPrice != "undefined" && items[i].price != items[i].oPrice) {
                                $tr
                                    .find(".price")
                                    .text(items[i].price)
                                    .addClass("modifyed");
                            }
                            if (data.autoStation) {
                                //先看有没有自动工位的
                                var autoStation = data.autoStation.split(","),
                                    autoArr = [];
                                for (var n = 1; n < 4; n++) {
                                    if (autoStation.indexOf(n.toString()) != -1 && bill["emp" + n] != -1) {
                                        var s1 = am.metadata.empMap[bill["emp" + n]];
                                        autoArr.push({
                                            id: bill["emp" + n],
                                            name: bill["emp" + n + "Name"],
                                            per: 100,
                                            specified: bill["isSpecified" + n],
                                            station:s1.pos
                                        });
                                    }
                                }
                                if (autoArr.length) {
                                    if(items[i].notAuto!=0){
                                        items[i].servers = this.concatEmployee(autoArr,items[i].servers);
                                    }
                                }
                            }
                            if (items[i].servers) {
                                var servers = [];
                                for (var j = 0; j < items[i].servers.length; j++) {
                                    if (!items[i].servers[j]) {
                                        continue;
                                    }
                                    var server = am.metadata.empMap[items[i].servers[j].id];
                                    if (server) {
                                        //this.billMain.addServer(server,$tr,items[i].servers[j].specified==1);
                                        servers.push({
                                            dutyid: server.dutyid,
                                            dutytypecode: server.dutyType,
                                            empId: server.id,
                                            empName: server.name,
                                            empNo: server.no,
                                            per: !!items[i].servers[j].perf?0:items[i].servers[j].per,
                                            perf: items[i].servers[j].perf || 0,
                                            gain: items[i].servers[j].gain || 0,
                                            pointFlag: items[i].servers[j].specified,
                                            station: server.pos
                                        });
                                    }
                                }
                                this.billMain.setEmps(servers, $tr);
                            }
                        }
                    }
                }

                if ($tr) {
                    $tr.trigger("vclick");
                    this.billMain.onPriceChange();
                }
            }else{
                am.cashierTab.operatehair(null);
            }
        }
    }));
})();
