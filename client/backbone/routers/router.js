/*****

The app router

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.AppRouter = Backbone.Router.extend({
		routes: {
			"" 					: "index",
			"landing"			: "landing",
			"intro"				: "intro",
			"main"				: "main",
			"outtro"			: "outtro",
			"login" 			: "login",
			"logout"			: "logout",
			"survey"			: "survey",
			"survey/:group"	    : "surveygroup"
		},
		
		login: function() {
			console.log('login route');
			app.appState.set('section','login');
		},
		
		logout: function() {
			console.log('logout route');
			app.appState.set('section', 'login');
			app.appState.trigger('logout');
		},
		
		index: function() {
			console.log('index route');
			app.router.navigate('intro', {trigger: true});
		},
		
		landing: function() {
			console.log('landing route');
			app.appState.set('section', 'landing');
		},
		
		main: function() {
			console.log('main menu route');
			app.appState.set('section','main');
		},
		
		survey: function() {
			if(app.appState.get('gix') === null) {
				this.navigate('main', {trigger: true});
			} else {
				this.navigate('survey/' + app.appState.get('gix'), {trigger: true});
			}
		},
		
		intro: function() {
			console.log('intro - yay');
			app.appState.set('section', 'intro');
		},
		
		outtro: function() {
			console.log('outtro - thank you!');
			app.appState.set('section', 'outtro');
		},
		
		surveygroup: function(group) {
			if( typeof app.survey === 'undefined') {
				app.appState.set('section','main');	
				return;
			}
		
			var ngroup = group || 0;				// Default to the first group
			console.log('attempting to load group ' + group);
			app.appState.set('gix', ngroup);
			app.appState.trigger('groupnav');
		},
		
	});
	
	app.router = new app.AppRouter();
	
});
