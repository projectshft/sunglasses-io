
// set up required modules
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//==============================================================================

// set up router, port and variables
var myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;

let brandNames = [];
let productNames = [];
let userNames = [];

//==============================================================================

// Create the server
http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
  
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
//read files to get data
//data on brands 
fs.readFile('initial-data/brands.json', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
  brands.forEach((brandObject) =>{
    brandNames.push(brandObject.name);
  });
  console.log(brands);
  console.log(brandNames);
  console.log(`Server setup: ${brands.length} brands loaded`);
});
//data on products 
fs.readFile('initial-data/products.json', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
  products.forEach((productObject) =>{
    productNames.push(productObject.name);
  });
  console.log(productNames);
  console.log(`Server setup: ${products.length} products loaded`);
});
//data on users 
fs.readFile('initial-data/users.json', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  users.forEach((usersObject) =>{
    userNames.push(usersObject.name.first +' '+ usersObject.name.last);
  });
  console.log(userNames);
  console.log(`Server setup: ${users.length} users loaded`);
});

  console.log(`Server is listening on ${PORT}`);
});

//==============================================================================

//set up routes to different views

  //get home page, get all brands 
myRouter.get('/', function(request, response){

      response.writeHead(200, {'Content-type': 'text/plain/n'});
      response.write('Hello welcome to Carolina Sunglasses\n');
      response.write(`Brands are: ${brandNames}\n`);
      response.end('Thank you for shopping with us.');
});

// get all the products of a brand 
myRouter.get('/brands', function(request, response){

  response.writeHead(200, {'Content-type': 'text/plain/n'});
  response.write('That is a good choice\n');
  response.write(`Brand: ${brandNames}\n`);
  response.end('Thank you for shopping with us.');
});

//get all the products 
myRouter.get('/products', function(request,response){
  response.writeHead(200, {'Content-type': 'text/plain/n'});
  response.write('These are our products\n');
  response.write(`products: ${productNames}\n`);
  response.end('Thank you for shopping with us.');
});

//sign in page


// get cart page (view)


//show cart cart page???


//delete products from the cart


//add item to cart