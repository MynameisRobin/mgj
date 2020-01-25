var config = {
    //生产
    calcServerUrl:"https://calc1.meiguanjia.net",
    originBaseUrl:"https://young.meiguanjia.net/",
    gateway : "https://young.meiguanjia.net/",
    mobile : "https://young.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vip4.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://young.meiguanjia.net/','https://young1.meiguanjia.net/','https://young2.meiguanjia.net/','https://youngbak.meiguanjia.net/','https://younggd.meiguanjia.net/','https://youngsh.meiguanjia.net/'],
},config_develop = {
    originBaseUrl:"http://test3.meiguanjia.net/",
    gateway : "http://test3.meiguanjia.net/",
    mobile : "http://test3.meiguanjia.net/",
    filesMgr : "http://testimg.meiguanjia.net/",
    mykDownloadPage: "http://www.reelidev.cn:8081/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://test3.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
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
    ping: ['http://test1.meiguanjia.net/','http://youngb.meiguanjia.net/']
},config_test2 = {
    calcServerUrl:"http://test2.meiguanjia.net/calc",
    originBaseUrl:"http://test2.meiguanjia.net/",
    gateway : "http://test2.meiguanjia.net/",
    mobile : "http://test2.meiguanjia.net/",
    filesMgr : "https://testimg.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/test2/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://test2.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['http://test2.meiguanjia.net/','http://test3.meiguanjia.net/'],
},config_test_shair = {
    calcServerUrl:"http://testcalc2.meiguanjia.net",
    originBaseUrl:"http://test3.meiguanjia.net/",
    gateway : "http://test3.meiguanjia.net/",
    mobile : "http://test3.meiguanjia.net/",
    filesMgr : "https://testimg.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/test3/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://test3.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['http://test2.meiguanjia.net/','http://test3.meiguanjia.net/']
},config_test_shair_debug = {
    calcServerUrl:"https://testcalc.meiguanjia.net",
    originBaseUrl:"http://youngb.meiguanjia.net/",
    gateway : "http://youngb.meiguanjia.net/",
    mobile : "http://youngb.meiguanjia.net/",
    filesMgr : "https://testimg.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/test3/Meiyike/webapp/apps/",
    wsServer : "http://dev.sentree.com.cn:8039/",
    baseSys:"https://youngb.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['http://test1.meiguanjia.net/','http://youngb.meiguanjia.net/']
},config_staging = {
    calcServerUrl:"https://calcstg.meiguanjia.net",
    originBaseUrl:"https://youngstg.meiguanjia.net/",
    gateway : "https://youngstg.meiguanjia.net/",
    mobile : "https://youngstg.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vipstg.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://youngstg.meiguanjia.net/','https://youngstg2.meiguanjia.net/'],
},config_staging2 = {
    calcServerUrl:"https://calcstg2.meiguanjia.net",
    originBaseUrl:"https://youngstg2.meiguanjia.net/",
    gateway : "https://youngstg2.meiguanjia.net/",
    mobile : "https://youngstg2.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vipstg2.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://youngstg.meiguanjia.net/','https://youngstg2.meiguanjia.net/'],
},config_fyd = {
    calcServerUrl:"https://fyd.meiguanjia.net/calc/",
    originBaseUrl:"https://fyd.meiguanjia.net/",
    gateway : "http://fyd.meiguanjia.net/",
    mobile : "http://fyd.meiguanjia.net/",
    filesMgr : "https://fyd.meiguanjia.net/resource/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://fyd.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
},config_fyd_staging = {
    calcServerUrl:"https://fydstg.meiguanjia.net/calc/",
    originBaseUrl:"https://fydstg.meiguanjia.net/",
    gateway : "http://fydstg.meiguanjia.net/",
    mobile : "http://fydstg.meiguanjia.net/",
    filesMgr : "https://fydstg.meiguanjia.net/resource/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://fydstg.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://fydstg.meiguanjia.net/','http://test3.meiguanjia.net/']
},config_gray = {
    calcServerUrl:"https://calcgray.meiguanjia.net",
    originBaseUrl:"https://younggray.meiguanjia.net/",
    gateway : "https://younggray.meiguanjia.net/",
    mobile : "https://younggray.meiguanjia.net/",
    filesMgr : "https://img.meiguanjia.net/",
    mykDownloadPage: "https://m.meiguanjia.net/Meiyike/webapp/apps/",
    wsServer : "https://socket.meiguanjia.net:8049/",
    baseSys:"https://vip1.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token=",
    ping: ['https://younggray.meiguanjia.net/','https://young.meiguanjia.net/','https://young1.meiguanjia.net/','https://young2.meiguanjia.net/','https://youngbak.meiguanjia.net/','https://younggd.meiguanjia.net/','https://youngsh.meiguanjia.net/'],
};

var serverClusterConfig = {
    'vip': {
        url: 'https://young.meiguanjia.net/',
        ping: ['https://young.meiguanjia.net/','https://young1.meiguanjia.net/','https://young2.meiguanjia.net/','https://youngbak.meiguanjia.net/','https://younggd.meiguanjia.net/','https://youngsh.meiguanjia.net/'],
    },
    'G1': {
        url: 'https://youngg1.meiguanjia.net/',
        ping: ['https://youngg1.meiguanjia.net/','https://youngbakg1.meiguanjia.net/','https://younggdg1.meiguanjia.net/','https://youngshg1.meiguanjia.net/'],
        filesMgr: 'https://imgg1.meiguanjia.net/',
        wsServer: 'https://socketg1.meiguanjia.net/',
        calcServerUrl: 'https://calcg1.meiguanjia.net',
        baseSys: 'https://vip1g1.meiguanjia.net/shair/youngAutoLogin!fromYoung.action?v=mgj&token='
    }
};

var serverClusterConfigStaging = {
    'vip': {
        url: 'https://youngstg2.meiguanjia.net/',
        ping: ['https://youngstg2.meiguanjia.net/','https://youngstg.meiguanjia.net/'],
    },
    'fyd': {
        url: 'https://fydstg.meiguanjia.net/',
        ping: ['https://fydstg.meiguanjia.net/','http://test3.meiguanjia.net/']
    }
};

var serverClusterConfigTest = {
    // '测试集群A': {
    //     url: 'http://test3.meiguanjia.net/',
    //     ping: ['http://test3.meiguanjia.net/','http://test2.meiguanjia.net/']
    // },
    // '测试集群B': {
    //     url: 'http://test1.meiguanjia.net/',
    //     ping: ['http://test1.meiguanjia.net/','http://test1.meiguanjia.net/']
    // }
};

(function(){
    //如果是web版打开备用地址
    if(location.href.indexOf('youngbak.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngbak.meiguanjia.net');
    }else if(location.href.indexOf('young1.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','young1.meiguanjia.net');
    }else if(location.href.indexOf('young2.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','young2.meiguanjia.net');
    }else if(location.href.indexOf('youngsh.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngsh.meiguanjia.net');
    }else if(location.href.indexOf('younggd.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','younggd.meiguanjia.net');
    }else if(location.href.indexOf('youngg1.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngg1.meiguanjia.net');
    }else if(location.href.indexOf('youngbakg1.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngbakg1.meiguanjia.net');
    }else if(location.href.indexOf('younggdg1.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','younggdg1.meiguanjia.net');
    }else if(location.href.indexOf('youngshg1.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','youngshg1.meiguanjia.net');
    }else if(location.href.indexOf('younggray.meiguanjia.net') !== -1){
        config.originBaseUrl = config.gateway = config.originBaseUrl.replace('young.meiguanjia.net','younggray.meiguanjia.net');
    }
    var G1 = serverClusterConfig.G1;
    if(location.href.indexOf('youngg1.meiguanjia.net') !== -1 ||
        location.href.indexOf('youngbakg1.meiguanjia.net') !== -1 ||
        location.href.indexOf('younggdg1.meiguanjia.net') !== -1 ||
        location.href.indexOf('youngshg1.meiguanjia.net') !== -1)
    {
        config.ping = G1.ping;
        config.filesMgr = G1.filesMgr;
        config.wsServer = G1.wsServer;
        config.calcServerUrl = G1.calcServerUrl;
        config.baseSys = G1.baseSys;
    }
    var arr = [config,config_test,config_staging,config_test_shair, config_gray];
    for(var i in arr){
        var conf = arr[i];
        for(var j in conf){
            if(typeof conf[j] == 'string'){
                location.protocol === 'http:' && (conf[j] = conf[j].replace('https','http').replace('8049','8039'));
            }
        }
    }
})();
