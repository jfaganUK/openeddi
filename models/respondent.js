/**
 * Created by jfagan on 1/20/15.
 */

var Sequelize = require('sequelize');
var sequelize = require('../config/sequelize').sequelize;

var Respondent = sequelize.define('Respondent', {
    id: Sequelize.STRING, // A guid
    datecreated: Sequelize.DATE, // The client creation date and the date inserted can be very different if the data is synced at a later date
    ipaddress: Sequelize.STRING, // The ipaddress they were tracked from
    survey: Sequelize.INTEGER, // What survey they took (note, may change this to a JSON field in case of multiple surveys)
    surveystatus: Sequelize.STRING, //What is the current status of the survey they are taking?
    surveylogic: Sequelize.JSON, // The logic of the survey they took
    grouplogic: Sequelize.JSON, // The group logic of the survey they took
    lastgroup: Sequelize.INTEGER, // The last page they were on of the survey (again, might roll this into a JSON version of the survey field)
    username: Sequelize.STRING, // Username, name of the user who administered the survey to them (again, probably roll into a survey JSON field)
    meta: Sequelize.JSON // Any other data about the respondent we might want to keep at a *respondent* level
}, {
    tableName: 'respondents',
    timestamps: true,
    createdAt: 'dateinserted',
    updatedAt: 'dateupdated'
});

exports.Respondent = Respondent;