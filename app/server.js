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
let accessTokens = [];

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;

// create server
let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  };

  // Load brands into server
  fs.readFile("./initial-data/brands.json", "utf-8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server Setup: ${brands.length} brands loaded`);
  });
  
  // Load products into server
  fs.readFile("./initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server Setup: ${products.length} products loaded`);
  });
  
  // Load users into server
  fs.readFile("./initial-data/users.json", "utf-8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server Setup: ${users.length} users loaded`);
  });

  console.log(`Server is listening on ${PORT}`);
});

// GET all brands
myRouter.get("/brands", function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// GET products of a specific brand ID
myRouter.get("/brands/:id/products", function(request, response) {
  const brand = brands.find((brand=>brand.id == request.params.id));
  
  // error header if no brand was found with the specific brand ID
  if (!brand) {
    response.writeHead(404);
    return response.end("Brand not found");
  };

  // filter function to find products with a specific brand id
  const foundProducts = products.filter((product=>product.categoryId == request.params.id));

  // header for successful status and returns products with specific brand ID
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(foundProducts));
});

// GET all products
myRouter.get("/products", function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// POST login
myRouter.post("/login", function(request, response) {
  // check request for username and password
  if (request.body.username && request.body.password) {
    
    // check is user exists
    const user = users.find((user) => {
      return ((user.login.username == request.body.username) && (user.login.password == request.body.password));
    });

    // header error for invalid login
    if (!user) {
      response.writeHead(401, "Invalid username/password");
      return response.end();
    };

    // check if an access token already exists
    let currentAccessToken = accessTokens.find((token=>token.username == user.login.username));

    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(currentAccessToken));
    } else {
      // create new access token if one doesn't already exist
      let newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      };
      accessTokens.push(newAccessToken);
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(newAccessToken));
    }
  } else {
    // header error for missing username and/or password
    response.writeHead(400, "Missing login");
    return response.end();
  };
});

// function that grabs access token from request
const getValidTokenFromRequest = function(request) {
  const parsedUrl = url.parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    const currentAccessToken = accessTokens.find((accessToken=>accessToken.token == parsedUrl.query.accessToken));

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    };
  } else {
    return null;
  };
};

// GET cart
myRouter.get("/me/cart", function(request, response) {
  // grab access token from request
  const currentAccessToken = getValidTokenFromRequest(request);

  // check that user is logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  };

  // find user by access token
  const currentUser = users.find((user=>user.login.username == currentAccessToken.username));

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(currentUser.cart));
});

// POST add product to cart
myRouter.post("/me/cart", function(request, response) {
  // grab access token from request
  const currentAccessToken = getValidTokenFromRequest(request);

  // check that user is logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  };

  // find user by access token
  const currentUser = users.find((user=>user.login.username == currentAccessToken.username));

  // grab current user's cart
  const userCart = currentUser.cart;

  // product to be added
  const addedProduct = request.body;

  // if product does not have quantity, set quantity to 1, if quantity property exists, add 1 to quantity
  if (!addedProduct.quantity) {
    addedProduct.quantity = 1
  } else {
    addedProduct.quantity += 1
  };

  // add product to user's cart
  userCart.push(addedProduct);
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(userCart));
})

// DELETE product from cart using product ID
myRouter.delete("/me/cart/:productId", function(request, response) {
  // grab access token from request
  const currentAccessToken = getValidTokenFromRequest(request);

  // check that user is logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  };

  // find user by access token
  const currentUser = users.find((user=>user.login.username == currentAccessToken.username));

  //grab user's cart
  const userCart = currentUser.cart;

  // find the product to be deleted by product ID
  const foundProduct = userCart.filter((product=>product.id == request.params.productId));

  // header error if product isn't found
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product Not Found");
  }

  // filter user's cart to remove the product with the desired product ID
  const updatedCart = userCart.filter((product=>product.id !== request.params.productId));

  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(updatedCart));
});

// POST cart to update quantity
myRouter.post("/me/cart/:productId", function(request, response) {
  // grab access token from request
  const currentAccessToken = getValidTokenFromRequest(request);

  // check that user is logged in
  if(!currentAccessToken) {
    response.writeHead(401, "Login required");
    return response.end();
  };

  // find user by access token
  const currentUser = users.find((user=>user.login.username == currentAccessToken.username));

  // grab user's cart
  const userCart = currentUser.cart;

  // grab product based on specified product ID
  const foundProduct = userCart.find((product=>product.id == request.params.productId)); 

  // header error if product is not found
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product Not Found");
  };

  // plus 1 quantity of desired product
  foundProduct.quantity += 1;
    
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(userCart));
})

module.exports = server;