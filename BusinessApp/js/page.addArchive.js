amGloble.page.addArchive = new $.am.Page({
    id: "page_addArchive",
    //disableScroll : true,
    init: function() {
        var _this = this;
        this.$header.find(".left").vclick(function() {
            $.am.page.back("slidedown");
        });

        this.$title = this.$.find("input");
        this.$subTitle = this.$.find("textarea");

        this.$boxHairstyle = this.$.find('.box-hairstyle');
        this.$pageTabUl = this.$.find('.page_tab ul');
        this.$boxConttabinnerUl = this.$.find('.box-conttabinner ul');
        this.$relation = this.$.find('.relation');

        this.$.find('.relation').on('vclick','.relatedmerchandise .btn,.reassociation .btn',function(){
            var _li = _this.$boxConttabinnerUl.find('li.selected');
            if(_li.length == 0){
                amGloble.msg("请选择作品类别！");
            }else{
                var opt = {
                    //category : _li.attr("pid") * 1,
                    subCategory : _li.attr("tid") * 1,
                    callback : function(opt,data){
                        _this.associatedStoreService = opt;

                        _this.$relation.addClass('on');
                        _this.$relation.find('.relationset p span').eq(0).html(opt.itemName);
                        _this.$relation.find('.relationset p span').eq(1).html('¥'+data.price);
                        _this.$title.val(data.price);
                    }
                };
                $.am.changePage(amGloble.page.associatedStoreService, "slideleft", opt);
            }
        });

        //取消关联
        this.$.find('.relation').on('vclick','.canclerelation',function(){
            _this.associatedStoreService = null;

            _this.$relation.removeClass('on');
            _this.$relation.find('.relationset p span').eq(0).html('');
            _this.$relation.find('.relationset p span').eq(1).html('');
            _this.$title.attr("disabled", false).val('');
        });

        this.$photos = this.$.find("ul.photos").delegate("li", "vclick", function() {
            var $this = $(this);
            //var category = _this.$category.find(".selected").attr("tid");
            var category = _this.$boxselect.find(".selected").attr("pid") * 1;
            var hairstyle = _this.$boxselect.find(".selected").attr("tid") * 1;
            if (!hairstyle) {
                amGloble.msg("请选定作品类别后上传照片！");
                return;
            }
            var user = amGloble.metadata.userInfo;
            var opt = {
                parentShopId: user.parentShopId,
                catigoryId: category*1,
                authorId: user.userId
                //to do userType ??
            };
            amGloble.photoManager.takePhoto("show", opt, function(uuid) {
                //alert(uuid);
                $this.html(amGloble.photoManager.createImage("show", opt, uuid, "s"));
                $this.data("id",uuid);
                if ($this.hasClass("add")) {
                    $this.removeClass("add");
                    if (_this.$photos.find("li").length < 9) {
                        _this.$photos.append('<li class="add am-clickable"></li>');
                    }
                } else {

                }
            }, function() {
                console.log("fail");
            });
        });

        this.$select = this.$.find("div.hairStyle_tab ul").on("vclick", "li", function() {
            var $this = $(this);

            var $li = _this.getLiByTid( _this.$boxselect, $this.attr('tid') );
            $li.trigger('vclick');
        }).on("vclick",'.moretype',function(){
            _this.$boxHairstyle.show();
            _this.boxConttab.refresh();
        });

        this.$boxHairstyle.on("vclick", ".box-mask",function(){
            _this.$boxHairstyle.hide();
        });

        this.$boxselect = this.$.find('.box-conttabinner ul').on("vclick", "li", function() {
            var $this = $(this);
            var photos = [];
            $.am.debug.log("img.length:", _this.$photos.find("img").length);
            _this.$photos.find("li").each(function() {
                var id = $(this).data("id");
                if (id) {
                    photos.push(id);
                }
            });
            var action = function(){
                $this.addClass("selected").siblings().removeClass("selected");
                _this.$boxHairstyle.hide();

                var $li = _this.getLiByTid( _this.$select, $this.attr('tid') );
                if($li){
                    $li.addClass("selected").siblings().removeClass("selected");
                }else{
                    _this.$select.find('li').removeClass("selected");
                }
            };
            if(photos.length){
                amGloble.confirm("需要重新上传照片", "修改作品类别后需要重新上传照片，确定要这样做吗？", "确定", "返回", function() {
                    var $li = $('<li class="add am-clickable"></li>');
                    _this.$photos.html($li);
                    action();
                }, function() {});
            }else{
                action();
            }
        });

        this.$price = this.$.find("input[name=price]");

        this.$isVisible = this.$.find("div.page_checkBox").vclick(function() {
            var $this = $(this);
            $(this).toggleClass("checked");
        });

        this.$save = this.$.find("span.right").vclick(function() {
            //var title = _this.$title.val();
            var subTitle = _this.$subTitle.val();
            //if (title.length < 1 && title.length>20) {
            //    amGloble.msg("请输入20个字符以内的标题！");
            //    return;
            //}
            if (subTitle.length < 1 || subTitle.length > 200) {
                amGloble.msg("请输入1-200字符的描述内容！");
                return;
            }
            var hairstyle = _this.$boxselect.find(".selected").attr("tid") * 1;
            if (!hairstyle) {
                amGloble.msg("请选择作品类别！");
                return;
            }

            var price = _this.$price.val();
            if (price && (price * 1 < 0 || price * 1 > 50000 || !price * 1)) {
                amGloble.msg("请输入门店原价,0-50000！");
                return;
            }

            var photos = [];
            $.am.debug.log("img.length:", _this.$photos.find("img").length);
            _this.$photos.find("li").each(function() {
                var id = $(this).data("id");
                if (id) {
                    photos.push(id);
                }
            });

            if (photos.length < 1) {
                amGloble.msg("请至少上传一张图片！");
                return;
            }

            var opt = {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                //shopId:
                title: subTitle,
                photo: photos.join(","),
                operatorId: amGloble.metadata.userInfo.userId,
                empId:amGloble.metadata.userInfo.userId,
                empName:amGloble.metadata.userInfo.userName,
                empLevelName:amGloble.metadata.userInfo.levelName || "",
                type: _this.$boxselect.find(".selected").attr("pid") * 1,
                subType: hairstyle,
                price: price * 1,
                empType:amGloble.metadata.userInfo.userType
                //visible: _this.$isVisible.filter(".selected").index() == 0 ? 1 : 0
            };

            if(_this.$.find("div.hairstyleOption").hasClass("visible")){
                //如果checkBox是显示的
                opt.visible = _this.$isVisible.hasClass("checked")?1:0;
            }else{
                //checkBox没显示
                if(amGloble.metadata.configs && amGloble.metadata.configs.review == "true" && amGloble.metadata.userInfo.userType==1){
                    opt.visible = 0;
                }else{
                    opt.visible = 1;
                }
            }

            if(_this.data){
                opt.memId= _this.data.id;
                opt.memName=_this.data.name;
                opt.shopId = _this.data.shopId;
            }else{
                opt.memId= -1;
                opt.memName="无";
                if(amGloble.metadata.userInfo.userType==1){
                    opt.shopId = amGloble.metadata.userInfo.shopId;
                }else{
                    if(amGloble.metadata.shops && amGloble.metadata.shops.length==1){
                        opt.shopId = amGloble.metadata.shops[0].shopId;
                    }else if(amGloble.metadata.shops && amGloble.metadata.shops.length>1){
                        var shops = [];
                        for(var i=0;i<amGloble.metadata.shops.length;i++){
                            shops.push({
                                id:amGloble.metadata.shops[i].shopId,
                                name:amGloble.metadata.shops[i].shopFullName
                            });
                        }
                        amGloble.popupMenu("请选择门店",shops, function (ret) {
                            opt.shopId = ret.id;
                            _this.associatedStoreService && $.extend(opt,_this.associatedStoreService);
                            _this.submit(opt);
                        });
                        return;
                    }
                }
            }

            _this.associatedStoreService && $.extend(opt,_this.associatedStoreService);

            _this.submit(opt);
        });

        //http://meiyan.meitu.com/mobile/
        this.$.find("div.download").vclick(function() {
            atMobile.nativeUIWidget.openUrl({
                url: "http://meiyan.meitu.com/mobile/"
            }, function() {

            }, function() {
                amGloble.msg("打开失败");
            });
        });
    },
    beforeShow: function(paras) {
        if (paras == "back") {
            return;
        }

        this.data = paras;
        this.render();
    },
    afterShow: function() {
        var _this = this;
        setTimeout(function() {
            if(!_this.associatedStoreService){
                _this.$title.attr("disabled", false);
            }
            _this.$subTitle.attr("disabled", false);
        }, 200);

        this.refresh();
    },
    beforeHide: function() {
        this.$title.attr("disabled", true);
        this.$subTitle.attr("disabled", true);
    },
    render: function() {

        var $li = $('<li class="add am-clickable"></li>');
        this.$photos.html($li);

        this.$title.val("");
        this.$subTitle.val("");
        //this.$select.eq(0).addClass("selected").siblings().removeClass("selected");//.text("请选择客户发型");
        this.$price.val("");

        this.associatedStoreService = null;
        this.$relation.removeClass('on');
        this.$relation.find('.relationset p span').eq(0).html('');
        this.$relation.find('.relationset p span').eq(1).html('');

        //this.$isVisible.eq(0).addClass("selected").siblings().removeClass("selected");

        // try {
        //     var category = metaConfig.invention.getInventionJSON();
        //     this.$category.empty();
        //     for (var i = 0; i < category.length; i++) {
        //         var $li= $('<li class="am-clickable" tid="' + category[i].category + '">' + category[i].categoryName + '</li>');
        //         $li.data("data",category[i]);
        //         this.$category.append($li);
        //     }

        //     this.$category.find("li:first").trigger("vclick");
        //     if (category.length > 1) {
        //         this.$category.parent().show();
        //     } else {
        //         this.$category.parent().hide();
        //     }
        // } catch (e) {
        //     //alert(e);
        // }
        try{
            var category = metaConfig.invention.getInventionJSON();
            var num = 0;
            var html = '';
            var htmlbox = '';
            for (var i = 0; i < category.length; i++) {
                var t = category[i].subCategories;
                for (var j = 0; j < t.length; j++) {
                    num ++;
                    if(num <= 6){
                        html += '<li class="am-clickable" pid="'+ t[j].category +'" tid="' + t[j].subCategory + '">' + t[j].subCategoryName + '</li>';
                    }
                    htmlbox += '<li class="am-clickable" pid="'+ t[j].category +'" tid="' + t[j].subCategory + '">' + t[j].subCategoryName + '</li>';
                }
            }
            html += '<p class="am-clickable moretype">更多分类<span></span></p>';
            this.$select.html(html);
            this.$boxselect.html(htmlbox);

            this.boxConttab = new $.am.ScrollView({
                $wrap: this.$.find(".box-conttabinner"),
                $inner: this.$.find(".box-conttabinner ul"),
                direction: [0, 1]
            });
        }catch(e){
            //alert(e);
        }

        var editable = 0;
        if (amGloble.metadata.userInfo.userType == 1) {
            //是员工
            if(amGloble.metadata.configs && amGloble.metadata.configs.review == "true"){
                //要审核，不显示checkbox
            }else{
                //不审核，显示checkbox
                editable=1;
            }
        } else if (amGloble.metadata.userInfo.userType == 0) {
            //是管理员，显示checkbox
            editable = 1;
        }
        if(editable){
            this.$.find("div.hairstyleOption").addClass("visible");
            this.$isVisible.addClass("checked");
        }else{
            this.$.find("div.hairstyleOption").removeClass("visible");
        }
    },
    submit : function(opt){
        $.am.debug.log(JSON.stringify(opt));
        amGloble.loading.show();
        amGloble.api.addInvention.exec(opt, function(ret) {
            amGloble.loading.hide();
            if (ret && ret.code == 0) {
                amGloble.msg("添加成功");
                $.am.page.back("slidedown","forceRefresh");
            } else {
                amGloble.msg(ret.message || "提交失败");
            }
        });
    },
    getLiByTid : function($ul,tid){
        var $li = null;
        $ul.find('li').each(function(k,v){
            if($(v).attr('tid') == tid){
                $li = $(v);
                return false;
            }
        });
        return $li;
    }
});
