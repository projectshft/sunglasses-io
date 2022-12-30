const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Products = require('./models/products')


const PORT = 3001;

// Setup router
var myRouter = Router();
//makes it so router uses middleware bodyParser to parse body to json
myRouter.use(bodyParser.json());

// variable value for 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

//creates web server object
let server = http.createServer(function (request, response) {
  const loadedProducts = JSON.parse(fs.readFileSync("./initial-data/products.json","utf-8"));
  console.log("hello");
  Products.addProducts(loadedProducts);
  Products.getAll();
  //final handler (have googled plenty of time and need someone to explain)
  myRouter(request, response, finalHandler(request,response));
})

server.listen(PORT);

myRouter
.get("/v1/products", (request, response) => {
  //Returns list of brands
  console.log("Bye");
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Products.getAll()))
})