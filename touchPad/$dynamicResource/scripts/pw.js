(function(){
    var pw = {
        init:function(){
           /*  this.$ = $("#checkPassword");
            this.$input = this.$.find("input").keyup(function(evt){
                if(evt.keyCode == 13){
                    pw.$ok.trigger('vclick');
                }
            });
            this.$ok = this.$.find("div.ok").vclick(function(){
                var pass = pw.$input.val();
                if(pass){
                    if(pass == pw.member.passwd){
                        pw.cache[pw.member.id] = new Date().getTime();
                        pw.cb(1);
                        pw.$.hide();
                    }else{
                        pw.$input.val("").focus();
                        am.msg("密码输入有误！");
                    }
                }else{
                    am.msg("请输入密码！");
                }
            });
            this.$cancel = this.$.find("div.cancel").vclick(function(){
                pw.$.hide();
            }); */
        },
        cache:{},
        check:function(member,cb){
            for(var i in this.cache){
                if(new Date().getTime() - this.cache[i] > 15*60*1000){
                    //超过15分钟, 清除缓存
                    delete this.cache[i];
                }
            }

            if(am.operateArr.indexOf("O") == -1 && member.passwd && !this.cache[member.id]){
                //有密码才做事  且  没有缓存
                /* if(!this.$){
                    this.init();
                }
                this.member = member;
                this.cb = cb;
                this.$.show();
                this.$input.val("").focus(); */
                this.member = member;
                this.cb = cb;
                am.keyboard.show({
                    phone: member.realMobile || member.mobile,//手机
                    passwd: member.passwd,//密码
                    title: "请输入密码",
                    hidedot:true,
                    ciphertext:true,
                    forgetpwd:true,
                    submit: function (value) {
                        console.log(value)
                        if(value){
                            if(value == pw.member.passwd){
                                pw.cache[pw.member.id] = new Date().getTime();
                                pw.cb(1);
                            }else{
                                am.msg("密码输入有误！");
                                return true;
                            }
                        }else{
                            am.msg("请输入密码！");
                            return true; 
                        }
                    }
                });
            }else{//直接走下面的流程
                cb(1);
            }
        }
    };

    am.pw = pw;

    //既然之前的密码输入弹层不用了，改造为别的插件
    //
    var inputSth = {
        init:function(){
            var _this=this;
            this.$ = $("#checkPassword");
            this.$input = this.$.find("input").keyup(function(evt){
                if(evt.keyCode == 13){
                    _this.$ok.trigger('vclick');
                }
            });
            this.$ok = this.$.find("div.ok").vclick(function(){
                if(!_this.cb(_this.$input.val())){
                    _this.$.hide();
                };
            });
            this.$cancel = this.$.find("div.cancel").vclick(function(){
                _this.$.hide();
            });
            this.$title = this.$.find('.title');
        },
        show:function(opt){
            if(!this.$){
                this.init();
            }
            this.$.show();
            this.$input.val(opt.value || '');
            this.$input.prop('maxlength',opt.maxLength || 10);
            this.$title.text(opt.title);
            this.cb = opt.callback;
        }
    };
    /* {
        title:'',
        value:'',
        maxLength:6,
        callback:function(){

        }
    } */
    am.inputSth = function(opt){
        inputSth.show(opt);
    }
})();
