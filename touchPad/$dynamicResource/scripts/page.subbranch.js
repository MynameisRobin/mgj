(function() {
    var that = am.page.subbranch = new $.am.Page({
        id: "page_subbranch",
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function() {

        },
        beforeShow: function(opt) {
          this.subRenderProduct(opt)
        },
        afterShow: function(opt) {
           this.subbranchGetData(1,opt);
        },
        beforeHide: function() {

        },
        afterHide: function() {

        },
        subbranchGetData: function(i,opt) {
            var self = this;
            am.loading.show();
            console.log(opt.id);
            console.log(opt.no);
            $(".page_subbranch .rtContentSub .subListContent li").remove();
            am.api.storageSubbranch.exec({
                "parentShopId":am.metadata.userInfo.parentShopId,
                "shopId":am.metadata.userInfo.shopId,
                "pageSize":9999,
                "pageNum":1,
                "keyword":opt.no,
                "id":opt.id
                // "parentShopId":668880,
                // "shopId":668881,
                // "pageSize":13,
                // "pageNum":1,
                //  "keyword":"006",
                // "id":16615
            }, function(res) {
                am.loading.hide();
                console.log(res);
                if (res.code == 0 && res.content && res.content.length) {
                    self.subbranchRender(0,res.content);
                    // self.subListScroll();
                }else if(res.code == 0 && (!res.content || !res.content.length)){
                    am.msg('暂时没有数据！');
                }else if(res.code == -1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络错误',
                        description: '发生网络错误，请检查网络',
                        okCaption: '重试',
                        cancelCaption: '返回'
                    }, function(){
                        that.subbranchGetData(i);
                    }, function(){
                        $.am.page.back();
                    });
                }else{
                    am.msg('哎呀，出错了！');
                    $.am.page.back();
                }
            });
        },
        subTemplate:"<li>"+"\n"+
                      "<div>{{type}}</div>"+"\n"+
                      "<div>{{name}}</div>"+"\n"+
                      "<div>{{num}}</div>"+"\n"+
                      "<div>"+"\n"+
                             "<p class="+"branch></p>"+"\n"+
                             "<p class="+"subName>{{shopName}}</p>"+"\n"+
                      "</div>"+"\n"+
                     "<div>{{shopNum}}</div>"+"\n"+
                     "</li>",
        subbranchRender:function (index,data){
            var self=this;
            var subCurrentData=data.slice(index*13,(index+1)*13);
            var $ul= $(".page_subbranch .subbranchList .rtContentSub .subListContent ul");
                $ul.empty();
             var html="";
              console.log(subCurrentData);
            for(var i=0;i<subCurrentData.length;i++){
                if(self.getShopName(subCurrentData[i].shopid)){
                    html+= self.subTemplate
                    .replace('{{type}}',subCurrentData[i].no)
                    .replace('{{name}}',subCurrentData[i].name)
                    .replace('{{num}}',self.checkNull(subCurrentData[i].num))
                    .replace('{{shopName}}',self.getShopName(subCurrentData[i].shopid))
                    .replace('{{shopNum}}',self.getPhone(subCurrentData[i].shopid));
                }
            }
            $ul.html(html);
            self.subListScroll();
        },
		checkNull: function(n){
			if(n == null || n == "null"){
				return "--";
			}
			return n;
		},
        getType:function (id){
            var name="";
            for (var i=0;i<am.metadata.category.length;i++){
                if (am.metadata.category[i].marqueid==id){
                    return name=am.metadata.category[i].type;
                }
            }
        },
        getShopName:function (id){
            var name="";
            console.log(id);
            for (var i=0;i<am.metadata.shopList.length;i++){
                if (am.metadata.shopList[i].shopId==id){
                    return name=am.metadata.shopList[i].shopName+(am.metadata.shopList[i].osName?am.metadata.shopList[i].osName:"");
                }
            }
        },
        getPhone:function (id){
            var num="";
            for (var i=0;i<am.metadata.shopList.length;i++){
                if (am.metadata.shopList[i].shopId==id){
                    return num=am.metadata.shopList[i].fstphone?am.metadata.shopList[i].fstphone:"-  -";
               }
            }
        },
        renderProduct: function(opt){
            if(!this.$img){
                this.$img = this.$.find('.aside .imgSub');
            }
            if(!this.$discrip){
                this.$discrip = this.$.find('.discripSub p');
            }
            if(!this.$num){
                this.$num = this.$.find('.numSub p');
            }

            if(opt.mgjdepotlogo){
                var $img = am.photoManager.createImage("goods", {
                    parentShopId: am.metadata.userInfo.parentShopId
                }, opt.mgjdepotlogo, "s");
                this.$img.html($img);
            }else{
                this.$img.empty();
            }

            this.$discrip.text(opt.name);
            this.$num.text('编码:'+opt.no);
        },
        subListScroll:function (){
            var self=this;
            var $parent=$(".page_subbranch .subbranchList .rtContentSub .subListContent")
            this.outListLeftScroll = new $.am.ScrollView({
                $wrap : $parent,
                $inner : $parent.find("ul"),
                direction : [false, true],
                hasInput: false
            });
            this.outListLeftScroll.refresh();
            this.outListLeftScroll.scrollTo('top');
        },
        subRenderProduct: function(opt){
            if(!this.$img){
                this.$img = this.$.find('.asideSub .imgSub');
            }
            if(!this.$discrip){
                this.$discrip = this.$.find('.discripSub p');
            }
            if(!this.$num){
                this.$num = this.$.find('.numSub p');
            }

            if(opt.mgjdepotlogo){
                var $img = am.photoManager.createImage("goods", {
                    parentShopId: am.metadata.userInfo.parentShopId
                }, opt.mgjdepotlogo, "s");
                this.$img.html($img);
            }else{
                this.$img.empty();
            }

            this.$discrip.text(opt.name);
            this.$num.text('编码:'+opt.no);
        }

    })
})();
