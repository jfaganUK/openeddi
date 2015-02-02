/**
 * Created by jfagan on 1/20/15.
 */

var Sequelize   = require('sequelize');
var pg          = require('pg');

var sequelize = new Sequelize('openeddi', 'openeddi', 'openeddi', {
    dialect: 'postgres'
});

exports.sequelize = sequelize;