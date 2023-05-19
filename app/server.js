var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const baseUrl = 'https://api.sunglasses.com/v1';

//set up router 
var myRouter = Router(); 
myRouter.use(bodyParser.json());

const PORT = 3001;

http.createServer(function (request, response) {

}).listen(PORT);