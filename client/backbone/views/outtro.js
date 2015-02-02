/*****

The main menu view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.OuttroView = Backbone.View.extend({
		tagName: "div",
		
		className: "outtro",
		
		template: _.template($('#outtro-template').html()),
		
		initialize: function() {
			this.listenTo(app.appState, 'change:section', this.close);
			this.finalNL = app.survey.toJSON().finalNameList || '';
			this.nms = this.nms || [];
		},
		
		events: {
			"click .returnHome" : "returnHome",
		},
	
		render: function() {
			this.$el.html(this.template(this.attributes));
			
			if (this.finalNL) {
				this.addAllNames()
			}
		},
		
		close: function() {			
			_.each(this.nms, function(qq) {
				qq.close();
			});
			this.remove();
		},
		
		addAllNames: function() {
			var nms = app.names.namesInList(this.finalNL);
			
			for(var i = 0; i < nms.length; i++) {
				this.addNameToList(nms[i]);
			}
		},
		
		addNameToList: function(qq) {
			var nview = new app.NameBasic({model: qq, 
					attributes: {namelist: this.nl} });
			nview.render();
			this.$(".finalNameList").append(nview.$el);
					
			this.nms.push(nview);
		},
		
		returnHome: function() {
			
			app.appState.set('section', 'intro');
		},


	});
	
});
