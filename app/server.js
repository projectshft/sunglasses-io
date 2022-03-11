var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
const url = require("url");
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 5050;

let brands = [];
let products = [];
let users = [];
let accessTokens = [];
const newAccessToken = uid(16);

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

  const parsedUrl = url.parse(req.url,true);
  const query = parsedUrl.query;
  let {q} = query

  let queriedProducts = [];

  if(q.length === 0 ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(products));
  }

  else if (q.length>0) {
    queriedProducts = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
      if(queriedProducts.length > 0 ) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(queriedProducts));
      }
      else {
      res.writeHead(404, 'No products were found related to your search term');
      return res.end();
     }
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


//Route for login information
router.post('/api/login', (req, res) => {
    // Make sure there is a username and password in the request
    if (req.body.username && req.body.password) {
      // See if there is a user that has that username and password
      let user = users.find((user) => {
        return user.login.username === req.body.username && user.login.password === req.body.password;
      });

      //If user, success and then retrieve an existing or create an access token
      if (user) {
        res.writeHead(200, {'Content-Type': 'application/json'});
  
      //Checking for already existing token
        let currentAccessToken = accessTokens.find((tokenObject) => {
          return tokenObject.username == user.login.username;
        });
  
        // // Update the last updated value so we get another time period
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();
          return res.end(JSON.stringify(currentAccessToken.token));
        } 
        
        else {
        //   // Create a new token with the user value and a "random" token
          let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }

          //Returning a token ONLY so account for this in testing
          accessTokens.push(newAccessToken);
          return res.end(JSON.stringify(newAccessToken.token));
        }
      } 
      
      else {
        //Failed login
        res.writeHead(401, "Invalid username or password");
        return res.end();
      }
  }   
  //Missing parameters in login
  else {
    res.writeHead(400, "Please enter both a valid username and passport");
    return res.end();
  }
});

// Helper method to process access token
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
    });

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

let currentAccessToken = accessTokens.find((accessToken) => {
  return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
});


module.exports = server;