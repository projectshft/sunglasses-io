var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

const PORT = 3001;

const state = {
  brands: [],
  products: [],
  users: [],
  accessTokens: [],
};

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

//Setup Initial State
fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  state.brands = JSON.parse(data);
});

fs.readFile("initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  state.products = JSON.parse(data);
});

fs.readFile("initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  state.users = JSON.parse(data);
});

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }

    console.log(`Server is listening on ${PORT}`);
  });

myRouter.get("/api/brands", (req, res) => {
  getBrands(req, res);
});

myRouter.get("/api/brands/:id/products", (req, res) => {
  getProductsForABrand(req, res);
});

myRouter.get("/api/products", (req, res) => {
  getAllProducts(req, res);
});

myRouter.post("/api/login", (req, res) => {
  login(req, res);
});

myRouter.get("/api/me/cart", (req, res) => {
  getCart(req, res);
});

myRouter.post("/api/me/cart", (req, res) => {
  addItemToCart(req, res);
});

myRouter.delete("/api/me/cart/:productId", (req, res) => {
  deleteItemFromCart(req, res);
});

myRouter.post("/api/me/cart/:productId", (req, res) => {
  updateProductQuantityInCart(req, res);
});

// HELPER MEHTODS
// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  var parsedUrl = require("url").parse(request.url, true);

  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = state.accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
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

//Helper method to check if user is logged in
const checkIfLoggedIn = (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    res.writeHead(401, "You must be logged in to perfom this action");
    return res.end();
  }
};

//Helper method to find current user
const currentUser = (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);

  return state.users.find((user) => {
    return user.login.username == currentAccessToken.username;
  });
};

//Helper method to attempt login
const login = (req, res) => {
  if (req.body.username && req.body.password) {
    let user = state.users.find((user) => {
      return (
        user.login.username == req.body.username &&
        user.login.password == req.body.password
      );
    });
    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = state.accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        state.accessTokens.push(newAccessToken);
        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    res.writeHead(400, "Incorrectly formatted response");
    return res.end();
  }
};

//Helper method to get brands
const getBrands = (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(state.brands));
};

//Helper method to get products for a brand
const getProductsForABrand = (req, res) => {
  const id = req.params.id;

  if (!state.brands.some((brand) => brand.id === id)) {
    res.writeHead(404, "Brand not found");
    res.end();
  }

  const productsForBrand = state.products.filter(
    (product) => product.categoryId === id
  );

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(productsForBrand));
};

//Helper method to get all products from the store
const getAllProducts = (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(state.products));
};

//Helper method to get the users cart
const getCart = (req, res) => {
  checkIfLoggedIn(req, res);
  let user = currentUser(req, res);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(user.cart));
};

//Helper method to add an item to the users cart
const addItemToCart = (req, res) => {
  checkIfLoggedIn(req, res);

  let product = { ...req.body };
  //return an error if there is no product match in the store
  if (!state.products.find((p) => p.id === product.id)) {
    res.writeHead(400, "Invalid Request: No valid product provided");
    return res.end();
  }

  //return an error if the product is already in the users cart
  const user = currentUser(req, res);
  if (user.cart.find((p) => p.id === product.id)) {
    res.writeHead(400, "Invalid Request: Product already in cart");
    return res.end();
  }

  //add the product to the users cart with a quantityInCart property
  product.quantityInCart = 1;
  user.cart.push(product);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(user.cart));
};

//Helper method to delete an item from the users cart
const deleteItemFromCart = (req, res) => {
  checkIfLoggedIn(req, res);
  const productId = req.params.productId;

  //return an error if the product Id doesn't match a product in the store
  if (!state.products.find((p) => p.id === productId)) {
    res.writeHead(400, "Invalid Request: No valid product ID provided");
    return res.end();
  }

  //return an error if the product is not in the user's cart
  const user = currentUser(req, res);
  if (!user.cart.find((p) => p.id === productId)) {
    res.writeHead(400, "Invalid Request: Product is not in cart");
    return res.end();
  }

  //delete the product from the user's cart
  user.cart = user.cart.filter((p) => p.id !== productId);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(user.cart));
};

//Helper method to update the quantity of an item in the user's cart
const updateProductQuantityInCart = (req, res) => {
  checkIfLoggedIn(req, res);
  const productId = req.params.productId;

  //return an error if the product Id doesn't match a product in the store
  if (!state.products.find((p) => p.id === productId)) {
    res.writeHead(400, "Invalid Request: No valid product ID provided");
    return res.end();
  }

  //return an error if the product is not in the user's cart
  const user = currentUser(req, res);
  if (!user.cart.find((p) => p.id === productId)) {
    res.writeHead(400, "Invalid Request: Product is not in cart");
    return res.end();
  }

  const newQuantityInCart = req.body.quantity;

  //return an error if quantity is not an integer
  if (!Number.isInteger(newQuantityInCart)) {
    res.writeHead(400, "Invalid Request: Quantity provided is not an integer");
    return res.end();
  }

  //return an error if quantity is less than 0
  if (newQuantityInCart < 0) {
    res.writeHead(400, "Invalid Request: Quantity provided is less than 0");
    return res.end();
  }

  //if new quantity is 0, delete the item from the cart
  if (newQuantityInCart === 0) {
    user.cart = user.cart.filter((p) => p.id !== productId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user.cart));
  }

  //update the quantity of the product in the user's cart
  const product = user.cart.find((p) => p.id === productId);
  product.quantityInCart = newQuantityInCart;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(user.cart));
};

module.exports = server;
