var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var URL = require("url-parse");
var morgan = require("morgan");
var bodyParser = require("body-parser");

var app = express();
var PORT = process.env.PORT || 3000;


//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//morgan middleware
app.use(morgan("dev"));

var crwaler = require("./routes/crawler");

app.use("/", crwaler);

app.listen(PORT, function () {
    console.log(`server started at port ${PORT}`);
});