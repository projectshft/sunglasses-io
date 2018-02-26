var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var urlParse = require('url').parse;

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const DEFAULT_NUMBER_OF_BRANDS = 4; // Based on wireframe
const VALID_PRODUCT_PROPERTIES = ['id', 'categoryId', 'name', 'description', 'price', 'imageUrls'];

// Created with https://www.uuidgenerator.net/
const VALID_API_KEY = '1740208b-7533-4b0a-af7e-6b1828a5955a';

var accessTokens = [];
var brands = [];
var products = [];
var users = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  
  // Check that a valid API Key exists before granting access to the API
  if (request.headers['x-authentication'] !== VALID_API_KEY) {
    response.writeHead(401, 'You need a valid API key to use this API.');
    response.end();
  }

  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

const getBrands = (numberOfBrands) => {
  return brands.filter( (brand, index) => {
    return index < numberOfBrands;
  })
}

myRouter.get('/api/brands', function(request, response) {
  const maxResults = urlParse(request.url, true).query.maxResults
  if (!maxResults) {
    response.writeHead(200, 'Success; return an array of brands', {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(getBrands(DEFAULT_NUMBER_OF_BRANDS)));
  } else if (maxResults >= 0) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    if (maxResults >= brands.length) {
      return response.end(JSON.stringify(brands));
    }
    return response.end(JSON.stringify(getBrands(maxResults)));
  } else {
    response.writeHead(400, 'Improperly formatted request');
    return response.end();
  }
});

myRouter.get('/api/brands/:brandId/products', function(request, response) {
  isValidBrandId = brands.find( brand => brand.id === request.params.brandId);

  if (!isValidBrandId) {
    response.writeHead(404, 'Brand not found');
    return response.end();
  }

  const productsFilteredByBrandId = products.filter( product => {
    return product.categoryId === request.params.brandId;
  });
  response.writeHead(200, 'List of products for a given brand', {'Content-Type': 'application/json'});
  response.end(JSON.stringify(productsFilteredByBrandId));
});

myRouter.get('/api/products', function(request, response) {
  const searchQuery = urlParse(request.url, true).query.query;
  // User should not be able to search for an empty string
  if (!searchQuery || !searchQuery.trim()) {
    response.writeHead(400, 'Improperly formatted request');
    return response.end();
  }
  const queryExpression = new RegExp(searchQuery, 'i');
  productsFilteredBySearchQuery = products.filter( (product) => {
    return product.name.match(queryExpression);
  });
  response.writeHead(200, 'Successful product search', {'Content-Type': 'application/json'});
  response.end(JSON.stringify(productsFilteredBySearchQuery));
});

// Login call
myRouter.post('/api/login', function(request, response) {

  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
  
    let validUser = users.find((user)=>{
      return user.email == request.body.username;
    });

    if (!validUser) {
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    }

    if (!validUser.loginAttempts) {
      validUser.loginAttempts = 0;
    }
    if (validUser.loginAttempts >= 3) {
      response.writeHead(403, 'Exceeded maximum number of attempts');
      return response.end();
    }
  
    // See if there is a user that has that username and password 
    let user = users.find((user)=>{
      return user.email == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, 'Successful login token', {'Content-Type': 'application/json'});
  
      user.loginAttempts = 0;
  
      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
  
      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a 'random' token
        let newAccessToken = {
          username: user.email,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
  
      if (validUser) {
        validUser.loginAttempts += 1;
      }
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, 'Incorrectly formatted request');
    return response.end();
  }
});

var getValidTokenFromRequest = function(request) {
  var parsedUrlQuery = urlParse(request.url,true).query;
  if (parsedUrlQuery.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrlQuery.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

myRouter.get('/api/me/cart', function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to continue.');
    response.end();
  } else {
    const currentUser = users.find( (user) => {
      return user.email === currentAccessToken.username;
    });
    response.writeHead(200, 'A list of products in a user\'s shopping cart', {'Content-Type': 'application/json'});
    response.end(JSON.stringify(currentUser.cart));
  }
});

myRouter.post('/api/me/cart', function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to continue.');
    response.end();
  } else {
    const currentUser = users.find( (user) => {
      return user.email === currentAccessToken.username;
    });
    // Get enumerable properties of request body to ensure all product properties are present.
    const requestBodyProperties = Object.getOwnPropertyNames(request.body);
    const isValidProduct = VALID_PRODUCT_PROPERTIES.every( (propertyName, index) => {
      return propertyName === requestBodyProperties[index];
    });
    if (!isValidProduct) {
      response.writeHead(400, 'Incorrectly formatted request');
      response.end();
    }
    const itemAlreadyInCart = currentUser.cart.find( (product) => {
      return product.name === request.body.name;
    });
    if (!itemAlreadyInCart) {
      currentUser.cart = [ ...currentUser.cart, request.body ];
    }
    response.writeHead(200, 'Successful addition to shopping cart', {'Content-Type': 'application/json'});
    response.end(JSON.stringify(request.body));
  }
});

// Cannot update a product's quantity unless a user has logged in
myRouter.post('/api/me/cart/:productId', function(request, response) {
  const currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to continue.');
    response.end();
  } else {    
    const currentUser = users.find( (user) => {
      return user.email === currentAccessToken.username;
    });

    let validProductInCart = currentUser.cart.find( (product) => {
      return product.id === request.params.productId;
    })

    if (!validProductInCart) {
      response.writeHead(404, 'This resource does not exist.');
      return response.end();
    }
    const quantityInQuery = urlParse(request.url, true).query.quantity;
    // Make sure that the quantity is a defined, positive integer because cart items should have only positive quantity values.
    // Instead of setting a quantity to 0, the delete endpoint should be used to 'remove' an item from the cart.
    if (!quantityInQuery || !parseInt(quantityInQuery) || quantityInQuery < 1) {
      response.writeHead(400, 'Incorrectly formatted request');
      return response.end();
    }
    validProductInCart.quantity = parseInt(quantityInQuery);
    response.writeHead(200, 'Successfully updated cart item');
    response.end();

  }
});

// Cannot delete a product unless a user has logged in
myRouter.delete('/api/me/cart/:productId', function(request, response) {
  const currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to continue.');
    response.end();
  } else {    
    const currentUser = users.find( (user) => {
      return user.email === currentAccessToken.username;
    });

    let validProductInCart = currentUser.cart.find( (product) => {
      return product.id === request.params.productId;
    })

    if (!validProductInCart) {
      response.writeHead(404, 'This resource does not exist.');
      return response.end();
    }
    currentUser.cart = currentUser.cart.filter( (product) => {
      return product.id !== request.params.productId;
    });
    response.writeHead(200, 'Successfully deleted cart item');
    response.end();

  }
});
