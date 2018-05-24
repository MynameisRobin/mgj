(function() {
    window.defaultConfig.commonUrl="http://common.reeli.cn";
    var configStr = localStorage.getItem("BusinessAppV2_config");
    if (!configStr) {
        window.config = $.extend({}, window.defaultConfig);
    } else {
        window.config = $.extend({}, window.defaultConfig, JSON.parse(configStr));
    }
    window.jokes = [{
        title: "你知<br>道么",
        content: "经常与顾客互动，可以维持顾客的粘性。"
    }, {
        title: "你知<br>道么",
        content: "经常在朋友圈分享你做得好的作品，可以建立自身品牌。"
    }, {
        title: "你知<br>道么",
        content: "为客户设置消费周期，可以定时提醒客户来店消费。"
    }, {
        title: "你知<br>道么",
        content: "提升业绩的根本，是维持好客户关系。"
    }, {
        title: "你知<br>道么",
        content: "服务和技术，是立身之本。"
    }, {
        title: "你知<br>道么",
        content: "只重技术而不重服务，业绩会越来越差。"
    }, {
        title: "你知<br>道么",
        content: "技术就是服务，服务也是技术。"
    }, {
        title: "你知<br>道么",
        content: "不要欺骗顾客。"
    }, {
        title: "你知<br>道么",
        content: "不要让顾客在消费时感受到被推销的压力。"
    }, {
        title: "你知<br>道么",
        content: "每两天做好一个熟客，一年之后你业绩第一。"
    }, {
        title: "你知<br>道么",
        content: "服务完顾客，要记得问客户“你喜欢这样的设计吗”"
    }, {
        title: "你知<br>道么",
        content: "不要把顾客当上帝，要当朋友。"
    }, {
        title: "你知<br>道么",
        content: "业绩是结果，顾客是原因。"
    }, {
        title: "你知<br>道么",
        content: "客单价和客数同样重要。"
    }, {
        title: "你知<br>道么",
        content: "每天宰一个顾客，一年之后你将一个顾客都没有。"
    }, {
        title: "你知<br>道么",
        content: "记住顾客的名字。"
    }, {
        title: "你知<br>道么",
        content: "用心服务顾客，才有长期回报。"
    }, {
        title: "你知<br>道么",
        content: "对任何人，要有感恩之心。"
    }, {
        title: "你知<br>道么",
        content: "技术是基础，服务是灵魂。"
    }, {
        title: "你知<br>道么",
        content: "信任是做好顾客服务的基础。"
    }, {
        title: "你知<br>道么",
        content: "业绩好不要洋洋得意，业绩差不要忧心忡忡；"
    }, {
        title: "你知<br>道么",
        content: "要想不被人管理，就要做好自我管理。"
    }, {
        title: "你知<br>道么",
        content: "经常吃亏的人，会得大利。"
    }, {
        title: "你知<br>道么",
        content: "记录客户的信息，经常翻看，你很快会“认识”每一个客人。"
    }, {
        title: "你知<br>道么",
        content: "做完服务后，主动要求给客人拍照，并不断的夸TA。"
    }, {
        title: "你知<br>道么",
        content: "好看与不好看，是主观的，说好看的人多了，就好看了。"
    }, {
        title: "与你<br>共勉",
        content: "无欲速，无见小利。欲速则不达，见小利则大事不成。"
    }, {
        title: "与你<br>共勉",
        content: "天道酬勤。"
    }, {
        title: "与你<br>共勉",
        content: "天生我材必有用。"
    }, {
        title: "与你<br>共勉",
        content: "莫等闲，白了少年头，空悲切。"
    }, {
        title: "与你<br>共勉",
        content: "盛年不重来，一日难再晨，及时当勉励，岁月不待人。"
    }, {
        title: "与你<br>共勉",
        content: "青春去时不告别，老年来时不招手。"
    }, {
        title: "与你<br>共勉",
        content: "一年之计在于春，一日之计在于晨。"
    }, {
        title: "与你<br>共勉",
        content: "谁虚度年华，青春就要裉色，生命就会抛弃他们。"
    }, {
        title: "与你<br>共勉",
        content: "时间象弹簧，可以缩短，也可以拉长。"
    }, {
        title: "与你<br>共勉",
        content: "浪费时间是所有支出中最奢侈及最昂贵的。"
    }, {
        title: "与你<br>共勉",
        content: "光景不待人，须臾发成丝。"
    }, {
        title: "与你<br>共勉",
        content: "把握住今天，胜过两个明天。"
    }, {
        title: "与你<br>共勉",
        content: "对时间的慷慨，就等于慢性自杀。"
    }, {
        title: "与你<br>共勉",
        content: "一寸光阴一寸金，寸金难买寸光阴。"
    }, {
        title: "与你<br>共勉",
        content: "有志不在年高，无志空活百岁。"
    }, {
        title: "与你<br>共勉",
        content: "将相本无主，男儿当自强。"
    }, {
        title: "与你<br>共勉",
        content: "饱食终日，无所用心，难矣哉。"
    }, {
        title: "与你<br>共勉",
        content: "志之难也，不在胜人，在自胜。"
    }, {
        title: "与你<br>共勉",
        content: "天行健，君子以自强不息。"
    }, {
        title: "与你<br>共勉",
        content: "无冥冥之志者，无昭昭之明，无昏昏之事者，无赫赫之功。"
    }, {
        title: "与你<br>共勉",
        content: "忧劳可以兴国，逸豫可以亡身，自然之理也。"
    }, {
        title: "与你<br>共勉",
        content: "只要朝着一个方向努力，一切都会变得得心应手。"
    }, {
        title: "与你<br>共勉",
        content: "目标越接近，困难越增加。"
    }, {
        title: "与你<br>共勉",
        content: "真正的才智是刚毅的志向。"
    }, {
        title: "与你<br>共勉",
        content: "志不立，天下无可成之事。"
    }, {
        title: "发型师<br>看看",
        content: "用思想设计发型，用手表现发型。"
    }, {
        title: "发型师<br>看看",
        content: "先了解发型的形，在做发型的型。"
    }, {
        title: "发型师<br>看看",
        content: "用思想设计发型，用手表现发型。"
    }, {
        title: "发型师<br>看看",
        content: "先看上下，再看左右，最后看手位。"
    }, {
        title: "发型师<br>看看",
        content: "从实践中总结理论，用实践去验证理论。"
    }, {
        title: "发型师<br>看看",
        content: "用思想控制发型轮廓，用眼睛控制左手的角度，用右手控制剪刀与工具。"
    }, {
        title: "发型师<br>看看",
        content: "左手控制思想，右手控制工具。"
    }, {
        title: "发型师<br>看看",
        content: "发型师的成长经历 = 模仿 + 吸收 +发挥"
    }, {
        title: "关于<br>我们",
        content: "美管加是中国美业互联网运营第一品牌"
    }, {
        title: "关于<br>我们",
        content: "美管加的口号是：让美互联，让爱相连"
    }, {
        title: "关于<br>我们",
        content: "美管加是上海七圣网络科技旗下产品"
    }, {
        title: "关于<br>我们",
        content: "七圣取名源自天主教七美德：诚信、希望、慷慨、正义、勇敢、节制、宽容"
    }, {
        title: "关于<br>我们",
        content: "七圣网络科技成立于2015/12/12"
    }, {
        title: "关于<br>我们",
        content: "七圣网络科技的前身是深圳盛传和上海睿丽科技"
    }, {
        title: "关于<br>我们",
        content: "美管加的研发团队位于中国武汉，光谷高科技园区"
    }, {
        title: "关于<br>我们",
        content: "盛传是美业收银系统SaaS服务的杰出代表"
    }, {
        title: "关于<br>我们",
        content: "美管加在全国有超过30000家门店"
    }, {
        title: "关于<br>我们",
        content: "美管加的目标是帮助中国美业门店实现互联网化"
    }, {
        title: "关于<br>我们",
        content: "美管加的主要产品包括基础收银系统，美一客，生意宝，无纸化系统等"
    }, {
        title: "关于<br>我们",
        content: "美管加的业务范围包括互联网基础系统，基础服务，基础教育和代运营"
    }];


    var kicked = false;
    //serviceName
    window.Api = function(opt) {
        if (!opt) return;
        if (opt.serviceName) {
            this.serviceName = opt.serviceName;
        } else {
            throw ('Api error: 必须输入serviceName');
        }
        this.numFixed = opt.numFixed;
    };
    window.Api.prototype = {
        exec: function(opt, cb, noDefaultParams, timeout) {
            return this.getdata(opt, cb, noDefaultParams, timeout);
        },
        getdata: function(option, sc, noDefaultParams, timeout) {
            var opt = $.extend(noDefaultParams ? {} : {
                parentShopId: window.config ? window.config.parentShopId : null,
                token: window.config ? window.config.token : null
            }, option);

            var self = this;
            var str = JSON.stringify(opt);
            str = str.length > 1000 ? str.substr(0, 1000) : str;
            $.am.debug.log(this.serviceName + ": " + str);
            // console.log(this.serviceName + ": " + JSON.stringify(opt));

            var ajaxObj = $.ajax({
                type: "post",
                data: JSON.stringify(opt),
                url: config.baseUrl + this.serviceName + "?" + $.param({
                    parentShopId: window.config ? window.config.parentShopId : null,
                    token: window.config ? window.config.token : null
                }),
                timeout: timeout || 20000,
                dataType: "json",
                contentType: "application/json",
                success: function(ret) {
                    $.am.debug.log(self.serviceName + " scb: " + ret.code);
                    if (ret.code == 200005 && !kicked) {
                        amGloble.loading.hide();
                        kicked = true;
	                    localStorage.clear();
                        alert("您已在其他设备登录。");
	                    location.href = "index.html#type=logout";
	                    location.reload();
                        return;
                    }
                    if(self.numFixed){
                        ret = self.fixNum(ret);
                    }
                    sc(ret);

                    var ts = new Date(ajaxObj.getResponseHeader("Date"));
                    if (ts) {
                        //amGloble.syncTime(ts.getTime());
                    }
                },
                error: function(ret) {
                    $.am.debug.log(self.serviceName + " fcb: " + ret.statusText);
                    // console.log(ret);
                    if (ret.statusText != "abort") {
                        sc({
                            code: -1,
                            message: "网络不给力,请检查网络环境！"
                        });
                    } else {
                        sc({
                            code: -2,
                            message: "用户取消"
                        });
                    }
                }
            });

            return ajaxObj;
        },
	    fixNum:function (obj) {
		    for(var i in obj){
			    if(typeof obj[i] === "object"){
				    this.fixNum(obj[i]);
			    }else if(typeof obj[i] === "number"){
                    obj[i] = Math.round(obj[i]*100)/100;
                }
		    }
		    return obj;
	    }
    };

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
        if (!opt) return;
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
})();
