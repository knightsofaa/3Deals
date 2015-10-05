/**
 * Created by nbakshi on 24/06/2015.
 */
var db = require('./db_operations');

exports.createEvent = function(event, callback) {
    var stmt = "BEGIN "+
        "INSERT INTO Y_EVENT "+
        "(NAME,START_DATE,END_DATE,ORGANISER_ID,DESCRIPTION,EVENT_CODE,MARKETING_CODE,CANCELLED_DATE,DEFFERED_DATE) "+
        "VALUES "+
        "(:name,TO_DATE(:start_date, 'yyyy/mm/dd hh24:mi:ss'), TO_DATE(:end_date, 'yyyy/mm/dd hh24:mi:ss'),:org_id,"+
        ":description,:event_code,:marketing_code,TO_DATE(:cancel_date, 'yyyy/mm/dd hh24:mi:ss'),TO_DATE(:deffer_date, 'yyyy/mm/dd hh24:mi:ss')); "+
        "COMMIT; "+
        "END;"
    var data = {name: event.name, start_date: event.start_date, end_date: event.end_date, org_id: event.org_id,
        description: event.description, event_code: event.event_code, marketing_code: event.marketing_code,
        cancel_date: event.cancel_date, deffer_date: event.deffer_date};
    db.insertUpdate(stmt, data, callback);
};

exports.getAllEvents = function(callback) {
    var stmt = "SELECT * from Y_EVENT";
    var data = {};
    db.select(stmt, data, callback);
};