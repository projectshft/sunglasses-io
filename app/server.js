var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

//set session length for access tokens
const SESSION_LENGTH = 15 * 60 * 1000;

let brands = [];
let products = [];
let users = [];
let accessTokens = [];

//setup boilerplate headers to be used for composing response headers
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };
const JSON_HEADERS = { "Content-Type": 'application/json' };
const DEFAULT_HEADERS = { ...CORS_HEADERS, ...JSON_HEADERS };


//helper function to check whether a user has a record in the accessTokens array. 
const findTokenByUsername = (username) => {
  let userAccessToken = accessTokens.find( (token) => {
    return token.username === username;
  })
}

//helper function to check whether a user has passed a valid access token.
const checkTokenFromUrlRequest = (request) => {
  //get token from url 
  let query = queryString.parse(request._parsedUrl.query);
  if (query.accessToken) {
    //check if token exists in database and has not expired. if valid token found, return it. Otherwise return 
    return accessTokens.find((accessToken) => {
      return accessToken.token === query.accessToken && new Date() - accessToken.lastUpdated > SESSION_LENGTH;
    });
  }
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
      response.writeHead(200, DEFAULT_HEADERS);
      //check to see if user already has token. If so, update its "last updated" property. If not, create a new token for the user.

    

      let accessToken = uid(16);
      accessTokens.push({
        username: request.body.username,
        token: accessToken,
        lastUpdated: new Date()
      })
      return response.end(accessToken);
    }

  });

  // request to view cart. user must be logged in and send a valid token.
  myRouter.get('/api/me/cart', (request, response) => {

  });

  // request to add item to cart. user must be logged in and send a valid token.
  myRouter.post('/api/me/cart/:productId', (request, response) => {

  });

  // request to delete item from cart. user must be logged in and send a valid token. user should confirm that they are sure they want to delete the item.
  myRouter.delete('/api/me/cart/:productId', (request, response) => {

  });

}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
}); //add error handler here?