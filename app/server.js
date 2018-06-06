const myValidationUtils = require('../utils/userValidation');
const productUtils = require('../dataUtils/products');  
const http = require('http');
const url = require('url');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449","1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];
const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
  // Check request method include 'OPTIONS'
  if (request.method === 'OPTIONS'){
    response.writeHead(200, CORS_HEADERS);
    response.end();
  }
  // Check request header includes working api key
  if (!VALID_API_KEYS.includes(request.headers['x-authentication'])){
    response.writeHead(401, "You need a valid API Key to use this API", CORS_HEADERS);
    response.end();
  }

  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }

  // Could place users, brands, and products datas here as variable,
  // but decided to seperate them in their own components.
  // initialize user data, check utils/userValidation
  myValidationUtils.initializeData();
  // initialize product/brands data, check productUtils/products
  productUtils.initializeData();

  console.log(`Server is listening on ${PORT}`)
});

// Check Server status. Used this as a training wheel for jasmine.
myRouter.get('/api', function(request, response){
  return response.end();
});

// API route for /brands, only GET method.
// Could set brands as global variable, but that makes the whole component seperation pointless.
myRouter.get('/api/brands', function(request, response){
  let brands = productUtils.getAllBrands();
  // If brands is not null, return list of brands
  if(brands){
    response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
    return response.end(JSON.stringify(brands));
  }
  // else return 500 status code
  // unable to produce this status code in test, unless database broke.
  response.writeHead(500,"Could not connect to database", CORS_HEADERS);
  response.end();
});

// API route for /brands/:brandId/products
myRouter.get('/api/brands/:brandId/products', function(request, response){
  // If brandId is not null, return list of products
  if(productUtils.getAllBrandsId().includes(request.params.brandId)){
    response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
    let products = productUtils.getBrandSpecificProducts(request.params.brandId);
    return response.end(JSON.stringify(products));
  }
  // else return 500 status code
  response.writeHead(404,"Could not find the brand id", CORS_HEADERS);
  response.end();
});

// API route for GET /products/query? (optional query)
myRouter.get('/api/products/', function(request, response){
  let urlQuery = url.parse(request.url, true).query;
  let searchedTerm = urlQuery.query;
  let products = [];
  response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

  // If empty array is empty of undefined, return full product list
  if(searchedTerm == "" || !searchedTerm){
    products = productUtils.getAllProducts();
    return response.end(JSON.stringify(products));
  } else if (searchedTerm) {
    let brandQuery = productUtils.getBrandId(searchedTerm.toLowerCase());
    if(brandQuery){
      products = productUtils.getBrandSpecificProducts(brandQuery);
      return response.end(JSON.stringify(products));
    }
    products = productUtils.getQueriedProducts(searchedTerm.toLowerCase());
    return response.end(JSON.stringify(products));
  }
  // else return 404 status code
  response.writeHead(404,"Could not find the brand id", CORS_HEADERS);
  response.end();
});

// API route for POST /login
myRouter.post('/api/login', function(request, response){
  response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  // If user is not null, return new token
  if(myValidationUtils.checkValidUser(request.body)){
    let accessToken = myValidationUtils.getNewToken(request.body);
    return response.end(JSON.stringify(accessToken));
  }
  // else return 401 status code
  response.writeHead(401,"Incorrect Username or Password", CORS_HEADERS);
  response.end();
});

// API route for GET /me/cart
myRouter.get('/api/me/cart', function(request, response){
  response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  // If access token exist, then return user's cart
  if(myValidationUtils.checkValidToken(request.headers)){
    let userCart = myValidationUtils.getUserCart(request.headers.token);

    response.end(JSON.stringify(userCart));
  }
  // else return 401 status code
  response.writeHead(401,"Token Not valid, please relog", CORS_HEADERS);
  response.end();
});

// API route for POST /me/cart (with update amount feature)
myRouter.post('/api/me/cart', function(request, response){
  response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  let token = myValidationUtils.checkValidToken(request.headers);
  let productId = productUtils.checkProductAvailability(request.body.productId);
  let updateAmount = parseFloat(request.body.amount);

  // If access token exist, then return user's cart
  if(token && productId && updateAmount){
      // checks if it's the whole integer
    if(updateAmount % 1 != 0){
      response.writeHead(400,"Invalid Amount", CORS_HEADERS);
      response.end();
    }
    myValidationUtils.updateProduct(request);
    let userCart = myValidationUtils.getUserCart(request.headers.token);

    response.end(JSON.stringify(userCart));

  } else if(token && productId){
    myValidationUtils.addProduct(request);
    let userCart = myValidationUtils.getUserCart(request.headers.token);

    response.end(JSON.stringify(userCart));
  }
  // else return 401 status code
  response.writeHead(401,"Unauthorized", CORS_HEADERS);
  response.end();
});

// API route for DELETE /me/cart
myRouter.delete('/api/me/cart', function(request, response){
  response.writeHead(200,Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
  // If access token exist, remove product then return user's cart
  // if product doesnt exist in cart, it does nothing and return user's cart.
  if(myValidationUtils.checkValidToken(request.headers) && productUtils.checkProductAvailability(request.body.productId)){
    myValidationUtils.removeProduct(request);
    let userCart = myValidationUtils.getUserCart(request.headers.token);

    response.end(JSON.stringify(userCart));
  }
  // else return 401 status code
  response.writeHead(401,"Unauthorized", CORS_HEADERS);
  response.end();
});