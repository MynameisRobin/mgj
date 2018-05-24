(function() {

    var self = amGloble.page.auxiliary = new $.am.Page({
        id: "page-auxiliary",
        init: function() {
            var self = this;

            this.$.find('.grade-cont li').vclick(function() {
                var _li = $(this);
                if (_li.hasClass('on')) return;

                atMobile.nativeUIWidget.confirm({
                    caption: "系统提示",
                    description: "此操作将可能影响系统的正常运行，请在美管加销售或者客服的指导下使用，确定优化么？",
                    okCaption: "是",
                    cancelCaption: "否"
                }, function() {
                    if (_li.index() == 0) {
                        var _level = 1;
                    } else {
                        var _level = _li.index() + 2;
                    }
                    amGloble.loading.show("正在提交,请稍候...");
                    amGloble.api.shopReducescale.exec({
                        reducescale: _level,
                        shopIds: amGloble.getKeyArr(amGloble.metadata.shops, "shopId", true)
                    }, function(ret) {
                        amGloble.loading.hide();
                        if (ret.code == 0 && ret.message == "success") {
                            amGloble.msg("修改成功!");
                            $.each(amGloble.metadata.shops, function(i, item) {
                                item.reducescale = _level;
                            })
                            self.render();
                        } else {
                            amGloble.msg(ret.message || "数据获取失败,请重试!");
                        }
                    });
                }, function() {});
            });
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }
            this.render();
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        render: function() {
            var reducescale = amGloble.metadata.shops[0].reducescale || 1;
            reducescale = reducescale > 10 ? 10 : reducescale;
            reducescale = reducescale == 2 ? 3 : reducescale;
            if (reducescale == 1) {
                this.$.find('.grade-tit span').html("未优化");
                this.$.find('.grade-cont li').eq(0).addClass('on').siblings('li').removeClass('on');
            } else {
                this.$.find('.grade-tit span').html(reducescale + "级");
                this.$.find('.grade-cont li').eq(reducescale - 2).addClass('on').siblings('li').removeClass('on');
            }
        }
    });

})();
