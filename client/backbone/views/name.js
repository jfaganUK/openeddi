
/*********

Name views

	- NameView: simple list item
	- NameToggle: a toggle button
	- NameInterpret: interpret a name

*****/

var app = app || {};

$(function () {
	'use strict';
	
	// note that it is frequently created with an attribute called namelist
	
	app.NameView = Backbone.View.extend({
		tagName: "li",
		
		className: "name",
		
		template: _.template($('#name-template').html()),
		
		events: {
			"click div .nameDetail" : "edit",
			"click .destroy" : "clear",
			"keyup .nameedit" : "updateOnEnter"
		},
		
		initialize: function() {
			this.listenTo(this.model, 'destroy', this.remove); //if the model disappears for some reason, remove the view
			this.listenTo(this.model, 'all', this.render);
			this.listenTo(this.model, 'listchanged', this.removeOnChange);
		},
		
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		
		edit: function() {
			this.$el.addClass('editing');
			this.$('.nameedit').focus(); 
		},
		
		doneEditing: function() {
			var nm = this.$('.nameedit').val().trim();
			
			this.model.save({ name: nm });
			
			this.$el.removeClass('editing');
			
			this.render();
			
		},
		
		removeOnChange: function() {
			console.log('remove on change: ' + this.model.attributes.name + ", " + this.attributes.namelist);
			
			// if this list is no longer in the models array, remove the view
			if( !this.model.inList(this.attributes.namelist)) {
				this.remove();
			}
		},
		
		updateOnEnter: function(e) {
			if (e.which === ENTER_KEY ) {
				this.doneEditing();
			}
		},
		
		clear: function() {
			this.model.removeFromList(this.attributes.namelist);
			this.remove();
		},
		
		close: function() {
			this.remove();
		},
		
	});
	
	app.NameBasic = Backbone.View.extend({
		tagName: "li",
		
		className: "name",
		
		template: _.template($('#namebasic-template').html()),
		
		events: {
		},
		
		initialize: function() {
			this.listenTo(this.model, 'destroy', this.remove); //if the model disappears for some reason, remove the view
			this.listenTo(this.model, 'all', this.render);
			this.listenTo(this.model, 'listchanged', this.removeOnChange);
		},
		
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		
		close: function() {
			this.remove();
		},
		
	});
	
	
	app.NameToggleView = Backbone.View.extend({
		tagName: "div",
		
		className: "nametoggle row-fluid",
		
		template: _.template($('#nametoggle-template').html()),
		
		events: {
			"click .nametoggler" : "addToList"
		},
		
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'listchanged', this.render);
		},
		
		render: function() {
			var qq = this.model.toJSON();
			var nl = this.attributes.namelist;
			var isActive = _.contains(qq.lists, nl);
			qq.isActive = isActive;
			this.$el.html(this.template(qq));
		},
		
		addToList: function() {			
			var nl = this.attributes.namelist;
			
			if(this.model.inList(nl)) {
				this.model.removeFromList(this.attributes.namelist);
			} else {
				this.model.appendToList(this.attributes.namelist);
			}
		},
		
		close: function() {
			this.remove();
		},
		
	});
	
	app.NameInterpretView = Backbone.View.extend({
		tagName: "div",
		
		className: "nameinterpret row-fluid",
		
		template: _.template($('#nameinterpret-template').html()),
		
		events: {
			"click .niRadioBtn" : "getRadioValue",
			"click .checkBox" :	"clickCheckBox",
			"blur .otherInput" : "otherBlur",
			"blur .nameinterpretLongtextSpace > .longText" : "longTextBlur",
			"slide .controlSlider" : "sliderSave"
		},
		
		initialize: function() {
			this.nl = this.attributes.namelist;
			this.qn = this.attributes.qn;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'listchanged', this.render);
			this.listenTo(this.model, 'listchanged', this.removeOnChange);


			// Prepare the variables for the checkbox or the slider array
			if(this.attributes.niType === 'checkbox' || this.attributes.niType === 'slider') {
				if( typeof this.model.get('details')[this.qn] === 'undefined' ) {
					this.model.attributes.details[this.qn] = {};
				}
			
				// prepare a null array for the check boxes in the details
				if(this.model.attributes.details[this.qn].values === undefined) {
					this.model.attributes.details[this.qn].values = [];
					this.arrayP = this.attributes.arrayPrompts;
					for(var i = 0; i < this.arrayP.length; i++) {
						this.model.attributes.details[this.qn].values.push(null);
					}
				}
			}
			
		},
		
		render: function() {
			var qq = this.model.toJSON();
			qq.qn = this.qn;
			qq.namelist = this.nl;
			qq.niType = this.attributes.niType;
			
			var spTemp = _.template(this.attributes.shortPrompt);
			qq.prompt = spTemp(qq);
			
			if(qq.niType === 'radio') {
				qq.radioList = this.attributes.radioList;
				this.$el.html(this.template(qq));
			} else if(qq.niType === 'checkbox') {
				this.$el.html(this.template(qq));
				this.renderCheckbox();
			} else if (qq.niType === 'slider') {
				this.$el.html(this.template(qq));
				this.renderSlider();
				this.listenTo(app.appState, 'group-appended', this.sliderInit);
			} else {
				this.$el.html(this.template(qq));
			}
			
		},
		
		renderCheckbox: function() {
			this.arrayP = this.attributes.arrayPrompts;
			var i = 0;

			// prepare null for the other as well
			if( this.attributes.includeOther) {
				this.otherTemplate = _.template($('#control-otherinput-template').html());
				if ( typeof this.model.attributes.details[this.qn].other === 'undefined') {
					this.model.attributes.details[this.qn].other = {text: '', check: false};
				}
			}

			// render the checkbox items			
			var cdata = {};
			var controlTemplate = _.template($('#control-checkbox-template').html());
			for(i = 0; i < this.arrayP.length; i++) {
				cdata.cPrompt = this.arrayP[i];
				cdata.aIndex = i;
				cdata.cvalue = this.model.attributes.details[this.qn].values[i];
				this.$('.nameinterpretCheckboxSpace').append(controlTemplate(cdata));	
			}
			
			// render the other box
			if(this.attributes.includeOther) {
				var odata = {oText: this.model.toJSON().details[this.qn].other.text,
					oCheck: this.model.toJSON().details[this.qn].other.check};
				this.$('.otherControlSpace').html(this.otherTemplate(odata));
			}

		},
		
		removeOnChange: function() {
			// if this list is no longer in the models array, remove the view
			if( !this.model.inList(this.nl)) {
				this.remove();
			}
		},
		
		/************ Other box ************/
		
		otherBlur: function(ev) {			
			var otxt = $(ev.currentTarget).val();
			var dets = this.model.attributes.details;
			var potxt = dets[this.qn].other.text;
			dets[this.qn].other.text = otxt;
			dets[this.qn].other.check = true;
			
			this.model.save({details: dets});
			
			// xor, only toggle the status of the check box if the status of the 
			// text box has changed
			if( !((otxt === '') === (potxt === '')) ) {
				$(ev.currentTarget).toggleClass('icon-check-empty');
				$(ev.currentTarget).toggleClass('icon-check');
			}
			
			
		},
		
		/************ Check boxes ************/
		
		clickCheckBox: function(ev) {
		
			if($(ev.currentTarget).hasClass('disabled')) {
				return;
			}
		
			var aindex = $(ev.currentTarget).attr('aindex');
			$(ev.currentTarget.firstElementChild).toggleClass('icon-check');
			$(ev.currentTarget.firstElementChild).toggleClass('icon-check-empty');
			
			var dets = this.model.attributes.details;
			dets[this.qn].values[aindex] = !dets[this.qn].values[aindex];
			this.model.save({details: dets});

		},
		
		/************ Radio buttons ************/
		
		getRadioValue: function(ev) {
			var radioval = $(ev.currentTarget).val();
			var details = this.model.get('details');
			details[this.qn] = radioval;
			this.model.save({ details: details});
			//this.model.set('details',details);
		},
		
		/************ Long Text ************/
		
		longTextBlur: function(ev) {
			var txt = $(ev.currentTarget).val();
			var details = this.model.get('details');
		
			details[this.qn] = txt;
			this.model.save({details: details});
		},


		/************ Slider ************/

		renderSlider: function() {
			var details = this.model.get('details');
			var controlTemplate = _.template($('#control-slider-template').html());
			var sliderSetup = app.survey.questions
				.findWhere({"questionTitle": this.qn})
				.toJSON().sliderSetup;
			var prompts = app.survey.questions
				.findWhere({"questionTitle": this.qn})
				.toJSON().arrayPrompts;
			if(sliderSetup.length) {
				for(var i = 0; i < sliderSetup.length; i++) {
					var cdata = {};
					var cpromptTemp = _.template(prompts[i]);
					cdata.cPrompt = cpromptTemp(this.model.toJSON());
					cdata.sliderSetup = sliderSetup[i];
					cdata.aIndex = i;
					cdata.cvalue = this.model.attributes.details[this.qn].values[i];
					this.$('.nameinterpretSliderSpace').append(controlTemplate(cdata));
				}
			} else {
				this.$('.nameinterpretSliderSpace').html(controlTemplate());
			}
		},

		sliderInit: function() {
			this.$('.controlSlider').slider({"tooltip":"hide"});
		},

		sliderSave: function(ev) {
			var sli = $(ev.currentTarget);
			var val = sli.slider('getValue');
			var dets = this.model.attributes.details;
			var aindex = sli.attr('aindex');
			dets[this.attributes.qn].values[parseInt(aindex)] = val;
			this.model.save({details: dets});
		},
		
		close: function() {
			this.remove();
		},

		
	});

});
