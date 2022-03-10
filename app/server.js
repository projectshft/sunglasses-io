var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 8000;

let brands = [];
let products = [];
let users = [];

// Setup router
const router = Router();
router.use(bodyParser.json());

// Server setup
const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

//Listen on port
server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));

  
});

//Route for brands
router.get('/api/brands', (req,res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
});

//Route for all products
router.get('/api/products', (req,res) => {
  const queryParams = queryString.parse(url.parse(req.url).query);
//FIGURE OUT THIS HOW TO ISOLATE QUERY PARAMATERS - need to look this up. Qyert string deprecated!
  if (queryParams) {
    const queryProds = products.filter(p => p.name.toLowerCase().includes(queryParams.toLowerCase()));
     if(queryProds.length === 0 ) {
      res.writeHead(404, 'No products were found related to your search term');
      return res.end();
     }
     else {
    return res.end(JSON.stringify(queryProds));
  }
}
  else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(products));
  }
});



//Route for products of a specific brand
router.get('/api/brands/:id/products', (req, res) => {
  const {id} = req.params;
  const brandProducts= products.filter(p => p.categoryId === id);

  if (brandProducts.length === 0) {
    res.writeHead(404, 'No products by this brand were found');
    return res.end();
  }

  else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brandProducts));
  }
});




module.exports = server;