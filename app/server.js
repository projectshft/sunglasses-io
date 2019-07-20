var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const hostname = 'localhost';
const PORT = 3001;

//State holding variables
let brands = [];
let products = [];
let users = [];
let user = {};
let accessTokens = [];

//Router set up
var myRouter = Router();
myRouter.use(bodyParser.json());


const server = module.exports = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  //load data from files into server memory
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'));
  // user = users[0];
});
//return brands of sunglasses
myRouter.get('/api/brands', function(request, response){
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(brands));
});


myRouter.get('/api/brands/:id/products', function(request, response){
  // brand id retrieved from params
  const { id } = request.params;
  let productsByBrand = [];
  productsByBrand = products.filter(product => product.categoryId === id);
  if(productsByBrand.length === 0){
   response.writeHead(404, 'Brand not found');
   return response.end();
  } else {
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(productsByBrand));
  }
});
//return products by search
myRouter.get('/api/products', function(request, response){
  if(request._parsedUrl.query === null || !request._parsedUrl.query.includes('=')){
    response.writeHead(400, 'Invalid Request Format');
    return response.end();
  }
  //isolate query from path, use lowercase so case mismatch won't impact return
  let searchString = request._parsedUrl.query.toLowerCase();
  let queryObject = queryString.parse(searchString);
  //new array with filtered results of products that match query
  let searchResults = products.filter(product => {
    let productName = product.name.toLowerCase();
    return productName.includes(queryObject.query);
  });
  if(searchResults.length === 0){
    response.writeHead(404, 'No matching results found');
    return response.end();
  }
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(searchResults));
});

myRouter.post('/api/login', function(request, response){
  let email = request.body.email;
  let password = request.body.password;
  
  //find user that matches info sent in body of request
  let foundUser = users.find((user) => {
    return user.email === request.body.email && user.login.password === request.body.password  
  });
  
  //if that user is found, return an access token 
  if(foundUser) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    let token = uid(16);
    return response.end(JSON.stringify({'token': token}));
    } else {
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    }
  
})