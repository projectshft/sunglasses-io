var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const url = require('url')
var uid = require('rand-token').uid;

const PORT = 3001;

// token-checking helper method
const getValidTokenFromRequest = function(request) {
  const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const parsedUrl = url.parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;});

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// handle cors
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};

// state-holding variables
let brands = [];
let users = [];
let products = [];

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

// initialize one user's access token for testing
const accessTokens = [ {
  username: "yellowleopard753",
  lastUpdated: new Date(),
  token: '5e09efdf-9e7e-400f-8468-d79ebf39c185'
}]

// set up server, read files, and log successful file reads
const server = http.createServer(function (request, response) {
  // Handle CORS Preflight request
  if (request.method === 'OPTIONS'){
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

  myRouter(request, response, finalHandler(request, response))
  }).listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
   brands = JSON.parse(fs.readFileSync('initial-data/brands.json'))
   users = JSON.parse(fs.readFileSync('initial-data/users.json'))
   products = JSON.parse(fs.readFileSync('initial-data/products.json'))
});


myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  // Return all brands
  return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', function(request,response) {
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  // Return 404 if no product parameter is found
  if(!products){
    response.writeHead(404, 'no products found');
    return response.end();
  }
  // filter product array by requested brand
  const productsByBrand = products.filter((product) => 
     product.categoryId === request.params.id
  );
  // If no products exist matching categoryId, return 404
  if (productsByBrand.length == 0) {
    response.writeHead(404, 'Brand by that id not found');
    return response.end();
  }
  // Return brand's products
  return response.end(JSON.stringify(productsByBrand));
});

myRouter.get('/api/products', function(request,response) {
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

  // if product array is empty return 404
  if(!products){
    response.writeHead(404, 'no products found');
  }
  const queryParams = queryString.parse(url.parse(request.url).query);

  // if there is a search term, filter products by search term in item name or description
  if (queryParams.searchTerm)
  {
  const productsBySearch = products.filter((product) => 
     (product.name.toLowerCase().includes(queryParams.searchTerm.toLowerCase()) ||
     product.description.toLowerCase().includes(queryParams.searchTerm.toLowerCase())
  ))

  // handle zero results
  if (productsBySearch.length == 0) {
    response.writeHead(404, 'search returned zero results')
  }
  // Return  products
  return response.end(JSON.stringify(productsBySearch));
  }
  else {return response.end(JSON.stringify(products));}
});

myRouter.post('/api/login', function(request, response) {
  const queryParams = queryString.parse(url.parse(request.url).query);
  const currentUser = queryParams.username;
  const password = queryParams.password;
  // handle missing credentials
  if (!currentUser || !password) 
    {response.writeHead(400, 'username and password required'); return response.end()}

  // handle wrong credentials
    if (!users.find(user => user.login.username == currentUser) || !users.find(user => user.login.password == password))
    {response.writeHead(401, 'invalid credentials'); return response.end()}
  
  // reject if username or password is empty
    
  else {
      // Check if there is a user with param username, store it if so
    const validUser = users.find(user => user.login.username == currentUser).login.username;
   // Check if that user's password is correct, store it if so
    response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

    // check for existing access token
    let currentAccessToken = accessTokens.find((tokenObject) => {
      return tokenObject.username == validUser
    });
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return response.end(JSON.stringify(currentAccessToken.token));
    } else {
      // Create a new token with the user value and a "random" token
      let newAccessToken = {
        username: validUser,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
}
}
)

myRouter.get('/api/me/cart', function(request,response) {
  const validToken = getValidTokenFromRequest(request);
  const queryParams = queryString.parse(url.parse(request.url).query);

  // handle no token
  if (!queryParams.accessToken) {
    response.writeHead(401, 'access token required');
    return response.end();
  }

  // handle invalid token
  if (!validToken) {
    response.writeHead(401, 'invalid access token');
    return response.end();
  }

  else{
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  const activeUser = accessTokens.find((accessToken) => accessToken.token == validToken.token).username;

  const cart = users.find(user => user.login.username == activeUser).cart;
  if (!cart.length) {
    response.writeHead(404, "cart is empty");
    return response.end();
  }
  return response.end(JSON.stringify(cart));
  }
});

myRouter.post('/api/me/cart', function(request,response) {
  const validToken = getValidTokenFromRequest(request);
  const queryParams = queryString.parse(url.parse(request.url).query);
  let quantity = queryParams.quantity;
  if (!quantity){quantity = 1}
  const id = queryParams.productId;
  const validProduct = products.find(product => product.id == id)
// handle no product by that id
  if (!validProduct) {
    response.writeHead(404, 'no product with that id exists');
    return response.end();
  }
  // handle quantity is NaN
  if (quantity && isNaN(quantity)) {
    response.writeHead(400, 'quantity must be a number');
    return response.end();
  }
  // handle missing or wrong tokens
  if (!queryParams.accessToken) {
    response.writeHead(401, 'access token required');
    return response.end();
  }
  if (!validToken) {
    response.writeHead(401, 'invalid access token');
    return response.end();
  }
  // find the user's cart, add the item, and return updated cart
  else{
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  const activeUser = accessTokens.find((accessToken) => accessToken.token == validToken.token).username;

  const cart = users.find(user => user.login.username == activeUser).cart;

  if (cart.some(item => item.id == validProduct.id))
    {response.writeHead(403, 'item already in cart. To change item quantity, use endpoint POST /api/me/cart/:productId');
    return response.end();
  }
  const newItem = 
    {
      id: validProduct.id,
      quantity: quantity
    }
  
  cart.push(newItem)
  return response.end(JSON.stringify(cart));
  }
});

myRouter.delete('/api/me/cart/:productId', function(request,response) {
  const validToken = getValidTokenFromRequest(request);
  const queryParams = queryString.parse(url.parse(request.url).query);
  const id = request.params.productId;
  const validProduct = products.find(product => product.id == id);
  const activeUser = accessTokens.find((accessToken) => accessToken.token == validToken.token).username;
  const cart = users.find(user => user.login.username == activeUser).cart;
  const itemToDelete = cart.find(item => item.id == validProduct.id)

  if (!validProduct) {
    response.writeHead(404, 'no product with that id exists');
    return response.end();
  }
  if (!queryParams.accessToken) {
    response.writeHead(401, 'access token required');
    return response.end();
  }
  if (!validToken) {
    response.writeHead(401, 'invalid access token');
    return response.end();
  }
  if (!itemToDelete) {
    response.writeHead(404, 'this item is not in the cart');
    return response.end();
  }
  else{
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  cart.splice(cart.indexOf(itemToDelete), 1)
  return response.end(JSON.stringify(cart));
  }
});

// change item quantity in cart
myRouter.post('/api/me/cart/:productId', function(request,response) {
  const validToken = getValidTokenFromRequest(request);
  if (!validToken) {
    response.writeHead(401, 'invalid access token');
    return response.end();
  }

  const queryParams = queryString.parse(url.parse(request.url).query);
  if (!queryParams.accessToken) {
    response.writeHead(401, 'access token required');
    return response.end();
  }
  // handle no quantity, or 0 quantity
  const quantity = queryParams.quantity;
  if (!quantity || quantity == 0 || isNaN(quantity)) {
    response.writeHead(401, 'valid quantity required');
    return response.end();
  }

  const id = request.params.productId;
  const validProduct = products.find(product => product.id == id);
  if (!validProduct) {
    response.writeHead(404, 'no product with that id exists');
    return response.end();
  }

  const activeUser = accessTokens.find((accessToken) => accessToken.token == validToken.token).username;
  const cart = users.find(user => user.login.username == activeUser).cart;
  const itemToUpdate = cart.find(item => item.id == validProduct.id)
  
  // handle item is not in cart
  if (!itemToUpdate) {
    response.writeHead(404, 'this item is not in the cart');
    return response.end();
  }
  else{
  response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  cart[cart.indexOf(itemToUpdate)].quantity = quantity;
  return response.end(JSON.stringify(cart));
  }
});

module.exports = server