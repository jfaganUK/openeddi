/**
 * Created by jfagan on 1/20/15.
 */

var Sequelize = require('sequelize');
var sequelize = require('../config/sequelize').sequelize;

var Response = sequelize.define('Response', {
    id: Sequelize.STRING,
    rid: Sequelize.STRING,
    sid: Sequelize.INTEGER,
    qid: Sequelize.INTEGER,
    logic: Sequelize.JSON,
    response: Sequelize.JSON
}, {
    tableName: 'responses',
    timestamps: true,
    createdAt: 'datecreated',
    updatedAt: 'lastupdated'
});

exports.Response = Response;