
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;


// if(!module.parent){
//     app.listen(3001);
// }

const PORT = 8080;
const host = 'localhost'

const patrickRouter = Router();
patrickRouter.use(bodyParser.json());

//global variable set up for state

var brands = [];
var products = [];
var users = [];
let accessTokens = [];


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


});

patrickRouter.get("/api/products", (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'
});
    return response.end(JSON.stringify(products));
    

});


patrickRouter.get("/api/users", (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'
});
    return response.end(JSON.stringify(products));
    

});


// Login call
patrickRouter.post('/api/login', function(request,response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
    let user = users.find((user)=>{
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      
      response.writeHead(200, {'Content-Type': 'application/json'});
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.writeHead(200, {'Content-Type': 'application/json'
});
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }

  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});
// module.exports = server; 
