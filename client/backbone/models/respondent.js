/*****

The respondent model.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.aRespondent = Backbone.Model.extend({
		defaults: function() {
			return {
				id: guid(),
				datecreated: this.datestamp()
			};
		},
		
		sync: function(method, model, options) { 
		  options.beforeSend = function(xhr, settings) {
			 settings.xhr = function() {          
				var xhr = $.ajaxSettings.xhr();
				xhr.upload.addEventListener("progress", function (event) {
				  Math.ceil(event.loaded/event.total*100);
				  console.log('*&*&*& progress! &*&*&* ' + Math.ceil(event.loaded/event.total*100))
				}, false);
				return xhr;
			 }
		  }
		  return Backbone.sync(method, model, options);
		},
		
		datestamp: function() {
			var d = new Date();
			var iso = d.toISOString();
			
			// clean it for mysql data entry
			iso = iso.replace(/(\.(\d+)Z)/,'');
			var mysql = iso.replace(/T/,' ');
			
			return mysql;
		},
		
		convertDate: function() {
			// convert from the mysql timestamp format
			var t = this.attributes.datecreated.split(/[- :]/);
			var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
			
			// dates are stored as UTC so, I need to convert it to the local time			
			var d1 = new Date(d.getTime() - d.getTimezoneOffset() * 60000)

			return d1;
		},
		
		getLocalNames: function() {
			var url = URL_ROOT + '/namelist/names/rid/' + this.id + '/';
			var store = new Store(url);
			
			return {ids: store.getIds(), dirty: store.getDirty(), destroyed: store.getDestroyed()};
		},
		
		getLocalResponse: function() {
			var url = URL_ROOT + '/responses/response/rid/' + this.id + '/';
			var store = new Store(url);
			
			return {ids: store.getIds(), dirty: store.getDirty(), destroyed: store.getDestroyed()};
		},
		
		getLocal: function() {
			var url = URL_ROOT + '/respondents/respondent/';
			var store = new Store(url);
			
			var islocal = _.contains(store.getIds(), this.id);
			var isdirty = _.contains(store.getDirty(), this.id);
			var isdestroyed = _.contains(store.getDestroyed(), this.id);
			
			return {local: islocal, dirty: isdirty, destroyed: isdestroyed};
		},
		
		syncAll: function() {
			var self = this;
			
			// If you can't reach the host, do not proceed
			// TODO: give some feedback, if they can't reach the host, TELL THEM
			if ( !app.hostReachable() ) {
				return false;
			}
			
			// This should only really be called if there's dirty or destroyed 
			// data, but if there isn't it will just load data fromt he server
			// then sync it back up immediately. A waste, but no harm.

			app.appState.set('rid', this.id);
			app.appState.set('startsurvey', false);
			app.appState.trigger('loadsurvey');
			
			app.appState.once('syncready', function() {
				$.when(app.survey.questions.syncDirtyAndDestroyed())
					.then(app.names.syncDirtyAndDestroyed())
					.then(app.survey.questions.store.totalClear()) 
					.then(app.names.store.totalClear())
					.then(app.respondents.syncDirtyAndDestroyed())
					.then(app.respondents.fetch());
			});

		},
		
	});

});
