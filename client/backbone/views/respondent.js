/*****

The respondent views

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.RespondentView = Backbone.View.extend({
		tagName: "div",
		
		className: "main-respondent",
		
		template: _.template($('#respondent-main-template').html()),
		
		events: {
			"click .loadRespondentSurvey" : "loadRespondentSurvey",
			"click .respondentSync" : "syncRespondent",
			"click .viewLocal" : "viewLocal",
		},
		
		initialize: function() {
			this.respProgress = 1;
			this.nameProgress = 1;
		
			this.listenTo(app.respondents, 'sync', this.render);
		},
	
		render: function() {
			var qq = this.model.toJSON();
			qq.timeago = $.timeago( this.model.convertDate() );
			
			var lNames = this.model.getLocalNames();
			var lResponses = this.model.getLocalResponse();
			var local = this.model.getLocal();
			
			// for the progress bars
			this.lNames = lNames;
			this.lResponses = lResponses;
			
			qq.names = {local: (lNames.ids.length > 0),
				dirty: (lNames.dirty.length > 0),
				destroyed: (lNames.destroyed.length > 0)};
				
			qq.responses = {local: (lResponses.ids.length > 0),
				dirty: (lResponses.dirty.length > 0),
				destroyed: (lResponses.destroyed.length > 0)};
				
			qq.local = {local: local.local,
				dirty: local.dirty,
				destroyed: local.destroyed};
			
			// should the respondent data be synced?
			qq.sync = (qq.names.local || qq.names.dirty || qq.names.destroyed || 
				qq.responses.local || qq.responses.dirty || qq.responses.destroyed ||
				qq.local.dirty || qq.local.destroyed);
				
			// get the user
			qq.user = JSON.parse(qq.surveylogic).user;
				
			this.$el.html(this.template(qq));
		},
		
		loadRespondentSurvey: function() {
			console.log('clicking the respondent');
			app.appState.set('rid', this.model.id);
			app.appState.trigger('loadsurvey');
		},
		
		syncRespondent: function() {
			var self = this;
			//this.model.syncAll();
			this.syncAll();
			
		},
		
		syncAll: function() {
			
			// If you can't reach the host, do not proceed
			// TODO: give some feedback, if they can't reach the host, TELL THEM
			if ( !app.hostReachable() ) {
				return false;
			}
		
			var self = this;
			this.syncing = true;
			app.appState.set('rid', this.model.id);
			app.appState.set('startsurvey', false);
			app.appState.trigger('loadsurvey');
			
			app.appState.once('surveyready', function() {
				self.$('.syncResponseProgress').show();
				self.$('.respondentSync').hide();
				
				/* Responses -> Names -> Respondents -> Clear the local data */
				self.syncResponses();
			});
		},
		
		updateResponseProgress: function() {
			var syncID = app.appState.get('lastsynced');
			var n = this.lResponses.dirty.length;
			
			if(_.indexOf(this.lResponses.dirty, syncID) >= 0) {
				this.respProgress++;
				console.log('--- Syncing Responses: ' + this.respProgress + '  ID: ' + app.appState.get('lastsynced') + ' Progress: ' + Math.ceil(this.respProgress / this.lResponses.dirty.length * 100));
				
				var p = Math.ceil(this.respProgress / n * 100);
				this.$('.syncResponseProgress .bar').css('width', p + '%');
			}
			
			// as soon as we hit the final response, hit the names
			if (this.respProgress >= n) {
				this.stopListening(app.appState, 'questionSync', this.updateResponseProgress);
				
				this.$('.syncResponseProgress').hide();
				this.$('.syncNameProgress').show();
				
				this.syncNames();
			}
		},
		
		updateNameProgress: function() {
			var syncID = app.appState.get('lastsynced');
			var n = this.lNames.dirty.length;
			
			if(_.indexOf(this.lNames.dirty, syncID) >= 0) {
				this.nameProgress++;
				console.log('--- Syncing Names: ' + this.nameProgress + '  ID: ' + app.appState.get('lastsynced') + ' Progress: ' + Math.ceil(this.nameProgress / n * 100));
				
				var p = Math.ceil(this.respProgress / n * 100);
				this.$('.syncResponseProgress .bar').css('width', p + '%');
			}
			
			// as soon as we hit the final name, hit the respondents
			if (this.nameProgress >= n) {
				this.stopListening(app.appState, 'nameSync', this.updateNameProgress);
				this.$('.syncNameProgress').hide();
				this.syncRespondents();
			}
		},
		
		syncResponses: function() {
			if (this.lResponses.dirty.length > 0) {
				this.listenTo(app.appState, 'questionSync', this.updateResponseProgress);
				app.survey.questions.syncDirtyAndDestroyed();
			} else {
				this.$('.syncResponseProgress').hide();
				this.$('.syncNameProgress').show();
				this.syncNames();
			}
			
		},
		
		syncNames: function() {
			console.log('--- syncing names ---');
			if (this.lNames.dirty.length > 0) {
				this.listenTo(app.appState, 'nameSync', this.updateNameProgress);	
				app.names.syncDirtyAndDestroyed();
			} else {
				this.$('.syncNameProgress').hide();
				this.syncRespondents();
			}
		},
		
		syncRespondents: function() {
			$.when(app.survey.questions.store.totalClear()) 
				.then(app.names.store.totalClear())
				.then(app.respondents.syncDirtyAndDestroyed())
				.then(app.respondents.fetch())
				.then(function() { app.appState.set('gix',null) });
		},
		
		viewLocal: function() {
			// Create a modal window with the local data
			this.localView = new app.LocalView({model: this.model});
			this.localView.render();
			this.$el.append(this.localView.$el);
			var qq = this.localView;
			$('#viewLocal-modal').modal('show');
			// Make sure to close it when it's hidden
			$('#viewLocal-modal').on('hidden', function() {
				qq.close();
			});
		},
		
		// Close function
		close: function() {
			this.remove();
		},
		
	});
	
});
