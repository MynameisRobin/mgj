/**
 * @param 项目设置图片
 * @author robin
 */
am.setItemImg = {
    init: function() {
        var self = this;
        this.$ = $("#setImgModal");
        this.pageIndex = 0;
        this.pageSize = 18;
        this.flag = false;
        this.getData(); //获取图片
        this.pager = new $.am.Paging({
            $: self.$.find(".footcontent"),
            showNum: self.pageSize, //每页显示的条数
            total: 10, //总数
            action: function(_this, index) {
                if (self.pageIndex == index) return;
                self.pageIndex = index;
                self.getData(); //获取图片
            }
        });
        this.$.find(".modal-content").on("vclick", ".imgUl li", function() {
            $(this)
                .addClass("active")
                .siblings()
                .removeClass("active");
        });
        this.$.find(".tabUl li").vclick(function() {
            self.pageIndex = 0;
            $(this)
                .addClass("active")
                .siblings()
                .removeClass("active");
            self.getData();
        });
        this.$.find(".save").vclick(function() {
            var d = self.$.find(".modal-content ul li.active").data();
            self.getImg(d, self.data, function(url) {
                self.cb && self.cb(url);
            });
        });
        this.$.find(".cancel,.close").vclick(function() {
            self.hide();
        });
    },
    getImg: function(d, data, cb) {
        var self = this;
        if (!d.filename) {
            return am.msg("请选择图片");
        }
        am.loading.show();
        var url=d.type+"/"+d.name+"/"+d.filename;
        self.editImg(url, data);
        cb && cb(url);
        // am.api.copyPhoto.exec(
        //     {
        //         type: "项目图片",
        //         name: d.name,
        //         fileName: d.filename,
        //         shopId: am.metadata.userInfo.parentShopId
        //     },
        //     function(res) {
        //         am.loading.hide();
        //         if (res.code == 0 && res.content) {
        //             self.editImg(res.content, data);
        //             cb && cb(res.content);
        //         } else {
        //             am.msg("图片获取失败");
        //         }
        //     }
        // );
    },
    getServiceSetLogo: function(id, serviceSetLogo) {
        var classes = am.metadata.classes;
        for (var i = 0; i < classes.length; i++) {
            for (var j = 0; j < classes[i].sub.length; j++) {
                if (classes[i].sub[j].id == id) {
                    // classes[i].sub[j].mgjservicesetlogo = serviceSetLogo + ".jpg";
                    classes[i].sub[j].mgjservicesetlogo = serviceSetLogo ;
                }
            }
        }
    },
    editImg: function(serviceSetLogo, data) {
        var self = this;
        // am.metadata.serviceCodeMap.mgjservicesetlogo = serviceSetLogo + ".jpg";
        self.getServiceSetLogo(data.id, serviceSetLogo);
        am.loading.show();
        am.api.serviceItemPicSet.exec(
            {
                id: data.id,
                serviceSetLogo: serviceSetLogo 
                // serviceSetLogo: serviceSetLogo + ".jpg"
            },
            function(res) {
                am.loading.hide();
                if (res && res.code == 0) {
                    am.msg("图片更换成功");
                    self.hide();
                } else if (res && res.code == -1) {
                    am.msg(res.message || "数据提交失败");
                }
            }
        );
    },
    getData: function() {
        var self = this;
        var name = this.$.find(".tabUl li.active").text();
        am.loading.show();
        am.api.getFiles.exec(
            {
                type: "项目图片",
                name: name,
                pageNumber: self.pageIndex + 1,
                pageSize: self.pageSize,
                parentShopId: am.metadata.userInfo.parentShopId
            },
            function(res) {
                am.loading.hide();
                if (res && res.code == 0) {
                    var li = "";
                    if(res.content.data && res.content.data.length){
                        $.each(res.content.data, function(i, v) {
                            li +=
                                "<li class='am-clickable' data-filename='" +
                                v.name +
                                "' data-type='项目图片' data-name='" +
                                name +
                                "'>" +
                                "<img src='" +
                                config.filesMgr +
                                "photo/" +
                                "项目图片/" +
                                name +
                                "/" +
                                v.name.split(".")[0] +
                                "_s." +
                                v.name.split(".")[1] +
                                // v.name.replace(".jpg","_s.jpg") +
                                "'>" +
                                "</li>";
                        });
                    }

                    self.$.find(".modal-content ul.imgUl").html(li);
                    self.pager.refresh(self.pageIndex, res.content.total);
                }
            }
        );
    },
    show: function(data, cb) {
        this.cb = cb;
        this.data = data;
        if (!this.flag) {
            this.init();
            this.flag = true;
        }
        this.$.show();
    },
    hide: function() {
        this.$.hide();
    },
    refresh: function(data, list) {
        this.$ul.empty();
        if (list && list.length) {
            $.each(list, function(i, v) {
                console.log(v);
            });
        }
    }
};
