var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser  = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;

// State holding variables
let brands = [];
let products = {};
let users = [];

const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
   res.writeHead(200);
   router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
   if (err) throw err;
   console.log(`server running on port ${PORT}`);
   //populate brands
   fs.readFile("initial-data/brands.json", "utf-8", (err, data) => {
     if (err) throw err;
     brands = JSON.parse(data);
   });
   //populate products
   fs.readFile("initial-data/products.json", "utf-8", (err, data) => {
     if (err) throw err;
     products = JSON.parse(data);
   });
   //populate users
   fs.readFile("initial-data/users.json", "utf-8", (err, data) => {
     if (err) throw err;
     users = JSON.parse(data);
     //hardcoded user
     user = users[0];
   });
})