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

const server = http.createServer((request, response) => {
  myRouter(request, response, finalHandler(request, response));
})
.listen(PORT, () => {
  products = 
    JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('../initial-data/users.json'), 'utf-8');
  console.log(PORT);
});

// Route for Brands Endpoint
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

module.exports = server;
lkjydckmut,ktyfil,oyddtte