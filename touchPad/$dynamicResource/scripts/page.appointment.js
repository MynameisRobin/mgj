(function() {
    var serviceSelect = {
        init: function() {
            var _this = this;
            this.$ = $("#serviceItem");
            this.$close = this.$.find(".close").vclick(function() {
                _this.$.hide();
                _this.cb && _this.cb();
            });
            this.$serviceItems = this.$.find("div.serviceItems").on("vclick", "span", function() {
                $(this).toggleClass("selected");
                _this.updateAllSel();
            });

            this.scrollview = new $.am.ScrollView({
                $wrap: this.$.find(".serviceItemWrap"),
                $inner: this.$serviceItems,
                direction: [false, true],
                hasInput: false
            });
            this.$allSel = this.$.find(".checkBox").vclick(function() {
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                    _this.$serviceItems.find("span").removeClass("selected");
                } else {
                    $this.addClass("checked").removeClass("halfchecked");
                    _this.$serviceItems.find("span").addClass("selected");
                }
            });

            this.$.find(".button").vclick(function() {
                var sets = [];
                _this.$serviceItems.find("span").each(function() {
                    var $this = $(this);
                    sets.push({
                        name: $this.text(),
                        itemId: $this.attr("item-id"),
                        flag: $this.hasClass("selected") ? 1 : 0
                    });
                });

                _this.cb && _this.cb(sets);
                _this.$.hide();
            });
        },
        //[{"name":"显示男女客","key":"genderSelector","flag":1}]
        show: function(items, cb) {
            this.$serviceItems.empty();
            for (var i = 0; i < items.length; i++) {
                var itemClass = items[i];
                for (var key in itemClass) {
                    var $classItems = $("<div></div>").addClass("classItems");
                    //添加项目类型名称
                    var $itemClassDiv = $("<div></div>").addClass("itemClass");
                    $itemClassDiv.text(key);
                    $classItems.append($itemClassDiv);
                    this.$serviceItems.append($classItems);
                    var classItems = itemClass[key];
                    //存放类型的项目
                    var $divItems = $("<div></div>").addClass("items");
                    //循环项目
                    var $itemDiv = null;
                    for (var j = 0; j < classItems.length; j++) {
                        if (!$itemDiv) {
                            $itemDiv = $("<div></div>").addClass("item clearfix");
                        }
                        var $span = $("<span></span>").addClass("am-clickable");
                        var spanText = classItems[j].name;
                        $span.text(spanText).attr("item-id", classItems[j].id);
                        if (classItems[j].flag) {
                            $span.addClass("selected");
                        }
                        $itemDiv.append($span);
                        if (((j + 1) % 5 == 0 && j > 0) || j == classItems.length - 1) {
                            $divItems.append($itemDiv);
                            $classItems.append($divItems);
                            $itemDiv = null;
                        }
                    }
                }
            }
            this.$.css("display", "-webkit-box");
            this.cb = cb;
            this.scrollview.refresh();
            this.scrollview.scrollTo("top");
            this.updateAllSel();
        },
        updateAllSel: function() {
            var $spans = this.$serviceItems.find("span");
            var $sel = $spans.filter(".selected");
            if ($sel.length == $spans.length) {
                this.$allSel.addClass("checked").removeClass("halfchecked");
            } else if ($sel.length) {
                this.$allSel.removeClass("checked").addClass("halfchecked");
            } else {
                this.$allSel.removeClass("checked").removeClass("halfchecked");
            }
        }
    };
    serviceSelect.init();
    var that = (am.page.appointment = new $.am.Page({
        id: "page_appointment",
        init: function() {
            this.flag = false;
            this.num = 0;
            this.$radioLi = this.$.find(".radio li");

            this.$btnGroup = this.$.find(".customerResult");

            //this.$inputMask = this.$.find('.input-mask');
            this.$condition = this.$.find(".condition").keyup(function(evt) {
                if (evt.keyCode == 13) {
                    that.$search.trigger("vclick");
                }
            });
            this.$search = this.$.find(".search");
            this.$searchMoreBtn = this.$.find(".searchMoreShop");
            this.$new = this.$.find(".new");
            this.$create = this.$.find(".create");
            this.$content = this.$.find(".content");
            this.$find = this.$content.find(".find");
            this.$add = this.$content.find(".add");
            this.$searchresult = this.$.find(".searchresult");
            this.$remark = this.$content.find(".remark");
            this.$addtel = this.$content.find(".addtel");
            this.$addname = this.$content.find(".addname");
            this.$sex = this.$content.find(".sex");
            this.$conment = this.$remark.find("textarea");
            this.$conment.bind("input propertychange", function(e) {
                var conment = that.$conment.val();
                var len = 0;
                var realLen = 0;
                for (var i = 0; i < conment.length; i++) {
                    if (conment.charCodeAt(i) > 127 || conment.charCodeAt(i) == 94) {
                        len += 2;
                    } else {
                        len++;
                    }
                    if (len > 150) {
                        that.$conment.val(that.$conment.val().substring(0, realLen - 1));
                        am.msg("备注已达上限");
                        break;
                    }
                    realLen++;
                }
            });
            this.$radioLi.vclick(function() {
                $(this)
                    .addClass("active")
                    .siblings()
                    .removeClass("active");
                if (
                    $(this)
                        .parent()
                        .hasClass("method")
                ) {
                    if ($(this).index() == 0) {
                        that.$inputMask.show();
                        that.$condition.val("").attr("placeholder", "输入会员卡/手机");
                    } else {
                        that.$inputMask.hide();
                        that.$condition.val("").attr("placeholder", "输入姓名");
                    }
                }
            });

            this.$.find(".searchLastCard").vclick(function() {
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
                    that.render(that.cacheData, true);
                } else {
                    $(this)
                        .find(".iconfont")
                        .addClass("icon-checkboxoutlineblank");
                    $(this)
                        .find(".iconfont")
                        .removeClass("icon-checkbox");
                    that.render(that.cacheData, false);
                }
            });

            /*this.$inputMask.vclick(function(){
				var self = this;
				am.keyboard.show({
                    title:'输入会员卡/手机',//可不传
                    hidedot:true,//是否隐藏点
                    submit:function(value){
                    	var oldValue = $(self).prev().val();
                        $(self).prev().val(value==''? oldValue:value);
                    },
                    cancel:function(){

                    }
                });
			});*/

            this.$addtel.vclick(function() {
                var self = this;
                am.keyboard.show({
                    title: "输入手机号", //可不传
                    hidedot: true, //是否隐藏点
                    submit: function(value) {
                        var oldValue = $(self).html();
                        $(self).html(value == "" ? oldValue : value);
                        that.checkPhone(value == "" ? oldValue : value);
                    },
                    cancel: function() {}
                });
            });

            this.$search.vclick(function() {
                var dom = that.$.find(".searchLastCard");
                that.$radioLi.eq(0).trigger("vclick");
                var str = that.$condition.val();
                if (str == "") {
                    am.msg("请输入查询条件");
                    return;
                }
                that.$create.hide();
                that.$content.hide();
                that.$add.hide();

                that.$btnGroup.removeClass("active");
                that.searchMember(str);

                that.clearContent();
                that.$.removeClass("empty");
                dom.find(".iconfont").attr("class", "iconfont icon-checkboxoutlineblank");
            });

            this.$searchMoreBtn.vclick(function() {
                that.$radioLi.eq(1).trigger("vclick");
                var str = that.$condition.val();
                if (str == "") {
                    am.msg("请输入查询条件");
                    return;
                }
                that.$new.removeClass("active");
                that.$create.hide();
                that.$content.hide();
                that.$add.hide();
                var isActive = that.$btnGroup.hasClass("active");
                if( $(this).parent().hasClass('active')){
                    $(this).parent().removeClass('active');
                }else{
                    $(this).parent().addClass('active');
                }
                that.clearContent();
                that.$.removeClass("empty");
                that.searchMember(str, true);
            });

            this.$new.vclick(function() {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                    that.$create.hide();
                    that.$content.hide();
                    that.$add.hide();
                    that.$.addClass("empty");
                    that.clearContent();
                } else {
                    that.$searchresult.hide();
                    $(this).addClass("active");
                    that.$create.show();
                    that.$content.show();
                    if (that.mgjReservationItem) {
                        that.$content.find("#projectItemClass").hide();
                        that.$content.find("#projectItems").show();
                    } else {
                        that.$content.find("#projectItemClass").show();
                        that.$content.find("#projectItems").hide();
                    }
                    that.$add.show();
                    that.$find.hide();

                    that.$create.data("data", null);
                    that.calTime(new Date());
                }
            });

            this.$date = this.$content.find(".date");
            this.$date.mobiscroll().calendar({
                theme: "mobiscroll",
                lang: "zh",
                display: "bottom",
                months: "auto",
                min: new Date(),
                setOnDayTap: true,
                onSet: function(valueText, inst) {
                    console.log(valueText);
                    that.$date.html(new Date(valueText.valueText).format("yyyy-mm-dd"));
                    that.calTime(new Date(valueText.valueText));
                }
            });

            this.$time = this.$content.find(".time");
            this.$time.vclick(function() {
                var _this = $(this);
                am.popupMenu("请选择时间", that.timeArea, function(ret) {
                    _this.html(ret.name);
                });
            });
            //选择项目类型
            this.$project = this.$content.find(".project");
            this.$project.vclick(function() {
                if (that.serviceItem[0].name == "") {
                    am.msg("请在系统中设置预约项目");
                    return false;
                }
                var _this = $(this);
                am.popupMenu("请选择项目", that.serviceItem, function(ret) {
                    _this
                        .html(ret.name)
                        .attr("data-id", ret.id)
                        .attr("data-name", ret.name);
                    // alert(0);
                });
            });
            //选择项目
            this.$projectDetail = this.$content.find(".projectDetail");
            this.$projectDetail.vclick(function() {
                // console.log("that.serviceItemDetails====",that.serviceItemDetails)
                if (that.serviceItemDetails.length == 0) {
                    am.msg("请在系统中设置预约项目");
                    return false;
                }
                var _this = $(this);
                serviceSelect.show(that.serviceItemDetails, function(res) {
                    if (res) {
                        var items = that.serviceItemDetails;
                        _this.empty();
                        //选中的项目有哪些 flag:0未选中1选中
                        for (var i = 0; i < items.length; i++) {
                            var itemClass = items[i];
                            for (var key in itemClass) {
                                var classItems = itemClass[key];
                                for (var j = 0; j < classItems.length; j++) {
                                    for (var k = 0; k < res.length; k++) {
                                        if (res[k].itemId == classItems[j].id) {
                                            classItems[j].flag = res[k].flag;
                                        }
                                    }
                                }
                            }
                        }
                        //选中项目显示出来
                        for (var k = 0; k < res.length; k++) {
                            if (res[k].flag) {
                                var $span = $("<span></span>").addClass("item-span");
                                $span.text(res[k].name);
                                _this.append($span);
                            }
                        }

                        //组装要保存的高级预约模式的json
                        that.itemProp = {};
                        that.itemProp.strategy = am.metadata.configs.strategy;
                        var times = 0;
                        var temTimes = 0;
                        var items = that.serviceItemDetails;
                        var itemsJson = {};
                        for (var i = 0; i < items.length; i++) {
                            var itemClass = items[i];
                            for (var key in itemClass) {
                                var classItems = itemClass[key];
                                for (var j = 0; j < classItems.length; j++) {
                                    if (classItems[j].flag) {
                                        if (classItems[j].time) {
                                            temTimes = classItems[j].time;
                                            if (times > 0) {
                                                if (temTimes > times) {
                                                    times = temTimes;
                                                }
                                            } else {
                                                times = classItems[j].time;
                                            }
                                        }
                                        var itemKey = classItems[j].id;
                                        itemsJson[itemKey] = classItems[j];
                                    }
                                }
                            }
                        }
                        that.itemProp.times = times;
                        that.itemProp.items = itemsJson;
                        // console.log("that.serviceItemDetails2====", that.serviceItemDetails)
                        // console.log("that.that.itemProp====", that.itemProp)
                        // _this.saveSetting(res);
                    }
                });
            });

            this.$member = this.$content.find(".member");
            this.$member.vclick(function() {
                if (that.member[0].name == "") {
                    am.msg("请在系统中添加可预约员工");
                    return false;
                }
                var _this = $(this);
                am.popupMenu("请选择手艺人", that.member, function(ret) {
                    _this
                        .html(ret.name)
                        .attr("data-id", ret.id)
                        .attr("data-name", ret.name2);
                });
            });

            this.$number = this.$content.find(".number");
            this.$number.vclick(function() {
                var _this = $(this);
                am.popupMenu("请选择人数", that.serviceNumber, function(ret) {
                    _this.html(ret.name);
                });
            });

            this.$scroller = this.$.find(".scroller");
            this.$fixedTable = this.$.find("> .fixedHead > table");
            this.$table = this.$scroller.children();
            this.$tableTip = this.$scroller.find(".tip");
            // tr点击事件
            // this.$tbody = this.$table.children("tbody").on("vclick", "tr", function() {
            //     var item = $(this).data("item");
            //     console.log(item);
            //     that.$searchresult.hide();
            //     that.$create.show();
            //     that.$content.show();
            //     if (that.mgjReservationItem) {
            //         that.$content.find("#projectItemClass").hide();
            //         that.$content.find("#projectItems").show();
            //     } else {
            //         that.$content.find("#projectItemClass").show();
            //         that.$content.find("#projectItems").hide();
            //     }
            //     that.$find.show();
            //     that.$add.hide();

            //     that.$find.find(".name").html(item.name);
            //     if (item.sex == "M") {
            //         that.$sex.addClass("m").removeClass("f");
            //     } else {
            //         that.$sex.addClass("f").removeClass("m");
            //     }
            //     that.$find.find(".tel").html(item.mobile);
            //     that.$find.find(".header").html(
            //         am.photoManager.createImage(
            //             "customer",
            //             {
            //                 parentShopId: am.metadata.userInfo.parentShopId,
            //                 updateTs: item.lastphotoupdatetime || new Date().getTime()
            //             },
            //             item.id + ".jpg",
            //             "s"
            //         )
            //     );
            //     that.$find.find(".level").html(that.getShopName(item.shopId));
            //     that.$find.find(".score").html(item.points);
            //     that.$find.find(".card").html(item.cardName + "(" + item.cardNo + ")");
            //     that.$find.find(".remark").html(item.comment ? item.comment : "");

            //     that.$create.data("data", item);
            //     that.calTime(new Date());
            // });

            this.$tbody = $('.page_appointment .serviceTable-warp').on('vclick','.list-body',function(){
                var item = $(this).data("item");
                console.log(item);
                that.$searchresult.hide();
                that.$create.show();
                that.$content.show();
                if (that.mgjReservationItem) {
                    that.$content.find("#projectItemClass").hide();
                    that.$content.find("#projectItems").show();
                } else {
                    that.$content.find("#projectItemClass").show();
                    that.$content.find("#projectItems").hide();
                }
                that.$find.show();
                that.$add.hide();

                that.$find.find(".name").html(item.name);
                if (item.sex == "M") {
                    that.$sex.addClass("m").removeClass("f");
                } else {
                    that.$sex.addClass("f").removeClass("m");
                }
                that.$find.find(".tel").html(item.mobile);
                that.$find.find(".header").html(
                    am.photoManager.createImage(
                        "customer",
                        {
                            parentShopId: am.metadata.userInfo.parentShopId,
                            updateTs: item.lastphotoupdatetime || new Date().getTime()
                        },
                        item.id + ".jpg",
                        "s"
                    )
                );
                that.$find.find(".level").html(that.getShopName(item.shopId));
                that.$find.find(".score").html(item.points);
                that.$find.find(".card").html(item.cardName + "(" + item.cardNo + ")");
                that.$find.find(".remark").html(item.comment ? item.comment : "");

                that.$create.data("data", item);
                that.calTime(new Date());
            })


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

            this.$create.vclick(function() {
                //创建预约
                var data = $(this).data("data");
                var date = that.$date.html(),
                    time = that.$time.html(),
                    categoryId = that.$project.attr("data-id"),
                    categoryName = that.$project.attr("data-name"),
                    barberId = that.$member.attr("data-id"),
                    barberName = that.$member.attr("data-name"),
                    comment = that.$remark.find("textarea").val(),
                    name = that.$add.find(".addname").val(),
                    tel = that.$add.find(".addtel").html(),
                    sex = that.$add.find(".selectSex .active").index(),
                    custId = "";
                var numberText = that.$number.html();
                var number;
                if (numberText == "多人") {
                    number = 4;
                } else {
                    number = parseInt(numberText);
                }
                var timeArr = time.split(":"),
                    dataArr = date.split("-");
                var timeStamp = new Date(dataArr[0], dataArr[1] - 1, dataArr[2], timeArr[0], timeArr[1]);

                if (data) {
                    that.custId = data.id;
                }
                if (that.mgjReservationItem) {
                    if ($.isEmptyObject(that.itemProp.items)) {
                        am.msg("请选择预约项目");
                        return false;
                    }
                } else {
                    if (categoryId == "") {
                        am.msg("请选择预约项目");
                        return false;
                    }
                }
                if (!data) {
                    if (name == "") {
                        am.msg("请输入姓名");
                        return;
                    }
                    if (!tel || tel.length < 4) {
                        am.msg("手机号码必须大于4位！");
                        return;
                    }
                    if (sex < 0) {
                        am.msg("请选择性别");
                        return;
                    }
                    if (sex == 0) {
                        sex = "F";
                    }
                    if (sex == 1) {
                        sex = "M";
                    }
                    if (that.mgjReservationItem) {
                        if ($.isEmptyObject(that.itemProp.items)) {
                            am.msg("请选择预约项目");
                            return false;
                        }
                    } else {
                        if (categoryId == "") {
                            am.msg("请选择预约项目");
                            return false;
                        }
                    }
                }
                if (barberId == "") {
                    am.msg("请选择预约手艺人");
                    return false;
                }
                var reqDate = {};
                var res = {};
                if (that.mgjReservationItem) {
                    //高级模式
                    reqDate = {
                        time: timeStamp.getTime(),
                        barberId: barberId,
                        barberName: barberName,
                        number: number,
                        comment: comment,
                        name: name,
                        tel: tel,
                        sex: sex
                    };
                    res = {
                        parentShopId: am.metadata.userInfo.parentShopId,
                        shopId: am.metadata.userInfo.shopId,
                        reservationTime: reqDate.time,
                        barberId: reqDate.barberId,
                        barberName: reqDate.barberName,
                        channel: 4, //0收银台 1美一客web 2美一客app 3生意宝 4小掌柜
                        type: 0, //0预约 1占位
                        custId: that.custId,
                        number: reqDate.number,
                        comment: reqDate.comment,
                        reservationType: 0, //0预约 1反预约
                        itemProp: that.itemProp
                        // itemProp: { // 高级预约模式下，保存预约项目明细
                        //     strategy: am.metadata.configs.strategy, // 当前配置的预约时间模式 0半点 1整点
                        //     times: 3, // 最大占用时间单位，根据此项去判断生成几条预约占用记录
                        //     items: { // 预约的普通项目
                        //         'itemId': {} // key = item.id
                        //     }
                        // }
                    };
                } else {
                    reqDate = {
                        time: timeStamp.getTime(),
                        categoryId: categoryId,
                        categoryName: categoryName,
                        barberId: barberId,
                        barberName: barberName,
                        number: number,
                        comment: comment,
                        name: name,
                        tel: tel,
                        sex: sex
                    };
                    res = {
                        parentShopId: am.metadata.userInfo.parentShopId,
                        shopId: am.metadata.userInfo.shopId,
                        reservationTime: reqDate.time,
                        barberId: reqDate.barberId,
                        barberName: reqDate.barberName,
                        channel: 4, //0收银台 1美一客web 2美一客app 3生意宝 4小掌柜
                        type: 0, //0预约 1占位
                        custId: that.custId,
                        categoryId: reqDate.categoryId,
                        categoryName: reqDate.categoryName,
                        number: reqDate.number,
                        comment: reqDate.comment,
                        reservationType: 0 //0预约 1反预约
                    };
                }
                if (data) {
                    that.reservationAdd(res);
                } else {
                    if (that.hasCheckPhonePassed) {
                        if (that.repeatedPhone) {
                            if (!that.mbRepeatConfig) {
                                that.$addtel.text("");
                                am.msg("手机号码已经被使用，请换一个输入");
                                return;
                            } else {
                                atMobile.nativeUIWidget.confirm(
                                    {
                                        caption: "手机号重复",
                                        description: "手机号码已经被使用，确认用此手机号码新建预约吗？",
                                        okCaption: "确定",
                                        cancelCaption: "取消"
                                    },
                                    function() {
                                        if (!that.hasAddMember) {
                                            that.addMember(reqDate, function() {
                                                res.custId = that.custId;
                                                that.reservationAdd(res);
                                            });
                                        } else {
                                            that.reservationAdd(res);
                                        }
                                    },
                                    function() {}
                                );
                            }
                        } else {
                            if (!that.hasAddMember) {
                                that.addMember(reqDate, function() {
                                    res.custId = that.custId;
                                    that.reservationAdd(res);
                                });
                            } else {
                                that.reservationAdd(res);
                            }
                        }
                    } else {
                        am.msg("手机号码校验失败");
                    }
                }
            });
        },
        beforeShow: function(params) {
            this.$condition.val("");

            this.$btnGroup.removeClass("active");

            var userInfo = am.metadata.userInfo;
            if (userInfo.shopId == userInfo.parentShopId) {
                //单店
                this.$.find(".searchMoreShop").hide();
            } else {
                this.$.find(".searchMoreShop").show();
            }
            //服务项目类型
            if (!this.serviceItem.length) {
                for (var i = 0; i < am.metadata.classes.length; i++) {
                    if(am.metadata.configs.mgjReservationItem != "true"){
                        if (am.metadata.classes[i].isshow == 0) {//非高级预约模式 需要过滤
                            this.serviceItem.push(am.metadata.classes[i]);
                        }
                    }else{
                        this.serviceItem.push(am.metadata.classes[i]);
                    }
                    //alert(0);
                }
                if (!this.serviceItem.length) {
                    this.serviceItem[0] = {
                        name: "",
                        id: ""
                    };
                }
            }
            this.mgjReservationItem = am.metadata.configs.mgjReservationItem == "true";
            if (am.metadata.configs.mgjReservationItem == "true") {
                //启用了高级预约模式
                var _this = this;
                if (!_this.serviceItemDetails.length) {
                    _this.serviceItemDetails = [];
                    _this.reservationQuery(function(data) {
                        // console.log("data=====",data)
                        var temp = data.mgjReservationConfig,
                            reserConfig = '',
                            mgjReservationConfig = {};
                        if( _this.isJSON(temp) ){
                            mgjReservationConfig = JSON.parse(temp);
                        }else{
                            reserConfig= temp;//字符串
                            mgjReservationConfig = _this.parseReserConfig( reserConfig) || {};//对象拿去渲染
                        }
                        // console.log("mgjReservationConfig=====",mgjReservationConfig)
                        //先得到可预约的项目
                        var itemDetails = {};
                        var serviceItemMap = am.metadata.serviceItemMap;
                        for (var i in mgjReservationConfig) {
                            for (var j in serviceItemMap) {
                                if (i == serviceItemMap[j].itemid) {
                                    var json = {};
                                    json[j] = serviceItemMap[j];
                                    configJson = mgjReservationConfig[i];
                                    // console.log("configJson====", configJson)
                                    for (var k in configJson) {
                                        if (k != "name" || (configJson[k] != "" && k == "name")) {
                                            serviceItemMap[j][k] = configJson[k];
                                        }
                                    }
                                    itemDetails[j] = json[j];
                                }
                            }
                        }
                        //服务项目明细
                        for (var i = 0; i < _this.serviceItem.length; i++) {
                            var classFlag = false;
                            var tempClasses = {};
                            var classItems = [];
                            for (var key in itemDetails) {
                                if (itemDetails[key].classid == _this.serviceItem[i].classid && itemDetails[key].reserv) {
                                    classItems.push(itemDetails[key]);
                                }
                            }
                            if (classItems.length > 0) {
                                tempClasses[_this.serviceItem[i].name] = classItems;
                                _this.serviceItemDetails.push(tempClasses);
                            }
                        }
                    });
                }
            }
            //随行人数
            if (!this.serviceNumber.length) {
                for (var i = 0; i < 4; i++) {
                    this.serviceNumber[i] = {};
                    this.serviceNumber[i].name = (i + 1).toString();
                    if (i == 3) {
                        this.serviceNumber[i].name = "多人";
                    }
                }
            }

            if (!this.startHour) {
                var sts = (am.metadata.configs.reservationFrom || "9:00").split(":");
                var ets = (am.metadata.configs.reservationTo || "22:00").split(":");
                var startTs = new Date(am.now().format("yyyy/mm/dd ") + (am.metadata.configs.reservationFrom || "9:00") + ":00");
                var endTs = new Date(am.now().format("yyyy/mm/dd ") + (am.metadata.configs.reservationTo || "22:00") + ":00");
                this.startHour = sts[0] * 1;
                if (ets[1] * 1 > 0) {
                    this.endHour = ets[0] * 1;
                } else {
                    this.endHour = ets[0] * 1;
                }
            }

            //可预约员工
            this.member = [];
            for (var i = 0; i < am.metadata.employeeList.length; i++) {
                if (am.metadata.employeeList[i].mgjshowinmyk == 1) {
                    this.member.push({
                        name: am.metadata.employeeList[i].name,
                        no: am.metadata.employeeList[i].no,
                        id: am.metadata.employeeList[i].id
                    });
                }
            }
            for (var i = 0; i < this.member.length; i++) {
                this.member[i].name2 = this.member[i].name;
                this.member[i].name = this.member[i].no + " " + this.member[i].name;
            }
            if (!this.member.length) {
                this.member[0] = {
                    name: "",
                    name2: "",
                    id: ""
                };
            }

            this.$date.html(new Date().format("yyyy-mm-dd"));
            this.$project
                .html(this.serviceItem[0].name)
                .attr("data-id", this.serviceItem[0].id)
                .attr("data-name", this.serviceItem[0].name);
            this.$projectDetail.html("");
            for (var i = 0; i < this.serviceItemDetails.length; i++) {
                var classItemJson = this.serviceItemDetails[i];
                for (var key in classItemJson) {
                    var itemClassArray = classItemJson[key];
                    for (var j = 0; j < itemClassArray.length; j++) {
                        itemClassArray[j].flag = 0;
                    }
                }
            }

            this.$number.html(this.serviceNumber[0].name);
            this.$member
                .html(this.member[0].name)
                .attr("data-id", this.member[0].id)
                .attr("data-name", this.member[0].name2);

            if (!this.hideDepart) {
                if (am.metadata.shopList.length == 1) {
                    this.$.find(".depart").hide();
                }
                this.hideDepart = true;
            }
            var configs = am.metadata.configs;
            if (configs && configs["mobileRepeat"]) {
                this.mbRepeatConfig = JSON.parse(configs["mobileRepeat"]);
            }
            // 如果是电话宝进来的
            if (params && !am.isNull(params.data)) {
                if (!am.isNull(params.data.phoneCall)) {
                    this.clearContent();
                    var that = this;
                    var item = params.data.phoneCall;
                    that.$searchresult.hide();
                    that.$create.show();
                    that.$content.show();
                    if (that.mgjReservationItem) {
                        that.$content.find("#projectItemClass").hide();
                        that.$content.find("#projectItems").show();
                    } else {
                        that.$content.find("#projectItemClass").show();
                        that.$content.find("#projectItems").hide();
                    }
                    that.$find.show();
                    that.$add.hide();
                    if (params.data.type == 1) {
                        that.$add.find(".new").trigger("vclick");
                        that.$add.find(".addtel").html(params.data.phoneCall);
                        that.hasCheckPhonePassed = true;
                        return;
                    }
                    that.$find.find(".name").html(item.name);
                    if (item.sex == "M") {
                        that.$sex.addClass("m").removeClass("f");
                    } else {
                        that.$sex.addClass("f").removeClass("m");
                    }
                    that.$find.find(".tel").html(item.mobile);
                    that.$find.find(".header").html(
                        am.photoManager.createImage(
                            "customer",
                            {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: item.lastphotoupdatetime || new Date().getTime()
                            },
                            item.id + ".jpg",
                            "s"
                        )
                    );
                    that.$find.find(".level").html(that.getShopName(item.shopId));
                    that.$find.find(".score").html(item.points);
                    that.$find.find(".card").html(item.cardName + "(" + item.cardNo + ")");
                    that.$find.find(".remark").html(item.comment ? item.comment : "");
                    that.$create.data("data", item);
                    that.calTime(new Date());
                }
            }
        },
        serviceItem: [],
        serviceItemDetails: [],
        serviceNumber: [],
        timeArea: [],
        itemProp: {},
        mgjReservationItem: false,
        calTime: function(date) {
            if (date.format("yyyymmdd") == new Date().format("yyyymmdd")) {
                var nowHour = new Date().getHours() + 1;
                if (nowHour > this.startHour) {
                    this.startHour = nowHour;
                }
            } else {
                this.startHour = (am.metadata.configs.reservationFrom || "9:00").split(":")[0] * 1;
            }
            this.timeArea = [];
            var startTs = new Date(am.now().format("yyyy/mm/dd ") + (this.startHour + ":00" || "9:00") + ":00").getTime();
            var endTs = new Date(am.now().format("yyyy/mm/dd ") + (this.endHour + ":00" || "22:00") + ":00").getTime();
            var blocks = (endTs - startTs) / 1800000;
            for (var i = 0; i < blocks; i++) {
                var time = new Date(startTs + i * 1800000);
                var min = time.format("MM");
                if ((am.metadata.configs.strategy == 1 && min != 30) || am.metadata.configs.strategy == 0) {
                    this.timeArea.push({
                        name: time.format("HH") + ":" + min
                    });
                }
            }
            this.$time.html(this.startHour + ":00");
        },
        isJSON:function(something){
            if (typeof something == 'string') {
                try {
                    JSON.originalParse(something);
                    return true;
                } catch(e) {
                    console.log(e);
                    return false;
                }
            }
        },
        parseReserConfig:function(str){
            console.log(str);
            if(str){
                var obj = {},arr = [];
                arr = str.split('~');
                console.log(arr);
                $.each(arr,function(i,item){
                    if(item){
                        var propArr = item.split('_');
                        console.log(propArr);
                        obj[propArr[0]] = {};
                        obj[propArr[0]].name = propArr[1];
                        obj[propArr[0]].time = propArr[2]*1;
                        obj[propArr[0]].priceFlag = propArr[3]*1;
                        obj[propArr[0]].reserv = 1;
                        if(propArr[4]){
                            obj[propArr[0]].mgjReservationDays = propArr[4];
                        }
                    }
                })
                console.log(obj);
                return obj;
            }
        },
        afterShow: function() {},
        beforeHide: function() {},
        afterHide: function() {
            this.clearContent();
        },
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        render: function(data, hideIf) {
            var $tbody = this.$tbody;
            this.cacheData = data;
            var ishide = this.$.find(".searchLastCard .icon-checkbox").size();
            $tbody.empty();
            this.$searchresult.show();
            if (!data || !data.length) {
                am.msg("暂无数据");
                this.$btnGroup.addClass("empty");
            } else {
                this.$tbody.show();
                this.$btnGroup.removeClass("empty");
                var _filterData = this.filterData(data,hideIf);
                this.renderList(_filterData);
                // $.each(data, function(i, item) {
                //     if (am.operateArr.indexOf("MGJP") != -1) {
                //         item.realMobile = item.mobile;
                //         item.mobile = item.mobile.replace(/\d{4}$/, "****");
                //     }

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
                //             "    <td>" + that.getShopName(item.shopId) + "</td>",
                //             // '    <td>' + new Date(item.createDateTime).format("yyyy-mm-dd") + '</td>',
                //             '    <td><div class="comment">' + (item.comment || "--") + "</div></td>",
                //             "</tr>"
                //         ].join("")
                //     );
                //     $tr.data("item", item);
                //     $tbody.append($tr);
                // });
            }

            var isActive = this.$btnGroup.hasClass("active");
            if(isActive){
                txt = "在本店中搜索：" + this.$condition.val();
                that.$searchresult.removeClass('active');
            }else{
                txt = "在分店中搜索：" + this.$condition.val();
                that.$searchresult.addClass('active');
            }
            this.$searchresult.find(".title").html(txt);
            this.resetHeight();
            this.sc.refresh();
            this.sc.scrollTo("top");
            //this.$condition.val('');
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
            var $serviceTableWarp = $('.page_appointment .serviceTable .serviceTable-warp');
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
                    $dt = $('<dt class="list-title-warp"><div class="name"> '+itemIndex.name+'  （'+ that.getShopName(itemIndex.shopId)+'）</div><div class="phone"><i class="icon iconfont icon-44"></i> '+ am.processPhone(itemIndex.mobile) +' </div><div class="score"><i class="icon iconfont icon-jifen"></i> 积分 ：'+itemIndex.points+'</div><div class="mark"><i class="icon iconfont icon-24_beizhu"></i> 备注 ：'+itemIndex.comment+'</div></dt>')
                }else{
                    $dt = $('<dt class="list-title-warp"><div class="name"> '+itemIndex.name+'  （'+ that.getShopName(itemIndex.shopId)+'）</div><div class="phone"><i class="icon iconfont icon-44"></i> '+ am.processPhone(itemIndex.mobile) +' </div><div class="score"><i class="icon iconfont icon-jifen"></i> 积分 ：'+itemIndex.points+'</div></dt>')
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
            //顶部200 高度 底部90
            // var h = $('body').height();
            // var maxHeight = h-193-90;
            // var bheight   = this.$.find(".scroller table").height() + 80;
            // if(bheight>maxHeight){
            //     this.$.find(".scroller").css("max-height",maxHeight + "px");
            // }else{
            //     this.$.find(".scroller").css("max-height",bheight + "px");
            // }
            var h = $('body').height();
            var maxHeight = h-180-100;
            var bheight   = this.$.find(".serviceTable .serviceTable-warp").height();
            if(bheight>maxHeight){
                this.$.find(".serviceTable").css("max-height",maxHeight + "px");
            }
            var w =  this.$.find(".serviceTable .serviceTable-warp").width();
            // var markMax = w - 75-306-101-231-231-101-6;
            // this.$.find(".list-body  .mark").css("width",markMax + "px");

            var markMax = '';
            if($('body').height()<1100){
             markMax = w - 75-231-181-181-111-30;
            }else{
             markMax = w - 75-306-101-231-231-101-6;
            }
            this.$.find(".list-body  .mark").css("width",markMax + "px");

        },
        searchMember: function(str) {
            var idx = 0;
            if (this.$.find(".depart li.active").index() == 1) {
                idx = 1;
            }
            var shopIds;
            
            if (idx == 0) {
                shopIds = am.metadata.userInfo.shopId;
            } else {
                shopIds = this.getshopIds(am.metadata.userInfo.shopId);
            }
            var isActive = this.$btnGroup.hasClass("active");
            if (isActive) {
                shopIds = this.getshopIds(am.metadata.userInfo.shopId);
                this.$btnGroup.removeClass("active");
            } else {
                shopIds = am.metadata.userInfo.shopId;
                this.$btnGroup.addClass("active");
            }

            str = str.replace('j0102','*0102').replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, "");

            am.loading.show();
            am.api.searchmember.exec(
                {
                    parentShopId: am.metadata.userInfo.parentShopId,
                    shopId: am.metadata.userInfo.shopId,
                    shopIds: shopIds,
                    keyword: str,
                    pageSize: 9999,
                    pageNumber: 0
                },
                function(ret) {
                    am.loading.hide();
                    console.log(ret);
                    if (ret.code == 0) {
                        console.log(that.num);
                        that.num = 1;
                        that.data = ret.content;
                        that.render(ret.content);
                    } else {
                        am.msg(ret.message || "数据获取失败，请重试！");
                    }
                }
            );
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
        getShopName: function(id) {
            for (var i = 0; i < am.metadata.shopList.length; i++) {
                if (am.metadata.shopList[i].shopId == id) {
                    return am.metadata.shopList[i].osName;
                }
            }
            return "--";
        },
        checkPhone: function(phone) {
            this.hasCheckPhonePassed = false;
            var self = this;
            am.api.checkMobile.exec(
                {
                    mobile: phone,
                    shopId: am.metadata.userInfo.shopId
                },
                function(res) {
                    console.log(res);
                    if (res.code == 13001) {
                        am.msg("手机号码已经被使用，请换一个输入");
                        self.hasCheckPhonePassed = true;
                        self.repeatedPhone = true;
                    } else if (res.code == 0) {
                        self.hasCheckPhonePassed = true;
                        self.repeatedPhone = false;
                    } else {
                        am.msg("手机号码校验失败！");
                        self.hasCheckPhonePassed = false;
                    }
                }
            );
        },
        addMember: function(data, callback) {
            am.loading.show();
            am.api.createMember.exec(
                {
                    shopId: am.metadata.userInfo.shopId,
                    parentShopId: am.metadata.userInfo.parentShopId,
                    name: data.name,
                    mobile: data.tel,
                    sex: data.sex,
                    sourceId: 1,
                    page: ""
                },
                function(res) {
                    am.loading.hide();
                    console.log(res);
                    if (res.code == 0 && !that.hasAddMember) {
                        that.custId = res.content[0].id;
                        that.hasAddMember = true;
                        callback();
                    } else {
                        am.msg(res.message || "数据获取失败,请检查网络!");
                    }
                }
            );
        },
        //查询预约高级配置
        reservationQuery: function(cb) {
            am.loading.show();
            am.api.reservationQuery.exec(
                {
                    parentShopId: am.metadata.userInfo.realParentShopId,
                    shopId: am.metadata.userInfo.shopId
                },
                function(ret) {
                    am.loading.hide();
                    if (ret.code == 0) {
                        cb && cb(ret.content);
                    } else {
                        am.msg(ret.message || "查询失败，请刷新！", true);
                    }
                }
            );
        },
        reservationAdd: function(data) {
            am.loading.show("正在提交，请稍候...");
            // {
            //     parentShopId: am.metadata.userInfo.parentShopId,
            //     shopId: am.metadata.userInfo.shopId,
            //     reservationTime: data.time,
            //     barberId: data.barberId,
            //     barberName: data.barberName,
            //     channel: 4, //0收银台 1美一客web 2美一客app 3生意宝 4小掌柜
            //     type: 0, //0预约 1占位
            //     custId: that.custId,
            //     categoryId: data.categoryId,
            //     categoryName: data.categoryName,
            //     number: data.number,
            //     comment: data.comment,
            //     reservationType: 0 //0预约 1反预约
            // }
            am.api.reservationAdd.exec(data, function(ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    am.msg("预约已经登记！");
                    $.am.changePage(am.page.reservation, "slideup");
                    that.clearContent();
                    am.socketPush.getReservationNum();
                } else {
                    am.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        },
        clearContent: function() {
            this.$addname.val("");
            this.$addtel.html("");
            this.$remark.find("textarea").val("");
            this.$content.hide();
            this.$create.hide();
            this.$searchresult.hide();
            this.$.addClass("empty");
            this.$new.removeClass("active");
            this.$.find(".selectSex li").removeClass("active");
            that.custId = "";
            that.hasAddMember = false;
        }
    }));
})();
