//当主线程发来信息后，触发该message事件
onmessage = function(event){
    var xhr = new XMLHttpRequest();
    var data = event.data;

    xhr.onreadystatechange = function(event){    //对ajax对象进行监听
        //console.log("onreadystatechange:"+xhr.readyState+" , "+xhr.status);
        if(xhr.readyState == 4){    //4表示解析完毕
            //console.log(xhr);
            if(xhr.status == 200 && xhr.responseText){
                var json;
                try{
                    json = JSON.parse(xhr.responseText);
                }catch(e){

                }
                if(json){
                    json.__threadId = data.__threadId;
                    json.Date = xhr.getResponseHeader("Date");
                    postMessage(json);
                }else{
                    postMessage({
                        __threadId:data.__threadId,
                        message:"数据解析错误！",
                        code:-3
                    });
                }
            }else{
                postMessage({
                    __threadId:data.__threadId,
                    code:-1,
                    message:"网络不给力,请检查网络环境！",
                });
            }
        }
    };
    xhr.ontimeout = function(){
        postMessage({
            __threadId:data.__threadId,
            code:-1,
            message:"网络不给力,请检查网络环境！",
        });
    };
    xhr.onerror = function(){
        postMessage({
            __threadId:data.__threadId,
            code:-1,
            message:"网络不给力,请检查网络环境！",
        });
    };
    xhr.timeout = data.timeout;
    xhr.open('POST',data.url,true);
    xhr.setRequestHeader('Content-type','application/json');    //可有可无
    xhr.send(JSON.stringify(data.option));
};
