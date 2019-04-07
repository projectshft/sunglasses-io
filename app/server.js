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

var server = http.createServer(function (request, response) {

    myRouter(request, response, finalHandler(request, response));

})
.listen(PORT, error => {
//     // if (error) {
//     //   return console.log("Error on Server Startup: ", error);
//     // }
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8")) 

    products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")) 

// //     fs.readFile("users.json", "utf8", (error, data) => {
// //       if (error) throw error;
// //       users = JSON.parse(data);
// //       console.log(`Server setup: ${users.length} users loaded`);
// //     });
// //     console.log(`Server is listening on ${PORT}`);
  });




// Public route - all users of API can access
myRouter.get("/api/brands", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(brands));
  });


myRouter.get("/api/brands", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(brands));
  });


myRouter.get("/api/products", (request, response) => {
    response.writeHead(
        200,
        { 'Content-Type': 'application/json' }
      );
    response.end(JSON.stringify(products));
  });  

module.exports=server;