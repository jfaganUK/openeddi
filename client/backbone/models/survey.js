/*****

The survey model.


*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.SurveyClass = Backbone.Model.extend({
		defaults: function() {	
		},
		
		initialize: function() {
			this.questions = new app.QuestionList;
		},
	});
	
});
