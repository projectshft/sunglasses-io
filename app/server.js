const http = require('http');
const fs = require('fs');
const url = require('url');
const finalHandler = require('finalhandler');
var queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
// var uid = require('rand-token').uid;

//state holding variables
let brands = [];
let products = [];
let users = [];
let currentUser = {};

const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response));
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  // populate brands
  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));

  // //populate products
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));

  // //populate users
  // users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  // // hard code "logged in" user
  // user = users[0];
});

router.get('/api/brands', function (request, response) {
  // Return all brands in the db
  if (!brands) {
    response.writeHead(404, "There aren't any brands to return");
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});



router.get('/api/products/:productId', function (request, response) {
  const { productId } = request.params;
  const productFound = products.find(product => product.name == productId);
  let productToReturn = [];
  productToReturn.push(productFound);

  if (typeof productFound === 'undefined') {
    productToReturn = products;
    response.writeHead(200, "No specific product found. All products displayed.", { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productToReturn));
  } else {
  response.writeHead(200, "Product found", { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productToReturn))
  };
});




router.get('/api/brands/:id/products', function (request, response) {
  // Return all products associated with a brand of sunglasses
  const { brandId } = request.params;
  const brand = brands.find((brand) => brand.id == brandId);
  if (!brands) {
    response.writeHead(404, 'That brand was not found');
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});


router.get("/api/login/:username/:password", (request, response) => {
  if (!user) {
    response.writeHead(404, "That user does not exist");
    return response.end();
  }
  //set as current user
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user));
});



module.exports = server;
