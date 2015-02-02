/*****

Affiliation Drop-Add

Affiliation network data collection using drop-downs and text boxes.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// This will render the select controls for the two name lists
	app.QuestionView.prototype.getLongText = function(ev) {
		var txt = $(ev.currentTarget).val();
		var resp = this.model.attributes.response;
		
		if(this.arrayQ) {
			var aindex = $(ev.currentTarget).attr('aindex');
			resp.value[aindex] = txt;
			this.model.save({response: resp});
		} else {
			resp.value = txt;
			this.model.save({response: resp});
		}
	};
	
});
	
