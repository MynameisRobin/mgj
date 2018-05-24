
$(function() {

    amGloble.popup.list = {
        init: function() {
            var self = this;
            this.$ = $("#popup-list");
            this.$title = this.$.find(".title");
            this.$content = this.$.find(".content");
            this.$close = this.$title.children(".close").vclick(function() {
                self.fcb && self.fcb();
                self.hide();
            });
            this.$ul = this.$.find(".list").on("vclick", "li", function() {
                self.scb && self.scb($(this).data("item"));
                self.hide();
            });
            this.$li = this.$ul.children(":first");
        },
        show: function(opt) {
            var self = this;
            var keys = opt.shownKeys;
            this.scb = opt.scb;
            this.fcb = opt.fcb;

            this.$title.html(opt.title);
            this.$content.html(opt.content);

            var $ul = this.$ul.empty();
            $.each(opt.data, function(i, item) {
                var $li = self.$li.clone(true, true);
                var name = [];
                var str = "";
                if (keys.length > 1) {
                    str += "<p class='line1'>" + (item[keys[0]] || "") + (item[keys[1]] || "") + "</p>";
                    str += "<p class='line2'>" + (item[keys[2]] || "") + " " + (item[keys[3]] || "") + "</p>";
                } else {
                    str = item[keys[0]];
                }
                $li.html(str);
                $li.data("item", item);
                $ul.append($li);
            });
            this.$.show();

        },
        hide: function() {
            this.$.hide();
            this.$ul.empty();
            delete this.scb;
            delete this.fcb;
        }
    };

    amGloble.popup.list.init();

});
