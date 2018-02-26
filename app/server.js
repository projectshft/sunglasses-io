var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// var url = require('url');

const PORT = 3001;
// Setup router
var router = Router();
router.use(bodyParser.json());

var brands;
fs.readFile('brands.json', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
  // brand = brands[0];
});
var products;
fs.readFile('products.json', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
  // brand = brands[0];
});
var users;
fs.readFile('users.json', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  // brand = brands[0];
});

http.createServer(function (req, res) {
  router(req, res, finalHandler(req, res));
}).listen(PORT);
console.log("Server is listening...");

router.get('/api/products', (req, res) => {

  var params = queryString.parse(req._parsedUrl.query);
  var queryLimit = parseInt(params.limit);
  var searchedTerm = params.product;

  var limit;
  if(isNaN(queryLimit)) {
    console.log('No limit param')
    limit = 5
  } else {
    limit = queryLimit
  }

  
  var foundProducts;
  if(!searchedTerm) {
    foundProducts = JSON.stringify(products.slice(0, limit));
    
  } else {
    foundProducts = JSON.stringify(
      products.find((product) => {
        return product.name.toLowerCase() === searchedTerm.toLowerCase()
      })
    );
  }
  if(!foundProducts) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('The server has not found anything matching the Request,\n query parameter product is not valid or does not exist.\n');
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(foundProducts);
  }

});

router.get('/api/brands', (req, res) => {
  var params = queryString.parse(req._parsedUrl.query);
  var queryLimit = parseInt(params.limit);

  var brandsResponse = (limit) => {
    var brandsFound = JSON.stringify(brands.slice(0, limit));
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(brandsFound);
  }
  
  var limit;
  if(isNaN(queryLimit)) {
    console.log('No limit param')
    limit = 5
    brandsResponse(limit);
  } else {
    limit = queryLimit
    brandsResponse(limit);
  }
  
});

router.get('/api/brands/:id/products', (req, res) => {
  console.log(brands)
  res.end(JSON.stringify(brands));
});

router.post('/api/login', (req, res) => {

  res.end('Logged in');
});

router.get('/api/me/cart', (req, res) => {
  console.log(users[0].cart)
  res.end(JSON.stringify(users[0].cart));
});

router.post('/api/me/cart', (req, res) => {
  res.end("Cart sent to checkout");
  
});
router.delete('/api/me/cart/:productId', (req, res) => {
  
  res.end("Product deleted from cart");
});

router.post('/api/me/cart/:productId', (req, res) => {
  res.end("Product added to cart");
  
});