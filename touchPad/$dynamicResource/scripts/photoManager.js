/*
上传作品

    amGloble.photoManager.takePhoto("goods", {
        parentShopId: 30000,
        //catigoryId: 1234,
        //authorId: 3333
    }, function() {
        console.log("succ");
    }, function() {
        console.log("fail");
    });

*/

(function() {

    var times = 0;

    var uploadPhotoBase64 = function(base64, opt, scb, fcb) {
        var self = this;
        // console.log(base64.length, opt, scb, fcb);
        amGloble.loading.show("正在上传,请稍候...");
        opt.name=(opt.name=="uuid"?(Math.uuid()+".jpg"):opt.name);
        amGloble.api.base64Upload.exec(opt, function(ret) {
            amGloble.loading.hide();
            times++;
            // console.log(ret);
            if (ret.code == 0) {
                scb && scb(opt.name);
                times = 0;
            } else {
                //self.msg("照片上传失败!");
                if (times > 1) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "照片上传失败",
                        description: "照片上传失败,是否重新上传?",
                        okCaption: "重试",
                        cancelCaption: "取消"
                    }, function() {
                        uploadPhotoBase64(base64, opt, scb, fcb);
                    }, function() {
                        times = 0;
                    });
                } else {
                    uploadPhotoBase64(base64, opt, scb, fcb);
                }
            }
        }, true, 120000);
    };
    // $p 照片图片容器
    // e true-编辑照片,false-新增照片
    var photoManager = {
        selectPhoto: function(type, itemData, scb, fcb, insertResolution) {
            this.getPicture(type, itemData, scb, fcb);
        },
        takePhoto: function(type, itemData, scb, fcb, insertResolution) {
            var self = this;
            var opt = imageConfig.getOptionObj(type, itemData);
            //$.am.debug.log("takePhoto: " + JSON.stringify(opt));
            // var trim = "";
            // if (opt.size && opt.size.length && opt.size.length == 2) {
            //     trim = opt.size[0] > opt.size[1] ? opt.size[0] : opt.size[1];
            // }

            // $.am.debug.log("imagePicker: " + trim);

            //为了解决安卓和ios容器实现的不一致，例如传入1024，安卓实现为1024px，ios实现为1024kb
            var trim = "350";
            if (window.device && window.device.platform == "Android") {
                trim = "1024";
            }
            navigator.appplugin.imagePicker("All", [
                opt.size
            ], "1", "jpg", trim, function(result) {
                delete opt.size;
                opt.imageBase64 = result;
                if (insertResolution) {
                    var $tempImg = $("<img />").attr("src", 'data:image/jpeg;base64,' + result);
                    var w = $tempImg[0].width;
                    var h = $tempImg[0].height;
                    var names = opt.name.split(".");
                    names[0] += "_" + w + "x" + h;
                    opt.name = names.join(".");
                }
                // console.log("w", w, "h", h);
                uploadPhotoBase64(result, opt, function(ret) {
                    scb && scb(ret);
                    // $.am.debug.log("uploadPhotoBase64: " + JSON.stringify(ret));
                    var usertype = 0,
                        userid;
                    switch (type) {
                        case 'artisan':
                            usertype = 2;
                            userid = itemData.employeeId;
                            break;
                        case 'manager':
                            usertype = 3;
                            userid = itemData.employeeId;
                            break;
                        case 'customer':
                            usertype = 1;
                            userid = itemData.customerId;
                            break;
                        default:

                    }
                    if (usertype > 0 && am.api.modifyPhotoUpdateTime) {
                        am.api.modifyPhotoUpdateTime.exec({
                            "usertype": usertype,
                            "userid": userid,
                            "lastName": amGloble.now().getTime() // 可选，默认时间戳
                        }, function(ret) {
                            $.am.debug.log("update time succ");
                        });
                    }
                }, fcb);
                //$.am.debug.log("base64 URI length:" + result.length);
            }, function(result) {
                // $.am.debug.log(msg);
                fcb && fcb(result);
            });
        },
        getPhotoUrl: function(type, itemData, filename, suffix) {
            if (itemData.updateTs) {
                return config.filesMgr + imageConfig.getImageUrl(type, itemData, filename, suffix) + "?ts=" + itemData.updateTs;
            } else {
                return config.filesMgr + imageConfig.getImageUrl(type, itemData, filename, suffix);
            }
        },
        createImage: function(type, itemData, filename, suffix,backupPath) {
            var $img = $('<img src="' + this.getPhotoUrl(type, itemData, filename, suffix) + '">').hide();
            $img.load(function() {
                // console.log("load");
                $img.show();
            }).error(function(){
                if(backupPath){
                    $img.attr('src',backupPath).load(function(){
                        $img.show();
                    });
                }
            });
            return $img;
        },
        uploadPhotoBase64: uploadPhotoBase64
    };

    am.photoManager = photoManager;

})();
