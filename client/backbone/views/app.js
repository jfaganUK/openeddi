/*****

The app view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.AppView = Backbone.View.extend({
		el: $("#app-space"),
		
		events: {
		},
		
		initialize: function() {
			
			// Intialize the app state
			app.appState = new app.appStateC;
			app.appState.set('loggedin', false);
			
			// Re render the page if the section changes
			this.listenTo(app.appState, 'change:section', this.render);
			this.listenTo(app.appState, 'change:loggedin', this.renderFooter);
			
			// Create the respondent list
			app.respondents = new app.RespondentList();
			
			// Update the survey progress bar
			this.listenTo(app.appState, 'group-appended', this.updateSurveyProgressBar);
						
			// Listen for a newsurvey event on the app state.		
			this.listenTo(app.appState, 'newsurvey', this.newSurvey);	
			this.listenTo(app.appState, 'loadsurvey', this.loadSurvey);

			// Listen for changes in the group
			this.listenTo(app.appState, 'nextgroup', this.nextGroup);
			this.listenTo(app.appState, 'prevgroup', this.prevGroup);
			this.listenTo(app.appState, 'groupnav', this.groupNav);
			
			// Listen for the logout event
			this.listenTo(app.appState, 'logout', this.logout);
			
			// Listen for keyboard events
			$(document).on('keydown',$.proxy(this.keyEvents,this));
			
			// Listen for page resizing, trigger an app event for it.
			app.appState.set('appwidth', window.innerWidth);
			window.onresize = function() {
				console.log('Page resized!');
				app.appState.set('appwidthPrevious', app.appState.get('appwidth'));
				app.appState.set('appwidth', window.innerWidth);
				app.appState.trigger('resize');
			};
			
			// Primarily for the intro, everything else loads when the user clicks start
			this.surveyinfo = survey_json;
		},
		
		render: function() {
			var sec = app.appState.get('section');
			
			app.appState.set('hostreachable', app.hostReachable());
			
			// The landing page
			if(sec === 'landing') {
				this.landingView = new app.LandingView;
				this.landingView.render();
				this.$el.append(this.landingView.$el);
			}
			
			// Login section
			if(sec === 'login') {
				this.loginView = new app.LoginView;
				this.loginView.render();
				this.$el.append(this.loginView.$el);
			}
			
			// Create Main menu
			if(sec === 'main') {
				app.appState.set('section','survey');
				/* 
				app.router.navigate('main');
				app.mainMenu = new app.MainView();
				app.mainMenu.render();
				this.$el.append(app.mainMenu.$el); */
			}
			
			// Add a group based
			if(sec === 'survey') {
				if(DEBUG) {
					app.router.navigate('survey/' + app.appState.get('gix'));
					this.addGroup( app.survey.get('groupOrder')[ app.appState.get('gix') ] );	
				} else {
					try {
						app.router.navigate('survey/' + app.appState.get('gix'));
						this.addGroup( app.survey.get('groupOrder')[ app.appState.get('gix') ] );	
					} catch (err) {
						var newerror = new app.ErrorModel;
						console.log(err);
						newerror.save({error: err.message, stack: err.stack});
						var errorview = new app.ErrorView({model: newerror});
						this.$el.append(errorview.render().$el);
					}		
				}
			}
			
			// Change to the outtro
			if(sec === 'outtro') {
				app.router.navigate('outtro');
				this.outtroView = new app.OuttroView({attributes: app.survey.attributes});
				this.outtroView.render();
				this.$el.append(this.outtroView.$el);
			}
			
			if(sec === 'intro') {
				app.router.navigate('intro');
				this.introView = new app.IntroView({attributes: this.surveyinfo});
				this.introView.render();
				this.$el.append(this.introView.$el);
			}
			
			this.renderFooter();
			
			return this;
		},
		
		renderFooter: function() {
			console.log('doing footer');
			$('#appFooter').html(_.template($('#footernav-template').html()));
            if (app.appState.get('section') === 'survey') {
                this.updateSurveyProgressBar();
            }
		},
		
		logout: function() {
			this.currenResp = undefined;
			app.clearLogin();
		},
		
		keyEvents: function(ev) {

			// Make arrow keys move the pages.
			if(app.appState.get('section') === 'survey') {
				if( $(':focus').is('input') ) { // if you are typing in an input box, the keys should work normally
					return;
				}
				if( ev.keyCode === 37) {
					this.prevGroup();
				}
				if( ev.keyCode === 39) {
					this.nextGroup();
				}
			}
		},
		
		newSurvey: function() {			
			console.log('--- new survey');
			
			// add a new respondent 
			this.currentResp = app.respondents.create();
			app.appState.set('rid', this.currentResp.id);
			
			// Set the current group to the first
			app.appState.set('gix', 0);
			
			// this clears all the survey data and creates new ones
			this.clearSurvey();
			
			// should have been set by the button that was clicked in main
			var sid = app.appState.get('sid');
			var survey_json = survey_json;
			var groups_json = groups_json;
			
			// save the respondent data (after we set the sid from clearSurvey)
			this.currentResp.save({surveystatus: 'surveyStarted', 
				lastgroup: -1, 
				survey: app.appState.get('sid'),
				surveylogic: JSON.stringify(survey_json),
				grouplogic: JSON.stringify(groups_json)});
				
			// change the app section
			app.appState.set('section','survey');
			
		},
		
		// the sid and rid should be set on appState
		loadSurvey: function() {
			var appview = this;
			// set the current respondent
			this.currentResp = app.respondents.get(app.appState.get('rid'));
			var startsurvey = typeof app.appState.get('startsurvey') === 'undefined' ? true : app.appState.get('startsurvey');
			
			var rSurvey_logic = JSON.parse(this.currentResp.get('surveylogic'));
			var rGroups_logic = JSON.parse(this.currentResp.get('grouplogic'));
			
			// create a new survey object (creates a questions collection)
			app.appState.set('sid', rSurvey_logic.sid);
			app.survey = new app.SurveyClass(rSurvey_logic);
			
			// retrieve the response data
			app.survey.questions.fetch();
			
			app.survey.questions.once('sync', function() { 

				appview.syncQuestionPrep();
				
				// retrieve the name data
				app.names = new app.NameList;
				app.names.fetch();

				app.names.once('sync', function() {
					
					// Groups 
					app.groups = new app.GroupList();
			
					_.each(rGroups_logic, function(qq) {
						app.groups.create(qq);
					});
					
					app.appState.trigger('surveyready');
					
					// Resume the survey
					if(startsurvey) {
						app.appState.set('gix', 0); //this.currentResp.get('lastgroup'));
						app.appState.set('section', 'survey');
					}
				});

				if ( app.names.store.hasDirtyOrDestroyed() ) {
					app.names.trigger('sync');
				}

			});
		
			// If it has dirty or destroyed data, then it will not trigger a sync event
			// so fire one
			if ( app.survey.questions.store.hasDirtyOrDestroyed() ) {
				app.survey.questions.trigger('sync');
			}
		
			app.appState.set('startsurvey', true);
		},
		
		// Builds the survey logic from the stored or retrieved data
		syncQuestionPrep: function() {
			for(var i = 0; i < app.survey.questions.length; i++) {
				var qq = JSON.parse(app.survey.questions.toJSON()[i].logic);
				app.survey.questions.models[i].set(qq);
				
				// if we loaded this from local storage, it should already be an object
				// so check before we overwrite it
				if ( typeof app.survey.questions.toJSON()[i].response === 'string') {
					var qq = JSON.parse(app.survey.questions.toJSON()[i].response);
					app.survey.questions.models[i].set('response',qq);
				}
			}
			
			app.survey.questions.trigger('dataprepped');
		},
		
		// clear out and repopulate the survey collection
		clearSurvey: function() {
			
			var sid = app.appState.get('sid');
			
			var survey = survey_json;
			var groups = groups_json;
			var questions = questions_json;
			
			// the questions, at present, are just stored in questions_json from survey1.js
			// Add all the questions to the survey
			app.survey = new app.SurveyClass(survey_json);
			
			_.each(questions, function(qq) {
				qq.logic = JSON.stringify(qq);
				qq.rid = app.appState.get('rid');
				app.survey.questions.create(qq);
			});
			
			// Groups 
			app.groups = new app.GroupList();
			
			_.each(groups, function(qq) {
				app.groups.create(qq);
			});
			
			// create a new name list.
			app.names = new app.NameList;
			
			// Add the roster to it if there is a roster
			this.addRosterToNames();
			
			
			
		},
		
		// Add all the rosters to the names collection
		addRosterToNames: function() {
			
			if (!app.survey.attributes.rosters) {
				return;
			}
		
			for (var rn in app.survey.attributes.rosters){
				if (app.survey.attributes.rosters.hasOwnProperty(rn)) {
					var roster = app.survey.toJSON().rosters[rn];
		
					for(var i = 0; i < roster.length; i++) {
						// if a roster name isn't in the name collections add it, and add the
						// default name list
			
						var nm = roster[i];
			
						if(app.names.findWhere({name: nm}) === undefined) {

							// create a name
							var newname = app.names.create({
								name: nm,
								rid: app.appState.toJSON().rid,
								sid: app.appState.toJSON().sid
							});
				
							newname.once('sync',function() {
								this.appendToList(rn);
							});
						} else {
							app.names.findWhere({name: nm}).appendToList(nl);
						}	
					}
				}
			}
			
		},
		
		groupNav: function() {
			var ngix = parseInt(app.appState.get('gix'));
			var groupOrder = app.survey.get('groupOrder');
			
			if ( ngix < groupOrder.length && ngix >= 0) {
				// check the condition of the requested group
				var gmod  = app.groups.where({gid: app.survey.toJSON().groupOrder[ngix]}).pop();
				if(!gmod.checkCondition()) {
					this.nextGroup();
					return;
				}
				
				if (app.appState.get('section') !== 'survey') {
					app.appState.set('section', 'survey');
				} else {
					this.currentGroupView.close();
					this.render();
				}
			} else if ( ngix < 0 ) { // group requested is before the beginning
				app.appState.set('gix', 0);
				if (app.appState.get('section') !== 'survey') {
					app.appState.set('section', 'survey');
				} else {
					this.currentGroupView.close();
					this.render();
				}
			} else {						// group requested is after the end
				app.appState.set('section', 'outtro');
				this.currentResp.save({surveystatus: 'completed'});
			}
		},
		
		nextGroup: function() {
			var groupOrder = app.survey.get('groupOrder');
			var ngix = parseInt(app.appState.get('gix')) + 1;
			
			// if we're not already at the last group...
			if ( ngix < groupOrder.length ) {
				app.appState.set('gix', ngix);
				
				// check the condition of the next group
				var gmod  = app.groups.where({gid: app.survey.toJSON().groupOrder[ngix]}).pop();
				if(!gmod.checkCondition()) {
					this.nextGroup();
					return;
				}
				
				this.currentResp.save({lastgroup: ngix})
				this.currentGroupView.close();
				this.render();
			} else {
				app.appState.set('section', 'outtro');
				this.currentResp.save({surveystatus: 'completed'});
			}
		},

		prevGroup: function() {
			var groupOrder = app.survey.get('groupOrder');
			var ngix = app.appState.get('gix') - 1;
			
			// if we're not already at the last group...
			if ( ngix >= 0 ) {
				app.appState.set('gix', ngix);
				
				// check the condition of the next group
				var gmod  = app.groups.where({gid: app.survey.toJSON().groupOrder[ngix]}).pop();
				if(!gmod.checkCondition()) {
					this.prevGroup();
					return;
				}
				
				this.currentGroupView.close();
				this.render();
			}
		},
		
		addGroup: function(gid) {
			var grp = app.groups.where({gid: gid}).pop();
			this.currentGroupView = new app.GroupView({model: grp,
				attributes: {gid: gid}
				});
			this.currentGroupView.render();
			this.$el.append(this.currentGroupView.$el);
			console.log('group-appended');
			app.appState.trigger('group-appended');
		},
		
		updateSurveyProgressBar: function() {
			var slen = app.groups.length;
			var gix = app.appState.get('gix');
			var prog = Math.ceil((gix / slen) * 100);
			var temp = prog+"% complete <div class = 'progress'><div class = 'progress-bar' style='width: " + prog + "%;'></div>"
			
			$('.surveyProgress-space').html(temp);
			
			
		},
		
		testing: function() {
			console.log('testing');
		}
		
	});
});
