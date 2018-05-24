(function() {

    var self = amGloble.page.activitydata = new $.am.Page({
        id: "page-activitydata",
        init: function() {
            var self = this;
            
            this.$datastatistics = this.$.find('.datastatistics');
            this.$marketingintro = this.$.find('.marketingintro');
            this.$share = this.$.find('.am-header .right.share');

            //进入活动页面
            this.$.find('.ad-golink').vclick(function() {
                var data = {
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                };
                if(self.opt.templateId){
                    data.templateId = self.opt.templateId;
                }
                if(self.opt.activityId){
                    data.activityId = self.opt.activityId;
                }
                window.open(defaultConfig.marketingPackageUrl + $.param(data), '_blank', 'location=no');
            });

            //分享
            this.$share.vclick(function() {
                self.share();
            });
        },
        share: function(){
            var data = {
                parentShopId: amGloble.metadata.userInfo.parentShopId
            };
            if(self.opt.templateId){
                data.templateId = self.opt.templateId;
            }
            if(self.opt.activityId){
                data.activityId = self.opt.activityId;
            }
            var shareObj = {
                title: self.opt.title,
                link: defaultConfig.marketingPackageUrl + $.param(data),
                imgUrl: window.defaultConfig.filesMgr + self.opt.icon
            };
            amGloble.share(shareObj);
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }

            this.opt = ret;
            this.starttime = ret.starttime ? ret.starttime.split(' ')[0] : '';
            this.finishtime = ret.finishtime ? ret.finishtime.split(' ')[0] : '';

            this.showOrhideInit();
            this.renderActivityDataTop();
            this.getData();
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        // touchTop: function() {
            
        // },
        // touchBottom: function() {
            
        // },
        showOrhideInit: function(){
            this.$datastatistics.hide();
            this.$marketingintro.hide();
            this.$.find('.mi-introwrap').hide();
            this.$share.hide();

            var _tabindex = this.opt.tabindex;
            if(_tabindex == 2){ //可用
                this.$marketingintro.show();
                this.$.find('.introwrap' + this.opt.templateId).show();
            }else{  //进行中，已结束，自有营销
                this.$datastatistics.show();
                if(_tabindex == 0){ //进行中
                    this.$share.show();
                }
            }
        },
        renderActivityDataTop: function(){
            var _status = this.opt.status;
            if(_status == 1){   //进行中
                var h2mask = this.getTime(this.starttime);
                var pmask = '活动时间：'+ this.starttime.replace(/-/g,'.') +' ~ ' + this.finishtime.replace(/-/g,'.');
            }else if(_status == 3){ //已停用
                var h2mask = '该活动未启用';
                var pmask = '<span>注: 需使用此营销包,请在PC平台 (互联网运营系统) 中操作</span>';
            }else if(_status == 2){ //已结束
                var h2mask = '活动已结束';
                var pmask = '活动时间：'+ this.starttime.replace(/-/g,'.') +' - ' + this.finishtime.replace(/-/g,'.');
            }else if(_status == 0){ //可用
                var h2mask = '该活动未启用';
                var pmask = '<span>注: 需使用此营销包,请在PC平台 (互联网运营系统) 中操作</span>';
            }
            this.$.find('.title .text').html(this.opt.title);
            this.$.find('.h2mask').html(h2mask);
            this.$.find('.pmask').html(pmask);

            if(this.opt.img){
                this.$.find('.activitydatatop img').attr('src', window.defaultConfig.filesMgr + this.opt.img );
            }else{
                this.$.find('.activitydatatop img').attr('src', 'css/img/marketing04.jpg' );
            }
        },
        getTime: function(time){
            var nowTime = new Date().getTime();
            var iRemain = ( nowTime - new Date(time).getTime() )/1000;
            if(iRemain < 0){
                return '活动未开始';
            }else{
                var iDay = Math.floor(iRemain/86400) + 1;
                return '活动已进行<span>'+ iDay +'</span>天';
            }
        },
        getData: function(){
            var self = this;
            var _index = this.opt.tabindex;

            if( _index == 0 || _index == 1 ){   //进行中,已结束

                self.$.find('.ds-list-top').show();

                amGloble.api.marketingToolsEffect.exec({
                    'activityId' : self.opt.activityId,
                    'templateId' : self.opt.templateId
                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0 && ret.message == "success") {
                        var _result = ret.content.result;
                        var _part1 = _result.part1;
                        var _part2 = _result.part2;

                        var _sendCount = self.getCountValue(_part2,'发送红包数量');//发送数量
                        var _openCount = self.getCountValue(_part2,'已拆红包数量');//已拆红包数量
                        var _usedCount = self.getCountValue(_part2,'已用红包数量');//使用数量
                        var _sendTotal = self.getCountValue(_part2,'发送红包金额');//发送红包金额

                        var _radian1 = self.getRadian( self.getArrByKey(_part1,self.opt.templateId) );
                        var _circleArr1 = self.getCircleArr( self.translate(_part2) );
                        //画圆
                        self.drawCircle('c1',_radian1);
                        self.drawCircle2('c2',_circleArr1);

                        //渲染圆的右侧
                        if(self.opt.templateId == 2){   //充值
                            var xck = self.getCountValue(_part1,'充卡');
                            var xkk = self.getCountValue(_part1,'新开卡');
                            self.renderCircel( self.getArrByKey(_part1,self.opt.templateId), self.opt.templateId, [xck,xkk] );
                        }else{  //注册，激活
                            self.renderCircel( self.getArrByKey(_part1,self.opt.templateId), self.opt.templateId );
                        }
                        self.renderCircelList( self.$.find('.ds-list-bottom .ul_list'),[_sendCount,_openCount,_usedCount] );

                        //渲染其他( 1:新客注册送豪礼 2:开卡充值送红包 3:会员APP/微信激活送好礼 4:服务点评送红包 )
                        if(self.opt.templateId == 1){
                            var totalNum = self.getCountValue(_part1,'WIFI注册')*1 + self.getCountValue(_part1,'店内注册')*1 + self.getCountValue(_part1,'微信公众号注册')*1;
                            var units = '人';
                            var _key = '新客注册';
                        }else if(self.opt.templateId == 2){
                            var totalNum = self.getCountValue(_part1,'充卡总金额')*1 + self.getCountValue(_part1,'开卡总金额')*1;
                            var units = '元';
                            var _key = '开续值总额';
                        }else if(self.opt.templateId == 3){
                            var totalNum = self.getCountValue(_part1,'APP激活')*1 + self.getCountValue(_part1,'微信激活')*1;
                            var units = '人';
                            var _key = '激活人数';
                        }else if(self.opt.templateId == 4){
                            var totalNum = self.getCountValue(_part1,'点评人数')*1;
                            var _key = '点评人数';
                            var units = '人';
                        }else if(self.opt.templateId == 5){
                            var totalNum = self.getCountValue(_part1,'预约人数')*1;
                            var _key = '预约人数';
                            var units = '人';
                        }
                        self.$.find('.ds-list-top .cintro_top span').html(totalNum);
                        self.$.find('.ds-list-top .cintro_bottom').html(units);
                        self.$.find('.ds-list-top .ds-list-tit').html(_key);

                        self.$.find('.ds-list-bottom .cintro_top span').html(_sendTotal);
                        //self.$.find('.ds-list-bottom .cintro_bottom').html( '(' + _sendCount + ')个' );

                        self.$.find('.totlemoneybg span').html( self.getCountValue(_part2,'产生消费') );

                    } else {
                        amGloble.msg(ret.message || "数据获取失败,请重试!");
                    }
                });
            }else if( _index == 3 ){    //自有营销

                self.$.find('.ds-list-top').hide();

                amGloble.api.getOwnPackageEffect.exec({
                    'activityId' : self.opt.activityId
                }, function(ret) {
                    amGloble.loading.hide();
                    if (ret.code == 0 && ret.message == "success") {
                        
                        if(ret.content.length){
                            var _content = ret.content[0];
                            var _data = self.toValueKey(_content);
                            var _sendTotal = _content.sendTotal;//发送总额
                            var _sendCount = _content.sendCount;//发送总量
                            var _openCount = _content.openCount;//已拆红包数量
                            var _usedCount = _content.usedCount;//使用数量
                            var _usedTotal = _content.usedTotal;//使用总额
                            var _billTotal = _content.billTotal;//产生消费
                        }else{  //给默认值,都是0
                            var _data = [{key: "发送红包金额",value: 0},{key: "已用红包金额",value: 0}];
                            var _sendTotal = 0;//发送总额
                            var _sendCount = 0;//发送总量
                            var _openCount = 0;//已拆红包数量
                            var _usedCount = 0;//使用数量
                            var _usedTotal = 0;//使用总额
                            var _billTotal = 0;//产生消费
                        }
                        var _circleArr1 = self.getCircleArr(_data);
                        self.drawCircle2('c2',_circleArr1);
                        self.renderCircelList( self.$.find('.ds-list-bottom .ul_list'),[_sendCount,_openCount,_usedCount] );
                        self.$.find('.ds-list-bottom .cintro_top span').html(_sendTotal);
                        //self.$.find('.ds-list-bottom .cintro_bottom').html( '(' + _sendCount + ')个' );
                        self.$.find('.totlemoneybg span').html( _billTotal );

                    } else {
                        amGloble.msg(ret.message || "数据获取失败,请重试!");
                    }
                });
            }
            
        },
        marketingArr: [
            ['WIFI注册','店内注册','微信公众号注册'],
            ['充卡总金额','开卡总金额'],
            ['APP激活','微信激活'],
            ['点评人数'],
            ['预约人数']
        ],
        redpacketArr : ['发送红包金额','已用红包金额'],
        getCountValue : function(data,key){
            for(var i=0; i<data.length; i++){
                if(data[i].key == key){
                    return data[i].value;
                }
            }
        },
        getArrByKey : function(data,tid){
            var arr = [];
            var lastmarketingArr = this.marketingArr[tid-1];
            for(var i=0; i<data.length; i++){
                if( $.inArray( data[i].key, lastmarketingArr ) >= 0 ){
                    arr.push(data[i]);
                }
            }
            return arr;
        },
        toValueKey : function(data){
            var arr = [];
            for(var i in data){
                if(i == 'sendTotal'){
                    arr.push({
                        value : data[i],
                        key : '发送红包金额'
                    });
                }else if(i == 'usedTotal'){
                    arr.push({
                        value : data[i],
                        key : '已用红包金额'
                    });
                }
            }
            return this.translate(arr);
        },
        translate : function(data){
            var _arr = [];
            var _str = this.redpacketArr;
            for(var i=0; i<_str.length; i++){
                for(var j=0; j<data.length; j++){
                    if(data[j].key == _str[i]){
                        _arr.push(data[j]);
                    }
                }
            }
            return _arr;
        },
        drawCircle : function(id,data){
            var _color = ['#fe707d','#00b7ee','#accf61'];
            var oC = document.getElementById(id);
            var oGC = oC.getContext('2d');
            oGC.clearRect(0,0,110,110);
            oGC.lineWidth = 16;
            for(var i=0; i<data.length-1; i++){
                var sAngle = this.getTotalByIndex(data,i);
                var eAngle = this.getTotalByIndex(data,i+1);
                oGC.beginPath();
                oGC.strokeStyle = _color[i];
                oGC.arc(55, 55, 45, sAngle*Math.PI/180, eAngle*Math.PI/180, false);
                oGC.stroke();
                oGC.closePath();
            }
            if( eval(data.join('+')) == 0 ){    //解决总和为0的bug
                oGC.beginPath();
                oGC.strokeStyle = '#DADADA';
                oGC.arc(55, 55, 45, 0*Math.PI/180, 360*Math.PI/180, false);
                oGC.stroke();
                oGC.closePath();
            }
        },
        getRadian : function(data){
            var _total = 0;
            for(var i=0; i<data.length; i++){
                _total += data[i].value*1;
            }
            if(_total == 0){    //解决总和为0的bug
                return [0];
            }

            var _arr = [];
            for(var i=0; i<data.length-1; i++){
                _arr.push(data[i].value*1/_total);
            }
            if(data.length == 1){   //处理只有一个的特殊情况
                _arr.push(1);
            }else{
                _arr.push( 1 - eval(_arr.join('+')) );
            }

            var _last = [0];
            for(var i=0; i<_arr.length; i++){
                _last.push( _arr[i]*360 );
            }
            return _last;
        },
        getTotalByIndex : function(arr,index){
            var sum = 0;
            for(var i=0; i<arr.length; i++){
                if( i <= index ){
                    sum += arr[i]*1;
                }
            }
            return sum;
        },
        getCircleArr : function(arr){
            var _arr = [];
            var _str = this.redpacketArr; //按顺序来
            for(var i=0; i<_str.length; i++){
                for(var j=0; j<arr.length; j++){
                    if(arr[j].key == _str[i]){
                        _arr.push(arr[j].value);
                    }
                }
            }

            var _arr0 = _arr[0];
            if(_arr0 == 0){
                return [0];
            }

            var _last = [1];
            for(var i=1; i<_arr.length; i++){
                if(i == 1){
                    _last.push(_arr[i]/_arr0);
                }else{
                    if(_arr[i-1] == 0){
                        _last.push(0)
                    }else{
                        _last.push(_arr[i]/_arr[i-1]);
                    }
                }
            }

            var _lasttrue = [];
            var _pre = 360;
            for(var i=0; i<_last.length; i++){
                _pre = _last[i]*_pre;
                _lasttrue.push( _pre );
            }
            return _lasttrue;
        },
        drawCircle2 : function(id,data){
            var _color = ['#fe707d','#00b7ee','#accf61'];
            var oC = document.getElementById(id);
            var oGC = oC.getContext('2d');
            oGC.clearRect(0,0,110,110);
            oGC.lineWidth = 16;
            for(var i=0; i<data.length; i++){
                oGC.beginPath();
                oGC.strokeStyle = _color[i];
                oGC.arc(55, 55, 45, 0*Math.PI/180, data[i]*Math.PI/180);
                oGC.stroke();
                oGC.closePath();
            }
            if( eval(data.join('+')) == 0 ){    //解决为0的bug
                oGC.beginPath();
                oGC.strokeStyle = '#DADADA';
                oGC.arc(55, 55, 45, 0*Math.PI/180, 360*Math.PI/180, false);
                oGC.stroke();
                oGC.closePath();
            }
        },
        renderCircel : function(data,tid,arr){
            //营销活动ID ( 1:新客注册送豪礼 2:开卡充值送红包 3:会员APP/微信激活送好礼 4:服务点评送红包 )

            if(tid == 1){
                var unit = '人';
                var str = '';
            }else if(tid == 2){
                var unit = '元';
                var str = '个';
            }else if(tid == 3){
                var unit = '人';
                var str = '';
            }else if(tid == 4){
                var unit = '个';
                var str = '';
            }else if(tid == 5){
                var unit = '人';
                var str = '';
            }

            var _html = '';
            for(var i=0; i<data.length; i++){
                _html += '<li><i></i>'+ data[i].key +':<span>'+ data[i].value +'</span>'+ unit + ( arr ? '  (' + arr[i] + str + ')' : '' ) +'</li>';
            }
            this.$.find('.ds-list-top .ul_list').html(_html);
        },
        renderCircelList : function(obj,arr){
            var _html = '';
            var _str = ['发送红包数量','已拆红包数量','已用红包数量'];
            for(var i=0; i<arr.length; i++){
                _html += '<li>'+ _str[i] +':<span>'+ arr[i] +'</span>个</li>';
            }
            obj.html(_html);
        }
    });

})();