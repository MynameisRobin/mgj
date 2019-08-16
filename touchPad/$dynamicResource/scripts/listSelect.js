/**params：
 * $:挂载点
 * data:要渲染的数组数据
 * 
 * method：
 * handleTimer 只是做为全局函数来处理模糊搜索的频繁调用问题
 */
(function ($) {
    var self = am.listSelect = {
        init: function () {
            this.$ = $('#listSelect');
            this.$wrap = this.$; //红包弹窗
            this.$listUl = this.$wrap.find('.list-ul');
            // 绑定事件
            this.$listUl.on('vclick', '.item-li', function () {
                // self.$taget.find('.searchphone').val($(this).text().trim());
                self.$taget.find('input').val($(this).text().trim());
                self.hide();
            })
        },
        render: function (data) {
            this.$listUl.empty();
            if (data && data.length) {
                for (var i = 0, len = data.length; i < len; i++) {
                    var item = data[i];
                    var $li = $('<li class="item-li am-clickable">' + item + '</li>').data('data-item', item);
                    this.$listUl.append($li);
                }
            } else {
                self.hide();
            }
        },
        show: function (opt) {
            this.$taget = opt.$;
            var listSelectWidth=this.$taget.width();
            if (!this.$.is(':visible')) {
                this.$.appendTo(opt.$).show().width(listSelectWidth);
            }
            this.render(opt.data);
        },
        hide: function () {
            this.$.hide();
            this.$listUl.empty();
        },
        // 处理模糊搜索频繁调用 仅只是全局的方法
        handleTimer: function (callback, time) {
            var isExecute = false;
            var timer = setTimeout(function () {
                if (typeof callback == 'function') {
                    if (timer) {
                        clearTimeout(timer);
                        timer = '';
                    }
                    isExecute = true;
                    callback();
                }
            }, time || 500);
            this.clearExecuted = function () {
                if (!isExecute && timer) {
                    clearTimeout(timer)
                }
            }
        },
    };
    $(function () {
        am.listSelect.init();
    })
})(jQuery);