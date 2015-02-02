/*****

The main menu view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.IntroView = Backbone.View.extend({
		tagName: "div",
		
		className: "intro",
		
		template: _.template($('#intro-template').html()),
		
		initialize: function() {
			this.listenTo(app.appState, 'change:section', this.close);
		},
		
		events: {
			"click .acceptConsent" : "acceptConsent",
		},
	
		render: function() {
			this.$el.html(this.template(this.attributes));
		},
		
		acceptConsent: function() {
			app.appState.trigger('newsurvey');
		},
		
		close: function() {			
			this.remove();
		},

	});
	
});
