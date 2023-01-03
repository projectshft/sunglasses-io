var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
// var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

// State holding variables
var PORT = 3500;
var brands = [];
var products = [];
var users = [];
var accessTokens = [];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

chai.request('http://localhost:3500');
should = chai.should();
chai.use(chaiHttp);  

// Server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

// Setup Router
let router = Router();
router.use(bodyParser.json());

server.listen(PORT, err => {
  if (err) throw err;
  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
});


// 1. Requests for brands (passed):
router.get('/brands', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
})

// 2. Requests for products (passed):
router.get('/products', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(products));
})

// 3. Requests for a specific product (passed):
router.get('/products/:categoryId', (req, res) => {
  const productId = req.params.categoryId;
  console.log(productId);
  const product = products.filter(p => p.categoryId === productId);
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(product))
})

// 4. Handle POST login request from user:
router.post('/login', (req, res) => {
  if(req.body.username && req.body.password){
    let currentUser = users.find((user) => {
        user.login.username == req.body.username &&
        user.login.password == req.body.password  
    });

  if (currentUser) {
    res.writeHead(200, { "Content-Type": "application/json" });

    // Check if token exists:
    let currentAccessToken = accessTokens.find((tokenObject) => 
      tokenObject.username === currentUser.login.username
    );
    
    // Update latest value to get another time period:
    if (currentAccessToken){
      currentAccessToken.lastUpdate = new Date();
      return res.end(JSON.stringify(currentAccessToken.token));
    } else {
      // Create a new token with the user value and a 'random token'
      let newAccessToken = {
        username:  currentUser.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessTokens.push(newAccessToken);
      return res.end(JSON.stringify(newAccessToken.token));
      }

    } else {
      res.writeHead(401, 'Invalid username or password');
      return res.end();
    }
  } else {
      res.writeHead(400, 'Incorrectly formatted response');
      return res.end();
  }
});

// Helper method to verify tokens
var verifyAccessToken = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find(
      (accessToken) => 
      accessToken.token == parsedUrl.query.accessToken &&
      new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
    );

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }

  } else {
    return null;
  }
};

// Get user's cart
router.get('/cart', function (req, res) {
  let currentAccessToken = verifyAccessToken (req);

  if(currentAccessToken) {
    const currentUser = getUser(currentAccessToken);
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(currentUser.cart));
  }
    res.writeHead(401, 'Please login first')
    return res.end();
});

// Post item to user's cart
router.post('/cart/:id', async (req, res) => {
  let accessToken = getValidAccessTokenFromRequest(req);

  if (accessToken) {
    const filteredItems = products.filter(item => item.id == req.body.name)

  if (filteredItems) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    let userFilter = users.find(user => user.login.username == accessToken.username);
    let product = {
      product: filteredItems,
      quantity: 1
    }

    userFilter.cart.push(product);
    return res.end(JSON.stringify(userFilter.cart));
  
  } else {
    res.writeHead(401, 'Not a valid product');
    return res.end();
  }
  } else {
    res.writeHead(401, 'Invalid access token');
    return res.end();
  }
})

// Delete item
router.delete('/cart/:id', (req, res) => {
  const productId = req.params.categoryId;
  const deletedProduct = products.find((product) => product.id === productId);
  const deleteIndex = cart.indexOf(deletedProduct);

  if(deleteIndex){
    cart.splice(deleteIndex, 1);
    reponse.writeHead(200, {'Content-Type': 'application/json'});
  } else {
    response.writeHead(404, 'That product does not exist');
    return response.end();
  }
});

module.exports = server;

