(function() {
    var self = amGloble.page.promotionbenefit = new $.am.Page({
        id: "page-promotionbenefit",
        init: function() {
            var self = this;
            this.$amHeader = this.$.find('.am-header');
            this.$text = this.$.find('.title .text');
            this.$amBodyInner = this.$.find('.am-body-inner');
            this.$extensionWrap = this.$.find('.extensionWrap');
            this.$menuListWrapInnerUl = this.$.find('.menuListWrapInner ul');
            this.$contentListWrapInnerUl = this.$.find('.contentListWrapInner ul');
            this.$footTab = this.$.find('.footTab');
            this.$extensionEmpty = this.$.find('.extension-empty');

            //推广左侧菜单
            this.menuListWrap = new $.am.ScrollView({
                $wrap: this.$.find(".menuListWrap"),
                $inner: this.$.find(".menuListWrapInner"),
                direction: [0, 1]
            });
            this.menuListWrap.refresh();
            //推广右侧列表
            this.contentListWrap = new $.am.ScrollView({
                $wrap: this.$.find(".contentListWrap"),
                $inner: this.$.find(".contentListWrapInner"),
                direction: [0, 1]
            });
            this.contentListWrap.refresh();
            //推广左侧菜单点击事件
            this.$menuListWrapInnerUl.on('vclick', 'li', function() {
                $(this).addClass('on').siblings('li').removeClass('on');
                var _subCategoryId = $(this).data('subcategoryid');
                var _category = $(this).data('category');

                amGloble.loading.show("查询中,请稍候...");
                amGloble.api.queryMallItem.exec({
                    category: _category,
                    subCategory: _subCategoryId
                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0) {
                            self.renderQueryMallItem(ret.content);
                    } else {
                            amGloble.msg(ret.message || "数据获取失败,请重试!");
                    }
                });
            });
            //点击小类明细
            this.$contentListWrapInnerUl.on('vclick', 'li', function(){
                var user = amGloble.metadata.userInfo;
                var _item = $(this).data('item');
                var url = config.shareRoot + $.param({
                    tenantId: user.parentShopId,
                    view: 4,
                    modelId: _item.id,
                    promoteUser: user.userType + "_" + user.userId
                });
                window.open(url, '_blank', 'location=no');
            });
            //我要推广
            this.$contentListWrapInnerUl.on('vclick', '.promotionbenefit a', function(e) {
                e.stopPropagation();

                var $li = $(this).parents('li');
                var _item = $li.data('item');
                var user = amGloble.metadata.userInfo;

                if( $li.find(".imgwrap img").is(":visible") ){  //如果是显示
                    var _imgUrl = $li.find(".imgwrap img").attr("src");
                }else{  //是隐藏
                    var _imgUrl = amGloble.metadata.userInfo.logo;  //用租户logo
                }

                var shareObj = {
                    title: user.shopName + "精品推荐 - " + _item.name,
                    link: config.shareRoot + $.param({
                        tenantId: user.parentShopId,
                        view: 4,
                        modelId: _item.id,
                        promoteUser: user.userType + "_" + user.userId
                    }),
                    imgUrl: _imgUrl,
                    success:function(){}
                };
                amGloble.share(shareObj);
            });
            //推广,收益tab切换
            this.$footTab.on('vclick', 'span', function() {
                $(this).addClass('selected').siblings('span').removeClass('selected');
                var _index = $(this).index();
                if (_index == 0) { //推广 
                    self.showExtension();
                    self.queryMallItemCategory();
                }else if(_index == 1){  //收益
                    self.showProfit();
                    self.queryCampaignList(1);
                    self.benefitScroll.refresh();
                    self.benefitScroll.scrollTo("top");
                }
            });
            //为收益页面的icon箭头绑定点击事件
            this.$.find(".am-body-inner").on("vclick",".benefit",function() {
                // $.am.changePage(amGloble.page.benefitSummary, "slideleft", {'userid' : self.userid, 'balance' : self.balance});
                $.am.changePage(amGloble.page.promotionReport, "slideleft", {
                    report: {
                        name: "收益",
                        apiName: "queryCampaignReport",
                    },
                    shops: amGloble.storeSelect.getCurrentShops()
                });
            });
            //获得收益页面的scrollView
            self.benefitScroll = new $.am.ScrollView({
                $wrap: this.$.find(".am-body-wrap"),
                $inner: this.$.find(".am-body-inner"),
                direction: [false, true],
                hasInput: false
            });
            self.benefitScroll.refresh();
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }
            this.$footTab.find('span:first').trigger('vclick');
            this.queryCampaignList(1);
        },
        afterShow: function(paras) {
            this.menuListWrap.refresh();
            this.contentListWrap.refresh();
        },
        beforeHide: function() {},
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            this.queryCampaignList(1);
        },
        touchBottom: function() {
            this.queryCampaignList(this.pageNumber);
        },
        pageNumber: 1,
        pageSize: 10,
        queryMallItemCategory: function() { //查询商品分类
            var _this = this;
            amGloble.loading.show("查询中,请稍候...");
            amGloble.api.queryMallItemCategory.exec({
                //'category': 2 //1 服务类，2 卖品类
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    _this.renderQueryMallItemCategory(ret.content);
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }
            });
        },
        renderQueryMallItemCategory: function(data) {
            if (data.length == 0) {
                return;
            }
            var _html = '';
            var _num = 0;
            for (var i = 0; i < data.length; i++) {
                if(data[i].count == 0) continue;
                _num ++;
                _html += '<li class="am-clickable" data-category="'+ data[i].category +'" data-subcategoryid="' + data[i].subCategoryId + '">' + data[i].subCategoryName + '</li>';
            }
            if(_num > 0){
                this.$extensionEmpty.hide();
            }else{
                this.$extensionEmpty.show();
            }

            this.$menuListWrapInnerUl.html(_html);
            this.menuListWrap.refresh();

            this.$menuListWrapInnerUl.find('li:first').trigger('vclick');
        },
        renderQueryMallItem: function(data) {
            this.$contentListWrapInnerUl.html('');
            if (data.length == 0) {

            } else {
                for (var i = 0; i < data.length; i++) {
                    if( data[i].campaignmoney == undefined ){
                        continue;
                    }

                    var $li = $('<li class="am-clickable">' +
                        '<div class="imgwrap">' +
                        //'<img src="'+ data[i].images +'">' +
                        '</div>' +
                        '<h2 class="tith2">' + data[i].name + '</h2>' +
                        '<p class="pricep">原价: ￥' + data[i].price + '  /  分享立减' + data[i].sharediscount + '元</p>' +
                        '<div class="promotionbenefit">' +
                        '推广收益:<span>￥' + data[i].campaignmoney + '</span><a href="javascript:;" class="am-clickable">我要推广</a>' +
                        '</div>' +
                        '</li>');
                    var $img = amGloble.photoManager.createImage("mall", {//"goods"改为"mall"
                        parentShopId: amGloble.metadata.userInfo.parentShopId
                    }, data[i].images.split(",")[0], "s");/*增加 split(",")[0] 代码片段——取数组，前第一个图片*/
                    $li.find('.imgwrap').append($img);
                    $li.data('item', data[i]);
                    this.$contentListWrapInnerUl.append($li);
                }
            }
            this.contentListWrap.refresh();
            this.contentListWrap.scrollTo("top");
        },
        queryCampaignList: function(pageNumber) { //查询收益列表
            var metadata = amGloble.metadata.userInfo;
            if (pageNumber == 1) {
                self.pageNumber = 1;
                self.$.find('ul.benefit_list').html('');
            }
            amGloble.loading.show("查询中,请稍候...");
            amGloble.api.queryCampaignList.exec({
                "parentShopId": metadata.parentShopId,
                "shopId": metadata.shopId,
                "pageNumber": self.pageNumber,
                "pageSize": self.pageSize,
                "userId": metadata.userId,
                "userType": metadata.userType
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    //benefit_list
                    var _len = ret.content.data.length;
                    if (_len == 10) { //当上次返回数据的条数为10个时，pageNumber就++
                        self.pageNumber++;
                    }
                    if (self.pageSize > _len) {
                        self.scrollview.pauseTouchBottom = true;
                    } else {
                        self.scrollview.pauseTouchBottom = false;
                    }
                    if (_len == 0 && self.pageNumber == 1) {
                        self.showEmpty();
                    } else {
                        if (self.pageNumber == 1) {
                            self.$.find('ul.benefit_list').html('');
                        }
                        /*if(_len == 0 && self.pageNumber != 1){
                            self.showNomore();
                        }*/
                        self.renderQueryCampaignList(ret.content);
                        /*if(_len<self.pageSize){
                             self.showNomore();
                        }*/
                    }
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }
                self.closeTopLoading();
                self.closeBottomLoading();
            });
        },
        renderNormalBenefitPage:function(){
            //收益从无到有的时候先清空容器
            this.$.find('.am-body-inner').empty();
            var _html = $(
                        '<div class="inner_header">'+
                            '<div class="benefit am-clickable">'+
                                '<div class="this_benefit">本月收益</div>'+
                                '<div class="money_content"></div>'+
                                '<div class="run_ico"></div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="benefit_tip">'+
                            '<span></span>'+
                            '<span>收益将随工资发放，暂不支持提现哦~</span>'+
                        '</div>'+
                        '<ul class="benefit_list am-clickable">'+
                        '</ul>');
            this.$.find('.am-body-inner').append(_html);
            this.refresh();
        },
        renderQueryCampaignList: function(data) { //渲染收益列表
            //只有从收益为无到有，才干的事情
            this.$.find('.emptydiv').length > 0 && self.renderNormalBenefitPage();
            //monthTotal
            var monthTotal = data.monthTotal;
            $(".am-body-inner .money_content").html(monthTotal);
            //收益本来有，走的逻辑
            self.benefitScroll.refresh();
            self.benefitScroll.scrollTo("top");
            var listdata=data.data;
            for (var i = 0; i < listdata.length; i++) {
                var _html = $('<li>' +
                    '<div class="left">' +
                    '<p class="serviceName">' + listdata[i].serviceName + '</p>' +
                    '<p class="benefitSrc">顾客:' + listdata[i].customName + '</p>' +
                    '</div>' +
                    '<div class="right">' +
                    '<p class="money">￥' + listdata[i].campaignMoney + '</p>' +
                    '<p class="time">' + listdata[i].datetime + '</p>' +
                    '</div>' +
                    '</li>');
                this.$.find('ul.benefit_list').append(_html);
            }
            this.refresh();
            self.benefitScroll.refresh();
        },
        showExtension: function() { //显示推广
            this.$extensionWrap.show();
            this.$amHeader.removeClass('header-profit');
            this.$amBodyInner.hide();
            this.$text.text('推广');
        },
        showProfit: function() { //显示收益
            this.$extensionWrap.hide();
            this.$amHeader.addClass('header-profit');
            this.$amBodyInner.show();
            this.$text.text('收益');
        },
        showEmpty: function() { //没有收益时的渲染
            var _div = '<div class="emptydiv"><div class="pic"></div><p>还没有收益，要加油哦~</p></div>';
            this.$.find('.am-body-inner').html(_div);
            this.refresh();
        },
    });
})();