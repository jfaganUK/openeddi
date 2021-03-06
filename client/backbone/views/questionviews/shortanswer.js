/*****

Short Answer

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.QuestionView.prototype.getShortAnswer = function(ev) {
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
	
