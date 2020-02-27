var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

let brands = [];
let users = [];
let products = [];
// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer((request, response) => {
    // Handle CORS Preflight request
  if (request.method === 'OPTIONS'){
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }
    // Verify that a valid API Key exists before we let anyone access our API
//   if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
//     response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
//     return response.end();
//   }

myRouter(request, response, finalHandler(request, response));
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

// Public route - all users of API can access
myRouter.get('/api/brands', function(request,response) {
    
    return response.end(JSON.stringify(brands))

  });