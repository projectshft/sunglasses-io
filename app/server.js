var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 4001;

let users = [];
let products = [];
let brands = [];
let user = {};

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, (err) => {
  if (err) {
    return console.log('error')
  } else {
    console.log('server is running on port' + PORT);
    products = JSON.parse(fs.readFileSync('inital-data/products.json', 'utf-8'));
    brands = JSON.parse(fs.readFileSync('inital-data/brands.json', 'utf-8'));
    users = JSON.parse(fs.readFileSync('inital-data/users.json', 'utf-8'));

  }
});

