
/*
 * Model: User
 * This model manages data regarding OpenEddi Users.
 * These are the admins / survey administrators who collect data or set up surveys. They use the admin back-end of the app.
 */
//var User = require('./user.js');
exports.User = require('./user').User;

/*
 * Mode: Respondent
 * Each person who responds to a survey is a respondent.
 */

//var Respondent = require('./respondent.js');
exports.Respondent = require('./respondent').Respondent;

/*
 * Model: Response
 * This records the responses the respondents provide from the survey.
 */

//var Response = require('./response.js');
exports.Response = require('./response').Response;

/*
 * Model: Name
 * The network data is stored at the node level, with edges stored as node lists.
 */
exports.Name= require('./name').Name;