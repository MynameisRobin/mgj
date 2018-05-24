
(function() {

    var self = amGloble.api = {

        //通用
        //metadata
        metadata: new ApiCacheable({
            serviceName: "/shengyibao/mobile/metadata",
            keys: ["parentShopId", "token"],
            isSuccess: function(ret) {
                if (ret && ret.code == 0) {
                    return true;
                }
            }
        }),
        //上传图片
        base64Upload: new Api({
            serviceName: "/FilesMgr/base64Upload"
        }),
        //修改头像更新时间
        modifyPhotoUpdateTime: new Api({
            serviceName: "/shengyibao/lastupdate/photo"
        }),
        //验证码
        sendCode: new Api({
            serviceName: "/shengyibao/codes/sendcode"
        }),
        //登录登出
        login: new Api({
            serviceName: "/shengyibao/mobile/user/login"
        }),
        logout: new Api({
            serviceName: "/shengyibao/mobile/user/logout"
        }),
        //无纸化登录码
        getShortCode: new Api({
            serviceName: "/shengyibao/codes/getShortCode"
        }),
        //Dashboard
        dashboard: new Api({
            serviceName: "/shengyibao/dashboard/list"
        }),
        //预约列表chali
        reservationList: new Api({
            serviceName: "/shengyibao/reservation/list"
        }),
        //预约配置chali
        reservationQueryConfig: new Api({
            serviceName: "/shengyibao/reservation/queryConfig"
        }),
        reservationAdd: new Api({
            serviceName: "/shengyibao/reservation/create"
        }),
        reservationCancel: new Api({
            serviceName: "/shengyibao/reservation/cancel"
        }),
        reservationChangeStatus: new Api({
            serviceName: "/shengyibao/reservation/changeStatus"
        }),
        //客户
        //搜索客户
        customerQuerCusts: new Api({
            serviceName: "/shengyibao/customer/querCusts"
        }),
        //客户数量统计
        customerDashboard: new Api({
            serviceName: "/shengyibao/customer/dashboard"
        }),
        //客户详情
        customerQuerMemInfo: new Api({
            serviceName: "/shengyibao/customer/querMemInfo"
        }),
        //客户档案列表
        customerArchivesList: new Api({
            serviceName: "/shengyibao/customer/archivesList"
        }),
        //新增客户档案
        customerAddArchives: new Api({
            serviceName: "/shengyibao/customer/addArchives"
        }),
        //删除客户档案
        customerDelArchives: new Api({
            serviceName: "/shengyibao/customer/delArchives"
        }),
        //客户消费记录
        customerListServices: new Api({
            serviceName: "/shengyibao/customer/listServices"
        }),
        //将顾客加入收藏夹
        customerAddMemFavor: new Api({
            serviceName: "/shengyibao/customer/addMemFavor"
        }),
        //将顾客从收藏夹移除
        customerDelMemFavor: new Api({
            serviceName: "/shengyibao/customer/delMemFavor"
        }),
        //修改消费周期
        customerUpdateMemInfo: new Api({
            serviceName: "/shengyibao/customer/updateMemInfo"
        }),
        //个人信息
        userModify: new Api({
            serviceName: "/shengyibao/mobile/user/modify"
        }),
        userModifypwd: new Api({
            serviceName: "/shengyibao/mobile/user/modifypwd"
        }),
        userForgotpwd: new Api({
            serviceName: "/shengyibao/mobile/user/forgotpwd"
        }),
        userBindMobile: new Api({
            serviceName: "/shengyibao/mobile/user/bindMobile"
        }),
        //消息
        messageList: new Api({
            serviceName: "/shengyibao/message/list"
        }),
        //报表
        //营业总览
        rpt_busitotal: new Api({
            serviceName: "/shengyibao/policy/busitotal",
	        numFixed:1
        }),
        //各门店员工业绩排名
        rpt_empPerformanceRank: new Api({
            serviceName: "/shengyibao/policy/empPerformanceRank"
        }),
        //各门店业绩汇总
        rpt_shopperflist: new Api({
            serviceName: "/shengyibao/policy/shopperflist",
	        numFixed:1
        }),
        //现金流水表
        rpt_cashflow: new Api({
            serviceName: "/shengyibao/finance/cashflow",
	        numFixed:1
        }),
        //营业额流水表
        rpt_turnover: new Api({
            serviceName: "/shengyibao/finance/turnover"
        }),
        //项目分类明细表
        rpt_typeStatDetail: new Api({
            serviceName: "/shengyibao/performance/typeStatDetail",
        }),
        //卡储值消费统计
        rpt_cardConsume: new Api({
            serviceName: "/shengyibao/performance/cardConsume",
        }),
        //卡金结余统计
        rpt_cardBalance: new Api({
            serviceName: "/shengyibao/performance/cardBalance",
        }),
        //员工业绩汇总
        rpt_empPerformanceTotal: new Api({
            serviceName: "/shengyibao/performance/empPerformanceTotal",
        }),
        //店内业绩统计表
        rpt_shopperf: new Api({
            serviceName: "/shengyibao/performance/shopperf",
	        numFixed:1
        }),
        //员工项目列表
        rpt_employeeItemlist: new Api({
            serviceName: "/shengyibao/employee/itemlist",
        }),
        //员工卖品列表
        rpt_employeeBuylist: new Api({
            serviceName: "/shengyibao/employee/buylist",
        }),
        //员工开充卡列表
        rpt_employeeReclist: new Api({
            serviceName: "/shengyibao/employee/reclist",
        }),
        //员工套餐销售列表
        rpt_employeeTreatlist: new Api({
            serviceName: "/shengyibao/employee/treatlist",
        }),
        //员工年卡销售列表
        rpt_employeeYearlist: new Api({
            serviceName: "/shengyibao/employee/yearlist",
        }),
        //业绩总览
        rpt_employeeEmpperf: new Api({
            serviceName: "/shengyibao/employee/empperf",
	        numFixed:1
        }),
        //工资提成
        rpt_employeeEmpgain: new Api({
            serviceName: "/shengyibao/employee/empgain",
	        numFixed:1
        }),


        //财务优化
        shopReducescale: new Api({
            serviceName: "/shengyibao/shop/reducescale"
        }),

        //作品列表
        inventionList: new Api({
            serviceName: "/shengyibao/invention/getList"
        }),
        //作品分类
        inventionSubTypes: new Api({
            serviceName: "/shengyibao/invention/subTypes"
        }),
        //作品评论删除
        inventionDeleteEvaluation: new Api({
            serviceName: "/shengyibao/invention/delInventionEvaluation"
        }),
        //作品评论删除
        delInvention: new Api({
            serviceName: "/shengyibao/invention/delInvention"
        }),
        //作品审核
        inventionVisible: new Api({
            serviceName: "/shengyibao/invention/audit"
        }),
        addInvention: new Api({
            serviceName: "/shengyibao/invention/addInvention"
        }),
        //服务管理
        serviceManagement: new Api({
            serviceName: "/shengyibao/employee/service/list"
        }),
        //代收代付
        queryWithdraw: new Api({
            serviceName: "/shengyibao/mall/queryMallWithdrawBalance"
        }),
        //提现
        getwithdraw: new Api({
            serviceName: "/shengyibao/mall/withdraw"
        }),
        //提现记录
        getWithdrawHistory: new Api({
            serviceName: "/shengyibao/mall/getWithdrawHistory"
        }),
        //获取签约信息
        getSigning: new Api({
            serviceName: "/shengyibao/mall/getSigning"
        }),
        //保存签约信息
        saveSigning: new Api({
            serviceName: "/shengyibao/mall/saveSigning"
        }),
        //获取商城统计数据
        mallPandect: new Api({
            serviceName: "/shengyibao/mall/pandect"
        }),
        //门店PK
        mallreportStopPK: new Api({
            serviceName: "/shengyibao/mall/reportStopPK"
        }),
        //分类汇总
        reportCategory: new Api({
            serviceName: "/shengyibao/mall/reportCategory"
        }),
        //明细汇总
        reportItem: new Api({
            serviceName: "/shengyibao/mall/reportItem"
        }),
        //查看明细
        reportDetail: new Api({
            serviceName: "/shengyibao/mall/reportDetail"
        }),
        //【生意宝】查询打赏可提现额度
        rewardBalance: new Api({
            serviceName: "/shengyibao/reward/balance"
        }),
        //【生意宝】查询打赏提现历史
        rewardHistory: new Api({
            serviceName: "/shengyibao/reward/history"
        }),
        //【生意宝】打赏提现
        rewardWithdraw: new Api({
            serviceName: "/shengyibao/reward/withdraw"
        }),
        //【生意宝】查询打赏记录
        rewardRewards: new Api({
            serviceName: "/shengyibao/reward/rewards"
        }),
        //【生意宝】绑定提现微信账号
        bindWechat: new Api({
            serviceName: "/shengyibao/mall/bindWechat"
        }),
        marketingToolsList: new Api({
            serviceName: "/shengyibao/marketingTools/list"
        }),
        marketingToolsAvailable: new Api({
            serviceName: "/shengyibao/marketingTools/available"
        }),
        marketingToolsEffect: new Api({
            serviceName: "/shengyibao/marketingTools/effect"
        }),
        marketingToolsGetOwnPackage: new Api({
            serviceName: "/shengyibao/marketingTools/getOwnPackage"
        }),
        getOwnPackageEffect: new Api({
            serviceName: "/shengyibao/marketingTools/getOwnPackageEffect"
        }),
        //洗发时长
        hairTime: new Api({
            serviceName: "/shengyibao/shop/hairTime"
        }),
        //【生意宝】进行中列表
        getInstoreServiceList: new Api({
            serviceName: "/shengyibao/instoreService/list"
        }),
        //洗发合格率
        clearHairRate: new Api({
            serviceName: "/shengyibao/shop/clearHairRate"
        }),
        listEmployee: new Api({
            serviceName: "/shengyibao/attendanceManagement/listEmployee"
        }),
        //点评报表
        commentStatistics: new Api({
            serviceName: "/shengyibao/comment/statistics"
        }),

        //点评报表
        registerDevice: new Api({
            serviceName: "/shengyibao/mobile/user/registerDevice"
        }),

        //获取服务/卖品列表(无分页)
        queryMallItem: new Api({
            serviceName: "/shengyibao/mall/queryMallItem"
        }),
        //生意宝排行榜
        getRankingList: new Api({
            serviceName: "/shengyibao/ranking/list"
        }),
        //待办事项列表
        todoList: new Api({
            serviceName: "/shengyibao/todo/list"
        }),
        //待办事项处理
        todoProcess: new Api({
            serviceName: "/shengyibao/todo/handle"
        }),
        //闹钟列表
        clockList: new Api({
            serviceName: "/shengyibao/clock/list"
        }),
        //添加闹钟
        clockAdd: new Api({
            serviceName: "/shengyibao/clock/add"
        }),
        //删除闹钟
        clockDelete: new Api({
            serviceName: "/shengyibao/clock/delete"
        }),
        //扫一扫
        scan: new Api({
            serviceName: "/shengyibao/scancode/scan"
        }),
        //得到商品分类
        queryMallItemCategory: new Api({
            serviceName: "/shengyibao/mall/queryMallItemCategory"
        }),
        //获得收益列表
        queryCampaignList: new Api({
            serviceName: "/shengyibao/mall/queryCampaignList"
        }),
        //获得收益报表
        queryCampaignReport: new Api({
            serviceName: "/shengyibao/mall/queryCampaignReport"
        }),
        //添加顾客
        addNewCustomer: new Api({
            serviceName: "/shengyibao/customer/createMember"
        }),
        // 视频详情
        videoDetail: new Api({
            serviceName: "/shengyibao/video/detail"
        }),
        //评论详情
        listComment: new Api({
            serviceName: "/shengyibao/video/listComment"
        }),
        // 视频列表
        videoList: new Api({
            serviceName: "/shengyibao/video/list"
        }),
        // 搜索视频
        videoFind: new Api({
            serviceName: "/shengyibao/video/find"
        }),
        // 点赞
        videoLikes: new Api({
            serviceName: "/shengyibao/video/like"
        }),
        videoPlay:new Api({
            serviceName: "/shengyibao/video/play"
        }),
        submitComment:new Api({
            serviceName: "/shengyibao/video/submitComment"
        }),
        submitComplaint:new Api({
            serviceName: "/shengyibao/video/submitComplaint"
        }),
        // 教师列表
        listTeacher: new Api({
            serviceName: "/shengyibao/video/listTeacher"
        }),
        // 机构列表
        listOrganization: new Api({
            serviceName: "/shengyibao/video/listOrganization"
        }),
        attendanceSignin: new Api({
            serviceName: "/shengyibao/attendanceManagement/confirm"
        }),
        attendanceUpdata: new Api({
            serviceName: "/shengyibao/attendanceManagement/signin"
        }),
        updateEmployeeCheck: new Api({
            serviceName: "/shengyibao/attendanceManagement/updateEmployeeCheck"
        }),
        employeeRecord: new Api({
            serviceName: "/shengyibao/attendanceManagement/employeeRecord"
        }),
        shiftSetting: new Api({
            serviceName: "/shengyibao/attendanceManagement/shiftSetting"
        }),
        shiftList: new Api({
            serviceName: "/shengyibao/attendanceManagement/sslist"
        }),
        adslist:new Api({
            serviceName: "/shengyibao/video/adslist"
        }),
        msgRecord:new Api({
            serviceName: "/shengyibao/smsautopay/log"
        }),
        msgShop:new Api({
            serviceName: "/shengyibao/smsautopay/shop"
        }),
        msgShops:new Api({
            serviceName: "/shengyibao/smsautopay/shops"
        }),
        msgTrans:new Api({
            serviceName: "/shengyibao/smsautopay/transfer"
        }),
        msgAlipayCharge:new Api({
            serviceName: "/shengyibao/charge/alipay/mobilePay"
        }),
        msgCheckOrderStatus:new Api({
            serviceName: "/shengyibao/charge/checkOrderStatus"
        }),
        msgRule:new Api({
            serviceName: "/shengyibao/smsautopay/role"
        }),
        querEmpCusts:new Api({
            serviceName: "/shengyibao/customer/querEmpCusts"
        }),
        rotateList:new Api({
            serviceName: "/shengyibao/rotate/list"
        }),
        employeeGetEmpByShopid:new Api({
            serviceName: "/shengyibao/employee/getByShopid"
        }),
        queryReservationByEmpAll:new Api({
            serviceName: "/shengyibao/reservation/queryReservationByEmpAll"
        }),
        updEmpCusts:new Api({
            serviceName: "/shengyibao/customer/updEmpCusts"
        }),
        reservationCount:new Api({
            serviceName: "/shengyibao/reservation/count"
        }),
        tagAdd:new Api({
            serviceName: "/shengyibao/customer/tag/add"
        }),
        tagDel:new Api({
            serviceName: "/shengyibao/customer/tag/del"
        }),
        tagList:new Api({
            serviceName: "/shengyibao/customer/tag/list"
        }),
        tagFilter:new Api({
            serviceName: "/shengyibao/customer/tag/filter"
        }),
        queryEmpTarget:new Api({
            serviceName: "/shengyibao/target/empTarget"
        }),
        saveEmpTarget:new Api({
            serviceName: "/shengyibao/target/saveEmpTarget"
        }),
        queryShopTarget:new Api({
            serviceName: "/shengyibao/target/shopTarget"
        }),
        empdutyMetadata:new Api({
            serviceName: "/shengyibao/mobile/empdutyMetadata"
        }),
        communityList:new Api({
            serviceName: "/shengyibao/association/topicList"
        }),
        communityPublish:new Api({
            serviceName: "/shengyibao/association/saveTopic"
        }),
        communityLabelList:new Api({
            serviceName: "/shengyibao/association/labelList"
        }),
        communityAddLabel:new Api({
            serviceName: "/shengyibao/association/addLabel"
        }),
        communityDeleteLabel:new Api({
            serviceName: "/shengyibao/association/deleteLabel"
        }),
        communityDeleteTopic:new Api({
            serviceName: "/shengyibao/association/deleteTopic"
        }),
        getCommunityDetails:new Api({
            serviceName: "/shengyibao/association/getTopic"
        }),
        actComment:new Api({
            serviceName: "/shengyibao/association/comment"
        }),
        actLike: new Api({
            serviceName: "/shengyibao/association/like"
        }),
        communityAssociation:new Api({
            serviceName: "/shengyibao/association/associationData"
        }),
        communityMsg: new Api({
            serviceName: "/shengyibao/association/newsNotify"
        }),
        msgtplList:new Api({
            serviceName: "/shengyibao/msgtpl/list"
        }),
        msgtplPush:new Api({
            serviceName: "/shengyibao/msgtpl/push"
        }),
        saveShopTarget:new Api({
            serviceName: "/shengyibao/target/saveShopTarget"
        }),
        audit_archives:new Api({
            serviceName: "/shengyibao/workingaudit/achives"
        }),
        audit_todolist:new Api({
            serviceName: "/shengyibao/workingaudit/todolist"
        }),
        audit_reservation:new Api({
            serviceName: "/shengyibao/workingaudit/reservation"
        }),
        audit_invention:new Api({
            serviceName: "/shengyibao/workingaudit/invention"
        }),
        audit_topic:new Api({
            serviceName: "/shengyibao/workingaudit/topic"
        }),
        audit_achivesList:new Api({
            serviceName: "/shengyibao/workingaudit/achivesList"
        }),
        checkMobile: new Api({
            serviceName: "/shengyibao/customer/checkMobile"
        }),
        cleanPushToken: new Api({
            serviceName: "/shengyibao/attendanceManagement/cleanPushToken"
        }),
        getNewTopic: new Api({
            serviceName: "/shengyibao/association/newOperatedTopic"
        }),
    };
})();
