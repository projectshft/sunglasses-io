var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var querystring = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
});

server.listen(3001, err => {
  if (err) throw err;
  console.log("server running on port 3001");

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
});

router.get("/v1/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let brandsToReturn = [];
  if (query !== undefined) {
    brandsToReturn = brands.filter(brand =>
      brand.name.includes(query)

    );
    if (!brandsToReturn) {
      response.writeHead(404, "There aren't any brands to return");
      return response.end();
    }
  } else {
    brandsToReturn = brands;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

module.exports = server;