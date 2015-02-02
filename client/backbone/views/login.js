/*****

Name views

	- NameView: simple list item
	- NameToggle: a toggle button
	- NameInterpret: interpret a name

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// note that it is frequently created with an attribute called namelist
	
	app.LoginView = Backbone.View.extend({
		className: "loginForm",
		
		template: _.template($('#login-template').html()),
		
		events: {
			'click .loginAttempt' 	: 'loginAttempt',
			'click .cancelLogin'  	: 'cancelLogin',
			'submit form' 				: 'loginAttempt',
		},
		
		initialize: function() {
			this.listenTo(app.appState, 'change:section', this.close);
		},
		
		render: function() {
			this.$el.html(this.template());
			this.$('.inputUsername').focus();
			return this;
		},
		
		loginAttempt: function() {
			app.setCredentials(this.$('.inputUsername').val(),$('.inputPassword').val());
			app.appState.set('section', 'main');
			this.close();
			return false; // so that the submit fails
		},
		
		cancelLogin: function() {
			app.appState.set('section', 'main');
			this.close();
		},
		
		close: function() {
			this.remove();
		},
		
	});

});
