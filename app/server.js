var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');

const uid = require('rand-token').uid;
const newAccessToken = uid(16);

const PORT = 3001;

// State holding variables
let brands = []
let products = []
let users = []

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
        }

    fs.readFile("products.json", "utf8", (error, data)=>{
        if 
    }
    }
)
