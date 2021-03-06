/*****

The name model.

*****/

var app = app || {};

$(function () {
	'use strict';
	
	app.aName = Backbone.Model.extend({	
		defaults: function() {
			var newid = guid();
			return {
				id: newid,
				name: "",
				lists: [],
				details: {ties: {}}
			};
		},
		
		initialize: function() {
			this.on('sync', this.onSync);
		},
		
		onSync: function(ev) {
			app.appState.trigger('nameSync');
			app.appState.set('lastsynced',ev.id);
		},
		
		addToDetails: function(key, val) {
			// when retrieving an empty details object from the server
			// it is coerced to an array, this fixes that
			if (this.attributes.details instanceof Array) {
				if(!this.attributes.details.length) {
					this.attributes.details = {};
				}
			}
			
			this.attributes.details[key] = val;
			this.trigger('detailschanged');
		},
		
		appendToList: function(x) {
			var ix = _.indexOf(this.attributes.lists, x);
			if(ix === -1) {
				this.attributes.lists.push(x);
			}
			
			this.trigger('listchanged');
			this.save();
		},
		
		removeFromList: function(x) {
			var ix = _.indexOf(this.attributes.lists, x);
			
			if( ix > -1 ) {
				this.attributes.lists.splice(ix,1);
				
				// if the lists are totally empty, destroy the model
				if (this.attributes.lists.length === 0) {
					this.destroy();
					return;
				}
				
				// if the list is not empty, just trigger the change event
				this.trigger('listchanged');
				this.save();
			}
		},
		
		// is a namelist in the list of lists
		inList: function(x) {
			var ix = _.indexOf(this.attributes.lists, x);
			
			return (ix > -1);
		},
		
		removename: function() {
			this.destroy();
		},
		
		addTie: function(nameid, tiedetails, savethis) {
			if ( typeof this.attributes.details.ties === 'undefined' ) {
				this.attributes.details.ties = {};
			}
			
			var savethis = typeof savethis === 'undefined' ? true : savethis;
			
			/***********************************
			* Ties are stored as a node-list. Each name should have a list of 
			* names it is connected to. Each entry in the list contains the details
			* of each type of relationship.
			*
			* The ties object has objects in it like this: 
			*  ties = 
			*	{"a": [
			*		{relation: "communicate", type: "undirected", weight: 3},
			*		{relation: "giveadvice", type: "directed", weight: 1}],
			*	"b": [
			*		{relation: "communicate", type: "undirected", weight: 3}]
			*	}
			*/
			
			var ties = this.attributes.details.ties;
			
			if ( !_.has(ties, nameid) )	{
				ties[nameid] = [];
				ties[nameid].push(tiedetails);
			} else {
				var ix = _.indexOf(_.pluck(ties[nameid], 'relation'), tiedetails.relation)
				ties[nameid][ix] = tiedetails;
			}
			
			if (savethis) { this.save(); }
			
			this.trigger('tieschanged');
		},
		
		// Does this have a tie with nameid of a certain relationship?
		hasTieWith: function(nameid, relation) {
			var otherName = app.names.get(nameid);
			if (otherName === undefined) { return; }
					// TODO: throw an error in this case
			
			var ties = this.attributes.details.ties
			
			for(var k in ties) {
				if (k == otherName.id) {
					if (typeof relation === 'undefined') {
						return true;
					} else {
						for (var i = 0; i < ties[k].length; i++) {
							if (ties[k][i].relation === relation) {
								return true;
							}
						}
					}
					
				}
			}
			
			return false;			
		},
		
		removeTie: function(nameid, tiedetails) {
			if ( typeof this.attributes.details.ties === 'undefined' ) {
				this.attributes.details.ties = {};
			}
			
			var ties = this.attributes.details.ties;
			
			if ( !_.has(ties, nameid) )	{
				return;
			} else {
				var ix = _.indexOf(_.pluck(ties[nameid], 'relation'), tiedetails.relation)
				ties[nameid].splice(ix, 1);
			}
			
			this.trigger('tieschanged');
		},
		
		// Remove all ties of a certain relation
		clearTies: function(tiedetails) {
			if( typeof this.attributes.details.ties === 'undefined' ) {
				return;
			}
			
			this.attributes.details.ties = {};
			
			this.trigger('tieschanged');
		},
		
		// check the condition of the name
		checkCondition: function(conds) {
			// if there are no conditions, return true
			// otherwise check the condition
			if (false) {
				var conds = conds.details;
				var comp = conds.comparator;
				var results = [];
				
				if(typeof conds === 'object') {
					var b = []; b.push(conds); conds = b;
				}
				
				// test each condition
				for(var i = 0; i < conds.length; i++) {
					var dat = this.attributes.details[conds[i].detail];
					var val = dat.value;
					if( typeof val === 'string') {
						if ( val.match(/[a-zA-Z]/) === null ) {
							val = parseInt(val);
						}
					}
					if( typeof val === 'undefined') {
						results.push(false);
						continue;
					}
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
