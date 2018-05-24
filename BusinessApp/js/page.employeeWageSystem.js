(function() {
    var _this = new ReportKeyValueClass({
        id: "page-employeeWageSystem",
        init: function() {
            this.classInit();
            this.$views = this.$.find("div.storePerfContainer").hide();
        },
        beforeShow: function(paras) {
            this.reportFilter.setOpt();
            this.setStatus("loading");
        },
        afterShow: function(paras) {
            console.log(paras);
            this.paras = paras;
            this.$.find(".am-header .title p").text(paras.shops.shopFullName);
            this.getData(function(ret){
                _this.handler(ret);
            });
            this.refresh();
        },
        beforeHide: function() {
        },
        handler:function(ret){
            if(ret && ret.code==0 && ret.content){
                this.renderTab(ret.content);
                //遍历渲染模块
                for(var i=0;i<ret.content.length;i++){
                    //显示模板
                    var $view = this.$views.eq(i);
                    //模块数据
                    var data = ret.content[i].data;
                    //如果有数据过滤器，先过滤
                    if(this.dataFilter[i]) data = this.dataFilter[i](data);
                    //渲染模块
                    this.viewRender($view,data);
                }

                this.$tab.find("li:first").trigger("vclick");
            }else{
                // to do error
            }
        },
        //处理数据结构
        dataFilter:[
            //概览
            function(data){
                //newData需要跟datasetion结构对应
                var newData = [[],[]];
                var keyMap = {
                    "提成汇总":0,
                    "业绩提成":1,
                    "卖品提成":2,
                    "开充卡提成":3,
                    "套餐销售提成":4,
                    "年卡销售提成":5,
                    "招兵提成":6,
                    "隐形提成":7,
                    "内外创":8
                };
                 for(var i=0;i<data.length;i++){
                    if(data[i].title=="提成汇总"){
                        var arr = data[i].data;
                        for(var j=0;j<arr.length;j++){
                            var key = arr[j].key;
                            if(typeof(keyMap[key])=="number"){
                                var idx = keyMap[key];
                                if(idx<1){
                                    newData[0][idx] = arr[j];
                                }else{
                                    newData[1][idx-1] = arr[j];
                                }
                            }
                        }
                    }

                 }


                // for(var i=0;i<data.length;i++){
                //     if(data[i].title == "客业绩" || data[i].title == "客数"){
                //         var arr = data[i].data;
                //         for(var j=0;j<arr.length;j++){
                //             var key = arr[j].key;
                //             if(typeof(keyMap[key])=="number"){
                //                 newData[0][keyMap[key]] = arr[j].value;
                //             }
                //         }
                //     }else if(data[i].title=="总业绩"){
                //         newData[1] = data[i].data;
                //     }else if(data[i].title=="会员划卡"){
                //         newData[2] = data[i].data;
                //     }else if(data[i].title=="开支与提成"){
                //         newData[3] = data[i].data;
                //     }
                // }
                console.log(newData);
                return newData;
            },
            //按总业绩
            function(data){
                var newData = [[],[]];
                var num=0;
               for(var i=0;i<data.length;i++){
                    if(data[i].title =="总业绩提成比率"){
                        newData[i]=data[i];
                        _this.$.find(".totalRank table").show();
                        num++;
                    }
                    if(data[i].title=="阶梯提成"){
                        if(num==0){
                            _this.$.find(".totalRank .dd").show();
                            newData[i]=data[i].data;
                        }

                    }
                    if(data[i].title =="单项目提成明细"){
                        if(num==0){
                            newData[i]=data[i];
                            _this.$.find(".totalRank table").show();
                        }

                    }

                }

                console.log(newData);
                return newData;
            },
            //按单个
            function(data){
                var newData = [[]];

                for(var i=0;i<data.length;i++){
                    if(data[i].title =="单项目提成明细"){
                        newData[i]=data[i];
                    }
                }
                console.log(newData);
                return newData;
            }
        ],
        viewRender:function($view,data){
            var $sections = $view.find("[datasection]");
            for(var i=0;i<data.length;i++){
                var $sec = $sections.eq(i);
                _this.renderSection($sec,data[i],"nofixed");
            }
        },
        getData:function(callback){
            this.setStatus("loading");
            var paras=this.paras;
            var filter = this.reportFilter.getValue();
            console.log("reportFilter",filter);
            try{
                amGloble.api[paras.report.apiName].exec({
                    shopid: paras.shops.shopId, //门店ID
                    period: filter.range[0].format("yyyy-mm-dd")+"_"+filter.range[1].format("yyyy-mm-dd"), //统计周期
                    empid:amGloble.metadata.userInfo.userId,
                    "depcode":"-1"
                }, function(ret) {
                    if (ret.code == 0) {
                        _this.setStatus("normal");
                        if(callback) _this.getDataCallback = callback;
                        if(_this.getDataCallback) _this.getDataCallback(ret);
                    } else {
                        _this.setStatus("error");
                    }
                });
            }catch(e){
                console.log(e);
            }
        },
        classInit:function(){
            var _this=this;
            this.$tab = this.$.find(".tab").on("vclick","li",function(){
                $(this).addClass("selected").siblings().removeClass("selected");
                var i = _this.$.find(".tab").find("li").index($(this));
                _this.$.find("div.storePerfContainer").hide().eq(i).show();
                _this.refresh();
                _this.scrollview.scrollTo("top");
            });

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
                enableDept: false, //是否启用部门选择器
                onchange: function() { //条件修改时触发
                    console.log("onchange");
                    _this.getData();
                }
            });
        }
    });
    amGloble.page.employeeWageSystem =_this;
})();
