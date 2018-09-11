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
var cart = [];



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

// Only managers can update a store's issues
myRouter.post('/api/stores/:storeId/issues', function(request,response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(401, "You need to have access to this call to continue", CORS_HEADERS);
    response.end();
  } else {
    // Verify that the store exists to know if we should continue processing
    let store = stores.find((store) => {
      return store.id == request.params.storeId;
    });
    if (!store) {
      // If there isn't a store with that id, then return a 404
      response.writeHead(404, "That store cannot be found", CORS_HEADERS);
      response.end();
      return;
    }

    // Check if the current user has access to the store
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // Only if the user has access to that store do we return the issues from the store
    if (user.storeIds.includes(request.params.storeId) && (user.role == "ADMIN" || user.role == "MANAGER" )) {
      store.issues = request.body;
      response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      response.end();
    } else {
      response.writeHead(403, "You don't have access to that store", CORS_HEADERS);
      response.end();
      return;
    }
  }
});
  
