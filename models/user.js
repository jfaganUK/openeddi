var Sequelize = require('sequelize');
var sequelize = require('../config/sequelize').sequelize;

var User = sequelize.define('User', {
    username: Sequelize.STRING,
    pwd: Sequelize.STRING,
    email: Sequelize.STRING,
    fname: Sequelize.STRING,
    lname: Sequelize.STRING
}, {
    tableName: 'users',
    timestamps: true
});

exports.User = User;