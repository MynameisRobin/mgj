//用于根据会员id查询会员完整信息 和 转换bill所需的数据 
//处理用户信息
am.searchMember = {
    getMemberById:function(id,cid,cb){
        if(id && id!=-1){
            am.loading.show();
            am.api.queryMemberById.exec({
                memberid:id
            },function(ret){
                am.loading.hide();
                if(ret && ret.code==0 && ret.content && ret.content.length){
                    //to do 选择会员卡
                    if(ret.content.length==1){
                        if(ret.content[0].cid == cid){
                            cb(ret.content[0]);
                        }else{
                            cb(null);
                        }
                        return;
                        
                    }else if(ret.content.length>1){
                        if(cid){
                            for (var i = 0; i < ret.content.length; i++) {
                                if(ret.content[i].cid == cid){
                                    cb(ret.content[i]);
                                    return;
                                    break;
                                }
                            }
                            cb && cb(null);
                        }else{
                            var arr = [];
                            for(var i=0;i<ret.content.length;i++){
                                var item = ret.content[i];
                                var cardName = item.cardName;
                                var balanceFee = item.balance;
                                if(item.cardtype == 1 && item.timeflag==0 && balanceFee){
                                    cardName+='(余额:￥'+balanceFee.toFixed(0)+')';
                                }
                                arr.push({
                                    name:cardName,
                                    data:item
                                });
                            }
                            am.popupMenu("请选择会员卡", arr, function (ret) {
                                cb(ret.data);
                            });
                            return;
                        }
                    }
                }else{
                    am.msg("用户信息读取失败~");
                }
            });
        }else{
            cb(null);
        }
    },
    getPaidCard:function(id,cb){//获取储值卡list
        this.getcardListById(id,function(content){
            var res = [];
            if(content && content.length){
                
                for(var i=0;i<content.length;i++){
                    var data = content[i];
                    if(data.cardtype == 1 && (data.timeflag == 0 || data.timeflag == 2)){
                        res.push(content[i]);
                    }
                }
            }
            cb(res);
        });
    },
    getcardListById:function(id,cb){
        if(id && id!=-1){
            am.loading.show();
            am.api.queryMemberById.exec({
                memberid:id
            },function(ret){
                am.loading.hide();
                if(ret && ret.code==0 && ret.content && ret.content.length){
                    //to do 选择会员卡
                    if(ret.content.length==1){
                        cb(ret.content);
                    }else if(ret.content.length>1){
                        var arr = [];
                        for(var i=0;i<ret.content.length;i++){
                            var item = ret.content[i];
                            var _item = am.clone(item);
                            _item.name = item.cardName;
                            _item.value = item.cid;
                            arr.push(_item);
                        }
                        cb(arr);
                    }
                }else{
                    am.msg("用户信息读取失败~");
                }
            });
        }else{
            cb(null);
        }
    }
}