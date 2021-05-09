var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
const url = require('url');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Brand = require('./models/brands');
let Product = require('./models/products');
let User = require('./models/users');
let Token = require('./models/tokens');

const PORT = 3001;
// let brands = [];
// let products = [];
// let users = [];

var myRouter = Router();
myRouter.use(bodyParser.json());
myRouter.use(bodyParser.urlencoded({
  extended: true
}));

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on server startup: ", error);
  }
  Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  Brand.addBrands(JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8")));
  User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));

});

myRouter.get('/v1/products', (request, response) => {
  
  response.writeHead(200, { "Content-Type": "application/json" });
  const { query } = queryString.parse(url.parse(request.url).query)
  if(query) {
    const productsMatchingQuery = Product.getAll().filter((product) => product.description.includes(query));
    return response.end(JSON.stringify(productsMatchingQuery));
  }
  return response.end(JSON.stringify(Product.getAll()));
})

myRouter.get('/v1/brands', (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  const brands = Brand.getAll();
  return response.end(JSON.stringify(brands));
})

myRouter.get('/v1/brands/:brandId/products', (request, response) => {
  const selectedBrand = Brand.getBrand(request.params.brandId);
  if(!selectedBrand) {
    response.writeHead(404, "no brand with that id found");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" })
  const productsForSelectedBrand = Product.getAll().filter((product) => product.categoryId == selectedBrand.id);
  return response.end(JSON.stringify(productsForSelectedBrand));
})

myRouter.post('/v1/login', (request, response) => {
  const { username, password } = request.body;
  if(!username || !password) {
    response.writeHead(400, "Must provide username and password")
    return response.end();
  }
  const userList = User.getAll();
  const matchedUser = userList.find((user) => (user.login.username === username) && (user.login.password === password))
  if(!matchedUser) {
    response.writeHead(401, "username or password not found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" })
  const newToken = {
    username,
    accessToken: uid(16)
  }
  Token.addToken(newToken);
  return response.end(JSON.stringify(newToken));
})

myRouter.get('/v1/me/cart', (request, response) => {
  const { accessToken } = queryString.parse(url.parse(request.url).query);
  const token = Token.getToken(accessToken);
  if (!token) {
    response.writeHead(401, "Must be logged in to access shopping cart");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" })
  const cart = User.getUser(token.username).cart;
  return response.end(JSON.stringify(cart));
})

myRouter.post('/v1/me/cart', (request, response) => {
  const { accessToken } = queryString.parse(url.parse(request.url).query);
  const token = Token.getToken(accessToken);
  if (!token) {
    response.writeHead(401, "Must be logged in to access shopping cart");
    return response.end();
  }

  const {id} = request.body;
  const productToAdd = Product.getProduct(id);
  if(!productToAdd) {
    response.writeHead(404, "Product not found");
    return response.end();
  }

  if(productToAdd.quantityAvailable <= 0) {
    response.writeHead(409, "Product is not available");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" })
  const cart = User.getUser(token.username).cart;
  cart.push({...productToAdd, quantity: 1})
  return response.end(JSON.stringify(cart));
})

myRouter.post('/v1/me/cart/:productId', (request, response) => {
  const { accessToken } = queryString.parse(url.parse(request.url).query);
  const token = Token.getToken(accessToken);
  if (!token) {
    response.writeHead(401, "Must be logged in to access shopping cart");
    return response.end();
  }
  const cart = User.getUser(token.username).cart;
  const cartItemToModify = cart.find((item) => item.id === request.params.productId);
  if(!cartItemToModify) {
    response.writeHead(404, "Product not found");
    return response.end();
  }

  const newQuantity = request.body.quantity;
  if(newQuantity > cartItemToModify.quantityAvailable) {
    response.writeHead(409, "desired quantity exceeds quantity available");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" })
  cartItemToModify.quantity = newQuantity;
  return response.end(JSON.stringify(cart));
})

myRouter.delete('/v1/me/cart/:productId', (request, response) => {
  const { accessToken } = queryString.parse(url.parse(request.url).query);
  const token = Token.getToken(accessToken);
  if (!token) {
    response.writeHead(401, "Must be logged in to access shopping cart");
    return response.end();
  }
  const cart = User.getUser(token.username).cart;
  const indexOfCartItemToRemove = cart.findIndex((item) => item.id === request.params.productId);
  if(indexOfCartItemToRemove === -1) {
    response.writeHead(404, "Product not found");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" })
  cart.splice(indexOfCartItemToRemove,1)
  return response.end(JSON.stringify(cart));
})

module.exports = server;