var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const Product = require('./models/product')
const Brand = require('./models/brand')
const User = require('../app/models/user')
const AccessToken = require('../app/models/accessToken')

const PORT = 3001;
// let products = [];
// let brands = [];
// let users = [];

// for testing
// let accessTokens = [{
//   username: 'yellowleopard753',
//   lastUpdated: new Date(),
//   token: '1111111111111111'
// }];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

var myRouter = Router();
myRouter.use(bodyParser.json());

// Helper method to process access token
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = AccessToken.getAll().find((accessToken) => {
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

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  // fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/products.json", "utf8", (error, data) => {
  //   if (error) throw error;
  //   products = JSON.parse(data);
  //   console.log(`Server setup: ${products.length} stores loaded`);
  // });

  // fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/users.json", "utf8", (error, data) => {
  //   if (error) throw error;
  //   users = JSON.parse(data);
  //   console.log(`Server setup: ${users.length} users loaded`);
  // });

  // fs.readFile("/Users/StephB/code/node-js/sunglasses-io/initial-data/brands.json", "utf8", (error, data) => {
  //   if (error) throw error;
  //   brands = JSON.parse(data);
  //   console.log(`Server setup: ${brands.length} users loaded`);
  // });
});

myRouter.get('/api/products', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(Product.getAll()));
});

myRouter.get('/api/brands', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(Brand.getAll()));
});

myRouter.get('/api/brands/:brandId/products', function(request,response) {
  
  // check if valid brand id
  const { brandId } = request.params;
  const brand = Brand.getAll().find(brand => brand.id === brandId);
  if (!brand) {
    response.writeHead(404);
    return response.end("Brand not found");
  }

	response.writeHead(200, { "Content-Type": "application/json" });
  // get product list
  const productsToReturn = Product.getAll().filter(product => product.categoryId === brandId);
	return response.end(JSON.stringify(productsToReturn));
});

// LOGIN ENDPOINT
myRouter.post('/api/login', function(request,response) {
  if (request.body.username && request.body.password) {
    // get valid user
    let user = User.getAll().find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });

      let currentAccessToken = AccessToken.getAll().find((tokenObject) => {
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
        AccessToken.addToken(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

myRouter.get('/api/me/cart', function(request,response) {
  const accessToken = getValidTokenFromRequest(request);
  if (!accessToken) {
    response.writeHead(401, "Unauthorized");
    return response.end();
  } 

  const user = User.getAll().find(user => accessToken.username === user.login.username);
  const userCart = user.cart;
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(userCart));
});

myRouter.post('/api/me/cart', function(request,response) {
  const accessToken = getValidTokenFromRequest(request);
  if (!accessToken) {
    response.writeHead(401, "Unauthorized");
    return response.end();
  } 

  // error if any missing fields 
  if (!request.body.quantity || !request.body.id){
		response.writeHead(400);
		return response.end();
	}

  const user = User.getAll().find(user => accessToken.username === user.login.username);
  const userCart = user.cart;
  const addedItem = (request.body)
  userCart.push(addedItem);

	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(addedItem));
});

myRouter.delete('/api/me/cart/:id', function(request,response) {
  const accessToken = getValidTokenFromRequest(request);
  if (!accessToken) {
    response.writeHead(401, "Unauthorized");
    return response.end();
  } 

  const user = User.getAll().find(user => accessToken.username === user.login.username);
  const usersCart = user.cart

  
  // can we move this data manipulation to a model?
  const foundItem = usersCart.find((item=>item.id == request.params.id))
  if (!foundItem) {
    response.writeHead(404);	
		return response.end("Item Not Found");
  }

  user.cart = usersCart.filter((item=>item.id != foundItem.id))
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end();
});

myRouter.put('/api/me/cart/:id', function(request,response) {
  const accessToken = getValidTokenFromRequest(request);
  if (!accessToken) {
    response.writeHead(401, "Unauthorized");
    return response.end();
  } 

  const user = User.getAll().find(user => accessToken.username === user.login.username);
  const usersCart = user.cart
  
  // can we move this data manipulation to a model?
  const foundItem = usersCart.find((item=>item.id == request.params.id))
  if (!foundItem) {
    response.writeHead(404);	
		return response.end("Item Not Found");
  }

  Object.assign(foundItem, request.body);
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(foundItem));
});

module.exports = server;