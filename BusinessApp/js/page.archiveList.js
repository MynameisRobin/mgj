(function() {

    var typePicker = window.typePicker = {
        init: function() {
            var self = this;
            this.$1 = amGloble.page.archiveList.$.find(".mainTypeContainer");
            this.$2 = amGloble.page.archiveList.$.find(".secTypeContainer");

            this.$ul1 = this.$1.find("ul");
            this.$ul2 = this.$2.find(".archiveList_tab");

            this.$li1 = this.$ul1.children(":first").remove();
            this.$li2 = this.$ul2.children(":first").remove();

            this.mainType = new $.am.ScrollView({
                $wrap: this.$1.find(".mainTypeTab"),
                $inner: this.$1.find(".mainTypeTab_inner"),
                direction: [1, 0]
            });

            this.$1.on("vclick", "ul > li", function() {
                // $(this).addClass("selected").siblings().removeClass("selected");
                var $this = $(this);
                self.openSecMenu($this);
            });

            this.$2.on("vclick", ".archiveList_tab > span", function() {
                // $(this).addClass("selected").siblings().removeClass("selected");
                var $this = $(this);
                self.changeType($this);
            });

            this.$subMenuText = this.$1.find(".subMenuText");
        },
        render: function(data) {
            var self = this;
            var $ul = this.$ul1.empty();
            var total = 0;
            var categories = metaConfig.invention.getInventionJSON();
            var activeCategories = [];
            //大类数据筛选
            for (var j = 0; j < categories.length; j++) {
                for (var i = 0; i < data.length; i++) {
                    if (categories[j].category == data[i].type && data[i].count > 0) {
                        var c = $.extend(true, {}, categories[j]);
                        //找到有内容的大类
                        //activeCategories["c"+categories[j].category] = c;
                        activeCategories.push(c);
                        break;
                    }
                }
            }
            // for(var i=0;i<data.length;i++){
            // 	if(data[i].count>0 && !activeCategories["c"+data[i].type]){
            // 		for (var j = 0; j < categories.length; j++) {
            // 			if(categories[j].category == data[i].type){
            // 				var c = $.extend(true,{},categories[j]);
            // 				//找到有内容的大类
            // 				activeCategories["c"+categories[j].category] = c;
            // 				activeCategories.push(c);
            // 				break;
            // 			}
            // 		}
            // 	}
            // }
            //小类数据筛选
            for (var i = 0; i < activeCategories.length; i++) {
                var subcate = activeCategories[i].subCategories;
                var newSub = [];
                for (var j = 0; j < subcate.length; j++) {
                    for (var k = 0; k < data.length; k++) {
                        if (subcate[j].subCategory == data[k].subType && data[k].count > 0) {
                            subcate[j].number = data[k].count;
                            newSub.push(subcate[j]);
                            break;
                        }
                    }
                }
                activeCategories[i].subCategories = newSub;
            }
            console.log("有数据的作品大类", activeCategories);
            amGloble.metadata.inventionCategories = activeCategories;
            $.each(amGloble.metadata.inventionCategories, function(i, item) {
                var $li = self.$li1.clone(true, true);
                if (self.currentItemData && self.currentItemData.category && self.currentItemData.category == item.category) {
                    $li.addClass("selected");
                }
                $li.find(".text").html(item.categoryName);
                $li.find(".icon").addClass("icon" + (i + 1));
                $li.data("item", item);
                $ul.append($li);
            });
            this.mainType.refresh();
            amGloble.page.archiveList.getOnePage(true);
        },
        openSecMenu: function($this) {
            var self = this;
            var $ul = this.$ul2.empty();
            var data = $this.data("item");

            if ($this.hasClass("selected2")) {
                $this.removeClass("selected2");
                this.hideSecMenu();
                this.currentItem1 = null;
                return;
            }

            this.currentItem1 = $this;

            $this.addClass("selected2").siblings().removeClass("selected2");

            var total = 0;
            $.each(data.subCategories, function(i, item) {
                var $li = self.$li2.clone(true, true);
                $li.html(item.subCategoryName + "<span class='small'>(" + (item.number || 0) + ")</span>");
                $li.data("item", item);
                if (self.currentItemData && self.currentItemData.subCategory && self.currentItemData.subCategory == item.subCategory) {
                    $li.addClass("selected");
                }
                $ul.append($li);
                total += item.number;
            });

            var allData = {
                category: data.category,
                subCategoryName: "全部"
            };

            var $all = self.$li2.clone(true, true).html("全部" + "<span class='small'>(" + total + ")</span>");
            if (this.currentItem1.hasClass("selected") && self.currentItemData.subCategory == null) {
                $all.addClass("selected");
            }
            $all.data("item", allData);
            $ul.prepend($all);
            this.showSecMenu();

        },
        showSecMenu: function() {
            this.$2.slideDown(200);
        },
        hideSecMenu: function() {
            this.$1.find(".selected2").removeClass("selected2");
            this.$2.slideUp(200);
        },

        getVal: function() {
            if (!this.currentItemData) {
                this.currentItemData = this.$ul1.find("li:first").addClass("selected").data("item");
                this.$subMenuText.html("全部");
            }
            return this.currentItemData;
        },
        resetVal:function(){
            this.currentItemData = null;
        },
        changeType: function($this) {

            var data = $this.data("item");

            this.currentItemData = data;
            this.currentItem1.addClass("selected").siblings().removeClass("selected");

            this.$subMenuText.html(data.subCategoryName);

            this.hideSecMenu();
            this.onchange && this.onchange(this.currentItemData);
        },
        onchange: function(data) {
            console.log(data);
        }
    };

    var self = amGloble.page.archiveList = new $.am.Page({
        id: "page_archiveList",
        backButtonOnclick: function() {
            if ($("#pswp_dom").is(":visible")) {
                amGloble.gallery.close();
            } else {
                $.am.page.back();
            }
        },
        init: function() {

            typePicker.init();
            typePicker.onchange = function() {
                self.scrollview.touchTop(3);
            };

            //
            this.$.find("span.createArchive").vclick(function() {
                amGloble.page.addArchive.changeToMe("slideup");
            });

            this.scrollview.$inner.bind("vtouchstart", function() {
                typePicker.hideSecMenu();
            });

            //列表页相关逻辑

            this.$ul = this.$.find(".archiveList > ul");
            this.$li = this.$ul.find(":first").remove();
            this.$commentLi = this.$li.find(".commentsList > p:first").remove();

            this.$ul.empty();

            this.$ul.on("vclick", ".userHeader", function() {
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
                    success: function() {
                    }
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
                        id: data.id,
                        empId:data.empId
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
                }, 500);
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

            });

            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                if (self.$error.hasClass("listError")) {
                    self.scrollview.touchTop(3);
                } else {
                    self.getTypes();
                }
            });

            this.$empty = this.$.find("div.am-page-empty");

            this.$filter = this.$.find(".archiveFilterUl").find("li");
            this.$filter.vclick(function() {
                var i = self.$filter.index($(this));
                $(this).addClass("selected").siblings().removeClass("selected");
                typePicker.currentItemData = null;
                typePicker.hideSecMenu();
                self.getTypes();
            });

            this.$listEmpty = this.$.find("div.archiveList-empty");
        },
        beforeShow: function(paras) {
            this.$.find('.actions').removeClass('audit');
            this.$.find(".archiveFilterUl").parent().show();
            if (amGloble.metadata.userInfo.userType == 1) {
                //员工，全部/我的
            }else{
                //管理员
                this.$filter.eq(1).text("管理");
                //全部/管理
                if(amGloble.metadata.userInfo.newRole==3){
                    //总部老板，不显示tab
                    this.$.find(".archiveFilterUl").parent().hide();
                }
            }
            if(paras && paras.EMPID){
                this.EMP = paras;
                this.$.find(".archiveFilterUl").parent().hide();
                this.$header.find('.right').hide();
            }else {
                this.EMP = null;
                this.$header.find('.right').show();
            }
            typePicker.resetVal();
        },
        afterShow: function(paras) {
            if (paras == "forceRefresh" || new Date().getTime() - this.refreshTime > 7200000 || (paras && paras.EMPID)) {
                // if(this.pageNumber){
                // 	this.scrollview.touchTop(3);
                // }else{
                this.getTypes();
                this.setStatus("loading");
                //this.getOnePage(true);
                //}
            }
        },
        beforeHide: function(paras) {
            $("#pswp_dom").removeClass("pswp--open");
        },
        //列表加载逻辑
        refreshTime: 0,

        refreshPage: function() {
            self.setStatus("normal");
            this.getOnePage(true);
        },
        getPeriod:function(arr){
            var start = arr[0],end = arr[1];
            var period = new Date(start).format('yyyy-mm-dd')+'_'+new Date(end).format('yyyy-mm-dd');
            return period;
        },
        getOnePage: function(clear) {
            var self = this;
            var type = typePicker.getVal();
            if (clear) {
                this.pageNumber = 0;
            }
            opt = {
                pageNumber: this.pageNumber,
                pageSize: this.pageSize,
                // barberId : barber ? barber.userid : null,
                type: type ? type.category : null,
                subType: type ? type.subCategory : null
            };
            if(this.EMP){
                opt.empId = this.EMP.EMPID;
                opt.shopIds = [this.EMP.shopId];
                opt.period = this.getPeriod(this.EMP.time);
            }else {
                var tab = this.$filter.index(this.$filter.filter(".selected"));
                if (tab) {
                    if (amGloble.metadata.userInfo.userType == 1) {
                        opt.empId = amGloble.metadata.userInfo.userId;
                    } else if (amGloble.metadata.userInfo.userType == 0) {
                        var shops = amGloble.metadata.shops;
                        if (shops) {
                            opt.shopIds = [];
                            for (var s = 0; s < shops.length; s++) {
                                opt.shopIds.push(shops[s].shopId);
                            }
                        }
                    }
                }
            }

            this.getData(opt, function(data) {

                if (data.code == 0) {
                    var list = data.content;
                    //刷新时的处理
                    if (clear) {
                        self.refreshTime = new Date().getTime();
                        self.$ul.empty();
                        self.scrollview.scrollTo("top");
                    }
                    if (list.length) {
                        self.pageNumber++;
                    }
                    if (self.pageSize > list.length) {
                        self.scrollview.pauseTouchBottom = true;
                    } else {
                        self.scrollview.pauseTouchBottom = false;
                    }
                    self.appendList(list);
                } else {
                    if (clear) {
                        self.setStatus("error");
                        self.$error.addClass("listError");
                    }
                }

                self.closeTopLoading();
                self.closeBottomLoading();
                if (clear) {
                    self.scrollview.scrollTo("top");
                }
            });
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            this.refreshPage();
        },
        touchBottom: function() {
            this.getOnePage();
        },

        //私有逻辑
        pageSize: 10,
        createItem: function(item) {
            var editable = 0;
            if (amGloble.metadata.userInfo.userType == 1 && item.empId == amGloble.metadata.userInfo.userId) {
                editable = 1;
            } else if (amGloble.metadata.userInfo.userType == 0) {
                var shops = amGloble.metadata.shops;
                if (shops) {
                    for (var s = 0; s < shops.length; s++) {
                        if (item.shopId == shops[s].shopId) {
                            editable = 1;
                            break;
                        }
                    }
                }
            }
            var $li = self.$li.clone(true, true);

            var type = "";
            if (item.empLevelName) {
                type = "<span class='type'>" + item.empLevelName + "</span>";
            }

            //美发师名字级别
            $li.find(".userName").html(item.empName + type);

            //头像
            var $head;
            if (item.empType != 1) {
                // if (amGloble.metadata.configs && amGloble.metadata.configs.v4_tenantLogo) {
                //     $head = amGloble.photoManager.createImage("tenantLogo", {
                //         parentShopId: amGloble.metadata.userInfo.parentShopId
                //     }, amGloble.metadata.configs.v4_tenantLogo);
                // }
                $head = amGloble.photoManager.createImage("manager", {
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                }, item.empId + ".jpg", "s");
            } else {
                $head = amGloble.photoManager.createImage("artisan", {
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                }, item.empId + ".jpg", "s");
            }

            if ($head) {
                $li.find(".userHeader").empty().append($head);
            } else {
                $li.find(".userHeader").empty();
            }

            //门店和发布时间
            $li.find(".store").html(amGloble.getStoresById(item.shopId).shopFullName);
            $li.find(".postTime").html(amGloble.time2str(Math.round(item.createTime / 1000)));

            //描述
            $li.find(".text").html(item.title);
            if (item.price) {
                $li.find(".price").css("display", "inline-block").html("门店价：￥" + item.price);
            } else {
                $li.find(".price").hide();
            }

            if (!item.visible) {
                $li.find(".mykVisible").text("待审核");
            }
            //图片列表
            var $photos = $li.find(".photos").empty();
            var photos = item.photo.split(",");
            $.each(photos, function(j, itemj) {
                var w = Math.floor(($(".am-widthLimite").width() - 80) / 3);
                if (itemj) {
                    var $img = amGloble.photoManager.createImage("show", {
                        catigoryId: item.type,
                        parentShopId: item.parentShopId,
                        authorId: item.empId
                    }, itemj, "s");
                    $photos.append($("<li class='am-clickable'></li>").css({
                        width: w,
                        height: w
                    }).append($img));
                }
            });

            if (photos.length == 1) {
                $photos.addClass("onlyOne");
            }

            //赞和分享次数

            if (localStorage.getItem("like" + item.id)) {
                $li.find(".like").addClass("am-disabled").html(item.likes || 0);
            } else {
                $li.find(".like").html(item.likes || 0);
            }

            $li.find(".share").html(item.shares || 0);
            //预约按钮
            //if (!item.empAvailable) {
            $li.find(".reseration").hide();
            //}
            if (editable) {
                if (item.visible) {
                    $li.find(".comment").text("取消审核");
                } else {
                    $li.find(".comment").text("审核");
                }
                if (amGloble.metadata.userInfo.userType == 1) {
                    $li.find(".comment").hide();
                }
            } else {
                $li.find(".complain").hide();
                $li.find(".comment").hide();
            }


            //评论列表

            var $comments = $li.find(".commentsList").empty();
            if (item.inventionEvaluations && item.inventionEvaluations.length) {
                $.each(item.inventionEvaluations, function(j, itemj) {
                    var $cli = self.$commentLi.clone(true, true);
                    var delBtn = "";
                    if (editable) {
                        delBtn = '<span class="am-clickable del">删除</span>';
                    }

                    $cli.html('<span class="name">' + itemj.memName + '：</span>' + itemj.content + delBtn);
                    $cli.data("item", itemj);
                    $comments.append($cli);
                });
            } else {
                $comments.hide();
            }
            //新手指引

            if(this.EMP){
                $li.find('.actions').addClass('audit');
            }else{
                $li.find('.actions').removeClass('audit');
            }

            $li.data("item", item);
            return $li;
        },
        appendList: function(list) {
            var self = this;
            var $ul = this.$ul;
            if (list && list.length) {
                $.each(list, function(i, item) {
                    $ul.append(self.createItem(item));
                });
            }

            if ($ul.is(":empty")) {
                self.setStatus("empty");
                self.$empty.addClass("listEmpty");
            } else {
                self.setStatus("normal");
            }

            self.refresh();
        },
        getData: function(opt, scb) {
            amGloble.api.inventionList.exec($.extend({
                tenantId: amGloble.metadata.tenantId
            }, opt), function(ret) {
                if (ret.code == 0) {
                    console.log(ret);
                    scb && scb(ret);
                } else {
                    if (self.$ul.children(":not(.empty)").length) {
                        amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                    } else {

                    }
                    scb && scb({
                        code: -1,
                        msg: ""
                    });
                }
            });
        },
        getTypes: function() {
            var self = this;
            this.setStatus("loading");
            var opt = {};
            if(this.EMP){
                opt.empId = this.EMP.EMPID;
                opt.shopIds = [this.EMP.shopId];
                opt.period = this.getPeriod(this.EMP.time);
            }else {
                var tab = this.$filter.index(this.$filter.filter(".selected"));
                if (tab) {
                    if (amGloble.metadata.userInfo.userType == 1) {
                        opt.empId = amGloble.metadata.userInfo.userId;
                    } else if (amGloble.metadata.userInfo.userType == 0) {
                        var shops = amGloble.metadata.shops;
                        if (shops) {
                            opt.shopIds = [];
                            for (var s = 0; s < shops.length; s++) {
                                opt.shopIds.push(shops[s].shopId);
                            }
                        }
                    }
                }
            }
            amGloble.api.inventionSubTypes.exec(opt, function(ret) {
                if (ret.code == 0) {
                    if (ret.content.length) {
                        typePicker.render(ret.content);
                    } else {
                        self.setStatus("empty");
                        self.$empty.removeClass("listEmpty");
                    }
                } else {
                    self.setStatus("error");
                    self.$error.removeClass("listError");
                }
            });
        }
    });
})();
