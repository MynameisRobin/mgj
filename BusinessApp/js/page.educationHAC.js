(function(){
	amGloble.page.educationHAC = new $.am.Page({
        id: "page-educationHAC",
        init: function(){
            var self = this;

            this.list = this.$.find('.list');
            this.error = this.$.find('.error');

        	this.nav = this.$.find('.nav').on('vclick','li',function(){
                var index = $(this).index();
                if(!$(this).hasClass('active')){
                    $(this).addClass('active').siblings().removeClass('active');
                    self.render(self.getDate(index));
                }
            });

            this.videoList = this.$.find('.list').on('vclick','li',function(){
                var data = $(this).data('data');
                //切换视频详情页
                $.am.changePage(amGloble.page.videodetails,'slideleft',data);
            });
        },
        beforeShow: function(para){   
            if(para=='back'){
                para = 0;
            }
            this.list.empty();
            this.nav.find('li').eq(para).addClass('active').siblings().removeClass('active');
        },
        afterShow: function(para){
            if(para=='back'){
                para = 0;
            }
            this.render(this.getDate(para));
        },
        beforeHide: function(){},
        afterHide: function(){
            
        },
        render: function(data){
            this.list.empty();
            amGloble.loading.show();
            if(!data.length){
                this.error.show();
                amGloble.loading.hide();
                this.scrollview.refresh();
                this.scrollview.scrollTo('top');
                return;
            }
            this.error.hide();
            for(var i=0;i<data.length;i++){
                var html = '';
                html += amGloble.page.education.template.replace('{{src}}',Gallery.imgConfig.getUrl(data[i].cover,'videoCover','s')).replace('{{plays}}',data[i].plays).replace('{{title}}',data[i].title);
                var li = $(html);

                var college = '';
                if(data[i].organizationname && data[i].teachername){
                    college = data[i].organizationname + ' / ' + data[i].teachername;
                }else if(data[i].organizationname && !data[i].teachername){
                    college = data[i].organizationname;
                }else if(!data[i].organizationname && data[i].teachername){
                    college = data[i].teachername
                }
                li.find('.college').html(college);

                if(data[i].keyword){
                    var keywordsArr = data[i].keyword.replace(/，/g,',').split(',');
                    var keywords = '';
                    for(var j=0;j<keywordsArr.length;j++){
                        keywords += '<span>'+ keywordsArr[j] +'</span>';
                    }
                    li.find('.keywords').html(keywords);
                }

                this.list.append(li.data('data',data[i]));
            }
            //关键字显示不全隐藏
            for(var i=0;i<this.list.find('li').length;i++){
                var width = 0;
                var wrapperWidth = this.list.find('li').eq(i).find('.keywords').width();
                for(var j=0;j<this.list.find('li').eq(i).find('.keywords span').length;j++){
                    width += this.list.find('li').eq(i).find('.keywords span').eq(j).outerWidth(true);
                    if(width>wrapperWidth){
                        this.list.find('li').eq(i).find('.keywords span').eq(j).hide();
                    }
                }
            }

            var imgList = this.list.find('img');
            imgList.each(function() {
                var self = $(this);
                if (self.attr('data-src')) {
                    var img = new Image();
                    img.src = self.attr('data-src');
                    img.onload = function() {
                        self.attr('src', self.attr('data-src')).show();
                        
                    };
                }
            });

            amGloble.loading.hide();
            this.scrollview.refresh();
            this.scrollview.scrollTo('top');
        },
        getDate: function(index){
            var data;
            if(index==0){
                data = amGloble.page.education.getStorage('educationHistory');
            }else if(index==1){
                data = amGloble.page.education.getStorage('educationCollection');
            }
            return data;
        }
    });
})();