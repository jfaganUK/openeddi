/*****

The main menu view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.LandingView = Backbone.View.extend({
		tagName: "div",
		
		className: "landing",
		
		template: _.template($('#landing-template').html()),
		
		initialize: function() {
			this.listenTo(app.appState, 'change:section', this.close);
		},
		
		events: {
			"click .userStartSurvey" : "userStartSurvey",
		},
	
		render: function() {
			this.$el.html(this.template(this.attributes));
			
		},
		
		close: function() {			
			this.remove();
		},
		
		userStartSurvey: function() {
			app.router.navigate('intro', {trigger: true});
		},
		

	});
	
});
