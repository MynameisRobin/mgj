webpackJsonp([34],{173:function(t,i,e){"use strict";var s=e(234);e.d(i,"a",function(){return s.a})},195:function(t,i,e){t.exports=e.p+"static/img/fengsangban.7f668ae.png"},21:function(t,i,e){"use strict";function s(){for(var t=navigator.userAgent,i=["Android","iPhone","Windows Phone","iPad","iPod"],e=!0,s=0;s<i.length;s++)if(t.indexOf(i[s])>0){e=!1;break}return e}var a=e(23),n=e(22),o=e(24);i.a={model:{prop:"alloy",event:"create"},props:{pullDown:{type:Boolean,default:!1},pullUp:{type:Boolean,default:!1},topButton:{type:Boolean,default:!1},topPosition:{type:Number,default:500},top:{type:Number,default:0},bottom:{type:Number,default:0},left:{type:Number,default:0},right:{type:Number,default:0},background:{type:String,default:"#F5F5F5"},property:{type:String,default:"translateY"},vertical:{type:Boolean,default:!0},sensitivity:{type:Number,default:1},factor:{type:Number,default:1},step:{type:Number,default:45},pullUpStatus:{type:String,default:"normal"},pullDownStatus:{type:String,default:"normal"},alloy:{type:Object,default:function(){return{}}}},data:function(){return{al:"",timeInterval:"",astatus:this.pullDownStatus,astatus1:this.pullUpStatus,pullDownText:"下拉刷新",pullUpText:"上拉刷新",boxHeight:0,containerHeight:9999,position:0}},deactivated:function(){clearInterval(this.timeInterval),this.timeInterval="",this.$refs.box.onscroll=null},beforeDestroy:function(){clearInterval(this.timeInterval),this.timeInterval="",this.$refs.box.onscroll=null},activated:function(){var t=this;s()&&(this.$refs.box.onscroll=function(){"stop"!=t.astatus1&&t.$refs.container.clientHeight-t.$refs.box.clientHeight-t.$refs.box.scrollTop<100&&t.$emit("pullup:loading")}),""!=this.timeInterval||s()||(this.timeInterval=setInterval(function(){t.refresh()},100))},computed:{styles:function(){return"ios"!=this.$store.state.device?{background:this.background,top:this.top+"px",left:this.left+"px",right:this.right+"px",bottom:this.bottom+"px","overflow-y":s()?"auto":"hidden"}:{background:this.background,top:this.top+20+"px",left:this.left+"px",right:this.right+"px",bottom:this.bottom+"px","overflow-y":s()?"auto":"hidden"}},topStyles:function(){return"ios"!=this.$store.state.device?{top:this.top-40+"px",left:this.left+"px",right:this.right+"px",height:"40px"}:{background:this.background,top:this.top-20+"px",left:this.left+"px",right:this.right+"px",height:"40px"}},bottomStyles:function(){return"ios"!=this.$store.state.device?{top:this.top+this.containerHeight+"px",left:this.left+"px",right:this.right+"px",height:"40px"}:{top:this.top+this.containerHeight+20+"px",left:this.left+"px",right:this.right+"px",height:"40px"}}},mounted:function(){var t=this;if(s())return this.$emit("update:alloy",{to:function(){},stop:function(){}}),void(this.$refs.box.onscroll=function(){"stop"!=t.astatus1&&t.$refs.container.clientHeight-t.$refs.box.clientHeight-t.$refs.box.scrollTop<100&&t.$emit("pullup:loading")});this.$nextTick(function(){var t=this;e.i(n.a)(this.$refs.container,!0),this.pullDown&&e.i(n.a)(this.$refs.pullDown),this.pullUp&&e.i(n.a)(this.$refs.pullUp);var i=this;this.al=new a.a({touch:this.$refs.box,vertical:this.vertical,target:this.$refs.container,property:this.property,min:0,max:0,sensitivity:this.sensitivity,factor:this.factor,step:this.step,bindSelf:!1,initialValue:0,maxSpeed:2,change:function(t){return i.$emit("change",t),i.position=t,i.change(t)},touchStart:function(t,e){return i.$emit("touchStart",e,t),i.position=e,i.touchStart(t,e)},touchMove:function(t,e){return i.$emit("touchMove",e,t),i.position=e,i.touchMove(t,e)},touchEnd:function(t,e){return i.$emit("touchEnd",e,t),i.position=e,i.touchEnd(t,e)},tap:function(t,e){return i.$emit("tap",t,e),i.position=e,i.tap(t,e)},pressMove:function(t,e){return i.$emit("pressMove",e,t),i.position=e,i.pressMove(t,e)},animationEnd:function(t){return i.$emit("animationEnd",t),i.position=t,i.onAnimationEnd(t)}}),this.$emit("create",this.al),this.$emit("update:alloy",this.al),""==this.timeInterval&&(this.timeInterval=setInterval(function(){t.refresh()},100))})},methods:{refresh:function(){this&&this.$refs&&this.$refs.container&&this.$refs.container.clientHeight&&(this.$refs.container.clientHeight<=this.$refs.box.clientHeight?(this.al.min=0,this.containerHeight=this.$refs.container.clientHeight,this.boxHeight=this.$refs.box.clientHeight):(this.containerHeight=this.$refs.container.clientHeight,this.boxHeight=this.$refs.box.clientHeight,this.al.min=this.boxHeight-this.containerHeight))},touchStart:function(t,i){},touchMove:function(t,i){i>60&&this.pullDown?(this.$refs.arrowDown.classList.add("arrow_up"),this.pullDownText="释放更新"):this.pullDown&&(this.$refs.arrowDown.classList.remove("arrow_up"),this.pullDownText="下拉刷新"),i<this.boxHeight-this.containerHeight-60&&this.pullUp?(this.$refs.arrowUp.classList.add("arrow_down"),this.pullUpText="释放刷新"):this.pullUp&&(this.$refs.arrowUp.classList.remove("arrow_down"),this.pullUpText="上拉刷新")},change:function(t){this.$refs.pullDown&&(this.$refs.pullDown.translateY=t),this.$refs.pullUp&&(this.$refs.pullUp.translateY=t)},touchEnd:function(t,i){return i>60&&this.pullDown&&"normal"==this.astatus?(this.al.to(40),this.pullDownText="加载中",this.astatus="loading-down",this.$emit("pulldown:loading",this.astatus),!1):"loading-down"==this.astatus&&this.pullDown?(this.al.to(40),!1):i<this.boxHeight-this.containerHeight-60&&this.containerHeight>=this.boxHeight&&this.pullUp&&"normal"==this.astatus1?(this.al.to(this.boxHeight-this.containerHeight-40),this.pullDownText="加载中",this.astatus1="loading-up",this.$emit("pullup:loading",this.astatus1),!1):"loading-up"==this.astatus1&&this.pullUp?(this.al.to(this.boxHeight-this.containerHeight-40),!1):void 0},tap:function(t,i){},pressMove:function(t,i){},onAnimationEnd:function(t){}},watch:{pullDownStatus:function(t,i){var e=this;"loading-down"==i&&"normal"==t&&(this.al.to(0),setTimeout(function(){e.pullDownText="下拉刷新",e.astatus=t},300))},pullUpStatus:function(t,i){var e=this;this.astatus1="",setTimeout(function(){e.astatus1=t},100),"loading-up"==i&&"normal"==t&&(this.pullDownText="上拉刷新")}},components:{divider:o.a}}},22:function(t,i,e){"use strict";function s(t,i,e){for(var s=0,n=i.length;s<n;s++){a(t,i[s],e)}}function a(t,i,e){Object.defineProperty(t,i,{get:function(){return this["_"+i]},set:function(t){this["_"+i]=t,e()}})}function n(t){return"object"===("undefined"==typeof HTMLElement?"undefined":r(HTMLElement))?t instanceof HTMLElement:t&&"object"===(void 0===t?"undefined":r(t))&&null!==t&&1===t.nodeType&&"string"==typeof t.nodeName}function o(t,i){if(!t.hasOwnProperty("translateX")){var e=["translateX","translateY","translateZ","scaleX","scaleY","scaleZ","rotateX","rotateY","rotateZ","skewX","skewY","originX","originY","originZ"],a=n(t);i||e.push("perspective"),s(t,e,function(){var e=t.matrix3d.identity().appendTransform(t.translateX,t.translateY,t.translateZ,t.scaleX,t.scaleY,t.scaleZ,t.rotateX,t.rotateY,t.rotateZ,t.skewX,t.skewY,t.originX,t.originY,t.originZ),s=(i?"":"perspective("+t.perspective+"px) ")+"matrix3d("+Array.prototype.slice.call(e.elements).join(",")+")";a?t.style.transform=t.style.msTransform=t.style.OTransform=t.style.MozTransform=t.style.webkitTransform=s:t.transform=s}),t.matrix3d=new h,i||(t.perspective=500),t.scaleX=t.scaleY=t.scaleZ=1,t.translateX=t.translateY=t.translateZ=t.rotateX=t.rotateY=t.rotateZ=t.skewX=t.skewY=t.originX=t.originY=t.originZ=0}}var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},l=.017453292519943295,h=function(t,i,e,s,a,n,o,r,l,h,c,p,u,d,g,m){this.elements=window.Float32Array?new Float32Array(16):[];var v=this.elements;v[0]=void 0!==t?t:1,v[4]=i||0,v[8]=e||0,v[12]=s||0,v[1]=a||0,v[5]=void 0!==n?n:1,v[9]=o||0,v[13]=r||0,v[2]=l||0,v[6]=h||0,v[10]=void 0!==c?c:1,v[14]=p||0,v[3]=u||0,v[7]=d||0,v[11]=g||0,v[15]=void 0!==m?m:1};h.prototype={set:function(t,i,e,s,a,n,o,r,l,h,c,p,u,d,g,m){var v=this.elements;return v[0]=t,v[4]=i,v[8]=e,v[12]=s,v[1]=a,v[5]=n,v[9]=o,v[13]=r,v[2]=l,v[6]=h,v[10]=c,v[14]=p,v[3]=u,v[7]=d,v[11]=g,v[15]=m,this},identity:function(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this},multiplyMatrices:function(t,i){var e=t.elements,s=this.elements,a=e[0],n=e[4],o=e[8],r=e[12],l=e[1],h=e[5],c=e[9],p=e[13],u=e[2],d=e[6],g=e[10],m=e[14],v=e[3],f=e[7],b=e[11],A=e[15],x=i[0],w=i[1],y=i[2],M=i[3],_=i[4],C=i[5],D=i[6],k=i[7],E=i[8],I=i[9],T=i[10],Y=i[11],U=i[12],X=i[13],S=i[14],H=i[15];return s[0]=a*x+n*_+o*E+r*U,s[4]=a*w+n*C+o*I+r*X,s[8]=a*y+n*D+o*T+r*S,s[12]=a*M+n*k+o*Y+r*H,s[1]=l*x+h*_+c*E+p*U,s[5]=l*w+h*C+c*I+p*X,s[9]=l*y+h*D+c*T+p*S,s[13]=l*M+h*k+c*Y+p*H,s[2]=u*x+d*_+g*E+m*U,s[6]=u*w+d*C+g*I+m*X,s[10]=u*y+d*D+g*T+m*S,s[14]=u*M+d*k+g*Y+m*H,s[3]=v*x+f*_+b*E+A*U,s[7]=v*w+f*C+b*I+A*X,s[11]=v*y+f*D+b*T+A*S,s[15]=v*M+f*k+b*Y+A*H,this},_rounded:function(t,i){return i=Math.pow(10,i||15),Math.round(t*i)/i},_arrayWrap:function(t){return window.Float32Array?new Float32Array(t):t},appendTransform:function(t,i,e,s,a,n,o,r,h,c,p,u,d,g){var m=o*l,v=this._rounded(Math.cos(m)),f=this._rounded(Math.sin(m)),b=r*l,A=this._rounded(Math.cos(b)),x=this._rounded(Math.sin(b)),w=h*l,y=this._rounded(Math.cos(-1*w)),M=this._rounded(Math.sin(-1*w));return this.multiplyMatrices(this,this._arrayWrap([1,0,0,t,0,v,f,i,0,-f,v,e,0,0,0,1])),this.multiplyMatrices(this,this._arrayWrap([A,0,x,0,0,1,0,0,-x,0,A,0,0,0,0,1])),this.multiplyMatrices(this,this._arrayWrap([y*s,M*a,0,0,-M*s,y*a,0,0,0,0,1*n,0,0,0,0,1])),(c||p)&&this.multiplyMatrices(this,this._arrayWrap([this._rounded(Math.cos(c*l)),this._rounded(Math.sin(c*l)),0,0,-1*this._rounded(Math.sin(p*l)),this._rounded(Math.cos(p*l)),0,0,0,0,1,0,0,0,0,1])),(u||d||g)&&(this.elements[12]-=u*this.elements[0]+d*this.elements[4]+g*this.elements[8],this.elements[13]-=u*this.elements[1]+d*this.elements[5]+g*this.elements[9],this.elements[14]-=u*this.elements[2]+d*this.elements[6]+g*this.elements[10]),this}};var c=function(t,i,e,s,a,n){return this.a=null==t?1:t,this.b=i||0,this.c=e||0,this.d=null==s?1:s,this.tx=a||0,this.ty=n||0,this};c.prototype={identity:function(){return this.a=this.d=1,this.b=this.c=this.tx=this.ty=0,this},appendTransform:function(t,i,e,s,a,n,o,r,h){if(a%360)var c=a*l,p=Math.cos(c),u=Math.sin(c);else p=1,u=0;return n||o?(n*=l,o*=l,this.append(Math.cos(o),Math.sin(o),-Math.sin(n),Math.cos(n),t,i),this.append(p*e,u*e,-u*s,p*s,0,0)):this.append(p*e,u*e,-u*s,p*s,t,i),(r||h)&&(this.tx-=r*this.a+h*this.c,this.ty-=r*this.b+h*this.d),this},append:function(t,i,e,s,a,n){var o=this.a,r=this.b,l=this.c,h=this.d;return this.a=t*o+i*l,this.b=t*r+i*h,this.c=e*o+s*l,this.d=e*r+s*h,this.tx=a*o+n*l+this.tx,this.ty=a*r+n*h+this.ty,this},initialize:function(t,i,e,s,a,n){return this.a=t,this.b=i,this.c=e,this.d=s,this.tx=a,this.ty=n,this},setValues:function(t,i,e,s,a,n){return this.a=null==t?1:t,this.b=i||0,this.c=e||0,this.d=null==s?1:s,this.tx=a||0,this.ty=n||0,this},copy:function(t){return this.setValues(t.a,t.b,t.c,t.d,t.tx,t.ty)}},o.getMatrix3D=function(t){var i={translateX:0,translateY:0,translateZ:0,rotateX:0,rotateY:0,rotateZ:0,skewX:0,skewY:0,originX:0,originY:0,originZ:0,scaleX:1,scaleY:1,scaleZ:1};for(var e in t)t.hasOwnProperty(e)&&(i[e]=t[e]);return(new h).identity().appendTransform(i.translateX,i.translateY,i.translateZ,i.scaleX,i.scaleY,i.scaleZ,i.rotateX,i.rotateY,i.rotateZ,i.skewX,i.skewY,i.originX,i.originY,i.originZ).elements},o.getMatrix2D=function(t){var i={translateX:0,translateY:0,rotation:0,skewX:0,skewY:0,originX:0,originY:0,scaleX:1,scaleY:1};for(var e in t)t.hasOwnProperty(e)&&(i[e]=t[e]);return(new c).identity().appendTransform(i.translateX,i.translateY,i.scaleX,i.scaleY,i.rotation,i.skewX,i.skewY,i.originX,i.originY)},i.a=o},23:function(t,i,e){"use strict";function s(t,i,e){t.addEventListener(i,e,!1)}function a(t){return Math.sqrt(1-Math.pow(t-1,2))}function n(t){return 1-Math.sqrt(1-t*t)}function o(t,i){for(var e in i)if(i[e].test(t[e]))return!0;return!1}var r=function(t){this.element="string"==typeof t.touch?document.querySelector(t.touch):t.touch,this.target=this._getValue(t.target,this.element),this.vertical=this._getValue(t.vertical,!0),this.property=t.property,this.tickID=0,this.initialValue=this._getValue(t.initialValue,this.target[this.property]),this.target[this.property]=this.initialValue,this.fixed=this._getValue(t.fixed,!1),this.sensitivity=this._getValue(t.sensitivity,1),this.moveFactor=this._getValue(t.moveFactor,1),this.factor=this._getValue(t.factor,1),this.outFactor=this._getValue(t.outFactor,.3),this.min=t.min,this.max=t.max,this.deceleration=6e-4,this.maxRegion=this._getValue(t.maxRegion,600),this.springMaxRegion=this._getValue(t.springMaxRegion,60),this.maxSpeed=t.maxSpeed,this.hasMaxSpeed=!(void 0===this.maxSpeed),this.lockDirection=this._getValue(t.lockDirection,!0);var i=function(){};if(this.change=t.change||i,this.touchEnd=t.touchEnd||i,this.touchStart=t.touchStart||i,this.touchMove=t.touchMove||i,this.touchCancel=t.touchCancel||i,this.reboundEnd=t.reboundEnd||i,this.animationEnd=t.animationEnd||i,this.correctionEnd=t.correctionEnd||i,this.tap=t.tap||i,this.pressMove=t.pressMove||i,this.preventDefault=this._getValue(t.preventDefault,!0),this.preventDefaultException={tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},this.hasMin=!(void 0===this.min),this.hasMax=!(void 0===this.max),this.hasMin&&this.hasMax&&this.min>this.max)throw"the min value can't be greater than the max value.";this.isTouchStart=!1,this.step=t.step,this.inertia=this._getValue(t.inertia,!0),this._calculateIndex(),this.eventTarget=window,t.bindSelf&&(this.eventTarget=this.element),this._moveHandler=this._move.bind(this),s(this.element,"touchstart",this._start.bind(this)),s(this.eventTarget,"touchend",this._end.bind(this)),s(this.eventTarget,"touchcancel",this._cancel.bind(this)),this.eventTarget.addEventListener("touchmove",this._moveHandler,{passive:!1,capture:!1}),this.x1=this.x2=this.y1=this.y2=null};r.prototype={_getValue:function(t,i){return void 0===t?i:t},_start:function(t){this.isTouchStart=!0,this.touchStart.call(this,t,this.target[this.property]),cancelAnimationFrame(this.tickID),this._calculateIndex(),this.startTime=(new Date).getTime(),this.x1=this.preX=t.touches[0].pageX,this.y1=this.preY=t.touches[0].pageY,this.start=this.vertical?this.preY:this.preX,this._firstTouchMove=!0,this._preventMove=!1},stop:function(){cancelAnimationFrame(this.tickID),this._calculateIndex()},_move:function(t){if(this.isTouchStart){var i=t.touches.length,e=t.touches[0].pageX,s=t.touches[0].pageY;if(this._firstTouchMove&&this.lockDirection){var a=Math.abs(e-this.x1)-Math.abs(s-this.y1);a>0&&this.vertical?this._preventMove=!0:a<0&&!this.vertical&&(this._preventMove=!0),this._firstTouchMove=!1}if(!this._preventMove){var n=(this.vertical?s-this.preY:e-this.preX)*this.sensitivity,r=this.moveFactor;this.hasMax&&this.target[this.property]>this.max&&n>0?r=this.outFactor:this.hasMin&&this.target[this.property]<this.min&&n<0&&(r=this.outFactor),n*=r,this.preX=e,this.preY=s,this.fixed||(this.target[this.property]+=n),this.change.call(this,this.target[this.property]);var l=(new Date).getTime();l-this.startTime>300&&(this.startTime=l,this.start=this.vertical?this.preY:this.preX),this.touchMove.call(this,t,this.target[this.property])}this.preventDefault&&!o(t.target,this.preventDefaultException)&&t.preventDefault(),1===i&&(null!==this.x2?(t.deltaX=e-this.x2,t.deltaY=s-this.y2):(t.deltaX=0,t.deltaY=0),this.pressMove.call(this,t,this.target[this.property])),this.x2=e,this.y2=s}},_cancel:function(t){var i=this.target[this.property];this.touchCancel.call(this,t,i),this._end(t)},to:function(t,i,e){this._to(t,this._getValue(i,600),e||a,this.change,function(t){this._calculateIndex(),this.reboundEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this))},_calculateIndex:function(){this.hasMax&&this.hasMin&&(this.currentPage=Math.round((this.max-this.target[this.property])/this.step))},_end:function(t){if(this.isTouchStart){this.isTouchStart=!1;var i=this,e=this.target[this.property],s=Math.abs(t.changedTouches[0].pageX-this.x1)<30&&Math.abs(t.changedTouches[0].pageY-this.y1)<30;if(s&&(this.preventDefault&&o(t.target,this.preventDefaultException)&&t.target.focus(),this.tap.call(this,t,e)),!1===this.touchEnd.call(this,t,e,this.currentPage))return;if(this.hasMax&&e>this.max)this._to(this.max,200,a,this.change,function(t){this.reboundEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this));else if(this.hasMin&&e<this.min)this._to(this.min,200,a,this.change,function(t){this.reboundEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this));else if(!this.inertia||s||this._preventMove)i._correction();else{var r=(new Date).getTime()-this.startTime;if(r<300){var l=((this.vertical?t.changedTouches[0].pageY:t.changedTouches[0].pageX)-this.start)*this.sensitivity,h=Math.abs(l)/r,c=this.factor*h;this.hasMaxSpeed&&c>this.maxSpeed&&(c=this.maxSpeed);var p=e+c*c/(2*this.deceleration)*(l<0?-1:1),u=1;p<this.min?p<this.min-this.maxRegion?(u=n((e-this.min+this.springMaxRegion)/(e-p)),p=this.min-this.springMaxRegion):(u=n((e-this.min+this.springMaxRegion*(this.min-p)/this.maxRegion)/(e-p)),p=this.min-this.springMaxRegion*(this.min-p)/this.maxRegion):p>this.max&&(p>this.max+this.maxRegion?(u=n((this.max+this.springMaxRegion-e)/(p-e)),p=this.max+this.springMaxRegion):(u=n((this.max+this.springMaxRegion*(p-this.max)/this.maxRegion-e)/(p-e)),p=this.max+this.springMaxRegion*(p-this.max)/this.maxRegion));var d=Math.round(h/i.deceleration)*u;i._to(Math.round(p),d,a,i.change,function(t){i.hasMax&&i.target[i.property]>i.max?(cancelAnimationFrame(i.tickID),i._to(i.max,600,a,i.change,i.animationEnd)):i.hasMin&&i.target[i.property]<i.min?(cancelAnimationFrame(i.tickID),i._to(i.min,600,a,i.change,i.animationEnd)):i.step?i._correction():i.animationEnd.call(i,t),i.change.call(this,t)})}else i._correction()}}this.x1=this.x2=this.y1=this.y2=null},_to:function(t,i,e,s,a){if(!this.fixed){var n=this.target,o=this.property,r=n[o],l=t-r,h=new Date,c=this;!function p(){var u=new Date-h;if(u>=i)return n[o]=t,s&&s.call(c,t),void(a&&a.call(c,t));n[o]=l*e(u/i)+r,c.tickID=requestAnimationFrame(p),s&&s.call(c,n[o])}()}},_correction:function(){if(void 0!==this.step){var t=this.target,i=this.property,e=t[i],s=Math.floor(Math.abs(e/this.step)),n=e%this.step;Math.abs(n)>this.step/2?this._to((e<0?-1:1)*(s+1)*this.step,400,a,this.change,function(t){this._calculateIndex(),this.correctionEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this)):this._to((e<0?-1:1)*s*this.step,400,a,this.change,function(t){this._calculateIndex(),this.correctionEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this))}}},i.a=r},234:function(t,i,e){"use strict";var s=e(25);i.a={data:function(){return{asc:null}},created:function(){},mounted:function(){},methods:{backPage:function(){this.$router.replace({name:"v2home"})},goToDetail:function(t){var i=t.id;this.$router.push({name:"v2gdetail",query:{gid:i}})}},computed:{itemImgStyle:function(){return{height:5*document.body.clientWidth/16+"px"}}},watch:{},components:{scroller:s.a}}},24:function(t,i,e){"use strict";var s=e(31);e.d(i,"a",function(){return s.a})},25:function(t,i,e){"use strict";var s=e(32);e.d(i,"a",function(){return s.a})},252:function(t,i,e){i=t.exports=e(19)(),i.push([t.i,'.tab[data-v-166c17fb]{padding:0 10px}.tit[data-v-166c17fb]{line-height:40px}.back_home[data-v-166c17fb]{position:absolute;width:50px;height:100%}.back_home[data-v-166c17fb]:before{content:" ";position:absolute;left:15px;top:13px;width:19px;height:16px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAgCAYAAAB+ZAqzAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+IEmuOgAAA/hJREFUWIXF2E9II1ccB/DvmxmniYlMEzZr6Z+DKwVpRKWIIBalVqlW0lPSJFbqP0h76cXdUrpt2QwpXrr20luO9U8j9Q9EsooIxVMP2lX30OjuigZsg1UzSUbzr5Okh2UgBl01JvF3e39+w4eZN4/feySdTiPHeBXALQDPc0nmef7cMbvdDiZH1G2/32/Z2dmp0Ov1TziOczmdzmiOzzozcoHd3t7e7l1eXv5ekqSyQCAw397evgngj3zCqCvO1/j9fquMAgCWZcOEkJzXQz5gqmAwaJ2fn3fIKLVavVlfX+9mWfZxvmGX/ZTKSCRimZmZGZZRJSUlhxaL5SFFUbNOpzNxEzBlKpXqdrlcI5IkcTLKZDJ9TVHUr/le9JeFKWOx2KcTExM/yW+KYRjRarV+o1AoCoa6CKYURdE6PT09nInq7e0doml6vJCol8GUwWDQ7Ha77YlEQiejenp67tI0PQ6goKjzYGwgEPhoaWnpy1gs9paMam1t5VmWnS0G6iwYGwgEPl5ZWfkkGAy+K6O6urrul5eXuwAcFgOVDaMEQfhwdXXV6PP5TDLKYDDc1+l0owBCxUKdgoVCoQ/W1taMu7u7ZrmvqalpWKfTPQLwWjKZfDszcXBwMG+IZDLJsCx7wPP8ttxH0uk0RFFsXV9fN3m93i8yE2pra0cIIal4PK7Km+JsWIlCoRBramr+Ki0tnSCERBkAb/h8viav1/t5dsLGxsbdQoKyQxAEd2dn5xqAxxSA0nA4fAsAyZ5IUVSEEPJfMVCEkKRGo9kGEAZerLFnVVVVy3t7e+/JfyIAVFRUjDc3N//OMAxomi44LJVKIRwO/8Pz/HMZBq1WO9/W1vbKwsLCd8fHx+8AQDKZVBBCyHkbqtPpvBbEZrOdajscjlNtklFaKwVBMHk8ngeRSOQO8GK7MJvN91Qq1Wg27rowv99/7pjdbj9Vj0U1Gs1vBoPhB7VavQkAkiSVTU5OPkwkEj0Ayq4luWJkF4pRjuNcHR0djkzc2NjYyOHh4WfFxJ1VwUa1Wu2s0WgcYRhGlHFut9txcnJiBqC8KRgARFmWHe/v7x/KwGmmpqb4UChkKQbuZTV/lBAy3t3dfU/GxePx1+fm5r4VBMFos9kKirvoMBJVKBSjZrP5KxkXiUQqPR7PA0EQTIXEXeaUFFWpVL/09fUNZeNEUbQWCnfZ41uUoih3S0uLIwN3Z3FxcUAQhPdvEgYA/1ZWVk40NDT8SNP0MQAcHR01bW1ttQ8MDDTcJAwA/tbr9Y/q6up+pigqBgAHBwdVkiSV5Bt25bsLQsif1dXVLMdxof39/TcbGxs3KIrK+0mcXOMaqhwAB+BpLskXXUP9D9YwtOBbQ+H/AAAAAElFTkSuQmCC);background-size:cover}.list[data-v-166c17fb]{padding-bottom:15px}.list .item[data-v-166c17fb]{margin-top:.4rem;padding-bottom:10px;background:#fff;padding:10px}.list .item .col-12[data-v-166c17fb]:not(.img),.list .item .pb_box[data-v-166c17fb]{padding-left:10px}.list .item .img_box[data-v-166c17fb]{height:90px;width:90px}.list .item .img_box .img[data-v-166c17fb]{border-radius:3px;max-height:100%}.list .item .sname[data-v-166c17fb]{margin-top:5px;font-size:.99rem;color:#333}.list .item .sintro[data-v-166c17fb]{margin-top:5px;color:#99a4bf;font-size:.77rem}.list .item .bnum[data-v-166c17fb]{margin-top:13px;color:#848484}.list .item .pb_box[data-v-166c17fb]{margin-top:5px}.list .item .pb_box .price[data-v-166c17fb]{position:relative;padding-left:11px;margin-top:10px;color:#fc4825}.list .item .pb_box .price[data-v-166c17fb]:before{position:absolute;vertical-align:baseline;content:"\\A5";left:0;bottom:.12rem;font-size:.9rem}.list .item .pb_box .baoming[data-v-166c17fb]{margin-left:5px;display:inline-block;color:#848484}.list .item .pb_box .bmcolor[data-v-166c17fb]{color:#fa0}',""])},26:function(t,i,e){i=t.exports=e(19)(),i.push([t.i,'.cc-divider[data-v-22b7bfb8]{display:table;white-space:nowrap;height:auto;overflow:hidden;line-height:1;text-align:center;padding:10px 0;color:#666}.cc-divider[data-v-22b7bfb8]:after,.cc-divider[data-v-22b7bfb8]:before{content:"";display:table-cell;position:relative;top:50%;width:50%;background-repeat:no-repeat;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaAAAAACCAYAAACuTHuKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OThBRDY4OUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OThBRDY4QUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5OEFENjg3Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU5OEFENjg4Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VU513gAAADVJREFUeNrs0DENACAQBDBIWLGBJQby/mUcJn5sJXQmOQMAAAAAAJqt+2prAAAAAACg2xdgANk6BEVuJgyMAAAAAElFTkSuQmCC)}.cc-divider[data-v-22b7bfb8]:before{background-position:right 1em top 50%}.cc-divider[data-v-22b7bfb8]:after{background-position:left 1em top 50%}',""])},27:function(t,i,e){i=t.exports=e(19)(),i.push([t.i,'.scroller-body[data-v-2ce6731a]{position:absolute;overflow:hidden;-webkit-overflow-scrolling:touch}.pull_down-refresh[data-v-2ce6731a],.pull_up-refresh[data-v-2ce6731a]{position:absolute;overflow:hidden;z-index:2;text-align:center;color:#888}.pull_down-refresh span[data-v-2ce6731a]{margin-right:3px;display:inline-block}.pull_up-refresh span[data-v-2ce6731a]{margin-right:3px;margin-left:3px;display:inline-block}.pull_down-refresh .pull[data-v-2ce6731a],.pull_up-refresh .pull[data-v-2ce6731a]{font-size:.75rem}.loading .cc-spinner[data-v-2ce6731a]{vertical-align:text-bottom}.pull_down-refresh .loading[data-v-2ce6731a],.pull_up-refresh .loading[data-v-2ce6731a]{font-size:.75rem}.arrow_down span[data-v-2ce6731a],.arrow_up span[data-v-2ce6731a]{transform:rotate(180deg);-webkit-transform:rotate(180deg)}.pull_down-refresh[data-v-2ce6731a],.pull_up-refresh[data-v-2ce6731a]{height:40px;line-height:40px}.more_move[data-v-2ce6731a]{font-size:10px;color:#999}.t_btn[data-v-2ce6731a]{position:absolute;right:10px;bottom:20px;width:48px;height:48px;z-index:1}.t_btn[data-v-2ce6731a]:before{content:"";position:absolute;background-image:url('+e(30)+');background-repeat:no-repeat;background-size:cover;width:36px;height:36px;top:6px;left:6px;border-radius:50%;z-index:1}.t_btn[data-v-2ce6731a]:after{content:"";position:absolute;background-color:#000;width:48px;height:48px;top:0;left:0;border-radius:50%;opacity:.5}.spinner[data-v-2ce6731a]{width:50px;height:20px;text-align:center;display:inline-block;vertical-align:middle;margin-top:-11px}.spinner>div[data-v-2ce6731a]{background-color:#b2b2b2;height:100%;width:6px;display:inline-block;-webkit-animation:stretchdelay-data-v-2ce6731a 1s infinite ease-in-out;animation:stretchdelay-data-v-2ce6731a 1s infinite ease-in-out}.spinner .rect2[data-v-2ce6731a]{-webkit-animation-delay:-.9s;animation-delay:-.9s}.spinner .rect3[data-v-2ce6731a]{-webkit-animation-delay:-.8s;animation-delay:-.8s}.spinner .rect4[data-v-2ce6731a]{-webkit-animation-delay:-.7s;animation-delay:-.7s}.spinner .rect5[data-v-2ce6731a]{-webkit-animation-delay:-.6s;animation-delay:-.6s}@-webkit-keyframes stretchdelay-data-v-2ce6731a{0%,40%,to{-webkit-transform:scaleY(.4)}20%{-webkit-transform:scaleY(1)}}@keyframes stretchdelay-data-v-2ce6731a{0%,40%,to{transform:scaleY(.4);-webkit-transform:scaleY(.4)}20%{transform:scaleY(1);-webkit-transform:scaleY(1)}}.spinner1[data-v-2ce6731a]{width:24px;height:24px;position:relative;display:inline-block;vertical-align:middle;margin-top:-4px}.double-bounce1[data-v-2ce6731a],.double-bounce2[data-v-2ce6731a]{width:100%;height:100%;border-radius:50%;background-color:#b2b2b2;opacity:.6;position:absolute;top:0;left:0;-webkit-animation:bounce-data-v-2ce6731a 2s infinite ease-in-out;animation:bounce-data-v-2ce6731a 2s infinite ease-in-out}.double-bounce2[data-v-2ce6731a]{-webkit-animation-delay:-1s;animation-delay:-1s}@-webkit-keyframes bounce-data-v-2ce6731a{0%,to{-webkit-transform:scale(0)}50%{-webkit-transform:scale(1)}}@keyframes bounce-data-v-2ce6731a{0%,to{transform:scale(0);-webkit-transform:scale(0)}50%{transform:scale(1);-webkit-transform:scale(1)}}',""])},28:function(t,i,e){var s=e(26);"string"==typeof s&&(s=[[t.i,s,""]]),s.locals&&(t.exports=s.locals);e(20)("386143cb",s,!0)},29:function(t,i,e){var s=e(27);"string"==typeof s&&(s=[[t.i,s,""]]),s.locals&&(t.exports=s.locals);e(20)("6c49ab4c",s,!0)},296:function(t,i,e){var s=e(252);"string"==typeof s&&(s=[[t.i,s,""]]),s.locals&&(t.exports=s.locals);e(20)("922e444e",s,!0)},30:function(t,i){t.exports="data:image/png;base64,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"},31:function(t,i,e){"use strict";function s(t){e(28)}var a=e(33),n=e(18),o=s,r=n(null,a.a,!1,o,"data-v-22b7bfb8",null);i.a=r.exports},32:function(t,i,e){"use strict";function s(t){e(29)}var a=e(21),n=e(34),o=e(18),r=s,l=o(a.a,n.a,!1,r,"data-v-2ce6731a",null);i.a=l.exports},33:function(t,i,e){"use strict";var s=function(){var t=this,i=t.$createElement;return(t._self._c||i)("p",{staticClass:"cc-divider"},[t._t("default")],2)},a=[],n={render:s,staticRenderFns:a};i.a=n},34:function(t,i,e){"use strict";var s=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",[e("div",{directives:[{name:"show",rawName:"v-show",value:t.pullDown&&t.position>0,expression:"pullDown&&position>0"}],ref:"pullDown",staticClass:"pull_down-refresh",style:t.topStyles},[e("div",{staticClass:"pull"},[e("div",{directives:[{name:"show",rawName:"v-show",value:"normal"==t.astatus,expression:"astatus=='normal'"}],ref:"arrowDown",staticClass:"arrow"},[e("span",[t._v("↓")]),t._v(t._s(t.pullDownText)+"\n            ")])]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:"loading-down"==t.astatus,expression:"astatus=='loading-down'"}],staticClass:"loading"},[t._m(0),t._v(" "),e("span",[t._v("加载中")])])]),t._v(" "),e("div",{ref:"box",staticClass:"scroller-body",style:t.styles},[e("div",{ref:"container",staticClass:"alloytouch-target"},[t._t("default")],2),t._v(" "),e("transition",{attrs:{type:"animation","enter-active-class":"animated fast fadeIn","leave-active-class":"animated fast fadeOut"}},[t.position<-t.topPosition&&t.topButton?e("a",{staticClass:"t_btn",on:{click:function(i){t.al.stop(),t.al.to(0)}}}):t._e()])],1),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:t.pullUp&&t.containerHeight>=t.boxHeight,expression:"pullUp&&containerHeight>=boxHeight"}],ref:"pullUp",staticClass:"pull_up-refresh",style:t.bottomStyles},[e("div",{staticClass:"pull"},[e("div",{directives:[{name:"show",rawName:"v-show",value:"normal"==t.astatus1,expression:"astatus1=='normal'"}],ref:"arrowUp",staticClass:"arrow"},[e("span",[t._v("↑")]),t._v(t._s(t.pullUpText)+"\n            ")])]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:"loading-up"==t.astatus1,expression:"astatus1=='loading-up'"}],staticClass:"loading"},[e("span",[t._v("加载中")]),t._v(" "),t._m(1)]),t._v(" "),"stop"==t.astatus1?e("divider",[e("span",{staticClass:"more_move"},[t._v("我是有底线的")])]):t._e()],1)])},a=[function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"spinner1"},[e("div",{staticClass:"double-bounce1"}),t._v(" "),e("div",{staticClass:"double-bounce2"})])},function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"spinner"},[e("div",{staticClass:"rect1"}),t._v(" "),e("div",{staticClass:"rect2"}),t._v(" "),e("div",{staticClass:"rect3"}),t._v(" "),e("div",{staticClass:"rect4"}),t._v(" "),e("div",{staticClass:"rect5"})])}],n={render:s,staticRenderFns:a};i.a=n},424:function(t,i,e){t.exports=e.p+"static/img/duanxin.ffd8a4c.png"},430:function(t,i,e){t.exports=e.p+"static/img/zunxiangban.c4acc5b.png"},481:function(t,i,e){"use strict";function s(t){e(296)}Object.defineProperty(i,"__esModule",{value:!0});var a=e(173),n=e(498),o=e(18),r=s,l=o(a.a,n.a,!1,r,"data-v-166c17fb",null);i.default=l.exports},498:function(t,i,e){"use strict";var s=function(){var t=this,i=t.$createElement,s=t._self._c||i;return s("div",{staticClass:"page"},[s("div",{staticClass:"cm_header"},[s("div",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.backPage},expression:"{ methods :backPage}"}],staticClass:"back_home"}),t._v(" "),s("div",{staticClass:"tit"},[t._v("贝币专区")])]),t._v(" "),s("scroller",{attrs:{top:40,bacground:"#f6f6f6",alloy:t.asc,pullUp:"",topButton:""},on:{"update:alloy":function(i){t.asc=i}}},[s("div",{staticClass:"list grid"},[s("div",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.goToDetail,id:105},expression:"{methods:goToDetail,id:105}"}],staticClass:"row item grid-middle"},[s("div",{staticClass:"img_box  row grid-middle grid-center"},[s("img",{staticClass:"img",attrs:{src:e(424)}})]),t._v(" "),s("div",{staticClass:"row grid-cell"},[s("div",{staticClass:"col-12 sname small"},[t._v("\n                 美管加系统短信 可使用299个贝币 1块钱购买3000条短信\n             ")]),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"}),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"},[t._v("贝币可抵扣299")]),t._v(" "),s("div",{staticClass:"pb_box col-8"},[s("span",{staticClass:"price big"},[t._v("300")])])])]),t._v(" "),s("div",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.goToDetail,id:107},expression:"{methods:goToDetail,id:107}"}],staticClass:"row item grid-middle"},[s("div",{staticClass:"img_box row grid-middle grid-center"},[s("img",{staticClass:"img",attrs:{src:e(195)}})]),t._v(" "),s("div",{staticClass:"row grid-cell"},[s("div",{staticClass:"col-12 sname small"},[t._v("\n                      美管加风尚版 一套可使用1999个贝币 低至1块钱  \n             ")]),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"}),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"},[t._v("贝币可抵扣1999")]),t._v(" "),s("div",{staticClass:"pb_box col-8"},[s("span",{staticClass:"price big"},[t._v("2000")])])])]),t._v(" "),s("div",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.goToDetail,id:255},expression:"{methods:goToDetail,id:255}"}],staticClass:"row item grid-middle"},[s("div",{staticClass:"img_box row grid-middle grid-center"},[s("img",{staticClass:"img",attrs:{src:e(195)}})]),t._v(" "),s("div",{staticClass:"row grid-cell"},[s("div",{staticClass:"col-12 sname small"},[t._v("\n                      美管加风尚版【续费】 一套可使用1499个贝币 低至1块钱  \n             ")]),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"}),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"},[t._v("贝币可抵扣1499")]),t._v(" "),s("div",{staticClass:"pb_box col-8"},[s("span",{staticClass:"price big"},[t._v("1500")])])])]),t._v(" "),s("div",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.goToDetail,id:110},expression:"{methods:goToDetail,id:110}"}],staticClass:"row item grid-middle"},[s("div",{staticClass:"img_box  row grid-middle grid-center"},[s("img",{staticClass:"img",attrs:{src:e(430)}})]),t._v(" "),s("div",{staticClass:"row grid-cell"},[s("div",{staticClass:"col-12 sname small"},[t._v("   \n                      美管加尊享版 一套可使用4999个贝币 低至1块钱\n             ")]),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"}),t._v(" "),s("div",{staticClass:"col-12 sintro b_small"},[t._v("贝币可抵扣4999")]),t._v(" "),s("div",{staticClass:"pb_box col-8"},[s("span",{staticClass:"price big"},[t._v("5000")])])])])])])],1)},a=[],n={render:s,staticRenderFns:a};i.a=n}});