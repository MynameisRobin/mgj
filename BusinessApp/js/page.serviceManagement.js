(function() {

    var self = amGloble.page.serviceManagement = new $.am.Page({
        id: "page-serviceManagement",
        init: function() {
            var self = this;
            
            //列表页相关逻辑

            this.$ul = this.$.find(".listBox");
            this.$itemsul = this.$ul.find(":first").find(".listContent").find("ul");
            this.$itemsli = this.$itemsul.find(":first").remove();
            this.$li = this.$ul.find(":first").remove();
            this.$itemsul.empty();
            this.$ul.empty();

            $(".footDate").on("vclick", "span", function() {
                var $this = $(this);
                var idx = $this.index();
                $this.addClass("selected").siblings().removeClass("selected");
                self.period = self.GetDateStr(-1 * idx);
                self.refreshPage();
            });
            this.$.on("vclick", ".listHeader", function() {
                var $this = $(this);
                if ($this.find(".ico").hasClass("selected")) {
                    $this.find(".ico").removeClass("selected");
                    $this.siblings(".listContent").slideUp(300, function() {
                        self.refresh();
                    });
                } else {
                    $this.find(".ico").addClass("selected");
                    $this.siblings(".listContent").slideDown(300, function() {
                        self.refresh();
                    });
                }
            }).on("vclick", ".imgBox", function() {
                var $li = $(this).parent().parent();
                var item = $li.data("item");
                var _index = self.$.find('.tab-ul li.on').index();
                var custId;
                console.log(item);
                if(_index == 0){
                    if(!item.custName){
                        amGloble.msg("散客没有详细信息");
                        return false;
                    }
                    custId=item.custId;
                }else{
                    if(!item.memName){
                        amGloble.msg("散客没有详细信息");
                        return false;
                    }
                    custId=item.memId;
                }
                
                $.am.changePage(amGloble.page.customerDetail, "slideleft", {
                    custId: custId
                });
                return false;
            });
            //error

            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                self.scrollview.touchTop(3);
            });

            this.$empty = this.$.find("div.am-page-empty");
            this.$empty.find(".button-common").vclick(function() {
                self.scrollview.touchTop(3);
            });
            this.period = this.GetDateStr(0);

            //已完成,进行中切换
            this.$.find('.tab-ul li').vclick(function(){
                var _index = $(this).index();
                $(this).addClass('on').siblings('li').removeClass('on');
                self.$ul.empty();
                if(_index == 0){    //已完成
                    $(".footDate").show();
                    self.refreshPage();
                }else if(_index == 1){  //进行中
                    $(".footDate").hide();
                    self.getInstoreServiceList();
                }
            });
        },
        GetDateStr: function(AddDayCount) {
            var dd = new Date();
            dd.setDate(dd.getDate() + AddDayCount);
            var y = dd.getFullYear();
            var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1).toString() : dd.getMonth() + 1;
            var d = dd.getDate() < 10 ? "0" + (dd.getDate()).toString() : dd.getDate();
            return y + "-" + m + "-" + d;
        },
        beforeShow: function(paras) {
            this.paras = paras;
            if (paras == "back") {
                return;
            }

            this.$.find('.tab-ul li').eq(0).addClass('on').siblings('li').removeClass('on');
            $(".footDate").show();
            var _num = $('#page-dashboard .moduleList td[page="serviceManagement"] > .num').text();
            if(_num > 0){
                this.$.find('.tab-ul li').eq(1).find('span').show().text(_num);
            }else{
                this.$.find('.tab-ul li').eq(1).find('span').hide();
            }

            amGloble.storeSelect.onShopChange = function(shops) {
                self.refreshPage();
            };
            // this.render();
        },
        afterShow: function(paras) {

            if (paras == "forceRefresh" || new Date().getTime() - this.refreshTime > 300000) {
                this.scrollview.touchTop(3);
            }
        },
        beforeHide: function() {},

        //列表加载逻辑
        refreshTime: 0,

        refreshPage: function() {
            this.getOnePage(true);
        },
        getOnePage: function(clear) {

            var self = this;
            //刷新时的处理
            if (clear) {

                //当前页最后一条id
                self.pageIndex = 0;
                self.refreshTime = new Date().getTime();
                self.$ul.empty();
                //self.scrollview.scrollTo("top");

            }

            opt = {
                pageSize: this.pageSize,
                pageIndex: this.pageIndex,
                period: self.period
            };



            this.getData(opt, function(data) {

                if (data.code == 0) {

                    var list = data.content || [];

                    self.pageIndex++;
                    if (self.pageSize > list.length) {
                        self.scrollview.pauseTouchBottom = true;
                    } else {
                        self.scrollview.pauseTouchBottom = false;
                    }

                    self.appendList(list);

                } else {

                }

                self.closeTopLoading();
                self.closeBottomLoading();
            });
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            var _index = this.$.find('.tab-ul li.on').index();
            if(_index == 0){    //已完成
                this.refreshPage();
            }else if(_index == 1){  //进行中
                this.$ul.empty();
                this.getInstoreServiceList();
            }
        },
        touchBottom: function() {
            var _index = this.$.find('.tab-ul li.on').index();
            if(_index == 0){    //已完成
                this.getOnePage();
            }
        },

        //私有逻辑
        pageSize: 10,
        pageIndex: 0,
        clearDom: function() {
            this.$ul.empty();
        },
        appendList: function(list) {
            var self = this;
            var $ul = this.$ul;
            var commentResult = {
                "0": {
                    name: "好评",
                    class: "p1"
                },
                "1": {
                    name: "中评",
                    class: "p2"
                },
                "2": {
                    name: "差评",
                    class: "p3"
                }
            }
            if (list && list.length) {
                $.each(list, function(i, item) {
                    var $li = self.$li.clone(true, true);

                    var username, $img;
                    if (item.custName) {
                        if (item.gender == "M") {
                            username = item.custName + "-男";
                        } else {
                            username = item.custName + "-女";
                        }
                    } else {
                        if (item.gender == "M") {
                            username = "散客-男";
                        } else {
                            username = "散客-女";
                        }

                    }
                    if (item.gender == "M") {
                        $img = "css/img/bg-man.gif";
                    } else {
                        $img = "css/img/bg-woman.gif";
                    }
                    $li.find(".listHeader .imgBox").css({
                        'background': 'url(' + $img + ') no-repeat center center',
                        'background-size': 'contain'
                    }).html(amGloble.photoManager.createImage("customer", {
                        parentShopId: amGloble.metadata.userInfo.parentShopId
                    }, item.custId + ".jpg", "s"));


                    $li.find(".listHeader .name").text(username);
                    //$li.find(".listHeader .level").text(item.levelName);

                    if (item.commentResult != null) {
                        if(item.commentResult == 0){
                            if(item.commentTime){
                                var _pj = commentResult[item.commentResult].name;
                            }else{
                                var _pj = '未点评';
                            }
                        }else{
                            var _pj = commentResult[item.commentResult].name;
                        }
                        $li.find(".listFoot .right .key").text(_pj);
                    }

                    $li.find(".listFoot .time").text(item.serviceTime);
                    // $li.find(".listFoot .time2").text(self.getDataTime(item.serviceTime,"hour"));


                    $li.find(".listHeader .right").text("￥" + item.totalExpense);

                    if (item.items && item.items.length) {
                        var $itemsul = $li.find(".listContent ul");
                        $.each(item.items, function(j, itemj) {

                            var $itemsli = self.$itemsli.clone(true, true);

                            $itemsli.find(".name").text(itemj.itemName);
                            // $itemsli.find(".assign").text(itemj.specified ? "指定" : "非指定");
                            if (
                                (item.consumeType == 4 && itemj.consumeType == 1) || //套餐项目消费
                                (item.consumeType == 6 && itemj.consumeType == 4) //年卡项目消费
                            ) {
                                $itemsli.find(".price").html('1 次');
                            } else {
                                $itemsli.find(".price").text(itemj.price + ' 元');
                            }


                            $itemsul.append($itemsli);
                        });
                    }

                    $li.data("item", item);
                    $ul.append($li);
                });
            }
            if ($ul.is(":empty")) {
                self.setStatus("empty");
            } else {
                self.setStatus("normal");
            }


            self.refresh();
        },
        getDataTime: function(date, back) {
            var date = new Date(date);
            if (back == "month") {
                var month = date.getMonth() + 1;
                var day = date.getDate();
                return month + "月" + day + "日";
            }
            if (back == "hour") {
                var hour = date.getHours();
                var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                return hour + ":" + min;
            }
        },
        getData: function(opts, scb) {
            var self = this;

            //获取当前门店，如果是全企业则自动选中第一个门店
            var shop = amGloble.storeSelect.getCurrentShops();
            if (!shop) {
                amGloble.storeSelect.selectShop(0, true);
                shop = amGloble.storeSelect.getCurrentShops();
            }
            opt.shopId = amGloble.storeSelect.getCurrentShops().shopId;
            //员工则需要userid
            if (amGloble.metadata.userInfo.userType) {
                opt.userId = amGloble.metadata.userInfo.userId;
            }


            this.setStatus("normal");
            // amGloble.loading.show("正在加载,请稍候...");
            amGloble.api.serviceManagement.exec($.extend(opts, opt), function(ret) {
                // amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    scb && scb(ret);
                } else {
                    if (self.$ul.children(":not(.empty)").length) {
                        amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                    } else {
                        self.setStatus("error");
                    }
                    scb && scb({
                        code: -1,
                        msg: ""
                    });
                }
            });
        },
        getInstoreServiceList: function(){
            var self = this;

            var opt = {
                fromHistory : 0,
                status : 0,
                pageNumber : 0,
                pageSize : 99999,
                simpleData : 0
            };
            var shop = amGloble.storeSelect.getCurrentShops();
            if (!shop) {
                amGloble.storeSelect.selectShop(0, true);
                shop = amGloble.storeSelect.getCurrentShops();
            }
            opt.shopId = amGloble.storeSelect.getCurrentShops().shopId;
            if( amGloble.metadata.userInfo.userType == 1 ){ //员工
                opt.employeeId = amGloble.metadata.userInfo.userId;
            }

            amGloble.api.getInstoreServiceList.exec(opt, function(ret) {
                if (ret.code == 0) {
                    self.setStatus("normal");
                    if(ret.content.length){
                        self.renderInstoreServiceList(ret.content);
                    }else{
                        self.refresh();
                    }
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }

                self.closeTopLoading();
                self.closeBottomLoading();
            });
        },
        renderInstoreServiceList : function(data){
            for(var i=0; i<data.length; i++){
                var _instorecomment = data[i].instorecomment ? data[i].instorecomment : '';
                var _Data = JSON.parse(data[i].data);

                var _html = $('<div class="serviceList">' +
                                '<div class="listHeader am-clickable">' +
                                    '<div class="left imgBox am-clickable"></div>' +
                                    '<div class="left textBox textingBox">' +
                                        '<span class="name">'+ (data[i].memName ? data[i].memName : '散客') +'</span>' +
                                        '<span class="starttime">'+ this.translateTime( data[i].createDateTime ) +' 开始</span>' +
                                    '</div>' +
                                    '<div class="ico"></div>' +
                                '</div>' +
                                '<div class="listContent listContenting">' +
                                    '<ul>'+ this.getServiceItems( JSON.parse(data[i].data) ) +'</ul>' +
                                '</div>' +
                                '<div class="listBottom">' +
                                    '<div class="lb_top">' +
                                        '<p>'+ _instorecomment +'</p>' +
                                    '</div>' +
                                    '<div class="lb_bottom clear">' +
                                        '<div class="hasbeento">已进行<span></span></div>' +
                                        '<div class="washhairlength">洗发时长<span></span></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>').data("item",data[i]);

                if(_Data.memGender){
                    if(_Data.memGender == 'M'){ //男
                        var imgurl = "css/img/bg-man.gif";
                    }else if(_Data.memGender == 'F'){   //女
                        var imgurl = "css/img/bg-woman.gif";
                    }
                }else{  //没有传memGender,默认是女客
                    var imgurl = "css/img/bg-woman.gif";
                }
                _html.find('.imgBox').css({
                    'background': 'url(' + imgurl + ') no-repeat center center',
                    'background-size': 'contain'
                });

                if(data[i].memId == -1){    //散客

                }else{
                    var $img = amGloble.photoManager.createImage("customer", {
                        parentShopId: amGloble.metadata.userInfo.parentShopId
                    }, data[i].memId + ".jpg", "s");
                    _html.find('.imgBox').html( $img );
                }
                this.washHairLength( _html.find('.washhairlength span'),data[i].shampooStartTime,data[i].shampooFinishTime );
                new runTime( _html.find('.hasbeento span'),data[i].createDateTime );
                this.$ul.append( _html );
            }
            if(amGloble.metadata.configs.rcordRinseTime=="true"){
                this.$.find(".lb_bottom .washhairlength").hide();
            }else{
                this.$.find(".lb_bottom .washhairlength").show();
            }

            self.refresh();
        },
        getServiceItems : function(data){
            if(!data.serviceItems){
                return "";
            }
            var serviceItems = data.serviceItems;
            var _lihtml = '';
            for(var i=0; i<serviceItems.length; i++){
                var servers = serviceItems[i].servers;
                if(servers && servers.length){
                    if(servers[0]){
                        var _name = servers[0].name;
                        var _specified = servers[0].specified == 1 ? '指定' : '非指定'; //0非指定 1指定
                    }else{
                        var _name = '-';
                        var _specified = '-';
                    }
                }else{
                    var _name = '-';
                    var _specified = '-';
                }
                _lihtml += '<li class="clear">' +
                                '<span class="uname">'+ serviceItems[i].name +'</span>' +
                                '<span class="money">￥'+ serviceItems[i].price +'</span>' +
                                '<span class="level">'+ _name +'</span>' +
                                '<span class="appoint">'+ _specified +'</span>' +
                            '</li>';
            }
            return _lihtml;
        },
        washHairLength : function(obj,shampooStartTime,shampooFinishTime){
            if(!shampooStartTime){
                obj.html('未开始');
                return;
            }
            if(shampooFinishTime){
                obj.html('已结束');
                return;
            }
            if(shampooStartTime && !shampooFinishTime){ //进行中
                new runTime( obj,shampooStartTime );
                return;
            }
        },
        translateTime : function(time){
            var _d = new Date(time);
            var _h = this.toZero( _d.getHours() );
            var _m = this.toZero( _d.getMinutes() );
            var _s = this.toZero( _d.getSeconds() );
            return _h + ':' + _m + ':' + _s;
        },
        toZero : function(num){
            if(num<10){
                return '0' + num;
            }
            else{
                return '' + num;
            }
        }
    });

    function runTime(obj,time){
        this.obj = obj;
        this.time = time;

        var nowTime = new Date().getTime();
        if(nowTime<=this.time){
            this.time=nowTime;
        }

        this.changeTime();
        this.render();
    }
    runTime.prototype = {
        render : function(){
            var _t = this.translate(this.time);
            this.obj.html(_t);
        },
        translate : function(time){
            var iHour = 0;
            var iMin = 0;
            var iSec = 0;
            var nowTime = new Date().getTime();
            var iRemain = (nowTime- this.time)/1000;
            iHour = parseInt(iRemain/3600);
            iRemain%=3600;
            iMin = parseInt(iRemain/60);
            iRemain%=60;
            iSec = parseInt(iRemain);
            return this.toZero(iHour) + ':' + this.toZero(iMin) + ':' + this.toZero(iSec);
        },
        toZero : function(num){
            if(num<10){
                return '0' + num;
            }
            else{
                return '' + num;
            }
        },
        changeTime : function(){
            var self = this;
            setInterval(function(){
                self.render();
            },1000);
        }
    }

})();
