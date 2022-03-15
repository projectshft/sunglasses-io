var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');
const users = require('../initial-data/users.json');

const PORT = 3001;

// State
let state = {
  accessTokens: [],
  loggedInUser: null
}


// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

const checkForValidToken = function(request) {
  const parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
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

myRouter.get('/brands', function(request, response) {
  //Return the brands in the store
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(brands))
})

myRouter.get('/brands/:id', function(request, response) {
  let brandProducts = products.filter((product) => {
    return product.categoryId == request.params.id;
  })

  if (!brandProducts) {
    // If there isn't a brand with that id, then return a 404
    response.writeHead(404, "That store cannot be found", CORS_HEADERS);
    return response.end();
  }

  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(brandProducts))
})

myRouter.get('/products', function(request, response) {
  //Return the products in the store
  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end(JSON.stringify(products))
})

myRouter.post('/login', (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    })

    if (user) {
      response.writeHead(200, {'Content-Type': 'application/json'});

      const currentAccessToken = checkForValidToken(request);

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

        state.accessTokens = [...state.accessTokens, newAccessToken];

        state.loggedInUser = user.login.sha1;

        return response.end(JSON.stringify({token: newAccessToken.token, loggedInUser: state.loggedInUser}));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    } 
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
})

myRouter.post('/me/cart', function(request, response) {
  //Add a certain product to the cart

  const loggedIn = request.body.loggedIn;
  
  if (!loggedIn) {
    response.writeHead(401, "You need to be logged in to continue");
    return response.end();
  } else {
    const currentUser =  users.find((user) => {
      return user.login.sha1 == request.body.userSha1;
    })
    
    const product = request.body.product;

    const newCartObj = {
      product: product,
      quantity: 1
    }

    currentUser.cart.push(newCartObj);

    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(`{"product": ${JSON.stringify(product)}, "quantity": 1}`)
  }
})

myRouter.delete('/me/cart/:productId', function(request, response) {
  //Delete a certain product from the cart
  const loggedIn = request.body.loggedIn;

  if (!loggedIn) {

    response.writeHead(401, "You need to be logged in to use this function");
    return response.end();

  }

  const currentUser =  users.find((user) => {
    return user.login.sha1 == request.body.userSha1;
  })
  
  const productCheck = currentUser.cart.find((productObject) => {
    return productObject.product.id == parseInt(request.params.productId);
  })

  if (!productCheck) {
    response.writeHead(404, "Product not found");
    return response.end();
  }

  const newCart = currentUser.cart.filter((productObject) => {
    return productObject.product.id !== parseInt(request.params.productId);
  })

  currentUser.cart = newCart

  response.writeHead(200, {'Content-Type': 'application/json'});
  return response.end()

})

myRouter.post('/me/cart/:productId', function(request, response) {
  //Update the quantity of a certain item in the cart
  const loggedIn = request.body.loggedIn;

  if (!loggedIn) {
    response.writeHead(401, "You need to be logged in to use this function");
    return response.end();

  }
  
  const currentUser =  users.find((user) => {
    return user.login.sha1 == request.body.userSha1;
  })
  
  const productId = request.params.productId;
  
  const productToUpdate = currentUser.cart.find((productObj) => {
    return productObj.product.id == productId;
  })

  if (!productToUpdate) {
    response.writeHead(404, "Product not found");
    return response.end();
  }

  const action = request.body.action;

  response.writeHead(200, {'Content-Type': 'application/json'});

  if (action == "increase") {
    productToUpdate.quantity++;
    return response.end(`{"product": ${JSON.stringify(productToUpdate.product)}, "quantity": ${productToUpdate.quantity}}`)

  } else if (action == "decrease" && productToUpdate.quantity >= 2) {
    productToUpdate.quantity--;
    return response.end(`{"product": ${JSON.stringify(productToUpdate.product)}, "quantity": ${productToUpdate.quantity}}`)

  } else if (action == "decrease" && productToUpdate.quantity < 2) {
    currentUser.cart = currentUser.cart.filter((productObj) => {
      return productObj.product.id !== productToUpdate.product.id;
    })
    return response.end(JSON.stringify(currentUser.cart))
  }
})


module.exports = server, state;