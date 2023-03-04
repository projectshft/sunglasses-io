const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;

//  local state variables to store data (in place of database)
let brands = [];
let products = [];
let users = [];
let user;
let userAuth = false; // dummy auth until we learn passport

// Setup Router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Setup Server
const server = http.createServer(function (request, response) {  
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (!error) {
    console.log(`Server running on ${PORT}`)
  } else {
    return console.log("Error on Server Startup: ", error);
  }

  // Load Data
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
  });
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });

});

// Define Routes
myRouter.get("/", (request, response) => {
  response.end("This is the root endpoint, nothing to see here.");
});

// GET Brands
myRouter.get('/api/brands', (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404, "No brands found");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(brands));
  }
});

// GET Products by Brand
myRouter.get('/api/brands/:id/products', (request, response) => {
  let brand = brands.find((brand) => {
    return brand.id === request.params.id
  })
  let productsByBrand = products.filter(p => p.categoryId === brand.id);
  if (productsByBrand.length === 0) {
    response.writeHead(404, "No products found");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(productsByBrand));
  }
});

// GET all Products
myRouter.get('/api/products', (request, response) => {
  if (products.length === 0) {
    response.writeHead(404, "No products found");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(products));
  }
});

// POST User Login
myRouter.post('/api/login', (request, response) => {
  if (request.body.username && request.body.password) {
    user = users.find(user => {
      return user.login.username === request.body.username && user.login.password === request.body.password;
    });
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      userAuth = true;
      response.end();
    }
  } else {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
});

// GET User Cart
myRouter.get('/api/me/cart', (request, response) => {
  if (userAuth) {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(user.cart));
  } else {
    response.writeHead(401, "user not authenticated");
    return response.end();
  }
});

// POST Add to Cart
myRouter.post('/api/me/cart/add/:productId', (request, response) => {
  const productId = request.params.productId;
  const product = products.find(product => product.id === productId);
  user = users[0] // hard coded for simplicity for now.
  userAuth = true;
  if (userAuth) {
    if (product) {
      user.cart.push(product);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: "Product not found" }));
    }
  } else {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
});

// POST Update Cart Quantity
myRouter.post('/api/me/cart/update/:productId', (request, response) => {
  const productId = request.params.productId;
  const product = products.find(product => product.id === productId);
  user = users[0] 
  userAuth = true;
  if (userAuth) {
    if (product) {
      user.cart.push(product);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: "Product not found" }));
    }
  } else {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
});

// DELETE Remove from Cart
myRouter.post('/api/me/cart/delete/:productId', (request, response) => {
  const productId = request.params.productId;
  const product = products.find(product => product.id === productId);
  user = users[0] 
  userAuth = true;
  if (userAuth) {
    if (product) {
      user.cart = user.cart.filter(product => product.id !== productId);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: "Product not found" }));
    }
  } else {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
});


module.exports = server;