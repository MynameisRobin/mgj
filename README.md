# APP

#### 项目介绍
小掌柜APP和生意宝APP，此项目使用chrome跨域请求

#### 软件架构
基于jq的am.js框架，封装单页应用生命周期，组件化开发，
所有组件全部获取封装到全局对象am内,比如:am.page代表页面,am.isNull代表方法，am.metadata代表数据对象等

#### 使用说明
5大钩子函数：
1.init() 同步方法，在浏览器reload之后第一个钩子
2.beforeShow() 异步加载，在页面刚进入时响应数据
3.afterShow() 页面全部载入完毕，更新数据
4.beforeHide() 页面点击退出跳转时响应
5.afterHide() 页面完全退出后最后响应 