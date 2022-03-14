var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Product = require('../models/products.js');
const Brand = require('../models/brands.js');
const User = require('../models/users.js');

const sampleToken = require('../data/uids');
let accessTokenList = [sampleToken];

const myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
})

server.listen(PORT, () => {
  User.load();
  Product.load();
  Brand.load();
});

myRouter.get('/api/sunglasses', (request, response) => {

});

myRouter.get('/api/sunglasses/:glassId', (request, response) => {

});

myRouter.get('/api/brands', (request, response) => {

});

myRouter.get('/api/brands/:brandId/sunglasses', (request, response) => {

});

myRouter.post('/api/login', (request, response) => {

});

myRouter.get('/api/me/cart', (request, response) => {

});

myRouter.post('/api/me/cart/:glassId/add', (request, response) => {

});

myRouter.delete('/api/me/cart/:glassId/remove', (request, response) => {
  
});

myRouter.post('/api/me/cart/:glassId/update', (request, response) => {
  
});

module.exports = server;