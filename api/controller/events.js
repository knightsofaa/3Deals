/**
 * Created by nbakshi on 26/06/2015.
 */
var db_events = require('../model/db_events');
var db_user = require("../model/db_user");

//signup method
exports.createEvent = function(req, res, next) {

    //validate then create event from info passed in request

    req.assert('name','name must be valid name consisting of atleast 2 alphanumerics (a-zA-Z)').isAlphanumeric().len(2);
    req.assert('start_date','start_date is a valid date').isDate();
    req.assert('end_date','end_date is a valid date').isDate();
    req.assert('description','description must contain ascii characters').isAscii();

    req.assert('cancel_date','cancel_date is an optional valid date').optional().isDate();
    req.assert('deffer_date','deffer_date is an optional valid date').optional().isDate();

    req.assert('event_code','event_code is an optional alphanumeric').optional().isAlphanumeric();
    req.assert('marketing_code','marketing_code is an optional alphanumeric').optional().isAlphanumeric();


    var errors = req.validationErrors();
    if(errors){
        res.status(422).json({success:false, errors: errors});
        return;
    }

    //make sure start_date is valid first!!!!
    //check if end date come after the start date, separate error message, check and response
    req.assert('end_date','end_date must come after start_date').isAfter(req.body.start_date);

    //check stuff for cancel and deffer dates //todo figure out when they're valid
    //req.assert('cancel_date','cancel_date comes after start_date').optional().isBefore(req.body.start_date);
    //req.assert('deffer_date','deffer_date comes after start_date').optional().isBefore(req.body.start_date);

    errors = req.validationErrors();
    if(errors){
        res.status(422).json({success:false, errors: errors});
        return;
    }

    //get data
    var event = {
        name:req.body.name,
        start_date:req.body.start_date,
        end_date:req.body.end_date,
        description:req.body.description,
        cancel_date: undefinedToNull(req.body.cancel_date),
        deffer_date: undefinedToNull(req.body.deffer_date),
        event_code: undefinedToNull(req.body.event_code),
        marketing_code: undefinedToNull(req.body.marketing_code)
    };


    //check if user exists and error out if they do
    db_user.checkOrganizer(req.user, function(rows){
        console.log('is user an organiser');
        if(rows[0]){

            var orgID = rows[0].ID;
            console.log('org id is '+orgID);
            event.org_id=orgID;
            //test
            /*var userTest = {name: 'test', start_date: '2015/06/27 21:02:44', end_date: '2015/06/27 22:02:44', org_id: 50,
                description: 'This is great', event_code: null, marketing_code: null,
                cancel_date: null, deffer_date: null};*/

            db_events.createEvent(event,function(){
                console.log('success');
                res.json({success: true, event: event});
            })
        } else{
            //user isn't organiser
            res.json({success: false, message: 'user is not an organiser'});
        }
    });
};

//check Organiser
exports.getAllEvents = function(req, res, next) {


    db_events.getAllEvents( function(rows){
        console.log('check success');
        //don't show id
        if(rows[0]){
            console.log(rows);
            res.json({success: true, events: rows});
        }else{
            res.json({success:false, message: "No events"});
        }
    });
};

function undefinedToNull(bodyVar){
    if(bodyVar == undefined){
        return null;
    } else{
        return bodyVar;
    }
}
