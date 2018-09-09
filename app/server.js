var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449","1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

//state holding variables
var brands = [];
var products = [];
var users = [];

//possibly adding tokens
var failedLoginAttempts = {};
var uid = require('rand-token').uid;
var accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());
http.createServer(function (request, response) {
if (request.method === 'OPTIONS') {
  response.writeHead(200, CORS_HEADERS);
  response.end();
}
// Verify that a valid API Key exists before we let anyone access our API
/*
if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
  response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
  response.end();
}
*/
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
if (error) {
  return console.log('Error on Server Startup: ', error)
}


fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
});
fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
});
fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
});
console.log(`Server is listening on ${PORT}`);
});
// Public route - all users of API can access
myRouter.get('/api/brands', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    response.end(JSON.stringify(brands));
});
myRouter.get('/api/brands/:id/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    let productsByBrand = products.filter((product) => {
        return product.categoryId == request.params.id;
    });
    response.end(JSON.stringify(productsByBrand));
})
myRouter.get('/api/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
    response.end(JSON.stringify(products));
}); 
// Only logged in users can access
/*
// example using authentication
myRouter.get('/api/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    response.end(JSON.stringify(products));
}); 
*/