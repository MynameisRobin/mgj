(function(){
    var statusName = [null, "待客", "轮牌", "点客", "临休"];
	var self = am.page.queue = new $.am.Page({
		id: "page_queue",
		init: function(){
            this.$list = this.$.find('.list');
            this.$li = this.$list.find('li').eq(0).remove();
            this.$wrapper = this.$list.find('.wrapper').eq(0).remove();
            this.$list.empty();

            this.$tip = this.$.find('.tip');

			this.$.find('.content').on('vclick','.add',function(){
                var parent = $(this).parents('.wrapper'),
                    lis = parent.find('ul').children(':not(.add)');
                self.loadingWrap = parent;
                var roles = parent.data('data').role;
                var selectedUsers = [];
                for(var i=0;i<lis.length;i++){
                    selectedUsers.push($(lis[i]).data('data'));
                }
                var empData = self.getAddedEmps(roles,selectedUsers);
                if(empData.length){
    				am.addQueue.show({
    					title: '添加'+parent.find('.type').html(),
    					emp: empData,
    					callback: function(data){
    						var ids = [];
                            for(var i=0;i<data.length;i++){
                                ids.push(data[i].id);
                            }
                            console.log(ids);
                            var rotateId = parent.data('data').id;
                            self.addQueueMember(rotateId,ids);
    					}
    				});
                }else {
                    am.msg('该轮牌员工已全部添加');
                }
			}).on('vclick','li:not(.add)',function(){
                self.loadingWrap = $(this).parents('.wrapper');
                var status = $(this).parents('.wrapper').data('data').status;
                var emp = $(this);
                am.editQueue.show({
                    parent: $(this),
                    status: status,
                    callback: function($this){
                        var command = $this.data('command'),
                            status = $this.data('status'),
                            data = $this.data('restitemidx'),
                            tail = $this.data('tail');
                        var queueRestType = $this.data('data');
                        if (command=='changeStatus') {
                            self.changeStatus(emp,status,data,tail,queueRestType);
                        } else if (command=='off') {
                            self.off(emp);
                        }
                    }
                });
            });

            this.$nav = this.$.find('.nav .wrapper').on('vclick','.item',function(){
                var index = $(this).index();
                $(this).addClass('active').siblings().removeClass('active');
                self.listScroll.scrollTo([0,-self.distance[index]]);
            });
            this.$navItem = this.$nav.find('.item').eq(0).remove();

            this.listScroll = new $.am.ScrollView({
                $wrap : this.$list.parent(),
                $inner : this.$list,
                direction : [false, true],
                hasInput: false,
                onScroll: function(pos){
                    self.position = pos[1];
                    if(self.distance && self.distance.length){
                        for(var i=0;i<self.distance.length;i++){
                            if(-pos[1]>self.distance[i]){
                                self.$nav.find('.item').removeClass('active');
                                self.$nav.find('.item').eq(i).addClass('active');
                            }
                        }
                    }     
                }
            });

            this.navScroll = new $.am.ScrollView({
                $wrap : this.$nav.parent(),
                $inner : this.$nav,
                direction : [true, false],
                hasInput: false
            });

            this.$back = this.$.find('.back').vclick(function(){
                am.goBackToInitPage();
            });
		},
        backButtonOnclick: function () {
            if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                $.am.changePage(am.page.hangup, "", {
                    openbill: 1
                });
            } else {
                $.am.page.back();
            }

        },
		beforeShow: function(para){
            this.position = 0;
            if(para=='small'){
                this.$.removeClass('am-full');
            }else {
                this.$.addClass('am-full');
            }
		},
		afterShow:function(para){
            if(para=='small'){
                am.cashierTab.show(2);
            }
            this.loadingWrap = null;
            this.getQueueList(true);
		},
		beforeHide:function(){
            am.cashierTab.hide();
		},
		afterHide:function(){
            for(var i=0;i<this.$list.find('.wrapper').length;i++){
                this.stopInterval(i);
            }
            if (this.timerRetry) {
                clearTimeout(this.timerRetry);
                delete this.timerRetry;
            }
            this.$list.empty();
            this.$nav.empty();
            this.$tip.hide();
		},
        getAddedEmps:function(roles,selectedUsers){
            var arr = [];
            $.each(am.metadata.employeeList, function(i, item) {
                //将已选择的过滤
                if (selectedUsers && selectedUsers.length) {

                    for (var j = 0; j < selectedUsers.length; j++) {
                        // console.log("filter:" + j);
                        var itemj = selectedUsers[j];
                        if (itemj.empId == item.id) {
                            return true;
                        }
                    };
                }
                //只有roleId匹配才能显示
                var roleIds = roles.split(",");
                if (roleIds && roleIds.length) {
                    for (var k = 0; k < roleIds.length; k++) {
                        var itemj = roleIds[k];
                        if (itemj == item.pos+1) {
                            arr.push(item);
                        }
                    };
                }
            });
            return arr;
        },
        addQueueMember:function(rotateId,ids){
            self.loading.show();
            am.api.queueOn.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId:  am.metadata.userInfo.shopId,
                rotateId: rotateId,
                empIds: ids
            },function(ret){
                self.loading.hide();
                console.log(ret);
                if(ret && ret.code == 0){
                    am.msg('添加成功');
                    self.getQueueList(true);
                }else if(ret && ret.code == -1){
                    am.msg(ret.message || '数据提交失败');
                }
            });
        },
        off: function(emp) {
            var id = emp.data('data').id;
            self.loading.show();
            am.api.queueOff.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId:  am.metadata.userInfo.shopId,
                id: id
            },function(ret){
                self.loading.hide();
                console.log(ret);
                if(ret && ret.code == 0){
                    am.msg('调整成功');
                    self.getQueueList(true);
                }else if(ret && ret.code == -1){
                    am.msg(ret.message || '数据提交失败');
                }
            });
        },
        changeStatus : function(emp,status, data,tail,queueRestType) {
            console.log("changeStatus:" + status + " - ");
            var $card = emp;
            try {
                var card = $card.data('data');
            } catch(e) {
                console.log("");
            }
            var cqueue = $card.parents('.wrapper').data('data');

            var id = card.id;
            var rotateId = cqueue.id;
            //var tail = null;
            var restTime = null;
            var restType = null;

            if (status == 2) {
                //轮牌自动到最后
                tail = typeof(tail) == "undefined" ? 1 : tail;
            } else if (status == 3) {
                //点客是否翻牌
                if (cqueue.turnOver) {
                    tail = 1;
                }
            } else if (status == 4) {
                var restType = queueRestType;
                restTime = restType.time;
                restType = data;
            }

            self.loading.show();
            am.api.queueStatus.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId:  am.metadata.userInfo.shopId,
                id : id,
                rotateId : rotateId,
                tail : tail,
                status : status,
                restTime : restTime,
                restType : restType
            },function(ret){
                self.loading.hide();
                console.log(ret);
                if(ret && ret.code == 0){
                    am.msg('修改成功');
                    self.getQueueList(true);
                }else if(ret && ret.code == -1){
                    am.msg(ret.message || '数据提交失败');
                }
            });
        },
        getQueueList: function(needLoading){
            if(this.$list.find('.shake').length){
                return;
            }
            if(needLoading){
                this.loading.show();
            }
            am.api.queueList.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId:  am.metadata.userInfo.shopId,
            },function(ret){
                if(needLoading){
                    self.loading.hide();
                }
                if(ret && ret.code == 0){
                    self.hasSocket = false;
                    self.renderQueue(ret.content);
                    if (self.timerRetry) {
                        clearTimeout(self.timerRetry);
                        delete self.timerRetry;
                    }
                    self.timerRetry = setTimeout(function() {
                        self.getQueueList();
                    }, 60000);
                }else if(ret && ret.code == -1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '数据获取失败',
                        description: '是否重试',
                        okCaption: '确定',
                        cancelCaption: '取消'
                    }, function(){
                        self.getQueueList(needLoading);
                    }, function(){

                    });
                }
            });
        },
        sort: function(ids){
            am.loading.show();
            am.api.queueOrder.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId:  am.metadata.userInfo.shopId,
                ids: ids
            },function(ret){
                am.loading.hide();
                console.log(ret);
                if(ret && ret.code == 0){
                    am.msg('调整成功');
                    self.getQueueList();
                }else if(ret && ret.code == -1){
                    am.msg(ret.message || '数据提交失败');
                }
            });
        },
        renderQueue: function(data){
            this.$list.empty();
            this.$nav.empty();
            this.$tip.hide();
            if(data.length){
                for(var i=0;i<data.length;i++){
                    var $wrapper = this.$wrapper.clone();
                    $wrapper.find('.type').html(data[i].name);
                    $wrapper.data('data',data[i]);
                    var _status = data[i].status;
                    for(var j=0;j<data[i].users.length;j++){
                        var $li = this.$li.clone();
                        var item = data[i].users[j];
                        $li.find('.no').html(item.empId);
                        var emp = am.metadata.empMap[item.empId];
                        if(emp){
                            $li.find('.no').html(emp.no);
                            $li.find('.name').html(emp.name);
                            $li.find('.header').html(am.photoManager.createImage('artisan', {
                                parentShopId: am.metadata.userInfo.parentShopId,
                            }, emp.id+'.jpg', 's'));

                            var now = new Date().getTime();
                            var _diff = now - item.statusTime < 0 ? Math.abs(now - item.statusTime) : 0;
                            item.diff = _diff;

                            if(_status){
                                $li.addClass('status' + item.status)
                                $li.find('.status').html(statusName[item.status]);
                                $li.find('.time').html(item.statusTime);
                            }else {
                                $li.find('.time').hide();
                            }
                            
                            $li.data('data',item);
                            $wrapper.find('ul').append($li)
                        }
                    }
                    $wrapper.find('ul').append('<li class="add am-clickable"></li>');
                    this.$list.append($wrapper);
                    if(data[i].withCashier && am.operateArr.indexOf('MGJR1') != -1){
                        $wrapper.on('vhold','li',function(){
                            am.msg('你没有权限手动调整此轮牌顺序！');
                        });
                    }else{
                        var sortable = new $.am.Sortable({
                            $: $wrapper.find('ul'),
                            onSortEnd: function(ids){
                                self.sort(ids);
                            },
                            onNoSort:function(){
                                if(self.hasSocket){
                                    self.getQueueList();
                                }
                            }
                        });
                    }
                    this.startInterval($wrapper,i);

                    var $navItem = this.$navItem.clone();
                    $navItem.find('span').html(data[i].name);
                    this.$nav.append($navItem);
                }
                this.listScroll.refresh();

                var item = this.$nav.find('.item');
                var width = 0;
                for(var i=0;i<item.length;i++){
                    var w = $(item[i]).outerWidth(true);
                    width += w;
                }
                this.$nav.css({"width":width+"px"});
                if(width>this.$nav.parent().width()){
                    this.$nav.css('margin',0);
                }else {
                    this.$nav.css('margin','0 auto');
                }
                this.navScroll.refresh();
               

                var types = this.$list.find('.wrapper');
                var heighs = [];
                for(var i=0;i<types.length;i++){    
                    heighs.push($(types[i]).outerHeight(true));
                }
                var distance = [];
                distance.length = heighs.length;
                for(var i=0;i<distance.length;i++){
                    distance[i] = 0;
                    for(var j=0;j<=i;j++){
                        distance[i] += heighs[j];
                    }
                }
                distance.unshift(0);
                this.distance = distance;
                this.$tip.show();
                if(this.position){
                    this.listScroll.scrollTo([0,this.position]);
                    if(this.distance && this.distance.length){
                        for(var i=0;i<this.distance.length;i++){
                            if(-this.position>this.distance[i]){
                                this.$nav.find('.item').removeClass('active');
                                this.$nav.find('.item').eq(i).addClass('active');
                            }
                        }
                    }    
                }else {
                    this.listScroll.scrollTo('top');
                    this.$nav.find('.item:first-child').addClass('active');
                }
                $('#addQueue,#editQueue').hide();
            }else {
                am.msg('还未设置轮牌');
                this.$tip.hide();
            }
        },
        startInterval : function(obj,index) {
            var self = this;
            var $pageMainList = obj.find('ul');
            //定时倒计时
            var once = function() {
                $pageMainList.children(":not(.add)").each(function(i, item) {
                    var $this = $(item);
                    var data = $this.data("data");
                    var now = new Date().getTime();
                    if (data.status == 4) {
                        var dt = Math.floor((data.restTime - now - data.diff) / 1000);
                        if (dt < 0) {
                            $this.remove();
                            self.listScroll.refresh();
                        } else {
                            $this.find(".time").html(self.formatTime(dt));
                        }
                    } else {
                        var statusTime = data.statusTime || 1440522000000;
                        var dt = Math.floor((now - statusTime + data.diff) / 1000);
                        $this.find(".time").html(self.formatTime(dt));
                    }
                });
            };

            this.stopInterval(index);

            this['timer' + index] = setInterval(once, 1000);
            once();
        },
        stopInterval : function(index) {
            if (this['timer' + index]) {
                clearInterval(this['timer' + index]);
                delete this['timer' + index];
            }
        },
        formatTime: function(second) {
            // 计算
            var h = 0,
                i = 0,
                s = parseInt(second);
            if (isNaN(s)) {
                return second;
            }
            if (s >= 60) {
                i = parseInt(s / 60);
                s = parseInt(s % 60);
                if (i >= 60) {
                    h = parseInt(i / 60);
                    i = parseInt(i % 60);
                }
            }
            // 补零
            var zero = function(v) {
                return (v >> 0) < 10 ? "0" + v : v;
            };
            return [zero(h), zero(i), zero(s)].join(":");
        },
        loading:{
            show:function(){
                if(self.loadingWrap){
                    self.loadingPart.show(self.loadingWrap);
                }else {
                    am.loading.show();
                }
            },
            hide:function(){
                if(self.loadingWrap){
                    self.loadingPart.hide();
                }else {
                    am.loading.hide();
                }
            }
        },
        loadingPart:{
            init:function(){
                var $dom = $('<div class="loadingWrap">'+
                    '<div class="page-modalLoading-inner">'+
                        '<span class="loading"></span>'+
                        '<span class="text">请稍候...</span>'+
                    '</div>'+
                '</div>');
                this.$ = $dom;
                this.$parent.append(this.$);
            },
            show:function(parent){
                this.$parent = parent;
                if(!this.$parent.find('.loading').length){
                    this.init();   
                }
                this.$.show();
            },
            hide:function(){
                this.$.hide();
            }
        }
	});
})();

(function(){
    var addQueue = {
        init: function(){
            var $dom = $('<div id="addQueue">'+
				'<div class="mask"></div>'+
				'<div class="content">'+
					'<div class="close"></div>'+
					'<p class="title">添加助理牌</p>'+
					'<div class="wrapper"><div class="wrap">'+
						'<ul class="clearfix list">'+
							'<li class="am-clickable"><span></span><p>张三</p></li>'+
						'</ul>'+
					'</div></div>'+
					'<div class="sure">确认添加</div>'+
				'</div>'+
			'</div>');
            $('body').append($dom)
            this.$ = $dom;
            this.$ul = $dom.find('ul').on('vclick','li',function(){
            	if($(this).hasClass('selected')){
            		$(this).removeClass('selected');
            	}else {
            		$(this).addClass('selected');
            	}
            });
            this.$li = this.$ul.find('li').eq(0).remove();
            this.$mask = this.$.find(".mask").vclick(function(){
                addQueue.hide();
            });
            this.$close = this.$.find('.close').vclick(function(){
            	addQueue.hide();
            });
            this.$title = this.$.find('.title');
            this.$smt = this.$.find('.sure').vclick(function(){
            	var data = [];
            	var lis = addQueue.$ul.find('.selected');
            	for(var i=0;i<lis.length;i++){
            		data.push($(lis[i]).data('data'));
            	}
            	if(!data.length){
            		am.msg('请选择员工');
            		return;
            	}
            	addQueue.callback(data);
            	addQueue.hide();
            });
            this.sv = new $.am.ScrollView({
                $wrap : this.$.find('.wrapper'),
                $inner : this.$.find('.wrap'),
                direction : [false, true],
                hasInput: false
            });
        },
        show:function(opt){
        	if(!this.$){
        		this.init();
        	}
            this.$ul.empty();
            this.callback = opt.callback;
            this.$title.html(opt.title);
            for(var i=0;i<opt.emp.length;i++){
                var $item = this.$li.clone();
                $item.data('data',opt.emp[i]);
                $item.find('p').html(opt.emp[i].no+' '+opt.emp[i].name);
                this.$ul.append($item);
            }
            this.$.show();
            this.sv.refresh();
            this.sv.scrollTo("top");
        },
        hide:function (data) {
            this.$.hide();
        }
    }
    am.addQueue = addQueue;
})();

(function(){
    var editQueue = {
        init: function(){
            var $dom = $('<div id="editQueue">'+
                '<div class="mask"></div>'+
                '<ul class="content">'+
                    '<li data-command="changeStatus" data-status="2"><p>轮牌</p></li>'+      
                    '<li data-command="changeStatus" data-status="3"><p>点客</p></li>'+
                    '<li>'+
                        '<p>临休</p>'+
                        '<div class="second">'+
                            '<div class="second-content">'+
                                '<ul>'+
                                    
                                '</ul>'+
                            '</div>'+
                        '</div>'+
                    '</li>'+
                    '<li data-command="changeStatus" data-status="1"><p>待客</p></li>'+
                    '<li data-command="changeStatus" data-status="2" data-tail="0"><p>盖牌</p></li>'+
                    '<li data-command="off"><p>下牌</p></li>'+
                '</ul>'+
            '</div>');
            $('body').append($dom)
            this.$ = $dom;
            this.$content = this.$.find('.content');
            this.$second = this.$.find('.second');

            this.$firstLi = this.$.find('.content > li').vclick(function(){
                var index = $(this).index();
                if(index==2){
                    if($(this).hasClass('active')){
                        return;
                    }
                    editQueue.$second.show();
                    editQueue.sv.refresh();
                    editQueue.sv.scrollTo("top");
                    var containerWidth = editQueue.$.width(),
                        sWidth = editQueue.$second.outerWidth(),
                        sLeft = editQueue.$second.offset().left;
                    if(sLeft+sWidth>containerWidth){
                        editQueue.$second.addClass('left');
                    }else {
                        editQueue.$second.removeClass('left');
                    }
                }else {
                    editQueue.hide();
                    editQueue.callback($(this));
                }
                 $(this).addClass('active').siblings().removeClass('active');
            });

            this.$second.on('vclick','li',function(){
                $(this).addClass('active').siblings().removeClass('active');
                editQueue.hide();
                editQueue.callback($(this));
            });
            
            this.$mask = this.$.find(".mask").vclick(function(){
                editQueue.hide();
            });
            
            this.sv = new $.am.ScrollView({
                $wrap : this.$second.find('.second-content'),
                $inner : this.$second.find('.second-content ul'),
                direction : [false, true],
                hasInput: false
            });
        },
        show:function(opt){
            if(!this.$){
                this.init();
            }
            this.$.show();
            this.$content.css({
                left: 'auto',
                top: 'auto',
                bottom: 'auto'
            }).removeClass('down');
            this.$second.hide().removeClass('left');
            this.$content.find('li').removeClass('active');
            var containerHeight = this.$.height();
            var contentHeight = this.$content.height();
            var left = opt.parent.offset().left,
                top = opt.parent.offset().top,
                height = opt.parent.outerHeight();
            if(contentHeight+top+height>containerHeight){
                this.$content.css({
                    left: left+'px',
                    top: 'auto',
                    bottom: containerHeight - top - height*0.75 +'px'
                }).addClass('down');
            }else {
                this.$content.css({
                    left: left+'px',
                    top: top+height+'px',
                    bottom: 'auto'
                }).removeClass('down');
            }
            if(opt.status==0){
                this.$content.children('li').hide();
                this.$content.children('li:first-child,li:last-child').show();
            }else {
                this.$content.children('li').show();
            }

            if(!this.$second.find('li').length){
                var queueRestTypes = JSON.parse(am.metadata.configs.queueRestTypes);
                if (!queueRestTypes || typeof queueRestTypes != "object" || !queueRestTypes.length) {
                    queueRestTypes = [{
                        "text" : "吃饭",
                        "time" : 30
                    }, {
                        "text" : "临休",
                        "time" : 15
                    }, {
                        "text" : "急休",
                        "time" : 5
                    }];
                }
                for(var i=0;i<queueRestTypes.length;i++){
                    var $li = $('<li class="am-clickable" data-command="changeStatus" data-status="4" data-restitemidx="'+i+'"><p>'+queueRestTypes[i].text+' '+queueRestTypes[i].time+'分钟</p></li>');
                    $li.data('data',queueRestTypes[i])
                    this.$second.find('ul').append($li);
                }
            }

            this.callback = opt.callback;
        },
        hide:function () {
            this.$.hide();
        }
    }
    am.editQueue = editQueue;
})();