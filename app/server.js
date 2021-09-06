var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
var router = Router();
router.use(bodyParser.json());

// Frontend
// localhost: 3000 -> UI -> get me all the brands from API -> localhost:3001/api/brands -> render
// fetch("openweathermap.com/....")
// API
// localhost: 3001 -> API

// localhost:3001/
// openweathermap.com/api/weather

// localhost:3001/api/brands
router.get('/api/brands', function (req, res) {
  console.log('hit brand');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  // Read the brands file and write the brands as a response
  const data = fs.readFileSync("initial-data/brands.json");
  res.end(data);
});

// Get all the products matching the brand id = categoryId
router.get('/api/brands/:id/products', function (req, res) {
  const { id } = req.params;
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const products = JSON.parse(fs.readFileSync("initial-data/products.json"));

  const brandProducts = [];

  for (let i = 0; i < products.length; i++) {
    if (products[i].categoryId === id) {
      brandProducts.push(products[i]);
    }
  }

  res.end(JSON.stringify(brandProducts));
});

http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response))
}).listen(PORT);