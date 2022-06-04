var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Products = require('./app/models/products');

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
});

router.get('/products', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(Products.getAll()));
});

module.exports = server;