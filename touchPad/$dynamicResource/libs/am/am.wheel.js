$(function() {
	if(device2.windows()){
		$(document).bind('wheel',function(evt){
			var $tar = $(evt.target);
			if(!$tar.hasClass('am-scrollview')){
				$tar = $tar.parents('.am-scrollview');
			}
			if($tar.length){
				var scrollview = $tar.data('scrollview');
				if(scrollview){
					if(scrollview.direction[1]){
						console.log('y');
						//y轴
						var c = scrollview._currentPos;
						scrollview.scrollTo([c[0],c[1]+evt.originalEvent.wheelDelta*1]);
					}else if(scrollview.direction[0]){
						console.log('x');
						var c = scrollview._currentPos;
						scrollview.scrollTo([c[0]+evt.originalEvent.wheelDelta*1,c[1]]);
					}
				}
			}
		});
	}
});
