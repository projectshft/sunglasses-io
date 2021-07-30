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
    return response.end("Brand Not in Stock");
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
    let selectedUser = usersJson.filter((x) => x.login.username === cartUser);
    let cart = selectedUser[0].cart;
    console.log(selectedUser[0].cart);

    if (cart = []) {
      // this only happens here temporarilty to get a more descriptive return, the cart in users.json is not impacted
      cart.push('The cart is empty');
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cart));
  }
})

// POST /api/me/cart - use deep here
myRouter.post("/api/me/cart", function (request, response) {
  // want to push to users.js cart, need a model to do that
  // need item selected to go into cart, same hangup as login

  // get object from products.json, get brand from brands.json, output return
  // {
  //   cartId:
  //   brand:
  //   color:
  //   quantity:
  // }


//   const fileData = JSON.parse(fs.readFileSync('sample.json'))
// fileData.push(newData)
// Write the new data appended to previous into file

// fs.writeFileSync('sample.json', JSON.stringify(fileData, null, 2));

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cart));
})


module.exports = server;


