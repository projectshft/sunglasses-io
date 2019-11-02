var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// hold key elements of state
let brands = [];
let products = [];
let users = [];
let authorizedUsers = [ {email: 'natalia.ramos@example.com', token: 'random1661modnar'}];

// Create the router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((request, response) => {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });

  fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });

  console.log(`Server is listening on port: ${PORT}`);
});

// ROUTES //

// getting all the brands
myRouter.get("/api/brands", (request, response) => {
  response.writeHead(200, {
    'content-type': 'application/json'
  });
  response.end(JSON.stringify(brands));
});

// getting all the products for a given brand id
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  
  const brandProducts = products.filter((product) => product.categoryId === id);

  if (brandProducts.length) {
    response.writeHead(200, {
      'content-type': 'application/json'
    });
    return response.end(JSON.stringify(brandProducts));
  } else {
    response.writeHead(404, 'Brand does not exist');
    return response.end();
  }
});

// getting all the products
myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, {
    'content-type': 'application/json'
  });
  response.end(JSON.stringify(products));
});

// authorizing a user to login
myRouter.post("/api/login", (request, response) => {
  const { email, password } = request.body;
  
  if (email && password) {
    // get the user
    const user = users.find(user => user.email === email && user.login.password === password)

    if (user) {
      // give a session token and place user/token object in authorizedUsers
      token = uid(16);
      authorizedUsers.push({email, token});

      response.writeHead(200, {
        'content-type': 'application/json'
      });

      return response.end(JSON.stringify({ token }));
    } else {
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    }

  } else {
    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }
});

// Retrieving a user's cart
myRouter.get("/api/me/cart", (request, response) => {
  // separate the url to enable selecting query string
  const separatedUrl = request.url.split('?');
  
  // get the token
  const tokenObj = queryString.parse(separatedUrl[1])//.split('token:')[1];

  // check authorizedUsers to see if token exists and is valid
  if (tokenObj) {
    const authorizedUser = authorizedUsers.find(user => user.token == tokenObj.token)

    // if valid token return the cart
    if (authorizedUser) {
      response.writeHead(200, {
        'content-type': 'application/json'
      });
      
      // get user's cart
      const  user = users.find(user => user.email === authorizedUser.email)
      return response.end(JSON.stringify(user.cart));      
    } else { // invalid token
      response.writeHead(400, "Token is invalid");
      return response.end();
    }
  } else { // no token provided
    response.writeHead(400, "Token is missing");
    return response.end();
  }
});


module.exports = server;