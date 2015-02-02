/*****

The questions collection

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.QuestionList = Backbone.Collection.extend({
		// the items in this collection
		model: app.aQuestion,	
		// the url of the api
		url: function() {
			return URL_ROOT + '/responses/response/rid/' + app.appState.get('rid') + '/';
		},
		
		initialize: function() {
			this.createStore();
		},
		
		// Questions will be sorted by their 'sortIndex'... or not at all.
		comparator: function(question) {
			return question.get('sortIndex');
		},
		
		// On progress, do this
		progress: function(ev) {
			console.log('Progress: ' + Math.ceil(ev.loaded / ev.total * 100));
		},
		
		// number of names added
		surveyLength: function() {
			return this.length;
		},
		
	});
	
});
