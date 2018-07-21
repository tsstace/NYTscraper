var express = require('express');
var path = require('path');
var request = require("request");
var cheerio = require("cheerio");
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
            res.render('index', {articles: doc})
        }
    });
});

// When you visit this route, the server will scrape data from the NYT site, and save it to MongoDB
router.get("/scrape", function (req, res) {
    request("https://www.nytimes.com/", function (error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);

        Article.find({}, function (err, doc) {
            if (err) throw err;

            // For each element with a "title" class
            $(".title").each(function (i, element) {
                // Save the text and href of each link enclosed in the current element
                data.title = $(this).find(".title > a").text();
                data.link = $(this).find(".title > a").attr("href");
                data.linkPrev = $(this).find('.title > .sitebit > a > span').text();

                var entry = new Article(data); //doesn't exist in DB
                var inDB = false; //flag 

                if (doc.length > 0) {
                    doc.forEach(function (value) { // Loop through database to find matching article titles
                        if (data.title === value.title) {
                            console.log('Already in DB!');
                            inDB = true;
                        }
                    });
                }

                if (!inDB) { // If there are no matches, save to database
                    entry.save(function (err, doc) {
                        if (err) throw err;
                        console.log(doc);
                    });
                }

            });
        });
    });
    // after scrape, redirect to index
    res.redirect('/articles');
});

// Read and return the notes for an article
router.get('/articles/:id', function (req, res) {
    if (req.params.id) {
        Article
            .findOne({
                '_id': req.params.id
            }) // Match by id
            .populate('note') // Populate with corresponding note
            .exec(function (err, doc) {
                if (err) throw err;

                console.log('GET Note', doc);
                res.json(doc); // Return in JSON format
            });
    }
});

// Create a new note or replace an existing note
router.post("/articles/:id", function (req, res) {

    if (req.params.id) {
        var note = new Note(req.body);

        note.save(function (err, doc) { // Add Note
            if (err) throw err;

            Article
                .findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id }) // Update ID from Article to link to new note
                .exec(function (err, doc) {
                    if (err) throw err;

                    console.log('POST Note', doc);
                    res.json(doc); // Return article data
                })
        });
    }

});

module.exports = router;