var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//state holding variables
let brands = [];
let products = [];
let users = [];
let AUTH_TOKENS = [];

//Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = module.exports = http.createServer(function (request, response) {

  myRouter(request, response, finalHandler(request, response));

  //add in error on start-up check
  })
  .listen(PORT, error => {

    if (error) {
      return console.log("Error on Server Startup: ", error);
    }

    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });

    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });

    console.log(`Server is listening on ${PORT}`);
  });

  //base route
myRouter.get("/", (request, response) => {
  response.end("There's nothing to see here, please visit /api/brands and carry on.");
});

//public routes
myRouter.get("/api/brands", (request, response) => {
  response.writeHead(200, {
    'content-type': 'application/json'
  });
  response.end(JSON.stringify(brands));
});

//for this route, id is our brand's, and is referenced as a categoryId string within Product 
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const productsOfSearchedBrand = products.filter(product => {
    return product.categoryId == id;
  })

  response.writeHead(200, {
    'content-type': 'application/json'
  });
  response.end(JSON.stringify(productsOfSearchedBrand));
});

myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, {
    'content-type': 'application/json'
  });
  response.end(JSON.stringify(products));
});
