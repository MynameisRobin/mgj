(function() {

    // permission 1盛传版 2风尚版 3尊享版

    var reportList = [{
        text: "决策",
        reports: [{
            aid: "", //权限ID
            name: "生意总览",
            level: 1,
            apiName: "rpt_busitotal",
            permission: '1,2,3',
            icon: "r11",
            target: "tradePandect"
        }, {
            aid: "K01",
            name: "各门店业绩汇总",
            level: 1,
            apiName: "rpt_shopperflist",
            icon: "r33",
            permission: '3' //权限、1只允许尊享版使用,
        }, {
            aid: "K1",
            name: "各门店员工业绩排行",
            level: 1,
            apiName: "rpt_empPerformanceRank",
            icon: "r32",
            permission: '3', //权限、1只允许尊享版使用,
            filter: "level" //dept部门  level级别 none隐藏filter
        }]
    }, {
        text: "财务",
        reports: [{
                aid: "J02",
                name: "营业额流水",
                level: 2,
                apiName: "rpt_turnover",
                icon: "r22",
                permission: '3' //权限、1只允许尊享版使用,
            }, {
                aid: "J3",
                name: "现金流水表",
                level: 2,
                apiName: "rpt_cashflow",
                icon: "r23",
                permission: '3' //权限、1只允许尊享版使用,
            }
            // , {
            //     aid: "J2",
            //     name: "损益表（暂无）",
            //     level: 2,
            //     apiName: "",
            //     icon: "r21"
            // }
        ]
    }, {
        text: "业绩",
        reports: [{
            aid: "K00",
            name: "店内业绩统计表",
            level: 2,
            apiName: "rpt_shopperf",
            permission: '1,2,3',
            icon: "r12",
            target: "reportStorePerf"
        }, {
            aid: "K20",
            name: "项目分类统计明细",
            level: 2,
            apiName: "rpt_typeStatDetail",
            icon: "r32",
            permission: '3', //权限、1只允许尊享版使用,
            dataProcessor: function(data) {
                var others = data.others = [];
                data.head[7] = "操作"
                $.each(data.data, function(i, item) {
                    others.push(item[7]);
                    item[7] = '<span class="am-clickable" data-index="' + i + '">查看明细</span>';
                });

                return data;
            }
        }, {
            aid: "K3",
            name: "卡储值消费统计",
            level: 2,
            apiName: "rpt_cardConsume",
            icon: "r43",
            permission: '3' //权限、1只允许尊享版使用,
        }, {
            aid: "K3",
            name: "卡金结余统计",
            level: 2,
            apiName: "rpt_cardBalance",
            icon: "r41",
            permission: '3', //权限、1只允许尊享版使用,
            filter: "none" //dept部门  level级别 none隐藏filter
        }, {
            aid: "K10",
            name: "员工业绩汇总",
            level: 2,
            apiName: "rpt_empPerformanceTotal",
            icon: "r31",
            permission: '3', //权限、1只允许尊享版使用,,
            filter: "level" //dept部门  level级别
        }, {
            aid: "",
            name: "业绩总览",
            level: 3,
            apiName: "rpt_employeeEmpperf",
            permission: '1,2,3',
            icon: "r12",
            target: "employeePandect"
        }, {
            aid: "",
            name: "工资提成",
            level: 3,
            apiName: "rpt_employeeEmpgain",
            permission: '1,2,3',
            icon: "r21",
            target: "employeeWageSystem"
        }, {
            aid: "",
            name: "项目服务记录",
            level: 3,
            apiName: "rpt_employeeItemlist",
            permission: '1,2,3',
            icon: "r53"
        }, {
            aid: "",
            name: "卖品销售记录",
            level: 3,
            apiName: "rpt_employeeBuylist",
            permission: '1,2,3',
            icon: "r54"
        }, {
            aid: "",
            name: "开充卡记录",
            level: 3,
            apiName: "rpt_employeeReclist",
            permission: '1,2,3',
            icon: "r55"
        }, {
            aid: "",
            name: "套餐销售记录",
            level: 3,
            apiName: "rpt_employeeTreatlist",
            permission: '1,2,3',
            icon: "r56"
        }, {
            aid: "",
            name: "年卡销售记录",
            level: 3,
            apiName: "rpt_employeeYearlist",
            permission: '1,2,3',
            icon: "r57"
        }]
    }, {
        text: "服务",
        reports: [{
            aid: "",
            name: "洗发时长统计",
            level: 2,
            permission: '3', //权限、1只允许尊享版使用,
            apiName: "hairTime",
            icon: "r60"
        }, {
            aid: "",
            name: "洗发合格率",
            level: 2,
            permission: '3', //权限、1只允许尊享版使用,
            filter: "selectTime",
            apiName: "clearHairRate",
            icon: "r59"
        }]
    }, {
        text: "商城",
        reports: [{
            name: "门店PK",
            icon: "r57",
            apiName: "mallreportStopPK",
            level: 1,
            permission: '2,3',
            dataProcessor: function(data) {
                return data;
            }
        }, {
            name: "分类汇总",
            apiName: "reportCategory",
            level: 1,
            permission: '2,3',
            icon: "r57",
            filter: "showCategory",
            dataProcessor: function(data) {
                return data;
            }
        }, {
            name: "明细汇总",
            filter: "showCategory",
            level: 1,
            permission: '2,3',
            icon: "r58",
            apiName: "reportItem"
        }]
    }, {
        text: "点评",
        reports: [{
            name: "汇总",
            apiName: "commentStatistics",
            permission: '2,3',
            level: 1,
            icon: "r57",
            paramsFilter: function(defultParam) {
                defultParam.shopIds = defultParam.shopids.join(",");
                defultParam.type = 0;
                return defultParam;
            }
        }, {
            name: "门店PK",
            icon: "r57",
            apiName: "commentStatistics",
            permission: '2,3',
            level: 1,
            paramsFilter: function(defultParam) {
                defultParam.shopIds = defultParam.shopids.join(",");
                defultParam.type = 1;
                return defultParam;
            }
        }, {
            name: "员工PK",
            level: 2,
            icon: "r58",
            apiName: "commentStatistics",
            permission: '2,3',
            paramsFilter: function(defultParam) {
                defultParam.shopIds = defultParam.shopid + "";
                defultParam.type = 1;
                return defultParam;
            }
        }]
    }];

    var self = amGloble.page.reportList = new $.am.Page({
        id: "page-reportList",
        init: function() {
            this.$.find(".mainList").on("vclick", "li", function() {
                var $this = $(this);
                var report = $this.data("item");
                //风尚版弹框
                if ($this.hasClass("disabled")) {
                    amGloble.checkVersion(true);
                    return;
                }
                if (report.target) {
                    $.am.changePage(amGloble.page[report.target], "slideleft", {
                        report: report,
                        shops: amGloble.storeSelect.getCurrentShops()
                    });
                } else if (report.apiName) {
                    $.am.changePage(amGloble.page.reportStandard, "slideleft", {
                        report: report,
                        shops: amGloble.storeSelect.getCurrentShops()
                    });
                } else {
                    alert("开发中...");
                }
            });
            this.$reportList = this.$.find(".mainList");
        },
        beforeShow: function(ret) {
            amGloble.storeSelect.onShopChange = function(shops) {
                console.log(shops);
                self.render();
            };
            this.render();
        },
        afterShow: function(paras) {},
        beforeHide: function() {
            amGloble.storeSelect.onShopChange = null;
        },
        findPermissions: function(key) {
            var found = false;
            var permissions = amGloble.metadata.userInfo.powerstr ? amGloble.metadata.userInfo.powerstr.split(",") : [];
            for (var i = 0; i < permissions.length; i++) {
                var item = permissions[i];
                // console.log(item, key);
                if (item == key) {
                    found = true;
                    break;
                }
            }
            return found;
        },
        render: function() {
            var userType = amGloble.metadata.userInfo.userType;
            var cshop = amGloble.storeSelect.getCurrentShops();
            var $reportList = this.$reportList.empty();

            var _configs = amGloble.metadata.configs;
            var userinfo = amGloble.metadata.userInfo;
            var jurisdiction = {};
            if(userinfo.newRole == 1){  //操作员
                if(_configs.operatorFacility){
                    jurisdiction = JSON.parse( _configs.operatorFacility );
                }
            }else if(userinfo.newRole >= 4){    //员工
                if(_configs.staffFacility){
                    jurisdiction = JSON.parse( _configs.staffFacility );
                }
            }

            for (var i = 0; i < reportList.length; i++) {
                var cati = reportList[i];
                var $title = $('<div class="listTitle">' + cati.text + '</div>');
                var $ul = $('<ul class="subList"></ul>');
                for (var j = 0; j < cati.reports.length; j++) {
                    var report = cati.reports[j];

                    if(jurisdiction[report.apiName] == 0){
                        continue;
                    }

                    if (userType == 1) {
                        //员工只显示level=3
                        // console.log("员工只显示level=3");
                        if (report.level != 3) {
                            continue;
                        }
                    } else if (cshop) {
                        //单门店只能看到门店级
                        // console.log("单门店只能看到门店级");
                        if (report.level != 2) {
                            continue;
                        }
                    } else {
                        //全部门店时只能看到总部级
                        // console.log("全部门店时只能看到总部级");
                        if (report.level != 1) {
                            // console.log(report.level);
                            continue;
                        }
                    }

                    if (report.aid && !this.findPermissions(report.aid)) {
                        continue;
                    }

                    var mgjVersion = cshop ? cshop.mgjversion : amGloble.metadata.userInfo.mgjVersion;

                    if (report.permission && report.permission.indexOf(mgjVersion) == -1) {
                        var $li = $('<li class="' + report.icon + ' am-clickable disabled">' + report.name + '（尊享版专属）</li>');
                    } else {
                        var $li = $('<li class="' + report.icon + ' am-clickable">' + report.name + '</li>');
                    }
                    $li.data("item", report);
                    $ul.append($li);
                }
                if (!$ul.is(":empty")) {
                    $reportList.append($title).append($ul);
                }
            }

            this.refresh();
        }
    });

})();
