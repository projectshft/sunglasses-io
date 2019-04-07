var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
var url = require("url");
const header = { "Content-Type": "application/json" };
const PORT = 3001;
let accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

//Returning all brands
myRouter.get("/api/brands", function(request, response) {
  response.writeHead(200, "Successful operation", header);
  response.end(JSON.stringify(brands));
});

//Returning all products based on brandId
myRouter.get("/api/brands/:brandId/products", function(request, response) {
  requestedId = parseInt(request.params.brandId);
  //All valid ids should be capable of being parsed to an int. If the input is NaN we know it's bad input.
  if (isNaN(requestedId) || requestedId < 1) {
    response.writeHead(400, "Invalid brandId supplied");
    response.end();
  }
  //Checking brands data to see if brandId exists.
  requestedBrandProducts = products.filter(
    product => product.categoryId === request.params.brandId
  );
  if (requestedBrandProducts.length != 0) {
    response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(requestedBrandProducts));
  } else {
    response.writeHead(404, "Brand id not found");
    response.end();
  }
});

//Returning all products if no query string. If query exists then we search brands and products for a match.
myRouter.get("/api/products", function(request, response) {
  const queryData = url.parse(request.url).query;
  searchString = queryString.parse(queryData);
  if (Object.keys(searchString).length === 0) {
    response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(products));
  }
  //Since call has query data, check to see if length is as specified.
  if (searchString.query.length >= 1 && searchString.query.length <= 50) {
    //Search brands to get relevant brandId
    brandId = brands.find(
      brand => brand.name.toLowerCase() == searchString.query.toLowerCase()
    );
    //Search products for results
    if (brandId) {
      results = products.filter(product => product.categoryId == brandId.id);
      response.writeHead(200, "successful operation", header);
      response.end(JSON.stringify(results));
    } else {
      results = products.filter(
        product =>
          product.name.toLowerCase() == searchString.query.toLowerCase()
      );
      if (results.length > 0) {
        response.writeHead(200, "successful operation", header);
        response.end(JSON.stringify(results));
      } else {
        response.writeHead(404, "No results found.");
        response.end();
      }
    }
    //query length was not valid
  } else {
    response.writeHead(400, "Invalid search");
    response.end();
  }
});

myRouter.post("/api/login", function(request, response) {
  if (request.body.email && request.body.password) {
    let user = users.find(user => {
      return (
        user.email == request.body.email &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, "Login successful", header);

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find(tokenObject => {
        return tokenObject.email == user.email;
      });

      // If token already exists, return it
      if (currentAccessToken) {
        response.end(JSON.stringify({token: currentAccessToken.token}));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          email: user.email,
          token: uid(16)
        };
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify({token: newAccessToken.token}));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
  }
});

  // Helper method to process access token
  var getValidTokenFromRequest = function(request) {
    var parsedUrl = require('url').parse(request.url, true);
    if (parsedUrl.query.accessToken) {
      // Verify the access token to make sure it's valid and not expired
      let currentAccessToken = accessTokens.find((accessToken) => {
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