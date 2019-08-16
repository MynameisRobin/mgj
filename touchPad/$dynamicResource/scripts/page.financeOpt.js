(function() {
    var self = am.page.financeOpt = new $.am.Page({
        id: "page_financeOpt",
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function() {
            
            var self = this;
            this.$levelList = [3,4,5,6,7,8,9,10,0]; //缩帐等级
            this.$contentUl = $('#page_financeOpt .content ul');

            for(var i=0; i < this.$levelList.length; i++) {
                var dom = null;
                if(this.$levelList[i] == '0') {
                    dom = '<li class="am-clickable"><div><p>'+ '未优化' +'</p></div></li>'
                }else {
                    dom = '<li class="am-clickable"><div><p>'+ this.$levelList[i] +'</p></div></li>'
                }
                this.$contentUl.append(dom);
            }

            var liLen = $('.content ul li').length;
                
            this.$.on('vclick', '.content ul li', function() {
                var index = $(this).index(),
                    inputVal = $('#page_financeOpt .base').val();

                if(parseInt(inputVal) > 0) {
                    
                }else {
                    am.msg("缩帐基数必须大于0!");
                    return;
                } 

                $(this).addClass('action').siblings().removeClass('action');

                self.paramsObj.configvalue = self.$levelList[index].toString(); //等级
                self.paramsObj.szMoney = inputVal.toString(); //基数
                
                self.getData(self.paramsObj, function() {
                    //退出登录重置
                    am.api.loginout.exec(
                        {
                            userId: self.userInfo.userId,
                            userType: self.userInfo.userType,
                            token: self.userInfo.mgjtouchtoken,
                            parentShopId: self.userInfo.parentShopId
                        },
                        function(res) {
                            am.loginout.hide();
                            if (res.code == 0) {
                            } else {
                                am.msg(res.message || "数据获取失败,请检查网络!");
                            }
                            console.log("登出成功");
                            localStorage.removeItem("userToken");
                            localStorage.removeItem("METADATA_" + am.metadata.userInfo.userName);
                            //$.am.changePage(am.page.login, "slideup");
                            window.location.reload();
                        }
                    );
                });
            }).on('vclick', '.contentWrap img', function() {
                // var textArr = [
                //     '每个月，我们帮助 1000 万的开发者解决各种各样的技术问题。并助力他们在技术能力、职业生涯、影响力上获得提升。',
                //     '工欲善其事，必先利其器，我们在使用数据库时，通常需要各种工具的支持来提高效率；很多新用户在刚接触 MongoDB 时，遇到的问题是『不知道有哪些现成的工具可以使用』，本系列文章将主要介绍 MongoDB 生态在工具、driver、可视化管理等方面的支持情况',
                //     'If you want to do a good job, you must use the tools first. When you use a database, you usually need the support of various tools to improve efficiency. Many new users come across the problem when they first come into contact with MongoDB: I don t know what tools are available.',
                //     'I know the guys at 3T well and I know they’ll do a great job of taking Robomongo forward — I can’t wait to see the tool develop further through their backing and the support of the great Robomongo community!',
                //     '在IndexedDB大部分操作并不是我们常用的调用方法，返回结果的模式，而是请求——响应的模式，比如打开数据库的操作'
                // ]
    
                // for(var i = 0; i < 1000; i++ ) {
                //     console.info('测试 ${i} | <br/> ${textArr[Math.floor(Math.random() * 0x5)]}');
                // }
            }).on('keyup', '.base', function (e) {

                // var val = $(this).val();

                // if(!isNaN(val)){
                    
                // }else{
                //     am.msg('请输入正确的数值！');
                // }
                
            })
        },
        beforeShow: function(para) {

            var self = this;
            this.userInfo = amGloble.metadata.userInfo;
            this.SHRINK_LEVEL = amGloble.metadata.configs.SHRINK_LEVEL == null ? "0" : amGloble.metadata.configs.SHRINK_LEVEL;
            this.SHRINK_LEVEL_MONEY = amGloble.metadata.configs.SHRINK_LEVEL_MONEY == null ? "500" : amGloble.metadata.configs.SHRINK_LEVEL_MONEY;
            console.log('缩帐初始化 :' + amGloble.metadata.configs.SHRINK_LEVEL, amGloble.metadata.configs.SHRINK_LEVEL_MONEY);
            this.paramsObj = {
                "shopid": this.userInfo.shopId,
                "parentshopid": this.userInfo.parentShopId,
                "configkey": "SHRINK_LEVEL",
                "configvalue": this.SHRINK_LEVEL,
                "szMoney" : this.SHRINK_LEVEL_MONEY,
                "setModuleid": 13,
            };
        
            this.getData(self.paramsObj, function() {
                self.$levelText = $('.levelText');

                var data = {
                    level : self.SHRINK_LEVEL,
                    szMoney : self.SHRINK_LEVEL_MONEY
                }
                self.setShowLevel(data);

            });
        },
        afterShow: function(opt) {

        },
        beforeHide: function() {
        },
        afterHide: function() {
            
        },
        renderRecord: function(opt){
         
        },
        getPeriodTime : function(date){
          
        },
        getData : function(period, cb){
            am.loading.show("正在获取,请稍候...");
            var opt = period;
            am.api.saveNormalConfig.exec(opt, function (res) {
                am.loading.hide();
                console.log(res);
                if (res.code == 0) {
                    cb();
                } else {
                    self.$stateBox.removeClass('empty').addClass("cutting");
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
            });
        },
        setShowLevel : function (data, cb) {

            $('#page_financeOpt .content ul li').eq(this.$levelList.indexOf(parseInt(data.level))).addClass('action').siblings().removeClass('action');

            $('#page_financeOpt .base').val(data.szMoney);

            if(data.level > 0) {
                this.$levelText.text(data.level + '级').addClass('hasLevel');
            }else {
                this.$levelText.text('未优化').removeClass('hasLevel');
            }

            if(cb) {
                cb();
            }
        },

    });
})();
