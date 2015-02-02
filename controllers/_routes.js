/**
 * Created by jfagan on 1/20/15.
 */

var respondents = require('./respondent');
var responses = require('./response');
var names = require('./name');

function setup(server) {
    // Respondents
    server.get('/respondents/respondent/:id', respondents.get);
    server.get('/respondents/respondent', respondents.getall);
    server.post('/respondents/respondent', respondents.post);
    server.put('/respondents/respondent/:id', respondents.put);
    server.del('/respondents/respondent/:id', respondents.delete);

    // Responses
    server.get('/responses/response/rid/:rid/:id', responses.get);
    server.get('/responses/response/rid/:rid', responses.getall);
    server.post('/responses/response/rid/:rid/:id', responses.post);
    server.put('/responses/response/rid/:rid/:id', responses.put);
    server.del('/responses/response/rid/:rid/:id', responses.delete);

    // Namelist
    server.get('/namelist/names/rid/:rid/:id', names.get);
    server.get('/namelist/names/rid/:rid', names.getall);
    server.post('/namelist/names/rid/:rid/:id', names.post);
    server.put('/namelist/names/rid/:rid/:id', names.put);
    server.del('/namelist/names/rid/:rid/:id', names.delete);
}
exports.setup = setup;