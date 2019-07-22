var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

// State holding variables
let products = [];
let brands = [];
let users = [];
let accessTokens = [];

// Set up access tokens for testing cart endpoints 
let testAccessToken1 = {
  username: 'lazywolf342',
  lastUpdated: new Date(),
  token: "kjKQZ2QHG1eFCfmT"
}
let testAccessToken2 = {
  username: 'greenlion235',
  lastUpdated: new Date(),
  token: "hEoJFuix38uedAf0"
}
accessTokens.push(testAccessToken1, testAccessToken2);

// Set timeout for tokens 
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const PORT = 3001;

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

// Helper method to get user (object) from username 
var getCurrentUserByUsername = function (username) {
  return users.find(user => {
    return user.login.username === username;
  });
};

// Set up router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  // Populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

  // Populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

  // Populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
});

// GET BRANDS
router.get("/api/brands", (request, response) => {
  let brandsToReturn = brands;
  // 404 error if no brands exist 
  if (brandsToReturn.length === 0) {
    response.writeHead(404, "No brands found");
    return response.end();
  }
  // Otherwise return all brands 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

// GET PRODUCTS BY BRAND 
router.get("/api/brands/:id/products", (request, response) => {
  // Get id and find brand by id 
  const { id } = request.params;
  const brand = brands.find(brand => brand.id === id);
  // 404 error if id doesn't correspond to a brand in store 
  if (!brand) {
    response.writeHead(404, "Brand does not exist");
    return response.end();
  }
  // Filter products by that brand id and return the array 
  const productsToReturn = products.filter(
    product => product.brandId === id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

// GET PRODUCTS
router.get("/api/products", (request, response) => {
  // Get search query (if it exists) 
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    // If query present, find products with matches (case-insensitive) in name/description 
    productsToReturn = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase())
    );
    // 404 error if no matches found 
    if (productsToReturn.length === 0) {
      response.writeHead(404, "No products found");
      return response.end();
    }
  } else {
    // If query not present, return all products 
    productsToReturn = products;
  }
  // If no error, array is returned 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

// LOGIN 
router.post('/api/login', function (request, response) {
  // Check that username/email *and* password are present 
  if (request.body.username && request.body.password) {
    // Find user object by credentials 
    let user = users.find((user) => {
      return (user.login.username == request.body.username || user.email == request.body.username) && user.login.password == request.body.password;
    });
    if (user) {
      // If user exists (credentials are valid), create or update the access token 
      response.writeHead(200, { "Content-Type": "application/json" });
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        // Send token back in response 
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // 401 error if credentials aren't valid 
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    // 400 error if both aren't present  
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

// GET CART
router.get('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  // 401 error if user isn't logged in 
  if (!currentAccessToken) {
    response.writeHead(401, "You need to log in to access the cart");
    return response.end();
  } else {
    // Send back cart array if user is logged in 
    let currentUser = getCurrentUserByUsername(currentAccessToken.username);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(currentUser.cart));
  }
});

// POST CART (add)
router.post('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  // 401 error if user isn't logged in 
  if (!currentAccessToken) {
    response.writeHead(401, "You need to log in to access the cart");
    return response.end();
  } else {
    let currentUser = getCurrentUserByUsername(currentAccessToken.username);
    // Get product id from query and check to see if it exists in products 
    const parsedUrl = url.parse(request.originalUrl);
    const { productId } = queryString.parse(parsedUrl.query);
    let product = products.find(product => {
      return product.id === productId;
    });
    if (!product) {
      // 404 error if products isn't found by that id 
      response.writeHead(404, "Product does not exist");
      return response.end();
    } else {
      // Check if cart item with that product id exists 
      let cartItem = currentUser.cart.find(product => {
        return product.productId === productId;
      });
      if (!cartItem) {
        // If not, create new 'item' object with quantity set at 1 
        let item = { 'productId': productId, 'quantity': 1 };
        currentUser.cart.push(item);
      } else {
        // If so, increment the item's quantity by 1 
        cartItem.quantity++;
      }
      // Return the user's cart 
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(currentUser.cart));
    }
  }
});

// DELETE CART 
router.delete('/api/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  // 401 error if user isn't logged in 
  if (!currentAccessToken) {
    response.writeHead(401, "You need to log in to access the cart");
    return response.end();
  } else {
    // Get productId from path and check that there's a corresponding item in the cart 
    const { productId } = request.params;
    let currentUser = getCurrentUserByUsername(currentAccessToken.username);
    let cartItem = currentUser.cart.find(product => {
      return product.productId === productId;
    });
    if (!cartItem) {
      // 404 error if item with that id isn't in the cart 
      response.writeHead(404, "Product does not exist in cart");
      return response.end();
    } else {
      // Otherwise take out the item 
      let cartToReturn = currentUser.cart.filter(item =>
        item.productId !== productId
      );
      currentUser.cart = cartToReturn;
      // Return the user's cart 
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(currentUser.cart));
    }
  }
});

// POST CART (edit)
router.post('/api/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // 401 error if user isn't logged in 
    response.writeHead(401, "You need to log in to access the cart");
    return response.end();
  } else {
    // Get productId from path 
    const { productId } = request.params;
    const parsedUrl = url.parse(request.originalUrl);
    // Get new quantity from query 
    const { quantity } = queryString.parse(parsedUrl.query);
    let currentUser = getCurrentUserByUsername(currentAccessToken.username);
    // Check that there's a corresponding item in the cart with that id 
    let cartItem = currentUser.cart.find(product => {
      return product.productId === productId;
    });
    if (!cartItem) {
      // 404 error if item with that id isn't in the cart 
      response.writeHead(404, "Product does not exist in cart");
      return response.end();
    } else if (Number(quantity) < 1 || Math.floor(Number(quantity)) !== Number(quantity)) {
      // 400 error if quantity is less than 1 or not an integer (equal to its floor)
      response.writeHead(400, "Invalid quantity supplied");
      return response.end();
    } else {
      // Otherwise use map to update quantity of that item 
      let cartToReturn = currentUser.cart.map(item =>
        (item.productId === productId) ? Object.assign({}, item, { 'quantity': Number(quantity) }) : item
      );
      currentUser.cart = cartToReturn;
      // Return the user's cart 
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(currentUser.cart));
    }
  }
});

module.exports = server;