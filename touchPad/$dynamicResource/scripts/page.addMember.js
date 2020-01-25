(function () {
    var self = am.page.addMember = new $.am.Page({
		id: "page_addMember",
        backButtonOnclick: function () {
            if (this.$uploadMemberImg.is(':visible')) {
                if (self.uploadMemberImgCallback) self.uploadMemberImgCallback();
            } else {
                if (this.$data && this.$data.defultInfo) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "消费即会员",
                        description: "返回将创建“大众点评会员”，确认要返回吗？",
                        okCaption: "补全资料",
                        cancelCaption: "返回"
                    }, function () {
                    }, function () {
                        $("input.uesrname").val("大众点评会员");
                        $("textarea.page_textarea").val("大众点评会员");
                        self.$.find('.footbutton').trigger('vclick');
                    });
                } else {
                    var arr = [];
                    for (var i = 0; i < $.am.history.length; i++) {
                        if ($.am.history[i].id != 'page_addMember' && $.am.history[i].id != 'page_searchMember') {
                            arr.push($.am.history[i]);
                        }
                    }
                    $.am.history = arr;
                    $.am.page.back("slidedown");
                }
            }
            this.$.find("input,textarea").attr("disabled", true).attr("isdisabled", 1);
        },
        init: function () {
            // this.mainScroll = new $.am.ScrollView({
            //     $wrap : this.$.find(".addMember_box"),
            //     $inner : this.$.find(".addMember_box .body-inner"),
            //     direction : [false, true],
            //     hasInput: false
			// });
			this.$sourceScroll = new $.am.ScrollView({
                $wrap : this.$.find(".addMember_box .changesource-wrapper"),
                $inner : this.$.find(".addMember_box .changesource-wrapper .changesource"),
                direction : [false, true],
                hasInput: false
            });

            this.$uesrname = this.$.find('.uesrname').blur(function () {
                $(this).val($(this).val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, ''))
                $('body').removeClass('fixTop');
            }).focus(function(){
                if(device2.android()){
                    $('body').addClass('fixTop');
                }
            });

            this.$page_textarea = this.$.find('.page_textarea').blur(function () {
                $('body').removeClass('fixBottom');
            }).focus(function(){
                if(device2.android()){
                    $('body').addClass('fixBottom');
                }
            });

            this.$input = this.$.find(".addMember_list .addphone");

            this.$.find(".addphone").on("vclick", function () {
                //self.$.find(".addMember_list .uesrname,.addMember_list .page_textarea").blur().attr("readonly","readonly");
                var position = self.$input.offset();
                var height = self.$input.height();
                //self.$input.val("");
                self.signaturePad.off();
                am.keyboard.show({
                    title: "请输入数字",//可不传
                    hidedot: true,
                    submit: function (value) {
                        if (value.toString().length > 11) {
                            value = value.substring(0, 11);
                        }
                        var value = value.replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g, '');
                        self.$input.val(value);
                        if (value){
                            if(amGloble.metadata.userInfo.operatestr.indexOf('MGJR,') == -1){
                                if(value.toString().length==11){
                                    self.$.find(".cm_mobile_phone .tips").removeClass('show');
                                    self.$.find(".cm_mobile_phone .addphone").removeClass('warn');
                                    self.checkPhone(value);
                                }else{
                                    self.$.find(".cm_mobile_phone .tips").addClass('show').text("请输入11位正确的手机号");
                                    self.$.find(".cm_mobile_phone .addphone").addClass('warn');
                                }
                            }else{
                                self.checkPhone(value);
                            }
                        }else{
                            self.$.find(".cm_mobile_phone .tips").removeClass('show');
                            self.$.find(".cm_mobile_phone .addphone").removeClass('warn');
                        }
                        // setTimeout(function(){
                        // 	self.$.find(".addMember_list .uesrname,.addMember_list .page_textarea").removeAttr("readonly");
                        // },500);

                        // setTimeout(function(){
                        // 	if(self.paras && self.paras.hasOwnProperty("userInfo")){
                        // 		if( amGloble.metadata.userInfo.operatestr.indexOf('Y,') == -1 ){
                        // 			//您没有权限修改会员备注
                        // 			self.$.find("textarea").attr("disabled",true).attr("isdisabled",1).attr("readonly","readonly");
                        // 		}
                        // 	}
                        // },50);
                    },
                    hidecb: function () {
                        // setTimeout(function(){
                        // 	if(self.paras && self.paras.hasOwnProperty("userInfo")){
                        // 		if( amGloble.metadata.userInfo.operatestr.indexOf('Y,') == -1 ){
                        // 			//您没有权限修改会员备注
                        // 			self.$.find("textarea").attr("disabled",true).attr("isdisabled",1).attr("readonly","readonly");
                        // 		}
                        // 	}
                        // },50);
                        self.signaturePad.on();
                    }
                });
            });

			/*  添加生日  */
			this.$birthday=this.$.find(".changeBirthday").val("");
			this.$selectBirthday=this.$.find(".selectBirthday");
			this.$birthday.mobiscroll().date({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    //months: "auto",
			    setOnDayTap: true,
			    dateFormat: 'mm-dd',
			    onSet: function(valueText, inst) {
			        console.log(valueText);
				}
			});
			this.$selectBirthday.on("vclick","li",function(){
				$(this).addClass("selected").siblings().removeClass("selected");
			});
			/*end*/

            //推荐人
            this.$introducer = this.$.find('.introducer').on('vclick', '.addintroducer', function () {
                $.am.changePage(am.page.searchMember, "slideup", {
                    addintroducer: 1,
                    onSelect: function (item) {
                        $.am.changePage(am.page.addMember, "slidedown", $.extend(self.paras, {
                            introducer: item,
                        }));
                    }
                });
            });

            this.$.on("vclick", ".addMember_box .input_clear", function () {
                self.$.find(".addphone").val("");
                self.$.find(".cm_mobile_phone .tips").removeClass('show');
                self.$.find(".cm_mobile_phone .addphone").removeClass('warn');
            }).on("vclick", ".changesource .changebox", function () {
                $(this).addClass("selected").siblings().removeClass("selected");
                var sourceId = $(this).find('.change_words').attr('data-val');
                if (sourceId == 3) {
                    self.$introducer.show();
                } else {
                    self.$introducer.hide();
                }
            }).on("vclick", ".sexbox>span", function () {
                $(this).addClass("selected").siblings().removeClass("selected");
            }).on("vclick", ".footbutton", function () {
                var thisDom = $(this);
         
                //禁用按钮2500ms 防止重复提交
                thisDom.addClass('am-disabled');
                clearTimeout(time);
                var time = null;
                if(!time){
                    time = setTimeout(function(){
                        thisDom.removeClass('am-disabled');
                    }, 2500);
                }
         
                self.$.find("textarea").blur();
                var data = self.getValue();
                if (data) {
                    if (self.$.find(".cm_mobile_phone .tips").hasClass('show')) {
                        if (!self.mbRepeatConfig) {
                            self.$addPhone.val('');
                            am.msg('手机号码已经被使用，请换一个输入!');
                            return;
                        } else {
                            am.confirm("手机号重复", "手机号码已经被使用，确认用此手机号码新建会员吗？", "确定", "取消", function () {
                                self.setData(data);
                            }, function () {

                            });
                        }
                    } else {
                        self.setData(data);
                    }
                }
            
            });
            this.submit = "createMember";

            this.$.find('.cm_updateImg .img').vclick(function () {
                self.takePhoto(self.$data.userInfo.id, function () {
                    am.loading.show("请稍候...");
                    am.api.updatelastphototime.exec({
                        "memId": self.$data.userInfo.id,
                    }, function (res) {
                        setTimeout(function () {
                            am.loading.hide();
                            var $img = am.photoManager.createImage("customer", {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: new Date().getTime() //self.$data.userInfo.lastphotoupdatetime || ""
                            }, self.$data.userInfo.id + ".jpg", "s",self.$data.userInfo.photopath||'');
                            self.$.find('.cm_updateImg .img').html($img);
                        }, 1000);
                    });
                });
            });

            this.$uploadMemberImg = this.$.find('.uploadMemberImg');
            this.$uploadMemberImg.find('.img').vclick(function () {
                self.takePhoto(self.uploadMemberImgData.id, function () {
                    am.loading.show("请稍候...");
                    am.api.updatelastphototime.exec({
                        "memId": self.uploadMemberImgData.id,
                    }, function (res) {
                        am.loading.hide();
                        if (self.uploadMemberImgCallback) self.uploadMemberImgCallback();
                    });
                });
            });
            this.$uploadMemberImg.find('.uploadBtn').vclick(function () {
                if (self.uploadMemberImgCallback) self.uploadMemberImgCallback();
            });
            this.$uploadMemberImg.find('.ignoreUploadMemberImg').vclick(function () {
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    localStorage.removeItem('ignoreUploadMemberImg_'+am.metadata.userInfo.userId);
                }else {
                    $(this).addClass('active');
                    localStorage.setItem('ignoreUploadMemberImg_'+am.metadata.userInfo.userId,1);
                }
            });
            this.$addPhone = this.$.find('.addphone');
        },
        checkPhone: function (phone) {
            // am.loading.show("正在校验手机号,请稍候...");
            am.api.checkMobile.exec({
                "mobile": phone,
                "shopId": am.metadata.userInfo.shopId
            }, function (res) {
                // am.loading.hide();
                console.log(res);
                if (res.code == 13001) {
                    self.$.find(".cm_mobile_phone .tips").addClass('show').text("手机号码已经被使用，请换一个输入");
                    self.$.find(".cm_mobile_phone .addphone").addClass('warn');
                } else if (res.code == 0) {
                    self.$.find(".cm_mobile_phone .tips").removeClass('show');
                    self.$.find(".cm_mobile_phone .addphone").removeClass('warn');
                } else {
                    am.msg("手机号码校验失败！");
                }
            });
        },
        getValue: function () {
            var name = this.$.find(".addMember_list .uesrname").val();
            var mobile = this.$input.val();
			var sex = this.$.find(".sexbox span.selected").data("val");
			var sourceId = this.$.find(".changesource .changebox.selected .change_words").data("val");
			var useStatus = this.$.find(".changesource .changebox.selected .change_words").data("status");
            var page = this.$.find(".page_textarea").val();
            var birthday=this.$birthday.val();//.replace(/\-/g,"/")
            var birthType = this.$selectBirthday.find("li.selected").index();
            if (name == "") {
                am.msg("请输入会员姓名！");
                return false;
            }
            if(amGloble.metadata.userInfo.operatestr.indexOf('MGJR,') == -1){
                if (!mobile || mobile.toString().length != 11) {
                    am.msg("请输入11位正确的手机号！");
                    return false;
                }
            }else{
                if (!mobile || mobile.toString().length < 4) {
                    am.msg("手机号码必须大于4位！");
                    return false;
                }
            }            
            if (!sourceId && sourceId != 0) {
                am.msg("请选择顾客来源！");
                return false;
            }
            if (sourceId == 3 && !this.paras.introducer) {
                am.msg("请选择推荐人！");
                return false;
            }
			if (this.paras && this.paras.hasOwnProperty("userInfo")) {
                var mgjsourceid = this.paras.userInfo.mgjsourceid
				if (mgjsourceid != sourceId && !useStatus) {
					am.msg("您所选择的顾客来源分类已取消启用，请重新选择！");
					return false;
				}
			}
            var res = {
                name: name,
                mobile: mobile,
                sex: sex,
                birthday: birthday ? '1900-'+birthday : '',
                birthType: birthType,
                sourceId: sourceId,
                page: page
            };
            if (sourceId == 3) {
                res.introducerid = this.paras.introducer.id;
            } else {
                res.introducerid = null;
            }
            if (this.submit == "editMember") {
                res.memberid = this.$data.userInfo.id;
            }
            return res;
        },
        setStartData: function () {
            this.$input.val("");
            this.$.find(".addMember_list .uesrname").val("");
            this.$.find(".sexbox span").eq(0).addClass('selected').siblings().removeClass('selected');
            this.$.find(".changesource .changebox").removeClass('selected');
            this.$.find(".page_textarea").val("");
            this.$birthday.val("");
            this.$selectBirthday.find("li").removeClass('selected');
            this.$selectBirthday.find("li").eq(0).addClass('selected');
        },
		mbRepeatConfig:false,
        beforeShow: function (paras) {
            if (paras == 'back') {
                return;
            }
            var configs = am.metadata.configs;
            if (configs && configs['mobileRepeat']) {
                this.mbRepeatConfig = JSON.parse(configs['mobileRepeat']);
            }
            this.paras = paras;
            this.$introducer.hide().find('.addintroducer').val('');
            self.$.find(".cm_mobile_phone .tips").removeClass('show');
            self.$.find(".cm_mobile_phone .addphone").removeClass('warn');
            //由大众点评券创建客户时会隐藏
            var $dpInput = this.$.find('.cm_form.cm_mobile_phone,.cm_form.source').show();
            this.$.find('.dptips').hide();
            this.$uploadMemberImg.hide();


            //初始化签字
            if (!this.signaturePad) {
                var canvas = this.$.find("canvas")[0];
                this.signaturePad = new SignaturePad(canvas);
                this.$.find(".clearCanvas").vclick(function () {
                    self.saveSignature(1,function(){
                        self.signaturePad.clear();
                    });
                });
                this.ctx = canvas.getContext('2d');
            } else {
                this.signaturePad.clear();
            }
			if (paras && paras.hasOwnProperty("userInfo")) {//编辑资料
				self.renderCustomerSource(am.metadata.memSourceList)
                this.$.find(".am-header p").text("编辑资料");
                this.$.find(".footbutton").text("确认并修改");
                this.renderData(paras.userInfo);
                this.submit = "editMember";
                this.$.find('.modifyMemberImg').show();
                this.$.find("textarea").attr("readonly", false);
				this.$.find('.changebox-hidden').show();
				

            } else if (paras && paras.introducer) {
                this.$introducer.show().find('.addintroducer').val(paras.introducer.name + ' | ' + paras.introducer.mobile + ' | ' + this.getShopNameById(paras.introducer.shopId));
			} else {//添加会员
				var memSourceList = self.getCustomerSource()
				self.renderCustomerSource(memSourceList)
                this.$.find('.modifyMemberImg').hide();
                this.$.find(".am-header p").text("创建会员");
                this.$.find(".footbutton").text("创建并选择");
                this.setStartData();
                this.submit = "createMember";
				this.$.find('.changebox-hidden').hide();
				
                //目前只有大众点评这一种情况，如果以后增加，应该需要增加类型来判断
                if (paras && paras.defultInfo) {
                    if (paras.defultInfo.mobile) {
                        this.$.find(".addphone").val(paras.defultInfo.mobile);
                        this.$.find('.cm_mobile_phone').hide();
                        this.$.find("span.change_words[data-val=7]").parent().addClass("selected");
                        //由大众点评券创建客户时隐藏
                        $dpInput.hide();
                        this.$.find(".am-header p").text("点评消费即会员");
                        this.$.find('.dptips').show().find('.dptipmobile').text(paras.defultInfo.mobile);
                    }
                }
            }
            console.log(paras);
            this.$data = paras;
        },
        afterShow: function (paras) {
            am.tab.main.hide();
            setTimeout(function () {
                self.$.find("[isdisabled=1]").attr("disabled", false).removeAttr("isdisabled");

                if (paras && paras.hasOwnProperty("userInfo") && amGloble.metadata.userInfo.operatestr.indexOf('Y,') == -1) {
                    //您没有权限修改会员备注
                    self.$.find("textarea").attr("readonly", true);//.attr("isdisabled",1)
                } else {
                    self.$.find("textarea").attr("readonly", false);//.attr("isdisabled",1)
                }
            }, 50);
        },
        beforeHide: function (paras) {
            /*this.$.find("input,textarea").attr("disabled",true).attr("isdisabled",1);*/
        },
        afterHide: function () {
            this.$.find("input,textarea").attr("disabled", true).attr("isdisabled", 1);
        },
        renderData: function (userInfo) {
            var $changeBox = this.$.find(".changesource .changebox");
            var $list = $changeBox.find(".change_words");
            var arr = [];
            $list.each(function (i, item) {
                arr.push($(item).data("val"));
            });
            this.$input.val(userInfo.realMobile || userInfo.mobile);
            this.$.find(".addMember_list .uesrname").val(userInfo.name);
            this.$.find(".sexbox span").eq((userInfo.sex == "F" ? 0 : 1)).addClass('selected').siblings().removeClass('selected');
            //mgjsourceid
            if (!$changeBox.find('.selected').length) {
                if (!(this.paras.introducer)) {
                    if (userInfo.mgjsourceid == 0) {
                        $changeBox.removeClass('selected');
                    } else {
                        var idx = arr.indexOf(userInfo.mgjsourceid);
                        $changeBox.eq(idx).addClass('selected').siblings().removeClass('selected');
                        if (userInfo.mgjsourceid == 3) {
                            this.getMemberNameById(userInfo.introducerid);
                            this.paras.introducer = {};
                            this.paras.introducer.id = userInfo.introducerid;
                        } else {
                            this.$introducer.hide().find('.addintroducer').val('');
                        }
                    }
                } else {
                    this.$introducer.show().find('.addintroducer').val(this.paras.introducer.name + ' | ' + this.paras.introducer.mobile + ' | ' + this.getShopNameById(this.paras.introducer.shopId));
                }
            }
            //this.$.find(".changesource .changebox").eq(0).addClass('selected').siblings().removeClass('selected');
            this.$.find(".page_textarea").val(userInfo.page);

            var $img = am.photoManager.createImage("customer", {
                parentShopId: am.metadata.userInfo.parentShopId,
                updateTs: userInfo.lastphotoupdatetime || new Date().getTime()
            }, userInfo.id + ".jpg", "s",userInfo.photopath||'');
            this.$.find('.cm_updateImg .img').html($img);

            var $signature = am.photoManager.createImage("signature", {
                parentShopId: am.metadata.userInfo.parentShopId,
                updateTs: new Date().getTime()
            }, userInfo.id + ".png", "");

            $signature.load(function () {
                console.log("loaded");
                self.ctx.drawImage(this, 0, 0);
            }).error(function () {
                console.log("error");
            });

            var tempTime, tempArr;
            if (userInfo['birthday']) {
                tempTime = userInfo['birthday'].replace(/\-/g, "/");
                tempArr = tempTime.split("/");
                if (tempArr.length < 3) {//IOS BUG必须补年 不然newDate报错
                    tempTime = "2017/" + tempTime;
                }
            }

			//this.$birthday.val(userInfo['birthday']?new Date(tempTime).format("yyyy-mm-dd"):"");
			if(userInfo['birthday']){
				var dateStr = new Date(tempTime);
				this.$birthday.mobiscroll('setVal',dateStr,true);
				this.$birthday.val(dateStr.format("mm-dd"));
			}else{
				var ts = new Date();
				this.$birthday.mobiscroll('setVal', ts.setFullYear(ts.getFullYear()-20));
				this.$birthday.val("");
			}
			this.$selectBirthday.find("li").removeClass('selected');
			this.$selectBirthday.find("li").eq(userInfo['birthtype'] || 0).addClass('selected');
		},
		setData:function(data,callback){
			var metadata=am.metadata;
			am.loading.show("正在创建会员,请稍候...");
			am.api[self.submit].exec($.extend({
                "optName": am.metadata.userInfo.userName,
			    "shopId":am.metadata.userInfo.shopId,
			    "parentShopId":am.metadata.userInfo.parentShopId
			},data), function(res) {
                am.loading.hide();
                
			    //console.log(res);
			    if (res.code == 0) {
						//console.log(data);
			    		if(callback){
							callback && callback(res.content[0]);
						}else if(self.submit=="editMember"){
                            am.msg('修改成功');
							var arr = [];
							for(var i=0;i<$.am.history.length;i++){
								if($.am.history[i].id!='page_addMember' && $.am.history[i].id!='page_searchMember'){
									arr.push($.am.history[i]);
								}
							}
							$.am.history = arr;
			    			$.am.changePage($.am.history[$.am.history.length-1], "slidedown",{
								customerId:self.$data.userInfo.id,
								shopId:self.$data.userInfo.shopid,
                                tabId:1,
                                openbill:self.$data.openbill
                            });
                            $('.tab_cash .bottom .user .img').html(am.photoManager.createImage("customer", {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: data.lastphotoupdatetime || new Date().getTime()
                            }, data.memberid + ".jpg", "s",data.photopath||''));

			    			// $.am.history.pop();
			    			// $.am.history.pop();
			    		}else{
							self.uploadImg(res.content[0],function(){
								if(self.$data && self.$data.onSelect){
									self.$data.onSelect(res.content[0]);
							    }else{
									$.am.changePage(am.page.service, "slidedown",{
										  member:data
									});
							    }
                                var arr = [];
                                for (var i = 0; i < $.am.history.length; i++) {
                                    if ($.am.history[i].id != 'page_addMember' && $.am.history[i].id != 'page_searchMember') {
                                        arr.push($.am.history[i]);
                                    }
                                }
                                $.am.history = arr;
                                $.am.page.back("slidedown");
							});
						}

                    if(self.signaturePad){//fix bug --0015771
                        if (!self.signaturePad.isEmpty()) {
                            self.saveSignature();
                        }
                    }
                } else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
            });
        },
        uploadImg: function (member, callback) {
            this.uploadMemberImgCallback = callback;
            this.uploadMemberImgData = member;

            var ignoreUploadMemberImg = localStorage.getItem('ignoreUploadMemberImg_'+am.metadata.userInfo.userId);
            if(ignoreUploadMemberImg){
                am.msg('用户资料创建成功');
                this.uploadMemberImgCallback && this.uploadMemberImgCallback();
            }else {
                this.$uploadMemberImg.show();
                if(ignoreUploadMemberImg){
                    this.$uploadMemberImg.find('.ignoreUploadMemberImg').addClass('active');
                }else {
                    this.$uploadMemberImg.find('.ignoreUploadMemberImg').removeClass('active');
                }
            }
        },
        takePhoto: function (memberId, callback) {
            am.photoManager.takePhoto("customer", {
                parentShopId: am.metadata.userInfo.parentShopId,
                customerId: memberId
            }, function () {
                console.log("succ");
                if (callback) callback();
            }, function () {
                console.log("fail");
            });
        },
        saveSignature: function (clear,cb) {
            if(this.uploadMemberImgData||this.$data.userInfo){
                var opt = {
                    dir: "signature/member/" + am.metadata.userInfo.parentShopId,
                    imageBase64: this.signaturePad.toDataURL("image/png").replace("data:image/png;base64,", ""),
                    name: (this.uploadMemberImgData ? this.uploadMemberImgData.id : this.$data.userInfo.id) + ".png",
                    realName: "1.png",
                    trim: false,
                    // variations:[
                    //     {suffix: "l", resolution: "1024x1024"},
                    //     {suffix: "m", resolution: "512x512"},
                    //     {suffix: "s", resolution: "256x256"}
                    // ]
                };
                if(clear){
                    opt.imageBase64 = '';
                }
                this.times = 0;
                this.execUpload(opt,clear,cb);
            }
        },
        execUpload: function (opt,clear,cb) {
            var _this = this;
            amGloble.loading.show();
            amGloble.api.base64Upload.exec(opt, function (ret) {
                amGloble.loading.hide();
                _this.times++;
                if (ret.code == 0) {
                    if(clear){
                        am.msg("清除成功");
                        cb && cb();
                    }else {
                        am.msg("签名已保存");
                    } 
                } else {
                    //self.msg("照片上传失败!");
                    if (_this.times > 1) {
                        atMobile.nativeUIWidget.confirm({
                            caption: "签名保存失败",
                            description: "签名保存失败,是否重新上传?",
                            okCaption: "重试",
                            cancelCaption: "放弃"
                        }, function () {
                            _this.execUpload(opt);
                        }, function () {
                            am.msg("签名保存失败！");
                        });
                    } else {
                        _this.execUpload(opt);
                    }
                }
            }, true, 120000);
        },
        getMemberNameById: function (id) {
            var _this = this;
            if (id) {
                am.api.queryMemberById.exec({
                    memberid: id
                }, function (ret) {
                    if (ret && ret.code == 0 && ret.content && ret.content.length) {
                        var info = ret.content[0];
                        _this.$introducer.show().find('.addintroducer').val(info.name + ' | ' + info.mobile + ' | ' + _this.getShopNameById(info.shopId));
                    } else {
                        _this.$introducer.show().find('.addintroducer').val('*');
                    }
                });
            } else {
                _this.$introducer.show().find('.addintroducer').val('*');
            }
        },
        getShopNameById: function (id) {
            var shops = am.metadata.shopList;
            var name = '';
            for (var i = 0; i < shops.length; i++) {
                if (id == shops[i].shopId) {
                    if (shops[i].osName && shops[i].osName.replace(/(^\s*)|(\s*$)/g, '')) {
                        name = shops[i].osName;
                    } else {
                        if (shops[i].softgenre == 0) {
                            name = shops[i].shopName;
                        } else {
                            name = '门店名称未设定';
                        }
                    }
                    return name;
                }
            }
            return name;
		},
		// 获取顾客来源分类
		getCustomerSource: function() {
			var memSourceList = am.metadata.memSourceList;
			var menSourceRes = []
			$.each(memSourceList, function(i, item) {
				if(!!item.status) {
					menSourceRes.push(item)
				}
			})
			return menSourceRes
		},
		// 渲染顾客来源分类
		renderCustomerSource:function(arr) {
            var selectedSourceId = self.$.find('.cm_form.source .changesource .selected .change_words').attr('data-val');
			self.$.find('.cm_form.source .changesource').empty()
			$.each(arr, function(i, item) {
                var $div = $('<div class="changebox am-clickable"><span class="change_icon"></span><span class="change_words"></span></div>')
				if(item.sourceId == 4 || item.sourceId == 5 || item.sourceId == 6) {
					$div.addClass('changebox-hidden').find('.change_words').text(item.sourceName).attr('data-val', item.sourceId).attr('data-status', item.status)
				} else {
					$div.removeClass('changebox-hidden').find('.change_words').text(item.sourceName).attr('data-val', item.sourceId).attr('data-status', item.status)
                }
                if(selectedSourceId==item.sourceId){
                    $div.addClass('selected');
                }
				self.$.find('.cm_form.source .changesource').append($div)
			})
			this.$sourceScroll.refresh();
		}
    });
})();
