(function() {


    var self = amGloble.page.promotionReport = new $.am.Page({
        id: "page-promotionReport",
        disableScroll: 1,
        init: function() {
            var self = this;

            this.$title = this.$header.find("h1");
            this.$store = this.$header.find("p");

            this.$right = this.$header.find(".right").vclick(function() {
                amGloble.rotate(!self.isLandscape, function() {
                    self.$dv.rldataviewer("refresh");
                });
                self.isLandscape = !self.isLandscape;
            });

            this.$dv = this.$.find(".mainTable");

            var years = [];
            var thisYear = amGloble.now().format("yyyy") * 1;
            for (var i = 2010; i <= thisYear; i++) {
                years.push(i);
            }
            this.$modifyBtn = this.$.find(".c-reportFilter-year");
            this.$modifyBtn.mobiscroll().scroller({
                theme: 'mobiscroll',
                display: 'bottom',
                lang: 'zh',
                rows: 3,
                wheels: [
                    [{
                        circular: false,
                        data: years,
                        label: '选择年份'
                    }]
                ],
                showLabel: true,
                minWidth: 130,
                cssClass: 'md-pricerange',
                onSet: function(valueText, inst) {
                    console.log(valueText.valueText);
                    self.$modifyBtn.text(valueText.valueText);
                    self.getData();
                }
            });
            this.$modifyBtn.text(thisYear);
            this.$modifyBtn.mobiscroll("setVal","2016");



            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                self.getData();
            });

        },
        beforeShow: function(paras) {
            if (paras == "back") {
                return;
            }

            console.log(paras);
            this.paras = paras;
            this.render();
            amGloble.loading.show("正在加载,请稍候...");
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
            var report = this.paras.report;
            var shops = this.paras.shops;
            var user = amGloble.metadata.userInfo;

            this.$title.text(report.name);
            if (user.userType == 1) {
                this.$store.text(user.userName);
            } else {
                if (shops) {
                    this.$store.text(shops.shopFullName);
                } else {
                    this.$store.text('-全部门店-');
                }
            }

            self.$dv.empty();
        },
        getData: function() {
            var self = this;
            var report = this.paras.report;
            var user = amGloble.metadata.userInfo;

            var opt = {
                "period": this.$modifyBtn.html(),
                "userType": user.userType,
                "userId": user.userId,
            };
            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api[report.apiName].exec(opt, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    // console.log(ret);
                    if (ret.content && ret.content.data.length) {
                        self.setStatus("normal");
                        self.$dv.rldataviewer(ret.content);
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
