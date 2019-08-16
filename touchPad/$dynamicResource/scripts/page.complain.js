(function () {

    var self = (am.page.complain = new $.am.Page({
        id: "page_complain",
        backButtonOnclick: function () {
            am.goBackToInitPage();
        },
        data: {
            // 客服和销售人员
            servAndSaleList: [],
            // 查看详情的投诉ID
            sueId: '',
            // 图像URL
            imgUrl: "http://img.meiguanjia.net/admin/empavator/",
            // 默认图像
            defaultPhoto: "$dynamicResource/images/suedef.png",
            // 未选中图像
            unSelectedPng:"$dynamicResource/images/un_selected.png",
            // 选中图像
            selectedPng:"$dynamicResource/images/selected.png",
            // 关闭二维码
            closePng: "$dynamicResource/images/close_big.png",
            // 投诉客服成功消息
            alertSaleMsg: "我们的客服经理已经接到您的投诉信息，在24小时内（非工作日除外）将会联系您，请您保持电话畅通，多谢您对美管加的关注。",
            // 投诉销售成功消息
            alertServMsg: "我们的销售经理已经接到您的投诉信息，在24小时内（非工作日除外）将会联系您，请您保持电话畅通，多谢您对美管加的关注。",
            // 沟通中
            submittingPng: "$dynamicResource/images/info.png",
            // 已处理
            finishedPng: "$dynamicResource/images/info_gray.png",
        },
        init: function () {
            var self = this;
            this.$ = $("#page_complain");

            this.$complain = this.$.find(".complain");
            this.$complainContent = this.$.find(".content");
            // 投诉与我的投诉切换
            this.$subComplain = this.$complain.find(".sub_complain").vclick(function () {
                var $this = $(this)
                if (!$this.hasClass('active')) {
                    var index = self.$subComplain.index($this)
                    self.$subComplain.removeClass('active').eq(index).addClass('active')
                    self.$complainContent.removeClass('active').eq(index).addClass('active')
                }
            });
            this.$tab = this.$.find('.tab')
            this.$tabContent = this.$.find('.tab-content');
            // 投诉客服和投诉销售tab切换
            this.$tabItem = this.$tab.find('.tab-item').vclick(function () {
                var $this = $(this)
                if (!$this.hasClass('active')) {
                    var index = self.$tabItem.index($this)
                    self.$tabItem.removeClass('active').eq(index).addClass('active')
                    self.$tabContent.removeClass('active').eq(index).addClass('active')
                    self.data.sueobj = index == 0 ? 2 : 1;
                }
            });

            // 查看二维码
            $('#saleDiv').on('click','.codeBtn',function (event) {
                event.stopPropagation();
                $(this).fadeOut(500);
                $(this).siblings(".code_bid_box").fadeIn(500);
            });

            // 关闭二维码
            $('#saleDiv').on('click','.closeBtn',function (event) {
                event.stopPropagation();
                $(this).closest(".code_bid_box").siblings(".code_box").fadeIn(500);
                $(this).closest(".code_bid_box").fadeOut(500);
            });

            // 上传客服图片
            self.uploadImg('#selImg','#select_phot_box');

            // 输入手机号
            $(".input_phone_ser").keyup(function(){
                self.submitFunc();
            });

            // 输入投诉内容
            $('.input_complaints_des').keyup(function () {
                self.submitFunc();
            });

            // 选择勾选投诉人
            this.$tabContent.on('click','.selectedService',function(){
                self.$tabContent.find('.selectedService').each(function () {
                    $(this).find(".selected_img").attr("src",self.data.unSelectedPng).removeClass("selected");
                });
                $(this).find(".selected_img").attr("src",self.data.selectedPng).addClass("selected");
            });

            // 添加投诉
            this.$.find('.commit_complaints_service').vclick(function () {
                if (!$(this).hasClass('submit_btn')) {
                    am.msg("内容不完整！");
                    return;
                }
                // 投诉类型：1:投诉销售；2：投诉客服
                var sueobj = $('#servDiv').hasClass('active') ? 2 : 1;
                var img = '';
                // 被投诉人ID
                var bsueid = '';
                // 被投诉人姓名
                var bsuename = '';
                // 被投诉人手机号
                var bsuemobile = '';
                if(sueobj == 2){
                    img = $('#servDiv').find('[src="'+self.data.selectedPng+'"]');
                    if(!img || !img.get(0)){
                        am.msg("请选择投诉人！");
                        return false;
                    }
                    bsueid = img.attr('eid');
                    if(bsueid == -1){
                        // 其他
                        bsuename = $('#servDiv').find('.other_box').find('input').val();
                        if(am.isNull(bsuename) || am.isNull(bsuename.trim())){
                            am.msg("请填写客服的名字！");
                            return false;
                        }
                    }else{
                        bsuename = img.attr('ename');
                        bsuemobile = img.attr('emobile');
                    }
                }else if(sueobj == 1){
                    img = $('#saleDiv').find('[src="'+self.data.selectedPng+'"]');
                    if(!img || !img.get(0)){
                        am.msg("请选择投诉人！");
                        return false;
                    }
                    bsueid = img.attr('eid');
                    if(bsueid == -1){
                        // 其他
                        bsuename = $('#saleDiv').find('.other_box').find('input').val();
                        if(am.isNull(bsuename) || am.isNull(bsuename.trim())){
                            am.msg("请填写销售的名字！");
                            return false;
                        }
                    }else{
                        bsuename = img.attr('ename');
                        bsuemobile = img.attr('emobile');
                    }
                    bsueid = img.attr('eid');
                }else {
                    return;
                }

                // 投诉内容
                var content = $('.input_complaints_des').val();
                // 手机号
                var phoneNum = $('.input_phone_ser').val();
                // 图片
                var affiximg = '';
                var imgs = [];
                var imgList = $('#select_phot_box').find('img');
                if(!am.isNull(imgList) && imgList.length > 0){
                    imgList.each(function (i,e) {
                        imgs[i] = e.src;
                    })
                    affiximg = imgs.join(',');
                    console.info(imgs);
                }

                var opt = {
                    shopid:am.metadata.userInfo.shopId,
                    shopname:am.metadata.userInfo.shopName,
                    parentid:am.metadata.userInfo.realParentShopId, // 查询shopnum用
                    sueobj:sueobj,
                    bsueid:bsueid,
                    bsuename:bsuename,
                    bsuemobile:bsuemobile,
                    affiximg:affiximg,
                    content:content,
                    suemobile:phoneNum,
                    sueid:am.metadata.userInfo.userId,
                    suename:am.metadata.userInfo.userName,// 投诉人姓名
                };
                am.loading.show("正在获取,请稍候...");
                am.api.sueCreate.exec(opt,function (res) {
                    am.loading.hide();
                    if(!am.isNull(res) && res.code == 0){
                        self.getList();
                        self.cleanData();
                        if(sueobj == 1){
                            am.msg(self.data.alertSaleMsg);
                        }else if(sueobj == 2){
                            am.msg(self.data.alertServMsg);
                        }
                    }
                });
            });

            // 查看详情
            $('#sueList').on('click','.statu_img',function () {
                var id = $(this).data("id");
                self.getSueDetail(id);
                self.data.sueId = '';
                self.data.sueId = id;
            });

            // 关闭查看详情
            $(".delete_detail_btn").click(function(){
                $("#complainDetail").hide();
            });

            // 接受处理结果
            $('#complainDetail').on('click','.recognition_result',function () {
                self.updateSue(self.data.sueId);
            });

            // 删除上传的图片
            $('#select_phot_box').on('click','.delete_p',function () {
                $(this).closest(".select_phot_box").remove();
            });
        },

        cleanData: function () {
            $('.input_phone_ser').val('');
            $('.input_complaints_des').val('');
            $('#select_phot_box').empty();
            $('#saleDiv').find('.other_box').find('input').val('');
            $('#servDiv').find('.other_box').find('input').val('');
            $('.commit_complaints_service').removeClass("submit_btn");
        },
        beforeShow: function () {
            // 清空客服
            $('#servDiv').empty();
            // 清空销售
            $('#saleDiv').empty();
            // 清空列表
            $('#sueList').empty();
            // 清空未处理数量
            $('#sueSize').hide();
            // 清空查看详情
            $('#sueInfo').empty();
        },
        beforeHide: function () {},
        afterShow: function (data) {
            this.getData();
            this.getList();
        },
        afterHide: function () {},
        // 客服
        getServiDiv: function (data) {
            var img = data.avator ? self.data.imgUrl + data.avator : self.data.defaultPhoto;
            var html = '';
            html += '<div class="service_box selectedService">';
            html +=    '<div class="selected_btn">';
            html +=         '<img eid="'+data.id+'" ename="'+data.name+'" emobile="'+data.mobile+'"src="'+self.data.unSelectedPng+'" class="selected_img" />';
            html +=    '</div>';
            html +=    '<div class="service_image">';
            html +=         '<img src="'+img+'" class="service_img" />';
            html +=    '</div>';
            html +=    '<p class="service_name">'+data.name+'</p>';
            html += '</div>';
            return html;
        },
        // 销售
        getSaleDiv: function (data) {
            var img = data.avator ? self.data.imgUrl + data.avator : self.data.defaultPhoto;
            var html = '';
            html += '<div class="service_box service_sale_box selectedService">';
            html +=    '<div class="selected_btn">';
            html +=         '<img eid="'+data.id+'" ename="'+data.name+'" emobile="'+data.mobile+'"src="'+self.data.unSelectedPng+'" class="selected_img" />';
            html +=    '</div>';
            html +=    '<div class="service_image">';
            html +=         '<img src="'+img+'" class="service_img" />';
            html +=    '</div>';
            html +=    '<p class="service_name sales_name">'+data.name+'</p>';
            html +=    '<p class="service_phone">'+data.mobile+'</p>';

            if(data.qrcode != null && data.qrcode !=''){
                html +=    '<div class="code_box codeBtn">';
                html +=         '<i class="code_img iconfont icon-erweima"></i>';
                html +=    '</div>';
                html +=    '<div class="code_bid_box">';
                html +=         '<div class="big_code">';
                html +=             '<img src="'+self.data.imgUrl+data.qrcode+'" class="code_img" />';
                html +=         '</div>';
                html +=         '<p class="wechat_txt">扫码加TA微信</p>';
                html +=         '<img src="'+self.data.closePng+'" class="close_code closeBtn" />';
                html +=    '</div>';
            }
            html += '</div>';
            return html;
        },
        // 其它
        getOtherDiv: function(type){
            var div = '<div class="line"></div>';
            div += '<div class="other_box selectedService">';
            div +=      '<p class="select_service other_title">其他</p>';
            div +=      '<div class="selected_btn selected_other_btn">';
            div +=          '<img eid="-1" src="'+self.data.unSelectedPng+'" class="selected_img" />';
            div +=      '</div>';
            div +=      '<input type="text" class="other_service" placeholder="填写其他'+type+'名字" />';
            div += '</div>';
            return div;
        },
        // 获取销售和客服
        getData: function () {
            var self = this;
            am.loading.show("正在获取,请稍候...");
            var opt = {
                orgid: am.metadata.userInfo.orgId,
                id: am.metadata.userInfo.employeeId,
            };
            // 清空客服
            $('#servDiv').empty();
            // 清空销售
            $('#saleDiv').empty();
            am.api.sueData.exec(opt,function (res) {
                am.loading.hide();
                if(!am.isNull(res) && !am.isNull(res.content) && res.content.length> 0){
                    var data = res.content;
                    // 客服
                    var servHtml = '<p class="select_service warming-margin-top">选择您要投诉的客服</p>';
                        servHtml += '<div class="services_box servicesBox">';
                    // 直接销售
                    var saleHtml = '<div class="direct_sales">';
                        saleHtml += '<p class="select_service warming-margin-top">您的直接销售</p>';
                        saleHtml += '<div class="services_box servicesBox">';
                    // 该区域其他销售
                    var otherSaleHtml = '<div class="line"></div>';
                        otherSaleHtml += '<div class="direct_sales">';
                        otherSaleHtml +=    '<p class="select_service">该区域其他销售</p>';
                        otherSaleHtml +=    '<div class="services_box servicesBox">';
                    // 有无客服标识
                    var servFlag = false;
                    // 有无直接销售标识
                    var mySalFlag = false;
                    // 有无该区域其他销售标识
                    var otherSalFlag = false;
                    for(var i in data){
                        if(data[i].position == 2){
                            // 客服
                            servHtml += self.getServiDiv(data[i]);
                            servFlag = true;
                        }else if(data[i].id == opt.id){
                            // 直接销售
                            saleHtml += self.getSaleDiv(data[i]);
                            mySalFlag = true;
                        }else if(data[i].position==3 && data[i].id != opt.id){
                            // 该区域其他销售
                            otherSaleHtml += self.getSaleDiv(data[i]);
                            otherSalFlag = true;
                        }
                    }
                    servHtml += '</div>';

                    saleHtml +=     '</div>';
                    saleHtml +='</div>';

                    otherSaleHtml +=     '</div>';
                    otherSaleHtml +='</div>';
                    if(servFlag){
                        $('#servDiv').html(servHtml + self.getOtherDiv('客服'));
                    }else{
                        $('#servDiv').html(self.getOtherDiv('客服'));
                    }
                    if(mySalFlag && otherSalFlag){
                        $('#saleDiv').html(saleHtml + otherSaleHtml + self.getOtherDiv('销售'));
                    }else if(mySalFlag){
                        $('#saleDiv').html(saleHtml + self.getOtherDiv('销售'));
                    }else if(otherSalFlag){
                        $('#saleDiv').html(otherSaleHtml + self.getOtherDiv('销售'));
                    }else {
                        $('#saleDiv').html(self.getOtherDiv('销售'));
                    }

                    self.data.servAndSaleList = data;
                }
            });
        },
        // 获取我的投诉单
        getList: function () {
            am.loading.show("正在获取,请稍候...");
            var opt = {
                shopid: am.metadata.userInfo.shopId,
                sueid: am.metadata.userInfo.userId,
                startIndex: 0,
                endIndex: 50
            };
            // 清空列表
            $('#sueList').empty();
            am.api.sueQuery.exec(opt,function (res) {
                am.loading.hide();
                if(!am.isNull(res) && !am.isNull(res.content)){
                    var data = res.content;
                    var html = '';
                    for(var i in data){
                        var suetime = data[i].suetime;
                        var bsuename = (data[i].sueobj== 2 ? '客服-':'销售-') + data[i].bsuename;
                        var content = data[i].content;
                        var status = '';

                        if(data[i].state == 1){
                            status = '<span class="submitted">已提交</span>';
                        }else if(data[i].state == 2){
                            status = '<span class="submitting">沟通中</span><img src="'+self.data.submittingPng+'" data-id="'+data[i].id+'" class="statu_img" />';
                        }else if(data[i].state == 3){
                            status = '<span>已处理</span><img src="'+self.data.finishedPng+'" data-id="'+data[i].id+'" class="statu_img"/>';
                        }
                        html += '<tr>';
                        html += '<td>'+suetime+'</td>';
                        html += '<td>'+bsuename+'</td>';
                        html += '<td>'+content+'</td>';
                        html += '<td>'+status+'</td>';
                        html += '</tr>';
                    }
                    $('#sueList').html(html);
                }
            });
            self.getSueNum();

        },
        // 获取我的未处理的投诉单数量
        getSueNum: function () {
            am.loading.show("正在获取,请稍候...");
            var opt = {
                sueid: am.metadata.userInfo.userId,
            };
            // 清空未处理数量
            $('#sueSize').hide();
            am.api.sueCount.exec(opt,function (res) {
                am.loading.hide();
                if(res.code == 0 && !am.isNull(res.content) && Number(res.content) > 0){
                    $('#sueSize').text(res.content).show();
                }
            });
        },
        // 接受投诉处理结果
        updateSue: function (id) {
            am.loading.show("正在获取,请稍候...");
            var opt = {
                id: id,
            }
            am.api.sueUpdate.exec(opt,function (res) {
                am.loading.hide();
                if(!am.isNull(res) && res.code == 0){
                    self.getList();
                    // 更改处理详情
                    var html = self.zyDiv('','我',am.metadata.userInfo.userName,self.formatDate(),'认可处理结果');
                    $('#sueInfo').append(html);
                    $('#complainDetail').find('.recognition_result').hide();
                }
            });
        },
        mainList: function(data) {
            var html = '';
            html += '<div class="select_phot_box">' +
                '<i class="delete_p iconfont icon-guanbi4"></i>' +
                '<div class="select_phot">' +
                '<img src="' + data + '" class="add_image"/>' +
                '</div>' +
                '</div>';
            return html;
        },
        //上传图片
        uploadImg:function(uploadBtn,uploadBox){
            $(uploadBtn).change(function() {
                if(typeof(FileReader) != "undefined") {
                    var regex = /(.jpg|.jpeg|.gif|.png|.bmp)$/;
                    $($(this)[0].files).each(function() {
                        var file = $(this);
                        if(regex.test(file[0].name.toLowerCase())) {
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                var url = e.target.result;
                                if(am.isNull(url)){
                                    am.msg("上传失败，上传图片数据为空！");
                                    return ;
                                }
                                var name = Math.uuid()+".jpg";
                                var base64Data = '';
                                var arr = url.split('base64,');
                                if(!am.isNull(arr) && arr.length == 2){
                                    base64Data = arr[1];
                                }else {
                                    am.msg("上传失败，数据不合法！");
                                    return;
                                }

                                var opt = {
                                    dir: "complaint/",
                                    imageBase64: base64Data,
                                    name: name,
                                    realName: file[0].name,
                                    trim: true
                                };
                                amGloble.api.base64Upload.exec(opt, function(res) {
                                    if (res && res.code == 0) {
                                        name = config.filesMgr + opt.dir + name;
                                        var img = $("<img />");
                                        img.attr("src", name);
                                        var link_i = img.attr("src");
                                        $(uploadBox).html($(uploadBox).html() + self.mainList(link_i));
                                        $(uploadBox).show();
                                    }else{
                                        am.msg("图片上传失败！");
                                    }
                                }, true, 120000);
                            }
                            reader.readAsDataURL(file[0]);
                        } else {
                            am.msg(file[0].name + " is not a valid image file.");
                            return false;
                        }
                    });
                } else {
                    msg("This browser does not support HTML5 FileReader.");
                }
            });

        },
        // 验证是否可以提交
        submitFunc:function(){
            var phoneNum = $('.input_phone_ser').val();
            var content = $('.input_complaints_des').val();
            if(!phoneNum || !content || isNaN(phoneNum) || phoneNum.length != 11 || content.length < 10){
                $('.commit_complaints_service').removeClass("submit_btn");
            }else{
                $('.commit_complaints_service').addClass("submit_btn");
            }
        },
        // 查看详情
        getSueDetail: function (id) {
            am.loading.show("正在获取,请稍候...");
            var opt = {
                id: id,
            }
            $('#sueInfo').empty();
            am.api.sueInfo.exec(opt,function (res) {
                am.loading.hide();
                if(!am.isNull(res) && !am.isNull(res.content)){
                    $('#complainDetail').show();
                    $('#sueInfo').html(self.getSueInfoMyDiv(res.content));
                }
            });

        },
        // 我的投诉详情
        getSueInfoMyDiv: function (data) {
            // 投诉人名字
            var suename = data.suename;
            // 投诉时间
            var suetime = data.suetime;
            // 投诉内容
            var content = data.content;
            // 图片
            var imgDiv = '';
            if(!am.isNull(data.affiximg)){
                var imgs = data.affiximg.split(',') || [];
                if(!am.isNull(imgs) && imgs.length > 0){
                    for(var i in imgs){
                        imgDiv += '<div class="raise_complaints_image">';
                        imgDiv +=       '<a href="'+imgs[i]+'" target="_blank"><img src="'+imgs[i]+'" class="raise_img" /></a>';
                        imgDiv += '</div>';
                    }
                }
            }
            // 第一行：我
            var html = '<div class="complaints_detail_content">';
                html +=     '<div class="user_image_box">';
                html +=         '<span>我</span>';
                html +=     '</div>';
                html +=     '<div class="complaints_detail_box">';
                html +=         '<div class="user_info">';
                html +=             '<span class="sue_name">'+suename+'</span>';
                html +=             '<span>'+suetime+'</span>';
                html +=         '</div>';
                html +=         '<div class="raise_complaints">';
                html +=             '<span>'+content+'</span>';
                html +=         '</div>';
                html +=         '<div class="raise_complaints_images">';
                html +=             imgDiv;
                html +=         '</div>';
                html +=     '</div>';
                html +='</div>';
                html +='<div class="detail_line"></div>';

            // 第二行以后: 专员
            html += self.getSueInfoZyDiv(data);
            return html;
        },
        // 专员的处理详情
        getSueInfoZyDiv: function(data){
            var html = '';
            if(!am.isNull(data.receiver)){
                html += self.zyDiv('services_image','专员',data.receiver,data.rectime,'已经接单');
            }
            var plist = data.plist;
            if(!am.isNull(plist) && plist.length > 0){
                for(var i in plist){
                    var row = plist[i];
                    var prContent = row.content ? row.content : '';
                    if(am.isNull(prContent))
                    {
                        continue;
                    }
                    html += self.zyDiv(' services_image','专员',row.proname,row.createtime,prContent);
                }
            }
            if(data.state == 3){
                html += self.zyDiv('','我',data.suename,data.identitytime,'认可处理结果');
                $('#complainDetail').find('.recognition_result').hide();
            }else{
                $('#complainDetail').find('.recognition_result').show();
            }
            return html;
        },
        // 专员DIV
        zyDiv: function (zycss,type,suename,suetime,content) {
            var html = '';
            html += '<div class="complaints_detail_content">';
            html +=     '<div class="user_image_box '+zycss+'">';
            html +=         '<span>'+type+'</span>';
            html +=     '</div>';
            html +=     '<div class="complaints_detail_box zy_margin_top">';
            html +=         '<div class="user_info">';
            html +=             '<span class="sue_name">'+suename+'</span>';
            html +=             '<span>'+suetime+'</span>';
            html +=         '</div>';
            html +=         '<div class="raise_complaints">';
            html +=             '<span>'+content+'</span>';
            html +=         '</div>';
            html +=     '</div>';
            html +='</div>';
            html +='<div class="detail_line"></div>';
            return html;
        },
        // 格式化日期 yyyy-MM-dd HH:mm:ss
        formatDate: function (d) {
            var D=['00','01','02','03','04','05','06','07','08','09'];
            with (d || new Date) return [
                [getFullYear(), D[getMonth()+1]||getMonth()+1, D[getDate()]||getDate()].join('-'),
                [D[getHours()]||getHours(), D[getMinutes()]||getMinutes(), D[getSeconds()]||getSeconds()].join(':')
            ].join(' ');
        },

    }));
})();