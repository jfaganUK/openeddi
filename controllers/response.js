/**
 * Created by jfagan on 1/20/15.
 */

var Response = require('../models/_list').Response;

/*
 * Get one response by id
 * GET /responses/rid/:rid/:id
 */

function getResponse(req, res, next) {
    Response.find({where: {id: req.param.id, rid: req.params.rid}})
        .complete(function(err, response) {
            if (!!err) {
                res.send(400, "Unable to find response.");
            } else {
                res.send(200, response);
            }
        });

    next();
}
exports.get = getResponse;

/*
 * Get all the responses
 */
function getAllResponses(req, res, next) {
    Response.findAll()
        .complete(function(err, responses) {
            if(!!err) {
                res.send(400, "Error retrieving all responses.");
            } else {
                res.send(200, responses);
            }
        });
    next();
}
exports.getall = getAllResponses;

// POST Response
function postResponse(req, res, next) {
    console.log('**** Response POST request');
    console.log(req.params);

    Response.create({
        id: req.params.id,
        rid: req.params.rid,
        sid: req.body.sid,
        response: req.body.response,
        logic: req.body.logic
    }).complete(function(err, response) {
        if(!!err) {
            console.log("Failed to save response: ", err);
            res.send(400, "Failed to save response.");
        } else {
            res.send(201, response.dataValues);
        }
    });


    next();
}
exports.post = postResponse;

// PUT Response
function putResponse(req, res, next) {
    console.log('**** Response PUT request');

    // Just because it's a put request doesn't mean the entry actually exists
    // The client-side creates the id, so Backbone treats it as a pre-existing item
    Response.find({where: {id: req.params.id, rid: req.params.rid }})
        .complete(function(err, response) {
            if(!!err) {
                var returnMessage = 'A system error occurred: ' + err.message;
                console.log(returnMessage);
                res.send(500, returnMessage);
            } else if (!response) {
                postResponse(req, res, next);
            } else {
                // There is an existing response with that ID
                // So update it
                response.id = req.params.id;
                response.rid = req.params.rid;
                response.sid = req.body.sid;
                response.response = req.body.response;
                response.logic = req.body.logic;

                response.save()
                    .complete(function(err, response) {
                        if(!!err) {
                            res.send(400, "Error saving the response.");
                        } else {
                            res.send(201, response);
                        }
                    });
            }
        });

    next();
}
exports.put = putResponse;

// DELETE Response
function deleteResponse(req, res, next) {
    Response.find(req.params.id)
        .complete(function(err, response) {
            if(!!err) {
                res.send(400, "Error finding the response for deletion.");
            } else {
                response.destroy()
                    .complete(function(err, response){
                        if(!!err) {
                            res.send(400, "Error deleting the response");
                        } else {
                            res.send(200, response);
                        }
                    });
            }
        });

    next();
}
exports.delete = deleteResponse;
