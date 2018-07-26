var express = require('express');
var path = require('path');
var request = require("request");
var cheerio = require("cheerio");
var logger = require("morgan");
var router = require('express').Router();

//Require models
var Note = require('../models/Note.js');
var Article = require('../models/Article.js');


// Main route (redirect to index)
router.get("/", function (req, res) {
    res.redirect('/articles');
});

// This route will retrieve all of the data from the scrapedData collection
router.get("/articles", function (req, res) {
    Article.find(function (error, doc) {
        if (error) {
            console.log(error);
        } else {
            res.render('index', {
                articles: doc
            })
        }
    });
});

// When you visit this route, the server will scrape data from the NYT site, and save it to MongoDB
router.get("/scrape", function (req, res) {
    request("https://www.nytimes.com/section/business", function (error, response, html) {

    console.log("I am in the scrape route");

        // Load the html body from request into cheerio
        var $ = cheerio.load(html);

        // An empty array to save the data that we'll scrape
        var resultsArray = [];

        // For each element with a "title" class
        $(".h2.story-heading").each(function (i, element) {
             // Save an empty result object
             var result = {};
            //
            // result.link = $(element).find("a").attr("href");
            // result.title = $(element).find("h2.headline").text().trim();
            // result.summary = $(element).find("p.summary").text().trim();

            result.link = $(this).children('a').attr('href');
            result.title = $(this).children('h2.headline').text().trim();
            console.log(result.title);

            //ensures that no empty title or links are sent to mongodb
            if(result.title !== "" && result.link !== ""){
                //check for duplicates
                if(resultsArray.indexOf(result.title) == -1){
  
                  // push the saved title to the array 
                  resultsArray.push(result.title);
  
                  // only add the article if is not already there
                  Article.count({ title: result.title}, function (err, test){
                      //if the test is 0, the entry is unique and good to save
                    if(test == 0){
  
                      //using Article model, create new object
                      var entry = new Article (result);
  
                      //save entry to mongodb
                      entry.save(function(err, doc) {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log(doc);
                        }
                      });
  
                    }
              });
          }
          // Log that scrape is working, just the content was missing parts
          else{
            console.log('Article already exists.')
          }
  
            }
            // Log that scrape is working, just the content was missing parts
            else{
              console.log('Not saved to DB, missing data')
            }
          });
          // after scrape, redirects to index
          res.redirect('/');
      });
  });

//this will grab every article and populate the DOM
router.get('/articles', function(req, res) {
    //allows newer articles to be on top
    Article.find().sort({_id: -1})
        //send to handlebars
        .exec(function(err, doc) {
            if(err){
                console.log(err);
            } else{
                var artcl = {article: doc};
                res.render('index', artcl);
            }
    });
});

// This will get the articles we scraped from the mongoDB in JSON
router.get('/articles-json', function(req, res) {
    Article.find({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

//clear all articles for testing purposes
// router.get('/clearAll', function(req, res) {
//     Article.remove({}, function(err, doc) {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log('removed all articles');
//         }
//
//     });
//     res.redirect('/articles-json');
// });

router.get('/readArticle/:id', function(req, res){
  var articleId = req.params.id;
  var sasObj = {
    article: [],
    body: []
  };

    // //find the article based on id
    Article.findOne({ _id: articleId })
      .populate('note')
      .exec(function(err, doc){
      if(err){
        console.log('Error: ' + err);
      } else {
        sasObj.article = doc;
        var link = doc.link;
        //grab article from link
        request(link, function(error, response, html) {
          var $ = cheerio.load(html);

          $('.l-col__main').each(function(i, element){
            sasObj.body = $(this).children('.c-entry-content').children('p').text();
            //send article body and notes to article.handlbars through hbObj
            res.render('article', sasObj);
            //prevents loop through so it doesn't return an empty sasObj.body
            return false;
          });
        });
      }

    });
});

// Create a new note
router.post('/note/:id', function(req, res) {
  var user = req.body.name;
  var content = req.body.note;
  var articleId = req.params.id;

  //submitted form
  var noteObj = {
    name: user,
    body: content
  };
 
  //using the Note model, create a new note
  var newNote = new Note(noteObj);

  newNote.save(function(err, doc) {
      if (err) {
          console.log(err);
      } else {
          console.log(doc._id)
          console.log(articleId)
          Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {'note':doc._id}}, {new: true})
            //execute everything
            .exec(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/readArticle/' + articleId);
                }
            });
        }
  });
});

module.exports = router;