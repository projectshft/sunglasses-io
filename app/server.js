var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// State-holding variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const PORT = 3111;
const TOKEN_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Router setup
const myRouter = Router();
myRouter.use(bodyParser.json());

// Server setup
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);

  // Populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  console.log(`Brands: ${brands.length} loaded`)

  // Populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
  console.log(`Products: ${products.length} loaded`)

  // Populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  console.log(`Users: ${users.length} loaded`)
});

// GET all products
myRouter.get("/api/products", (request, response) => {
  if (products.length === 0) {
    response.writeHead(404, "No products were found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// GET all brands
myRouter.get("/api/brands", (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404, "No brands were found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// GET all products of given brand
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const productsOfBrand = products.filter(product => product.categoryId === id)

  if (productsOfBrand.length === 0) {
    response.writeHead(404, "No products were found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsOfBrand));
});

// POST user credentials
myRouter.post("/api/login", (request, response) => {
  // Find valid user/password
  const user = users.find((user) => (
    user.login.username === request.body.username &&
    user.login.password === request.body.password
  ));

  // Find access token if it already exists for user
  const currentAccessToken = accessTokens.find((tokenObject) => (
    tokenObject.username === user?.login.username
  ));

  // Create new access token
  const newAccessToken = {
    username: user?.login.username,
    lastUpdated: new Date(),
    token: uid(16),
  };

  // Missing parameters, return 400
  if (!request.body.username || !request.body.password) {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }

  // No matching user/password found, return 401
  if (!user) {
    response.writeHead(401, "Invalid username or password");
    return response.end();
  }
    
  // Access token exists already, update and return
  if (currentAccessToken) {
    currentAccessToken.lastUpdated = new Date();
    response.writeHead(200, "Login successful");
    return response.end();
  }
  
  // Criteria met, access token does not already exist, use new token and return
  if (newAccessToken) {
    accessTokens.push(newAccessToken);
    response.writeHead(200, "Login successful");
    return response.end()
  }
});

// Helper function to return authenticated user
const authenticate = (request) => {
  const userToken = accessTokens.find((tokenObject) => {
    return tokenObject.username === request.headers.username  
  });

  const userTokenAge = ((new Date) - userToken?.lastUpdated) 

  const tokenIsValid = {
    [!userTokenAge]: null,
    [userTokenAge >= TOKEN_TIMEOUT]: null,
    [userTokenAge < TOKEN_TIMEOUT]: users.find((user) => {
      return user.login.username === userToken?.username
    })
  };

  return tokenIsValid[true] ?? null
}

// GET user cart
myRouter.get("/api/me/cart", (request, response) => {
  const user = authenticate(request);

  if (!user) {
    response.writeHead(401, "Must be logged in to view to cart");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

// POST product to user cart
myRouter.post("/api/me/cart", (request, response) => {
  const user = authenticate(request);

  if (!user) {
    response.writeHead(401, "Must be logged in to add to cart");
    return response.end();
  }

  const { productId } = require('url').parse(request.url,true).query;

  const foundProduct = products.find((product) => {
    return product.id === productId
  })

  if (!foundProduct) {
    response.writeHead(404, "Product not found");
    return response.end();
  }
  
  const foundProductInCart = user.cart.find((cartObject) => {
    return cartObject.id === foundProduct.id;
  })
  
  if (foundProductInCart) {
    user.cart = user.cart.filter((cartObject) => {
      return cartObject.id !== foundProductInCart.id;
    })

    const updatedProduct = {
      ...foundProductInCart, 
      quantity: foundProductInCart.quantity + 1
    }

    user.cart.push(updatedProduct)
  } else {
    const newUserCart = [...user.cart, {...foundProduct, quantity: 1}]

    user.cart = newUserCart;
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

// UPDATE product quantity in user cart
myRouter.put("/api/me/cart/:productId", (request, response) => {
  const user = authenticate(request);

  if (!user) {
    response.writeHead(401, "Must be logged in to add to cart");
    return response.end();
  }

  const { productId } = request.params;
  const { qty } = require('url').parse(request.url,true).query;

  const foundProductInCart = user.cart.find((cartObject) => {
    return cartObject.id === productId;
  })

  if (!foundProductInCart) {
    response.writeHead(404, "Product not found");
    return response.end();
  } else {
    user.cart = user.cart.filter((cartObject) => {
      return cartObject.id !== foundProductInCart.id;
    })

    const updatedProduct = {
      ...foundProductInCart, 
      quantity: +qty
    }

    user.cart.push(updatedProduct)
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

// DELETE product from user cart
myRouter.delete("/api/me/cart/:productId", (request, response) => {
  const user = authenticate(request);

  if (!user) {
    response.writeHead(401, "Must be logged in to add to cart");
    return response.end();
  }

  const { productId } = request.params;

  const foundProductInCart = user.cart.find((cartObject) => {
    return cartObject.id === productId;
  })

  if (!foundProductInCart) {
    response.writeHead(404, "Product not found");
    return response.end();
  } else {
    user.cart = user.cart.filter((cartObject) => {
      return cartObject.id !== foundProductInCart.id;
    })
  }
  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});

module.exports = server;