var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Products = require('./app/models/products');
let Brands = require('./app/models/brands');

const PORT = 3001;

let products = [];

const router = Router();
router.use(bodyParser.json());

const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};


let server = http.createServer(function (request, response) {
    if(request.method === 'OPTIONS') {
        response.writeHead(200, CORS_HEADERS);
        return response.end();
    }
    router(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if(error) {
        return console.log(`Error on Server Startup`, error);
    }

    fs.readFile("initial-data/products.json", (error, data) => {
        if(error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile("initial-data/brands.json", (error, data) => {
        if(error) throw error;
        brands = JSON.parse(data);
        console.log(`Server set up: ${brands.length} brands loaded`);
    });
});

router.get('/products', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"}, CORS_HEADERS);
    return response.end(JSON.stringify(Products.getAll(products)));
});

router.get('/brands', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"},  CORS_HEADERS);
    return response.end(JSON.stringify(Brands.getAll(brands)));
});

router.get('/brands/:id/products', function(request, response) {
    if(request.params.id < brands.length) {
        response.writeHead(200, {"Content-Type": "application/json"}, CORS_HEADERS);
        return response.end(JSON.stringify(Brands.getProductsByBrandID(request.params.id, products)));
    } else {
        response.writeHead(404);
        return response.end('Brand not found');
    }
});

module.exports = server;