/******************************************************************************
 * OpenEddi
 * (c) 2015, Jesse Fagan
 ******************************************************************************/

'use strict';

var path        = require('path');
var express     = require('express');
var _           = require('lodash');
var restify     = require('restify');

console.log("====== Starting OpenEddi Server...");


// Set up the web server
console.log("====== Starting Web Server (Express)...");
var app = express();
require('lodash-express')(app,'html');
app.set('view engine', 'html');
app.use('/',express.static('client'));
app.listen(4444);

// Set up the database
console.log("====== Prepping Database (Sequelize, PostgreSQL)...");
var sequelize = require('./db.js').sequelize;
var models = require('./db.js').models;

// Set up the REST server
console.log("====== Starting REST Server (Restify)...");
var rest = restify.createServer();
rest.name = "OpenEddi REST API";
rest.use(restify.bodyParser({mapParams: false}));
rest.pre(function(req, res, next) {
    req.headers.accept = 'application/json';
    return next();
});

var restRoutes = require('./controllers/_routes.js');
restRoutes.setup(rest);

rest.listen(4242, function() {
    console.log('%s listening at %s', rest.name, rest.url);
});



