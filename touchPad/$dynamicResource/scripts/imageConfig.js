/*
获取商城图片配置
imageConfig.getOptionObj("mall", {
    parentShopId: 30000
});

获取作品图片配置
imageConfig.getOptionObj("invention", {
    parentShopId: 30000,
    catigoryId: 1234,
    authorId: 3333
});

获取员工图片配置
imageConfig.getOptionObj("employee", {
    parentShopId: 30000,
    employeeId: 1234
});


获取作品图片URL
imageConfig.getImageUrl("invention", {
    parentShopId: 30000,
    catigoryId: 1234,
    authorId: 3333
}, "uuid.jpg", "l");

*/


//uuid生成器
(function() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    Math.uuid = function(len, radix) {
        var chars = CHARS,
            uuid = [],
            i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
    // by minimizing calls to random()
    Math.uuidFast = function() {
        var chars = CHARS,
            uuid = new Array(36),
            rnd = 0,
            r;
        for (var i = 0; i < 36; i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                uuid[i] = '-';
            } else if (i == 14) {
                uuid[i] = '4';
            } else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };

    // A more compact, but less performant, RFC4122v4 solution:
    Math.uuidCompact = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
})();


(function() {


    var replaceHtml = function(html, obj) {
        for (var variable in obj) {
            if (obj.hasOwnProperty(variable)) {
                html = html.replace("%" + variable + "%", obj[variable]);
            }
        }
        return html;
    };
    var processType = function(filepath, type) {
        type = $.trim(type);
        if (filepath && type) {
            var tempArr = filepath.split(".");
            if (tempArr.length >= 2) {
                tempArr[tempArr.length - 2] += ("_" + type);
                return tempArr.join(".");
            } else {
                return filepath + "_" + type;
            }
        } else {
            return filepath;
        }
        return false;
    };


    var imgtype = {
        "card": {
            "dir": "card/%parentShopId%/",
            "size": [1248, 780],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1248x780"
            }, {
                "suffix": "m",
                "resolution": "832x520"
            }, {
                "suffix": "s",
                "resolution": "416x260"
            }]
        },
        "service": {
            "dir": "service/%parentShopId%/",
            "size": [1024, 1024],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "serviceUcloud": {
            "dir": "photo/",
            "size": [1024, 1024],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "goods": {
            "dir": "goods/%parentShopId%/",
            "size": [1024, 1024],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "mall": {
            "dir": "mall/%parentShopId%/",
            "size": [1024, 1024],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "cert": {
            "dir": "cert/%parentShopId%/",
            "size": [0],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "artisan": {
            "dir": "artisan/%parentShopId%/",
            "size": [1024, 1024],
            "name": "%employeeId%.jpg",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "manager": {
            "dir": "manager/%parentShopId%/",
            "size": [1024, 1024],
            "name": "%employeeId%.jpg",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "customer": {
            "dir": "customer/%parentShopId%/",
            "size": [1024, 1024],
            "name": "%customerId%.jpg",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "shop": {
            "dir": "shop/%parentShopId%/",
            "size": [1024, 1024],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "show": {
            "dir": "show/s%catigoryId%/%parentShopId%/%authorId%/",
            "size": [2048, 2048],
            "variations": [{
                "suffix": "l",
                "resolution": "2048x2048"
            }, {
                "suffix": "m",
                "resolution": "1024x1024"
            }, {
                "suffix": "s",
                "resolution": "512x512"
            }]
        },
        "customerFile": {
            "dir": "customerFile/%parentShopId%/",
            "size": [2048, 2048],
            "variations": [{
                "suffix": "l",
                "resolution": "2048x2048"
            }, {
                "suffix": "m",
                "resolution": "1024x1024"
            }, {
                "suffix": "s",
                "resolution": "512x512"
            }]
        },
        "tenantLogo": {
            "dir": "tenant/%parentShopId%/",
            "size": [256, 256],
            "name": "uuid",
            "variations": []
        },
        "mykHome": {
            "dir": "tenant/%parentShopId%/",
            "size": [640, 300],
            "name": "uuid",
            "variations": []
        },
        "mykMe": {
            "dir": "tenant/%parentShopId%/",
            "size": [640, 393],
            "name": "uuid",
            "variations": []
        },
        "mykMall": {
            "dir": "tenant/%parentShopId%/",
            "size": [640, 270],
            "name": "uuid",
            "variations": []
        },
        "signature": {
            "dir": "signature/member/%parentShopId%/",
            "name": "%customerId%.png",
            "variations": []
        },
        "billSignature": {
            "dir": "signature/bill/%parentShopId%/%shopId%/",
            "name": "%billId%.jpg",
            "variations": []
        },
        "voucher": {
            "dir": "voucher/%parentShopId%/",
            "size": [1024, 1024],
            "name": "uuid",
            "variations": [{
                "suffix": "l",
                "resolution": "1024x1024"
            }, {
                "suffix": "m",
                "resolution": "512x512"
            }, {
                "suffix": "s",
                "resolution": "256x256"
            }]
        },
        "cashMachImage" : {
            "dir": "10005/appconfig/",
            "size": [640,426],
            "name": "uuid",
            "variations": []
        }
    };

    var imageConfig = window.imageConfig = {
        //根据实体获取实体的图片配置
        //type图片类型 itemData实体数据
        getOptionObj: function(type, itemData) {
            var opt = imgtype[type];
            if (opt) {
                var ret = $.extend(true, {
                    "trim": true,
                    "realName": "1.jpg"
                }, opt);
                ret.dir = replaceHtml(ret.dir, itemData);
                if (!/^[^%]*$/.test(ret.dir)) {
                    //参数不足则报错
                    throw "参数不足!"
                }
                if (ret.name) {
                    //如果文件名指定
                    ret.name = replaceHtml(ret.name, itemData);
                    if (!/^[^%]*$/.test(ret.name)) {
                        throw "参数不足!"
                    }
                    if (ret.name == "uuid") { //暂时兼容 待修改
                        ret.name = Math.uuid() + ".jpg";
                    }
                } else {
                    //如果文件名未指定
                    ret.name = Math.uuid() + ".jpg";
                }
                return ret;
            } else {
                throw "错误的图片类型!"
            }

        },
        //根据实体获取实体的图片URL
        //type图片类型 itemData实体数据 filename实体的图片名 suffix要获取的后缀
        getImageUrl: function(type, itemData, filename, suffix) {
            // if (!filename) {
            //     throw "缺少文件名参数!";
            // }
            var opt = imgtype[type];
            if (opt) {
                var ret = replaceHtml(opt.dir, itemData);
                if (!/^[^%]*$/.test(ret)) {
                    //参数不足则报错
                    throw "参数不足!"
                }
                return processType(ret + filename, suffix);
            } else {
                throw "错误的图片类型!";
            }
        }
    };


})();
