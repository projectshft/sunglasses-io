const http = require('http');
var fs = require('fs');
const finalHandler = require('finalhandler');
var queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);