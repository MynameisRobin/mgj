(function() {
    var self = (am.api = {
        // 合并会员
        mergeCustomer:new Api({
            serviceName: "mgj-cashier/member/memberMerge"
        }),
        updateReservationComment:new Api({
            serviceName: "mgj-cashier/reservation/updComment"
        }),
        getHelpVideo:new Api({
            serviceName: "mgj-cashier/viewHelp/getVideo"
        }),
        relatePay:new Api({
            serviceName: "mgj-cashier/bill/ContactPayOrderDetail"
        }),
        updTreatShops:new Api({
            serviceName: "mgj-cashier/setting/updTreatShops"
        }),
        optimizeCardandCustomer:new Api({
            serviceName: "mgj-cashier/member/getAllBySolr"
        }),
        optimizeSearchCard:new Api({
            serviceName: "mgj-cashier/member/shopMemberCardSolr"
        }),
        updMemberPoint:new Api({
            serviceName: "mgj-cashier/member/updMemberPoint"
        }),
        optimizeSearchCustomer:new Api({
            serviceName: "mgj-cashier/member/shopMemebersolr"
        }),
        getGoodsNum:new Api({
            serviceName: "mgj-cashier/storage/getNum"
        }),
        // 核销红包
        verificationRedPocket: new Api({
            serviceName: "mgj-cashier/member/checkluckyMoney"
        }),
        // 撤回红包
        revokeRedPocket: new Api({
            serviceName: "mgj-cashier/member/revokeluckyMoney"
        }),
        addVacation: new Api({
            serviceName: "mgj-cashier/vacation/addVacation"
        }),
        delVacation: new Api({
            serviceName: "mgj-cashier/vacation/deleteVacation"
        }),
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
        getConfUpdTime: new Api({
            serviceName: "mgj-cashier/user/getConfUpdTime"
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
		posPrecreate: new Api({
            serviceName: "mgj-cashier/pay/union/precreate"
        }),
        posQuery: new Api({
            serviceName: "mgj-cashier/pay/union/query"
        }),
        posRefund: new Api({
            serviceName: "mgj-cashier/pay/union/refund"
        }),
        wechatRefund: new Api({
            serviceName: "mgj-cashier/pay/wechat/refund"
        }),
        wechatQrpay: new Api({
            serviceName: "mgj-cashier/pay/wechat/qrpay"
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
        jdPay: new Api({
            serviceName: "mgj-cashier/pay/jd/pay"
        }),
        jdQuery: new Api({
            serviceName: "mgj-cashier/pay/jd/query"
        }),
        jdCancel: new Api({
            serviceName: "mgj-cashier/pay/jd/cancel"
        }),
        jdRefund: new Api({
            serviceName: "mgj-cashier/pay/jd/refund"
        }),
        jdQrpay: new Api({
            serviceName: "mgj-cashier/pay/jd/qrpay"
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
        //删除待开单的单
        deleteInstoreServices: new Api({
            serviceName: "mgj-cashier/instoreService/deleteInstoreServices"
        }),
        memberList: new Api({
            serviceName: "mgj-cashier/member/list"
        }),
        cardList: new Api({
            serviceName: "mgj-cashier/member/cardList"
        }),
        cardListTemp: new Api({
            serviceName: "mgj-cashier/member/summary"
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
		memberLocking: new Api({
			serviceName: "mgj-cashier/member/locking"
		}),
        queryDebt: new Api({
            serviceName: "mgj-cashier/member/queryDebt"
        }),
        repayDebt: new Api({
            serviceName: "mgj-cashier/member/repay"
		}),
		refundCard: new Api({
            serviceName: "mgj-cashier/member/refundCard"
        }),
        checkBillNo: new Api({
            serviceName: "mgj-cashier/bill/checkBillNo",
        }),
        billCheck: new Api({
            serviceName: "mgj-cashier/bill/check",
            md5: 1
        }),
        treatPackageDetail: new Api({
            serviceName: "mgj-cashier/bill/treatmentItemDetail",
        }),
        checkCardAboutCurrentDay: new Api({
            serviceName: "mgj-cashier/bill/checkCardAboutCurrentDay"
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
        kbQueryCoupon: new Api({
            serviceName: "mgj-cashier/pay/queryKoubei"
        }),
        kbConsumeCoupon: new Api({
            serviceName: "mgj-cashier/pay/useKoubei"
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
        //套餐消耗记录
        consumption: new Api({
            serviceName: "mgj-cashier/member/treatmentitemConsume"
		}),
		//积分记录
		pointRecord: new Api({
            serviceName: "mgj-cashier/member/queryPoint"
		}),
		// 赠送积分
		sendPoint: new Api({
			serviceName: "mgj-cashier/member/sendPointManual"
		}),
        //卡金变动流水
        goldCard: new Api({
            serviceName: "mgj-cashier/member/memberCardChange"
        }),
        billRecord: new Api({
            serviceName: "mgj-cashier/bill/billcheck"
		}),
		billDetail: new Api({
            serviceName: "mgj-cashier/bill/detail"
        }),
        billRepeatRecord: new Api({
            serviceName: "mgj-cashier/bill/billcheckrepeat"
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
        queryMemberReservation: new Api({
            serviceName: "mgj-cashier/reservation/queryMemberReservation"
        }),
        offReservationReject: new Api({
            serviceName: "mgj-cashier/member/offReservationReject"
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
        reservationUpdateComment: new Api({
            serviceName: "mgj-cashier/reservation/updateComment"
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
        getkoubeiFlow: new Api({
            //口碑
            serviceName: "mgj-cashier/flow/koubeiFlow"
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
        editMemberCardId: new Api({
            serviceName: "mgj-cashier/member/editMemberCardId" //修改会员卡
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
            //退套餐
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
		//获取跨店规则
		cardUpDetail: new Api({
            serviceName: "mgj-cashier/member/cardUpDetail"
		}),
		//获取跨店规则
		treatDetail: new Api({
			serviceName: "mgj-cashier/member/treatDetail"
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
        // 我的未处理投诉数
        sueCount: new Api({
            serviceName: "mgj-cashier/sue/processNum"
        }),
        // 我的投诉列表
        sueQuery: new Api({
            serviceName: "mgj-cashier/sue/mySue"
        }),
        // 投诉客服和销售
        sueData: new Api({
            serviceName: "mgj-cashier/sue/getOrgemp"
        }),
        // 添加投诉
        sueCreate: new Api({
            serviceName: "mgj-cashier/sue/addSue"
        }),
        // 接受投诉处理结果
        sueUpdate: new Api({
            serviceName: "mgj-cashier/sue/sureState"
        }),
        // 处理详情
        sueInfo: new Api({
            serviceName: "mgj-cashier/sue/info"
        }),
        // 设置normalConfig
        saveNormalConfig: new Api({
            serviceName: "mgj-cashier/normalConfig/insertOrUpdateConfig"
        }),
        // 设置userConfig
        saveUserConfig: new Api({
            serviceName: "mgj-cashier/userConfig/insertOrUpdateConfig"
        }),
        // 查询设置过期服务小红点
        instoreServiceCount: new Api({
            serviceName: "mgj-cashier/instoreService/count"
        }),
        // 查询用户体验项目的剩余次数
        getConsumeCount: new Api({
            serviceName: 'mgj-cashier/item/consumeCount'
        }),
        // 送红包
        sendRedPacket: new Api({
            serviceName: 'mgj-cashier/member/sendRedPacket'
        }),
        //恢复已删除顾客
        resume: new Api({
            serviceName: 'mgj-cashier/member/resume'
        }),
        refundVcCode: new Api({
            serviceName: 'mgj-cashier/user/vc'
        }),
        synorderstatus: new Api({
            serviceName: 'mgj-cashier/pay/synorderstatus'
        }),
        //查询门店抽奖方案
        selectLotteryActivityConfig: new Api({
            serviceName: 'mgj-cashier/lottery/selectLotteryActivityConfig'
		}),
		//发送验证码接口
		sendCode: new Api({
			serviceName: "mgj-cashier/member/sendCode"
		}),
		//校验验证码接口
		checkCode: new Api({
			serviceName:"mgj-cashier/member/checkCode"
		}),
        //配置桌位
        addTables: new Api({
            serviceName: 'mgj-cashier/setting/addTables'
        }),
        getTables: new Api({
            serviceName: 'mgj-cashier/setting/getTables'
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