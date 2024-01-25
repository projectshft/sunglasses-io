var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const { parse } = require('path');
var uid = require('rand-token').uid;

const PORT = 3001;

// State holding variables
let brands = [];
let products = [];
let users = [];
let currentUserLoggedIn = null;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {

  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => { 
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if(error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  })
  
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
});

// function to add a product to a users cart
function addProductToUserCart(username, productId, usersArray){
  let user = users.find((user) => {
    return user.login.username == username;
  })
  let product = products.find((product) => {
    return product.id == productId;
  })
  let cartItem = { product: product, quantity: 1 };
  let itemInCart = userCartContainsProduct(productId, usersArray);
  if(itemInCart){
    user.cart.foreach((item) => {
      if(item.product.product.id == productId){
        item.quantity++;
      }
    });
  } else {
    user.cart.push(cartItem);
  }
}

// funciton to check if product is in user cart
function userCartContainsProduct(productId, usersArray){
  let inCart = usersArray.find((user) => {
    return user.cart.forEach((item) => {
      return item.product.product.id == productId;
    });  
   });
  if(inCart) {
    return true;
  }
}

// gets all brands 
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));

});

// gets all products of brand with specified id
myRouter.get('/api/brands/:id/products', function(request, response) {
  // variable for brand with associated :id
  const brandSelection = brands.find((brand) => {
    return brand.id == request.params.id;
  });
  // handles case of undefined brandSelection variable due to invalid :id brand
  if(!brandSelection){
    response.writeHead(500);
    return response.end("Brand not found, no products found.");
  }
  // variable for products associated with brand :id
  const brandProducts = products.filter((products) => {
    return products.categoryId == brandSelection.id;
  });

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brandProducts));
});

// gets all products 
myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(products));
});

// handles login attempt
myRouter.post('/api/login', function(request, response) {
  // checks username and password input to verify authorization
  if(request.body.username && request.body.password){
    let user = users.find((user) => {
      return user.login.username == request.body.username && 
      user.login.password == request.body.password;
    });
    // input username and password for a user are found and match and login is successful
    if(user){
      // on successful login
        response.writeHead(200, {"Content-Type": "application/json"});
        return response.end(JSON.stringify(user))
        // create new access token with user and "random" token
    } else {
      // invalid username or password
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  // if username or password is left blank
  } else if(request.body.username == undefined || request.body.password == undefined){
    response.writeHead(400, "Incorrectly formatted response: missing username and/or password input");
    return response.end();
  } 
});

myRouter.get(`/api/me/cart`, function(request, response) {
  let user = users.find((user) => {
    return user.username == request.body.username;
  })
  response.writeHead(200, {"Content-Type": "application/json"})
  return response.end(JSON.stringify(user));
});

myRouter.post('/api/me/cart', function(request, response) {
  // product to add to cart
  let product = products.find((product) => {
    return product.id == request.body.productToAdd.id;
  })
  // user adding product to their cart
  let user = users.find((user) => {
    return user.login.username == request.body.username;
  })
  // checks product and user exts 
  if(user && product) {
    // adds item to cart with quantity value 1 if cart is empty
    if(user.cart.length == 0){
      let cartItem = { product: {product}, quantity: 1}
      user.cart.push(cartItem);
      // increases quantity value by 1 if product already exists in the cart
    } else if(cartItem.product.id == product.id){
      cartItem.quantity++
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(user));
  }
});

myRouter.delete('/api/me/cart/:productId', function(request, response) {

});

myRouter.post('/api/me/cart/:productId', function(request, response) {

});

module.exports = server;