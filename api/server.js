var port = process.env.PORT;
console.log('using port ' + port)

// Include Express
var express = require('express');

var bodyParser = require('body-parser');

var expressValidator = require('express-validator');

//include user controller
var user = require('./controller/user');
var events = require('./controller/events');

//include db methods
var db = require('./model/db_operations');

//include for authentication token
//npm install express-jwt --save
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var secret = 'Dontsharethiss3cr37LOL';
exports.secret=secret;

// Create a new Express application
var app = express();
// parse application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());


//use jwt auth token to authenticate all routes except login and signup
app.use(expressJwt({ secret: secret}).unless({path: ['/api/login','/api/signup']}));

// if invalid jwt token is given on routes that are authenticated, return this error
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token');
  }
});

//allow cross origin requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//test if it all works so far
//todo probably should remove this later
app.get('/', function (req, res) {
    res.json({message: 'hello'});
});

// assign methods to url paths here, store methods in the controller folder!
app.post('/api/login', user.login);

app.post('/api/signup', user.signup);

app.post('/api/user/organizer', user.updateOrganizer);

app.get('/api/user/organizer', user.checkOrganizer);

app.get('/api/user/events', user.getEventsForUser);

app.post('/api/events', events.createEvent);

app.get('/api/events', events.getAllEvents);

//test jwt auth and see if auth works and details are retrieved
//todo probably should remove later!
app.get('/api/restricted', function (req, res) {
  console.log('user ' + req.user.email + ' is calling /api/restricted');
  res.json({
    name: 'foo',
    message: 'hello '+req.user.email,
    details: req.user
  });
});

//initialize database then finish starting up the app once it's done
db.initialize( function(){
  // Bind to a port
  app.listen(port);
  //the app is now running and listening for requests if we made it this far
  console.log('Worker  running!');


});

