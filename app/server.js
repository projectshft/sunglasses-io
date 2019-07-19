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

const server = http.createServer(function (request, response) {

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
  //check id data type is applicable
  if (!Number.isInteger(parseInt(id))){
    response.writeHead(404, 'id must be a number.');
    return response.end();
  }

  const productsOfSearchedBrand = products.filter(product => {
    return product.categoryId === id;
  })
  //check if brand ID exists
  if(productsOfSearchedBrand.length === 0){
    response.writeHead(404, "Brand not found.");
    return response.end();
  }

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

myRouter.post("/api/login", (request, response) => {
  //grab info from request body
  const { email, password } = request.body;
  
  if (email && password) {
    //find user
    let user = users.find((user) => {
      return user.email == email && user.login.password == password;
    });
    
    if(!user){
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }

    response.writeHead(200, {
      'content-type': 'application/json'
    });
    response.end(JSON.stringify({}));
  } else {

    response.writeHead(400, "Incorrectly formatted request");
    return response.end();
  }
});

//For testing, yo.
module.exports = server;