var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Products = require('../initial-data/products.json');
const Brands = require('../initial-data/brands.json');
const Users = require('../initial-data/users.json');

const PORT = 3001;

const myRouter = Router();
myRouter.use(bodyParser.json());

let state = {
    login: {
        username: '',
        password: ''
    },
    cart: []
}

http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    myRouter(request, response, finalHandler(request, response))
	}).listen(PORT, (error) => {
    	if (error) {
        console.log(error)
    	}
    	console.log(`Server is listening on port ${PORT} `)
});

myRouter.get('/api/brands', function (request, response) {
    response.end(JSON.stringify(Brands))
})

myRouter.get('/api/products', function (request, response) {
    response.end(JSON.stringify(Products))
})
