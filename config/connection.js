var mongoose = require("mongoose");

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/nytscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

module.exports = db;