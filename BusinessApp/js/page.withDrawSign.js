(function() {
    var self = amGloble.page.withDrawSign = new $.am.Page({
        id: "page-withDrawSign",
        init: function() {
            var _this= this;
            this.inputDom=["contact","phone","alipayAccount","alipayOwner"];
            this.photosDom=["contracts","license","ownerId"];
            this.photoSize=[8,2,2];
            this.creatObj(this.inputDom,this.photosDom);

            this.$reason=this.$.find(".reason").empty().hide();
            this.$stu=this.$.find(".title .status").empty();

            this.$.find(".photoBox").delegate("li", "vclick", function(e) {

                $.am.debug.log("photoBox1: " + $(this).hasClass("del"));
                
                if($(this).hasClass("del")){
                    $imgUl=$(this).parent("ul");
                    $(this).remove();
                    if($imgUl.find("li").size()==0){
                        $imgUl.append('<li class="add am-clickable"></li>');
                    }
                    return;
                }
                $.am.debug.log("photoBox2: " + $(this).hasClass("bigImg"));
                var imgend=0;
                if($(this).hasClass("bigImg")){
                    e.stopPropagation();
                    var items = [],rightRes=[];
                    var index = $(this).parent().children().index($(this));
                    var $imgarr=$(this).parent().find("img");
                    var $size=$imgarr.size();
                    amGloble.loading.show();
                    for(var j=0;j<$imgarr.length;j++){
                        rightRes.push({
                            id:j,
                            value:$($imgarr[j]).attr("src").replace("_s", "")
                        });
                        items.push("");
                    }
                    $imgarr.each(function(i) {
                        var src=$(this).attr("src").replace("_s", "");
                        var $img=new Image();
                        $img.src=src;
                        var $w,$h;
                        if($img.complete){
                            var idx=self.getImgId(rightRes,src);
                            $w=$img.width;
                            $h=$img.height;
                            items[idx]={
                                src:src,
                                w: $w,
                                h: $h
                            };
                            // if(i==$size-1){
                            //     _this.$.trigger("imgcomplete");
                            // }
                            imgend++;
                            if(imgend==$size){
                                _this.$.trigger("imgcomplete",[items,index]);
                            }
                        }else{
                            $img.onload=function(){
                                var idx=self.getImgId(rightRes,src);
                                $w=$img.width;
                                $h=$img.height;
                                items[idx]={
                                    src:src,
                                    w: $w,
                                    h: $h
                                };
                                imgend++;
                                if(imgend==$size){
                                    _this.$.trigger("imgcomplete",[items,index]);
                                }
                                // if(i==$size-1){
                                //     _this.$.trigger("imgcomplete");
                                // }
                            }
                            $img.onerror=function(){
                                amGloble.msg("图片加载失败,请稍后重试");
                            }
                        }
                    });
                    
                    
                    return;
                }
                var user = amGloble.metadata.userInfo;
                var opt = {
                    parentShopId: user.parentShopId
                };
                var idx;
                for(var i=0;i<_this.photosDom.length;i++){
                    if($(this).parent("ul").hasClass(_this.photosDom[i])){
                        idx=_this.photoSize[i];
                    };
                }
                $.am.debug.log("idx: " + JSON.stringify(idx));
                _this.creatImg($(this),"cert",opt,idx);
            });

            this.$btnOk=this.$.find(".btnGroup").hide();
            this.$.find(".btnSave").vclick(function(){
                _this.saveSign(0);
            });
            this.$.find(".btnOk").vclick(function(){
                _this.saveSign(1);
            });

            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                _this.getData();
            });
            //http://7xvahd.com2.z0.glb.qiniucdn.com/mgj_contract_payment.doc
            //
            //http://dwz.cn/3zqkjr
            this.$.find(".withDrawHelp").vclick(function(){
                window.open("http://dwz.cn/3zqkjr",'_blank', 'location=no');
            });
            this.$.find(".withDrawFile").vclick(function(){
                window.open("http://7xvahd.com2.z0.glb.qiniucdn.com/mgj_contract_payment.doc",'_blank', 'location=no');
            });
            _this.$.on("imgcomplete",function(e,v,i){
                _this.pswpTimer && clearTimeout(_this.pswpTimer);
                console.log(v);
                _this.pswpTimer = setTimeout(function() {
                    amGloble.loading.hide();
                    amGloble.pswp(v,i);
                }, 500);
            });

        },
        beforeShow: function(ret) {
            
        },
        getImgId:function(arr,src){
            var res;
            if(arr){
                for(var i=0;i<arr.length;i++){
                    if(arr[i].value==src){
                        res=arr[i].id;
                    }
                }
            } 
            return res;  
        },
        afterShow: function(paras) {
            console.log(paras);
            this.paras = paras;
            this.$reason=this.$.find(".reason").empty().hide();
            this.getData();
        },
        beforeHide: function() {},
        render:function(data){
            this.setValue(data);
            if(data.status==1 || data.status==2){//0: 未提交 1：提交审核 2：已签约 3：已驳回
                this.disableInput(true);
            }else{
                this.disableInput(false);
            }
            this.refresh();
        },
        creatObj:function(input,photo){
            this.InputObj={};
            this.photoObj={};
            for(var i=0;i<input.length;i++){
                this.InputObj[input[i]]=this.$.find(".listInputBox ."+input[i]);
            }
            for(var i=0;i<photo.length;i++){
                this.photoObj[photo[i]]=this.$.find(".photoBox ."+photo[i]);
            }
        },
        creatImg:function($dom,type,data,size){
            var self=this;
            amGloble.photoManager.takePhoto(type, data, function(uuid) {
                //alert(uuid);
                $dom.html(amGloble.photoManager.createImage(type, data, uuid,"s")).addClass('del');
                $dom.data("id",uuid);
                if ($dom.hasClass("add")) {
                    $dom.removeClass("add");
                    if ($dom.parent("ul").find("li").length < size) {
                        $dom.parent("ul").append('<li class="add am-clickable"></li>');
                    }
                    if($dom.parent("ul").find("li").length>3){
                        self.refresh();
                    }
                } else {

                }
            }, function() {
                console.log("fail");
            });
        },
        disableInput:function(flag){
            $.am.debug.log("disableInput: " + flag);
            var InputObj=this.InputObj;
            if(flag){// true 灰掉
                for(var i in InputObj){
                    InputObj[i].prop("readonly","readonly").parents(".list").addClass('disabled');
                }
                this.$.find(".photoBox .tit span").addClass('disabled');
            }else{
                for(var i in InputObj){
                    if(InputObj[i].parents(".list").hasClass("disabled")){
                        InputObj[i].removeAttr("readonly").parents(".list").removeClass('disabled');
                    }
                }
                this.$.find(".photoBox .tit span").removeClass('disabled');
            }
        },
        getValue:function(){
            var InputObj=this.InputObj,res={};

            for(var i in InputObj){
                res[i]=InputObj[i].val();
            }
            return res;
        },
        setValue:function(data){
            //data.status=0;
            var InputObj=this.InputObj;
            var photoObj=this.photoObj;
            for(var i in data){
                if(InputObj[i]){
                    InputObj[i].val(data[i]);
                }
            }
            var photoSizeArr={
                contracts:8,
                license:2,
                ownerId:2
            };
            for(var j in photoObj){
                if(data[j]){
                    var photos = data[j].split(",");
                    var $photos=photoObj[j].empty();
                    var w=Math.floor(($(".am-widthLimite").width() - 24) / 3);
                    for(var i=0;i<photos.length;i++){
                        var $img =amGloble.photoManager.createImage("cert", {
                            parentShopId:amGloble.metadata.userInfo.parentShopId
                        }, photos[i],"s").addClass('del');
                        if(data.status==0 || data.status==3){
                            $photos.append($("<li class='add del am-clickable'></li>").data("id",photos[i]).append($img));
                        }else{
                            $photos.append($("<li class='disabled bigImg am-clickable'></li>").data("id",photos[i]).append($img));
                        }
                        

                        if(i==photos.length-1 && photos.length<photoSizeArr[j] && (data.status==0 || data.status==3)){
                            $photos.append($("<li class='add am-clickable'></li>"));
                        }

                    }
                }else{
                    photoObj[j].empty().append($("<li class='add am-clickable'></li>").data("id",""));
                }
            }
            
        },
        checkValue:function(data){
            if(data.status==1){
                var ownerImg=data.ownerId.split(",");
                if(!data.contact){
                    amGloble.msg("请填写您的姓名！");
                    return false;
                }else if(data.phone=="" || !(/^1[3|4|5|7|8]\d{9}$/.test(data.phone))){
                    amGloble.msg("请填写正确的手机号码！");
                    return false;
                }else if(!data.alipayAccount){
                    amGloble.msg("请填写正确的提现账号！");
                    return false;
                }else if(!data.alipayOwner){
                    amGloble.msg("请填写账号所有者姓名！");
                    return false;
                }else if(data.contracts.length<1){
                    amGloble.msg("请上传协议！");
                    return false;
                }else if(data.license.length<1){
                    amGloble.msg("请上传营业执照！");
                    return false;
                }else if(ownerImg.length<2){
                    amGloble.msg("请上传正反身份证照！");
                    return false;
                }else{
                    return true;
                }
            }else{
                return true;
            }
        },
        saveSign:function(stu){
            var inputValue=this.getValue();
            var self=this;
            var photoObj=this.photoObj;
            var photos={};
            for(var i in photoObj){
                photos[i]=[];
                photoObj[i].find("li").each(function(){
                    var id = $(this).data("id");
                    if (id) {
                        photos[i].push(id);
                    }
                });
            }

            for(var j in photos){
                photos[j]=photos[j].join(",");
            }
            var res=$.extend({},photos,inputValue);
            //res.status=self.status || 0;
            res.parentShopId=amGloble.metadata.userInfo.parentShopId;
            res.status=stu;
            if(!this.checkValue(res)){
                return false;
            }
            var msg=stu?"提交成功":"保存成功";
            amGloble.api.saveSigning.exec(res, function(ret) {
                // amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    self.setStatus("normal");
                    amGloble.msg(msg);
                    self.getData();
                } else {
                    self.setStatus("error");
                }
            });
        },
        renderStatus:function(status,reason){
            var $reason=this.$reason,
                $stu=this.$stu;
             //0: 未提交 1：提交审核 2：已签约 3：已驳回
            var stuData={
                "0":{
                    "text":"未签约",
                    "color":"#e41919",
                    "reason":""
                },
                "1":{
                    "text":"签约中",
                    "color":"#f58a00",
                    "reason":""
                },
                "2":{
                    "text":"已签约",
                    "color":"#32c972",
                    "reason":""
                },
                "3":{
                    "text":"被驳回",
                    "color":"#e41919",
                    "reason":reason
                }
            }
            var nowStatus=stuData[status];
            $.am.debug.log("nowStatus: " + JSON.stringify(nowStatus));
            if(nowStatus.reason){
                $reason.text("驳回理由："+nowStatus.reason).show();
            }else{
                $reason.hide();
            }
            $stu.text(nowStatus.text).css("color",nowStatus.color);
            if(status==1 || status==2){
                this.$btnOk.hide();
                //this.$btnOk.show();
            }else{
                this.$btnOk.show();
            }
            this.refresh();
            
        },
        getData:function(){

            var self=this;
            this.setStatus("loading");
            amGloble.api.getSigning.exec({
                "parentShopId":amGloble.metadata.userInfo.parentShopId             
            }, function(ret) {
                // amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    self.resmessage=ret.content;
                    self.setStatus("normal");
                    if(ret.content){
                        self.renderStatus(ret.content.status,ret.content.rejectReason);
                        self.render(ret.content);
                    }else{
                        self.status=0;
                        self.renderStatus(0,"");
                    }
                    
                } else {
                    self.setStatus("error");
                }
            });
        }

    });


})();
