/*****

Slider

Using the slider to collect data.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// This saves the slider data
	app.QuestionView.prototype.sliderSave = function(ev) {

	};

	app.QuestionView.prototype.sliderInit = function() {
		if(this.model.toJSON().sliderOptions) {			;
			this.$('.controlSlider').slider(this.model.toJSON().sliderOptions);
		} else {
			this.$('.controlSlider').slider({});
		}

	};
	
});
	
