//user model and database methods
var db_user = require("../model/db_user");
var server = require("../server");
//passport for authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');

//auth token
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// use this for login authentication
// Look for email and password in the request json for authentication!
//passport config for login
passport.use(new LocalStrategy({ usernameField: 'email' },
  function(email, password, done) {
      //console.log(email);
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // Find the user by email.  If there is no user with the given
      // email, or the password is not correct, set the user to `false` to
      // indicate failure and send an error message.  Otherwise, return the
      // authenticated `user`.
        var user = new Object();
        user.email=email;
        password;
        db_user.login(user,function(rows){
            if(rows[0]){
                //success
                if (!bcrypt.compareSync(password, rows[0].PASSWORD) ) {
                    return done(null, false, { message: 'Incorrect password' });
                }
                user.id=rows[0].ID;
                user.firstname=rows[0].FIRST_NAME;
                user.lastname=rows[0].LAST_NAME;

            }else{
                //error
                return done(null, false, { message: 'Unknown user ' + email });
            }
            return done(null, user);
        });
      });

  }
));

//login method
exports.login = function(req, res, next) {
    //auth with passport
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.json({success: false, message: info.message}); }
        //success
        //auth token to be sent
        //token will expire after many many minutes for security reasons
        //todo create a secure persistent session system so users don't have to relogin
        //todo don't just make this token never expire lol, will end badly security wise
        var token = jwt.sign(user, server.secret, { expiresInMinutes: 60*5 });
        res.json({success: true, auth: token});
        
  })(req, res, next);
};

//signup method
exports.signup = function(req, res, next) {

    //validate then create user from info passed in request

    req.assert('firstname','first must be valid name consisting of atleast 2 letters (a-zA-Z)').isAlpha().len(2);
    req.assert('lastname','last must be valid name consisting of atleast 2 letters (a-zA-Z)').isAlpha().len(2);
    req.assert('email','email must be valid email').isEmail();
    //todo make validation include symbols (some other check or a custom check with regex)
    req.assert('password','password must be alphanumeric (no symbols...yet!) and have atleast 4 characters').isAlphanumeric().len(4);

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json({success:false, errors: errors});
        return;
    }

    //get data
    var user = {
        first:req.body.firstname,
        last:req.body.lastname,
        email:req.body.email
    };

    //hash passwords to store then check if passwords are equal on login
    user.password= bcrypt.hashSync(req.body.password, 8);
    console.log(user);

    //check if user exists and error out if they do
    db_user.login(user,function(rows){
        if(rows[0]){
            console.log(rows);
            res.json({success: false, message: 'Email already taken'});
        } else{
            //yay, create the user
            console.log('We can Create the user');
            db_user.signup(user, function(){
                //signup success
                //todo whatif the database fails?
                //todo integrat the login functionality into signup so we don't have to do multiple calls?
                res.json({success: true, user: user});
            });

        }
    });
};

//become organiser method
exports.updateOrganizer = function(req, res, next) {

    //validate then create user from info passed in request

    req.assert('telephone','telephone must be valid phone consisting of 8 or more characters').len(8);
    req.assert('mobile','mobile must be valid mobile number with no spaces or dashes').isMobilePhone('en-AU');

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json({success:false, errors: errors});
        return;
    }

    //get data
    var user = {
        id:req.user.id,
        telephone:req.body.telephone,
        mobile:req.body.mobile
    };

    db_user.updateOrganizer(user, function(){
        console.log('update success');
        //don't show id
        delete user.id;
        res.json({success:true, organizer: user});
    });
};

//check Organiser
exports.checkOrganizer = function(req, res, next) {

    //get user from info passed in request/processed by jwt token
    var user= req.user;

    db_user.checkOrganizer(user, function(rows){
        console.log('check success');
        //don't show id
        if(rows[0]){
            console.log(rows);
            res.json({success: true, message: rows[0]});
        }else{
            res.json({success:false, message: "User is not an Organiser"});
        }
    });
};

//check Organiser
exports.getEventsForUser = function(req, res, next) {

    //check if user exists and error out if they do
    db_user.checkOrganizer(req.user, function(rows){
        console.log('is user an organiser');
        if(rows[0]){

            var orgID = rows[0].ID;
            console.log('orgID is '+orgID);
            var user = {
                orgID:orgID
            };

            db_user.getEventsForUser(user, function(rows){
                console.log('check success');
                //don't show id
                if(rows[0]){
                    console.log(rows);
                    res.json({success: true, events: rows});
                }else{
                    res.json({success:false, message: "No events"});
                }
            });
        } else{
            //user isn't organiser
            res.json({success: false, message: 'user owns no events because user is not an organiser'});
        }
    });

};

