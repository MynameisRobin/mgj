(function() {
    var self = (am.api = {
        sendMemPwd: new Api({
            serviceName: "mgj-cashier/sms/sendMemPwd"
        }),
        base64Upload: new Api({
            serviceName: "FilesMgr/base64Upload",
            closelog: true
        }),
        metadata: new Api({
            serviceName: "mgj-cashier/metadata/list"
        }),
        clobConfig: new Api({
            serviceName: "dashboard/configuration"
        }),
        login: new Api({
            serviceName: "mgj-cashier/user/login"
        }),
        logout: new Api({
            serviceName: "member/logout"
        }),
        searchmember: new Api({
            serviceName: "mgj-cashier/member/search"
        }),
        updatelastphototime: new Api({
            serviceName: "mgj-cashier/member/updatelastphototime"
        }),
        wechatPay: new Api({
            serviceName: "mgj-cashier/pay/wechat/pay"
        }),
        wechatQuery: new Api({
            serviceName: "mgj-cashier/pay/wechat/query"
        }),
        wechatCancel: new Api({
            serviceName: "mgj-cashier/pay/wechat/cancel"
        }),
        wechatRefund: new Api({
            serviceName: "mgj-cashier/pay/wechat/refund"
        }),
        wechatQrpay: new Api({
            serviceName: "mgj-cashier/pay/wechat/qrpay"
        }),
        alipayPay: new Api({
            serviceName: "mgj-cashier/pay/alipay/pay"
        }),
        alipayQuery: new Api({
            serviceName: "mgj-cashier/pay/alipay/query"
        }),
        alipayCancel: new Api({
            serviceName: "mgj-cashier/pay/alipay/cancel"
        }),
        alipayRefund: new Api({
            serviceName: "mgj-cashier/pay/alipay/refund"
        }),
        alipayQrpay: new Api({
            serviceName: "mgj-cashier/pay/alipay/qrpay"
        }),
        dpPay: new Api({
            serviceName: "mgj-cashier/pay/dianping/pay"
        }),
        dpQuery: new Api({
            serviceName: "mgj-cashier/pay/dianping/query"
        }),
        dpCancel: new Api({
            serviceName: "mgj-cashier/pay/dianping/cancel"
        }),
        dpRefund: new Api({
            serviceName: "mgj-cashier/pay/dianping/refund"
        }),
        dpQrpay: new Api({
            serviceName: "mgj-cashier/pay/dianping/qrpay"
        }),
        //查询服务单列表
        hangupList: new Api({
            serviceName: "mgj-cashier/instoreService/list"
        }),
        //保存服务单
        hangupSave: new Api({
            serviceName: "mgj-cashier/instoreService/save"
        }),
        //删除服务单
        hangupDelete: new Api({
            serviceName: "mgj-cashier/instoreService/delete"
        }),
        memberList: new Api({
            serviceName: "mgj-cashier/member/list"
        }),
        cardList: new Api({
            serviceName: "mgj-cashier/member/cardList"
        }),
        //积分兑换
        expendPoint: new Api({
            serviceName: "mgj-cashier/member/expendPoint"
        }),
        memberDetails: new Api({
            serviceName: "mgj-cashier/member/detail"
        }),
        updateMemberSms: new Api({
            serviceName: "mgj-cashier/member/updateMemberSms"
        }),
        queryDebt: new Api({
            serviceName: "mgj-cashier/member/queryDebt"
        }),
        repayDebt: new Api({
            serviceName: "mgj-cashier/member/repay"
        }),
        billCheck: new Api({
            serviceName: "mgj-cashier/bill/check",
            md5: 1
        }),
        mutiBillCheck: new Api({
            serviceName: "mgj-cashier/bill/checks",
            md5: 1
        }),
        facePay: new Api({
            serviceName: "mgj-cashier/f2pay/list"
        }),
        dpQueryCoupon: new Api({
            serviceName: "mgj-cashier/pay/dianping/queryCoupon"
        }),
        dpConsumeCoupon: new Api({
            serviceName: "mgj-cashier/pay/dianping/consumeCoupon"
        }),
        inventionList: new Api({
            serviceName: "mgj-cashier/member/inventionList"
        }),
        archivesList: new Api({
            serviceName: "mgj-cashier/member/archivesList"
        }),
        listService: new Api({
            serviceName: "mgj-cashier/member/listService"
        }),
        billRecord: new Api({
            serviceName: "mgj-cashier/bill/billcheck"
        }),
        createMember: new Api({
            serviceName: "mgj-cashier/member/createMember"
        }),
        editMember: new Api({
            serviceName: "mgj-cashier/member/editMember"
        }),
        delMember: new Api({
            serviceName: "mgj-cashier/member/delMember"
        }),
        //预约相关
        reservationAdd: new Api({
            serviceName: "mgj-cashier/reservation/reservationAdd"
        }),
        reservationQuery: new Api({
            serviceName: "mgj-cashier/reservation/queryConfig"
        }),
        reservationList: new Api({
            serviceName: "mgj-cashier/reservation/reservationList"
        }),
        reservationChangestatus: new Api({
            serviceName: "mgj-cashier/reservation/reservationChangeStatus"
        }),
        reservationCancel: new Api({
            serviceName: "mgj-cashier/reservation/reservationCancel"
        }),
        reservationUpdateTime: new Api({
            serviceName: "mgj-cashier/reservation/reservationUpdateTime"
        }),
        getShopReservationsNum: new Api({
            serviceName: "mgj-cashier/reservation/getShopReservationsNum"
        }),
        itemOfCard: new Api({
            serviceName: "mgj-cashier/member/itemOfCard"
        }),
        billStatistics: new Api({
            serviceName: "mgj-cashier/summary/list"
        }),
        //扫一扫登陆轮询
        query: new Api({
            serviceName: "mgj-cashier/scancode/query"
        }),
        //loginout
        loginout: new Api({
            serviceName: "mgj-cashier/user/logout"
        }),
        getLuckyMoney: new Api({
            //红包核销
            serviceName: "mgj-cashier/member/luckyMoney"
        }),
        getMallOrder: new Api({
            //商城订单核销
            serviceName: "mgj-cashier/member/mallorder"
        }),
        getdianpingFlow: new Api({
            //点评
            serviceName: "mgj-cashier/flow/dianpingFlow"
        }),
        getexceptionFlow: new Api({
            //异常单
            serviceName: "mgj-cashier/flow/exceptionFlow"
        }),
        updataproject: new Api({
            serviceName: "mgj-cashier/bill/updataproject"
        }),
        upd: new Api({
            serviceName: "mgj-cashier/bill/upd"
        }),
        cancelproject: new Api({
            serviceName: "mgj-cashier/bill/cancel"
        }),
        queryMemberById: new Api({
            serviceName: "mgj-cashier/member/queryMemberById"
        }),
        checkMobile: new Api({
            serviceName: "mgj-cashier/member/checkMobile"
        }),
        checkCardIdExists: new Api({
            serviceName: "mgj-cashier/member/checkCardIdExists"
        }),
        queryMallItem: new Api({
            serviceName: "mgj-cashier/mall/queryMallItem"
        }),
        addInvention: new Api({
            serviceName: "mgj-cashier/invention/addInvention"
        }),
        customerAddArchives: new Api({
            serviceName: "mgj-cashier/customer/addArchives"
        }),
        editCardType: new Api({
            serviceName: "mgj-cashier/bill/editCardType"
        }),
        invalidateUpdate: new Api({
            serviceName: "mgj-cashier/invalidate/update"
        }),
        memberUpdatepage: new Api({
            serviceName: "mgj-cashier/member/updatepage"
        }),
        billUpd: new Api({
            serviceName: "mgj-cashier/bill/upd"
        }),
        memberModiFee: new Api({
            serviceName: "mgj-cashier/member/modiFee"
        }),
        audioPlayer: new Api({
            serviceName: "mgj-cashier/attendanceManagement/audioPlayer"
        }),
        //mock
        storageList: new Api({
            serviceName: "/mgj-cashier/sto/productList"
        }),
        storageUpLoad: new Api({
            serviceName: "/mgj-cashier/sto/updateProductInfo"
        }),
        storageAddOutStoRecord: new Api({
            serviceName: "/mgj-cashier/storage/saveOutDepot"
        }),
        storageAddInStoRecord: new Api({
            serviceName: "/mgj-cashier/storage/saveIntoDepot"
        }),
        storageOutAudit: new Api({
            serviceName: "/mgj-cashier/storage/auditOutDepot"
        }),
        storageOutCancel: new Api({
            serviceName: "/mgj-cashier/storage/cancelOutDepotAudit"
        }),
        storageOutDelete: new Api({
            serviceName: "/mgj-cashier/storage/deleteOutDepot"
        }),
        storageIntoAudit: new Api({
            serviceName: "/mgj-cashier/storage/auditIntoDepot"
        }),
        storageIntoCancel: new Api({
            serviceName: "/mgj-cashier/storage/cancelIntoDepotAudit"
        }),
        storageIntoDelete: new Api({
            serviceName: "/mgj-cashier/storage/deleteIntoDepot"
        }),
        storageOutBill: new Api({
            serviceName: "mgj-cashier/sto/outStoList"
        }),
        storageIntoBill: new Api({
            serviceName: "mgj-cashier/sto/inStoList"
        }),
        storageOutinRecord: new Api({
            serviceName: "mgj-cashier/sto/history"
        }),
        storageSubbranch: new Api({
            serviceName: "mgj-cashier/sto/stoInOtherShops"
        }),
        storageOutAbort: new Api({
            serviceName: "mgj-cashier/sto/deleteOutStoRecord"
        }),
        storageIntoAbort: new Api({
            serviceName: "mgj-cashier/sto/deleteInStoRecord"
        }),
        getMaxOutStoBillno: new Api({
            serviceName: "mgj-cashier/sto/getMaxOutStoBillno"
        }),
        getMaxInStoBillno: new Api({
            serviceName: "mgj-cashier/sto/getMaxInStoBillno"
        }),
        saveCardRemark: new Api({
            serviceName: "mgj-cashier/member/udpCardComment"
        }),
        saveComboRemark: new Api({
            serviceName: "mgj-cashier/member/udpTreatComment"
        }),
        setCardpw: new Api({
            serviceName: "mgj-cashier/member/setPwd"
        }),
        queryOrder: new Api({
            serviceName: "mgj-cashier/mall/queryCode"
        }),
        verifyOrder: new Api({
            serviceName: "mgj-cashier/mall/verification"
        }),
        verifyList: new Api({
            serviceName: "mgj-cashier/mall/queryConsumeList"
        }),
        addExps: new Api({
            serviceName: "mgj-cashier/expenses/addExps"
        }),
        editExps: new Api({
            serviceName: "mgj-cashier/expenses/updateExps"
        }),
        queryData: new Api({
            serviceName: "mgj-cashier/expenses/queryData"
        }),
        delExps: new Api({
            serviceName: "mgj-cashier/expenses/delExps"
        }),
        transferMemberCard: new Api({
            //卡卡转账
            serviceName: "mgj-cashier/member/transferMemberCard"
        }),
        delCard: new Api({
            //删除卡
            serviceName: "mgj-cashier/member/delMemberCard"
        }),
        backCombo: new Api({
            //退疗程
            serviceName: "mgj-cashier/member/returnTreatItems"
        }),
        commentService: new Api({
            //点评
            serviceName: "mgj-cashier/comment/createMember"
        }),
        billUpdDeptPerf: new Api({
            //点评
            serviceName: "mgj-cashier/bill/updDeptPerf"
        }),
        employeeRecord: new Api({
            //点评
            serviceName: "mgj-cashier/attendanceManagement/employeeRecord"
        }),
        //开通/延期会员特权卡
        editPrivilege: new Api({
            serviceName: "mgj-cashier/member/addPrivilege"
        }),
        //轮牌
        queueList: new Api({
            serviceName: "mgj-cashier/rotateUser/list"
        }),
        queueOn: new Api({
            serviceName: "mgj-cashier/rotateUser/on"
        }),
        queueOff: new Api({
            serviceName: "mgj-cashier/rotateUser/off"
        }),
        queueStatus: new Api({
            serviceName: "mgj-cashier/rotateUser/changeStatus"
        }),
        queueOrder: new Api({
            serviceName: "mgj-cashier/rotateUser/order"
        }),
        transferShop: new Api({
            serviceName: "mgj-cashier/member/transferShop"
        }),
        //项目图片配置
        serviceItemPicSet: new Api({
            serviceName: "mgj-cashier/setting/serviceItemPicSet"
        }),
        //静态图片接口
        getFiles: new Api({
            serviceName: "mgj-cashier/photo/getFiles"
        }),
        //上传图片
        copyPhoto: new Api({
            serviceName: "mgj-cashier/photo/copyPhoto"
        }),
        // 工单列表
        workQuery: new Api({
            serviceName: "mgj-cashier/workorder/query"
        }),
        // 创建工单
        workCreate: new Api({
            serviceName: "mgj-cashier/workorder/create"
        }),
        // 工单详情
        workProcess: new Api({
            serviceName: "mgj-cashier/workorder/process"
        }),
        // 工单状态
        workUpdate: new Api({
            serviceName: "mgj-cashier/workorder/update"
        }),
        // 工单提醒
        workTip: new Api({
            serviceName: "mgj-cashier/workorder/tip"
        }),
        // 工单计数
        workTipCount: new Api({
            serviceName: "mgj-cashier/workorder/tipCount"
        }),
        // 设置normalConfig
        saveNormalConfig: new Api({
            serviceName: "mgj-cashier/normalConfig/insertOrUpdateConfig"
        }),
    });
})();

//http://192.168.3.182:8080/mgj-cashier/metadata/list


/* am.api.saveNormalConfig.exec = function(opt,cb){
    localStorage.setItem('MOCK_API_saveNormalConfig',JSON.stringify(opt));
    setTimeout(function(){
        cb({
            code:0,
            content:null
        });
    },2000);
}

am.api.metadata._exec = am.api.metadata.exec;
am.api.metadata.exec = function(opt,cb){
    this._exec(opt,function(ret){
        if(ret && ret.content && ret.content.configs && ret.content.configs.length){
            var JSONDATA = localStorage.getItem('MOCK_API_saveNormalConfig');
            if(JSONDATA){
                try{
                    JSONDATA = JSON.parse(JSONDATA);
                }catch(e){
                }
            }
            if(JSONDATA){
                ret.content.configs.push({
                    "configKey":JSONDATA.configkey,
                    "configValue":JSONDATA.configvalue
                });
            }
        }
        cb(ret);
    });
} */