var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let users = {};
let brands = [];
let products = []

const PORT = process.env.PORT || 8080

const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (req, res) {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);

fs.readFile("initial-data/brands.json", "utf-8", (err, data) => {
    if(err) throw err;
    brands = JSON.parse(data);
});

fs.readFile("initial-data/users.json", "utf-8", (err, data) => {
    if(err) throw err;
    users = JSON.parse(data);
});

fs.readFile("initial-data/products.json", "utf-8", (err, data) => {
    if(err) throw err;
    products = JSON.parse(data);
});

router.get("/api/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query, sort } = queryString.parse(parsedUrl.query);
  let brandsToReturn = []
  
  if (query !== undefined) {
    brandsToReturn = brands.filter(brand => brand.name.includes(query));
  
  if(!brandsToReturn){
    response.writeHead(404, 'We do not have that brand');
    return response.end();
  }
}
if (sort !== undefined) {
  brandsToReturn.sort((a, b) => a[sort] - b[sort]);
}
response.writeHead(200, { "Content-Type": "application/json" });
return response.end(JSON.stringify(brandsToReturn));
});

router.get("/v1/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query, sort } = querystring.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter(product =>
      product.name.includes(query)
    );

    if (!productsToReturn) {
      response.writeHead(404, "There aren't any goals to return");
      return response.end();
    }
  } else {
    productsToReturn = products;
  }
  if (sort !== undefined) {
    productsToReturn.sort((a, b) => a[sort] - b[sort]);
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

router.get("/api/login", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(users))
})
})



module.exports = server;