var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const VALID_API_KEYS = ["476b2e40-57d1-462c-a80e-37a778bfa335", "d1e9a4f4-7b40-4e69-b53e-d9b1f71714b3"];
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;

var brands = [];
var products = [];
var users = [];

const myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    if (request.method === 'OPTIONS') {
        response.writeHead(200, CORS_HEADERS);
        response.end();
    }
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
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

myRouter.get('/api/brands', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    let productsByBrand = products.filter((product) => {
        return product.categoryId == request.params.id;
    });
    response.end(JSON.stringify(productsByBrand));
})

// Use query to search products
myRouter.get('/api/products', (request, response) => {
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    response.end(JSON.stringify(products));
});