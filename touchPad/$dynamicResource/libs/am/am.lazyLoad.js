(function($){
    var loadPage = function(obj,callback){
        $.ajax({
            url: "./$dynamicResource/pages/page."+obj.name+'.html',
            success: function(ret) {
                $('.am-app').append(ret);
                var js = obj.js || '$dynamicResource/scripts/page.'+obj.name+'.js';
                var css = obj.css || '$dynamicResource/css/page.'+obj.name+'.css'
                $('head').append('<link href="'+css+'" rel="stylesheet" type="text/css" />');
                //$('head').append('<script src="'+js+'"></script>');
                var $head = document.getElementsByTagName('head')[0];
                if($head){
                    var $script = document.createElement('script');
                    $script.src = js;
                    $head.appendChild($script);
                }
                var count = 0;
                var timer = setInterval(function(){
                    if(am.page[obj.name] && am.page[obj.name].init){
                        clearInterval(timer);
                        try{
                            am.page[obj.name].init();
                            callback(am.page[obj.name]);
                        }catch(err){
                            callback();
                            throw err;
                        }
                    }else{
                        count++;
                        if(count>=20){
                            //超时
                            callback();
                        }
                    }
                },100);
            },
            error: function() {
                callback();
            }
        });
    };

    $.am._changePage = $.am.changePage;
    //$.am.changePage = function(obj, animate, para)
    $.am.changePage = function(obj, animate, para){
        if(obj.$ && obj.beforeShow){
            //视为已经初始化了
            $.am._changePage(obj, animate, para);
        }else{
            am.loading.show();
            loadPage(obj,function(obj){
                am.loading.hide();
                if(obj){
                    $.am._changePage(obj, animate, para);
                }else{
                    am.msg('进入失败，请重试!');
                }
            });
        }
    };
})(jQuery);