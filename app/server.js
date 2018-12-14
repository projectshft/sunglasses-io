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

//
let brands, products, users;

http.createServer(function (req, res) {
  myRouter(req, res, finalHandler(req, res))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }
  fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
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
  console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/api/brands', (req,res) => {
    res.writeHead(200, CONTENT_HEADERS);
    res.end(JSON.stringify(brands));
}) 

myRouter.get('/api/brands/:id/products', (req,res) => {
  res.writeHead(200, CONTENT_HEADERS);
  const productsByBrand = products.filter(product => product.brandId == req.params.id);
  res.end(JSON.stringify(productsByBrand));
}) 

myRouter.get('/api/products', (req,res) => {

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

module.exports = myRouter;
