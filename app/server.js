var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
const url = require("url");
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

let brands = [];
let products = [];
let users = [];


let server = http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
}).listen(PORT, err => {
  if (err) throw err;

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));

  console.log(`server running on port ${PORT}`);
});

router.get("/api/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  
  let brandToReturn = [];
  if (query !== undefined) {
    brandToReturn = brands.filter(brand => brand.name.includes(query))
    // if (!brandToReturn) {
    //   response.writeHead(404, "No brand with that name found");
    //   return response.end();
    // }
  }
  else {
    brandToReturn = brands;
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandToReturn));
})

router.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id === id);
  if (brand) {
    let brandsProducts = products.filter(product => product.categoryId === brand.id);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brandsProducts));
  }
  else {
    response.writeHead(404, "No brand found");
    return response.end();
  }
});

router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);

  let productsToReturn = []
  if (query !== undefined) {
    productsToReturn = products.filter(product => product.name.includes(query) || product.description.includes(query))
  }
  else {
    productsToReturn = products
  }
 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn))
})

router.post("/api/login", (request, response) => {
  
})
// module.exports = server;