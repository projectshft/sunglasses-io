var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// stand in variables for dummy api values
let brands = [];
let products = [];
let users = [];
let user = [];

// setup router
var myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = 3001;


let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
    brands = JSON.parse(fs.readFileSync("brands.json", "utf-8"));
    products = JSON.parse(fs.readFileSync("products.json", "utf-8"));
    users = JSON.parse(fs.readFileSync("users.json","utf-8"));
    user = [0];

    //console.log(brands);
});

myRouter.get('/brands', function(request,response) {    
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
}); 












module.exports = server;