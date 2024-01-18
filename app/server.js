var http = require('http');
var fs = require('fs').promises;
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var path = require('path');
const url = require('url');
const { access } = require('fs');
const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 30 * 1000;
const myRouter = Router();
myRouter.use(bodyParser.json());

// State holding variables 
let brands = [];
let users = [];
let products = [];
let accessTokens = [
  {
    username: "greenlion235",
    token: 'aZVg8xUr8PVZNk3G',
    lastUpdated: new Date()
  },
  {
    username: "lazywolf342",
    token: 'krkR5itCRUSGrw1N',
    lastUpdated: new Date()
  }
];


function readJsonFile(filePath) {
  const absolutePath = path.join(__dirname, '..', filePath)
  return fs.readFile(absolutePath, 'utf8')
    .then(data => JSON.parse(data))
};


// Set up server
const server = http.createServer(function (request, response) {

  if (request.method === "OPTIONS") {

    response.writeHead(200, CORS_HEADERS);
    return response.end();

  };

  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, async (error) => {
  if (error) {

    throw error
  };

  try {

    [brands, products, users] = await Promise.all([
      readJsonFile('./initial-data/brands.json'),
      readJsonFile('./initial-data/products.json'),
      readJsonFile('./initial-data/users.json')
    ]);
    console.log(`Server setup: ${brands.length} brands loaded, ${products.length} products loaded, ${users.length} users loaded`)
  } catch (error) {

    console.error(error)
    throw error;

  };
});

//Creating access Token for user
const createAccessToken = (username) => {
  //Creating a new token object
  const newAccessToken = {
    username: username,
    token: uid(16),
    lastUpdated: new Date()
  };
  //Adds new token to the array of existing tokens 
  accessTokens.push(newAccessToken);
  return newAccessToken;
};

//Extract token from URL and validate
const accessTokenValidation = (request) => {

  //Parsing the URL to extract the query parameters
  const parsedUrl = url.parse(request.url, true);

  //Extracting the access token from the query parameters
  const accessToken = parsedUrl.query.accessToken;

  // Is the access token provided in the request
  if (!accessToken) {
    return { isValid: false, error: 'Access token is required' };
  };

  //Finding token object that matches access token
  const tokenObj = accessTokens.find(token => token.token === accessToken);

  //Checking if the token object exists and is not expired
  if (!tokenObj || new Date() - tokenObj.lastUpdated >= TOKEN_VALIDITY_TIMEOUT) {
    return { isValid: false, error: 'Invalid or expired token' }
  };

  //Returning object and token object on validation
  return { isValid: true, tokenObj }
};

// Get the current logged in user based on the token object
const getLoggedInUser = (tokenObj) => {

  return users.find(u => u.login.username === tokenObj.username);

};

//Brands endpoint handler to access and return all brands 
myRouter.get('/api/brands', function (request, response) {

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(brands));
});

//Brands endpoint handler to return brands by their brand ID
myRouter.get('/api/brands/:id/products', function (request, response) {

  //Extracting the brand ID from query parameters
  const brandId = request.params.id;

  //Checking for valid number within brand ID
  if (isNaN(brandId)) {

    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Invalid ID format' }));
    return;
  };

  //Does the brand ID exist in the list of brands
  const brandExists = brands.some(brand => brand.id === brandId);

  if (!brandExists) {

    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Brand not found' }));
  };

  //Filter the products array to get only the products that belong to provided brand ID
  const productsByBrand = products.filter(product => product.categoryId === brandId);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(productsByBrand));
});

//Products endpoint handler to access products in the store 
myRouter.get('/api/products', function (request, response) {

  //Extract search parameters from the request URL
  const searchParam = queryString.parse(url.parse(request.url).query);

  //Check for provided search query
  if (searchParam.query) {

    //Filter products that match the search query in the name or description
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchParam.query.toLowerCase()) || product.description.toLowerCase().includes(searchParam.query.toLowerCase())
    );

    if (filteredProducts.length === 0) {

      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'No products found' }));
    };

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(filteredProducts));
  };

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(products));
});

//Login endpoint handler to allow the user to login 
myRouter.post('/api/login', function (request, response) {

  //Extracting username and password from the request body
  const { username, password } = request.body

  //Checking for a user with the provided credentials
  const user = users.find(u => u.login.username === username && u.login.password === password)

  if (!username || !password) {

    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Valid Username and password is required' }));
    return;

  };

  // If the user is found create a new access token for the user
  if (user) {

    const newAccessToken = createAccessToken(user.login.username);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ user: user, accessToken: newAccessToken }));
    return;

  };

  response.writeHead(401, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error: 'Please provide a valid username and password' }));

});

//Cart endpoint to retrieve the current users cart
myRouter.get('/api/me/cart', function (request, response) {

  //Validates the access token from the request 
  const tokenValidation = accessTokenValidation(request);

  if (!tokenValidation.isValid) {
    response.writeHead(401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Invalid or expired token' }));
    return;
  };

  // Retrieves the current user based on the validated token
  const currentUser = getLoggedInUser(tokenValidation.tokenObj);

  if (!currentUser) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'You must be logged in for this request' }))
    return;

  };
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(currentUser.cart))

});

//Cart endpoint handler to add products to the current users cart 
myRouter.post('/api/me/cart', function (request, response) {

  //Validates the access token from the request 
  const tokenValidation = accessTokenValidation(request);

  if (!tokenValidation.isValid) {

    response.writeHead(401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Invalid or expired token' }));
    return;

  };

  // Retrieves the current user based on the validated token
  const currentUser = getLoggedInUser(tokenValidation.tokenObj);

  if (!currentUser) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'You must be logged in for this request' }));
    return;

  };

  //Extracts product ID from the request body
  const { id } = request.body;
  // Finds the product to add based on the provided ID
  const productToAdd = products.find(p => p.id === id);

  if (!productToAdd) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Product not found' }));
    return;

  }

  //Adds the found product to the logged in users cart 
  currentUser.cart.push(productToAdd);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Product added to cart', cart: currentUser.cart }));

});

//Cart endpoint handler that allows user to delete products by ID
myRouter.delete('/api/me/cart/:productId', function (request, response) {

  //Validates the access token from the request 
  const tokenValidation = accessTokenValidation(request);

  if (!tokenValidation.isValid) {

    response.writeHead(401, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Invalid or expired token' }))
    return;

  };

  // Retrieves the current user based on the validated token
  const currentUser = getLoggedInUser(tokenValidation.tokenObj);

  if (!currentUser) {

    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'User not found' }));
    return;

  };
  // Get the product ID from the URL path
  const productId = request.params.productId;


  //Find the index of the product in the users cart
  const index = currentUser.cart.findIndex(product => product.id === productId);

  //If product is found it is removed 
  if (index > -1) {

    currentUser.cart.splice(index, 1);
    response.writeHead(204, { 'Content-Type': 'application/json' });
    response.end((JSON.stringify({ message: 'Product removed from cart' })));

  } else {

    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Product not found in cart' }));
    return;

  };

});

//Cart endpoint that allows the user to modify products in their cart
myRouter.post('/api/me/cart/:productId', function (request, response) {

  //Validates the access token from the request 
  const tokenValidation = accessTokenValidation(request);

  if (!tokenValidation) {

    response.writeHead(401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Invalid or expired token' }));
    return;

  };

  // Retrieves the current user based on the validated token
  const currentUser = getLoggedInUser(tokenValidation.tokenObj);

  if (!currentUser) {

    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'You must be logged in for this request' }));
    return;

  };

  //Extracts the product ID from the request parameters 
  const productId = request.params.productId;
  //Retrives the new quantity from the request body
  const { quantity } = request.body;
  //Find the index of the product in the users cart 
  const index = currentUser.cart.findIndex(product => product.id === productId);

  //If the product is found in cart, update its quantity
  if (index > -1) {

    currentUser.cart[index].quantity = quantity;
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Product quantity updated' }));

  } else {

    response.writeHead(404, { "Content-Type": 'application/json' });
    response.end(JSON.stringify({ error: 'Product not found in cart' }));
    return;

  };

});

module.exports = server;