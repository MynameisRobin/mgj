am.serversModal = {
    init: function () {
        var self = this;
        this.$ = $("#selectServers");
        this.$.find(".close").vclick(function () {
            self.$.hide();
        });
        this.$.find(".inner").vclick(function (e) {
            e.stopPropagation();
        })
        this.$.vclick(function () {
            self.$.hide();
        });
        this.$.find(".btnCancer").vclick(function () {
            self.$.hide();
        });
        this.$.find(".btnOk").vclick(function () {
            self.opt.serverSave && self.opt.serverSave(self.emps);
            self.$.hide();
        });
        this.billServerSelector = new cashierTools.BillServerSelector({
            $: this.$,
            muti: true,
            checkManual: true,
            getTotalPerf: function () {
                return self.opt.needPay;
            },
            onSetEmpPer: function (emp, per, perf, gain) {
                var data = self.emps;
                if (data) {
                    setTimeout(function () {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i] && data[i].empId === emp.id) {
                                data[i].per = per;
                                data[i].perf = perf;
                                data[i].gain = gain;
                                break;
                            }
                        }
                    }, 51);
                }
            },
            onSelect: function () {
                var _this = this;
                setTimeout(function () {
                    self.emps = _this.getEmps();
                }, 50);
                return false;
            },
            onRemove: function () {
                var _this = this;
                setTimeout(function () {
                    self.emps = _this.getEmps();
                }, 50);
                return false;
            }
        });
    },
    show: function (opt) {
        if (!this.$){
            this.init();
        }
        this.opt = opt;
        this.emps = opt&&opt.emps || [];
        this.reset();
        this.$.show();
        var innerHeight = this.$.find(".inner").outerHeight();
        this.$.find(".inner").css("margin-top",-innerHeight/2);
    },
    reset: function () {
        var $server = this.billServerSelector.$body.find("li").removeClass("selected").removeClass("checked")
        var emps = this.emps;
        var employeeList = am.metadata.employeeList || [];
        if (!this.billServerSelector.data) {
            this.billServerSelector.dataBind(employeeList, ["第一工位", "第二工位", "第三工位"]); //多个工位;
        }
        this.billServerSelector.resetServers(emps, $server);
    }
};
