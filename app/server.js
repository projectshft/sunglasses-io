
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

// if(!module.parent){
//     app.listen(3001);
// }

const PORT = 8080;
const host = 'localhost'

const patrickRouter = Router();
patrickRouter.use(bodyParser.json());

//global variable set up for state

var brands = [];
var products = [];
var users = [];

const Server = module.exports = http.createServer(function (request, response) {
    patrickRouter(request, response, finalHandler(request, response)) 
}).listen(PORT, ()=>{
    //brands initial testing set up
    brands = JSON.parse(fs.readFileSync("../initial-data/brands.json","utf-8"));
    //users initial set up for testing
    products = JSON.parse(fs.readFileSync("../initial-data/products.json","utf-8"));
    users = JSON.parse(fs.readFileSync("../initial-data/users.json","utf-8"));
    //products initial testing set up
    
});

patrickRouter.get("/api/brands", (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'
    });
    return response.end(JSON.stringify(brands));


});

// patrickRouter.get("/api/products", (request, response) => {
//     response.writeHead(200);
//     return response.end(JSON.stringify(products));
    

// });


// patrickRouter.get("/api/users", (request, response) => {
//     response.writeHead(200);
//     return response.end(JSON.stringify(users));
    

// });

