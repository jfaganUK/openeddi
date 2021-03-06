/***

This is a set of functions for use in the Net Query Application.

***/


/***

GUID - a unique id generated by the app. I can't rely on the api to generate id's since
	this is supposed to be an offline-capable app. 
	
	This is slightly modified from the normal GUID so that it's distinct from Backbone Dual Storage

	***/

	function s4() {
		'use strict';
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}

	function guid() {
		'use strict';
		return 'nq-' + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	}

/***

Login handling.

***/

EXPIRE_DAYS = 1; // Number of days to stay logged in.

$.ajaxSetup({
	statusCode: {
		401: function(){
			'use strict';
			// Redirect the to the login page.
			console.log('Got a 401 - not logged in');

			if ( app.appState.get('loggedin') ) {
				app.clearLogin();
				app.router.navigate('login',{trigger: true});
			}
			
			if( app.checkLoginCookie() ) {
				console.log('Trying to log in with cookies');
				app.appState.set('loggedin', true);
				$.ajax();
			}
			
			if ( !app.appState.get('loggedin') ) {
				app.router.navigate('login',{trigger: true});
			}
			
		},
		403: function() {
			'use strict';
			// Redirect the to the login page.
			console.log('Got a 403');
			app.appState.set('loggedin', false);
			app.router.navigate('login',{trigger: true});
		},
		200: function() {
			'use strict';
			//console.log('Got a 200 - logged in ');
			
			if ( !app.appState.get('loggedin') ) {
				app.appState.set('loggedin', true);
				app.setLoginCookie();
			}
		},
	}
});

/*** Set cookies for logins ***/


function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	
	if (c_start == -1) {	c_start = c_value.indexOf(c_name + "="); }
	if (c_start == -1) {	c_value = null; } 
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) { c_end = c_value.length; }
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	
	return c_value;
}



function deleteAllCookies() {
	var cookies = document.cookie.split(";");

	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		var eqPos = cookie.indexOf("=");
		var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
	}
}

$(function() {

	// Determine local storage is active or not
	Backbone.Collection.prototype.local = true;
	Backbone.Collection.prototype.remote = true;
	
	Backbone.Model.prototype.local = true;
	Backbone.Model.prototype.remote = true;

	app.setCredentials = function(user, pass) {
		app.creds = { username: user, 
			password: pass };
			Backbone.Model.prototype.credentials = app.creds;
			Backbone.Collection.prototype.credentials = app.creds;
		};

		app.clearLogin = function() {
			app.setCredentials('','');
			app.appState.set('loggedin', false);
			app.appState.set('gix', null);
			app.appState.set('rid', null);
			deleteAllCookies();
		};

		app.setLoginCookie = function () {
            if (typeof Backbone.Model.prototype.credentials === 'undefined') {
                var u = 'NOTSET';
                var p = 'NOTSET';
            } else {
                var u = Backbone.Model.prototype.credentials.username;
                var p = Backbone.Model.prototype.credentials.password;
            }

            setCookie('username', u, 1);
            setCookie('password', p, 1);
        };

		app.checkLoginCookie = function() {
			var username = getCookie('username');
			var password = getCookie('password');

			if( username !== null && username !== '' && password !== null && password !== '') {
				app.setCredentials(username, password);
				return true;
			} else {
				deleteAllCookies();
				return false;
			}
		}

	});

/*** Hashing passwords ***/

function sha1(msg)
{
	function rotl(n,s) { return n<<s|n>>>32-s; };
	function tohex(i) { for(var h="", s=28;;s-=4) { h+=(i>>>s&0xf).toString(16); if(!s) return h; } };
	var H0=0x67452301, H1=0xEFCDAB89, H2=0x98BADCFE, H3=0x10325476, H4=0xC3D2E1F0, M=0x0ffffffff; 
	var i, t, W=new Array(80), ml=msg.length, wa=new Array();
	msg += fcc(0x80);
	while(msg.length%4) msg+=fcc(0);
	for(i=0;i<msg.length;i+=4) wa.push(msg.cca(i)<<24|msg.cca(i+1)<<16|msg.cca(i+2)<<8|msg.cca(i+3));
		while(wa.length%16!=14) wa.push(0);
	wa.push(ml>>>29),wa.push((ml<<3)&M);
	for( var bo=0;bo<wa.length;bo+=16 ) {
		for(i=0;i<16;i++) W[i]=wa[bo+i];
			for(i=16;i<=79;i++) W[i]=rotl(W[i-3]^W[i-8]^W[i-14]^W[i-16],1);
				var A=H0, B=H1, C=H2, D=H3, E=H4;
			for(i=0 ;i<=19;i++) t=(rotl(A,5)+(B&C|~B&D)+E+W[i]+0x5A827999)&M, E=D, D=C, C=rotl(B,30), B=A, A=t;
				for(i=20;i<=39;i++) t=(rotl(A,5)+(B^C^D)+E+W[i]+0x6ED9EBA1)&M, E=D, D=C, C=rotl(B,30), B=A, A=t;
					for(i=40;i<=59;i++) t=(rotl(A,5)+(B&C|B&D|C&D)+E+W[i]+0x8F1BBCDC)&M, E=D, D=C, C=rotl(B,30), B=A, A=t;
						for(i=60;i<=79;i++) t=(rotl(A,5)+(B^C^D)+E+W[i]+0xCA62C1D6)&M, E=D, D=C, C=rotl(B,30), B=A, A=t;
							H0=H0+A&M;H1=H1+B&M;H2=H2+C&M;H3=H3+D&M;H4=H4+E&M;
					}
					return tohex(H0)+tohex(H1)+tohex(H2)+tohex(H3)+tohex(H4);
				}

/*******************************************************************************
*
*	Application Cacheing Functions
*
*******************************************************************************/



/*******************************************************************************
*
*	Dual-storage functions
*
*******************************************************************************/

$(function() {

	// From http://stackoverflow.com/questions/2384167/check-if-internet-connection-exists-with-javascript
	// Slightly modifed. It allows for a 401 response (just means we aren't logged in)
	// If there is an error it returns false
	// Does not use jQuery so it shouldn't mix up with the login or backbone code
	app.hostReachable = function () {
		// Handle IE and more capable browsers
		var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
		var status;

		// Open new request as a HEAD to the root hostname with a random param to bust the cache
		xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );

		// Issue request and handle response
		try {
			xhr.send();
			return ( xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 401);
		} catch (error) {
			return false;
		}
	}
	
	Backbone.Collection.prototype.createStore = function() {
		if (typeof this.url === 'function') {
			this.store = new Store(this.url());
		} else {
			this.store = new Store(this.url);
		}
	}

	Store.prototype.getIds = function() {
		return this.recordsOn(this.name);
	}
	
	Store.prototype.getDirty = function() {
		return this.recordsOn(this.name + '_dirty');
	}
	
	Store.prototype.getDestroyed = function() {
		return this.recordsOn(this.name + '_destroyed');
	}
	
	//Intended to remove the key, the destroyed, and dirty
	Store.prototype.totalClear = function() {
		localStorage.removeItem(this.name);
		localStorage.removeItem(this.name + '_dirty');
		localStorage.removeItem(this.name + '_destroyed');
		this.clear();
	}

});

var localStorageSpace = function(){
	var allStrings = '';
	for(var key in window.localStorage){
		if(window.localStorage.hasOwnProperty(key)){
			allStrings += window.localStorage[key];
		}
	}
	return allStrings ? 3 + ((allStrings.length*16)/(8*1024)): 0;
};

var anyDirtyDestroyed = function() {
	var _s = "";
	var _k = "";
	for(var i = 0; i < localStorage.length; i++) {
		_k = localStorage.key(i);
		if(_k.indexOf('_dirty') >= 0 || _k.indexOf('_destroyed') >= 0) {
			_s = localStorage.getItem(_k);
			if (_s === null) { _s = ''; }
			if(_s.length > 0) { return true; }
		}
	}
	return false;
};


























