/************ 
bullseye

Drag and drop different people onto a bullseye. The center means they are closer to you. And further away is a weaker connection.

************/
	
var app = app || {};

$(function () {
	'use strict';	
	
	/***** Set up the sliders ****/
	app.QuestionView.prototype.slidersBullseye = function() {
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
		app.QuestionView.prototype.setupBullseye = function() {
			
			this.listenTo(app.appState, 'resize', this.render);
			
			// height and such
			var hh = this.touchHeight = $(window).height();
			var ww = this.touchWidth = $(window).width();
			this.CR = 100; //The bullseye circle radius increment (distance between each line, I guess)

			// Force variables
			this.cRadius = 20;
			this.alphak = 0.26;
			this.fgravity = 0.1;
			this.fcharge = -140;
			this.ffriction = 0.9;
			this.collPadding = 5;
			this.collAlpha = 0.59;
			this.collisionDetect = false;
			
			/***** The bullseye levels ****/
			var radl = this.model.toJSON().radioList;
			this.levels = [];
			var smaller = Math.min(this.touchWidth,this.touchHeight);
			
			// The color scale defaults to qualitative.
			this.cols = d3.scale.ordinal()
				.domain(_.pluck(radl,'value'))
				.range(d3.range(radl.length).map(d3.scale.linear()
					.domain([0, radl.length - 1])
					.range(["pink", "white"])
					.interpolate(d3.interpolateLab)));
			
			// furthest level
			this.levels.push({id: 0, val: 0, name: 'Undefined', c: '#FFFFFF', r: 5 });
			
			// load the focus data from the radiolist options
			for(var i = 0; i < radl.length; i++) {
				this.levels.push({id: i+1,
					val: radl[i].value,
					c: this.cols(i+1),
					x: ww / 2,
					y: hh / 2,
					r: i * this.CR});
				this.levels[i+1].name = (radl[i].desc !== "" ? radl[i].desc : radl[i].value);
			}
			
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
				.on('drag', function(d,i) {
					qview.bullseyeDragging(d,i,qview,this); })
				.on('dragend', function(d,i) {
					qview.bullseyeDragEnd(d, i, qview); });		

			// Load the node data
			this.bullseyeLoadNodes();

		};

		/***** The Drag commences ****/
		app.QuestionView.prototype.bullseyeDragging = function(d,i,qview,node) {
			var cx = qview.touchWidth / 2; // center of the bullseye
			var cy = qview.touchHeight / 2; 
			var cRadius = qview.cRadius; // the radius of the nodes

			// Move the node
			d.x += d3.event.dx;
			d.y += d3.event.dy;
			d3.select(node).attr('transform', function(d) {
				return('translate(' + d.x + ',' + d.y + ')'); 
			});
			
			// See if it's at a different level
			var diffx = d.x - cx;
			var diffy = d.y - cy;
			var dist = Math.sqrt(diffx * diffx + diffy * diffy)
			var lv = Math.floor(dist / qview.CR) + 1;
				// Say CR = 100 (the default)
				// If distance is 150, lv = 2. You'll be in the 2 level.

			d3.selectAll('g.rs').each(function(d,i) {
				// if we are hovering over this level
				// then set hover = true and highlight it by strooooking it
				if(d.id === lv) {
					d.hover = true;
					d3.select(this).select('.rsCirc')
						.transition()
						.duration(750)
						.ease('linear')
						.attr('stroke-width',3);
				} else {
					d.hover = false;
					d3.select(this).select('.rsCirc')
						.transition()
						.duration(750)
						.ease('linear')
						.attr('stroke-width', 0);
				}
			});
		};

		/***** The Drag ended ****/
		app.QuestionView.prototype.bullseyeDragEnd = function(d,i,qview) {
			var newLevel = -1;
			var levels = qview.levels;
			var qTitle = qview.qn;

			// Check and see which one we were hovering over
			d3.selectAll('g.rs').each(function(d,i) {
				if(d.hover) {
					newLevel = d.id;
					d.hover = false;
					d3.select(this).select('.rsCirc')
						.transition()
						.duration(750)
						.ease('linear')
						.attr('stroke-width', 0);
				}
			});

			// set the new level
			if (newLevel >= 0) {
				d.level = newLevel;
			}

			d.c = d3.rgb(levels[parseInt(d.level)].c).brighter(2); //fill is lighter
			d.s = d3.rgb(levels[parseInt(d.level)].c).darker(2);		// stroke is darker
			d.tx = d3.rgb(d.c).l < 0.6 ? "#FFFFFF" : "#000000";
				// text is white if the color of the cirle is too dark
					
			// Save the change to the name model...
			var nameModelDetails = app.names.where({id: d.id})[0]
				.addToDetails(qTitle, {value: levels[d.level].val, id: d.level});
			app.names.where({id: d.id})[0].save();

			// if px & py arent set the node thinks it made a huge leap and acts up
			_.where(qview.force.nodes(), {id: d.id})[0].px = d.x;
			_.where(qview.force.nodes(), {id: d.id})[0].py = d.y;

			// keep it all going again
			qview.bullseyeTick();
				
		};
		
		/***** Load the Node Data ****/
		app.QuestionView.prototype.bullseyeLoadNodes = function() {
			var nameModels = [];
			var levels = this.levels;
		
			if(this.model.get('nameList') !== undefined) {			
				nameModels = app.names.namesInList(this.model.get('nameList'));
			} else {
				nameModels = app.names.models;
			}
			// Get the attribute data for the names relating to this question (this.qn)
			var nameData = _.pluck(nameModels, 'attributes');
			var pf = _.pluck(_.pluck(nameData, 'details'), this.qn);
			
			// level - either load it from data or leave as undefined
			// If it's undefined it (not answered yet) it goes in the undefined focus
			this.nd = this.force.nodes();
			//var nd = this.nd;
			//nameData.forEach(function(x) { nd.push(x); });
			//this.nd = nd;

			for(var i = 0; i < nameData.length; i++) {
				var qq = nameData[i];
				
				if (pf[i] === undefined || pf[i] === null || pf[i] === "") {
					qq.level = 3;
				} else {
					qq.level = pf[i].id;
				}
				
				// Color the nodes according to their level
				qq.c = d3.rgb(levels[parseInt(qq.level)].c).brighter(2); //fill is lighter
				qq.s = d3.rgb(levels[parseInt(qq.level)].c).darker(2);		// stroke is darker
				qq.tx = d3.rgb(qq.c).l < 0.6 ? "#FFFFFF" : "#000000";
				
				// initialize the starting location
				// they will be drawn to the center, but they need to start outside.
				qq.x = 0; 
				qq.y = 0;
				qq.px = 0;
				qq.py = 0;
				
				this.nd.push(qq);
			}

		};
		
		/***** Render the question ****/
		app.QuestionView.prototype.bullseyeRender = function() {
		
			// bind locally so it can be used in d3 functions
			var hh = this.touchHeight;
			var ww = this.touchWidth;
			var cr = this.cRadius;
			var CR = this.CR;

			
			// the drawing space
			this.svg = d3.select(this.el).append('svg:svg')
				.attr('height',this.touchHeight)
				.attr('width',this.touchWidth)
				.attr('class','niSVG');
			
			// The Bullseye is composed of arcs.

			this.rs = this.svg.selectAll('g.rs')
				.data(this.levels, function(d) { return d.name; });
			this.rsEnter = this.rs.enter().insert('g')
				.attr('class','rs')
				.attr('transform', function(d) {
					return('translate(' + ww / 2 + ',' + hh / 2 + ')'); });

			var bullArc = d3.svg.arc()
				.startAngle(0).endAngle(2*Math.PI)
				.innerRadius(function(d) { return d.r; })
				.outerRadius(function(d) { return d.r + CR;});
			this.rsEnter.append('path')
				.attr('class','rsCirc')
				.attr('d', bullArc)
				.style('fill',function(d) { return d.c; });

			
			this.rstext = this.svg.selectAll('.rsText')
				.data(this.levels, function(d) { return d.name; })
				.enter()
				.append('text')
				.attr('class','rsText')
				.attr('text-anchor','middle')
				.attr('y', function(d) { return d.y; })
				.attr('x', function(d) { return d.x - d.r - 50; })
				.text(function(d) { return d.name; });
				
			// Draw the nodes
			this.ns = this.svg.selectAll('g.ns')
				.data(this.nd, function(d) { return d.id; });
			this.nsEnter = this.ns.enter().insert('g','.rsText')
				.attr('class','ns')
				.attr('transform', function(d) { 
					return('translate(0,0'); })
				.call(this.force.drag);
					
			this.nsEnter.append('circle')
				.attr('class','circ')
				.attr('r', cr);
	
			this.nsEnter.append('text')
				.attr('class','ndnm')
				.attr('text-anchor','middle')
				.text(function(d) { return(d.name); });
	
			this.ns.exit().remove();
			
			this.bullseyeTick();
		};
		
		/***** Tick the force layout ****/
		app.QuestionView.prototype.bullseyeTick = function() {
				var ns = this.ns,
				nd = this.nd,
				CR = this.CR, cr = this.cRadius,
				alphak = this.alphak,
				hh = this.touchHeight,
				ww = this.touchWidth,
				levels = this.levels;

			this.force.on("tick", function(e) {

				// Adjust the position of the nodes so that they sit at the edges of the bullseye levels
				var k = alphak * e.alpha;
				var cx = ww / 2;
				var cy = hh / 2;
				// First define a focus on the edge of the level. Then adjust the node towards that focus.
				// If the focus is outside the bounds of the screen, then we need to move it back in... I think.
				nd.forEach(function(o, i) {
					var diffx = o.x - cx;
					var diffy = o.y - cy;
					var ang = Math.atan2(diffy, diffx);
					var rr = levels[parseInt(o.level)].r + cr;
					var fx = rr * Math.cos(ang) + cx;
					var fy = rr * Math.sin(ang) + cy;

					// If we are too close to the center, move it back out.
					if(Math.sqrt(diffx * diffx + diffy * diffy) < rr) {
						o.y = fy; o.py = fy;
						o.x = fx; o.px = fx;
					}
				});

				// Move the position of the circle
				ns.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			});
			
			ns.select('.circ')
				.style('fill', function(d) { return d.c; })
				.style('stroke', function(d) { return d.s; });
				
			ns.select('.ndnm')
				.style('fill', function(d) { return d.tx; });
			
			this.force.start();

		};
		
		app.QuestionView.prototype.bullseyeWindowChange = function() {
		};
		
});
