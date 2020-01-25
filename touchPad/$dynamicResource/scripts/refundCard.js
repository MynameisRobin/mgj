(function () {
	// 退卡
	var self = {
		init: function ($dom) {
			this.$ = $dom;
			// 点击事件声明之类
			this.$.on('vclick', '.sure_btn', function () {
				self.submit();
			}).on('vclick', '.btn_cancel', function () {
				//取消 关闭窗口
				self.hide();
			}).on('vclick', '.popup_right_mask', function () {
				//取消 关闭窗口
				self.hide();
			}).on('vclick', '.addEmp', function () {
				self.empListShow(function (emp) {
					if (am.isNull(emp)) return;
					self.$.find(".empList").empty();
					$.each(emp, function (i, v) {
						var ul = [
							'<ul class="list_item">',
							'<li class="name">',
							'</li>',
							'<li>',
							'<input type="text" class="am-clickable empfee" value="0" readonly="readonly">',
							'</li>',
							'<li>',
							'<input type="text" class="am-clickable gain" value="0" readonly="readonly">',
							'<span class="iconfont icon-shanchu am-clickable">',
							'</span>',
							'</li>',
							'</ul>'
						].join('');
						var $ul = $(ul);
						$ul.find(".name").text(v.no + ' ' + v.name);
						$ul.data("empId", v.id);
						self.$.find(".empList").append($ul);
					});
					self.$content.refresh();
					// self.$content.scrollTo('top');
				})
			}).on('vclick', '.addDepot', function () {
				self.deparListShow(function (depot) {
					if (am.isNull(depot)) return;
					self.$.find(".depotList").empty();
					$.each(depot, function (i, v) {
						var ul = [
							'<ul class="list_item">',
							'<li class="name">',
							'</li>',
							'<li>',
							'<input type="text" class="am-clickable depfee" value="0" readonly="readonly">',
							'</li>',
							'<li style="float:right;margin-right: 15px;">',
							'<span class="iconfont icon-shanchu am-clickable">',
							'</span>',
							'</li>',
							'</ul>'
						].join('');
						var $ul = $(ul);
						$ul.find(".name").text(v.name);
						$ul.data("depcode", v.code);
						self.$.find(".depotList").append($ul);
					});
					self.$content.refresh();
					// self.$content.scrollTo('top');
				})
			}).on('vclick', '.icon-shanchu', function () {
				$(this).parents(".list_item").remove();
				var $depotList = self.$.find('.depotList');
				var $empList = self.$.find('.empList');
				if ($depotList.find(".list_item").length === 0) {
					self.$.find(".depotTable").hide();
				}
				if ($empList.find(".list_item").length === 0) {
					self.$.find(".empTable").hide();
				}
			}).on('vclick', '.consumeDetail', function () {
				var data = self.data;
				self.hide();
				try {
					var page = am.page.memberDetails;
					page.changeTab(4,function(){
						page.$.find(".sel_member_card .value").data("value", data.id).text(data.cardtypename);
						page.$.find(".check_btn.cardCash").trigger("vclick");
					});
				} catch (e) {

				}
			}).on('vclick', '.applicationType ul li', function () {
				self.$.find(".radio").removeClass('active');
				$(this).find(".radio").addClass("active");
				if ($(this).find(".radio").data("type") == '1') {
					$(this).find(".type_payment").show();
				} else {
					self.$.find(".type_payment").hide();
				}
				self.$content.refresh();
				// self.$content.scrollTo('top');
			}).on('vclick', '.refundFeeInput', function () {
				var $this = $(this);
				am.keyboard.show({
					title: "请输入数字", //可不传
					hidedot: false,
					submit: function (value) {
						if (am.isNull(value)) {
							return am.msg("请输入正确的数字");
						}
						value = Math.floor(value*100) / 100;
						$this.val(value);
					}
				});
			}).on('vclick', '.refundCardFeeInput', function () {
				var $this = $(this);
				am.keyboard.show({
					title: "请输入数字",
					hidedot: false,
					submit: function (value) {
						if (am.isNull(value)) {
							return am.msg("请输入正确的数字");
						}
						if (self.data.cardfee - 0 < value - 0) {
							$this.val(self.data.cardfee);
						} else {
							value = Math.floor(value*100) / 100;
							$this.val(value);
						}
					}
				});
			}).on('vclick', '.refundPresentFeeInput', function () {
				var $this = $(this);
				am.keyboard.show({
					title: "请输入数字",
					hidedot: false,
					submit: function (value) {
						if (am.isNull(value)) {
							return am.msg("请输入正确的数字");
						}
						if (self.data.presentfee - 0 < value - 0) {
							$this.val(self.data.presentfee);
						} else {
							value = Math.floor(value*100) / 100;
							$this.val(value);
						}
					}
				});
			}).on('vclick', 'input.depfee', function () {
				var $this = $(this);
				am.keyboard.show({
					title: "请输入数字",
					hidedot: false,
					submit: function (value) {
						if (am.isNull(value)) {
							return am.msg("请输入正确的数字");
						}
						value = Math.floor(value*100) / 100;
						$this.val(value);
					}
				});
			}).on('vclick', 'input.gain', function () {
				var $this = $(this);
				am.keyboard.show({
					title: "请输入数字",
					hidedot: false,
					submit: function (value) {
						if (am.isNull(value)) {
							return am.msg("请输入正确的数字");
						}
						value = Math.floor(value*100) / 100;
						$this.val(value);
					}
				});
			}).on('vclick', 'input.empfee', function () {
				var $this = $(this);
				am.keyboard.show({
					title: "请输入数字",
					hidedot: false,
					submit: function (value) {
						if (am.isNull(value)) {
							return am.msg("请输入正确的数字");
						}
						value = Math.floor(value*100) / 100;
						$this.val(value);
					}
				});
			});

			this.$content = new $.am.ScrollView({
				$wrap: this.$.find('.popup_content'),
				$inner: this.$.find('.popup_content').children(),
				direction: [false, true],
				hasInput: false
			});
		},
		show: function ($dom, data, callback) {
			if (!data) return;
			// 显示退卡弹窗
			$dom.addClass('show');
			if (!this.$) {
				this.init($dom);
			}
			this.data = data;
			this.callback = callback;
			this.render(data);
			self.$content.refresh();
			self.$content.scrollTo('top');
		},
		hide: function () {
			this.$.removeClass('show');
			this.reset();
		},
		empListShow: function (cb) {
			am.addQueue.show({
				title: '选择员工',
				emp: am.metadata.employeeList || [],
				callback: function (data) {
					self.$.find(".empTable").show();
					cb && cb(data);
				}
			});
		},
		deparListShow: function (cb) {
			am.popupMenu("选择部门", am.metadata.deparList, function (res) {
				self.$.find(".depotTable").show();
				cb && cb(res);
			}, false, 1);
		},
		// 渲染会员卡数据
		render: function (data) {
			self.$.find(".card_name").text(data.cardtypename || '');
			self.$.find(".card_no").text(data.cardid || '');
			self.$.find(".card_discount").text('项目' + data.discount + '折，卖品' + data.buydiscount + '折');
			//到期日
			if (data.invaliddate) {
				var _str = '到期日：' + new Date(data.invaliddate - 0).format("yyyy.mm.dd");
			} else {
				var _str = '到期日：无';
			}
			self.$.find(".card_duedate").text(_str);
			self.$.find(".eafee").text('￥' + Math.round(((data.cardfee - 0) + (data.presentfee - 0))*100)/100 || 0);
			self.$.find(".payment").text('卡金:￥' + data.cardfee + '，赠金:￥' + data.presentfee);
			self.$.find(".depotTable,.empTable").hide();
			self.$.find(".applicationType .radio").removeClass('active');
			self.$.find(".applicationType .radio").eq(0).addClass('active');
			self.$.find(".applicationType .type_payment").hide();
		},
		getPostData: function () {
			var data = self.data;
			var refundFee = self.$.find(".refundFeeInput").val(),
				applicationType = 0,
				employeeInfo = [],
				depInfo = [],
				refundFee = self.$.find(".refundFeeInput").val(),
				refundCardFee = self.$.find(".refundCardFeeInput").val(),
				refundPresentFee = self.$.find(".refundPresentFeeInput").val(),
				refundInfo = self.$.find(".refundInfo").val(),
				refundNote = self.$.find(".refundNote").val();

			// 部分or全部
			self.$.find(".applicationType .radio").each(function (i, v) {
				if ($(this).hasClass('active')) {
					applicationType = $(this).data('type');
					return false;
				}
			})

			// 部分选择退卡金和退增金
			if (applicationType == '2') {
				refundCardFee = data.cardfee;
				refundPresentFee = data.presentfee;
			}

			self.$.find(".empList .list_item").each(function (i, v) {
				var obj = {
					n: $(this).find(".name").text(),
					p: $(this).find(".empfee").val(),
					g: $(this).find(".gain").val(),
					id: $(this).data('empId')
				}
				employeeInfo.push(obj);
			});

			self.$.find(".depotList .list_item").each(function (i, v) {
				var obj = {
					depcode: $(this).data('depcode'),
					depfee: $(this).find(".depfee").val(),
					name: $(this).find(".name").text()
				}
				depInfo.push(obj);
			});

			return {
				"shopId": am.metadata.userInfo.shopId,
				"parentShopId": am.metadata.userInfo.parentShopId,
				"memberid": data.memberid, //会员id
				"memcardid": data.id, // 会员卡id
				"applicationType": applicationType + '', // (1: 部分退卡  2：全部退卡)
				"refundCardFee": refundCardFee, // 退卡金
				"refundPresentFee": refundPresentFee, // 退赠送金
				"refundFee": refundFee, // 退卡金额
				"employeeInfo": employeeInfo, // 员工业绩
				"depInfo": depInfo, // 部门业绩
				"operatorid": am.metadata.userInfo.userId, // 操作者userid
				"operatorName": am.metadata.userInfo.userName, // 操作者userid
				"refundInfo": refundInfo, // 原因
				"refundNote": refundNote // 备注
			};
		},
		// 验证两位小数点正数
		regex: function (val) {
			if (/^(\d+\.\d{1,2}|\d+)$/.test(val) && val >= 0) {
				return true;
			} else {
				return false;
			}
		},
		validation: function (params) {
			// 部分选择退卡金和退增金
			if (params.applicationType == '1') {
				if (!self.regex(params.refundCardFee)) {
					am.msg('退卡金额必须大于等于0');
					return false;
				}
				if (!self.regex(params.refundPresentFee)) {
					am.msg('退赠金额必须大于等于0');
					return false;
				}
			}

			if (params.refundFee > 0) {} else {
				am.msg('退款金额必须大于0');
				return false;
			}

			if (am.isNull(params.refundInfo)) {
				am.msg('请填写退卡原因');
				return false;
			}
			return true;
		},
		submit: function () {
			// 表单提交，回调
			var params = self.getPostData();
			if (!self.validation(params)) {
				return false;
			}
			//确认 关闭窗口
			am.confirm("提示", "确定提交退卡申请吗？", "确定", "取消", function(){
				am.loading.show();
				am.api.refundCard.exec(params, function (res) {
					am.loading.hide();
					if (res.code == 0) {
						self.callback && self.callback(res.content);
						self.hide();
					} else {
						am.confirm('数据异常', '是否重试', '重试', '取消', function () {
							self.submit();
						}, function () {});
					}
				})	
			});
		},
		reset: function () {
			// 重置数据,清空输入框
			self.data = null;
			self.$.find(".depotTable,.empTable").hide();
			self.$.find(".empList").empty();
			self.$.find(".depotList").empty();
			self.$.find(".refundFeeInput").val('0');
			self.$.find(".refundCardFeeInput").val('0');
			self.$.find(".refundPresentFeeInput").val('0');
			self.$.find(".refundInfo").val('');
			self.$.find(".refundNote").val('');
			self.$.find(".applicationType .radio").removeClass('active');
			self.$.find(".applicationType .radio").eq(0).addClass('active');
			self.$.find(".applicationType .type_payment").hide();
		}
	}
	am.refundCard = self;
})();