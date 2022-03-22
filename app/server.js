var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Brands = require('../initial-data/brands.json')
const Products = require('../initial-data/products.json');

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response))
}).listen(PORT);

router.get("/brands", (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(Brands))
});

router.get("/sunglasses/search", (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end(JSON.stringify(Products))
})


module.exports = server;