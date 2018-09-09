var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//if it isn't reading the file might have to reference the folder
fs.readFile("./initial-data/brands.json", 'utf8', (err, data) => {
    if (err) throw err;
    brands = JSON.parse(data);
  });
  
  fs.readFile("./initial-data/products.json", 'utf8', (err, data) => {
    if (err) throw err;
    products = JSON.parse(data);
  });
  
  fs.readFile("./initial-data/users.json", 'utf8', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
  });

//State holding needed variables
var brands = [];
var products = [];
var user = {};

//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

myRouter.get('api/brands', function(request, reponse){
    response.writeHead(200, {'Context-Type':'application/json'});
    response.end(JSON.stringify(brands));
});
