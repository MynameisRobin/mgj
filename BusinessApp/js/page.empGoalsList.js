'use strict';

amGloble.page.empGoalsList=new $.am.Page({
    id: 'page-empGoalsList',
    backButtonOnclick: function() {
        var self=this;
        var shop=self.reportFilter.getShop(); //得到选择的店铺
        var targetCalendar=self.reportFilter.getDate();
        var targetYear=targetCalendar.format('yyyy');
        var targetMonth=targetCalendar.format('mm');
        $.am.changePage(amGloble.page.shopGoal,'slidedown',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth});
    },
    init: function() {
        var self=this;
        this.reportFilter=new amGloble.ReportFilter({
            $: this.$.find('.am-body-wrap'), //选择器的dom将插入到此节点后面
            enableDept: true, //是否启用部门选择器
            enableShop: true,
            // enableLevel: true, //是否启用部门选择器
            onDatePickerClick: function onDatePickerClick() {},
            onchange: function onchange() {
                //条件修改时触发
                self.resetData();
            }
        });
        this.$header.on('vclick','.icon-icon-bainji',function() {
            //编辑
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.setShopGoal,'slideup',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth}); //type:shop  门店过去  emp 员工过去
        });
        this.$wrap=this.$.find('.am-body-wrap').on('vclick','.filter_list li',function() {
            if($(this).data('data')==0) {
                self.chooseLevel=0;
            } else {
                self.chooseLevel=$(this).data('data').id;
            }
            self.renderList();
            $(this).addClass('selected').siblings().removeClass('selected');
        }).on('vclick','.packup_btn',function() {
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.shopGoal,'slidedown',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth});
        }).on('vclick','.goal_notset .set_goalbtn',function() {
            //编辑
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.setShopGoal,'slideup',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth});
        }).on('vclick','.content_items li',function() {
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.empGoalCheck,'slideleft',{empTarget: $.extend(false,$(this).data('emp')),empRoles: $.extend(false,self.empRoles),empLevels: $.extend(false,self.empLevels),empTargets: $.extend(false,self.empTargets),shop: $.extend(false,shop),targetYear: targetYear,targetMonth: targetMonth});
        });
        this.roleScroll=new $.am.ScrollView({
            $wrap: this.$.find('.roleWrap'),
            $inner: this.$.find('.roleWrap ul'),
            direction: [1,0]
        });

        this.itemListScroll=new $.am.ScrollView({
            $wrap: this.$.find('.item_wrap'),
            $inner: this.$.find('ul.content_items'),
            direction: [0,1]
        });

        this.$goal_notset=this.$.find('.goal_notset');
        this.$content_wrap=this.$.find('.am-body-wrap .list_content');
        this.$packup_btn=this.$.find('.am-body-wrap .packup_btn');

        this.$menu=this.$.find('.roleWrap ul');
        this.$li=this.$menu.find('li').clone();
        this.$menu.find('li').remove();
        this.$empList=this.$.find('ul.content_items');
        this.$eli=this.$empList.find('li').clone();
        this.$empList.find('li').remove();
    },
    beforeShow: function beforeShow(ret) {
        var shopType=amGloble.metadata.userInfo.shopType;
        var opt={
            enableDept: false,
            enableLevel: false,
            disableFilter: false,
            enableCategory: false,
            selectTime: false,
            enableShop: shopType==0,
            shopRole: '3,',
            datePickerType: 'ym'
        };
        this.reportFilter.setOpt(opt);
        if(ret=='back') {
            return;
        }
        if(ret&&ret.targets) {
            this.empLevels=ret.empLevels;
            this.empRoles=ret.empRoles;
            this.empTargets=ret.empTargets;
            this.targetTypes=ret.targetTypes;
            this.targets=ret.targets;
            this.reportFilter.setShop(ret.shop,true);
            this.reportFilter.setDate(ret.time,null,true);
            this.id=ret.id;
            this.chooseLevel=0;
            this.render();
        } else {
            this.resetData();
            return;
        }
    },
    afterShow: function afterShow() {
        // _this.$demoBar1.animation()
        this.roleScroll.refresh();
        this.itemListScroll.refresh();
    },
    beforeHide: function beforeHide() {
        this.reportFilter.hideShortcut()
    },
    afterHide: function afterHide() {},
    readerBtn: function readerBtn() {
        var self=this;
        var targetCalendar=self.reportFilter.getDate();
        var now=new Date();
        var ntime=new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/01');
        if(ntime.getTime()<=targetCalendar.getTime()) {
            self.$.find('.set_goalbtn').show();
            self.$.find('.am-header .right.button').show();
        } else {
            self.$.find('.set_goalbtn').hide();
            self.$.find('.am-header .right.button').hide();
        }
        var shopType=amGloble.metadata.userInfo.shopType;
        if(shopType==0) {
            self.$.find('.set_goalbtn').hide();
            self.$.find('.am-header .right.button').hide();
        }
        var days=30;
        if([1,3,5,7,8,10,12].indexOf(now.getMonth()+1)!=-1) {
            days=31;
        }
        var percent1=now.getDate()/days;
        if(self.id&&percent1>0.5&&now.getMonth()==targetCalendar.getMonth()&&now.getFullYear()==targetCalendar.getFullYear()) {
            self.$.find('.set_goalbtn').hide();
            self.$.find('.am-header .right.button').hide();
        }
    },
    resetData: function resetData() {
        var ptop=44;
        if(device.platform=="iOS") {
            ptop+=20;
        }
        this.setStatus('loading',"数据加载中……",{top: ptop});
        this.chooseLevel=0;
        this.getLevels();
        this.getData();
    },
    getLevels: function getLevels() {
        var self=this;
        var shop=this.reportFilter.getShop();
        // console.log(shop)
        if(!shop) {
            return;
        }
        var parentShopId=shop.parentShopId;
        amGloble.api.empdutyMetadata.exec({
            'parentShopId': parentShopId
        },function(ret) {
            if(ret.code==0) {
                var data=ret.content;
                self.empRoles=data.employeeRoles;
                self.empLevels=data.employeeLevels;
                self.renderMenu();
            } else {
                amGloble.msg('数据加载失败,点击重试!');
            }
        });
    },
    getData: function getData() {
        var self=this;
        var shop=this.reportFilter.getShop();
        if(!shop) {
            self.setStatus('normal');
            return;
        }
        var shopId=shop.shopId;
        var parentShopId=shop.parentShopId;
        if(shop.softgenre==3) {
            parentShopId=shop.baseId;
        }
        var targetCalendar=this.reportFilter.getDate();
        var targetYear=targetCalendar.format('yyyy');
        var targetMonth=targetCalendar.format('mm');
        amGloble.api.queryShopTarget.exec({
            'shopId': shopId,
            'parentShopId': parentShopId,
            'targetYear': targetYear,
            'targetMonth': targetMonth
        },function(ret) {
            if(ret.code==0) {
                var data=ret.content;
                self.empTargets=data.empTargets;
                self.targets=data.targets;
                self.targetTypes=","+data.targetTypes;
                self.id=data.id;
                self.renderList();
            } else {
                amGloble.msg('数据加载失败,点击重试!');
            }
            self.setStatus('normal');
        });
    },
    render: function render() {
        this.renderMenu();
        this.renderList();
    },
    findLevel: function findLevel(dutyId) {
        var level;
        $.each(this.empLevels,function(i,item) {
            // console.log(item.empLevels)
            if(dutyId==item.dutyId) {
                level=item;
            }
        });
        return level;
    },
    createChart: function(ele,targets,flag) {
        var days=30;
        var now=new Date();
        if([1,3,5,7,8,10,12].indexOf(now.getMonth()+1)!=-1) {
            days=31;
        }
        var percent1=flag? 0:now.getDate()/days*100;
        var datasets=[];
        for(var j=0;j<targets.length;j++) {
            var val=targets[j];
            if(this.targetTypes.indexOf(","+val.type)==-1) {
                continue;
            }
            var achi=val.achi;
            var target=val.target;
            achi=achi? achi:0;
            datasets.push({
                text1: val.type==1? '现金业绩':'劳动业绩',
                text2: target,
                percent1: percent1,
                percent2: achi/target*100,
            });
        }
        var chartBar=new ChartBar({
            target: ele,
            datasets: datasets
        });
        return chartBar;
    },
    renderList: function renderList() {
        var self=this;
        self.readerBtn();
        self.renderTitle();
        self.$empList.html('');
        var targetCalendar=self.reportFilter.getDate();
        var now=new Date();
        var ntime=new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/01');
        //如果已经过去的月份
        var passFlag=(targetCalendar.getTime()<ntime.getTime());
        var count=0;
        $.each(this.empTargets,function(i,item) {
            var level=self.findLevel(item.dutyId);
            if(!level||level&&(self.chooseLevel==0||self.chooseLevel==level.dutyType)) {
                var eli=self.$eli.clone().data('item',item);
                if(item.sex!='F')
                    eli.find('.lf_pic').addClass("male")
                eli.find('.info_name').text(item.empName);
                eli.find('.lf_pic').html(amGloble.photoManager.createImage('artisan',{
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                },item.empId+'.jpg','s'));
                if(level) {//有员工找不到级别 故作此兼容
                    eli.find('.info_level').text(level.name);
                } else {
                    eli.find('.info_level').text('');
                }
                if(item.id||passFlag) {
                    if(!item.targets[0].target&&passFlag) {
                        eli.find('.item_middle').text('未设置目标');
                        eli.find(".item_right").hide();
                        eli.removeClass("am-clickable");
                    } else {
                        var chartBar=self.createChart(eli.find('.item_middle'),item.targets,passFlag);
                        chartBar.animation();
                    }
                } else {
                    eli.find('.item_middle').text('未设置目标');
                }
                eli.data('emp',item);
                self.$empList.append(eli);
                count++;
            }
        });
        if(count==0) {
            self.$empList.append("<P>此工位下暂无员工~</p>");
        }
        if(self.id!=null||passFlag) {
            self.$content_wrap.show();
            self.$packup_btn.show();
            self.$goal_notset.hide();
            self.checkDot();
        } else {
            self.$content_wrap.hide();
            self.$goal_notset.show();
            self.$packup_btn.hide();
        }
        this.itemListScroll.refresh();
        this.itemListScroll.scrollTo('top');
    },
    checkDot: function() {
        var now=new Date();
        var targetCalendar=this.reportFilter.getDate();
        var ntime=new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/01');
        var flag1=targetCalendar.getTime()>ntime.getTime();
        //如果有员工未设置业绩
        if(flag1) {
            this.$packup_btn.find('.packup_text').text("员工目标设置");
        } else {
            this.$packup_btn.find('.packup_text').text("员工完成情况");
        }
    },
    renderTitle: function() {
        var mtxt=[];
        var nowm=new Date().getMonth();
        for(var index=0;index<12;index++) {
            if(index==nowm) {
                mtxt.push('本')
                continue;
            }
            mtxt.push(index+1)
        }
        var targetCalendar=this.reportFilter.getDate();
        var shop=this.reportFilter.getShop();
        this.$header.find(".title").text(shop.osName+mtxt[targetCalendar.getMonth()]+"月目标完成进度")
    },
    renderMenu: function renderMenu() {
        var self=this;
        self.$menu.html('');
        var allli=self.$li.clone();
        allli.find('span').text('全部');
        allli.data('data',0);
        allli.addClass('selected');
        self.$menu.append(allli);
        $.each(this.empRoles,function(i,item) {
            var li=self.$li.clone();
            li.find('span').text(item.name);
            li.data('data',item);
            self.$menu.append(li);
        });

        this.roleScroll.refresh();
    }
});