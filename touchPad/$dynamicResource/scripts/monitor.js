/*
 * type   M010 开单
 *        M02 确定开单
 *        M03 保存开单
 *        M04 取单
 *        M05 结算
 *        M06 在线收款
 *        M07 顾客详情
 *        M08 查询流水
 *        M09 查询本店会员
 *        M10 查询分店会员
 *        M11 顾客详情-消费记录
 *        M12 顾客详情-卡金变动流水
 *        M13 C扫B
 *        M14 JS error
 *        M15 点评验券监控
 * 		  M16 计算业绩、提成
 * status 0 成功
 *        1 错误
 *        2 超时
 */
var monitor = {
	timer: null,
	// 超时未上报时间配置
	timeoutConfig: {},
	// 默认超时未上报时间配置
	defaultTimeout: 45 * 1000,
	// 超时的 timer Object，key => type,  value => timer
	timeoutTimerMap: {},
	// 上报信息 Object , kye=> type, value => reportData 上报参数
	reportDataMap: {},
    // 获取时间戳
    getTs: function () {
        return new Date().getTime()
	},
	addErrorMsg: function(errorMsg) {
		var errorMsgString = JSON.stringify(errorMsg);
		for (var id in this.reportDataMap) {
			var reportData = this.reportDataMap[id];
			var ext = reportData.ext || {};
			ext.errorMsg = errorMsgString;
			reportData.ext = ext;
			this.setReportData(id, reportData);
		}
	},
	timeoutCallback: function(type) {
		// 超时上报
		var reportData = this.getReportData(type);
		if (reportData) {
			reportData.status = 2;
			this.saveTimer(reportData);
			this.resetTimer(type);
		}
	},
	createTimeoutTimer: function(type) {
		var id = type;
		var time = this.timeoutConfig[type] || this.defaultTimeout;
		var _this = this;
		this.timeoutTimerMap[id] = setTimeout(function() {
			_this.timeoutCallback(type);
		}, time)
	},
	removeTimeoutTimer: function(id) {
		var timer = this.timeoutTimerMap[id];
		if (timer) {
			clearTimeout(timer);
			delete this.timeoutTimerMap[id];
		}
	},
	getReportData: function(id) {
		return this.reportDataMap[id];
	},
	setReportData: function(id, data) {
		this.reportDataMap[id] = data;
	},
	removeReportData: function(id) {
		delete this.reportDataMap[id];
	},
    // 初始化计时器
    startTimer: function (type, ext) {
		var ts = this.getTs()
        var reportData = {
            type: type,
            startTs: ts,
            stopTs: 0,
            delay: 0,
            status: 0,
            shopId: am.metadata.userInfo.shopId,
            ext: ext || null
		}
		if (config.gateway.indexOf('meiguanjia.net') != -1) {
			var logId = localStorage.getItem("MGJ_LOGID") || null
			var userAgent = navigator.userAgent
			var platfrom = /(iOS)/i.test(userAgent) ? "iOS" : /(iPhone)/i.test(userAgent) ? "iPhone" : /(iPad)/i.test(userAgent) ? "iPad" : /(Android)/i.test(userAgent) ? "Android" : "PC"
			var connType = navigator.connection && navigator.connection.type
			if (reportData.ext) {
				reportData.ext.logId = logId
				reportData.ext.platfrom = platfrom
				reportData.ext.userAgent = userAgent
				reportData.ext.connType = connType
			} else {
				reportData.ext = {
					logId: logId,
					platfrom: platfrom,
					userAgent: userAgent,
					connType: connType
				}
			}
		}
		this.setReportData(type, reportData);
		this.createTimeoutTimer(type);
		console.log('start timer', reportData);
    },
    // 终止计时器
    stopTimer: function (type, status, ext) {
        var ts = this.getTs()
		// 匹配参数正确性
		var reportData = this.getReportData(type);
		if (reportData) {
            var delay = ts - reportData.startTs;

            if (delay > 0) {
                reportData.stopTs = ts
                reportData.delay = delay
                reportData.status = status || 0

				console.log('stop timer', reportData)
				if (ext) {
					if (reportData.ext) {
						for(var extKey in ext) {
							reportData.ext[extKey]  = ext[extKey];
						}
					} else {
						reportData.ext = ext;
					}
				}
				this.saveTimer(reportData)
                this.resetTimer(type)
            }
            
        } else {
            // 参数异常
        }
    },
    // 保存计时器
    saveTimer: function (reportData) {
        $.ajax({
            type: "post",
            data: JSON.stringify(reportData),
            url: this.getUrl(),
            timeout: 30 * 1000,
            dataType: "json",
            contentType: "application/json",
            success: function (ret) {

            },
            error: function (ret) {

            }
        });
    },
    // 重置计时器
    resetTimer: function (id) {
		this.removeReportData(id);
		this.removeTimeoutTimer(id);
	},
	getUrl: function(){
		if(!this.url){
			var url = 'https://ops.meiguanjia.net/monitor/timer/save';
			if(location.protocol === 'http:'){
				url = url.replace('https','http');
			}
			this.url = url;
		}
		return this.url;
	}
}

window.addEventListener('error', function(message){
	var ret = {
		error: message.message,
		filename: message.filename,
		line: message.lineno,
		col: message.colno
	}
	monitor.startTimer('M14');
	monitor.stopTimer('M14',0,ret);
});