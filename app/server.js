var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
const url = require('url');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var _ = require('lodash');

const PORT = 3001;
let brands = [];
let products = [];
let users = [];
const accessTokens = [];
const failedLoginCounter = {};

var myRouter = Router();
myRouter.use(bodyParser.json());

//HELPER METHODS

const findItemToUpdate = (currentUser, query) => {
  return currentUser.cart.find(item => item.product.id === query.productId);
}

const findCurrentUser = (goodToken) => {
  return users.find(user=> goodToken.username === user.login.username);
}

const checkToken = (request) => {
  return accessTokens.find(token => token.token === request.headers.bearer_token);
}

const queryParse = (request) => {
  return queryString.parse(url.parse(request.url).query)
}

const addProduct = (query, cart) => {
  let newProduct = {
    product: products.find(product=> product.id === query.productId),
    quantity: query.quantity
  }
  cart.push(newProduct);
  return newProduct;
}

//Server Init

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json","utf-8"));
  products = JSON.parse(fs.readFileSync("./initial-data/products.json","utf-8"));
  users = JSON.parse(fs.readFileSync("./initial-data/users.json","utf-8"));
});


myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
})


myRouter.get('/api/brands/:id/products', (request, response) => {
  const brand = brands.find(brand => brand.id === request.params.id);
  if (!brand) {
    response.writeHead(404);	
		return response.end("Brand Not Found");
  }
  
  const glassesModels = products.filter(product => product.categoryId === brand.id)
  const returnPackage = {brand: brand.name, pieces: [...glassesModels]}
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(returnPackage));
})


myRouter.get('/api/products', (request, response) => {
  const query = queryParse(request)

  const paramCheck = _.pull(Object.keys(query), 'query')
  if (paramCheck.length > 0){
    response.writeHead(400, { "Content-Type": "application/json"});
    return response.end(`Invalid parameter(s):${[...paramCheck]}`);
  }

  if (!query.query){
    response.writeHead(200, { "Content-Type": "application/json"});
    return response.end(JSON.stringify(products));
  }

  const glassesMatch = products.filter(product=> {
    if (product.name.toLowerCase().includes(query.query) || product.description.toLowerCase().includes(query.query)){
      return product
    }
  })
  
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(glassesMatch));
})


myRouter.post('/api/login', (request, response) => {
  const username = request.body.username;
  
  if(!username || !request.body.password){
    response.writeHead(400, { "Content-Type": "application/json"});
    return response.end('Missing required inputs');
  }

  let user = users.find(user => user.login.username === username && user.login.password === request.body.password)

  if(!user) {
    failedLoginCounter[username] ? failedLoginCounter[username]++: failedLoginCounter[username] = 1;
    
    if (failedLoginCounter[username] >= 3) {
      response.writeHead(403, { "Content-Type": "application/json"});
      return response.end('Too many failed login attempts');
    }
    response.writeHead(401, { "Content-Type": "application/json"});
    return response.end('Invaild username or password');
  }

  if (failedLoginCounter[username] >= 3) {
    response.writeHead(403, { "Content-Type": "application/json"});
    return response.end('Too many failed login attempts');
  }

  response.writeHead(200, {'Content-Type': 'application/json'})
  failedLoginCounter[username] = 0;
  let currentAccessToken = accessTokens.find(tokenObj => tokenObj.username == user.login.username)

  if (!currentAccessToken) {
    let newToken = {
      username : user.login.username,
      lastUpdated: new Date(),
      token: uid(16)
    }
    accessTokens.push(newToken);
    return response.end(JSON.stringify(newToken.token))
  }

  currentAccessToken.lastUpdated = new Date();
  return response.end(JSON.stringify(currentAccessToken.token));
})


myRouter.get('/api/me/cart', (request, response) => {
  let goodToken = checkToken(request);
  if (!goodToken){
    response.writeHead(403, { "Content-Type": "application/json"});
    return response.end('You are not logged in. Please try again.');
  }

  let currentUser = findCurrentUser(goodToken);
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(currentUser.cart));
})


myRouter.post('/api/me/cart', (request, response) => {
  const query = queryParse(request);
  let goodToken = checkToken(request);
  if (!goodToken){
    response.writeHead(403, { "Content-Type": "application/json"});
    return response.end('You are not logged in. Please try again.');
  }

  let currentUser = findCurrentUser(goodToken);
  let productCheck = findItemToUpdate(currentUser, query);

  if (productCheck){
    response.writeHead(400, { "Content-Type": "application/json"});
    return response.end('Item already in cart. Use a PUT request to update.');
  }

  let newCart = addProduct(query, currentUser.cart);
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(newCart));
})


myRouter.put('/api/me/cart/', (request, response) => {
  const query = queryParse(request);
  let goodToken = checkToken(request);

  if (!goodToken){
    response.writeHead(403, { "Content-Type": "application/json"});
    return response.end('You are not logged in. Please try again.');
  }

  let currentUser = findCurrentUser(goodToken);
  let itemToUpdate = findItemToUpdate(currentUser, query);
  
  if(!itemToUpdate){
    response.writeHead(400, { "Content-Type": "application/json"});
    return response.end('Item not found. To add a new item to cart, try a POST request.');
  };

  _.pull(currentUser.cart, itemToUpdate);
  let newCart = addProduct(query, currentUser.cart);

  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(newCart));
})


myRouter.delete('/api/me/cart/', (request, response) => {
  const query = queryParse(request);
  let goodToken = checkToken(request);

  if (!goodToken){
    response.writeHead(403, { "Content-Type": "application/json"});
    return response.end('You are not logged in. Please try again.');
  }

  let currentUser = findCurrentUser(goodToken);
  let itemToUpdate = findItemToUpdate(currentUser, query);
  
  if(!itemToUpdate){
    response.writeHead(400, { "Content-Type": "application/json"});
    return response.end('Item to delete not found in cart.');
  };

  _.pull(currentUser.cart, itemToUpdate)

  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(itemToUpdate));
})


module.exports = server;