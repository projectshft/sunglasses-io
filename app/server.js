const http = require("http");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const { findObject } = require("./utils");

// State holding variables
let products = [];
let user = {};
let brands = [];
let users = [];

const PORT = process.env.PORT || 3000;

// Setup router
const router = Router();
router.use(bodyParser.json());

// This function is a bit simpler...
const server = http.createServer((req, res) => {
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
});

// Notice how much cleaner these endpoint handlers are...

//GET ALL PRODUCTS
router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query, sort } = querystring.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter(product => product.description.includes(query));

    if (!productsToReturn) {
      response.writeHead(404, "There aren't any products to return");
      return response.end();
    }
  } else {
    productsToReturn = products;
    // console.log(products);
  }
  if (sort !== undefined) {
    productsToReturn.sort((a, b) => a[sort] - b[sort]);
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  // console.log(JSON.stringify(productsToReturn));
  return response.end(JSON.stringify(productsToReturn));
});

router.get("/api/me", (request, response) => {
  if (!user) {
    response.writeHead(404, "That user does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user));
});

//GET ALL brands
router.get("/api/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query, sort } = querystring.parse(parsedUrl.query);
  let brandsToReturn = [];
  if (query !== undefined) {
    brandsToReturn = brands.filter(brand =>
      brand.name.includes(query)
    );

    if (!brandsToReturn) {
      response.writeHead(404, "There aren't any products to return");
      return response.end();
    }
  } else {
    brandsToReturn = brands;
  }
  if (sort !== undefined) {
    brandsToReturn.sort((a, b) => a[sort] - b[sort]);
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

//GET ALL productS IN brand
router.get("/api/brands/:id/products", (request, response) => {
  const { brandId } = request.params;
  const brand = findObject(brandId, brands);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedproducts = brands.filter(
    brand => brand.id === brandId
  );
  return response.end(JSON.stringify(relatedproducts));
});

//USERNAME
router.post("/api/login", (request, response) => {
  var login = request.body;
  console.log(login);
  if (!login) {
    response.writeHead(404, "That username does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(login));
});

//GET ALL PRODUCTS IN BRANDS

router.get("/api/me/cart", (request, response) => {
  const { cart } = request.params;
  if (!cart) {
    response.writeHead(404, "That is not in the cart");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = brands.filter(
    me => me.id === id
  );
  return response.end(JSON.stringify(relatedProducts));
});

// Cart Items
router.post("/api/me/cart", (request, response) => {
  var cart = request.body;
  console.log(cart);
  if (!cart) {
    response.writeHead(404, "That item is not in cart");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
});

router.delete("api/me/cart/:productId", (request, response) => {
  console.log(cart);
  if (!cart) {
    response.writeHead(404, "That item is not in cart");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
});

//USER ACCEPT A SPECIFIC PRODUCT
router.post("/api/me/cart/:productId", (request, response) => {
  const { productId } = request.params;
  const cart = findObject(productId, cart);
  if (!cart) {
    response.writeHead(404, "That product is not in the cart");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedproducts = products.filter(
    product => product.id === productId
  );
  user.cart.push(cart);
  return response.end(JSON.stringify(productId));
});


module.exports = server;
