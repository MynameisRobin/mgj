(function() {
    var ReportKeyValueClass = function(opt) {
        $.am.Page.call(this, opt);
    };
    ReportKeyValueClass.prototype = $.am.Page.prototype;
    //初始化
    ReportKeyValueClass.prototype.classInit = function() {
        var _this = this;
        this.$tab = this.$.find(".tab").on("vclick", "li", function() {
            $(this).addClass("selected").siblings().removeClass("selected");
            var i = _this.$.find(".tab").find("li").index($(this));
            _this.$.find("div.storePerfContainer").hide().eq(i).show();
            _this.refresh();
            _this.scrollview.scrollTo("top");
        });

        this.reportFilter = new amGloble.ReportFilter({
            $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
            enableDept: true, //是否启用部门选择器
            onchange: function() { //条件修改时触发
                console.log("onchange");
                _this.getData();
            }
        });
    };
    //渲染Tab
    ReportKeyValueClass.prototype.renderTab = function(data) {
        this.$tab.empty();
        for (var i = 0; i < data.length; i++) {
            var $tabItem = $('<li class="am-clickable">' + data[i].title + '</li>');
            this.$tab.append($tabItem);
        }
    };
    ReportKeyValueClass.prototype.transnum=function(val,tofixed) {
        if(tofixed=="nofixed"){
            return val;
        }else{
            try{
                return val.tofixed(0);
            }catch(e){
                return val;
            }
        }
    };
    //渲染一个区块，跟据  datasection="keyvalue/loop" 属性的配置
    //dataindex 按索引渲染
    ReportKeyValueClass.prototype.renderSection = function($section, data,tofixed) {
        if ($section.attr("datasection") == "keyvalue") {
            //keyvalue类型的数据，按dataindex顺序渲染
            if(data && data.length){
                for (var j = 0; j < data.length; j++) {
                    if (typeof(data[j]) == "undefined") {
                        continue;
                    }
                    var $d = $section.find("[dataindex=" + j + "]");
                    if ($d.attr("datatype") == "amazingNumber") {
                        this.amazingNumber($d, data[j][0], data[j][1]);
                    } else if ($d.attr("datatype") == "pre") {
                        $d.text(this.transnum(data[j],tofixed)+ "%").siblings('.image').find("span").css("width", this.transnum(data[j],tofixed) + "%");
                    } else if ($d.attr("datatype") == "amazingNumber1") {
                        this.amazingNumber1($d, data[j][0], data[j][1], data[j][2]);
                    } else {
                        $d.text(this.transnum(data[j],tofixed));
                    }
                }
            }
            
        } else if ($section.attr("datasection") == "loop") {
            var donotPass0 = 0;
            if ($section.attr("datadonotpass0") == 1) {
                donotPass0 = 1;
            }
            //循环类型的数据
            //拿到模板
            var $s = $section.children().eq(0).hide();
            //清空容器
            $section.children(":gt(0)").remove();

            //后面加的特殊逻辑
            //汇总
            var _total = 0;

            if(data && data.length){
                for (var i = 0; i < data.length; i++) {
                    //克隆模板
                    var $item = $s.clone();
                    if (!donotPass0 && !data[i].value) {
                        continue;
                    }
                    for (var k in data[i]) {
                        //写入属性
                        var v = data[i][k];
                        if (typeof(v) == "number") {
                            v = this.transnum(v,tofixed);
                        }
                        if(k == "value"){
                            _total += Number(v);
                        }
                        $item.find("[datakey=" + k + "]").text(v);


                    }
                    $section.append($item.show());
                }
            }
            var totalName = $section.data("total");
            if(totalName){
                $section.parents(".reportKeyValueDl").find("[data-totalname]").each(function(){
                    var name = $(this).data("totalname");
                    if(totalName == name){
                        $(this).text("总业绩(￥"+_total+")");
                    }
                });  
            }
            
            if($section.children().length==1){
                $section.addClass("empty");
            }else{
                $section.removeClass("empty");
            }
        } else if ($section.attr("datasection") == "table") {
            $section.find("caption").text(data.title);
            //table 类型数据
            var $thead = $section.find("thead>tr").empty();
            if(data.head && data.head.length){
                for (var i = 0; i < data.head.length; i++) {
                    $thead.append('<th>' + data.head[i] + '</th>');
                }
            }
            
            var $tbody = $section.find("tbody").empty();
            if(data.data && data.data.length){
                for (var i = 0; i < data.data.length; i++) {
                    var $tr = $('<tr></tr>');
                    var line = data.data[i];
                    for (var j = 0; j < data.head.length; j++) {
                        var v = line[j];
                        if (typeof(v) == "number") {
                            v = this.transnum(v,tofixed);
                        }
                        $tr.append('<td>' + v + '</td>');
                    }
                    $tbody.append($tr);
                }
            }
            
            if($tbody.is(":empty")){
                $tbody.addClass("empty");
            }else{
                $tbody.removeClass("empty");
            }
        }
    };

    //渲染一个带百分比条的元素
    ReportKeyValueClass.prototype.amazingNumber = function($dom, n, m) {
        var $number = $('<div class="sys_reportBarNumText"><div class="val"></div><div class="per">0%</div><div class="bar"><div class="barInner"></div></div></div>');
        $dom.html($number);
        $number.find(".val").text(n.toFixed(0));
        var p = Math.round(n / m * 100 || 0);
        $number.find(".per").text(p + "%");
        setTimeout(function() {
            $number.find(".barInner").css("width", p + "%");
        }, 1);
    };
    ReportKeyValueClass.prototype.amazingNumber1 = function($dom, n, m, z) {
        $dom.find(".key").text(m);
        $dom.find(".value").text(n.toFixed(0));
        var p = Math.round(n / z * 100 || 0);
        $dom.find(".pre").text(p + "%");
        setTimeout(function() {
            $dom.find(".img span").css("width", p + "%");
        }, 1);



    }
    ReportKeyValueClass.prototype.getData = function(callback) {
        this.setStatus("loading");
        var paras = this.paras;
        var filter = this.reportFilter.getValue();
        console.log("reportFilter", filter);
        try {
            amGloble.api[paras.report.apiName].exec({
                "shopid": paras.shops.shopId, //门店ID
                "period": filter.range[0].format("yyyy-mm-dd") + "_" + filter.range[1].format("yyyy-mm-dd"),
                "depcode": filter.dept.code,
                "filter": {}
            }, function(ret) {
                if (ret.code == 0) {
                    _this.setStatus("normal");
                    if (callback) _this.getDataCallback = callback;
                    if (_this.getDataCallback) _this.getDataCallback(ret);
                } else {
                    _this.setStatus("error");
                }
            });
        } catch (e) {
            console.log(e);
        }
    };
    window.ReportKeyValueClass = ReportKeyValueClass;
    // setTimeout(function(){
    //     _this.changeToMe("",{
    //         aid: "K00",
    //         name: "店内业绩统计表",
    //         level: 2,
    //         apiName: "",
    //         icon: "r11",
    //         target: "reportStorePerf"
    //     });
    // },100);

    var _this = new ReportKeyValueClass({
        id: "page_reportStorePerf",
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
            this.getData(function(ret) {
                _this.handler(ret);
            });
            this.refresh();
        },
        beforeHide: function() {},
        handler: function(ret) {
            if (ret && ret.code == 0 && ret.content) {
                this.renderTab(ret.content);
                //遍历渲染模块
                for (var i = 0; i < ret.content.length; i++) {
                    //显示模板
                    var $view = this.$views.eq(i);
                    //模块数据
                    var data = ret.content[i].data;
                    //如果有数据过滤器，先过滤
                    if (this.dataFilter[i]) data = this.dataFilter[i](data);
                    //渲染模块
                    this.viewRender($view, data);
                }

                this.$tab.find("li:first").trigger("vclick");
            } else {
                // to do error
            }
        },
        //处理数据结构
        dataFilter: [
            //概览
            function(data) {
                //newData需要跟datasetion结构对应
                var newData = [
                    []
                ];
                var keyMap = {
                    "总客数": 0,
                    "劳动业绩": 1,
                    "女客数": 2,
                    "女客业绩": 3,
                    "男客数": 4,
                    "男客业绩": 5,
                    "指定客数": 6,
                    "指定业绩": 7,
                    "非指定数": 8,
                    "非指定业绩": 9,
                    "会员客数": 10,
                    "会员业绩": 11,
                    "散客数": 12,
                    "散客业绩": 13
                };

                for (var i = 0; i < data.length; i++) {
                    if (data[i].title == "客业绩" || data[i].title == "客数") {
                        var arr = data[i].data;
                        //总业绩和总客数
                        var totalPerf = 0,
                            totalCount = 0;
                        if (data[i].title == "客业绩") {
                            totalPerf = arr[0].value + arr[2].value;
                            arr.push({
                                key: "劳动业绩",
                                value: totalPerf
                            });
                        } else if (data[i].title == "客数") {
                            totalCount = arr[0].value;
                        }
                        for (var j = 0; j < arr.length; j++) {
                            var key = arr[j].key;
                            if (typeof(keyMap[key]) == "number") {
                                var idx = keyMap[key];
                                if (idx < 2) {
                                    newData[0][idx] = arr[j].value;
                                } else {
                                    newData[0][idx] = [arr[j].value, (data[i].title == "客业绩" ? totalPerf : totalCount)];
                                }
                            }
                        }
                    } else if (data[i].title == "总业绩") {
                        newData[1] = data[i].data;
                    } else if (data[i].title == "会员划卡") {
                        newData[2] = data[i].data;
                    } else if (data[i].title == "开支与提成") {
                        newData[3] = data[i].data;
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
            //项目
            function(data) {
                //newData需要跟datasetion结构对应
                //界面上已切分为三个section
                var newData = [
                    [],
                    [],
                    []
                ];
                var section0Map = {
                    "项目业绩": 0,
                    "实际入帐": 0,
                    "总个数": 0
                };
                for (var i = 0; i < data.length; i++) {
                    if (data[i].title == "收入明细") {
                        var d = data[i].data;
                        for (var j = 0; j < d.length; j++) {
                            var mapVal = section0Map[d[j].key];
                            if (typeof(mapVal) == "number") {
                                if (mapVal >= 0) newData[mapVal].push(d[j]);
                            } else {
                                newData[1].push(d[j]);
                            }
                        }
                    } else if (data[i].title == "项目明细") {
                        newData[2] = data[i];
                    }
                }
                console.log(newData);
                return newData;
            },
            //开充卡
            function(data) {
                //newData需要跟datasetion结构对应
                //界面上已切分为四个section
                var newData = [
                    [],
                    [],
                    [],
                    []
                ];
                var section0Map = {
                    "开卡业绩": 0,
                    "续卡业绩": 0,
                    "开卡个数": -1,
                    "续卡个数": -1,
                };
                for (var i = 0; i < data.length; i++) {
                    if (data[i].title == "开充卡明细") {
                        var d = data[i].data;
                        for (var j = 0; j < d.length; j++) {
                            var mapVal = section0Map[d[j].key];
                            if (typeof(mapVal) == "number") {
                                if (mapVal >= 0) newData[mapVal].push(d[j]);
                            } else {
                                newData[1].push(d[j]);
                            }
                        }
                    } else if (data[i].title == "新开卡明细") {
                        newData[2] = data[i];
                    } else if (data[i].title == "续充卡明细") {
                        newData[3] = data[i];
                    }
                }
                console.log(newData);
                return newData;
            },
            //套餐
            function(data) {
                //newData需要跟datasetion结构对应
                //界面上已切分为四个section
                var newData = [
                    [],
                    [],
                    []
                ];
                var section0Map = {
                    "总业绩": 0,
                    "总个数": 0,
                };
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == "keyvalue" && data[i].title == "套餐购买明细") {
                        var d = data[i].data;
                        for (var j = 0; j < d.length; j++) {
                            var mapVal = section0Map[d[j].key];
                            if (typeof(mapVal) == "number") {
                                if (mapVal >= 0) newData[mapVal].push(d[j]);
                            } else {
                                newData[1].push(d[j]);
                            }
                        }
                    }
                    if (data[i].type == "keyvalue" && data[i].title == "套餐成本明细") {
                        var d = data[i].data;
                        for (var j = 0; j < d.length; j++) {
                            newData[2].push(d[j]);
                        }
                    } else if (data[i].title == "套餐购买明细") {
                        newData[3] = data[i];
                    }
                }
                console.log(newData);
                return newData;
            },
            //年卡
            function(data) {
                //newData需要跟datasetion结构对应
                //界面上已切分为四个section
                var newData = [
                    [],
                    [],
                    []
                ];
                var section0Map = {
                    "总业绩": 0,
                    "总个数": 0,
                };
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == "keyvalue" && data[i].title == "年卡购买明细") {
                        var d = data[i].data;
                        for (var j = 0; j < d.length; j++) {
                            var mapVal = section0Map[d[j].key];
                            if (typeof(mapVal) == "number") {
                                if (mapVal >= 0) newData[mapVal].push(d[j]);
                            } else {
                                newData[1].push(d[j]);
                            }
                        }
                    } else if (data[i].title == "年卡购买明细") {
                        newData[2] = data[i];
                    }
                }
                console.log(newData);
                return newData;
            },
            //卖品
            function(data) {
                //newData需要跟datasetion结构对应
                //界面上已切分为四个section
                var newData = [
                    [],
                    [],
                    []
                ];
                var section0Map = {
                    "总业绩": 0,
                    "总个数": 0,
                };
                for (var i = 0; i < data.length; i++) {
                    if (data[i].title == "卖品购买明细" && data[i].type == "keyvalue") {
                        var d = data[i].data;
                        for (var j = 0; j < d.length; j++) {
                            var mapVal = section0Map[d[j].key];
                            if (typeof(mapVal) == "number") {
                                if (mapVal >= 0) newData[mapVal].push(d[j]);
                            } else {
                                newData[1].push(d[j]);
                            }
                        }
                    } else if (data[i].title == "卖品购买明细" && data[i].type == "table") {
                        newData[2] = data[i];
                    }
                }
                console.log(newData);
                return newData;
            }
        ],
        viewRender: function($view, data) {
            var $sections = $view.find("[datasection]");
            for (var i = 0; i < data.length; i++) {
                var $sec = $sections.eq(i);
                _this.renderSection($sec, data[i]);
            }
        }
    });
    amGloble.page.reportStorePerf = _this;
})();
