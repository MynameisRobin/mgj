var themeSetting = {
    url: './$dynamicResource/theme.txt',
    color: {
        standard: '#40c9c9',
        dark: '#24aca8',
        light: '#37dbdb'
    },
    // start: function(){
    //     if(location.protocol.indexOf('http')==-1){
    //         try {
    //             var _this = this;
    //             setTimeout(function() {
    //                 navigator.appplugin.getAppInfo(function(ret) {
    //                     var APPINFO = JSON.parse(ret);
    //                     if(APPINFO.tenantid && !isNaN(APPINFO.tenantid)){
    //                         _this.set(APPINFO.tenantid)
    //                     }else {
    //                         _this.set();
    //                     }
    //                 });
    //             }, 100)
    //         } catch (error) {
    //             this.set();
    //         }
    //     }else {
    //         this.set();
    //     }
    // },
    set: function(parentShopId){
        var shopInfo,
            lastShopInfo = this.getShopInfo();
        if(parentShopId){
            shopInfo = parentShopId;
            localStorage.setItem('themeConfig',parentShopId);
        }else {
            shopInfo = this.getShopInfo();
        }
        if(!shopInfo){
            this.hideLoginLogo();
            this.removeStyle();
            return;
        }
        if(lastShopInfo && shopInfo != lastShopInfo){
            this.hideLoginLogo();
            this.removeStyle();
        }    
        var themeConfig = this.getThemeConfig(shopInfo);
        if(!themeConfig){
            this.showLoginLogo();
            this.removeStyle();
            return;
        }
        this.hideLoginLogo();
        this.loadStyle();
    },
    getShopInfo: function(){
        var userToken = localStorage.getItem('themeConfig');
        return userToken;
    },
    getThemeConfig: function(parentShopId){
        if(themeConfigJSON){
            for(var pid in themeConfigJSON){
                if(pid == parentShopId){
                    this.themeConfig = themeConfigJSON[pid];
                    return themeConfigJSON[pid];
                }
            }
        }
        return null;
    },
    hideLoginLogo: function(){
        var loginPage = document.querySelector('#page_login'),
            logoImage = loginPage.querySelector('.logo'),
            logoWords = loginPage.querySelector('.words'),
            downApp = loginPage.querySelector('.downApp'),
            foot = loginPage.querySelector('.foot');
        logoImage.style.visibility = 'hidden';
        logoWords.style.visibility = 'hidden';
        downApp.style.visibility = 'hidden';
        foot.style.visibility = 'hidden';
    },
    showLoginLogo: function(){
        var loginPage = document.querySelector('#page_login'),
            logoImage = loginPage.querySelector('.logo'),
            logoWords = loginPage.querySelector('.words'),
            downApp = loginPage.querySelector('.downApp'),
            foot = loginPage.querySelector('.foot');
        logoImage.style.visibility = 'visible';
        logoWords.style.visibility = 'visible';
        downApp.style.visibility = 'visible';
        foot.style.visibility = 'visible';
    },
    loadStyle: function(){
        this.removeStyle();
        var _this = this;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('get', this.url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send();
        xmlhttp.onreadystatechange = function (){
            if(xmlhttp.readyState == 4){
                // console.log(xmlhttp.responseText)
                var styleContent = _this.changeStyle(xmlhttp.responseText);
                var style = document.createElement('style');
                style.setAttribute('href',_this.url);
                style.innerHTML = styleContent;
                document.body.appendChild(style);
            }
        };
    },
    removeStyle: function(){
        var styles = document.getElementsByTagName('style');
        for(var i=0;i<styles.length;i++){
            var href = styles[i].getAttribute('href');
            if(href == this.url){
                document.body.removeChild(styles[i]);
                break;
            }
        }
    },
    changeStyle: function(style){
        style = style.replace(RegExp(this.color.standard,'g'),this.themeConfig.color.standard);
        style = style.replace(RegExp(this.color.dark,'g'),this.themeConfig.color.dark);
        style = style.replace(RegExp(this.color.light,'g'),this.themeConfig.color.light);
        style = style.replace(/\$directory/g,'$dynamicResource');
        return style;
    }
}
themeSetting.set();