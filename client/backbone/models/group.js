/*****

The group model.


*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.GroupClass = Backbone.Model.extend({
		defaults: function() {
			id: guid()
		},
		
		initialize: function() {
		},
		
		sync: function() {
			// do nothing, the groups don't sync
		},

		checkCondition: function() {
			// if there are no conditions, return true
			// otherwise check the condition
			if (this.attributes.conditions !== undefined) {
				var conds = this.attributes.conditions.values;
				var comp = this.attributes.conditions.comparator;
				var results = [];
				
				// test each condition
				for(var i = 0; i < conds.length; i++) {
					var mod = app.survey.questions.where({qid: conds[i].qid}).pop();
					var val = mod.attributes.response.value;
					switch (conds[i].comparator) {
						case '===':
							results.push(val === conds[i].value);
							break;
						case '!==':
							results.push(val !== conds[i].value);
							break;
						case '>':
							results.push(val > conds[i].value);
							break;
						case '<':
							results.push(val < conds[i].value);
							break;
						default:
							console.log('Missing / bad comparator!');
							results.push(null);
							break;
					}
				}
				
				// if there is more than one condition, test them with the group comparator
				// otherwise just return the first item in results
				if(conds.length > 1) {
					switch(comp) {
						case '&&':
							return _.filter(results, function(q) { return q; }).length == results.length;
							break;
						case '||':
							return _.contains(results, true);
							break;
						default:
							console.log('Missing / bad group comparator!');
							return true; // default to showing the question
					}
				} else {
					return results[0];
				}
				
			} else {
				return true;
			}
		},
	});
	
});
