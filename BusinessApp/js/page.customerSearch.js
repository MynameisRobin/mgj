(function() {

    var self = amGloble.page.customerSearch = new $.am.Page({
        id: "page-customerSearch",
        init: function() {
            var self = this;

            this.$key = this.$.find(".searchBox input").change(function() {
                self.resetList();
            });
            this.$searchBtn = this.$.find(".searchBox .searchBtn").vclick(function() {
                var val = self.$key.val();
                if (!$.trim(val)) {
                    amGloble.msg("请输入搜索关键字");
                    return;
                }
                self.getData();
            });

            //滚动加载

            this.$ul = this.$.find(".c-custList").on("vclick", "li", function() {
                var $this = $(this);
                var item = $this.data("item");

                $.am.changePage(amGloble.page.customerDetail, "slideleft", {
                    custId: item.id,
                    shopid: item.shopid,
                    $li: $this
                });
            });
            this.$li = this.$ul.find(":first").remove();

        },

        beforeShow: function(paras) {
            if (paras == "back") {
                return false;
            }
            this.reseAll();
        },

        afterShow: function(paras) {
            if (paras == "back") {
                return false;
            }
        },
        reseAll: function() {
            this.$key.val("");
            this.$ul.empty();
        },
        resetList: function() {
            this.$ul.empty();
        },
        getData: function(animation) {
            var self = this;

            var key = this.$key.val();

            if (this.$ul.is(":empty")) {
                this.setStatus("loading");
            }

            this.loading = true;

            var user = amGloble.metadata.userInfo;
            amGloble.api.customerQuerCusts.exec({
                "type": 0,
                "key": key,
                "empid": user.userId,
                "shopIds": amGloble.getKeyArr(amGloble.metadata.shops, "shopId", true, true).join(","),
                "userType": user.userType, // 1 管理员 0 员工
                "pageNumber": 0,
                "pageSize": 99
            }, function(ret) {
                self.loading = false;
                self.setStatus("normal");
                if (ret.code == 0) {
                    console.log(ret);
                    var data = ret.content;

                    self.render(data);
                    self.closeBottomLoading();
                } else {
                    amGloble.msg("数据加载失败,点击重试!");
                }

            });

        },
        render: function(data) {
            var self = this;
            var $ul = this.$ul.empty();

            if (data && data.length) {
                $.each(data, function(i, item) {
                    $ul.append(amGloble.page.customerGrouping.createCustItem(item));
                });
            }

            if ($ul.is(":empty")) {
                this.setStatus("empty");
            }
            self.refresh();
        }
    });

})();
