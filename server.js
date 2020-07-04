var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser  = require('body-parser');
var uid = require('rand-token').uid;

//const Brand = require('./app/models/brand')

// State holding variables
let brands = [];
let user = {};
let products = [];
let users = [];

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (req, res) {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
}).listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate categories  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate goals
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  // hardcode "logged in" user
  user = users[0];
});


myRouter.get('/brands', function(rep, res) {
  // Return all brands in the db
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
});

module.exports = server;