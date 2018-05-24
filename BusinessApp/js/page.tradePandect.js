(function() {
    var self = amGloble.page.tradePandect = new $.am.Page({
        id: "page-tradePandect",
        init: function() {
            var self = this;
            this.$tab = this.$.find(".tab").empty();
            this.$main = this.$.find(".am-body-inner");

            this.$tab.on("vclick", "li", function() {
                var $this = $(this);
                var idx = $this.index();
                $this.addClass("selected").siblings().removeClass("selected");
                self.$main.children().hide().eq(idx).show();
                self.refresh();
            });

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"),
                onchange: function() {
                    console.log("onchange");
                    self.getData();
                }
            });

        },
        beforeShow: function(ret) {
            this.reportFilter.setOpt();
        },
        afterShow: function(paras) {

            console.log(paras);
            this.paras = paras;
            this.getData();
        },
        beforeHide: function() {},
        render: function(data) {
            this.$tab.empty();
            for (var i = 0; i < data.length; i++) {
                var block = data[i];
                //渲染头部tab
                this.$tab.append($('<li class="am-clickable">' + block.title + '</li>'));

            }
            var fixNum=0;//保留小数
            this.$tab.children(":first").trigger("vclick");
            var $conBox = this.$.find(".commoncashTab");
            //渲染内容 第一个和第二个
            for (var i = 0; i < 2; i++) {
                $conBox.eq(i).find(".totalMoney").text(data[i].data[0].data[0].value.toFixed(fixNum));
                $conBox.eq(i).find(".totalWords").text(data[i].data[0].data[0].key);
                var $li = $conBox.eq(i).find(".listBox").find("ul").find("li");
                for (var j = 0; j < $li.size(); j++) {
                    if(j<data[i].data[0].data.length-1){
                        $li.eq(j).find(".key").text(data[i].data[0].data[j + 1].key);
                        $li.eq(j).find(".value").text(data[i].data[0].data[j + 1].value.toFixed(fixNum));
                    }else{
                        $li.eq(j).hide();
                    }
                    
                }
            }
            //渲染第三个
            $conBox.eq(2).find(".header_left").find(".key").text(data[2].data[0].data[0].key);
            $conBox.eq(2).find(".header_left").find(".value").text(data[2].data[0].data[0].value.toFixed(fixNum));
            $conBox.eq(2).find(".header_right").find(".key").text(data[2].data[0].data[1].key);
            $conBox.eq(2).find(".header_right").find(".value").text(data[2].data[0].data[1].value.toFixed(fixNum));
            // var pre=((data[2].data[0].data[2].value*1/(data[2].data[0].data[1].value*1)).toFixed(2))*100;
            $conBox.eq(2).find(".lineImg").find(".key").text(data[2].data[0].data[6].key);
            $conBox.eq(2).find(".lineImg").find(".image").find("span").css("width", data[2].data[0].data[6].value + "%");
            $conBox.eq(2).find(".lineImg").find(".value").text(data[2].data[0].data[6].value + "%");
            var $threeLi = $conBox.eq(2).find(".totalList").find("li");
            $threeLi.each(function(i, value) {
                $(value).find(".key").text(data[2].data[0].data[i + 2].key);
                $(value).find(".value").text(data[2].data[0].data[i + 2].value.toFixed(fixNum));
            });
            //渲染第四个
            $conBox.eq(3).find(".header_left").find(".key").text(data[3].data[0].data[0].key);
            $conBox.eq(3).find(".header_left").find(".value").text(data[3].data[0].data[0].value.toFixed(fixNum));
            $conBox.eq(3).find(".header_right").find(".key").text(data[3].data[0].data[1].key);
            $conBox.eq(3).find(".header_right").find(".value").text(data[3].data[0].data[1].value.toFixed(fixNum));

            var $fourLi = $conBox.eq(3).find(".totalListBox").find("li");
            for (var i = 0; i < $fourLi.size(); i++) {
                var fourPre;
                if(data[3].data[0].data[0].value){
                    fourPre = ((data[3].data[0].data[i + 2].value / data[3].data[0].data[0].value) * 100).toFixed(fixNum);
                }else{
                    fourPre =0;
                }

                $fourLi.eq(i).find(".key").text(data[3].data[0].data[i + 2].key);
                $fourLi.eq(i).find(".value").text(data[3].data[0].data[i + 2].value.toFixed(fixNum));
                $fourLi.eq(i).find(".img").find("span").css("width", fourPre + "%");
                $fourLi.eq(i).find(".pre").text(fourPre + "%");
            }
            //渲染第五个
            var $fiveBox=$conBox.eq(4);
            $fiveBox.find(".header_con").find(".total").text(data[4].data[0].data[12].value.toFixed(fixNum));
            $fiveBox.find(".header_con").find(".words").text(data[4].data[0].data[12].key);

            var $fiveli=$fiveBox.find("ul").find("li");
            $fiveli.eq(0).find(".key").text(data[4].data[0].data[0].key);
            $fiveli.eq(0).find(".value").text(data[4].data[0].data[0].value.toFixed(fixNum));

            $fiveli.eq(1).find(".key").text(data[4].data[0].data[4].key);
            $fiveli.eq(1).find(".value").text(data[4].data[0].data[4].value.toFixed(fixNum));

            $fiveli.eq(2).find(".key").text(data[4].data[0].data[1].key);
            $fiveli.eq(2).find(".value").text(data[4].data[0].data[1].value.toFixed(fixNum));

            $fiveli.eq(3).find(".key").text(data[4].data[0].data[5].key);
            $fiveli.eq(3).find(".value").text(data[4].data[0].data[5].value.toFixed(fixNum));

            $fiveli.eq(4).find(".key").text(data[4].data[0].data[2].key);
            $fiveli.eq(4).find(".value").text(data[4].data[0].data[2].value.toFixed(fixNum));

            $fiveli.eq(5).find(".key").text(data[4].data[0].data[6].key);
            $fiveli.eq(5).find(".value").text(data[4].data[0].data[6].value.toFixed(fixNum));

            $fiveli.eq(6).find(".key").text(data[4].data[0].data[3].key);
            $fiveli.eq(6).find(".value").text(data[4].data[0].data[3].value.toFixed(fixNum));

            $fiveli.eq(7).find(".key").text(data[4].data[0].data[7].key);
            $fiveli.eq(7).find(".value").text(data[4].data[0].data[7].value.toFixed(fixNum));

            $fiveli.eq(8).find(".key").text(data[4].data[0].data[10].key);
            $fiveli.eq(8).find(".value").text(data[4].data[0].data[10].value.toFixed(fixNum));

            $fiveli.eq(9).find(".key").text(data[4].data[0].data[8].key);
            $fiveli.eq(9).find(".value").text(data[4].data[0].data[8].value.toFixed(fixNum));

            $fiveli.eq(10).find(".key").text(data[4].data[0].data[11].key);
            $fiveli.eq(10).find(".value").text(data[4].data[0].data[11].value.toFixed(fixNum));

            $fiveli.eq(11).find(".key").text(data[4].data[0].data[9].key);
            $fiveli.eq(11).find(".value").text(data[4].data[0].data[9].value.toFixed(fixNum));

        },
        getData: function() {
            var self = this;
            var report = this.paras.report;
            var shops = this.paras.shops || amGloble.metadata.shops;
            var user = amGloble.metadata.userInfo;
            var range = this.reportFilter.getValue().range;

            var opt = {
                "period": range[0].format("yyyy-mm-dd") + "_" + range[1].format("yyyy-mm-dd"),
                "depcode": "-1"
            }
            if (shops.length) {
                opt.shopids = amGloble.getKeyArr(shops, "shopId",true);
            } else {
                opt.shopid = shops.shopId;
            }

            amGloble.loading.show("正在加载,请稍候...");
            amGloble.api[report.apiName].exec(opt, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    console.log(ret);
                    self.render(ret.content);
                } else {
                    amGloble.msg("数据加载失败,点击重试!");
                }

            });
        }
    });


})();
