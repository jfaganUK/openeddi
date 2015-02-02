/**
 * Created by jfagan on 1/20/15.
 */

// Setup a server connection
var sequelize = require('./config/sequelize').sequelize;

// Attempt to authenticate with the server, if not, then throw an error
sequelize
    .authenticate()
    .complete(function(err) {
        if(!!err) {
            console.log("Unable to connect to the database:",err);
        } else {
            console.log("Connection has been established successfully.");
        }
    });

// Grab the models for the server
var models = require('./models/_list');

// Sync the models with the server
sequelize
    .sync({force: true})
    .complete(function(err) {
        if(!!err) {
            console.log("An error occurred while creating the table:", err);
        } else {
            console.log("Server is synced.");
        }
    });

exports.sequelize = sequelize;
exports.models = models;