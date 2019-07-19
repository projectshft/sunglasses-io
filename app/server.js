var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


//set variable for 200 header
const header = {'Content-Type': 'application/json'};

//set default variables
let products = [];
let brands =[];
let users = [];

const PORT = 3001;

//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = module.exports = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request,response))
}).listen(PORT, () => {
    //extract the products data and save it into a  products variable
    //array of objects
    products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
    //extract the brands data and save it into a products variable
    //array of objects
    brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
   //array of objects 
    //extract the user data and savi it into a users variable
    users = JSON.parse(fs.readFileSync('../initial-data/users.json'), 'utf-8')
    

});

//creater a route for the /products endpoint
myRouter.get('/api/products', function(request, response) {
    response.writeHead(200, header);
    return response.end(JSON.stringify(products));
})




