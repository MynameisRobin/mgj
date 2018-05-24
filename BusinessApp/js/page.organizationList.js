(function($){
    var replaceTemple = function(str,data,rule) {
       return str.replace(/\{(.*?)\}/g,function(a,b){
           return (rule && rule[b])?rule[b].call(null,data,data[b]):(data[b] || "");
       })
    };
    var typeData={
        teacher:{
            apiName:"listTeacher",
            tips:"点击讲师头像即可查看各讲师详情哦~",
            title:"在线知名讲师"
        },
        organization:{
            apiName:"listOrganization",
            tips:"点击LOGO图片即可查看各机构详情哦~",
            title:"美管加官方合作机构"
        }
    };
    var self =amGloble.page.organizationList = new $.am.Page({
    	id : "page-organizationList",
    	init:function(){

            this.$list=this.$.find(".listBox");
            this.$teacherTemp=this.$list.find(".item")[0].outerHTML;
            this.$organizationTemp=this.$list.find(".itemj")[0].outerHTML;
            this.$list.empty();

            this.$.on("vclick",".item .imgBox",function(){
                var item=$(this).parents(".item").data("item");
                $.am.changePage(amGloble.page.teacher,'slideleft',{teacher:{id:item.id}});
            }).on("vclick",".itemj .imgBox",function(){
                var item=$(this).parents(".itemj").data("item");
                $.am.changePage(amGloble.page.organization,'slideleft',{organization:{id:item.id}});
            });

            this.$tips = this.$.find('.tips');
    	},
    	beforeShow:function(paras){
            if (paras == "back") {
                return;
            }
            this.paras=paras;

            this.setStatus('normal');
            this.$tips.hide();
            this.render(true);
    	},
    	afterShow:function(paras){
            if (paras == "back") {
                return;
            }
    	},
        beforeHide: function(){},
        afterHide: function(){},
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        pageSize: 18,
        pageNumber:1,
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            this.render(true);
        },
        touchBottom: function(){
            if(this.bottomLoading){
                return;
            }
            this.render();
        },
        render:function(refresh){
            if(refresh){
                amGloble.loading.show();
                self.$list.empty();
                self.pageNumber=1;
                self.scrollview.pauseTouchBottom=false;
            }else{
                self.pageNumber++;
            }
            var _type=this.paras.type;
            var type=typeData[_type],
                _temp;
            if(_type=="organization"){
                _temp=this.$organizationTemp;
            }
            if(_type=="teacher"){
                _temp=this.$teacherTemp;
            }
            this.$.find("[data-type]").each(function(){
                var t=$(this).attr("data-type");
                $(this).html(type[t]);
            });

            amGloble.api[type.apiName].exec({
                pageNumber:self.pageNumber,
                pageSize:self.pageSize
            },function(ret){

                amGloble.loading.hide();
                self.closeBottomLoading();
                self.closeTopLoading();

                self.bottomLoading = false;
                self.topLoading = false;
                if(ret && ret.code==0){
                    var list=ret.content;
                    if(list.length){
                        var l=list.length,
                            i;
                        for(i=0;i<l;i++){
                            var item=list[i],
                                _html;
                            _html=replaceTemple(_temp,item,self.listRule);
                            var $html=$(_html).data("item",item);
                            if(_type=="teacher"){
                                $html.find(".imgBox").html(Gallery.imgConfig.createImage(item.icon,"teacherLogo","s"));
                            }
                            if(_type=="organization"){
                                var src=Gallery.imgConfig.getUrl(item.logo,"institutionLogo","n");
                                (function(src,self,$html,item){
                                    self.resetWidth(src,function(_w,_h,ml,mt,tw){
                                        $html.find(".imgBox").html(Gallery.imgConfig.createImage(item.logo,"institutionLogo","n"));
                                        $html.find(".imgBox").css({
                                            "width":tw+"px",
                                            "height":tw+"px",
                                        });
                                        $html.find(".imgBox img").css({
                                            "width":_w+"px",
                                            "height":_h+"px",
                                            "margin-left":ml+"px",
                                            "margin-top":mt+"px"
                                        }).show();
                                    });
                                })(src,self,$html,item);
                            }
                            self.$list.append($html);
                        }
                        self.$tips.show();
                    }else {
                        self.setStatus('empty');
                        self.$tips.hide();
                    }
                    if(!list.length && refresh){
                        self.scrollview.pauseTouchBottom = true;
                    }

                    if(self.$list.find(".item").size()>=ret.totalCount || self.$list.find(".itemj").size()>=ret.totalCount){
                        self.scrollview.pauseTouchBottom = true;
                    }
                    self.scrollview.refresh();
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.render(refresh);
                    }, function(){
                        
                    });
                }
            });
        },
        resetWidth:function(src,callback){
            var tw=(($('body').width()-50)/3)-2;
            var img=new Image();
            img.onload=function(){
                var w=img.width,
                    h=img.height,
                    factor=w/h,
                    _w,_h,ml,mt;

                if(w>=h){//宽大于高
                    _w=tw;
                    _h=tw/factor;
                    ml=0;
                    mt=(tw-_h)/2;
                }else{
                    _h=tw;
                    _w=factor*tw;
                    ml=(tw-_w)/2;
                    mt=0;
                }
                callback && callback(_w,_h,ml,mt,tw+2);
            }
            img.src=src;
        }
    });
})(jQuery);

