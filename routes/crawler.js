var express = require("express");
var router = express.Router();
var boom = require("boom")


router.get("/", function (req, res) {
    var START_URL = ["https://storybook-nodejs.herokuapp.com/"];
    var SEARCH_WORD = "arpit";
    var MAX_PAGES_TO_VISIT = 10;

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
                return boom.entityTooLarge("Reached max limit of number of pages to visit.")
                return;
            }
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
            return {"Visiting page ": url};
            request(url, function (error, response, body) {
                // Check status code (200 is HTTP OK)
                if (response.statusCode !== 200) {
                    callback();
                    return;
                }
                // Parse the document body
                var $ = cheerio.load(body);
                var isWordFound = searchForWord($, SEARCH_WORD);
                if (isWordFound) {
                    return {
                        statusCode: response.statusCode,
                        data: `Word ${SEARCH_WORD} found at page ${url}`
                    }
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
            });
        }

    }

});


module.exports = router;