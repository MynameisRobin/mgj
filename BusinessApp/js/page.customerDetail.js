amGloble.page.customerDetail = new $.am.Page({
    backButtonOnclick: function() {
        if ($("#pswp_dom").is(":visible")) {
            amGloble.gallery.close();
        } else {
            $.am.page.back("slideright",this.paras);
        }
    },
    id: "page-customerDetail",
    init: function() {
        var _this = this;
        this.tab = new $.am.ScrollView({
            $wrap: this.$.find("div.custDetail_tab"),
            $inner: this.$.find("div.custDetail_tab ul"),
            direction: [1, 0]
        });
        this.tab.$inner.delegate("li", "vclick", function() {
            var $this = $(this);
            var idx = $this.index();
            var user = _this.data.meta;
            $this.addClass("selected").siblings().removeClass();
            //显示相应模块
            var $clist = _this.$blocks.eq(idx);
            _this.$blocks.hide().eq(idx).show();
            _this.scrollview.pauseTouchBottom = true;

            var $list = $clist.find("dl.list dd, div.archiveList li, ul li");
            if (!$list.length) {
                _this.$empty.css("display", "-webkit-box");
            } else {
                _this.$empty.hide();
            }
            if (idx == 0) {
                if (_this.custProfile.pageIndex == 0) {
                    //如果客户档案的页码是0，还没有取过数据
                    _this.getCustomerProfile();
                } else {
                    if (Math.ceil(user.archivesCount / 10) > _this.custProfile.pageIndex) {
                        _this.scrollview.pauseTouchBottom = false;
                    }
                }
            } else if (idx == 1) {
                if (_this.custPhotoProfile.pageIndex == 0) {
                    //如果美丽档案的页码是0，还没有取过数据
                    _this.getCustomerPhotoProfile();
                } else {
                    if (Math.ceil(user.custPhotoProfileCount / 10) > _this.custPhotoProfile.pageIndex) {
                        _this.scrollview.pauseTouchBottom = false;
                    }
                }
            } else if (idx == 2) {
                if (_this.serviceHistory.pageIndex == 0) {
                    //消费历史
                    _this.getCustomerServiceHistory();
                } else {
                    if (Math.ceil(user.serviceCount / 10) > _this.serviceHistory.pageIndex) {
                        _this.scrollview.pauseTouchBottom = false;
                    }
                }
            } else if (idx == 3 && !_this.custCards.rendered) {
                //
            } else if (idx == 4 && !_this.comboCards.rendered) {
                //
            } else if (idx == 5) {
                //
                if (_this.custClock.pageIndex == 0) {
                    //消费历史
                    _this.getCustomerClock();
                } else {
                    if (Math.ceil(user.clockCount / 10) > _this.custClock.pageIndex) {
                        _this.scrollview.pauseTouchBottom = false;
                    }
                }
            }


            _this.refresh();
        });
        this.$blocks = this.$.find(".custDetail_blocks > div");

        this.$header.children(".left.backbutton").vclick(function () {
            _this.paras['dback']=1;
            $.am.page.back("slideright",_this.paras);
        })

        this.$header.children(".right").vclick(function(){
            $.am.changePage(amGloble.page.customerDetailMore,'slideleft',_this.data);
        });

        this.$tqk = this.$.find('.tqk');
        this.$myk = this.$.find('.myk');

        //客户档案
        this.custProfile = {
            $title: this.$blocks.eq(0).find(".title_t"),
            $list: this.$blocks.eq(0).find("dl"),
            pageIndex: 0
        }
        this.custProfile.$list.delegate("div.edit", "vclick", function() {
            var $this = $(this).parent();
            var user = _this.data.meta;
            atMobile.nativeUIWidget.confirm({
                caption: "删除客户档案",
                description: "确定要删除这一条记录吗?",
                okCaption: "删除",
                cancelCaption: "返回"
            }, function() {
                amGloble.api.customerDelArchives.exec({
                    id: $this.attr("dataid") * 1
                }, function(ret) {
                    if (ret.code == 0) {
                        user.archivesCount--;
                        _this.tab.$inner.find("div.num").eq(0).text(user.archivesCount);
                        _this.custProfile.$title.text("共有" + user.archivesCount + "条档案");

                        // $this.prev().remove();
                        $this.remove();
                        _this.refresh();
                    } else {
                        amGloble.msg("删除失败！");
                    }
                });
            }, function() {});
        }).delegate('.photos li','vclick',function(){
            var items = [];
            var index = $(this).parent().children().index($(this));
            $(this).parent().find("img").each(function() {
                items.push({
                    src: $(this).attr("src").replace("_s", "_l"),
                    w: 1024,
                    h: 1024
                });
            });
            self.pswpTimer && clearTimeout(self.pswpTimer);
            amGloble.loading.show();
            self.pswpTimer = setTimeout(function() {
                amGloble.loading.hide();
                amGloble.pswp(items, index);
            }, 500);
        });
        //添加客户档案
        this.$.find("#createCustInfoBtn").vclick(function() {
            var user = _this.data.meta;
            amGloble.page.customerCreatFile.changeToMe("slideup", user);
        });

        //美丽档案
        this.custPhotoProfile = {
            $title: this.$blocks.eq(1).find(".title_t"),
            $list: this.$blocks.eq(1).find(".archiveList > ul"),
            pageIndex: 0
        }


        this.custPhotoProfile.$list.on("vclick", ".userHeader", function() {
            // //点击头像
        }).on("vclick", ".left > .like", function(e) {
            // //赞
        }).on("vclick", ".left > .share", function(e) {
            //分享
            e.stopPropagation();
            var $this = $(this);
            var $li = $this.parents("li");
            var data = $this.parents("li").data("item");
            console.log(data);

            var shareObj = {
                title: "哎哟，不错哦~" + amGloble.metadata.userInfo.shopName + amGloble.getStoresById(data.shopId).shopFullName + data.empName + "近期作品「" + data.title + "」，你心动了吗？约起！",
                link: config.shareRoot + $.param({
                    tenantId: amGloble.metadata.userInfo.parentShopId,
                    view: 8,
                    modelId: data.id
                }),
                imgUrl: $li.find("ul.photos img").eq(0).attr("src"),
                success: function() {}
            };

            amGloble.share(shareObj);

        }).on("vclick", ".right > .comment", function(e) {
            //审核和取消审核
            e.stopPropagation();
            var $thisli = $(this).parents("li");
            var data = $thisli.data("item");
            if (data.visible) {
                atMobile.nativeUIWidget.confirm({
                    caption: "取消审核",
                    description: "取消审核后此作品将不再显示在美e客，确认要取消吗?",
                    okCaption: "确定",
                    cancelCaption: "取消"
                }, function() {
                    amGloble.loading.show();
                    amGloble.api.inventionVisible.exec({
                        id: data.id,
                        visible: 0
                    }, function(ret) {
                        amGloble.loading.hide();
                        if (ret.code == 0) {
                            data.visible = 0;
                            $thisli.find(".comment").text("审核");
                            $thisli.find(".mykVisible").text("待审核");
                            amGloble.msg("取消成功!");
                        } else {
                            amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                        }
                    });
                }, function() {

                });
            } else {
                atMobile.nativeUIWidget.confirm({
                    caption: "审核",
                    description: "审核通过后作品将显示在美e客，确认审核吗?",
                    okCaption: "确定",
                    cancelCaption: "取消"
                }, function() {
                    amGloble.loading.show();
                    amGloble.api.inventionVisible.exec({
                        id: data.id,
                        visible: 1
                    }, function(ret) {
                        amGloble.loading.hide();
                        if (ret.code == 0) {
                            data.visible = 1;
                            $thisli.find(".mykVisible").text("美一客可见");
                            $thisli.find(".comment").text("取消审核");
                            amGloble.msg("审核成功!");
                        } else {
                            amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                        }
                    });
                }, function() {

                });
            }
        }).on("vclick", ".right > .complain", function(e) {
            //删除
            e.stopPropagation();
            var $thisli = $(this).parents("li");
            var data = $thisli.data("item");
            atMobile.nativeUIWidget.confirm({
                caption: "删除作品",
                description: "确认要删除此作品吗?",
                okCaption: "确定",
                cancelCaption: "取消"
            }, function() {
                amGloble.loading.show();
                amGloble.api.delInvention.exec({
                    id: data.id
                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0) {
                        data.visible = 1;
                        $thisli.remove();
                        amGloble.msg("删除成功!");
                        self.refresh();
                    } else {
                        amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                    }
                });
            }, function() {});
        }).on("vclick", "ul.photos > li", function(e) {
            //看大图
            e.stopPropagation();
            var items = [];
            var index = $(this).parent().children().index($(this));
            $(this).parent().find("img").each(function() {
                items.push({
                    src: $(this).attr("src").replace("_s", "_l"),
                    w: 1024,
                    h: 1024
                });
            });
            self.pswpTimer && clearTimeout(self.pswpTimer);
            amGloble.loading.show();
            self.pswpTimer = setTimeout(function() {
                amGloble.loading.hide();
                amGloble.pswp(items, index);
            }, 600);
        }).on("vclick", ".commentsList .del", function(e) {
            //删除评论
            e.stopPropagation();
            //删除评论
            var $this = $(this);
            var data = $this.parents("p").data("item");
            console.log(data);

            atMobile.nativeUIWidget.confirm({
                caption: "删除评论",
                description: "确定要删除这个评论吗？",
                okCaption: "是",
                cancelCaption: "否"
            }, function() {
                amGloble.loading.show();
                amGloble.api.inventionDeleteEvaluation.exec({
                    id: data.id,
                    //token : amGloble.token
                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0) {
                        var $list = $this.parents(".commentsList");
                        $this.parent().remove();
                        if ($list.is(":empty")) {
                            $list.hide();
                        }

                        amGloble.msg("删除成功.");
                    } else {
                        amGloble.msg(ret.message || "数据提交失败,请检查网络!");
                    }
                });
            }, function() {});

        })


        //添加美丽档案
        this.$.find("#addBeautyDoc").vclick(function() {
            var user = _this.data.meta;
            amGloble.page.addArchive.changeToMe("slideup", {
                id: user.id,
                name: user.name,
                shopId: user.storeId
            });
        });

        //消费记录
        this.serviceHistory = {
            $title: this.$blocks.eq(2).find(".title_t"),
            $list: this.$blocks.eq(2).find("ul.custDetail_record"),
            pageIndex: 0,
            $clone: this.$blocks.eq(2).find("ul.custDetail_record>li").remove()
        };
        //会员卡
        this.custCards = {
            $list: this.$blocks.eq(3).find("ul.fileds"),
            $clone: this.$blocks.eq(3).find("ul.fileds>li").remove()
        };
        //套餐卡
        this.comboCards = {
            $list: this.$blocks.eq(4).find("ul.fileds"),
            $clone: this.$blocks.eq(4).find("ul.fileds>li").remove()
        };

        //客户闹钟
        this.custClock = {
            $title: this.$blocks.eq(5).find(".title_t"),
            $list: this.$blocks.eq(5).find("ul.fileds"),
            $clone: this.$blocks.eq(5).find("ul.fileds>li").remove(),
            pageIndex: 0
        };
        //添加客户档案
        this.$.find("#addClock").vclick(function() {
            var user = _this.data.meta;
            amGloble.page.customerClockAdd.changeToMe("slideup", user);
        });

        this.custClock.$list.on("vclick", "div.edit", function() {
            var $this = $(this).parent().parent();
            var item = $this.data("item");
            var user = _this.data.meta;
            atMobile.nativeUIWidget.confirm({
                caption: "删除客户闹钟",
                description: "确定要删除这个客户闹钟吗?",
                okCaption: "删除",
                cancelCaption: "返回"
            }, function() {
                amGloble.api.clockDelete.exec({
                    id: item.id
                }, function(ret) {
                    if (ret.code == 0) {
                        user.clockCount--;
                        _this.tab.$inner.find("div.num").eq(5).text(user.clockCount);
                        _this.custClock.$title.text("共有" + user.clockCount + "个客户闹钟");
                        $this.remove();
                        _this.refresh();
                    } else {
                        amGloble.msg("删除失败！");
                    }
                });
            }, function() {});
        });



        //上传头像
        this.$pic = this.$.find("#uploadHeaderBtn").vclick(function() {
            // amGloble.page.uploadHeader.changeToMe("slideup", _this.data);
            // alert("上传头像");

            var user = amGloble.metadata.userInfo;
            var $this = $(this);
            var custId = _this.data.meta.id;
            amGloble.photoManager.takePhoto("customer", {
                parentShopId: user.parentShopId,
                customerId: custId
            }, function() {
                console.log("succ");

                $this.html(amGloble.photoManager.createImage("customer", {
                    parentShopId: user.parentShopId,
                    updateTs: amGloble.now().getTime()
                }, custId + ".jpg", "s"));

                if (_this.paras && _this.paras.$li) {
                    var $li = _this.paras.$li;
                    $li.find(".header").html(amGloble.photoManager.createImage("customer", {
                        parentShopId: user.parentShopId,
                        updateTs: amGloble.now().getTime()
                    }, custId + ".jpg", "s"));
                }
            }, function() {
                console.log("fail");
            });
        });

        this.$title = this.$.find("div.am-header>p");
        this.$custInfo = this.$.find("div.custInfo");
        this.$name = this.$custInfo.find("div.name");
        this.$gender = this.$custInfo.find("div.gender");

        this.$addNickname = this.$.find('.addNickname').vclick(function(){
            $.am.changePage(amGloble.page.setNickname, "slideup",{customer:_this.data.meta});
        });

        this.$tags= this.$.find('.tags').vclick(function(){
            $.am.changePage(amGloble.page.addTag, "slideup",{customer:_this.data.meta});
        });

        this.$addTag= this.$.find('.addtag').vclick(function(){
            $.am.changePage(amGloble.page.addTag, "slideup",{customer:_this.data.meta});
        });

        //收藏/取消收藏
        this.$star = this.$custInfo.find("a.favor").vclick(function() {
            if ($(this).hasClass("isFavor")) {
                _this.changeFavorStatus(0);
            } else {
                _this.changeFavorStatus(1);
            }
        });
        this.$level = this.$custInfo.find("div.level");
        this.$sms = this.$custInfo.find("a.sms").vclick(function(){
            $.am.changePage(amGloble.page.customerMessage, "slideleft",{customer:_this.data.meta});
        });
        this.$tel = this.$custInfo.find("a.tel");
        this.$averageExpensePrice = this.$custInfo.find("li.averageExpensePrice");
        this.$lastConsumption = this.$custInfo.find("li.lastConsumption");
        this.$defaultBarber = this.$custInfo.find("li.defaultBarber");

        //消费周期
        this.$changeCycleBtn = this.$custInfo.find("li.changeCycleBtn").vclick(function() {
            amGloble.page.customerChangeCycle.changeToMe("slideup", _this.data.meta);
        });

        this.$fullloading = this.$.find("div.am-page-loading.full");
        this.$loading = this.$.find("div.am-page-loading.part");
        this.$error = this.$.find("div.am-page-error");
        this.$empty = this.$.find("div.am-page-empty");
    },
    beforeShow: function(paras) {
        console.log(paras)
        if (paras == "back" || paras == "forceRefresh" || paras == 'formsms') {
            return;
        }
        if(!!paras.customerTags){
            this.data.meta.tags = paras.customerTags;
            this.renderTags(paras.customerTags);
            return;
        }
        if('nickname' in paras){
            this.data.meta.nickname = paras.nickname;
            this.$.find('.nickname').html(paras.nickname || '未设置昵称');
            return;
        }
        this.paras = paras;
        console.log(222222)
        this.$title.text("正在加载");
        this.$addNickname.hide();
        this.$fullloading.css("display", "-webkit-box");
        this.scrollview.scrollTo("top");
        this.scrollview.$wrap.hide();
        this.$header.children(".right").hide();
        //this.clear();

    },

    afterShow: function(paras) {
        console.log(paras)
        if (paras == "back" || !!paras.customerTags || (paras && paras.hasOwnProperty('nickname')) || paras == 'formsms') {
            return;
        }
        this.paras = paras;
        if (paras == "forceRefresh") {
            this.custPhotoProfile.pageIndex = 0;
            this.custPhotoProfile.$list.empty();
            this.getCustomerPhotoProfile();
            return;
        } 
        this.getData(paras);
    },
    getData: function(opt) {
        if (!opt) {
            opt = {};
        }
        if (!opt.custId) {
            opt.custId = this.data.meta.id;
            opt.shopid = this.data.meta.storeId;
        }
        var emp = amGloble.metadata.userInfo;
        var _this = this;
        this.$fullloading.css("display", "-webkit-box");
        amGloble.api.customerQuerMemInfo.exec({
            shopid: opt.shopid,
            memId: opt.custId,
            userType: emp.userType,
            empid: emp.userId,
        }, function(ret) {
            _this.$fullloading.hide();
            if (ret.code == 0) {
                _this.data = ret.content;
                _this.scrollview.$wrap.show();
                _this.render();

                //将客户档案页码消0
                _this.custProfile.pageIndex = 0;
                _this.custProfile.$list.empty();
                //将美丽档案页码消0
                _this.custPhotoProfile.pageIndex = 0;
                _this.custPhotoProfile.$list.empty();
                //将消费记录页码消0
                _this.serviceHistory.pageIndex = 0;
                _this.serviceHistory.$list.empty();

                //会员卡设为未渲染
                _this.custCards.rendered = false;
                //会员卡设为未渲染
                _this.comboCards.rendered = false;
                //将客户档案页码消0
                _this.custClock.pageIndex = 0;
                _this.custClock.$list.empty();

                var _k = 0;
                _this.tab.$inner.find('li').each(function(k, v) {
                    if ($(v).is(':visible')) {
                        _k = k;
                        return false;
                    }
                });
                _this.tab.$inner.find("li:eq(" + (opt.idx || _k) + ")").trigger("vclick");
                //_this.getCustomerProfile(opt.custId);
            } else {
                atMobile.nativeUIWidget.confirm({
                    caption: "读取失败",
                    description: "客户资料读取失败,请检查网络",
                    okCaption: "重试",
                    cancelCaption: "返回"
                }, function() {
                    _this.getData(opt);
                }, function() {
                    $.am.page.back();
                });
            }
        });
    },
    gender: {
        "M": "先生",
        "F": "女士"
    },
    clear: function() {
        this.$title.text("正在加载");
        this.$name.text("");
        this.$pic.empty();
        this.$star.removeClass("isFavor");
        this.$level.text("");
        this.$sms.hide();
        this.$tel.hide();
        this.$averageExpensePrice.find(".value").text("--");
        this.$lastConsumption.find(".value").text("--");
        this.$defaultBarber.find(".value").text("--");
        this.$changeCycleBtn.find(".value").text("--");

        var $num = this.tab.$inner.find("div.num");
        $num.eq(0).text(0);
        $num.eq(1).text(0);
        $num.eq(2).text(0);
        $num.eq(3).text(0);
        $num.eq(4).text(0);

        this.custProfile.$title.text("共有" + 0 + "条档案");
        this.custPhotoProfile.$title.text("共有" + 0 + "条作品");
        this.custClock.$title.text("共有" + 0 + "个客户闹钟");
        this.$blocks.hide();
    },
    render: function() {
        this.$header.children(".right").show();
        //隐藏会员卡和套餐卡
        if (amGloble.metadata.permissions.allowcard) {
            this.tab.$inner.find("li").eq(3).show();
            this.tab.$inner.find("li").eq(4).show();
        } else {
            this.tab.$inner.find("li").eq(3).hide();
            this.tab.$inner.find("li").eq(4).hide();
        }
        //员工才显示闹钟
        if (amGloble.metadata.userInfo.userType) {
            this.tab.$inner.find("li").eq(5).show();
        } else {
            this.tab.$inner.find("li").eq(5).hide();
        }
        this.tab.refresh();
        var user = this.data.meta;
        var emp = amGloble.metadata.userInfo;
        var cards = this.data.cards;
        var packages = this.data.packages;
        var _this = this;

        this.$title.text(user.name + (this.gender[user.gender] || ""));
        this.$name.text(user.name);
        this.$pic.empty().html(amGloble.photoManager.createImage("customer", {
            parentShopId: emp.parentShopId,
            updateTs: user.lastphotoupdatetime
        }, user.id + ".jpg", "s"));

        if(user.nickname){
            this.$addNickname.show().find('.nickname').html(user.nickname);
        }else {
            this.$addNickname.show().find('.nickname').html('未设置昵称').show();
        }

        if (user.gender == "M") {
            this.$pic.removeClass("famale");
            this.$gender.addClass("male");
        } else if (user.gender == "F") {
            this.$pic.addClass("famale");
            this.$gender.addClass("female");
        } else {
            this.$pic.addClass("famale");
            this.$gender.removeClass("male female");
        }

        if(this.data.privilege){
            this.$tqk.show();
        }else {
            this.$tqk.hide();
        }

        if(this.data.meta.openId){
            this.$myk.show();
        }else {
            this.$myk.hide();
        }

        if (user.isFavor) {
            this.$star.addClass("isFavor");
        } else {
            this.$star.removeClass("isFavor");
        }
        this.$level.text(user.className || "--");
        this.$changeCycleBtn.find(".value").text(user.mgjconsumeperiod || "--");
        this.$averageExpensePrice.find(".value").text(user.req == null ? "--" : amGloble.cashierRound(user.req, 1));
        this.$lastConsumption.find(".value").text(user.lastconsumetime ? new Date(user.lastconsumetime).format("yyyy-mm-dd") : "--");
        this.$defaultBarber.find(".value").text(user.mgjlastserver || "--");

        this.renderTags(user.tags);

        if (user.phone && user.phone.length){
            if(amGloble.metadata.userInfo.operatestr && amGloble.metadata.userInfo.operatestr.indexOf('MGJP')>0){
                this.$tel.hide();
            }else {
                this.$tel.attr("href", "tel:" + user.phone).show();
            }
        }else {
            this.$tel.hide();
        }

        // if (user.phone && user.phone.length > 4 && amGloble.allowViewTel) {
        if (user.phone && user.phone.length && amGloble.metadata.permissions.allowphone) {
            // this.$sms.show();
            this.$tel.attr("href", "tel:" + user.phone).show();
        } else {
            // this.$sms.hide();
            this.$tel.hide();
        }

        var $num = this.tab.$inner.find("div.num");
        $num.eq(0).text(user.archivesCount || "0");
        $num.eq(1).text(user.inventionCount || "0");
        $num.eq(2).text(user.serviceCount || "0");
        $num.eq(3).text(cards.length || "0");
        $num.eq(4).text(packages.length || "0");
        $num.eq(5).text(user.clockCount || "0");

        this.custProfile.$title.text("共有" + user.archivesCount + "条档案");
        this.custPhotoProfile.$title.text("共有" + user.inventionCount + "条作品");
        this.custClock.$title.text("共有" + user.clockCount + "个客户闹钟");

        _this.renderCards(cards);
        _this.renderComboCards(packages);
    },
    renderCards: function(cards) {
        var _this = this;
        _this.custCards.rendered = true;
        _this.custCards.$list.empty();
        $(cards).each(function(i, item) {
            var $clone = _this.custCards.$clone.clone(true, true);
            $clone.find(".mid .line1").text(item.cardName);
            $clone.find(".mid .line2").text(item.cardNo);
            // if (item.cardType == 2) {
            //     $clone.find(".right .line1").hide();
            //     $clone.find(".right .line2").hide();
            // } else {
            //     $clone.find(".right .line1").text("金额：￥" + amGloble.cashierRound(item.balance));
            //     $clone.find(".right .line2").text("赠送金：￥" + amGloble.cashierRound(item.bonusBalance));
            // }


            if (item.timeFlag == 0) {
                //timeFlag,0--普通储值卡  1--计次卡  2--套餐卡  3--年卡，套餐卡卡和年卡如果balance和bonusBalance都等于0，就不显示
                //普通储值卡
                if (item.cardType == 2) {
                    $clone.find(".right .line1").text("折扣卡");
                } else {
                    $clone.find(".right .line1").text("余额:￥" + amGloble.cashierRound(item.balance));
                }
            } else if (item.timeFlag == 1) {
                $clone.find(".right .line1").text("余:" + item.cardTimes + "次");
            } else if ((item.timeFlag == 2 || item.timeFlag == 3)) {
                $clone.find(".right .line1").text("余额:￥" + amGloble.cashierRound(item.balance));
            }

            if (item.bonusBalance) {
                $clone.find(".right .line2").text("赠送金:￥" + amGloble.cashierRound(item.bonusBalance));
            } else {
                $clone.find(".right .line2").hide();
            }


            _this.custCards.$list.append($clone);
        });

        if (!cards.length) {
            this.$empty.css("display", "-webkit-box");
        } else {
            this.$empty.hide();
        }
        this.refresh();
    },
    renderComboCards: function(comboCards) {
        var _this = this;
        _this.comboCards.rendered = true;
        _this.comboCards.$list.empty();
        $(comboCards).each(function(i, item) {
            if (item.totalTimes != 0 && item.times == 0) {
                return true;
            }
            var $clone = _this.comboCards.$clone.clone(true, true);
            $clone.find(".line1").text(item.serviceItemName);
            $clone.find(".line2").text(item.closingDate ? "到期时间: " + new Date(item.closingDate).format("yyyy-mm-dd") : "无期限");
            if ((item.totalTimes == 0 && item.times == 0) || item.totalTimes == -99) {
                $clone.find(".right").text("不限次数");
            } else {
                $clone.find(".right").html("剩余<strong>" + item.times + "次</strong> / " + "总共" + item.totalTimes + "次");
            }
            _this.comboCards.$list.append($clone);
        });

        if (!comboCards.length) {
            this.$empty.css("display", "-webkit-box");
        } else {
            this.$empty.hide();
        }
        this.refresh();
    },
    //获取客户档案
    getCustomerProfile: function() {
        var _this = this;
        var user = this.data.meta;
        var custId = user.id;

        if (this.custProfile.pageIndex == 0) {
            this.$loading.css("display", "-webkit-box");
        } else {
            this.$loading.hide();
        }
        this.$empty.hide();
        amGloble.api.customerArchivesList.exec({
            memId: custId,
            pageNumber: this.custProfile.pageIndex,
            pageSize: 10
        }, function(ret) {
            _this.$loading.hide();
            _this.closeBottomLoading();
            if (ret.code == 0) {
                _this.custProfile.pageIndex++;
                _this.renderCustomerProfile(ret.content);

                _this.tab.$inner.find("div.num").eq(0).text(ret.totalCount);
                _this.custProfile.$title.text("共有" + ret.totalCount + "条档案");

                if (!ret.content || !ret.content.length) {
                    _this.scrollview.pauseTouchBottom = true;
                } else {
                    _this.scrollview.pauseTouchBottom = false;
                }
            } else {
                amGloble.msg("客户档案读取失败！");
            }
        });
    },
    renderCustomerProfile: function(list) {
        if (this.custProfile.pageIndex <= 1) {
            this.custProfile.$list.empty();
        }
        this.appendCustomerProfile(list);
    },
    appendCustomerProfile: function(list) {
        var ts = new Date();
        var today = ts.format("yyyy-mm-dd");
        ts.setDate(ts.getDate() - 1);
        var yestoday = ts.format("yyyy-mm-dd");
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var $html = $('<dd dataid="' + item.id + '">'+
                    '<div class="content">'+
                        '<p>'+item.archives+'</p>'+
                        '<ul class="photos"></ul>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                    '<div class="author">' + item.userName+'&nbsp;&nbsp;&nbsp;&nbsp;'+ amGloble.time2str(parseInt(item.createTime / 1000)) + '</div>'+
                    '<div class="edit am-clickable">删除</div>'+
                    '<div class="clear"></div>'+
                '</dd>');
            this.custProfile.$list.append($html);
            if(item.imgs){
                var w = Math.floor(($(".am-widthLimite").width() - 50) / 3);
                var arr = item.imgs.split(',');
                for(var j=0;j<arr.length;j++){
                    var $img = amGloble.photoManager.createImage('customerFile', {
                        parentShopId: amGloble.metadata.userInfo.parentShopId,
                        authorId: amGloble.metadata.userInfo.userId
                    }, arr[j], "s");
                    $html.find('.photos').append($("<li class='am-clickable'></li>").css({
                        width: w,
                        height: w
                    }).append($img));
                }
            }
        }

        if (!this.custProfile.$list.find('dd').length) {
            this.$empty.css("display", "-webkit-box");
        }

        this.refresh();

    },

    //美丽档案
    getCustomerPhotoProfile: function() {
        var _this = this;
        var user = this.data.meta;
        var custId = user.id;

        if (this.custPhotoProfile.pageIndex == 0) {
            this.$loading.css("display", "-webkit-box");
        } else {
            this.$loading.hide();
        }
        this.$empty.hide();
        amGloble.api.inventionList.exec({
            memId: custId,
            pageNumber: this.custPhotoProfile.pageIndex,
            pageSize: 10
        }, function(ret) {
            _this.$loading.hide();
            _this.closeBottomLoading();
            if (ret.code == 0) {
                _this.custPhotoProfile.pageIndex++;
                _this.renderCustomerPhotoProfile(ret.content);

                _this.tab.$inner.find("div.num").eq(1).text(ret.totalCount);
                _this.custPhotoProfile.$title.text("共有" + ret.totalCount + "条作品");

                if (!ret.content || !ret.content.length) {
                    _this.scrollview.pauseTouchBottom = true;
                } else {
                    _this.scrollview.pauseTouchBottom = false;
                }
            } else {
                amGloble.msg("客户作品读取失败！");
            }
        });
    },
    renderCustomerPhotoProfile: function(list) {
        if (this.custPhotoProfile.pageIndex <= 1) {
            this.custPhotoProfile.$list.empty();
        }
        this.appendCustomerPhotoProfile(list);
    },
    appendCustomerPhotoProfile: function(list) {
        //$.am.debug.log(JSON.stringify(list));
        var $ul = this.custPhotoProfile.$list;
        $.each(list, function(i, item) {
            $ul.append(amGloble.page.archiveList.createItem(item));
        });

        if ($ul.is(":empty")) {
            this.$empty.css("display", "-webkit-box");
        }
        this.refresh();

    },

    //消费历史
    getCustomerServiceHistory: function() {
        var _this = this;
        var user = this.data.meta;
        var custId = user.id;
        if (this.serviceHistory.pageIndex == 0) {
            this.$loading.css("display", "-webkit-box");
        } else {
            this.$loading.hide();
        }
        this.$empty.hide();
        amGloble.api.customerListServices.exec({
            memberid: custId,
            shopid: user.storeId,
            pageNum: this.serviceHistory.pageIndex + 1,
            pageSize: 10
        }, function(ret) {
            _this.$loading.hide();
            _this.closeBottomLoading();
            if (ret.code == 0) {
                _this.serviceHistory.pageIndex++;
                _this.renderCustomerServiceHistory(ret.content);

                if (!ret.content || !ret.content.length) {
                    _this.scrollview.pauseTouchBottom = true;
                } else {
                    _this.scrollview.pauseTouchBottom = false;
                }
                _this.tab.$inner.find("div.num").eq(2).text(ret.count);
            } else {
                amGloble.msg("客户档案读取失败！");
            }
        });
    },
    renderCustomerServiceHistory: function(list) {
        if (this.serviceHistory.pageIndex <= 1) {
            this.serviceHistory.$list.empty();
        }
        this.appendCustomerServiceHistory(list);
    },
    appendCustomerServiceHistory: function(list) {
        var self = this;
        if (list && list.length) {
            $.each(list, function(i, item) {
                var $li = self.serviceHistory.$clone.clone(true, true);
                $li.data("data", item);
                $li.find("div.time").text(amGloble.time2str(item.createDate / 1000));
                $li.find("div.total > .price").text("¥" + amGloble.cashierRound(item.expense));
                var $itemlist = $li.find("ul.detail");
                for (var j = 0; j < item.items.length; j++) {
                    var $p = $('<li><span class="left"></span><span class="right"></span></li>');
                    var itemj = item.items[j];
                    $p.children(".left").text(itemj.serviceItemName + (item.expenseCategory == 1 ? " x" + itemj.num : ""));


                    if (
                        (item.expenseCategory == 4 && itemj.consumeType == 1) || //套餐项目消费
                        (item.expenseCategory == 6 && item.consumeType == -1 && itemj.consumeType == 4) //年卡项目消费
                    ) {
                        $p.find(".right").html(itemj.num + '次');
                    } else {
                        var p = amGloble.cashierRound(itemj.price);
                        var bonus = "";
                        if (itemj.largess && 　itemj.largess > 0) {
                            bonus = '<span class="bonus">(赠送金:' + itemj.largess + "元)</span>";
                        }
                        $p.children(".right").html(p + '元' + bonus);
                        if (!isNaN(p)) {
                            $p.children(".right").html(p + '元' + bonus);
                        } else {
                            $p.children(".right").html(itemsj.price + bonus);
                        }
                    }

                    $itemlist.append($p);

                }
                if (typeof(item.overallScore) == "number" && item.overallScore >= 0 && item.feedbackDT > 0) {

                    var $commentText = $li.find(".comment").show();
                    switch (item.overallScore) {
                        case 0:
                            $commentText.html('<span class="icon icon1">好评</span>' + item.feedbackComment);
                            break;
                        case 1:
                            $commentText.html('<span class="icon icon2">中评</span>' + item.feedbackComment);
                            break;
                        case 2:
                            $commentText.html('<span class="icon icon3">差评</span>' + item.feedbackComment);
                            break;
                    }
                }

                if (item.expenseCategory == 0 || (item.expenseCategory == 6 && item.consumeType == -1)) {} else {
                    $li.children("div.commentText").hide();
                    $li.find("span.comment").hide();
                }
                self.serviceHistory.$list.append($li);
            });
        }



        this.refresh();
        if (self.serviceHistory.$list.is(":empty")) {
            this.$empty.css("display", "-webkit-box");
        }
    },

    //客户闹钟
    getCustomerClock: function() {
        var _this = this;
        var user = this.data.meta;
        var custId = user.id;

        if (this.custClock.pageIndex == 0) {
            this.$loading.css("display", "-webkit-box");
        } else {
            this.$loading.hide();
        }
        this.$empty.hide();
        amGloble.api.clockList.exec({
            "customerId": custId,
            "shopId": amGloble.metadata.userInfo.shopId,
            "operator": amGloble.metadata.userInfo.userId,
            "pageSize": 10,
            "pageNumber": this.custClock.pageIndex
        }, function(ret) {
            _this.$loading.hide();
            _this.closeBottomLoading();
            if (ret.code == 0) {
                _this.custClock.pageIndex++;
                _this.renderCustomerClock(ret.content);

                // _this.tab.$inner.find("div.num").eq(0).text(ret.totalCount);
                // _this.custClock.$title.text("共有" + ret.totalCount + "个客户闹钟");

                if (!ret.content || !ret.content.length) {
                    _this.scrollview.pauseTouchBottom = true;
                } else {
                    _this.scrollview.pauseTouchBottom = false;
                }
            } else {
                amGloble.msg("客户闹钟读取失败！");
            }
        });
    },
    renderCustomerClock: function(list) {
        if (this.custClock.pageIndex <= 1) {
            this.custClock.$list.empty();
        }
        this.appendCustomerClock(list);
    },
    appendCustomerClock: function(list) {
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            // item.createtime = new Date(item.createtime).getTime();

            var date = new Date(new Date(item.unixtime + item.days * 86400000).format("yyyy/mm/dd"));
            var now = new Date(amGloble.now().format("yyyy/mm/dd"));
            var $li = this.custClock.$clone.clone(true, true);
            $li.find(".line1").html(item.title);
            $li.find(".line2").html(date.format("yyyy-mm-dd (" +((date.getTime() - now.getTime()) / 86400000) + "天后)") + " 提醒");
            $li.data("item", item);
            this.custClock.$list.append($li);
        }

        if (this.custClock.$list.is(":empty")) {
            this.$empty.css("display", "-webkit-box");
        }

        this.refresh();

    },

    changeFavorStatus: function(isFavor) {
        var self = this;
        var cust = this.data.meta;
        var user = amGloble.metadata.userInfo;

        if (isFavor) {
            amGloble.api.customerAddMemFavor.exec({
                memid: cust.id,
                shopId: user.shopId,
                userType: user.userType,
                empid: user.userId
            }, function(ret) {
                if (ret.code == 0) {
                    self.$star.addClass("isFavor");
                    amGloble.msg("设置星标成功，可在星标客户中看到TA");
                } else {
                    amGloble.msg("设置星标失败！");
                }
            });
        } else {
            amGloble.api.customerDelMemFavor.exec({
                memid: cust.id,
                shopId: user.shopId,
                userType: user.userType,
                empid: user.userId
            }, function(ret) {
                if (ret.code == 0) {
                    self.$star.removeClass("isFavor");
                    amGloble.msg("已取消星标");
                } else {
                    amGloble.msg("取消星标失败！");
                }
            });
        }
    },
    /*
     touchTop: function () {
     var _this=this;
     setTimeout(function () {
     _this.closeTopLoading();
     }, 500);
     },
     amDragTopTips: ["下拉可以刷新", "松开开始刷新", "加载中..."],
     */
    touchBottom: function() {
        var _this = this;
        var idx = this.tab.$inner.find("li.selected").index();
        if (idx == 0) {
            this.getCustomerProfile();
        } else if (idx == 1) {
            this.getCustomerPhotoProfile();
        } else if (idx == 2) {
            this.getCustomerServiceHistory();
        } else if (idx == 5) {
            this.getCustomerClock();
        }

    },
    amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
    renderTags:function(tags){
        if(tags.length){
            this.$addTag.hide();
            this.$tags.show().empty().css('width','auto');
            for(var i=0;i<tags.length;i++){
                this.$tags.append('<p>'+tags[i].tagName+'</p>');
            }
            var cw = this.$tags.width();
            var lis = this.$tags.find('p');
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
                    this.$tags.find('p').eq(j).css('width',cw-w2-15+'px');
                    return false;
                }
            }
            this.$tags.css('width',w+3+'px');
        }else {
            this.$addTag.show();
            this.$tags.hide();
        }
    }
});
