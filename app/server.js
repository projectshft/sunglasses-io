const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;
const myRouter = Router();

const CORS_HEADERS = {
    "Access-Control-Allow-Origin":"*"
  ,"Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"
  };

http.createServer(function (request, response) {

}).listen(PORT);

