var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// State holding variables
let brands = [];
let user = {};
let products = [];
let users = [];

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
  });
  
  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
    //populate brands 
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  
    //populate products
    products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
  
    //populate users
    users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
    // hardcode "logged in" user
    user = users[0];
  });

// Notice how much cleaner these endpoint handlers are...
myRouter.get("/api/brands", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
  });

module.exports = server;