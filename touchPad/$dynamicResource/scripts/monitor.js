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
 * status 0 成功
 *        1 错误
 */
var monitor = {
    timer: null,
    // 获取时间戳
    getTs: function () {
        return new Date().getTime()
    },
    // 初始化计时器
    startTimer: function (type, ext) {
        var ts = this.getTs()
        this.timer = {
            type: type,
            startTs: ts,
            stopTs: 0,
            delay: 0,
            status: 0,
            shopId: am.metadata.userInfo.shopId,
            ext: ext || null
        }
        console.log('start timer', this.timer)
    },
    // 终止计时器
    stopTimer: function (type, status, ext) {
        var ts = this.getTs()
        // 匹配参数正确性
        if (this.timer && this.timer.type == type) {
            var delay = ts - this.timer.startTs;

            if (delay > 0) {
                this.timer.stopTs = ts
                this.timer.delay = delay
                this.timer.status = status || 0

                console.log('stop timer', this.timer)

                if (config.gateway.indexOf('meiguanjia.net') != -1) {
                    var logId = localStorage.getItem("MGJ_LOGID") || null
                    var userAgent = navigator.userAgent
                    var platfrom = /(iOS)/i.test(userAgent) ? "iOS" : /(iPhone)/i.test(userAgent) ? "iPhone" : /(iPad)/i.test(userAgent) ? "iPad" : /(Android)/i.test(userAgent) ? "Android" : "PC"
                    var connType = navigator.connection && navigator.connection.type
                    if (ext) {
                        this.timer.ext = ext
                    }
                    if (this.timer.ext) {
                        this.timer.ext.logId = logId
                        this.timer.ext.platfrom = platfrom
                        this.timer.ext.userAgent = userAgent
                        this.timer.ext.connType = connType
                    } else {
                        this.timer.ext = {
                            logId: logId,
                            platfrom: platfrom,
                            userAgent: userAgent,
                            connType: connType
                        }
                    }
                    this.saveTimer()
                }
                this.resetTimer()
            }
            
        } else {
            // 参数异常
        }
    },
    // 保存计时器
    saveTimer: function () {
        $.ajax({
            type: "post",
            data: JSON.stringify(this.timer),
            url: "http://ops.meiguanjia.net/monitor/timer/save",
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
    resetTimer: function () {
        this.timer = null
    }
}