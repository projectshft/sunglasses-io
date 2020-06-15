var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// State holding variables

let brands = [];
let products = [];
let user = {};
let users = [];

const PORT = 3001;

http.createServer(function (request, response) {

}).listen(PORT);