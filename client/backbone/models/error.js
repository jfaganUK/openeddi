/*****

The error model.

For tracking and uploading errors that people run into.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.ErrorModel = Backbone.Model.extend({	
		url: URL_ROOT + '/errortrack/error/',
	
		defaults: function() {
			return {
				rid: app.appState.get('rid'),
				agent: navigator.userAgent,
				appstate: JSON.stringify(app.appState.toJSON()),
			};
		},
		
		initialize: function() {
		},
		
		
	});

});
