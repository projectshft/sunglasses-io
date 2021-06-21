const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;
const Sunglasses = require("./models/sunglasses-io");

const PORT = 3001;

// Setup Router
const router = Router();
router.use(bodyParser.json());

// Set Up Server
const server = http
  .createServer((request, response) => {
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT);

// Routes
router.get("/brands", (request, response) => {
  // Return all brands
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Sunglasses.getBrands()));
});

router.get("/brands/:id/products", (request, response) => {
  // Find brand products to return
  const foundBrandProducts = Sunglasses.getBrandProducts(request.params.id);

  // Return 404 if not found
  if (!foundBrandProducts) {
    response.writeHead(404);
    return response.end("Brand Not Found");
  }

  // Return all products in a brand
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(foundBrandProducts));
});

router.get("/products", (request, response) => {
  // Return all products
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Sunglasses.getProducts()));
});

// router.post("/login", (request, response) => {
//   // Login call
//   const { username, password } = request.body;

//   // Make sure there is a username and password in the request
//   if (username && password) {
//     // See if there is a user that has that username and password
//     let user = users.find((user) => {
//       return user.login.username == username && user.login.password == password;
//     });
//     if (user) {
//       response.writeHead(200, { "Content-Type": "application/json" });
//     }

//     // FINISH THIS ONE!
//   }
// });

// router.get("/me/cart", (request, response) => {
//   // Fetch shopping cart
// });

// router.post("/me/cart", (request, response) => {
//   // Create cart
// });

// router.delete("/me/cart/:productId", (request, response) => {
//   // Delete item from cart
// });

// router.post("/me/cart/:productId", (request, response) => {
//   // Add item to cart
// });

module.exports = server;
