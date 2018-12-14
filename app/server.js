var http = require('http');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const fs = require('fs');
const CONTENT_HEADERS = {"Content-Type": "application/json"};
const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//initial state variables
let brands, products, users;

//for sorting products by price
const compare = (a,b) => {
  console.log('first price', a.price);
  console.log('second price', b.price);
  return Number(a.price) > Number(b.price);
}

const server = http.createServer(function (req, res) {
  myRouter(req, res, finalHandler(req, res))
});

server.listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }
  brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
  users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
  products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
  console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/api/brands', (req,res) => {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(brands));
}) 

myRouter.get('/api/brands/:id/products', (req,res) => {
  const productsByBrand = products.filter(product => product.brandId == req.params.id);
  if (productsByBrand.length > 0) {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(productsByBrand));
  } else {
    res.writeHead(404, "Brand ID not found");
    res.end();
  }
}) 

myRouter.get('/api/products', (req,res) => {
  res.writeHead(200, CONTENT_HEADERS);
  res.end(JSON.stringify(products));
}) 

myRouter.post('/api/login', (req,res) => {

}) 

myRouter.get('/api/me/cart', (req,res) => {

}) 

myRouter.post('/api/me/cart', (req,res) => {

}) 

myRouter.delete('/api/me/cart/:productId', (req,res) => {

}) 

myRouter.post('/api/me/cart/:productId', (req,res) => {

})

module.exports = server;
