var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
const url = require("url");
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//state holding variables
let brands = [];
let users = [];
let user = {};
let products = [];

const PORT = process.env.PORT || 8080;

//setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//setup server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

  users = JSON. parse(fs.readFileSync("initial-data/users.json", "utf-8"));

  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
});

myRouter.get('/brands', (request,response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
})

myRouter.get('/brands/:id/products', (req, res) => {
  const { id } = req.params;
  const productsResult = products.filter(product => product.categoryId == id);
  const brand = brands.find(brand => brand.id == id);
  
  if (!brand) {
    res.writeHead(404, "That brand does not exist");      
    return res.end();  
  } else if (!productsResult) {
    res.writeHead(404, "No products found");    
    return res.end();
  } else {
  res.writeHead(200, {"Content-Type": "application/json"});    
  return res.end(JSON.stringify(productsResult));
  }
})

myRouter.get('/products', (req, res) => {
  console.log(req);
  const parsedUrl = url.parse(req.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  let productsToReturn = [];

  if (query !== undefined) {
    productsToReturn = products.filter(product => {
      return product.description.includes(query) || product.name.includes(query)
    });

    if (!productsToReturn) {
      res.writeHead(404, "No products match the search query");
      return response.end();
    } 
  } else {
    productsToReturn = products;
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  return res.end(JSON.stringify(productsToReturn));
})

module.exports = server;