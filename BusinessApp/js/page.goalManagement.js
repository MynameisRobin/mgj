(function(){
    amGloble.page.goalManagement = new $.am.Page({
        id:"page-goalManagement",
        init:function(){
            var _this = this;
            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find(".am-body-wrap"), //选择器的dom将插入到此节点后面
                // enableDept: true, //是否启用部门选择器
                // enableLevel: true, //是否启用部门选择器,
                onDatePickerClick: function() {
      
                },
                onchange: function() { //条件修改时触发
                    console.log("onchange");
                }
            });
            
        },
        beforeShow:function(){
            var opt = {
                enableDept: false,
                enableLevel: false,
                disableFilter: false,
                enableCategory: false,
                selectTime: false,
                enableShop: true,
                enableEmp: true,
                datePickerType:'ym'
            };
            this.reportFilter.setOpt(opt);
        },
        afterShow:function(){},
        beforeHide:function(){}
    });
})();
