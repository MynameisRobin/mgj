(function() {

	var self = amGloble.page.archiveDetail = new $.am.Page({
		id : "page_archiveDetail",
		backButtonOnclick : function() {
			if ($("#pswp_dom").is(":visible")) {
				amGloble.gallery.close();
			} else {
				$.am.page.back() || $.am.changePage(amGloble.page.archiveList, "slideright");
			}
		},
		init : function() {

			//列表页相关逻辑

			this.$ul = this.$.find(".archiveList > ul");
			this.$li = this.$ul.find(":first").remove();
			this.$commentLi = this.$li.find(".commentsList > p:first").remove();

			this.$ul.empty();

			this.$ul.on("vclick", ".userHeader", function() {
				//点击头像
				var data = $(this).parent().data("item");
				// console.log(data);
				if (data.operatorRole == 11 && data.operatorAvailiable == 1) {
					amGloble.page.barberDetail.changeToMe("slideleft", data.operator);
				}
			}).on("vclick", ".left > .like", function() {
				//赞
				var $this = $(this);
				var data = $this.parents("li").data("item");
				console.log(data);

				amGloble.loading.show();
				amGloble.api.invention_like.exec({
					inventionId : data.id
				}, function(ret) {
					amGloble.loading.hide();
					if (ret.code == 0) {
						$this.addClass("am-disabled").html(data.likes + 1);
						localStorage.setItem("like" + data.id, "1");
						amGloble.msg("赞+1");
					} else {
						amGloble.msg(ret.message || "数据获取失败,请检查网络!");
					}
				});

			}).on("vclick", ".left > .share", function(e) {
				amGloble.wxtip.show();

			}).on("vclick", ".right > .comment", function() {
				//评论
				var $thisli = $(this).parents("li");
				var data = $thisli.data("item");
				if (!amGloble.user) {
					$.am.changePage(amGloble.page.setup, "slideleft", {type:"login"});
				} else {
					$.am.changePage(amGloble.page.archiveCommentAdd, "slideup", {
						data : data,
						scb : function(item) {
							var $item = $('<p><span class="name">' + item.memname + '：</span>' + item.content + '<span class="am-clickable del">删除</span></p>');
							$item.data("item", item);
							$thisli.find(".commentsList").show().append($item);
						}
					});
				}

			}).on("vclick", ".right > .reseration", function() {
				var data = $(this).parents("li").data("item");
				// console.log(data);

				amGloble.page.reservation.changeToMe("slideleft", {
					photoId : data.operatorImg,
					name : data.operatorName,
					barberLevelName : data.operatorLevelName,
					haircutPrice : data.haircutPrice,
					userid : data.operator,
					storeId : data.storeId
				});

			}).on("vclick", "ul.photos > li", function() {
				var items = [];
				$(this).parent().find("img").each(function() {
					items.push({
						src : config.imageUrl + "/" + $(this).attr("pid").replace(".", "_h."),
						w : 640,
						h : 640
					});
				});
				self.pswpTimer && clearTimeout(self.pswpTimer);
				amGloble.loading.show();
				self.pswpTimer = setTimeout(function() {
					amGloble.loading.hide();
					amGloble.pswp(items);
				}, 800);
			}).on("vclick", ".commentsList .del", function() {
				//删除评论
				var $this = $(this);
				var data = $this.parents("p").data("item");
				console.log(data);

				atMobile.nativeUIWidget.confirm({
					caption : "删除评论",
					description : "确定要删除这个评论吗？",
					okCaption : "是",
					cancelCaption : "否"
				}, function() {
					amGloble.loading.show();
					amGloble.api.invention_deleteEvaluation.exec({
						evaluationId : data.id,
						token : amGloble.token
					}, function(ret) {
						amGloble.loading.hide();
						if (ret.code == 0) {
							var $list = $this.parents(".commentsList");
							$this.parent().remove();
							if ($list.is(":empty")) {
								$list.hide();
							}

							amGloble.msg("删除成功.");
						} else {
							amGloble.msg(ret.message || "数据提交失败,请检查网络!");
						}
					});
				}, function() {
				});

			});
			//error

			this.$error = this.$.find("div.am-page-error");
			this.$error.find(".button-common").vclick(function() {
				self.getData();
			});
		},
		beforeShow : function(paras) {

			if (paras == "back") {
				return false;
			}
			//webapp.setHash(8, paras);
			this.$ul.empty();
			this.$body.hide();
			amGloble.tab.main.hide();
			this.setStatus("loading");

		},
		afterShow : function(paras) {
			this.id = paras;

			if (paras == "back") {
				return false;
			}

			this.$body.show();
			this.getData();
		},
		beforeHide : function(paras) {
			//webapp.setHash();
			$("#pswp_dom").removeClass("pswp--open");
		},
		render : function(item) {

			var self = this;
			var $ul = this.$ul.empty();

			var $li = this.$li.clone(true, true);

			var type = "";
			if (item.emplevelname) {
				type = "<span class='type'>" + item.emplevelname + "</span>";
			}

			//美发师名字级别
			$li.find(".userName").html(item.empname + type);

			//头像
			var pUrl = "";
			var type = "";
			var size = "";
			if (item.emptype != 1) {
				pUrl = amGloble.getConfig("v4_tenantLogo");
			} else {
				pUrl = item.empid+".jpg";
				size = "s";
			}

			if (pUrl) {
				$li.find(".userHeader").empty().append($('<img width="100%" />').hide().getPicture({
					file:pUrl,
					type:"artisan",
					size:size,
					options:{
						parentShopId:amGloble.tenantId
					},
					success:function(){
					},
					error:function(){
					}
				}));
			} else {
				$li.find(".userHeader").empty();
			}

			//门店和发布时间
			$li.find(".store").html(amGloble.getStoresById(item.shopid).osname);
			$li.find(".postTime").html(amGloble.time2str(item.createtime));

			//描述
			$li.find(".text").html(item.title);
			if (item.price) {
				$li.find(".price").css("display", "inline-block").html("门店价：￥" + item.price);
			} else {
				$li.find(".price").hide();
			}

			//图片列表
			var $photos = $li.find(".photos").empty();
			var photos = item.photo.split(",");
			$.each(photos, function(j, itemj) {
				var w = Math.floor(($(".am-widthLimite").width() - 80) / 3);
				if (itemj) {
					$photos.append($("<li class='am-clickable'></li>").css({
						width : w,
						height : w
					}).append($('<img />').hide().attr("pid", itemj).getPicture({
						file:itemj,
						type:"show",
						size:"s",
						options:{
							catigoryId:item.type,
							parentShopId:amGloble.tenantId,
							authorId:item.empid
						},
						success:function(){
						},
						error:function(){
						}
					})));
				}
			});

			if (photos.length == 1) {
				$photos.addClass("onlyOne");
			}

			//赞和分享次数

			if (localStorage.getItem("like" + item.id)) {
				$li.find(".like").addClass("am-disabled").html(item.likes || 0);
			} else {
				$li.find(".like").html(item.likes || 0);
			}

			$li.find(".share").html(item.shares || 0);
			//预约按钮
			// if (item.operatorAvailiable != 1 || item.operatorRole != 11) {
			$li.find(".reseration").hide();
			// }

			//评论列表
			var $comments = $li.find(".commentsList").empty();
			if (item.evaluations && item.evaluations.length) {
				$.each(item.evaluations, function(j, itemj) {
					var $cli = self.$commentLi.clone(true, true);
					var delBtn = "";
					if (amGloble.user && itemj.memid == amGloble.user.meta.id) {
						delBtn = '<span class="am-clickable del">删除</span>';
					}

					$cli.html('<span class="name">' + itemj.memname + '：</span>' + itemj.content + delBtn);
					$cli.data("item", itemj);
					$comments.append($cli);
				});
			} else {
				$comments.hide();
			}

			$li.data("item", item);
			$ul.append($li);

			this.bindShare();
			this.refresh();
		},
	});
})();
