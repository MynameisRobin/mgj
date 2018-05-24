am.createService = {
    isWin:navigator.platform.indexOf('Win') == 0,
    init:function(){
        var _this=this;
        this.$ = $("#createService");
        this.$win = this.$.find('.manual_wrap');
        if(this.isWin){
            this.$win.addClass('isWin');
        }else{
            this.$win.removeClass('isWin');
        }
        this.$ul = this.$.find("ul").on('vclick',"li",function(){
            _this.hide(1,$(this));
        });
        this.$.find(".bg").vclick(function(){
            _this.hide();
        });
        this.$.find(".close").vclick(function(){
            _this.hide();
        });
        this.$.find('.sure_btn').vclick(function(){//点击确认按钮
            var $dom=$(this).siblings('.input_no');
            var res=_this.checkNo($dom.val());
            if(res==2){
                am.msg('请输入数字！')
                return;
            }else if(res==1){
                am.msg('此牌号已经被使用!');
                return;
            }
            _this.hide(2,$dom);
        });
        this.$.find('.no_box').vclick(function(){//点击 假输入框
            am.keyboard.show({
                "title":"手牌号",
                "submit":function(value){
                    var res=_this.checkNo(value);
                    if(res==2){
                        am.msg('请输入数字！')
                        return true;
                    }else if(res==1){
                        am.msg('此牌号已经被使用!');
                        return true;
                    }
                    _this.hide(3,value);   
                }
            });
        });
        this.$.find('.input_no').on('keyup',function(e){
            if (e.keyCode == 13) {
                _this.$.find('.sure_btn').trigger('vclick');
            }
        }).val('');
    },
    show:function(opt,cb){
        if(!this.$){
            this.init();
        }
        var start = am.metadata.configs.serviceNoStartFrom*1;
        if(!start){
            start = 100;
        }
        this.$ul.empty();

        this.arr = [];
        if(opt && opt.content && opt.content.length){
            for (var i = 0; i < opt.content.length; i++) {
                this.arr.push(opt.content[i].displayId);
            }
        }

        for (var i=0; i < 80; i++) {
            var id=start+i;
            this.$ul.append('<li class="am-clickable '+(this.arr.indexOf(id.toString())==-1?'':'am-disabled')+'">'+id+'</li>');
        }

        this.$.show();
        this.isWin==true && this.$.find('.input_no').focus();
        this.cb = cb;
    },
    hide:function(type,num){
        if(type&&type==1&&num){
            this.cb({
                displayId:num.text()
            });
        }
        if(type&&type==2&&num){
            this.cb({
                displayId:num.val()
            });
        }
        if(type&&type==3&&num){
            this.cb({
                displayId:num
            });
        }
        this.$.hide();
        this.$.find('.input_no').val('');
    },
    checkNo:function(val){
        var reg=/^[0-9]*$/;
        if(reg.test(val)&&val){
            if(this.arr.length>0){
                if(this.arr.indexOf(val)>-1){
                    return 1;
                }
            }
            return 0;
        }else{
            return 2;
        }
    }
};
