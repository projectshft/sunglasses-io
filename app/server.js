var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser  = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;
const { findProductOrBrand } = require("./utils");

// State holding variables
let brands = [];
let products = [];
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

//GET all brands from the store
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

//GET all products by brand id from the store
router.get("/api/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  const brand = findProductOrBrand(brandId, brands);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const brandProducts = products.filter(
    product => product.categoryId === brandId
  );
  return response.end(JSON.stringify(brandProducts));
});

//GET products from the store based on a query string

router.get('/api/products', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products))
});

module.exports = server