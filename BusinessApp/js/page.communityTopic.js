(function(){
    var self = amGloble.page.communityTopic = new $.am.Page({
        id:'page-communityTopic',
        init:function(){
            var self = this;
            this.$left = this.$header.find('.left').vclick(function(){
                $.am.page.back('slidedown');
            });

            this.$right = this.$header.find('.right').vclick(function(){
                var $lis = self.$list.find('.selected');
                var topics = [];
                for(var i=0;i<$lis.length;i++){
                    topics.push($($lis[i]).data('data'));
                }
                if(!topics.length){
                    amGloble.msg('请选择标签');
                    return;
                }
                $.am.page.back('slidedown',{topics:topics});
            });

            this.$list = this.$.find('.list').on('vclick','.tagname',function(){
                var num = $(this).parents('.list').find('.selected').length;
                if($(this).parent().hasClass('selected')){
                    $(this).parent().removeClass('selected');
                }else{
                    if(num>=3){
                        amGloble.msg('最多只能添加3个标签');
                    }else {
                        $(this).parent().addClass('selected');
                    }
                }
            }).on('vclick','.del',function(){
                var $li = $(this).parent(),
                    data = $li.data('data');
                self.deleteLabel(data.id,function(){
                    $li.remove();
                    self.scrollview.refresh();
                });
            });

            this.$toDel = this.$.find('.toDel').vclick(function(){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                }else {
                    $(this).addClass('active');
                }
                if(self.$list.hasClass('ableDel')){
                    self.$list.removeClass('ableDel');
                }else {
                    self.$list.addClass('ableDel');
                }
            });

            this.$topic = this.$.find('.topic').change(function(){
                var val = $(this).val();
                if(val){
                    self.$add.addClass('able');
                }else {
                    self.$add.removeClass('able');
                }
            }).focus(function(){
                self.$mask.show();
                $('body').addClass('inputfocus');
                var _this = $(this);
                if(self.inputTimer){
                    clearInterval(self.inputTimer);
                }
                self.inputTimer = setInterval(function(){
                    var val = _this.val();
                    if(val){
                        self.$add.addClass('able');
                    }else {
                        self.$add.removeClass('able');
                    }
                },100);
            }).blur(function(){
                $('body').removeClass('inputfocus');
                clearInterval(self.inputTimer);
            });

            this.$add = this.$.find('.add').vclick(function(){
                if(self.inputTimer){
                    clearInterval(self.inputTimer);
                }
                if($(this).hasClass('able')){
                    var val = self.$topic.val();
                    var lis = self.$list.find('li');
                    for(var i=0;i<lis.length;i++){
                        if(val==$(lis[i]).find('.tagname').html()){
                            amGloble.msg('此标签已存在');
                            return;
                        }
                    }
                    self.addLabel(val);
                }
            });

            this.$li = this.$list.find('li').remove();

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
        beforeShow:function(paras){
            this.topics = paras.topics;
            if(amGloble.metadata.userInfo.newRole==2 || amGloble.metadata.userInfo.newRole==3){
                this.$toDel.show();
            }else { 
                this.$toDel.hide();
            }
        },
        beforeHide:function(){
            this.$topic.prop("disabled", true);
        },
        afterShow:function(){
            this.$topic.prop("disabled", false);
            this.labelList();
        },
        afterHide:function(){
            this.$list.empty().removeClass('ableDel');
        },
        labelList:function(){
            amGloble.loading.show();
            amGloble.api.communityLabelList.exec({
                shopId: amGloble.metadata.userInfo.shopId
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    self.renderLabel(ret.content);
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.labelList();
                    }, function() {
                        
                    });
                }
            });
        },
        addLabel:function(labelName){
            amGloble.loading.show();
            amGloble.api.communityAddLabel.exec({
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                shopId: amGloble.metadata.userInfo.shopId,
                labelName: labelName,
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    console.log(ret);
                    self.$topic.val('');
                    self.$add.removeClass('able');
                    var $li = self.$li.clone();
                    $li.find('.tagname').html(labelName);
                    var num = self.$list.find('.selected').length;
                    if(num<3){
                        $li.addClass('selected');
                    }
                    $li.data('data',ret.content);
                    self.$list.prepend($li);
                    self.scrollview.refresh();
                    self.scrollview.scrollTo('top');
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '新增标签失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.labelList();
                    }, function() {
                        
                    });
                }
            });
        },
        deleteLabel:function(id,callback){
            amGloble.loading.show();
            amGloble.api.communityDeleteLabel.exec({
                id: id
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    amGloble.msg('删除成功');
                    callback && callback();
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '删除标签失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.deleteLabel(id,callback);
                    }, function() {
                        
                    });
                }
            });
        },
        renderLabel:function(data){
            this.$list.empty();
            if(data){
                for(var i=0;i<data.length;i++){
                    var $li = this.$li.clone();
                    $li.find('.tagname').html(data[i].labelName);
                    this.$list.append($li.data('data',data[i]));
                }
                if(this.topics){
                    for(var i=0;i<this.topics.length;i++){
                        for(var j=0;j<this.$list.find('li').length;j++){
                            if(this.topics[i]==$(this.$list.find('li')).eq(j).find('.tagname').html()){
                                $(this.$list.find('li')).eq(j).addClass('selected');
                            }
                        }
                    }
                }
                this.scrollview.refresh();
                this.scrollview.scrollTo('top');
            }else {
                amGloble.msg('暂无标签，请先添加标签');
            }
        }
    });
})();