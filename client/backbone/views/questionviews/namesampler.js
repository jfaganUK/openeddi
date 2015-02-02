/*****

Name Sampler. Randomly pick n names from the entire list of names.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// This will render the select controls for the two name lists
	app.QuestionView.prototype.nameSampler = function() {
		var nl = this.nl;
		var N = app.names.length;
		var ns = this.model.toJSON().samplesize;
		ns = N < ns ? N : ns; // In case there are fewer names than the sample size
		
		var inlist = _.pluck(app.names.namesInList(nl),'id');
		var ids = _.difference(app.names.pluck('id'), inlist);
		var nids = inlist.length;
		
		while(nids < ns) {
			var ix = Math.floor(Math.random() * ids.length);
			app.names.get(ids[ix]).appendToList(nl);
			
			inlist = _.pluck(app.names.namesInList(nl),'id');
			ids = _.difference(app.names.pluck('id'), inlist);
			nids = inlist.length;
		}
		
	};
	
	
	

});
	
