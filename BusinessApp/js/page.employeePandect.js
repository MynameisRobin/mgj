(function() {

    var _this = new ReportKeyValueClass({
        id: "page-employeePandect",
        init: function() {
            this.classInit();
            this.$views = this.$.find("div.storePerfContainer").hide();
        },
        beforeShow: function(paras) {
            this.reportFilter.setOpt();
            this.setStatus("loading");
        },
        afterShow: function(paras) {
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
            //总业绩
            function(data){
                //newData需要跟datasetion结构对应
                var newData = [[]];
                var keyMap = {
                    "总现金业绩":0,
                    "总劳动业绩":1,
                    "总卖品业绩":2,
                    "总开充卡业绩":3,
                    "总套餐销售业绩":4,
                    "总年卡销售业绩":5
                };
                console.log(data);
                for(var i=0;i<data.length;i++){
                    if(data[i].title=="业绩汇总"){
                        var arr = data[i].data;
                        for(var j=0;j<arr.length;j++){
                            var key = arr[j].key;
                            if(typeof(keyMap[key])=="number"){
                                var idx = keyMap[key];

                                newData[i][idx] = arr[j];

                            }
                        }
                    }

                }
                console.log(newData);
                return newData;
            },
            //劳动业绩
            function(data){
                var keyMap = {
                    "总业绩":0,
                    "指定业绩":1,
                    "指定率%":2,
                    "非指定业绩":3,
                    "男客业绩":4,
                    "女客业绩":5
                };
                var newData = [[],[]];
                for(var i=0;i<data.length;i++){
                    if(data[i].title=="劳动业绩"){
                        var arr=data[i].data;
                        for(var j=0;j<arr.length;j++){
                            var key = arr[j].key;
                            if(typeof(keyMap[key])=="number"){
                                var idx = keyMap[key];
                                newData[i][idx] = arr[j].value;

                            }
                        }
                    }
                    if(data[i].title=="业绩明细"){
                        newData[i]=data[i];
                    }
                }

                console.log(newData);
                return newData;
            },
            //客流
            function(data){
                var newData = [[]];
                var keyMap = {
                    "总客数":0,
                    "客单价":1,
                    "指定客数":2,
                    "非指定客数":3,
                    "男客数":4,
                    "女客数":5
                };
                for(var i=0;i<data.length;i++){
                    if(data[i].title=="客流"){
                        var arr=data[i].data;
                        for(var j=0;j<arr.length;j++){
                            var key = arr[j].key;
                            if(typeof(keyMap[key])=="number"){
                                var idx = keyMap[key];
                                if(idx<2){
                                    newData[i][idx] = arr[j].value;
                                }else{
                                    newData[i][idx] = [arr[j].value,arr[j].key,arr[0].value];
                                }


                            }
                        }
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
                _this.renderSection($sec,data[i]);
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
                    empid:amGloble.metadata.userInfo.userId
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
    amGloble.page.employeePandect =_this;
})();
