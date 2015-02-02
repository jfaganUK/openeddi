/*****

The main menu view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.MainView = Backbone.View.extend({
		tagName: "div",
		
		className: "mainmenu",
		
		template: _.template($('#mainmenu-template').html()),
		
		initialize: function() {
			this.rviews = [];
			this.lsPerc = localStorageSpace() / MAX_LOCAL_STORAGE;
			this.lsWarningTemplate = _.template($('#localstorage-warning-template').html());
			
			// Get the respondent data -- if this fails it will trigger a login
			if ( app.respondents.hasDirtyOrDestroyed() ) {
				app.respondents.fetch();
				app.respondents.syncDirtyAndDestroyed();
			} else {
				app.respondents.fetch();
			}
			
			
			// If the section changes, close out this view
			this.listenTo(app.appState, 'change:section', this.close);
			
			this.listenTo(app.respondents, 'sync', this.addAllRespondents);
			
			//If there aren't any dirty or destroyed records, then clear the local storage
			if(!anyDirtyDestroyed()) {
				this.clearStorage();
				app.respondents.fetch();
			}
		},
		
		events: {
			"click #newSwabSurvey" :	"newSurvey",
			"click #newNonSwabSurvey" : "newSurvey",
			"click #clearStorage" :	"clearStorage",
		},
	
		render: function() {
			this.addAllRespondents();
		},
		
		newSurvey: function(ev) {
			$(ev.currentTarget).button('loading');
			var self = this;
			window.setTimeout(function() {
				var sid = +$(ev.currentTarget).val();
				app.appState.set('sid', sid);
				app.appState.trigger('newsurvey');
				self.close();
			}, 500);
		},
		
		addAllRespondents: function() {
			this.$el.html(this.template());
			app.respondents.each(this.addRespondent, this);
			if(this.lsPerc > WARN_LOCAL_STORAGE_PERC) {
				var qq = {lsPerc: Math.ceil(this.lsPerc * 100)};
				this.$('.warning-space').html(this.lsWarningTemplate(qq));
			}
		},
		
		addRespondent: function(qq) {
			var rview = new app.RespondentView({model: qq});
			rview.render();
			this.$('.respondent-space').append(rview.$el);
			this.rviews.push(rview);
			
		},
		
		clearStorage: function() {
			localStorage.clear();
		},
		
		close: function() {			
			_.each(this.rviews, function(qq) {
				qq.close();
			});
			
			this.remove();
		}
	});
	
});
