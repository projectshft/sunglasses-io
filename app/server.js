var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//variables to act as a 'database'
let sunglasses = [];
let categories = [];
let user = [] //also may be the cart, unsure just yet

//read the files so I actually have data to work with

fs.readFile('./initial-data/products.json', 'utf-8', (error, data) => {
  if(error) throw error;
  sunglasses = JSON.parse(data)
})

//set up the router

const PORT = 3001;

const myRouter = Router();
myRouter.use(bodyParser.json());

// This function is a bit simpler...
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, error => {

  console.log(`Running on port ${PORT}`);
});

myRouter.get('/', (req,res) => {
  res.end("hi")
})

myRouter.get('/v1/sunglasses', (req, res) => {
  res.writeHead(200, {'Content-type': 'application/json'})
  res.end(JSON.stringify(sunglasses))
})

module.exports = server;