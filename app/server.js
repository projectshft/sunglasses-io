var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

const VALID_API_KEYS = ["4b425343-82c8-4f8f-a44c-c86263e360e2", "eeee3997-d7c1-4814-939f-04eca8c9977e"];

// State holding variables
var brands = [];
var products = [];
var users = [];
var accessTokens = [];


// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {

}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} users loaded`);
  });
  fs.readFile('users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/api/brands', (request, response) => {

});

myRouter.get('/api/brands/:id/products', (request, response) => {

});

myRouter.get('/api/products', (request, response) => {

});

myRouter.post('/api/login', (request, response) => {

});

myRouter.get('/api/me/cart', (request, response) => {

});

myRouter.post('/api/me/cart', (request, response) => {

});

myRouter.delete('/api/me/cart/:productId', (request, response) => {

});

myRouter.post('/api/me/cart/:productId', (request, response) => {

});