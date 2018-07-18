var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");

var app = express();
var PORT = process.env.PORT || 3000;


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

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