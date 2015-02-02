var app = app || {};
var ENTER_KEY = 13;
var ESC_KEY = 27;
var CRITICAL_WIDTH = 1024;
var URL_ROOT = 'http://localhost:4242';
var MAX_LOCAL_STORAGE = 4870; //This is in KB
var WARN_LOCAL_STORAGE_PERC = 0.65;
var DEBUG = true;

// Template rc - request collection / request context
// So that we can distinguish variables within a template as being the requested variables.
_.templateSettings.variable = "rc";

$(function () {
	'use strict';

	// kick things off by creating the application
	new app.AppView();
	
	Backbone.history.start();
});
