am.tab.main = new $.am.Tab({
	id : "tab_main",
	items : [ {
		onclick : function() {
			if (am.tab.main._idx == 0) {
				return false;
			}
			$.am.changePage(am.page.reservation, "");
			return true;
		}
	}, {
		onclick : function() {
			if (am.tab.main._idx == 1) {
				return false;
			}
			if(amGloble.metadata.shopPropertyField.mgjBillingType){
				$.am.changePage(am.page.hangup, "", {openbill:1});
			}else{
				$.am.changePage(am.page.service, "");
			}
			
			return true;
		}
	}, {
		onclick : function() {
			if (am.tab.main._idx == 2) {
				return false;
			}
			$.am.changePage(am.page.product, "");
			return true;
		}
	}, {
		onclick : function() {
			if (am.tab.main._idx == 3) {
				return false;
			}
			$.am.changePage(am.page.memberCard, "");
			return true;
		}
	}, {
	    onclick: function () {
	        if (am.tab.main._idx == 4) {
	            return false;
	        }
			$.am.changePage(am.page.comboCard, "");
	        return true;
	    }
	}, {
	    onclick: function () {
	        if (am.tab.main._idx == 5) {
	            return false;
	        }
	        $.am.changePage(am.page.member, "");
	        return true;
	    }
	}, {
	    onclick: function () {
	        if (am.tab.main._idx == 6) {
	            return false;
	        }
	        $.am.changePage(am.page.billRecord, "");
	        return true;
	    }
	},{
	    onclick: function () {
	        if (am.tab.main._idx == 7) {
	            return false;
	        }
        	$.am.changePage(am.page.storage, "");
	        return true;
	    }
	}, {
	    onclick: function () {
	        if (am.tab.main._idx == 8) {
	            return false;
	        }
	        $.am.changePage(am.page.billStatistics, "");
	        return true;
	    }
	}, {
	    onclick: function () {
	        if (am.tab.main._idx == 9) {
	            return false;
	        }
	        $.am.changePage(am.page.about, "");
	        return true;
	    }
	}]
});
