var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;

let brands = [];
let NumofBrands = 5;

//set up server
const PORT = 3001;


// Setup router
const router = Router();
router.use(bodyParser.json());

//set up server
const server = http.createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
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
    user = users[0];
    
  });

  const saveCurrentUser = (currentUser) => {
    // set hardcoded "logged in" user
    users[0] = currentUser;
    fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
  }


  //RETURNS ALL BRANDS
  router.get("/api/brands", (request, response) => {
    //is there no need for a query since they are all being returned?
    if (!brands) {
      response.writeHead(404, "No brands to return");
      return response.end();
    } else 
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(brands));
    });

    //GET PRODUCTS BY BRAND ID
    router.get("/api/brands/:id/products", (request, response) => {
      const { id } = request.params;
      const productList = products.filter(product => product.categoryId.includes(id));
      const numId = parseInt(id, 10)
      
      if (numId >= NumofBrands) { //hardcode number of brands. this says that the number of brands can't be more than 5, probably a better way to do this
        response.writeHead(404, "That brand does not exist");
        return response.end();
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(productList));
    });

    //GET PRODUCTS BY SEARCH
    router.get("/api/products", (request, response) => {
      const parsedUrl = url.parse(request.originalUrl); //parse the url to get the query
      const { query } = queryString.parse(parsedUrl.query);
      let productsToReturn = [];
      if (query) {//if the query is defined, filter the products by query and assign them to productsToReturn
        productsToReturn = products.filter(product => product.description.includes(query));

        if (productsToReturn.length == 0 ) {//if the query is defined but there are no goals to return, 404 error || I tried to use (!productsToReturn) but this didn't work
          response.writeHead(404, "There aren't any goals to return");
          return response.end();
        }
      } else {
        productsToReturn = products;
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(productsToReturn));
    });

module.exports = server
