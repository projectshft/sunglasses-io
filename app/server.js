var http = require('http');
var fs = require('fs').promises;
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var path = require('path');
const { resourceUsage } = require('process');
const PORT = 3001;
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };


const myRouter = Router();
myRouter.use(bodyParser.json());

// State holding variables 
let brands = [];
let users = [];
let products = [];


function readJsonFile(filePath) {
  const absolutePath = path.join(__dirname, '..', filePath)
  return fs.readFile(absolutePath, 'utf8')
    .then(data => JSON.parse(data))
};

const validateToken = (requestToken) => {
  return users.some(user => user.accessToken === requestToken)
};

// Set up server
const server = http.createServer(function (request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

  if (!request.url.startsWith('/api/login')) {
    const requestToken = request.headers['x-authentication'];
    if (!validateToken(requestToken)) {
      response.writeHead(401, 'Unauthorized');
      return response.end('Unauthorized')
    };
  };

  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, async (error) => {
  if (error) {
    throw error
  }

  try {
    [brands, products, users] = await Promise.all([
      readJsonFile('./initial-data/brands.json'),
      readJsonFile('./initial-data/products.json'),
      readJsonFile('./initial-data/users.json')
    ]);
    console.log(`Server setup: ${brands.length} brands loaded, ${products.length} products loaded, ${users.length} users loaded`)
  } catch (error) {
    console.error(error)
    throw error;
  };
});


myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(brands))
});


myRouter.get('/api/brands/:id/products', function (request, response) {
  const brandId = request.params.id;

  if (isNaN(brandId)) {
    response.writeHead(400, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Invalid ID format' }))
    return;
  }

  const brandExists = brands.some(brand => brand.id === brandId);
  if (!brandExists) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Brand not found' }))
  }

  const productsByBrand = products.filter(product => product.categoryId === brandId)
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(productsByBrand))
});

myRouter.get('/api/products', function (request, response) {

  if (!products || products.length === 0) {
    response.writeHead(404, { 'Content Type': 'application/json' });
    response.end(JSON.stringify({ error: 'No products found' }))
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(products))
  }
});

myRouter.post('/api/login', function (request, response) {

  const { username, password } = request.body;

  const user = users.find(u => u.login.username === username && u.login.password === password);

  if (user) {

    const accessToken = uid(16);
    console.log(accessToken)
    user.accessToken = accessToken;

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ accessToken: accessToken }));

  } else {

    response.writeHead(401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Invalid username or password' }))
  }
});

myRouter.get('/api/me/cart', function (request, repsonse) {

});
module.exports = server;