/* eslint-disable no-shadow */
const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');
const cors = require('cors');
const url = require('url');

const checkValidParams = require('../helpers/checkValidParams.js');

const PORT = 3001;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, X-Authentication',
};

let users = [];
let brands = [];
let products = [];
const accessTokens = [];

const router = Router();
router.use(bodyParser.json());
router.use(cors());

const server = http
  .createServer((request, response) => {
    if (request.method === 'OPTIONS') {
      response.writeHead(200, CORS_HEADERS);
      return response.end();
    }

    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      console.log('Error on server startup: ', error);
    } else {
      // console.log(`Server is listening at http://localhost:${PORT}`);
    }

    fs.readFile('initial-data/users.json', 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      users = JSON.parse(data);
      // console.log('User data loaded');
    });

    fs.readFile('initial-data/brands.json', 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      brands = JSON.parse(data);
      // console.log('Brand data loaded');
    });

    fs.readFile('initial-data/products.json', 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      products = JSON.parse(data);
      // console.log('Product data loaded');
    });
  });

router.get('/api/brands', (request, response) => {
  const params = queryString.parse(url.parse(request.url).query);
  let brandsRequested = [...brands];

  if (!checkValidParams(params, ['query', 'alphabetical'])) {
    response.writeHead(400);
    return response.end(
      'this endpoint only accepts "query" and "alphabetical" as parameters'
    );
  }

  if (params.query !== undefined) {
    brandsRequested = brands.filter((brand) =>
      brand.name.toLowerCase().includes(params.query)
    );

    if (brandsRequested.length === 0) {
      response.writeHead(404);
      return response.end('Search query does not match any brands');
    }
  }

  if (params.alphabetical !== undefined) {
    if (params.alphabetical === 'za' || params.alphabetical === 'az') {
      brandsRequested.sort((a, b) => {
        const brand1 = a.name.toLowerCase();
        const brand2 = b.name.toLowerCase();

        if (params.alphabetical === 'az') {
          if (brand1 > brand2) {
            return 1;
          }

          if (brand1 < brand2) {
            return -1;
          }
        }

        if (params.alphabetical === 'za') {
          if (brand1 > brand2) {
            return -1;
          }

          if (brand1 < brand2) {
            return 1;
          }
        }
        return 0;
      });
    } else {
      response.writeHead(400);
      return response.end(
        'alphabetical paramter only accepts "za" and "az" and values'
      );
    }
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brandsRequested));
});

router.get('/api/brands/:id/products', (request, response) => {
  if (request.params.id === undefined) {
    response.writeHead(400);
    return response.end('brand id is required for this endpoint');
  }

  const requestedProducts = products.filter(
    (product) => product.categoryId === request.params.id
  );

  if (requestedProducts.length === 0) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(requestedProducts));
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(requestedProducts));
});

router.get('/api/products', (request, response) => {
  const queryParams = queryString.parse(url.parse(request.url).query);

  if (!checkValidParams(queryParams, ['offset', 'itemLimit', 'query'])) {
    response.writeHead(400);
    return response.end(
      'this endpoint only accepts "offset", and "itemLimit" as parameters'
    );
  }

  // if (queryParams.query !== undefined) {

  // }
  response.writeHead(200, { 'Content-Type': 'applications/json' });
  return response.end(JSON.stringify(products));
});

router.post('/api/login', (request, response) => {
  const { username, password } = request.body;
  if (username && password) {
    const user = users.find(
      (user) =>
        user.login.username === username && user.login.password === password
    );

    if (user) {
      response.writeHead(200, { 'Content-Type': 'Application/json' });

      const currentAccessToken = accessTokens.find(
        (tokenObject) => tokenObject.username === username
      );

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      const newAccessToken = {
        username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
    response.writeHead(401, 'incorrect username or password');
    return response.end();
  }
  response.writeHead(400, 'incorrectly formatted response');
  return response.end();
});
module.exports = server;
