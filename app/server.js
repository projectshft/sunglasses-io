var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
let brands = [];
let users = [];
let user = {};
let products = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

//Server Data Setup
http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, ()=> {
    brands = JSON.parse(fs.readFileSync('brands.json','utf-8'));
    users = JSON.parse(fs.readFileSync('users.json','utf-8'));
    user = users[0];
    products = JSON.parse(fs.readFileSync('products.json','utf-8'));
});

