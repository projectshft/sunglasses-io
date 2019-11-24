
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var url = require("url");

// if(!module.parent){
//     app.listen(3001);
// }

const PORT = 8080;

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

let currentAccessToken = accessTokens.find((accessToken) => {
  return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
});

//router to json works
const patrickRouter = Router();
patrickRouter.use(bodyParser.json());

//global variable set up for state

var brands = [];
var products = [];
var users = [];
let accessTokens = [];

// Helper method to process access token
const getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == parsedUrl.query.accessToken;
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


const Server = module.exports = http.createServer(function (request, response) {
    patrickRouter(request, response, finalHandler(request, response)) 
}).listen(PORT, ()=>{
    //brands initial testing set up
    brands = JSON.parse(fs.readFileSync("../initial-data/brands.json","utf-8"));
    //users initial set up for testing
    products = JSON.parse(fs.readFileSync("../initial-data/products.json","utf-8"));
    users = JSON.parse(fs.readFileSync("../initial-data/users.json","utf-8"));
    //products initial testing set up
    
});

patrickRouter.get("/api/brands", (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'
    });
    return response.end(JSON.stringify(brands));


})




patrickRouter.get("/api/products", (request, response) => {
  const query = queryString.parse(parsedURL.query);
  if (query !== Number) {

    response.writeHead(400, "Please enter a number representing the id")
    response.end();
  } else {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(products));

  }
   
});
  





patrickRouter.get("/api/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, "Unauthorized access to cart");
    response.end();
  } else {

    let userLogin = users.find((user)=>{
      return user.body.email == request.body.email && user.login.password == request.body.password;
    });
    if(user) {
      resquest.writeHead(200, {'Content-Type': 'application/json'})
      response.end(JSON.stringify(userLogin.cart));


    } else {
      response.writeHead(404, "Request not found")
      response.end();
    }
  
  }
})

//setup for posting and deleting cart
patrickRouter.post("/api/me/cart", (request, response) => {
    if (!currentAccessToken) {
      return res.end("Unauthorized access to cart");
    }
  
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(userLogin.cart))
  })
  
patrickRouter.delete("/api/me/cart", (request, response) => {
    if (!currentAccessToken) {
      return res.end("Unauthorized access to cart");
    }
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(userLogin.cart))

})

module.exports = Server;