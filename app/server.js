var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const hostname = 'localhost';
const PORT = 3001;

//State holding variables
var brands = [];
var products = [];
var users = [];
var user = {};

//Router set up
var myRouter = Router();
myRouter.use(bodyParser.json());


const server = module.exports = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  //load data from files into server memory
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'));
  user = users[0];
});

myRouter.get('/api/brands', function(request, response){
  response.writeHead(200);
  return response.end(JSON.stringify(brands));
})