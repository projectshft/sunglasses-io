const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

//server settings
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

//data
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const server = http.createServer(function (request, response) {
  //handle CORS preflight request
  if (request.method === 'OPTIONS') {
    response.writeHead(200, CORS_HEADERS);
    return response.end();
  }
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, err => {
  //check for error
  if (err) {
    return console.log(`Error on server startup: ${err}`);
  }
  //initialize server data from files
  fs.readFile('initial-data/brands.json', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    brands = JSON.parse(data);
    console.log(`Server initialization: ${brands.length} brands loaded`);
  });
  fs.readFile('initial-data/products.json', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    products = JSON.parse(data);
    console.log(`Server initialization: ${products.length} products loaded`);
  });
  fs.readFile('initial-data/users.json', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    users = JSON.parse(data);
    console.log(`Server initialization: ${users.length} users loaded`);
  });
});

//public routes - no access token required/////////////////////////////////////////////////
myRouter.get('/brands', (request, response) => {
  //substring(8) returns query after the '?' if client sends any
  const { query } = queryString.parse(request.url.substring(8));
  //no search term or empty search, return all brands
  if (!query) {
    response.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
    response.end(JSON.stringify(brands));
  }

  //find brands that match search
  const matchedBrands = brands.filter(brand => {
    return (brand.name.toLowerCase() === query.toLowerCase()) ? true : false;
  });

  //send 200 if any brands found, 404 otherwise
  if (matchedBrands.length > 0) {
    response.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
    return response.end(JSON.stringify(matchedBrands));
  }
  //else
  response.writeHead(404, {...CORS_HEADERS, 'content-type': 'application/json'});
  return response.end(JSON.stringify({
    code: 404,
    message: 'Brand not found',
    fields: 'query'
  }));
});

myRouter.get('/brands/:categoryId/products', (request, response) => {
  const { categoryId } = request.params;  

  //reverse logic to have one return 404 instead of two
  //validate categoryId
  //only checking for existence
  if (categoryId) {
    //now check if categoryId exists in brands[]
    const category = brands.find(brand => brand.id === categoryId);
    if (category) {
      const productsInCategory = products.filter(product => {
        return (product.categoryId === categoryId) ? true : false;
      });
      
      response.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
      return response.end(JSON.stringify(productsInCategory));
    }
  }

  //else either categoryId or category does not exist
  response.writeHead(404, {...CORS_HEADERS, 'content-type': 'application/json'});
  return response.end(JSON.stringify({
    code: 404,
    message: 'Brand not found',
    fields: 'id'
  }));
});

myRouter.get('/products', (request, response) => {
  //substring(8) returns query after the '?' if client sends any
  const { query } = queryString.parse(request.url.substring(10));
  //if no query or empty string, return all products
  if (!query) {
    response.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
    return response.end(JSON.stringify(products));
  }
  //else search for query
  const matchedProducts = products.filter(product => {
    return (product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase()))
      ? true
      : false;
  });
  //if matchedProducts empty return 404, else return
  if (matchedProducts.length > 0) {
    response.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
    return response.end(JSON.stringify(matchedProducts));
  }
  response.writeHead(404, {...CORS_HEADERS, 'content-type': 'application/json'});
  return response.end(JSON.stringify({
    code: 404,
    message: 'Product not found',
    fields: 'query'
  }));
});

myRouter.post('/login', (request, response) => {
  //Check for username and password in request body
  const { username, password } = request.body;
  if (username && password) {
    //see if there is a user that matches
    const user = users.find(user => {
      return user.login.username === username && user.login.password === password;
    });
    if (user) {
      response.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
      //successful login, check access tokens
      const currentAccessToken = accessTokens.find((obj) => {
        return obj.username === user.login.username;
      });
      //if token exists, update otherwise create new token
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify({ accessToken: currentAccessToken.token }));
      } else {
        const newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify({ accessToken: newAccessToken.token }));
      }
    } else {
      //login failed
      response.writeHead(401, {...CORS_HEADERS, 'content-type': 'application/json'});
      return response.end(JSON.stringify({
        code: 401,
        message: 'Invalid username or password',
        fields: 'POST body'
      }));
    }
  } else {
    //missing parameters
    response.writeHead(400, {...CORS_HEADERS, 'content-type': 'application/json'});
    return response.end(JSON.stringify({
      code: 400,
      message: 'Incorrectly formatted request',
      fields: 'POST body'
    }));
  }
});

//private routes - access token required////////////////////////////////////////////////////
//helper method to check access tokens
const getValidTokenFromRequest = (request) => {
  const parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    //make sure token is not expired
    const currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token === parsedUrl.query.accessToken;
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

//export for testing
module.exports = server;