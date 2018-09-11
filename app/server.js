var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// State holding variables
var products = [];
var user = {};
var users = [];
var brands = [];



// file system
fs.readFile(__dirname + '/../initial-data/products.json', 'utf8', (err, data) => {
    if (err) throw err;
    products = JSON.parse(data);
  });
  
fs.readFile(__dirname + '/../initial-data/brands.json', 'utf8', (err, data) => {
    if (err) throw err;
    brands = JSON.parse(data);
  });
  
fs.readFile(__dirname + '/../initial-data/users.json', 'utf8', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
    user = users[0];
  });


// Router setup
var myRouter = Router();
myRouter.use(bodyParser.json());

// Create server
http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

// list main endpoints
myRouter.get('/api/products', function(request,response) {
  response.writeHead(200, {'Content-Type':'application/json'});
  response.end(JSON.stringify(products));
  });

myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, {'Content-Type':'application/json'});
  response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:brandId/products', function(request,response) {
  var brandId = request.params.brandId;
  var foundProducts = products.filter(product => product.categoryId == brandId);
  response.writeHead(200, {'Content-Type':'application/json'});
  response.end(JSON.stringify(foundProducts));
});


myRouter.get('/api/me', function(request,response) {
  response.end(JSON.stringify(user));
  response.writeHead(200, {'Content-Type':'application/json'});
});

myRouter.post('/api/me/products/:productId/add', function(request,response) {
    let product = products.find((product)=> {
      return product.id == request.params.productId
    })
    user.addedProducts.push(product); 
    response.end();
  });
  
