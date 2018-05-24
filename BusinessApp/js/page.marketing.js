(function() {

    var self = amGloble.page.marketing = new $.am.Page({
        id: "page-marketing",
        init: function() {
            var self = this;
            this.$listBox = $('.page-marketing .listBox ul');

            this.$.find('.footTab span').vclick(function(){
                var $this = $(this);
                var idx = $this.index();
                $this.addClass("selected").siblings().removeClass("selected");
                self.getData(idx);
            });

            this.$.on('vclick','.listBox li',function(){
                var _item = $(this).data('item');
                var _tabindex = self.$.find('.footTab span.selected').index();
                var opt = {
                    tabindex : _tabindex
                };
                if(_tabindex == 0 || _tabindex == 1){   //进行中,已结束
                    opt.activityId = _item.id;
                    opt.templateId = _item.template.id;
                    opt.status = _item.status;
                    opt.title = _item.title;
                    opt.starttime = _item.starttime;
                    opt.finishtime = _item.finishtime;
                    opt.img = eval(_item.template.resources)[0].img;
                    opt.icon = eval(_item.template.resources)[0].icon;
                }else if(_tabindex == 2){   //可用
                    opt.templateId = _item.id;
                    opt.title = _item.title;
                    opt.status = _item.status;
                    opt.img = eval(_item.resources)[0].img;
                    opt.icon = eval(_item.resources)[0].icon;
                }else if(_tabindex == 3){   //自有营销
                    opt.activityId = _item.activityId;
                    opt.title = _item.msgTitle;
                    opt.status = _item.status;
                }
                $.am.changePage(amGloble.page.activitydata, "slideleft", opt);
            });
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }

            this.imgHeight = 'height:' + Math.floor((window.innerWidth - 20)*270/640) + 'px';  //计算图片高度
            this.$.find('.footTab span').eq(0).addClass('selected').siblings().removeClass("selected");
            this.getData(0);
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            var _index = this.$.find('.footTab span.selected').index();
            this.getData(_index);
        },
        // touchBottom: function() {
            
        // },
        getData: function(tabindex){
            var self = this;

            amGloble.loading.show("正在获取,请稍候...");
            if(tabindex == 0 || tabindex == 1){ //进行中,已结束
                amGloble.api.marketingToolsList.exec({

                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0 && ret.message == "success") {
                        var data = ret.content;
                        if(tabindex == 0){  //进行中
                            var d1 = self.getDataByStatus(data,1);
                            var d2 = self.getDataByStatus(data,3);
                            var _d = d1.concat(d2);
                            if(_d.length == 0){
                                self.showEmpty(tabindex);
                            }else{
                                self.renderInuse( _d );  //1进行中 3已停用
                            }
                        }else{  //已结束
                            var _d = self.getDataByStatus(data,2);
                            if(_d.length == 0){
                                self.showEmpty(tabindex);
                            }else{
                                self.renderEnded( _d );   //2已结束
                            }
                        }
                    } else {
                        amGloble.msg(ret.message || "数据获取失败,请重试!");
                    }
                    self.closeTopLoading();
                    self.closeBottomLoading();
                });
            }else if(tabindex == 2){    //可用的
                amGloble.api.marketingToolsAvailable.exec({

                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0 && ret.message == "success") {
                        var _d = ret.content;
                        if(_d.length == 0){
                            self.showEmpty(tabindex);
                        }else{
                            self.renderUsable(_d);
                        }
                    } else {
                        amGloble.msg(ret.message || "数据获取失败,请重试!");
                    }
                    self.closeTopLoading();
                    self.closeBottomLoading();
                });
            }else{  //3:自有营销
                amGloble.api.marketingToolsGetOwnPackage.exec({

                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0 && ret.message == "success") {
                        var _d = ret.content;
                        if(_d.length == 0){
                            self.showEmpty(tabindex);
                        }else{
                            self.renderOwnPackage(_d);
                        }
                    } else {
                        amGloble.msg(ret.message || "数据获取失败,请重试!");
                    }
                    self.closeTopLoading();
                    self.closeBottomLoading();
                });
            }
        },
        getDataByStatus : function(data,status){
            var arr = [];
            for(var i=0; i<data.length; i++){
                if( data[i].status == status ){
                    arr.push(data[i]);
                }
            }
            return arr;
        },
        renderInuse: function(data) {   //进行中
            this.clearListBox();
            for(var i=0; i<data.length; i++){
                var _src = eval(data[i].template.resources)[0].img;
                var _timestr = '';
                if(data[i].starttime){
                    _timestr = data[i].starttime.split(' ')[0].replace(/-/g,'.') +'~'+ data[i].finishtime.split(' ')[0].replace(/-/g,'.');
                }
                if(data[i].status == 1){    //启用
                    var _temp = '';
                }else if(data[i].status == 3){  //停用
                    var _temp = '<div class="imgmask"></div><p class="stopmask">该活动暂停中,请到PC端操作启用</p>'
                }

                var $li = $('<li class="am-clickable">' +
                                '<div style="'+ this.imgHeight +'" class="imgwrap">' +
                                    '<img style="'+ this.imgHeight +'" src="'+ window.defaultConfig.filesMgr + _src +'" />' +
                                    _temp +
                                '</div>' +
                                '<div class="marketintro">' +
                                    '<h2>'+ data[i].title +'</h2>' +
                                    '<p>活动时间: '+ _timestr +'</p>' +
                                    '<span class="introspan">查看营销效果</span>' +
                                '</div>' +
                            '</li>');
                $($li).data('item',data[i]);
                this.$listBox.append($li);
            }
            this.refresh();
        },
        renderEnded: function(data) {   //已结束
            this.clearListBox();
            for(var i=0; i<data.length; i++){
                var _src = eval(data[i].template.resources)[0].img;
                var _timestr = '';
                if(data[i].starttime){
                    _timestr = data[i].starttime.split(' ')[0].replace(/-/g,'.') +'~'+ data[i].finishtime.split(' ')[0].replace(/-/g,'.');
                }

                var $li = $('<li class="am-clickable">' +
                                '<div style="'+ this.imgHeight +'" class="imgwrap">' +
                                    '<img style="'+ this.imgHeight +'" src="'+ window.defaultConfig.filesMgr + _src +'" />' +
                                    '<div class="imgmask"></div>' +
                                    '<p class="pmask">活动已结束~</p>' +
                                '</div>' +
                                '<div class="marketintro">' +
                                    '<h2>'+ data[i].title +'</h2>' +
                                    '<p>活动时间: '+ _timestr +'</p>' +
                                    '<span class="introspan">查看营销效果</span>' +
                                '</div>' +
                            '</li>');
                $($li).data('item',data[i]);
                this.$listBox.append($li);
            }
            this.refresh();
        },
        renderUsable: function(data) {   //可用的
            this.clearListBox();
            for(var i=0; i<data.length; i++){
                var _src = eval(data[i].resources)[0].img;
                var $li = $('<li class="am-clickable">' +
                                '<div style="'+ this.imgHeight +'" class="imgwrap">' +
                                    '<img style="'+ this.imgHeight +'" src="'+ window.defaultConfig.filesMgr + _src +'" />' +
                                '</div>' +
                                '<div class="marketintro">' +
                                    '<h2 class="pd80">'+ data[i].title +'</h2>' +
                                    '<span class="lookintro">查看简介</span>' +
                                '</div>' +
                            '</li>');
                $($li).data('item',data[i]);
                this.$listBox.append($li);
            }
            this.refresh();
        },
        renderOwnPackage: function(data){   //自有营销
            this.clearListBox();
            for(var i=0; i<data.length; i++){
                var $li = $('<li class="am-clickable">' +
                                '<div style="'+ this.imgHeight +'" class="imgwrap">' +
                                    '<img style="'+ this.imgHeight +'" src="css/img/marketing04.jpg" />' +
                                '</div>' +
                                '<div class="marketintro">' +
                                    '<h2 class="pd80 redpacket">'+ data[i].msgTitle +'</h2>' +
                                    '<span class="lookintro">查看营销效果</span>' +
                                '</div>' +
                            '</li>');
                $($li).data('item',data[i]);
                this.$listBox.append($li);
            }
            this.refresh();
        },
        clearListBox: function(){
            this.$listBox.html('');
        },
        showEmpty: function(tabindex){
            var emptyArr = [
                '空空哒,暂未启用任何营销包~',
                '空空哒,暂无已结束营销包~',
                '空空哒,暂无可用营销包~',
                '空空哒,近期未使用自选营销~'
            ];
            var _li = '<li class="emptyli">'+ emptyArr[tabindex] +'</li>';
            this.$listBox.html( _li );
            this.refresh();
        }
    });

})();