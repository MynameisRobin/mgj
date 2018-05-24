(function(){
    var self = amGloble.page.sendMessage = new $.am.Page({
        id: 'page-sendMessage',
        init:function(){
            var self = this;

            this.$type = this.$.find('.type');
            this.$name = this.$.find('.name');
            this.$text = this.$.find('.text').focus(function(){
                self.$mask.show();
                var _this = $(this);
                self.inputTimer = setInterval(function(){
                    var val = _this.val();
                    self.$num.html(val.length);
                },100);
            }).blur(function(){
                clearInterval(self.inputTimer);
            });
            this.$title = this.$.find('.title');

            this.$wx = this.$.find('.wx').vclick(function(){
                if(self.inputTimer){
                    clearInterval(self.inputTimer);
                }
                var text = self.$text.val();
                if(!text){
                    amGloble.msg('请输入内容');
                    return;
                }
                self.smsShare(text,0,function(){
                    amGloble.shareText({
                        text: text,
                        success: function() {
                            self.back();
                        },
                        fail:function(){
                            
                        }
                    })
                });
            });
            this.$sms = this.$.find('.sms').vclick(function(){
                if(self.inputTimer){
                    clearInterval(self.inputTimer);
                }
                var text = self.$text.val();
                if(!text){
                    amGloble.msg('请输入内容');
                    return;
                }
                self.smsShare(text,1,function(){
                    amGloble.msg('发送成功');
                    self.back();
                });
            });

            this.$num = this.$.find('.words .num');

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
        smsShare:function(text,sms,callback){
            var self = this;
            amGloble.loading.show();
            amGloble.api.msgtplPush.exec({
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                shopId: amGloble.metadata.userInfo.shopId,
                phone: self.customer.phone,
                content: text,
                memId: self.customer.id,
                userId: amGloble.metadata.userInfo.userId,
                userName: amGloble.metadata.userInfo.userName,
                userType: amGloble.metadata.userInfo.userType,
                sms: sms,
                type: self.$type.html()
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    console.log(ret);
                    callback && callback();
                }else if(ret && ret.code == 1){
                    amGloble.msg(ret.message);
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.smsShare(text,sms,callback);
                    }, function() {
                        
                    });
                }
            });
        },
        beforeShow:function(para){
            this.$text.prop("disabled", true);
            this.customer = para.customer;
            this.$type.html(amGloble.page.customerMessage.getTplTypeName(para.tpl.categoryId));
            this.$name.html(para.customer.nickname?para.customer.nickname:para.customer.name);
            this.$title.removeClass();
            this.$title.addClass('title');
            this.$title.addClass('title'+para.tpl.categoryId);

            var name = this.customer.name,
                gender = this.customer.gender,
                nickname = this.customer.nickname,
                shopName = amGloble.page.customerMessage.getShopName(),
                userName = amGloble.metadata.userInfo.userName;
            var html = para.tpl.template
            .replace('{门店名称}',shopName)
            .replace('{发送人名称}',userName)
            .replace('{顾客昵称}',nickname?nickname:name)
            .replace('{顾客称谓}',gender=='M'?'先生':'女士');
            this.$text.val(html);
            this.$num.html(html.length);
        },
        afterShow: function(){
            this.$text.prop("disabled", false);
        },
        back:function(){
            $.am.changePage(amGloble.page.customerDetail,'slideright','formsms');
            //将客户档案页码消0
            setTimeout(function(){
                amGloble.page.customerDetail.data.meta.archivesCount++;
                amGloble.page.customerDetail.custProfile.pageIndex = 0;
                amGloble.page.customerDetail.custProfile.$list.empty();
                amGloble.page.customerDetail.tab.$inner.find("li:eq(0)").trigger("vclick");
            },300);
        }
    });
})();