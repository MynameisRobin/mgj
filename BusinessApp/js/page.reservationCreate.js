(function() {

    var self = amGloble.page.reservationCreate = new $.am.Page({
        id: "page-reservationCreate",
        disableScroll: true,
        backButtonOnclick: function() {
            //点击返回关闭页面chali
            self.$bool = false;
            self.$content.empty();
            $.am.page.back("slidedown");
        },
        init: function() {
            var self = this;
            self.$itemsArray =[];
            //搜索客户相关
            this.$key = this.$.find(".searchBox input").focus(function() {
                self.closeSearch();
            });
            this.$searchBtn = this.$.find(".searchBox .searchBtn").vclick(function() {
                var val = self.$key.val();
                if (!$.trim(val)) {
                    amGloble.msg("请输入搜索关键字");
                    return;
                }
                if ($(this).hasClass("gray")) {
                    self.closeSearch();
                } else {
                    self.openSearch(val);
                }
            });

            this.sv_searchResult = new $.am.ScrollView({
                $wrap: this.$.find(".searchResult"),
                $inner: this.$.find(".searchResult > .searchResult-inner")
            });

            //显示项目滚动
            this.itemsConfirmScrollView = new $.am.ScrollView({
                $wrap: this.$.find(".itemsConfirm"),
                $inner: this.$.find(".itemsConfirm > .content"),
                direction: [false, true],
                hasInput: false
            });


            this.$searchResult = this.$.find(".searchResult");
            this.$ul = this.$.find(".c-custList").on("vclick", "li", function() {
                var item = $(this).data("item");
                self.selectCust(item);
                self.closeSearch();
            });
            this.$li = this.$ul.find(":first").remove();

            //客户详情
            this.$custInfo = this.$.find(".rv_custInfo");
            this.$toptip = this.$.find(".toptip");

            //时间chali
            this.$time = this.$.find("#cr_time").vclick(function() {
                amGloble.popupMenu("请选择预约时间",  self.trTimes, function(trTime) {
                    self.$time.html(trTime.name);
                    self.$time.data("data",trTime.time);
                    self.timeNum = trTime.timeNum;
                });
            }, "name");

            //项目弹窗chali
            this.$page_button = this.$.find(".rv_creatFrom .footer .page_button");
            this.$page_button.css("background-color","#d1d1d1")
            this.$itemsConfirm = this.$.find(".itemsConfirm");
            this.$content = this.$itemsConfirm.find(".content");
            this.$body = this.$.find(".am-body-wrap");
            this.$header = this.$.find(".am-header");
            this.$headerClone = this.$header.clone();
            this.$itemType = this.$itemsConfirm.find(".content .itemType");
            this.$itemDiv = this.$itemType.find(".items .item")
            this.$itemTypeClone = this.$itemType.clone();
            this.$itemDivClone = this.$itemDiv.clone();
            self.$content.empty();

            
            //项目和人数选择chali
            this.$selectCati = this.$.find("#cr_selectCati").vclick(function() {
                
                self.$itemsConfirm.height(self.$body.outerHeight());
                self.$header.find(".left").hide();
                self.$header.find("p").hide();
                self.$header.append("<div class='cancel'>取消</div><div class='p'>项目</div><div class='confirm'>确定</div>")
                console.log("出来了没？",self.$header);
                //判断是否是选择项目并点击确定后再次进入
                if(!self.$bool){
                    //判断门店是否开启高级预约
                    console.log(amGloble.metadata.configs.mgjReservationItem,"高级预约模式")
                    if(amGloble.metadata.configs.mgjReservationItem == "true"){
                        $.each(self.$classes, function(i, itemType) {
                            var typeClone = self.$itemTypeClone.clone();
                            typeClone.find(".type").text(itemType.name);
                            typeClone.find(".items").empty();

                            for (var i = 0; i < self.$items.length; i++) {
                                var item = self.$items[i]
                                if (item.classid == itemType.classid && item.reserv) {
                                    var itemDiv = self.$itemDivClone.clone();
                                    itemDiv.text(item.name);
                                    itemDiv.data("item", item);
                                    typeClone.find(".items").append(itemDiv);
                                }
                            }

                            if(typeClone.find(".items .item").length){
                                self.$content.append(typeClone);
                            }
                        });
                        //点击选择/取消项目
                        self.$itemsConfirm.find(".content .itemType .items .item").vclick(function(){
                            var item = $.data(this,"item");
                            var itemDom = $(this);
                            //取消
                            if(itemDom.hasClass("bgcolor")){
                                itemDom.removeClass("bgcolor");
                                var index = $.inArray(item, self.$itemsArray);
                                if(index != -1){
                                    self.$itemsArray.splice(index,1);
                                    self.itemTimeNum = 0 ;
                                    //重新计算最长预约占用时间
                                    $.each(self.$itemsArray,function(i,item){
                                        if(item.time >self.itemTimeNum){
                                            self.itemTimeNum = item.time;
                                        }
                                    })
                                    self.trTimes = [];
                                    //重新显示时间
                                    $.each(self.$parasTimes,function(i,trTime){
                                        if(trTime.timeNum >= self.itemTimeNum && trTime.time > amGloble.now()){
                                            self.trTimes.push(trTime);
                                        }
                                    })
                                }
                            //选择项目
                            }else{
                                //计算项目时长
                                if(item.time <= self.timeNum ){
                                    if(item.time >self.itemTimeNum){
                                        self.itemTimeNum = item.time;
                                        self.trTimes = [];
                                        //添加项目，计算时长
                                        $.each(self.$parasTimes,function(i,trTime){
                                            if(trTime.timeNum >= self.itemTimeNum && trTime.time > amGloble.now()){
                                                self.trTimes.push(trTime);
                                            }
                                        })
                                    }
                                    itemDom.addClass("bgcolor");
                                    self.$itemsArray.push(item);
                                }else{
                                    amGloble.msg("此项目耗时超出本时间段可预约时长，建议换个时间预约")
                                }
                            }
                        });
                    }else{
                        $.each(self.$classes, function(i, itemType) {
                            var typeClone = self.$itemTypeClone.clone();
                            typeClone.find(".type").text(itemType.name);
                            typeClone.find(".items").empty();
                            typeClone.data("itemType",itemType);
                            typeClone.addClass("bottomBoder")
                            self.$content.append(typeClone);
                        });
                        self.$itemsConfirm.find(".content .itemType").vclick(function(){
                            var itemType = $.data(this,"itemType");
                            self.confirmClick(itemType.name,itemType);
                        });
                    }
                }
                // 点击取消
                self.$header.find(".cancel").vclick(function(){
                    console.log("取消");
                    self.cancelClick()
                });
                // 点击确定
                self.$header.find(".confirm").vclick(function(){
                    console.log("确定");
                    self.confirmClick("","")
                });
                self.$itemsConfirm.show();
                self.itemsConfirmScrollView.refresh();
                self.itemsConfirmScrollView.scrollTo("top");
            });
            //人数
            this.$selectNumber = this.$.find("#cr_selectNumber").vclick(function() {
                amGloble.popupMenu("请选择人数", [{
                    name: "1",
                    value:"1"
                }, {
                    name: "2",
                    value:"2"
                }, {
                    name: "3",
                    value:"3"
                }, {
                    name: "多人",
                    value:"4"
                }], function(ret) {
                    console.log(ret);
                    self.$selectNumber.html(ret.name).data("data", ret);
                });
            }, "name");

            //备注
            this.$comment = this.$.find("#cr_comments");

            //提交
            this.$.find("#cr_submit").vclick(function() {
                self.save();
            });
        },

        beforeShow: function(paras) {
            console.log('11:'+ amGloble.metadata.userInfo.shopId)
            amGloble.loading.show("正在登录,请稍候...");
            amGloble.api.metadata.exec({
            }, function(ret, isLocal) {
                amGloble.loading.hide();
                if (ret.code == 0 && ret.content) {
                    amGloble.metadata = amGloble.processMetadata($.extend(true, {}, ret.content));
                }
                self.getData();
            });
            this.itemTimeNum = 0;
            this.$time.html(paras.reservationTime.format("yyyy-mm-dd HH:MM"));
            this.$time.data("data", paras.reservationTime);
            this.refreshPage();
            
            console.log(paras,"paras是啥玩意",amGloble.metadata)
            this.timeNum = paras.timeNum;
            this.$parasTimes = paras.trTimes;
            this.trTimes = paras.trTimes;
        
            if(paras.customerId){
                this.initCust(paras);
            }
            //chali 我
            if(paras.user){
                this.selectCust(paras.user);
            }
        },

        afterShow: function() {
            console.log("这个在什么时候出来？")
        },

        refreshPage: function() {
            this.closeSearch();
            this.clearForm();
        },
        clearForm: function() {
            this.$toptip.show();
            this.$custInfo.hide().removeData('data');
            this.$selectCati.html("请选择").removeData('data');
            this.$selectNumber.html("1").data('data', {
                name: 1,
                value:"1"
            });
            this.$comment.val("");
        },
        openSearch: function(key) {
            this.$searchResult.show();
            this.$searchBtn.addClass("gray");
            var opt={
                "type": 0,
                "key": key,
                "shopIds": amGloble.getKeyArr(amGloble.metadata.shops, "shopId", true, true).join(","),
                "empid": amGloble.metadata.userInfo.userId,
                "userType": 1, // 1 管理员 0 员工
                "pageNumber": 0,
                "pageSize": 99
            }
            if(typeof amGloble.metadata!='undefined'&&
              typeof amGloble.metadata.configs!='undefined'&&
              typeof amGloble.metadata.configs.counterReservation!='undefined'&&
              amGloble.metadata.configs.counterReservation=='true'
            ){
              opt.userType=0
            }
            amGloble.api.customerQuerCusts.exec(opt, function(ret) {
                console.log(ret);
                if (ret.code == "0") {
                    self.renderSearch(ret.content);
                } else {
                    amGloble.msg("数据加载失败");
                }

            });

        },
        getData:function(){
            console.log('22:'+ amGloble.metadata.userInfo.shopId)
            amGloble.loading.show("正在请求数据，请稍候...");
            amGloble.api.reservationQueryConfig.exec({
                shopId: amGloble.metadata.userInfo.shopId,
                parentShopId:amGloble.metadata.userInfo.realParentShopId,
            }, function(ret) {
                amGloble.loading.hide();
                
                if (ret.code == 0) {
                    var temp = ret.content.mgjReservationConfig,
                        reserConfig = '',
                        mgjReservationConfig = {};
                    if( self.isJSON(temp) ){
                        mgjReservationConfig = JSON.parse(temp);
                    }else{
                        reserConfig= temp;//字符串
                        mgjReservationConfig = self.parseReserConfig( reserConfig) || {};//对象拿去渲染
                    }
                    self.$items = ret.content.items;
                    self.$classes = ret.content.classes;
                    self.$itemsArray = [];
                    for (var i = 0; i < self.$items.length; i++) {
                        var item = self.$items[i];
                        // 处理预约配置
                        if (mgjReservationConfig && mgjReservationConfig.hasOwnProperty(item.itemid)) {
                            var conf = mgjReservationConfig[item.itemid];
                            for (var key in conf) {
                                if (conf.hasOwnProperty(key)) {
                                    if(key != "name" || conf[key]){
                                        item[key] = conf[key];
                                    }
                                    
                                }
                            }
                        }
                    }
                    console.log(self.$items);
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
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
            if(str){
                var obj = {},arr = [];
                arr = str.split('~');
                $.each(arr,function(i,item){
                    if(item){
                        var propArr = item.split('_');
                        //console.log(propArr);
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
                return obj;
            }
        },
        //选择项目确定
        confirmClick:function(text,data){
            if (self.$itemsArray.length == 0 && amGloble.metadata.configs.mgjReservationItem == "true") {
                amGloble.msg("请选择项目");
                return;
            }
            self.$bool = true;
            // self.$header.empty();
            self.$header.find(".cancel").hide();
            self.$header.find(".p").hide();
            self.$header.find(".confirm").hide();
            self.$header.find(".left").show();
            self.$header.find("p").show();
            // self.$header.append('<div class="am-clickable button left am-backbutton"></div><p>创建预约</p>');
            var txt = text;
            $.each(self.$itemsArray,function(j,item){
                txt += item.name + ",";
            });
            if(txt){
                self.$selectCati.text(txt);
            }else{
                self.$selectCati.text("请选择");
            }
            self.$selectCati.data('data',data);
            self.$itemsConfirm.hide();
            if(self.$custInfo.data("data") &&(self.$selectCati.data('data') || self.$itemsArray.length)){
                self.$page_button.css("background-color","#2dbd84")
            }else{
                self.$page_button.css("background-color","#d1d1d1")
            }
        },
         //选择项目取消
        cancelClick:function(){
            self.$content.empty();
            self.$itemsArray = [];
            self.$header.find(".cancel").hide();
            self.$header.find(".p").hide();
            self.$header.find(".confirm").hide();
            self.$header.find(".left").show();
            self.$header.find("p").show();
            self.$bool = false;
            self.$selectCati.text("请选择");
            self.$selectCati.removeData('data');
            self.$itemsConfirm.hide();
        },
        initCust: function(paras){
            var $user = this.$custInfo;

            var _data = {
                id : paras.customerId,
                name : paras.customerName
            };
            $user.data("data", _data);

            $user.find(".header").html(amGloble.photoManager.createImage("customer", {
                parentShopId: amGloble.metadata.userInfo.parentShopId
            }, _data.id + ".jpg", "s"));

            //TODO 电话隐藏处理逻辑
            if (amGloble.metadata.permissions.allowphone) {
                $user.find("div.tel").html(paras.mobile || "").show();
            } else {
                $user.find("div.tel").hide();
            }

            if (paras.gender == "M") {
                $user.find(".header").addClass("male");
            } else {
                $user.find(".header").removeClass("male");
            }
            $user.find("div.name").html(_data.name + (paras.gender == "M" ? "先生" : "女士"));
            
            this.$toptip.hide();
            $user.show();
        },
        selectCust: function(user) {
            var $user = this.$custInfo;

            $user.data("data", user);

            $user.find(".header").html(amGloble.photoManager.createImage("customer", {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                updateTs: user.lastconsumetime
            }, user.id + ".jpg", "s"));


            //TODO 电话隐藏处理逻辑
            // amGloble.metadata.permissions.allowphone = 1
            if (amGloble.metadata.permissions.allowphone) {
                $user.find("div.tel").html(user.mobile || "").show();
            } else {
                $user.find("div.tel").hide();
            }

            if (user.sex == "M") {
                $user.find(".header").addClass("male");
            } else {
                $user.find(".header").removeClass("male");
            }
            $user.find("div.name").html(user.name + (user.sex == "M" ? "先生" : "女士"));
            this.$toptip.hide();
            console.log(self.$itemsArray.length ,user,"选择顾客")
            if(self.$itemsArray.length || self.$selectCati.data("data")){
                self.$page_button.css("background-color","#2dbd84")
            }else{
                self.$page_button.css("background-color","#d1d1d1")
            }
            $user.show();
        },
        renderSearch: function(data) {
            var self = this;
            var $ul = this.$ul.empty();
            if (data && data.length) {
                $.each(data, function(i, item) {
                    $ul.append(amGloble.page.customerGrouping.createCustItem(item));
                });
            } else {
                $ul.append("<div class='noresult'>没有搜索结果<div>");
            }

            this.sv_searchResult.refresh();
            this.sv_searchResult.scrollTo("top");

        },
        closeSearch: function() {
            this.$searchResult.hide();
            this.$searchBtn.removeClass("gray");
            this.$key.val("");
        },
        save: function() {
            var self = this;
            var time = this.$time.data("data");
            var cust = this.$custInfo.data("data");
            var cati = this.$selectCati.data("data");
            var number = this.$selectNumber.data("data").value;
            // if(number == "多人"){
            //     number = {name:"4"}
            // }
            var comment = this.$comment.val();

            if (!cust) {
                amGloble.msg("请选择客户");
                return;
            }
            if (this.$selectCati.text() == "请选择") {
                amGloble.msg("请选择项目");
                return;
            }
            var items = {};
            var times = 1;
            for (var i = 0; i < self.$itemsArray.length; i++) {
                var item = self.$itemsArray[i];

                items[item.id] = item;
                if (times < item.time) {
                    times = item.time;
                }
                
            }

            var itemProp = { // 高级预约模式下，保存预约项目明细
                strategy:amGloble.metadata.configs.strategy, // 当前配置的预约时间模式 0半点 1整点
                times: times,// 最大占用时间单位，根据此项去判断生成几条预约占用记录
            //     packages: { // 预约的套餐项目
            //         'packId': {} // key = package.id
            //     },
                items:items
            }

            var values = {
                "shopId": amGloble.metadata.userInfo.shopId,
                "type": 0,
                "reservationTime": time.getTime(),
                "barberId": amGloble.metadata.userInfo.userId,
                "barberName": amGloble.metadata.userInfo.userName,
                "channel": 3, //0收银 1美一客web 2美一客app 3生意宝
                "custId": cust.id,
                "custName": cust.name,
                "categoryId": cati.id,
                "categoryName": cati.name,
                "number": number,
                "reservationType": 1, //反预约
                "comment": comment,
                itemProp:self.$itemsArray.length?itemProp:null
            };

            console.log(values);

            amGloble.loading.show("正在提交，请稍候...");
            amGloble.api.reservationAdd.exec(values, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    amGloble.msg("预约已经登记！");
                    $.am.page.back("slidedown");
                    self.$content.empty();
                    self.$bool =false;
                    amGloble.page.reservation.timeBar.gotoDate(parseDate(values.reservationTime), true, true);
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        }
    });

})();
