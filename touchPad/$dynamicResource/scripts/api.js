
(function() {
    //serviceName
    window.Api = function(opt) {
        if (!opt)
            return;
        if (opt.serviceName) {
            this.serviceName = opt.serviceName;
        } else {
            throw ('Api error: 必须输入serviceName');
        }
        this.md5 = opt.md5;

        this.closelog = opt.closelog;
    };
    window.Api.prototype = {
        exec: function(opt, cb,noDefaultParams, timeout) {
            var _this = this;
            var callback = function(code){
                if(!opt.token && am.metadata && am.metadata.userInfo && am.metadata.userInfo.mgjtouchtoken &&(_this.serviceName !== 'mgj-cashier/user/login')){
                    opt.token = am.metadata.userInfo.mgjtouchtoken;
                }
                if(_this.serviceName == 'FilesMgr/base64Upload'){
                    delete opt.token;
                }
                if(code){
                    opt.code = code;
                }
                return _this.getdata(opt, cb,noDefaultParams,timeout);
            }
            var isLoading = $('#am-modalLoading').is(':visible');
            $('#am-modalLoading').hide();
            return preventRobot.show({
                url: _this.serviceName,
                callback: function(code){
                    if(isLoading){
                        $('#am-modalLoading').show();
                    }
                    return callback(code);
                }
            });
        },
        getdata: function(option, sc,noDefaultParams,timeout) {
            var self = this;
            if(this.closelog){
                $.am.debug.log(this.serviceName + ": closelog");
            }else{
                $.am.debug.log(this.serviceName + ": " + JSON.stringify(option));
            }
            var url = config.gateway + this.serviceName;
            if(option.token){
                var parentShopId = option.parentShopId;
                if(am.metadata && am.metadata.userInfo && am.metadata.userInfo.parentShopId){
                    parentShopId = am.metadata.userInfo.parentShopId;
                }
                url = url + "?" + $.param({
                    parentShopId: parentShopId,
                    token:option.token
                });
            }
            var paramStr = JSON.stringify(option);
            if(this.md5){
	            url = url + '&sign='+hex_md5(paramStr);
            }
            var startTs = new NativeDate().getTime();

            ping.reset();

            var ajaxObj = $.ajax({
                type: "post",
                data: paramStr,
                url: url,
                timeout: timeout || 30 * 1000,
                dataType: "json",
                contentType: "application/json",
                success: function(ret) {
                    $.am.debug.log(self.serviceName + " SUCCESS:" + (new NativeDate().getTime()-startTs));
                    if(ret && ret.code==20160801){
						try{
                            if($.am.getActivePage().id === 'page_pay'){
                                  am.page.pay.paying = 0;
                            }
                            if($(".addremark_model").is(':visible')){
                                $(".addremark_model").hide();
                            }
                        }catch(e){}
                        am.loading.hide();
                        am.msg(ret.message || '系统数据异常，只能查询数据');
                        am.goBackToInitPage();
                        return false;
                    }
                    //sc(ret);
                    if(ret.code==203009 || ret.code==200005){
                        sc({
                            code: -3,
                            message: "token失效"
                        });
                            // am.loading.hide();
                            // am.msg(ret.message);
							// $.am.changePage(am.page.login, "");
                            localStorage.removeItem('userToken');
                            location.reload();
                    }else {
                        sc(ret);
                        if(ret && ret.code==-1){
                            ping.start();
                        }
                    }

                    var ts = new Date(ajaxObj.getResponseHeader("Date"));
                    if (ts) {
                        am.syncTime(ts.getTime());
                    }
                },
                error: function(ret) {
                    $.am.debug.log(self.serviceName + " ERROR: " + ret.statusText+',REQUESTTIME:'+startTs);
                    // console.log(ret);
                    if (ret.statusText != "abort") {
                        sc({
                            code: -1,
                            message: "网络不给力,请检查网络环境！"
                        });
                        ping.start();
                    } else {
                        sc({
                            code: -2,
                            message: "用户取消"
                        });
                    }
                }
            });

            return ajaxObj;
        }
    };

    var apiWorker;
    if(typeof(Worker)==="function"){
        apiWorker = new Worker("$dynamicResource/scripts/apiWorker.js");
    }
    if(apiWorker && typeof(apiWorker.onmessage === "function")){
        var apiCache = {},abortCache = {};
        apiWorker.onmessage = function (event) {
            if(event.data && event.data.__threadId){
                var sc = apiCache[event.data.__threadId];
                if(!sc){
                    return;
                }
                apiCache[event.data.__threadId] = undefined;
                delete apiCache[event.data.__threadId];
                var ret = event.data;
                $.am.debug.log(self.serviceName + " scb: " + ret.code);
                //sc(ret);
                if(ret && ret.code==20160801){
					try{
						if($.am.getActivePage().id === 'page_pay'){
							  am.page.pay.paying = 0;
                        }
                        if($(".addremark_model").is(':visible')){
                            $(".addremark_model").hide();
                        }
					}catch(e){}
                    am.loading.hide();
                    am.msg(ret.message || '系统数据异常，只能查询数据');
                    am.goBackToInitPage();
                    return false;
                }
                if(ret.code==203009 || ret.code==200005){
                    sc({
                        code: -3,
                        message: "token失效"
                    });
                    // am.loading.hide();
                    // am.msg(ret.message);
					// $.am.changePage(am.page.login, "");
                    localStorage.removeItem('userToken');
                    location.reload();
                }else {
                    sc(ret);
                    if(ret && ret.code==-1){
                        ping.start();
                    }
                }
                var ts = new Date(ret.Date);
                if (ts) {
                    am.syncTime(ts.getTime());
                }
            }
        };
        window.Api.prototype.getdata = function(option, sc,noDefaultParams,timeout) {
            $.am.debug.log("web Worker start");
            var __threadId = new Date().getTime().toString()+ Math.round(Math.random()*100000000);
            apiCache[__threadId] = sc;

            if(this.closelog){
                $.am.debug.log(this.serviceName + ": closelog");
            }else{
                $.am.debug.log(this.serviceName + ": " + JSON.stringify(option));
            }
            if(config){
                var url = config.gateway + this.serviceName;
            if(this.serviceName != "mgj-cashier/user/login"){
                var userToken=JSON.parse(localStorage.getItem("userToken"));
                url = url + "?" + $.param({
                    parentShopId: userToken? userToken.parentShopId : null,
                    token:userToken ? userToken.mgjtouchtoken : null
                });
            }

            ping.reset();

            apiWorker.postMessage({
                __threadId:__threadId,
                url:url,
                noDefaultParams: noDefaultParams,
                timeout: timeout || 30 * 1000,
                option:option
            });

            return {
                __threadId:__threadId,
                abort:function(){
                    var sc = apiCache[this.__threadId];
                    delete apiCache[this.__threadId];
                    if(sc){
                        sc({
                            code: -2,
                            message: "用户取消"
                        });
                    }
                }
            };
            }
        };
    }

    var ping = {
        reset: function(){
            if(this.timer){
                clearInterval(this.timer);
            }
            if(this.ajaxArr && this.ajaxArr.length){
                for(var i=0;i<this.ajaxArr.length;i++){
                    this.ajaxArr[i].abort();
                }
            }
            this.pingNumber = 0;
            this.result = [];

            //正在使用的url,在被ping时成功的次数及用掉的时候
            this.original={
                times:0,
                ts:0
            };
        },
        start: function(){
            if(!config || !config.ping || !config.ping.length){
                return;
            }
            this.ping = config.ping;
            this.reset();
            this.ajax(config.ping[Math.floor(this.pingNumber/3)]);
        },
        getReportOption: function(){
            var servers = this.ping,
                enableServers = [],
                disableServers = [];
            if(this.result && this.result.length){
                enableServers = this.getProccessedUrl();
                for(var i=0;i<servers.length;i++){
                    var include = 0;
                    for(var j=0;j<enableServers.length;j++){
                        if(servers[i]==enableServers[j].url){
                            include ++;
                            break;
                        }
                    }
                    if(!include){
                        disableServers.push(servers[i]);
                    }
                }
            }else {
                disableServers = this.ping;
            }
            var userAgent = navigator.userAgent;
			var platfrom = /(iOS)/i.test(userAgent) ? "iOS" : /(iPhone)/i.test(userAgent) ? "iPhone" : /(iPad)/i.test(userAgent) ? "iPad" : /(Android)/i.test(userAgent) ? "Android" : "PC";
            var connType = navigator.connection && navigator.connection.type;
            var userInfo = null;
            if(am && am.metadata && am.metadata.userInfo){
                var _userInfo = am.metadata.userInfo
                userInfo = {
                    userName: _userInfo.trueUserName,
                    mobile: _userInfo.mobile || _userInfo.secondPhone,
                    shopName: _userInfo.shopName + _userInfo.osName,
                    shopId: _userInfo.shopId,
                    address: _userInfo.address
                }
            }
            return {
                dbName: 'mgj-monitor',
                collName: 'ping',
                data: {
                    servers: servers,
                    enableServers: enableServers,
                    disableServers: disableServers,
                    userInfo: userInfo,
                    platfrom: platfrom,
					userAgent: userAgent,
					connType: connType
                }
            }
        },
        report: function(callback){
            var req = this.getReportOption();
            $.ajax({
                type: "post",
                data: JSON.stringify(req),
                url: this.getUrl(),
                timeout: 6 * 1000,
                dataType: "json",
                contentType: "application/json",
                success: function (ret) {
                    callback && callback();
                },
                error: function (ret) {
                    callback && callback();
                }
            });
        },
        switchServer: function(){
            var url = this.getBestUrl();
            if(!url){
                return;
            }
            var _this = this;
            this.report(function(){
                if(location.protocol == 'http:' || location.protocol == 'https:' ){
                    location.href = url + '/young';
                }else {
                    //localStorage.removeItem('userToken');
                    config.gateway = config.mobile = url;
                    //$.am.changePage(am.page.login);
                }
                _this.reset();
            });
        },
        getBestUrl:function(){
            var url = '';
            if(this.result && this.result.length){
                var rets = this.getProccessedUrl();
                url = rets.length?rets[0].url:'';
            }
            return url;
        },
        getProccessedUrl: function(){
            //去重取平均
            var rets = [];
            for(var i=0;i<this.result.length;i++){
                var obj = this.result[i];
                if(!rets[obj.url]){
                    //如果属性里面没有对应的，第一次加入，times 1
                    obj.times = 1;
                    //map
                    rets[obj.url] = obj;
                    //加入到数组
                    rets.push(obj);
                }else{
                    //已加入，时间累计，次数增加
                    rets[obj.url].ts += obj.ts;
                    rets[obj.url].times++;
                }
            }
            //3次都成功才行
            rets = rets.filter(function(o){
                return o.times === 3;
            });
            //3次都成功，且平均时间最短的
            rets.sort(function(a,b){
                return a.ts - b.ts;
            });
            return rets;
        },
        success: function(url,ts){
            if(url === config.gateway){
                //如果url是等于现在使用中的url
                this.original.times++;
                this.original.ts+=ts;
            }
            this.result.push({
                url: url,
                ts: ts
            });
            this.pingNumber ++;
            if(this.pingNumber<this.ping.length*3){
                this.ajax(config.ping[Math.floor(this.pingNumber/3)]);
            }else if(this.original.times <= 1){
                this.switchServer();
            }
        },
        original:{
            times:0,
            ts:0
        },
        error: function(){
            this.pingNumber ++;
            if(this.pingNumber<this.ping.length*3){
                this.ajax(config.ping[Math.floor(this.pingNumber/3)]);
            }else {
                if(this.result && this.result.length){
                    this.switchServer();
                }else {
                    this.report();
                    if(!this.loop){
                        this.loop = 0;
                    }
                    var _this = this;
                    if(this.timer){
                        clearInterval(this.timer);
                    }
                    this.timer = setInterval(function(){
                        _this.start();
                        _this.loop ++;
                    },Math.pow(2,this.loop)*5000);
                }
            }
        },
        ajax: function (url) {
            var _this = this;
            var startTs = new Date().getTime();
            var ajaxObj = $.ajax({
                url: url + 'mgj-cashier/memcachSV/check/right',
                type: "GET",
                timeout: 3000,
                contentType: "application/json", //返回数据类型
                success: function (ret) {
                    var endTs = new Date().getTime();
                    var ts = endTs - startTs;
                    _this.success(url, ts);
                },
                error: function (ret) {
                     _this.error(url);
                }
            });
            if (!this.ajaxArr) {
                this.ajaxArr = [];
            }
            this.ajaxArr.push(ajaxObj);
        },
        getUrl: function(){
            if(!this.url){
                var url = 'https://ops.meiguanjia.net/monitor/commdata/save';
                if(location.protocol === 'http:'){
                    url = url.replace('https','http');
                }
                this.url = url;
            }
            return this.url;
        }
    }

    /*
     * ApiCacheable类,实例化一个service对象,通过调用这个对象的exec方法执行一个service
     * @Class
     * @public
     *
     * @param opt.serviceName   [string]    必需      undefined   service名称
     * @param opt.keys          [array]     必需      undefined   参数名
     * @param opt.memoryCache   [boolean]   可选      false       是否启用内存缓存
     * @param opt.isSuccess     [function]  必需      返回是否成功调用业务数据,参数为结果
     *
     * @return                  [ApiCacheable]
     */
    ApiCacheable = function(opt) {
        if (!opt)
            return;
        Api.call(this, opt);
        if (opt.keys && opt.isSuccess) {
            this.keys = opt.keys;
            this.isSuccess = opt.isSuccess;
        } else {
            throw ('ApiCacheable error: 参数有误,必须输入keys[array],isSuccess[function]');
        }
        this.memoryCache = opt.memoryCache;
        this.storeData = {};
    };
    ApiCacheable.prototype = new Api();
    /*
     * 获取作为cache使用的key,此key由servicename和参数组成(过滤掉keyFilter);
     * @function
     * @private
     * @param    opt    [object]     必需      调用service的时的option
     *
     * @return   key    [string]
     */
    ApiCacheable.prototype._key = function(opt) {
        var key = "RF" + "_" + this.serviceName;
        for (var i = 0; i < this.keys.length; i++) {
            key = key + "_" + opt[this.keys[i]];
        };
        return key;
    },
    /*
        * 读取本地存储中的数据
        * @function
        * @private
        * @param    opt    [string]     必需      接口参数
        *
        * @return   result [object]     service的本地数据
        */
    ApiCacheable.prototype._get = function(opt) {
        var key = typeof(opt) == "string" ? opt : this._key(opt);
        var temp = localStorage.getItem(key);
        if (!temp) {
            return;
        }
        try {
            temp = JSON.parse(temp);
        } catch (e) {
            $.am.debug.log("api.get JSON.parse error:" + key);
            temp = null;
        }
        return temp;
    },
    /*
        * 保存service数据到本地存储中
        * @function
        * @private
        * @param    opt    [object]     必需      接口参数
        * @param    data   [object]     必需      调用数据成功后得到的数据
        *
        * @return   result [object]     service的本地数据
        */
    ApiCacheable.prototype._save = function(opt, data) {
        localStorage.setItem(typeof(opt) == "string" ? opt : this._key(opt), JSON.stringify(data));
    },
    /*
        * 添加一个数据对象到缓存中
        * @function
        * @public
        * @param    option  [object]     必需     缓存数据的参数,需要以此参数生成key
        * @param    item    [function]   必需     要插入的数据对象
        * @param    noCache [boolean]    可选     目标路径,如:"responseData.data.storelist"
        *
        * @return
        * @description
        */
    ApiCacheable.prototype.addItemToCache = function(option, item, targetPath) {

    },
    /*
    * 执行service
    * @function
    * @public
    * @param    option  [object]     必需     调用service的时的option
    * @param    sc      [function]   必需     回调函数
    * @param    noCache [boolean]    可选     是否忽略缓存数据
    *
    * @return
    */
    ApiCacheable.prototype.exec = function(opt, cb, noCache) {
        var key = this._key(opt),
            _this = this;
        if (this.memoryCache && this.storeData[key]) {
            cb(_this.storeData[key], 2);
            //内存数据, 说明之前至少成功取到一次网络或者local数据
            return;
        }
        var loc = this._get(key);
        if (loc) {
            this.memoryCache && (_this.storeData[key] = loc);
            cb(loc, 1);
        }
        _this.getdata(opt, function(ret) {
            if (_this.isSuccess(ret)) {
                _this._save(key, ret);
                _this.memoryCache && (_this.storeData[key] = ret);
            }
            cb(ret);
        });
    };

    var preventRobot = {
        execApiList: [
            'mgj-cashier/member/delMember', //删除会员
            'mgj-cashier/member/delMemberCard', //删除会员卡
            'mgj-cashier/member/editMember', //修改会员资料
            'mgj-cashier/member/modiFee', //修改卡余额
            'mgj-cashier/member/returnTreatItems', //退套餐
            'mgj-cashier/bill/cancel', //流水单撤单
            'mgj-cashier/bill/upd', //流水单修改
            'mgj-cashier/bill/updataproject', //流水单修改
            'mgj-cashier/member/transferShop', //修改会员所属门店
            'mgj-cashier/member/udpCardComment', //修改会员卡备注
            'mgj-cashier/invalidate/update', //修改会员卡到期日
            'mgj-cashier/member/editMemberCardId', //修改会员卡号,
            'mgj-cashier/member/udpTreatComment', //修改套餐备注
            'mgj-cashier/bill/updDeptPerf', //修改流水部门业绩
            'mgj-cashier/member/memberMerge', //合并会员
            'mgj-cashier/member/updMemberPoint', //修改会员店内积分
        ],
        init: function(){
            var _this = this;
            this.$ = $('#preventRobot');
            this.$.on('vclick','.close',function(){
                _this.hide();
            }).on('vclick','.codeImg',function(){
                _this.setCode();
            }).on('vclick','.sure',function(){
                var code = _this.$.find('.code').val();
                if(!code){
                    return am.msg('请输入验证码');
                }
                _this.hide();
                if(_this.callback){
                    return _this.callback(code);
                }
            }).on('vclick','.cancel',function(){
                _this.hide();
            }).on('keyup','.code',function(e){
                if(e.keyCode==13){
                    _this.$.find('.sure').trigger('vclick');
                }
            })
        },
        show: function(opt){
            this.url = opt.url;
            this.callback = opt.callback;
            if(this.execApiList.indexOf(this.url)!=-1 && (this.url.indexOf('bill')==-1 || amGloble.metadata.userInfo.mgjControlCode==1)){
                this.$.show();
                this.setCode();
            }else {
                if(this.callback){
                    return this.callback();
                }
            }
        },
        hide: function(){
            this.$.hide();
            this.$.find('.code').val('').blur();
        },
        setCode: function(){
            if(amGloble.metadata &&  amGloble.metadata.userInfo){
                var userInfo = amGloble.metadata.userInfo;
                var codeImg = config.gateway + 'mgj-cashier/user/vc?parentShopId=' + userInfo.parentShopId + '&token=' + userInfo.mgjtouchtoken + '&ts='+new Date().getTime();
                this.$.find('.codeImg').attr('src',codeImg);
            }
        }
    }
    preventRobot.init();
})();