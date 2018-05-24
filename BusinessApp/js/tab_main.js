(function(){
	$('.tab-main').on('vclick','li',function(){
		var index = $(this).index();
		if(index==0){
			$.am.changePage(amGloble.page.education);
		}else if(index==1){
			checkLogin(function(){
				$.am.changePage(amGloble.page.dashboard);
			})
        }
        // else if(index==2){
		// 	checkLogin(function(){
		// 		$.am.changePage(amGloble.page.userinfo);
		// 	})
		// }
        $(this).addClass('active').siblings().removeClass('active');
	});

	var checkLogin = function(callback){
		var hash = amGloble.hash.get();

        if (config.token) {
            /*if (hash.type == "logout") {
                //如果强制登出
                amGloble.hash.remove(["type"]);
                $.am.changePage(amGloble.page.login, "slideright", "logoutWithoutReload");
            } else {*/
                if(amGloble.metadata){
                    callback();
                }else {
                    amGloble.page.login.getMetadata(function() {
                        var user = amGloble.metadata.userInfo;
                        // amGloble.metadata.userInfo.mgjVersion = 2;
                        if (user.password) {
                            callback();
                        } else {
                            $.am.changePage(amGloble.page.userinfoResetPwd, "", {
                                phone: user.mobile,
                                shopId: user.shopId,
                                userId: user.userId,
                                userType: user.userType,
                                backPage: amGloble.page.login,
                                scb: function() {
                                    callback();
                                }
                            });
                        }
                    });
                }
            //}
        } else {
            //如果没有userinfo和toke，则登录
            $.am.changePage(amGloble.page.login,'slideleft');
        }
	}
})();