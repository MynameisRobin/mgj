webpackJsonp([1,10],{105:function(e,t){e.exports=function(e,t){for(var n=[],r={},o=0;o<t.length;o++){var a=t[o],i=a[0],s=a[1],u=a[2],c=a[3],h={id:e+":"+o,css:s,media:u,sourceMap:c};r[i]?r[i].parts.push(h):n.push(r[i]={id:i,parts:[h]})}return n}},12:function(e,t,n){"use strict";function r(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,a){try{var i=t[o](a),s=i.value}catch(e){return void n(e)}if(!i.done)return Promise.resolve(s).then(function(e){r("next",e)},function(e){r("throw",e)});e(s)}return r("next")})}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(2),a=n.n(o),i=n(218),s=function(){return new Promise(function(e){e()}).then(n.bind(null,50))},u=function(){return n.e(54).then(n.bind(null,539))};t.default=function(){var e=r(a.a.mark(function e(t,n){var r,o,c,h;return a.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,s();case 2:return r=e.sent.default,o=new r,e.next=6,u();case 6:return c=e.sent.default,t.use(c),h=new c({routes:i.a}),h.beforeEach(function(e,t,r){var a=window.$app;if(n.commit("changeStatus",{status:"loading"}),window.device2){var i=o.get("oauth");if("applogin"!=e.name&&"dologin"!=e.name)if(null!=i){n.commit("setUser",{appid:i.client_id,token:i.tokenID,refreshToken:i.refresh_token});var s=((new Date).getTime()-i.authentication_time)/1e3;s>=.6*i.limit&&s<i.limit?a?(n.commit("clearUser"),a.$api.post("refresh",{token:i.tokenID,rid:i.refresh_token}).success(function(e){if(0==e.code){var t=e.body.oauth;t.limit=e.body.timelimit,o.delete("oauth"),o.add("oauth",t,{exp:e.body.timelimit}),n.commit("setUser",{appid:t.client_id,token:t.tokenID,refreshToken:t.refresh_token}),r()}}).error(function(e){n.dispatch("showToast",{text:"数据加载失败，请检查您的网络！",type:"cancel"}),r()})):r():s>=i.limit?(r({name:"dologin"}),n.commit("changeStatus",{status:"normal"})):r()}else r({name:"dologin"}),n.commit("changeStatus",{status:"normal"});else r()}else if(null!=t.name&&n.commit("changeRouter",t.fullPath),e.matched.some(function(e){return e.meta.requiresAuth})){var u=o.get("oauth");if(null!=u){n.commit("setUser",{appid:u.client_id,token:u.tokenID,refreshToken:u.refresh_token,openId:u.openId});var c=((new Date).getTime()-u.authentication_time)/1e3;c>=.6*u.limit&&c<u.limit?a?(n.commit("clearUser"),a.$api.post("refresh",{token:u.tokenID,rid:u.refresh_token}).success(function(e){if(0==e.code){var t=e.body.oauth;t.limit=e.body.timelimit,console.log(t),console.log(e.body.timelimit),o.delete("oauth"),o.add("oauth",t,{exp:e.body.timelimit}),console.log({appid:t.client_id,token:t.tokenID,refreshToken:t.refresh_token}),n.commit("setUser",{appid:t.client_id,token:t.tokenID,refreshToken:t.refresh_token,openId:t.openId}),r()}}).error(function(e){n.dispatch("showToast",{text:"数据加载失败，请检查您的网络！",type:"cancel"}),r()})):r():c>=u.limit?(r({name:"wxlogin"}),n.commit("changeStatus",{status:"normal"})):r()}else r({name:"wxlogin"}),n.commit("changeStatus",{status:"normal"})}else r()}),h.afterEach(function(e){n.commit("changeStatus",{status:"normal"})}),e.abrupt("return",h);case 12:case"end":return e.stop()}},e,this)}));return function(t,n){return e.apply(this,arguments)}}()},164:function(e,t,n){"use strict";var r=n(50);t.a={activated:function(){if("wxlogin"==this.$route.name&&"weixin"==this.$store.state.device)window.location.href=this.$store.state.oauth+encodeURIComponent(this.$store.state.root)+"&route="+encodeURIComponent(this.$store.state.nrouter);else if("login"==this.$route.name&&"weixin"==this.$store.state.device){var e=this.$route.params.appId,t=this.$route.params.token,n=this.$route.params.rtoken,o=this.$route.params.router,a=this.$route.params.limit,i=this.$route.params.openId,s=this.$route.params.shopid;console.log("我的shopid是-----------------------------"+s);var u=new r.default;this.$store.commit("setUser",{appid:e,token:t,refreshToken:n,openId:i,shopid:s}),u.delete("oauth"),u.add("oauth",{client_id:e,tokenID:t,refresh_token:n,limit:a,openId:i,shopid:s},{exp:a}),window.location.href=this.$store.state.root+"?#"+o}else if(!("applogin"!=this.$route.name&&"dologin"!=this.$route.name||"android"!=this.$store.state.device&&"ios"!=this.$store.state.device)){var c=new r.default;if(""!=this.$store.state.user.appid&&""!=this.$store.state.user.token&&""!=this.$store.state.user.refreshToken){var h=c.get("loginInfo");this.$route.params.avatar&&""!=this.$route.params.avatar?this.$store.commit("setUser",{headerImg:this.$route.params.avatar}):null!=h&&h.avatar&&this.$store.commit("setUser",{headerImg:h.avatar}),this.$router.replace({name:"v2index"})}else{this.$store.commit("changeStatus",{status:"loading"}),this.$route.params.avatar&&(this.avatar=this.$route.params.avatar),this.$route.params.mobile&&(this.mobile=this.$route.params.mobile),this.$route.params.name&&(this.name=this.$route.params.name),this.$route.params.sex&&(this.sex=this.$route.params.sex);var l=this,p={avatar:this.avatar,mobile:this.mobile,name:this.name,sex:this.sex};""!=this.mobile?(c.delete("loginInfo"),c.add("loginInfo",p,{exp:2592e3})):p=c.get("loginInfo"),p&&p.avatar&&p.mobile&&p.name&&p.sex?(this.$store.commit("setUser",{headerImg:p.avatar}),this.$api.post("login",p,!0).success(function(e){if(0==e.code){var t=e.body.oauth;t.limit=e.body.timelimit,c.delete("oauth"),c.add("oauth",t,{exp:e.body.timelimit}),l.$store.commit("setUser",{appid:t.client_id,token:t.tokenID,refreshToken:t.refresh_token,shopid:t.shopid}),l.$router.replace({name:"v2index"})}}).error(function(e){window.location.href="../index.html"})):window.location.href="../index.html"}}},computed:{isWeb:function(){return"web"==this.$store.state.device}},data:function(){return{appid:"",avatar:"",mobile:"",name:"",sex:""}}}},18:function(e,t){e.exports=function(e,t,n,r,o,a){var i,s=e=e||{},u=typeof e.default;"object"!==u&&"function"!==u||(i=e,s=e.default);var c="function"==typeof s?s.options:s;t&&(c.render=t.render,c.staticRenderFns=t.staticRenderFns,c._compiled=!0),n&&(c.functional=!0),o&&(c._scopeId=o);var h;if(a?(h=function(e){e=e||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext,e||"undefined"==typeof __VUE_SSR_CONTEXT__||(e=__VUE_SSR_CONTEXT__),r&&r.call(this,e),e&&e._registeredComponents&&e._registeredComponents.add(a)},c._ssrRegister=h):r&&(h=r),h){var l=c.functional,p=l?c.render:c.beforeCreate;l?(c._injectStyles=h,c.render=function(e,t){return h.call(t),p(e,t)}):c.beforeCreate=p?[].concat(p,h):[h]}return{esModule:i,exports:s,options:c}}},19:function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var r={},o=0;o<this.length;o++){var a=this[o][0];"number"==typeof a&&(r[a]=!0)}for(o=0;o<t.length;o++){var i=t[o];"number"==typeof i[0]&&r[i[0]]||(n&&!i[2]?i[2]=n:n&&(i[2]="("+i[2]+") and ("+n+")"),e.push(i))}},e}},20:function(e,t,n){function r(e){for(var t=0;t<e.length;t++){var n=e[t],r=h[n.id];if(r){r.refs++;for(var o=0;o<r.parts.length;o++)r.parts[o](n.parts[o]);for(;o<n.parts.length;o++)r.parts.push(a(n.parts[o]));r.parts.length>n.parts.length&&(r.parts.length=n.parts.length)}else{for(var i=[],o=0;o<n.parts.length;o++)i.push(a(n.parts[o]));h[n.id]={id:n.id,refs:1,parts:i}}}}function o(){var e=document.createElement("style");return e.type="text/css",l.appendChild(e),e}function a(e){var t,n,r=document.querySelector('style[data-vue-ssr-id~="'+e.id+'"]');if(r){if(m)return f;r.parentNode.removeChild(r)}if(v){var a=d++;r=p||(p=o()),t=i.bind(null,r,a,!1),n=i.bind(null,r,a,!0)}else r=o(),t=s.bind(null,r),n=function(){r.parentNode.removeChild(r)};return t(e),function(r){if(r){if(r.css===e.css&&r.media===e.media&&r.sourceMap===e.sourceMap)return;t(e=r)}else n()}}function i(e,t,n,r){var o=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=g(t,o);else{var a=document.createTextNode(o),i=e.childNodes;i[t]&&e.removeChild(i[t]),i.length?e.insertBefore(a,i[t]):e.appendChild(a)}}function s(e,t){var n=t.css,r=t.media,o=t.sourceMap;if(r&&e.setAttribute("media",r),o&&(n+="\n/*# sourceURL="+o.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}var u="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!u)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var c=n(105),h={},l=u&&(document.head||document.getElementsByTagName("head")[0]),p=null,d=0,m=!1,f=function(){},v="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());e.exports=function(e,t,n){m=n;var o=c(e,t);return r(o),function(t){for(var n=[],a=0;a<o.length;a++){var i=o[a],s=h[i.id];s.refs--,n.push(s)}t?(o=c(e,t),r(o)):o=[];for(var a=0;a<n.length;a++){var s=n[a];if(0===s.refs){for(var u=0;u<s.parts.length;u++)s.parts[u]();delete h[s.id]}}}};var g=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()},218:function(e,t,n){"use strict";var r=n(472),o=function(e){return n.e(52).then(function(){var t=[n(471)];e.apply(null,t)}.bind(this)).catch(n.oe)},a=function(e){return n.e(22).then(function(){var t=[n(461)];e.apply(null,t)}.bind(this)).catch(n.oe)},i=function(e){return n.e(16).then(function(){var t=[n(467)];e.apply(null,t)}.bind(this)).catch(n.oe)},s=function(e){return n.e(14).then(function(){var t=[n(469)];e.apply(null,t)}.bind(this)).catch(n.oe)},u=function(e){return n.e(27).then(function(){var t=[n(470)];e.apply(null,t)}.bind(this)).catch(n.oe)},c=function(e){return n.e(20).then(function(){var t=[n(468)];e.apply(null,t)}.bind(this)).catch(n.oe)},h=function(e){return n.e(30).then(function(){var t=[n(464)];e.apply(null,t)}.bind(this)).catch(n.oe)},l=function(e){return n.e(19).then(function(){var t=[n(458)];e.apply(null,t)}.bind(this)).catch(n.oe)},p=function(e){return n.e(47).then(function(){var t=[n(460)];e.apply(null,t)}.bind(this)).catch(n.oe)},d=function(e){return n.e(41).then(function(){var t=[n(463)];e.apply(null,t)}.bind(this)).catch(n.oe)},m=function(e){return n.e(35).then(function(){var t=[n(459)];e.apply(null,t)}.bind(this)).catch(n.oe)},f=function(e){return n.e(13).then(function(){var t=[n(457)];e.apply(null,t)}.bind(this)).catch(n.oe)},v=function(e){return n.e(26).then(function(){var t=[n(462)];e.apply(null,t)}.bind(this)).catch(n.oe)},g=function(e){return n.e(42).then(function(){var t=[n(456)];e.apply(null,t)}.bind(this)).catch(n.oe)},b=function(e){return n.e(32).then(function(){var t=[n(465)];e.apply(null,t)}.bind(this)).catch(n.oe)},y=function(e){return n.e(31).then(function(){var t=[n(466)];e.apply(null,t)}.bind(this)).catch(n.oe)},x=function(){return n.e(48).then(n.bind(null,485))},w=function(){return n.e(18).then(n.bind(null,482))},k=function(e){return n.e(24).then(function(){var t=[n(484)];e.apply(null,t)}.bind(this)).catch(n.oe)},_=function(e){return n.e(29).then(function(){var t=[n(475)];e.apply(null,t)}.bind(this)).catch(n.oe)},I=function(e){return n.e(44).then(function(){var t=[n(483)];e.apply(null,t)}.bind(this)).catch(n.oe)},$=function(e){return n.e(23).then(function(){var t=[n(476)];e.apply(null,t)}.bind(this)).catch(n.oe)},A=function(e){return n.e(45).then(function(){var t=[n(480)];e.apply(null,t)}.bind(this)).catch(n.oe)},S=function(e){return n.e(12).then(function(){var t=[n(477)];e.apply(null,t)}.bind(this)).catch(n.oe)},q=function(e){return n.e(17).then(function(){var t=[n(479)];e.apply(null,t)}.bind(this)).catch(n.oe)},T=function(e){return n.e(36).then(function(){var t=[n(473)];e.apply(null,t)}.bind(this)).catch(n.oe)},C=function(e){return n.e(21).then(function(){var t=[n(474)];e.apply(null,t)}.bind(this)).catch(n.oe)},D=function(e){return n.e(46).then(function(){var t=[n(478)];e.apply(null,t)}.bind(this)).catch(n.oe)},j=function(){return n.e(34).then(n.bind(null,481))},O=function(){return n.e(33).then(n.bind(null,486))},E=function(){return n.e(37).then(n.bind(null,490))},U=function(){return n.e(39).then(n.bind(null,488))},R=function(){return n.e(38).then(n.bind(null,489))},N=function(){return n.e(40).then(n.bind(null,487))},z=function(e){return n.e(43).then(function(){var t=[n(492)];e.apply(null,t)}.bind(this)).catch(n.oe)},M=function(e){return n.e(15).then(function(){var t=[n(491)];e.apply(null,t)}.bind(this)).catch(n.oe)},B=function(e){return n.e(51).then(function(){var t=[n(493)];e.apply(null,t)}.bind(this)).catch(n.oe)},P=function(e){return n.e(28).then(function(){var t=[n(494)];e.apply(null,t)}.bind(this)).catch(n.oe)},F=function(e){return n.e(49).then(function(){var t=[n(495)];e.apply(null,t)}.bind(this)).catch(n.oe)},G=[{path:"/login",name:"wxlogin",component:r.a,meta:{trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/login/:appId/:openId/:token/:rtoken/:router/:limit/:shopid?",name:"login",component:r.a,meta:{trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/login/:avatar/:mobile/:name/:sex",name:"applogin",component:r.a,meta:{trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/doLogin",name:"dologin",component:r.a},{path:"/shop/ms",name:"msGoods",component:i},{path:"/shop/pt/:seoid?",name:"ptGoods",component:s,meta:{jsApi:!0}},{path:"/shop/swatches",name:"swatches",component:u,meta:{requiresAuth:!0,trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/shop/goods/order",name:"order",component:c,meta:{requiresAuth:!0,jsApi:!0}},{path:"/my/myorder/",name:"myorder",component:l,meta:{requiresAuth:!0,jsApi:!0}},{path:"/v2/my/address/addAddress",name:"addAddress",component:h,meta:{requiresAuth:!0}},{path:"/my/myorder/orderdetails/ordertracking",name:"ordertracking",component:p,meta:{requiresAuth:!0}},{path:"/v2/my/receiptaddress",name:"receiptaddress",component:d,meta:{requiresAuth:!0}},{path:"/my/myorder/orderdetails",name:"orderdetails",component:m,meta:{requiresAuth:!0,trans:{from:"fadeOut",to:"fadeIn"}}},{path:"/my/exchange",name:"exchange",component:f,meta:{requiresAuth:!0}},{path:"/my/myorder/orderdetails/ptordershare",name:"ptordershare",component:v,meta:{requiresAuth:!0,jsApi:!0,trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/my/bm/:openid/:avatar/:name/:sex/:router/:province/:city/:seoid?",name:"bindmobile",component:g,meta:{trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/shop/apj",name:"apj",component:b,meta:{requiresAuth:!0,jsApi:!0}},{path:"/shop/goods/pj",name:"gpj",component:y,meta:{}},{path:"*",name:"notFound",component:o},{path:"/v2/home",name:"v2home",component:x,children:[{path:"/v2/index",name:"v2index",component:w,meta:{bbtn:!0,jsApi:!0}},{path:"/v2/search",name:"v2search",component:k},{path:"/v2/pt",name:"v2pt",component:I},{path:"/v2/cart",name:"v2cart",component:$,meta:{requiresAuth:!0}},{path:"/v2/my",name:"v2owner",component:a,meta:{requiresAuth:!0}}]},{path:"/v2/brands",name:"v2brands",component:_,meta:{bbtn:!0}},{path:"/v2/success",name:"v2success",component:A,meta:{requiresAuth:!0,trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/v2/dt/:seoid?",name:"v2gdetail",component:S,meta:{jsApi:!0}},{path:"/v2/ad/no1",name:"v2adno1",component:T,meta:{bbtn:!0}},{path:"/v2/goods/order",name:"v2order",component:q,meta:{requiresAuth:!0}},{path:"/v2/my/bh",name:"v2bh",component:C,meta:{requiresAuth:!0,trans:{to:"fadeIn",from:"fadeOut"}}},{path:"/v2/group",name:"v2group",component:D},{path:"/v2/school",name:"toSchool",component:z},{path:"/v2/school/deatil",name:"classDetail",component:M},{path:"/v2/bb",name:"v2bbzq",component:j},{path:"/v2/xinren",name:"v2xinren",component:O,meta:{requiresAuth:!0}},{path:"/v2/xjq",name:"v2xjq",component:E,meta:{requiresAuth:!0,trans:{from:"fadeOut",to:"fadeIn"},bbtn:!0}},{path:"/v2/mycustomer",name:"mycustomer",component:U,meta:{requiresAuth:!0,trans:{from:"fadeOut",to:"fadeIn"},bbtn:!0}},{path:"/v2/myreward",name:"myreward",component:R,meta:{requiresAuth:!0,trans:{from:"fadeOut",to:"fadeIn"},bbtn:!0}},{path:"/v2/apply",name:"myApply",component:N,meta:{requiresAuth:!0,trans:{from:"fadeOut",to:"fadeIn"},bbtn:!0}},{path:"/v2/certification",name:"certification",component:B,meta:{trans:{from:"fadeOut",to:"fadeIn"},requiresAuth:!0}},{path:"/v2/certification_bus",name:"certificationBus",component:P,meta:{requiresAuth:!0}},{path:"/v2/hd20180102",name:"huodong20180102",component:F}];t.a=G},263:function(e,t,n){t=e.exports=n(19)(),t.push([e.i,".mbg[data-v-3c54cde1]{position:absolute;top:0;left:0;width:100%;height:100%;text-align:center;display:-webkit-box;display:-ms-flexbox;display:flex;display:-webkit-flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;background:#fff}span[data-v-3c54cde1]{margin-top:25px;font-size:.9rem;color:#333;padding-right:15px;padding-left:15px;text-align:left;line-height:20px}.lodding_img[data-v-3c54cde1]{width:119.73px;height:240px;margin-right:auto;margin-left:auto;-webkit-transform:translate(30px);transform:translate(30px)}.qr_img[data-v-3c54cde1]{width:200px;margin-top:50px;margin-right:auto;margin-left:auto}",""])},307:function(e,t,n){var r=n(263);"string"==typeof r&&(r=[[e.i,r,""]]),r.locals&&(e.exports=r.locals);n(20)("7f97f96e",r,!0)},385:function(e,t,n){e.exports=n.p+"static/img/qrcode.8efc383.jpg"},472:function(e,t,n){"use strict";function r(e){n(307)}var o=n(164),a=n(509),i=n(18),s=r,u=i(o.a,a.a,!1,s,"data-v-3c54cde1",null);t.a=u.exports},50:function(e,t,n){"use strict";function r(e,t){for(var n in t)e[n]=t[n];return e}function o(e){var t=!1;if(e&&e.setItem){t=!0;var n="__"+Math.round(1e7*Math.random());try{e.setItem(n,n),e.removeItem(n)}catch(e){t=!1}}return t}function a(e){return"string"===(void 0===e?"undefined":m(e))&&window[e]instanceof Storage?window[e]:e}function i(e){return"[object Date]"===Object.prototype.toString.call(e)&&!isNaN(e.getTime())}function s(e,t){if(t=t||new Date,"number"==typeof e?e=e===1/0?f:new Date(t.getTime()+1e3*e):"string"==typeof e&&(e=new Date(e)),e&&!i(e))throw new Error("`expires` parameter cannot be converted to a valid Date instance");return e}function u(e){var t=!1;if(e)if(e.code)switch(e.code){case 22:t=!0;break;case 1014:"NS_ERROR_DOM_QUOTA_REACHED"===e.name&&(t=!0)}else-2147024882===e.number&&(t=!0);return t}function c(e,t){this.c=(new Date).getTime(),t=t||v;var n=s(t);this.e=n.getTime(),this.v=e}function h(e){return"object"===(void 0===e?"undefined":m(e))&&!!(e&&"c"in e&&"e"in e&&"v"in e)}function l(e){return(new Date).getTime()<e.e}function p(e){return"string"!=typeof e&&(console.warn(e+" used as a key, but it is not a string."),e=String(e)),e}function d(e){var t={storage:"localStorage",exp:1/0},n=r(t,e),s=n.exp;if(s&&"number"!=typeof s&&!i(s))throw new Error("Constructor `exp` parameter cannot be converted to a valid Date instance");v=s;var u=a(n.storage),c=o(u);this.isSupported=function(){return c},c?(this.storage=u,this.quotaExceedHandler=function(e,t,n,r){if(console.warn("Quota exceeded!"),n&&!0===n.force){var o=this.deleteAllExpires();console.warn("delete all expires CacheItem : ["+o+"] and try execute `set` method again!");try{n.force=!1,this.set(e,t,n)}catch(e){console.warn(e)}}}):r(this,b)}Object.defineProperty(t,"__esModule",{value:!0});var m="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},f=new Date("Fri, 31 Dec 9999 23:59:59 UTC"),v=f,g={serialize:function(e){return JSON.stringify(e)},deserialize:function(e){return e&&JSON.parse(e)}},b={set:function(e,t,n){},get:function(e){},delete:function(e){},deleteAllExpires:function(){},clear:function(){},add:function(e,t){},replace:function(e,t,n){},touch:function(e,t){}},y={set:function(e,t,n){if(e=p(e),n=r({force:!0},n),void 0===t)return this.delete(e);var o=g.serialize(t),a=new c(o,n.exp);try{this.storage.setItem(e,g.serialize(a))}catch(t){u(t)?this.quotaExceedHandler(e,o,n,t):console.error(t)}return t},get:function(e){e=p(e);var t=null;try{t=g.deserialize(this.storage.getItem(e))}catch(e){return null}if(h(t)){if(l(t)){var n=t.v;return g.deserialize(n)}this.delete(e)}return null},delete:function(e){return e=p(e),this.storage.removeItem(e),e},deleteAllExpires:function(){for(var e=this.storage.length,t=[],n=this,r=0;r<e;r++){var o=this.storage.key(r),a=null;try{a=g.deserialize(this.storage.getItem(o))}catch(e){}if(null!==a&&void 0!==a.e){(new Date).getTime()>=a.e&&t.push(o)}}return t.forEach(function(e){n.delete(e)}),t},clear:function(){this.storage.clear()},add:function(e,t,n){e=p(e),n=r({force:!0},n);try{var o=g.deserialize(this.storage.getItem(e));if(!h(o)||!l(o))return this.set(e,t,n),!0}catch(r){return this.set(e,t,n),!0}return!1},replace:function(e,t,n){e=p(e);var r=null;try{r=g.deserialize(this.storage.getItem(e))}catch(e){return!1}if(h(r)){if(l(r))return this.set(e,t,n),!0;this.delete(e)}return!1},touch:function(e,t){e=p(e);var n=null;try{n=g.deserialize(this.storage.getItem(e))}catch(e){return!1}if(h(n)){if(l(n))return this.set(e,this.get(e),{exp:t}),!0;this.delete(e)}return!1}};d.prototype=y,t.default=d},509:function(e,t,n){"use strict";var r=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"cc"},[r("div",{staticClass:"mbg"},[e.isWeb?r("img",{staticClass:"qr_img",attrs:{src:n(385)}}):e._e(),e._v(" "),e.isWeb?r("span",[e._v("尊敬的客户您好，美美汇商城目前仅针对于广东地区开放，其它区域还请再耐心等待。广东地区的客户扫描二维码，关注公众号后即可下单采购。")]):e._e()])])},o=[],a={render:r,staticRenderFns:o};t.a=a}});