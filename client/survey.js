/*************


 =========================
 Survey Details

 survey: {
	"sid": 1,
	"title": "Health Care Connections Survey for Self-Swab PARTICIPANTS",
	"inludeRefuse" : "yes",		// Include a "Refused" option for every question
	"includeDK" : "yes",			// Include a "Don't Know" option for every question
}

 ============================
 Groups

 groups: [{
	"gid": 9999,
	"title": "The title of group",
	"description": "",
	"questionOrder": [401,402,403,406,405],
	"groupCondition" : ...
},{},{}]

 =============================
 Questions

 questions: [{
	"id": 9999,			// since it stores reponses, every single response has a unique id
	"qid": 9999,		// the question id, defined by the question dataset
	"sid", 9999,		// the survey id
	"rid", 9999,		// the respondent id
	"sortIndex", 0 	// the order that the question will appear. this is a property of the question and not the group.
	"questionTitle": "aquestion99", 
		// the id must be unique, but the question title does not have to. Name gens and Name picks *should* have the same name.
	"questionType": "boilerplate",  // just some text
		"radio" 	// a radio button of values
		"yesno" // yes or no
		"array"  // a set of questions
		"shorttext" // just short text
		"namegen" 
		"namepick"
		"nameinterpret"
		"ties"
	"questionPrompt": "What is the question prompt?",
	"questionCondition": {
		"question": "aquestion01",
		"arrayIndex": NULL // can specify a sub array
		"comparator": "==",
		"value": "5"
		},
	"arraySize": 5,
	"arrayTypes": ["radio","radio","radio","radio","radio"]
	"arrayPrompts": ["Television","Radio","Newspaper","Internet","Other"]
	"radioList" : [{"value": 1, "desc": "Strongly Disagree"},
		{"value": 2, "desc": ""},
		{"value": 3, "desc": ""},
		{"value": 4, "desc": "Neutral"},
		{"value": 5, "desc": ""},
		{"value": 6, "desc": ""},
		{"value": 7, "desc": "Strongly Agree"}]
	"includeOther": true,
	"includeRefuse": true,
	"includeDK": true,
	"defaultValue": NULL,
	"nameList": "gen25" // this is the list of names the name should be added to
	"niType" : "radio" // the type of question for a name interpret
	"nameCondition" : { "lists" 	: {"comparator" : "!==", "value" : "thislist" },  // conditions for including a name
							  "details" : {"comparator" : ">", "detail" : "age", "value" : 18 } }
	
	///////////// RESPONSE EXAMPLES ///////////////
	
	"response": {} // this will vary greatly depending on the question type
	
	// refused, don't know -- if they refused or hit don't know at all, it will have these keys. Otherwise, they'll just be missing.
	{
		"refused" : "yes",
		"dontknow" : "yes",
	}
	
	// radio
	{
		"value": 4,
	}
	
	// yes no
	{
		"value": "yes",
	}
	
	// array - will be an array of objects
	// namegen, namepick, and nameinterpret all manipulate the names list, not the response
	{
		"responses": [{"value": 4}, {"value": 7}],
	}
	
	// ties - ordered pairs of names, an edgelist, using the name ids
	{
		"ties": [[1,2],[2,3],[2,3]],
	}

},{},{}]

 names: [{
	"id": 999,		// each name has a unique id
	"sid": 999,		// the survey the name belongs to
	"rid": 999,		// the respondent
	"name": "Jesse",
	"lists": ["friend","boss","coworker"] // populated by the namegen question name they were named in
	"details": {
		"healthexpert":2,
		"healthcare":3,
	}
},{},{}]




 **************/

var survey_json = survey_json || {};
var groups_json = groups_json || {};
var questions_json = questions_json || {};

$(function () {

    survey_json = {
        "sid": 2,
        "title": "OpenEddi",
        "subtitle": "A new generation of data collection and interaction.",
        "intro": "<div class=\"container\">" +
            "<div class=\"col-md-4\" style = 'text-align: right;'><p><h4>Jesse Fagan, MA</h4> (jesse.fagan@uky.edu)</p><p>LINKS Center for Social Network Analysis<p>	</div>" +
            "<div class=\"col-md-4\"><p><h4>Kate Eddens, PhD, MPH</h4> (kate.eddens@uky.edu)</p><p>Assistant Professor, Department of Health Behavior</p></div>	" +
            "<div class=\"col-md-4 col-md-offset-2\"><center><figure><img class = 'uklogo' src='./img/uklogo.png' /></figure></center></div></div>" +
            "<div class=\"alert alert-info\" style='margin-top:10px; width: 60%;'>I agree to check out this awesome demonstration of OpenEddi. I understand that the data will be viewed by the developers of OpenEddi. I will provide some helpful comments on the question at the end.</div>",
        "outtro": "<h1>Thanks!</h1><div class=\"container\">" +
            "<div class=\"col-md-4\" style = 'text-align: right;'><p><h4>Jesse Fagan, MA</h4> (jesse.fagan@uky.edu)</p><p>LINKS Center for Social Network Analysis<p>	</div>" +
            "<div class=\"col-md-4\"><p><h4>Kate Eddens, PhD, MPH</h4> (kate.eddens@uky.edu)</p><p>Assistant Professor, Department of Health Behavior</p></div>	" +
            "<div class=\"col-md-4 col-md-offset-2\"><center><figure class='effeckt-caption' data-effeckt-type='revolving-door-bottom'><img class = 'uklogo' src='./img/uklogo.png' /><figcaption><div class='effeckt-figcaption-wrap'><h3>UK Logo</h3><p>Straight from the University of Kentucky.</p></div></figcaption></figure></center></div></div>",
        "groupOrder": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,23,25,18,19,20,21,22,24],
        "rosters": {"fullroster": ["Jan", "Steve", "Bill", "George", "Ringo", "Aang", "Sokka", "Luke", "Leia"]}
    };

    groups_json = [
        {"gid": 1,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 2,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 3,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 4,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 5,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 6,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 7,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 8,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 9,  "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 10, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 11, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 12, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 13, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 14, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 15, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 16, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 17, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 18, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 19, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 20, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 21, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 22, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 23, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 24, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 25, "title": "OpenEddi Demonstration", "description": "" },
        {"gid": 26, "title": "OpenEddi Demonstration", "description": "" },

    ];

    questions_json = [
        {
            "qid"               : 101,
            "gid"               : 1,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "ngDiscussImportant",
            "questionType"      : "namegen",
            "questionPrompt"    : "Who do you discuss important matters with?",
            "nameList"          : "list1"
        },
        {
            "qid"               : 201,
            "gid"               : 2,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "npCountOn",
            "questionType"      : "namepick",
            "questionPrompt"    : "Who can you count on if you have a serious problem?",
            "nameList"          : "list2"
        },
        {
            "qid"               : 301,
            "gid"               : 3,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "ngCountOn",
            "questionType"      : "namegen",
            "questionPrompt"    : "Who else can you count on if you have a serious problem?",
            "nameList"          : "list2"
        },
        {
            "qid"               : 401,
            "gid"               : 4,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "npSpendTime",
            "questionType"      : "namepick",
            "questionPrompt"    : "Who do you spend the most free time with?",
            "nameList"          : "list3"
        },
        {
            "qid"               : 501,
            "gid"               : 5,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "ngSpendTime",
            "questionType"      : "namegen",
            "questionPrompt"    : "Who else do you spend the most free time with?",
            "nameList"          : "list3"
        },
        {
            "qid"               : 601,
            "gid"               : 6,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "npLoanMoney",
            "questionType"      : "namepick",
            "questionPrompt"    : "Who can you count on to loan you money if you needed it?",
            "nameList"          : "list4"
        },
        {
            "qid"               : 701,
            "gid"               : 7,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "ngLoanMoney",
            "questionType"      : "namegen",
            "questionPrompt"    : "Who else can you count on to loan you money if you needed it?",
            "nameList"          : "list4"
        },
        {
            "qid"               : 801,
            "gid"               : 8,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "npHelpDeal",
            "questionType"      : "namepick",
            "questionPrompt"    : "Who are the people who help you deal with having cancer?",
            "nameList"          : "list5"
        },
        {
            "qid"               : 901,
            "gid"               : 9,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 0,
            "questionTitle"     : "ngHelpDeal",
            "questionType"      : "namegen",
            "questionPrompt"    : "Who else can you count on to loan you money if you needed it?",
            "nameList"          : "list5"
        },
        {
            "qid"               : 1001,
            "gid"               : 10,
            "sid"               : 2,
            "sortIndex"         : 0,
            "questionTitle"     : "alter1",
            "questionType"      : "touchnameinterpret",
            "questionPrompt"    : "How do you know each of these people?",
            "prompt"            : {"promptTitle": "Drag and Drop", "promptContent": "<p>Drag and drop each name into the bubble which best describes your response to the question.</p><p><img src = './img/touchNameInterpretPic.png' /></p>"},
            "niType"            : "radio",
            "scaleType"         : "qual",
            "radioList": [
                {"value": 1, "desc": "Family"},
                {"value": 2, "desc": "Friend"},
                {"value": 3, "desc": "Neighbor"},
                {"value": 4, "desc": "Coworker"},
                {"value": 5, "desc": "Schoolmate"},
                {"value": 6, "desc": "Acquaintance"},
                {"value": 7, "desc": "Healthcare provider"},
                {"value": 8, "desc": "Other"},
            ]
        },
        {
            "qid"               : 1101,
            "gid"               : 11,
            "sid"               : 2,
            "questionTitle"     : "namegender",
            "questionType"      : "touchnameinterpret",
            "questionPrompt"    : "How would you describe the gender of each person?",
            "scaleType"         : "qual",
            "niType"            : "radio",
            "radioList" : [{"value": 1, "desc": "Male"},
                {"value": 2, "desc": "Female"},
                {"value": 3, "desc": "Unknown"}]    
        },
        {
            "qid"               : 1201,
            "gid"               : 12,
            "sid"               : 2,
            "questionTitle"     : "avoided",
            "questionType"      : "touchnameinterpret",
            "questionPrompt"    : "I feel like this person has avoided me since he or she found out I have cancer.",
            "scaleType"         : "qual",
            "niType"            : "radio",
            "radioList" : [{"value": 1, "desc": "Yes"},
                {"value": 2, "desc": "No"},
                {"value": 3, "desc": "Doesn't know I have cancer"}]    
        },
        {
            "qid"               : 1301,
            "gid"               : 13,
            "sid"               : 2,
            "questionTitle"     : "frustratedOptimist",
            "questionType"      : "touchnameinterpret",
            "questionPrompt"    : "Sometimes I get frustrated because this person seems too optimistic about me having cancer.",
            "scaleType"         : "qual",
            "niType"            : "radio",
            "radioList" : [{"value": 1, "desc": "Yes"},
                {"value": 2, "desc": "No"},
                {"value": 3, "desc": "Doesn't know I have cancer"}]    
        },
        {
            "qid"               : 1401,
            "gid"               : 14,
            "sid"               : 2,
            "sortIndex"         : 0,
            "questionTitle"     : "bullseyeTest",
            "questionType"      : "bullseye",
            "questionPrompt"    : "How close do you feel like you are to each person named here? You can move each person closer or further away from you based on how close you feel you are to them. People you put in the ring closest to you would be extremely close, and those who are in the outside ring would be not close to you at all.",
            "radioList" : [
                {"value": 1, "desc" : "Very close"},
                {"value": 2, "desc" : "2"},
                {"value": 3, "desc" : "3"},
                {"value": 4, "desc" : "4"},
                {"value": 5, "desc" : "Not close at all"}
            ]
        },
        {
            "qid"               : 1501,
            "gid"               : 15,
            "sid"               : 2,
            "dkrf"              : false,
            "sortIndex"         : 2,
            "questionTitle"     : "networkRoster",
            "questionType"      : "basicroster",
            "questionPrompt"    : "Indicate what kind of support you might get from each the following people:",
            "nSentence"         : "You haven't responded to the question concerning <%= rc.name %>.",
            "kSentence"         : "<%= rc.name %> <%= rc.verbs %>.",
            "useRoster"         : "fullroster",
            "nameList"          : "fullroster", // the default namelist, just for managing the data
            "namelistPrompts" : [{"nameList": "noSupport", "prompt": "Doesn’t really give me any support", "icon": "icon-lightbulb", "guttman":1, "verb":"doesn't support you"},
                {"nameList": "emotionalSupport", "prompt": "Gives me emotional support like listening and being affectionate and letting me talk about my feelings. ", "icon": "icon-reply", "guttman":1, "verb":"gives you emotional support"},
                {"nameList": "givesHelp", "prompt": "Gives me help when I need it, like bringing me food, driving me to appointments, or taking care of my kids when I need it. ", "icon": "icon-share-alt", "guttman":1, "verb":"gives help when you need it"},
                {"nameList": "info", "prompt": "Gives me information I need, like how to decide which treatment to do, what life might be like for me while I’m sick, and answering questions I have.", "icon": "icon-sitemap", "guttman":1, "verb":"gives you information"}
                ]
        },
        {
            "qid": 1601,
            "gid": 16,
            "sid": 2,
            "questionTitle": "tiespilesort",
            "questionType": "namepilesort",
            "tieDetails": {"relation": "communicate", "type": "undirected", "weighted": false },
            "questionPrompt": "Looking at all the people you’ve named, which of these people talk to one another?"
        },
        {
            "qid": 1701,
            "gid": 17,
            "sid": 2,
            "questionTitle": "tiesnodelink",
            "questionType": "namenodelink",
            "tieDetails": {"relation": "communicate", "type": "undirected", "weighted": false },
            "questionPrompt": "Looking at all the people you’ve named, which of these people talk to one another?",
        },
        {
            "qid": 1801,
            "gid": 18,
            "sid": 2,
            "sortIndex": 0,
            "questionTitle": "solution",
            "questionType": "boilerplate",
            "questionPrompt": "<h3>Network Data in Mind.</h3><ul class='fa-ul presentation-list'>" +
                "<li><i class='fa-li fa fa-cogs fa-2x'></i>Tools designed specifically to make filling matrices easier.</li>" +
                "<li><i class='fa-li fa fa-bar-chart-o fa-2x'></i>Data structured for large or small network studies.</li>" +
                "<li><i class='fa-li fa fa-check-square fa-2x'></i>Directly output to network data formats (UCINET, Gephi)</li>" +
                "<li><i class='fa-li fa fa-check-square fa-2x'></i>Expose API for data interface, feed directly into R, or anything else</li></ul>",
        },
        {
            "qid": 1901,
            "gid": 19,
            "sid": 2,
            "sortIndex": 1,
            "questionTitle": "solution",
            "questionType": "boilerplate",
            "questionPrompt": "<h3>The Dream.</h3><ul class='fa-ul presentation-list'>" +
                "<li><i class='fa-li fa fa-cloud fa-2x'></i>Something to reduce the fatigue.</li>" +
                "<li><i class='fa-li fa fa-cloud fa-2x'></i>Easy to grasp.</li>" +
                "<li><i class='fa-li fa fa-cloud fa-2x'></i>Visually compelling.</li>" +
                "<li><i class='fa-li fa fa-cloud fa-2x'></i>Grandmother could master it quickly.</li>" +
                "<li><i class='fa-li fa fa-cloud fa-2x'></i>Field data collection.</li></ul>"
        },
        {
            "qid": 2001,
            "gid": 20,
            "sid": 2,
            "sortIndex": 0,
            "questionTitle": "lunar",
            "questionType": "boilerplate",
            "questionPrompt": "<h3>Lunar Data Collection</h3>" +
                "<figure><img class = 'img-circle' src='./img/onthemoon_tablet.png' /></figure>" +
                "<ul class='fa-ul presentation-list'>" +
                "<li><i class='fa-li fa fa-clipboard fa-2x'></i>Bring your tablet on the road.</li>" +
                "<li><i class='fa-li fa fa-clipboard fa-2x'></i>All survey resources will cache to your tablet.</li>" +
                "<li><i class='fa-li fa fa-clipboard fa-2x'></i>Sync the data when you are ready.</li></ul>" +
                "<div class=\"container\"><div class='col-md-4'><figure><img class = 'img-rounded' src='./img/sync1.png' /></figure></div></div>",
        },
        {
            "qid": 2101,
            "gid": 21,
            "sid": 2,
            "sortIndex": 0,
            "questionTitle": "catchingup",
            "questionType": "boilerplate",
            "questionPrompt": "<h3>Catching Up to the Rest of the Internet</h3>" +
                "<ul class='fa-ul presentation-list'>" +
                "<li><i class='fa-li fa fa-pause fa-2x'></i>Single-page web app - asynchronous data, move at respondent's pace</li>" +
                "<li><i class='fa-li fa fa-play fa-2x'></i>Dynamic, interactive visualization - build questions in brand new ways</li>" +
                "<li><i class='fa-li fa fa-forward fa-2x'></i>Clean, responsive presentation - adapts to smartphone, tablet, or desktop</li>" +
                "<li><i class='fa-li fa fa-fast-forward fa-2x'></i>Quickly develop on the front- or back-end with node.js and backbone.</li></ul>",
        },
        {
            "qid": 2201,
            "gid": 22,
            "sid": 2,
            "sortIndex": 0,
            "questionTitle": "paradigm",
            "questionType": "boilerplate",
            "questionPrompt": "<h3>Modular, Open Survey Community - a New Paradigm?</h3>" +
                "<ul class='fa-ul presentation-list'>" +
                "<li><i class='fa-li fa fa-rocket fa-2x'></i>Free as in beer - able to download and install for free on your own server</li>" +
                "<li><i class='fa-li fa fa-rocket fa-2x'></i>Free as in freedom - Open source, Encourage a community of development and innovation in data collection</li>" +
                "<li><i class='fa-li fa fa-rocket fa-2x'></i>Marketplace of data collection ideas and plugins - there's a plugin for that!</li>" +
                "<li><i class='fa-li fa fa-rocket fa-2x'></i>Combination of a new open framework, using new technology, and a community of interested developers and researchers.</li></ul>",
        },
        {
            "qid": 2301,
            "gid": 23,
            "sid": 2,
            "dkrf": false,
            "sortIndex": 0,
            "questionTitle": "age",
            "questionType": "dropdown",
            "questionPrompt": "Please select which category best describes your age.",
            "radioList": [
                {"value": -1, "desc": "Choose one..."},
                {"value": 1, "desc": "18 or younger"},
                {"value": 2, "desc": "19-25"},
                {"value": 3, "desc": "26-30"},
                {"value": 4, "desc": "31-40"},
                {"value": 5, "desc": "41-50"},
                {"value": 6, "desc": "51-60"},
                {"value": 7, "desc": "61-70"},
                {"value": 8, "desc": "71-80"},
                {"value": 9, "desc": "81+"},
            ],
        },
        {
            "qid": 2302,
            "gid": 23,
            "sid": 2,
            "dkrf": false,
            "sortIndex": 1,
            "questionTitle": "gender",
            "questionType": "dropdown",
            "questionPrompt": "Please choose a category which best describes you",
            "radioList": [
                {"value": -1, "desc": "Choose one..."},
                {"value": 1, "desc": "Male"},
                {"value": 2, "desc": "Female"},
                {"value": 3, "desc": "Neither"},
            ],
        },
        {
            "qid": 2303,
            "gid": 23,
            "sid": 2,
            "dkrf": false,
            "sortIndex": 2,
            "questionTitle": "raceeth",
            "questionType": "checkbox",
            "questionPrompt": "Please choose the categories which best describe you",
            "arrayPrompts": [
                "White / Caucasian",
                "Black or African American",
                "Hispanic or Latino",
                "Asian",
                "Native Hawaiian or Other Pacific Islander",
                "American Indian / Alaskan Native"
            ],
            "includeOther": true,
        },
        {
            "qid": 2304,
            "gid": 23,
            "sid": 2,
            "dkrf": false,
            "sortIndex": 4,
            "questionTitle": "educate",
            "questionType": "dropdown",
            "questionPrompt": "Please select which category best describes your level of education.",
            "radioList": [
                {"value": -1, "desc": "Choose one..."},
                {"value": 1, "desc": "Less than high school"},
                {"value": 2, "desc": "High school diploma or equivalent"},
                {"value": 3, "desc": "Some college"},
                {"value": 4, "desc": "College graduate"},
                {"value": 5, "desc": "Graduate degree"},
                {"value": 6, "desc": "Professional Degree"},
            ],
        },
        {
            "qid": 2305,
            "gid": 23,
            "sid": 2,
            "dkrf": false,
            "sortIndex": 4,
            "questionTitle": "occupation",
            "questionType": "dropdown",
            "questionPrompt": "Please select which category best describes your occupation.",
            "radioList": [
                {"value": -1, "desc": "Choose one..."},
                {"value": 1, "desc": "Management"},
                {"value": 2, "desc": "Business or finance"},
                {"value": 3, "desc": "Computer and mathematical"},
                {"value": 4, "desc": "Architecture and engineering"},
                {"value": 5, "desc": "Life, physical, and social science"},
                {"value": 6, "desc": "Community and social services"},
                {"value": 7, "desc": "Legal"},
                {"value": 8, "desc": "Education, training, and library"},
                {"value": 9, "desc": "Arts, design, entertainment, sports, and media"},
                {"value": 10, "desc": "Healthcare practitioners and technical"},
                {"value": 11, "desc": "Healthcare support"},
                {"value": 12, "desc": "Protective service"},
                {"value": 13, "desc": "Food preparation and serving related"},
                {"value": 14, "desc": "Building and grounds cleaning and maintenance"},
                {"value": 15, "desc": "Personal care and service"},
                {"value": 16, "desc": "Sales and related"},
                {"value": 17, "desc": "Office and administrative support"},
                {"value": 18, "desc": "Farming, fishing, and forestry"},
                {"value": 19, "desc": "Construction and extraction"},
                {"value": 20, "desc": "Installation, maintenance, and repair"},
                {"value": 21, "desc": "Production"},
                {"value": 22, "desc": "Transportation and material moving"},
                {"value": 23, "desc": "Military specific"},
            ],
        },
        {
            "qid": 2401,
            "gid": 24,
            "sid": 2,
            "sortIndex": 0,
            "questionTitle": "surveyfeedback",
            "questionType": "longtext",
            "questionPrompt": "<h1>Thanks</h1><p>Do you have any comments about the survey that you would like to send to the researchers? Comments about the questions, the survey software, or any difficulties or good parts you would like to mention?</p>",
        },
        {
            "qid"               : 2501,
            "gid"               : 25,
            "sid"               : 2,
            "sortIndex"         : 2,
            "questionTitle"     : "nameinterpretSliderTest",
            "questionType"      : "nameinterpret",
            "nameList"          : "list1",
            "questionPrompt"    : "<p>How much would you say you need the following people to help you do things?</p><p>This can mean helping with chores, taking care of your children, making you food, or taking you to the hospital.</p><p>Show how much help you need from each person by moving the slider under their name to the right to show more support, or to the left to show less support.</p>",
            "niType"            : "slider",
            "shortPrompt"       : "",
            "sliderOptions"     : {"tooltip":"hide"},
            "arrayPrompts"      : ["How much help do you need from <strong><%= rc.name %></strong>?", 
                                    "How much would you say you get help doing things from <strong><%= rc.name %></strong>?", 
                                    "How much would you say you need information or advice from <strong><%= rc.name %></strong>? This can mean giving you advice, answering questions, giving you information about cancer or treatment or maybe helping you decide what treatment to choose. ",
                                    "How much would you say <strong><%= rc.name %></strong> gives you information or advice?"],
            "sliderSetup"       : [{"step" : 1, "min": {"value": 0,  "desc": "I need little help from this person."}, 
                                   "max": {"value": 10, "desc": "I need a lot of help from this person."}},
                                   {"step" : 1, "min": {"value": 0,  "desc": "I get a little"}, 
                                   "max": {"value": 10, "desc": "I get a lot"}},
                                   {"step" : 1, "min": {"value": 0,  "desc": "I need little advice from this person"}, 
                                   "max": {"value": 10, "desc": "I need a lot of advice from this person"}},
                                   {"step" : 1, "min": {"value": 0,  "desc": "I get little advice from this person"}, 
                                   "max": {"value": 10, "desc": "I need a lot of advice from this person"}}],
            "includeOther"      : false
        },
        {
            "qid"               : 2601,
            "gid"               : 26,
            "sid"               : 2,
            "sortIndex"         : 2,
            "questionTitle"     : "compareSliders",
            "quesitonType"      : "namevaluecompare"
        }
    ];
});
