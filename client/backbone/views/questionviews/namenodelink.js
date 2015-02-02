/************ 

Name Node Link

Use a node-link diagram to add and remove links between nodes.

************/
	
var app = app || {};

$(function () {
	'use strict';	

	/***** Setup the  ****/
	app.QuestionView.prototype.setupNodeLink = function() {
		this.touchHeight = $(window).height();
		this.touchWidth = $(window).width();
	
		// Force details
		this.cRadius = 20;
		this.fcharge = -600;
		this.fgravity = 0.1;
		this.ffriction = 0.9;
		this.collPadding = 5;
		this.collAlpha = 0.59;
		this.linkdistance = 100;
		
		var qview = this;
		

		// colors
		this.cols = d3.scale.category10();
		this.animSpeed = 100;
		
		// set the current tool to 'move'
		this.tool = 'move';
		this.selectedNodes = [];
		
		this.operations = [];
		
		// Turn on collision detection?
		this.collisionDetect = false;
		this.collPadding = 5;
		
		// Show the force controls?
		this.showForceControls = false;
		
		this.force = d3.layout.force()
			.charge(this.fcharge)
			.friction(this.ffriction)
			.gravity(this.fgravity)
			.linkDistance(this.linkdistance)
			.size([this.touchWidth,this.touchHeight]);
			
		/*this.force.drag = d3.behavior.drag()
			.on('dragstart', function(d,i) { qview.nlDragStart(d,i,this,qview); })
			.on('drag', function(d,i) { qview.nlDrag(d,i,this,qview); })
			.on('dragend',  function(d,i) { qview.nlDragEnd(d,i,this,qview); });
		*/
		
		// Load the nodes and links
		this.loadNodeLinkNodes();
		this.loadNodeLinkLinks();
		this.loadOperations();
	};
	
	/***************************************************
	*
	*	Dragging
	*
	***************************************************/
	
	app.QuestionView.prototype.nlDragStart = function(d,i,nd,qview) {
		d3.event.sourceEvent.stopPropagation(); // silence other listeners
		qview.force.stop();
		
		if (qview.tool === 'move') return;
		
	};
	
	app.QuestionView.prototype.nlDrag = function(d,i,nd,qview) {
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		d.px = d.x;
		d.py = d.y;
		
		d3.select(nd).attr('transform', function(d) {
			return('translate(' + d.x + ',' + d.y + ')'); 
		});
		
	};
	
	app.QuestionView.prototype.nlDragEnd = function(d,i,nd,qview) {
		qview.force.start();
		
		
	};
	
	
	/***************************************************
	*
	*	Network Editing
	*
	***************************************************/
	
	/***** handle the switching of tools *****/
	app.QuestionView.prototype.toolClick = function(ev) {
		var ptool = this.tool;
		var tool = $(ev.currentTarget).attr('value');
		
		switch (tool) {
			case 'toolRemove':
				this.tool = 'remove';
				break;
			case 'toolAddLink':
				this.tool = 'addlink';
				break;
			default:
				this.tool = 'move';
				break;
		}
		
		if( tool !== ptool) {
			var nd1 = this.nlGetD3NodeById(this.selectedNodes[0]);
			this.nlResetColor(nd1);
			this.selectedNodes = [];
		}
		
	};
	
	/***** catches link adding and removing behavior *****/
	
	app.QuestionView.prototype.nlNodeClick = function(d, i, nd, qview) {
		// We don't do 
		console.log('Node click ' + d.name + ' - ' + d.id);
		if (this.tool === 'move') { return; }
		
		if (this.tool === 'addlink') {
			if ( _.contains(this.selectedNodes, d.id) ) {
				// It's already selected, so unselect it
				this.selectedNodes = [];
				this.nlResetColor(nd);
			} else if ( !this.selectedNodes.length ) {
				// we found our first node, add it to the list, visually select it
				this.selectedNodes.push(d.id);
				this.nlSelectColor(nd);
			} else if (this.selectedNodes.length === 1) {
				// two different nodes select. Time to add a link.
				
				this.selectedNodes.push(d.id);
				
				this.nlAddTie();

				this.updateNodeLink();
				this.nlAddOperation('add',this.selectedNodes[0],this.selectedNodes[1]);	
				var nd1 = this.nlGetD3NodeById(this.selectedNodes[0]);
				this.selectedNodes = [];
				this.nlResetColor(nd1);
			}
			
		}
		
		if (this.tool === 'remove' ) {
			if ( _.contains(this.selectedNodes, d.id) ) {
				// It's already selected, so unselect it
				this.selectedNodes = [];
				this.nlResetColor(nd);
			} else if ( !this.selectedNodes.length ) {
				// we found our first node, add it to the list, visually select it
				this.selectedNodes.push(d.id);
				this.nlSelectColor(nd);
			} else if (this.selectedNodes.length === 1) {
				// two different nodes select. Time to add a link.
				
				this.selectedNodes.push(d.id);
				
				this.nlRemoveTie();
				
				this.updateNodeLink();
				this.nlAddOperation('remove',this.selectedNodes[0],this.selectedNodes[1]);
				var nd1 = this.nlGetD3NodeById(this.selectedNodes[0]);
				this.selectedNodes = [];
				this.nlResetColor(nd1);
			}
		}
		
	};
	
	app.QuestionView.prototype.nlResetColor = function(nd) {
		var qview = this;
		d3.select(nd).select('.circ').transition().duration(this.animSpeed)
			.style('fill', function(d) { return qview.cols(+d.details.relatetype); });
		d3.select(nd).select('.circ').transition().duration(this.animSpeed).ease('linear')
			.attr('r', this.cRadius);
	};
	
	app.QuestionView.prototype.nlSelectColor = function(nd) {
		var qview = this;
		d3.select(nd).select('.circ').transition().duration(this.animSpeed)
			.style('fill', function(d) { return d3.rgb(qview.cols(+d.details.relatetype)).brighter(2); });
		d3.select(nd).select('.circ').transition().duration(this.animSpeed).ease('linear')
			.attr('r', function() { return qview.cRadius * 1.3; });
	};
	
	app.QuestionView.prototype.nlGetD3NodeById = function(id) {
		for( var i = 0; i < this.ns[0].length; i++) {
			if( this.ns[0][i].__data__.id === id) {
				return(this.ns[0][i]);
			}
		}
	};
	
	app.QuestionView.prototype.nlAddTie = function() {
		var id1 = this.selectedNodes[0];
		var id2 = this.selectedNodes[1];
		var nm1 = app.names.get(id1);
		var nm2 = app.names.get(id2);
		
		if( this.nlTieIndex(id1, id2) !== -1 ) { return; };
		
		this.links.push({source: nm1.attributes, target: nm2.attributes});

		var td = this.model.attributes.tieDetails;
		nm1.addTie(nm2.id,td);
		nm2.addTie(nm1.id,td);
		
	};
	
	app.QuestionView.prototype.nlRemoveTie = function() {
		var id1 = this.selectedNodes[0];
		var id2 = this.selectedNodes[1];
		var nm1 = app.names.get(id1);
		var nm2 = app.names.get(id2);
		
		var ix = this.nlTieIndex(id1, id2);
		if( ix === -1 ) { return; };
		
		var ids = ['',''];
		for( var i = 0; i < this.links.length; i++) {
			ids[0] = this.links[i].source.id;
			ids[1] = this.links[i].target.id;
			if( _.contains(ids, id1) && _.contains(ids, id2)) {
				ix = i;
				break;
			}
		}

		this.links.splice(ix, 1);

		var td = this.model.attributes.tieDetails;
		nm1.removeTie(nm2.id,td);
		nm2.removeTie(nm1.id,td);
		
		// there may be a duplicate tie, run it again
		this.nlRemoveTie();
		
	};
	
	app.QuestionView.prototype.nlTieIndex = function(id1, id2) {
		var ids = ['',''];
		for( var i = 0; i < this.links.length; i++) {
			ids[0] = this.links[i].source.id;
			ids[1] = this.links[i].target.id;
			if( _.contains(ids, id1) && _.contains(ids, id2)) {
				return i;
			}
		}
		return -1;
	};
	
	app.QuestionView.prototype.nlAddOperation = function(op,id1,id2) {
		this.operations.push({op: op, id1: id1, id2: id2});
		var resp = this.model.attributes.response;
		resp.operations = this.operations;
		this.model.save({response: resp});
	};
	
	app.QuestionView.prototype.nlApplyOperations = function() {
		for(var i = 0; i < this.operations.length; i++) {
			this.selectedNodes = [];
			this.selectedNodes.push(this.operations[i].id1);
			this.selectedNodes.push(this.operations[i].id2);

			if (this.operations[i].op === 'add') {	this.nlAddTie(); }
			if (this.operations[i].op === 'remove') {	this.nlRemoveTie(); }
		}
	};
	
	/***************************************************
	*
	*	Rendering
	*
	***************************************************/
	
	/*** Basic Rendering tasks for the question ***/
	app.QuestionView.prototype.renderNodeLink = function() {
		
		if(!this.showForceControls) {
			this.$('.forceControls').hide();
		}
		
		// bind locally so it can be used in d3 functions
		var hh = this.touchHeight;
		var ww = this.touchWidth;
		var qview = this;
		
		// the drawing space
		this.svg = d3.select(this.el).append('svg:svg')
			.attr('height',hh)
			.attr('width',ww)
			.attr('class','nodelinkSVG');
		
		// select the move button
		$($('#nlToolBox .btn')[0]).addClass('active');
		
		this.updateNodeLink();		
	};
	
	/**** Draw or update the nodes and links ****/
	
	app.QuestionView.prototype.updateNodeLink = function() {
		var hh = this.touchHeight;
		var ww = this.touchWidth;
		var qview = this;
		var cr = this.cRadius;
				
		/*	Nodes */
		this.ns = this.svg.selectAll('g.ns')
			.data(this.nd, function(d) { return d.id; });
		this.nsEnter = this.ns.enter().insert('g')
			.attr('class','ns')
			.attr('transform', function(d) { 
				return('translate('+ Math.random() * ww + ',' + Math.random() * hh + ')'); })
			.call(this.force.drag);
		
		this.nsEnter.append('circle')
			.attr('class','circ')
			.attr('r', cr)
			.style('stroke', function(d) { return d3.rgb(qview.cols(+d.details.relatetype)).darker(2); })
			.style('fill', function(d) { return qview.cols(+d.details.relatetype);	});

		this.nsEnter.append('text')
			.attr('class','ndnm')
			.attr('text-anchor','middle')
			.text(function(d) { return(d.name); });
	
		this.ns.on('click', function(d,i) { qview.nlNodeClick(d,i,this,qview); });

		this.ns.exit().remove();
		
		/*	Edges */
		this.lks = this.svg.selectAll('line.link')
			.data(this.links, function(d) { 
				return d.source.id + "-" + d.target.id; });
		this.lkEnter = this.lks.enter().insert('line','g.ns')
			.attr('class','link')
			.attr('x1', function(d) { return d.source.x; })
			.attr('x2', function(d) { return d.target.x; })
			.attr('y1', function(d) { return d.source.y; })
			.attr('y2', function(d) { return d.target.y; });
			
		this.lks.exit().transition().duration(this.animSpeed)
			.attr('stroke-width', 0)
			.remove();

		this.tickNodeLink();
		
	};
	
	/**** Tick / move the nodes and draw the force behavior ****/
	
	app.QuestionView.prototype.tickNodeLink = function() {
		var ns = this.ns,
			nd = this.nd,
			lks = this.lks,
			links = this.links,
			cr = this.cRadius,
			padding = this.collPadding;
		var hh = this.touchHeight,
			ww = this.touchWidth;

		this.force.on("tick", function(e) {
	
			// Collision detection - move the nodes around each other
			if(this.collisionDetect) {
				ns.each(function(d) {
					var quadtree = d3.geom.quadtree(nd);
					var nx1 = d.x - cr,
						nx2 = d.x + cr,
						ny1 = d.y - cr,
						ny2 = d.y + cr;
					quadtree.visit(function(quad, x1, y1, x2, y2) {
						if(quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x,
								y = d.y - quad.point.y,
								l = Math.sqrt(x * x + y * y),
								r = cr * 2 + padding;
							if (l < r) {
								l = (l - r) / l * 0.05;
								d.x -= x *= l;
								d.y -= y *= l;
								quad.point.x += x;
								quad.point.y += y;
							}
						}
						return x1 > nx2
							|| x2 < nx1
							|| y1 > ny2
							|| y2 < ny2;
					});
				});
			}
			
			// Turning off gravity, so we need a boundary
			var padding = 50;
			ns.each(function(d) {
				if ( d.x < cr ) {
					d.x = cr;
				}
				if ( d.x > (ww - cr) ) {
					d.x = ww - cr;
				}
				if ( d.y < (cr + padding)) {
					d.y = cr + padding;
				} 
				if ( d.y > (hh - cr - padding) ) {
					d.y = hh - cr - padding;
				}
			});

	
			ns.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			
			lks.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		});

		this.force.start();
		
	};
	
	/**** Calculate the degree of a node ****/
	
	app.QuestionView.prototype.nodeDegree = function(id) {
		var sources = _.where(this.links, {source: id});
		var targets = _.where(this.links, {target: id});
		
		return sources.length + targets.length;		
	};
	
	/***************************************************
	*
	*	Load Data
	*
	***************************************************/
	
	/**** Load the node / name data ****/
	app.QuestionView.prototype.loadNodeLinkNodes = function() {
		var nameModels = [];
	
		if(this.model.get('nameList') !== undefined) {			
			nameModels = app.names.namesInList(this.model.get('nameList'));
		} else {
			nameModels = app.names.models;
		}
		var nameData = _.pluck(nameModels, 'attributes');
		var pf = _.pluck(_.pluck(nameData, 'details'), this.qn);
		
		this.nd = this.force.nodes();

		for(var i = 0; i < nameData.length; i++) {
			var qq = nameData[i];
			qq.iid = i;
			this.nd.push(qq);
		}
	};
	
	
	/**** Helper function ****/
	app.QuestionView.prototype.loadOperations = function() {
		var ops = this.model.attributes.response.operations;
		if( typeof ops !== 'undefined') {
			this.operations = ops;
		}
		this.nlApplyOperations();
	};
	
	/**** Load the link data (stored in the name data) ****/
	app.QuestionView.prototype.loadNodeLinkLinks = function() {
		var nameModels = [];
	
		if(this.model.get('nameList') !== undefined) {			
			nameModels = app.names.namesInList(this.model.get('nameList'));
		} else {
			nameModels = app.names.models;
		}
		
		var tieData = _.pluck(_.pluck(_.pluck(nameModels, 'attributes'), 'details'), 'ties');
		var nmids = _.pluck(app.names.models, 'id');
		var targets = [], alink = {}, i = 0, j = 0, src = '';
		
		this.links = this.force.links();

		for(i = 0; i < nmids.length; i++) {
			targets = _.keys(tieData[i]);
			src = nmids[i];
			if( targets.length > 0 ) {
				for(j = 0; j < targets.length; j++ ) {
					this.links.push({source: app.names.get(src).attributes,
						target: app.names.get(targets[j]).attributes});
				}
			}
		}
	};
	
	/**** Create sliders for the force-tweaking tools ****/
	app.QuestionView.prototype.slidersNodeLink = function() {
		var qview = this;
		this.$('.alphaSlider').slider({
			value: qview.alphak,
			min: 0,
			max: 2,
			step: 0.01
			})
			.on('slideStop', function(ev) {
				qview.alphak = ev.value;
				qview.tickNodeLink();
			});
		
		this.$('.gravitySlider').slider({
			value: qview.fgravity,
			min: 0,
			max: 1,
			step: 0.01 })
			.on('slideStop', function(ev) {
				qview.force.gravity( ev.value );
				qview.tickNodeLink();
			});
		
		this.$('.linkDistance').slider({
			value: qview.linkdistance,
			min: 0,
			max: 200,
			step: 5 })
			.on('slideStop', function(ev) {
				qview.force.linkDistance( ev.value );
				qview.tickNodeLink();
			});
		
		
		this.$('.chargeSlider').slider({
			value: qview.fcharge,
			min: -1000,
			max: 0,
			step: 10 })
			.on('slideStop', function(ev) {
				qview.force.charge( ev.value );
				qview.tickNodeLink();
			});
		
		this.$('.frictionSlider').slider({
			value: qview.ffriction,
			min: 0,
			max: 1,
			step: 0.01 })
			.on('slideStop', function(ev) {
				qview.force.friction( ev.value );
				qview.tickNodeLink();
			});
		
	};
		
});
