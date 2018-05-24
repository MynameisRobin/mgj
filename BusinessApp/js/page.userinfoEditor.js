(function() {
    var editorCfg = {
        "name": {
            "title": "修改姓名",
            "apiKey": "empName",
            "metaKey": "userName",
            "components": [{
                "type": "input",
                "placeholder": "请输入姓名",
                "maxlength": "20",
                "checkValue":function(val,self){
                    if(val==""){
                        self.errorText="请输入姓名！";
                    }else{
                        self.errorText="";
                    }
                }
            }],
            
        },
        "price": {
            "title": "修改剪发价",
            "apiKey": "mgjhaircutprice",
            "metaKey": "cutPrice",
            "tip": "注：顾客预约时可以看到你设置的剪发价",
            "components": [{
                "type": "input",
                "placeholder": "请输入剪发价",
                "maxlength": "7"
            }]
        },
        "tags": {
            "title": "修改标签",
            "apiKey": "mgjtags",
            "metaKey": "tags",
            "tip": "注：顾客预约时可以看到你设置的标签",
            "imgTip": true,
            "components": [{
                "type": "input",
                "title": "标签1",
                "placeholder": "请输入",
                "maxlength": "10"
            }, {
                "type": "input",
                "title": "标签2",
                "placeholder": "请输入",
                "maxlength": "10"
            }, {
                "type": "input",
                "title": "标签3",
                "placeholder": "请输入",
                "maxlength": "10"
            }, {
                "type": "input",
                "title": "标签4",
                "placeholder": "请输入",
                "maxlength": "10"
            }],
            getValue: function() {
                // console.log("自定义getValue");
                var cfg = editorCfg[this.paras.key];
                var ret = {};
                var values = [];
                this.$.find("input,textarea").each(function(i, item) {
                    var value = $.trim($(item).val());
                    if (value) {
                        values.push(value)
                    }
                });
                ret[cfg.apiKey] = values.join(",");
                return ret;
            },
            setValue: function() {
                // console.log("自定义setValue");
                var cValue = this.paras.cValue;
                if (cValue) {
                    var values = cValue.split(",");
                    this.$.find("input,textarea").each(function(i, item) {
                        var value = values[i];
                        if (value) {
                            $(item).val(value);
                        }
                    });
                }
            }
        },
        "description": {
            "title": "修改简介",
            "apiKey": "mgjbio",
            "metaKey": "bio",
            "components": [{
                "type": "textarea",
                "placeholder": "请输入简介"
            }]
        },
        comment:{
            "title": "评论",
            "apiKey": "submitComment",
            "metaKey": "comment",
            "components": [{
                "type": "textarea",
                "maxlength": "100",
                "placeholder": "请输入评论内容",
                "checkValue":function(val,self){
                    if(val==""){
                        self.errorText="请输入评论内容！";
                    }else{
                        self.errorText="";
                    }
                }
            }]
        },
        complain:{
            "title": "投诉",
            "apiKey": "submitComplaint",
            "metaKey": "complain",
            "components": [{
                "valueKey":"contact",
                "type": "input",
                "maxlength": "11",
                "placeholder": "请输入联系电话",
                "checkValue":function(val,self){
                    if(!amGloble.rePhone.test(val)){
                        self.errorText="请输入正确的手机号！";
                    }else{
                        self.errorText="";
                    }
                }
            },{
                "valueKey":"comment",
                "type": "textarea",
                "maxlength": "100",
                "placeholder": "请输入投诉内容",
                "checkValue":function(val,self){
                    if(val==""){
                        self.errorText="请输入投诉内容！";
                    }else{
                        self.errorText="";
                    }
                }
            }],
            getValue:function(){
                var cfg = editorCfg[this.paras.key];
                var ret = {};
                this.$.find("input,textarea").each(function(i, item) {
                    var value = $.trim($(item).val());
                    var key=$(item).parents("li").data("key");
                    ret[key]=value;
                });
                return ret;
            },
            setValue: function() {
                // console.log("自定义setValue");
                var cValue = this.paras.cValue;
                if (cValue) {
                    var values = cValue.split(",");
                    this.$.find("input,textarea").each(function(i, item) {
                        var value = values[i];
                        if (value) {
                            $(item).val(value);
                        }
                    });
                }
            }
        }
    };

    var chtml = {
        "input": '<input type="text">',
        "textarea": '<textarea></textarea>'
    };


    var self = amGloble.page.userinfoEditor = new $.am.Page({
        id: "page-userinfoEditor",
        init: function() {
            var self = this;
            this.errorText="";
            this.$save = this.$header.children(".right").vclick(function() {
                if(self.paras.save){
                    self.paras.save.call(self,editorCfg);
                }else{
                    self.save();
                }
                
            });
            this.$title = this.$header.find("p");

            this.$ul = this.$.find(".listArea");

            this.$tip = this.$.find(".tip");
            this.$imgTip = this.$.find(".imgTip");
        },
        beforeShow: function(paras) {
            
            var $curpay = amGloble.metadata.configs.v4_barberfajiaList;
            //console.log(editorCfg.price.components.placeholder);
            if($curpay) {
                editorCfg.price.title = '修改' + $curpay;
                editorCfg.price.tip = '注：顾客预约时可以看到你设置的'+$curpay;
                editorCfg.price.components[0].placeholder='请输入' + $curpay;
            }
           //console.log(editorCfg.price.title);
            this.paras = paras;
            this.render();
        },
        afterShow: function(paras) {
            this.$.find("input,textarea").eq(0).focus();
        },
        beforeHide: function() {},
        render: function(key) {
            var self=this;
            var cfg = editorCfg[this.paras.key];

            this.$title.text(cfg.title);
            var $ul = this.$ul.empty();
            for (var i = 0; i < cfg.components.length; i++) {
                var item = cfg.components[i];
                $li = $('<li></li>');
                if (item.title) {
                    $li.append('<span class="title">' + item.title + '</span>');
                } else {
                    $li.addClass("noTitle");
                }
                if(item.valueKey){
                    $li.data("key", item.valueKey || "");
                }
                $li.append('<span class="input">' + chtml[item.type] + '</span>');
                $li.find("input,textarea").attr("placeholder", item.placeholder || "");
                $li.find("input,textarea").attr("maxlength", item.maxlength || "");
                $ul.append($li);
                if(item.checkValue){
                    $li.on("checkValue",function(){
                        item.checkValue($li.find("input,textarea").val(),self);
                    }).attr("ischeck",true);
                }
            }

            console.log(cfg);

            if (cfg.tip) {
                this.$tip.html(cfg.tip).show();
            } else {
                this.$tip.hide();
            }
            if (cfg.imgTip) {
                this.$imgTip.show();
            } else {
                this.$imgTip.hide();
            }

            if (cfg.setValue) {
                cfg.setValue.call(this);
            } else {
                this.setValue();
            }
        },
        setValue: function() {
            var cfg = editorCfg[this.paras.key];
            this.$.find("input,textarea").val(this.paras.cValue);
        },
        getValue: function() {
            var cfg = editorCfg[this.paras.key];
            var ret = {};
            ret[cfg.apiKey] = this.$.find("input,textarea").val();
            return ret;
        },
        save: function() {
            var user = amGloble.metadata.userInfo;
            var v;
            var cfg = editorCfg[this.paras.key];
            if (cfg.getValue) {
                option = cfg.getValue.call(this);
            } else {
                option = this.getValue();
            }

            option.userid = user.userId;
            option.userType = user.userType;
            option.shopid = user.shopId;

            console.log(option);
            // return;
            
            if(this.errorText){
                amGloble.msg(this.errorText);
                return;
            }

            amGloble.loading.show("正在提交，请稍候...");
            amGloble.api.userModify.exec(option, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    amGloble.msg("修改成功！");
                    user[cfg.metaKey] = option[cfg.apiKey];
                    //调用一次metadata，刷新缓存

                    amGloble.api.metadata.exec({
                        parentShopId: config.parentShopId,
                        token: config.token
                    }, function(ret, isLocal) {
                        console.log("metadata", ret, isLocal);
                    });
                    $.am.page.back();
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        }
    });

})();
