(function() {


    var self = amGloble.page.userinfo = new $.am.Page({
        id: "page-userinfo",
        init: function() {
            this.$logout = this.$.find('.logout').vclick(function(){
                atMobile.nativeUIWidget.confirm({
                    caption: "退出登录",
                    description: "您将退出当前登录用户，是否继续？",
                    okCaption: "是",
                    cancelCaption: "否"
                }, function() {
                    $.am.changePage(amGloble.page.login, "slideright", "logout");
                }, function() {});
            });
            
            this.$c = this.$.find(".am-body-inner").on("vclick", "li:not(.stop)", function() {
                var $this = $(this);
                $.am.changePage(amGloble.page.userinfoEditor, "slideleft", {
                    key: $this.attr("data-key"),
                    cValue: $this.attr("data-cvalue")
                });
            });
            this.$lis = this.$c.find("li").hide();
            this.$lis.filter("[data-key=header]").vclick(function() {
                var user = amGloble.metadata.userInfo;
                var $this = $(this);
                var type = user.userType == 1 ? "artisan" : "manager";
                amGloble.photoManager.takePhoto(type, {
                    parentShopId: user.parentShopId,
                    employeeId: user.userId
                }, function() {
                    // console.log("succ");
                    $this.find(".photo").html(amGloble.photoManager.createImage(type, {
                        parentShopId: user.parentShopId,
                        updateTs: amGloble.now().getTime()
                    }, user.userId + ".jpg", "s"));
                    user.lastphotoupdatetime = amGloble.now().getTime();
                }, function() {
                    // console.log("fail");
                });
            });

            this.$lis.filter("[data-key=password]").vclick(function() {
                var user = amGloble.metadata.userInfo;
                $.am.changePage(amGloble.page.userinfoResetPwd, "slideleft", {
                    phone: user.mobile,
                    shopId: user.shopId,
                    userId: user.userId,
                    userType: user.userType
                });
            });

            this.$shareTop = this.$header.children(".share").vclick(function() {
                self.share();
            });

            this.$shareBottom = this.$.find(".page-shareButton").vclick(function() {
                //已改造成打开个人主页的功能
                // self.share();
                var user = amGloble.metadata.userInfo;
                window.open(config.shareRoot + $.param({
                    tenantId: user.parentShopId,
                    view: 6,
                    modelId: user.userId
                }), '_blank', 'location=no');
            });

            //log开关

            var timeArr = [];

            var compareTime = function(time1, time2) {
                return time2 / 1000 - time1 / 1000;
            };

            this.$name = this.$header.find('.title').vclick(function() {

                var nowTime = new Date().getTime();
                timeArr.push(nowTime);
                var difference = compareTime(timeArr[0], nowTime);
                if (difference < 4) { //时差在3秒内
                    if (timeArr.length > 9) { //点击了10次
                        timeArr.length = 0;
                        atMobile.nativeUIWidget.confirm({
                            caption: "工程模式",
                            description: "是否进入工程模式，可能会让你的APP挂掉，你怕不怕？怕不怕？？",
                            okCaption: "老子要进",
                            cancelCaption: "我怕怕"
                        }, function() {

                            $.am.changePage(amGloble.page.engineering, "slideleft");

                        }, function() {

                        });

                    }
                } else { //时差大于3秒
                    timeArr.length = 0;
                }

            });

        },
        beforeShow: function(ret) {
            this.render();
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        share: function() {
            var user = amGloble.metadata.userInfo;
            var shareObj = {
                title: "你的时尚，我来护航。我是" + (user.levelName || "") + user.userName + "，我在" + user.hqName + user.osName + "等你！",
                link: config.shareRoot + $.param({
                    tenantId: user.parentShopId,
                    view: 6,
                    modelId: user.userId
                }),
                imgUrl: amGloble.photoManager.getPhotoUrl("artisan", {
                    parentShopId: user.parentShopId
                }, user.userId + ".jpg", "s")
            };


            amGloble.share(shareObj);
        },
        render: function() {
            var $lis = this.$lis;
            var user = amGloble.metadata.userInfo;
            var configs=amGloble.metadata.configs;
            if (user.userType) {
                this.$shareTop.show();
                this.$shareBottom.show();
                //员工
                $lis.filter("[data-key=header]").show().find(".value > .photo").html(amGloble.photoManager.createImage("artisan", {
                    parentShopId: user.parentShopId,
                    updateTs: user.lastphotoupdatetime
                }, user.userId + ".jpg", "s"));
                if (user.sex == "F") {
                    $lis.filter("[data-key=header]").find(".value > .photo").addClass("female");
                } else {
                    $lis.filter("[data-key=header]").find(".value > .photo").removeClass("female");
                }
                $lis.filter("[data-key=name]").show().attr("data-cvalue", user.userName).children(".value").html(user.userName);
                if(configs.staffHandle){//员工姓名是否可修改
                    var userHandle=JSON.parse(configs.staffHandle);
                    if(userHandle.notAllowedChangeEmployeeName!=1){
                        $lis.filter("[data-key=name]").addClass('am-clickable editAble');
                    }else{
                        $lis.filter("[data-key=name]").removeClass('am-clickable editAble');
                    }
                }
                $lis.filter("[data-key=code]").show().children(".value").html(user.code);
                $lis.filter("[data-key=phone]").show().children(".value").html(user.mobile);
                $lis.filter("[data-key=level]").show().children(".value").html(user.levelName);
                if(amGloble.metadata.configs.v4_barberfajiaList){
                    $lis.filter("[data-key=price]").show().find(".title").html(amGloble.metadata.configs.v4_barberfajiaList);

                }
                $lis.filter("[data-key=price]").show().attr("data-cvalue", user.cutPrice).children(".value").html(!user.cutPrice ? "<span class='red'>未设置</span>" : user.cutPrice);
                $lis.filter("[data-key=description]").show().attr("data-cvalue", user.bio).children(".value").html(!user.bio ? "<span class='red'>未设置</span>" : user.bio);
                $lis.filter("[data-key=password]").show();

                //tags
                if (user.tags) {
                    var tags = user.tags.split(",");
                    var htmlSnippet = [];
                    for (var i = 0; i < tags.length; i++) {
                        var tag = tags[i];
                        if (tag) {
                            htmlSnippet.push('<span class="tag">' + tag + '</span>');
                        }
                    }
                    // console.log(htmlSnippet);
                    $lis.filter("[data-key=tags]").show().attr("data-cvalue", user.tags).children(".value").html(htmlSnippet.join(""));
                } else {
                    $lis.filter("[data-key=tags]").show().children(".value").html("<span class='red'>未设置</span>");
                }

            } else {
                this.$shareTop.hide();
                this.$shareBottom.hide();
                //管理员
                $lis.filter("[data-key=header]").show().find(".value > .photo").html(amGloble.photoManager.createImage("manager", {
                    parentShopId: user.parentShopId,
                    updateTs: user.lastphotoupdatetime
                }, user.userId + ".jpg", "s"));
                if (user.sex == "F") {
                    $lis.filter("[data-key=header]").find(".value > .photo").addClass("female");
                } else {
                    $lis.filter("[data-key=header]").find(".value > .photo").removeClass("female");
                }
                $lis.filter("[data-key=name]").show().attr("data-cvalue", user.userName).children(".value").html(user.userName);
                $lis.filter("[data-key=phone]").show().children(".value").html(user.mobile);
                $lis.filter("[data-key=level]").show().children(".value").html(user.levelName);
                $lis.filter("[data-key=password]").show();
            }

        }
    });

})();
