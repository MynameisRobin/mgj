//创建am命名空间
$.am.elements = {
    init: function () {
        var $swiths = $("div.page-switch");
        $swiths.addClass("am-clickable").vclick(function () {
            $(this).children().toggleClass("selected");
            return false;
        });
    }
};

$.fn.disabled = function (a) {
    this.attr("disabled", a);
    if (this.next().is(".am-input-inner")) {
        a ? this.parent().addClass("disabled") : this.parent().removeClass("disabled");
    }
    return this;
};
$.fn.checked = function (a) {
    this.attr("checked", a);
    if (this.next().is(".am-input-inner")) {
        this.trigger("change");
    }
    return this;
};
$.fn.getVal = function () {
    if (this.hasClass("page-switch")) {
        return this.find(".selected").attr("value");
    }
};
$.fn.setVal = function (i) {
    if (this.hasClass("page-switch")) {
        this.children().eq(i).addClass("selected").siblings().removeClass("selected");
    }
    return this;
};

$.formatNumber = function (nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};
