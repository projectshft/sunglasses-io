const http = require('http');
const finalHandler = require('finalhandler');
const Router = require("router");
const bodyParser   = require('body-parser');
const fs = require('fs');
const url = require("url");
const queryString = require('querystring');
var uid = require('rand-token').uid;

// State holding variables
let brands = [];
let user = {};
let products = [];
let users = [];

const PORT = process.env.PORT || 3001;

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((req, res) => {
    res.writeHead(200);
    myRouter(req, res, finalHandler(req, res));
  });
  
  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
    //populate brands 
    brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
    //populate products
    products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
    //populate users
    users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
    // hardcode "logged in" user
    
  });


const saveCurrentUser = (currentUser) => {
  // set hardcoded "logged in" user
  users[0] = currentUser;
  fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
}

//GET all the brands
myRouter.get("/api/brands", (request, response) => {

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

//GET all products of a particular brand
myRouter.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id == id);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedBrands = brands.filter(
    brand => brand.id === id
  );
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(relatedBrands));
});

//GET all the products
myRouter.get("/api/products", (request, response) => {

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});


module.exports = server;