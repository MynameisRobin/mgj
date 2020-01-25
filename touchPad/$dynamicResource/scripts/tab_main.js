am.tab.main = new $.am.Tab({
	id : "tab_main",
	items : [ {
		onclick : function(e) {
			if (am.tab.main._idx == 0 && !e.FORCEREFRESH) {
				return false;
			}
			$.am.changePage(am.page.reservation, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
			return true;
		}
	}, {
		onclick : function(e) {
			if (am.tab.main._idx == 1 && !e.FORCEREFRESH) {
				return false;
			}
			if(amGloble.metadata.shopPropertyField.mgjBillingType){
				$.am.changePage(am.page.hangup, "", {openbill:1,refresh:1,FORCEREFRESH:e.FORCEREFRESH});
			}else{
				$.am.changePage(am.page.service, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
			}
			
			return true;
		}
	}, {
		onclick : function(e) {
			if (am.tab.main._idx == 2 && !e.FORCEREFRESH) {
				return false;
			}
			$.am.changePage(am.page.product, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
			return true;
		}
	}, {
		onclick : function(e) {
			if (am.tab.main._idx == 3 && !e.FORCEREFRESH) {
				return false;
			}
			$.am.changePage(am.page.memberCard, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
			return true;
		}
	}, {
	    onclick: function (e) {
	        if (am.tab.main._idx == 4 && !e.FORCEREFRESH) {
	            return false;
	        }
			$.am.changePage(am.page.comboCard, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
	        return true;
	    }
	}, {
	    onclick: function (e) {
	        if (am.tab.main._idx == 5 && !e.FORCEREFRESH) {
	            return false;
	        }
	        $.am.changePage(am.page.member, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
	        return true;
	    }
	}, {
	    onclick: function (e) {
	        if (am.tab.main._idx == 6 && !e.FORCEREFRESH) {
	            return false;
	        }
	        $.am.changePage(am.page.billRecord, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
	        return true;
	    }
	},{
	    onclick: function (e) {
	        if (am.tab.main._idx == 7 && !e.FORCEREFRESH) {
	            return false;
	        }
        	$.am.changePage(am.page.storage, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
	        return true;
	    }
	}, {
	    onclick: function (e) {
	        if (am.tab.main._idx == 8 && !e.FORCEREFRESH) {
	            return false;
	        }
	        $.am.changePage(am.page.billStatistics, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
	        return true;
	    }
	}, {
	    onclick: function (e) {
	        if (am.tab.main._idx == 9 && !e.FORCEREFRESH) {
	            return false;
	        }
	        $.am.changePage(am.page.about, "", e.FORCEREFRESH?{FORCEREFRESH:e.FORCEREFRESH}:"");
	        return true;
	    }
	}]
});
