var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let brand = require('../initial-data/brands')


const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//State holding variables
let brands = [];
let users = [];
let products = [];
let cart = [];
let accessTokens = [];

var server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
})
.listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8")) 

    products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")) 

    users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf8"))

  });




// Pull all brands
myRouter.get("/api/brands", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(brands));
  });



// pull all products
myRouter.get("/api/products", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(products));
  });  

module.exports=server;

//Login info
myRouter.post('/api/login', function(request,response) {
    if (request.body.email && request.body.password) {
        let user = users.find((user)=>{
            return user.email == request.body.email && user.login.password == request.body.password;
    });

    if (user) {   
        response.writeHead(200, 
        {'Content-Type': 'application/json'}
        );
    } else {
      response.writeHead(404, 
      "Invalid email or password");
      response.end();
    }
    } 
});


// Pull all cart items (should be something like this. not functional but here is the shell)
myRouter.get("/api/me/cart", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(cart));
  });

  // update all cart items (should be something like this. not functional but here is the shell)
myRouter.post("/api/me/cart", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(cart));
  });

    // add cart items (should be something like this. not functional but here is the shell)
myRouter.post("/api/me/cart/:productId", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(cart));
  });

    // delete cart items (should be something like this. not functional but here is the shell)
    myRouter.delete("/api/me/cart/:productId", (request, response) => {
        response.writeHead(
            200,
            { 'Content-Type': 'application/json' }
          );
        response.end(JSON.stringify(cart));
      });