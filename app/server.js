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
// fetch( like in "openweathermap.com/....")
// API
// localhost: 3001 -> API

// localhost:3001/


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

//GET products
router.get('/api/products', function (req, res) {
  console.log('get the products');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  //  Read the products file and write the products as a response
  const data = fs.readFileSync("initial-data/products.json");
  res.end(data)
});

//GET cart
router.get('api/me/cart', function (req, res) {
  console.log('get the cart items');
  res.setHeader('Content-Tyype', 'text/plain; charset=utf-8');
  //  Read the cart file and write the cart as a response
  const data = fs.readFileSync("initial-data/cart.json");
  res.end(data)
});

//POST login
router.post('/api/login', function (req, res) {
  console.log('user login');
  if (request.body.username && request.body.password) {
    let currentUser = users.find(user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      )
    }
  }
})

// POST api/me/cart
router.post('/api/me/cart', function (req, res) {
  console.log('show my cart');
  
})



http.createServer(function (request, response) {
  router(request, response, finalHandler(request, response))
}).listen(PORT);