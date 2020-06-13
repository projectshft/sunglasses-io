const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;

const products = require('../initial-data/products.json')
const users = require('../initial-data/users.json')
const brands = require('../initial-data/brands.json')

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

//Setup server
let server = http.createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

myRouter.get("/api/brands", (request, response) => {
    //return all brands
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brands));
});

myRouter.get("/api/brands/:brandId/products", (request, response) => {
    //find all products with selected brand
    let brandedProducts = products.filter(product => {
        return product.categoryId = request.params.brandId;
    });

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brandedProducts));
});

//   myRouter.get("/api/products", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.post("/api/login", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.get("/api/me/cart", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.post("/api/me/cart", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.delete("/api/me/cart/:productId", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.post("/api/me/cart/:productId", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });


module.exports = server;