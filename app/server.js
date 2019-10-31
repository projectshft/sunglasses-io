var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, () => {
  // Load dummy data into server memory for serving
  brands = JSON.parse(fs.readFileSync("brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("products.json", "utf-8"));
  // Load all users into users array and for now hardcode the first user to be "logged in"
  users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
  user = users[0];
});