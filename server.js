var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var Router = require('router');
var bodyParser = require('body-parser');

const PORT = 3001;

// State holding variables
let brands = [];
let products = [];
let users = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

// server variable
let server = http.createServer(function (request, response) {
  // router variable to listen and handle server calls
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => { 
  if (error) {
  }
  // reads brands.json file and assigns brands array variable
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });
// reads products.json file and assigns products array variable
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if(error) throw error;
    products = JSON.parse(data);
  })
  // reads users.json file and assigns users array variable
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });
});

// handles GET call to return all brands 
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
});
// handles GET call to return all products of brand with specified id
myRouter.get('/api/brands/:id/products', function(request, response) {
  // variable for brand with associated :id
  const brandSelection = brands.find((brand) => {
    return brand.id == request.params.id;
  });
  // handles case of undefined brandSelection variable due to invalid :id brand
  if(brandSelection == undefined){
    response.writeHead(400);
    return response.end("Brand id not found or is invalid.");
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
// handles GET call for user cart route
myRouter.get(`/api/me/cart`, function(request, response) {
  // finds user based on username
  let user = users.find((user) => {
    return user.username == request.body.username;
  })
  // returns user/cart data
  response.writeHead(200, {"Content-Type": "application/json"})
  return response.end(JSON.stringify(user));
});
// handles POST call to add product to user cart
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
      let cartItem = { product, quantity: 1}
      user.cart.push(cartItem);
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(user));
      // increases quantity value by 1 if product already exists in the cart
    } else if(cartItem.product.id == product.id){
      cartItem.quantity++
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(user));
    }
  }
});

myRouter.delete('/api/me/cart/:productId', function(request, response) {
  let user = users.find((user) => {
    return user.login.username == request.body.username;
  })
  let userCart = request.body.userCart;
  // checks username matches
  if(user.login.username == request.body.username){
    // matches product id of item to delete matches product id of item in cart and reduces item quantity by 1
    userCart.forEach((item) => {
      if(item.productId == request.params.productId){
        // handles removal of item if quantity after decrement results in 0
        if(userCart.length > 1){
          userCart.splice(userCart.indexOf(item), 1);
          response.writeHead(200, {"Content-Type": "application/json"});
          return response.end(JSON.stringify(userCart));
          // sets cart to empty if item to delete is the only item in the cart and the quantity is 0 after decrement
        } else if(userCart.length == 1){
          userCart.pop();
          response.writeHead(200, {"Content-Type": "application/json"});
          return response.end(JSON.stringify(userCart));
        }
      }
    });
    // returns user/cart info in instance that product to delete does not exist in cart
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(user));
  }
});
// handles POST call to post product with productId to to user cart
myRouter.post('/api/me/cart/:productId', function(request, response) {
  // checks quantity of cart item is a number and an valid/existing product
  if(typeof request.body.quantityToChangeTo === 'number'){
    // handles incorrect quantity of a negative number
    if(request.body.quantityToChangeTo <= 0){
      response.writeHead(400, "Bad Request.  Quantity cannot be 0 or a negative number");
      return response.end();
    } else if(request.body.quantityToChangeTo > 0){
      let updatedCartItem = request.body.productToAdjust;
      updatedCartItem.quantity = request.body.quantityToChangeTo;
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(updatedCartItem));
    }
  } else {
    response.writeHead(400, "Input type of quantity of product in cart is wrong type. It must be a number");
    return response.end();
  }
});

module.exports = server;
