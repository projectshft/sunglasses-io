const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;
const myRouter = Router();

//initialize data variables
let brands;
let products;
let users;

http.createServer(function (request, response) {
// handle initial OPTIONS request
    if (request.method === 'OPTIONS'){
        response.writeHead(200, CORS_HEADERS);
        response.end(200);
        }
//create execution of router
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
//create listening for errors
    if (error) {
        return console.log('Error on Server Startup: ', error)
      }
    
//read brands.json data and store it in variable on server
    fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

//read products.json data and store it in variable on server
    fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

//read users.json data and store it in variable on server
    fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });

})

//create handler for GET api.brands 

//create handler for GET api/brands/:id/products

//create handler for GET api/products

//create handler for GET api/me/

//create handler for GET api/me/cart

//create handler for POST api/me/cart

//create handler for POST api/me/cart/:productId

//create handler for DELETE api/me/cart/:productId

//create handler for POST api/login
