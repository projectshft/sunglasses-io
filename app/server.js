var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(3001, () => {
    // Load all the brands from thr brands JSON file 
    brands = JSON.parse(fs.readFileSync("brands.json", "utf-8"));
});

export.