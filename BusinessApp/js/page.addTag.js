(function(){
    var self = amGloble.page.addTag = new $.am.Page({
        id: 'page-addTag',
        init: function(){
            this.$header.find('.left').vclick(function() {
                $.am.page.back('slidedown');
            });

            this.$header.find('.right').vclick(function(){
                var tags = [];
                var list = self.$.find('.selected,.new');
                for(var i=0;i<list.length;i++){
                    var data = $(list[i]).data('data');
                    if($(list[i]).hasClass('selected')){
                        data.memId = self.customer.id;
                    }else {
                        data.memId = '';
                    }
                    data.tagId = data.id;
                    tags.push(data);
                }
                self.addTag(tags);
            });

            this.$myList = this.$.find('.mine ul');
            this.$adminList = this.$.find('.admin ul');
            this.$otherList = this.$.find('.other ul');
            this.$item = this.$myList.find('li').remove();
            this.$tag = this.$.find('.tag').focus(function(){
                self.$mask.show();
                $('body').addClass('inputfocus');
                var _this = $(this);
                if(self.inputTimer){
                    clearInterval(self.inputTimer);
                }
                self.inputTimer = setInterval(function(){
                    var val = _this.val();
                    if(val){
                        _this.next().addClass('able');
                    }else {
                        _this.next().removeClass('able');
                    }
                },100);
            }).blur(function(){
                $('body').removeClass('inputfocus');
                clearInterval(self.inputTimer);
            }).change(function(){
                var val = $(this).val();
                if(val){
                    $(this).next().addClass('able');
                }else {
                    $(this).next().removeClass('able');
                }
            });
            this.$toggle = this.$.find('.toggle').remove();

            this.$toDel = this.$.find('.toDel').vclick(function(){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    self.$.find('ul .del').hide();
                }else {
                    $(this).addClass('active');
                    self.$.find('ul .del').show();
                }
            });

            this.$.on('vclick','.tagname',function(){
                var num = self.$.find('.am-body-inner .selected').length;
                if($(this).parent().hasClass('selected')){
                    $(this).parent().removeClass('selected');
                }else{
                    if(num>=5){
                        amGloble.msg('最多只能添加5个标签');
                    }else {
                        $(this).parent().addClass('selected');
                    }
                }
            }).on('vclick','.del',function(){
                var data = $(this).parent().data('data');
                if(!data.id){
                    $(this).parent().remove();
                    self.scrollview.refresh();
                }else{
                    var _this = $(this);
                    self.delTag(data.id,function(){
                        var parent = _this.parents('.wrapper'),
                            toggle = parent.find('.toggle');
                        _this.parent().remove();
                        if(toggle.length){
                            toggle.trigger('vclick');
                            self.checkToggle(parent.find('ul'));
                            toggle.trigger('vclick');
                            self.scrollview.refresh();
                        }
                    });
                }
            }).on('vclick','.toggle',function(){
                var data = $(this).parent().next().data('data'),
                    min = data.min,
                    max = data.max;
                if($(this).hasClass('up')){
                    $(this).removeClass('up');
                    $(this).parent().next().css('height',min+'px');
                }else {
                    $(this).addClass('up');
                    $(this).parent().next().css('height',max+'px');
                }
                self.scrollview.refresh();
            }).on('vclick','.add-icon',function(){
                if(self.inputTimer){
                    clearInterval(self.inputTimer);
                }
                var val = self.$tag.val();
                if(!val) {
                    return;
                }
                var lis = self.$.find('li');
                for(var i=0;i<lis.length;i++){
                    if(val==$(lis[i]).find('.tagname').html()){
                        amGloble.msg('此标签已存在');
                        return;
                    }
                }
                var mylis = self.$myList.find('li').length;
                if(mylis>=10){
                    amGloble.msg('每人最多添加10个标签');
                    return;
                }
                var $li = self.$item.clone();
                $li.find('p').html(val);
                var num = self.$.find('.am-body-inner .selected').length;
                if(num<5){
                    $li.addClass('selected');
                }
                $li.data('data',{
                    tagId: '',
                    tagName: val,
                    empId: amGloble.metadata.userInfo.userId,
                    type: amGloble.metadata.userInfo.userType,
                    empShopId: amGloble.metadata.userInfo.shopId,
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                });
                self.$myList.prepend($li);
                self.$tag.val('').next().removeClass('able');
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
        beforeShow: function(paras){
            console.log(paras);
            this.$.find('.wrapper').hide();
            this.$.find('.toggle').remove();
            this.$toDel.removeClass('active');
            this.$myList.empty();
            this.$adminList.empty().css('height','auto');
            this.$otherList.empty().css('height','auto');
            this.$tag.val('');
            if(paras && paras.customer){
                this.customer = paras.customer;
            }
        },
        afterShow: function(){
            this.$tag.prop("disabled", false);
            this.getTagList();
        },
        beforeHide: function(){
            this.$tag.prop("disabled", true);
        },
        afterHide: function(){

        },
        addTag: function(tags){
            amGloble.loading.show();
            amGloble.api.tagAdd.exec({
                shopId: self.customer.storeId,
                memberId: self.customer.id,
                tags: tags
            },function(ret){
                amGloble.loading.hide();
                var customerTags = [];
                if(tags.length){
                    for(var i=0;i<tags.length;i++){
                        if(tags[i].memId){
                            customerTags.push(tags[i]);
                        }
                    }
                }
                $.am.changePage(amGloble.page.customerDetail,'slidedown',{customerTags:customerTags});
            });
        },
        delTag: function(id,callback){
            amGloble.loading.show();
            amGloble.api.tagDel.exec({
                id:id
            },function(ret){
                amGloble.loading.hide();
                console.log(ret);
                amGloble.msg('删除成功');
                callback && callback();
            })
        },
        getTagList: function(){
            amGloble.loading.show();
            amGloble.api.tagList.exec({
                shopId:amGloble.metadata.userInfo.shopId
            },function(ret){
                amGloble.loading.hide();
                console.log(ret);
                if(ret && ret.code==0){
                    self.render(ret.content);
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.getTagList();
                    }, function() {
                        $.am.changePage(amGloble.page.customerDetail,'slidedown');
                    });
                }
            })
        },
        render:function(data){
            var myList = [],adminList = [],otherList = [];
            for(var i=0;i<data.length;i++){
                if(data[i].empId==amGloble.metadata.userInfo.userId){
                    myList.push(data[i]);
                }
                if(data[i].type==0 && data[i].empId!=amGloble.metadata.userInfo.userId){
                    adminList.push(data[i]);
                }
                if(data[i].type==1 && data[i].empId!=amGloble.metadata.userInfo.userId){
                    otherList.push(data[i])
                }
            }
            this.renderItem(myList,this.$myList,1);
            this.renderItem(adminList,this.$adminList,amGloble.metadata.userInfo.userType==0);
            this.renderItem(otherList,this.$otherList,amGloble.metadata.userInfo.userType==0);
            this.renderTags();
            this.$.find('.wrapper').show();
            if(adminList.length){
                this.checkToggle(this.$adminList);
            }
            if(otherList.length){
                this.checkToggle(this.$otherList);
            }
            this.scrollview.refresh();
            this.scrollview.scrollTo('top');
        },
        renderItem:function(list,parent,ableDel){
            if(list.length){
                for(var i=0;i<list.length;i++){
                    var $li = this.$item.clone();
                    $li.find('p').html(list[i].tagName);
                    if(!ableDel){
                        $li.find('.del').remove();
                    }
                    list[i].empShopId = list[i].shopId;
                    $li.data('data',list[i]);
                    parent.append($li);
                }
            }
        },
        renderTags:function(){
            if(this.customer && this.customer.tags.length){
                var tags = this.customer.tags;
                for(var i=0;i<tags.length;i++){
                    var lis = this.$.find('li');
                    for(var j=0;j<lis.length;j++){
                        if(tags[i].tagName==$(lis[j]).find('.tagname').html()){
                            $(lis[j]).addClass('selected');
                        }
                    }
                }
            }
        },
        checkToggle:function($dom){
            $dom.css('height','auto');
            var rowHeight = $dom.find('li').outerHeight(true);
                totalHeight = $dom.outerHeight(true);
            $dom.css('height',rowHeight+'px');
            $dom.data('data',{
                min:rowHeight,
                max:totalHeight
            });
            if(totalHeight>rowHeight){
                if(!$dom.prev().find('.toggle').length){
                    var $toggle = this.$toggle.clone();
                    $dom.prev().append($toggle);
                }
            }else {
                $dom.prev().find('.toggle').hide();
            }
        },
    });
})();