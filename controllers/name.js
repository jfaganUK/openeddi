/**
 * Created by jfagan on 1/20/15.
 */

var Name = require('../models/_list').Name;

/*
 * Get one name by id
 * GET /names/rid/:rid/:id
 */

function getName(req, res, next) {
    Name.find({where: {id: req.param.id, rid: req.params.rid}})
        .complete(function(err, name) {
            if (!!err) {
                res.send(400, "Unable to find name.");
            } else {
                res.send(200, name);
            }
        });

    next();
}
exports.get = getName;

/*
 * Get all the names
 */
function getAllNames(req, res, next) {
    Name.findAll()
        .complete(function(err, names) {
            if(!!err) {
                res.send(400, "Error retrieving all names.");
            } else {
                res.send(200, names);
            }
        });
    next();
}
exports.getall = getAllNames;

// POST Name
function postName(req, res, next) {
    console.log('**** Name POST request');
    console.log(req.params);

    Name.create({
        id: req.params.id,
        rid: req.params.rid,
        sid: req.body.sid,
        name: req.body.name,
        namelist: req.body.namelist,
        details: req.body.details
    }).complete(function(err, name) {
        if(!!err) {
            console.log("Failed to save name: ", err);
            res.send(400, "Failed to save name.");
        } else {
            res.send(201, name.dataValues);
        }
    });


    next();
}
exports.post = postName;

// PUT Name
function putName(req, res, next) {
    console.log('**** Name PUT request');

    // Just because it's a put request doesn't mean the entry actually exists
    // The client-side creates the id, so Backbone treats it as a pre-existing item
    Name.find(req.params.id)
        .complete(function(err, name) {
            if(!!err) {
                var returnMessage = 'A system error occurred: ' + err.message;
                console.log(returnMessage);
                res.send(500, returnMessage);
            } else if (!name) {
                postName(req, res, next);
            } else {
                // There is an existing name with that ID
                // So update it
                name.id = req.params.id;
                name.rid = req.params.rid;
                name.sid = req.body.sid;
                name.name = req.body.name;
                name.namelist = req.body.namelist;
                name.details = req.body.detals;

                name.save()
                    .complete(function(err, name) {
                        if(!!err) {
                            res.send(400, "Error saving the name.");
                        } else {
                            res.send(201, name);
                        }
                    });
            }
        });

    next();
}
exports.put = putName;

// DELETE Name
function deleteName(req, res, next) {
    Name.find(req.params.id)
        .complete(function(err, name) {
            if(!!err) {
                res.send(400, "Error finding the name for deletion.");
            } else {
                name.destroy()
                    .complete(function(err, name){
                        if(!!err) {
                            res.send(400, "Error deleting the name");
                        } else {
                            res.send(200, name);
                        }
                    });
            }
        });

    next();
}
exports.delete = deleteName;
