/* eslint-disable no-unused-vars */
/* eslint-disable indent */
const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const url = require('url');
const uid = require('rand-token').uid;


let brands = [];
let products = [];
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
  brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf-8'));
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




module.export = server;



