const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const url = require('url');
const uid = require('rand-token').uid;

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// State holding variables
let products = [];
let brands = [];
let users = [];
let accessTokens = [];
let failedLoginAttempts = {};

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer( (request, response) => {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  // read data from initial data files and set state variables
  // equal to the data from cooresponding files
  fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// GET a list of brands
myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200);
  return response.end(JSON.stringify(brands));
});

// GET products for specific brand by id
myRouter.get('/api/brands/:id/products', (request, response) => {
  // check if the brand exists
  const brandId = request.params.id;
  const brandExists = brands.find(brand => brand.id === brandId);

  if (brandExists) {
    // write a successful header and send all products from the requested brand
    response.writeHead(200);
    const brandProducts = products.filter(product => product.categoryId === brandId);

    return response.end(JSON.stringify(brandProducts));
  } else {
    // respond with an error, and let user know the brand was not found
    response.writeHead(404, 'Brand not found');
    return response.end();
  }
});

// GET products that match query string provided by user
myRouter.get('/api/products', (request, response) => {
  // verify that a query value was provided
  const query = url.parse(request.url, true).query.query;

  if (query !== '') {
    // write a successful header and search products for a match in the products name value
    response.writeHead(200);
    const queryResults = products.filter((product) => {
      return product.name.toLowerCase().includes(query.toLowerCase());
    });

    // return the results to the user (may be an empty array)
    return response.end(JSON.stringify(queryResults));
  } else {
    // respond with Bad Request, and let the user know a search value is required
    response.writeHead(400, 'Bad Request, search value required');
    return response.end();
  }
});

// POST user login
myRouter.post('/api/login', (request, response) => {
  // verify there is a username and password in the request
  const {email, password} = request.body;

  if (email && password) {
    // verify the user doesn't have 3 or more failed login attempts
    if (!failedLoginAttempts[email] || failedLoginAttempts[email] <= 3) {
      // verify there is a user that has that username and password 
      if (users.find(user => user.email === email).login.password === password) {
        // write a successful header and check if the user already has a valid token
        response.writeHead(200)
        let currentAccessToken = accessTokens.find((accessToken) => {
          return (accessToken.email === email && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT);
        });

        if (currentAccessToken) {
          // update the last updated value of the current access token and send it to user
          currentAccessToken.lastUpdated = new Date();
          return response.end(JSON.stringify(currentAccessToken.token));
        } else {
          // create a new token with the user value and a "random" token
          let newAccessToken = {
            email: email,
            lastUpdated: new Date(),
            token: uid(16)
          };

          // add new token to accessTokens object and send the token to the user
          accessTokens.push(newAccessToken);
          return response.end(JSON.stringify(newAccessToken.token));
        }
      } else {
      // respond with an error and tell the client either the email or password was wrong
      response.writeHead(401, 'Incorrect username or password');

      // update failedLoginAttempts object with failure. if the email is already in the
      // failedLoginAttempts, increment the value, otherwise add a new key(email) to keep track of
      if (failedLoginAttempts[email]) {
        failedLoginAttempts[email] += 1;
      } else {
        failedLoginAttempts[email] = 1;
      }
      return response.end();
      }
    } else {
      // respond with an error and let the user know they had too many failed login attempts
      response.writeHead(401, 'Too many failed login attempts');
      return response.end();
    }
  } else {
    // respond with an error and tell client to provide an email and password
    response.writeHead(400, 'Please enter email and password');
    return response.end();
  }
});

// GET users shopping cart
myRouter.get('/api/me/cart', (request, response) => {
  // verify user has valid access token
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // write a successful header and send the users's cart to the user
    response.writeHead(200);
    const currentUser = getTokenUser(currentToken);

    response.end(JSON.stringify(currentUser.cart))
  } else {
    // respond with an error and tell client that the token is invalid
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// POST - add an item to the cart
myRouter.post('/api/me/cart', (request, response) => {
  // verify user has a valid access token
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // verify the product exists
    const currentProduct = getProductFromRequest(request);
    if (currentProduct) {
      // write a successful header and check if item is already in cart
      response.writeHead(200);
      const currentUser = getTokenUser(currentToken);
      const cartItem = currentUser.cart.find((item) => {
        return item.id === currentProduct.id;
      });

      if (cartItem) {
        // incerement the cart items quantity by 1
        cartItem.quantity++;
      } else {
        // create a new object and add it to the cart
        let newCartItem = Object.assign({}, currentProduct);

        newCartItem.quantity = 1;
        currentUser.cart.push(newCartItem);
      }
      // update users.json to reflect change and send the user's cart to the user
      updateUsersFile();
      return response.end(JSON.stringify(currentUser.cart));
    } else {
      // respond with an error and tell the client that the product does not exist
      response.writeHead(404, "Product not found");
      return response.end();
    }
  } else {
    // respond with an error and tell client that the token is invalid
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// DELETE all items in cart that match product id
myRouter.delete('/api/me/cart/:productId', (request, response) => {
  // verify user has a valid access token
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // verify that a product id has been provided
    const productId = request.params.productId;

    if (productId) {
      // verify that the item is in users cart
      const currentCart = getTokenUser(currentToken).cart;
      const cartItem = currentCart.find((item) => {
        return item.id === productId;
      });

      if (cartItem) {
        // write a successful header and delete the item from the user's cart
        response.writeHead(200);
        currentCart.splice(currentCart.indexOf(cartItem), 1);
        // update users.json to reflect change and send the user's cart to the user
        updateUsersFile();
        return response.end(JSON.stringify(currentCart));
      } else {
        // respond with an error and tell client that the product is not in the cart
        response.writeHead(404,'Product not found in cart');
        return response.end();
      }
    } else {
      // respond with an error and tell client that a product id is required
      response.writeHead(400, 'Product id needed');
      return response.end();
    }
  } else {
    // respond with an error and tell client that the token is invalid
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// POST - updates the quantity of the item in cart
myRouter.post('/api/me/cart/:productId', (request, response) => {
  // verify user has a valid access token
  const currentToken = getValidTokenFromRequest(request);

  if (currentToken) {
    // verify that a product id has been provided
    const productId = request.params.productId;

    if (productId) {
      // verify that the item is in users cart
      const currentCart = getTokenUser(currentToken).cart;
      const cartItem = currentCart.find((item) => {
        return item.id === productId;
      });

      if (cartItem) {
        // verify that a quantity has been provided
        const newQuantity = url.parse(request.url, true).query.quantity;
        if (newQuantity) {
          // write a successful header and update quantity
          response.writeHead(200);
          // if the quantity it not 0, update the quantity
          if (newQuantity != 0) {
            cartItem.quantity = newQuantity;
          } else {
            // if the quantity is 0, delete it from the cart
            currentCart.splice(currentCart.indexOf(cartItem), 1);
          }
          // update users.json file to reflect changes
          updateUsersFile();
          return response.end(JSON.stringify(currentCart));
        } else {
          // respond with an error and tell client a quantity is required
          response.writeHead(400, 'Quantity needed to update cart');
          return response.end();
        }
      } else {
        // respond with error and tell client the product is not in the cart
        response.writeHead(404,'Product not found in cart');
        return response.end();
      }
    } else {
      // respond with error and tell client a product id is required
      response.writeHead(400, 'Product id needed');
      return response.end();
    }
  } else {
    // respond with an error and tell client that the token is invalid
    response.writeHead(401, "Invalid token");
    return response.end();
  }
});

// Helper method to process access token
const getValidTokenFromRequest = (request) => {
  const  query = url.parse(request.url, true).query
  if (query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (accessToken.token == query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT);
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

// helper method to find user from token
const getTokenUser = (token) => {
  return users.find(user => user.email === token.email)
};

// helper method to get the product from the request when product id
// is passed via query
const getProductFromRequest = (request) => {
  const{ productId } = url.parse(request.url, true).query
  // verify a product id was provided by client
  if (productId) {
    // if product id provided, find the product
    let currentProduct = products.find((product) => {
      return product.id === productId;
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

// update the users file (after changes have been made)
const updateUsersFile = () => {
  fs.writeFile('./initial-data/users.json', JSON.stringify(users), (error) => {
    if (error) {
      throw error;
    } else {
      console.log('users.json updated');
    }
  });
};