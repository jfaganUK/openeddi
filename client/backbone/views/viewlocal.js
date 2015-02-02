/*****

The local storage view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.LocalView = Backbone.View.extend({
		tagName: "div",
		
		className: "viewlocal-modal",
		
		template: _.template($('#viewlocal-modal-template').html()),
		
		events: {
			'click .close-viewLocal-modal' : 'closeClick',
		},
		
		initialize: function() {
		},
	
		render: function() {
			var qq = this.model.toJSON();
			
			var lNames = this.model.getLocalNames();
			var lResponses = this.model.getLocalResponse();
			var local = this.model.getLocal();
		
			this.$el.html(this.template);
		},
		
		// Close clicking
		closeClick: function() {
			$("#viewLocal-modal").modal('hide');
		},
		
		// Close function
		close: function() {
			this.remove();
		},
		
	});
	
});
