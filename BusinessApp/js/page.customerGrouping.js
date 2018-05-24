amGloble.page.customerGrouping = new $.am.Page({
    id: "page-customerGrouping",
    init: function () {
        var self = this;
        // this.$header.children(".right.search").vclick(function() {
        //     $.am.changePage(amGloble.page.customerSearch, "slideleft");
        // });
        this.$header.children(".right.ellipsis").vclick(function () {
            var display = self.$.find(".menu-list").css('display');
            if (display == 'none') {
                self.$.find(".menu-list").slideDown(200);
                self.$.find(".menu-list-mask").show();
            }
        });
        this.$header.children(".left.backbutton").vclick(function () {
            if (self.eid) {
                var type = self.$tab.find(".selected").data("type")
                $.am.changePage(amGloble.page.customerByCraftsman, "",{type: type,aback:true});
            } else if (self.eid && self.aback) {
                self.eid = null;
                self.emp = null;
                self.$header.find(".title>.c-storeSelectBtn").show();
                self.$header.find(".title>.c-empsSelectBtn").hide();
                self.refreshPage();
            } else {
                $.am.page.back();
            }
        });
        this.$.find(".menu-list-mask").vclick(function () {
            self.$.find(".menu-list").slideUp(200);
            self.$.find(".menu-list-mask").hide();
        })
        this.$.find(".menu-list li").vclick(function () {
            var type = self.$tab.find(".selected").data("type")
            var $sort = self.$sortbar.find(".selected");
            var sort = $sort.data("sort");
            var isReverse = $sort.find("span.sort").hasClass("up") ? 0 : 1;
            if ($(this).data("index") == 0) {
                $.am.changePage(amGloble.page.customerSearch, "slideleft");
            } else if ($(this).data("index") == 1) {
                $.am.changePage(amGloble.page.addCustomer, "slideleft");
            } else if ($(this).data("index") == 2) {
                $.am.changePage(amGloble.page.assignCustomer, "", { emp: self.emp, type: type, sort: sort, isReverse: isReverse, cData: self.cData, pageIndex: self.pageIndex, totalData: self.totalData });
            } else if ($(this).data("index") == 3) {
                $.am.changePage(amGloble.page.customerByCraftsman, "",{type: type});
            }
            self.$.find(".menu-list").slideUp(200);
            self.$.find(".menu-list-mask").hide();
        })
        //类型bar
        var $tabc = this.$.find(".page-customerGrouping-type");
        this.$tab = $tabc.find("ul").on("vclick", "li", function () {
            if (self.loading) {
                return;
            }
            var type = $(this).attr('data-type');
            if(type==-1){
                self.getFilterTags();
            }else {
                self.$selectTag.hide().find('.container').hide();
                $(this).addClass("selected").siblings().removeClass("selected");
                self.refreshPage();
            }
        });


        //客户标签
        this.$tagTip = this.$.find('.page-customerGrouping-tagTip').on('vclick','.closeTagTip',function(){
            self.$tab.find('li[data-type=0]').trigger('vclick');
        });
        this.$selectTag = this.$.find('.selectTag');
        this.$tagUl = this.$selectTag.find('ul').on('vclick','li',function(){
            if($(this).hasClass('active')){
                $(this).removeClass('active');
            }else {
                $(this).addClass('active');
            }
        });
        this.$resetTags = this.$selectTag.find('.reset').vclick(function(){
            self.$tagUl.find('li').removeClass('active');
        });
        this.$getTags = this.$selectTag.find('.sure').vclick(function(){
            var lis = self.$tagUl.find('.active');
            if(lis.length){
                var tagArr = [];
                var TAG = [];
                for(var i=0;i<lis.length;i++){
                    tagArr.push($(lis[i]).data('data').TAGID);
                    TAG.push($(lis[i]).data('data'));
                }
                self.TAG = TAG;
                self.tagString = tagArr.join(',');
                self.$tab.find('li[data-type=-1]').addClass('selected').siblings().removeClass('selected');
                self.refreshPage();
            }else {
                self.$tab.find('li[data-type=-1]').removeClass('selected');
            }
            self.$selectTag.hide().find('.container').hide();
        });
        this.$selectTag.find('.top,.bottom').vclick(function(){
            if(self.$tab.find('.selected').length>1){
                self.$tab.find('li[data-type=-1]').removeClass('selected');
            }
            self.$selectTag.hide().find('.container').hide();
        });
        this.$selectTag.find('.container').vclick(function(e){
            e.stopPropagation();
        });
        this.sv_tag = new $.am.ScrollView({
            $wrap: self.$.find('.selectTag .container'),
            $inner: self.$.find('.selectTag .container .wrapper'),
            direction: [0, 1]
        });

        this.sv_tab = new $.am.ScrollView({
            $wrap: $tabc,
            $inner: this.$tab,
            direction: [1, 0]
        });

        this.$emps_sc = new $.am.ScrollView({
            $wrap: this.$.find(".c-empsSelect-inner"),
            $inner: this.$.find(".c-empsSelect-inner .scrollInner"),
            direction: [0, 1]
        });


        //排序
        this.$sortbar = this.$.find(".page-customerGrouping-sort ul").on("vclick", "li", function () {
            if (self.loading) {
                return;
            }
            var $this = $(this);
            if ($this.hasClass("selected")) {
                $this.find("span.sort").toggleClass("up");
            } else {
                $this.addClass("selected").siblings().removeClass("selected");
            }
            self.refreshPage();
        });

        //滚动加载

        this.$ul = this.$.find(".c-custList").on("vclick", "li", function () {
            var $this = $(this);
            var item = $this.data("item");
            $.am.changePage(amGloble.page.customerDetail, "slideleft", {
                custId: item.id,
                shopid: item.shopid,
                $li: $this
            });
        });
        this.$li = this.$ul.find(":first").remove();
        this.$header.on("vclick", ".title>.c-empsSelectBtn", function () {
            if (!self.$.find("#c-empsSelect").is(":hidden")) {
                self.$.find("#c-empsSelect").slideUp(200)
                $(this).removeClass("up");
            } else {
                self.$.find("#c-empsSelect").slideDown(200)
                $(this).addClass("up");
                self.$emps_sc.refresh();
            }
        })
        this.$.find("#c-empsSelect .empList").on("vclick", "ul>li", function () {
            var emp = $(this).data("emp");
            emp.id = emp.empid;
            self.eid = emp.empid;
            self.emp = emp;
            self.$header.find(".title>.c-empsSelectBtn>.text").text(emp.empname ? emp.empname : emp.pname ? emp.pname : emp.name)
            self.$header.find(".title>.c-empsSelectBtn>.emp_tenantLogo").html(amGloble.photoManager.createImage("artisan", {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
            }, emp.empid + ".jpg", "s"));
            self.refreshPage();
            self.$header.find(".title>.c-empsSelectBtn").removeClass("up");
        });
        //重试
        this.$.find(".am-page-error .button-common").vclick(function () {
            self.refreshPage();
        });
    },
    beforeShow: function (paras) {
        var self = this;
        amGloble.storeSelect.onShopChange = function (shops) {
            self.refreshPage();
        };
        this.aback = paras && paras.aback ? paras.aback : false;
        if (paras == "back"&&(paras&&paras.dback==1)) {
            return false;
        }
        if (paras && paras.emp) {
            var emp = paras.emp;
            this.emp = emp;
            this.eid = emp.id;
            this.$header.find(".title>.c-storeSelectBtn").hide();
            this.$header.find(".title>.c-empsSelectBtn").show();
            this.$header.find(".title>.c-empsSelectBtn>.text").text(emp.empname ? emp.empname : emp.pname ? emp.pname : emp.name)
            this.$header.find(".title>.c-empsSelectBtn>.emp_tenantLogo").html(amGloble.photoManager.createImage("artisan", {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                updateTs: paras.emp.lastphotoupdatetime
            }, paras.emp.id + ".jpg", "s"));
            this.getEmsList();
        } else {
            this.emp = null;
            this.eid = null;
            this.$header.find(".title>.c-storeSelectBtn").show();
            this.$header.find(".title>.c-empsSelectBtn").hide();
        }
        this.setStatus("loading");
        this.initPageParas(paras);
    },
    afterShow: function (paras) {
        this.sv_tab.refresh();
        if (paras == "back") {
            return false;
        }
        var userinfo = amGloble.metadata.userInfo;
        this.$.find(".menu-list ul li").show()
        if (userinfo.shopType == 0) {
            // this.$header.children(".right.add").hide();
            // this.$header.children(".right.search").css("right","0px");
            // this.$.find(".menu-list ul li>i.add").parent().remove();
            this.$.find(".menu-list ul li>i.add").parent().hide();
        }
        if (userinfo.newRole != 3 && userinfo.newRole != 2) {
            this.$.find(".menu-list ul li>i.assign").parent().hide();
            this.$.find(".menu-list ul li>i.craftsmans").parent().hide();
        }
        if (!amGloble.metadata.configs.handEmployees || amGloble.metadata.configs.handEmployees == 'false') {
            this.$.find(".menu-list ul li>i.assign").parent().hide();
        }

    },
    initPageParas: function (paras) {
        if (!paras) {
            paras = {}
        }
        if (typeof paras.type != 'undefined') {
            // $(this.$tab.find("li")[paras.type]).addClass("selected").siblings().removeClass("selected");
            this.$tab.find('li[data-type='+paras.type+']').addClass("selected").siblings().removeClass("selected");
        }
        if (typeof paras.sort != 'undefined') {
            $(this.$sortbar.find("li")[paras.sort]).addClass("selected").siblings().removeClass("selected");
        }
        if (typeof paras.isReverse != 'undefined') {
            if (paras.isReverse == 0) {
                $(this.$sortbar.find("li")[paras.sort]).find("span.sort").toggleClass("up");
            }
        }
        this.resetList();
        if (typeof paras.pageIndex != 'undefined') {
            this.pageIndex = paras.pageIndex;
        }
        if (paras.cData) {
            this.appendList(paras.cData);
            this.setStatus("normal")
            this.cData = paras.cData;
        } else {
            this.getOnePage();
        }
        if (paras.totalData) {
            var data = paras.totalData;
            this.totalData = data;
            var $tabitems = this.$tab.find("li");
            $tabitems.eq(0).find(".num").html(data.totalCount || 0);
            $tabitems.eq(2).find(".num").html(data.highQualityCount || 0);
            $tabitems.eq(3).find(".num").html(data.lostCount || 0);
            $tabitems.eq(4).find(".num").html(data.staticCount || 0);
            $tabitems.eq(5).find(".num").html(data.favorCount || 0);
        } else {
            this.getSummaryData();
        }
    },
    refreshPage: function () {
        this.resetList();
        this.getSummaryData();
        this.getOnePage();
        if (this.eid) {
            this.getEmsList();
        }
    },
    //重新加载列表
    resetList: function () {
        this.pageLength = 10;
        //每页条数
        this.pageIndex = 0;
        //当前页数 -1表示未加载
        this.pageCount = -1;
        //列表总页数 -1表示未知
        this.$ul.empty();
        this.scrollview.scrollTo("top");
        // this.setStatus("normal");
        this.$emps_sc.refresh();
        var type = this.$tab.find(".selected").data("type");
        var config = amGloble.metadata.configs;
        var text = "";
        this.cData = null;
        this.$.find("#c-empsSelect").hide();
        switch (type) {
            case 0:
                this.$sortbar.removeClass("disableSort");
                break;
            case 1:
                text = '<span class="type1"> </span><span>门店最有价值的<span class="pink">100</span>位顾客</span>';
                this.$sortbar.addClass("disableSort");
                break;
            case 2:
                text = '<span class="type2"> </span><span>已经' + (config.loss || 60) + '天没有来店消费的顾客</span>';
                this.$sortbar.removeClass("disableSort");
                break;
            case 3:
                text = '<span class="type3"> </span><span>超过' + (config.stillCustomer || 120) + '天没有来店消费的顾客</span>';
                this.$sortbar.removeClass("disableSort");
                break;
            case 4:
                text = '<span class="type4"> </span><span>被星标的顾客</span>';
                this.$sortbar.removeClass("disableSort");
                break;
        }
        if (text) {
            this.$.find(".topText").show().html(text);
        } else {
            this.$.find(".topText").hide();
        }
        if(this.tagString && this.$tab.find('li[data-type=-1]').hasClass('selected')){
            this.showTagTip();
        }else {
            this.hideTagTip();
        }

    },
    showTagTip:function(){
        this.$tagTip.find('.tagTip').empty();
        for(var i=0;i<this.TAG.length;i++){
            this.$tagTip.find('.tagTip').append('<span>'+this.TAG[i].TAGNAME+'</span>');
        }
        this.$tagTip.show();

        var cw = this.$tagTip.find('.tagTip').width();
        var lis = this.$tagTip.find('.tagTip span');
        var wArr = [];
        for(var i=0;i<lis.length;i++){
            wArr.push($(lis[i]).outerWidth(true));
        }
        var w = 0;
        for(var i=0;i<wArr.length;i++){
            w += wArr[i];
            if(w>cw){
                var w2 = 0;
                for(var j=0;j<i;j++){
                    w2 += wArr[j];
                }
                // if(cw-w2-16>=12){
                    this.$tagTip.find('.tagTip span').eq(j).css('width',cw-w2-16+'px');
                // }
                return false;
            }
        }
    },
    hideTagTip:function(){
        this.$tagTip.hide();
    },
    getSummaryData: function () {
        var self = this;
        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
                var $tabitems = self.$tab.find("li.need");
                $tabitems.find(".num").html(0);
                return false;
            }
            shop = [shop];
        } else {

            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };

        amGloble.api.customerDashboard.exec({
            "type": this.$tab.find(".selected").data("type"),
            "empid": self.eid ? self.eid : user.userId,
            "shopIds": amGloble.getKeyArr(shop, "shopId", true, true).join(","),
            "userType": self.eid ? 1 : user.userType, // 0管理员  1员工
        }, function (ret) {
            if (ret.code == 0) {
                var data = ret.content;
                self.totalData = data;
                var $tabitems = self.$tab.find("li");
                $tabitems.eq(0).find(".num").html(data.totalCount || 0);
                $tabitems.eq(2).find(".num").html(data.highQualityCount || 0);
                $tabitems.eq(3).find(".num").html(data.lostCount || 0);
                $tabitems.eq(4).find(".num").html(data.staticCount || 0);
                $tabitems.eq(5).find(".num").html(data.favorCount || 0);
            } else {
                amGloble.msg("数据加载失败,点击重试!");
            }

        });
    },
    getEmsList: function () {
        var self = this;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        amGloble.api.employeeGetEmpByShopid.exec({
            "shopid": shop[0].shopId
        }, function (ret) {
            if (ret.code == 0) {
                self.emps = ret.content;
                var empsGroupByPinyin = {};
                for (var i = 0; i < self.emps.length; i++) {
                    var item = self.emps[i];
                    // item.shopFullName = item.shopName + (item.osName || "");
                    item.pinyin = codefans_net_CC2PY(item.empname ? item.empname : "帅帅的设计师");
                    var py = item.pinyin.substr(0, 1).toUpperCase() || "#";
                    item.pname = item.empname ? item.empname : "帅帅的设计师";
                    if (empsGroupByPinyin[py]) {
                        empsGroupByPinyin[py].push(item);
                    } else {
                        empsGroupByPinyin[py] = [item];
                    }
                }
                self.$.find(".c-empsSelect-inner .scrollInner .empList").empty();
                for (var key in empsGroupByPinyin) {
                    var emps = empsGroupByPinyin[key];
                    // var shops = item.shops;
                    var $index = $('<div class="index">' + key + '</div>');
                    var $ul = $('<ul class="subList"></ul>');
                    for (var j = 0; j < emps.length; j++) {
                        var emp = emps[j];
                        var $li = $('<li class="am-clickable">' + emp.pname + '</li>');
                        if (emp.empid == self.eid) {
                            $li.addClass("selected");
                        }
                        $li.data("emp", emp);
                        $ul.append($li);
                    }
                    self.$.find(".c-empsSelect-inner .scrollInner .empList").append($index).append($ul);
                }

            } else {
                amGloble.msg("数据加载失败,点击重试!");
            }
        });
    },
    getOnePage: function (animation) {
        var self = this;

        var $sort = this.$sortbar.find(".selected");
        var sort = $sort.data("sort");
        var isReverse = $sort.find("span.sort").hasClass("up") ? 0 : 1;


        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        if(!shop){
            //如果当前没有选择问题，选择第一个
            amGloble.storeSelect.selectShop(0, true);
            shop = amGloble.storeSelect.getCurrentShops();
        }
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
                self.setStatus("normal");
                if (shop.mgjversion == 1) {
                    self.appendList("此门店是盛传版，不可使用客户管理");
                } else if (shop.mgjversion == 2) {
                    self.appendList("此门店是风尚版，不可使用客户管理");
                } else if (shop.mgjversion == 4) {
                    self.appendList("此门店是青春版，不可使用客户管理");
                }
                return false;
            }
            shop = [shop];
        } else {

            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        if (this.$ul.is(":empty")) {
            this.setStatus("loading");
        }
        var opt = {
            "empid": self.eid ? self.eid : user.userId,
            "shopIds": amGloble.getKeyArr(shop, "shopId", true, true).join(","),
            "userType": self.eid ? 1 : user.userType, // 1 管理员 0 员工
            "pageNumber": this.pageIndex,
            "pageSize": this.pageLength,
            "orderByType": sort,
            "isReverse": isReverse
        }
        if(this.tagString && this.$tab.find('li[data-type=-1]').hasClass('selected')){
            opt.tagIds = this.tagString;
            opt.type = 0;
        }else {
            opt.type = this.$tab.find(".selected").data("type")
        }
        this.loading = true;
        amGloble.api.customerQuerCusts.exec(opt, function (ret) {
            self.loading = false;
            self.setStatus("normal");
            if (ret.code == 0) {
                console.log(ret);
                console.log("-------------------------------------------------------------------------------");
                var data = ret.content;

                self.pageIndex += 1;
                if (!ret.content || (ret.content && ret.content.length < self.pageLength)) {
                    self.scrollview.pauseTouchBottom = true;
                } else {
                    self.scrollview.pauseTouchBottom = false;
                }
                if (!self.cData) {
                    self.cData = data
                } else {
                    self.cData = self.cData.concat(data)
                }

                self.appendList(data);
                self.closeBottomLoading();
            } else {
                if (self.$ul.is(":empty")) {
                    self.setStatus("error");
                }
                amGloble.msg("数据加载失败,点击重试!");
            }

        });

    },
    birthDay:['今天','一天后','两天后','三天后','四天后','五天后','六天后'],
    createCustItem: function (item, sort) {
        var $li = this.$li.clone(true, true);
        $li.find(".header").html(amGloble.photoManager.createImage("customer", {
            parentShopId: amGloble.metadata.userInfo.parentShopId,
            updateTs: item.lastphotoupdatetime
        }, item.id + ".jpg", "s"));

        var type = this.$tab.find('.selected').data('type');

        if(type==-1){
            $li.find('.l5').show();
            $li.find(".phone").parent().hide();
        }else {
            $li.find('.l5').hide();
            if (!amGloble.metadata.permissions.allowphone) {
                $li.find(".phone").parent().hide();
            } else {
                $li.find(".phone").html(item.mobile).parent().show();
            }
        }
        
        // $li.find(".phone").parent().hide();

        $li.find(".name").html(item.name);
        $li.find(".ename").html(item.empname ? item.empname : '无~');

        if(type==5 && $.am.getActivePage().id=='page-customerGrouping'){
            $li.find('.l3').hide();
            $li.find('.l6').show();
            $li.find(".birth").html((item.birthType==0?'阴历':'阳历')+item.birthDay.substring(5,item.birthDay.length)+'('+this.birthDay[item.days]+')');
        }else {
            $li.find('.l3').show();
            $li.find('.l6').hide();
            $li.find(".store").html(amGloble.getStoresById(item.shopid).shopFullName);
        }
        
        if(item.tags && item.tags.length){
            for(var i=0;i<item.tags.length;i++){
                $li.find('.l5').append('<p>'+item.tags[i].tagName+'</p>');
            }
        }else {
            $li.find('.l5').html('未添加标签~');
        }

        $li.find(".custlevel").html(item.className || "--");

        if (item.sex == "M") {
            $li.find(".gender").addClass("male");
            $li.find(".header").addClass("male");
        }
        if (!item.isHighQuality) {
            $li.find(".type1").hide();
        }
        if (!item.isLost) {
            $li.find(".type2").hide();
        }
        if (!item.isStatic) {
            $li.find(".type3").hide();
        }
        if (!item.isFavor) {
            $li.find(".type4").hide();
        }

        $li.find(".showValue").html(item.req || 0);

        sort = sort == null ? 1 : sort;
        switch (sort) {
            case 0:
                $li.find(".showName").html("来店时间 ");
                $li.find(".showValue").html((item.lastconsumetime && item.lastconsumetime > 631152000000) ? amGloble.time2str(item.lastconsumetime / 1000) : "--");
                break;
            case 1:
                $li.find(".showName").html("客单价");
                $li.find(".showValue").html((item.req ? amGloble.cashierRound(item.req, 1) : 0) + " <span class='gray'>元<span>");
                break;
            case 2:
                //无来电用1000000表示
                $li.find(".showName").html("来店频率");
                $li.find(".showValue").html((item.consumeFreq != null && item.consumeFreq < 999999) ? Math.ceil(item.consumeFreq) + " <span class='gray'>天/次<span>" : "无");
                break;
            case 3:
                $li.find(".showName").html("消费总额");
                $li.find(".showValue").html(item.consumeTotal ? amGloble.cashierRound(item.consumeTotal, 1) : 0);
                break;
        }

        $li.data("item", item);
        return $li;
    },
    appendList: function (data) {
        var self = this;
        var $ul = this.$ul;

        if (typeof data == "string") {
            $ul.append("<p>" + data + "</p>");
        } else {
            var sort = this.$sortbar.find(".selected").data("sort");
            if (data && data.length) {
                $.each(data, function (i, item) {
                    $ul.append(amGloble.page.customerGrouping.createCustItem(item, sort));
                });
                var $list = $ul.find('li');
                for(var p=0;p<$list.length;p++){
                    var $tags = $($list[p]).find('.l5');
                    var cw = $tags.width();
                    var lis = $tags.find('p');
                    var wArr = [];
                    for(var m=0;m<lis.length;m++){
                        wArr.push($(lis[m]).outerWidth(true));
                    }
                    var w = 0;
                    for(var m=0;m<wArr.length;m++){
                        w += wArr[m];
                        if(w>cw){
                            var w2 = 0;
                            for(var n=0;n<m;n++){
                                w2 += wArr[n];
                            }
                            $tags.find('p').eq(n).css('width',cw-w2-11+'px');
                        }
                    }
                }
            }

            if ($ul.is(":empty")) {
                this.setStatus("empty");
            }
        }
        self.refresh();
    },
    touchBottom: function () {
        var _this = this;
        this.getOnePage();
    },
    amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
    renderTaggFilter:function(data){
        this.$tagUl.empty();
        for(var i=0;i<data.length;i++){
            var $li = $('<li class="am-clickable">'+data[i].TAGNAME+'('+data[i].CNT+')</li>').data('data',data[i]);
            this.$tagUl.append($li);
        }
        this.$tab.find('li[data-type=-1]').addClass('selected');
        this.$selectTag.show().find('.container').slideDown(200);
        this.sv_tag.refresh();
        this.sv_tag.scrollTo('top');
    },
    getFilterTags:function(){
        var self = this;
        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
                self.setStatus("normal");
                if (shop.mgjversion == 1) {
                    amGloble.msg("此门店是盛传版，不可使用客户管理");
                } else if (shop.mgjversion == 2) {
                    amGloble.msg("此门店是风尚版，不可使用客户管理");
                } else if (shop.mgjversion == 4) {
                    amGloble.msg("此门店是青春版，不可使用客户管理");
                }
                return false;
            }
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        amGloble.loading.show();
        amGloble.api.tagFilter.exec({
            "empId": self.eid ? self.eid : user.userId,
            "shopId": shop[0].shopId,
            "empType": self.eid ? 1 : user.userType, // 1 管理员 0 员工
        }, function (ret) {
            amGloble.loading.hide();
            if (ret && ret.code == 0) {
                console.log(ret);
                if(ret.content.length){
                    self.renderTaggFilter(ret.content);
                }else {
                    amGloble.msg('不存在客户标签，无法筛选');
                }
            }else {
                atMobile.nativeUIWidget.confirm({
                    caption: '网络异常',
                    description: '数据读取失败，是否立即重试？',
                    okCaption: '重试',
                    cancelCaption: '取消'
                }, function() {
                    self.getFilterTags();
                }, function() {
                    
                });
            }
        });
    },
    setStatus : function(status, text) {
        var $page = this.$.removeClass("am-status-loading am-status-error am-status-empty");
        switch(status) {
            case "loading":
                $page.addClass("am-status-loading");
                break;
            case "error":
                amGloble.loading.hide();
                $page.addClass("am-status-error");
                break;
            case "empty":
                amGloble.loading.hide();
                $page.addClass("am-status-empty");
                break;
            case "normal":
                amGloble.loading.hide();
            default:

        }

    },
});
