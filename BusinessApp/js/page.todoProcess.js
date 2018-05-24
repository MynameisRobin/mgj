(function() {
    amGloble.page.todoProcess = new $.am.Page({

        id: "page_todoProcess",
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function() {
            var self = this;
            this.$text = this.$.find("#todoProcessText");
            this.$save = this.$.find(".submit").vclick(function() {
                self.save();
            });
        },
        beforeShow: function(paras) {
            this.data = paras;
            this.resetUI();
        },
        afterShow: function() {
            //处理点穿的问题
            this.$text.prop("disabled", false);
        },
        beforeHide: function() {
            this.$text.prop("disabled", true);
        },
        resetUI: function() {
            this.$text.val("");
        },
        save: function() {
            var self = this;
            var comment = $.trim(this.$text.val());
            // if (!comment.length || comment.length < 10) {
            //     amGloble.msg("请输入不少于10个字的处理结果！");
            //     return;
            // }
            amGloble.loading.show();

            var user = amGloble.metadata.userInfo;
            var todoItem = this.data;
            amGloble.api.todoProcess.exec({
                "userId": user.userId,
                "id": todoItem.id,
                "comment": comment
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    amGloble.msg("处理成功");
                    $.am.page.back("slidedown");
                    amGloble.page.todoList.refreshPage();
                } else {
                    amGloble.msg(ret.message || "提交失败");

                }
            });
        }
    });
})();
