var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];

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

  router.get("/api/brands", (request, response) => {
//is there no need for a query since they are all being returned?
    if (!brands) {
      response.writeHead(404, "No brands to return");
      return response.end();
  } else 
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(brands));
  });


