var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// Setup router
var myRouter = Router();
//makes it so router uses middleware bodyParser to parse body to json
myRouter.use(bodyParser.json());

// variable value for 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

server = http.createServer(function (request, response) {
  //handle error
  if (error) {
    return console.log("Error on Server Startup: ", error);
  };


}).listen(PORT);