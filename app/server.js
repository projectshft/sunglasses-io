const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const url = require('url');

const PORT = 3001;

/*******************
 * Global variables
 *******************/
// Create global variables to hold state (per /initial-data json files)
let brands = [];
let products = [];
let users = [];
// Create a bank of user access tokens for reference
let accessTokens = [];
// Create a variable to limit validity of access tokens to 30 minutes
const TOKEN_VALIDITY_TIMEOUT = 30 * 60 * 1000;

const redirectionMessage =
  'Nothing to see here, please visit /api/brands or /api/products';

// Set up CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, X-Authentication'
};

// Establish router & body-parser middleware
const router = Router();
router.use(bodyParser.json());

// Establish server
const server = http
  .createServer((request, response) => {
    // Handle CORS Preflight request
    if (request.method === 'OPTIONS') {
      response.writeHead(200, CORS_HEADERS);
      response.end();
    }
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) {
      return console.log('Error on Server Startup: ', error);
      // throw error?;
    }
    /****************************************************************
     *  Populate global state variables with /initial-data json files
     ****************************************************************/
    // Read in brands.json file
    fs.readFile('initial-data/brands.json', 'utf-8', (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    // Read in products.json file
    fs.readFile('initial-data/products.json', 'utf-8', (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });
    // Read in users.json file
    fs.readFile('initial-data/users.json', 'utf-8', (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      // user = users[0];
      console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on port ${PORT}`);
  });

/***********************************
 *   Empty query: GET / or GET /api
 ***********************************/
router.get('/', (request, response) => {
  response.writeHead(200, CORS_HEADERS);
  // Object.assign(CORS_HEADERS, { 'Content-Type': 'application/json' })
  response.end(
    "There's nothing to see here, please visit /api/brands or /api/products"
  );
});
router.get('/api', (request, response) => {
  response.writeHead(200, CORS_HEADERS);
  // Object.assign(CORS_HEADERS, { 'Content-Type': 'application/json' })
  response.end(redirectionMessage);
});

/****************************
 *   Brands: GET /api/brands
 ****************************/

router.get('/api/brands', (request, response) => {
  response.writeHead(200, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(brands));
});

/********************************************************
 *   Products by brand: GET api/brands/id:/products
 ********************************************************/
router.get('/api/brands/:id/products', (request, response) => {
  const { id } = request.params;
  const brandSpecificProducts = products.filter(
    product => product.categoryId === id
  );
  if (!brandSpecificProducts) {
    response.writeHead(404, 'No products found');
    response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(brandSpecificProducts));
});

/*********************************
 *   Products: GET /api/products
 *********************************/
router.get('/api/products', (request, response) => {
  response.writeHead(200, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(products));
});

/**********************************************
 *   Specific product: GET /api/products/:id
 **********************************************/
/*xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 // THIS ONE NEEDS LOTS OF WORK (abandoned in midstream)
/*xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx*/

// router.get('/api/products/:id', (request, response) => {
//   fs.readFile('initial-data/products.json', 'utf-8', (error, data) => {
//     if (error) throw error;
//     const parsedUrl = url.parse(req.originalUrl);
//     const { query } = queryString.parse(parsedUrl.query);
//     const { id } = request.params;
//     if (!products.id) {
//       response.writeHead(404, 'No product matches that id');
//       return response.end();
//     }

//     response.writeHead(200, { 'Content-Type': 'application/json' });
//     response.end(JSON.stringify(products.id));
//   });

//   let productToReturn;
//   if (query !== undefined) {
//     productToReturn = products.find(
//       oneProduct =>
//         oneProduct.name.includes(query) || oneProduct.id===???
//     );
//   res.writeHead(200, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify(oneProduct));
// });

/*********************************
 *   User login: POST /api/login
 *********************************/
router.post('/api/login', (request, response) => {
  //   const { username, password } = request.body;
  const { username, password } = user.login;
  if (!username || !password) {
    response.writeHead(401, 'Invalid username or password');
    response.end();
  }
  response.writeHead(200, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json'
  });
  /*---------------------
    *   Access tokens
  ----------------------*/
  const getToken = request => {
    const parsedUrl = url.parse(request.url, true);
    if (parsedUrl.query.accessToken) {
      const currentToken = accessTokens.find(
        ({ token, lastUpdated }) =>
          token === parsedUrl.query.accessToken &&
          new Date() - lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
      return currentToken ? currentToken : null;
    }
    return null;
  };
  // Check token
  const currentToken = accessTokens.find(({ username }) => {
    username === user.login.username;
  });

  if (currentToken) {
    currentToken.lastUpdated = new Date();
    response.end(JSON.stringify(currentToken.token));
  } else {
    const newToken = {
      username,
      lastUpdated: new Date(),
      token: uid(16)
    };
    accessTokens.push(newToken);
    return response.end(JSON.stringify(newToken.token));
  }

  response.writeHead(400, 'Incorrectly formatted response');
  response.end();
});

module.exports = server;

/*******************
 *  All Routes
 ********************/
/*=======DONE=======*/
// GET /api/brands
// GET /api/brands/:id/products
// GET /api/products

/*=======PENDING=======*/
// GET /api/products/:id (Not original path recommended by assignment; currently not working)
// POST /api/login

/*=======TODO=======*/
// GET /api/me/cart
// POST /api/me/cart: Edit (delete) items already in the cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId

/**************************
 *  Cart: GET /api/me/cart
 **************************/

/**********************************
 *  Edit Cart: POST /api/me/cart
 **********************************/
// Edit quantity of items already in the cart)
