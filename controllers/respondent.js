/**
 * Created by jfagan on 1/20/15.
 */

var Respondent = require('../models/_list').Respondent;

/*
 * Get one respondent by id
 * GET /respondents/:id
 */

function getRespondent(req, res, next) {
    Respondent.find(req.params.id).success(function(respondent) {
        res.send(200, respondent);
    }).error(function(result) {
        res.send(400, "Unable to find respondent.");
    });

    next();
}
exports.get = getRespondent;

/*
 * Get all the respondents
 * TODO: You should only be able to do this if you are authenticated as admin.
 */
function getAllRespondents(req, res, next) {
    Respondent.findAll()
        .complete(function(err, respondents) {
            if(!!err) {
                res.send(400, "Error retrieving all respondents.");
            } else {
                res.send(200, respondents);
            }
        });
    next();
}
exports.getall = getAllRespondents;

// POST Respondent
function postRespondent(req, res, next) {
    console.log('**** Respondent POST request');
    console.log(req.params);

    Respondent.create({
        id: req.params.id
    }).complete(function(err, respondent) {
        if(!!err) {
            console.log("Failed to save respondent: ", err);
            res.send(400, "Failed to save respondent.");
        } else {
            res.send(201, respondent.dataValues);
        }
    });


    next();
}
exports.post = postRespondent;

// PUT Respondent
function putRespondent(req, res, next) {
    console.log('**** Respondent PUT request');

    // Just because it's a put request doesn't mean the entry actually exists
    // The client-side creates the id, so Backbone treats it as a pre-existing item
    Respondent.find(req.params.id)
        .complete(function(err, respondent) {
            if(!!err) {
                var returnMessage = 'A system error occurred: ' + err.message;
                console.log(returnMessage);
                res.send(500, returnMessage);
            } else if (!respondent) {
                postRespondent(req, res, next);
            } else {
                // There is an existing respondent with that ID
                // So update it
                respondent.id = req.params.id;
                respondent.ipaddress = req.connection.remoteAddress;
                respondent.datecreated = req.body.datecreated;
                respondent.lastgroup = req.body.lastgroup;
                respondent.surveystatus = req.body.surveystatus;

                respondent.save()
                    .complete(function(err, respondent) {
                        if(!!err) {
                            res.send(400, "Error saving the respondent.");
                        } else {
                            res.send(201, respondent);
                        }
                    });
            }
        });

    next();
}
exports.put = putRespondent;

// DELETE Respondent
function deleteRespondent(req, res, next) {
    Respondent.find(req.params.id)
        .complete(function(err, respondent) {
            if(!!err) {
                res.send(400, "Error finding the respondent for deletion.");
            } else {
                respondent.destroy()
                    .complete(function(err, respondent){
                        if(!!err) {
                            res.send(400, "Error deleting the respondent");
                        } else {
                            res.send(201, respondent);
                        }
                    });
            }
        });

    next();
}
exports.delete = deleteRespondent;
