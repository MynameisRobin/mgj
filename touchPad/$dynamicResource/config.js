var config = {
    //生产
    calcServerUrl:"https://calc.meiguanjia.net",
    originBaseUrl:"https://young.meiguanjia.net/",
    gateway : "https://young.meiguanjia.net/",
    mobile : "https://young.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vip4.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://young.meiguanjia.net/','https://young1.meiguanjia.net/','https://youngbak.meiguanjia.net/','https://younggd.meiguanjia.net/','https://youngsh.meiguanjia.net/'],
},config_develop = {
    originBaseUrl:"http://test.meiguanjia.net/",
    gateway : "http://test.meiguanjia.net/",
    mobile : "http://test.meiguanjia.net/",
    filesMgr : "http:/testimg.meiguanjia.net/",
    mykDownloadPage: "http://www.reelidev.cn:8081/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://test.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
},config_test = {
    calcServerUrl:"https://testcalc.meiguanjia.net",
    originBaseUrl:"https://testyoung.meiguanjia.net/",
    gateway : "https://testyoung.meiguanjia.net/",
    mobile : "https://testyoung.meiguanjia.net/",
    filesMgr : "https://testimg.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/test/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://testvip.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://testyoung.meiguanjia.net/','https://testyoung1.meiguanjia.net/','https://testyoung2.meiguanjia.net/','https://testyoung3.meiguanjia.net/'],
},config_test1 = {
    calcServerUrl:"https://testcalc.meiguanjia.net",
    originBaseUrl:"http://test1.meiguanjia.net/",
    gateway : "http://test1.meiguanjia.net/",
    mobile : "http://test1.meiguanjia.net/",
    filesMgr : "https://testimg.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/test1/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://test1.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: [],
},config_test_shair = {
    calcServerUrl:"https://testcalc.meiguanjia.net",
    originBaseUrl:"http://test3.meiguanjia.net/",
    gateway : "http://test3.meiguanjia.net/",
    mobile : "http://test3.meiguanjia.net/",
    filesMgr : "https://testimg.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/test3/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://test3.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: [],
},config_staging = {
    calcServerUrl:"https://calcstg.meiguanjia.net",
    originBaseUrl:"https://youngstg.meiguanjia.net/",
    gateway : "https://youngstg.meiguanjia.net/",
    mobile : "https://youngstg.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vipstg.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://youngstg.meiguanjia.net/','https://youngstg1.meiguanjia.net/','https://youngstg2.meiguanjia.net/','https://youngstg3.meiguanjia.net/'],
},config_staging2 = {
    calcServerUrl:"https://calcstg.meiguanjia.net",
    originBaseUrl:"https://youngstg2.meiguanjia.net/",
    gateway : "https://youngstg2.meiguanjia.net/",
    mobile : "https://youngstg2.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vipstg2.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: [],
},config_fyd = {
    calcServerUrl:"https://fyd.meiguanjia.net/calc/",
    originBaseUrl:"https://fyd.meiguanjia.net/",
    gateway : "https://fyd.meiguanjia.net/",
    mobile : "https://fyd.meiguanjia.net/",
    filesMgr : "https://fyd.meiguanjia.net/resource/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://fyd.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
},config_fyd_staging = {
    calcServerUrl:"https://fyd.meiguanjia.net/calc/",
    originBaseUrl:"https://fydstg.meiguanjia.net/",
    gateway : "https://fydstg.meiguanjia.net/",
    mobile : "https://fydstg.meiguanjia.net/",
    filesMgr : "https://fydstg.meiguanjia.net/resource/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://fydstg.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
};

(function(){
    //如果是web版打开备用地址
    if(location.href.indexOf('youngbak.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngbak.meiguanjia.net');
    }else if(location.href.indexOf('young1.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','young1.meiguanjia.net');
    }else if(location.href.indexOf('youngsh.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngsh.meiguanjia.net');
    }else if(location.href.indexOf('younggd.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','younggd.meiguanjia.net');
    }
    var arr = [config,config_test,config_staging];
    for(var i in arr){
        var conf = arr[i];
        for(var j in conf){
            if(typeof conf[j] == 'string'){
                location.protocol === 'http:' && (conf[j] = conf[j].replace('https','http').replace('8049','8039'));
            }
        }
    }
})();
