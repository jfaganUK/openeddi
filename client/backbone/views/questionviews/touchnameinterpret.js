/************ 
touchnameinterpret

A question type where users drag names into different categories.

This is intended to be in it's own group on it's own page.

Will need to do some work on it if we want it to be on the same page as a namegen/namepick.

************/
	
var app = app || {};

$(function () {
	'use strict';	
	
	/***** Set up the sliders ****/
	app.QuestionView.prototype.slidersTouchNameInterpret = function() {
			var qview = this;
			this.$('.alphaSlider').slider({
				value: qview.alphak,
				min: 0,
				max: 2,
				step: 0.01
				})
				.on('slideStop', function(ev) {
					qview.alphak = ev.value;
					qview.tickTouchNameInterpret();
				});
			
			this.$('.gravitySlider').slider({
				value: qview.fgravity,
				min: 0,
				max: 2,
				step: 0.1 })
				.on('slideStop', function(ev) {
					qview.force.gravity( ev.value );
					qview.tickTouchNameInterpret();
				});
				
			this.$('.chargeSlider').slider({
				value: qview.fcharge,
				min: -1000,
				max: 0,
				step: 10 })
				.on('slideStop', function(ev) {
					qview.force.charge( ev.value );
					qview.tickTouchNameInterpret();
				});
			
			this.$('.frictionSlider').slider({
				value: qview.ffriction,
				min: 0,
				max: 1,
				step: 0.01 })
				.on('slideStop', function(ev) {
					qview.force.friction( ev.value );
					qview.tickTouchNameInterpret();
				});
			
			this.$('.collAlphaSlider').slider({
				value: qview.ffriction,
				min: 0,
				max: 1,
				step: 0.01 })
				.on('slideStop', function(ev) {
					qview.force.friction( ev.value );
					qview.tickTouchNameInterpret();
				});
		};
		
		/***** Set up the question ****/
		app.QuestionView.prototype.setupTouchNameInterpret = function() {
			
			this.listenTo(app.appState, 'resize', this.render);
			
			// height and such
			this.touchHeight = $(window).height();
			this.touchWidth = $(window).width();
			//this.touchHeight = this.$el.height() * 0.9;
			//this.touchWidth = this.$el.width() * 0.9;
			//this.touchHeight = 400;
			//this.touchWidth = 400;
			
			this.cRadius = 20;
			this.alphak = 0.26;
			this.fgravity = 0;
			this.fcharge = -140;
			this.ffriction = 0.9;
			this.collPadding = 5;
			this.collAlpha = 0.59;
			
			this.rsRadius = 120;
			
			this.collisionDetect = false;
			
			this.ignoreList = ['spacer','root'];
			
			this.undefinedName = '';
			
			/***** Load the focus information from the radio list of options ****/
			var radl = this.model.toJSON().radioList;
			this.foci = [];
			var smaller = this.touchWidth < this.touchHeight ? this.touchWidth : this.touchHeight;
			var fRadius = 0.85 * (smaller / (2 * radl.length));
			this.drawMargin = 25;
			
			// The color scale defaults to qualitative.
			if(this.model.toJSON().scaleType === 'seq') {
				this.cols = d3.scale.ordinal()
				 .domain(_.pluck(radl,'value'))
				.range(d3.range(radl.length).map(d3.scale.linear()
					.domain([0, radl.length - 1])
					.range(["yellow", "blue"])
					.interpolate(d3.interpolateLab)));
			} else {
				// Only supports 10 colors for now.
				this.cols = d3.scale.category10();
			}
			
			
			// undefined starting point
			this.foci.push({id: 0,
				val: -1,
				name: this.undefinedName,
				c: '#FFFFFF',
				value: 2,
				});
			
			// load the focus data from the radiolist options
			for(var i = 0; i < radl.length; i++) {
				this.foci.push({id: i+1,
					val: radl[i].value,
					value: 1, // for circle packing
					c: this.cols(i) });
				this.foci[i+1].name = (radl[i].desc !== "" ? radl[i].desc : radl[i].value);
			}
			
			
			// add a spacer
			this.foci.push({id: i+2, 
				val: _.max(_.pluck(radl,'value')),
				value: 1,
				c: '#FFF',
				name: 'spacer'});
			
			this.force = d3.layout.force()
				.charge(this.fcharge)
				.friction(this.ffriction)
				.gravity(this.fgravity)
				.linkDistance(this.touchWidth/10)
				.size([this.touchWidth,this.touchHeight]);

			// The drag event handler - dragging and dropping
			var qview = this;
			this.force.drag = d3.behavior.drag()
				.on('dragstart', function() {
					qview.force.stop();
				})
				.on('drag', qview.nodeDragging)
				.on('dragend', function(d,i) {
					qview.nodeDragEnd(d, i, qview); });
					
			// Circle packing layout
			
			this.pack = d3.layout.pack()
				.sort(function(d) { return d.val; })
				.size([this.touchWidth, this.touchHeight])
				.padding(this.cRadius);
			
			var fociR = {name: 'root', children: this.foci};
			this.fociPacked = this.pack.nodes(fociR);
			

			// Load the node data
			this.loadNodeData();

		};

		/***** The Drag commences ****/
		app.QuestionView.prototype.nodeDragging = function(d,i) {
			// When this is called, the context is the node
			// Move the node
			d.x += d3.event.dx;
			d.y += d3.event.dy;
			d3.select(this).attr('transform', function(d) {
				return('translate(' + d.x + ',' + d.y + ')'); 
			});
			
			// See if it's over a new focus
			var nx = d.x;
			var ny = d.y;
			var fc = d.focus;

			d3.selectAll('g.rs').each(function(d,i) {
				if(d.id !== fc) {
					var diffx = d.x - nx;
					var diffy = d.y - ny;
					var l = Math.sqrt(diffx * diffx + diffy * diffy);
					// the hover shouldn't be the root or the spacer
					if(l < d.r && !d.hover && !_.contains(['root','spacer'],d.name)) {
						d.hover = true;
						d3.select(this).select('.rsCirc')
							.transition()
							.duration(750)
							.ease('elastic')
							.attr('r',function(d) { return d.r * 1.25; });
					}
					if(l >= d.r && d.hover) {
						d.hover = false;
						d3.select(this).select('.rsCirc')
							.transition()
							.duration(750)
							.ease('elastic')
							.attr('r',function(d) { return d.r; });	
					}
				}
			});
		};

		/***** The Drag ended ****/
		app.QuestionView.prototype.nodeDragEnd = function(d,i,qview) {
			var newfocus = -1;
			var foci = qview.foci;
			var qTitle = qview.qn;

			d3.selectAll('g.rs').each(function(d,i) {
				if(d.hover) {
					newfocus = d.id;
					d.hover = false;
					d3.select(this).select('.rsCirc')
						.transition()
						.duration(750)
						.ease('elastic')
						.attr('r',function(d) { return d.r; });	
				}
			});

			// set the new focus
			if (newfocus >= 0) {
				d.focus = newfocus;
			}

			d.c = d3.rgb(foci[parseInt(d.focus)].c).brighter(2); //fill is lighter
			d.s = d3.rgb(foci[parseInt(d.focus)].c).darker(2);		// stroke is darker
			d.tx = d3.rgb(d.c).l < 0.6 ? "#FFFFFF" : "#000000";
				// text is white if the color of the cirle is too dark
					
			// Save the change to the name model...
			var nameModelDetails = app.names.where({id: d.id})[0]
				.addToDetails(qTitle, {value: foci[d.focus].val, id: d.focus});
			app.names.where({id: d.id})[0].save();

			// if px & py arent set the node thinks it made a huge leap and acts up
			_.where(qview.force.nodes(), {id: d.id})[0].px = d.x;
			_.where(qview.force.nodes(), {id: d.id})[0].py = d.y;

			// keep it all going again
			qview.tickTouchNameInterpret();
				
		};
		
		/***** Load the Node Data ****/
		app.QuestionView.prototype.loadNodeData = function() {
			var foci = this.foci;
			var nameModels = [];
		
			if(this.model.get('nameList') !== undefined) {			
				nameModels = app.names.namesInList(this.model.get('nameList'));
			} else {
				nameModels = app.names.models;
			}
			// Get the data from the names relating to this question (this.qn)
			var nameData = _.pluck(nameModels, 'attributes');
			var pf = _.pluck(_.pluck(nameData, 'details'), this.qn);
			
			// focus is the focus - either load it from data or leave as undefined
			// If it's undefined it (not answered yet) it goes in the undefined focus
			this.nd = this.force.nodes();

			for(var i = 0; i < nameData.length; i++) {
				var qq = nameData[i];
				
				if (pf[i] === undefined || pf[i] === null || pf[i] === "") {
					qq.focus = 0;
				} else {
					qq.focus = pf[i].id;
				}
				
				qq.c = d3.rgb(foci[parseInt(qq.focus)].c).brighter(2); //fill is lighter
				qq.s = d3.rgb(foci[parseInt(qq.focus)].c).darker(2);		// stroke is darker
				qq.tx = d3.rgb(qq.c).l < 0.6 ? "#FFFFFF" : "#000000";
				
				this.nd.push(qq);
			}
		};
		
		/***** Render the question ****/
		app.QuestionView.prototype.renderTouchNameInterpret = function() {
		
			// bind locally so it can be used in d3 functions
			var hh = this.touchHeight;
			var ww = this.touchWidth;
			var cr = this.cRadius;
			var il = this.ignoreList;
			
			// the drawing space
			this.svg = d3.select(this.el).append('svg:svg')
				.attr('height',this.touchHeight)
				.attr('width',this.touchWidth)
				.attr('class','niSVG');
			
			// add the radio circles

			this.rs = this.svg.selectAll('g.rs')
				.data(this.fociPacked, function(d) { return d.name; });
			this.rsEnter = this.rs.enter().insert('g')
				.attr('class','rs')
				.attr('transform', function(d) {
					return('translate(' + d.x + ',' + d.y + ')'); });
			this.rsEnter.append('circle')
				.attr('class','rsCirc')
				.style('opacity', function(d) { return _.contains(il,d.name) ? 0 : 1; })
				.style('fill', function(d) { return d.c; })
				.attr('stroke-width', 0)
				.attr('r', function(d) { return d.r; }); 
			
			this.rstext = this.svg.selectAll('.rsText')
				.data(this.fociPacked, function(d) { return d.name; })
				.enter()
				.append('text')
				.attr('class','rsText')
				.attr('text-anchor','middle')
				.attr('y', function(d) { return d.y - d.r; })
				.attr('x', function(d) { return d.x; })
				.text(function(d) { return _.contains(il,d.name) ? '' : d.name;  });
				
			// Draw some circles
			this.ns = this.svg.selectAll('g.ns')
				.data(this.nd, function(d) { return d.id; });
			this.nsEnter = this.ns.enter().insert('g','.rsText')
				.attr('class','ns')
				.attr('transform', function(d) { 
					return('translate('+ Math.random() * ww + ',' + Math.random() * hh + ')'); })
				.call(this.force.drag);
					
			this.nsEnter.append('circle')
				.attr('class','circ')
				.attr('r', cr);
	
			this.nsEnter.append('text')
				.attr('class','ndnm')
				.attr('text-anchor','middle')
				.text(function(d) { return(d.name); });
	
			this.ns.exit().remove();
			
			this.tickTouchNameInterpret();
			
		};
		
		/***** Tick the force layout ****/
		app.QuestionView.prototype.tickTouchNameInterpret = function() {
			var ns = this.ns,
				nd = this.nd,
				foci = this.foci,
				cr = this.cRadius,
				alphak = this.alphak,
				padding = this.collPadding;
			
			this.force.on("tick", function(e) {
				
				var k = alphak * e.alpha;
				
				nd.forEach(function(o, i) {
					o.y += (foci[parseInt(o.focus)].y - o.y) * k;
					o.x += (foci[parseInt(o.focus)].x - o.x) * k;
				});
				
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
				
				ns.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			});
			
			ns.select('.circ')
				.style('fill', function(d) { return d.c; })
				.style('stroke', function(d) { return d.s; });
				
			ns.select('.ndnm')
				.style('fill', function(d) { return d.tx; });
			
			this.force.start();
		};
		
		app.QuestionView.prototype.windowChangeTouchNameInterpret = function() {
			this.setupTouchNameInterpret();
			this.renderTouchNameInterpret();
		};
		
});
