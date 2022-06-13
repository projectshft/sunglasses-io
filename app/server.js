var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//State holding variables
let brands = [];
let products = [];
let user = {};
let users = [];
let cart = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request,response)) 

});

//Listen on port
server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));

});

// Get Brands
myRouter.get('/brands', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

// Get Products by Brand Id
myRouter.get('/brands/:id/products', function(request, response) {
  const brandRequested = request.body;

  if(!brandRequested.id){
    response.writeHead(400);
    return response.end();
  }

  const findProducts = products.filter((products) => {
    return products.categoryId == brandRequested.id;
  });

  if (findProducts) {
    console.log(findProducts);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(findProducts));

  } else {
    response.writeHead(400, 'Could not find any products');
    return response.end();
  }
});

// Get Products
myRouter.get('/products', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

// Post Login
myRouter.post('/login', function(request, response) {
  const userLogin = request.body;

  if (userLogin.username && userLogin.password) {
    
    const findUser = users.find((users) => {
      return users.login.username == userLogin.username && users.login.password == userLogin.password;
    });

    if(findUser) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(userLogin));
    } else {
      response.writeHead(400, 'Invalid username or password');
      return response.end();
    }

  } else {
    response.writeHead(400, 'No login information');
    return response.end();
  }

});

// Get Cart
myRouter.get('/me/cart', function(request,response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
});

// Post Cart
myRouter.post('/me/cart', function(request, response) {

});

// Delete Product in Cart
myRouter.delete('/me/cart/:productId', function(request,response) {
  const currentCart = request.body;

  if(!currentCart){
    response.writeHead(400);
    return response.end();
  }
  if(currentCart.id) {
    const findProduct = currentCart.find((product) => {
      return cart.id == currentCart.id
    });
  }
});

// Post Product to Cart
myRouter.post('/me/cart/:productId', function(request, response) {
  const addedProduct = request.body;

  if(!addedProduct.id){
    response.writeHead(400);
    return response.end();
  }

  if(addedProduct.id) {
    const findProduct = products.find((products) => {
      return products.id == addedProduct.id
    });
    if(findProduct) {
      cart.push(addedProduct);
    
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(addedProduct));
    }
  } else {
    response.writeHead(400, 'No product information');
    return response.end();
  }
});

module.exports = server;