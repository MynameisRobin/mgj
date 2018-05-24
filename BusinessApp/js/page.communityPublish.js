(function(){
    var self = amGloble.page.communityPublish = new $.am.Page({
        id: 'page-communityPublish',
        init: function(){
            this.$header.find('.left').vclick(function() {
                if(self.$tags.find('p').length || self.$title.val() || self.$content.val() || self.$photos.find('img').length){
                    atMobile.nativeUIWidget.confirm({
                        caption: '确认返回',
                        description: '返回将清空已输内容，是否立即返回？',
                        okCaption: '确认',
                        cancelCaption: '取消'
                    }, function() {
                        $.am.page.back();
                    }, function() {
                        
                    }); 
                }else {
                    $.am.page.back();
                }
            });

            this.$header.find('.right').vclick(function() {
                self.pulish();
            });

            this.$getTopic = this.$.find('.top').vclick(function(){
                var topics = [];
                var tags = self.$tags.find('p');
                if(tags.length){
                    for(var i=0;i<tags.length;i++){
                        topics.push($(tags[i]).html());
                    }
                }
                $.am.changePage(amGloble.page.communityTopic,'slideup',{topics:topics});
            });

            this.$title = this.$.find('.bottom .title').focus(function(){
                self.$mask.show();
            });
            this.$content = this.$.find('.textarea').focus(function(){
                self.$mask.show();
            });
            this.$tags = this.$.find('.tags');
            this.$tip = this.$.find('.tip');

            this.$photos = this.$.find('.photos').on('vclick','.photo',function(){
                var $this = $(this);
                var opt = {
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                };
                amGloble.photoManager.takePhoto('community', opt, function(uuid) {
                    $this.html(amGloble.photoManager.createImage('community', opt, uuid, "s"));
                    $this.append('<div class="del am-clickable iconfont icon-close-b"></div>');
                    $this.data("id",uuid);
                    if(self.$photos.find('.photo').length < 9 && !self.$photos.find('.photo:empty').length) {
                        self.$photos.append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
                    }
                }, function() {
                    console.log("fail");
                });
            }).on('vclick','.del',function(e){
                e.stopPropagation();
                $(this).parent().remove();
                if(self.$photos.find('.photo').length < 9 && !self.$photos.find('.photo:empty').length) {
                    self.$photos.append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
                }
                self.scrollview.refresh();
            });

            this.$mask = this.$.find('.mask').on('touchstart',function(){
                self.$.find("input, textarea").blur().prop("disabled", true);
                setTimeout(function(){
                    self.$mask.hide();
                    self.$.find("input, textarea").prop("disabled", false);;
                },500);
            });

            if($.am.checkScroll(true)<11){
                this.$mask.remove();
            }
        },
        beforeShow:function(para){
            console.log(para);
            if(para=='back'){
                return;
            }
            if(para && !!para.topics){
                this.renderTags(para.topics);
                return;
            }
            if(para && para.community){
                this.community = para.community;
                this.$header.find('.title').html('编辑话题');
                this.$header.find('.right').html('保存');
                this.renderCommunity(para.community);
                return;
            }
            this.$header.find('.title').html('发布话题');
            this.$header.find('.right').html('发布');
            this.$photos.empty().append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
            this.$title.val('');
            this.$content.val('');
            this.$tags.empty();
            this.$tip.show();
            this.community = null;
        },
        afterShow:function(){
            this.$title.prop("disabled", false);
            this.$content.prop("disabled", false);
        },
        beforeHide:function(){
            this.$title.prop("disabled", true);
            this.$content.prop("disabled", true);
        },
        afterHide:function(){

        },
        pulish:function(){
            var lis = this.$tags.find('p');
            if(!lis.length){
                amGloble.msg('请选择话题标签');
                return;
            }
            var tagArr = [];
            for(var i=0;i<lis.length;i++){
                tagArr.push($(lis[i]).html());
            }
            var tag = ','+tagArr.join(',')+',';
                title = this.$title.val(),
                content = this.$content.val();
            var imgs = this.$photos.find('.photo');
            var imgArr = [];
            for(var i=0;i<imgs.length;i++){
                var id = $(imgs[i]).data('id');
                if(id){
                    imgArr.push(id);
                }
            }
            if(!title){
                amGloble.msg('请输入标题');
                return;
            }
            if(!content){
                amGloble.msg('请输入内容');
                return;
            }
            var opt = {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                shopId: amGloble.metadata.userInfo.shopId,
                labelids: tag,
                title: title,
                content: content,
                pics: imgArr.join(','),
                publicUserId: amGloble.metadata.userInfo.userId,
                publicUserType: amGloble.metadata.userInfo.userType,
                publicDate: new Date().getTime(),
            }
            if(this.community){
                opt.id = this.community.id;
            }
            amGloble.loading.show();
            amGloble.api.communityPublish.exec(opt, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    console.log(ret);
                    if(self.community){
                        amGloble.msg('编辑成功');
                    }else {
                        amGloble.msg('发布成功');
                    }
                    $.am.changePage(amGloble.page.community,'slideright','searchSelf');
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.pulish();
                    }, function() {
                        
                    });
                }
            });
        },
        renderTags:function(data){
            this.$tags.empty();
            if(data.length){
                this.$tip.hide();
                for(var i=0;i<data.length;i++){
                    var $item = $('<p>'+(data[i].labelName || data[i])+'</p>');
                    this.$tags.append($item.data('data',data[i]));
                }
                var cw = this.$tags.width();
                var lis = this.$tags.find('p');
                var wArr = [];
                for(var i=0;i<lis.length;i++){
                    wArr.push($(lis[i]).outerWidth(true));
                }
                var w = 0;
                for(var i=0;i<wArr.length;i++){
                    w += wArr[i];
                    if(w>cw){
                        var w2 = 0;
                        for(var j=0;j<i;j++){
                            w2 += wArr[j];
                        }
                        this.$tags.find('p').eq(j).css('width',cw-w2-5+'px');
                        return false;
                    }
                }
            }else {
                this.$tip.show();
            }
        },
        renderCommunity:function(data){
            var tags = data.labelids.substring(1,data.labelids.length-1).split(',');
            this.renderTags(tags);
            this.$title.val(data.title);
            this.$content.val(data.content);
            if(data.pics){
                var pics = data.pics.split(',');
                this.$photos.empty();
                for(var i=0;i<pics.length;i++){
                    var  $photo = $('<div class="photo am-clickable iconfont icon-xiangji"></div>')
                    var $img = amGloble.photoManager.createImage('community', {
                        parentShopId: amGloble.metadata.userInfo.parentShopId
                    }, pics[i], "s");
                    $photo.append($img).append('<div class="del am-clickable iconfont icon-close-b"></div>').data('id',pics[i]);
                    this.$photos.append($photo);
                }
                if(pics.length<9){
                    self.$photos.append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
                }
            }else {
                self.$photos.empty().append('<div class="photo am-clickable iconfont icon-xiangji"></div>');
            }
        }
    });
})();