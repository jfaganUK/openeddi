/*****

Basic Roster

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.QuestionView.prototype.renderBasicRoster = function() {
		// If the entries are pushed on to this.nms they will be closed out
		app.names.each(this.addBasicRosterEntry,this);
		
		// initialize the tooltips
		this.$('.basicRosterEntryButton').tooltip({container: 'body'})
	};
	
	app.QuestionView.prototype.addBasicRosterEntry = function(qq) {
		if (qq.inList(this.defaultNL)) {
			var rview = new app.BasicRosterEntryView({model: qq, 
					attributes: {namelistPrompts: this.model.toJSON().namelistPrompts,
						nSentence: this.model.toJSON().nSentence,
						kSentence: this.model.toJSON().kSentence,
						rosterid: this.id, } });
			rview.render();
			this.$('.basicRosterSpace').append(rview.$el);
			this.nms.push(rview);
		}
	};
	
	// Will add names to the name collection if they aren't already there
	app.QuestionView.prototype.prepareBasicRoster = function() {
		this.rostername = this.model.toJSON().useRoster;
		this.roster = app.survey.toJSON().rosters[this.rostername];
		this.renderingBasicRouter = false; // due to rounding, it might trigger more than once, we want it only once, hence this toggle
		var nl = this.defaultNL = this.model.toJSON().nameList;
		this.rosterPrepCount = 0;
		var self = this;
		
		for(var i = 0; i < this.roster.length; i++) {
			// if a roster name isn't in the name collections add it, and add the
			// default name list
			
			var nm = this.roster[i];
			
			if(app.names.findWhere({name: nm}) === undefined) {

				// create a name
				var newname = app.names.create({
					name: nm,
					rid: app.appState.toJSON().rid,
					sid: app.appState.toJSON().sid
				});
			
				newname.once('sync',function() {
					self.rosterPrepCount++;
					self.updateBasicRosterProgress();
					this.appendToList(nl);
				});
			} else {
				this.rosterPrepCount++;
				this.updateBasicRosterProgress();
				app.names.findWhere({name: nm}).appendToList(nl);
			}
				
		}
		
	};
	
	app.QuestionView.prototype.updateBasicRosterProgress = function() {
		var l1 = this.roster.length;
		var p = Math.ceil((this.rosterPrepCount / l1) * 100);
		var t = 500;
		var self = this;
	
		if( p < 100) {	
			this.$('.basicRosterProgress .bar').css('width', p + '%');
		} 
		if (p >= 100 && !this.renderingBasicRoster) {
			this.stopListening(app.names, 'sync', this.updateBasicRosterProgress);
			this.$('.basicRosterProgress').fadeOut(t);
			this.renderingBasicRoster = true;
			setTimeout(function() { self.renderBasicRoster(); }, t);
			setTimeout(function() { self.$('.basicRosterProgress').remove(); }, t);
		}
		
	};
	
	
	

});
	
