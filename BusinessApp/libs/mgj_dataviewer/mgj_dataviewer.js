(function(window, $) {

    var cashierRound = function(val, kept) {
        if (kept) {
            return Math.round(val * kept) / kept;
        }
        return Math.round(val * 100) / 100;
    };
    //默认配置
    var defaultOption = {
            config: {
                title: "",
                frozenHead: 1, //是否冻结头部
                frozenLeftColumns: 1, //冻结的列数
                frozenRightColumns: 0, //冻结的列数
                disableTotal: 0, //是否禁用合计栏
                systemBtn: {
                    "disableColumnsSettingBtn": 0,
                    "disablePrintBtn": 0,
                    "disableExportBtn": 0
                }
            },
            events: {
                theadEachRow: function() {},
                theadEachColumn: function() {},
                theadEachCell: function() {},
                tbodyEachRow: function() {},
                tbodyEachColumn: function() {},
                tbodyEachCell: function() {},
            }
        },
        defaultColumnOption = {
            // template: null, //模板
            width: 100, //auto|10%|200
            sortable: 1, //0 不可排序 1 按数字排序 2 按字符串排序
            enableSetVisible: 1, //0 不可配置显示/隐藏 1 可配置显示/隐藏
            defaultVisible: 1, //0 默认隐藏 1 默认显示
            decimal: 1, //
            disableTotal: 0
                // filter: null //筛选器
        };

    //HTML text
    var HS_body = ['<div class="mgj_dataviewer noPager">',
            '    <div class="mgj_dataviewer_table">',
            '        <table class="mgj_dataviewer_tbody" id="page_exportTable" cellpadding="0" cellspacing="0"><thead></thead><tbody></tbody></table>',
            '        <table class="mgj_dataviewer_fixedLeft" cellpadding="0" cellspacing="0"><thead></thead><tbody></tbody></table>',
            '        <table class="mgj_dataviewer_fixedRight" cellpadding="0" cellspacing="0"><thead></thead><tbody></tbody></table>',
            '        <table class="mgj_dataviewer_fixedTop" cellpadding="0" cellspacing="0"><thead></thead></table>',
            '        <table class="mgj_dataviewer_fixedBottom" cellpadding="0" cellspacing="0"><tbody></tbody></table>',
            '        <table class="mgj_dataviewer_fixedTopLeft" cellpadding="0" cellspacing="0"><thead></thead></table>',
            '        <table class="mgj_dataviewer_fixedTopRight" cellpadding="0" cellspacing="0"><thead></thead></table>',
            '        <table class="mgj_dataviewer_fixedBottomLeft" cellpadding="0" cellspacing="0"><tbody></tbody></table>',
            '        <table class="mgj_dataviewer_fixedBottomRight" cellpadding="0" cellspacing="0"><tbody></tbody></table>',
            '    </div>',
            '    <div class="mgj_dataviewer_pager"></div>',
            '</div>'
        ].join(""),
        HS_headerBtn = '<span class="button icon3">重算本月提成</span>';


    var RLDataviewer = function(option, $container) {
        // console.log(option);
        var self = this;
        option = this.setOption(option);

        this.$ = $(HS_body).appendTo($container);

        //主数据表格
        this.$dt = this.$.find(".mgj_dataviewer_tbody");
        this.$dtThead = this.$dt.children("thead");
        this.$dtTbody = this.$dt.children("tbody");

        //左侧冻结部分
        this.$fl = this.$.find(".mgj_dataviewer_fixedLeft");
        this.$flThead = this.$fl.children("thead");
        this.$flTbody = this.$fl.children("tbody");
        //右侧冻结部分
        this.$fr = this.$.find(".mgj_dataviewer_fixedRight");
        this.$frThead = this.$fr.children("thead");
        this.$frTbody = this.$fr.children("tbody");
        //头部冻结部分
        this.$ft = this.$.find(".mgj_dataviewer_fixedTop");
        this.$ftThead = this.$ft.children("thead");
        //底部冻结部分
        this.$fb = this.$.find(".mgj_dataviewer_fixedBottom");
        this.$fbTbody = this.$fb.children("tbody");

        //左上角
        this.$ftl = this.$.find(".mgj_dataviewer_fixedTopLeft");
        this.$ftlThead = this.$ftl.children("thead");
        //右上角
        this.$ftr = this.$.find(".mgj_dataviewer_fixedTopRight");
        this.$ftrThead = this.$ftr.children("thead");
        //左下角
        this.$fbl = this.$.find(".mgj_dataviewer_fixedBottomLeft");
        this.$fblTbody = this.$fbl.children("tbody");
        //右下角
        this.$fbr = this.$.find(".mgj_dataviewer_fixedBottomRight");
        this.$fbrTbody = this.$fbr.children("tbody");

        //冻结滚动处理
        this.$scroller = this.$.find(".mgj_dataviewer_table");

        // a.scroll(function() {
        //     var $this = $(this);
        //     var st = $this.scrollTop(),
        //         sl = $this.scrollLeft();
        //     //上下左右浮动table
        //     self.$ft.css("transform", "translateY(" + st + "px)");
        //     self.$fb.css("transform", "translateY(" + st + "px)");
        //     self.$fl.css("transform", "translateX(" + sl + "px)");
        //     self.$fr.css("transform", "translateX(" + sl + "px)");
        //
        //     //四个角table
        //     var cornerPos = "translate(" + sl + "px," + st + "px)";
        //     self.$ftl.css("transform", cornerPos);
        //     self.$ftr.css("transform", cornerPos);
        //     self.$fbl.css("transform", cornerPos);
        //     self.$fbr.css("transform", cornerPos);
        // });

        var $inner = this.$scroller.children(".mgj_dataviewer_tbody");
        this.scrollview = new $.am.ScrollView({
            $wrap: this.$scroller,
            $inner: $inner,
            direction: [1, 1]
        });

        this.scrollview._onupdate = function(pos) {
            // 主区域
            var minx = this._min[0];
            var miny = this._min[1];
            var x = pos[0];
            var y = pos[1];
            this.$inner.setTransformPos(pos, "xy", this.hasInput);
            var x1, y1;
            if (x > 0) {
                x1 = x;
            } else if (x <= 0 && x >= minx) {
                x1 = 0;
            } else if (x < minx) {
                x1 = x - minx;
            }
            if (y > 0) {
                y1 = y;
            } else if (y <= 0 && y >= miny) {
                y1 = 0;
            } else if (y < miny) {
                y1 = y - miny;
            }
            // console.log(x, y, x1, y1);
            // self.$tbx.setTransformPos([x, y1], "xy", this.hasInput);
            // self.$tby.setTransformPos([x1, y], "xy", this.hasInput);

            //上下左右浮动table
            self.$ft.setTransformPos([x, y1], "xy", this.hasInput);
            self.$fb.setTransformPos([x, y1], "xy", this.hasInput);
            self.$fl.setTransformPos([x1, y], "xy", this.hasInput);
            self.$fr.setTransformPos([x1, y], "xy", this.hasInput);

            //四个角table
            self.$ftl.setTransformPos([x1, y1], "xy", this.hasInput);
            self.$ftr.setTransformPos([x1, y1], "xy", this.hasInput);
            self.$fbl.setTransformPos([x1, y1], "xy", this.hasInput);
            self.$fbr.setTransformPos([x1, y1], "xy", this.hasInput);

            //pos[0]
        };


        this.$scroller.on("vclick", "table > thead th", function() {
            var $this = $(this);
            if ($this.hasClass("sortable")) {
                var sortType = $this.data("sorttype"),
                    order,
                    $sortables = self.$scroller.find("table > thead th.sortable");
                if ($this.hasClass("desc")) {
                    $sortables.removeClass("desc asc");
                    $this.addClass("asc");
                    order = -1;
                } else {
                    $sortables.removeClass("desc asc");
                    $this.addClass("desc");
                    order = 1;
                }
                self.sort($(this).data("index"), sortType, order);
            }
        });
        //窗口变化自动调整
        // $(window).resize(function() {
        //     self.setFrozenSize();
        // });

        //
        this.setVisible();

        return this;
    };


    RLDataviewer.prototype = {
        getDv: function(opt) {
            return this;
        },
        setOption: function(option) {
            this.originalOption = $.extend(true, {}, defaultOption, option);
            return this.option = $.extend(true, {}, defaultOption, option);
        },
        refreshTable: function() {
            console.log(this.option);
            this._renderHead();
            this._renderBody();
            this.setFrozenSize();
        },

        //渲染头部
        _renderHead: function() {
            var option = this.option,
                config = option.config,
                headTop = option.headTop,
                head = option.head,
                HS_tr = "<tr></tr>",
                $dtThs = [],
                $ftThs = [],
                columnOption, $dtTr, $ftTr, $flTr, $frTr, $ftlTr, $ftrTr, i, item, $th;

            //头部第二行渲染
            $dtTr = $(HS_tr).appendTo(this.$dtThead.empty()); //主体
            $ftTr = $(HS_tr).appendTo(this.$ftThead.empty()); //头部
            $flTr = $(HS_tr).appendTo(this.$flThead.empty()); //左侧
            $frTr = $(HS_tr).appendTo(this.$frThead.empty()); //右侧
            $ftlTr = $(HS_tr).appendTo(this.$ftlThead.empty()); //左上角
            $ftrTr = $(HS_tr).appendTo(this.$ftrThead.empty()); //右上角

            if (head && head.length) {

                for (i = 0; i < head.length; i++) {
                    item = head[i];
                    columnOption = this._getColumnOption(i);
                    // console.log(columnOption);
                    if (columnOption.sortable) {
                        HS_th = "<th data-sorttype='" + columnOption.sortable + "' data-index='" + i + "' class='am-clickable sortable'><div style='width:" + (columnOption.width - 7) + "px'>" + item + "</div></th>";
                    } else {
                        HS_th = "<th><div style='width:" + (columnOption.width - 7) + "px'>" + item + "</div></th>";
                    }
                    var $dtTh = $(HS_th);
                    var $ftTh = $(HS_th);
                    $dtTr.append($dtTh);
                    $ftTr.append($ftTh);
                    $dtThs.push($dtTh);
                    $ftThs.push($ftTh);
                    if (i < config.frozenLeftColumns) {
                        $flTr.append(HS_th);
                        $ftlTr.append(HS_th);
                    }
                    if (head.length - i <= config.frozenRightColumns) {
                        $frTr.append(HS_th);
                        $ftrTr.append(HS_th);
                    }
                }
            }

            if (headTop && headTop.length) {
                //头部第一行渲染
                $dtTr = $(HS_tr).prependTo(this.$dtThead); //主体
                $ftTr = $(HS_tr).prependTo(this.$ftThead); //顶部

                var count = 0;

                for (i = 0; i < headTop.length; i++) {
                    item = headTop[i];
                    columnOption = this._getColumnOption(count);
                    if (!item.colspan || item.colspan <= 1) {
                        var w = columnOption.width;
                    } else {
                        var w = 0;
                        //计算
                        for (var j = 0; j < item.colspan; j++) {
                            w += this._getColumnOption(count + j).width;
                            // console.log(w);
                        }
                    }
                    $th = $("<th rowspan='" + (item.rowspan || "1") + "' colspan='" + (item.colspan || "1") + "'><div style='width:" + (w - 7) + "px'>" + item.text + "</div></th>");
                    //记录第二行需要hide的list
                    if (item.rowspan > 1) {
                        $th.attr("data-sorttype", columnOption.sortable).attr("data-index", count).addClass("sortable am-clickable");
                        $dtThs[count].hide();
                        $ftThs[count].hide();
                    } else {

                    }
                    $dtTr.append($th.clone(true, true));
                    $ftTr.append($th.clone(true, true));
                    count += item.colspan * 1 || 1;
                }
            }

        },

        //渲染data
        _renderBody: function(data) {
            var option = this.option,
                config = option.config,
                data = data || option.data,
                HS_tr = "<tr></tr>",
                totals = this.totals = [];

            //数据
            var $dtTbody = this.$dtTbody.empty(); //主表格
            var $flTbody = this.$flTbody.empty(); //左侧
            var $frTbody = this.$frTbody.empty(); //右侧
            var $fbTbody = this.$fbTbody.empty(); //底部
            var $fblTbody = this.$fblTbody.empty(); //底部
            var $fbrTbody = this.$fbrTbody.empty(); //底部

            if (data && data.length) {

                for (var i = 0; i <= data.length; i++) {

                    //数据体
                    var $dtTr = $(HS_tr).appendTo($dtTbody),
                        $flTr = $(HS_tr).appendTo($flTbody),
                        $frTr = $(HS_tr).appendTo($frTbody),
                        row = data[i];
                    if (!config.disableTotal && i == data.length) {
                        //合计
                        var $fbTr = $(HS_tr).appendTo($fbTbody),
                            $fblTr = $(HS_tr).appendTo($fblTbody),
                            $fbrTr = $(HS_tr).appendTo($fbrTbody);
                        row = totals;
                    }

                    if (row && row.length) {
                        for (var j = 0; j < row.length; j++) {
                            var columnOption = this._getColumnOption(j),
                                cell = row[j];

                            if (!config.disableTotal && i == 0) {
                                totals[j] = 0;
                            }
                            if (!config.disableTotal && i == data.length) {
                                //合计行处理
                                if (columnOption.disableTotal) {
                                    //如果不允许合计，那么直接输出--
                                    cell = "";
                                }
                                var str = this._templateProcessor(cell, "%data%", null, columnOption.decimal);
                            } else {
                                //其他行处理
                                var str = this._templateProcessor(cell, columnOption.template, columnOption.percentage, columnOption.decimal);
                            }
                            var HS_td = "<td><div style='width:" + (columnOption.width - 7) + "px'>" + str + "</div></td>";
                            var HS_th = "<th><div style='width:" + (columnOption.width - 7) + "px'>" + str + "</div></th>";
                            $dtTr.append(HS_td);
                            if (!config.disableTotal && i == data.length) {
                                $fbTr.append(HS_td);
                            } else if (!config.disableTotal) {
                                // console.log(row, cell, j);
                                var d = (cell.data == null ? cell : cell.data) * 1;
                                if (j == 0) {
                                    totals[j] = "合计";
                                } else if (!columnOption.percentage && totals[j] != null && !isNaN(d)) {
                                    totals[j] += d;
                                } else {
                                    totals[j] = null;
                                }
                            }
                            if (j < config.frozenLeftColumns) {
                                $flTr.append(HS_th);
                                if (!config.disableTotal && i == data.length) {
                                    $fblTr.append(HS_td);
                                }
                            }
                            if (row.length - j <= config.frozenRightColumns) {
                                $frTr.append(HS_th);
                                if (!config.disableTotal && i == data.length) {
                                    $fbrTr.append(HS_td);
                                }
                            }
                        }
                    }
                }
            }
            // console.log(totals);
        },

        _templateProcessor: function(cell, template, percentage, decimal) {
            //处理某个单元格的模板，输出html
            decimal = decimal == null ? 1 : decimal;
            template = template || "%data%";
            if (!cell || typeof cell != "object") {
                if (!cell) {
                    template = "%data%";
                    cell = {
                        data: "--"
                    };
                } else {
                    cell = {
                        data: cell
                    };
                }
            }
            cell = $.extend({}, cell);
            //如果是百分比，则转换成百分比的字符串
            if (percentage) {
                cell.data = cell.data * 1;
                if (isNaN(cell.data)) {
                    cell.data = cashierRound(0, Math.pow(10, decimal)).toFixed(decimal) + "%";
                } else {
                    cell.data = cashierRound(cell.data * 100, Math.pow(10, decimal)).toFixed(decimal) + "%";
                }
            } else {
                if (!isNaN(cell.data * 1)) {
                    cell.data = cashierRound(cell.data, Math.pow(10, decimal)).toFixed(decimal);
                }
            }
            for (var variable in cell) {
                if (cell.hasOwnProperty(variable)) {
                    template = template.replace("%" + variable + "%", cell[variable]);
                }
            }
            return template;
        },

        //获取指定列的配置
        _getColumnOption: function(idx, original) {
            var ret = {},
                columns = this.option.columns;
            if (original) {
                columns = this.originalOption.columns;
            }
            if (columns && columns.length) {
                ret = columns[idx];
            }
            return $.extend(true, {}, defaultColumnOption, ret);
        },

        //排序
        sort: function(idx, type, order) {
            var toNumber = function(str) {
                var ret = str * 1;
                if (isNaN(ret)) {
                    ret = 0;
                }
                return ret;
            };
            var data = this.option.data.concat().sort(function(a, b) {
                var a1 = a[idx],
                    b1 = b[idx];
                if (typeof a1 == "object") {
                    a1 = a1.data;
                }
                if (typeof b1 == "object") {
                    b1 = b1.data;
                }
                if (type == 1) {
                    //数字
                    a1 = toNumber(a1);
                    b1 = toNumber(b1);
                    return (b1 - a1) * order;
                } else {
                    return b1.localeCompare(a1) * order;
                }
            });
            this._renderBody(data);
        },

        //计算锁定行列宽高
        setFrozenSize: function() {
            var self = this;
            var option = this.option,
                config = option.config,
                head = option.head,
                tableWidth = 0,
                visibleCfg = this.visibleCfg;
            if (head && head.length) {
                for (var i = 0; i < head.length; i++) {
                    var w = self._getColumnOption(i).width * 1;
                    tableWidth += w;
                }

                //设置fixed table的宽度，保持和data table一致
                this.$dt.width(tableWidth);
                this.$ft.width(tableWidth);
                this.$fb.width(tableWidth);

                //跨列时设置高度
                var h = this.$ft.height();
                self.$flThead.children().height(h);
                self.$frThead.children().height(h);
                self.$ftlThead.children().height(h);
                self.$ftrThead.children().height(h);

                this.$fr.show();
                this.$ftr.show();
                this.$fb.show();
                this.$fbl.show();
                this.$fbr.show();
                if (this.$dt.width() <= this.$scroller.width()) {
                    this.$fr.hide();
                    this.$ftr.hide();
                    this.$fbr.hide();
                }
                if (this.$dt.height() <= this.$scroller.height()) {
                    this.$fb.hide();
                    this.$fbl.hide();
                    this.$fbr.hide();
                }

            }
            this.scrollview.refresh();
        },
        refresh: function() {
            this.scrollview.refresh();
        },
        setVisible: function(config) {
            var self = this;
            var originalOption = this.option = $.extend(true, {}, this.originalOption),
                headTop = this.option.headTop,
                walkingArray = [originalOption.head, originalOption.columns].concat(originalOption.data);
            if (!config) {
                config = [];
                if (originalOption.columns && originalOption.columns.length) {
                    for (var i = 0; i < originalOption.columns.length; i++) {
                        var item = self._getColumnOption(i, true);
                        config.push(!item.defaultVisible);
                    }
                }
            }
            console.log(config);


            //从数组中删除指定位置的元素
            var delItem = function(array, delArray) {
                var n = 0;
                var length = array.length;
                for (var i = 0; i < length; i++) {
                    // console.log(i, i - n, array);
                    if (delArray[i]) {
                        //删除元素
                        array.splice(i - n, 1);
                        n++;
                    }
                }
                return array;
            };

            for (var i = 0; i < walkingArray.length; i++) {
                var item = walkingArray[i];
                var n = 0;
                if (item && item.length) {
                    delItem(item, config);
                }
            }

            var idx = 0;
            var del = 0;
            if (headTop && headTop.length) {
                var length = headTop.length;
                for (var i = 0; i < length; i++) {
                    var th = headTop[i - del];
                    var colspan = th.colspan || 1;
                    var delj = 0;
                    for (var j = 0; j < colspan; j++) {
                        if (config[idx]) {
                            delj++;
                        }
                        if (delj < colspan) {
                            th.colspan = colspan - delj;
                        }
                        idx++;
                    }
                    if (delj == colspan) {
                        headTop.splice(i - del, 1);
                        del++;
                    }
                }
            }

            // console.log(this.option);

            this._currentVisibleConfig = config;
            this.refreshTable();
        },
        // setVisible: function(config) {
        //     // config = [0, 1, 1];
        //     this.visibleCfg = config;
        //     var head = this.option.head;
        //     var $dtThsTop = this.$dtThead.find("tr:first-child > th"),
        //         $dtThs = this.$dtThead.find("tr:last-child > th"),
        //         $ftThsTop = this.$ftThead.find("tr:first-child > th"),
        //         $ftThs = this.$ftThead.find("tr:last-child > th"),
        //         $dtTbody = this.$dtTbody,
        //         $fbTds = this.$fbTbody.find("tr > td");
        //
        //     for (var i = 0; i < head.length; i++) {
        //         var action = config[i] ? "hide" : "show";
        //         $dtThs.eq(i)[action]();
        //         $ftThs.eq(i)[action]();
        //         $fbTds.eq(i)[action]();
        //         $dtTbody.children().each(function(j, itemj) {
        //             $(itemj).children(":eq(" + i + ")")[action]();
        //         });
        //     }
        //     this.setFrozenSize();
        // }
    };


    //jquery插件定义
    $.fn.rldataviewer = function(action, opt) {
        var dv = this.data("rldataviewer");
        if (typeof action != "string") {
            //创建
            if (dv) {
                dv.$.remove();
                this.removeData("rldataviewer");
            }
            dv = new RLDataviewer(action, this);
            this.data("rldataviewer", dv);
            return dv;
        } else {
            //调用方法
            return dv[action] && dv[action](opt);
        }
    };


})(window, jQuery);
