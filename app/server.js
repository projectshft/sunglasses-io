var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const brandsJson = require('./../initial-data/brands.json');
const productsJson = require('./../initial-data/products.json')
const usersJson = require('./../initial-data/users.json')

const PORT = 8080;

// initialize currentUser to be updated by login route
let currentUser = '';

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT);

const myRouter = Router();

myRouter.use(bodyParser.json());

// GET /brands
myRouter.get("/api/brands", (request, response) => {
  // get brands json file directly  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsJson));
});

// GET /api/brands/:id/products
myRouter.get("/api/brands/:id/products", (request, response) => {
  let catCode = brandsJson[request.params.id].id;

  let results = productsJson;

  let results2 = results.filter(x => parseInt(x.categoryId) == catCode);

  if (!catCode) {
    response.writeHead(404);
    return response.end(
      "The brand you are searching for is not found or not available at our store"
    );
  }

  response.writeHead(200, {"Content-Type": "application/json" });
  return response.end(JSON.stringify(results2));
})

// GET /products
myRouter.get("/api/products", (request, response) => {
  // get products json file directly  
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsJson));
});

//GET retrieves resources.
//POST submits new data to the server.
//PUT updates existing data.
//DELETE removes data.

// POST /login
myRouter.post("/api/login", function(request, response) {
  // See if there is a user that has that username and password
  // let user = request.body.username;  //usersJson.filter((u) => username == "yellowleopard753");
  const loggedInUser = usersJson.find((u) => {
    return (
      u.login.username == request.body.username &&
      u.login.password == request.body.password
    );
  });

  if (loggedInUser) {
    // replace the access token to be for current user
    currentUser = request.body.username;
    // Write the header because we know we will be returning successful at this point and that the response will be json
    response.writeHead(200, { "Content-Type": "application/json" });
  } else {
    response.writeHead(401, "Invalid username or password");
  }
  
  return response.end(JSON.stringify(currentUser));
});

const cartHelper = () => {
  let selectedUser = usersJson.filter((x) => x.login.username === currentUser);
  return selectedUser[0].cart;
};

const updateCartHelper = (newCartItem) => {
  let userIndex = usersJson.findIndex((x) => (x.login.username = currentUser));
  usersJson[userIndex].cart.push(newCartItem);

  return usersJson[userIndex].cart;
}

// GET /api/me/cart
myRouter.get("/api/me/cart", function (request, response) {
  // get cart for user
  let cartUser = currentUser;

  if (!cartUser) {
    response.writeHead(
      401,
      "You need to login to view cart",
      CORS_HEADERS
    );
    return response.end();
  } else {

    let cart = cartHelper();

    if (cart = []) {
      // this only happens here temporarilty to get a more descriptive return, the cart in users.json is not impacted
      cart.push('The cart is empty');
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cart));
  }
})

// POST /api/me/cart
myRouter.post("/api/me/cart", function (request, response) {
  // get product id number from request
  let itemId = request.body.productId;

  let tempProducts = productsJson;
  let newCartProductArr = tempProducts.filter(
    (x) => parseInt(x.id) == parseInt(itemId)
  );
  let newCartProduct = newCartProductArr[0];
  let newCartBrand = brandsJson[newCartProduct.categoryId].name;

  let cart = cartHelper();
  let newCartObjectNumber = cart.length + 1;

  // if item not in cart, create object
  if (!cart.find((item) => item.cartProduct == cartProduct)) {
    let newCartItem = {
      cartObjectNumber: newCartObjectNumber,
      cartBrand: newCartBrand,
      cartProduct: newCartProduct.name,
      cartQuantity: 1,
    };

    let result = updateCartHelper(newCartItem);   

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(result));

  } else {
    response.writeHead(400, { "Content-Type": "application/json"})
    return "Selected sunglasses already in the cart!";
  }
})

// DELETE /api/me/cart/:productId
myRouter.delete("/api/me/cart/:productId", function (request, response) {
  let itemToRemove = parseInt(request.params.productId);
  let cart = cartHelper();

  if (cart.find(f => f.cartObjectNumber == itemToRemove)) {
    // if clicked, filter cart array to not include clicked one
    let newCart = cart.filter((c) => c.cartObjectNumber != itemToRemove);

    let result = updateCartHelper(newCart);

    // return new userCart
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(newCart));
  } else {
    response.writeHead(404);
    return response.end("Sunglasses Not Found in Cart");
  }
})

// POST /api/me/cart/:productId - change quantity in cart
myRouter.post("/api/me/cart/:productId", function (request, response) {
  let itemToChange = parseInt(request.params.productId);
  let cart = cartHelper();

  //console.log(cart.find(f => f.cartObjectNumber == itemToChange));
  if (cart.find((f) => f.cartObjectNumber == itemToChange)) {
    let tempIndex = cart.findIndex((f) => f.cartObjectNumber == itemToChange);

    // if clicked, filter cart array to not include clicked one
    cart[tempIndex].cartQuantity = cart[tempIndex].cartQuantity + 1;

    result = cartHelper();

    // return new userCart
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(result));
  } else {
    response.writeHead(404);
    return response.end("Sunglasses Not Found in Cart");
  }
});

module.exports = server;


