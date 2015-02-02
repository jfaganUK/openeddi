/*****

The appstate model.

Sections:
	main - not currently taking a survey at all, at the main menu
	intro - the introduction and consent
	survey - the actual survey portion
	exit - outtro
	
The progress of the survey will be controlled using this appstate.

To progress, you change the app state and the app should update accordingly when it's changed.

It it is also used to trigger app-wide events. For instance in one part of the app you can trigger a new survey: app.appState.trigger('newsurvey')
And another part of the app will be listening for it, this.listenTo(app.appState, 'newsurvey', this.newSurvey) 

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.appStateC = Backbone.Model.extend({
		defaults: function() {	
			return {
				section: null,	// The section
				gix: null,
				sid: null,
				rid: null,
			};
		},
		
		initialize: function() {
		}	
	});
	
	
});
