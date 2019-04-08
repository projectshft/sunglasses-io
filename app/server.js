var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const url = require('url');

const PORT = 3001;

let brands = [];
let users = [];
let products = [];
let accessTokens = [];

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.token) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.urlencoded({
  extended: true
}));
myRouter.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(200, CORS_HEADERS);
    response.end();
  }
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} stores loaded`);
  });

  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} users loaded`);
  });

  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

// Route to get every brand type
myRouter.get('/brands', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  // if there is query param, use it to search products by name
  // and return JSON data
  const query = url.parse(request.url).query;
  const queryObj = queryString.parse(query);
  if (queryObj['product_name']) {
    const foundProduct = products.find(product => product.name === queryObj.product_name);
    if (!foundProduct) {
      response.writeHead(404, CORS_HEADERS);
      return response.end(JSON.stringify({ message: 'No products found' }));
    }
    response.writeHead(200, CORS_HEADERS);
    return response.end(JSON.stringify(foundProduct))
  }

  response.writeHead(200, CORS_HEADERS);
  response.end(JSON.stringify(brands));
});

// Route to get products for a single brand
myRouter.get('/brands/:brandId/products', (request, response) => {
  response.setHeader('Content-Type', 'application/json');

  // return every product for a single brand by using the id
  product = products.filter((product => product.categoryId == request.params.brandId));
  // If there are no posts return not found and error message
  if (product.length === 0) {
    response.writeHead(404, CORS_HEADERS);
    return response.end(JSON.stringify({ message: 'No products found' }));
  }
  response.writeHead(200, CORS_HEADERS);
  response.end(JSON.stringify(product));
});

myRouter.get('/products', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.writeHead(200, CORS_HEADERS);
  response.end(JSON.stringify(products));
});

// Route to login
myRouter.post('/login', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;

  if (email && password) {
    response.setHeader('Content-Type', 'application/json');
    let userFound = users.find(
      (user) => user.email === email && user.login.password === password);

    // validate if user is found
    if (userFound) {

      let tokenObj = accessTokens.find((token) => {
        return token.username == userFound.login.username;
      });
      // Check for an access token
      if (tokenObj) {
        currentAccessToken.lastUpdated = new Date();
      } else {
        // if no token then create one
        let newAccessToken = {
          email: userFound.email,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.writeHead(200, CORS_HEADERS);
        response.end(JSON.stringify({ token: newAccessToken.token }));
      }
    } else {
      response.writeHead(401, CORS_HEADERS);
      response.end(JSON.stringify({ message: 'Invalid username or password' }));
    }
  } else {
    response.setHeader('Content-Type', 'application/json');
    response.writeHead(400, CORS_HEADERS);
    response.end(JSON.stringify({ message: 'Failed login, empty fields' }));
  }
});

// Route to view cart, need to validate with token
myRouter.get('/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  response.setHeader('Content-Type', 'application/json');
  // if there is no token on the request, show error message
  if (!currentAccessToken) {
    response.writeHead(401, CORS_HEADERS);
    response.end(JSON.stringify({ message: 'Unauthorized user, must be logged in' }));
  } else {
    // Find the user cart with currentAccessToken provided
    let userFound = users.find(
      (user) => user.email === currentAccessToken.email
    );
    response.writeHead(200, CORS_HEADERS);
    response.end(JSON.stringify(userFound.cart));
  }
});

// TODO: route to update product quantity on the user's cart
myRouter.post('/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  response.setHeader('Content-Type', 'application/json');
  // extract productID and quantity from request body
  const { productId } = request.body;
  const { productQuantity } = request.body;

  if (!currentAccessToken) {
    response.writeHead(401, CORS_HEADERS);
    response.end(JSON.stringify({ message: 'Unauthorized user, must be logged in' }));
  } else {
    let userFound = users.find(
      (user) => user.email === currentAccessToken.email
    );

    const productInUserCart = userFound.cart.find(
      (productItem) => productItem.product.id === productId
    );
    // if there is no product return 404 response
    if (!productInUserCart) {
      response.writeHead(404, CORS_HEADERS);
      response.end(JSON.stringify({ message: 'Product not found' }))
    }
    productInUserCart.quantity = parseInt(productQuantity, 10);
    response.writeHead(200, CORS_HEADERS);
    // return updated product
    response.end(JSON.stringify(productInUserCart))
  }
})

// Route to add product to cart
myRouter.post('/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  response.setHeader('Content-Type', 'application/json');

  if (!currentAccessToken) {
    response.writeHead(401, CORS_HEADERS);
    response.end(JSON.stringify({ message: 'Unauthorized user, must be logged in' }));
  } else {
    let userFound = users.find(
      (user) => user.email === currentAccessToken.email
    );

    let productFound = products.find((product) => product.id === request.params.productId);
    if (!productFound) {
      response.writeHead(404, CORS_HEADERS);
      response.end(JSON.stringify({ message: 'Product not found' }));
    }
    // Check to see if the product already exists in the user cart  
    let userProductFound = userFound.cart.find((product) => product.product.name === productFound.name)
    // if it does not exist create a product item object
    if (!userProductFound) {
      let cartItem = {
        product: productFound,
        quantity: 1
      }
      userFound.cart.push(cartItem);
      response.writeHead(200, CORS_HEADERS);
      response.end(JSON.stringify(cartItem));
    }
    // if product is found, just update quantity
    userProductFound.quantity++;
    response.writeHead(200, CORS_HEADERS);
    response.end(JSON.stringify(userProductFound));
  }
});

// Route to delete product from cart
myRouter.delete('/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  response.setHeader('Content-Type', 'application/json');

  if (!currentAccessToken) {
    response.writeHead(401, CORS_HEADERS);
    response.end(JSON.stringify({ message: 'Unauthorized user, must be logged in' }));
  } else {
    let userFound = users.find(
      (user) => user.email === currentAccessToken.email
    );

    // find product in the user's cart
    let productFound = userFound.cart.find(
      (cartItem) => cartItem.product.id === request.params.productId
    );
    // if no product was found return error message    
    if (!productFound) {
      response.writeHead(404, CORS_HEADERS);
      response.end(JSON.stringify({ message: 'Product not found' }));
    }
    // update cart to remove selected product
    let updatedCart = userFound.cart.filter(
      (cartItem) => cartItem.product.id !== productFound.product.id
    );
    userFound.cart = updatedCart;
    response.writeHead(200, CORS_HEADERS);
    response.end(JSON.stringify(userFound.cart));
  }
})

module.exports = server;