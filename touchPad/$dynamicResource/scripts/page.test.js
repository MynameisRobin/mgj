(function(){
    var _this = am.page.test = new $.am.Page({
        id: "page_test",
        init:function(){
            this.$textarea = this.$.find(".text_wrap");
            this.$.on("vclick",".copy1",function(e){
                var text = "这是一段自定义文本" + Math.random();
                try{
                    var oInput = document.createElement('input');
                    oInput.value = text;
                    document.body.appendChild(oInput);
                    oInput.select(); // 选择对象
                    document.execCommand("Copy"); // 执行浏览器复制命令
                    oInput.className = 'oInput';
                    oInput.style.display='none';
                    alert("复制成功！！");
                }catch(e){
                    alert("复制失败！！");
                    $.am.debug.log(e.message);
                }
                
            }).on("vclick",".copy2",function(){
                try{
                    var $text = _this.$textarea;
                    $text.select();  
                    $text[0].setSelectionRange(0, $text[0].value.length);
                    document.execCommand("copy");
                    alert("复制成功！！");
                }catch(e){
                    alert("复制失败！！");
                    $.am.debug.log(e.message);
                }
                
                
            });
        },
        beforeShow:function(){

        },
        afterShow:function(){

        },
        beforeHide:function(){},
        afterHide:function(){

        }
    })
})();