(function ($) {
    am.timeDiscountModal = {
        init: function () {
            var _this = this;
            this.$ = $('#timeDiscountModal').on('vclick', '.close', function () {
                _this.hide();
            });
            this.$cardName = this.$.find('.cardName');
            this.$ruleWrap = this.$.find('.ruleWrap');
            this.$ruleList = this.$.find('.ruleList');
            this.$ruleItem = this.$ruleList.find('.ruleItem').remove();
            this.$ruleListScroll = new $.am.ScrollView({
                $wrap: _this.$.find('.ruleWrap'),
                $inner: _this.$.find('.ruleList'),
                direction: [false, true]
            });
        },
        render: function (newCardRule) {
            if (newCardRule) {
                this.$cardName.text(newCardRule.cardTypeName || '');
                this.$ruleList.html('<pre>' + newCardRule.remark || '' + '</pre>');
                this.$ruleListScroll.refresh();
            }
        },
        show: function (newCardRuleObj) {
            if (am.isNull(newCardRuleObj)) {
                console.log('卡新规则不存在');
            } else {
                this.render(newCardRuleObj);
                this.$.show();
            }
        },
        hide: function () {
            this.$.hide();
            this.$ruleList.empty();
        },
        
    };
    am.timeDiscountModal.init();
})(jQuery);