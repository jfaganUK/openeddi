/*****

The names collection

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.NameList = Backbone.Collection.extend({
		// the items in this collection
		model: app.aName,
		// the url of the api
		url: function() {
			return URL_ROOT + '/namelist/names/rid/' + app.appState.get('rid') + '/';
		},
		
		initialize: function() {
			this.createStore();
		},
		
		// Will return an array of models that are in a particular named list
		namesInList: function(nl) {
			var oarray = [];
			for(var i = 0; i < this.length; i++) {
				if(_.indexOf(this.models[i].attributes.lists, nl) != -1) {
					oarray.push(this.models[i]);
				}
			}
			return(oarray);
		},
		
		// Sort by the name
		comparator: function(name) {
			return name.get('name');
		},
		
		//returns the number of names in a specified list
		countOfList: function(ll) {
			var ml = this.models;
			var cn = 0;
			_.each(ml,function(qq) {
				if(_.indexOf(qq.toJSON().lists, ll) != -1) {
					cn++;
				}
			});
			return cn;
		}
	});
	
});
