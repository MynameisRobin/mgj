(function() {


    var self = amGloble.page.reportStandard = new $.am.Page({
        id: "page-reportStandard",
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

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
                // enableDept: true, //是否启用部门选择器
                // enableLevel: true, //是否启用部门选择器
                onDatePickerClick: function() {
                    if (self.isLandscape) {
                        self.$right.trigger("vclick");
                    }
                },
                onchange: function() { //条件修改时触发
                    console.log("onchange");
                    self.getData();
                }
            });

            //点击事件特殊处理
            this.$dv.on("vclick", "span.am-clickable", function() {
                var idx = $(this).data("index");
                $.am.changePage(amGloble.page.reportSecondary, "slideleft", {
                    content: self.data.others[idx],
                    title: "明细"
                });
            })


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
                disableFilter: false,
                enableCategory: false,
                selectTime: false
            };
            switch (paras.report.filter) {
                case "dept":
                    opt.enableDept = true;
                    break;
                case "showCategory":
                    opt.enableCategory = true;
                    break;
                case "level":
                    opt.enableLevel = true;
                    break;
                case "selectTime":
                    opt.selectTime = true;
                    break;
                case "none":
                    opt.disableFilter = true;
                    break;
                default:
            }
            this.reportFilter.setOpt(opt);

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
            var shops = this.paras.shops || amGloble.metadata.shops;
            var user = amGloble.metadata.userInfo;
            var filter = this.reportFilter.getValue();
            // console.log(filter);
            var range = filter.range;
            var dept = filter.dept;
            var level = filter.level;
            var category = this.reportFilter.getCategory();
            var timer = filter.time;

            var opt = {
                "period": range[0].format("yyyy-mm-dd") + "_" + range[1].format("yyyy-mm-dd"),
                "depcode": dept.code,
                "dutytype": level.id
            };
            if (shops.length) {
                opt.shopids = amGloble.getKeyArr(shops, "shopId", true);
            } else {
                opt.shopid = shops.shopId;
            }
            //如果是员工，增加员工id
            if (user.userType == 1) {
                opt.empid = user.userId;
            }
            if (timer) {
                opt.time = timer.id;
            }
            if (report.filter) {
                if (report.filter == "showCategory") {
                    opt.filter = {
                        "category": category.id
                    };
                }
            }
            if (report.paramsFilter) {
                report.paramsFilter(opt);
            }
            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api[report.apiName].exec(opt, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    // console.log(ret);
                    if (ret.content && ret.content.data.length) {
                        self.setStatus("normal");
                        if (report.dataProcessor) {
                            var data = report.dataProcessor(ret.content);
                            self.$dv.rldataviewer(data);
                            self.data = data;
                            if(report.apiName=='rpt_turnover'){
                                self.calCustomerAverage();
                            }
                        } else {
                            self.$dv.rldataviewer(ret.content);
                            if(report.apiName=='rpt_turnover'){
                                self.calCustomerAverage();
                            }
                        }
                    } else {
                        self.setStatus("empty");
                    }
                } else {
                    self.setStatus("error");
                }

            });
        },
        calCustomerAverage:function(){
            var $tr = $('.mgj_dataviewer_tbody tbody tr:last-child'),
                $tds = $tr.find('td');
            var total = 0;
            for(var i=0;i<$tds.length;i++){
                if(i<=10 && i>=2 && i!=3 && i!=6){
                    var val = $($tds[i]).find('div').text() *1 || 0;
                    console.log(val);
                    total += val;
                }
            }

            var $topTr = $('.mgj_dataviewer_fixedTop thead tr:first-child'),
                $ths = $topTr.find('th');
            var col = 0;
            for(var i=0;i<$ths.length;i++){
                if($($ths[i]).find('div').text()=='劳动业绩'){
                    col = $($ths[i]).attr('colspan') * 1 + 2;
                    var customerNum = $tds.eq(col).find('div').text() *1 || 0;
                    var average = 0;
                    if(customerNum){
                        average = (Math.round((total/customerNum)*10)/10).toFixed(1);
                    }
                    $tds.eq(col+1).find('div').text(average);
                    return;
                }
            }
        }
    });
})();
