/**
 * Created by nbakshi on 24/06/2015.
 */
var db = require('./db_operations');

exports.login = function (user, callback) {
    var stmt = "SELECT * from Y_ACCOUNT Where EMAIL = :email ";
    var data = [user.email]
    db.select(stmt,data,callback);
}

exports.updateOrganizer = function(user, callback) {
    var stmt = "BEGIN " +
        "update Y_ACC_ORGANISER " +
        "SET TELEPHONE= :telephone, " +
        "MOBILE= :mobile " +
        "where ACC_ID = :user_id; " +
        "if sql%rowcount = 0 then " +
        "INSERT INTO Y_ACC_ORGANISER " +
        "(ACC_ID,TELEPHONE,MOBILE) " +
        "VALUES " +
        "(:user_id,:telephone,:mobile); " +
        "end if; " +
        "COMMIT; " +
        "END; ";
    var data = {user_id: user.id, telephone: user.telephone, mobile: user.mobile};
    db.insertUpdate(stmt, data, callback);
};

exports.checkOrganizer = function(user, callback) {
    var stmt = "SELECT * from Y_ACC_ORGANISER WHERE ACC_ID = :user_id";
    var data = {user_id: user.id};
    db.select(stmt, data, callback);
};

exports.signup = function (user, callback) {
    var stmt = "DECLARE pkey NUMBER; " +
        "BEGIN " +
        "INSERT INTO Y_ACCOUNT " +
        "(FIRST_NAME,LAST_NAME,EMAIL,PASSWORD,LAST_LOGON_TIME) " +
        "VALUES " +
        "(:first,:last,:email,:pass,CURRENT_TIMESTAMP) " +
        "Returning ID into pkey; " +
        "INSERT INTO Y_ACC_USER " +
        "(ACC_ID,SPECIAL_NEEDS,PREFERRED_TRAVEL_MODE,TEAM_ID) " +
        "VALUES " +
        "(pkey,'none','unspecfied',1); " +
        "COMMIT; " +
        "END;";
    var data = [user.first, user.last, user.email, user.password];
    db.insertUpdate(stmt, data, callback);
};

exports.getEventsForUser = function(user,callback) {
    var stmt = "SELECT * from Y_EVENT " +
        "Where ORGANISER_ID = :orgID";
    var data = {orgID: user.orgID};
    db.select(stmt, data, callback);
};