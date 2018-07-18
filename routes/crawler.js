var express = require("express")
var request = require("request");
var cheerio = require("cheerio");
var URL = require("url-parse");;
var router = express.Router()


router.post("/", function(req, res){
    var START_URL = [req.body.url];
    var SEARCH_WORD = req.body.search;
    var MAX_PAGES_TO_VISIT = 1000;

    var result = [{
        visitingPage: [],
        maximumLimit: 0,
        relativeLinks: [],
        wordFound: "" 
    }]

    var pagesVisited = {};
    var numPagesVisited = 0;
    var pagesToVisit = [];

    for (links in START_URL) {

        var url = new URL(START_URL[links]);
        var baseUrl = url.protocol + "//" + url.hostname;

        pagesToVisit.push(START_URL[links]);
        crawl();

        function crawl() {
            if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
                console.log(pagesToVisit);
                result[0].maximumLimit = (MAX_PAGES_TO_VISIT - numPagesVisited)
                return res.render("index.html", {
                    data: result[0]
                });
            }
            result[0].maximumLimit = (MAX_PAGES_TO_VISIT - numPagesVisited)
            var nextPage = pagesToVisit.pop();
            if (nextPage in pagesVisited) {
                // We've already visited this page, so repeat the crawl
                crawl();
            } else {
                // New page we haven't visited
                visitPage(nextPage, crawl);
            }
        }

        function visitPage(url, callback) {
            // Add page to our set
            pagesVisited[url] = true;
            numPagesVisited++;

            // Make the request
            result[0].visitingPage.push(url)
            console.log("Visiting page " + url);

            request(url, function (error, response, body) {
                // Check status code (200 is HTTP OK)
                console.log("Status code: " + response.statusCode);
                if (response.statusCode !== 200) {
                    callback();
                    return;
                }
                // Parse the document body
                var $ = cheerio.load(body);
                var isWordFound = searchForWord($, SEARCH_WORD);
                if (isWordFound) {
                    
                    result[0].wordFound += `Word '${SEARCH_WORD}' found at page '${url}'`

                    res.render("index.html", {
                        data: result[0]
                    })

                    console.log(`Word ${SEARCH_WORD} found at page '${url}'`);
                } else {
                    collectInternalLinks($);
                    // In this short program, our callback is just calling crawl()
                    callback();
                }
            });
        }

        function searchForWord($, word) {
            var bodyText = $('html > body').text().toLowerCase();
            return (bodyText.indexOf(word.toLowerCase()) !== -1);
        }

        function collectInternalLinks($) {
            var relativeLinks = $("a[href^='/']");
            console.log("Found " + relativeLinks.length + " relative links on page");
            relativeLinks.each(function () {
                pagesToVisit.push(baseUrl + $(this).attr('href'));
                result[0].relativeLinks.push(baseUrl + $(this).attr('href'))
            });
        }

    }

    
})

router.get("/", function (req, res) {
    res.render("index.html", {
        data: null
    })
});


module.exports = router;