'use strict';

amGloble.page.shopGoal=new $.am.Page({
    id: 'page-shopGoal',
    backButtonOnclick: function backButtonOnclick() {
        $.am.changePage(amGloble.page.dashboard,'slideright');
    },
    init: function init() {
        var self=this;
        this.reportFilter=new amGloble.ReportFilter({
            $: this.$.find('.am-body-wrap'), //选择器的dom将插入到此节点后面
            enableShop: true,
            //enableDept: true, //是否启用部门选择器
            // enableLevel: true, //是否启用部门选择器
            onDatePickerClick: function onDatePickerClick() {},
            onchange: function onchange() {
                //条件修改时触发
                self.resetData();
            }
        });
        this.$wrap=this.$.find('.am-body-wrap');
        this.$.on('vclick','.am-body-wrap .jump_btn',function() {
            //查看员工列表
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.empGoalsList,'slideup',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth});
        }).on('vclick','.am-header .right.button',function() {
            //编辑
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.setShopGoal,'slideup',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth});
        }).on('vclick','.goal_notset .set_goalbtn',function() {
            //编辑
            var shop=self.reportFilter.getShop(); //得到选择的店铺
            var targetCalendar=self.reportFilter.getDate();
            var targetYear=targetCalendar.format('yyyy');
            var targetMonth=targetCalendar.format('mm');
            $.am.changePage(amGloble.page.setShopGoal,'slideup',{id: self.id,targetTypes: self.targetTypes,targets: self.targets,empRoles: self.empRoles,empLevels: self.empLevels,empTargets: self.empTargets,shop: shop,time: targetYear+'/'+targetMonth});
        });
        this.$goal_notset=this.$.find('.goal_notset');
        this.$content_wrap=this.$.find('.content_wrap');
        this.$jump_btn=this.$.find('.am-body-wrap .jump_btn');
        this.$scroll=new $.am.ScrollView({
            $wrap: this.$.find('.am-body-wrap'),
            $inner: this.$.find('.content_wrap'),
            direction: [0,1]
        });
        // this.$scroll.touchEnd = function (pos) {
        //   if (pos[1] < -50) {
        //     $.am.changePage(amGloble.page.empGoalsList, "slideup");
        //   }
        // }


        this.$goalChartWrapper=this.$.find('.goal-chart-wrapper');
        this.$goalChartContainer=this.$goalChartWrapper.find('.goal-chart-container').clone().remove();
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
            enableEmp: false,
            shopRole: '3,',
            datePickerType: 'ym'
        };
        this.reportFilter.setOpt(opt);
        if(ret=='back') {
            return;
        }
        if(ret&&ret.time) {
            this.reportFilter.setDate(ret.time,null,true);
        }
        if(ret&&ret.targets) {
            this.empLevels=ret.empLevels;
            this.empRoles=ret.empRoles;
            this.empTargets=ret.empTargets;
            this.targets=ret.targets;
            this.targetTypes=ret.targetTypes;
            this.id=ret.id;
            this.reportFilter.setShop(ret.shop,true);
            this.renderData();
        } else {
            this.resetData();
        }
    },
    afterShow: function afterShow() {},
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
        var now=new Date();
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
        if (device.platform == "iOS") {
            ptop+=20;
        }
        this.setStatus('loading',"数据加载中……",{top:ptop});
        this.getLevels();
        this.getData();
    },
    readerBar: function(arr,flag) {
        var self=this;
        self.$goalChartWrapper.find('.goal-chart-container').remove();
        var targetCalendar=self.reportFilter.getDate();
        var targetMonth=targetCalendar.format('mm');
        var days=30;
        var now=new Date();
        if([1,3,5,7,8,10,12].indexOf(now.getMonth()+1)!=-1) {
            days=31;
        }
        $.each(arr,function(i,item) {
            if(self.targetTypes.indexOf(","+item.type)==-1) {
                return;
            }
            var chartContainer=self.$goalChartContainer.clone();
            chartContainer.find('.goal_tit>.text').text('目标'+(item.target? item.target:0));
            if(item.type==1) {
                chartContainer.find('.goal_tit>.icon').addClass('icon-zhanghuyue');
            } else {
                chartContainer.find('.goal_tit>.icon').addClass('icon-meihua');
            }
            self.$goalChartWrapper.append(chartContainer);
            var achi=item.achi? item.achi:0;
            var opt;
            if(!achi&&parseInt(targetMonth)!=now.getMonth()+1&&!flag) {
                opt={
                    bigger: true,
                    color0: '#133071',
                    percent1: 0,
                    single: true
                };
                self.$.find('.not_start_box').show();
            } else if(!item.target) {

                opt={
                    bigger: true,
                    percent1: 0,
                    percent2: 0,
                    text2: (item.type==1? '现金业绩':'劳动业绩')+'<br><strong style=\'font-size:18px;\'>'+achi+'</strong>'
                };
                self.$.find('.not_start_box').hide();
            } else {
                opt={
                    bigger: true,
                    percent1: now.getDate()/days*100,
                    percent2: achi/item.target*100,
                    text1: '预期',
                    text2: (item.type==1? '现金业绩':'劳动业绩')+'<br><strong style=\'font-size:18px;\'>'+achi+'</strong>'
                };
                self.$.find('.not_start_box').hide();
            }
            var chart=new ChartBar({
                target: chartContainer.find('.goal-chart'),
                vertical: true,
                config: {
                    color0: '#173576'
                },
                datasets: [opt]
            });
            chart.animation();
        });
    },
    getLevels: function getLevels() {
        var self=this;
        var shop=this.reportFilter.getShop();
        if(!shop) {
            return;
        }
        var parentShopId=shop.parentShopId;
        // if(shop.softgenre==3){
        //     parentShopId=shop.baseId;
        // }
        amGloble.api.empdutyMetadata.exec({
            'parentShopId': parentShopId
        },function(ret) {
            if(ret.code==0) {
                var data=ret.content;
                self.empRoles=data.employeeRoles;
                self.empLevels=data.employeeLevels;
            } else {
                amGloble.msg('数据加载失败,点击重试!');
            }
        });
    },
    //检查是否有员工未设置业绩
    checkDot: function(flag2) {
        var now=new Date();
        var targetCalendar=this.reportFilter.getDate();
        var ntime=new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/01');
        var flag=true;
        var flag1=targetCalendar.getTime()>ntime.getTime();
        for(var j=0;j<this.empTargets.length;j++) {
            var ele=this.empTargets[j];
            if(!ele.id) {
                flag=false;
            }
        }
        if(!flag&&!flag2) {
            this.$jump_btn.find('.jump_text').addClass('dot');
        } else {
            this.$jump_btn.find('.jump_text').removeClass('dot');
        }

        //如果有员工未设置业绩
        if(flag1) {
            this.$jump_btn.find('.jump_text').html("员工目标设置");
        } else {
            this.$jump_btn.find('.jump_text').html("员工完成情况");

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
    renderData: function() {
        var self=this;
        self.renderTitle();
        var targetCalendar=self.reportFilter.getDate();
        var now=new Date();
        var ntime=new Date(now.getFullYear()+'/'+(now.getMonth()+1)+'/01');
        //如果已经过去的月份
        var passFlag=(targetCalendar.getTime()<ntime.getTime());
        self.$.find('.not_start_box').text("未开始")
        self.$.find('.not_start_box').show()
        if(self.id!=null||passFlag) {
            self.readerBar(self.targets,passFlag);
            self.$content_wrap.show();
            self.$jump_btn.show();
            self.$goal_notset.hide();
            self.checkDot(passFlag);
            if(passFlag&&self.id==null){
                self.$.find('.not_start_box').show();
                self.$.find('.not_start_box').text("未设置")
            }
        } else {
            self.$content_wrap.hide();
            self.$goal_notset.show();
            self.$jump_btn.hide();
        }
        self.readerBtn();
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
        if(shop.softgenre==3){
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
                self.renderData();
            } else {
                amGloble.msg('数据加载失败,点击重试!');
            }
            self.setStatus('normal');
        });
    }
});