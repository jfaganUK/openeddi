/*****

Geo location

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.QuestionView.prototype.setGeoLocation = function(geoCoords) {
		this.geoCoords = geoCoords.coords;
		
		if (typeof this.geoCoords.status === 'undefined') {
			this.$('.geoStatus').text('Got coordinates (' + this.geoCoords.latitude + ', ' + this.geoCoords.longitude + ')');
		} else {
			this.$('.geoStatus').text(geoCoords.status);
		}
		
		this.saveGeoLocation();
	};
	
	app.QuestionView.prototype.getGeoLocation = function() {
		var qview = this;
		try {
			if( navigator.geolocation) {
				this
				navigator.geolocation.getCurrentPosition(function(x) {
					qview.setGeoLocation(x);
				});
			} else {
				this.setGeoLocation( {status: 'Browser does not supper'} );
			}
			this.$('.geoStatus').text('Getting location...');
		} catch (err) {f 
			this.geoError = this.handleGeoLocationError(err);
			this.setGeoLocation( {status: this.geoError} );
		}
		return false;
	};
	
	app.QuestionView.prototype.handleGeoLocationError = function(err) {
		switch(error.code) {
			case error.PERMISSION_DENIED:
				return "User denied the request for Geolocation.";
				break;
			case error.POSITION_UNAVAILABLE:
				return "Location information is unavailable.";
				break;
			case error.TIMEOUT:
				return "The request to get user location timed out.";
				break;
			case error.UNKNOWN_ERROR:
				return "An unknown error occurred.";
				break;
		}
	};
	
	app.QuestionView.prototype.getGeoLocationDesc = function(ev) {
		this.geoLocationDesc = $(ev.currentTarget).val();
		this.saveGeoLocation();
	};
	
	app.QuestionView.prototype.saveGeoLocation = function() {
		var coords = typeof this.geoCoords === 'undefined' ? {} : this.geoCoords;
		var desc = typeof this.geoLocationDesc === 'undefined' ? '' : this.geoLocationDesc;
		var response = this.model.attributes.response;
		
		response.desc = desc;
		response.coords = coords;
		
		this.model.save({response: response});
		
	};
});
	
