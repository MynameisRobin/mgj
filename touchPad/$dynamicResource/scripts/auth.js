(function(){
    var auth = {
        init:function(){
            var _this = this;
            var $dom = $('<div id="auth">'+
                '<div class="mask"></div>'+
                '<div class="content">'+
                    '<div class="title">请先刷卡授权，方可修改成功</div>'+
                    '<div class="close"><div class="icon"></div></div>'+
                    '<div class="tip"></div>'+
                    '<div class="manual">手动输入授权码?</div>'+
                '</div>'+
            '</div>');
            $('body').append($dom)
            this.$ = $dom;

            this.$mask = this.$.find('.mask').vclick(function(){
                _this.hide();
            });

            this.$close = this.$.find('.close').vclick(function(){
                _this.hide();
            });

            this.$manual = this.$.find('.manual').vclick(function(){
                am.keyboard.show({
					title:"请输入授权码号码",//可不传
					hidedot:false,
					ciphertext:true,
				    submit:function(value){
                        _this.checkAuth(value);
				    }
				});
            });
        },
        checkAuth:function(code){
            if($('#maskBoard').is(":visible")){
                am.keyboard.hide();
            }
            var baseCode = amGloble.metadata.shopPropertyField.authorizationCard,
                baseArr = baseCode.split(','),
                resArr = [];
            $.each(baseArr, function (i, v) {
                if (v) {
                    resArr.push(v.substring(v.length - 5, v.length));
                }
            });
            if (resArr.indexOf(code.substring(code.length - 5, code.length)) > -1) {
                am.msg('授权修改成功');
                this.hide();
                this.anthSuccess && this.anthSuccess();
            } else {
                this.authFail && this.authFail();
                am.msg('授权卡号错误，请重试');
            }
        },
        show:function(opt){
            if(!this.$){
                this.init();
            }
            this.$.show();
            this.anthSuccess = opt.anthSuccess;
            this.authFail = opt.authFail;
        },
        hide:function(){
            this.$.hide();
        }
    }
    am.auth = auth;
})();