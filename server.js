// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var app = express();

 var db = mongoose.connection;
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', function() {
   console.log('Connected to Mongoose')
 });

 app.use(express.static("public"));


app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//use the controller for all of the routes
var routes = require('./controller/controller.js');

//establish Mongoose in connection.js
var connection = require('./config/connection.js');
app.use(routes);

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoNYT";
mongoose.connect(MONGODB_URI);

// Listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});