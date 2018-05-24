(function(){
    var self = amGloble.page.audit = new $.am.Page({
        id: 'page-audit',
        init:function(){
            var self = this;
            this.$tab = this.$.find('.tab').on('vclick','li',function(){
                $(this).addClass('selected').siblings().removeClass('selected');
                self.type = $(this).data('type');
                self.getDate();
            });

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find('.am-body-wrap'),
                onchange: function() {
                    self.getPeriod(self.reportFilter.getDate());
                    self.getDate();
                }
            });
            this.sv_tab = new $.am.ScrollView({
                $wrap: this.$tab,
                $inner: this.$tab.find('ul'),
                direction: [1, 0]
            });

            this.loading = this.$.find('.loadingContent');
            this.empty = this.$.find('.error');
            this.reload = this.$.find('.reload').on('vclick','.button-common',function(){
                self.getDate();
            });

            this.$summary = this.$.find('.summary');
            this.$summaryItem = this.$summary.find('.wrap').remove();
            this.$form = this.$.find('.form .wrapper');
        },
        backButtonOnclick:function(){
            $('.mbsc-fr-btn-c div').trigger('click');
            $.am.page.back();
        },
        beforeShow:function(paras){
            this.refresh = true;
            if(paras=='back'){
                this.refresh = false;
            }
            if(!this.hasSetTab){
                var ws = [0];
                var w = 0;
                var tabLis = this.$tab.find('li');
                for(var i=0;i<tabLis.length;i++){
                    ws.push($(tabLis[i]).outerWidth());
                    w += $(tabLis[i]).outerWidth();
                }
                for(var i=0;i<tabLis.length;i++){
                    var l = 0;
                    for(var j=0;j<=i;j++){
                        l += ws[j];
                    }
                    $(tabLis[i]).css('left',l+'px');
                }
                this.$tab.find('ul').css('width',w+'px');
                this.sv_tab.refresh();
                this.hasSetTab = 1;
            }

            amGloble.storeSelect.onShopChange = function (shops) {
                self.getDate();
            };
            var start;
            var now = new Date(),
                m = now.getMonth();
                d = now.getDate();
            if(amGloble.metadata.userInfo.newRole == 1){
                now.setDate(d-1);
            }else {
                now.setMonth(m-1);
            }
            start = now;
            this.reportFilter.setOpt({
                start: start,
                end: new Date(),
                refresh: self.refresh
            });

            this.getPeriod(this.reportFilter.getDate());

            this.$tab.find('.selected').trigger('vclick');
        },
        afterShow:function(){
           
        },
        beforeHide:function(){

        },
        afterHide:function(){

        },
        getPeriod:function(arr){
            var start = arr[0],end = arr[1];
            var period = new Date(start).format('yyyy-mm-dd')+'_'+new Date(end).format('yyyy-mm-dd');
            this.period = period;
        },
        getDate:function(){
            if(this.api){
                this.api.abort();
            }
            var self = this;
            self.loading.show();
            self.empty.hide();
            self.reload.hide();
            self.$form.empty();
            self.$summary.empty();

            var shop = amGloble.storeSelect.getCurrentShops();
            if(!shop){
                //如果当前没有选择问题，选择第一个
                amGloble.storeSelect.selectShop(0, true);
                shop = amGloble.storeSelect.getCurrentShops();
            }
            if (shop) {
                //单个门店
                shop = [shop];
            } else {

                //多门店
                shop = amGloble.metadata.shops.filter(function (item) {
                    return item.mgjversion == 3;
                });
            };
            this.shopId = shop[0].shopId;
            this.api = amGloble.api['audit_'+self.type].exec({
                shopid: shop[0].shopId,
                period: self.period
                // period: '2016-01-01_2018-05-05'
            }, function (ret) {
                self.loading.hide();
                amGloble.loading.hide();
                if (ret && ret.code == 0 && ret.content ) {
                    self.render(ret.content);
                }else {
                    self.reload.show();
                    self.$form.empty();
                    self.$summary.empty();
                }
            });
        },
        render:function(data){
            if(data.length){
                this.empty.hide();
                if(this.type=='archives'){
                    this.renderArchives(data);
                }else if(this.type=='todolist'){
                    this.renderTodolist(data);
                }else if(this.type=='reservation'){
                    this.renderReservation(data);
                }else if(this.type=='invention'){
                    this.renderInvention(data);
                }else if(this.type=='topic'){
                    this.renderTopic(data);
                }
                this.scrollview.refresh();
                this.scrollview.scrollTo('top');
            }else {
                this.empty.show();
            }
        },
        renderArchives:function(data){
            data.sort(function(a,b){
                return (b.CST+b.ACS) - (a.CST+a.ACS);
            });
            var $header = $('<div class="item col3 header">'+
                            '<div>姓名</div>'+
                            '<div>服务客数</div>'+
                            '<div>基本档案</div>'+
                        '</div>');
            this.$form.append($header);
            var $list = $('<div class="list"></div>').on('vclick','.item',function(){
                var data = $(this).data('data');
                data.shopId = self.shopId;
                data.time = self.reportFilter.getDate()
                $.am.changePage(amGloble.page.auditArchives,'slideleft',data);
            });
            this.$form.append($list);
            var CST = 0, ACS = 0;
            for(var i=0;i<data.length;i++){
                var $item = $('<div class="item col3 am-clickable">'+
                '<div>'+data[i].NAME+'</div>'+
                '<div>'+data[i].CST+'</div>'+
                '<div>'+data[i].ACS+'</div>'+
                '</div>');
                CST += data[i].CST;
                ACS += data[i].ACS;
                $list.append($item.data('data',data[i]));
            }
            var $CST = this.$summaryItem.clone();
            $CST.find('.num').html(CST).end().find('.tip').html('服务客数(总)').end().find('.icon').addClass('archives_CST');
            this.$summary.append($CST);

            var $ACS = this.$summaryItem.clone();
            $ACS.find('.num').html(ACS).end().find('.tip').html('基本档案(总)').end().find('.icon').addClass('archives_ACS');
            this.$summary.append($ACS);
        },
        renderTodolist:function(data){
            data.sort(function(a,b){
                return (b.ED_CNT+b.UN_CNT) - (a.ED_CNT+a.UN_CNT);
            });
            var $header = $('<div class="item col4 header">'+
                            '<div>姓名</div>'+
                            '<div>已处理</div>'+
                            '<div>未处理</div>'+
                            '<div>总计</div>'+
                        '</div>');
            this.$form.append($header);
            var $list = $('<div class="list"></div>').on('vclick','.item',function(){
                var data = $(this).data('data');
                data.time = self.reportFilter.getDate();
                $.am.changePage(amGloble.page.todoList,'slideleft',data);
            });
            this.$form.append($list);
            var ED_CNT = 0, UN_CNT = 0;
            for(var i=0;i<data.length;i++){
                var $item = $('<div class="item col4 am-clickable">'+
                '<div>'+data[i].NAME+'</div>'+
                '<div>'+data[i].ED_CNT+'</div>'+
                '<div>'+data[i].UN_CNT+'</div>'+
                '<div>'+(data[i].ED_CNT+data[i].UN_CNT) +'</div>'+
                '</div>');
                ED_CNT += data[i].ED_CNT;
                UN_CNT += data[i].UN_CNT;
                $list.append($item.data('data',data[i]));
            }

            var $CNT = this.$summaryItem.clone();
            $CNT.find('.num').html(ED_CNT+UN_CNT).end().find('.tip').html('待办事项(总)').end().find('.icon').addClass('todolist_CNT');
            this.$summary.append($CNT);

            var $ED_CNT = this.$summaryItem.clone();
            $ED_CNT.find('.num').html(ED_CNT).end().find('.tip').html('已处理(总)').end().find('.icon').addClass('todolist_ED_CNT');
            this.$summary.append($ED_CNT);

            var $UN_CNT = this.$summaryItem.clone();
            $UN_CNT.find('.num').html(UN_CNT).end().find('.tip').html('未处理(总)').end().find('.icon').addClass('todolist_UN_CNT');
            this.$summary.append($UN_CNT);

        },
        renderReservation:function(data){
            data.sort(function(a,b){
                return b.REV - a.REV;
            });
            var $header = $('<div class="item col5 header">'+
                            '<div>姓名</div>'+
                            '<div>总预约次数</div>'+
                            '<div>反预约次数</div>'+
                            '<div>到店次数</div>'+
                            '<div>到店率</div>'+
                        '</div>');
            this.$form.append($header);
            var $list = $('<div class="list"></div>').on('vclick','.item',function(){
                var data = $(this).data('data');
                data.eid = data.EMPID;
                data.shopId = self.shopId;
                $.am.changePage(amGloble.page.reservation,'slideleft',data);
            });
            this.$form.append($list);
            var CNT = 0, AVR = 0, REV = 0;
            for(var i=0;i<data.length;i++){
                var $item = $('<div class="item col5 am-clickable">'+
                '<div>'+data[i].NAME+'</div>'+
                '<div>'+data[i].CNT+'</div>'+
                '<div>'+data[i].REV+'</div>'+
                '<div>'+data[i].AVR+'</div>'+
                '<div>'+((data[i].AVR/data[i].CNT)*100).toFixed(2)+'%'+'</div>'+
                '</div>');
                REV += data[i].REV;
                CNT += data[i].CNT;
                AVR += data[i].AVR;
                $list.append($item.data('data',data[i]));
            }

            var $CNT = this.$summaryItem.clone();
            $CNT.find('.num').html(CNT).end().find('.tip').html('总预约次数').end().find('.icon').addClass('reservation_CNT');
            this.$summary.append($CNT);

            var $REV = this.$summaryItem.clone();
            $REV.find('.num').html(REV).end().find('.tip').html('反预约次数(总)').end().find('.icon').addClass('reservation_CNT');
            this.$summary.append($REV);

            var $AVR = this.$summaryItem.clone();
            $AVR.find('.num').html(AVR).end().find('.tip').html('到店次数(总)').end().find('.icon').addClass('reservation_AVR');
            this.$summary.append($AVR);

            var $RATE = this.$summaryItem.clone();
            $RATE.find('.num').html(((AVR/CNT)*100).toFixed(2)+'%').end().find('.tip').html('到店率(总)').end().find('.icon').addClass('reservation_RATE');
            this.$summary.append($RATE);
        },
        renderInvention:function(data){
            data.sort(function(a,b){
                return b.CNT - a.CNT;
            });
            var $header = $('<div class="item col4 header">'+
                            '<div>姓名</div>'+
                            '<div>作品数</div>'+
                            '<div>点赞数</div>'+
                            '<div>评论数</div>'+
                        '</div>');
            this.$form.append($header);
            var $list = $('<div class="list"></div>').on('vclick','.item',function(){
                var data = $(this).data('data');
                data.shopId = self.shopId;
                data.time = self.reportFilter.getDate()
                $.am.changePage(amGloble.page.archiveList,'slideleft',data);
            });
            this.$form.append($list);
            var CNT = 0, LIKES = 0, CMT = 0;
            for(var i=0;i<data.length;i++){
                var $item = $('<div class="item col4 am-clickable">'+
                '<div>'+data[i].EMPNAME+'</div>'+
                '<div>'+data[i].CNT+'</div>'+
                '<div>'+data[i].LIKES+'</div>'+
                '<div>'+data[i].CMT+'</div>'+
                '</div>');
                CNT += data[i].CNT;
                LIKES += data[i].LIKES;
                CMT += data[i].CMT;
                $list.append($item.data('data',data[i]));
            }
            var $CNT = this.$summaryItem.clone();
            $CNT.find('.num').html(CNT).end().find('.tip').html('作品数(总)').end().find('.icon').addClass('invention_CNT');
            this.$summary.append($CNT);

            var $LIKES = this.$summaryItem.clone();
            $LIKES.find('.num').html(LIKES).end().find('.tip').html('点赞数(总)').end().find('.icon').addClass('invention_LIKES');
            this.$summary.append($LIKES);

            var $CMT = this.$summaryItem.clone();
            $CMT.find('.num').html(CMT).end().find('.tip').html('评论数(总)').end().find('.icon').addClass('invention_CMT');
            this.$summary.append($CMT);
        },
        renderTopic:function(data){
            data.sort(function(a,b){
                return b.CNT - a.CNT;
            });
            var $header = $('<div class="item col5 header">'+
            '<div>姓名</div>'+
            '<div>记录数</div>'+
            '<div>精华数</div>'+
            '<div>点赞数</div>'+
            '<div>评论数</div>'+
            '</div>');
            this.$form.append($header);
            var $list = $('<div class="list"></div>').on('vclick','.item',function(){
                var data = $(this).data('data');
                data.shopId = self.shopId;
                $.am.changePage(amGloble.page.community,'slideleft',data);
            });
            this.$form.append($list);
            var CNT = 0, ELITE = 0, SUPPORTNUM = 0, COMMENTNUM = 0;
            for(var i=0;i<data.length;i++){
                var $item = $('<div class="item col5 am-clickable">'+
                '<div>'+data[i].NAME+'</div>'+
                '<div>'+data[i].CNT+'</div>'+
                '<div>'+data[i].ELITE+'</div>'+
                '<div>'+data[i].SUPPORTNUM+'</div>'+
                '<div>'+data[i].COMMENTNUM+'</div>'+
                '</div>');
                CNT += data[i].CNT;
                ELITE += data[i].ELITE;
                SUPPORTNUM += data[i].SUPPORTNUM;
                COMMENTNUM += data[i].COMMENTNUM;
                $list.append($item.data('data',data[i]));
            }
            var $CNT = this.$summaryItem.clone();
            $CNT.find('.num').html(CNT).end().find('.tip').html('记录数(总)').end().find('.icon').addClass('topic_CNT');
            this.$summary.append($CNT);

            var $ELITE = this.$summaryItem.clone();
            $ELITE.find('.num').html(ELITE).end().find('.tip').html('精华数(总)').end().find('.icon').addClass('topic_ELITE');
            this.$summary.append($ELITE);

            var $SUPPORTNUM = this.$summaryItem.clone();
            $SUPPORTNUM.find('.num').html(SUPPORTNUM).end().find('.tip').html('点赞数(总)').end().find('.icon').addClass('topic_SUPPORTNUM');
            this.$summary.append($SUPPORTNUM);

            var $COMMENTNUM = this.$summaryItem.clone();
            $COMMENTNUM.find('.num').html(COMMENTNUM).end().find('.tip').html('评论数(总)').end().find('.icon').addClass('topic_COMMENTNUM');
            this.$summary.append($COMMENTNUM);
        }
    });
})();