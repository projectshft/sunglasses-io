var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

// This function is a bit simpler...
http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(3001, () => {
  // Load dummy data into server memory for serving
  brands = JSON.parse(fs.readFileSync("brands.json","utf-8"));
  
  // Load all products into products array and for now hardcode 
  products = JSON.parse(fs.readFileSync("products.json","utf-8"));
  products = users[0];
  
  // Load all users from JSON file
  users = JSON.parse(fs.readFileSync("users.json","utf-8"));
});

// Notice how much cleaner these endpoint handlers are...
myRouter.get('/api/brands', function(request,response) {
  // Get our query params from the query string
  const queryParams = queryString.parse(url.parse(request.url).query)



  // TODO: Do something with the query params
  var searchBrands = brands.filter(function (brand) {
    if (brand.platform.includes 'params') {
      return true;
    }
  });
  
  // Return all our current goal definitions (for now)
  return response.end(JSON.stringify(goals)



module.exports =  server