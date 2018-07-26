// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var app = express();
app.use(express.static("public"));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

var databaseUrl = 'mongodb://localhost/nyt';
mongoose.connect('mongodb://localhost/nyt');

//var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoNYT";
//mongoose.connect(MONGODB_URI);
//console.log(process.env.MONGODB_URI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to Mongoose')
});

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


//use the controller for all of the routes
var routes = require('./controller/controller.js');
app.use(routes);

// Listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});

//establish Mongoose in connection.js
//var connection = require('./config/connection.js');