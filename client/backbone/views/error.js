/*****

Error view

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// note that it is frequently created with an attribute called namelist
	
	app.ErrorView = Backbone.View.extend({		
		className: "alert alert-error",
		
		template: _.template('<div class = "alert alert-error"><button class = "btn pull-right btn-danger errorOkay">Okay. Next page then.</button>' +
						'<p><strong>Uh oh.</strong> There was an error:</p><p><%= rc.errtext %></p></div>'),
		
		events: {
			"click .errorOkay" : "errorOkay",
		},
		
		initialize: function() {
			this.listenTo(app.appState, 'group-appended', this.close); // when the page changes, remove the error view
		},
		
		render: function() {
			this.$el.html(this.template({errtext: this.model.toJSON().error}));
			return this;
		},
		
		errorOkay: function() {
			app.appState.trigger('nextgroup');
			this.close();
		},

		close: function() {
			this.remove();
		},
		
	});

});
