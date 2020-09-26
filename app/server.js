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
let cart = [];
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

  // populate empty brands
  brands_empty = JSON.parse(fs.readFileSync('initial-data/brands_empty.json', 'utf-8'));

  //populate products
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  
  // hard code "logged in" user
  currentUser = users[0];

  //hard code one item in cart
  cart = [products[0]];

});

router.get('/api/brands', (request, response) => {
  // Return all brands in the db
  if (brands.length === 0) {
    response.writeHead(204, "There aren't any brands to return");
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

router.get('/api/brands_empty', (request, response) => {
  // Error if there are no brands
  if (brands_empty.length === 0) {
    response.writeHead(204, "There are no brands to return");
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

router.get('/api/brands/:brandId/products', (request, response) => {
  // Return all products associated with a brand of sunglasses
  const { brandId } = request.params;
  const selectedBrand = [];
  brands.forEach(brand => {
    if (brand.id == brandId) { 
      selectedBrand.push(brand);
    }
  });
  const productsByBrandId = [];
  products.forEach((product) => {
    if (product.categoryId == brandId) {
      productsByBrandId.push(product);
    }
    return productsByBrandId;
  });
    
  if (selectedBrand.length === 0) {
    response.writeHead(204, 'That brand was not found');
    return response.end();
  }  
  if (productsByBrandId.length === 0) {
    response.writeHead(204, 'No products were found for that brand');
    return response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(productsByBrandId));
});

router.get('/api/products/:productId', (request, response) => {
  const { productId } = request.params;
  const productFound = products.find(product => product.name == productId);
  let productToReturn = [];
  productToReturn.push(productFound);

  if (typeof productFound === 'undefined') {
    productToReturn = products;
    response.writeHead(204, "No matching products found. Please search again", { "Content-Type": "application/json" });
    return response.end();
  } else {
  response.writeHead(200, "Product found", { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productToReturn));
  }
});





// router.get("/api/login/:username/:password", (request, response) => {
//   const { username, password } = request.params;
//   currentUser = users.find((user) => user.username === username && user.password === password);
//   if (!currentUser) {
//     response.writeHead(404, "That user does not exist");
//     return response.end();
//   }
//   response.writeHead(200, { "Content-Type": "application/json" });
//   return response.end(JSON.stringify(currentUser));
// });



module.exports = server;
