(function() {


    var self = amGloble.page.reportWithDraw = new $.am.Page({
        id: "page-reportWithDraw",
        disableScroll: 1,
        init: function() {
            var self = this;

            this.$title = this.$header.find("h1");
            this.$store = this.$header.find("p");

            this.$right = this.$header.find(".am-header .right").vclick(function() {
                amGloble.rotate(!self.isLandscape, function() {
                    self.$dv.rldataviewer("refresh");
                });
                self.isLandscape = !self.isLandscape;
            });

            this.$dv = this.$.find(".mainTable");

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
                // enableDept: true, //是否启用部门选择器
                // enableLevel: true, //是否启用部门选择器
                onDatePickerClick: function() {
                    if(self.isLandscape){
                        self.$right.trigger("vclick");
                    }
                },
                onchange: function() { //条件修改时触发
                    console.log("onchange");
                    self.getData();
                }
            });

            //点击事件特殊处理
            // this.$dv.on("vclick", "span.am-clickable", function() {
            //     var idx = $(this).data("index");
            //     $.am.changePage(amGloble.page.reportSecondary, "slideleft", {
            //         content: self.data.others[idx],
            //         title: "明细"
            //     });
            // })


            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                self.getData();
            });

        },
        beforeShow: function(paras) {
            if (paras == "back") {
                return;
            }
            var opt = {
                enableDept: false,
                enableLevel: false,
                disableFilter: false
            };
            this.reportFilter.setOpt(opt);

            console.log(paras);
            this.paras = paras;
            this.render();
            //amGloble.loading.show("正在加载,请稍候...");
        },
        afterShow: function(paras) {
            if (paras == "back") {
                return;
            }
            this.getData();
        },
        beforeHide: function() {
            amGloble.rotate();
            self.isLandscape = false;
        },
        render: function() {

            self.$dv.empty();
        },
        getData: function() {
            var self = this;
            var user = amGloble.metadata.userInfo;
            var filter = this.reportFilter.getValue();

            var range = filter.range;


            var opt = {
                "period": range[0].format("yyyy-mm-dd") + "_" + range[1].format("yyyy-mm-dd"),
                //"period": new Date("2016-04-03").format("yyyy-mm-dd") + "_" + range[1].format("yyyy-mm-dd"),
                "parentShopId": user.parentShopId
            };

            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api.getWithdrawHistory.exec(opt, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    // console.log(ret);
                    if (ret.content.data && ret.content.data.length) {
                        self.setStatus("normal");
                        self.$dv.rldataviewer(ret.content);
                        // if (report.dataProcessor) {
                        //     var data = report.dataProcessor(ret.content);
                        //     self.$dv.rldataviewer(data);
                        //     self.data = data;
                        // } else {
                        //     self.$dv.rldataviewer(ret.content);
                        // }
                    } else {
                        self.setStatus("empty");
                    }
                } else {
                    self.setStatus("error");
                }

            });
        }
    });



})();
