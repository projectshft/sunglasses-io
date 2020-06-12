var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
let brands = []
let products = []
let users = []

// Setup Router
const myRouter = Router()
myRouter.use(bodyParser.json())

const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
});

server.listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// GET api brands
myRouter.get('/api/brands', function(request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end(JSON.stringify(brands))
  });

// GET api brand products
myRouter.get('/api/brands/:id/products', function(request, response) {
  // return brand that matches id and save it as brand
  let brand = brands.find(brand => {
    if (brand.id == request.params.id) {
      return true
    }
  })
  if (!brand) {
    // If there isns't a brand with that id, return a 404
    response.writeHead(404, "That brand cannot be found");
    return response.end();
  } else {
    // if there is a successful brand id, save all the products of that brand in brandProducts
    let brandProducts = products.reduce((accumulator, currentValue) => {
      if (currentValue.categoryId == request.params.id) {
        accumulator.push(currentValue)
      }
      return accumulator;
    },[])
    response.writeHead(200, {'Content-Type': 'application/json'})
    return response.end(JSON.stringify(brandProducts))
  }
});

// GET all api products
myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, {'Content-Type': 'application/json'})
  return response.end(JSON.stringify(products))
});



module.exports = server