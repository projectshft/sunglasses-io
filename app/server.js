var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var newAccessToken = uid(16);

const PORT = 3001;

// State holding variables
let brands = [];
let products = [];
let users = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} users loaded`);
    });
    fs.readFile("products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} stores loaded`);
    });
    fs.readFile("users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

myRouter.get('/api/', function(request,response) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify());
});

