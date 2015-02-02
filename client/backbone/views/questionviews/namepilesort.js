/************ 
name pile sort

A question type where the user takes 'cards' of the different names and piles them
up to indicate connections between their alters.

************/
	
var app = app || {};

$(function () {
	'use strict';	

	/***** Render the pile sort ****/
	app.QuestionView.prototype.setupNamePileSort = function() {
		this.touchHeight = $(window).height();
		this.touchWidth = $(window).width();
		
		this.cardHeight = 40;
		this.cardWidth = 100;
		this.cardStrokeWidth = 1;
		
		this.cardFill = '#FFF';
		this.cardFillHighlight = '#4d4da4';
		
		// it's important that the cardCount (which creates the card id's)
		// is an integer that strictly increases. This is an assumption of the
		// pileCrawl algorithm.
		this.cardCount = 0;
		
		this.cards = [];
		this.cardpiles = [];
		
		app.names.each( function(x) { x.clearTies(); });
		
		this.loadCards();
		this.refreshPiles();
		
	};
	
	/***** Render the pile sort ****/
	app.QuestionView.prototype.renderNamePileSort = function() {
		this.addNamesToScroll();
		
		// remove the group nav bar (need the space!)
		$('.topNavBar').hide();
		$('.touchQuestionPrompt').show();
		
		// bind locally so it can be used in d3 functions
		var hh = this.touchHeight;
		var ww = this.touchWidth;
		var qview = this;
		
		// the drawing space
		this.svg = d3.select(this.el).append('svg:svg')
			.attr('height',this.touchHeight)
			.attr('width',this.touchWidth)
			.attr('class','namepsSVG');
		
		this.cardGrid = d3.layout.grid()
			.bands()
			.size([500,500])
			.padding([0.1, 0.1]);
			
		this.carddrag = d3.behavior.drag()
			.on('drag', function(d,i) { qview.moveCard(d,i,this,qview); } )
			.on('dragend', function(d,i) { qview.psDragEnd(d,i,this,qview); });


		this.updateCards();
	};
	
	/***** Load the name data *****/	
	app.QuestionView.prototype.addNamesToScroll = function() {
		var nameTemplate = _.template($('#namecard-scroll-template').html());
		var qq = {};
		var ids = app.names.pluck('id');
		var names = app.names.pluck('name');
		
		for (var i = 0; i < app.names.length; i++) {
			qq.nmid = ids[i];
			qq.name = names[i];
			this.$('#nameListScroll').append(nameTemplate(qq));
		}
	};
	
	app.QuestionView.prototype.startScroller = function() {
		//this.nameScroller = new iScroll('nameScrollerWrapper');	
	};
	
	app.QuestionView.prototype.updateCards = function() {
		var hh = this.touchHeight;
		var ww = this.touchWidth;
		var qview = this;
		var ch = this.cardHeight;
		var cw = this.cardWidth;
				
		this.nc = this.svg.selectAll('g.nc')
			.data(this.cards, function(d) { return d.id; });
		this.ncEnter = this.nc.enter().append('g')
			.attr('class', 'nc')
			.attr('transform', function(d) { return ('translate('+ d.xpos + ',' + d.ypos + ')'); })
			.on('mouseover', function(d) { qview.highlightPiles(d.id); })
			.on('mouseout', function(d) { qview.resetHighlight(); } )
			.call(this.carddrag);
		
		this.ncEnter.append('rect')
			.attr('class','ncRect')
			.attr('x', function() { return cw / -2; })
			.attr('y', function() { return ch / -2; })
			.attr('height', this.cardHeight)
			.attr('width', this.cardWidth)
			.style('fill', this.cardFill)
			.style('stroke-width', this.cardStrokeWidth)
			.style('stroke', '#777')
			.style('fill-opacity', 0.7);

		this.ncEnter.append('text')
			.attr('class','ncName')
			.attr('text-anchor','middle')
			.text(function(d) { return(d.name); });

		this.nc.exit().remove();
		
		
	};
	
	app.QuestionView.prototype.highlightPiles = function(jid) {
		var a = _.findWhere(this.cards, {id: jid});
		var pid = a.pid;
		var cardFill = this.cardFill;
		var cardFillHighlight = this.cardFillHighlight;
		
		this.svg.selectAll('.ncRect')
			.style('fill', function(d) {
				return d.pid === pid ? cardFillHighlight : cardFill;
			});
	};
	
	app.QuestionView.prototype.resetHighlight = function() {
		this.svg.selectAll('.ncRect')
			.style('fill', this.cardFill);
	};
	
	app.QuestionView.prototype.addNameCard = function(ev) {
		var nmid = $(ev.currentTarget).attr('nmid');
		var cardObject = {};
		
		cardObject.id = this.cardCount++;
		cardObject.nmid = nmid;
		cardObject.name = app.names.get(nmid).get('name');
		cardObject.xpos = ev.pageX;
		cardObject.ypos = ev.pageY + 100;
		cardObject.collisions = [];
		cardObject.pid = -1;
		
		this.cards.push(cardObject);

		this.updateCards();
		this.refreshPiles();
	};
	
	// The context of this function is the card, not the question
	app.QuestionView.prototype.getCardCollisions = function(cardid) {
		var a = _.findWhere(this.cards, {id: cardid});
		var otherCards = _.filter(this.cards, function(x) { return x.id !== cardid; });
		
		var ch = this.cardHeight;
		var cw = this.cardWidth;
		
		var collisions = [];
		
		// Only need to calculate this one, so I won't do it in the loop
		// a-left-side, a-right-side, a-top-side, a-under-side (can't use abs!)
		var als = a.xpos - (cw / 2),
			ars = a.xpos + (cw / 2),
			ats = a.ypos - (ch / 2),
			aus = a.ypos + (ch / 2);
	
		// a is the subject, b is the other card
		otherCards.forEach(function(b) {
			// The xpos and ypos indicate the center of the card
			// so the left edge is half the width from the xpos			
			var bls = b.xpos - (cw / 2),
				brs = b.xpos + (cw / 2),
				bts = b.ypos - (ch / 2),
				bus = b.ypos + (ch / 2);
				
			if ( !(bls > ars || brs < als || bts > aus || bus < ats) ) {
				collisions.push(b.id);
			}
			
		});
		
		a.collisions = collisions;
		
	};
	
	app.QuestionView.prototype.getAllCollisions = function() {
		var qview = this;
		this.cards.forEach(function(a) {
			qview.getCardCollisions(a.id);
		});
	};
	
	app.QuestionView.prototype.refreshPiles = function() {
		this.getAllCollisions();
		this.checkPiles();
	};
	
	app.QuestionView.prototype.savePiles = function() {
		
		/**** save the tie data ****/
		// The tie data is derived from the cards. Everyone in the pile has a tie
		// to everyone else in the pile. It is saved in the details of the name
		// data.
		
		var td = this.model.attributes.tieDetails,
			tiedata = {},
			nmids = [];
		
		for(var i = 0; i < this.piles.length; i++) {
			nmids = this.cardidToNameid(i);
			
			nmids.forEach(function(nmid) {
				var nmmod = app.names.get(nmid);

				for(var j = 0; j < nmids.length; j++) {
					if(nmids[j] !== nmid) {
						nmmod.addTie(nmids[j],td);
					}
				}
				nmmod.save();
			});
		}
		
		/**** save the card data ****/
		// This data is more specific to the actual pile-sort task. And it is somewhat
		// independent of the ties. For instance, it is only possible to ADD ties
		// with the pile sort. 
		
		var resp = this.model.attributes.response;
		resp.cards = this.cards;
		this.model.save({response: resp});
		
	};
	
	app.QuestionView.prototype.removeCard = function(id) {
		var ids = _.pluck(this.cards, 'id');
		var ix = _.indexOf(ids, id);
		this.cards.splice(ix, 1);
		this.refreshPiles();
		this.updateCards();
	};
	
	// Supply the pile index, it will return an array of name ids
	app.QuestionView.prototype.cardidToNameid = function(pix) {
		var pile = 	this.piles[pix];
		var nmids = [];
		
		for (var i = 0; i < pile.length; i++) {
			nmids.push(_.findWhere(this.cards, {id: pile[i]}).nmid);
		}
		
		return nmids;
	};
	
	app.QuestionView.prototype.loadCards = function() {
		if ( typeof this.model.attributes.response.cards === 'undefined' ) {
			return;
		}
		
		this.cards = this.model.attributes.response.cards;
		
		// parse the ints, set the 'cardCount'
		
		for(var i = 0; i < this.cards.length; i++) {
			this.cards[i].id = parseInt(this.cards[i].id);
			this.cards[i].xpos = parseInt(this.cards[i].xpos);
			this.cards[i].ypos = parseInt(this.cards[i].ypos);
			this.cards[i].pid = parseInt(this.cards[i].pid);
			if ( this.cards[i].id > this.cardCount ) {
				this.cardCount = this.cards[i].id;
			}
		}
	
	};
	
	/**********************************************************************
	*	These two functions check the piles using 
	*		Tarjan's Strongly Connected Component algorithm.
	**********************************************************************/
	app.QuestionView.prototype.checkPiles = function() {
		this.piles = [];
		this.pileS = []; 
		this.pindex = {};
		this.plowlink = {};
		this.pindex1 = 0;
		this.npid = 0;
		var qview = this;
		
		this.cards.forEach( function(a) {
			var jid = a.id;
			if(qview.pindex[jid] === undefined) {
				qview.pileCrawl(jid);
			}
		});
	};
	
	app.QuestionView.prototype.pileCrawl = function(jid) {
		this.pindex[jid] = this.pindex1;
		this.plowlink[jid] = this.pindex1;
		this.pindex1++;
		this.pileS.push(jid);
		var tid = null;
		var a = _.findWhere(this.cards, {id: jid}); 
		
		var hits = a.collisions;
		var jids = hits;
		
		for(var i = 0; i < jids.length; i++) {
			if( jids[i] !== jid && this.pindex[jids[i]] === undefined) {
				this.pileCrawl(jids[i]);
				this.plowlink[jid] = Math.min(this.plowlink[jid], this.plowlink[jids[i]]);
			} else if ($.inArray(jids[i], this.pileS) !== -1) {
				this.plowlink[jid] = Math.min(this.plowlink[jid], this.pindex[jids[i]]);
			}
		}
		
		if (this.plowlink[jid] === this.pindex[jid]) {
			this.piles.push([]);
			do {
				tid = this.pileS.pop();
				_.findWhere(this.cards, {id: tid}).pid = this.npid;
				this.cardpiles[tid] = this.npid;
				this.piles[this.npid].push(tid);
				
			} while(tid !== jid);
			this.npid++;
		}
		
	};
	
	app.QuestionView.prototype.psDragEnd = function(d, i, card, qview) {	
		qview.refreshPiles(); 
		
		if ( d.xpos > (qview.touchWidth - 70) && d.ypos > (qview.touchHeight - 70)) {
			qview.removeCard(d.id);
			d3.select('.cardTrash').transition().duration(200)
				.style('font-size','50px'); 
		}
	};
					
	
	app.QuestionView.prototype.moveCard = function(d, i, card, qview) {	
		d.xpos += d3.event.dx;
		d.ypos += d3.event.dy;
		var pcollisions = d.collisions;
		d3.select(card).attr('transform', function(d) {
			return('translate(' + d.xpos + ',' + d.ypos + ')'); 
		});
		
		// Check if the collisions changed, if so, refresh the piles
		// This should give the effect of highlighting piles as the user
		// moves a card around.
		qview.getCardCollisions(d.id)
		if ( !_.isEqual(d.collisions, pcollisions) ) {
			qview.refreshPiles();
			qview.highlightPiles(d.id);
		}
		
		// Check if the card is over the trash
		if ( d.xpos > (qview.touchWidth - 70) && d.ypos > (qview.touchHeight - 70)) {
			d3.select('.cardTrash').transition().duration(200)
				.style('font-size','65px');
		} else {
			d3.select('.cardTrash').transition().duration(200)
				.style('font-size','50px');
		}
		
	};
		
});
