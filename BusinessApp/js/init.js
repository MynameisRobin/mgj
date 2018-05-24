
(function() {
    var mgjVersionTextMap = {
        "1": "盛传版",
        "2": "风尚版",
        "3": "尊享版",
        "4": "青春版",
    };

    window.amGloble = {
        page: {

        },
        popup: {

        },
        hash: {
            get: function(isSearch) {
                var str = isSearch ? location.search : location.hash;
                var kvs = str.substring(1).split("&");
                var ret = {};
                for (var i = 0; i < kvs.length; i++) {
                    var item = kvs[i].split("=");
                    if (item[1] == null) {
                        continue;
                    }
                    ret[item[0]] = item[1];
                }
                return ret;
            },
            set: function(data, isSearch) {
                location.href = "#" + $.param(data);
            },

            add: function(data) {
                this.set($.extend(this.get(), data));
            },
            remove: function(keys) {
                var data = this.get();
                for (var i = 0; i < keys.length; i++) {
                    delete data[keys[i]];
                }
                this.set(data);
            }
        },
        confirm: function(caption, description, okCaption, cancelCaption, scb, fcb) {
            atMobile.nativeUIWidget.confirm({
                caption: caption,
                description: description,
                okCaption: okCaption,
                cancelCaption: cancelCaption
            }, scb, fcb);
        },
        messageBox: function(caption, description, scb, fcb) {
            atMobile.nativeUIWidget.showMessageBox({
                title: caption,
                content: description
            }, scb, fcb);
        },
        msg: function(msg) {
            $.am.instanceMessage.show(msg);
        },
        loading: {
            setPos:function(top,right,bottom,left){
                $.am.modalLoading.$.find(">div").css({
                    top:top+"px",
                    right:right+"px",
                    bottom:bottom+"px",
                    left:left+"px"
                })
            },
            show: function(e, hiddenMode) {
                if (hiddenMode) {
                    $.am.modalLoadingHidden.show();
                } else {
                    $.am.modalLoading.show(e);
                }
            },
            hide: function(hiddenMode) {
                if (hiddenMode) {
                    $.am.modalLoadingHidden.hide();
                } else {
                    $.am.modalLoading.hide();
                }
            }
        },
        //amGloble.popupMenu("请选择客户级别", [{name:"普通用户"}, {name:"高级用户"}], function (ret) {_this.$level.find("p.text").text(ret.name);})
        popupMenu: function(title, items, cb, keyName) {
            var itemsText = [];
            for (var i = 0; i < items.length; i++) {
                itemsText.push(items[i][keyName || "name"]);
            }
            atMobile.nativeUIWidget.showPopupMenu({
                title: title,
                items: itemsText
            }, function(idx) {
                if (idx < items.length) {
                    cb && cb(items[idx]);
                }
            });
        },
        reMail: /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i,
        //手机，座机
        rePhone: /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
        reCellphone: /^0?(17[0-9]|13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/,
        //数组转换成map
        arr2obj: function(data) {
            var ret = {};
            $.each(data, function(i, item) {
                ret[item.configKey] = item.configValue;
            });
            return ret;
        },
        //时间转换成字符串
        time2str: function(publishTime) {
            var d_minutes,
                d_hours,
                d_days;
            var timeNow = parseInt(new Date().getTime() / 1000);
            var d;
            d = timeNow - publishTime;
            d_days = parseInt(d / 86400);
            d_hours = parseInt(d / 3600);
            d_minutes = parseInt(d / 60);
            if (d_days > 30) {
                return new Date(publishTime * 1000).format("yyyy-mm-dd");
            } else if (d_days > 0) {
                return d_days + "天前";
            } else if (d_days <= 0 && d_hours > 0) {
                return d_hours + "小时前";
            } else if (d_hours <= 0 && d_minutes > 0) {
                return d_minutes + "分钟前";
            } else {
                return "刚刚";
            }
        },
        now: function() {
            return new Date();
        },
        //来消息后设置红点
        setMessageDot: function(i) {
            if (i == 0) {
                this.page.dashboard.$user.removeClass("dot");
            } else {
                this.page.dashboard.$user.addClass("dot");
            }
        },
        //数组去重
        dedup: function(array, key) {
            var temp = {},
                ret = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i],
                    deKey;
                if (key) {
                    deKey = item[key];
                } else {
                    deKey = item;
                }
                temp[deKey] = item;
            }
            for (var i in temp) {
                if (temp.hasOwnProperty(i)) {
                    ret.push(temp[i]);
                }
            }
            return ret;
        },
        //分组
        groupBy: function(array, key) {
            var temp = {},
                ret = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i],
                    deKey;
                if (key) {
                    deKey = item[key];
                } else {
                    deKey = item;
                }
                if (!temp[deKey]) {
                    temp[deKey] = [];
                }
                temp[deKey].push(item);
            }
            for (var i in temp) {
                if (temp.hasOwnProperty(i)) {
                    var item = {};
                    item[key] = i;
                    item[data] = temp[i];
                }
            }
            return ret;
        },
        //处理角色数据
        getNewRole: function(metadata) {
            //处理metadata的role, 按小到大排序
            var roles = metadata.employeeRoles;
            if (roles && roles.length) {
                roles.sort(function(a, b) {
                    return a.id > b.id ? 1 : -1;
                })
            }

            // newRole 1操作员 2管理员 3老板 4第一工位员工 5第二工位员工 6第三工位员工
            // shopType 0总店 1单店 2直营 3附属
            // userType 0管理者 1员工
            // role 1操作员 2管理员 3老板 如果是员工则返回真实的role id


            var userInfo = metadata.userInfo;
            var userType = userInfo.userType;
            var shopType = userInfo.shopType;
            var role = userInfo.role;
            var ret = 0;

            if (userType == 1) {
                //员工
                for (var i = 0; i < roles.length; i++) {
                    var item = roles[i];
                    if (item.id == userInfo.role) {
                        ret = i + 4
                        break;
                    }
                }
            } else {
                //管理者
                if (role == 3 && (shopType == 2 || shopType == 3)) {
                    //如果是直属店或者附属店的老板，则角色是管理员
                    ret = 2;
                } else {
                    //否则老板仍然是老板
                    ret = role;
                }
            }
            return ret;
        },
        getStoresById: function(id) {
            var ret = this.metadata.shops.filter(function(item) {
                return item.shopId == id;
            });
            return ret[0] || {
                shopName: "其它门店",
                shopFullName: "其它门店",
                shopId: -1
            };
        },
        //将数组中某个属性组成新的数组
        getKeyArr: function(jsonArray, key, forceArray, addQuote) {
            var ret = [];
            for (var i = 0; i < jsonArray.length; i++) {
                var item = jsonArray[i];
                if (addQuote) {
                    ret.push("'" + item[key] + "'");
                } else {
                    ret.push(item[key]);
                }
            }
            if (!forceArray && ret.length == 1) {
                return ret[0];
            } else {
                return ret;
            }
        },
        //处理很长的小数尾数的问题
        cashierRound: function(val, kept) {
            if (kept) {
                return Math.round(val * kept) / kept;
            }
            return Math.round(val * 100) / 100;
        },
        //处理metadata，启动时处理
        processMetadata: function(metadata) {
            //如果是员工，则需要去掉其他部门的角色
            if (metadata.userInfo.userType == 1) {
                metadata.employeeRoles = metadata.employeeRoles.filter(function(item, i) {
                    return item.depcode == metadata.userInfo.depcode;
                });
            }


            metadata.userInfo.newRole = amGloble.getNewRole(metadata);

            //店名合并+店名拼音+店名临时分组
            var shopsGroupByPinyin = {};
            for (var i = 0; i < metadata.shops.length; i++) {
                var item = metadata.shops[i];
                // item.shopFullName = item.shopName + (item.osName || "");
                item.shopFullName = (item.osName==' ' || item.osName=='' || item.osName==null)?((item.shopName==' ' || item.shopName=='' || item.shopName==null)?'门店名称未设定':item.shopName):item.osName;
                item.pinyin = codefans_net_CC2PY(item.shopFullName);
                var py = item.pinyin.substr(0, 1).toUpperCase() || "#";
                if (shopsGroupByPinyin[py]) {
                    shopsGroupByPinyin[py].push(item);
                } else {
                    shopsGroupByPinyin[py] = [item];
                }
            }
            //存入数组分组
            metadata.shopsGroupByPinyin = [];
            for (var key in shopsGroupByPinyin) {
                if (shopsGroupByPinyin.hasOwnProperty(key)) {
                    metadata.shopsGroupByPinyin.push({
                        key: key,
                        shops: shopsGroupByPinyin[key]
                    });
                }
            }
            //分组排序
            metadata.shopsGroupByPinyin.sort(function(a, b) {
                return a.key.charCodeAt(0) > b.key.charCodeAt(0) ? 1 : -1;
            });

            var allShopsByPinyin = {};
            if(metadata.allShops){
                for (var i = 0; i < metadata.allShops.length; i++) {
                    var item = metadata.allShops[i];
                    if(item.mgjversion!=1){
                        // item.shopFullName = item.shopName + (item.osName || "");
                        item.shopFullName = (item.osName==' ' || item.osName=='' || item.osName==null)?((item.shopName==' ' || item.shopName=='' || item.shopName==null)?'门店名称未设定':item.shopName):item.osName;
                        item.pinyin = codefans_net_CC2PY(item.shopFullName || '');
                        var py = item.pinyin.substr(0, 1).toUpperCase() || "#";
                        if (allShopsByPinyin[py]) {
                            allShopsByPinyin[py].push(item);
                        } else {
                            allShopsByPinyin[py] = [item];
                        }
                    }
                }
            }
            metadata.allShopsByPinyin = [];
            for (var key in allShopsByPinyin) {
                if (allShopsByPinyin.hasOwnProperty(key)) {
                    metadata.allShopsByPinyin.push({
                        key: key,
                        shops: allShopsByPinyin[key]
                    });
                }
            }
            metadata.allShopsByPinyin.sort(function(a, b) {
                return a.key.charCodeAt(0) > b.key.charCodeAt(0) ? 1 : -1;
            });


            //处理configs
            metadata.configs = amGloble.arr2obj(metadata.configs);

            //处理权限
            var findKey = function(array, value) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] == value) {
                        return true;
                    }
                }
                return false;
            }
            metadata.permissions = {};
            var role = metadata.userInfo.newRole;
            var syb_allowphone = metadata.configs.syb_allowphone ? JSON.parse(metadata.configs.syb_allowphone) : [];
            metadata.permissions.allowphone = findKey(syb_allowphone, role);
            var syb_allowcard = metadata.configs.syb_allowcard ? JSON.parse(metadata.configs.syb_allowcard) : [];
            metadata.permissions.allowcard = findKey(syb_allowcard, role);

            amGloble.page.login.saveConfig({
                v4_tenantLogo: metadata.configs.v4_tenantLogo,
                phone: metadata.userInfo.mobile
            });

            //处理版本名字
            metadata.userInfo.mgjVersionText = mgjVersionTextMap[metadata.userInfo.mgjVersion];

            if(metadata.userInfo.userType==1 && metadata.userInfo.mgjVersion==1){
                //盛传版员工强制不显示业绩
                metadata.configs.hiddenPerformanceAmount = 'true';
            }

            this.renderTenantLogo();


	        if(metadata.configs.hideEducation === "true" && metadata.userInfo.password!=null){
	            $("div.tab-main").hide();
	        }

	        if(window.defaultConfig && !window.MGJ_systip_jsonp_callback){
		        var tag = document.createElement('script');
		        tag.src = 'http://socket.meiguanjia.net:8038/data.js?ts='+new Date().getTime();
		        document.body.appendChild(tag);

		        window.MGJ_systip_jsonp_callback = function(data){
			        if(data && data.appPopLink){
				        var link = data.appPopLink.replace('${phone}',metadata.userInfo.mobile);
				        link = link.replace('${shopname}',metadata.userInfo.shopName);
				        link = link.replace('${shopid}',metadata.userInfo.shopId);
				        window.open(link, '_blank', 'location=no');
			        }
		        };
	        }

            return metadata;
        },
        renderTenantLogo: function() {

            //绘制租户logo
            if (config.v4_tenantLogo) {
                $(".v4_tenantLogo").each(function() {
                    $(this).html(amGloble.photoManager.createImage("tenantLogo", {
                        parentShopId: config.parentShopId
                    }, config.v4_tenantLogo));
                });
            }
        },
        checkVersion: function(forcePopup) {
            if (forcePopup || amGloble.metadata.userInfo.mgjVersion != 3) {
                this.confirm("请升级", '您购买的是美管加' + amGloble.metadata.userInfo.mgjVersionText + '，此功能暂不可使用，如需升级请点击下方按钮联系销售', "联系销售", "暂不升级", function() {
                    // $.am.debug.log("confirm");
                    setTimeout(function() {
                        window.open('http://m.reeli.cn/index.html#tenantId=24400&view=5', '_blank', 'location=no');
                    }, 100);
                }, function() {

                });
                return true;
            }
            return false;
        },
        share: function(opt) {
            var text = opt.title || opt.desc,
                photo = opt.imgUrl,
                url = opt.link,
                scb = opt.success,
                fcb = opt.fail,
                wxTimeline = opt.wxTimeline;

            if (!photo) {
                photo = "";
            }

            var str = "text: \n" + text + "\n\nphoto: \n" + photo + "\n\nurl: \n" + url;
            console.log(str);

            atMobile.social.shareTo(text, text, photo, url, function(ret) {
                amGloble.msg("分享成功!");
                scb && scb(ret);
            }, function(ret) {
                amGloble.msg("分享失败!");
                fcb && fcb(ret);
            }, wxTimeline);
        },
        shareText:function(opt){
            var text = opt.text,
                scb = opt.success,
                fcb = opt.fail;

            atMobile.social.shareText(text, function(ret) {
                amGloble.msg("分享成功!");
                scb && scb(ret);
            }, function(ret) {
                amGloble.msg("分享失败!");
                fcb && fcb(ret);
            });
        },
        pswp: function(items, index) {
            var pswpElement = $("#pswp_dom")[0];
            var options = {
                tapToClose: true,
                shareEl: false,
                index: index || 0
            };
            this.gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            this.gallery.init();
        },
        rotate: function(lanscape, callback) {
            if (lanscape) {
                navigator.appplugin.rotateToLandscape();
            } else {
                navigator.appplugin.rotateToPortrait();
            }
            setTimeout(function() {
                if($.am.checkScroll(true)>=11){
                    $("body").height(window.innerHeight + 20);
                }else{
                    $("body").height(window.innerHeight);
                }
                $.am.getActivePage().refresh();
                $.am.checkScroll();
                callback && callback();
            }, 100);
        }
    };

    $(function() {
        // $.am.debug.enable = true;

    });

    $.am.init = function() {
        $.getJSON("Info.txt", function(ret) {
            $.am.debug.log(JSON.stringify(ret));
        });
        $.am.debug.log("设备device: " + JSON.stringify(device));
        $.am.debug.log(JSON.stringify(defaultConfig));
        //
        // $.am.changePage(amGloble.page.customerClockAdd);
        // return;
        //获取容器相关信息
        amGloble.renderTenantLogo();
        atMobile.getMetadata({}, function(ret, error) {
            $.am.debug.log("设备meta: " + JSON.stringify(ret));
            $.am.debug.log("pushToken: " + ret.token);
            config.pushToken = ret.token;


            var hash = amGloble.hash.get();

            if (config.token) {
                if (hash.type == "logout") {
                    //如果强制登出
                    amGloble.hash.remove(["type"]);
	                $.am.changePage(amGloble.page.education);
                } else {
                    amGloble.page.login.getMetadata(function() {
	                    if(amGloble.metadata.configs.hideEducation === "true"){
		                    $.am.changePage(amGloble.page.dashboard);
	                    }else{
		                    $.am.changePage(amGloble.page.education);
                        }
                    },function () {
	                    $.am.changePage(amGloble.page.education);
                    });
                }
            } else {
                //如果没有userinfo和toke，则登录
	            $.am.changePage(amGloble.page.education);
        }

        });

        //$.am.changePage(amGloble.page.organizationList);
    };

})();
