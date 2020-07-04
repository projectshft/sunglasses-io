  
const http = require("http");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
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

const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
})

server.listen(PORT, err => {
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


myRouter.get('/brands', (req, res) => {

  const parsedUrl = url.parse(req.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  // Return all brands in the db

  let brandsToReturn = [];

  if (!query) {
    brandsToReturn = brands;
  } else {
    brands.map((brand) => {
      // standardizing all queries by going to lowercase
      if (brand.name === query) {
        brandsToReturn.push(brand);
      }
    })
  }

  if (brandsToReturn.length === 0) {
    res.writeHead(404, "There are no matching brands for your search");
    return err;
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(brandsToReturn));
  }
});


// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId

module.exports = server;