
amGloble.page.customerCreatFile = new $.am.Page({
    id: "page-customerCreatFile",
    init: function() {
        var _this = this;
        /*this.$.find(".submit").vclick(function () {
            $.am.page.back("slidedown");
        });*/
        this.$header.find(".left").vclick(function() {
            $.am.page.back("slidedown");
        });

        this.$text = this.$.find("textarea");
        this.$save = this.$.find("div.submit,span.right").vclick(function() {
            var comment = _this.$text.val();
            if (comment.length < 1 && comment.length > 200) {
                amGloble.msg("请输入1-200个字符客户档案内容！");
                return;
            }
            amGloble.loading.show();
            var imgs = _this.$photos.find('.photo');
            var imgArr = [];
            for(var i=0;i<imgs.length;i++){
                var id = $(imgs[i]).data('id');
                if(id){
                    imgArr.push(id);
                }
            }
            var user = amGloble.metadata.userInfo;
            amGloble.api.customerAddArchives.exec({
                "memId": _this.data.id,
                "shopId": _this.data.storeId,
                "userType": user.userType,
                "userId": user.userId,
                "userName": user.userName,
                "archives": comment,
                "imgs": imgArr.join(',')
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    amGloble.msg("添加成功");
                    $.am.page.back("slidedown");

                    //将客户档案页码消0
                    setTimeout(function(){
                        amGloble.page.customerDetail.data.meta.archivesCount++;
                        amGloble.page.customerDetail.custProfile.pageIndex = 0;
                        amGloble.page.customerDetail.custProfile.$list.empty();
                        amGloble.page.customerDetail.tab.$inner.find("li:eq(0)").trigger("vclick");
                    },300);
                } else {
                    amGloble.msg(ret.message || "提交失败");

                }
            });
        });

        this.$photos = this.$.find('.photos').on('vclick','.photo',function(){
            var $this = $(this);
            var opt = {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
            };
            amGloble.photoManager.takePhoto('customerFile', opt, function(uuid) {
                $this.html(amGloble.photoManager.createImage('customerFile', opt, uuid, "s"));
                $this.data("id",uuid);
                if(_this.$photos.find('.photo').length < 9) {
                    _this.$photos.append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
                }
            }, function() {
                console.log("fail");
            });
        }); 
    },
    beforeShow: function(paras) {
        this.$photos.empty().append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
        this.data = paras;
        this.render();
    },

    afterShow: function() {
        var _this = this;
        setTimeout(function() {
            _this.$text.attr("disabled", false);
        }, 200);
    },
    beforeHide: function() {
        this.$text.attr("disabled", true);
    },
    gender: {
        "M": "先生",
        "F": "女士"
    },
    render: function() {
        this.$header.find("p").text(this.data.name + (this.gender[this.data.gender] || ""));
        this.$text.val("");
    }
});
