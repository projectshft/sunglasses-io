var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

//state holding variables 
var brands = [];
var products = [];
var users = {};

const PORT = 3001;

var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  // Load dummy data into server memory for serving
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  // Load all users into users array and for now hardcode the first user to be "logged in"
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  user = users[0];
});

//get all brands
myRouter.get('/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
});

//export the server so that tests can be written
module.exports = server