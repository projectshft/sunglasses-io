var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//state holding variables
let brands = [];
let users = [];
let user = {};
let products = [];

const PORT = process.env.PORT || 8080;

//setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//setup server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

  users = JSON. parse(fs.readFileSync("initial-data/users.json", "utf-8"));

  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
});

myRouter.get('/brands', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
})

module.exports = server;