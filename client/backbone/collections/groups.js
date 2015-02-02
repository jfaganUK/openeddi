/*****

The group collection

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.GroupList = Backbone.Collection.extend({
		// the items in this collection
		model: app.GroupClass,	

		// the url of the api
		url: URL_ROOT + '/groups/group/',
		
		sync: function() {
			// do nothing, groups don't sync
		},
		
	});
	
});
