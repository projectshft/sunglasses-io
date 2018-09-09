var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// State holding variables
var products = [];
var user = {};
var users = [];
var brands = [];



// file system
fs.readFile('products.json', 'utf8', (err, data) => {
    if (err) throw err;
    products = JSON.parse(data);
  });
  
fs.readFile('categories.json', 'utf8', (err, data) => {
    if (err) throw err;
    brands = JSON.parse(data);
  });
  
fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) throw err;
    user = JSON.parse(data);
    users = user[0];
  });



// Router setup
var myRouter = Router();
myRouter.use(bodyParser.json());

// Create server
http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

// list main endpoints
myRouter.get('/api/products', function(request,response) {
    response.end(JSON.stringify(products));
  });

myRouter.get('/api/brands', function(request,response) {
  response.end(JSON.stringify(brands));
});

myRouter.get('/api/me', function(request,response) {
  response.end(JSON.stringify(user));
});