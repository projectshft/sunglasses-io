/* eslint-disable no-unused-vars */
/* eslint-disable indent */
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var url = require('url');
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let productsByCategoryId = [];
let users = [];
let user = {};
let cart = [];


const PORT = 3001;

let router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
	res.writeHead(200);
	router(req, res, finalHandler(req, res));
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);
  brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'));
  products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
  user = users [0];
});

router.get('/api/brands', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(brands));
});

router.get('/api/products', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(products));
});

router.get('/api/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(users));
});

router.get('/api/brands/{id}/products', (req, res) => {

  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(products));
});

router.get('/api/brands/{id}/products' , (req, res) => {
  let categoryId = req.params.id;
  let filteredProducts = products.filter((product) => {
    return product.categoryId === categoryId;
  });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(filteredProducts));
});

module.exports = server;



