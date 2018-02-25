var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//set session length for access tokens to 15 minutes
const SESSION_LENGTH = 15 * 60 * 1000;

let brands = [];
let products = [];
let users = [];
let accessTokens = [];


//setup boilerplate headers to be used for composing response headers
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };
const JSON_HEADERS = { "Content-Type": 'application/json' };
const DEFAULT_HEADERS = { ...CORS_HEADERS, ...JSON_HEADERS };


//Helper function to check whether a user already has a record in the accessTokens array. Use this to avoid creating multiple tokens for one user on login. 
const findTokenByUsername = (username) => {
  let userAccessToken = accessTokens.find((token) => {
    return token.username === username;
  })
}

//Helper function to check whether a user has passed a valid access token and to renew user's session if so. Use this to process requests for user's cart.

const verifyTokenFromRequest = (request) => {
  //get token from url 
  let query = queryString.parse(request._parsedUrl.query);
  if (query.accessToken) {
    //check if token exists in database and has not expired. 
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token === query.accessToken
        && new Date() - accessToken.lastUpdated < SESSION_LENGTH;
    });
    // if valid token found, update its lastUpdated property and return the token object. If not, return value will be undefined. 
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return currentAccessToken;
    }
  }
}

const findUserByUsername = (username) => {
  return users.find((user) => {
    return user.login.username === username;
  });
}

const findCartItemByProductId = (cart, productId) => {
  return cart.find( (cartItem) => {
    return cartItem.product.id === productId;
  });
}


//setup router

const myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  //deal with CORS, just in case I create a front end
  if (request.method === 'OPTIONS') {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }

  //populate brands, products, and users arrays from local "database" files
  fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });

  fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
  });

  fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });

  myRouter(request, response, finalHandler(request, response))


  //get request for brands. no parameters required.
  myRouter.get('/api/brands', (request, response) => {
    response.writeHead(200, DEFAULT_HEADERS);
    return response.end(JSON.stringify(brands))
  })

  //get request for products by brand. brand ID will be passed in the route.
  myRouter.get('/api/brands/:brandId/products', (request, response) => {

    let requestedProducts = products.filter((product) => {
      //in products array, categoryId represents brand. use that to filter products.
      return product.categoryId === request.params.brandId;
    })

    //if a brand is found matching requested brand id, return a list of products of that brand. otherwise, return error.
    if (requestedProducts.length) {
      response.writeHead(200, DEFAULT_HEADERS)
      return response.end(JSON.stringify(requestedProducts));
    } else {
      response.writeHead(401, "the requested brand does not exist. please check your parameters and try again.");
      return response.end();
    }
  });

  //get request for products. login is not required, but user needs to provide a search term with parameter "search".
  myRouter.get('/api/products', (request, response) => {
    let query = queryString.parse(request._parsedUrl.query);
    if (query.search) {
      //change all strings to lowercase so search becomes case-insensitive
      let searchTerm = query.search.toLowerCase();
      response.writeHead(200, DEFAULT_HEADERS);

      //implement rudimentary search function
      let productsMatchingSearchTerm = products.filter((product) => {
        return product.name.toLowerCase().includes(searchTerm)
          || product.description.toLowerCase().includes(searchTerm);
      });

      let responseContent = productsMatchingSearchTerm.length
        ? JSON.stringify(productsMatchingSearchTerm)
        : JSON.stringify(`Sorry, none of our products matched your search for '${searchTerm}'`);

      return response.end(responseContent);

    } else {
      response.writeHead(400, "you must provide a search term");
      return response.end();
    }
  });

  // login request. username and password will be sent in request body. server will send an access token back and require access token for all requests related to user's cart.
  myRouter.post('/api/login', (request, response) => {
    //make sure request contains a username and a password. 
    if (!request.body.username || !request.body.password) {
      response.writeHead(400, "To log in, please submit a username and password.")
      return response.end();
    }

    //check username and password against our users database. if they match, send an access token. otherwise, send generic error message.
    let validUser = users.find((user) => {
      return user.login.username === request.body.username
        && user.login.password === request.body.password;
    });

    if (validUser) {
      //use CORS_HEADERS only, as response will be text, not JSON
      response.writeHead(200, CORS_HEADERS);
      //check to see if user already has token. If so, update its "last updated" property. If not, create a new token for the user.
      let currentAccessToken = findTokenByUsername(request.body.username);

      //Declare a newAccessToken variable. This will be the token string that gets sent back to the user.
      let newAccessToken = null;
      if (currentAccessToken) {
        newAccessToken = currentAccessToken.token;
        currentAccessToken.lastUpdated = new Date();
      } else {
        newAccessToken = uid(16);
        accessTokens.push({
          username: request.body.username,
          token: newAccessToken,
          lastUpdated: new Date()
        })
      }
      return response.end(newAccessToken);
    } else {
      response.writeHead(401, "Invalid username or password.");
      return response.end();
    }

  });

  // request to view cart. user must be logged in and send a valid token.
  myRouter.get('/api/me/cart', (request, response) => {
    //first, verify user's access token. if invalid token, send 401 error.
    let validToken = verifyTokenFromRequest(request);
    if (!validToken) {
      response.writeHead(401, "Invalid access token");
      return response.end();
    } else {
      //if token is valid, send cart for logged in user.
      let loggedInUser = findUserByUsername(validToken.username)
      response.writeHead(200, DEFAULT_HEADERS);
      return response.end(JSON.stringify(loggedInUser.cart));
    }
  });

//request to add item to cart. user must be logged in and send a valid token.
myRouter.post('/api/me/cart', (request, response) => {
  //first, verify user's access token. if invalid token, send 401 error.
    let validToken = verifyTokenFromRequest(request);
    if (!validToken) {
      response.writeHead(401, "Invalid access token");
      return response.end();
    }
     //check that body contains a product Id and quantity. if not, send 400 error.
     if (!request.body.productId || !request.body.quantity){
       response.writeHead(400, "Request body must have a product ID and quantity");
       return response.end();
     }
     //check that quantity is a whole number greater than 0. if not, send 400 error.
    if (!Number.isInteger(request.body.quantity) || request.body.quantity < 1) {
      response.writeHead(400, "Quantity must be a whole number greater than zero.")
      return response.end();   
    }

     //check that product ID matches a valid product. if not, send 401 error.
     let requestedProduct = products.find((product) => {
       return product.id == request.body.productId;
     });

     if (!requestedProduct) {
       response.writeHead(401, "Invalid product ID.")
       return response.end();
     }

    //If we've made it this far, successful request!
     response.writeHead(200, DEFAULT_HEADERS)
    
    //check whether item is already in user's cart. if so, increase quantity by amount specified in request.

    let loggedInUser = findUserByUsername(validToken.username);

    let requestedItemInCart = findCartItemByProductId(loggedInUser.cart, requestedProduct.id)

    if (requestedItemInCart) {
      requestedItemInCart.quantity += request.body.quantity;
    } else {
    //if item is NOT already in user's cart, add it.
      loggedInUser.cart.push({
        product: requestedProduct,
        quantity: request.body.quantity
      });
    }
      return response.end(JSON.stringify(loggedInUser.cart));
  });

// request to delete item from cart. user must be logged in and send a valid token. user should have confirmed on the front end that they are sure they want to delete the item.

myRouter.delete('/api/me/cart/:productId', (request, response) => {
  //first, verify user's access token. if invalid token, send 401 error.
  let validToken = verifyTokenFromRequest(request);
  if (!validToken) {
    response.writeHead(401, "Invalid access token");
    return response.end();
  }

  //verify that product to be deleted exists in user's cart. if not, send 401 error.
  let loggedInUser = findUserByUsername(validToken.username);
  let productToDelete = findCartItemByProductId(loggedInUser.cart, request.params.productId);
  if (!productToDelete) {
    response.writeHead(401, "Product not found in cart.");
    return response.end();
  }
  //Success! Remove item from user's cart and send updated cart in response.
  let deleteIndex = loggedInUser.cart.indexOf(productToDelete);
  loggedInUser.cart.splice(deleteIndex, 1);

  response.writeHead(200, DEFAULT_HEADERS);
  return response.end(JSON.stringify(loggedInUser.cart))
});

// request to update quantity of item in cart. user must be logged in and send a valid token.
myRouter.post('/api/me/cart/:productId', (request, response) => {

});

}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
});