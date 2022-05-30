var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

let brands = [];
let products = [];
let users = [];

http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
}).listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
});


