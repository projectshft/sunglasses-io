var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
const router = require('router');
router.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    router(request, response, finalHandler(request, response));
}).listen(PORT);
