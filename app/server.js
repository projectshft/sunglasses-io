const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require('url');

// State holding variables
let brands = [];
let products = [];
let users = [];
let user = {};

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  // Load data into server
  fs.readFile("./initial-data/brands.json", "utf-8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server Setup: ${brands.length} brands loaded`);
  })
  
  fs.readFile("./initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server Setup: ${products.length} products loaded`);
  })
  
  fs.readFile("./initial-data/users.json", "utf-8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server Setup: ${users.length} users loaded`);
  });

  console.log(`Server is listening on ${PORT}`);
});

// bring in myrouter stuff
myRouter.get("/brands", function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/brands/:id/products", function(request, response) {
// filter function to find products with a specific brand id
  const foundProducts = products.filter((product=>product.categoryId == request.params.id))

  if (!foundProducts) {
    response.writeHead(404);
    return response.end("Products not found");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(foundProducts));
});

myRouter.get("/products", function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

myRouter.get("/me/cart", function(request, response) {
  const userCart = users[0].cart

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(userCart));
});

myRouter.post("/me/cart", function(request, response) {
  const userCart = users[0].cart;
  const addedProduct = request.body;

  if (!addedProduct.quantity) {
    addedProduct.quantity = 1
  } else {
    addedProduct.quantity += 1
  }

  userCart.push(addedProduct);
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(userCart));
})

myRouter.delete("/me/cart/:productId", function(request, response) {
  const userCart = request.body;
  const foundProduct = userCart.filter((product=>product.id == request.params.productId));

  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product Not Found");
  }

  const updatedCart = userCart.filter((product=>product.id !== request.params.productId));

  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(updatedCart));
})

module.exports = server;