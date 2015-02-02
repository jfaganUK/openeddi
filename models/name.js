/**
 * Created by jfagan on 1/20/15.
 */

var Sequelize = require('sequelize');
var sequelize = require('../config/sequelize').sequelize;

var Name = sequelize.define('Name', {
    id: Sequelize.STRING,
    rid: Sequelize.STRING,
    sid: Sequelize.INTEGER,
    name: Sequelize.STRING,
    namelist: Sequelize.JSON,
    details: Sequelize.JSON
}, {
    tableName: 'namelist',
    timestamps: true,
    createdAt: 'datecreated',
    updatedAt: 'lastupdated'
});

exports.Name = Name;