webpackJsonp([51],{135:function(t,e,i){t.exports=i.p+"static/img/c_top_bg.014b6db.png"},185:function(t,e,i){"use strict";var a=i(246);i.d(e,"a",function(){return a.a})},246:function(t,e,i){"use strict";e.a={data:function(){return{loginname:"",loginpwd:""}},created:function(){},mounted:function(){},methods:{login:function(){var t=this;if(""==this.loginname||""==this.loginpwd)return void this.$store.dispatch("showToast",{text:"帐号密码不能为空!",type:"text"});var e={username:this.loginname,password:this.loginpwd};this.$api.getJSONP("http://vip11.meiguanjia.net/shair/mgjmonitor!getInfo.action",e,null,function(e,i){if(e)console.error(e.message);else if(0==i.code){console.log(i);var a=i.content,o={};o.parentid=a.parentShopId,o.shopid=a.shopId,o.baseid=a.baseId,o.name=a.shopName,o.address=a.address,o.bymobile=a.mobile;var n={shopJson:JSON.stringify(o)};t.$api.post("regShop",n).success(function(e){0==e.code&&(t.$store.dispatch("showToast",{text:"『"+a.shopName+"』认证成功",type:"success"}),t.$store.commit("setUser",{shopid:e.body}),t.$router.go(-1))})}else t.$store.dispatch("showToast",{text:"需使用「美管加收银系统」的账号登录，请检查账号密码是否正确",type:"text"})})}},computed:{imgStyle:function(){return{height:555*this.$store.state.clientWidth/1440+"px"}},formStyle:function(){return{top:555*this.$store.state.clientWidth/1440+10+"px"}},loginStyle:function(){return{top:555*this.$store.state.clientWidth/1440+175+"px"}},addStyle:function(){return{top:555*this.$store.state.clientWidth/1440+235+"px"}}},watch:{},components:{}}},273:function(t,e,i){e=t.exports=i(19)(),e.push([t.i,'.page .top[data-v-52bcd4c3],.page .top_bg[data-v-52bcd4c3]{position:absolute;width:100%}.page .top[data-v-52bcd4c3]{z-index:1;background-repeat:no-repeat;background-size:cover;padding:15px}.page .top .title[data-v-52bcd4c3]{font-family:\\\\9ED1\\4F53;font-size:1.6rem;margin-bottom:20px;margin-top:20px;color:#fff;font-weight:700}.page .top .label[data-v-52bcd4c3]{padding:2px 0;color:#ffd48e;font-size:.75rem;display:inline-block;margin-right:13px}.page .top .label .iconfont[data-v-52bcd4c3]{color:#ffd48e;margin-right:4px;vertical-align:middle;font-size:.85rem}.page .form[data-v-52bcd4c3]{position:absolute;background-color:#fff}.page .form .title[data-v-52bcd4c3]{color:#777;padding:12px 15px;position:relative;font-family:\\\\9ED1\\4F53}.page .form .title img[data-v-52bcd4c3]{margin-right:10px;vertical-align:sub;height:21px;width:auto}.page .form .item[data-v-52bcd4c3]{height:45px;line-height:45px;padding:5px 15px;position:relative}.page .form .item[data-v-52bcd4c3]:after{content:"";position:absolute;left:15px;right:15px;bottom:0;height:1px;background-color:#f0f0f0}.page .form .item input[data-v-52bcd4c3]{-web-kit-appearance:none;-moz-appearance:none;border:0;outline:0;width:100%;height:80%}.page .form .item input[data-v-52bcd4c3]::-ms-input-placeholder{color:#b2b2b2}.page .form .item input[data-v-52bcd4c3]::-webkit-input-placeholder{color:#b2b2b2}.page .login_btn[data-v-52bcd4c3]{position:absolute;left:15px;right:15px;background-color:#f67300;color:#fff;display:block;line-height:40px;height:40px;text-align:center;border-radius:4.5px;font-size:1.1rem}.page .login_btn[data-v-52bcd4c3]:active{background-color:#b2b2b2;color:#fff}.page .add_business[data-v-52bcd4c3]{position:absolute;left:15px;right:15px;text-align:right;font-size:.8rem;color:#f67300;display:block;padding-bottom:20px;text-decoration:none}',""])},317:function(t,e,i){var a=i(273);"string"==typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);i(20)("f25e11ca",a,!0)},402:function(t,e){t.exports="data:image/png;base64,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"},493:function(t,e,i){"use strict";function a(t){i(317)}Object.defineProperty(e,"__esModule",{value:!0});var o=i(185),n=i(519),s=i(18),c=a,p=s(o.a,n.a,!1,c,"data-v-52bcd4c3",null);e.default=p.exports},519:function(t,e,i){"use strict";var a=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"page grid"},[a("img",{staticClass:"top_bg",style:t.imgStyle,attrs:{src:i(135)}}),t._v(" "),t._m(0),t._v(" "),a("div",{staticClass:"row form",style:t.formStyle},[t._m(1),t._v(" "),a("div",{staticClass:"col-12 item"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.loginname,expression:"loginname"}],attrs:{type:"text",placeholder:"帐号"},domProps:{value:t.loginname},on:{input:function(e){e.target.composing||(t.loginname=e.target.value)}}})]),t._v(" "),a("div",{staticClass:"col-12 item"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.loginpwd,expression:"loginpwd"}],attrs:{type:"password",placeholder:"密码"},domProps:{value:t.loginpwd},on:{input:function(e){e.target.composing||(t.loginpwd=e.target.value)}}})])]),t._v(" "),a("a",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.login},expression:"{methods:login}"}],staticClass:"login_btn",style:t.loginStyle},[t._v("登录")]),t._v(" "),a("router-link",{staticClass:"add_business",style:t.addStyle,attrs:{to:{name:"certificationBus",query:{}},replace:""}},[t._v("提交企业信息")])],1)},o=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"top"},[i("p",{staticClass:"title"},[t._v("\n               企业认证\n           ")]),t._v(" "),i("p",{staticClass:"label"},[i("i",{staticClass:"iconfont icon-dui"}),t._v("独享低价")]),t._v(" "),i("p",{staticClass:"label"},[i("i",{staticClass:"iconfont icon-dui"}),t._v("发货更快")]),t._v(" "),i("p",{staticClass:"label"},[i("i",{staticClass:"iconfont icon-dui"}),t._v("贝币可转赠")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("p",{staticClass:"col-12 title"},[a("img",{attrs:{src:i(402)}}),t._v("客户快速认证\n           ")])}],n={render:a,staticRenderFns:o};e.a=n}});