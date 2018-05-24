
$(function() {

    amGloble.storeSelect = {
        init: function() {
            var self = this;
            //选择按钮
            this.$topBtns = $(".c-storeSelectBtn").vclick(function() {
                var disableAllStore = $(this).attr("data-disableAllStore") ? 1 : 0
                self.show({
                    disableAllStore: disableAllStore
                });
            });

            this.$ = $("#c-storeSelect").vclick(function() {
                self.hide();
            }).on("vclick", ".allStore", function() {
                self.selectShop();
            });

            this.$allStore = this.$.find(".allStore");

            // this.$ul = this.$.find(".list").on("vclick", "li", function() {
            //     self.scb && self.scb($(this).data("item"));
            //     self.hide();
            // });
            // this.$li = this.$ul.children(":first");

            this.scrollview = new $.am.ScrollView({
                $wrap: this.$.children(".c-storeSelect-inner"),
                $inner: this.$.find(".scrollInner"),
                direction: [0, 1]
            });

            this.$storeList = this.$.find(".storeList").on("vclick", "li", function() {
                self.selectShop($(this));
            });


            this.render();
        },
        render: function() {
            var shopsGroupByPinyin = amGloble.metadata.shopsGroupByPinyin;
            var $storeList = this.$storeList.empty();
            for (var i = 0; i < shopsGroupByPinyin.length; i++) {
                var item = shopsGroupByPinyin[i];

                var shops = item.shops;
                var $index = $('<div class="index">' + item.key + '</div>');
                var $ul = $('<ul class="subList"></ul>');
                for (var j = 0; j < shops.length; j++) {
                    var shop = shops[j];
                    var $li = $('<li class="am-clickable">' + ((shop.shopFullName==" "|| shop.shopFullName=="")?"门店名称未设定":shop.shopFullName) + '</li>');
                    $li.data("item", shop);
                    $ul.append($li);
                }
                $storeList.append($index).append($ul);
            }
            if (amGloble.metadata.userInfo.shopType == 0) {
                this.$topBtns.removeClass("am-disabled");
                this.selectShop();
            } else {
                this.$topBtns.addClass("am-disabled");
                this.selectShop($storeList.find("li:first"));
            }
        },
        selectShop: function($li, donotTriggerEvent) {
            var shop = null;
            this.$storeList.find(".subList > li.selected").removeClass("selected");
            if (typeof $li == "number") {
                $li = this.$storeList.find(".subList > li:eq(" + $li + ")");
            }
            if ($li && $li.length) {
                shop = $li.data("item");
                this.$topBtns.children(".text").text(shop.shopFullName);
                $li.addClass("selected");
            } else {
                this.$topBtns.children(".text").text("-全部门店-");
            }
            if (this.currentShop != shop) {
                this.currentShop = shop;
                if (!donotTriggerEvent) {
                    this.onShopChange && this.onShopChange(this.getCurrentShops());
                }
            }

            if (shop) {
                //如果是选择了门店

                //门店下有部门、角色，用门店下的，否则用总部的
                amGloble.metadata.currentDepts = shop.depts ? shop.depts : amGloble.metadata.depts;
                amGloble.metadata.currentRoles = shop.employeeRoles ? shop.employeeRoles : amGloble.metadata.employeeRoles;
            } else {
                //如果没有选择门店
                amGloble.metadata.currentDepts = amGloble.metadata.depts;
                amGloble.metadata.currentRoles = amGloble.metadata.employeeRoles;
            }
        },
        getCurrentShops: function() {
            return this.currentShop;
        },
        setCurrentShops: function(shop) {
            this.$storeList.find(".subList > li.selected").removeClass("selected");
            this.currentShop=shop;
            for(var i=0;i<this.$storeList.find(".subList > li").length;i++){
                var $li=$(this.$storeList.find(".subList > li")[i]);
                if($li.text()==shop.shopFullName){
                    $li.addClass("selected");
                    this.$topBtns.children(".text").text(shop.shopFullName);
                }
            }
            if (shop) {
                //如果是选择了门店
                //门店下有部门、角色，用门店下的，否则用总部的
                amGloble.metadata.currentDepts = shop.depts ? shop.depts : amGloble.metadata.depts;
                amGloble.metadata.currentRoles = shop.employeeRoles ? shop.employeeRoles : amGloble.metadata.employeeRoles;
            }
        },
        show: function(opt) {
            this.$topBtns.addClass("up");
            this.$.slideDown(200);
            this.scrollview.refresh();
            if (opt.disableAllStore) {
                this.$allStore.hide();
            } else {
                this.$allStore.show();
            }
        },
        hide: function() {
            this.$topBtns.removeClass("up");
            this.$.slideUp(200);
        }
    };


});
