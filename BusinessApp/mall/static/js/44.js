webpackJsonp([44],{175:function(t,i,e){"use strict";var a=e(236);e.d(i,"a",function(){return a.a})},21:function(t,i,e){"use strict";function a(){for(var t=navigator.userAgent,i=["Android","iPhone","Windows Phone","iPad","iPod"],e=!0,a=0;a<i.length;a++)if(t.indexOf(i[a])>0){e=!1;break}return e}var s=e(23),n=e(22),o=e(24);i.a={model:{prop:"alloy",event:"create"},props:{pullDown:{type:Boolean,default:!1},pullUp:{type:Boolean,default:!1},topButton:{type:Boolean,default:!1},topPosition:{type:Number,default:500},top:{type:Number,default:0},bottom:{type:Number,default:0},left:{type:Number,default:0},right:{type:Number,default:0},background:{type:String,default:"#F5F5F5"},property:{type:String,default:"translateY"},vertical:{type:Boolean,default:!0},sensitivity:{type:Number,default:1},factor:{type:Number,default:1},step:{type:Number,default:45},pullUpStatus:{type:String,default:"normal"},pullDownStatus:{type:String,default:"normal"},alloy:{type:Object,default:function(){return{}}}},data:function(){return{al:"",timeInterval:"",astatus:this.pullDownStatus,astatus1:this.pullUpStatus,pullDownText:"下拉刷新",pullUpText:"上拉刷新",boxHeight:0,containerHeight:9999,position:0}},deactivated:function(){clearInterval(this.timeInterval),this.timeInterval="",this.$refs.box.onscroll=null},beforeDestroy:function(){clearInterval(this.timeInterval),this.timeInterval="",this.$refs.box.onscroll=null},activated:function(){var t=this;a()&&(this.$refs.box.onscroll=function(){"stop"!=t.astatus1&&t.$refs.container.clientHeight-t.$refs.box.clientHeight-t.$refs.box.scrollTop<100&&t.$emit("pullup:loading")}),""!=this.timeInterval||a()||(this.timeInterval=setInterval(function(){t.refresh()},100))},computed:{styles:function(){return"ios"!=this.$store.state.device?{background:this.background,top:this.top+"px",left:this.left+"px",right:this.right+"px",bottom:this.bottom+"px","overflow-y":a()?"auto":"hidden"}:{background:this.background,top:this.top+20+"px",left:this.left+"px",right:this.right+"px",bottom:this.bottom+"px","overflow-y":a()?"auto":"hidden"}},topStyles:function(){return"ios"!=this.$store.state.device?{top:this.top-40+"px",left:this.left+"px",right:this.right+"px",height:"40px"}:{background:this.background,top:this.top-20+"px",left:this.left+"px",right:this.right+"px",height:"40px"}},bottomStyles:function(){return"ios"!=this.$store.state.device?{top:this.top+this.containerHeight+"px",left:this.left+"px",right:this.right+"px",height:"40px"}:{top:this.top+this.containerHeight+20+"px",left:this.left+"px",right:this.right+"px",height:"40px"}}},mounted:function(){var t=this;if(a())return this.$emit("update:alloy",{to:function(){},stop:function(){}}),void(this.$refs.box.onscroll=function(){"stop"!=t.astatus1&&t.$refs.container.clientHeight-t.$refs.box.clientHeight-t.$refs.box.scrollTop<100&&t.$emit("pullup:loading")});this.$nextTick(function(){var t=this;e.i(n.a)(this.$refs.container,!0),this.pullDown&&e.i(n.a)(this.$refs.pullDown),this.pullUp&&e.i(n.a)(this.$refs.pullUp);var i=this;this.al=new s.a({touch:this.$refs.box,vertical:this.vertical,target:this.$refs.container,property:this.property,min:0,max:0,sensitivity:this.sensitivity,factor:this.factor,step:this.step,bindSelf:!1,initialValue:0,maxSpeed:2,change:function(t){return i.$emit("change",t),i.position=t,i.change(t)},touchStart:function(t,e){return i.$emit("touchStart",e,t),i.position=e,i.touchStart(t,e)},touchMove:function(t,e){return i.$emit("touchMove",e,t),i.position=e,i.touchMove(t,e)},touchEnd:function(t,e){return i.$emit("touchEnd",e,t),i.position=e,i.touchEnd(t,e)},tap:function(t,e){return i.$emit("tap",t,e),i.position=e,i.tap(t,e)},pressMove:function(t,e){return i.$emit("pressMove",e,t),i.position=e,i.pressMove(t,e)},animationEnd:function(t){return i.$emit("animationEnd",t),i.position=t,i.onAnimationEnd(t)}}),this.$emit("create",this.al),this.$emit("update:alloy",this.al),""==this.timeInterval&&(this.timeInterval=setInterval(function(){t.refresh()},100))})},methods:{refresh:function(){this&&this.$refs&&this.$refs.container&&this.$refs.container.clientHeight&&(this.$refs.container.clientHeight<=this.$refs.box.clientHeight?(this.al.min=0,this.containerHeight=this.$refs.container.clientHeight,this.boxHeight=this.$refs.box.clientHeight):(this.containerHeight=this.$refs.container.clientHeight,this.boxHeight=this.$refs.box.clientHeight,this.al.min=this.boxHeight-this.containerHeight))},touchStart:function(t,i){},touchMove:function(t,i){i>60&&this.pullDown?(this.$refs.arrowDown.classList.add("arrow_up"),this.pullDownText="释放更新"):this.pullDown&&(this.$refs.arrowDown.classList.remove("arrow_up"),this.pullDownText="下拉刷新"),i<this.boxHeight-this.containerHeight-60&&this.pullUp?(this.$refs.arrowUp.classList.add("arrow_down"),this.pullUpText="释放刷新"):this.pullUp&&(this.$refs.arrowUp.classList.remove("arrow_down"),this.pullUpText="上拉刷新")},change:function(t){this.$refs.pullDown&&(this.$refs.pullDown.translateY=t),this.$refs.pullUp&&(this.$refs.pullUp.translateY=t)},touchEnd:function(t,i){return i>60&&this.pullDown&&"normal"==this.astatus?(this.al.to(40),this.pullDownText="加载中",this.astatus="loading-down",this.$emit("pulldown:loading",this.astatus),!1):"loading-down"==this.astatus&&this.pullDown?(this.al.to(40),!1):i<this.boxHeight-this.containerHeight-60&&this.containerHeight>=this.boxHeight&&this.pullUp&&"normal"==this.astatus1?(this.al.to(this.boxHeight-this.containerHeight-40),this.pullDownText="加载中",this.astatus1="loading-up",this.$emit("pullup:loading",this.astatus1),!1):"loading-up"==this.astatus1&&this.pullUp?(this.al.to(this.boxHeight-this.containerHeight-40),!1):void 0},tap:function(t,i){},pressMove:function(t,i){},onAnimationEnd:function(t){}},watch:{pullDownStatus:function(t,i){var e=this;"loading-down"==i&&"normal"==t&&(this.al.to(0),setTimeout(function(){e.pullDownText="下拉刷新",e.astatus=t},300))},pullUpStatus:function(t,i){var e=this;this.astatus1="",setTimeout(function(){e.astatus1=t},100),"loading-up"==i&&"normal"==t&&(this.pullDownText="上拉刷新")}},components:{divider:o.a}}},22:function(t,i,e){"use strict";function a(t,i,e){for(var a=0,n=i.length;a<n;a++){s(t,i[a],e)}}function s(t,i,e){Object.defineProperty(t,i,{get:function(){return this["_"+i]},set:function(t){this["_"+i]=t,e()}})}function n(t){return"object"===("undefined"==typeof HTMLElement?"undefined":r(HTMLElement))?t instanceof HTMLElement:t&&"object"===(void 0===t?"undefined":r(t))&&null!==t&&1===t.nodeType&&"string"==typeof t.nodeName}function o(t,i){if(!t.hasOwnProperty("translateX")){var e=["translateX","translateY","translateZ","scaleX","scaleY","scaleZ","rotateX","rotateY","rotateZ","skewX","skewY","originX","originY","originZ"],s=n(t);i||e.push("perspective"),a(t,e,function(){var e=t.matrix3d.identity().appendTransform(t.translateX,t.translateY,t.translateZ,t.scaleX,t.scaleY,t.scaleZ,t.rotateX,t.rotateY,t.rotateZ,t.skewX,t.skewY,t.originX,t.originY,t.originZ),a=(i?"":"perspective("+t.perspective+"px) ")+"matrix3d("+Array.prototype.slice.call(e.elements).join(",")+")";s?t.style.transform=t.style.msTransform=t.style.OTransform=t.style.MozTransform=t.style.webkitTransform=a:t.transform=a}),t.matrix3d=new h,i||(t.perspective=500),t.scaleX=t.scaleY=t.scaleZ=1,t.translateX=t.translateY=t.translateZ=t.rotateX=t.rotateY=t.rotateZ=t.skewX=t.skewY=t.originX=t.originY=t.originZ=0}}var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},l=.017453292519943295,h=function(t,i,e,a,s,n,o,r,l,h,c,u,p,d,g,m){this.elements=window.Float32Array?new Float32Array(16):[];var f=this.elements;f[0]=void 0!==t?t:1,f[4]=i||0,f[8]=e||0,f[12]=a||0,f[1]=s||0,f[5]=void 0!==n?n:1,f[9]=o||0,f[13]=r||0,f[2]=l||0,f[6]=h||0,f[10]=void 0!==c?c:1,f[14]=u||0,f[3]=p||0,f[7]=d||0,f[11]=g||0,f[15]=void 0!==m?m:1};h.prototype={set:function(t,i,e,a,s,n,o,r,l,h,c,u,p,d,g,m){var f=this.elements;return f[0]=t,f[4]=i,f[8]=e,f[12]=a,f[1]=s,f[5]=n,f[9]=o,f[13]=r,f[2]=l,f[6]=h,f[10]=c,f[14]=u,f[3]=p,f[7]=d,f[11]=g,f[15]=m,this},identity:function(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this},multiplyMatrices:function(t,i){var e=t.elements,a=this.elements,s=e[0],n=e[4],o=e[8],r=e[12],l=e[1],h=e[5],c=e[9],u=e[13],p=e[2],d=e[6],g=e[10],m=e[14],f=e[3],v=e[7],b=e[11],x=e[15],A=i[0],y=i[1],w=i[2],M=i[3],_=i[4],D=i[5],k=i[6],C=i[7],E=i[8],Y=i[9],T=i[10],I=i[11],S=i[12],H=i[13],U=i[14],X=i[15];return a[0]=s*A+n*_+o*E+r*S,a[4]=s*y+n*D+o*Y+r*H,a[8]=s*w+n*k+o*T+r*U,a[12]=s*M+n*C+o*I+r*X,a[1]=l*A+h*_+c*E+u*S,a[5]=l*y+h*D+c*Y+u*H,a[9]=l*w+h*k+c*T+u*U,a[13]=l*M+h*C+c*I+u*X,a[2]=p*A+d*_+g*E+m*S,a[6]=p*y+d*D+g*Y+m*H,a[10]=p*w+d*k+g*T+m*U,a[14]=p*M+d*C+g*I+m*X,a[3]=f*A+v*_+b*E+x*S,a[7]=f*y+v*D+b*Y+x*H,a[11]=f*w+v*k+b*T+x*U,a[15]=f*M+v*C+b*I+x*X,this},_rounded:function(t,i){return i=Math.pow(10,i||15),Math.round(t*i)/i},_arrayWrap:function(t){return window.Float32Array?new Float32Array(t):t},appendTransform:function(t,i,e,a,s,n,o,r,h,c,u,p,d,g){var m=o*l,f=this._rounded(Math.cos(m)),v=this._rounded(Math.sin(m)),b=r*l,x=this._rounded(Math.cos(b)),A=this._rounded(Math.sin(b)),y=h*l,w=this._rounded(Math.cos(-1*y)),M=this._rounded(Math.sin(-1*y));return this.multiplyMatrices(this,this._arrayWrap([1,0,0,t,0,f,v,i,0,-v,f,e,0,0,0,1])),this.multiplyMatrices(this,this._arrayWrap([x,0,A,0,0,1,0,0,-A,0,x,0,0,0,0,1])),this.multiplyMatrices(this,this._arrayWrap([w*a,M*s,0,0,-M*a,w*s,0,0,0,0,1*n,0,0,0,0,1])),(c||u)&&this.multiplyMatrices(this,this._arrayWrap([this._rounded(Math.cos(c*l)),this._rounded(Math.sin(c*l)),0,0,-1*this._rounded(Math.sin(u*l)),this._rounded(Math.cos(u*l)),0,0,0,0,1,0,0,0,0,1])),(p||d||g)&&(this.elements[12]-=p*this.elements[0]+d*this.elements[4]+g*this.elements[8],this.elements[13]-=p*this.elements[1]+d*this.elements[5]+g*this.elements[9],this.elements[14]-=p*this.elements[2]+d*this.elements[6]+g*this.elements[10]),this}};var c=function(t,i,e,a,s,n){return this.a=null==t?1:t,this.b=i||0,this.c=e||0,this.d=null==a?1:a,this.tx=s||0,this.ty=n||0,this};c.prototype={identity:function(){return this.a=this.d=1,this.b=this.c=this.tx=this.ty=0,this},appendTransform:function(t,i,e,a,s,n,o,r,h){if(s%360)var c=s*l,u=Math.cos(c),p=Math.sin(c);else u=1,p=0;return n||o?(n*=l,o*=l,this.append(Math.cos(o),Math.sin(o),-Math.sin(n),Math.cos(n),t,i),this.append(u*e,p*e,-p*a,u*a,0,0)):this.append(u*e,p*e,-p*a,u*a,t,i),(r||h)&&(this.tx-=r*this.a+h*this.c,this.ty-=r*this.b+h*this.d),this},append:function(t,i,e,a,s,n){var o=this.a,r=this.b,l=this.c,h=this.d;return this.a=t*o+i*l,this.b=t*r+i*h,this.c=e*o+a*l,this.d=e*r+a*h,this.tx=s*o+n*l+this.tx,this.ty=s*r+n*h+this.ty,this},initialize:function(t,i,e,a,s,n){return this.a=t,this.b=i,this.c=e,this.d=a,this.tx=s,this.ty=n,this},setValues:function(t,i,e,a,s,n){return this.a=null==t?1:t,this.b=i||0,this.c=e||0,this.d=null==a?1:a,this.tx=s||0,this.ty=n||0,this},copy:function(t){return this.setValues(t.a,t.b,t.c,t.d,t.tx,t.ty)}},o.getMatrix3D=function(t){var i={translateX:0,translateY:0,translateZ:0,rotateX:0,rotateY:0,rotateZ:0,skewX:0,skewY:0,originX:0,originY:0,originZ:0,scaleX:1,scaleY:1,scaleZ:1};for(var e in t)t.hasOwnProperty(e)&&(i[e]=t[e]);return(new h).identity().appendTransform(i.translateX,i.translateY,i.translateZ,i.scaleX,i.scaleY,i.scaleZ,i.rotateX,i.rotateY,i.rotateZ,i.skewX,i.skewY,i.originX,i.originY,i.originZ).elements},o.getMatrix2D=function(t){var i={translateX:0,translateY:0,rotation:0,skewX:0,skewY:0,originX:0,originY:0,scaleX:1,scaleY:1};for(var e in t)t.hasOwnProperty(e)&&(i[e]=t[e]);return(new c).identity().appendTransform(i.translateX,i.translateY,i.scaleX,i.scaleY,i.rotation,i.skewX,i.skewY,i.originX,i.originY)},i.a=o},23:function(t,i,e){"use strict";function a(t,i,e){t.addEventListener(i,e,!1)}function s(t){return Math.sqrt(1-Math.pow(t-1,2))}function n(t){return 1-Math.sqrt(1-t*t)}function o(t,i){for(var e in i)if(i[e].test(t[e]))return!0;return!1}var r=function(t){this.element="string"==typeof t.touch?document.querySelector(t.touch):t.touch,this.target=this._getValue(t.target,this.element),this.vertical=this._getValue(t.vertical,!0),this.property=t.property,this.tickID=0,this.initialValue=this._getValue(t.initialValue,this.target[this.property]),this.target[this.property]=this.initialValue,this.fixed=this._getValue(t.fixed,!1),this.sensitivity=this._getValue(t.sensitivity,1),this.moveFactor=this._getValue(t.moveFactor,1),this.factor=this._getValue(t.factor,1),this.outFactor=this._getValue(t.outFactor,.3),this.min=t.min,this.max=t.max,this.deceleration=6e-4,this.maxRegion=this._getValue(t.maxRegion,600),this.springMaxRegion=this._getValue(t.springMaxRegion,60),this.maxSpeed=t.maxSpeed,this.hasMaxSpeed=!(void 0===this.maxSpeed),this.lockDirection=this._getValue(t.lockDirection,!0);var i=function(){};if(this.change=t.change||i,this.touchEnd=t.touchEnd||i,this.touchStart=t.touchStart||i,this.touchMove=t.touchMove||i,this.touchCancel=t.touchCancel||i,this.reboundEnd=t.reboundEnd||i,this.animationEnd=t.animationEnd||i,this.correctionEnd=t.correctionEnd||i,this.tap=t.tap||i,this.pressMove=t.pressMove||i,this.preventDefault=this._getValue(t.preventDefault,!0),this.preventDefaultException={tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},this.hasMin=!(void 0===this.min),this.hasMax=!(void 0===this.max),this.hasMin&&this.hasMax&&this.min>this.max)throw"the min value can't be greater than the max value.";this.isTouchStart=!1,this.step=t.step,this.inertia=this._getValue(t.inertia,!0),this._calculateIndex(),this.eventTarget=window,t.bindSelf&&(this.eventTarget=this.element),this._moveHandler=this._move.bind(this),a(this.element,"touchstart",this._start.bind(this)),a(this.eventTarget,"touchend",this._end.bind(this)),a(this.eventTarget,"touchcancel",this._cancel.bind(this)),this.eventTarget.addEventListener("touchmove",this._moveHandler,{passive:!1,capture:!1}),this.x1=this.x2=this.y1=this.y2=null};r.prototype={_getValue:function(t,i){return void 0===t?i:t},_start:function(t){this.isTouchStart=!0,this.touchStart.call(this,t,this.target[this.property]),cancelAnimationFrame(this.tickID),this._calculateIndex(),this.startTime=(new Date).getTime(),this.x1=this.preX=t.touches[0].pageX,this.y1=this.preY=t.touches[0].pageY,this.start=this.vertical?this.preY:this.preX,this._firstTouchMove=!0,this._preventMove=!1},stop:function(){cancelAnimationFrame(this.tickID),this._calculateIndex()},_move:function(t){if(this.isTouchStart){var i=t.touches.length,e=t.touches[0].pageX,a=t.touches[0].pageY;if(this._firstTouchMove&&this.lockDirection){var s=Math.abs(e-this.x1)-Math.abs(a-this.y1);s>0&&this.vertical?this._preventMove=!0:s<0&&!this.vertical&&(this._preventMove=!0),this._firstTouchMove=!1}if(!this._preventMove){var n=(this.vertical?a-this.preY:e-this.preX)*this.sensitivity,r=this.moveFactor;this.hasMax&&this.target[this.property]>this.max&&n>0?r=this.outFactor:this.hasMin&&this.target[this.property]<this.min&&n<0&&(r=this.outFactor),n*=r,this.preX=e,this.preY=a,this.fixed||(this.target[this.property]+=n),this.change.call(this,this.target[this.property]);var l=(new Date).getTime();l-this.startTime>300&&(this.startTime=l,this.start=this.vertical?this.preY:this.preX),this.touchMove.call(this,t,this.target[this.property])}this.preventDefault&&!o(t.target,this.preventDefaultException)&&t.preventDefault(),1===i&&(null!==this.x2?(t.deltaX=e-this.x2,t.deltaY=a-this.y2):(t.deltaX=0,t.deltaY=0),this.pressMove.call(this,t,this.target[this.property])),this.x2=e,this.y2=a}},_cancel:function(t){var i=this.target[this.property];this.touchCancel.call(this,t,i),this._end(t)},to:function(t,i,e){this._to(t,this._getValue(i,600),e||s,this.change,function(t){this._calculateIndex(),this.reboundEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this))},_calculateIndex:function(){this.hasMax&&this.hasMin&&(this.currentPage=Math.round((this.max-this.target[this.property])/this.step))},_end:function(t){if(this.isTouchStart){this.isTouchStart=!1;var i=this,e=this.target[this.property],a=Math.abs(t.changedTouches[0].pageX-this.x1)<30&&Math.abs(t.changedTouches[0].pageY-this.y1)<30;if(a&&(this.preventDefault&&o(t.target,this.preventDefaultException)&&t.target.focus(),this.tap.call(this,t,e)),!1===this.touchEnd.call(this,t,e,this.currentPage))return;if(this.hasMax&&e>this.max)this._to(this.max,200,s,this.change,function(t){this.reboundEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this));else if(this.hasMin&&e<this.min)this._to(this.min,200,s,this.change,function(t){this.reboundEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this));else if(!this.inertia||a||this._preventMove)i._correction();else{var r=(new Date).getTime()-this.startTime;if(r<300){var l=((this.vertical?t.changedTouches[0].pageY:t.changedTouches[0].pageX)-this.start)*this.sensitivity,h=Math.abs(l)/r,c=this.factor*h;this.hasMaxSpeed&&c>this.maxSpeed&&(c=this.maxSpeed);var u=e+c*c/(2*this.deceleration)*(l<0?-1:1),p=1;u<this.min?u<this.min-this.maxRegion?(p=n((e-this.min+this.springMaxRegion)/(e-u)),u=this.min-this.springMaxRegion):(p=n((e-this.min+this.springMaxRegion*(this.min-u)/this.maxRegion)/(e-u)),u=this.min-this.springMaxRegion*(this.min-u)/this.maxRegion):u>this.max&&(u>this.max+this.maxRegion?(p=n((this.max+this.springMaxRegion-e)/(u-e)),u=this.max+this.springMaxRegion):(p=n((this.max+this.springMaxRegion*(u-this.max)/this.maxRegion-e)/(u-e)),u=this.max+this.springMaxRegion*(u-this.max)/this.maxRegion));var d=Math.round(h/i.deceleration)*p;i._to(Math.round(u),d,s,i.change,function(t){i.hasMax&&i.target[i.property]>i.max?(cancelAnimationFrame(i.tickID),i._to(i.max,600,s,i.change,i.animationEnd)):i.hasMin&&i.target[i.property]<i.min?(cancelAnimationFrame(i.tickID),i._to(i.min,600,s,i.change,i.animationEnd)):i.step?i._correction():i.animationEnd.call(i,t),i.change.call(this,t)})}else i._correction()}}this.x1=this.x2=this.y1=this.y2=null},_to:function(t,i,e,a,s){if(!this.fixed){var n=this.target,o=this.property,r=n[o],l=t-r,h=new Date,c=this;!function u(){var p=new Date-h;if(p>=i)return n[o]=t,a&&a.call(c,t),void(s&&s.call(c,t));n[o]=l*e(p/i)+r,c.tickID=requestAnimationFrame(u),a&&a.call(c,n[o])}()}},_correction:function(){if(void 0!==this.step){var t=this.target,i=this.property,e=t[i],a=Math.floor(Math.abs(e/this.step)),n=e%this.step;Math.abs(n)>this.step/2?this._to((e<0?-1:1)*(a+1)*this.step,400,s,this.change,function(t){this._calculateIndex(),this.correctionEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this)):this._to((e<0?-1:1)*a*this.step,400,s,this.change,function(t){this._calculateIndex(),this.correctionEnd.call(this,t),this.animationEnd.call(this,t)}.bind(this))}}},i.a=r},236:function(t,i,e){"use strict";var a=e(25);i.a={data:function(){return{asc:null,pullupStatus:"normal",glist:[],page:0}},created:function(){},mounted:function(){var t=this;this.$nextTick(function(){t.getData()})},methods:{toDetail:function(t){var i=t.gid,e=t.timelimitid;this.$router.push({name:"ptGoods",query:{gid:i,timelimitid:e}})},more:function(t){this.getData(t)},getData:function(t){var i=this;t&&(this.pullupStatus=t);var e={};e.pagenum=this.page,this.page++,this.$api.get("goodslist",e,!0).success(function(t){0==t.code?(null!=i.asc&&0==i.glist.length&&(i.asc.stop(),i.asc.to(0,0)),t.body.goods.length<20?i.pullupStatus="stop":i.pullupStatus="normal",i.glist=i.glist.concat(t.body.goods)):i.page--}).error(function(){i.page--,i.pullupStatus="normal"})}},computed:{itemImageStyle:function(){return{height:7*document.body.clientWidth/16+"px"}}},watch:{},components:{scroller:a.a}}},24:function(t,i,e){"use strict";var a=e(31);e.d(i,"a",function(){return a.a})},25:function(t,i,e){"use strict";var a=e(32);e.d(i,"a",function(){return a.a})},26:function(t,i,e){i=t.exports=e(19)(),i.push([t.i,'.cc-divider[data-v-22b7bfb8]{display:table;white-space:nowrap;height:auto;overflow:hidden;line-height:1;text-align:center;padding:10px 0;color:#666}.cc-divider[data-v-22b7bfb8]:after,.cc-divider[data-v-22b7bfb8]:before{content:"";display:table-cell;position:relative;top:50%;width:50%;background-repeat:no-repeat;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaAAAAACCAYAAACuTHuKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OThBRDY4OUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OThBRDY4QUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5OEFENjg3Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU5OEFENjg4Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VU513gAAADVJREFUeNrs0DENACAQBDBIWLGBJQby/mUcJn5sJXQmOQMAAAAAAJqt+2prAAAAAACg2xdgANk6BEVuJgyMAAAAAElFTkSuQmCC)}.cc-divider[data-v-22b7bfb8]:before{background-position:right 1em top 50%}.cc-divider[data-v-22b7bfb8]:after{background-position:left 1em top 50%}',""])},27:function(t,i,e){i=t.exports=e(19)(),i.push([t.i,'.scroller-body[data-v-2ce6731a]{position:absolute;overflow:hidden;-webkit-overflow-scrolling:touch}.pull_down-refresh[data-v-2ce6731a],.pull_up-refresh[data-v-2ce6731a]{position:absolute;overflow:hidden;z-index:2;text-align:center;color:#888}.pull_down-refresh span[data-v-2ce6731a]{margin-right:3px;display:inline-block}.pull_up-refresh span[data-v-2ce6731a]{margin-right:3px;margin-left:3px;display:inline-block}.pull_down-refresh .pull[data-v-2ce6731a],.pull_up-refresh .pull[data-v-2ce6731a]{font-size:.75rem}.loading .cc-spinner[data-v-2ce6731a]{vertical-align:text-bottom}.pull_down-refresh .loading[data-v-2ce6731a],.pull_up-refresh .loading[data-v-2ce6731a]{font-size:.75rem}.arrow_down span[data-v-2ce6731a],.arrow_up span[data-v-2ce6731a]{transform:rotate(180deg);-webkit-transform:rotate(180deg)}.pull_down-refresh[data-v-2ce6731a],.pull_up-refresh[data-v-2ce6731a]{height:40px;line-height:40px}.more_move[data-v-2ce6731a]{font-size:10px;color:#999}.t_btn[data-v-2ce6731a]{position:absolute;right:10px;bottom:20px;width:48px;height:48px;z-index:1}.t_btn[data-v-2ce6731a]:before{content:"";position:absolute;background-image:url('+e(30)+');background-repeat:no-repeat;background-size:cover;width:36px;height:36px;top:6px;left:6px;border-radius:50%;z-index:1}.t_btn[data-v-2ce6731a]:after{content:"";position:absolute;background-color:#000;width:48px;height:48px;top:0;left:0;border-radius:50%;opacity:.5}.spinner[data-v-2ce6731a]{width:50px;height:20px;text-align:center;display:inline-block;vertical-align:middle;margin-top:-11px}.spinner>div[data-v-2ce6731a]{background-color:#b2b2b2;height:100%;width:6px;display:inline-block;-webkit-animation:stretchdelay-data-v-2ce6731a 1s infinite ease-in-out;animation:stretchdelay-data-v-2ce6731a 1s infinite ease-in-out}.spinner .rect2[data-v-2ce6731a]{-webkit-animation-delay:-.9s;animation-delay:-.9s}.spinner .rect3[data-v-2ce6731a]{-webkit-animation-delay:-.8s;animation-delay:-.8s}.spinner .rect4[data-v-2ce6731a]{-webkit-animation-delay:-.7s;animation-delay:-.7s}.spinner .rect5[data-v-2ce6731a]{-webkit-animation-delay:-.6s;animation-delay:-.6s}@-webkit-keyframes stretchdelay-data-v-2ce6731a{0%,40%,to{-webkit-transform:scaleY(.4)}20%{-webkit-transform:scaleY(1)}}@keyframes stretchdelay-data-v-2ce6731a{0%,40%,to{transform:scaleY(.4);-webkit-transform:scaleY(.4)}20%{transform:scaleY(1);-webkit-transform:scaleY(1)}}.spinner1[data-v-2ce6731a]{width:24px;height:24px;position:relative;display:inline-block;vertical-align:middle;margin-top:-4px}.double-bounce1[data-v-2ce6731a],.double-bounce2[data-v-2ce6731a]{width:100%;height:100%;border-radius:50%;background-color:#b2b2b2;opacity:.6;position:absolute;top:0;left:0;-webkit-animation:bounce-data-v-2ce6731a 2s infinite ease-in-out;animation:bounce-data-v-2ce6731a 2s infinite ease-in-out}.double-bounce2[data-v-2ce6731a]{-webkit-animation-delay:-1s;animation-delay:-1s}@-webkit-keyframes bounce-data-v-2ce6731a{0%,to{-webkit-transform:scale(0)}50%{-webkit-transform:scale(1)}}@keyframes bounce-data-v-2ce6731a{0%,to{transform:scale(0);-webkit-transform:scale(0)}50%{transform:scale(1);-webkit-transform:scale(1)}}',""])},271:function(t,i,e){i=t.exports=e(19)(),i.push([t.i,'.title[data-v-4a788d5c]{height:40px;line-height:40px;text-align:center;font-family:\\\\9ED1\\4F53;font-size:1.1rem;position:relative;background-color:#fff}.title[data-v-4a788d5c]:before{position:absolute;bottom:0;left:0;right:0;height:1px;content:"";background-color:#f5f5f5}.tab[data-v-4a788d5c]{padding:0 10px}.list[data-v-4a788d5c]{padding-bottom:15px}.list .item[data-v-4a788d5c]{margin-top:.4rem;padding-bottom:10px;background:#fff}.list .item .col-12[data-v-4a788d5c]:not(.img){padding:0 10px}.list .item .pb_box[data-v-4a788d5c]{padding-left:10px}.list .item .bnum[data-v-4a788d5c]{padding-right:10px}.list .item .img[data-v-4a788d5c]{text-align:center}.list .item .sname[data-v-4a788d5c]{margin-top:5px}.list .item .sintro[data-v-4a788d5c]{margin-top:5px;color:#848484}.list .item .bnum[data-v-4a788d5c]{margin-top:3px;color:#848484}.list .item .pb_box[data-v-4a788d5c]{margin-top:3px}.list .item .pb_box .price[data-v-4a788d5c]{position:relative;padding-left:15px;margin-top:2px;color:#f40008}.list .item .pb_box .price[data-v-4a788d5c]:before{position:absolute;vertical-align:baseline;content:"\\A5";left:0;bottom:0;font-size:.9rem}.list .item .pb_box .beibi[data-v-4a788d5c]{color:#333;margin-left:8px;display:inline-block}',""])},28:function(t,i,e){var a=e(26);"string"==typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);e(20)("386143cb",a,!0)},29:function(t,i,e){var a=e(27);"string"==typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);e(20)("6c49ab4c",a,!0)},30:function(t,i){t.exports="data:image/png;base64,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"},31:function(t,i,e){"use strict";function a(t){e(28)}var s=e(33),n=e(18),o=a,r=n(null,s.a,!1,o,"data-v-22b7bfb8",null);i.a=r.exports},315:function(t,i,e){var a=e(271);"string"==typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);e(20)("113af245",a,!0)},32:function(t,i,e){"use strict";function a(t){e(29)}var s=e(21),n=e(34),o=e(18),r=a,l=o(s.a,n.a,!1,r,"data-v-2ce6731a",null);i.a=l.exports},33:function(t,i,e){"use strict";var a=function(){var t=this,i=t.$createElement;return(t._self._c||i)("p",{staticClass:"cc-divider"},[t._t("default")],2)},s=[],n={render:a,staticRenderFns:s};i.a=n},34:function(t,i,e){"use strict";var a=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",[e("div",{directives:[{name:"show",rawName:"v-show",value:t.pullDown&&t.position>0,expression:"pullDown&&position>0"}],ref:"pullDown",staticClass:"pull_down-refresh",style:t.topStyles},[e("div",{staticClass:"pull"},[e("div",{directives:[{name:"show",rawName:"v-show",value:"normal"==t.astatus,expression:"astatus=='normal'"}],ref:"arrowDown",staticClass:"arrow"},[e("span",[t._v("↓")]),t._v(t._s(t.pullDownText)+"\n            ")])]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:"loading-down"==t.astatus,expression:"astatus=='loading-down'"}],staticClass:"loading"},[t._m(0),t._v(" "),e("span",[t._v("加载中")])])]),t._v(" "),e("div",{ref:"box",staticClass:"scroller-body",style:t.styles},[e("div",{ref:"container",staticClass:"alloytouch-target"},[t._t("default")],2),t._v(" "),e("transition",{attrs:{type:"animation","enter-active-class":"animated fast fadeIn","leave-active-class":"animated fast fadeOut"}},[t.position<-t.topPosition&&t.topButton?e("a",{staticClass:"t_btn",on:{click:function(i){t.al.stop(),t.al.to(0)}}}):t._e()])],1),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:t.pullUp&&t.containerHeight>=t.boxHeight,expression:"pullUp&&containerHeight>=boxHeight"}],ref:"pullUp",staticClass:"pull_up-refresh",style:t.bottomStyles},[e("div",{staticClass:"pull"},[e("div",{directives:[{name:"show",rawName:"v-show",value:"normal"==t.astatus1,expression:"astatus1=='normal'"}],ref:"arrowUp",staticClass:"arrow"},[e("span",[t._v("↑")]),t._v(t._s(t.pullUpText)+"\n            ")])]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:"loading-up"==t.astatus1,expression:"astatus1=='loading-up'"}],staticClass:"loading"},[e("span",[t._v("加载中")]),t._v(" "),t._m(1)]),t._v(" "),"stop"==t.astatus1?e("divider",[e("span",{staticClass:"more_move"},[t._v("我是有底线的")])]):t._e()],1)])},s=[function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"spinner1"},[e("div",{staticClass:"double-bounce1"}),t._v(" "),e("div",{staticClass:"double-bounce2"})])},function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"spinner"},[e("div",{staticClass:"rect1"}),t._v(" "),e("div",{staticClass:"rect2"}),t._v(" "),e("div",{staticClass:"rect3"}),t._v(" "),e("div",{staticClass:"rect4"}),t._v(" "),e("div",{staticClass:"rect5"})])}],n={render:a,staticRenderFns:s};i.a=n},483:function(t,i,e){"use strict";function a(t){e(315)}Object.defineProperty(i,"__esModule",{value:!0});var s=e(175),n=e(517),o=e(18),r=a,l=o(s.a,n.a,!1,r,"data-v-4a788d5c",null);i.default=l.exports},517:function(t,i,e){"use strict";var a=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"page",class:{not_found:0==t.glist.length}},[e("p",{staticClass:"title orange"},[t._v("拼团")]),t._v(" "),e("scroller",{attrs:{top:40,bacground:"#f6f6f6",alloy:t.asc,pullUp:"",pullUpStatus:t.pullupStatus,topButton:""},on:{"pullup:loading":t.more,"update:alloy":function(i){t.asc=i}}},[e("div",{staticClass:"list grid"},t._l(t.glist,function(i,a){return e("div",{directives:[{name:"tap",rawName:"v-tap",value:{methods:t.toDetail,gid:i.eid,timelimitid:0},expression:"{ methods :toDetail,gid:item.eid,timelimitid:0}"}],staticClass:"row item grid-bottom "},[e("div",{staticClass:"col-12 img "},[e("img",{style:t.itemImageStyle,attrs:{src:t.$store.state.imageUrl+i.labelimg+"?x-oss-process=image/resize,m_lfit,h_400,limit_0/auto-orient,0/quality,q_100"}})]),t._v(" "),e("div",{staticClass:"col-12 sname small"},[t._v(t._s(i.title))]),t._v(" "),e("div",{staticClass:"col-12 sintro b_small"},[t._v(t._s(i.littletitle))]),t._v(" "),e("div",{staticClass:"pb_box col-8"},[e("span",{staticClass:" price big"},[t._v(t._s(i.price))]),t._v(" "),0!=i.bbprice?e("span",{staticClass:"beibi b_small"},[t._v("贝币可抵扣¥"+t._s(i.bbprice))]):t._e()]),t._v(" "),e("div",{staticClass:"col-4 bnum b_small right"},[t._v("成团"+t._s(i.salesnum)+t._s(i.unit))])])}))])],1)},s=[],n={render:a,staticRenderFns:s};i.a=n}});