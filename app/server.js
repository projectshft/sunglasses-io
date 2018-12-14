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
   response.writeHead(200);
   router(request, response, finalHandler(request, response));
});

server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
    //populate brands
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
    //populate products
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
    //populate users
    users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
    //hardcoded user
    user = users[0];
});

router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(brands));
});

module.exports = server