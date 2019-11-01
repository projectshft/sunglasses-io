var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// hold key elements of state
let brands = [];
let products = [];
let users = [];
let authorizedUsers = [
  {
    email: 'randomemail@gmail.com',
    token: 'token123'
  }
];

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
  const {id} = request.params;

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


module.exports = server;