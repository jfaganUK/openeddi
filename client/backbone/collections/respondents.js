/*****

The respondents collection

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.RespondentList = Backbone.Collection.extend({
		// the items in this collection
		model: app.aRespondent,	
		// the url of the api
		url: URL_ROOT + '/respondents/respondent/',
		
		comparator: function(respondent) {			
			return String.fromCharCode.apply(String,
				_.map(respondent.get('datecreated').split(''), function (c) {
					return 0xffff - c.charCodeAt();
				})
			);
		},
		
		hasDirtyOrDestroyed: function() {
			var lDirty = localStorage.getItem(this.url + "_dirty");
			var lDestroyed = localStorage.getItem(this.url + "_destroyed");
			
			if(lDirty || lDestroyed) { return true; }
			return false;
		},
		
	});
	
});
