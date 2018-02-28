var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

var accessTokens = [];
var currentUser = {};
const PORT = 3001;
// Setup router
var router = Router();
router.use(bodyParser.json());

var brands;
fs.readFile('brands.json', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
});
var products;
fs.readFile('products.json', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
});
var users;
fs.readFile('users.json', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
});

http.createServer(function (req, res) {
  router(req, res, finalHandler(req, res));
}).listen(PORT);
console.log("Server is listening...");

router.get('/api/products', (req, res) => {

  var params = queryString.parse(req._parsedUrl.query);
  var queryLimit = parseInt(params.limit);
  var searchedTerm = params.product;

  // Limit the response to return 5 elements if there's no limit on query
  var limit;
  if(isNaN(queryLimit)) {
    limit = 5
  } else {
    // restrain to return only 50 elements at the time.
    if (limit > 50) {
      limit = 50
    }
    limit = queryLimit
  }
  
  var foundProducts;
  // If there's no search term, return the first 5 elements
  if(!searchedTerm) {
    foundProducts = JSON.stringify(products.slice(0, limit));
    
  } else {
    foundProducts = JSON.stringify(
      products.find((product) => {
        return product.name.toLowerCase() === searchedTerm.toLowerCase()
      })
    );
  }
  if(!foundProducts) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('The server has not found anything matching the request,\n query parameter product is not valid or does not exist.\n');
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(foundProducts);
  }

});

router.get('/api/brands', (req, res) => {
  var params = queryString.parse(req._parsedUrl.query);
  var queryLimit = parseInt(params.limit);

  var brandsResponse = (limit) => {
    var brandsFound = JSON.stringify(brands.slice(0, limit));
    if (!brandsFound) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Server has not found anything matching the request,\n parameter id of category is not valid or does not exist.\n');  
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(brandsFound);
  }

  var limit;
  if(isNaN(queryLimit)) {
    console.log('No limit param')
    limit = 5
    brandsResponse(limit);
  } else {
    if (limit > 50) {
      limit = 50
    }
    limit = queryLimit
    brandsResponse(limit);
  }
  
});

router.get('/api/brands/:categoryId/products', (req, res) => {
  let productsByBrand = products.filter( (product) => {
    return product.categoryId === req.params.categoryId
  })

  if(!productsByBrand.length){
    res.writeHead(404, {'Content-Type': 'text/plain'});
    return res.end('Server has not found anything matching the Request,\n parameter id of category is not valid or does not exist.\n');
  }

  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify(productsByBrand));

});

router.post('/api/login', (req, res) => {
  if (req.body.username && req.body.password) {

    let validUser = users.find((user) => {
      return user.login.username === req.body.username
    });

    if (!validUser.loginAttempts) {
      validUser.loginAttempts = 0;
    }

    if (validUser.loginAttempts > 2) {
      res.writeHead(403, 'Exceeded maximum login attempts');
      return res.end();
    }

    // See if there is a user that has that username and password 
    let user = users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      res.writeHead(200, {'Content-Type': 'application/json'});

      user.loginAttempts = 0;

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username === user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        currentUser.name = user.name;
        currentUser.username = user.login.username;
        currentUser.location = user.location;
        currentUser.cart = user.cart;
        accessTokens.push(newAccessToken);
        res.end(JSON.stringify(newAccessToken.token));
      }
    } else {

      if (validUser) {
        validUser.loginAttempts += 1;
      }

      // When a login fails, tell the client in a generic way that either the username or password was wrong
      res.writeHead(401, "Invalid username or password");
      res.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    res.writeHead(400, "Incorrectly formatted response");
    res.end();
  }
});

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
  const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  // var parsedUrl = require('url').parse(request.url, true)
  var params = queryString.parse(request._parsedUrl.query);
  if (params.accessToken) {
    // Verify the access token to make sure its valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token === params.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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
var accessTokenMissingResponse = (response) => {
  // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
  response.writeHead(401, "You need to have access for this call to continue");
  response.end();
}
router.get('/api/me/cart', (req, res) => {
  var currentAccessToken = getValidTokenFromRequest(req);
  if (!currentAccessToken) {
    accessTokenMissingResponse(res);
  } else {

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(currentUser.cart));

  }
});

router.post('/api/me/cart', (req, res) => {
  var currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    accessTokenMissingResponse(res);
  } else {
    res.writeHead(201, {
      'Content-Type': 'text/plain'
    });
    res.end(`Product ${selectedProduct.name} added to cart.`);
  }
});

router.delete('/api/me/cart/:productId', (req, res) => {
  var currentAccessToken = getValidTokenFromRequest(req);
  if (!currentAccessToken) {
    accessTokenMissingResponse(res);
  } else {
    
    let selectedProduct = currentUser.cart.find((product) => {
      return product.id === req.params.productId;
    });
  
    if (!selectedProduct) {
      // If there isn't a product with that id, then return a 404
      res.writeHead(404, "The product id cannot be found");
      return res.end();
    }
  
    // JSON.stringify(obj1) !== JSON.stringify(obj2); compare objects
    var remove = (array, element) => array.filter((e) => JSON.stringify(e) !== JSON.stringify(element));
    var arrayAfterDelete = remove(currentUser.cart, selectedProduct);
    currentUser.cart = arrayAfterDelete;
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(arrayAfterDelete));
  }

});

router.post('/api/me/cart/:productId', (req, res) => {
  var currentAccessToken = getValidTokenFromRequest(req);
  if (!currentAccessToken) {
    accessTokenMissingResponse(res);
  } else {
    let selectedProduct = products.find((product) => {
      return product.id === req.params.productId;
    });
    if (!selectedProduct) {
      // If there isn't a product with that id, then return a 404
      res.writeHead(404, "The product id cannot be found");
      return res.end();
    }
    currentUser.cart.push(selectedProduct);
    res.writeHead(201, {
      'Content-Type': 'text/plain'
    });
    res.end(`Product ${selectedProduct.name} added to cart.`);
  }
});