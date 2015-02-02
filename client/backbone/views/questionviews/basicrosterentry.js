/*****

Basic Roster Entry
An entry in the roster with controls.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.BasicRosterEntryView = Backbone.View.extend({
		tagName: "div",
		
		className: "basicRosterEntry accordion-group",
		
		template: _.template($('#basicroster-entry-accordion-template').html()),
		
		events: {
			"click .basicRosterEntryButton" 	: "rosterClick",
			"click .tdRosterPrompt"				: "tdRosterPromptClick",
		},
		
		initialize: function() {
		
		},
		
		render: function() {
			var qq = this.model.toJSON();
			var self = this;
			qq.namelistPrompts = this.attributes.namelistPrompts;
			qq.rosterid = this.attributes.rosterid;
			
			// check and see if the name is any of these lists
			for(var i=0; i < qq.namelistPrompts.length; i++) {
				qq.namelistPrompts[i].inlist = this.model.inList(qq.namelistPrompts[i].nameList);
			}
			
			this.$el.html(this.template(qq));
			
			//this.listenTo(app.appState, 'group-appended', this.updateSentence);
			this.updateSentence();
			
			this.listenTo(app.appState, 'group-appended', function() { self.$el.collapse(); } );
		},
		
		tdRosterPromptClick: function(ev) {
			var nl = $(ev.currentTarget).attr('value');
			this.$('.btn[value="'+nl+'"]').trigger('click');
		},
		
		rosterClick: function(ev) {
			var nl = $(ev.currentTarget).val();
			var rem = $(ev.currentTarget).hasClass('active'); // this gets the state *before* the user clicked it.
			var guttman = +$(ev.currentTarget).attr('guttman');
			var self = this;
			
			// The update to the DOM is slow. so if it has the active class, that means the click will be toggling it off.
			if(rem) {
				this.model.removeFromList(nl);
			} else {
				this.model.appendToList(nl);
			}
			
			// Check guttman scaling
			// If they click 2 then you need to also add anything less than 2
			if(!rem) {
				var nladd = _.filter(this.attributes.namelistPrompts, function(x) { return x.guttman < guttman; });
				for(var i = 0; i < nladd.length; i++) {
					// toggle the lower button
					this.$('.basicRosterEntryButton[value="'+nladd[i].nameList+'"]').addClass('active');
					// add the namelist to the model
					this.model.appendToList(nladd[i].nameList);
				}
			}
			
			this.updateSentence();

		},
		
		updateSentence: function() {
			var np = this.attributes.namelistPrompts;
			var $s = this.$(".rosterSentence");
			var sv = [];
			var qq = {};
			
			for(var i=0; i < np.length; i++) {
				if(this.model.inList(np[i].nameList)) {
					sv.push(np[i].verb);
				}
			}
					
			if(sv.length) {
				var sentenceTemplate = _.template(this.attributes.kSentence);
				if(sv.length === 1) {
					var verbs = sv[0];
				} else if (sv.length === 2) {
					var verbs = sv[0] + " and " + sv[1];
				} else if (sv.length > 2) {
					var verbs = '';
					for(var i = 0; i < (sv.length-1); i++) {
						verbs = verbs + sv[i] + ", ";
					}
					verbs = verbs + "and " + sv[sv.length-1];
				}
			} else {
				var verbs = '';
				var sentenceTemplate = _.template(this.attributes.nSentence);
			}
			
			if(sv.length === 0) {
			}
			
			$s.text(sentenceTemplate({verbs: verbs, name: this.model.toJSON().name}));
			
		},
		
		close: function() {
			this.remove();
		},
		
	});

});
