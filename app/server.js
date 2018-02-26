var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

var brands;
fs.readFile('brands.json', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
  // brand = brands[0];
});
var products;
fs.readFile('products.json', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
  // brand = brands[0];
});
var users;
fs.readFile('users.json', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  // brand = brands[0];
});

http.createServer(function (req, res) {
  myRouter(req, res, finalHandler(req, res));
}).listen(PORT);
console.log("Server is listening...");

