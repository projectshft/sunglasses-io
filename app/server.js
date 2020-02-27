var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let chai = require('chai');
let chaiHttp = require('chai-http');
//let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);

const PORT = 3001;
// State holding variables
let products = [];
let users = [];
let brands = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
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
    console.log(`Server is listening on ${PORT}`);
});

// Public route - all users of API can access
myRouter.get("/api/brands", (request, response) => {
    if (!brands) {
        response.writeHead(404, 'No brands found');
        response.end();
    }
    response.writeHead(200, 'Retrieved all brands')
    response.end(JSON.stringify(brands));
});

// export to test file for Chai
module.exports = server