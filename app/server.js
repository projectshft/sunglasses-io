var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication",
}

let users = [];
let brands = [];
let products = [];

let router = Router();
router.use(bodyParser.json())

http.createServer(function (request, response) {
  if(request.method === 'OPTIONS') {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

  router(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if(error){
    console.log("Error on server startup: ", error);
  } else {
    console.log(`Server is listening at http://localhost:${PORT}`)
  }

 fs.readFile('initial-data/users.json', 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    users = JSON.parse(data);
    console.log("User data loaded")
  })

  fs.readFile('initial-data/brands.json', 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    brands = JSON.parse(data);
    console.log("Brand data loaded")
  });

fs.readFile('initial-data/products.json', 'utf-8', (err, data) => {
  if(err){
    throw err;
  }
  products = JSON.parse(data);
  console.log("Product data loaded")
})
});