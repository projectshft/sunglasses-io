var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
// to parse request bodies
var bodyParser = require('body-parser');
// to generate access tokens
var uid = require('rand-token').uid;

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

// State holding variables
const PORT = 3001;
let brands = [];
let products = [];
let users = [];
const accessTokens = [];

chai.request('http://localhost:3001');
should = chai.should();
chai.use(chaiHttp);  

// Server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

// Setup Router
let myRouter = Router();
myRouter.use(bodyParser.json());

server.listen(PORT, err => {
  if (err) throw err;
  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
});


// test 1 (passing, no err test written):
myRouter.get('/api/brands', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
})



module.exports = server;