const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
// const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
// const uid = require('rand-token').uid;

// State holding variables
let brands = [];
let products = [];
// let users = [];

const PORT = process.env.PORT || 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(202);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, "127.0.0.1", (err) => {
  if (err) {
    throw err;
  } else{
    console.log(`Server running on port ${PORT}`);

    // Populate brands
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));

    // Populate products
    products =  JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));

    // Populate users
    users =  JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
  }
});

// GET all brands
router.get("/api/brands", (req, res) => {
  if (!brands) {
    res.writeHead(404, "There aren't any brands to return");
    res.end();
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(brands));
  }
});

// GET all products from a chosen brand
router.get("/api/brands/:categoryId/products", (req, res) => {
  const { categoryId } = req.params;
  const brand = brands.find(brand => brand.id == categoryId);
  if (!brand) {
    res.writeHead(404, "That brand does not exist");
    return res.end();
  } else {
    const relatedProducts = products.filter(product => product.categoryId === categoryId);
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(relatedProducts));
  }
});

// GET all products
router.get("/api/products", (req, res) => {
  if (!products) {
    res.writeHead(404, "There aren't any products to return");
    return res.end();
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    return res.end(JSON.stringify(products));
  }
});

module.exports = server;