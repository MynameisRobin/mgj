(function(){
    // var tpl = [
    //     {
    //         id: 1,
    //         text: '生日祝福'
    //     },
    //     {
    //         id: 2,
    //         text: '节日问候'
    //     },
    //     {
    //         id: 3,
    //         text: '服务回访'
    //     },
    //     {
    //         id: 4,
    //         text: '客户关怀'
    //     },
    //     {
    //         id: 5,
    //         text: '日常问候'
    //     },
    //     {
    //         id: 6,
    //         text: '其它'
    //     }
    // ]
    amGloble.page.customerMessage = new $.am.Page({
        id: 'page-customerMessage',
        init: function(){
            var self = this;
            this.$name = this.$header.find('.title');

            this.$left = this.$.find('.left').vclick(function(){
                $.am.page.back("slidedown",{nickname:self.customer.nickname});
            });

            this.$addNickname = this.$.find('.addNickname').vclick(function(){
                $.am.changePage(amGloble.page.setNickname,'slideup',{customer:self.customer});
            });

            this.$selectMessageType = this.$.find('.selectMessageType').on('vclick','.mask',function(){
                self.$right.removeClass('up');
                self.$selectMessageType.hide();
                self.$selectMessageType.find('.wrap').hide();
            }).on('vclick','li',function(){
                self.$right.find('.condition').html($(this).html());
                self.$right.removeClass('up');
                self.$selectMessageType.hide();
                self.$selectMessageType.find('.wrap').hide();
                self.typeId = $(this).data('data').id;
                self.getList();
            });

            this.$messageType = this.$.find('.messageType');

            this.$right = this.$.find('.right').vclick(function(){
                $(this).addClass('up');
                self.$selectMessageType.show();
                self.$selectMessageType.find('.wrap').slideDown(200);
            });

            this.$types = this.$selectMessageType.find('.messageType li');
            this.$empty = this.$.find('.empty');

            this.$list = this.$.find('.list').on('vclick','li',function(){
                var tpl = $(this).data('data');
                $.am.changePage(amGloble.page.sendMessage,'slideleft',{customer:self.customer,tpl:tpl});
            });

            this.$li = this.$list.find('li').remove();
            this.$adPic = this.$.find('.ad_createMsgPlate').vclick(function(){
                $.am.changePage(amGloble.page.createMsgPlate,'slideup');
            })
            this.$closeBtn = this.$adPic.find('.close').vclick(function(e){
                e.stopPropagation();
                self.$adPic.hide();
                return false;
            })
        },
        beforeShow:function(para){
            if(para=='back'){
                return;
            }
            if(para.nickname){
                this.customer.nickname = para.nickname;
                this.$name.html(para.nickname);
                this.$addNickname.hide();
                return;
            }
            if(amGloble.metadata.userInfo.newRole!=3){
                this.$adPic.hide();
            }else {
                this.$adPic.show();
            }
            this.$empty.hide();
            if(!this.$messageType.find('li').length){
                var types = amGloble.metadata.msgTemplateCategory;
                types.unshift({
                    id: '',
                    text: '全部'
                });
                // var types = tpl;
                for(var i=0;i<types.length;i++){
                    var $li = $('<li class="am-clickable">'+types[i].text+'</li>').data('data',types[i]);
                    this.$messageType.append($li);
                }
                this.typeId = types[0].id;
                this.$right.find('.condition').html(types[0].text);
            }
            this.$name.html(para.customer.nickname?para.customer.nickname:para.customer.name);
            if(para.customer.nickname){
                this.$addNickname.hide();
            }else {
                this.$addNickname.show();
            }
            this.customer = para.customer;
        },
        afterShow:function(){
            this.getList();
        },
        beforeHide:function(){

        },
        afterHide:function(){

        },
        getList:function(){
            var self = this;
            amGloble.loading.show();
            amGloble.api.msgtplList.exec({
                categoryId: self.typeId
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    console.log(ret);
                    self.render(ret.content);
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.getList();
                    }, function() {
                        
                    });
                }
            });
        },
        render:function(data){
            this.$list.empty();
            if(data.length){
                this.$empty.hide();
                var name = this.customer.name,
                    gender = this.customer.gender,
                    nickname = this.customer.nickname,
                    shopName = this.getShopName(),
                    userName = amGloble.metadata.userInfo.userName;
                
                for(var i=0;i<data.length;i++){
                    var $li = this.$li.clone();
                    var html = data[i].template
                    .replace('{门店名称}',shopName)
                    .replace('{发送人名称}',userName)
                    .replace('{顾客昵称}',nickname?nickname:name)
                    .replace('{顾客称谓}',gender=='M'?'先生':'女士');
                    $li.find('.title').html(this.getTplTypeName(data[i].categoryId)).addClass('title'+data[i].categoryId);
                    $li.find('.text').html(html);
                    $li.data('data',data[i]);
                    this.$list.append($li);
                }
            }else {
                this.$empty.show();
            }
            this.scrollview.refresh();
            this.scrollview.scrollTo('top');
        },
        getShopName:function(){
            var user = amGloble.metadata.userInfo,
                shops = amGloble.metadata.shops;
            var shopName = '';
            if(user.shopType==0){
                shopName = user.shopName + (user.osName==' '?'':user.osName);
                return shopName;
            }else {
                for(var i=0;i<shops.length;i++){
                    if(user.shopId==shops[i].shopId){
                        var name = ((shops[i].shopFullName==" "|| shops[i].shopFullName=="")?"门店名称未设定":shops[i].shopFullName);
                        shopName = shops[i].shopName + name;
                        return shopName;
                    }
                }
            }
        },
        getTplTypeName:function(id){
            var name = '';
            var types = amGloble.metadata.msgTemplateCategory;
            // var types = tpl;
            for(var i=0;i<types.length;i++){
                if(types[i].id==id){
                    name = types[i].text;
                    return name;
                }
            }
        }
    });
})();