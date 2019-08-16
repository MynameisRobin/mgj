/**
 * 客服工单详情
 */
am.workOrderDetail = {
    init: function() {
        var self = this;
        this.flag = false;
        this.$ = $("#workOrderDetail");
        this.content = new $.am.ScrollView({
            $wrap: this.$.find(".listBox"),
            $inner: this.$.find(".list"),
            direction: [false, true],
            hasInput: false
        });
        this.content.refresh();
        this.$.find(".close").vclick(function() {
            self.$.hide();
        });
        this.$.find(".clickEvaluate").vclick(function() {
            self.$.hide();
            var data = {
                id: self.id
            };
            $("#page_evaluate")
                .find(".warp li")
                .removeClass("active");
            $.am.changePage(am.page.evaluate, "slideup", data);
        });
        this.$.find(".footer-solve .btn").vclick(function() {
            self.resolveFn(self.id);
        });
        this.$.find(".listBox").on("vclick", ".imgs ul li img", function() {
            var data = $(this).attr("src");
            am.viewImgModal.show(data);
            // var items = [];
            // var idx = $(this).index();
            // $(this)
            //     .parent()
            //     .find("img")
            //     .each(function() {
            //         items.push({
            //             src: $(this).attr("src"),
            //             // src: $(this).attr("src").replace("_s", "_l"),
            //             w: 1024,
            //             h: 1024
            //         });
            //     });
            // self.pswpTimer && clearTimeout(self.pswpTimer);
            // am.loading.show();
            // self.pswpTimer = setTimeout(function() {
            //     am.loading.hide();
            //     am.pswp(items, idx);
            // }, 800);
        });
    },
    show: function(id) {
        if (!this.$) {
            this.init();
        }
        this.id = id;
        this.getData(this.id);
        this.$.show();
        this.content.refresh();
    },
    hide: function() {
        this.$.hide();
    },
    formatDate: function(time) {
        if (!time) {
            return "";
        }
        return new Date(time).format("yyyy.mm.dd HH:MM");
    },
    middle: function(dom,num) {
        var d = dom.outerHeight();
        dom.css({
            marginTop: -(d / 2)-num
        });
    },
    getLi: function(d) {
        var self = this;
        var li = "";
        var operaterName = d.operaterName ? d.operaterName : am.metadata.userInfo.userName;
        li += "<li>";
        li += '<div class="img">我</div>';
        li += '<div class="info">';
        li += '<div class="title-info">';
        li += "<span style='margin-right:10px;'>" + operaterName + "</span>";
        li += "<span>" + self.formatDate(d.createTime) + "</span>";
        li += "</div>";
        li += '<div class="content-info">';
        li += self.getEvaluate(d.info);
        li += "</div>";
        li += "</div>";
        li += "</li>";
        return li;
    },
    getRedLi: function(d) {
        var self = this;
        var li = "";
        li += "<li>";
        li += '<div class="img red">客服</div>';
        li += '<div class="info">';
        li += '<div class="title-info">';
        li += "<span style='margin-right:10px;'>" + (d.operaterName || "") + "</span>";
        li += "<span>" + self.formatDate(d.createTime) + "</span>";
        li += "</div>";
        li += '<div class="content-info">';
        li += self.getEvaluate(d.info);
        li += "</div>";
        if (d.pictures) {
            li += '<div class="imgs">';
            li += "<ul>";
            $.each(d.pictures, function(i, v) {
                li += "<li>";
                li += '<img class="am-clickable" src="' + "http://img.meiguanjia.net/admin/workorder/" + v + '" alt="">';
                li += "</li>";
            });
            li += "</ul>";
            li += "</div>";
        }

        li += "</div>";
        li += "</li>";

        return li;
    },
    getEvaluate: function(d) {
        if (am.isNull(d)) {
            return "";
        }
        var str = d.substr(0, 2);
        if (str == "好评") {
            return "<span class='iconfont icon-haoping' style='margin-right:5px; color:#ffbd3e;'></span>好评";
        } else if (str == "中评") {
            return "<span class='iconfont icon-zhongping' style='margin-right:5px;color:#ffbd3e;'></span>中评";
        } else if (str == "差评") {
            return "<span class='iconfont icon-chaping1' style='margin-right:5px;color:#ffbd3e;'></span><span style='color:#e82742;'>" + d + "</span>";
        } else if (str == "结单") {
            return "<span style='color:#15A216;'>结单</span>";
        }
        return d;
    },
    resolveFn: function(id) {
        var self = this;
        am.loading.show("正在结单,请稍候...");
        var opt = {
            id: id,
            status: 2
            // endTime: new Date().getTime()
        };
        am.api.workUpdate.exec(opt, function(res) {
            am.loading.hide();
            if (res.code == 0) {
                am.msg("结单成功");
                self.getData(id);
                self.$.find(".clickEvaluate").trigger("vclick");
            } else {
                am.msg(res.message || "结单失败，请稍后再试");
            }
        });
    },
    getData: function(id) {
        var self = this;
        self.$.find(".list").html("");
        am.loading.show("正在查询,请稍候...");
        var opt = {
            id: id
        };
        am.api.workProcess.exec(opt, function(res) {
            am.loading.hide();
            if (res.code == 0) {
                var num = 0;
                var flag = false;
                if (am.isNull(res.content)) {
                    self.$.find(".footer-solve").hide();
                    self.$.find(".footer-evaluate").hide();
                    return;
                }
                if(res.content.first_category >= 0 && res.content.problem_category >= 0 && res.content.second_category >= 0){
                    flag = true;
                }
                if (res.content.status == 2) {
                    num = 55;
                    self.$.find(".footer-solve").hide();
                    self.$.find(".footer-evaluate").show();
                } else {
                    num = 0;
                    self.$.find(".footer-solve").hide();
                    self.$.find(".footer-evaluate").hide();
                }
                self.$.find("h2").html(res.content.description);
                self.$.find(".workOrderId").html(res.content.id);
                self.$.find(".createTime").html(self.formatDate(res.content.createTime));
                $.each(res.content.workOrderProcess, function(i, v) {
                    if(!v.internalinfo){
                        if (v.operaterName) {
                            self.$.find(".list").append(self.getRedLi(v));
                        } else {
                            self.$.find(".list").append(self.getLi(v));
                        }
                    }
                });
                if(res.content.status == 1){
                    num = 55;
                    self.$.find(".footer-solve").show();
                    self.$.find(".footer-evaluate").hide();
                    if (!flag) {
                        num = 0;
                        self.$.find(".footer-solve").hide();
                        self.$.find(".footer-evaluate").hide();
                    }
                }
                self.middle(self.$.find(".inner"),num);
            } else {
                am.msg(res.message || "查询失败，请稍后再试");
            }
            self.content.refresh();
            self.content.scrollTo("top");
        });
    }
};
