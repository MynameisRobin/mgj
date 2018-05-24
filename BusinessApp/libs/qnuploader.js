//AqEzNBE7-L4TDQH7HPz89KaxoadOBK9G_1obYgtK:ZvHYcPsDdaZtyfl-cMPqFZtdO8c=:eyJzY29wZSI6ImVkdWNhdGlvbiIsImRlYWRsaW5lIjoxNDkyNjEwODgzfQ==
//uuid生成器
(function() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    Math.uuid = function(len, radix) {
        var chars = CHARS,
            uuid = [],
            i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
    // by minimizing calls to random()
    Math.uuidFast = function() {
        var chars = CHARS,
            uuid = new Array(36),
            rnd = 0,
            r;
        for (var i = 0; i < 36; i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                uuid[i] = '-';
            } else if (i == 14) {
                uuid[i] = '4';
            } else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };

    // A more compact, but less performant, RFC4122v4 solution:
    Math.uuidCompact = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
})();
(function($){

	var serverUrl=window.serverUrl;//token获取url

	var openUrl="http://edu.meiguanjia.net/";

	var acquiesce=[{//菜单
		name:"讲师头像",
		key:"teacherLogo"
	},{
		name:"讲师介绍",
		key:"teacherAbout"
	},{
		name:"机构logo",
		key:"institutionLogo"
	},{
		name:"机构介绍",
		key:"institutionAbout"
	},{
		name:"视频封面",
		key:"videoCover"
	},{
		name:"视频",
		key:"videoList"
	},{
		name:"轮播图",
		key:"carousel"
	}];

	var imgtype = {
	    "teacherLogo": {
	        "dir": "teacherLogo/",
	        "size": [1024, 1024],
	        "variations": {
	        	"l":"1024x1024",
	        	"m":"480x480",
	        	"s":"256x256"
	        }
	    },
	    "teacherAbout": {
	        "dir": "teacherAbout/",
	        "size": [1024, 1024],
	        "variations": {
	        	"l":"1024x1024",
	        	"m":"480x480",
	        	"s":"256x256"
	        }
	    },
	    "institutionLogo": {
	        "dir": "institutionLogo/",
	        "size": [1024, 1024],
	        "variations": {
	        	"l":"1024x1024",
	        	"m":"480x480",
	        	"s":"256x256"
	        }
	    },
	    "institutionAbout": {
	        "dir": "institutionAbout/",
	        "size": [1024, 1024],
	        "variations": {
	        	"l":"1024x1024",
	        	"m":"480x480",
	        	"s":"256x256"
	        }
	    },
	    "videoCover": {
	        "dir": "videoCover/",
	        "size": [1024, 585],
	        "variations": {
	        	"l":"1024x585",
	        	"m":"735x420",
	        	"s":"420x240"
	        }
	    },
	    "videoList": {
	        "dir": "videoList/",
	        "size": [1024, 1024],
	        "variations": {
	        	"l":"1024x1024",
	        	"m":"480x480",
	        	"s":"256x256"
	        }
	    },
	    "carousel":{
	    	"dir": "carousel/",
	        "size": [1024, 585],
	        "variations": {
	        	"l":"1024x202",
	        	"m":"640x126",
	        	"s":"250x49"
	        }
	    }
	};

	var $gallery='<div class="gallery-modalWindow" id="Qnuploader">' +
		'<div class="gallery-modalWindowInner">' +
			'<div class="galleryTit">' +
                '<p>资源库</p>' +
                '<a href="javascript:;" class="galleryClose"></a>' +
            '</div>' +
            '<div class="galleryCont">' +
            	'<div class="galleryTab-tit">' +
                    '<ul></ul>' +
                    '<a href="javascript:;" class="uploadbtn">上传文件' +
                    '</a>' +
                    '<input type="file" id="focusFile" style="display:none" />'+
                '</div>' +
                '<div class="galleryTab-cont">' +
                    '<div class="galleryTab-contList">' +
                        '<div class="galleryTab-contRight nouploadinput">' +
                            '<div class="uploadinputfilewrap">' +
                            	'<form class="galleryForm" name="galleryForm" method="post" enctype="multipart/form-data">' +
									'<input name="token" type="hidden" value="">' +
									'<input name="accept" type="hidden" />' +
								'</form>' +
                            '</div>' +
                            '<div class="galleryListWrap">' +
                                '<ul class="clear"></ul>' +
                            '</div>' +
                            '<div class="galleryPagerWrap">' +
                                	'<span class="pager_btn pre">上一页</span>'+
                                	'<span class="pager_btn next">下一页</span>'+
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
		'</div>' +
	'</div>';

	var processPhoto = function(src,MAX_WIDTH,callback) {
		var canvas=$("<canvas></canvas>")[0];
	    var image = new Image();
	    var exif;
	    image.onload = function() {
	        var ctx = canvas.getContext("2d");
	        ctx.clearRect(0, 0, canvas.width, canvas.height);
	        var orientation = exif ? exif.Orientation : 1;
	        var angleInRadians = 0;
	        switch (orientation) {
	            case 8:
	                if (image.height > MAX_WIDTH) {
	                    // 宽度等比例缩放 *=
	                    image.width *= MAX_WIDTH / image.height;
	                    image.height = MAX_WIDTH;
	                }
	                angleInRadians = -90 * Math.PI / 180;
	                canvas.width = image.height;
	                canvas.height = image.width;
	                break;
	            case 3:
	                if (image.width > MAX_WIDTH) {
	                    // 宽度等比例缩放 *=
	                    image.height *= MAX_WIDTH / image.width;
	                    image.width = MAX_WIDTH;
	                }
	                angleInRadians = 180 * Math.PI / 180;
	                canvas.width = image.width;
	                canvas.height = image.height;
	                break;
	            case 6:
	                if (image.height > MAX_WIDTH) {
	                    // 宽度等比例缩放 *=
	                    image.width *= MAX_WIDTH / image.height;
	                    image.height = MAX_WIDTH;
	                }
	                angleInRadians = 90 * Math.PI / 180;
	                canvas.width = image.height;
	                canvas.height = image.width;
	                break;
	            default:
	                if (image.width > MAX_WIDTH) {
	                    // 宽度等比例缩放 *=
	                    image.height *= MAX_WIDTH / image.width;
	                    image.width = MAX_WIDTH;
	                }
	                canvas.width = image.width;
	                canvas.height = image.height;
	                break;
	        }
	        var x = canvas.width / 2;
	        var y = canvas.height / 2;
	        var width = image.width;
	        var height = image.height;

	        ctx.translate(x, y);
	        ctx.rotate(angleInRadians);
	        ctx.drawImage(image, -width / 2, -height / 2, width, height);
	        ctx.rotate(-angleInRadians);
	        ctx.translate(-x, -y);
	        var base64Data = canvas.toDataURL("image/jpeg", 0.6);
	        callback && callback(base64Data);
	    };
	    var base64 = src.replace(/^.*?,/, '');
	    var binary = atob(base64);
	    var binaryData = new BinaryFile(binary);
	    exif = EXIF.readFromBinaryFile(binaryData);
	    image.src = src;
	};
	var dataURLtoBlob = function(urlData) {
	    var bytes = window.atob(urlData.split(',')[1]); //去掉url的头，并转换为byte

	    //处理异常,将ascii码小于0的转换为大于0
	    var ab = new ArrayBuffer(bytes.length);
	    var ia = new Uint8Array(ab);
	    for (var i = 0; i < bytes.length; i++) {
	        ia[i] = bytes.charCodeAt(i);
	    }
	    var blob = new Blob([ab], {
	        type: 'image/jpeg'
	    });
	    console.log("blob", blob)
	    return blob;
	}
	var creatImg = function($dom,callback){
		var img;
		img=new Image();
		$dom.append(img);
		img.onload=function(){

			callback && callback(img,1);
		}
		img.error=function(){
			callback && callback(img,0);
		}
		return {
			setHerf:function(src){
				img.src=src;
			},
			getMax:function(variations){
				var _scaleArr=variations["l"].split("x"),
					_w=_scaleArr.slice(0,1).join(",")*1,
					_h=_scaleArr.slice(1).join(",")*1,
					_scale=_w/_h,
					cw,
					ch,
					w=img.width*1,
					h=img.height*1;
				if(_w>_h){//宽大于高
					ch=w/_scale;
					cw=h*_scale;
				}else{//宽小于高
					ch=w*_scale;
					cw=h/_scale;
				}

				return {w:cw,h:ch};
			}
		}
	}

	var replaceTemple=function(str,data,rule) {
	       return str.replace(/\{(.*?)\}/g,function(a,b){
	           return (rule && rule[b])?rule[b].call(null,b):data[b]
	       })
	   }

	function Gallery(opt){
		return new Gallery.fn.init(opt);
	}
	Gallery.fn =Gallery.prototype={
		constructor:Gallery,
		init:function(opt){
			this.normal={
				bucket:"education",//文件空间名称
				MAX_WIDTH:1024,//图片压缩比例 最大数值
				token:"",
				isCrop:true,
				selection:function(url){}
			}

			this.options=$.extend({},this.normal,opt);

			// if(!this.options.token || !Gallery.token){
			// 	this.getToken();
			// }

			if(!$('body').find("#Qnuploader").length){
				this.obj = $($gallery);
				$('body').append(this.obj);

			}
			$("#Qnuploader").remove();
			$('body').append($($gallery));

			this.obj=$("#Qnuploader");

			this.bind();

			this.pageSize=10;
			this.pageMarks="";
			this.pageMarksList=[""];

			this.$focusFile=this.obj.find("#focusFile");
			this.$galleryListWrapUl = this.obj.find('.galleryListWrap ul');
			this.addPager();//添加导航/分页器

			return this;
		},
		getToken:function(_type){
			var _this=this;
			Gallery.sendPost.to(serverUrl+"video/authToken",{
				"bucket":"education",
				"expires":1036800
			},function(ret){
				if(ret.result==0){
					_this.options.token=ret.content;
					Gallery.token=ret.content;
					if(_type){
						_this.setCurrent(_type);
					}else{
						_this.getList("");
					}
				}else{
					Gallery.galleryTips.show("获取token失败！无法上传文件！");
				}
			});
		},
		open:function(type){
			this.$galleryListWrapUl.empty();
			//this._galleryPager.refresh(1);
			//
			this.pageMarks="";
			this.pageMarksList=[""];
			this.setPager(false,true);

			this.obj.show();
			if(Gallery.token){
				if(type){
					this.setCurrent(type);
				}else{
					this.getList("");
				}
			}else{
				this.getToken(type);
			}

			
			//this.getList();
		},
		setCurrent:function(type){

			var $ul=this.obj.find(".galleryTab-tit ul");
			$ul.find("li").hide();
			$ul.find("li").each(function(i,item){
				var _type=$(item).data("type");
				if(type==_type){
					$(item).show().trigger("click");
				}
			});
		},
		getList:function(marks,btn){
			var _this=this,
				type=this.obj.find(".galleryTab-tit li.selected").data("type");
			this.pageMarks=marks;
			var sendData={
				bucket:_this.options.bucket,
				limit:_this.pageSize,
				prefix:type,//指定前缀，只有资源名匹配该前缀的资源会被列出。默认值为空字符串。
				delimiter:"",//指定目录分隔符，列出所有公共前缀（模拟列出目录效果）
				marker:marks
			};
			Gallery.sendPost.to(serverUrl+"video/filelist",sendData,function(ret){
				if(btn=="pre"){
					_this.pageMarksList.pop();
				}else{
					if(ret.content){
						_this.pageMarksList.push(ret.content.listfile.marker);
					}else{
						Gallery.galleryTips.show("获取图片失败！");
					}

				}
				_this.render(ret.content);
			});
		},
		setPager:function(old,_new){
			var $pagerBtn=this.obj.find(".galleryPagerWrap"),
				$pre=$pagerBtn.find(".pre"),
				$next=$pagerBtn.find(".next");
			if(old){
				$pre.removeClass('disabled');
			}else{
				$pre.addClass('disabled');
			}
			if(_new){
				$next.removeClass('disabled');
			}else{
				$next.addClass('disabled');
			}
		},
		render:function(lists){
			this.$galleryListWrapUl.empty();
			if(lists){
				var _html = '';
				var items=lists.listfile.items;
				if(items && items.length){
		            for(var i=0; i<items.length; i++){
		            	var item=items[i],
		            		_arr=item.key.split("/"),
		            		key=_arr.slice(1).join(","),
		            		space=_arr.slice(0,1).join(","),
							_shref = Gallery.imgConfig.getUrl(key,space,"s"),
							_href=Gallery.imgConfig.getUrl(key,space),
							_normal=Gallery.imgConfig.getUrl(key,space,"n"),
							videos="",
							look="查看大图";
						if(space=="teacherAbout" || space=="institutionAbout"){
							_shref = Gallery.imgConfig.getUrl(key,space,"n");
							_href=_normal;
						}

						if(space=="videoList"){//视频列表
							_shref = "";
							videos='<div class="video-play-mask"><video preload="metadata" src="'+_normal+'"></video><div class="video-play-logo"></div></div>';
							_href=_normal;
							look="预览";
						}
						_html =$( '<li>' +
		                    '<div class="imgwrap" style="background:url('+ _shref +') no-repeat center center;background-size:contain;">' +
		                        videos+
		                        /*'<div class="imgmask"></div>' +*/
		                        /*'<span class="imgdel" data-filename="'+ data[i].name +'"></span>' +*/
		                    '</div>' +
		                    '<div class="imgbottom">' +
		                        '<a href="javascript:;" data-select="false" data-link="'+ key +'" class="btn-selection">选用</a>' +
		                        '<a href="'+ _href +'" class="btn-viewlarger" target="_blank">'+look+'</a>' +
		                    '</div>' +
		                '</li>').data("item",item);
		                this.$galleryListWrapUl.append(_html);
		                if(space=='videoList'){
		                	this.$galleryListWrapUl.find('.btn-selection').addClass('disabled');
		                }
		                var video = _html.find('video').hide().eq(0).get(0);
		                if(video){
		                	video.addEventListener("loadedmetadata", function () {
							    if(this.videoHeight>this.videoWidth){
							    	$(this).css('height','100%');
							    	var height = $(this).height();
							    	$(this).css('width',(this.videoWidth/this.videoHeight)*height+'px');
							    }
							    $(this).parent().addClass('end');
							    $(this).next().addClass('end');
							    $(this).parents('li').find('.btn-selection').attr('data-select','true').removeClass('disabled');

							    $(this).show();
							});
							video.addEventListener('ended',function(){
								$(this).next().show();
							});
		                }
					}
				}
				if(!this.pageMarks && !lists.listfile.marker){//无上一页下一页
					this.setPager(false,false);
				}
				if(!this.pageMarks && lists.listfile.marker){//无上一页有下一页
					this.setPager(false,true);
				}
				if(this.pageMarks && lists.listfile.marker){
					this.setPager(true,true);
				}
				if(this.pageMarks && !lists.listfile.marker){
					this.setPager(true,false);
				}
				if(!this.pageMarksList.length){

				}
				//this._galleryPager.refresh(lists.total || 1);
			}else{
				this.pageMarks="";

				//this._galleryPager.refresh(1);
			}
		},
		initPager:function(){
			var _this=this;
			_this.obj.find(".galleryPager").empty();
			//分类(选中-分页显示)
			this._galleryPager = new galleryPager({
                obj : _this.obj.find(".galleryPager"),
                nowNum : 1, //当前选中页(默认第一页)
                pageSize : _this.pageSize,  //默认每页显示12条
                callback : function(){
                	_this.getList();
                }
            });
            this._galleryPager.init();
		},
		addPager:function(){
			var $ul=this.obj.find(".galleryTab-tit ul").empty();
			for(var i=0;i<acquiesce.length;i++){
				var item=acquiesce[i];
				if(i==0){
					$ul.append('<li data-type="'+item.key+'" class="selected"><a href="javascript:;">'+item.name+'</a></li>');
				}else{
					$ul.append('<li data-type="'+item.key+'"><a href="javascript:;">'+item.name+'</a></li>');
				}

			}
			//this.initPager();
		},
		bind:function(){
			var _this=this;

			_this.obj.on("change","#focusFile",function(event){
				var _type=_this.obj.find(".galleryTab-tit li.selected").attr("data-type");
				event.preventDefault();
				var file = $(this)[0].files[0];
				if(_type=="videoList" && file.type.indexOf("mp4")==-1){
					Gallery.galleryTips.show("请上传正确MP4格式的视频文件！");
					return;
				}
				if(_type!=undefined && _type!="videoList" && !/image\/\w+/.test(file.type)){
					Gallery.galleryTips.show("请上传正确的图片格式！");
				}
				if(/image\/\w+/.test(file.type) && _type!="videoList"){//上传图片
					if(file.size>10*1024*1024){
						Gallery.galleryTips.show('图片不能超过10M');
						return;
					}
					_this.uploadImg(file);
				}
				if(/video\/\w+/.test(file.type) && file.type.indexOf("mp4")!=-1 && _type=="videoList"){
					if(file.size>200*1024*1024){
						Gallery.galleryTips.show('视频不能超过200M');
						return;
					}
					_this.uploadVideos(file);
				}
			}).on("click",".uploadbtn",function(){

				_this.$focusFile.click();

			}).on("click",".galleryTab-tit li",function(){

				$(this).addClass('selected').siblings().removeClass("selected");
				_this.getList("");

			}).on('click','.btn-selection',function(){
				var _link = $(this).data('link');
				var _typeData=$(this).parents("li").data("item");
				try{
					var duration=$(this).parents("li").find("video")[0].duration;
					_typeData=$.extend({},_typeData,{duration:duration});
				}catch(e){};
				if($(this).parents('.galleryCont').find('.selected').attr('data-type')=='videoList'){
					if($(this).attr('data-select')=='true'){
						_this.obj.hide();
						_this.options.selection && _this.options.selection(_link,_typeData);
					}else {
						console.log('loading');
					}
				}else {
					_this.obj.hide();
					_this.options.selection && _this.options.selection(_link,_typeData);
				}
			}).on("click",".galleryClose",function(){
				_this.obj.hide();
			}).on('click','.video-play-logo',function(){
				var videoList = $(this).parents('ul').find('video');
				var video = $(this).prev().get(0);
				if(video.paused){
					for(var i=0;i<videoList.length;i++){
						$(videoList[i]).get(0).pause();
						$(videoList[i]).next().show();
					}
					video.play();
					$(this).hide();
				}else {
					video.pause();
					$(this).show();
				}
			}).on('click','video',function(){
				var video = $(this).get(0);
				if(video.paused){
					video.play();
					$(this).next().hide();
				}else {
					video.pause();
					$(this).next().show();
				}
			}).on("click",".galleryPagerWrap .pre",function(){//上一页
				if($(this).hasClass("disabled")){
					return;
				}
				var marks=_this.pageMarksList[_this.pageMarksList.length-3];
				_this.getList(marks,"pre");
			}).on("click",".galleryPagerWrap .next",function(){//下一页
				if($(this).hasClass("disabled")){
					return;
				}
				var marks=_this.pageMarksList[_this.pageMarksList.length-1 || 0];
				_this.getList(marks);
			});
		},
		uploadVideos:function(file){
			var name=file.name,
				type=this.obj.find(".galleryTab-tit li.selected").data("type"),
				randName=Gallery.imgConfig.creatKey({},type,name);

			this.uploadQn(null,randName,function(ret){
				console.log(ret);
			},file);
		},
		uploadImg:function(file){
			var _this = this,
				type=this.obj.find(".galleryTab-tit li.selected").data("type"),
				val=file.name;
			if(!file){
				return;
			}
			var reader = new FileReader(file);
			reader.readAsDataURL(file);
			reader.onload = function() {
			    console.log("压缩前", this.result.length);

			    processPhoto(this.result,_this.options.MAX_WIDTH,function(ret) {
			    	if(_this.options.isCrop){
			    		Gallery.Crop.show({//打开裁剪
			    			src:ret,
			    			variations:imgtype[type],
			    			submit:function(that,jcropApi){
			    				var data=jcropApi.tellSelect();
			    				var name=Gallery.imgConfig.creatKey(data,type,val);
			    				console.log(name);
			    				_this.uploadQn(ret,name,function(){
			    					that.hide();
			    				});
			    			}
			    		});
			    	}else{//不裁剪
			    		var name=Gallery.imgConfig.creatKey({},type,val);
	    				console.log(name);
	    				_this.uploadQn(ret,name,function(){
	    					
	    				});
			    	}
			    	
			    });
			};
		},
		uploadQn:function(url,name,callback,files){
			var _this=this;
			if(!this.options.token || !Gallery.token){
				Gallery.galleryTips.show("缺少必要参数Token");
				return;
			}
			if(url){
				var blobs = dataURLtoBlob(url);
			}
		    var formData = new FormData();
		    formData.append("token",this.options.token || Gallery.token);
		    if(url){
		    	formData.append("file", blobs, blobs.name || '1.jpg');
		    	formData.append("key",name);
		    }else{
		    	formData.append("file",files);
		    	formData.append("key",name);
		    }

		    formData.append("accept","");
		    Gallery.loading.show("上传中，请稍后...");

	     	var xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://upload.qiniu.com/', true);
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                    console && console.log(percentComplete);
                    Gallery.progressTip(percentComplete);
                }
            }, false);
            xhr.onreadystatechange = function(res) {
                if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                    Gallery.loading.hide();
			        console.log("成功：" + JSON.stringify(res));
			        Gallery.galleryTips.show("上传成功",true);
					_this.getList();
			        callback && callback();
                } else if (xhr.status != 200 && xhr.responseText) {
                	Gallery.loading.hide();
			        console.log("失败:" +  JSON.stringify(res));
			        Gallery.galleryTips.show("上传失败");
			        callback && callback();
                }
            };
            xhr.send(formData);

		  //   $.ajax({
		  //     url: 'http://upload.qiniu.com/',
		  //     type: 'POST',
		  //     data: formData,
		  //     processData: false,
		  //     contentType: false,
		  //     success: function(res) {
		  //     	Gallery.loading.hide();
		  //       console.log("成功：" + JSON.stringify(res));
		  //       Gallery.galleryTips.show("上传成功",true);
				// _this.getList();
		  //       callback && callback();
		  //     },
		  //     error: function(res) {
		  //     	Gallery.loading.hide();
		  //       console.log("失败:" +  JSON.stringify(res));
		  //       Gallery.galleryTips.show("上传失败");
		  //       callback && callback();
		  //     }
		  //   });

		    this.$focusFile.val("");//清空表单值
		}
	};
	/**
	 * 图片操作方法
	 * 提供key换取完整url
	 *
	 */
	Gallery.imgConfig = new function(){
		var _this=this;
		this.getOptionObj = function(type){
		    var opt = imgtype[type];
		    if (opt) {
		        return opt;
		    } else {
		        throw "错误的图片类型!"
		    }
		}
		/**
		 * key   图片key
		 * space 目录名
		 * type  需要的图片尺寸 l m s 原图n
		 */
		this.getUrl = function(key ,space ,type){
			if(!key){
				// Gallery.galleryTips.show("缺少必要参数！");
				// throw "缺少必要参数！";
				return "";
			}
			var url="{openUrl}{space}{key}?imageMogr2/crop/!{w}x{h}a{x}a{y}|imageMogr2/thumbnail/{sw}x{sh}!";
			var arrurl=key.split(".");
			var item=_this.getOptionObj(space);
			var _url=arrurl.slice(0),
				_pos=_url[0].split("_"),
				pos=_pos.slice(1,5),
				replaceData={//替换data
					openUrl:openUrl,
					space:item.dir,
					key:key,
					x:pos[0],
					y:pos[1],
					w:pos[2],
					h:pos[3]
				};
			if(item.variations[type]){
				 replaceData.sw=item.variations[type].split("x").slice(0,1).join(",");
				 replaceData.sh=item.variations[type].split("x").slice(1).join(",");
			}else if(type=="n"){
				url="{openUrl}{space}{key}";
			}else{
				url="{openUrl}{space}{key}?imageMogr2/crop/!{w}x{h}a{x}a{y}";
			}
			return replaceTemple(url,replaceData);

		},
		/**
		 * 创建照片的路径
		 * data {x:111,y:111} 裁剪坐标
		 * type 照片上传的分类
		 * val  上传文件的后缀 可选参数
		 */
		this.creatKey = function(data,type,val){
			var _random=Math.uuid(),
				x=Math.round(data.x) || 0,
				y=Math.round(data.y) || 0,
				w=Math.round(data.w) || 0,
				h=Math.round(data.h) || 0,
				postfix=val?val.match(/\.?[^.\/]+$/):".jpg";
			var n=Math.round((new Date("2100-01-01").getTime()-new Date().getTime())/1000);
			if(type=="videoList"){
				return type + "/" + n + "-" + _random + postfix;
			}else{
				return type + "/" + n + "-" + _random+ "_" + x + "_" + y + "_" + w + "_" + h + postfix;
			}

		}
		this.createImage = function(key ,space ,type) {
            var $img = $('<img src="' + _this.getUrl(key ,space ,type) + '">').hide();
            $img.load(function() {
                // console.log("load");
                $img.show();
            });
            return $img;
        }

	}();
	Gallery.sendPost = new function(){
		this.to = function(url,data,callback,errorcallback){
			Gallery.loading.show("获取数据中，请稍后...");
			$.ajax({
				url: url, //接口url
				type: "POST",
				data: JSON.stringify(data),
				dataType : "json",
				contentType : "application/json",
				success:function(ret){
					Gallery.loading.hide();
					callback && callback(ret);
				},
				error:function(ret){
					Gallery.loading.hide();
					errorcallback && errorcallback(ret);
				}
			});
		}
	}();
	//loading方法
	Gallery.loading = new function(){
		var _this = this;

		this.show = function(content){

			_this.$box.find(".page-loading-words").text(content || "正在努力加载中...");

			_this.$box.show();

		};

		this.hide=function(){
			_this.$box.hide();
		}

		this.render = function(){
			var $temp='<div id="gallery-loading">'+
					  '	<div class="page-loading-inner">'+
					  '		<span class="page-loading-img"><p class="img"></p></span>'+
					  '		<span class="page-loading-words">正在努力加载中...</span>'+
					  '	</div>'+
					  '</div>';
			$('body').append($temp);
		}

		this.render();

		_this.$box=$("#gallery-loading");
	}();
	//提示信息
	Gallery.galleryTips = new function(){
		var _this = this;

		this.show = function(content,status){

			_this.render(content,status);

			_this.hide();
		};

		this.hide=function(){
			setTimeout(function(){
				$("#gallery-tips").hide().remove();
			},2000);
		}

		this.render = function(content,status){
			var isred=status?"":"red";
			var $temp='<div id="gallery-tips" class='+isred+'>'+
					'    <div class="page-tips-inner">'+
					'    	<div class="page-tips-block">'+
					'    		<span class="page-tips-img"></span>'+
					'    		<span class="page-tips-words">'+content+'</span>'+
					'    	</div>'+
					'    </div>'+
					'</div>';
			$('body').append($temp);
		}
	}();

	//上传进度
	Gallery.progressTip = function(num){
		if($('#progressTip').length==0){
			var html = '<div id="progressTip">\
							<div class="wrapper">\
								<div class="progress-wrap">\
									<div class="progress-container">\
									</div>\
								</div>\
								<div class="percent">10%</div>\
							</div>\
						</div>';
			$('body').append(html);
		}else {
			$('#progressTip').find('.progress-container').css('width',0);
			$('#progressTip').show();
		}
		$('#progressTip').find('.percent').html(num+'%');
		$('#progressTip').find('.progress-container').css('width',num+'%');
		if(num>=100){
			$('#progressTip').hide();
		}
	}


	/**
	 * 裁剪弹框
	 * options
	 * cancel function
	 * submit function
	 * src    url
	 */

	Gallery.Crop=new function(){
		var _this = this;

		this.show = function(options){

			_this.options=options;

			this.replaceImg(options.src,options);

			_this.$box.show();

		};

		this.hide = function(){
			_this.$box.hide();
		};

		this.resetBox = function($img,img){
			var $box=$img.find(".jcrop-holder"),
				h=$box.height(),
				w=$box.width();
			$box.css({
				"margin-top":(400-h)/2+"px",
				"margin-left":(400-w)/2+"px",
			});
		};

		this.replaceImg = function(url,options){
			var $img=_this.$box.find(".imgBox");
			$img.empty();
			var imgObj=creatImg($img,function(img){
				var _min=imgObj.getMax(options.variations.variations);

				$img.find("img").Jcrop({
					boxWidth:400,
					boxHeight:400,
					allowMove:true,
					allowResize:false
				},function() {
				  _this.jcropApi = this;
				  _this.jcropApi.setSelect([0,0,_min.w,_min.h]);
				  _this.jcropApi.setOptions({allowSelect:false});
				  _this.resetBox($img,img);
				});

			});
			imgObj.setHerf(url);


		}

		this.render = function(){
			var $temp='<div id="Gallery-Crop" class="Gallery-Crop-mask">'+
			'	<div class="Gallery-Crop">'+
			'		<div class="Gallery-Crop-title">'+
			'			<p>裁剪图片</p>'+
			'			<a href="javascript:;" class="galleryClose"></a>'+
			'		</div>'+
			'		<div class="Gallery-Crop-content">'+
			'			<div class="imgBox"></div>'+
			'		</div>'+
			'		<div class="Gallery-Crop-footer">'+
			'			<span class="btnOk">确定</span>'+
			'			<span class="cancel">取消</span>'+
			'		</div>'+
			'	</div>'+
			'</div>';
			$('body').append($temp);
		}
		this.bind = function(){
			_this.$box.on("click",".btnOk",function(){

				$('#focusFile').val('');

				_this.options.submit && _this.options.submit(_this,_this.jcropApi);

			}).on("click",".cancel,.galleryClose",function(){

				_this.hide();

				$('#focusFile').val('');

				_this.options.cancel && _this.options.cancel();
			});
		}

		this.render();

		_this.$box=$("#Gallery-Crop");

		_this.bind();

	}();



	Gallery.fn.init.prototype = Gallery.fn;

	//分页插件
    function galleryPager(opt){
        $.extend(this,opt);
        this.bind();
    }
    galleryPager.prototype = {
        init : function(){
        	this.nowNum = 1;
        	this.pageSize = 12;
            this.callback && this.callback();
        },
        render : function(){
            var _totalNum = Math.ceil(this.totalNum / this.pageSize);	// 总页数 = 向上取整( 总条数 / 每页显示个数 )
            var _html = '';

            //处理首页和上一页
            if(this.nowNum == 1){
                //当前为首页
                _html += '<a href="#1" class="firstpage disable"></a><a href="#0" class="previouspage disable"></a>';
            }else{
                _html += '<a href="#1" class="firstpage"></a><a href="#'+ (this.nowNum - 1) +'" class="previouspage"></a>';
            }

            //处理中间部分
            if(_totalNum <= 5){
                for(var i=1; i<=_totalNum; i++){
                    if(i == this.nowNum){
                        _html += '<a class="on" href="#'+ i +'">'+ i +'</a>';
                    }else{
                        _html += '<a href="#'+ i +'">'+ i +'</a>';
                    }
                }
            }else{
                for(var i=1; i<=5; i++){
                    var _num = this.nowNum - 3 + i;
                    if(_num <= _totalNum && _num != 0 && _num != -1){
                        if(_num == this.nowNum){
                            _html += '<a class="on" href="#'+ _num +'">'+ _num +'</a>';
                        }else{
                            _html += '<a href="#'+ _num +'">'+ _num +'</a>';
                        }
                    }
                }
            }

            //处理尾页和下一页
            if(this.nowNum == _totalNum){
                //当前为尾页
                _html += '<a href="#'+ (this.nowNum + 1) +'" class="nextpage disable"></a><a href="#'+ _totalNum +'" class="lastpage disable"></a>';
            }else{
                _html += '<a href="#'+ (this.nowNum + 1) +'" class="nextpage"></a><a href="#'+ _totalNum +'" class="lastpage"></a>';
            }

            //共XX条
            _html += '<span class="totlepager">共'+ this.totalNum +'条</span>';

            //每页XX条
            _html += '<span class="eachpage">每页<input type="text" value="'+ this.pageSize +'" />条</span>';

            //添加操作
            this.obj.html( _html );
        },
        bind : function(){
            var self = this;

            //点击页码
            this.obj.on('click','a',function(e){
                if($(this).hasClass('disable')){
                    e.preventDefault();
                    return false;
                }
                self.nowNum = $(this).attr('href').replace('#','')*1;
                self.pageSize = self.obj.find('.eachpage input').val()*1;
                self.callback();
            });

            //每页XX条
            this.obj.on('keyup','.eachpage input',function(){
                $(this).val( $(this).val().replace(/[a-zA-Z.]/g,'') );
            });
        },
        refresh : function(totalNum){
        	if(totalNum == 0){
                this.obj.html('');
                return;
            }
        	this.totalNum = totalNum;
        	this.render();
        }
    }

	window.Gallery=Gallery;
})(jQuery);
