(function() {

    var tabArr = [
        {
            'headerClass' : 'header-achievement',
            'innerClass' : 'active-achievement',
            'describe' : '业绩',
            'unit' : '元'
        },
        {
            'headerClass' : 'header-appointment',
            'innerClass' : 'active-appointment',
            'describe' : '预约',
            'unit' : '次'
        },
        {
            'headerClass' : 'header-praise',
            'innerClass' : 'active-praise',
            'describe' : '好评率',
            'unit' : '%'
        },
        {
            'headerClass' : 'header-works',
            'innerClass' : 'active-works',
            'describe' : '作品',
            'unit' : '幅'
        },
        {
            'headerClass' : 'header-reward',
            'innerClass' : 'active-reward',
            'describe' : '打赏',
            'unit' : '笔'
        }
    ];

    var self = amGloble.page.rankinglist = new $.am.Page({
        id: "page-rankinglist",
        init: function() {
            var self = this;

            this.$thefirstWrap = this.$.find('.thefirst-wrap');
            this.$imgBox = this.$.find('.inner-top .thefirst-wrap .thefirstheader .imgBox');
            this.$thefirstname = this.$.find('.inner-top .thefirst-wrap .thefirstname');
            this.$thefirstbottom = this.$.find('.inner-top .thefirst-wrap .thefirstbottom');
            this.$innerContUl = this.$.find('.inner-cont ul');
            this.$amHeader = this.$.find('.am-header');
            this.$innerTop = this.$.find('.inner-top');
            this.$monthwrap = this.$.find('.monthwrap');

            this.$.on('vclick','.footTab span',function(){

                if ($(this).hasClass("disabled")) {
                    if (amGloble.checkVersion()) {
                        return;
                    };
                }
                
                var _index = $(this).index();
                $(this).addClass('selected').siblings('span').removeClass('selected');
                self.$amHeader.removeClass('header-achievement header-appointment header-praise header-works header-reward').addClass( tabArr[_index].headerClass );
                self.$innerTop.removeClass('active-achievement active-appointment active-praise active-works active-reward').addClass( tabArr[_index].innerClass );
                
                /*self.$.find('.thismonth').addClass('onmonth');
                self.$.find('.lastmonth').removeClass('onmonth');*/
                

                //打赏模块隐藏上月下月
                if(_index == 4){
                    self.$monthwrap.hide();
                }else{
                    self.$monthwrap.show();
                }
                self.$thefirstWrap.data('item',null);
                if(_index>0){
                    self.$.find(".am-header .title").addClass('hideEmp');
                    self.$.find(".monthwrap li.thismonth").addClass('onmonth').siblings().removeClass('onmonth');
                    self.getData( _index, self.getPeriod().thismonth );
                    self.$.find(".monthwrap li.today").hide();
                }
                var _newRole = amGloble.metadata.userInfo.newRole;
                if(_index==0 && !(_newRole==4 || _newRole==5 || _newRole==6)){
                    self.$.find(".am-header .title").removeClass('hideEmp');
                    self.$.find(".monthwrap li.today").show().addClass('onmonth').siblings().removeClass('onmonth');
                    self.getData( _index, self.getPeriod().today );
                }
                if((_newRole==4 || _newRole==5 || _newRole==6) && _index==0){
                    self.$.find(".am-header .title").addClass('hideEmp');
                    self.$.find(".monthwrap li.today").show().addClass('onmonth').siblings().removeClass('onmonth');
                    self.getData( _index, self.getPeriod().today );
                }



                
            });

            this.$.on('vclick','.am-header .roles',function(e){
                e.stopPropagation();
                var levels = [].concat(amGloble.metadata.currentRoles);
                amGloble.popupMenu("请选择员工级别", levels, function(ret) {
                    self.setLevel(ret,true);
                });
            });

            this.$.on('vclick','.monthwrap li',function(){
                var _index = self.$.find('.footTab span.selected').index();
                var _idx=$(this).index();
                var _period;

                $(this).addClass("onmonth").siblings().removeClass('onmonth');
                var _pre=['today','thismonth','lastmonth'];
                _period=self.getPeriod()[_pre[_idx]];
                self.getData( _index, _period );
            });

            //去看看，查看作品列表
            this.$.on('vclick','.inner-cont li',function(){
                var _index = self.$.find('.footTab span.selected').index();
                if(_index == 3){    //作品
                    var _userid = $(this).data('item').userid;
                    var url = config.shareRoot + $.param({
                        tenantId: amGloble.metadata.userInfo.parentShopId,
                        view: 15,
                        modelId: _userid
                    });
                    window.open(url, '_blank', 'location=no');
                }
            });
            this.$thefirstWrap.vclick(function(){
                var _index = self.$.find('.footTab span.selected').index();
                if(_index == 3){    //作品
                    if( $(this).data('item') ){
                        var _userid = $(this).data('item').userid;
                        var url = config.shareRoot + $.param({
                            tenantId: amGloble.metadata.userInfo.parentShopId,
                            view: 15,
                            modelId: _userid
                        });
                        window.open(url, '_blank', 'location=no');
                    }
                }
            });
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }

            this.setFirstEmpRole();//初始化角色

            var _newRole = amGloble.metadata.userInfo.newRole;
            if(_newRole == 4 || _newRole == 5 || _newRole == 6){    //员工
                this.$.find(".am-header .title").addClass('hideEmp');
            }else{  //管理者
                this.$.find(".am-header .title").removeClass('hideEmp');
            }

            if(amGloble.metadata.userInfo.mgjVersion == 1){
                //盛传版
                self.$.find('.footTab span:gt(0)').addClass('disabled');
            }

            amGloble.storeSelect.onShopChange = function(shops){
                var _index = self.$.find('.footTab span.selected').index();
                var _idx=self.$.find('.monthwrap li.onmonth').index();
                //var _period = self.$.find('.thismonth').hasClass('onmonth') ? self.getPeriod().thismonth : self.getPeriod().lastmonth;
                var _pre=['today','thismonth','lastmonth'];
                var _period = self.getPeriod()[_pre[_idx]];

                self.setFirstEmpRole();
                self.getData( _index, _period );
            };

            self.$.find('.footTab span').eq(0).trigger('vclick');
        },
        afterShow: function(paras) {},
        beforeHide: function() {

        },
        getPeriod: function(){
            if( new Date().getMonth() == 0 ){   //特殊处理
                return {
                    'today'     : new Date().getFullYear() + '-' + this.zeroFill(new Date().getMonth() + 1) + '-' + this.zeroFill(new Date().getDate()), 
                    'thismonth' : new Date().getFullYear() + '-' + this.zeroFill(new Date().getMonth() + 1),  //本月
                    'lastmonth' : (new Date().getFullYear() - 1) + '-' + 12  //上月
                };
            }else{
                return {
                    'today'     : new Date().getFullYear() + '-' + this.zeroFill(new Date().getMonth() + 1) + '-' + this.zeroFill(new Date().getDate()), 
                    'thismonth' : new Date().getFullYear() + '-' + this.zeroFill(new Date().getMonth() + 1),  //本月
                    'lastmonth' : new Date().getFullYear() + '-' + this.zeroFill(new Date().getMonth())  //上月
                };
            }
        },
        setFirstEmpRole:function(){
            var list=amGloble.metadata.currentRoles;
            if($.isArray(list)){
                if(list.length>0){
                    this.setLevel(list[0]);
                }
            }
        },
        setLevel:function(data,refresh){
            var _index = this.$.find('.footTab span.selected').index();
            var _idx=self.$.find('.monthwrap li.onmonth').index();
            var _pre=['today','thismonth','lastmonth'];
            var _period=self.getPeriod()[_pre[_idx]];
            try{
                this.empRole=this.empRoleTemp=data.id;
                this.$.find(".am-header .roles").html(data.name);
            }catch(e){
                this.empRole=null;
                this.$.find(".am-header .roles").html("请选择");
            }
            if(refresh){
                this.getData( _index, _period );
            }
            
        },
        zeroFill: function(num){
            var num = num + '';
            if(num.length == 1){
                return '0' + num;
            }else{
                return num;
            }
        },
        getData: function(tabindex,period){
            //tabindex ( 0:业绩 1:预约 2:好评 3:作品 4:打赏 )
            
            var self = this;

            //获取当前门店，如果是全企业则自动选中第一个门店
            var shop = amGloble.storeSelect.getCurrentShops();
            if (!shop) {
                amGloble.storeSelect.selectShop(0, true);
                shop = amGloble.storeSelect.getCurrentShops();
            }
            var shopId = amGloble.storeSelect.getCurrentShops().shopId;

            var _newRole = amGloble.metadata.userInfo.newRole;
            if(_newRole == 4 || _newRole == 5 || _newRole == 6){    //员工
                var _isEmp = 1;
                self.empRole=amGloble.metadata.userInfo.role;//员工默认的级别
            }else{  //管理者
                var _isEmp = 0;
            }

            if(tabindex>0){
                if(!(_newRole == 4 || _newRole == 5 || _newRole == 6)){
                    self.empRole=-1;
                }
            }else{
                if(_newRole == 4 || _newRole == 5 || _newRole == 6){
                    self.empRole=amGloble.metadata.userInfo.role;//员工默认的级别
                }else{
                    self.empRole=self.empRoleTemp;
                }
            }

            amGloble.loading.show("正在获取,请稍候...");
            amGloble.api.getRankingList.exec({
                'shopid' : shopId,
                'period' : period,
                'rankingType' : tabindex + 1,
                'isEmp' : _isEmp,
                'empRole':self.empRole
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    self.render( ret.content, tabindex );
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                    self.clearInit();
                }
            });
        },
        render: function(data,tabindex){
            var self = this;

            //过滤掉value=0的数据
            var data = data.filter(function(d){
                return d.value != 0;
            });

            var _newRole = amGloble.metadata.userInfo.newRole;
            if(_newRole == 4 || _newRole == 5 || _newRole == 6){    //员工
                if(tabindex == 0){  //只有业绩才过滤同工位的员工
                    var data = data.filter(function(d){
                        return d.newRole == _newRole;
                    });
                }
            }

            this.$innerContUl.empty();

            if(data.length == 0){
                this.clearInit();
                return false;
            }

            var _class = tabindex == 0 ? ' licontcenter-achievement' : '';
            var _firstVal = 0;
            var _widthArr = [];

            for(var i=0; i<data.length; i++){
                if(i == 0){
                    _firstVal = data[i].value;
                    this.renderFirst(data[i],tabindex);
                }else{
                    if(tabindex == 0){  //业绩
                        var _str = '<div class="percentwrap"><div class="percentwd"></div></div>';
                        var _width = data[i].value/_firstVal*100 + '%';
                        _widthArr.push(_width);
                        var _arrowright = '';
                        if(amGloble.metadata.userInfo.userType == 1){   //员工才有效
                            var _ishide = amGloble.metadata.configs.hiddenPerformanceAmount == "true" ? true : false; //隐藏业绩金额
                        }else{
                            var _ishide = false;
                        }
                    }else if(tabindex == 3){ //作品
                        var _str = '';
                        var _arrowright = '<i class="arrowright"></i>';
                        var _ishide = false;
                    }else{  //预约，好评，打赏
                        var _str = '';
                        var _arrowright = '';
                        var _ishide = false;
                    }

                    var _uid = amGloble.metadata.userInfo.userId;
                    var _isme = _uid == data[i].userid ? 'isme' : '';
                    var $li = $('<li class="am-clickable '+ _isme +'">' +
                                    '<div class="rank">'+ ( i + 1 ) +'</div>' +
                                    '<div class="licont">' +
                                        '<div class="count">'+ ( _ishide ? '****' : Math.round(data[i].value) ) + '<i>' + tabArr[tabindex].unit +'</i><span class="'+ this.getState(data[i].state).listarrow +'"></span>'+ _arrowright +'</div>' +
                                        '<div class="imgwrap">' +
                                            // '<img src="http://www.reelidev.cn:8088/tenant/999990/d7f8bc3e-db70-4485-8ad2-f403bac9c5e5.jpg">' +
                                        '</div>' +
                                        '<div class="licontcenter'+ _class +'">' +
                                            '<h2>'+ data[i].name +'</h2>' +
                                            _str +
                                        '</div>' +
                                    '</div>' +
                                '</li>');

                    var _url = '';
                    if (data[i].sex == "M") {
                        _url = "css/img/bg-man.gif";
                    } else {
                        _url = "css/img/bg-woman.gif";
                    }
                    $li.find('.imgwrap').css({
                        'background': 'url(' + _url + ') no-repeat center center',
                        'background-size': 'contain'
                    }).html(amGloble.photoManager.createImage("artisan", {
                        parentShopId: amGloble.metadata.userInfo.parentShopId
                    }, data[i].userid + ".jpg", "s"));

                    if( _isme == 'isme' ){
                        $li.find('.imgwrap').html('<img src="css/img/mebg.png" />');
                    }

                    $li.data('item',data[i]);

                    this.$innerContUl.append($li);
                }
            }

            setTimeout(function(){
                if(_widthArr.length){
                    self.$innerContUl.find('li').each(function(k,v){
                        $(v).find('.percentwd').css({
                            'width' : _widthArr[k]
                        });
                    });
                }
            },200);

            self.refresh();
        },
        renderFirst: function(data,tabindex){
            var _url = '';
            if (data.sex == "M") {
                _url = "css/img/bg-man.gif";
            } else {
                _url = "css/img/bg-woman.gif";
            }
            this.$imgBox.css({
                'background': 'url(' + _url + ') no-repeat center center',
                'background-size': 'contain'
            }).html(amGloble.photoManager.createImage("artisan", {
                parentShopId: amGloble.metadata.userInfo.parentShopId
            }, data.userid + ".jpg", "s"));

            var _uid = amGloble.metadata.userInfo.userId;
            var _isme = _uid == data.userid ? true : false;
            if( _isme ){
                this.$imgBox.html('<img src="css/img/mebg.png" />');
            }

            this.$thefirstname.html(data.name);

            if(tabindex == 0){  //业绩
                if(amGloble.metadata.userInfo.userType == 1){   //员工才有效
                    var _ishide = amGloble.metadata.configs.hiddenPerformanceAmount == "true" ? true : false; //隐藏业绩金额
                }else{
                    var _ishide = false;
                }
            }else{
                var _ishide = false;
            }
            var _html = '<span>'+ tabArr[tabindex].describe +'：</span><span>'+ ( _ishide ? '****' : Math.round(data.value) ) + tabArr[tabindex].unit +'</span><span class="'+ this.getState(data.state).firstarrow +'"></span>';
            this.$thefirstbottom.html(_html);

            this.$thefirstWrap.data('item',data);
        },
        clearInit: function(){
            this.$imgBox.css('background','none').html('<img src="css/img/MYK/head_male.png" />');
            this.$thefirstname.html('');
            this.$thefirstbottom.html('');
            this.showEmpty();
        },
        showEmpty: function(){
            var _li = '<li class="emptyli">暂无数据~</li>';
            this.$innerContUl.html( _li );
            this.refresh();
        },
        getState: function(state){
            var obj = {};
            if(state == -1){    //下降
                obj.firstarrow = 'arrow arrowdown';  //排名第一
                obj.listarrow = 'arrowred';   //排名第二及后面的
            }else if(state == 0){   //持平
                obj.firstarrow = '';
                obj.listarrow = '';
            }else if(state == 1){   //上升
                obj.firstarrow = 'arrow';
                obj.listarrow = 'arrowgreen';
            }
            return obj;
        }
    });

})();