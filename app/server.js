var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//server settings
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;
const myRouter = Router();

//data
let brands = [];
let products = [];
let users = [];

const server = http.createServer(function (request, response) {
  //handle CORS preflight request
  if (request.method === 'OPTIONS') {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, err => {
  //check for error
  if (err) {
    return console.log(`Error on server startup: ${err}`);
  }
  //initialize server data from files
  fs.readFile('initial-data/brands.json', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    brands = JSON.parse(data);
    console.log(`Server initialization: ${brands.length} brands loaded`);
  });
});

myRouter.get('/brands', (request, response) => {
  response.writeHead(200, CORS_HEADERS);
  return response.end();
});

//export for testing
module.exports = server;