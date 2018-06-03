var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var url = require('url');
var uid = require('rand-token').uid;

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// State holding variables
var products = [];
var brands = [];
var users = [];
var accessTokens = [];
var failedLoginAttempts = {};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  // read data from initial data files and set state variables
  // equal to the data from cooresponding files
  fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// GET a list of brands
myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200);
  return response.end(JSON.stringify(brands));
});

// GET products for specific brand by id
myRouter.get('/api/brands/:id/products', function (request, response) {
  const brandId = request.params.id;
  const brandExists = brands.find(brand => brand.id === brandId);

  // check if the brand exists
  if (brandExists) {
    // if the brand exists, send all products from the requested brand
    const brandProducts = products.filter(product => product.categoryId === brandId);

    response.writeHead(200);
    return response.end(JSON.stringify(brandProducts));
  } else {
    response.writeHead(404, 'Brand not found');
    return response.end();
  }
});

// GET products that match query string provided by user
myRouter.get('/api/products', function (request, response) {
  const query = url.parse(request.url, true).query.query;
  // check for query
  if (query !== '') {
    response.writeHead(200);
    // if query provided, search products for match in name
    const queryResults = products.filter((product) => {
      return product.name.toLowerCase().includes(query.toLowerCase());
    });
    return response.end(JSON.stringify(queryResults));
  } else {
    // if no query is provided respond with Bad Request
    response.writeHead(400, 'Bad Request, search value required');
    return response.end();
  }
});

// POST user login
myRouter.post('/api/login', function (request, response) {
  const {email, password} = request.body;
  // Make sure there is a username and password in the request
  if (email && password) {
    // if the username doesn't have 3 or more failed login attempts, proceeed
    if (!failedLoginAttempts[email] || failedLoginAttempts[email] <= 3) {
      // See if there is a user that has that username and password 
      if (users.find(user => user.email === email).login.password === password) {
        // Write the header because we know we will be returning successful at this point and that the response will be json
        response.writeHead(200)
        // If we already have an existing access token, use that
        let currentAccessToken = accessTokens.find((accessToken) => {
          return (accessToken.email === email && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT);
        });
        // Update the last updated value of the existing token so we get another time period before expiration
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();

          return response.end(JSON.stringify(currentAccessToken.token));
        } else {
          // Create a new token with the user value and a "random" token
          let newAccessToken = {
            email: email,
            lastUpdated: new Date(),
            token: uid(16)
          };

          accessTokens.push(newAccessToken);
          return response.end(JSON.stringify(newAccessToken.token));
        }
      } else {
      // if login fails, tell the client either the email or password was wrong
      response.writeHead(401, 'Incorrect username or password');
      // check if the user exists in users list
      if (users.find(user => user.email === email)) {
        // if username is in failedLoginAttempts, increment username value
        if (failedLoginAttempts[email]) {
          failedLoginAttempts[email] += 1;
        } else {
          // if the email is not in failedLoginAttempts, add email key and set equal to 1 
          failedLoginAttempts[email] = 1;
        }
      }
      return response.end();
      }
    } else {
      response.writeHead(401, 'Too many failed login attempts');
      return response.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, 'Please enter email and password');
    return response.end();
  }
});

// GET users shopping cart
myRouter.get('/api/me/cart', function (request, response) {
  const currentToken = getValidTokenFromRequest(request);

  // check for valid access token
  if (currentToken) {
    response.writeHead(200);
    // if the token is valid, return the user's cart
    const currentUser = getTokenUser(currentToken);
    response.end(JSON.stringify(currentUser.cart))
  } else {
    // if the token is not valid, respond with an error
    response.writeHead(401, "Invalid token", CORS_HEADERS);
    return response.end();
  }
});

// POST item to the cart
myRouter.post('/api/me/cart', function (request, response) {
  // check for valid access token
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // if the token is valid, varify product exists
    const currentProduct = getProductFromRequest(request);
    if (currentProduct) {
      // if the product does exist, write successful header 
      // and check if item is already in cart
      response.writeHead(200);
      const currentUser = getTokenUser(currentToken);
      const cartItem = currentUser.cart.find((item) => {
        return item.id === currentProduct.id;
      });
      if (cartItem) {
        // if the item is already in the cart, incerement quantity by 1
        cartItem.quantity++;
      } else {
        // if the item is not in the cart create a new object to add to cart
        let newCartItem = Object.assign({}, currentProduct);
        newCartItem.quantity = 1;
        currentUser.cart.push(newCartItem);
      }
      // update users.json to reflect change
      updatedUsersFile();
      return response.end(JSON.stringify(currentUser.cart));
    } else {
      // if product does not exist, respond with an error letting client know
      // that the product does not exist
      response.writeHead(404, "Product not found");
      return response.end();
    }
  } else {
    // if the token is not valid, respond with an error
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// DELETE all items in cart that match product id
myRouter.delete('/api/me/cart/:productId', function (request, response) {
  // check that valid accessToken has been provided
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // if a valid accessToken has been provided, check that product id has been provided
    const productId = request.params.productId;

    if (productId) {
      // if a product id has been provided, check that item is in users cart
      const currentCart = getTokenUser(currentToken).cart;
      const cartItem = currentCart.find((item) => {
        return item.id === productId;
      });

      if (cartItem) {
        // if the item is in the users cart, write a successful header and delete it
        response.writeHead(200);
        currentCart.splice(currentCart.indexOf(cartItem), 1);
        // update users.json file to reflect changes
        updatedUsersFile();
        return response.end(JSON.stringify(currentCart));
      } else {
        // if the item is not in the users cart, respond with error
        response.writeHead(404,'Product not found in cart');
        return response.end();
      }
    } else {
      // if a product id has not been provided, respond with error
      response.writeHead(400, 'Product id needed');
      return response.end();
    }
  } else {
    // if no valid token has been provided, respond with an error
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// POST /api/me/cart/:productId ###### TODO user must be logged in
myRouter.post('/api/me/cart/:productId', function (request, response) {
  // check that valid accessToken has been provided
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // if a valid accessToken has been provided, check that product id has been provided
    const productId = request.params.productId;

    if (productId) {
      // if a product id has been provided, check that item is in users cart
      const currentCart = getTokenUser(currentToken).cart;
      const cartItem = currentCart.find((item) => {
        return item.id === productId;
      });

      if (cartItem) {
        // if the item is in the users cart, check that a quantity has been provided
        const newQuantity = getProductQuantityFromRequest(request);
        if (newQuantity) {
          // if quantity provided write a successful header and update quantity
          response.writeHead(200);
          // if the quantity it not 0, update the quantity
          if (newQuantity != 0) {
            cartItem.quantity = newQuantity;
          } else {
            // if the quantity is 0, delete it from the cart
            currentCart.splice(currentCart.indexOf(cartItem), 1);
          }
          // update users.json file to reflect changes
          updatedUsersFile();
          return response.end(JSON.stringify(currentCart));
        } else {
          // if no quantity provided, respond with an error
          response.writeHead(400, 'Quantity needed to update car');
          return response.end();
        }
      } else {
        // if the item is not in the users cart, respond with error
        response.writeHead(404,'Product not found in cart');
        return response.end();
      }
    } else {
      // if a product id has not been provided, respond with error
      response.writeHead(400, 'Product id needed');
      return response.end();
    }
  } else {
    // if no valid token has been provided, respond with an error
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// Helper method to process access token
const getValidTokenFromRequest = (request) => {
  const  parsedUrl = url.parse(request.url, true)
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

const getTokenUser = (token) => {
  return users.find(user => user.email === token.email)
};

const getProductFromRequest = (request) => {
  const parsedUrl = url.parse(request.url, true)
  // verify a product id was provided by client
  if (parsedUrl.query.productId) {
    // if product id provided, find the product
    let currentProduct = products.find((product) => {
      return product.id === parsedUrl.query.productId;
    });
    if (currentProduct) {
      // if the product exists, return it
      return currentProduct;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

const getProductQuantityFromRequest = (request) => {
  const parsedUrl = url.parse(request.url, true);

  return parsedUrl.query.quantity;
}

const updatedUsersFile = () => {
  fs.writeFile('./initial-data/users.json', JSON.stringify(users), (error) => {
    if (error) {
      throw error;
    } else {
      console.log('users.json updated');
    }
  });
};