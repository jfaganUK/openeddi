/*****

Question views - there are a variety.

*****/

/*
JSHint
global CRITICAL_WIDTH:true
 */

var app = app || {};

$(function () {
	'use strict';
	
	app.QuestionView = Backbone.View.extend({
		tagName: 'div',
		
		className: 'question',
		
		template: _.template($('#question-template').html()),
		
		events: {
			'keyup .namegen' : 'namegenCreateEnter',
			'submit form' : 'submitFail',
			'click .yesnoBtn' : 'clickYesNo',
			'click .RadioBtn' : 'clickRadio',
			'click .DKcontrol' : 'clickDK',
			'click .RFcontrol' : 'clickRF',
			'click .checkBox' :	'clickCheckBox',
			'blur .otherInput' : 'otherBlur',
			'change .dropDownControl' : 'dropdownSelected',
			'click .namecardListItem'	: 'addNameCard',
			'click .addCard'	: 'addNameCard',
			'click #nlToolBox .btn' : 'toolClick',
			'click .geoLocationGet' : 'getGeoLocation',
			'blur .geoLocationDesc' : 'getGeoLocationDesc',
			'blur .shortAnswer' : 'getShortAnswer',
			'blur .longText' : 'getLongText',
			'change .aff-dropadd' : 'affDropAddChange',
			'click .addAffiliation' : 'affDropAddClickAdd',
			'click .clearAffiliation' : 'affDropAddClickClear',
			'keyup .mode-name-input' : 'affDropAddCreateEnter',
			'click .aff-dropadd-list > li' : 'affDropAddChange',
		},
		
		initialize: function() {
			this.qn = this.model.toJSON().questionTitle; // qn - question name
			this.qt = this.model.toJSON().questionType;
			this.nl = this.model.toJSON().nameList;
			this.nms = []; // maintain a list internally of the ids of the names in a name list - for name gen
			
			this.disabledControls = false;
			
			// Test for and initialize the question if it's an array
			this.initializeArrayQ();
			
			this.listenTo(app.names, 'listchanged', this.changeNames);
			this.listenTo(app.names, 'listchanged', this.updateNameListCount);
			this.listenTo(app.names, 'destroy', this.updateNameListCount);
			this.listenTo(app.survey.questions, 'change', this.checkConditions);
			
			// Listen for a resize event
			this.listenTo(app.appState, 'resize', this.resizePage);
			this.listenTo(app.appState, 'group-appended', this.resizePage);
		
			// Launch the instructions Bootstro
			if(this.model.toJSON().instruct) {
				this.listenTo(app.appState, 'group-appended', this.launchInstructions);
			}
			
			// Launch the prompt
			if(this.model.toJSON().prompt) {
				this.listenTo(app.appState, 'group-appended', this.modalPrompt);
			}
			
			// If it's a name sampler, do the sample!
			if(this.qt === 'namesampler') {
				this.nameSampler();
			}
			
			// Initialize the d3 name interpreter
			if( this.qt === 'touchnameinterpret') {
				this.setupTouchNameInterpret();
				this.listenTo(app.appState, 'group-appended', this.slidersTouchNameInterpret);
				this.listenTo(app.appState, 'group-appended', function() {$('.touchQuestionPrompt').show();	});
				//this.listenTo(window, 'resize', this.windowChangeTouchNameInterpret);
			}
			
			if( this.qt === 'namepilesort') {
				this.setupNamePileSort();
				this.listenTo(app.appState, 'group-appended', function() { $('.topNavBar').hide(); });
				this.listenTo(app.appState, 'group-appended', this.startScroller);
				this.listenTo(app.appState, 'group-appended', function() {$('.touchQuestionPrompt').show();	});
			}
			
			if( this.qt === 'namenodelink') {
				this.setupNodeLink();
				this.listenTo(app.appState, 'group-appended', this.slidersNodeLink);
				this.listenTo(app.appState, 'group-appended', function() {
					$('.touchQuestionPrompt').show();
				});
			}

			if ( this.qt === 'bullseye') {
				this.setupBullseye();
				this.listenTo(app.appState, 'group-appended', function() {$('.touchQuestionPrompt').show();	});
			}

			if(this.qt === 'slider') {
				this.listenTo(app.appState, 'group-appended', this.sliderInit);

			}

			if(this.qt === 'namevaluecompare') {
				this.sliderFeedBackInit();
			}
			
			if (this.qt === 'basicroster') {
				this.listenTo(app.names, 'sync', this.updateBasicRosterProgress);
				this.listenTo(app.appState, 'group-appended', this.prepareBasicRoster());
			}
			
			if (this.qt === 'affdropadd') {
				this.listenTo(app.appState, 'group-appended', this.affDropAddRenderSelects);
				this.listenTo(app.appState, 'group-appended', this.affDropAddUpdatePairs);
				this.listenTo(app.names, 'sync', this.affDropAddRenderSelects);
			}
			
			// initialize the checkboxes to false, if they are null
			// they are assigned to null in the initializeArrayQ
			if( this.qt === 'checkbox' ) {
				var a = null;
				for(var i = 0; i < this.model.attributes.response.value.length; i++) {
					a = this.model.attributes.response.value[i];
					this.model.attributes.response.value[i] = a === null ? false : a;
				}
			}
			
			// Set the current control template
			this.setControlTemplate();
			
		},
		
		setControlTemplate: function() {
			// Set the control template
			// If we have an array, then this control will be added multiple times
			switch(this.qt) {
				case 'namegen':
					this.controlTemplate = _.template($('#control-namegen-template').html());
					break;
				case 'namepick':
					this.controlTemplate = _.template($('#control-namepick-template').html());
					break;
				case 'nameinterpret':
					this.controlTemplate = _.template($('#control-nameinterpret-template').html());
					break;
				case 'touchnameinterpret':
					this.controlTemplate = _.template($('#control-touchnameinterpret-template').html());
					break;
				case 'yesno':
					this.controlTemplate = _.template($('#control-yesno-template').html());
					break;
				case 'radio':
					this.controlTemplate = _.template($('#control-radio-template').html());
					break;
				case 'checkbox':
					this.controlTemplate = _.template($('#control-checkbox-template').html());
					break;
				case 'dropdown':
					this.controlTemplate = _.template($('#control-dropdown-template').html());
					break;
				case 'namepilesort':
					this.controlTemplate = _.template($('#control-namepilesort-template').html());
					break;
				case 'namenodelink':
					this.controlTemplate = _.template($('#control-namenodelink-template').html());
					break;
				case 'geolocation':
					this.controlTemplate = _.template($('#control-geolocation-template').html());
					break;
				case 'shortanswer':
					this.controlTemplate = _.template($('#control-shortanswer-template').html());
					break;
				case 'bullseye':
					this.controlTemplate = _.template($('#control-bullseye-template').html());
					break;
				case 'basicroster':
					this.controlTemplate = _.template($('#basicroster-template').html());
					break;
				case 'affdropadd':
					this.controlTemplate = _.template($('#control-affiliation-dropadd-template').html());
					break;
				case 'longtext':
					this.controlTemplate = _.template($('#control-longtext-template').html());
					break;
				case 'slider':
					this.controlTemplate = _.template($('#control-slider-template').html());
					break;
				default:
					this.controlTemplate = _.template($('#control-boilerplate-template').html());
					break;
			}
			
			this.otherTemplate = _.template($('#control-otherinput-template').html());
		},
		
		initializeArrayQ: function() {
			// Test if this is an array question
			if(this.model.toJSON().arrayPrompts !== undefined && this.qt !== 'nameinterpret') {
				this.arrayP = this.model.toJSON().arrayPrompts;
				this.arrayQ = true;
				// Initialize the response value vector
				if(this.model.attributes.response.value === undefined) {
					this.model.attributes.response.value = [];
					for(var i = 0; i < this.arrayP.length; i++) {
						this.model.attributes.response.value.push(null);
					}
				}
			}
		},
		
		render: function() {
		
			// Render the question structure
			this.$el.html(this.template(this.model.toJSON()));
			
			this.renderControl();
			
			// if the conditions aren't met, hide the question, otherwise unhide it
			this.checkConditions();
			
			// check dk and rf, then disable the controls
			if(this.model.get('response').dk) {
				this.$('.DKcontrol').toggleClass('enabled');
				this.toggleDisableControls();
			}
			if(this.model.get('response').rf) {
				this.$('.RFcontrol').toggleClass('enabled');
				this.toggleDisableControls();
			}
			
			if(this.qt === 'basicroster') {
				//this.renderBasicRoster();
				// this renders at the end of prepBasicRoster
			}
			
			// update names for the namegen stuff
			if( _.contains(['nameinterpret','namegen','namepick'], this.qt)) {
				this.changeNames();
			}
			
			if(this.qt === 'touchnameinterpret') {
				this.renderTouchNameInterpret();
			}
			
			if(this.qt === 'namepilesort') {
				this.renderNamePileSort();
			}
			
			if(this.qt === 'namenodelink') {
				this.renderNodeLink();
			}
			
			if(this.qt === 'bullseye') {
				this.bullseyeRender();
			}
			
			this.renderOther();
			
			return this;
		},
		
		resizePage: function() {
			// If the screen size is too small, we need to adjust the radio buttons
			// to be vertical instead of horizontal.
			
			var ww = app.appState.get('appwidth');
			var pw = app.appState.get('appwidthPrevious');
			
			if (typeof pw === 'undefined' && ww <= CRITICAL_WIDTH) {
				this.verticalRadioButtons();
				return;
			}
			
			if (typeof pw === 'undefined' && ww <= CRITICAL_WIDTH) {
				this.horizontalRadioButtons();
				return;
			}
			
			if ( ww <= CRITICAL_WIDTH && pw >= CRITICAL_WIDTH) {
				this.verticalRadioButtons();
				return;
			}
			
			if ( ww > CRITICAL_WIDTH && pw <= CRITICAL_WIDTH)  {
				this.horizontalRadioButtons();
				return;
			}			
		},

		launchInstructions: function() {
			var bs = this.model.toJSON().bootstro;
			window.setTimeout( function() { bootstro.start('',{finishButton: '<button class="btn btn-mini btn-success bootstro-finish-btn"><i class="fa fa-ok"></i>Thanks!</button>',
				items: bs}); }, 500);
		},
		
		modalPrompt: function() {
			var prompt = this.model.toJSON().prompt;
			var temp = _.template($('#qprompt-modal-template').html());
			
			this.$el.append(temp(prompt));
			
			$('#qprompt-modal').modal();
			
			
		},
		
		verticalRadioButtons: function() {
			this.$('.btn-group').addClass('btn-group-vertical');
			
			var btns = this.$( '.btn-group .btn' );
			
			var maxWidth = Math.max.apply( null, btns.map( function () {
				return $( this ).outerWidth( true );
			}).get() );
			
			btns.width(maxWidth);
		},
		
		horizontalRadioButtons: function() {
			this.$('.btn-group').removeClass('btn-group-vertical');
			
			var btns = this.$( '.btn-group .btn' );
			btns.css('width','');			
		},
		
		renderOther: function() {
			// Add an 'otherInput' control if it's there
			if(typeof this.model.toJSON().includeOther !== 'undefined' &&
				this.qt !== 'nameinterpret' ) { 
				if(this.model.toJSON().includeOther) {
					var odata = {oText: this.model.toJSON().response.other.text,
						oCheck: this.model.toJSON().response.other.check};
					this.$('.otherControlSpace').html(this.otherTemplate(odata));
				}
			}
		},
		
		renderControl: function() {
			// Render the controls
			var cdata = this.model.toJSON();
			if(this.arrayQ) {
				for(var i = 0; i < this.arrayP.length; i++) {
					cdata.cPrompt = this.arrayP[i];
					cdata.aIndex = i;
					cdata.cvalue = this.model.attributes.response.value[i];
					this.$('.questionControlSpace').append(this.controlTemplate(cdata));	
				}
			} else {
				cdata.cvalue = this.model.attributes.response.value;
				this.$('.questionControlSpace').html(this.controlTemplate(cdata));
			}
		},
		
		checkConditions: function() {
			if(!this.model.checkCondition()) {
				this.$el.hide();
			} else {
				this.$el.show();
			}
		},
		
		// just a function to handle forms and prevent them from submitting
		submitFail: function() {
			return false;
		},
		
		// Close function. Will remove the names as well.
		close: function() {
			var me = this;
			_.each(this.nms, function(qq) {
				qq.close();
			});
			
			
			if(this.qt === 'touchnameinterpret') {
				// Need to do this for force-directed layout, or the ticks 'spill over'
				this.force.stop();
				// need to do this, or I can drag scroll		
				this.force.drag = null;
			}
			
			if( this.qt === 'namepilesort') {
				this.savePiles();				
			}
			
			// Just in case there is a modal up, remove it
			$('#qprompt-modal').modal('hide');
				// and in case that didn't work.
			$('.modal-backdrop').remove()
			$('body').removeClass('modal-open');

			// In case the bootstro is still running
			try {
				bootstro.stop();
			} catch(err) {
				console.log('No bootstro to stop.');
			}

			this.remove();
			
			
		},
		
		toggleDisableControls: function() {
			this.disabledControls = !this.disabledControls;
			this.$('.qcontrol').toggleClass('disabled');
			
			//TODO check the other control (it has a different mechanism for disabled)
		},
		
		/************ Other ************/
		
		otherBlur: function(ev) {
			if(!this.model.attributes.includeOther) {
				return;
			}
			if(this.qt === 'nameinterpret') {
				return;
			}
			
			var otxt = $(ev.currentTarget).val();
			var resp = this.model.attributes.response;
			var potxt = resp.other.text;
			resp.other.text = otxt;
			resp.other.check = true;
			
			this.model.save({response: resp});
			
			// xor, only toggle the status of the check box if the status of the 
			// text box has changed
			if( !((otxt === '') === (potxt === '')) ) {
				this.$('.otherCheck').toggleClass('fa-check-empty');
				this.$('.otherCheck').toggleClass('fa-check');
			}
			
			
		},
		
		/************ Don't Know and Refused ************/
		
		clickDK: function() {
			var rsp = this.model.get('response');
			rsp.dk = !rsp.dk;
			this.model.save({response: rsp});
			
			this.$('.DKcontrol').toggleClass('enabled');
			this.disableFromDKRF();
		},
		
		clickRF: function() {
			var rsp = this.model.get('response');
			rsp.rf = !rsp.rf;
			this.model.save({response: rsp});
			
			this.$('.RFcontrol').toggleClass('enabled');
			this.disableFromDKRF();
		},
		
		// if the state of RF and DK changes, toggle the disabling of controls
		disableFromDKRF: function() {
			var dk = this.model.get('response').dk,
				rf = this.model.get('response').rf;
			if((dk || rf) && !this.disabledControls) {
				this.toggleDisableControls();
			}
			if(!(dk || rf) && this.disabledControls) {
				this.toggleDisableControls();
			}
		},
		
		/************ Check boxes ************/
		
		dropdownSelected: function(ev) {
			var selectVal = $(ev.currentTarget).val();
			var resp = this.model.attributes.response;
			resp.value = selectVal;
			this.model.save({response: resp});
		},
		
		/************ Check boxes ************/
		
		clickCheckBox: function(ev) {
		
			if($(ev.currentTarget).hasClass('disabled') || this.qt === 'nameinterpret') {
				return;
			}
		
			if(this.arrayQ) {
				var aindex = $(ev.currentTarget).attr('aindex');
				$(ev.currentTarget.firstElementChild).toggleClass('icon-check');
				$(ev.currentTarget.firstElementChild).toggleClass('icon-check-empty');
				var resp = this.model.attributes.response;
				resp.value[aindex] = !resp.value[aindex];
				this.model.save({response: resp});
			} else {
				var val = this.model.attributes.value;
				this.model.save({response: {value: !val}});
			}
		},

		/************ Yes No ************/
		
		clickYesNo: function(ev) {
			var clickval = $(ev.currentTarget).attr('value');
			if(this.arrayQ) {
				var aindex = $(ev.currentTarget).attr('aindex');
				var resp = this.model.attributes.response;
				resp.value[aindex] = clickval;
				this.model.save({response: resp});
			} else {
				this.model.save({response: {value: clickval}});
			}
		},		
		
		/************ Radio ************/
		
		clickRadio: function(ev) {
			var clickval = $(ev.currentTarget).val();
			if(this.arrayQ) {
				var aindex = $(ev.currentTarget).attr('aindex');
				var resp = this.model.attributes.response;
				resp.value[aindex] = clickval;
				this.model.save({response: resp});
			} else {
				
				this.model.save({response: {value: clickval}});
			}
		},	
		

		
		
		/************ Name Generating, Name Picking, Name Interpretting ************/
		
		getNameIDs: function() {
			var nmids = [];
			
			_.each(this.nms, function(qq) {
				nmids.push(qq.model.id);
			});
			
			return(nmids);
		},
		
		changeNames: function() {
			var nl = this.nl;
			var nmids = this.getNameIDs();
			var conds = this.model.attributes.nameCondition;
			var i = 0;

			var namesToAdd = app.names.filter(function(qq) {
					return(!_.contains(nmids, qq.id) && _.contains(qq.attributes.lists, nl) && qq.checkCondition(conds));
			});
			
			// add name interpret items for each name - if it's not already there
			if(this.qt === 'nameinterpret') {
				if(namesToAdd.length) {
					for(i = 0; i < namesToAdd.length; i++) {
						this.addNameInterpret(namesToAdd[i]);
					}
				}
				
				// remove names where necessary
				this.cleanNms();
			}
			
			// add list items for name gen - add an item if it's not already there but it should be
			if(this.qt === 'namegen') {	
				if(namesToAdd.length) {
					for(i = 0; i < namesToAdd.length; i++) {
						this.addNameToList(namesToAdd[i]);
					}
				}
			
				// remove names where necessary
				this.cleanNms();
			}
			
			// add toggle boxes for each name - if it's not already there
			if(this.qt === 'namepick') {
				app.names.each(this.addNameToggle,this);
			}		

		},
		
		// clean up the list of names
		cleanNms: function() {
			var nl = this.nl;
			var nmids = this.getNameIDs();
			
			if(nmids.length) {
				nmids = _.filter(nmids, function(x) {
					var thisModel = app.names.get(x);

					if(thisModel === undefined) {  // in case the model was destroyed
						return(false);
					} else {
						return(_.contains(thisModel.toJSON().lists, nl));
					}
				});
			}
		},
		
		namegenCreateEnter: function(e) {
			if (e.keyCode !== 13) { return; }
			if (!this.$('.namegen .inputName').val()) { return; }
			
			this.createName();

		},
		
		createName: function() {
			var nm = this.$('.namegen .inputName').val();
			var nl = this.model.toJSON().nameList;
			
			// create
			var newname = app.names.create({
				name: nm,
				rid: app.appState.toJSON().rid,
				sid: app.appState.toJSON().sid
			});
			
			if(app.names.remote) {
				newname.once('sync',function() {
					newname.appendToList(nl);
				});
			} else {
				newname.appendToList(nl);
			}

			//this.addNameToList(newname); - will be added due to the list change
			
			this.nameReset();
		},
		
		addNameToList: function(qq) {
			var nview = new app.NameView({model: qq, 
					attributes: {namelist: this.nl} });
			nview.render();
			this.$('.namelist').append(nview.$el);
			
			this.updateNameListCount();
			
			this.nms.push(nview);
		},
		
		updateNameListCount: function() {
			var countEl = this.$('.namegenCount');
			var nlCount = app.names.countOfList(this.nl);
			var countText = '';
			
			if(nlCount === 1) {
				countText = 'is 1 name';
			} else if (nlCount === 0 ) {
				countText = 'are no names';
			} else {
				countText = 'are '+nlCount+' names';
			}
			
			countEl.text(countText);
			
		},
		
		addNameToggle: function(qq) {
			var nmids = this.getNameIDs();
			if (!_.contains(nmids, qq.id) ) {
				var ntview = new app.NameToggleView({model: qq, 
						attributes: {namelist: this.nl} });
				ntview.render();
				this.$('.nametogglespace').append(ntview.$el);
				
				this.nms.push(ntview);
			}
		},
		
		addNameInterpret: function(qq) { 	
			var niview = new app.NameInterpretView({model: qq,
					attributes: {namelist: this.nl,
					qn: this.qn,
					niType: this.model.toJSON().niType,
					includeOther: this.model.toJSON().includeOther,
					radioList: this.model.toJSON().radioList,
					arrayPrompts: this.model.toJSON().arrayPrompts,
					shortPrompt: this.model.toJSON().shortPrompt } });
			niview.render();
			this.$('.nameinterpretspace').append(niview.$el);
			
			this.nms.push(niview);
		},
		
		nameReset: function() {
			this.$('.namegen .inputName').val('');
		},

		
	});
});
