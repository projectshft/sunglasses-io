const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require("url");

//State holding variables
let products = [];
let brands = [];
let users = [];
let accessTokens = [];

const PORT = 3001;

//Set up router
const router = Router();
router.use(bodyParser.json());

//Server
http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
})

.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
});

//GET all products or products filtered by a query
router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const {query} = queryString.parse(parsedUrl.query);
  let productsToReturn = [];

  if (query === undefined) {
    productsToReturn = products;
  } else {
    productsToReturn = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
  }

  if (!productsToReturn) {
    response.writeHead(404, "No products match query");
    return response.end();
  }

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(productsToReturn));
});

//GET all brands
router.get("/api/brands", (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
});

//GET all products for a specific brand
router.get("/api/brands/:id/products", (request, response) => {
  const {id} = request.params;
  const brand = brands.find(brand => brand.id == id);

  if (!brand) {
    response.writeHead(404, "Brand ID not found");
    return response.end();
  }

  const relatedProducts = products.filter(product => product.categoryId == brand.id);

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(relatedProducts));
});

//POST login credentials
router.post("/api/login", (request, response) => {
 // Make sure there is a username and password in the request
 if (request.body.username && request.body.password) {
   // See if there is a user that has that username and password
   const user = users.find((user) => {
     return ((user.login.username == request.body.username) && (user.login.password==request.body.password));
   });

   if (!user) {
    // Header for failed login
    response.writeHead(401, "Invalid credentials");
    return response.end();
   }

    // We have a successful login, if we already have an existing access token, use that
    let currentAccessToken = accessTokens.find((tokenObject) => {
      return tokenObject.username == user.login.username;
    });

    // Update the last updated value so we get another time period
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(currentAccessToken.token));
    } else {
      // Create a new token with the user value and a "random" token
      let newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessTokens.push(newAccessToken);
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(newAccessToken.token));
    }
  }

  else {
    // Header for missing parameters
    response.writeHead(400, "Missing credentials");
    return response.end();
  }
});

// Helper method to process access token
const getValidTokenFromRequest = function(request) {
  const parsedUrl = url.parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid
    const currentAccessToken = accessTokens.find(accessToken => {
      return (accessToken.token == parsedUrl.query.accessToken);
    });

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

//GET cart
router.get("/api/me/cart", (request, response) => {
  //Login authentication
  const currentAccessToken = getValidTokenFromRequest(request);
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  }
  //Find user based on access token
  const currentUser = users.find((user) => {
    return (user.login.username == currentAccessToken.username);
  });

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(currentUser.cart));
});

//POST add product to cart
router.post("/api/me/cart", (request, response) => {
  //Login authentication
  const currentAccessToken = getValidTokenFromRequest(request);
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  }

  if(!request.body.id) {
    response.writeHead(400, "No product submitted");
    return response.end();
  }

  const submittedProduct = products.find((product) => {
    return (product.id == request.body.id);
  });

  if (!submittedProduct) {
    response.writeHead(404, "Product ID not found");
    return response.end();
  }

  const currentUser = users.find((user) => {
    return (user.login.username == currentAccessToken.username);
  });

  const productToCart = {
    product: submittedProduct,
    quantity: 1
  }

  currentUser.cart.push(productToCart);
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(currentUser.cart));
});

//DELETE remove product from cart
router.delete("/api/me/cart/:productId", (request, response) => {
  //Login authentication
  const currentAccessToken = getValidTokenFromRequest(request);
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  }

  const {productId} = request.params;
  const submittedProduct = products.find(product => product.id == productId);

  if (!submittedProduct) {
    response.writeHead(404, "Product ID not found");
    return response.end();
  }

  const currentUser = users.find((user) => {
    return (user.login.username == currentAccessToken.username);
  });

  currentUser.cart = currentUser.cart.filter((productInCart) => {
    return (productInCart.product.id !== productId);
  });
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(currentUser.cart));
})

//POST change quantity of product in cart
router.post("/api/me/cart/:productId", (request, response) => {
  //Login authentication
  const currentAccessToken = getValidTokenFromRequest(request);
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  }

  const {productId} = request.params;
  const submittedProduct = products.find(product => product.id == productId);

  if (!submittedProduct) {
    response.writeHead(404, "Product ID not found");
    return response.end();
  }

  const quantity = request.body.quantity;

  if (!Number.isInteger(quantity) || quantity < 1) {
    response.writeHead(400, "Invalid quantity");
    return response.end();
  }

  const currentUser = users.find((user) => {
    return (user.login.username == currentAccessToken.username);
  });

  const productToChange = currentUser.cart.find((productInCart) => {
    return (productInCart.product.id == productId);
  });

  productToChange.quantity = quantity;
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(currentUser.cart));
});