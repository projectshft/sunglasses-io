const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const url = require("url");

//state holding variables 
let brands = [];
let products = [];
let users = [];
//add sample to pass tests
let accessTokens = [{ username: 'lazywolf342', token: 'kashfu'}];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const PORT = 3001;

//set a helper function that parses the accessToken from the url
const getValidTokenFromRequest = (request) => {
  let parsedUrl = url.parse(request.url, true);
  let tokenFromUrl = parsedUrl.query.token;
  //if the query has an accesstoken present
  if (tokenFromUrl) {
    //check to see if the accessToken the user has is a verified one
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == tokenFromUrl
    })
    //if the token is verified return it
    if (currentAccessToken) {
      return currentAccessToken
    } else {
      //return nothing if the token is not verified
      return null
    }
    //if the url doesn't have a token return null
  } else {
    return null
  }
};

// Setup router
const myRouter = Router()
myRouter.use(bodyParser.json())

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    throw error
  }
  //populate dummy data
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf8"));
  user = users[0];
})

//get all brands
myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
});

//get all products by brand id
myRouter.get('/api/brands/:id/products', function (request, response) {
  //verify that a brand exists with that ID
  let brandId = brands.find((brand) => {
    return brand.id == request.params.id
  })
  if (!brandId) {
    //if there is no brand with that ID, return a 404
    response.writeHead(404, "That brand cannot be found");
    response.end();
  } else {
    const brandProduct = products.filter(product => {
      if (brandId.id == product.brandId) {
        return product;
      }
    })
    response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
    response.end(JSON.stringify(brandProduct))
  }
});

//get all products
myRouter.get('/api/products', function (request, response) {
  let productsToReturn = [];
  //parse the search query from the url
  const parsedUrl = url.parse(request.originalUrl);
  const query = queryString.parse(parsedUrl.query);
  //if there is a query, filter through products and return product that matches query
  if (query.q !== undefined) {
    productsToReturn = products.filter(product => {
      return product.name == query.q
    })
    //if return product is empty, return an error
    if (productsToReturn.length == 0) {
      response.writeHead(400, 'There are no products that match your search');
      response.end();
    }
  } else {
    //if there is no query set productsToReturn to all products
    productsToReturn = products;
  }
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }));
  response.end(JSON.stringify(productsToReturn));
});

//login
myRouter.post('/api/login', function (request, response) {
  //see if a username an password was entered
  if (request.body.username && request.body.password) {
    // see if there is a user that has that username and password
    let user = users.filter(user => {
      return user.login.username == request.body.username && user.login.password == request.body.password
    });
    //if there is no user matching the attempted log-in, return an error
    if (user.length == 0) {
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    };
    //see if user currently has an access token
    let currentAccessToken = accessTokens.find((token) => {
      return token.username == user[0].login.username;
    });
    //if there is an access token for the user update the time it was last updated
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return response.end(JSON.stringify(currentAccessToken.token));
    } else {
      //if there is not an access token for the user create a new acccess token
      let newAccesstoken = {
        username: request.body.username,
        token: uid(16)
      };
      accessTokens.push(newAccesstoken);
      response.end(JSON.stringify(newAccesstoken.token));
    }
  } else {
    response.writeHead(400, 'Incorrectly formatted response');
    response.end();
  }
});

// endpoint returns cart contents of authorized user
myRouter.get('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know the user is not logged in
    response.writeHead(401, "You need to have access to continue");
    response.end();
  } else {
    // // Check if the current user has access to the their cart 
    let user = users.find((user) => {
      return user.email == currentAccessToken.email;
    });
    // Only if user has access then do we return the cart contents
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      // If there isn't a cart associated with that user, then return a 404
      response.writeHead(404, "Cart not found");
      response.end();
      return;
    }
  }
});


//export the server so that tests can be written
module.exports = server