am.sourceModal = {
    init: function () {
        var self = this;
        this.$ = $("#sourceModal");
        this.renderCustomerSource(this.getCustomerSource());
        this.sourceScroll = new $.am.ScrollView({
            $wrap: self.$.find(".changesource-wrapper"),
            $inner: self.$.find(".changesource-wrapper .changesource"),
            direction: [false, true],
            hasInput: false
        });
        this.$changeBox = this.$.find(".changesource .changebox")
        this.$.find(".close").vclick(function () {
            self.$.hide();
        });
        this.$.find(".inner").vclick(function (e) {
            e.stopPropagation();
        })
        this.$.vclick(function () {
            self.$.hide();
        });
        this.$.find(".btnCancer").vclick(function () {
            self.$.hide();
        });
        this.$.find(".btnOk").vclick(function () {
            var sourcedata = {
                mgjsourceid: self.$.find('.selected .change_words').attr('data-val'),
                mgjsourcename: self.$.find('.selected .change_words').text(),
            }
            self.opt.sourceSave && self.opt.sourceSave(sourcedata);
            self.$.hide();
        });
        this.$.find('.changesource').on("vclick", ".changebox", function () {
            $(this).addClass("selected").siblings().removeClass("selected");
        });
    },
    show: function (opt) {
        if (!this.$){
            this.init();
        }
        if (opt) {
            this.defaultValue(opt);
            this.opt = opt;
        }
        this.sourceScroll.refresh();
        this.sourceScroll.scrollTo('top');
        this.$.show();
        var innerHeight = this.$.find(".inner").outerHeight();
        this.$.find(".inner").css("margin-top",-innerHeight/2);
    },

    defaultValue: function (opt) {
        if (opt.mgjsourceid) {
            this.$.find("[data-val=" + opt.mgjsourceid + "]").parent().addClass("selected").siblings().removeClass("selected");
        } else {
            this.$changeBox.removeClass("selected");
        }
    },
    getCustomerSource: function() {
        var memSourceList = am.metadata.memSourceList;
        var menSourceRes = []
        $.each(memSourceList, function(i, item) {
            if(item.sourceId == 4 || item.sourceId == 5 || item.sourceId == 6){return true;}
            if(item.status) {
                menSourceRes.push(item)
            }
        })
        return menSourceRes
    },
    renderCustomerSource: function (arr) {
        var _this = this;
        this.$.find('.cm_form.source .changesource').empty()
        $.each(arr, function (i, item) {
            var $div = $('<div class="changebox am-clickable"><span class="change_icon"></span><span class="change_words"></span></div>');
            $div.find('.change_words').text(item.sourceName).attr('data-val', item.sourceId).attr('data-status', item.status);
            _this.$.find('.cm_form.source .changesource').append($div);
        })
    }
};
