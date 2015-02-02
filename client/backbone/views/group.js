/*****

The group view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.GroupView = Backbone.View.extend({
		tagName: "div",
		
		className: "questiongroup",
		
		template: _.template($('#group-template').html()),
		
		events: {
			"click .prevGroupBtn" : "prevGroup",
			"click .nextGroupBtn" : "nextGroup",
			"click .bigPrevArrow" : "prevGroup",
			"click .bigNextArrow" : "nextGroup"
		},
		
		initialize: function() {
			this.gid = this.attributes.gid;
			this.questions = new app.QuestionList();
			this.questions.add(app.survey.questions.where({gid: this.gid}));
			this.qviews = [];
			
			// If the section changes, close out this view
			this.listenTo(app.appState, 'change:section', this.close);
		},
	
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.addAllQuestions();
				// otherwise the scroll will start where you were on the last page
			$('html, body').animate({scrollTop: '0px'}, 300); 
		},
		
		addQuestion: function(aquestion) {
			//aquestion.attributes.dkrf = true; // hard-coded the dkrf option to true
			var qview = new app.QuestionView({model: aquestion});
			qview.render();
			this.$('.questionSpace').append(qview.$el);
			this.qviews.push(qview);
		},
		
		addAllQuestions: function() {
			this.questions.each(this.addQuestion, this);
		},
		
		nextGroup: function() {
			app.appState.trigger('nextgroup');
		},
		
		prevGroup: function() {
			app.appState.trigger('prevgroup');
		},

		
		// Close function
		close: function() {
			console.log('closing group');	
			_.each(this.qviews, function(qq) {
				qq.close();
			});
			
			this.remove();
		},
		
	});
	
});
