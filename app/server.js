const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

const PORT = 8080;

//state variables
let brands = [];
let products = [];
let users = [];

// router setup
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    myRouter(req, res, finalHandler(req, res));
  })
  .listen(PORT, err => {
    if (err) throw err;
    console.log(`server runnin on port ${PORT}`);
    //populate brands
    fs.readFile("initial-data/brands.json", "utf-8", (err, data) => {
      if (err) throw err;
      brands = JSON.parse(data);
    });
    //populate products
    fs.readFile("initial-data/products.json", "utf-8", (err, data) => {
      if (err) throw err;
      products = JSON.parse(data);
    });
  });


// have to configure routes

// get /api/brands 
myRouter.get("/api/brands", (req, res) => {
  res.end(JSON.stringify(brands));
});

// get /api/products/:id 
// one product
myRouter.get("/api/products/:id", (req, res) => {
  fs.readFile("initial-data/products.json", "utf-8", (err, data) => {
    if (err) throw err;
    const { id } = req.params;
    res.end(JSON.stringify(products[id]));
  });
});

// get /api/products 
// all products
myRouter.get("/api/products", (req, res) => {
  res.end(JSON.stringify(products));
});

// get /api/brands/:id/products 
// specific brand
myRouter.get("/api/brands/:id/products", (req, res) => {
  const { id } = req.params;
  const relatedProducts = products.filter(product => product.categoryId === id);
  res.end(JSON.stringify(relatedProducts));
});

// post /api/login
myRouter.post("/api/login", (req, res) => {});

module.exports = server;