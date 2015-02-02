/*****

Affiliation Drop-Add

Affiliation network data collection using drop-downs and text boxes.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// This will render the select controls for the two name lists
	app.QuestionView.prototype.affDropAddRenderSelects = function() {
		this.selTemplate = _.template($('#control-affiliation-dropadd-select-template').html());
		
		this.affDropAddRenderSelect('mode1');
		this.affDropAddRenderSelect('mode2');		
		
	};
	
	app.QuestionView.prototype.affDropAddRenderSelect = function(mode) {
		var qq = {};
		qq.names = [];
		qq.ids = [];
		qq.mode = mode;
		qq.modename = this.model.toJSON().modenames[mode].singular;
		var nl = this.model.toJSON().nameList[mode];
		
		app.names.namesInList(nl).forEach(function(x) {
			qq.names.push(x.toJSON().name);
			qq.ids.push(x.toJSON().id);
		});
		
		this.$('.'+mode+'-select').html(this.selTemplate(qq));
		
	};
	
	
	
	
	
	// This uses the list box with selectable list items
	app.QuestionView.prototype.affDropAddChange = function(ev) {
		var ul = $(ev.currentTarget).parent();
		var mode = ul.attr('mode');
		var chil = ul.children();
		var nm = $(ev.currentTarget).attr('value');
		
		// Change the active states
		for(var i = 0; i < chil.length; i++ ) {
			$(chil[i]).removeClass('active');
		}
		
		$(ev.currentTarget).addClass('active'); 
		
		// If it's add new, then we want to show the text box
		
		
		if (nm === 'ADDNEW') {
			var chilCT = $(ev.currentTarget).children();
			var elText = $(_.findWhere(chilCT, {localName: 'p'})); 
			var elInput = $(_.findWhere(chilCT, {localName: 'input'}));
			elText.hide();
			elInput.show();
			elInput.focus();
		} else {
			this.$('.aff-dropadd-list[mode="'+mode+'"] > li > input').hide();
			this.$('.aff-dropadd-list[mode="'+mode+'"] > li > p').show();
		}
		
	};
	
	app.QuestionView.prototype.affDropAddClickAdd = function() {
		// load all the data
		var m1 = {li: this.$('.aff-dropadd-list[mode="mode1"] > .active')};
		var m2 = {li: this.$('.aff-dropadd-list[mode="mode2"] > .active')};
		m1.addnew = (m1.li.attr('value') === 'ADDNEW');
		m2.addnew = (m2.li.attr('value') === 'ADDNEW');
		m1.text = this.$('.aff-dropadd-list[mode="mode1"] > .active > input').val();
		m2.text = this.$('.aff-dropadd-list[mode="mode2"] > .active > input').val();
		m1.selected = this.$('.aff-dropadd-list[mode="mode1"] > .active').attr('value');
		m2.selected = this.$('.aff-dropadd-list[mode="mode2"] > .active').attr('value');
		m1.nid = this.$('.aff-dropadd-list[mode="mode1"] > .active').attr('nid');
		m2.nid = this.$('.aff-dropadd-list[mode="mode2"] > .active').attr('nid');
		m1.nl = this.model.toJSON().nameList['mode1'];
		m2.nl = this.model.toJSON().nameList['mode2'];
		
		// quit if not prepared
		if(m1.addnew && m1.text === '') { return; }
		if(m2.addnew && m2.text === '') { return; }
		if(!m1.addnew && (typeof m1.nid === 'undefined')) { return; }
		if(!m2.addnew && (typeof m2.nid === 'undefined')) { return; }

		
		// get the name models (or create)
		if(m1.addnew) {
			m1.name = app.names.create({
				name: m1.text,
				rid: app.appState.toJSON().rid,
				sid: app.appState.toJSON().sid
			});
			
			m1.name.once('sync',function() {
				this.appendToList(m1.nl);
			});
		} else {
			m1.name = app.names.get(m1.nid);
		}
		
		if(m2.addnew) {
			m2.name = app.names.create({
				name: m2.text,
				rid: app.appState.toJSON().rid,
				sid: app.appState.toJSON().sid
			});
			
			m2.name.once('sync',function() {
				this.appendToList(m2.nl);
			});
		} else {
			m2.name = app.names.get(m2.nid);
		}
		
		// Add a tie from mode1 to mode2
		m1.name.addTie(m2.name.id, this.model.toJSON().tieDetails);
		
		this.affDropAddAddPair({mode1: m1.name.id, mode2: m2.name.id});

		// reset the form
		this.affDropAddClickClear();
		
	};
	
	app.QuestionView.prototype.affDropAddClickClear = function() {
		this.$('.mode-name-input').val('');
		this.affDropAddRenderSelects();
	};
	
	app.QuestionView.prototype.affDropAddUpdatePairs = function() {
		this.pairs = [];
		var td = this.model.toJSON().tieDetails;
		var nl = this.model.toJSON().nameList['mode1'];
		var self = this;
		
		app.names.namesInList(nl).forEach(function(x) {
			var ties = x.attributes.details.ties;
			for(var k in ties) {
				if (_.indexOf(_.pluck(ties[k], 'relation'), td.relation) >= 0) {
					self.pairs.push({mode1: x.id, mode2: k});
				}
			}
		});
		
		this.affDropAddAddAllPairs();
		
	};
	
	app.QuestionView.prototype.affDropAddAddAllPairs = function() {
		for(var i = 0; i < this.pairs.length; i++) {
			this.affDropAddAddPair(this.pairs[i]);
		}
				
	};
	
	app.QuestionView.prototype.affDropAddAddPair = function(newpair) {
		//newpair {mode1: nameid, mode2: nameid}
		newpair.tieDetails = this.model.toJSON().tieDetails;
		var nview = new app.AffDropAddPairView({attributes: newpair});
		
		this.$('.afilliation-list-space').append(nview.render().$el);
		
		this.nms.push(nview); // push it here so it's properly closed when the group closes
		
	};
	
	app.QuestionView.prototype.affDropAddCreateEnter = function(ev) {
		if (ev.keyCode !== 13) { return; }
		if (!this.$(ev.currentTarget).val()) { return; }
		
		this.affDropAddClickAdd();
	};
	
	
	// The pairs view
	app.AffDropAddPairView = Backbone.View.extend({
		tagName: "li",
		
		className: "aff-dropadd-pair",
		
		template: _.template($('#control-affiliation-dropadd-pair').html()),
		
		events: {
			"click .mode-name" : "affDropAddEditName",
			"click .remove-pair" : "affDropAddRemovePair",
			"keyup .nameedit" : "nameeditKeyup",
		},
		
		initialize: function() {
			this.model1 = app.names.get(this.attributes.mode1);
			this.model2 = app.names.get(this.attributes.mode2);
			this.model = this.model1; // to make it consistent with this.nms in the Question context
			
			// In case the name changed
			this.model1.on('sync', this.render, this);
			this.model2.on('sync', this.render, this);
			
			// In case the tie was removed
			this.model1.on('tieschanged', this.checkTies, this);
			this.model2.on('tieschanged', this.checkTies, this);
			
			// In case either of the models were destroyed
			this.model1.on('destroy', this.close, this);
			this.model2.on('destroy', this.close, this);
		},
		
		render: function() {			
			// render the row
			var qq = {mode1: {name: this.model1.toJSON().name } ,
						 mode2: {name: this.model2.toJSON().name } };
			this.$el.html(this.template(qq));
			
			this.$('.mode-name').tooltip();
			this.$('.remove-pair').tooltip();
			
			return this;
		},
		
		affDropAddEditName: function(ev) {
			// Reveal the edit button
			var mode = $(ev.currentTarget).attr('mode');
			
			this.$('.nameedit[mode="'+mode+'"]').show();
			$(ev.currentTarget).hide();
			
			this.$('.nameedit[mode="'+mode+'"]').focus();
		},
		
		// Get the correct model
		getmodel: function(mode) {
			if (mode == 'mode1') {
				return this.model1;	
			} else if (mode == 'mode2') {
				return this.model2;
			} else {
				return undefined;
			}
		},
		
		nameeditKeyup: function(ev) {
			var mode = $(ev.currentTarget).attr('mode');
			var val = $(ev.currentTarget).val();
			var mod = this.getmodel(mode);
			var self = this;
			
			if (ev.keyCode == ENTER_KEY) { 
				// Save the edits
				mod.save({name: val});
				// And once it syncs, re-render
				return; 
			} else if (ev.keyCode == ESC_KEY || mod === undefined) {
				// Clear any edits and reset
				if(mod !== undefined) {
					$(ev.currentTarget).val(mod.toJSON().name);
				}
				this.$('.mode-name[mode="'+mode+'"]').show();
				$(ev.currentTarget).hide();
				return;
			} else {
				return;
			}
			
		},
		
		affDropAddRemovePair: function() {
			var td = this.attributes.tieDetails
			this.model1.removeTie(this.model2.id, td);
			this.model2.removeTie(this.model1.id, td);
		},
		
		checkTies: function() {
			var rel = this.attributes.tieDetails.relation;
			if (!this.model1.hasTieWith(this.model2.id, rel) &&
				!this.model2.hasTieWith(this.model1.id, rel)) {
				this.close();
			}
		},
		
		close: function() {
			this.remove();
		},
		
	});
	
	
	
	
	

});
	
