var http = require('https');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
var brands = [];
var products = {};
var users = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

fs.readFile( __dirname + '/initial-data/brands.json', 'utf8', function (err, data) {
    if (err) {
      throw err; 
    }
    // goals.push(data)
    brands = JSON.parse(data)
  });

fs.readFile( __dirname + '/initial-data/products.json', 'utf8', function (err, data) {
    if (err) {
      throw err; 
    }
    categories = JSON.parse(data)
  });

// GET /api/brands/:id/products
// GET /api/products
// POST /api/login

// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId

// get all brands
myRouter.get('/api/brands', function(request,response) {
  response.end(JSON.stringify(brands));
});

myRouter.get('/api/products', function(request,response) {
  response.end(JSON.stringify(user));
});

myRouter.get('/api/brands/:id/products', function(request,response) {

});

myRouter.get('/api/me/cart', function(request,response) {

});

myRouter.post('/api/me/cart', function(request,response) {

});

myRouter.delete('/api/me/cart/:productId', function(request,response) {

});

myRouter.post('/api/me/cart/:productId', function(request,response) {

});

// See how i'm not having to build up the raw data in the body... body parser just gives me the whole thing as an object.
// See how the router automatically handled the path value and extracted the value for me to use?  How nice!
myRouter.post('/v1/me/goals/:goalId/accept', function(request,response) {
  let goal = goals.find((goal)=> {
    return goal.id == request.params.goalId
  })
  user.acceptedGoals.push(goal); 
  response.end();
});