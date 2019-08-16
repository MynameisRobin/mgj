$(function(){
    //判断是否为window 或 Mac电脑
    if(device2.windows() || navigator.platform.indexOf("Mac") == 0){
        $(document).keyup(function(evt){
            if(evt.keyCode){
                console.log(evt.keyCode, sessionStorage.cardPreventKeyB);
                var activePage = $.am.getActivePage();
                if(activePage){ //fix bug --0015776
                    if(activePage && activePage.keyboardCtrl){
    
                        //为解决 读卡器的 keyup事件 做的延迟
                        clearTimeout(time);
                        var time = null;
                        if(!time) {
                            time = setTimeout(function() {
                                if(sessionStorage.cardPreventKeyB != 'prevent') {
                                    activePage.keyboardCtrl(evt.keyCode);
                                }
                            }, 100);
                        }else {}
    
                    }else if(evt.keyCode === 27 && activePage.$backButton){
                        activePage.$backButton.trigger('vclick');
                    }
                }
            }
        });

        //键盘收银提示
        $('.keypadWrap').show();

        
        var rightNum = [96,105],leftNum = [48,57]; //右边小键盘
        window.keyboardCtrl = {
            getNum:function(code){
                if(code>=rightNum[0] && code<=rightNum[1]){
                    return code-rightNum[0];
                }else if(code>=leftNum[0] && code<=leftNum[1]){
                    return code-leftNum[0];
                }
            },
            isEnter:function(code){
                return code === 13;
            }
        }
    }
});